/**
 * Citation link validator with archiving. Network. Polite: one request at a time per host, a global
 * concurrency cap, retries with backoff, and a browser-like User-Agent because many journal and
 * regulator sites refuse bare clients.
 *
 * For every URL in the corpus (`links[].url`, `wikipedia`, `website`, `url`, guideline URLs, outcome,
 * toxicity, dosing and access `source` fields) it records:
 *   status      HTTP status of the final response (0 on network failure)
 *   ok          2xx, or 3xx that resolved
 *   finalUrl    where redirects ended, if different
 *   domainMoved the final host differs from the original (a sign the citation now points elsewhere)
 *   archive     nearest Wayback Machine snapshot, if any; a save is requested for broken URLs
 *
 * The summary separates the three ways a link can be not-ok, because they mean different things:
 *   gone         404/410 — the citation is genuinely broken
 *   unreachable  no response at all
 *   blocked      the site answered and refused us (403/429/5xx). Publishers bot-block heavily;
 *                these are overwhelmingly live links and should not read as rot.
 * `broken` is retained as the total not-ok count so existing consumers keep working.
 *
 * Writes public/links.json. The weekly workflow (.github/workflows/links.yml) opens a PR with the
 * result and /audit/ shows the broken-links section from it.
 *
 * Run: npx tsx scripts/check-links.ts [--limit N] [--no-archive] [--only <substring>] [--recheck-broken] [--resume]
 * A partial run (--only, --limit or --recheck-broken, which re-probes only the URLs the previous report
 * marked broken) is merged into the previous public/links.json instead of replacing it.
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { graph } from "../src/lib/graph";
import { routeFor, type Entity } from "../src/lib/schema";

export type LinkRef = { id: string; kind: string; name: string; route: string; field: string; label?: string };
export type LinkResult = { url: string; status: number; ok: boolean; finalUrl?: string; domainMoved?: boolean; archive?: string; archiveRequested?: boolean; error?: string; checked: string; refs: LinkRef[] };
export type LinksReport = { generated: string; total: number; checked: number; broken: number; gone: number; blocked: number; unreachable: number; moved: number; archived: number; results: LinkResult[] };

const UA = "Mozilla/5.0 (compatible; OnCo link checker; +https://github.com/judegomila/OnCo)";
const MAX_CONCURRENCY = 8;
const PER_HOST_DELAY_MS = 1000;

/** Every external URL an entity cites, with the field it sits in. */
export function collectUrls(entities: Entity[]): Map<string, LinkRef[]> {
  const out = new Map<string, LinkRef[]>();
  const add = (url: string | undefined, e: Entity, field: string, label?: string) => {
    if (!url || !/^https?:\/\//i.test(url)) return;
    const ref: LinkRef = { id: e.id, kind: e.kind, name: e.name, route: routeFor(e), field, label };
    out.set(url, [...(out.get(url) ?? []), ref]);
  };
  for (const e of entities) {
    for (const l of e.links) add(l.url, e, "links", l.label);
    add(e.wikipedia, e, "wikipedia");
    if (e.kind === "company" || e.kind === "institution") add(e.website, e, "website");
    if (e.kind === "collection" || e.kind === "journal") add(e.url, e, "url");
    if (e.kind === "cancer") for (const r of e.standardOfCare) add(r.guideline?.url, e, `standardOfCare.guideline (${r.setting})`);
    if (e.kind === "trial") for (const o of e.outcomes) add(o.source, e, `outcomes.source (${o.endpoint})`);
    if (e.kind === "target") for (const p of e.prevalence) add(p.source, e, "prevalence.source");
    if (e.kind === "drug") {
      add(e.dosing?.source, e, "dosing.source");
      for (const t of e.toxicity) add(t.source, e, `toxicity.source (${t.event})`);
      for (const a of e.access) add(a.source, e, `access.source (${a.country})`);
      for (const r of e.regulatoryEvents) add(r.source, e, `regulatoryEvents.source (${r.date})`);
    }
    if (e.kind === "person") { for (const p of e.profiles) add(p.url, e, "profiles", p.label); for (const p of e.papers) add(p.url, e, "papers", p.title); }
    if (e.kind === "bottleneck") for (const m of e.metrics) add(m.url, e, `metrics (${m.label})`);
  }
  return out;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const hostOf = (u: string) => { try { return new URL(u).hostname.replace(/^www\./, ""); } catch { return ""; } };

async function fetchWithTimeout(url: string, init: RequestInit, ms = 20000): Promise<Response> {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), ms);
  try { return await fetch(url, { ...init, signal: ctl.signal }); } finally { clearTimeout(t); }
}

/** HEAD first, GET on 405/403/501 or when HEAD errors; retry 429/5xx/network with backoff. */
/** Actually gone: the server answered and said the resource is not there. */
export const isGone = (r: { ok: boolean; status: number }) => !r.ok && (r.status === 404 || r.status === 410);
/** No answer at all — DNS failure, timeout, connection refused. */
export const isUnreachable = (r: { ok: boolean; status: number }) => !r.ok && r.status === 0;
/** The server answered and refused us: bot protection, auth wall, rate limit, transient 5xx.
 *  Almost never a broken citation — the same judgement the archiver below already makes. */
export const isBlocked = (r: { ok: boolean; status: number }) => !r.ok && !isGone(r) && !isUnreachable(r);

export async function probe(url: string, attempt = 1): Promise<{ status: number; finalUrl?: string; error?: string }> {
  const headers = { "User-Agent": UA, Accept: "text/html,application/xhtml+xml,application/json;q=0.9,*/*;q=0.8", "Accept-Language": "en-GB,en;q=0.9" };
  try {
    let r = await fetchWithTimeout(url, { method: "HEAD", redirect: "follow", headers });
    if (r.status === 405 || r.status === 403 || r.status === 501 || r.status === 404) r = await fetchWithTimeout(url, { method: "GET", redirect: "follow", headers });
    if ((r.status === 429 || r.status >= 500) && attempt < 3) { await sleep(2000 * 2 ** attempt); return probe(url, attempt + 1); }
    return { status: r.status, finalUrl: r.url && r.url !== url ? r.url : undefined };
  } catch (e) {
    if (attempt < 3) { await sleep(2000 * 2 ** attempt); return probe(url, attempt + 1); }
    return { status: 0, error: String(e instanceof Error ? e.message : e).slice(0, 120) };
  }
}

/** Nearest Wayback snapshot, if any. */
export async function waybackAvailable(url: string): Promise<string | undefined> {
  try {
    const r = await fetchWithTimeout(`https://archive.org/wayback/available?url=${encodeURIComponent(url)}`, { headers: { "User-Agent": UA } });
    if (!r.ok) return undefined;
    const j = (await r.json()) as { archived_snapshots?: { closest?: { available?: boolean; url?: string } } };
    const c = j.archived_snapshots?.closest;
    return c?.available && c.url ? c.url.replace(/^http:/, "https:") : undefined;
  } catch { return undefined; }
}

/** Ask the Wayback Machine to capture a page. Fire and forget; the snapshot appears within minutes. */
export async function waybackSave(url: string): Promise<boolean> {
  try {
    const r = await fetchWithTimeout(`https://web.archive.org/save/${url}`, { method: "GET", redirect: "manual", headers: { "User-Agent": UA } }, 30000);
    return r.status < 500;
  } catch { return false; }
}

/** Run `fn` over items with a global concurrency cap and a per-host politeness delay. */
async function pooled<T>(items: string[], fn: (u: string) => Promise<T>, onDone: (u: string, r: T) => void): Promise<void> {
  const lastByHost = new Map<string, number>();
  const queue = [...items];
  const worker = async () => {
    while (queue.length) {
      const u = queue.shift()!;
      const h = hostOf(u);
      const wait = (lastByHost.get(h) ?? 0) + PER_HOST_DELAY_MS - Date.now();
      if (wait > 0) await sleep(wait);
      lastByHost.set(h, Date.now());
      onDone(u, await fn(u));
    }
  };
  await Promise.all(Array.from({ length: MAX_CONCURRENCY }, worker));
}

async function main() {
  const argv = process.argv.slice(2);
  const arg = (name: string) => { const i = argv.indexOf(name); return i >= 0 ? argv[i + 1] : undefined; };
  const limit = Number(arg("--limit") ?? 0);
  const only = arg("--only");
  const archive = !argv.includes("--no-archive");

  const recheckBroken = argv.includes("--recheck-broken");

  // Reuse earlier archive lookups so weekly runs do not re-query the Wayback API for every URL.
  const prevPath = join(process.cwd(), "public", "links.json");
  const prev: Record<string, LinkResult> = {};
  if (existsSync(prevPath)) for (const r of (JSON.parse(readFileSync(prevPath, "utf8")) as LinksReport).results) prev[r.url] = r;

  const g = graph();
  const all = collectUrls(g.entities);
  let urls = [...all.keys()];
  if (only) urls = urls.filter((u) => u.includes(only));
  if (recheckBroken) urls = urls.filter((u) => prev[u] && !prev[u].ok);
  if (limit) urls = urls.slice(0, limit);
  // A partial run (--only, --limit, --recheck-broken) is merged into the previous report rather than
  // replacing it: URLs no longer cited anywhere are dropped, re-probed URLs are replaced, the rest keep
  // their earlier result with refreshed citations.
  const partial = !!only || !!limit || recheckBroken;

  // A full run takes an hour or more, so results are checkpointed every 100 URLs; --resume picks up
  // from the checkpoint instead of probing everything again.
  const checkpointPath = process.env.LINKS_CHECKPOINT ?? "/tmp/onco-links-checkpoint.json";
  const results: LinkResult[] = [];
  if (argv.includes("--resume") && existsSync(checkpointPath)) {
    const saved = JSON.parse(readFileSync(checkpointPath, "utf8")) as LinkResult[];
    const wanted = new Set(urls);
    for (const r of saved) if (wanted.has(r.url)) results.push({ ...r, refs: all.get(r.url) ?? r.refs });
    const have = new Set(results.map((r) => r.url));
    urls = urls.filter((u) => !have.has(u));
    console.log(`resuming: ${results.length} results from the checkpoint, ${urls.length} URLs left to probe`);
  }
  const checked = new Date().toISOString().slice(0, 10);
  let done = 0;
  await pooled(urls, probe, (url, p) => {
    const ok = p.status >= 200 && p.status < 400;
    const finalHost = p.finalUrl ? hostOf(p.finalUrl) : undefined;
    results.push({ url, status: p.status, ok, finalUrl: p.finalUrl, domainMoved: !!finalHost && finalHost !== hostOf(url) && !finalHost.endsWith(`.${hostOf(url)}`) && !hostOf(url).endsWith(`.${finalHost}`) ? true : undefined, error: p.error, checked, refs: all.get(url) ?? [], archive: prev[url]?.archive });
    done++;
    if (done % 100 === 0) { console.log(`  ${done}/${urls.length}`); writeFileSync(checkpointPath, JSON.stringify(results)); }
  });
  writeFileSync(checkpointPath, JSON.stringify(results));

  if (archive) {
    // Only links that are actually gone need an archive copy. A 403, 429 or 5xx is almost always a site
    // refusing a bot, and looking those up would triple the run time for nothing.
    const dead = results.filter((r) => isGone(r) || isUnreachable(r));
    console.log(`archiving: ${dead.length} dead links (404, 410 or no response), looking up Wayback snapshots`);
    for (const r of dead) {
      if (!r.archive) r.archive = await waybackAvailable(r.url);
      if (!r.archive) { r.archiveRequested = await waybackSave(r.url); await sleep(3000); }
      await sleep(500);
    }
    // Also look up snapshots for a sample of working links each run so the archive fills in over time.
    const fresh = results.filter((r) => r.ok && !r.archive).slice(0, 150);
    for (const r of fresh) { r.archive = await waybackAvailable(r.url); await sleep(400); }
  }

  if (partial && Object.keys(prev).length) {
    const probed = new Set(results.map((r) => r.url));
    for (const r of Object.values(prev)) if (all.has(r.url) && !probed.has(r.url)) results.push({ ...r, refs: all.get(r.url) ?? r.refs });
  }
  results.sort((a, b) => Number(a.ok) - Number(b.ok) || a.status - b.status || a.url.localeCompare(b.url));
  const report: LinksReport = { generated: new Date().toISOString(), total: all.size, checked: results.length, broken: results.filter((r) => !r.ok).length, gone: results.filter(isGone).length, blocked: results.filter(isBlocked).length, unreachable: results.filter(isUnreachable).length, moved: results.filter((r) => r.domainMoved).length, archived: results.filter((r) => r.archive).length, results };
  const out = join(process.cwd(), "public");
  mkdirSync(out, { recursive: true });
  writeFileSync(join(out, "links.json"), JSON.stringify(report, null, 0));
  console.log(`links: ${report.checked} of ${report.total} URLs checked; ${report.gone} gone (404/410); ${report.unreachable} unreachable; ${report.blocked} blocked by the site (not broken); ${report.moved} moved domain; ${report.archived} with an archive copy`);
  for (const r of results.filter((r) => isGone(r) || isUnreachable(r)).slice(0, 40)) console.log(`  [${r.status}] ${r.url} (${r.refs.map((x) => x.id).slice(0, 3).join(", ")})${r.archive ? ` archive: ${r.archive}` : ""}`);
}

if (process.argv[1]?.endsWith("check-links.ts")) main().catch((e) => { console.error(e); process.exit(1); });

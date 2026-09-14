/**
 * Fetches organisation logos into public/logos/ for every company, institution, and collection.
 *
 * Resolution order per entity:
 *   1. Wikidata: search by name (or manual override QID), verify P31 is an organisation-like class and,
 *      when the item has P856 (official website), that its domain matches ours; take P154 (logo image)
 *      from Wikimedia Commons (SVG as-is, raster via Special:FilePath?width=512).
 *   2. Clearbit logo API by domain (PNG, 256px).
 *   3. Google favicon service at 256px (quality "favicon").
 *
 * Output: public/logos/<id>.<ext> and public/logos/index.json
 *   { id: { file, source: "wikidata"|"clearbit"|"favicon", license?, attribution?, qid? } }
 *
 * Run: npm run fetch:logos            (idempotent: existing entries in index.json are kept unless --force)
 *      npm run fetch:logos -- --only=<id>
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync, statSync, unlinkSync } from "node:fs";
import { join } from "node:path";
import { graph } from "../src/lib/graph";

const OUT = join(process.cwd(), "public", "logos");
mkdirSync(OUT, { recursive: true });
const INDEX = join(OUT, "index.json");
const UA = "OnCo logo fetcher/1.0 (https://github.com/judegomila/OnCo; contact via GitHub issues)";
const MAX_BYTES = 400 * 1024;
const force = process.argv.includes("--force");
const only = process.argv.find((a) => a.startsWith("--only="))?.slice(7);

type Entry = { file: string; source: "wikidata" | "clearbit" | "favicon"; license?: string; attribution?: string; qid?: string; name?: string };
const index: Record<string, Entry> = existsSync(INDEX) ? JSON.parse(readFileSync(INDEX, "utf8")) : {};

/**
 * Manual help for ambiguous names: a better search string, or null to skip Wikidata entirely
 * (databases and services that have no logo item, or where the item's logo is not the org's).
 */
const OVERRIDE: Record<string, string | null> = {
  merck: "Merck & Co.",
  aveo: null, // name search returns "Aveos Fleet Performance"; no Wikidata logo for AVEO Oncology
  "roche-genentech": "Hoffmann-La Roche",
  gilead: "Gilead Sciences",
  bms: "Bristol Myers Squibb",
  "johnson-johnson": "Johnson & Johnson",
  "eli-lilly": "Eli Lilly and Company",
  gsk: "GSK plc",
  mskcc: "Memorial Sloan Kettering Cancer Center",
  "md-anderson": "University of Texas MD Anderson Cancer Center",
  "johns-hopkins": "Johns Hopkins Hospital",
  "dana-farber": "Dana–Farber Cancer Institute",
  mgh: "Massachusetts General Hospital",
  "heidelberg-nct": "Heidelberg University Hospital",
  stanford: "Stanford Health Care",
  ucsf: "UCSF Medical Center",
  "penn-abramson": "Abramson Cancer Center",
  "wustl-siteman": "Siteman Cancer Center",
  "michigan-rogel": "University of Michigan Rogel Cancer Center",
  "ucla-jonsson": "Jonsson Comprehensive Cancer Center",
  "icr-london": "Institute of Cancer Research",
  cruk: "Cancer Research UK",
  nki: "Netherlands Cancer Institute",
  nci: "National Cancer Institute",
  "curie-nki-eortc": "European Organisation for Research and Treatment of Cancer",
  "ge-healthcare": "GE HealthCare",
  varian: "Varian Medical Systems",
  tempus: "Tempus AI",
  "10x-genomics": "10x Genomics",
  "cancer-commons": null,
  oncokb: null, civic: null, cbioportal: null, depmap: null, "open-targets": null, cosmic: null, ttd: null, adcdb: null,
  "esmo-guidelines": "European Society for Medical Oncology",
  "fda-approvals": "Food and Drug Administration",
  seer: null, globocan: "International Agency for Research on Cancer", "cancer-gov-pdq": "National Cancer Institute",
  "awesome-cancer-variant-resources": null, genie: "American Association for Cancer Research", hpa: "Human Protein Atlas", cptac: "National Cancer Institute",
  "cellxgene-hca": "Chan Zuckerberg Initiative", "cancer-models": null, "pubmed-europepmc": "PubMed", "eudract-ctis": "European Medicines Agency",
  "newsweek-hospitals": "Newsweek", "nature-index": "Nature Portfolio", "scimago-oncology": "SCImago Journal Rank", "nci-cancer-centers": "National Cancer Institute",
  "tcga-gdc": "National Cancer Institute", clinvar: "National Center for Biotechnology Information", "drugbank-chembl": "ChEMBL", nccn: "National Comprehensive Cancer Network", "clinicaltrials-gov": "ClinicalTrials.gov",
};

const DESC_HINT = /compan|corporat|hospital|universit|institut|organi[sz]ation|agency|society|association|foundation|charity|centre|center|laborator|manufacturer|database|publisher|journal|conglomerate|enterprise|firm|clinic|school|registry|consortium|trust|group/i;

const ORG_CLASSES = new Set([
  "Q4830453", "Q783794", "Q6881511", "Q891723", "Q43229", "Q16917", "Q1774898", "Q3918", "Q875538", "Q31855", "Q1371037", "Q7075", "Q327333", "Q484652", "Q79913", "Q163740", "Q1785271", "Q2085381", "Q1048835", "Q2659904", "Q15911314", "Q5341295", "Q1194970", "Q4287745", "Q1497649", "Q33506", "Q7278", "Q19967801", "Q294163", "Q1391145", "Q12140", "Q2385804", "Q210272", "Q17127659", "Q1616075", "Q3055655", "Q3243212", "Q44652", "Q8148", "Q2485448", "Q157031", "Q31728", "Q2668072", "Q11229656", "Q159334", "Q902104", "Q28843648", "Q17232649",
]);

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
let last = 0;
async function polite<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  const wait = 500 - (Date.now() - last);
  if (wait > 0) await sleep(wait);
  last = Date.now();
  for (let i = 0; ; i++) {
    try { return await fn(); } catch (e) { if (i >= retries) throw e; await sleep(1000 * (i + 1)); }
  }
}
async function getJson(url: string): Promise<unknown> {
  return polite(async () => { const r = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" } }); if (!r.ok) throw new Error(`${r.status} ${url}`); return r.json(); });
}
async function getBytes(url: string): Promise<{ buf: Buffer; type: string } | null> {
  try {
    return await polite(async () => {
      const r = await fetch(url, { headers: { "User-Agent": UA }, redirect: "follow" });
      if (!r.ok) throw new Error(`${r.status}`);
      const type = r.headers.get("content-type") ?? "";
      const buf = Buffer.from(await r.arrayBuffer());
      return { buf, type };
    }, 1);
  } catch { return null; }
}

// Acquired companies whose recorded website now redirects to the acquirer; a match there would show the acquirer's logo.
const NO_LOGO_IDS = new Set(["emergence-therapeutics", "mablink-bioscience", "point-biopharma"]);
const NOT_OWN_HOST = /(^|\.)(archive\.org|sec\.gov|ycombinator\.com|biorxiv\.org|medrxiv\.org|linkedin\.com|crunchbase\.com|clinicaltrials\.gov|wikipedia\.org|github\.com)$/;
const domainOf = (u?: string) => { try { if (!u) return ""; const h = new URL(u).hostname.replace(/^www\./, "").toLowerCase(); return NOT_OWN_HOST.test(h) ? "" : h; } catch { return ""; } };
const sameDomain = (a: string, b: string) => !!a && !!b && (a === b || a.endsWith("." + b) || b.endsWith("." + a));

type Claims = Record<string, Array<{ mainsnak: { datavalue?: { value: unknown } } }>>;
async function wikidataEntity(qid: string): Promise<{ claims: Claims; label: string } | null> {
  const j = (await getJson(`https://www.wikidata.org/wiki/Special:EntityData/${qid}.json`)) as { entities: Record<string, { claims: Claims; labels?: Record<string, { value: string }> }> };
  const ent = j.entities?.[qid];
  if (!ent) return null;
  return { claims: ent.claims ?? {}, label: ent.labels?.en?.value ?? qid };
}
const claimStr = (c: Claims, p: string): string[] => (c[p] ?? []).map((x) => x.mainsnak.datavalue?.value).filter((v): v is string => typeof v === "string");
const claimQids = (c: Claims, p: string): string[] => (c[p] ?? []).map((x) => (x.mainsnak.datavalue?.value as { id?: string } | undefined)?.id).filter((v): v is string => !!v);

type Hit = { id: string; description: string };
async function searchByName(name: string): Promise<Hit[]> {
  const j = (await getJson(`https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(name)}&language=en&type=item&limit=6&format=json`)) as { search?: Array<{ id: string; description?: string }> };
  return (j.search ?? []).map((s) => ({ id: s.id, description: s.description ?? "" }));
}
async function searchByWebsite(website: string): Promise<Hit[]> {
  const d = domainOf(website); if (!d) return [];
  const variants = new Set<string>();
  for (const scheme of ["https://", "http://"]) for (const w of ["www.", ""]) for (const slash of ["", "/"]) variants.add(`${scheme}${w}${d}${slash}`);
  variants.add(website.replace(/\/$/, "")); variants.add(website.endsWith("/") ? website : website + "/");
  const hits: Hit[] = [];
  for (const v of variants) {
    const j = (await getJson(`https://www.wikidata.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent("haswbstatement:P856=" + v)}&format=json&srlimit=3`)) as { query?: { search?: Array<{ title: string; snippet: string }> } };
    for (const x of j.query?.search ?? []) hits.push({ id: x.title, description: x.snippet.replace(/<[^>]+>/g, "") });
    if (hits.length) break;
  }
  return hits;
}
function nameVariants(name: string): string[] {
  const out = new Set<string>();
  const noParen = name.replace(/\s*\(.*?\)\s*/g, " ").replace(/\s+/g, " ").trim();
  out.add(noParen);
  for (const part of noParen.split(/\s*(?:\/|–|—|,)\s*/)) if (part.length > 2) out.add(part.trim());
  out.add(noParen.replace(/\b(Inc\.?|plc|AG|SA|Ltd\.?|Co\.?|Corporation|Pharmaceuticals?|Therapeutics|Biotherapeutics|Medicines|Oncology|Biosciences|Biotech(nology)?|Medical|Group|Holdings)\b\.?/gi, "").replace(/\s+/g, " ").trim());
  return [...out].filter((v) => v.length > 2);
}

async function wikidataLogo(id: string, name: string, website: string): Promise<Entry | null> {
  const override = OVERRIDE[id];
  if (override === null) return null;
  const myDomain = domainOf(website);
  const tried = new Set<string>();
  const candidates: Array<{ hit: Hit; viaSite: boolean }> = [];
  for (const h of await searchByWebsite(website)) candidates.push({ hit: h, viaSite: true });
  for (const q of override ? [override, ...nameVariants(name)] : nameVariants(name)) for (const h of await searchByName(q)) candidates.push({ hit: h, viaSite: false });
  for (const { hit, viaSite } of candidates) {
    if (tried.has(hit.id)) continue; tried.add(hit.id);
    const ent = await wikidataEntity(hit.id);
    if (!ent) continue;
    const p31 = claimQids(ent.claims, "P31");
    const sites = claimStr(ent.claims, "P856").map(domainOf);
    const domainMatch = sites.some((d) => sameDomain(d, myDomain));
    const orgLike = p31.some((q) => ORG_CLASSES.has(q)) || DESC_HINT.test(hit.description);
    if (!viaSite && !domainMatch) { if (sites.length || !orgLike) continue; }
    if (!orgLike && !domainMatch && !viaSite) continue;
    const logos = claimStr(ent.claims, "P154");
    if (!logos.length) continue;
    const file = logos[0];
    const isSvg = /\.svg$/i.test(file);
    const url = `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}${isSvg ? "" : "?width=512"}`;
    const got = await getBytes(url);
    if (!got || got.buf.length === 0 || got.buf.length > MAX_BYTES || got.type.includes("text/html")) continue;
    const ext = isSvg ? "svg" : got.type.includes("png") ? "png" : got.type.includes("jpeg") ? "jpg" : "png";
    const out = `${id}.${ext}`;
    writeFileSync(join(OUT, out), got.buf);
    let license: string | undefined, attribution: string | undefined;
    try {
      const info = (await getJson(`https://commons.wikimedia.org/w/api.php?action=query&titles=File:${encodeURIComponent(file)}&prop=imageinfo&iiprop=extmetadata&format=json`)) as { query?: { pages?: Record<string, { imageinfo?: Array<{ extmetadata?: Record<string, { value: string }> }> }> } };
      const meta = Object.values(info.query?.pages ?? {})[0]?.imageinfo?.[0]?.extmetadata;
      license = meta?.LicenseShortName?.value; attribution = meta?.Artist?.value?.replace(/<[^>]+>/g, "").slice(0, 120);
    } catch { /* optional */ }
    return { file: out, source: "wikidata", license, attribution: attribution || `Wikimedia Commons: File:${file}`, qid: hit.id, name: ent.label };
  }
  return null;
}

async function clearbitLogo(id: string, website: string): Promise<Entry | null> {
  const d = domainOf(website); if (!d) return null;
  const got = await getBytes(`https://logo.clearbit.com/${d}?size=256`);
  if (!got || got.buf.length < 200 || got.buf.length > MAX_BYTES || !got.type.startsWith("image/")) return null;
  const ext = got.type.includes("svg") ? "svg" : got.type.includes("jpeg") ? "jpg" : "png";
  const out = `${id}.${ext}`; writeFileSync(join(OUT, out), got.buf);
  return { file: out, source: "clearbit" };
}

async function faviconLogo(id: string, website: string): Promise<Entry | null> {
  const d = domainOf(website); if (!d) return null;
  const got = await getBytes(`https://www.google.com/s2/favicons?domain=${encodeURIComponent(d)}&sz=256`);
  if (!got || got.buf.length < 200) return null;
  const ext = got.type.includes("png") ? "png" : got.type.includes("svg") ? "svg" : got.type.includes("jpeg") ? "jpg" : "ico";
  const out = `${id}.${ext}`; writeFileSync(join(OUT, out), got.buf);
  return { file: out, source: "favicon" };
}

async function main() {
  const g = graph();
  const targets = [...g.kind("company"), ...g.kind("institution"), ...g.kind("collection")].map((e) => ({ id: e.id, name: e.name, website: e.kind === "collection" ? e.url : e.website }));
  const counts = { wikidata: 0, clearbit: 0, favicon: 0, none: 0, kept: 0 };
  for (const t of targets) {
    if (only && t.id !== only) continue;
    if (NO_LOGO_IDS.has(t.id)) { counts.none++; continue; }
    if (!force && index[t.id] && existsSync(join(OUT, index[t.id].file))) { counts.kept++; continue; }
    let entry: Entry | null = null;
    try { entry = await wikidataLogo(t.id, t.name, t.website ?? ""); } catch (e) { console.warn(`wikidata failed for ${t.id}: ${String(e).slice(0, 80)}`); }
    if (!entry) entry = await clearbitLogo(t.id, t.website ?? "");
    if (!entry) entry = await faviconLogo(t.id, t.website ?? "");
    if (entry) {
      // remove stale files with other extensions
      for (const ext of ["svg", "png", "jpg", "ico"]) { const f = join(OUT, `${t.id}.${ext}`); if (f !== join(OUT, entry.file) && existsSync(f)) unlinkSync(f); }
      index[t.id] = entry; counts[entry.source]++;
      console.log(`${t.id}: ${entry.source}${entry.qid ? ` (${entry.qid} ${entry.name})` : ""}`);
    } else { counts.none++; console.log(`${t.id}: no logo`); }
    writeFileSync(INDEX, JSON.stringify(index, null, 0));
  }
  const total = Object.values(index).reduce((a, e) => a + (existsSync(join(OUT, e.file)) ? statSync(join(OUT, e.file)).size : 0), 0);
  console.log(`logos: ${Object.keys(index).length} entries, ${(total / 1024 / 1024).toFixed(1)} MB;`, counts);
}

main().catch((e) => { console.error(e); process.exit(1); });

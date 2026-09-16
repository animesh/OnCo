import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import Link from "next/link";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { graph } from "@/lib/graph";
import { KIND_META, routeFor, type Entity, type Kind } from "@/lib/schema";
import { Container, GroupKicker, KindChip, PageHeader } from "@/components/ui";
import { issueUrl, suggestEditUrl } from "@/lib/issue-links";

export const metadata: Metadata = pageMeta({ title: "Gaps to fill", description: "Where OnCo is thin: unsourced objects, weakly linked objects, cancers without pipelines, targets without drugs, and good first records for newcomers. Claim one and fix it.", path: "/gaps/" });

type Size = "S" | "M" | "L";
type Finding = { check: string; severity: "high" | "medium" | "low"; id: string; kind: string; name: string; route: string; detail: string };
type Audit = { generated: string; findings: Finding[]; staleness: Array<{ id: string; kind: string; name: string; route: string; asOf: string; days: number }> };

/** Every gap row links to the Suggest-an-edit issue form for that record, prefilled with the gap; no direct file edits. */
function claimUrl(e: Entity, why: string, field?: string) {
  return suggestEditUrl(e, { field, why: `Gap: ${why}` });
}

const SIZE_TONE: Record<Size, string> = { S: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200", M: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200", L: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200" };
const SIZE_LABEL: Record<Size, string> = { S: "Small: one field, one source, under an hour", M: "Medium: a few fields or links, an evening", L: "Large: a whole section or page, a weekend" };

/** Audit checks and staleness mapped to a plain instruction and a size. */
const GOOD_FIRST: Record<string, { size: Size; field: string; what: string }> = {
  unsourced: { size: "S", field: "links", what: "Add one primary source URL (label, publication, registry or guideline)." },
  "future-year-in-text": { size: "S", field: "summary", what: "A year in the text is in the future; check whether the event happened and reword with a source." },
  "text-says-approved": { size: "M", field: "approvals", what: "The text says approved but the record has no approval entry; add region, year and indication with the agency source." },
  "regional-approval-only": { size: "M", field: "approvals", what: "Approved somewhere but the status does not say so; reconcile status and approvals with sources." },
  "near-duplicate-name": { size: "M", field: "name", what: "Two records have near-identical names; confirm they are distinct or propose a merge." },
  stale: { size: "S", field: "asOf", what: "Check the record against its sources, update anything that changed, and refresh the asOf date." },
};

function readAudit(): Audit | null {
  const p = join(process.cwd(), "public", "audit.json");
  if (!existsSync(p)) return null;
  try { return JSON.parse(readFileSync(p, "utf8")) as Audit; } catch { return null; }
}

function Row({ e, why, field }: { e: Entity; why: string; field?: string }) {
  return (
    <li className="p-3 flex flex-wrap items-center gap-3">
      <KindChip kind={e.kind} />
      <Link href={routeFor(e)} className="font-medium hover:underline">{e.name}</Link>
      <span className="text-xs text-muted">{why}</span>
      <a className="ml-auto text-xs underline text-muted" href={claimUrl(e, why, field)} rel="noopener" title="Opens the Suggest-an-edit issue form for this record, prefilled with the gap">claim</a>
    </li>
  );
}

function Gap({ title, intro, items, field }: { title: string; intro: string; items: Array<{ e: Entity; why: string }>; field?: string }) {
  if (!items.length) return null;
  return (
    <section className="mt-10">
      <div className="flex items-baseline justify-between mb-2"><h2 className="text-lg font-semibold">{title}</h2><span className="text-xs text-muted">{items.length}</span></div>
      <p className="text-sm text-muted mb-3 max-w-3xl">{intro}</p>
      <ul className="card divide-y divide-border">{items.map(({ e, why }) => <Row key={e.id} e={e} why={why} field={field} />)}</ul>
    </section>
  );
}

export default function Gaps() {
  const g = graph();
  const all = g.entities;
  const noSources = all.filter((e) => e.links.length === 0 && !e.wikipedia && !(e.kind === "trial" && e.nct) && !(e.kind === "collection") && !(e.kind === "company") && !(e.kind === "institution")).map((e) => ({ e, why: "no external link or Wikipedia entry" }));
  const weak = all.filter((e) => e.kind !== "section" && g.degree(e.id) <= 2).map((e) => ({ e, why: `${g.degree(e.id)} connection${g.degree(e.id) === 1 ? "" : "s"}` }));
  const thinCancers = g.kind("cancer").filter((c) => c.standardOfCare.length < 3 || c.pipeline.length === 0 || c.history.length < 3).map((e) => ({ e, why: [e.standardOfCare.length < 3 ? `${e.standardOfCare.length} standard-of-care rows` : null, e.pipeline.length === 0 ? "empty pipeline" : null, e.history.length < 3 ? `${e.history.length} history events` : null].filter(Boolean).join(" · ") }));
  const targetsNoDrugs = g.kind("target").filter((t) => (g.neighbours(t.id).get("drug") ?? []).length === 0).map((e) => ({ e, why: "no product links to this target" }));
  const drugsNoTrials = g.kind("drug").filter((d) => (g.neighbours(d.id).get("trial") ?? []).length === 0 && d.status !== "established").map((e) => ({ e, why: "no trial recorded" }));
  // Only companies that make treatments or tests are expected to have a product: investors, service firms, software, device and imaging makers and nonprofits are counted separately so the gap is honest.
  const DEVELOPER_TYPES = new Set(["pharma", "biotech", "radiopharma", "cell-therapy", "diagnostics"]);
  const companiesNoDrugs = g.kind("company").filter((c) => DEVELOPER_TYPES.has(c.companyType) && (g.neighbours(c.id).get("drug") ?? []).length === 0).map((e) => ({ e, why: `no product linked (${e.companyType})` }));
  const shortSummaries = all.filter((e) => e.summary.length < 160).map((e) => ({ e, why: `${e.summary.length}-character summary` }));
  const total = noSources.length + weak.length + thinCancers.length + targetsNoDrugs.length + drugsNoTrials.length + companiesNoDrugs.length + shortSummaries.length;

  // Good first records: audit findings and staleness, each with a size label and a one-line instruction.
  const audit = readAudit();
  const seen = new Set<string>();
  const firsts: Array<{ e: Entity; size: Size; what: string; detail: string; field: string }> = [];
  if (audit) {
    for (const f of audit.findings) {
      const spec = GOOD_FIRST[f.check]; const e = g.get(f.id);
      if (!spec || !e || seen.has(e.id)) continue;
      seen.add(e.id); firsts.push({ e, size: spec.size, what: spec.what, detail: f.detail, field: spec.field });
    }
    for (const s of audit.staleness.slice(0, 30)) {
      const e = g.get(s.id);
      if (!e || seen.has(e.id)) continue;
      seen.add(e.id); firsts.push({ e, size: "S", what: GOOD_FIRST.stale.what, detail: `asOf ${s.asOf}, ${s.days} days ago`, field: "asOf" });
    }
  }
  const order: Record<Size, number> = { S: 0, M: 1, L: 2 };
  firsts.sort((a, b) => order[a.size] - order[b.size] || a.e.name.localeCompare(b.e.name));
  const shown = firsts.slice(0, 40);
  const sizeCounts = (["S", "M", "L"] as Size[]).map((s) => ({ s, n: firsts.filter((f) => f.size === s).length }));

  return (
    <>
      <PageHeader kicker={<GroupKicker id="learn" />} title="Gaps to fill"
        lede={`Where the map is thin, computed from the corpus at build time. ${total} open items across seven checks, plus ${firsts.length} good first records from the audit. Claim one through the issue form; the check disappears when the fix lands.`} />
      <Container className="pb-16">
        <div className="card p-4 text-sm text-muted max-w-3xl">
          <div className="kicker mb-1">How to claim</div>
          <ol className="list-decimal pl-5 space-y-1">
            <li>Pick a row and click <em>claim</em>. It opens the Suggest-an-edit issue form prefilled with the record and the gap; add the source URL, the missing links (ids of related objects) or the missing rows, and who you are.</li>
            <li>A maintainer checks the source, makes the edit and merges it. Nothing is edited directly: every change passes the same sourcing, safety and validation gate. If you can code, say so and you will be pointed at the file; pull requests reference the issue.</li>
            <li>Want to add a whole record? Propose it through <a className="underline" href={issueUrl("new-object", {}, { title: "add: " })} rel="noopener">New object</a>: the form asks for the name, kind and one source, and a maintainer builds the validated record from it. Contributors are credited at <Link className="underline" href="/contributors/">/contributors/</Link>.</li>
          </ol>
          <p className="mt-2">Counts by kind: {Object.entries(KIND_META).filter(([k]) => g.kind(k as Kind).length > 0).map(([k, m]) => `${g.kind(k as Kind).length.toLocaleString("en-GB")} ${m.plural}`).join(", ")}.</p>
        </div>

        {shown.length > 0 && (
          <section className="mt-10">
            <div className="flex items-baseline justify-between mb-2"><h2 className="text-lg font-semibold">Good first records</h2><span className="text-xs text-muted">{firsts.length}{audit ? `, audit of ${audit.generated.slice(0, 10)}` : ""}</span></div>
            <p className="text-sm text-muted mb-3 max-w-3xl">Findings from the automated <Link className="underline" href="/audit/">audit</Link> that a newcomer can fix with one source and no special knowledge of the codebase. Sized so you can pick by the time you have: {sizeCounts.map((c) => `${c.n} ${c.s}`).join(", ")}.</p>
            <div className="flex flex-wrap gap-2 mb-3 text-xs">{(["S", "M", "L"] as Size[]).map((s) => <span key={s} className={`chip ${SIZE_TONE[s]}`} title={SIZE_LABEL[s]}>{s}: {SIZE_LABEL[s].split(":")[1].trim()}</span>)}</div>
            <ul className="card divide-y divide-border">
              {shown.map(({ e, size, what, detail, field }) => (
                <li key={e.id} className="p-3 flex flex-wrap items-center gap-3">
                  <span className={`chip ${SIZE_TONE[size]}`} title={SIZE_LABEL[size]}>{size}</span>
                  <KindChip kind={e.kind} />
                  <Link href={routeFor(e)} className="font-medium hover:underline">{e.name}</Link>
                  <span className="text-xs text-muted basis-full sm:basis-auto">{what} <span className="opacity-70">({detail})</span></span>
                  <a className="ml-auto text-xs underline text-muted" href={claimUrl(e, `${what} (${detail})`, field)} rel="noopener">claim</a>
                </li>
              ))}
            </ul>
            {firsts.length > shown.length && <p className="text-xs text-muted mt-2">Showing {shown.length} of {firsts.length}; the full list is in <code>public/audit.json</code> and on the <Link className="underline" href="/audit/">audit page</Link>.</p>}
          </section>
        )}

        <Gap title="Cancers with thin pages" intro="Every cancer should have at least three standard-of-care settings, a pipeline, and a history. TNBC is the model." items={thinCancers} field="standardOfCare" />
        <Gap title="Targets with no product" intro="A target with no drug, tracer, or cell therapy linked to it is either a research target (say so in the summary) or a documentation gap." items={targetsNoDrugs} field="drugs" />
        <Gap title="Products with no trial" intro="Approved and late-stage products should link to at least one trial record. Add the trial or link an existing one." items={drugsNoTrials} field="trials" />
        <Gap title="Developers with no product" intro="Drug, radiopharmaceutical, cell therapy and diagnostics companies whose candidates or tests are not yet recorded. Link the company's products, or add them; investors, service firms, software and device makers are not listed here because a product record is not expected of them." items={companiesNoDrugs} field="drugs" />
        <Gap title="Objects with no external source" intro="Add a Wikipedia link, a registry record, or a primary source in `links`." items={noSources} field="links" />
        <Gap title="Weakly connected objects" intro="Two or fewer connections. Link to cancers, targets, products, trials, or terms so the object participates in the graph." items={weak} field="related" />
        <Gap title="Short summaries" intro="Under 160 characters. Expand with mechanism, evidence, and open questions." items={shortSummaries} field="summary" />
      </Container>
    </>
  );
}

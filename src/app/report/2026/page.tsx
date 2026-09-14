import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import Link from "next/link";
import { graph } from "@/lib/graph";
import { KIND_META, KINDS, routeFor, type Entity } from "@/lib/schema";
import { STATUS_LABEL, statusClass } from "@/lib/text";
import { ChipList, Container, GroupKicker, PageHeader, Section, StatusChip } from "@/components/ui";

export const metadata: Metadata = pageMeta({ title: "The state of the war on cancer, 2026", description: "OnCo's annual report, generated from the corpus: approvals, trial results, roadmap progress, and open problems.", path: "/report/2026/" });

export default function Report2026() {
  const g = graph();
  const year = 2026;
  const approvals = g.kind("drug").flatMap((d) => d.approvals.filter((a) => a.year === year).map((a) => ({ d, a }))).sort((x, y) => x.d.name.localeCompare(y.d.name));
  const firstApprovals = approvals.filter(({ d }) => Math.min(...d.approvals.map((a) => a.year)) === year);
  const trials = g.kind("trial").filter((t) => t.yearReported === year);
  const positive = trials.filter((t) => t.status === "positive");
  const negative = g.kind("trial").filter((t) => t.status === "negative" || t.status === "mixed");
  const pending = g.kind("trial").filter((t) => t.status === "recruiting" || t.status === "active");
  const statusCounts = new Map<string, number>();
  for (const e of g.entities) if (e.status) statusCounts.set(e.status, (statusCounts.get(e.status) ?? 0) + 1);
  const roadmaps = g.kind("roadmap");
  const current = roadmaps.flatMap((r) => r.steps.filter((s) => s.status === "current").map((s) => ({ r, s })));
  const emerging = roadmaps.flatMap((r) => r.steps.filter((s) => s.status === "emerging").map((s) => ({ r, s })));
  const problems = g.kind("cancer").flatMap((c) => c.openProblems.slice(0, 2).map((p) => ({ c, p })));
  const failed = g.entities.filter((e) => e.tags.includes("failed-so-far") || e.status === "withdrawn" || e.status === "negative");
  const frontier = g.kind("technology").filter((t) => t.tags.includes("frontier"));
  const phase3 = g.kind("drug").filter((d) => d.status === "phase-3");

  return (
    <>
      <PageHeader kicker={<GroupKicker id="intel" />} title="The state of the war on cancer, 2026"
        lede="Generated from the OnCo corpus: what was approved, what read out, where the roadmaps stand, and what is still unsolved. Every figure below is a count over the objects on this site, so it is auditable and it is incomplete in exactly the ways the corpus is." />
      <Container className="pb-16">
        <div className="prose-onco text-[15px] leading-relaxed max-w-3xl">
          <p>Three things defined 2026 in oncology as recorded here. First, antibody-drug conjugates moved from rescue therapy to first choice: two TROP2 ADCs were approved for first-line triple-negative breast cancer, trastuzumab deruxtecan reached early-stage HER2-positive disease, and the first bispecific ADC succeeded in phase 3. Second, immunotherapy grew a new limb: a personalised mRNA vaccine met its phase 3 endpoints in melanoma, an oncolytic virus was approved after an earlier rejection, and a blood test for residual disease decided, for the first time, who receives adjuvant immunotherapy. Third, targeted protein degradation arrived, with the first PROTAC approved for ESR1-mutant breast cancer.</p>
          <p>The failures matter as much. TIGIT blockade did not add to PD-1 inhibition; a CD47 antibody was abandoned; a second TOP1-payload ADC given straight after a first works poorly. Pancreatic cancer and glioblastoma remain the deadliest common cancers, though the first pan-RAS inhibitor is in a pivotal trial and tumour treating fields earned the first pancreatic approval in decades.</p>
        </div>

        <Section title="Corpus at a glance">
          <div className="grid gap-3 grid-cols-2 sm:grid-cols-4 lg:grid-cols-7">
            {KINDS.filter((k) => g.kind(k).length > 0).map((k) => <Link key={k} href={`/${KIND_META[k].route}/`} className="card p-3 hover:shadow-md transition"><div className="text-2xl font-semibold tabular-nums">{g.kind(k).length.toLocaleString("en-GB")}</div><div className="text-sm capitalize">{KIND_META[k].plural}</div></Link>)}
          </div>
          <div className="flex flex-wrap gap-1.5 mt-4">
            {[...statusCounts.entries()].sort((a, b) => b[1] - a[1]).map(([s, n]) => <span key={s} className={`chip ${statusClass(s)}`}>{STATUS_LABEL[s] ?? s} {n}</span>)}
          </div>
        </Section>

        <Section title={`Approvals recorded in ${year}`} aside={<span className="text-xs text-muted">{approvals.length} label actions · {firstApprovals.length} first-ever approvals</span>}>
          <div className="overflow-x-auto card">
            <table className="onco">
              <thead><tr><th>Product</th><th>Region</th><th>Indication</th><th></th></tr></thead>
              <tbody>{approvals.map(({ d, a }, i) => <tr key={i}><td><Link href={routeFor(d)} className="font-medium hover:underline">{d.name}</Link>{d.brand && <div className="text-xs text-muted">{d.brand}</div>}</td><td>{a.region}</td><td className="text-muted">{a.indication}</td><td>{Math.min(...d.approvals.map((x) => x.year)) === year && <span className="chip bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">first approval</span>}</td></tr>)}</tbody>
            </table>
          </div>
        </Section>

        <Section title={`Trials reported in ${year}`} aside={<span className="text-xs text-muted">{positive.length} positive</span>}>
          <ul className="card divide-y divide-border">
            {trials.map((t) => <li key={t.id} className="p-3 flex flex-wrap items-center gap-3"><StatusChip status={t.status} /><Link href={routeFor(t)} className="font-medium hover:underline">{t.name}</Link><span className="text-sm text-muted">{t.result ?? t.setting}</span></li>)}
          </ul>
        </Section>

        <Section title="Negative, mixed, and withdrawn" aside={<span className="text-xs text-muted">failures are data</span>}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div><div className="kicker mb-2">Trials</div><ChipList items={negative} /></div>
            <div><div className="kicker mb-2">Programmes and targets</div><ChipList items={failed.filter((e) => e.kind !== "trial") as Entity[]} /></div>
          </div>
        </Section>

        <Section title="Roadmap progress">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="card p-4"><div className="kicker mb-2">Current ({current.length} steps)</div><ul className="space-y-2 text-sm">{current.map(({ r, s }, i) => <li key={i}><Link href={routeFor(r)} className="font-medium hover:underline">{s.title}</Link><div className="text-xs text-muted">{r.name.split(":")[0]} · {s.era}</div></li>)}</ul></div>
            <div className="card p-4"><div className="kicker mb-2">Emerging ({emerging.length} steps)</div><ul className="space-y-2 text-sm">{emerging.map(({ r, s }, i) => <li key={i}><Link href={routeFor(r)} className="font-medium hover:underline">{s.title}</Link><div className="text-xs text-muted">{r.name.split(":")[0]} · {s.era}</div></li>)}</ul></div>
          </div>
        </Section>

        <Section title="Late-stage pipeline" aside={<span className="text-xs text-muted">{phase3.length} products in phase 3 · {pending.length} trials recruiting or active</span>}>
          <ChipList items={phase3} />
          <div className="mt-3"><ChipList items={pending} /></div>
        </Section>

        <Section title="Frontier technologies" aside={<span className="text-xs text-muted">{frontier.length}</span>}>
          <ChipList items={frontier} />
        </Section>

        <Section title="Open problems by cancer">
          <ul className="card divide-y divide-border text-sm">
            {problems.map(({ c, p }, i) => <li key={i} className="p-3"><Link href={routeFor(c)} className="font-medium hover:underline">{c.name.replace(/ \(.*\)$/, "")}</Link><span className="text-muted">: {p}</span></li>)}
          </ul>
        </Section>

        <p className="text-sm text-muted mt-10">This page is regenerated on every build. Corrections and additions go through the <Link className="underline" href="/gaps/">gaps</Link> list and the <a className="underline" href="https://github.com/judegomila/OnCo" rel="noopener">repository</a>.</p>
      </Container>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { pageMeta } from "@/lib/seo";
import { graph } from "@/lib/graph";
import { routeFor } from "@/lib/schema";
import { Container, GroupKicker, PageHeader } from "@/components/ui";
import { KindIcon } from "@/components/KindIcon";
import { SCOPE_LABEL, SCOPE_PLAIN, TUMOUR_TESTS, type SampleType, type TestScope, type TumourTest } from "@/data/tumour-tests";

export const metadata: Metadata = pageMeta({
  title: "Tumour sequencing tests",
  description: "BostonGene, Tempus, Foundation Medicine, Caris, Guardant, Strata, NeoGenomics, Personalis, Illumina, Myriad, Natera, Exact Sciences and Labcorp tests side by side: sample type, targeted panel versus exome, exome plus transcriptome or MRD, what the report returns, regulatory status where certain, and the test's own page.",
  path: "/tumour-testing/",
});

const SCOPE_ORDER: TestScope[] = ["exome-transcriptome", "exome", "genome", "targeted-panel", "mrd", "screening"];
const SAMPLE_LABEL: Record<SampleType, string> = { tissue: "Tissue", blood: "Blood", both: "Tissue or blood" };
const SAMPLE_CLASS: Record<SampleType, string> = {
  tissue: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  blood: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200",
  both: "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200",
};
const SCOPE_CLASS: Record<TestScope, string> = {
  "exome-transcriptome": "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
  exome: "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-200",
  genome: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200",
  "targeted-panel": "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300",
  mrd: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200",
  screening: "bg-lime-100 text-lime-800 dark:bg-lime-900/40 dark:text-lime-200",
};

const ICON_PROPS = { viewBox: "0 0 24 24", "aria-hidden": true, focusable: "false", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round", strokeLinejoin: "round" } as const;
const SampleIcon = ({ sample, className = "h-3 w-3" }: { sample: SampleType; className?: string }) =>
  sample === "blood" ? <svg {...ICON_PROPS} className={className}><path d="M12 3s6 7 6 11a6 6 0 0 1-12 0c0-4 6-11 6-11z" /></svg>
  : sample === "tissue" ? <svg {...ICON_PROPS} className={className}><rect x="4" y="4" width="16" height="16" rx="3" /><circle cx="10" cy="10" r="2" /><circle cx="15" cy="14" r="1.5" /></svg>
  : <svg {...ICON_PROPS} className={className}><rect x="3" y="5" width="9" height="14" rx="2" /><path d="M17 5s4 4.5 4 7a4 4 0 0 1-8 0c0-2.5 4-7 4-7z" /></svg>;
const ScopeIcon = ({ scope, className = "h-3 w-3" }: { scope: TestScope; className?: string }) => {
  switch (scope) {
    case "targeted-panel": return <svg {...ICON_PROPS} className={className}><path d="M4 12h4M10 12h4M16 12h4" /><path d="M6 8v8M12 8v8M18 8v8" /></svg>;
    case "exome": return <svg {...ICON_PROPS} className={className}><path d="M3 12h18" /><rect x="5" y="9" width="4" height="6" /><rect x="14" y="9" width="5" height="6" /></svg>;
    case "exome-transcriptome": return <svg {...ICON_PROPS} className={className}><path d="M3 9h18" /><rect x="5" y="6" width="4" height="6" /><rect x="14" y="6" width="5" height="6" /><path d="M4 17c3-3 5 3 8 0s5 3 8 0" /></svg>;
    case "genome": return <svg {...ICON_PROPS} className={className}><path d="M8 3c0 6 8 6 8 12s-8 6-8 6" /><path d="M16 3c0 6-8 6-8 12s8 6 8 6" /></svg>;
    case "mrd": return <svg {...ICON_PROPS} className={className}><path d="M3 12h4l2-5 3 10 2-5h7" /></svg>;
    case "screening": return <svg {...ICON_PROPS} className={className}><circle cx="11" cy="11" r="6" /><path d="M20 20l-4.5-4.5" /></svg>;
  }
};

function Row({ t }: { t: TumourTest }) {
  const g = graph();
  const company = g.get(t.companyId);
  const record = t.drugId ? g.get(t.drugId) : undefined;
  const techs = t.technologies.map((id) => g.get(id)).filter((e): e is NonNullable<typeof e> => Boolean(e));
  return (
    <tr id={t.id} className="align-top border-t border-border">
      <td className="py-3 pr-3">
        <a href={t.url} target="_blank" rel="noopener noreferrer" className="font-medium hover:underline">{t.name}</a>
        {record && <div className="text-xs mt-0.5"><Link href={routeFor(record)} className="text-muted hover:underline inline-flex items-center gap-1"><KindIcon kind={record.kind} className="h-3 w-3" />OnCo record</Link></div>}
        {t.note && <div className="text-xs text-muted mt-1 max-w-xs">{t.note}</div>}
      </td>
      <td className="py-3 pr-3 whitespace-nowrap">{company ? <Link href={routeFor(company)} className="hover:underline inline-flex items-center gap-1"><KindIcon kind="company" className="h-3 w-3" />{company.name}</Link> : t.companyId}</td>
      <td className="py-3 pr-3"><a href={`#sample-${t.sample}`} className={`chip inline-flex items-center gap-1 text-xs ${SAMPLE_CLASS[t.sample]}`}><SampleIcon sample={t.sample} />{SAMPLE_LABEL[t.sample]}</a></td>
      <td className="py-3 pr-3"><a href={`#scope-${t.scope}`} className={`chip inline-flex items-center gap-1 text-xs ${SCOPE_CLASS[t.scope]}`} title={SCOPE_PLAIN[t.scope]}><ScopeIcon scope={t.scope} />{SCOPE_LABEL[t.scope]}</a></td>
      <td className="py-3 pr-3 text-sm leading-relaxed min-w-[16rem]">{t.returns}</td>
      <td className="py-3 pr-3 text-sm hidden lg:table-cell">{t.regulatory.us ?? ""}</td>
      <td className="py-3 pr-3 text-sm hidden lg:table-cell">{t.regulatory.eu ?? ""}</td>
      <td className="py-3 text-xs hidden md:table-cell">
        <div className="flex flex-wrap gap-1">
          {techs.map((e) => <Link key={e.id} href={routeFor(e)} className="chip border border-border bg-card hover:bg-foreground/5 inline-flex items-center gap-1"><KindIcon kind={e.kind} className="h-3 w-3" />{e.name}</Link>)}
        </div>
      </td>
    </tr>
  );
}

export default function TumourTestingPage() {
  const g = graph();
  const rows = [...TUMOUR_TESTS].sort((a, b) => SCOPE_ORDER.indexOf(a.scope) - SCOPE_ORDER.indexOf(b.scope) || a.companyId.localeCompare(b.companyId) || a.name.localeCompare(b.name));
  const companies = [...new Set(TUMOUR_TESTS.map((t) => t.companyId))].map((id) => g.get(id)).filter((e): e is NonNullable<typeof e> => Boolean(e)).sort((a, b) => a.name.localeCompare(b.name));
  const scopes = SCOPE_ORDER.filter((s) => TUMOUR_TESTS.some((t) => t.scope === s));
  const byScope = (s: TestScope) => TUMOUR_TESTS.filter((t) => t.scope === s);
  const bySample = (s: SampleType) => TUMOUR_TESTS.filter((t) => t.sample === s);
  const wes = g.get("wes-wgs");
  const cgp = g.get("cgp");
  const mrd = g.get("mrd-testing");
  const liquid = g.get("liquid-biopsy");
  const cdx = g.get("companion-diagnostic");

  return (
    <>
      <PageHeader
        kicker={<GroupKicker id="map"><span className="kicker">·</span>{cgp && <Link href={routeFor(cgp)} className="kicker hover:underline">{cgp.name}</Link>}<span className="kicker">·</span>{wes && <Link href={routeFor(wes)} className="kicker hover:underline">Exome and genome sequencing</Link>}</GroupKicker>}
        title="Tumour sequencing tests"
        lede={`${TUMOUR_TESTS.length} tests from ${companies.length} laboratories side by side: whether they need tissue or blood, whether they read a chosen panel of genes, the whole exome, the exome plus the RNA, or only trace tumour DNA after treatment, what the report contains, and the regulatory status where it is certain. A blank cell means OnCo does not state it.`}
      />
      <Container className="pb-16">
        <div className="card p-4 text-sm text-muted max-w-3xl border-amber-300/60 dark:border-amber-700/60">
          <div className="kicker mb-1">How to read this</div>
          <p>Most tests here are laboratory-developed tests: run in one accredited laboratory in the United States under CLIA rules rather than approved as a kit. FDA approval applies to a specific version with named companion diagnostic claims, and CE marking to sale in Europe. Which test you get depends on your hospital, your country and your insurer; in England the <Link href="/free/#testing" className="underline">NHS Genomic Medicine Service</Link> funds the tests in its directory. Ask the treating team which test was run and for the report itself; the <Link href="/report-reader/" className="underline">report reader</Link> explains the values.</p>
        </div>

        <section className="mt-8 grid gap-3 md:grid-cols-2">
          <div className="card p-4">
            <div className="kicker mb-2">By scope</div>
            <ul className="space-y-2 text-sm">
              {scopes.map((s) => (
                <li key={s} id={`scope-${s}`} className="scroll-mt-20 flex flex-wrap items-baseline gap-2">
                  <span className={`chip inline-flex items-center gap-1 text-xs ${SCOPE_CLASS[s]}`}><ScopeIcon scope={s} />{SCOPE_LABEL[s]}</span>
                  <span className="text-muted">{SCOPE_PLAIN[s]}</span>
                  <span className="flex flex-wrap gap-1">{byScope(s).map((t) => <a key={t.id} href={`#${t.id}`} className="chip border border-border bg-card hover:bg-foreground/5 text-xs">{t.name}</a>)}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="card p-4">
            <div className="kicker mb-2">By sample</div>
            <ul className="space-y-2 text-sm">
              {(["tissue", "blood", "both"] as SampleType[]).map((s) => (
                <li key={s} id={`sample-${s}`} className="scroll-mt-20 flex flex-wrap items-baseline gap-2">
                  <span className={`chip inline-flex items-center gap-1 text-xs ${SAMPLE_CLASS[s]}`}><SampleIcon sample={s} />{SAMPLE_LABEL[s]}</span>
                  <span className="flex flex-wrap gap-1">{bySample(s).map((t) => <a key={t.id} href={`#${t.id}`} className="chip border border-border bg-card hover:bg-foreground/5 text-xs">{t.name}</a>)}</span>
                </li>
              ))}
            </ul>
            <div className="kicker mt-4 mb-2">Technologies</div>
            <div className="flex flex-wrap gap-1 text-xs">
              {[cgp, wes, liquid, mrd, cdx].filter((e): e is NonNullable<typeof e> => Boolean(e)).map((e) => <Link key={e.id} href={routeFor(e)} className="chip border border-border bg-card hover:bg-foreground/5 inline-flex items-center gap-1"><KindIcon kind={e.kind} className="h-3 w-3" />{e.name}</Link>)}
            </div>
          </div>
        </section>

        <div className="mt-8 overflow-x-auto">
          <table className="w-full text-left text-[15px]">
            <thead>
              <tr className="text-xs uppercase tracking-wide text-muted">
                <th className="py-2 pr-3 font-medium">Test</th>
                <th className="py-2 pr-3 font-medium">Company</th>
                <th className="py-2 pr-3 font-medium">Sample</th>
                <th className="py-2 pr-3 font-medium">Scope</th>
                <th className="py-2 pr-3 font-medium">What it returns</th>
                <th className="py-2 pr-3 font-medium hidden lg:table-cell">US status</th>
                <th className="py-2 pr-3 font-medium hidden lg:table-cell">EU status</th>
                <th className="py-2 font-medium hidden md:table-cell">Technologies</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((t) => <Row key={t.id} t={t} />)}
            </tbody>
          </table>
        </div>

        <section className="mt-12">
          <div className="kicker mb-2">Laboratories in this table</div>
          <div className="flex flex-wrap gap-1.5 text-sm">
            {companies.map((c) => <Link key={c.id} href={routeFor(c)} className="chip border border-border bg-card hover:bg-foreground/5 inline-flex items-center gap-1"><KindIcon kind="company" className="h-3 w-3" />{c.name}</Link>)}
          </div>
          <p className="mt-4 text-sm text-muted max-w-3xl">Free routes to testing, including charity-funded sequencing programmes and the NHS directory, are on the <Link href="/free/#testing" className="underline">free in oncology</Link> page. Companion diagnostic assays with FDA claims, by drug, are on the <Link href="/assays/" className="underline">assays</Link> page.</p>
        </section>
      </Container>
    </>
  );
}

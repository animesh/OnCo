import type { Metadata } from "next";
import Link from "next/link";
import { graph } from "@/lib/graph";
import { routeFor } from "@/lib/schema";
import { Container, GroupKicker, PageHeader, Section } from "@/components/ui";
import { EntityBrowser, type BrowserRow, type ColDef, type FacetDef } from "@/components/EntityBrowser";
import { NICE_CHIP_CLASS } from "@/components/CoverageUk";
import { coverageUk, NHS_SYSTEM, NICE_STATUS_LABEL, NICE_STATUS_ORDER, NICE_STATUS_TIP, NICE_SEARCH, CDF_LIST_URL, type NiceStatus } from "@/data/coverage-uk";

export const metadata: Metadata = {
  title: "NHS cancer coverage",
  description: "NICE technology appraisals, the Cancer Drugs Fund and SMC decisions for every approved cancer product in OnCo, plus how NHS cancer care works: referral standards, MDTs, specialised commissioning, screening, genomics, trials, benefits and where to get help.",
};

const FUNDED: NiceStatus[] = ["recommended", "optimised", "cdf"];

export default function CoverageUkPage() {
  const g = graph();
  const approved = g.kind("drug").filter((d) => d.status === "approved");
  const covered = approved.filter((d) => coverageUk[d.id]);
  const missing = approved.filter((d) => !coverageUk[d.id]);
  const researched = covered.filter((d) => coverageUk[d.id].nice.status !== "unknown");
  const pct = approved.length ? Math.round((covered.length / approved.length) * 100) : 0;
  const pctResearched = approved.length ? Math.round((researched.length / approved.length) * 100) : 0;
  const counts = Object.fromEntries(NICE_STATUS_ORDER.map((s) => [s, covered.filter((d) => coverageUk[d.id].nice.status === s).length])) as Record<NiceStatus, number>;
  const funded = FUNDED.reduce((n, s) => n + counts[s], 0);
  const withTa = covered.filter((d) => coverageUk[d.id].nice.ta).length;

  const rows: BrowserRow[] = covered.map((d) => {
    const c = coverageUk[d.id];
    const label = NICE_STATUS_LABEL[c.nice.status];
    // Appraisal numbers named in the note, minus the flagship: the product page carries the detail for each.
    const others = [...new Set((c.nice.note ?? "").match(/TA\d{3,4}/g) ?? [])].filter((t) => t !== c.nice.ta);
    return {
      id: d.id, name: d.name, sub: d.brand, tldr: d.tldr, route: routeFor(d), molecule: d.id, modality: d.modality,
      facets: { nice: [label], smc: [c.smc?.status ?? "Not recorded"], modality: [d.modality] },
      cols: {
        nice: label,
        ta: c.nice.ta && c.nice.url ? [{ label: c.nice.ta, href: c.nice.url, tip: c.nice.indication ?? label }] : c.nice.url ? [{ label: "Search NICE", href: c.nice.url, tip: NICE_STATUS_TIP[c.nice.status] }] : undefined,
        year: c.nice.year,
        indication: c.nice.indication ?? c.nice.note,
        smc: c.smc?.status,
        more: others.length ? [{ label: `${others.length} more`, href: routeFor(d), tip: `Other NICE appraisals named on the product page: ${others.join(", ")}` }] : undefined,
      },
      sortKeys: { nice: NICE_STATUS_ORDER.indexOf(c.nice.status), year: c.nice.year ?? 9999, more: others.length },
    };
  });

  const facets: FacetDef[] = [
    { key: "nice", label: "NICE outcome", searchable: false, width: "w-56", order: NICE_STATUS_ORDER.map((s) => NICE_STATUS_LABEL[s]) },
    { key: "smc", label: "SMC (Scotland)", searchable: false, width: "w-48", order: ["accepted", "accepted (restricted)", "not recommended", "Not recorded"] },
    { key: "modality", label: "Modality", width: "w-48" },
  ];
  const valueTips = Object.fromEntries(NICE_STATUS_ORDER.map((s) => [NICE_STATUS_LABEL[s], NICE_STATUS_TIP[s]]));
  const columns: ColDef[] = [
    { key: "nice", label: "NICE", sortable: true, chip: true, valueTips, tip: "Outcome of the flagship NICE technology appraisal for this product. Hover a value for what it means." },
    { key: "ta", label: "Guidance", tip: "Technology appraisal number, linked to the NICE page. 'Search NICE' where the number was not verified." },
    { key: "year", label: "Year", sortable: true, numeric: true, hide: "sm", tip: "Year the flagship appraisal was published." },
    { key: "indication", label: "Appraised indication", hide: "md", className: "max-w-xl", tip: "The population NICE appraised, which is often narrower than the licence. Other indications are in the note on the product page." },
    { key: "smc", label: "SMC", sortable: true, chip: true, hide: "lg", tip: "Scottish Medicines Consortium: accepted for at least one cancer indication, often with restrictions." },
    { key: "more", label: "Other appraisals", sortable: true, hide: "lg", tip: "How many further NICE appraisals of this product are recorded, each with its number, date and verdict on the product page. Hover for the numbers." },
  ];

  return (
    <>
      <PageHeader
        kicker={<GroupKicker id="live"><span className="kicker">·</span><Link href="/regulatory/regions/" className="kicker hover:underline">Approvals by region</Link></GroupKicker>}
        title="NHS cancer coverage"
        lede={`The NHS is free at the point of use, but a licensed cancer drug is only routinely available once NICE (England, Wales, Northern Ireland) or the SMC (Scotland) has said its benefit is worth its price. Of ${approved.length} approved products in OnCo, ${covered.length} have a UK coverage record here (${pct}%): ${funded} are NICE recommended or funded through the Cancer Drugs Fund, ${counts["not recommended"]} were not recommended, ${counts["not appraised"]} were never appraised (generics funded routinely, or products with no UK licence), and ${counts.unknown} are still to be researched. Below: how the system works, then every product.`}
      />
      <Container className="pb-16">
        <Section title="NHS cancer care and funding" aside={<span className="text-sm text-muted">{NHS_SYSTEM.length} cards · plain English first, detail second</span>}>
          <div className="grid gap-4 md:grid-cols-2">
            {NHS_SYSTEM.map((s) => (
              <article key={s.id} id={s.id} className="card p-5 flex flex-col">
                <h3 className="font-semibold leading-snug text-balance">{s.title}</h3>
                <p className="mt-2 text-[15px] leading-relaxed">{s.plain}</p>
                <details className="mt-3 group">
                  <summary className="cursor-pointer text-sm text-muted hover:text-foreground select-none">More detail</summary>
                  <p className="mt-2 text-sm leading-relaxed text-foreground/85">{s.detail}</p>
                </details>
                <ul className="mt-auto pt-3 flex flex-wrap gap-x-3 gap-y-1 text-xs">
                  {s.links.map((l) => <li key={l.url}><a href={l.url} target="_blank" rel="noopener noreferrer" className="underline decoration-foreground/20 underline-offset-[3px] hover:decoration-foreground text-muted hover:text-foreground">{l.label}</a></li>)}
                </ul>
              </article>
            ))}
          </div>
        </Section>

        <Section title="Decisions by product" id="products" aside={<span className="text-sm text-muted">{withTa} rows link to a specific TA · sorted funded first</span>}>
          <div className="mb-3 flex flex-wrap gap-1.5 text-xs">
            {NICE_STATUS_ORDER.filter((s) => counts[s]).map((s) => <span key={s} className={`chip ${NICE_CHIP_CLASS[s]}`} title={NICE_STATUS_TIP[s]}>{NICE_STATUS_LABEL[s]} · {counts[s]}</span>)}
          </div>
          <EntityBrowser rows={rows} facets={facets} columns={columns} noun="products" hideStatus defaultSort={{ key: "nice", dir: 1 }} />
        </Section>

        <section className="mt-10 grid md:grid-cols-2 gap-6 text-sm">
          <div className="card p-5 space-y-2">
            <h2 className="font-semibold text-base">Data gaps</h2>
            <p>{covered.length} of {approved.length} approved products ({pct}%) have a record; {researched.length} ({pctResearched}%) have a researched outcome rather than a placeholder. {counts.unknown} rows are marked &ldquo;not yet researched&rdquo;: each links to a NICE search so you can check in one click, and if you know the outcome you can <a className="underline" href="https://github.com/judegomila/OnCo/issues/new?template=regional-approval.yml&title=coverage%3A%20NICE%20outcome" rel="noopener">tell us through the issue form</a> with the appraisal link.</p>
            {missing.length > 0 ? (
              <p>Approved products with no UK record at all ({missing.length}): {missing.map((d, i) => <span key={d.id}>{i > 0 && ", "}<Link href={routeFor(d)} className="underline">{d.name}</Link></span>)}.</p>
            ) : (
              <p>Every approved product in OnCo has a UK coverage row.</p>
            )}
            <p>Each row records one flagship appraisal; most modern drugs have several TAs, one per indication, named in the note on the product page. SMC status is per medicine, not per indication. Wales (AWMSG) positions are recorded only where they differ from NICE. Corrections are welcome via the repo.</p>
          </div>
          <div className="card p-5 space-y-2 border-amber-300/60 dark:border-amber-700/50">
            <h2 className="font-semibold text-base">Verify with NICE and your team</h2>
            <p>This page is a map, not a decision. NICE publishes new and updated technology appraisals every week, Cancer Drugs Fund entries move to routine commissioning or are withdrawn, and whether a drug is available to <em>you</em> depends on the exact indication, line of treatment, biomarker and, sometimes, the hospital. TA numbers here were recorded from memory of the guidance and checked against the linked page where possible; where a number was not verified the row says so and links to a NICE search.</p>
            <p>Before acting on any row: open the linked NICE page and read the recommendation section; check the <a href={CDF_LIST_URL} target="_blank" rel="noopener noreferrer" className="underline">current CDF list</a>; and ask your oncologist or clinical nurse specialist whether the appraised indication matches your situation and whether an individual funding request, a trial or an early access scheme applies. In Scotland check the <a href="https://scottishmedicines.org.uk/medicines-advice/" target="_blank" rel="noopener noreferrer" className="underline">SMC</a>; in Wales the <a href="https://awttc.nhs.wales/" target="_blank" rel="noopener noreferrer" className="underline">AWTTC</a>.</p>
            <p><a href={NICE_SEARCH("cancer")} target="_blank" rel="noopener noreferrer" className="underline">Search NICE guidance →</a> · <Link href="/regulatory/regions/" className="underline">MHRA and other regulators by region →</Link></p>
          </div>
        </section>
      </Container>
    </>
  );
}

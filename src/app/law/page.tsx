import type { Metadata } from "next";
import Link from "next/link";
import { pageMeta } from "@/lib/seo";
import { graph } from "@/lib/graph";
import { routeFor } from "@/lib/schema";
import { Container, GroupKicker, PageHeader } from "@/components/ui";
import { LAW_INDEX, LAW_JURISDICTIONS, LAW_THEMES, type LawInstrument, type LawJurisdiction, type LawTheme } from "@/data/law-wave";

export const metadata: Metadata = pageMeta({
  title: "Laws around oncology",
  description: "The statutes, regulations, guidance and court rulings that decide how cancer drugs are approved, paid for and tested, and how patients' data and genes are protected: United States, European Union, United Kingdom, Germany, France, Japan, China, India and international, grouped by jurisdiction and by theme, each with its year, instrument and primary text.",
  path: "/law/",
});

/** Small inline icons so every section heading carries a glyph without adding a dependency. */
type IconProps = { className?: string };
const Svg = ({ children, className = "h-5 w-5" }: { children: React.ReactNode; className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.6} strokeLinecap="round" strokeLinejoin="round" aria-hidden className={className}>{children}</svg>
);
const IconGavel = (p: IconProps) => <Svg {...p}><path d="M14 4l6 6" /><path d="M11 7l6 6" /><path d="M13 5l-2 2 6 6 2-2" /><path d="M10 10l-7 7 2 2 7-7" /><path d="M3 21h9" /></Svg>;
const IconClock = (p: IconProps) => <Svg {...p}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></Svg>;
const IconCoin = (p: IconProps) => <Svg {...p}><circle cx="12" cy="12" r="8.5" /><path d="M12 7v10" /><path d="M14.5 9.5c0-1-1.1-1.8-2.5-1.8s-2.5.8-2.5 1.8 1 1.6 2.5 1.9 2.5.9 2.5 1.9-1.1 1.8-2.5 1.8-2.5-.8-2.5-1.8" /></Svg>;
const IconFlask = (p: IconProps) => <Svg {...p}><path d="M9.5 3h5" /><path d="M10 3v6.5L4.8 18.5A1.5 1.5 0 0 0 6.1 21h11.8a1.5 1.5 0 0 0 1.3-2.5L14 9.5V3" /><path d="M7.5 15h9" /></Svg>;
const IconShield = (p: IconProps) => <Svg {...p}><path d="M12 3l7 3v5.5c0 4.4-3 8-7 9.5-4-1.5-7-5.1-7-9.5V6z" /><path d="M9.5 12l1.8 1.8L15 10" /></Svg>;
const IconLeaf = (p: IconProps) => <Svg {...p}><path d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14z" /><path d="M5 19l7-7" /></Svg>;
const IconGlobe = (p: IconProps) => <Svg {...p}><circle cx="12" cy="12" r="8.5" /><path d="M3.5 12h17" /><path d="M12 3.5c2.6 2.6 3.8 5.4 3.8 8.5s-1.2 5.9-3.8 8.5c-2.6-2.6-3.8-5.4-3.8-8.5s1.2-5.9 3.8-8.5z" /></Svg>;
const IconScroll = (p: IconProps) => <Svg {...p}><path d="M7 4h11a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1z" /><path d="M9 9h7" /><path d="M9 13h7" /><path d="M9 17h4" /></Svg>;

const THEME_ICON: Record<LawTheme, (p: IconProps) => React.ReactElement> = { approval: IconClock, paying: IconCoin, testing: IconFlask, data: IconShield, prevention: IconLeaf };
const THEME_ORDER: LawTheme[] = ["approval", "paying", "testing", "data", "prevention"];
/** Where the theme heading links: the bottleneck the laws in it bear on. */
const THEME_LINK: Record<LawTheme, string> = { approval: "b-regulatory-fragmentation", paying: "b-drug-pricing", testing: "b-trial-enrolment", data: "b-data-silos", prevention: "b-prevention-adoption" };
const JURISDICTION_ORDER: LawJurisdiction[] = ["us", "eu", "uk", "de", "fr", "jp", "cn", "in", "intl"];
/** Where the jurisdiction heading links: its regulator or assessment body in the corpus. */
const JURISDICTION_LINK: Record<LawJurisdiction, string> = { us: "fda-oce", eu: "ema", uk: "mhra", de: "g-ba-iqwig", fr: "has-france", jp: "pmda", cn: "nmpa-cde", in: "cdsco", intl: "who" };
const INSTRUMENT_CLASS: Record<LawInstrument, string> = {
  statute: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200",
  regulation: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200",
  guidance: "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-200",
  "court ruling": "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200",
  scheme: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  treaty: "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200",
  declaration: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
};
const GLOSSARY_FILTER = `/terms/?category=${encodeURIComponent("Regulation & policy")}`;

type Row = { id: string; name: string; tldr: string; route: string; jurisdiction: LawJurisdiction; year: number; instrument: LawInstrument; themes: LawTheme[] };

function InstrumentPill({ instrument }: { instrument: LawInstrument }) {
  return <Link href={`#instrument-${instrument.replace(" ", "-")}`} className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${INSTRUMENT_CLASS[instrument]}`}>{instrument}</Link>;
}

function LawCard({ row, showJurisdiction }: { row: Row; showJurisdiction: boolean }) {
  return (
    <li className="card p-4 flex flex-col gap-2 h-full">
      <div className="flex items-center gap-2 text-xs text-muted flex-wrap">
        <Link href={`#year-${row.year}`} className="font-mono tabular-nums hover:underline">{row.year}</Link>
        <InstrumentPill instrument={row.instrument} />
        {showJurisdiction && <Link href={`#jurisdiction-${row.jurisdiction}`} className="hover:underline">{LAW_JURISDICTIONS[row.jurisdiction]}</Link>}
      </div>
      <Link href={row.route} className="font-semibold leading-snug hover:underline">{row.name}</Link>
      <p className="text-sm text-muted leading-snug">{row.tldr}</p>
      <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
        {row.themes.map((th) => {
          const Icon = THEME_ICON[th];
          return <Link key={th} href={`#theme-${th}`} className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[11px] hover:bg-card"><Icon className="h-3 w-3" />{LAW_THEMES[th].label}</Link>;
        })}
      </div>
    </li>
  );
}

export default function LawPage() {
  const g = graph();
  const rows: Row[] = LAW_INDEX.map((x) => {
    const e = g.must(x.id);
    return { id: e.id, name: e.name, tldr: e.tldr, route: routeFor(e), jurisdiction: x.jurisdiction, year: x.year, instrument: x.instrument, themes: x.themes };
  });
  const byYear = [...rows].sort((a, b) => a.year - b.year || a.name.localeCompare(b.name));
  const jurisdictions = JURISDICTION_ORDER.filter((j) => rows.some((r) => r.jurisdiction === j));
  const instruments = (Object.keys(INSTRUMENT_CLASS) as LawInstrument[]).filter((i) => rows.some((r) => r.instrument === i));
  const rulings = rows.filter((r) => r.instrument === "court ruling").length;
  const decades = Array.from(new Set(byYear.map((r) => Math.floor(r.year / 10) * 10)));
  // One anchor per year: the first law of that year carries the id the year links point at.
  const firstOfYear = new Set(byYear.filter((r, i) => i === byYear.findIndex((x) => x.year === r.year)).map((r) => r.id));
  const entity = (id: string) => g.get(id);

  return (
    <>
      <PageHeader
        kicker={<GroupKicker id="intel"><span className="kicker">·</span><Link href="/regulatory/" className="kicker hover:underline">Regulatory timeline</Link><span className="kicker">·</span><Link href="/hta/" className="kicker hover:underline">HTA decisions</Link><span className="kicker">·</span><Link href="/exclusivity/" className="kicker hover:underline">Exclusivity expiry</Link></GroupKicker>}
        title="Laws around oncology"
        lede={`${rows.length} statutes, regulations, guidance documents, schemes and ${rulings} court rulings across ${jurisdictions.length} jurisdictions, from the 1938 Food, Drug, and Cosmetic Act to the 2025 European Health Data Space. Each entry states the instrument, the year and the primary text, then what it changed for patients and companies and what is argued about it.`}
        right={<Link href={GLOSSARY_FILTER} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium">Regulation &amp; policy glossary →</Link>}
      />
      <Container className="pb-16">
        <nav aria-label="Sections" className="flex flex-wrap gap-2 text-sm">
          <a href="#themes" className="rounded-full border border-border px-3 py-1 hover:bg-card inline-flex items-center gap-1.5"><IconGavel className="h-4 w-4" />By theme</a>
          <a href="#jurisdictions" className="rounded-full border border-border px-3 py-1 hover:bg-card inline-flex items-center gap-1.5"><IconGlobe className="h-4 w-4" />By jurisdiction</a>
          <a href="#instruments" className="rounded-full border border-border px-3 py-1 hover:bg-card inline-flex items-center gap-1.5"><IconScroll className="h-4 w-4" />By instrument</a>
          <a href="#timeline" className="rounded-full border border-border px-3 py-1 hover:bg-card inline-flex items-center gap-1.5"><IconClock className="h-4 w-4" />Timeline</a>
        </nav>

        <section id="themes" className="mt-10">
          <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2"><IconGavel className="h-5 w-5 text-accent" />By theme</h2>
          <p className="text-sm text-muted mt-1 max-w-3xl">Five questions a law can answer. A law can sit under more than one; each heading links to the bottleneck the laws in it bear on.</p>
          {THEME_ORDER.map((th) => {
            const Icon = THEME_ICON[th];
            const list = byYear.filter((r) => r.themes.includes(th));
            const b = entity(THEME_LINK[th]);
            return (
              <section key={th} id={`theme-${th}`} className="mt-8">
                <div className="flex items-baseline justify-between gap-4 flex-wrap">
                  <h3 className="text-base font-semibold flex items-center gap-2"><Icon className="h-5 w-5 text-accent" />{LAW_THEMES[th].label} <span className="text-muted font-normal text-sm">({list.length})</span></h3>
                  {b && <Link href={routeFor(b)} className="text-xs underline">Bottleneck: {b.name}</Link>}
                </div>
                <p className="text-sm text-muted mt-1">{LAW_THEMES[th].blurb}</p>
                <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {list.map((r) => <LawCard key={r.id} row={r} showJurisdiction />)}
                </ul>
              </section>
            );
          })}
        </section>

        <section id="jurisdictions" className="mt-14">
          <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2"><IconGlobe className="h-5 w-5 text-accent" />By jurisdiction</h2>
          <p className="text-sm text-muted mt-1 max-w-3xl">Each heading links to the regulator or assessment body that applies the laws. Approvals by region are on the <Link href="/regulatory/regions/" className="underline">regional approvals</Link> page.</p>
          {jurisdictions.map((j) => {
            const list = byYear.filter((r) => r.jurisdiction === j);
            const inst = entity(JURISDICTION_LINK[j]);
            return (
              <section key={j} id={`jurisdiction-${j}`} className="mt-8">
                <div className="flex items-baseline justify-between gap-4 flex-wrap">
                  <h3 className="text-base font-semibold flex items-center gap-2"><IconGlobe className="h-5 w-5 text-accent" />{LAW_JURISDICTIONS[j]} <span className="text-muted font-normal text-sm">({list.length})</span></h3>
                  {inst && <Link href={routeFor(inst)} className="text-xs underline">{inst.name}</Link>}
                </div>
                <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {list.map((r) => <LawCard key={r.id} row={r} showJurisdiction={false} />)}
                </ul>
              </section>
            );
          })}
        </section>

        <section id="instruments" className="mt-14">
          <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2"><IconScroll className="h-5 w-5 text-accent" />By instrument</h2>
          <p className="text-sm text-muted mt-1 max-w-3xl">A statute is passed by a legislature; a regulation is made by a government or agency under one; guidance says how an agency reads them; a scheme is an administrative programme; a court ruling settles what they mean.</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {instruments.map((i) => {
              const list = byYear.filter((r) => r.instrument === i);
              return (
                <section key={i} id={`instrument-${i.replace(" ", "-")}`} className="card p-4">
                  <h3 className="text-sm font-semibold flex items-center gap-2"><span className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${INSTRUMENT_CLASS[i]}`}>{i}</span><span className="text-muted font-normal">{list.length}</span></h3>
                  <ul className="mt-2 space-y-1 text-sm">
                    {list.map((r) => (
                      <li key={r.id} className="flex gap-2"><Link href={`#year-${r.year}`} className="font-mono tabular-nums text-muted shrink-0 hover:underline">{r.year}</Link><Link href={r.route} className="hover:underline">{r.name}</Link><Link href={`#jurisdiction-${r.jurisdiction}`} className="text-muted text-xs shrink-0 hover:underline ml-auto">{LAW_JURISDICTIONS[r.jurisdiction]}</Link></li>
                    ))}
                  </ul>
                </section>
              );
            })}
          </div>
        </section>

        <section id="timeline" className="mt-14">
          <h2 className="text-lg font-semibold tracking-tight flex items-center gap-2"><IconClock className="h-5 w-5 text-accent" />Timeline</h2>
          <p className="text-sm text-muted mt-1 max-w-3xl">Year of enactment, adoption or judgment. Dated product-level events (filings, approvals, withdrawals) are on the <Link href="/regulatory/" className="underline">regulatory timeline</Link>.</p>
          <ol className="mt-4 space-y-4">
            {decades.map((d) => (
              <li key={d} className="grid gap-2 sm:grid-cols-[6rem_1fr]">
                <div className="font-mono text-sm text-muted pt-1">{d}s</div>
                <ul className="space-y-1.5 text-sm">
                  {byYear.filter((r) => Math.floor(r.year / 10) * 10 === d).map((r) => (
                    <li key={r.id} id={firstOfYear.has(r.id) ? `year-` : undefined} className="flex flex-wrap items-center gap-2">
                      <span className="font-mono tabular-nums">{r.year}</span>
                      <InstrumentPill instrument={r.instrument} />
                      <Link href={r.route} className="hover:underline">{r.name}</Link>
                      <Link href={`#jurisdiction-${r.jurisdiction}`} className="text-xs text-muted hover:underline">{LAW_JURISDICTIONS[r.jurisdiction]}</Link>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-14 grid md:grid-cols-2 gap-6 text-sm">
          <div className="card p-5 space-y-2">
            <h2 className="font-semibold text-base flex items-center gap-2"><IconScroll className="h-4 w-4 text-accent" />How to read an entry</h2>
            <p>Every law page opens with the jurisdiction, the instrument, the year and a link to the primary text (Congress.gov and the FDA, EUR-Lex and the EMA, legislation.gov.uk and NICE, the PMDA, the NMPA and the CDSCO). Then what it changed for patients and for companies, and the arguments for and against it. Dates and numbers appear only where a source is certain; where none is, the entry says so.</p>
            <p>Terms that predate this page, such as <Link href="/terms/accelerated-approval/" className="underline">accelerated approval</Link>, <Link href="/terms/conditional-approval/" className="underline">conditional marketing authorisation</Link> and <Link href="/terms/orphan-designation/" className="underline">orphan designation</Link>, were given the same opening paragraph and now link to the statutes behind them.</p>
          </div>
          <div className="card p-5 space-y-2">
            <h2 className="font-semibold text-base flex items-center gap-2"><IconGavel className="h-4 w-4 text-accent" />Where the laws bite</h2>
            <p>The <Link href="/exclusivity/" className="underline">exclusivity timeline</Link> applies Hatch-Waxman, the BPCIA and the supplementary protection certificate to each product. <Link href="/hta/" className="underline">HTA decisions</Link> are NICE, G-BA and PBAC verdicts made under the methods and statutes here. <Link href="/coverage/us/" className="underline">Paying for care in the US</Link> and <Link href="/coverage/uk/" className="underline">NHS coverage</Link> show what the Inflation Reduction Act, 340B and the Cancer Drugs Fund mean for a given drug. <Link href="/costs/" className="underline">Cutting cancer care costs</Link> pairs each cost driver with the ideas that could do more.</p>
            <p>Add a law in <code className="text-xs">src/data/law-wave.ts</code>: a glossary term in the Regulation &amp; policy category plus a row in <code className="text-xs">LAW_INDEX</code> giving its jurisdiction, year, instrument and themes.</p>
          </div>
        </section>
      </Container>
    </>
  );
}

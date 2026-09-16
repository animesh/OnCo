import type { Metadata } from "next";
import Link from "next/link";
import { pageMeta } from "@/lib/seo";
import { graph } from "@/lib/graph";
import { routeFor, type Company, type Stage } from "@/lib/schema";
import { Container, GroupKicker, PageHeader } from "@/components/ui";
import { EntityBrowser, type BrowserRow, type ColDef, type FacetDef, type FacetLink, type LinkItem } from "@/components/EntityBrowser";
import { StageIcon } from "@/components/StageIcon";
import { logoSrc } from "@/lib/logos";
import { COMPANY_TYPE_LABEL, fmtUsd, investors, latestRound, mostActiveInvestors, recentlyFunded, STAGE_LABEL, STAGE_ORDER, STAGE_TIP, stageOf, startups, ycBatchLabel, ycBatchSortKey, ycCompanies } from "@/lib/startups";

export const metadata: Metadata = pageMeta({
  title: "Oncology startups",
  description: "Every Y Combinator and venture-backed company in OnCo that is attacking cancer: filter by stage, modality, cancer, YC batch, investor and country, with sourced funding rounds and the most active investors.",
  path: "/startups/",
});

const short = (s: string) => s.replace(/ \(.*\)$/, "");

function rows(): { rows: BrowserRow[]; facets: FacetDef[]; columns: ColDef[] } {
  const g = graph();
  const fl = (facet: string, value: string | undefined, extra?: Pick<FacetLink, "label" | "tip">): FacetLink | undefined => (value ? { facet, value, ...extra } : undefined);
  const link = (id: string): LinkItem => { const e = g.must(id); return { label: short(e.name), href: routeFor(e), tip: e.tldr }; };
  const list = startups();
  const out: BrowserRow[] = list.map((c) => {
    const stage = stageOf(c);
    const stageLabel = stage ? STAGE_LABEL[stage] : undefined;
    const techNames = [...new Set(c.technologies.map((id) => short(g.must(id).name)))];
    const fronts = [...new Set([...c.sections, ...c.technologies.flatMap((t) => g.must(t).sections)])].map((id) => g.must(id).name);
    const latest = latestRound(c);
    const products = new Set([...c.drugs, ...(g.incoming(c.id).get("drug") ?? []).map((d) => d.id)]).size;
    return {
      id: c.id, name: c.name, tldr: c.tldr, route: routeFor(c), logo: logoSrc(c.id, c.website), avatar: "org",
      sub: `${c.hq}, ${c.country}${c.founded ? ` · founded ${c.founded}` : ""}`,
      facets: {
        stage: stageLabel ? [stageLabel] : [],
        type: [COMPANY_TYPE_LABEL[c.companyType]],
        modality: [...techNames, ...fronts],
        cancers: c.cancers.map((id) => short(g.must(id).name)),
        yc: c.ycBatch ? [c.ycBatch] : [],
        investor: c.investors.map((id) => g.must(id).name),
        country: [c.country],
      },
      cols: {
        stage: fl("stage", stageLabel, stage ? { tip: STAGE_TIP[stage] } : undefined),
        type: fl("type", COMPANY_TYPE_LABEL[c.companyType]),
        yc: fl("yc", c.ycBatch, c.ycBatch ? { tip: `Y Combinator, ${ycBatchLabel(c.ycBatch)} batch. Click to see the whole batch.` } : undefined),
        investors: c.investors.map(link),
        round: latest ? `${latest.round} ${latest.year}${fmtUsd(latest.amountUsd) ? ` · ${fmtUsd(latest.amountUsd)}` : ""}` : undefined,
        cancers: c.cancers.map(link),
        country: fl("country", c.country),
        products: products || undefined,
      },
      sortKeys: { round: latest?.year ?? 0, products, yc: c.ycBatch ? ycBatchSortKey(c.ycBatch) : 0, investors: c.investors.length },
      tie: c.founded ?? 0,
    };
  });
  return {
    rows: out,
    facets: [
      { key: "stage", label: "Stage", searchable: false, width: "w-44", order: STAGE_ORDER.map((s) => STAGE_LABEL[s]) },
      { key: "modality", label: "Modality / technology", width: "w-56" },
      { key: "cancers", label: "Cancer", width: "w-48" },
      { key: "yc", label: "YC batch", searchable: false, width: "w-36" },
      { key: "investor", label: "Investor", width: "w-56" },
      { key: "country", label: "Country", searchable: false, width: "w-36" },
      { key: "type", label: "Type", searchable: false, width: "w-44" },
    ],
    columns: [
      { key: "stage", label: "Stage", sortable: true, tip: "Startup, growth stage, public, large private, acquired or wound down. Click a chip to filter." },
      { key: "type", label: "Type", sortable: true, hide: "hidden lg:table-cell" },
      { key: "yc", label: "YC", sortable: true, hide: "hidden sm:table-cell", tip: "Y Combinator batch, from the open YC directory." },
      { key: "round", label: "Latest round", sortable: true, hide: "hidden md:table-cell", tip: "Most recent financing round on record, with the amount only where the cited source states it." },
      { key: "investors", label: "Investors", hide: "hidden lg:table-cell" },
      { key: "cancers", label: "Cancers", hide: "hidden xl:table-cell" },
      { key: "products", label: "Products", sortable: true, numeric: true, hide: "hidden md:table-cell" },
    ],
  };
}

function StageStrip({ list }: { list: Company[] }) {
  const counts = new Map<Stage, number>();
  for (const c of list) { const s = stageOf(c); if (s) counts.set(s, (counts.get(s) ?? 0) + 1); }
  return (
    <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 mb-8">
      {STAGE_ORDER.map((s) => (
        <Link key={s} href={`/startups/?stage=${encodeURIComponent(STAGE_LABEL[s])}`} title={STAGE_TIP[s]} className="card p-3 flex items-center gap-3 hover:shadow-md transition">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent"><StageIcon stage={s} className="h-5 w-5" /></span>
          <span><span className="block text-sm font-medium leading-snug">{STAGE_LABEL[s]}</span><span className="block text-xs text-muted tabular-nums">{counts.get(s) ?? 0} companies</span></span>
        </Link>
      ))}
    </div>
  );
}

export default function Startups() {
  const g = graph();
  const list = startups();
  const yc = ycCompanies();
  const batches = [...new Set(yc.map((c) => c.ycBatch!))].sort((a, b) => ycBatchSortKey(b) - ycBatchSortKey(a));
  const active = mostActiveInvestors();
  const recent = recentlyFunded(24);
  const built = rows();
  const nInvestors = investors().length;
  const yearsWithRounds = new Set(list.flatMap((c) => c.funding.map((f) => f.year)));

  return (
    <>
      <PageHeader
        kicker={<GroupKicker id="who" />}
        title="Oncology startups"
        lede="Every young company in OnCo that is going after cancer: Y Combinator companies from the open YC directory, and venture-backed startups across therapeutics, diagnostics, AI drug discovery, digital care, radiotherapy hardware, surgery and imaging. Filter by stage, modality, cancer, YC batch, investor and country. Funding rounds are listed only where a press release, filing or trade report states them; investors are named on the startup, and each investor page derives its portfolio from those links."
        right={<div className="flex gap-2"><Link href="/investors/" className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium">Investors →</Link><Link href="/companies/" className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium">All companies</Link></div>}
      />
      <Container className="pb-16">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted mb-4">
          <span>{list.length} startups</span>
          <span aria-hidden>·</span>
          <span>{yc.length} from Y Combinator across {batches.length} batches</span>
          <span aria-hidden>·</span>
          <span>{nInvestors} investors, {active.length} with a portfolio here</span>
          <span aria-hidden>·</span>
          <span>{list.reduce((n, c) => n + c.funding.length, 0)} sourced rounds{yearsWithRounds.size ? ` (${Math.min(...yearsWithRounds)} to ${Math.max(...yearsWithRounds)})` : ""}</span>
        </div>

        <StageStrip list={list} />

        <section id="yc" className="mb-10">
          <div className="flex items-baseline justify-between gap-4 mb-2">
            <h2 className="text-lg font-semibold tracking-tight">YC oncology</h2>
            <a href="https://github.com/yc-oss/api" rel="noopener" className="text-xs text-muted underline">Source: open YC directory dataset</a>
          </div>
          <p className="text-sm text-muted max-w-3xl mb-3">Y Combinator companies whose stated work is cancer: detection, diagnostics, therapeutics, care delivery and the tools around them. Each one was checked against its YC profile and website. Click a batch to filter the table; the snapshot with every hit and how it was classified is in <code>src/data/universe-lists/yc-oncology.json</code>.</p>
          <div className="flex flex-wrap gap-1.5">
            {batches.map((b) => { const n = yc.filter((c) => c.ycBatch === b).length; return <Link key={b} href={`/startups/?yc=${encodeURIComponent(b)}`} className="inline-flex items-center gap-1 rounded-full border border-border bg-card px-2.5 py-1 text-xs hover:shadow-sm" title={`${ycBatchLabel(b)}: ${n} oncology ${n === 1 ? "company" : "companies"}`}><span className="font-medium">{b}</span><span className="text-muted tabular-nums">{n}</span></Link>; })}
          </div>
        </section>

        <EntityBrowser rows={built.rows} facets={built.facets} columns={built.columns} noun="startups" hideStatus defaultSort={{ key: "round", dir: -1 }} />

        <div className="grid gap-6 lg:grid-cols-2 mt-12">
          <section id="investors">
            <div className="flex items-baseline justify-between gap-4 mb-2">
              <h2 className="text-lg font-semibold tracking-tight">Most active investors</h2>
              <Link href="/investors/" className="text-xs text-muted underline">All investors</Link>
            </div>
            <p className="text-sm text-muted mb-3">Counted from the graph: the number of OnCo companies that name the investor. This measures presence in this corpus, not fund size.</p>
            <div className="overflow-x-auto card">
              <table className="onco text-sm">
                <thead><tr><th>#</th><th>Investor</th><th className="hidden sm:table-cell">Type</th><th className="text-right">Portfolio</th></tr></thead>
                <tbody>{active.slice(0, 25).map((r, i) => (
                  <tr key={r.investor.id}>
                    <td className="tabular-nums text-muted">{i + 1}</td>
                    <td><Link href={routeFor(r.investor)} className="font-medium hover:underline">{r.investor.name}</Link><div className="text-xs text-muted">{r.investor.hq}, {r.investor.country}</div></td>
                    <td className="hidden sm:table-cell text-xs text-muted">{r.investor.tags.includes("corporate-venture") ? "Corporate venture" : r.investor.tags.includes("foundation") ? "Foundation" : r.investor.tags.includes("accelerator") ? "Accelerator" : "Venture capital"}</td>
                    <td className="text-right tabular-nums"><Link href={`/startups/?investor=${encodeURIComponent(r.investor.name)}`} className="underline">{r.portfolio.length}</Link></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </section>

          <section id="recent">
            <div className="flex items-baseline justify-between gap-4 mb-2">
              <h2 className="text-lg font-semibold tracking-tight">Recently funded</h2>
              <span className="text-xs text-muted">Newest sourced rounds</span>
            </div>
            <p className="text-sm text-muted mb-3">Rounds with a public source, newest first. Amounts appear only where the source gives one.</p>
            <ul className="card divide-y divide-border">
              {recent.map(({ company, round }, i) => (
                <li key={`${company.id}-${i}`} className="flex items-baseline justify-between gap-3 px-4 py-2 text-sm">
                  <span><Link href={routeFor(company)} className="font-medium hover:underline">{company.name}</Link><span className="text-muted"> · {round.round}</span></span>
                  <span className="shrink-0 tabular-nums text-xs text-muted"><span className="text-foreground">{fmtUsd(round.amountUsd) ?? "undisclosed"}</span> · {round.year} · <a href={round.source} rel="noopener" className="underline">source</a></span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        <section id="browse" className="mt-12">
          <h2 className="text-lg font-semibold tracking-tight mb-2">Browse by company type</h2>
          <div className="flex flex-wrap gap-1.5 text-sm">
            {(Object.keys(COMPANY_TYPE_LABEL) as Array<keyof typeof COMPANY_TYPE_LABEL>).map((t) => { const n = g.kind("company").filter((c) => c.companyType === t).length; return n ? <Link key={t} href={`/companies/?type=${encodeURIComponent(COMPANY_TYPE_LABEL[t])}`} className="rounded-full border border-border bg-card px-3 py-1 hover:shadow-sm">{COMPANY_TYPE_LABEL[t]} <span className="text-muted tabular-nums">{n}</span></Link> : null; })}
            {STAGE_ORDER.map((s) => <Link key={s} href={`/companies/?stage=${encodeURIComponent(STAGE_LABEL[s])}`} className="rounded-full border border-dashed border-border bg-card px-3 py-1 hover:shadow-sm">{STAGE_LABEL[s]}</Link>)}
          </div>
          <p className="text-xs text-muted mt-3 max-w-3xl">Method. A company is on this page when its stage is startup or growth, when it has a Y Combinator batch, or when it was bought or wound down after being venture-backed. Chinese and Indian companies are covered in their own passes and are not repeated here. Suggest a missing company or a correction through the edit link on any record.</p>
        </section>
      </Container>
    </>
  );
}

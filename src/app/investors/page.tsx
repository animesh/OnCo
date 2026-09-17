import type { Metadata } from "next";
import Link from "next/link";
import { pageMeta } from "@/lib/seo";
import { graph } from "@/lib/graph";
import { routeFor } from "@/lib/schema";
import { Container, GroupKicker, PageHeader } from "@/components/ui";
import { EntityBrowser, type BrowserRow, type ColDef, type FacetDef, type FacetLink, type LinkItem } from "@/components/EntityBrowser";
import { logoSrc } from "@/lib/logos";
import { investors, portfolioOf, STAGE_LABEL, stageOf } from "@/lib/startups";

export const metadata: Metadata = pageMeta({
  title: "Oncology investors",
  description: "The venture funds, corporate venture arms, accelerators and disease foundations that finance companies attacking cancer, each with the portfolio companies in OnCo that name them.",
  path: "/investors/",
});

const KIND_LABEL: Record<string, string> = { "corporate-venture": "Corporate venture", foundation: "Foundation", accelerator: "Accelerator", "public-fund": "Public fund", vc: "Venture capital" };
const kindOf = (tags: string[]) => tags.find((t) => t in KIND_LABEL) ?? "vc";

export default function Investors() {
  const g = graph();
  const list = investors();
  const fl = (facet: string, value: string | undefined): FacetLink | undefined => (value ? { facet, value } : undefined);
  const rows: BrowserRow[] = list.map((inv) => {
    const portfolio = portfolioOf(inv.id);
    const stages = [...new Set(portfolio.map((c) => stageOf(c)).filter((s): s is NonNullable<typeof s> => !!s).map((s) => STAGE_LABEL[s]))];
    const fronts = [...new Set(portfolio.flatMap((c) => c.sections).map((id) => g.must(id).name))];
    const cancers = [...new Set(portfolio.flatMap((c) => c.cancers).map((id) => g.must(id).name))];
    const items: LinkItem[] = portfolio.slice(0, 8).map((c) => ({ label: c.name.replace(/ \(.*\)$/, ""), href: routeFor(c), tip: c.tldr }));
    return {
      id: inv.id, name: inv.name, tldr: inv.tldr, route: routeFor(inv), logo: logoSrc(inv.id, inv.website), avatar: "org", sub: `${inv.hq}, ${inv.country}`,
      facets: { kind: [KIND_LABEL[kindOf(inv.tags)]], country: [inv.country], front: fronts, cancers, stage: stages },
      cols: { kind: fl("kind", KIND_LABEL[kindOf(inv.tags)]), country: fl("country", inv.country), portfolio: portfolio.length ? [{ label: String(portfolio.length), href: `${routeFor(inv)}#portfolio`, tip: `See the ${portfolio.length} portfolio ${portfolio.length === 1 ? "company" : "companies"} in OnCo.` }] : 0, companies: portfolio.length > 8 ? [...items, { label: `+${portfolio.length - 8} more`, href: `${routeFor(inv)}#portfolio` }] : items, founded: inv.founded },
      sortKeys: { portfolio: portfolio.length, founded: inv.founded ?? 0 },
    };
  });
  const facets: FacetDef[] = [
    { key: "kind", label: "Kind of investor", searchable: false, width: "w-48" },
    { key: "country", label: "Country", searchable: false, width: "w-36" },
    { key: "front", label: "Portfolio front", width: "w-48" },
    { key: "cancers", label: "Portfolio cancer", width: "w-48" },
    { key: "stage", label: "Portfolio stage", searchable: false, width: "w-44" },
  ];
  const columns: ColDef[] = [
    { key: "kind", label: "Kind", sortable: true, hide: "hidden sm:table-cell" },
    { key: "country", label: "Country", sortable: true, hide: "hidden lg:table-cell" },
    { key: "portfolio", label: "Portfolio", sortable: true, numeric: true, tip: "Companies in OnCo that name this investor. Presence in the corpus, not fund size." },
    { key: "companies", label: "Companies", hide: "hidden md:table-cell" },
    { key: "founded", label: "Founded", sortable: true, numeric: true, hide: "hidden xl:table-cell" },
  ];
  const withPortfolio = rows.filter((r) => (r.sortKeys?.portfolio ?? 0) > 0).length;

  return (
    <>
      <PageHeader
        kicker={<GroupKicker id="who" />}
        title="Oncology investors"
        lede="Who finances the companies attacking cancer: venture funds that lead oncology rounds, the venture arms of large pharma, Y Combinator, and the disease foundations that invest rather than grant. Each record has a plain-English summary and a portfolio derived from the startups that name it, so the list grows as startup records do."
        right={<div className="flex gap-2"><Link href="/startups/" className="rounded-lg bg-accent text-white px-4 py-2 text-sm font-medium">Startups →</Link><Link href="/companies/?type=Investor" className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium">In the companies table</Link></div>}
      />
      <Container className="pb-16">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted mb-4">
          <span>{list.length} investors</span>
          <span aria-hidden>·</span>
          <span>{withPortfolio} with at least one portfolio company in OnCo</span>
          <span aria-hidden>·</span>
          <span>Portfolio links are declared on the startup record and derived here.</span>
        </div>
        <EntityBrowser rows={rows} facets={facets} columns={columns} noun="investors" hideStatus defaultSort={{ key: "portfolio", dir: -1 }} />
        <p className="text-xs text-muted mt-3 max-w-3xl">Method. An investor is listed when it has led or joined a disclosed oncology round, runs a dedicated oncology programme, or is a disease foundation with a venture arm. The portfolio count is the number of OnCo company records that name the investor in their `investors` field; it undercounts every fund and says nothing about cheque size or ownership. Corrections through the edit link on any record.</p>
      </Container>
    </>
  );
}

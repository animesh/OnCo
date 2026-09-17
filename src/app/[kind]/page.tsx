import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { graph } from "@/lib/graph";
import { KIND_META, KINDS, routeFor, type Kind } from "@/lib/schema";
import { Container, PageHeader } from "@/components/ui";
import { rankInstitutions } from "@/lib/ranking";
import { EntityBrowser } from "@/components/EntityBrowser";
import { FrontSchematic } from "@/components/FrontSchematic";
import { BottleneckMap } from "@/components/BottleneckMap";
import { CancerIcon } from "@/components/CancerIcon";
import { FrontIcon } from "@/components/FrontIcon";
import { termMarks } from "@/lib/term-hover";
import { TermSchematic } from "@/components/TermSchematic";
import { logoSrc } from "@/lib/logos";
import { kindTitle, pageMeta } from "@/lib/seo";
import { KindName } from "@/components/T";
import { buildBrowser, cap } from "@/lib/kind-browser";

const ROUTE_TO_KIND: Record<string, Kind> = Object.fromEntries(KINDS.map((k) => [KIND_META[k].route, k])) as Record<string, Kind>;

export function generateStaticParams() {
  return KINDS.map((k) => ({ kind: KIND_META[k].route }));
}

/** Index page title is the public kind name ("Treatments & tests", "Cancers"); the description is the KIND_META blurb with the live count. */
export async function generateMetadata({ params }: { params: Promise<{ kind: string }> }): Promise<Metadata> {
  const { kind } = await params;
  const k = ROUTE_TO_KIND[kind];
  if (!k) return {};
  const meta = KIND_META[k];
  const n = graph().kind(k).length;
  return pageMeta({ title: kindTitle(k), description: `${meta.blurb} ${n} ${meta.plural}, each with a plain-English TL;DR and sources.`, path: `/${meta.route}/` });
}

export default async function KindIndex({ params }: { params: Promise<{ kind: string }> }) {
  const { kind } = await params;
  const k = ROUTE_TO_KIND[kind];
  if (!k) notFound();
  const meta = KIND_META[k];
  const title = k === "section" ? "Fronts of the war on cancer" : k === "term" ? "Glossary" : k === "bottleneck" ? "Bottlenecks of the war on cancer" : (meta.title ?? cap(meta.plural));
  const built = buildBrowser(k);
  // Glossary tooltips inside free-text cells: any non-chip, non-numeric string column gets its technical terms marked.
  const richKeys = new Set(built.columns.filter((c) => !c.chip && !c.numeric).map((c) => c.key));
  const rows = built.rows.map((r) => { const cols = { ...r.cols }; for (const key of richKeys) { const v = cols[key]; if (typeof v === "string" && v.length > 3) { const marks = termMarks(v); if (marks.length) cols[key] = { text: v, marks }; } } return { ...r, cols }; });
  const { facets, columns, hideStatus, hideTldr, defaultSort } = built;

  const right = k === "cancer" ? <Link href="/for-me/" className="rounded-lg bg-accent text-white px-4 py-2 text-sm font-medium">Pick mine →</Link>
    : k === "drug" ? <Link href="/explore/?kind=drug" className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium">Rank by cancer type →</Link>
    : k === "institution" ? <Link href="/universities/" className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium">University output →</Link>
    : k === "bottleneck" ? <Link href="/ideas/" className="rounded-lg bg-accent text-white px-4 py-2 text-sm font-medium">All ideas →</Link>
    : undefined;

  return (
    <>
      <PageHeader kicker={<span className="kicker"><KindName kind={k} form="plural" fallback={meta.plural} /></span>} title={<KindName kind={k} form="title" fallback={title} />} seed={title} lede={meta.blurb} right={right} />
      <Container className="pb-16">
        {k === "section" && <FrontsGrid />}
        {k === "bottleneck" && <BottlenecksPipeline />}
        {k === "cancer" && <CancersGrid />}
        {k === "term" && <GlossaryCategories />}
        <EntityBrowser rows={rows} facets={facets} columns={columns} noun={meta.plural} hideStatus={hideStatus} hideTldr={hideTldr} defaultSort={defaultSort} />
        {k === "institution" && (
          <p className="text-xs text-muted mt-3 max-w-3xl">Score = Newsweek points (60 − Newsweek/Statista 2026 Oncology rank, 0 if unranked) + NCI designation points (Comprehensive 15, Clinical or Basic 8) + 2 × distinct OnCo objects linked to the institution. The last term measures presence in this evidence base and grows with the corpus. A starting point for argument, not a verdict.</p>
        )}
      </Container>
    </>
  );
}

/** One clickable card per glossary category, each with its animated schematic; clicking filters the table below. */
function GlossaryCategories() {
  const g = graph();
  const counts = new Map<string, number>();
  for (const t of g.kind("term")) counts.set(t.category, (counts.get(t.category) ?? 0) + 1);
  const cats = [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  return (
    <div className="mb-8">
      <div className="kicker mb-1">Browse by category</div>
      <p className="text-sm text-muted mb-3">Twenty kinds of term, each with a short animation of what that kind is about. Click one to filter the glossary; every term page opens with its own picture.</p>
      <ul className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        {cats.map(([c, n]) => (
          <li key={c} className="min-w-0">
            <Link href={`/terms/?category=${encodeURIComponent(c)}`} className="card flex h-full flex-col overflow-hidden hover:shadow-md transition">
              <div className="h-24 shrink-0"><TermSchematic category={c} compact height="h-24" /></div>
              <div className="px-3 py-2 flex items-baseline justify-between gap-2 min-w-0"><span className="text-sm font-medium truncate" title={c}>{c}</span><span className="text-xs text-muted tabular-nums shrink-0">{n}</span></div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Every cancer as an icon tile, grouped, so a newcomer can find theirs by organ rather than by name. */
function CancersGrid() {
  const g = graph();
  const items = g.kind("cancer");
  const groups = [...new Set(items.map((c) => c.group))];
  return (
    <div className="mb-10 space-y-5">
      {groups.map((grp) => (
        <div key={grp}>
          <div className="kicker mb-2 capitalize">{grp}</div>
          <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8">
            {items.filter((c) => c.group === grp).sort((a, b) => a.name.localeCompare(b.name)).map((c) => (
              <Link key={c.id} href={routeFor(c)} title={c.tldr} className="card p-3 flex flex-col items-center text-center gap-2 hover:shadow-md transition">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-accent-soft text-accent"><CancerIcon cancerId={c.id} className="h-8 w-8" /></span>
                <span className="text-xs font-medium leading-snug">{c.name}</span>
              </Link>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function BottlenecksPipeline() {
  const g = graph();
  const items = g.kind("bottleneck").map((b) => ({ id: b.id, name: b.name, tldr: b.tldr, route: routeFor(b), stage: b.stage, severity: b.severity, ideas: (g.incoming(b.id).get("idea") ?? []).length }));
  return <BottleneckMap items={items} />;
}

function FrontsGrid() {
  const g = graph();
  const items = g.kind("section").sort((a, b) => a.order - b.order);
  return (
    <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 mb-8">
      {items.map((s) => (
        <Link key={s.id} href={routeFor(s)} className="card overflow-hidden hover:shadow-md transition">
          <FrontSchematic sectionId={s.id} compact height="h-28" />
          <div className="px-3 py-2 text-sm font-medium leading-snug flex items-center gap-1.5"><FrontIcon id={s.id} className="h-4 w-4 text-accent shrink-0" />{s.name}</div>
        </Link>
      ))}
    </div>
  );
}

/** Map dots for the institutions explorer; `type` uses the same label as the table's "type" facet so the legend can drive both. */
function institutionPoints() {
  return rankInstitutions().map((r) => {
    const i = r.institution;
    return { id: i.id, name: i.name, city: i.city, country: i.country, type: cap(i.institutionType.replace("-", " ")), lat: i.lat, lon: i.lng, route: routeFor(i), logo: logoSrc(i.id, i.website), avatar: "org", links: r.links };
  });
}


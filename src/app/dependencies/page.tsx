import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { pageMeta } from "@/lib/seo";
import { graph } from "@/lib/graph";
import { routeFor } from "@/lib/schema";
import { buildDag, edgesFromDependsOn, hints, layout, subgraph } from "@/lib/dag";
import { Container, GroupKicker, PageHeader } from "@/components/ui";
import { DagViewer, type DagNodeData, type DagViewData } from "@/components/DagViewer";
import { FrontIcon } from "@/components/FrontIcon";

export const metadata: Metadata = pageMeta({
  title: "Technology dependency map",
  description: "What each oncology technology needs to exist, drawn as a layered dependency graph: CAR-T needs apheresis, viral vectors and cryopreservation; radioligand therapy needs isotopes, radiopharmacies and dosimetry. Chokepoints and single-vendor steps flagged.",
  path: "/dependencies/",
});

/** Monoline glyphs for the section headings, same grammar as RouteIcon (24x24, 1.5px stroke). */
const GLYPH = {
  map: "M4 6h4v4H4zM4 14h4v4H4zM16 10h4v4h-4zM8 8l8 4M8 16l8-4",
  chain: "M4 4h5v5H4zM15 15h5v5h-5zM9 6.5h3.5A3 3 0 0 1 15.5 9.5v2M15 17.5h-3.5A3 3 0 0 1 8.5 14.5V12",
  choke: "M12 3 3 20h18L12 3Zm0 6v5m0 3v1",
  vendor: "M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm-1 5.5 1.5-1V16",
  loop: "M20 12a8 8 0 1 1-2.3-5.7M20 4v4h-4",
  book: "M4 5.5A2.5 2.5 0 0 1 6.5 3H20v15H6.5A2.5 2.5 0 0 0 4 20.5V5.5Zm0 15A2.5 2.5 0 0 1 6.5 18H20M8 7h8M8 10.5h6",
} as const;

function Glyph({ d, className = "h-4 w-4" }: { d: string; className?: string }) {
  return <svg viewBox="0 0 24 24" aria-hidden focusable="false" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" className={className}><path d={d} /></svg>;
}

function Section({ id, icon, title, count, children }: { id: string; icon: string; title: string; count?: number; children: ReactNode }) {
  return (
    <section id={id} className="mt-10">
      <h2 className="text-lg font-semibold tracking-tight leading-snug flex items-center gap-2 mb-3">
        <span className="inline-flex text-accent"><Glyph d={icon} className="h-5 w-5" /></span>
        {title}
        {count !== undefined && <span className="chip bg-foreground/5 text-xs font-normal">{count.toLocaleString("en-GB")}</span>}
      </h2>
      {children}
    </section>
  );
}

export default function DependenciesPage() {
  const g = graph();
  const techs = g.kind("technology");
  const deps: Array<[string, readonly string[]]> = techs.filter((t) => t.dependsOn.length).map((t) => [t.id, t.dependsOn]);
  const dag = buildDag([], edgesFromDependsOn(deps));
  const lay = layout(dag);
  const perRoot: Record<string, string[][]> = Object.fromEntries(dag.nodes.map((id) => [id, layout(subgraph(dag, id)).layers]));

  // Vendors: companies that list the technology, or that the technology lists.
  const vendors = new Map<string, number>();
  for (const id of dag.nodes) {
    const t = g.get(id);
    const set = new Set<string>(t?.companies ?? []);
    for (const c of g.incoming(id).get("company") ?? []) set.add(c.id);
    vendors.set(id, set.size);
  }
  const h = hints(dag, vendors);

  const nodes: DagNodeData[] = dag.nodes.map((id) => {
    const t = g.must(id);
    return {
      id, name: t.name, section: t.sections[0] ?? "", status: t.status, route: routeFor(t), tldr: t.tldr, vendors: vendors.get(id) ?? 0,
      up: dag.up.get(id) ?? [], down: dag.down.get(id) ?? [],
    };
  });
  const data: DagViewData = {
    nodes, edges: dag.edges.map((e) => [e.from, e.to] as [string, string]), whole: lay.layers, perRoot,
    criticalPath: h.criticalPath, chokepoints: h.chokepoints, singleVendor: h.singleVendor, cycles: lay.cycles,
  };

  const name = (id: string) => g.get(id)?.name ?? id;
  const tile = (id: string, extra?: ReactNode) => {
    const t = g.get(id);
    if (!t) return null;
    return (
      <Link key={id} href={`/dependencies/?root=${id}`} className="card p-3 flex items-start gap-3 hover:shadow-md transition">
        <span className="inline-flex shrink-0 text-accent mt-0.5"><FrontIcon id={t.sections[0] ?? ""} className="h-5 w-5" /></span>
        <span className="min-w-0">
          <span className="block font-medium leading-snug">{t.name}</span>
          <span className="block text-xs text-muted mt-0.5">{extra}</span>
        </span>
      </Link>
    );
  };
  const roots = dag.nodes.filter((id) => (dag.up.get(id) ?? []).length === 0).length;
  const leaves = dag.nodes.filter((id) => (dag.down.get(id) ?? []).length === 0).length;
  const mostNeeded = [...dag.nodes].sort((a, b) => (dag.down.get(b)?.length ?? 0) - (dag.down.get(a)?.length ?? 0) || a.localeCompare(b)).slice(0, 8);

  return (
    <>
      <PageHeader kicker={<GroupKicker id="map" />} title="Technology dependency map"
        lede={`${dag.nodes.length} technologies joined by ${dag.edges.length} recorded dependencies in ${lay.layers.length} layers. ${roots} foundations need nothing else in the corpus; ${leaves} end products are needed by nothing further. Pick a root to see what one technology cannot exist without, and what stops if it fails.`} />
      <Container className="pb-16">
        <DagViewer data={data} />

        <Section id="chokepoints" icon={GLYPH.choke} title="Chokepoints" count={h.chokepoints.length}>
          <p className="text-sm text-muted mb-3 max-w-3xl">A chokepoint is a step whose removal splits the map: technologies downstream lose their only route to the foundations. These are where a recall, a plant fire or an export control does the most damage.</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {h.chokepoints.map((id) => tile(id, <>{(dag.down.get(id) ?? []).length} direct dependents · {vendors.get(id) ?? 0} vendor{vendors.get(id) === 1 ? "" : "s"}</>))}
          </div>
        </Section>

        <Section id="single-vendor" icon={GLYPH.vendor} title="Single-vendor steps" count={h.singleVendor.length}>
          <p className="text-sm text-muted mb-3 max-w-3xl">Steps with exactly one vendor company in the corpus. Some are genuinely sole-source; others just need more companies recorded, so treat this as a list to check rather than a verdict.</p>
          {h.singleVendor.length ? (
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {h.singleVendor.map((id) => { const c = [...(g.get(id)?.companies ?? []), ...(g.incoming(id).get("company") ?? []).map((x) => x.id)][0]; const co = c ? g.get(c) : undefined; return tile(id, co ? <>Only vendor: <Link className="underline" href={routeFor(co)}>{co.name}</Link></> : "One vendor"); })}
            </div>
          ) : <p className="text-sm text-muted">Every step on the map has either several vendors or none recorded.</p>}
        </Section>

        <Section id="longest-chain" icon={GLYPH.chain} title="Longest chain" count={h.criticalPath.length}>
          <p className="text-sm text-muted mb-3 max-w-3xl">The deepest dependency chain in the corpus, foundations first. Every step must hold for the last technology to be delivered.</p>
          <ol className="flex flex-wrap items-center gap-1.5 text-sm">
            {h.criticalPath.map((id, i) => (
              <li key={id} className="flex items-center gap-1.5">
                <Link href={`/dependencies/?root=${id}`} className="chip border bg-card border-border hover:bg-foreground/5">{name(id)}</Link>
                {i < h.criticalPath.length - 1 && <span aria-hidden className="text-muted">→</span>}
              </li>
            ))}
          </ol>
        </Section>

        <Section id="most-needed" icon={GLYPH.map} title="Most relied upon" count={mostNeeded.length}>
          <p className="text-sm text-muted mb-3 max-w-3xl">Technologies with the most direct dependents. Improving one of these lifts everything to its right on the map.</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {mostNeeded.map((id) => tile(id, <>{(dag.down.get(id) ?? []).length} direct dependents</>))}
          </div>
        </Section>

        {lay.cycles.length > 0 && (
          <Section id="cycles" icon={GLYPH.loop} title="Cycles to fix" count={lay.cycles.length}>
            <p className="text-sm text-muted mb-3 max-w-3xl">A dependency loop was recorded. The map drops one edge from each loop to draw it, but the data should be corrected in <code className="text-xs">dependsOn</code>.</p>
            <ul className="text-sm space-y-1">{lay.cycles.map((c) => <li key={c.join(">")}>{c.map(name).join(" → ")} → {name(c[0])}</li>)}</ul>
          </Section>
        )}

        <Section id="method" icon={GLYPH.book} title="How the map is built">
          <div className="grid gap-6 md:grid-cols-2 text-sm">
            <div className="card p-5 space-y-2">
              <h3 className="font-semibold text-base">Layers and ordering</h3>
              <p>Each technology record can name the technologies it cannot be delivered without (<code className="text-xs">dependsOn</code> in <code className="text-xs">src/data</code>). A node sits one layer to the right of its deepest dependency (longest-path layering), and within a layer nodes are ordered by a few barycentre sweeps so arrows cross as little as possible.</p>
              <p>Only true, uncontroversial requirements are recorded: manufacturing steps, instruments, software and upstream methods. &ldquo;Often used with&rdquo; is not a dependency; that lives in <Link className="underline" href="/pairings/">pairings</Link> and related links.</p>
            </div>
            <div className="card p-5 space-y-2">
              <h3 className="font-semibold text-base">Hints and gaps</h3>
              <p>Chokepoints are articulation points of the map that something depends on; the longest chain is the deepest path; single-vendor steps count the companies linked to each technology in the corpus. Each is a prompt to look closer, not a judgement.</p>
              <p>Missing a dependency? Add the id to the technology&apos;s <code className="text-xs">dependsOn</code> array, run <code className="text-xs">npm run validate</code>, and it appears here and on both technology pages. Every technology page also shows its own &ldquo;Depends on&rdquo; and &ldquo;Needed by&rdquo; strips. The wider <Link className="underline" href="/graph/">graph explorer</Link> shows every other kind of link.</p>
            </div>
          </div>
        </Section>
      </Container>
    </>
  );
}

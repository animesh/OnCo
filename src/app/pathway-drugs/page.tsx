import type { Metadata } from "next";
import Link from "next/link";
import { pageMeta } from "@/lib/seo";
import { graph } from "@/lib/graph";
import { routeFor } from "@/lib/schema";
import { pathwayView, type PathwayProduct } from "@/lib/pathway-products";
import { STATUS_LABEL, statusClass } from "@/lib/text";
import { Container, GroupKicker, PageHeader } from "@/components/ui";
import { Tip } from "@/components/Tip";

export const metadata: Metadata = pageMeta({ title: "Pathway-to-drug matrix", description: "For every signalling pathway, which nodes have a drug in the corpus, at what phase, and which druggable nodes have none: the inverse of the pathway diagrams.", path: "/pathway-drugs/" });

const ORDER = ["approved", "standard-of-care", "phase-3", "positive", "phase-2", "phase-1", "preclinical", "concept"];
/** Deep link into the treatments table filtered to these targets (any of) and, optionally, one phase or status. */
const short = (s: string) => s.replace(/ \(.*\)$/, "");
const drugsFor = (targetNames: string[], status?: string) => {
  const q = new URLSearchParams(); for (const t of targetNames) q.append("targets", short(t)); if (status) q.set("status", status);
  return `/drugs/?${q.toString()}`;
};
const best = (ps: PathwayProduct[]) => ps.map((p) => ORDER.indexOf(p.status ?? "")).filter((i) => i >= 0).sort((a, b) => a - b)[0];

export default function PathwayDrugsPage() {
  const g = graph();
  const views = g.kind("pathway").map((p) => {
    const v = pathwayView(p);
    const byNode = new Map<string, PathwayProduct[]>();
    for (const pr of v.products) for (const n of pr.nodeIds) byNode.set(n, [...(byNode.get(n) ?? []), pr]);
    const druggable = v.nodes.filter((n) => n.targetId);
    const drugged = druggable.filter((n) => (byNode.get(n.id) ?? []).length > 0);
    const approvedNodes = druggable.filter((n) => (byNode.get(n.id) ?? []).some((x) => x.status === "approved" || x.status === "standard-of-care"));
    return { p, v, byNode, druggable, drugged, undrugged: druggable.filter((n) => !(byNode.get(n.id) ?? []).length), approvedNodes, untargeted: v.nodes.filter((n) => !n.targetId) };
  }).sort((a, b) => b.undrugged.length - a.undrugged.length || b.druggable.length - a.druggable.length || a.p.name.localeCompare(b.p.name));

  const totals = views.reduce((s, x) => ({ nodes: s.nodes + x.v.nodes.length, druggable: s.druggable + x.druggable.length, drugged: s.drugged + x.drugged.length, undrugged: s.undrugged + x.undrugged.length }), { nodes: 0, druggable: 0, drugged: 0, undrugged: 0 });

  return (
    <>
      <PageHeader kicker={<GroupKicker id="map" />} title="Pathway-to-drug matrix"
        lede={`The pathway diagrams light up per product; this table asks the inverse question. Across ${views.length} pathways and ${totals.nodes} nodes, ${totals.druggable} nodes name a target in the corpus, ${totals.drugged} of those have at least one product and ${totals.undrugged} have none. Pathways are sorted by how many druggable nodes still have no drug, which is where the design opportunities are.`} />
      <Container className="pb-16">
        <div className="card overflow-x-auto mb-8">
          <table className="onco">
            <thead><tr><th>Pathway</th><th className="text-right">Nodes</th><th className="text-right">With a target</th><th className="text-right">With a drug</th><th className="text-right">Approved drug</th><th className="text-right">Undrugged</th><th className="hidden md:table-cell">Undrugged nodes</th></tr></thead>
            <tbody>
              {views.map(({ p, v, druggable, drugged, undrugged, approvedNodes }) => (
                <tr key={p.id}>
                  <td><Link href={routeFor(p)} className="font-medium hover:underline">{p.name}</Link> <a href={`#${p.id}`} className="text-xs text-muted hover:text-accent ml-1" title="Jump to this pathway's node table">table ↓</a></td>
                  <td className="text-right tabular-nums"><Link href={routeFor(p)} className="hover:underline" title="Pathway page with the diagram">{v.nodes.length}</Link></td>
                  <td className="text-right tabular-nums"><a href={`#${p.id}`} className="hover:underline" title="Nodes with a target, in the table below">{druggable.length}</a></td>
                  <td className="text-right tabular-nums">{drugged.length ? <Link href={drugsFor(druggable.map((n) => n.targetName ?? n.label))} className="hover:underline text-accent" title="Open the treatments table filtered to this pathway's targets">{drugged.length}</Link> : <span className="text-muted">0</span>}</td>
                  <td className="text-right tabular-nums">{approvedNodes.length ? <Link href={drugsFor(approvedNodes.map((n) => n.targetName ?? n.label), "approved")} className="hover:underline text-accent" title="Approved treatments hitting this pathway">{approvedNodes.length}</Link> : <span className="text-muted">0</span>}</td>
                  <td className={`text-right tabular-nums font-semibold ${undrugged.length ? "text-rose-700 dark:text-rose-300" : "text-muted"}`}><a href={`#${p.id}`} className="hover:underline">{undrugged.length}</a></td>
                  <td className="hidden md:table-cell text-xs text-muted">{undrugged.map((n, i) => <span key={n.id}>{i > 0 && ", "}{n.href ? <Link href={n.href} className="hover:underline hover:text-accent">{n.label}</Link> : n.label}</span>)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted mb-6">
          <span className="kicker">Legend</span>
          {["approved", "phase-3", "phase-2", "phase-1", "preclinical"].map((s) => <Link key={s} href={`/drugs/?status=${s}`} className={`chip ${statusClass(s)} hover:ring-2 hover:ring-accent/30`} title={`All treatments at ${STATUS_LABEL[s]}`}>{STATUS_LABEL[s]}</Link>)}
          <Link href="/gaps/" className="chip border border-dashed border-rose-400 text-rose-700 dark:text-rose-300 hover:ring-2 hover:ring-accent/30" title="Gaps page: what is missing across the corpus">Druggable node, no drug</Link>
          <Link href="/targets/" className="chip bg-foreground/5 hover:ring-2 hover:ring-accent/30" title="All targets in the corpus">No target in corpus</Link>
        </div>

        <div className="space-y-10">
          {views.map(({ p, v, byNode }) => (
            <section key={p.id} id={p.id} className="scroll-mt-28">
              <header className="mb-3">
                <h2 className="text-xl font-semibold tracking-tight"><Link href={routeFor(p)} className="hover:underline">{p.name}</Link></h2>
                <p className="text-sm text-muted mt-1 max-w-3xl">{p.tldr}</p>
                {v.nodes.some((n) => n.targetId) && <p className="text-xs mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
                  <Link href={drugsFor(v.nodes.filter((n) => n.targetId).map((n) => n.targetName ?? n.label))} className="underline text-accent">Treatments hitting this pathway, as a filterable table</Link>
                  <Link href={routeFor(p)} className="underline text-muted hover:text-accent">Pathway page and diagram</Link>
                </p>}
              </header>
              <div className="card overflow-x-auto">
                <table className="onco">
                  <thead><tr><th>Node</th><th>Target</th><th>Products hitting the node</th><th className="hidden lg:table-cell">Best phase</th></tr></thead>
                  <tbody>
                    {[...v.nodes].sort((a, b) => (a.targetId ? 0 : 1) - (b.targetId ? 0 : 1) || ((best(byNode.get(a.id) ?? []) ?? 99) - (best(byNode.get(b.id) ?? []) ?? 99)) || a.label.localeCompare(b.label)).map((n) => {
                      const ps = (byNode.get(n.id) ?? []).slice().sort((a, b) => (ORDER.indexOf(a.status ?? "") + 1 || 99) - (ORDER.indexOf(b.status ?? "") + 1 || 99) || a.name.localeCompare(b.name));
                      const gap = !!n.targetId && ps.length === 0;
                      const b = best(ps);
                      return (
                        <tr key={n.id} className={gap ? "bg-rose-500/[0.04]" : undefined}>
                          <td className="font-medium whitespace-nowrap">{n.href ? <Link href={n.href} className="hover:underline">{n.label}</Link> : n.label}</td>
                          <td className="whitespace-nowrap">{n.href ? <Link href={n.href} className="hover:underline">{n.targetName}</Link> : <Link href="/targets/" className="chip bg-foreground/5 text-xs hover:ring-2 hover:ring-accent/30" title="No target record yet; browse all targets">no target in corpus</Link>}</td>
                          <td className="min-w-[260px]">
                            {gap ? <Link href={n.href ?? "/gaps/"} className="chip border border-dashed border-rose-400 text-rose-700 dark:text-rose-300 text-xs hover:ring-2 hover:ring-accent/30" title="Open the target page; no treatment in the corpus names it yet">Druggable node, no drug in corpus</Link>
                              : ps.length ? <div className="flex flex-wrap gap-1.5">{ps.map((x) => <Tip key={x.id} title={x.name} text={`${x.modality} · ${STATUS_LABEL[x.status ?? ""] ?? x.status ?? "status unknown"}`} href={x.route}><Link href={x.route} className={`chip ${statusClass(x.status)}`}>{x.name}</Link></Tip>)}</div>
                              : <span className="text-muted/50">-</span>}
                          </td>
                          <td className="hidden lg:table-cell text-xs">{b !== undefined ? <Link href={drugsFor([n.targetName ?? n.label], ORDER[b])} className={`chip ${statusClass(ORDER[b])} hover:ring-2 hover:ring-accent/30`} title={`Treatments for this target at ${STATUS_LABEL[ORDER[b]]}`}>{STATUS_LABEL[ORDER[b]]}</Link> : gap ? <span className="text-muted">none</span> : ""}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              {p.interventions.length > 0 && <p className="text-xs text-muted mt-2">How drugs attack it, from the pathway page: {p.interventions.join("; ")}.</p>}
            </section>
          ))}
        </div>
        <p className="text-xs text-muted mt-10 max-w-3xl">A node counts as drugged when a product in the corpus lists its target; a druggable node with no drug means no product in OnCo names that target, not that none exists anywhere. Nodes without a target id are pathway components (ligands, complexes, processes) that have no target page yet.</p>
      </Container>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { pageMeta } from "@/lib/seo";
import { graph } from "@/lib/graph";
import { routeFor, type Idea } from "@/lib/schema";
import { pathwayView } from "@/lib/pathway-products";
import { valueTone } from "@/lib/valueTone";
import { Container, GroupKicker, PageHeader } from "@/components/ui";
import { ValueIcon } from "@/components/ValueIcon";

export const metadata: Metadata = pageMeta({
  title: "Requests for startups",
  description: "Problems in the corpus with no company working on them: ideas that need an industry, engineering or data builder, druggable targets with no product, and bottlenecks with no market entrant. Each one links to its evidence and to the form for pitching a company.",
  path: "/startup-requests/",
});

const cap = (s: string) => s[0].toUpperCase() + s.slice(1).replace(/-/g, " ");
const MATURITY = ["being-tested-at-scale", "early-clinical", "preclinical-evidence", "speculative"];
const COST = ["small", "medium", "large"];
const COST_TIP: Record<string, string> = { small: "Under about one million dollars to try", medium: "One to fifty million dollars", large: "Over fifty million dollars" };

/** Ideas that name industry, engineering or data as the actor and have no company in the corpus attached: the seed list of a request for startups. */
function openIdeas(): Idea[] {
  const g = graph();
  return (g.kind("idea") as Idea[])
    .filter((i) => i.actor && ["industry", "engineering", "data"].includes(i.actor) && !i.companies.length && !(g.incoming(i.id).get("company") ?? []).length)
    .sort((a, b) => COST.indexOf(a.cost ?? "large") - COST.indexOf(b.cost ?? "large") || MATURITY.indexOf(a.maturity) - MATURITY.indexOf(b.maturity) || a.name.localeCompare(b.name));
}

export default function StartupRequestsPage() {
  const g = graph();
  const ideas = openIdeas();
  const byBottleneck = new Map<string, Idea[]>();
  for (const i of ideas) for (const b of i.bottlenecks.length ? i.bottlenecks : ["other"]) byBottleneck.set(b, [...(byBottleneck.get(b) ?? []), i]);
  const groups = [...byBottleneck.entries()].sort((a, b) => b[1].length - a[1].length);
  // Druggable nodes with no product in the corpus, across every pathway.
  const undrugged: Array<{ target: string; targetName: string; pathway: string; pathwayName: string; node: string }> = [];
  for (const p of g.kind("pathway")) {
    const v = pathwayView(p);
    const hit = new Set(v.products.flatMap((pr) => pr.nodeIds));
    for (const n of v.nodes) if (n.targetId && !hit.has(n.id)) undrugged.push({ target: n.targetId, targetName: n.targetName ?? n.label, pathway: p.id, pathwayName: p.name, node: n.label });
  }
  const undruggedByTarget = new Map<string, typeof undrugged>();
  for (const u of undrugged) undruggedByTarget.set(u.target, [...(undruggedByTarget.get(u.target) ?? []), u]);
  // Bottlenecks with the fewest companies attached.
  const bottlenecks = g.kind("bottleneck").map((b) => ({ b, companies: (g.incoming(b.id).get("company") ?? []).length, ideas: (g.incoming(b.id).get("idea") ?? []).length })).filter((x) => x.companies === 0).sort((a, b) => b.ideas - a.ideas);

  return (
    <>
      <PageHeader kicker={<GroupKicker id="who" />} title="Requests for startups"
        lede={`Where the corpus sees a problem and no company. ${ideas.length} ideas name industry, engineering or data as the actor and have no company in OnCo working on them; ${undruggedByTarget.size} druggable targets in the pathway maps have no product; ${bottlenecks.length} bottlenecks have no company attached. Each item links to its evidence. Absence from OnCo means no company here names the problem, not that none exists anywhere.`} />
      <Container className="pb-16 space-y-12">
        <section>
          <h2 className="text-xl font-semibold tracking-tight mb-1">Ideas that need a builder</h2>
          <p className="text-sm text-muted mb-4 max-w-3xl">Grouped by the bottleneck each idea attacks, cheapest to try first. Maturity and cost come from the idea record; open the idea for the hypothesis, the rationale and the experiment that would confirm or kill it.</p>
          <div className="space-y-8">
            {groups.map(([bid, list]) => {
              const b = bid === "other" ? null : g.get(bid);
              return (
                <div key={bid}>
                  <h3 className="font-semibold mb-2">{b ? <Link href={routeFor(b)} className="hover:underline">{b.name}</Link> : "Other problems"} <span className="text-muted text-sm font-normal">· {list.length} idea{list.length === 1 ? "" : "s"}</span></h3>
                  <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {list.map((i) => (
                      <li key={i.id} className="card p-4 flex flex-col gap-2">
                        <Link href={routeFor(i)} className="font-medium leading-snug hover:underline">{i.name}</Link>
                        <p className="text-sm text-muted leading-relaxed">{i.tldr}</p>
                        <div className="flex flex-wrap gap-1.5 text-xs mt-auto">
                          <Link href={`/ideas/?maturity=${encodeURIComponent(cap(i.maturity))}`} className={`chip inline-flex items-center gap-1 ${valueTone("maturity", cap(i.maturity)) ?? "bg-foreground/5"}`}><ValueIcon facet="maturity" value={cap(i.maturity)} />{cap(i.maturity)}</Link>
                          {i.cost && <Link href={`/ideas/?cost=${cap(i.cost)}`} title={COST_TIP[i.cost]} className={`chip inline-flex items-center gap-1 ${valueTone("cost", cap(i.cost)) ?? "bg-foreground/5"}`}><ValueIcon facet="cost" value={cap(i.cost)} />{cap(i.cost)} cost</Link>}
                          {i.actor && <Link href={`/ideas/?actor=${cap(i.actor)}`} className={`chip inline-flex items-center gap-1 ${valueTone("actor", cap(i.actor)) ?? "bg-foreground/5"}`}><ValueIcon facet="actor" value={cap(i.actor)} />{cap(i.actor)}</Link>}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        <section>
          <h2 className="text-xl font-semibold tracking-tight mb-1">Druggable targets with no product</h2>
          <p className="text-sm text-muted mb-4 max-w-3xl">Nodes in the pathway maps that name a target in the corpus but that no treatment or test here hits. Some are genuinely undrugged; others have compounds outside OnCo. Each target page carries the biology and the reasons it is or is not tractable.</p>
          <div className="card overflow-x-auto">
            <table className="onco">
              <thead><tr><th>Target</th><th>Pathways where it sits</th><th className="text-right">Nodes</th></tr></thead>
              <tbody>
                {[...undruggedByTarget.entries()].sort((a, b) => b[1].length - a[1].length || a[1][0].targetName.localeCompare(b[1][0].targetName)).map(([tid, list]) => {
                  const t = g.get(tid);
                  return (
                    <tr key={tid}>
                      <td className="font-medium whitespace-nowrap">{t ? <Link href={routeFor(t)} className="hover:underline">{list[0].targetName}</Link> : list[0].targetName}</td>
                      <td className="text-sm">{[...new Map(list.map((u) => [u.pathway, u])).values()].map((u, k) => { const p = g.get(u.pathway); return <span key={u.pathway}>{k > 0 && ", "}{p ? <Link href={routeFor(p)} className="hover:underline">{u.pathwayName}</Link> : u.pathwayName}</span>; })}</td>
                      <td className="text-right tabular-nums">{list.length}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-muted mt-2"><Link href="/pathway-drugs/" className="underline">The full pathway-to-drug matrix</Link> shows every node, drugged or not, with phases.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold tracking-tight mb-1">Bottlenecks with no company attached</h2>
          <p className="text-sm text-muted mb-4 max-w-3xl">The war-on-cancer bottlenecks that no company in the corpus lists as its problem, ordered by how many ideas they have attracted. A crowded ideas list and an empty company list is the clearest signal of an open market.</p>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {bottlenecks.map(({ b, ideas: n }) => (
              <li key={b.id} className="card p-4">
                <Link href={routeFor(b)} className="font-medium leading-snug hover:underline">{b.name}</Link>
                <p className="text-sm text-muted mt-1 leading-relaxed">{b.tldr}</p>
                <div className="text-xs text-muted mt-2"><Link href={`/ideas/?bottleneck=${encodeURIComponent(b.name.replace(/ \(.*\)$/, ""))}`} className="underline hover:text-accent">{n} idea{n === 1 ? "" : "s"}</Link> · 0 companies</div>
              </li>
            ))}
          </ul>
        </section>

        <section className="card p-5">
          <h2 className="text-lg font-semibold tracking-tight">Building one of these?</h2>
          <p className="text-sm text-muted mt-1 max-w-3xl">Tell us and the idea&apos;s page will name your company. Use the suggest-an-edit form on the idea, target or bottleneck page, name the company, its website and one source, and it enters the review queue like every other change. Companies already in OnCo are listed under <Link href="/startups/" className="underline">Startups</Link> and <Link href="/investors/" className="underline">Investors</Link>.</p>
          <div className="mt-3 flex flex-wrap gap-2 text-sm"><Link href="/suggest/" className="btn">How to suggest an edit</Link><Link href="/bottlenecks/" className="chip border border-border bg-card hover:bg-foreground/5">All bottlenecks</Link><Link href="/ideas/?actor=Industry" className="chip border border-border bg-card hover:bg-foreground/5">All industry ideas</Link></div>
        </section>
      </Container>
    </>
  );
}

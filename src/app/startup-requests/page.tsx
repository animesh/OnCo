import type { Metadata } from "next";
import Link from "next/link";
import { pageMeta } from "@/lib/seo";
import { graph } from "@/lib/graph";
import { routeFor, type Idea } from "@/lib/schema";
import { pathwayView } from "@/lib/pathway-products";
import { valueTone } from "@/lib/valueTone";
import { Container, GroupKicker, PageHeader } from "@/components/ui";
import { StartupRequestBoard, type RequestCard } from "@/components/StartupRequestBoard";
import { COST_TEXT, DIMENSIONS, GLOBOCAN_SOURCE_LABEL, scoreStartupRequests, TYPE_LABEL, type SolutionType } from "@/lib/startup-score";

export const metadata: Metadata = pageMeta({
  title: "Requests for startups",
  description: "Problems in the corpus with no company working on them, ranked by patient urgency and commerciality with every input cited: ideas that need an industry, engineering or data builder, druggable targets with no product, and bottlenecks with no market entrant.",
  path: "/startup-requests/",
});

const cap = (s: string) => s[0].toUpperCase() + s.slice(1).replace(/-/g, " ");

/** Ranked cards for the client board: plain data only, every link resolved here. */
function requestCards(): { cards: RequestCard[]; ideas: Idea[] } {
  const g = graph();
  const rows = scoreStartupRequests(g);
  const chip = (facet: "maturity" | "cost" | "actor", value: string, title?: string) => ({ label: facet === "cost" ? `${cap(value)} cost` : cap(value), href: `/ideas/?${facet}=${encodeURIComponent(cap(value))}`, className: valueTone(facet, cap(value)) ?? "bg-foreground/5", title });
  const cards = rows.map((r): RequestCard => {
    const i = r.input.idea;
    return {
      id: i.id, name: i.name, tldr: i.tldr, href: routeFor(i),
      chips: [chip("maturity", i.maturity), ...(i.cost ? [chip("cost", i.cost, COST_TEXT[i.cost])] : []), ...(i.actor ? [chip("actor", i.actor)] : [])],
      type: r.input.type, typeLabel: r.input.type ? TYPE_LABEL[r.input.type] : "Type not scored", cost: r.input.cost, namesCancer: i.cancers.length > 0,
      bottlenecks: i.bottlenecks.map((b) => g.get(b)).filter((b): b is NonNullable<typeof b> => !!b).map((b) => ({ name: b.name, href: routeFor(b) })),
      urgency: r.urgency.score, commerciality: r.commerciality.score, composite: r.composite,
      scored: r.urgency.scored + r.commerciality.scored, total: r.urgency.total + r.commerciality.total,
      dims: r.dimensions.map((d) => ({ key: d.key, axis: d.axis, label: d.label, weight: d.weight, rawText: d.rawText, score: d.score, note: d.note, sources: d.sources })),
    };
  });
  return { cards, ideas: rows.map((r) => r.input.idea) };
}

export default function StartupRequestsPage() {
  const g = graph();
  const { cards, ideas } = requestCards();
  const routeOptions = [...(Object.keys(TYPE_LABEL) as SolutionType[]).filter((t) => cards.some((c) => c.type === t)).map((t) => ({ value: t, label: TYPE_LABEL[t] })), ...(cards.some((c) => !c.type) ? [{ value: "none", label: "Type not scored" }] : [])];
  const capitalOptions = (["small", "medium", "large"] as const).filter((c) => cards.some((x) => x.cost === c)).map((c) => ({ value: c, label: COST_TEXT[c] }));
  const namesCancer = cards.filter((c) => c.namesCancer).length;
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
        lede={`Where the corpus sees a problem and no company. ${ideas.length} ideas name industry, engineering or data as the actor and have no company in OnCo working on them, ranked here by patient urgency and commerciality with every input cited;${undruggedByTarget.size} druggable targets in the pathway maps have no product; ${bottlenecks.length} bottlenecks have no company attached. Each item links to its evidence. Absence from OnCo means no company here names the problem, not that none exists anywhere.`} />
      <Container className="pb-16 space-y-12">
        <section>
          <h2 className="text-xl font-semibold tracking-tight mb-1">Ideas that need a builder, ranked</h2>
          <p className="text-sm text-muted mb-3 max-w-3xl">Each idea is scored twice, 0 to 100, and sorted by the composite. Every number is read from a corpus record or a public dataset already in OnCo, and each card says where it came from under &ldquo;How this was scored&rdquo;. Where the corpus has no figure, that dimension is marked not scored and left out of the average rather than guessed at, so an idea scored on two dimensions is easier to move than one scored on ten; the count on each card says how many were used. {namesCancer} of {ideas.length} ideas name a cancer, which is what the patient figures hang off.</p>
          <details className="card p-4 text-sm mb-4">
            <summary className="cursor-pointer font-medium">How to read the scores</summary>
            <div className="mt-3 grid gap-4 md:grid-cols-2">
              {(["urgency", "commerciality"] as const).map((axis) => (
                <div key={axis}>
                  <h3 className="font-semibold mb-1">{axis === "urgency" ? "Urgency: how badly patients need it" : "Commerciality: how buildable a business is"}</h3>
                  <ul className="space-y-1.5">
                    {DIMENSIONS.filter((d) => d.axis === axis).map((d) => <li key={d.key}><span className="font-medium">{d.label}</span> <span className="text-muted">(weight {d.weight})</span>: {d.plain}</li>)}
                  </ul>
                </div>
              ))}
            </div>
            <p className="text-muted mt-3">Each dimension is placed on a 0 to 100 scale against the other ideas on this page (counts on a log scale), the axis score is the weighted mean of the dimensions that could be scored, and the composite is the geometric mean of the two axes, so an idea has to score on both to rise. The solution type behind the payer and route dimensions is read from the idea&apos;s actor field (data actors build software) or its technology records. Survival is US five-year relative survival from SEER; incidence is the {GLOBOCAN_SOURCE_LABEL} world estimate. Weights and rules are in <code>src/lib/startup-score.ts</code>.</p>
          </details>
          <StartupRequestBoard cards={cards} routes={routeOptions} capitals={capitalOptions} />
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

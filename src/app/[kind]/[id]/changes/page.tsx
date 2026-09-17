import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { graph } from "@/lib/graph";
import { KIND_META, routeFor } from "@/lib/schema";
import { changesForCancer, groupByMonth, splitUpcoming, CHANGE_KIND_LABEL, type ChangeKind } from "@/lib/cancer-changes";
import { entityCrumbs, pageMeta } from "@/lib/seo";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { Container, PageHeader } from "@/components/ui";
import { CancerIcon } from "@/components/CancerIcon";
import { ChangeKindChip, ChangesGroups, FollowLine } from "@/components/CancerChanges";

const CANCERS = KIND_META.cancer.route;

/** Only cancers have a changes page; the segment lives under [kind]/[id] so the URL is /cancers/<id>/changes/. */
export function generateStaticParams() {
  return graph().kind("cancer").map((c) => ({ kind: CANCERS, id: c.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ kind: string; id: string }> }): Promise<Metadata> {
  const { kind, id } = await params;
  const c = graph().get(id);
  if (kind !== CANCERS || !c || c.kind !== "cancer") return {};
  return pageMeta({ title: `What changed: ${c.name}`, description: `Dated approvals, regulatory steps, reported trials, guideline versions and milestones for ${c.name}, newest first, each linked to its record.`, path: `${routeFor(c)}changes/` });
}

export default async function CancerChangesPage({ params }: { params: Promise<{ kind: string; id: string }> }) {
  const { kind, id } = await params;
  const g = graph();
  const c = g.get(id);
  if (kind !== CANCERS || !c || c.kind !== "cancer") notFound();
  const items = changesForCancer(g, c);
  // The build date is "today": a static site cannot know when it is read, and every date here comes from the records.
  const { upcoming, past } = splitUpcoming(items, new Date().toISOString().slice(0, 10));
  const groups = groupByMonth(past);
  const counts = new Map<ChangeKind, number>();
  for (const it of items) counts.set(it.kind, (counts.get(it.kind) ?? 0) + 1);
  const route = routeFor(c);
  return (
    <>
      <Breadcrumbs items={[...entityCrumbs(c), { label: "What changed", href: `${route}changes/` }]} />
      <PageHeader
        kicker={<Link href={route} className="kicker hover:underline">{c.name}</Link>}
        title={`What changed: ${c.name}`}
        seed={`changes-${c.id}`}
        lede={`Every dated change on the records linked to ${c.name}, newest first: approvals and regulatory steps on its medicines, trials that reported, guideline versions, milestones, and when this page itself was checked. Dates come from the records; none is inferred. Orientation, not medical advice.`}
        logo={<span className="inline-flex h-16 w-16 items-center justify-center rounded-2xl border border-accent/30 bg-accent-soft text-accent"><CancerIcon cancerId={c.id} className="h-10 w-10" /></span>}
        right={<Link href={route} className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium">Cancer page →</Link>}
      />
      <Container className="pb-16">
        <div className="flex flex-wrap items-center gap-1.5 mb-4" aria-label="Changes by kind">
          {(Object.keys(CHANGE_KIND_LABEL) as ChangeKind[]).filter((k) => counts.get(k)).map((k) => <span key={k} className="inline-flex items-center gap-1"><ChangeKindChip kind={k} /><span className="text-xs text-muted tabular-nums">{counts.get(k)}</span></span>)}
        </div>
        <div className="mb-8"><FollowLine cancer={{ id: c.id, name: c.name, route, asOf: c.asOf }} /></div>
        {upcoming.length > 0 && <div className="mb-8"><ChangesGroups groups={[{ key: "upcoming", label: "Coming up", items: upcoming }]} /></div>}
        <ChangesGroups groups={groups} />
      </Container>
    </>
  );
}

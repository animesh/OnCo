import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { graph } from "@/lib/graph";
import { routeFor, type Entity, type Kind } from "@/lib/schema";
import { Container, GroupKicker, PageHeader } from "@/components/ui";
import { CancerPicker, type PickerCancer } from "@/components/CancerPicker";
import { redCardsForCancer } from "@/lib/red-cards";

export const metadata: Metadata = pageMeta({ title: "For me", description: "Select one or more cancer types and see the technologies, products, trials, pairings, and ideas relevant to you.", path: "/for-me/" });

export default function ForMe() {
  const g = graph();
  // "For me" shows what works and what could work: drop failures, withdrawals, historic items, and caution pairings.
  const hopeful = (e: Entity) => !["negative", "withdrawn", "historic"].includes(e.status ?? "") && !e.tags.some((t) => t === "failure" || t === "failed-so-far" || t.startsWith("lesson:")) && !(e.kind === "pairing" && e.pairingType === "caution");
  const data: PickerCancer[] = g.kind("cancer").map((c) => {
    const rel = g.forCancer(c.id);
    const groups: Partial<Record<Kind, Array<{ id: string; name: string; tldr: string; route: string; status?: string }>>> = {};
    for (const [k, list] of rel) { const kept = list.filter(hopeful); if (kept.length) groups[k] = kept.map((e) => ({ id: e.id, name: e.name, tldr: e.tldr, route: routeFor(e), status: e.status })); }
    return { id: c.id, name: c.name, group: c.group, tldr: c.tldr, route: routeFor(c), stateOfArt: c.stateOfArt, redCards: redCardsForCancer(g, c), pipeline: c.pipeline.map((id) => g.must(id)).filter(hopeful).map((e) => ({ id: e.id, name: e.name, tldr: e.tldr, route: routeFor(e), status: e.status })), groups };
  });
  return (
    <>
      <PageHeader kicker={<GroupKicker id="find" />} title="For me"
        lede="Choose one or more. You will see the state of the art, what is in the pipeline, and every technology, product, target, trial, pairing, and idea in OnCo that touches those cancers. Failed, withdrawn, and historic items are left out here: this view is about what works and what could work (see the Failure museum for the rest). Your choice is remembered in this browser (and only there) so the header, the home page, the trials list and search can follow it. This is orientation, not medical advice." />
      <Container className="pb-16">
        <CancerPicker cancers={data} />
      </Container>
    </>
  );
}

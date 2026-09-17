import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { graph } from "@/lib/graph";
import { routeFor } from "@/lib/schema";
import { matchRows } from "@/lib/biomarker-match-rows";
import { questionsFor } from "@/lib/questions";
import { Container, GroupKicker, PageHeader } from "@/components/ui";
import { Navigator, type NavigatorData, type NavCancer, type SocRef } from "@/components/Navigator";
import type { CareDetail, SupportItem } from "@/components/CaregiverPanel";
import type { ProfileLine } from "@/components/ProfileBar";

export const metadata: Metadata = pageMeta({ title: "Line-of-therapy navigator", description: "Set your cancer, stage, biomarkers, and what has been tried; see the standard of care for that setting, the cautions, and the next options ranked, with recruiting trials near you.", path: "/navigator/" });

const SUPPORT_IDS = ["scalp-cooling", "cardio-oncology", "exercise-oncology", "geriatric-assessment"];

export default function NavigatorPage() {
  const g = graph();
  const rows = matchRows();

  const cancers: NavCancer[] = g.kind("cancer").map((c) => ({
    id: c.id, name: c.name, group: c.group, route: routeFor(c), tldr: c.tldr, stateOfArt: c.stateOfArt, pipeline: c.pipeline,
    soc: c.standardOfCare.map((r) => ({
      setting: r.setting, approach: r.approach,
      refs: r.refs.map((id) => g.get(id)).filter((x): x is NonNullable<typeof x> => !!x).map((x): SocRef => ({ id: x.id, name: x.name, route: routeFor(x), status: x.status, kind: x.kind, technologies: x.technologies })),
    })),
  }));

  // Products and technologies offered as "already tried", with the cancers each is relevant to.
  const lines: ProfileLine[] = rows.filter((r) => r.kind === "drug" || r.kind === "technology").map((r) => ({ id: r.id, name: r.name, kind: r.kind as "drug" | "technology", cancers: r.cancers })).sort((a, b) => a.name.localeCompare(b.name));

  // Caregiver details: structured toxicity where present, else the technology's characteristic limitations.
  const details: Record<string, CareDetail> = {};
  for (const e of g.entities) {
    if (e.kind === "drug") {
      const techLimits = e.technologies.flatMap((t) => { const x = g.get(t); return x && x.kind === "technology" ? x.limitations : []; });
      details[e.id] = { id: e.id, name: e.name, route: routeFor(e), kind: "drug", modality: e.modality, toxicity: e.toxicity.map((t) => ({ event: t.event, anyGradePct: t.anyGradePct, grade3PlusPct: t.grade3PlusPct, note: t.note })), limitations: techLimits, monitoring: e.dosing?.monitoring };
    } else if (e.kind === "technology") {
      details[e.id] = { id: e.id, name: e.name, route: routeFor(e), kind: "technology", toxicity: [], limitations: e.limitations };
    }
  }

  const support: SupportItem[] = SUPPORT_IDS.map((id) => g.get(id)).filter((x): x is NonNullable<typeof x> => !!x).map((x) => ({ id: x.id, name: x.name, tldr: x.tldr, route: routeFor(x) }));
  const questions = Object.fromEntries(g.kind("cancer").map((c) => [c.id, questionsFor(c).items.map((q) => ({ setting: q.setting, question: q.question, why: q.why }))]));

  const data: NavigatorData = { cancers, rows, lines, details, support, questions };

  return (
    <>
      <PageHeader kicker={<GroupKicker id="find" />} title="Line-of-therapy navigator"
        lede="Set your cancer type, stage, biomarkers, and what has already been tried. The navigator shows the standard of care for that setting, marks what has been used, flags cautions such as one ADC after another, ranks the next options by evidence and biomarker match, and finds recruiting trials near you. Your profile stays in this browser." />
      <Container className="pb-16">
        <Navigator data={data} />
      </Container>
    </>
  );
}

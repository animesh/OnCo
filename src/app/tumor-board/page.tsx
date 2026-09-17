import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { graph } from "@/lib/graph";
import { routeFor } from "@/lib/schema";
import { matchRows } from "@/lib/biomarker-match-rows";
import { Container, GroupKicker, PageHeader } from "@/components/ui";
import { TumorBoard, type TbCancer } from "@/components/TumorBoard";

export const metadata: Metadata = pageMeta({ title: "Tumour board", description: "Enter a cancer type and biomarkers and see the products, technologies, trials, pairings, and cautions they unlock in OnCo.", path: "/tumor-board/" });

export default function TumorBoardPage() {
  const g = graph();
  const cancers: TbCancer[] = g.kind("cancer").map((c) => ({ id: c.id, name: c.name, group: c.group, route: routeFor(c) }));
  const rows = matchRows();
  return (
    <>
      <PageHeader kicker={<GroupKicker id="find" />} title="Tumour board"
        lede="Tick the biomarkers and alterations from a pathology or genomic report, optionally choose the cancer type, and get one ranked view of the products, technologies, trials, pairings, and ideas that touch them, plus the cautions worth raising. Everything links to its page. Nothing you enter leaves your browser." />
      <Container className="pb-16">
        <TumorBoard rows={rows} cancers={cancers} />
      </Container>
    </>
  );
}

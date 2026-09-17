import type { Metadata } from "next";
import Link from "next/link";
import { pageMeta } from "@/lib/seo";
import { graph } from "@/lib/graph";
import { routeFor } from "@/lib/schema";
import { biomarkers } from "@/data/biomarkers";
import { scoreRows } from "@/lib/biomarker-match";
import { matchRows } from "@/lib/biomarker-match-rows";
import { regionalApprovals, REGIONS, type Region, type RegionalStatus } from "@/data/regional-approvals";
import { Container, GroupKicker, PageHeader } from "@/components/ui";
import { BiomarkerMatrix, type MatrixBiomarker, type MatrixCancer, type MatrixCell, type MatrixDrug } from "@/components/BiomarkerMatrix";

export const metadata: Metadata = pageMeta({ title: "Biomarker matrix", description: "Every biomarker against every cancer: how many matched products are approved in your region versus still in trials, computed from the tumour-board matcher. Click a cell to open the tumour board pre-selected.", path: "/biomarker-matrix/" });

export default function BiomarkerMatrixPage() {
  const g = graph();
  const rows = matchRows();
  const cancers: MatrixCancer[] = g.kind("cancer").map((c) => ({ id: c.id, name: c.name, group: c.group, route: routeFor(c) }));
  const drugInfo = (id: string): MatrixDrug => {
    const d = g.must(id);
    const row = regionalApprovals[id] ?? {};
    const regions: Partial<Record<Region, RegionalStatus>> = {};
    for (const r of REGIONS) if (row[r]) regions[r] = row[r]!.status;
    return { id, name: d.name, route: routeFor(d), status: d.status, regions };
  };
  const matrix: MatrixBiomarker[] = biomarkers.map((b) => {
    // Score every entity against this one biomarker (no cancer bonus), then distribute the hits across the
    // cancers each entity is relevant to. A product counts in a cancer column only when the graph links them.
    const scored = scoreRows(rows, [b], null);
    const cells: Record<string, MatrixCell> = {};
    for (const { row } of scored) {
      if (row.kind === "pairing" || row.kind === "idea" || row.kind === "target") continue;
      if (row.status === "withdrawn" || row.status === "negative" || row.status === "historic") continue;
      for (const cid of row.cancers) {
        const cell = (cells[cid] ??= { drugs: [], trials: 0, technologies: 0 });
        if (row.kind === "drug") cell.drugs.push(drugInfo(row.id));
        else if (row.kind === "trial") cell.trials += 1;
        else if (row.kind === "technology") cell.technologies += 1;
      }
    }
    return { id: b.id, label: b.label, group: b.group, note: b.note, typical: b.typical ?? [], cells };
  });
  const totalCells = matrix.reduce((n, b) => n + Object.values(b.cells).filter((c) => c.drugs.length).length, 0);
  const totalDrugs = new Set(matrix.flatMap((b) => Object.values(b.cells).flatMap((c) => c.drugs.map((d) => d.id)))).size;

  return (
    <>
      <PageHeader kicker={<GroupKicker id="find" />} title="Biomarker matrix"
        lede={`${biomarkers.length} biomarkers and alterations against ${cancers.length} cancers: ${totalCells} filled cells covering ${totalDrugs} products. Each cell counts matched products approved in your region against those still in trials; the tumour board answers one profile, this is the whole grid. Change region in the header.`} />
      <Container className="pb-16 space-y-8">
        <BiomarkerMatrix biomarkers={matrix} cancers={cancers} />
        <section className="grid md:grid-cols-2 gap-6 text-sm">
          <div className="card p-5 space-y-2">
            <h2 className="font-semibold text-base">How a cell is computed</h2>
            <p>The same matcher as the <Link href="/tumor-board/" className="underline">tumour board</Link> scores every product, technology and trial against one biomarker (target match 3, glossary-term match 2, technology match 2, tag match 1). Each hit is then placed in every cancer column the graph links it to, directly or through its products. A product is &ldquo;approved&rdquo; in a cell when the <Link href="/regulatory/regions/" className="underline">regional approvals table</Link> records approval or conditional approval for your region; where we hold no regional record, the corpus status (usually the FDA) is used and the tooltip says so.</p>
          </div>
          <div className="card p-5 space-y-2">
            <h2 className="font-semibold text-base">Read with care</h2>
            <p>Approval in a cell means the product is approved somewhere in that cancer, not necessarily for that biomarker-defined subgroup; a PD-1 antibody approved for lung cancer will appear in the PD-L1 row for every cancer it is approved in. Withdrawn, negative and historic records are excluded. Counts are a map of what the corpus documents, not a treatment recommendation. Click through to the tumour board to see the products, cautions and trials behind a cell.</p>
          </div>
        </section>
      </Container>
    </>
  );
}

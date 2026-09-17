import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { graph } from "@/lib/graph";
import { routeFor } from "@/lib/schema";
import { modalityClass } from "@/lib/company-score";
import { Container, GroupKicker, PageHeader } from "@/components/ui";
import { PivotTable, type Dim, type DimMeta, type Fact } from "@/components/PivotTable";

export const metadata: Metadata = pageMeta({ title: "Landscape grid", description: "Count products, trials or technologies by cancer, target, treatment type or company in one grid. Cross-tabulate products, trials, or technologies by cancer, target, modality, company, front, status, or phase.", path: "/pivot/" });

const short = (s: string) => s.replace(/ \(.*\)$/, "");


export default function PivotPage() {
  const g = graph();
  const names = (ids: string[]) => ids.map((id) => short(g.must(id).name));
  const frontsOf = (sections: string[], techs: string[]) => [...new Set([...sections, ...techs.flatMap((t) => g.must(t).sections)])].map((id) => g.must(id).name);
  const empty = (): Record<Dim, string[]> => ({ cancer: [], target: [], modality: [], company: [], front: [], status: [], phase: [] });

  const facts: Fact[] = [];
  for (const d of g.kind("drug")) {
    const dims = empty();
    dims.cancer = names(d.cancers); dims.target = names(d.targets); dims.modality = [modalityClass(d.modality)]; dims.company = names(d.companies); dims.front = frontsOf(d.sections, d.technologies); dims.status = d.status ? [d.status] : []; dims.phase = d.status?.startsWith("phase") ? [d.status.replace("phase-", "Phase ")] : d.status === "approved" ? ["Approved"] : [];
    facts.push({ id: d.id, kind: "drug", name: d.name, route: routeFor(d), status: d.status, rank: 0, dims });
  }
  for (const t of g.kind("trial")) {
    const dims = empty();
    const drugs = t.drugs.map((id) => g.must(id));
    dims.cancer = names(t.cancers); dims.target = names([...new Set([...t.targets, ...drugs.flatMap((d) => d.targets)])]); dims.modality = [...new Set(drugs.map((d) => (d.kind === "drug" ? modalityClass(d.modality) : "")).filter(Boolean))]; dims.company = names([...new Set([...t.companies, ...drugs.flatMap((d) => d.companies)])]); dims.front = frontsOf(t.sections, [...t.technologies, ...drugs.flatMap((d) => d.technologies)]); dims.status = t.status ? [t.status] : []; dims.phase = [`Phase ${t.phase}`];
    facts.push({ id: t.id, kind: "trial", name: t.name, route: routeFor(t), status: t.status, rank: 0, dims });
  }
  for (const x of g.kind("technology")) {
    const dims = empty();
    dims.cancer = names(x.cancers); dims.target = names(x.targets); dims.modality = [x.generation ?? "-"]; dims.company = names([...new Set([...x.companies, ...(g.incoming(x.id).get("company") ?? []).map((c) => c.id)])]); dims.front = x.sections.map((id) => g.must(id).name); dims.status = x.status ? [x.status] : []; dims.phase = x.status?.startsWith("phase") ? [x.status.replace("phase-", "Phase ")] : x.status === "approved" || x.status === "standard-of-care" ? ["Approved / standard"] : [];
    facts.push({ id: x.id, kind: "technology", name: x.name, route: routeFor(x), status: x.status, rank: 0, dims });
  }

  const meta: DimMeta = {
    cancer: { label: "Cancer", ids: Object.fromEntries(g.kind("cancer").map((c) => [short(c.name), c.id])), routes: Object.fromEntries(g.kind("cancer").map((c) => [short(c.name), routeFor(c)])) },
    target: { label: "Target", routes: Object.fromEntries(g.kind("target").map((t) => [short(t.name), routeFor(t)])) },
    modality: { label: "Modality", routes: {
      "Small molecule": "/terms/small-molecule/", "Antibody": routeFor(g.must("monoclonal-antibody")), "ADC": routeFor(g.must("adc")), "Bispecific ADC": routeFor(g.must("bispecific-adc")),
      "Bispecific antibody": routeFor(g.must("bispecific-antibody")), "T-cell engager": routeFor(g.must("t-cell-engager")), "Cell therapy": routeFor(g.must("cell-therapy")),
      "Radiopharmaceutical": routeFor(g.must("radiopharma")), "Imaging agent": routeFor(g.must("imaging")), "Vaccine or oncolytic": "/terms/vaccines-and-oncolytic-viruses/",
      "Degrader or glue": routeFor(g.must("protac-degrader")), "Chemotherapy": routeFor(g.must("chemotherapy")), "Diagnostic": routeFor(g.must("diagnostics")), "Device": routeFor(g.must("devices")),
    } },
    company: { label: "Company", routes: Object.fromEntries(g.kind("company").map((c) => [short(c.name), routeFor(c)])) },
    front: { label: "Front", routes: Object.fromEntries(g.kind("section").map((s) => [s.name, routeFor(s)])) },
    status: { label: "Status", routes: { approved: "/regulatory/", "phase-3": "/terms/trial-phases/", "phase-2": "/terms/trial-phases/", "phase-1": "/terms/trial-phases/", withdrawn: "/terms/approval-withdrawal/", "standard-of-care": "/terms/standard-of-care/", preclinical: "/terms/preclinical/" } },
    phase: { label: "Phase", routes: { Approved: "/regulatory/", "Phase 1": "/terms/trial-phases/", "Phase 2": "/terms/trial-phases/", "Phase 3": "/terms/trial-phases/", "Phase 4": "/terms/trial-phases/", "Phase 1/2": "/terms/trial-phases/", "Phase 2/3": "/terms/trial-phases/" } },
  };

  return (
    <>
      <PageHeader kicker={<GroupKicker id="find" />} title="Landscape grid" lede="Count what exists where. Pick what to count and how to slice it: rows by cancer, columns by target or modality, cells showing how many products (or trials, or technologies) sit at the intersection and the best evidence tier among them. Click a count to open the list." />
      <Container className="pb-16">
        <PivotTable facts={facts} meta={meta} />
      </Container>
    </>
  );
}

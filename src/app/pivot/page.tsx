import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import { graph } from "@/lib/graph";
import { routeFor } from "@/lib/schema";
import { Container, GroupKicker, PageHeader } from "@/components/ui";
import { PivotTable, type Dim, type DimMeta, type Fact } from "@/components/PivotTable";

export const metadata: Metadata = pageMeta({ title: "Landscape grid", description: "Count products, trials or technologies by cancer, target, treatment type or company in one grid. Cross-tabulate products, trials, or technologies by cancer, target, modality, company, front, status, or phase.", path: "/pivot/" });

const short = (s: string) => s.replace(/ \(.*\)$/, "");

function modalityClass(m: string): string {
  return /bispecific adc/i.test(m) ? "Bispecific ADC" : /^adc/i.test(m) ? "ADC" : /engager|immtac/i.test(m) ? "T-cell engager" : /bispecific/i.test(m) ? "Bispecific antibody" : /monoclonal/i.test(m) ? "Monoclonal antibody" : /car-t|til|tcr-t/i.test(m) ? "Cell therapy" : /radioligand|alpha|theranostic/i.test(m) ? "Radiopharmaceutical" : /pet imaging|imaging agent/i.test(m) ? "Imaging agent" : /vaccine/i.test(m) ? "Vaccine" : /oncolytic/i.test(m) ? "Oncolytic virus" : /device/i.test(m) ? "Device" : /test|assay|profiling|detection|diagnostic|classifier/i.test(m) ? "Diagnostic test" : /cytotoxic|regimen/i.test(m) ? "Chemotherapy" : /protac|degrader/i.test(m) ? "Degrader" : /small-molecule|serd|inhibitor|antagonist/i.test(m) ? "Small molecule" : m;
}

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
    modality: { label: "Modality" },
    company: { label: "Company", routes: Object.fromEntries(g.kind("company").map((c) => [short(c.name), routeFor(c)])) },
    front: { label: "Front" },
    status: { label: "Status" },
    phase: { label: "Phase" },
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

import type { Metadata } from "next";
import { logoFor } from "@/lib/logos";
import Link from "next/link";
import { pageMeta } from "@/lib/seo";
import { graph } from "@/lib/graph";
import { routeFor } from "@/lib/schema";
import { Container, GroupKicker, PageHeader } from "@/components/ui";
import { EntityBrowser, type BrowserRow, type ColDef, type FacetDef, type LinkItem } from "@/components/EntityBrowser";
import { models, datasets } from "@/data/model-registry";

export const metadata: Metadata = pageMeta({ title: "Models and datasets", description: "Foundation models for cancer and the cell, the mathematical and biophysical models oncology reasons with, and the datasets they train on, in one comparable table: parameters, modality, training data, weights availability, licence, benchmarks and papers.", path: "/models/" });

const MODALITY_LABEL: Record<string, string> = { histology: "Histology", radiology: "Radiology", "single-cell": "Single cell", DNA: "DNA", protein: "Protein", multimodal: "Multimodal", "clinical-text": "Clinical text", phenomics: "Phenomics", EHR: "EHR", clinical: "Clinical", mixed: "Mixed" };
const WEIGHTS_LABEL: Record<string, string> = { open: "Open weights", gated: "Gated download", request: "By request", api: "API only", proprietary: "Proprietary" };
const WEIGHTS_TIPS: Record<string, string> = { "Published equations": "A mathematical or biophysical model published in the literature; the equations and parameters are on the technology page and in the linked paper.", "Open weights": "Download without gating.", "Gated download": "Download after accepting terms or a request form (for example on Hugging Face).", "By request": "Academic access by application to the developers.", "API only": "Hosted access only; no weights.", Proprietary: "Not available outside the company." };
const ACCESS_LABEL: Record<string, string> = { open: "Open", registered: "Registered access", controlled: "Controlled access", commercial: "Commercial" };
const licenceFamily = (l?: string) => !l ? "Not verified" : /non-commercial|NC|CC BY-NC|Gemma|Cambrian|Chai Discovery|research use|licence \(/i.test(l) ? "Non-commercial or research" : /Apache|MIT|BSD|CC BY 4.0|CC BY\b|CC0/i.test(l) ? "Permissive open licence" : "Other";
const paperLink = (p?: string): LinkItem | undefined => !p ? undefined : p.startsWith("10.") ? { label: "paper", href: `https://doi.org/${p}`, tip: `DOI ${p}` } : p.startsWith("arXiv:") ? { label: "arXiv", href: `https://arxiv.org/abs/${p.slice(6)}`, tip: p } : p.startsWith("bioRxiv ") ? { label: "bioRxiv", href: `https://doi.org/${p.slice(8)}`, tip: `bioRxiv DOI ${p.slice(8)}` } : undefined;

/** Logo of the model's maker: the first company or institution on the record that has a logo on file. */
function makerLogo(e: { companies?: string[]; institutions?: string[] }): string | undefined {
  for (const id of [...(e.companies ?? []), ...(e.institutions ?? [])]) { const l = logoFor(id); if (l.src) return l.src; }
  return undefined;
}

export default function ModelsPage() {
  const g = graph();
  const rows: BrowserRow[] = [];
  for (const m of models) {
    const e = g.get(m.id); if (!e) continue;
    const ds = (m.datasets ?? []).map((id) => g.get(id)).filter((x): x is NonNullable<typeof x> => !!x).map((x) => ({ label: x.name.split(" (")[0], href: routeFor(x), tip: x.tldr }));
    const paper = paperLink(m.paper);
    rows.push({
      id: m.id, name: e.name, tldr: e.tldr, route: routeFor(e), status: e.status, logo: makerLogo(e), avatar: "org",
      facets: { type: ["Model"], modality: [MODALITY_LABEL[m.modality]], weights: [WEIGHTS_LABEL[m.weights]], licence: [licenceFamily(m.licence)], year: [String(m.year)] },
      cols: {
        params: m.parametersM ? (m.parametersM >= 1000 ? `${(m.parametersM / 1000).toLocaleString("en-GB", { maximumFractionDigits: 1 })} B` : `${m.parametersM.toLocaleString("en-GB")} M`) : undefined,
        training: m.trainingData,
        weights: { facet: "weights", value: WEIGHTS_LABEL[m.weights] },
        licence: m.licence,
        benchmark: m.benchmark,
        paper: paper ? [paper, ...(m.weightsUrl ? [{ label: "weights", href: m.weightsUrl }] : [])] : m.weightsUrl ? [{ label: "weights or model card", href: m.weightsUrl }] : undefined,
        datasets: ds,
        year: m.year,
      },
      sortKeys: { params: m.parametersM ?? 0, year: m.year },
    });
  }
  for (const t of g.kind("technology")) {
    if (!t.tags.includes("mathematical-model")) continue;
    const primary = t.links[0];
    rows.push({
      id: t.id, name: t.name, tldr: t.tldr, route: routeFor(t), status: t.status, logo: makerLogo(t), avatar: "org",
      facets: { type: ["Mathematical model"], modality: ["Mechanistic model"], weights: ["Published equations"], licence: ["Open literature"], year: t.since ? [String(t.since)] : [] },
      cols: { params: undefined, training: t.principle, weights: { facet: "weights", value: "Published equations" }, licence: undefined, benchmark: t.strengths[0], paper: primary ? [{ label: primary.label.length > 24 ? "source" : primary.label, href: primary.url }] : undefined, datasets: [], year: typeof t.since === "number" ? t.since : undefined },
      sortKeys: { params: 0, year: typeof t.since === "number" ? t.since : 0 },
    });
  }
  for (const d of datasets) {
    const e = g.get(d.id); if (!e) continue;
    const used = (d.usedBy ?? []).map((id) => g.get(id)).filter((x): x is NonNullable<typeof x> => !!x).map((x) => ({ label: x.name.split(" (")[0], href: routeFor(x), tip: x.tldr }));
    rows.push({
      id: d.id, name: e.name, tldr: e.tldr, route: routeFor(e), logo: makerLogo(e), avatar: "org",
      facets: { type: ["Dataset"], modality: [MODALITY_LABEL[d.modality]], weights: [ACCESS_LABEL[d.access]], licence: [e.kind === "collection" && e.license ? licenceFamily(e.license) : "Not verified"], year: d.year ? [String(d.year)] : [] },
      cols: { params: undefined, training: d.size, weights: { facet: "weights", value: ACCESS_LABEL[d.access] }, licence: e.kind === "collection" ? e.license : undefined, benchmark: d.consent, paper: e.kind === "collection" ? [{ label: "portal", href: e.url }] : undefined, datasets: used, year: d.year },
      sortKeys: { params: 0, year: d.year ?? 0 },
    });
  }
  const facets: FacetDef[] = [
    { key: "type", label: "Type", searchable: false, width: "w-36", order: ["Model", "Mathematical model", "Dataset"] },
    { key: "modality", label: "Modality", searchable: false, width: "w-44" },
    { key: "weights", label: "Weights / access", searchable: false, width: "w-48", order: ["Open weights", "Gated download", "By request", "API only", "Proprietary", "Open", "Registered access", "Controlled access", "Commercial"] },
    { key: "licence", label: "Licence", searchable: false, width: "w-56" },
    { key: "year", label: "Year", searchable: false, width: "w-28" },
  ];
  const columns: ColDef[] = [
    { key: "params", label: "Parameters", sortable: true, numeric: true, tip: "Parameter count as reported by the developers; blank when not public." },
    { key: "training", label: "Training data / size", hide: "hidden md:table-cell", tip: "For models, what it was trained on; for datasets, how big it is, in the unit the maintainers use." },
    { key: "weights", label: "Weights / access", sortable: true, valueTips: WEIGHTS_TIPS, tip: "How the model or dataset can be obtained today." },
    { key: "licence", label: "Licence", hide: "hidden lg:table-cell", tip: "Copied from the model card or repository; blank means not verified." },
    { key: "benchmark", label: "Reported result / consent", hide: "hidden xl:table-cell", tip: "For models, a benchmark result quoted from the paper; for datasets, the consent and reuse conditions." },
    { key: "paper", label: "Paper / weights", hide: "hidden sm:table-cell" },
    { key: "datasets", label: "Trained on / used by", hide: "hidden lg:table-cell", tip: "Datasets in the corpus the model used, or models that used the dataset." },
    { key: "year", label: "Year", sortable: true, numeric: true, hide: "hidden md:table-cell" },
  ];
  const open = models.filter((m) => m.weights === "open").length;
  return (
    <>
      <PageHeader kicker={<GroupKicker id="map" />} title="Models and datasets"
        lede={`${models.length} foundation and risk models and ${datasets.length} datasets from the corpus, with the fields that let you compare them: parameters, modality, training data, whether the weights can be downloaded (${open} are open), licence, a reported benchmark and the paper. Figures are the developers' own; blanks are unverified, not zero.`} />
      <Container className="pb-16">
        <EntityBrowser rows={rows} facets={facets} columns={columns} noun="models and datasets" hideStatus defaultSort={{ key: "year", dir: -1 }} />
        <p className="text-xs text-muted mt-6 max-w-3xl">Weights status and licence were read from model cards and repositories on the date in each technology record and change often; check the linked page before relying on them. Benchmark results are the developers&apos; own claims on their own test sets and are not comparable across rows. Prospective clinical validation is the exception, not the rule; see the <Link className="underline" href="/open-questions/?subject=Pathology+%26+radiology+foundation+models">open question</Link> on that point.</p>
      </Container>
    </>
  );
}

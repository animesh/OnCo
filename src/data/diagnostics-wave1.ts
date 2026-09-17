/**
 * Diagnostics wave 1 (17 Sept 2026, owner request "get STRIDE in from intoDNA and all diagnostics that can be done"):
 * the DNA break assay, its company, and Strata Oncology. Roadmap rows 118 and 119 carry the rest of the wave.
 */
import type { CompanyInput, TechnologyInput } from "@/lib/schema";

const asOf = "2026-09-17";

export const diagnosticsTechnologies1: TechnologyInput[] = [
  { id: "stride-dna-break-detection", kind: "technology", name: "STRIDE DNA break detection (intoDNA)", status: "emerging", since: 2020, asOf, sections: ["diagnostics", "drug-discovery"],
    aka: ["STRIDE", "SensiTive Recognition of Individual DNA Ends", "single-strand break detection", "double-strand break detection", "DNA damage assay"],
    tldr: "STRIDE is a microscope test that lights up individual broken DNA strands inside cells, so a laboratory can count how much DNA damage a tumour carries or a drug causes, cell by cell.",
    summary: "STRIDE (SensiTive Recognition of Individual DNA Ends) was developed at the Jagiellonian University in Krakow and published in Nucleic Acids Research in 2020 by Magdalena Kordon, Kamil Solarczyk and colleagues. It labels the ends of DNA breaks in fixed cells with a fluorescent signal that is then amplified, so that single-strand breaks (sSTRIDE) and double-strand breaks (dSTRIDE) can be seen and counted directly under a microscope at single-cell resolution, rather than inferred from marker proteins such as gamma-H2AX.\n\nThe first use is in drug development: measuring how much damage chemotherapy, radiotherapy, PARP inhibitors and other DNA damage response drugs cause, and how quickly cells repair it, in cell lines, organoids and patient samples. The longer aim, which intoDNA is pursuing with pharmaceutical partners, is a companion test that reads a tumour's repair capacity to predict who will respond to PARP inhibitors and similar drugs, complementing genomic HRD scores with a functional readout.\n\nSTRIDE is a research tool today; it has no regulatory clearance as a diagnostic, and its clinical value as a predictive test remains to be shown in prospective studies.",
    principle: "Enzymatically label free DNA ends in fixed cells, amplify the signal with a rolling-circle reaction, and count the fluorescent foci per nucleus to quantify single- and double-strand breaks.",
    strengths: ["Direct detection of breaks rather than a marker protein", "Single-cell resolution in tissue and cell culture", "Distinguishes single- from double-strand breaks"], limitations: ["Research use only", "Needs fixed samples and fluorescence microscopy", "Predictive value for treatment not yet shown prospectively"],
    technologies: ["hrd-testing", "parp-inhibitor"], companies: ["intodna"],
    links: [{ label: "intoDNA: STRIDE technology", url: "https://intodna.com" }, { label: "Nucleic Acids Research 2020: STRIDE, a fluorescence method for direct, specific in situ detection of individual single- or double-strand DNA breaks in fixed cells", url: "https://academic.oup.com/nar/article/48/3/e14/5651325" }] },
];

export const diagnosticsCompanies1: CompanyInput[] = [
  { id: "intodna", kind: "company", name: "intoDNA", aka: ["intoDNA S.A."], hq: "Krakow, Poland", country: "PL", companyType: "biotech", website: "https://intodna.com", stage: "startup", founded: 2016, asOf,
    tldr: "A Krakow spin-out from the Jagiellonian University whose STRIDE assay counts individual DNA breaks in cells, sold to drug developers and aimed at predicting who responds to DNA-repair drugs.",
    summary: "intoDNA was founded in 2016 by researchers from the Jagiellonian University in Krakow to commercialise STRIDE, a fluorescence method that detects single- and double-strand DNA breaks directly in fixed cells. The company offers STRIDE as a contract research service to pharmaceutical and biotech companies developing DNA damage response drugs, radiosensitisers and chemotherapy combinations, and is working towards a functional companion test for PARP inhibitor response.",
    technologies: ["stride-dna-break-detection", "hrd-testing"], cancers: ["ovarian", "breast-cancer", "prostate"], links: [{ label: "Official website", url: "https://intodna.com" }] },
  { id: "strata-oncology", kind: "company", name: "Strata Oncology", aka: ["StrataNGS", "StrataEXP"], hq: "Ann Arbor, Michigan, United States", country: "US", companyType: "diagnostics", website: "https://www.strataoncology.com", stage: "growth", founded: 2015, asOf,
    tldr: "An Ann Arbor testing company that sequences tumours from very small biopsies (StrataNGS) and matches patients to trials and to immunotherapy through its Strata trial network.",
    summary: "Strata Oncology runs a large tumour sequencing panel, StrataNGS, designed for the small formalin-fixed samples that fail at other laboratories, and offers it through health systems in its Strata Precision Oncology Network, which returns trial matches with the report. Its StrataEXP test combines DNA and RNA results into a predictor of benefit from PD-1 and PD-L1 inhibitors across tumour types. The company publishes on the share of patients who reach a matched trial or therapy through routine testing.",
    technologies: ["cgp", "ai-trial-matching", "companion-diagnostic"], cancers: ["nsclc", "colorectal", "breast-cancer"], links: [{ label: "Official website", url: "https://www.strataoncology.com" }] },
];

/** Sequencing technologies each testing company should link to (record id to technology ids). */
export const testingCompanyLinks: Record<string, string[]> = {
  bostongene: ["wes-wgs"], tempus: ["wes-wgs", "liquid-biopsy"], "foundation-medicine": ["cgp", "companion-diagnostic", "liquid-biopsy"], caris: ["companion-diagnostic"],
  "guardant-health": ["liquid-biopsy", "cgp", "mrd-testing"], natera: ["mrd-testing", "liquid-biopsy"], personalis: ["cgp"], "sophia-genetics": ["cgp"], "myriad-genetics": ["companion-diagnostic"],
};

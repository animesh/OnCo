import type { CompanyInput } from "@/lib/schema";

/**
 * Tumour sequencing tests side by side: what sample they need, how much of the genome they read, what comes
 * back, and the regulatory status where it is certain. Rendered by /tumour-testing/. A cell is left empty
 * rather than guessed. `drugId` points at the OnCo test record when one exists; `technologies` are the
 * technology pages the row belongs under.
 */
export type SampleType = "tissue" | "blood" | "both";
export type TestScope = "targeted-panel" | "exome" | "exome-transcriptome" | "genome" | "mrd" | "screening";

export const SCOPE_LABEL: Record<TestScope, string> = {
  "targeted-panel": "Targeted panel",
  exome: "Exome",
  "exome-transcriptome": "Exome plus transcriptome",
  genome: "Genome",
  mrd: "MRD (residual disease)",
  screening: "Screening",
};

export const SCOPE_PLAIN: Record<TestScope, string> = {
  "targeted-panel": "Reads a chosen set of cancer genes, usually a few hundred, at high depth.",
  exome: "Reads the protein-coding part of every gene, about one to two per cent of the genome.",
  "exome-transcriptome": "Reads the coding DNA and the RNA, so it also sees which genes are switched on and catches fusions.",
  genome: "Reads all the DNA, including the parts between genes, at lower depth per base.",
  mrd: "Looks in blood for traces of tumour DNA after treatment, to catch relapse early.",
  screening: "Looks in blood for signs of a cancer in someone without symptoms.",
};

export type TumourTest = {
  id: string;
  name: string;
  /** Company record id. */
  companyId: string;
  sample: SampleType;
  scope: TestScope;
  /** What the report contains, in plain words. */
  returns: string;
  /** Regulatory status by region, only where certain. Empty string means not stated. */
  regulatory: { us?: string; eu?: string };
  /** The test's own page, or the company's site when the test has no stable page. */
  url: string;
  /** OnCo test record, when one exists. */
  drugId?: string;
  technologies: string[];
  note?: string;
};

const t = (x: TumourTest): TumourTest => x;

export const TUMOUR_TESTS: TumourTest[] = [
  t({ id: "bostongene-tumor-portrait", name: "BostonGene Tumor Portrait", companyId: "bostongene", sample: "tissue", scope: "exome-transcriptome",
    returns: "Somatic mutations, copy number and fusions from whole exome sequencing of tumour and normal, gene expression from RNA sequencing, tumour mutational burden, microsatellite status, and a classification of the tumour's immune microenvironment.",
    regulatory: { us: "Laboratory-developed test (CLIA laboratory)" }, url: "https://bostongene.com/", technologies: ["wes-wgs", "cgp"],
    note: "The immune microenvironment classification is the distinctive part: it groups tumours by how immune cells are arranged, which BostonGene reports alongside the genomics." }),
  t({ id: "tempus-xt", name: "Tempus xT and xT CDx", companyId: "tempus", sample: "both", scope: "targeted-panel",
    returns: "Mutations, copy number and fusions across several hundred genes from tumour tissue with a matched normal sample, plus RNA sequencing for fusions, tumour mutational burden and microsatellite status; xT CDx carries companion diagnostic claims.",
    regulatory: { us: "xT CDx FDA approved (2023); the laboratory xT assay is a laboratory-developed test" }, url: "https://www.tempus.com/", drugId: "tempus-xt-cdx", technologies: ["cgp", "companion-diagnostic"] }),
  t({ id: "tempus-xe", name: "Tempus xE", companyId: "tempus", sample: "tissue", scope: "exome",
    returns: "Whole exome sequencing of tumour and matched normal, reporting somatic and germline variants across the coding genome, tumour mutational burden and microsatellite status.",
    regulatory: { us: "Laboratory-developed test (CLIA laboratory)" }, url: "https://www.tempus.com/", technologies: ["wes-wgs"] }),
  t({ id: "foundationone-cdx", name: "FoundationOne CDx", companyId: "foundation-medicine", sample: "tissue", scope: "targeted-panel",
    returns: "Substitutions, indels, copy number changes and selected rearrangements in 324 genes, plus tumour mutational burden and microsatellite status, with companion diagnostic claims for a long list of targeted drugs.",
    regulatory: { us: "FDA approved (PMA P170019, 2017)", eu: "CE marked" }, url: "https://www.foundationmedicine.com/test/foundationone-cdx", drugId: "foundationone-cdx", technologies: ["cgp", "companion-diagnostic"] }),
  t({ id: "foundationone-liquid-cdx", name: "FoundationOne Liquid CDx", companyId: "foundation-medicine", sample: "blood", scope: "targeted-panel",
    returns: "Alterations in more than 300 genes from cell-free DNA in a blood draw, including blood tumour mutational burden and microsatellite status, with companion diagnostic claims; a negative result does not rule out the alteration in tissue.",
    regulatory: { us: "FDA approved (PMA P190032, 2020)", eu: "CE marked" }, url: "https://www.foundationmedicine.com/test/foundationone-liquid-cdx", drugId: "foundationone-cdx", technologies: ["liquid-biopsy", "cgp", "companion-diagnostic"] }),
  t({ id: "foundationone-heme", name: "FoundationOne Heme", companyId: "foundation-medicine", sample: "both", scope: "targeted-panel",
    returns: "DNA sequencing of several hundred genes plus RNA sequencing of fusion genes for leukaemias, lymphomas, myeloma and sarcomas, from blood, bone marrow or tissue.",
    regulatory: { us: "Laboratory-developed test (CLIA laboratory)" }, url: "https://www.foundationmedicine.com/test/foundationone-heme", technologies: ["cgp"] }),
  t({ id: "caris-mi-profile", name: "Caris MI Profile", companyId: "caris", sample: "tissue", scope: "exome-transcriptome",
    returns: "Whole exome and whole transcriptome sequencing of the tumour, with immunohistochemistry where relevant, reporting mutations, copy number, fusions, expression, tumour mutational burden, microsatellite status and loss of heterozygosity, matched to approved drugs and trials.",
    regulatory: { us: "Laboratory-developed test (CLIA laboratory); the FDA-approved version is MI Cancer Seek" }, url: "https://www.carislifesciences.com/", technologies: ["wes-wgs", "cgp", "rna-seq"] }),
  t({ id: "caris-mi-cancer-seek", name: "Caris MI Cancer Seek", companyId: "caris", sample: "tissue", scope: "exome-transcriptome",
    returns: "The FDA-approved whole exome and whole transcriptome assay, with companion diagnostic claims for specific drug and cancer pairs alongside the broader profile.",
    regulatory: { us: "FDA approved (2024)" }, url: "https://www.carislifesciences.com/", drugId: "caris-mi-cancer-seek", technologies: ["wes-wgs", "companion-diagnostic"] }),
  t({ id: "guardant360-cdx", name: "Guardant360 CDx", companyId: "guardant-health", sample: "blood", scope: "targeted-panel",
    returns: "Mutations, amplifications and fusions in more than 50 genes from cell-free DNA, with companion diagnostic claims in lung and breast cancer; the wider laboratory Guardant360 reports more genes.",
    regulatory: { us: "FDA approved (PMA P200010, 2020)" }, url: "https://guardant360cdx.com/", drugId: "guardant360-cdx", technologies: ["liquid-biopsy", "cgp", "companion-diagnostic"] }),
  t({ id: "guardant-reveal", name: "Guardant Reveal", companyId: "guardant-health", sample: "blood", scope: "mrd",
    returns: "Presence or absence of circulating tumour DNA after surgery or during surveillance, using mutations and methylation without needing a tumour sample first, in colorectal, breast and lung cancer.",
    regulatory: { us: "Laboratory-developed test (CLIA laboratory)" }, url: "https://guardanthealth.com/", drugId: "guardant-reveal", technologies: ["mrd-testing", "liquid-biopsy"] }),
  t({ id: "guardant-shield", name: "Guardant Shield", companyId: "guardant-health", sample: "blood", scope: "screening",
    returns: "A positive or negative result for colorectal cancer signal in cell-free DNA, for people at average risk aged 45 and over; a positive result leads to colonoscopy.",
    regulatory: { us: "FDA approved (2024) as a primary colorectal cancer screening option" }, url: "https://shieldcancerscreen.com/", drugId: "shield", technologies: ["liquid-biopsy"] }),
  t({ id: "stratangs", name: "StrataNGS", companyId: "strata-oncology", sample: "tissue", scope: "targeted-panel",
    returns: "Mutations, copy number, fusions, tumour mutational burden and microsatellite status from a targeted DNA and RNA panel designed to work on very small tissue samples.",
    regulatory: { us: "Laboratory-developed test (CLIA laboratory)" }, url: "https://www.strataoncology.com/", technologies: ["cgp"] }),
  t({ id: "strataexp", name: "StrataEXP", companyId: "strata-oncology", sample: "tissue", scope: "targeted-panel",
    returns: "Quantitative gene-expression measurements of drug targets and an immunotherapy response score, meant to be run alongside StrataNGS to inform choice of immunotherapy and antibody-drug conjugates.",
    regulatory: { us: "Laboratory-developed test (CLIA laboratory)" }, url: "https://www.strataoncology.com/", technologies: ["rna-seq", "cgp"] }),
  t({ id: "neotype-profiles", name: "NeoGenomics NeoTYPE profiles", companyId: "neogenomics", sample: "both", scope: "targeted-panel",
    returns: "Cancer-specific DNA and RNA panels (solid tumour, lung, myeloid and others) reporting mutations, copy number and fusions, often combined with immunohistochemistry and FISH from the same laboratory.",
    regulatory: { us: "Laboratory-developed tests (CLIA laboratory)" }, url: "https://neogenomics.com/", technologies: ["cgp", "reference-laboratories"] }),
  t({ id: "radar-mrd", name: "NeoGenomics RaDaR", companyId: "neogenomics", sample: "blood", scope: "mrd",
    returns: "A tumour-informed residual disease result: the tumour is sequenced first and a personalised panel of its variants is then tracked in blood over time.",
    regulatory: { us: "Laboratory-developed test (CLIA laboratory)" }, url: "https://neogenomics.com/", drugId: "radar-mrd", technologies: ["mrd-testing", "liquid-biopsy"] }),
  t({ id: "next-personal", name: "Personalis NeXT Personal", companyId: "personalis", sample: "blood", scope: "mrd",
    returns: "An ultra-sensitive tumour-informed residual disease measurement: whole genome sequencing of the tumour designs a panel of up to about 1,800 variants that is then tracked in blood, reported as tumour DNA level over time.",
    regulatory: { us: "Laboratory-developed test (CLIA laboratory)" }, url: "https://www.personalis.com/", technologies: ["mrd-testing", "liquid-biopsy", "wes-wgs"] }),
  t({ id: "trusight-oncology-500", name: "Illumina TruSight Oncology 500", companyId: "illumina", sample: "both", scope: "targeted-panel",
    returns: "A kit laboratories run themselves: DNA variants in 523 genes and RNA fusions in 55 genes, plus tumour mutational burden and microsatellite status; a cell-free DNA version exists for blood.",
    regulatory: { us: "Research use only kit; the in vitro diagnostic version is TruSight Oncology Comprehensive" }, url: "https://www.illumina.com/products/by-type/clinical-research-products/trusight-oncology-500.html", technologies: ["cgp"] }),
  t({ id: "trusight-oncology-comprehensive", name: "Illumina TruSight Oncology Comprehensive", companyId: "illumina", sample: "tissue", scope: "targeted-panel",
    returns: "The in vitro diagnostic form of the TSO 500 content, reporting variants across the same gene set with companion diagnostic claims for fusion-directed drugs.",
    regulatory: { us: "FDA approved (2024)", eu: "CE marked" }, url: "https://www.illumina.com/products/by-type/ivd-products/trusight-oncology-comprehensive.html", drugId: "trusight-oncology-comprehensive", technologies: ["cgp", "companion-diagnostic"] }),
  t({ id: "mychoice-cdx", name: "Myriad myChoice CDx", companyId: "myriad-genetics", sample: "tissue", scope: "targeted-panel",
    returns: "BRCA1 and BRCA2 status and a genomic instability score combining loss of heterozygosity, telomeric allelic imbalance and large-scale transitions, reported together as homologous recombination deficiency status.",
    regulatory: { us: "FDA approved (2019) as a companion diagnostic for PARP inhibitors" }, url: "https://myriad.com/", drugId: "mychoice-cdx", technologies: ["companion-diagnostic", "cgp"] }),
  t({ id: "signatera", name: "Natera Signatera", companyId: "natera", sample: "blood", scope: "mrd",
    returns: "A tumour-informed residual disease result: whole exome sequencing of the tumour and normal picks 16 patient-specific variants, which are then tracked in serial blood samples and reported as detected or not detected with a level.",
    regulatory: { us: "Laboratory-developed test (CLIA laboratory) with FDA Breakthrough Device designations" }, url: "https://www.natera.com/oncology/", drugId: "signatera", technologies: ["mrd-testing", "liquid-biopsy"] }),
  t({ id: "altera", name: "Natera Altera", companyId: "natera", sample: "tissue", scope: "exome",
    returns: "Whole exome sequencing of the tumour reporting mutations, copy number and fusions, tumour mutational burden and microsatellite status, matched to therapies and trials; the same exome data seeds a Signatera panel.",
    regulatory: { us: "Laboratory-developed test (CLIA laboratory)" }, url: "https://www.natera.com/oncology/", technologies: ["wes-wgs", "cgp"] }),
  t({ id: "oncotype-dx-breast", name: "Exact Sciences Oncotype DX Breast Recurrence Score", companyId: "exact-sciences", sample: "tissue", scope: "targeted-panel",
    returns: "A 21-gene expression Recurrence Score from 0 to 100 for early hormone receptor positive, HER2 negative breast cancer, estimating the benefit of adding chemotherapy to endocrine therapy.",
    regulatory: { us: "Laboratory-developed test (CLIA laboratory)" }, url: "https://www.oncotypeiq.com/", drugId: "oncotype-dx", technologies: ["gene-expression-prognostic-assays"],
    note: "Not a mutation test: it measures expression of 21 genes to predict recurrence risk and chemotherapy benefit." }),
  t({ id: "oncoextra", name: "Exact Sciences OncoExTra", companyId: "exact-sciences", sample: "tissue", scope: "exome-transcriptome",
    returns: "Whole exome and whole transcriptome sequencing of tumour with matched normal, reporting mutations, copy number, fusions, expression, tumour mutational burden and microsatellite status.",
    regulatory: { us: "Laboratory-developed test (CLIA laboratory)" }, url: "https://www.exactsciences.com/", technologies: ["wes-wgs", "cgp", "rna-seq"] }),
  t({ id: "omniseq-insight", name: "Labcorp OmniSeq INSIGHT", companyId: "labcorp", sample: "tissue", scope: "targeted-panel",
    returns: "DNA and RNA sequencing across several hundred genes plus immune gene expression, reporting mutations, fusions, tumour mutational burden, microsatellite status and PD-L1 in one report.",
    regulatory: { us: "Laboratory-developed test (CLIA laboratory)" }, url: "https://www.labcorp.com/", technologies: ["cgp", "reference-laboratories"] }),
];


/** Companies named in the table that had no record. */
export const tumourTestCompanies: CompanyInput[] = [
  // strata-oncology lives in diagnostics-wave1.ts

];

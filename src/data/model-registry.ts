/**
 * Model and dataset registry: comparable structured fields for the foundation models (technologies tagged
 * `foundation-model` or `risk-model`) and the training datasets (collections) already in the corpus.
 *
 * Keyed by the existing entity id, so every row links to a page and nothing here duplicates a name or summary.
 * Figures (parameters, training-set size) are those the developers reported in the paper or model card linked from
 * the entity; where a figure is not public the field is left out rather than estimated. `weights` describes how the
 * model can be obtained today: open (download without gating), gated (download after accepting terms or a request
 * form), request (academic access by application), api (hosted access only), proprietary (not available).
 * Licence strings are copied from the model card or repository; blank means we have not verified one.
 *
 * Rendered at /models/ as a faceted table.
 */
export type ModelModality = "histology" | "radiology" | "single-cell" | "DNA" | "protein" | "multimodal" | "clinical-text" | "phenomics" | "EHR";
export type Weights = "open" | "gated" | "request" | "api" | "proprietary";

export type ModelRecord = {
  id: string;
  modality: ModelModality;
  /** Parameter count as reported, in millions. */
  parametersM?: number;
  /** Training data in one line, with the unit the developers used. */
  trainingData: string;
  weights: Weights;
  licence?: string;
  /** Reported benchmark result, quoted from the paper or model card, with what it was measured on. */
  benchmark?: string;
  /** Paper DOI or arXiv id for the primary reference. */
  paper?: string;
  /** Model-card or repository URL. */
  weightsUrl?: string;
  /** Dataset collection ids in the corpus that the model was trained on or benchmarked against. */
  datasets?: string[];
  year: number;
};

export type DatasetRecord = {
  id: string;
  /** Size in the unit the maintainers use. */
  size: string;
  modality: ModelModality | "clinical" | "mixed";
  access: "open" | "registered" | "controlled" | "commercial";
  /** Consent and reuse conditions in one line. */
  consent: string;
  /** Model ids in the corpus that were trained on this dataset. */
  usedBy?: string[];
  year?: number;
};

const hf = (repo: string) => `https://huggingface.co/${repo}`;
const gh = (repo: string) => `https://github.com/${repo}`;

export const models: ModelRecord[] = [
  // ---- Pathology ----
  { id: "uni-conch", modality: "histology", parametersM: 307, trainingData: "UNI: 100 million tiles from 100,000 slides across 20 tissue types (Mass-100K). CONCH: 1.17 million image-caption pairs.", weights: "gated", licence: "CC BY-NC-ND 4.0", benchmark: "UNI: best or tied-best on 34 clinical tasks in the paper; CONCH: zero-shot classification and retrieval across 14 tasks.", paper: "10.1038/s41591-024-02857-3", weightsUrl: hf("MahmoodLab/UNI"), datasets: ["tcga-gdc", "pathology-benchmarks"], year: 2024 },
  { id: "virchow", modality: "histology", parametersM: 1900, trainingData: "Virchow: 1.5 million slides from MSK (632M parameters). Virchow2 and Virchow2G: 3.1 million slides from MSK and global sites at mixed magnification.", weights: "gated", licence: "CC BY-NC-ND 4.0 (Virchow2 model card)", benchmark: "Pan-cancer detection AUC 0.95 across 17 cancer types, including rare cancers, in the Virchow paper.", paper: "10.1038/s41591-024-03141-0", weightsUrl: hf("paige-ai/Virchow2"), year: 2024 },
  { id: "prov-gigapath", modality: "histology", parametersM: 1300, trainingData: "1.3 billion tiles from 171,189 whole slides from more than 30,000 Providence patients.", weights: "gated", licence: "Prov-GigaPath licence (research use; see model card)", benchmark: "Best on 25 of 26 tasks in the paper, including mutation prediction and cancer subtyping.", paper: "10.1038/s41586-024-07441-w", weightsUrl: hf("prov-gigapath/prov-gigapath"), datasets: ["tcga-gdc"], year: 2024 },
  { id: "chief", modality: "histology", trainingData: "Pretrained on 15 million tiles, then 60,530 slides; validated on 19,400 slides from 24 hospitals.", weights: "gated", licence: "AGPL-3.0 (code repository)", benchmark: "Cancer detection accuracy up to 94% and improvement of about 36% over prior deep-learning methods on external cohorts (paper).", paper: "10.1038/s41586-024-07894-z", weightsUrl: gh("hms-dbmi/CHIEF"), datasets: ["tcga-gdc", "cptac"], year: 2024 },
  { id: "titan", modality: "multimodal", trainingData: "335,645 whole slides (Mass-340K) with vision-only and vision-language pretraining; slide-level embeddings.", weights: "gated", licence: "CC BY-NC-ND 4.0", benchmark: "Slide-level retrieval, prognosis and report generation; outperformed patch-based aggregation in the paper.", paper: "arXiv:2411.19666", weightsUrl: hf("MahmoodLab/TITAN"), year: 2024 },
  { id: "musk", modality: "multimodal", trainingData: "50 million pathology images and 1 billion pathology-related text tokens.", weights: "gated", licence: "CC BY-NC-ND 4.0", benchmark: "Better prediction of immunotherapy response and prognosis than single-modality models across cancers (paper).", paper: "10.1038/s41586-024-08378-w", weightsUrl: hf("xiangjx/musk"), year: 2025 },
  { id: "h-optimus", modality: "histology", parametersM: 1100, trainingData: "Hundreds of millions of tiles from 500,000 slides (H-optimus-0).", weights: "open", licence: "Apache 2.0", paper: "Model card (Bioptimus, 2024)", weightsUrl: hf("bioptimus/H-optimus-0"), year: 2024 },
  { id: "phikon", modality: "histology", parametersM: 307, trainingData: "Phikon: 43 million tiles from TCGA. Phikon-v2: 460 million tiles from 58 million slides of 30 cancer types (PANCAN-XL).", weights: "open", licence: "Owkin non-commercial licence (model card)", paper: "arXiv:2409.09173", weightsUrl: hf("owkin/phikon-v2"), datasets: ["tcga-gdc"], year: 2024 },
  { id: "hibou", modality: "histology", parametersM: 307, trainingData: "Over 1 million slides (Hibou-B 86M parameters; Hibou-L 307M).", weights: "open", licence: "Apache 2.0", paper: "arXiv:2406.05074", weightsUrl: hf("histai/hibou-L"), year: 2024 },
  { id: "kaiko-midnight", modality: "histology", trainingData: "12,000 TCGA slides (Midnight-12k) with a combined DINOv2 and high-resolution objective.", weights: "open", licence: "MIT (model card)", benchmark: "Leading scores on the eva pathology benchmark suite with a fraction of competitors' training slides (kaiko.ai).", paper: "kaiko.ai technical report (2025)", weightsUrl: hf("kaiko-ai/midnight"), datasets: ["tcga-gdc", "pathology-benchmarks"], year: 2025 },
  { id: "pluto", modality: "histology", trainingData: "195 million tiles from 158,000 slides across more than 50 sites, multi-scale.", weights: "proprietary", benchmark: "Powers PathAI AISight and biomarker quantification products; results in the arXiv report.", paper: "arXiv:2407.07033", year: 2024 },
  { id: "atlas-aignostics", modality: "histology", trainingData: "1.2 million slides from Mayo Clinic and Charité across scanners and stains.", weights: "proprietary", benchmark: "Top scores on public benchmark tasks reported in the arXiv paper.", paper: "arXiv:2501.05409", year: 2025 },
  // ---- Radiology and risk ----
  { id: "medsam", modality: "radiology", trainingData: "1.57 million image-mask pairs across 10 imaging modalities and more than 30 cancer types.", weights: "open", licence: "Apache 2.0", benchmark: "Median Dice above specialist models on internal and external validation (paper).", paper: "10.1038/s41467-024-44824-z", weightsUrl: gh("bowang-lab/MedSAM"), datasets: ["tcia"], year: 2024 },
  { id: "ct-fm", modality: "radiology", trainingData: "148,000 whole-body CT scans, self-supervised.", weights: "open", paper: "arXiv:2501.09001", weightsUrl: hf("project-lighter/ct_fm_feature_extractor"), datasets: ["tcia", "imaging-data-commons"], year: 2025 },
  { id: "merlin-ct", modality: "multimodal", trainingData: "6 million images from 15,331 abdominal CTs with 6 million EHR diagnosis codes and 1.8 million reports.", weights: "gated", paper: "arXiv:2406.06512", weightsUrl: hf("stanfordmimi/Merlin"), year: 2024 },
  { id: "radfm", modality: "radiology", parametersM: 14000, trainingData: "MedMD: 16 million 2D and 3D scans with text.", weights: "open", paper: "arXiv:2308.02463", weightsUrl: gh("chaoyi-wu/RadFM"), year: 2023 },
  { id: "sybil", modality: "radiology", trainingData: "Low-dose CT scans from the National Lung Screening Trial; validated at MGH and in Taiwan.", weights: "open", licence: "MIT", benchmark: "One-year lung cancer risk AUC 0.86 to 0.94 across validation sets (JCO 2023).", paper: "10.1200/JCO.22.01345", weightsUrl: gh("reginabarzilaygroup/Sybil"), datasets: ["cdas-nlst-plco"], year: 2023 },
  { id: "mirai", modality: "radiology", trainingData: "Mammograms from MGH; validated across seven hospitals in several countries.", weights: "request", benchmark: "Five-year breast cancer risk C-index 0.76 to 0.81 across sites (Sci Transl Med 2021).", paper: "10.1126/scitranslmed.aba4373", weightsUrl: gh("yala/Mirai"), year: 2021 },
  { id: "aidoc-care", modality: "radiology", trainingData: "Not disclosed; underpins FDA-cleared triage products.", weights: "proprietary", year: 2025 },
  // ---- Single-cell and perturbation ----
  { id: "scgpt", modality: "single-cell", trainingData: "33 million cells (CELLxGENE).", weights: "open", licence: "MIT", paper: "10.1038/s41592-024-02201-0", weightsUrl: gh("bowang-lab/scGPT"), datasets: ["cellxgene-hca"], year: 2024 },
  { id: "geneformer", modality: "single-cell", trainingData: "Genecorpus-30M (about 30 million cells), later 95 million cells.", weights: "open", licence: "Apache 2.0", paper: "10.1038/s41586-023-06139-9", weightsUrl: hf("ctheodoris/Geneformer"), datasets: ["cellxgene-hca"], year: 2023 },
  { id: "scfoundation", modality: "single-cell", parametersM: 100, trainingData: "Over 50 million cells across all about 19,000 human genes.", weights: "open", paper: "10.1038/s41592-024-02305-7", weightsUrl: gh("biomap-research/scFoundation"), year: 2024 },
  { id: "universal-cell-embedding", modality: "single-cell", trainingData: "36 million cells across 8 species, using protein embeddings of genes.", weights: "open", licence: "MIT", paper: "bioRxiv 10.1101/2023.11.28.568918", weightsUrl: gh("snap-stanford/UCE"), datasets: ["cellxgene-hca"], year: 2023 },
  { id: "state-arc", modality: "single-cell", trainingData: "State transition model: over 100 million perturbed cells including Tahoe-100M; embedding model: 167 million human cells.", weights: "open", licence: "Apache 2.0 (repository)", benchmark: "Reference entry for the Arc Virtual Cell Challenge (2025).", paper: "bioRxiv 10.1101/2025.06.26.661135", weightsUrl: gh("ArcInstitute/state"), datasets: ["tahoe-100m", "arc-virtual-cell-atlas"], year: 2025 },
  { id: "c2s-scale", modality: "single-cell", parametersM: 27000, trainingData: "Cell sentences from more than 50 million cells plus biological text, on Gemma-2 backbones up to 27B.", weights: "open", licence: "Gemma terms of use (model card)", benchmark: "Predicted that silmitasertib raises antigen presentation under low interferon; validated in vitro (paper).", paper: "bioRxiv 10.1101/2025.04.14.648850", weightsUrl: hf("vandijklab/C2S-Scale-Gemma-2-27B"), datasets: ["cellxgene-hca"], year: 2025 },
  { id: "transcriptformer", modality: "single-cell", trainingData: "112 million cells across 12 species.", weights: "open", paper: "CZI Virtual Cells Platform (2025)", weightsUrl: "https://virtualcellmodels.cziscience.com", datasets: ["cellxgene-hca"], year: 2025 },
  { id: "nicheformer", modality: "single-cell", trainingData: "110 million cells: 57 million dissociated and 53 million spatially resolved.", weights: "open", paper: "bioRxiv 10.1101/2024.04.15.589472", weightsUrl: gh("theislab/nicheformer"), year: 2024 },
  { id: "cellfm", modality: "single-cell", parametersM: 800, trainingData: "About 100 million human cells.", weights: "open", paper: "bioRxiv 10.1101/2024.06.04.597369", weightsUrl: gh("biomed-AI/CellFM"), year: 2024 },
  { id: "genept", modality: "single-cell", trainingData: "GPT-3.5 embeddings of NCBI gene summaries; no single-cell pretraining.", weights: "open", paper: "bioRxiv 10.1101/2023.10.16.562533", weightsUrl: gh("yiqunchen/GenePT"), year: 2023 },
  // ---- Genome ----
  { id: "evo2", modality: "DNA", parametersM: 40000, trainingData: "9.3 trillion nucleotides across all domains of life (OpenGenome2); 7B and 40B parameter models, 1 million token context.", weights: "open", licence: "Apache 2.0", benchmark: "Zero-shot BRCA1 variant pathogenicity prediction competitive with supervised methods (paper).", paper: "bioRxiv 10.1101/2025.02.18.638918", weightsUrl: hf("arcinstitute/evo2_40b"), year: 2025 },
  { id: "alphagenome", modality: "DNA", trainingData: "Human and mouse reference genomes with thousands of functional genomics tracks; 1 megabase input at single-base resolution.", weights: "open", weightsUrl: "https://github.com/google-deepmind/alphagenome_research", licence: "API terms (non-commercial preview)", benchmark: "Matched or beat specialist models on 22 of 24 sequence prediction and 24 of 26 variant-effect tasks (DeepMind).", paper: "10.1038/s41586-025-09937-1", weightsUrl: "https://deepmind.google/science/alphagenome/", year: 2025 },
  { id: "alphamissense", modality: "protein", trainingData: "Fine-tuned from AlphaFold on population frequency data; scored all 71 million possible human missense variants.", weights: "open", licence: "CC BY 4.0 (predictions); code CC BY-NC-SA", benchmark: "Classified 89% of missense variants as likely benign or likely pathogenic (Science 2023).", paper: "10.1126/science.adg7492", weightsUrl: gh("google-deepmind/alphamissense"), year: 2023 },
  { id: "enformer-borzoi", modality: "DNA", trainingData: "Enformer: 200 kb input, thousands of epigenomic tracks. Borzoi: 524 kb input, RNA-seq coverage across human and mouse.", weights: "open", licence: "Apache 2.0", paper: "10.1038/s41592-021-01252-x", weightsUrl: gh("calico/borzoi"), year: 2021 },
  { id: "nucleotide-transformer", modality: "DNA", parametersM: 2500, trainingData: "3,202 human genomes and 850 species genomes.", weights: "open", licence: "CC BY-NC-SA 4.0", paper: "10.1038/s41592-024-02523-z", weightsUrl: hf("InstaDeepAI/nucleotide-transformer-2.5b-multi-species"), year: 2024 },
  // ---- Structure and protein design ----
  { id: "alphafold3", modality: "protein", trainingData: "Protein Data Bank structures and distillation sets across proteins, nucleic acids, ligands and ions.", weights: "request", licence: "Code CC BY-NC-SA 4.0; weights for non-commercial academic use on request", benchmark: "At least 50% better ligand-interaction accuracy than prior methods on PoseBusters (paper).", paper: "10.1038/s41586-024-07487-w", weightsUrl: gh("google-deepmind/alphafold3"), year: 2024 },
  { id: "boltz", modality: "protein", trainingData: "PDB and distillation data; Boltz-2 adds binding-affinity training.", weights: "open", licence: "MIT", benchmark: "Boltz-1 matched AlphaFold 3 accuracy; Boltz-2 affinity prediction approached FEP+ at about 1,000 times lower cost (preprint).", paper: "bioRxiv 10.1101/2024.11.19.624167", weightsUrl: gh("jwohlwend/boltz"), year: 2024 },
  { id: "chai-1", modality: "protein", trainingData: "PDB-derived structures; Chai-2 trained for antibody and binder design.", weights: "open", licence: "Chai-1 code Apache 2.0; weights under Chai Discovery licence (non-commercial)", benchmark: "Chai-2: about 16% zero-shot binder hit rate across dozens of targets in wet-lab tests (company report).", paper: "bioRxiv 10.1101/2024.10.10.615955", weightsUrl: gh("chaidiscovery/chai-lab"), year: 2024 },
  { id: "esm3", modality: "protein", parametersM: 98000, trainingData: "2.78 billion protein sequences with structure and function tokens.", weights: "open", licence: "EvolutionaryScale Cambrian licence (non-commercial) for the open 1.4B model; larger models via API", benchmark: "Generated esmGFP, a functional fluorescent protein 58% identical to its nearest known relative (Science 2025).", paper: "10.1126/science.ads0018", weightsUrl: hf("EvolutionaryScale/esm3-sm-open-v1"), year: 2025 },
  { id: "rfdiffusion", modality: "protein", trainingData: "PDB structures; fine-tuned from RoseTTAFold.", weights: "open", licence: "BSD (code)", benchmark: "Experimentally validated binders, symmetric assemblies and enzyme active sites across the paper's design tasks.", paper: "10.1038/s41586-023-06415-8", weightsUrl: gh("RosettaCommons/RFdiffusion"), year: 2023 },
  { id: "bioemu", modality: "protein", trainingData: "Molecular dynamics ensembles and experimental folding free energies.", weights: "open", licence: "MIT", paper: "10.1126/science.adv9817", weightsUrl: gh("microsoft/bioemu"), year: 2025 },
  // ---- Phenomics, clinical text, EHR, multimodal ----
  { id: "phenom-2", modality: "phenomics", parametersM: 1900, trainingData: "8 billion cell-painting images (Recursion).", weights: "proprietary", year: 2024 },
  { id: "med-gemini", modality: "clinical-text", trainingData: "Gemini models fine-tuned on medical text, images and genomics.", weights: "api", benchmark: "91.1% on MedQA (USMLE) in the arXiv report.", paper: "arXiv:2404.18416", year: 2024 },
  { id: "foresight-ehr", modality: "EHR", trainingData: "Coded EHR timelines from King's College Hospital and South London and Maudsley; Foresight 2 extended to more than 5 million patients.", weights: "request", paper: "10.1016/S2589-7500(24)00025-6", year: 2024 },
  { id: "tempus-multimodal", modality: "multimodal", trainingData: "Tempus clinico-genomic and imaging data; details in company publications.", weights: "proprietary", year: 2024 },
];

export const datasets: DatasetRecord[] = [
  { id: "tahoe-100m", size: "100 million single-cell profiles; 1,100 drugs; 50 cell lines", modality: "single-cell", access: "open", consent: "Cell lines only; CC BY release.", usedBy: ["state-arc"], year: 2025 },
  { id: "arc-virtual-cell-atlas", size: "Hundreds of millions of cells (observational and perturbational)", modality: "single-cell", access: "open", consent: "Harmonised public datasets; per-dataset licences apply.", usedBy: ["state-arc"], year: 2025 },
  { id: "cellxgene-hca", size: "Tens of millions of annotated single cells", modality: "single-cell", access: "open", consent: "CC BY; donor consent handled by contributing studies.", usedBy: ["scgpt", "geneformer", "universal-cell-embedding", "c2s-scale", "transcriptformer"] },
  { id: "tcga-gdc", size: "More than 11,000 tumours across 33 cancer types (TCGA) plus TARGET and CPTAC", modality: "mixed", access: "controlled", consent: "Open for processed data; dbGaP authorisation for raw sequence and germline.", usedBy: ["uni-conch", "prov-gigapath", "chief", "phikon", "kaiko-midnight"], year: 2006 },
  { id: "cptac", size: "Proteogenomic profiles on more than 1,000 TCGA-linked tumours", modality: "mixed", access: "controlled", consent: "Open processed data; controlled raw data through dbGaP.", usedBy: ["chief"] },
  { id: "tcia", size: "More than 200 imaging collections (CT, MRI, PET, pathology)", modality: "radiology", access: "open", consent: "De-identified; mostly CC BY, some collections restricted.", usedBy: ["medsam", "ct-fm"], year: 2011 },
  { id: "imaging-data-commons", size: "Cloud copy of TCIA and other collections in DICOM", modality: "radiology", access: "open", consent: "Per collection; queryable with BigQuery.", usedBy: ["ct-fm"] },
  { id: "depmap", size: "Genome-wide CRISPR and drug screens on more than 1,000 cell lines", modality: "mixed", access: "open", consent: "Cell lines only; CC BY 4.0.", year: 2017 },
  { id: "genie", size: "More than 200,000 sequenced tumours from 19 institutions", modality: "clinical", access: "registered", consent: "De-identified clinico-genomic data via cBioPortal and Synapse; Biopharma Collaborative adds outcomes.", year: 2017 },
  { id: "uk-biobank", size: "500,000 participants; whole genomes, imaging, proteomics, linked cancer registry", modality: "mixed", access: "registered", consent: "Approved researchers only; broad consent with linkage; no return of individual results.", year: 2006 },
  { id: "all-of-us", size: "More than 250,000 whole genomes; target one million participants", modality: "mixed", access: "registered", consent: "Registered and controlled tiers via the Researcher Workbench; emphasis on under-represented groups.", year: 2018 },
  { id: "pathology-benchmarks", size: "CAMELYON16/17, PANDA (11,000 biopsies) and TCGA slide tasks", modality: "histology", access: "open", consent: "CC BY-NC-SA and per-challenge terms.", usedBy: ["uni-conch", "kaiko-midnight"] },
  { id: "cancer-models", size: "Thousands of PDX, organoid and cell-line models across providers", modality: "mixed", access: "open", consent: "Model metadata open; models by request from providers." },
  { id: "flatiron-foundation-cgdb", size: "More than 100,000 US patients with linked EHR outcomes and genomic profiles", modality: "clinical", access: "commercial", consent: "De-identified under HIPAA; commercial and research licences." },
  { id: "cdas-nlst-plco", size: "NLST: 53,000 participants with low-dose CT; PLCO screening data", modality: "radiology", access: "controlled", consent: "Data access request to NCI CDAS.", usedBy: ["sybil"] },
  { id: "cosmic", size: "Curated somatic mutations across millions of samples; Cancer Gene Census of about 750 genes", modality: "DNA", access: "registered", consent: "Free academic registration; commercial licence." },
  { id: "cbioportal", size: "More than 300 cancer genomics studies", modality: "DNA", access: "open", consent: "Per-study; public studies are de-identified." },
  { id: "civic", size: "Thousands of curated clinical variant interpretations", modality: "DNA", access: "open", consent: "CC0." },
  { id: "oncokb", size: "Precision oncology knowledge base with FDA-recognised levels of evidence", modality: "DNA", access: "registered", consent: "Free academic licence; commercial licence." },
  { id: "open-targets", size: "Target-disease evidence for about 60,000 targets", modality: "mixed", access: "open", consent: "CC0 and per-source licences." },
  { id: "hpa", size: "Protein expression across tissues, cancers and single cells", modality: "histology", access: "open", consent: "CC BY-SA 4.0." },
];

export const modelFor = (id: string): ModelRecord | undefined => models.find((m) => m.id === id);
export const datasetFor = (id: string): DatasetRecord | undefined => datasets.find((d) => d.id === id);

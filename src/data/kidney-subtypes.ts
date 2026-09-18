/**
 * Renal cell carcinoma subtypes (17 Sept 2026): clear cell, papillary and chromophobe renal cell carcinoma as pages under the
 * kidney cancer record, because their genetics, drug sensitivity and hereditary syndromes differ. Facts follow the WHO 2022
 * classification, the ESMO and NCCN guidelines and the trial publications named in each record. Registered in
 * src/data/index.ts as kidneySubtypes.
 */
import type { CancerInput } from "@/lib/schema";

const asOf = "2026-09-17";
const W = (s: string) => `https://en.wikipedia.org/wiki/${s}`;
const tags = ["subtype-page"];

export const kidneySubtypes: CancerInput[] = [
  { id: "clear-cell-rcc", kind: "cancer", name: "Clear cell renal cell carcinoma", group: "genitourinary", parent: "rcc", asOf, tags, wikipedia: W("Clear-cell_renal_cell_carcinoma"),
    keyPapers: ["paper-keynote-564-nejm-2021", "paper-clear-nejm-2021", "paper-keynote-426-nejm-2019", "paper-checkmate-214-nejm-2018"],
    aka: ["ccRCC", "Conventional renal cell carcinoma"],
    burden: "About three quarters of kidney cancers and most of the deaths; a third of patients present with or develop metastases, and immunotherapy combinations have lifted median survival in advanced disease to around four years.",
    tldr: "Clear cell is the common kidney cancer, driven by loss of the VHL gene that leaves the tumour behaving as if starved of oxygen and flooding itself with blood vessels. That biology explains why anti-angiogenic drugs, immunotherapy and the HIF-2 alpha blocker belzutifan all work.",
    summary: "Clear cell renal cell carcinoma arises from the proximal tubule and in about nine in ten cases has lost the VHL gene on chromosome 3p, stabilising HIF-2 alpha and driving VEGF, so tumours are highly vascular; PBRM1, SETD2 and BAP1 mutations shape its behaviour. Small tumours are removed by partial nephrectomy or ablated, and some are watched. Adjuvant pembrolizumab after nephrectomy improves survival in higher-risk disease (KEYNOTE-564). Metastatic disease is treated first line with an immunotherapy doublet: pembrolizumab with axitinib or lenvatinib, nivolumab with cabozantinib, or nivolumab with ipilimumab for intermediate- and poor-risk patients; cabozantinib, axitinib, tivozanib and belzutifan follow. Belzutifan, the first HIF-2 alpha inhibitor, was approved for VHL disease in 2021 and for previously treated advanced disease in 2023. Cytoreductive nephrectomy is now reserved for selected patients after CARMENA.",
    subtypes: ["Sporadic clear cell (VHL-inactivated)", "Clear cell with sarcomatoid or rhabdoid features (aggressive, immunotherapy-responsive)", "VHL disease-associated (hereditary, multifocal)", "Clear cell papillary renal cell tumour (indolent, separate in WHO 2022)"],
    biomarkers: ["VHL inactivation and 3p loss", "PBRM1, SETD2, BAP1 mutations (prognosis)", "IMDC risk group (metastatic disease)", "Sarcomatoid features", "Germline VHL testing in young or multifocal disease"],
    terms: ["bap1-loss"],
    standardOfCare: [
      { setting: "Small renal mass", approach: "Partial nephrectomy, thermal ablation or active surveillance by size, growth and patient fitness.", refs: ["thermal-ablation", "cryoablation", "active-surveillance"] },
      { setting: "Localised, higher risk", approach: "Radical or partial nephrectomy followed by one year of adjuvant pembrolizumab (KEYNOTE-564, overall survival benefit).", refs: ["pembrolizumab", "keynote-564"] },
      { setting: "Metastatic, first line", approach: "Pembrolizumab plus axitinib (KEYNOTE-426) or lenvatinib, nivolumab plus cabozantinib, or nivolumab plus ipilimumab (CheckMate 214) for intermediate and poor risk; cytoreductive nephrectomy only in selected patients.", refs: ["pembrolizumab", "axitinib", "lenvatinib", "nivolumab", "cabozantinib", "ipilimumab", "keynote-426", "checkmate-214"] },
      { setting: "Later lines", approach: "Cabozantinib, axitinib, belzutifan (LITESPARK-005), lenvatinib plus everolimus, tivozanib.", refs: ["cabozantinib", "belzutifan", "everolimus", "hif2a"] },
      { setting: "VHL disease", approach: "Belzutifan for kidney, pancreatic and CNS tumours that would otherwise need surgery; surveillance of the kidneys with nephron-sparing surgery when tumours reach 3 cm.", refs: ["belzutifan"] },
    ],
    stateOfArt: ["Immunotherapy doublets cure a small fraction of metastatic patients and control most for years, with the nivolumab-ipilimumab plateau the clearest sign of durable benefit.", "Belzutifan is the first drug to target the transcription factor at the root of the disease, forty years after VHL was mapped.", "Adjuvant pembrolizumab is the first adjuvant treatment ever to lengthen survival in kidney cancer."],
    history: [
      { year: 1993, title: "VHL gene identified" },
      { year: 2005, title: "Sorafenib and sunitinib open the anti-angiogenic era", refs: ["sunitinib"] },
      { year: 2015, title: "Nivolumab beats everolimus after anti-angiogenic therapy (CheckMate 025)", refs: ["nivolumab"] },
      { year: 2018, title: "Nivolumab plus ipilimumab first line (CheckMate 214)", refs: ["checkmate-214"] },
      { year: 2019, title: "Pembrolizumab plus axitinib first line (KEYNOTE-426)", refs: ["keynote-426"] },
      { year: 2021, title: "Belzutifan approved for VHL disease; adjuvant pembrolizumab (KEYNOTE-564)", refs: ["belzutifan", "keynote-564"] },
    ],
    pipeline: ["belzutifan","hif2a"], openProblems: ["No validated biomarker chooses between immunotherapy doublets.", "Most metastatic patients still progress within two to three years.", "Overtreatment of small renal masses versus the risk of surveillance."],
    links: [{ label: "Wikipedia", url: W("Clear-cell_renal_cell_carcinoma") }] },
  { id: "papillary-rcc", kind: "cancer", name: "Papillary renal cell carcinoma", group: "genitourinary", parent: "rcc", asOf, tags, wikipedia: W("Papillary_renal_cell_carcinomas"),
    keyPapers: ["paper-who-2022-gu-moch-eur-urol-2022", "paper-aspen-armstrong-lancet-oncol-2016", "paper-papmet-pal-lancet-2021", "paper-tcga-papillary-rcc-nejm-2016"],
    aka: ["pRCC", "Papillary RCC"],
    burden: "Ten to fifteen percent of kidney cancers, commoner in men, in Black patients and in end-stage kidney disease; localised tumours do well after surgery, while metastatic disease has fared worse than clear cell cancer on the same drugs.",
    tldr: "Papillary kidney cancer is the second commonest type and does not share the VHL biology of clear cell cancer, so the drugs work differently: the MET-targeting drug cabozantinib beat sunitinib in the first trial run just for this disease, and two hereditary syndromes account for some cases.",
    summary: "Papillary renal cell carcinoma is a heterogeneous group defined by papillary architecture; the older split into type 1 and type 2 has given way to molecular groups in the WHO 2022 classification. MET alterations (mutation, amplification, chromosome 7 gain) are frequent, especially in the former type 1, and are inherited in hereditary papillary renal carcinoma. Fumarate hydratase-deficient renal cancer, from the hereditary leiomyomatosis and renal cell cancer syndrome, is an aggressive form once labelled type 2. Localised tumours are treated like other kidney cancers with surgery or ablation. For metastatic disease the PAPMET trial showed cabozantinib gave longer progression-free survival and more responses than sunitinib, making it the preferred first-line option; savolitinib is active in MET-driven tumours (SAVOIR), and immunotherapy combinations have shown activity in single-arm studies.",
    subtypes: ["MET-altered papillary renal cell carcinoma (former type 1)", "Hereditary papillary renal carcinoma (germline MET)", "Fumarate hydratase-deficient renal cell carcinoma (HLRCC syndrome)", "Papillary renal neoplasm with reverse polarity (indolent)"],
    biomarkers: ["MET mutation, amplification or chromosome 7 gain", "Fumarate hydratase loss (2SC immunohistochemistry) with germline FH testing", "CDKN2A loss (poor outlook)", "Germline MET testing in young or multifocal disease"],
    standardOfCare: [
      { setting: "Localised", approach: "Partial or radical nephrectomy, ablation or surveillance as for other kidney cancers; adjuvant therapy evidence is thin.", refs: ["thermal-ablation", "active-surveillance"] },
      { setting: "Metastatic", approach: "Cabozantinib first line (PAPMET); savolitinib for MET-driven tumours; immunotherapy combinations on single-arm data; clinical trials preferred.", refs: ["cabozantinib", "savolitinib", "met", "sunitinib", "pembrolizumab"] },
      { setting: "Hereditary syndromes", approach: "Early surgery for FH-deficient tumours because they spread early; surveillance in MET carriers; genetic counselling of relatives.", refs: ["met"] },
    ],
    stateOfArt: ["PAPMET was the first randomised trial in papillary kidney cancer and ended the practice of borrowing clear cell regimens unchanged.", "The molecular reclassification is replacing the type 1 and type 2 labels with actionable groups.", "FH-deficient cancer is now recognised as a distinct aggressive entity needing early treatment."],
    history: [
      { year: 1997, title: "Delahunt and Eble separate type 1 and type 2 papillary carcinoma" },
      { year: 2002, title: "Fumarate hydratase mutations found in HLRCC" },
      { year: 2021, title: "PAPMET: cabozantinib beats sunitinib", refs: ["cabozantinib"] },
      { year: 2022, title: "WHO drops type 1 and 2 in favour of molecular groups" },
    ],
    pipeline: ["savolitinib","cabozantinib"], openProblems: ["Small trials; most evidence is extrapolated from clear cell disease.", "No approved therapy specific to FH-deficient cancer.", "Which patients benefit from immunotherapy."],
    links: [{ label: "Wikipedia", url: W("Papillary_renal_cell_carcinomas") }] },
  { id: "chromophobe-rcc", kind: "cancer", name: "Chromophobe renal cell carcinoma", group: "genitourinary", parent: "rcc", asOf, tags, wikipedia: W("Chromophobe_renal_cell_carcinoma")
    , keyPapers: ["paper-who-2022-gu-moch-eur-urol-2022", "paper-tcga-chromophobe-davis-cancer-cell-2014", "paper-aspen-armstrong-lancet-oncol-2016"]
    , aka: ["chRCC"],
    burden: "About five percent of kidney cancers, with the best outlook of the common types: fewer than one in ten spread, and those that do are often slow, but sarcomatoid change turns it deadly.",
    tldr: "Chromophobe kidney cancer comes from a different cell of the kidney's tubules, usually behaves gently and is cured by surgery. Its rare metastatic form responds poorly to immunotherapy, so kinase and mTOR inhibitors are used, and it runs in families with Birt-Hogg-Dube syndrome.",
    summary: "Chromophobe renal cell carcinoma arises from the intercalated cells of the collecting duct and is marked by loss of whole chromosomes (1, 2, 6, 10, 13, 17, 21) with TP53 and PTEN mutations in a minority; it must be told apart from the benign oncocytoma, which it resembles. It is a feature of Birt-Hogg-Dube syndrome, caused by germline FLCN mutations, along with skin fibrofolliculomas and lung cysts. Most tumours are found early and cured by partial nephrectomy, and surveillance is reasonable for small lesions. Metastatic disease is uncommon, responds poorly to PD-1 blockade and is treated with sunitinib or cabozantinib, everolimus, or lenvatinib plus everolimus, drawing on the mTOR pathway activity seen in the disease; sarcomatoid transformation carries the worst prognosis of any kidney cancer.",
    subtypes: ["Classic chromophobe", "Eosinophilic chromophobe", "Birt-Hogg-Dube-associated (germline FLCN, hybrid oncocytic tumours)", "Chromophobe with sarcomatoid change (aggressive)"],
    biomarkers: ["Multiple whole-chromosome losses", "TP53 and PTEN mutations (poor outlook)", "CK7 and KIT positive, distinguishing it from oncocytoma", "Germline FLCN testing when syndromic features are present"],
    standardOfCare: [
      { setting: "Localised", approach: "Partial nephrectomy or ablation; active surveillance for small tumours; no adjuvant therapy.", refs: ["thermal-ablation", "active-surveillance"] },
      { setting: "Metastatic", approach: "Sunitinib, cabozantinib, everolimus or lenvatinib plus everolimus; immunotherapy has low response rates outside sarcomatoid disease; trials preferred.", refs: ["sunitinib", "cabozantinib", "everolimus", "lenvatinib"] },
      { setting: "Birt-Hogg-Dube syndrome", approach: "Kidney surveillance with MRI, nephron-sparing surgery at 3 cm, and genetic counselling.", refs: ["rcc"] },
    ],
    stateOfArt: ["Recognition of mTOR pathway dependence gave chromophobe cancer a rational medical option after immunotherapy disappointed.", "Molecular tools now reliably separate chromophobe carcinoma from oncocytoma, sparing some patients surgery.", "Registries of rare kidney cancers are producing the first subtype-specific outcome data."],
    history: [
      { year: 1985, title: "Thoenes describes chromophobe renal cell carcinoma" },
      { year: 2002, title: "FLCN identified as the Birt-Hogg-Dube gene" },
      { year: 2014, title: "TCGA maps chromosome losses and TP53 and PTEN mutations" },
    ],
    pipeline: ["lenvatinib","everolimus"], openProblems: ["No randomised trial has ever been run in chromophobe cancer.", "Immunotherapy rarely works and the reason is not understood.", "Sarcomatoid change has no effective treatment."],
    links: [{ label: "Wikipedia", url: W("Chromophobe_renal_cell_carcinoma") }] },
];

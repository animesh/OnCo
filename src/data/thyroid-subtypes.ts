/**
 * Thyroid cancer subtypes (17 Sept 2026): papillary, follicular, medullary and anaplastic thyroid cancer as pages under the
 * thyroid record, because each is a different disease with different genetics, treatment and outlook. Facts follow the
 * American Thyroid Association guidelines, the WHO 2022 classification and the trial publications named in each record.
 * Registered in src/data/index.ts as thyroidSubtypes.
 */
import type { CancerInput } from "@/lib/schema";

const asOf = "2026-09-17";
const W = (s: string) => `https://en.wikipedia.org/wiki/${s}`;
const tags = ["subtype-page"];

export const thyroidSubtypes: CancerInput[] = [
  { id: "papillary-thyroid-cancer", kind: "cancer", name: "Papillary thyroid cancer", group: "endocrine", parent: "thyroid", asOf, tags, wikipedia: W("Papillary_thyroid_cancer"),
    keyPapers: ["paper-ata-2015-thyroid-nodules-dtc-haugen-thyroid-2016", "paper-select-lenvatinib-nejm-2015", "paper-estimabl2-leboulleux-nejm-2022", "paper-ito-kuma-active-surveillance-microcarcinoma-thyroid-2014"],
    aka: ["Papillary thyroid carcinoma", "PTC", "Papillary microcarcinoma (under 1 cm)"],
    burden: "About four in five thyroid cancers; incidence tripled over three decades in many countries mainly through ultrasound detection of small tumours, while deaths barely changed; more than nine in ten patients are alive at ten years.",
    tldr: "Papillary thyroid cancer is the commonest and most curable thyroid cancer. Most people are treated with surgery, some with radioactive iodine afterwards, and many small tumours can simply be watched. Only the rare tumours that stop taking up iodine need targeted drugs.",
    summary: "Papillary thyroid cancer arises from the follicular cells and often spreads to neck lymph nodes but rarely kills. About 60 percent carry a BRAF V600E mutation and others RET or NTRK fusions or RAS mutations. Treatment is lobectomy or total thyroidectomy, with radioactive iodine reserved for intermediate- and high-risk disease after the ESTIMABL2 and IoN trials showed low-risk patients do as well without it; TSH suppression with levothyroxine and thyroglobulin monitoring follow. Japanese studies established that papillary microcarcinomas under a centimetre can be kept under active surveillance, and guidelines now allow it. The minority whose recurrent or metastatic disease no longer takes up iodine are treated with lenvatinib or sorafenib, or with selpercatinib, larotrectinib or dabrafenib-trametinib when the matching alteration is found.",
    subtypes: ["Classic papillary", "Follicular variant", "Tall cell, columnar and hobnail variants (more aggressive)", "Papillary microcarcinoma (under 1 cm)", "Diffuse sclerosing variant"],
    biomarkers: ["BRAF V600E (about 60 percent)", "RET and NTRK fusions", "TERT promoter mutation (worse outlook, especially with BRAF)", "Thyroglobulin after surgery", "ATA risk category (low, intermediate, high)"],
    standardOfCare: [
      { setting: "Papillary microcarcinoma", approach: "Active surveillance with ultrasound or lobectomy; surveillance is safe in most adults after the Kuma Hospital and Memorial Sloan Kettering series.", refs: ["active-surveillance"] },
      { setting: "Low risk", approach: "Lobectomy or total thyroidectomy without radioactive iodine (ESTIMABL2, IoN); levothyroxine and thyroglobulin follow-up.", refs: ["thyroid"] },
      { setting: "Intermediate and high risk", approach: "Total thyroidectomy with neck dissection where nodes are involved, radioactive iodine ablation, TSH suppression.", refs: ["radioiodine-therapy", "tshr"] },
      { setting: "Iodine-refractory advanced disease", approach: "Lenvatinib (SELECT) or sorafenib (DECISION); selpercatinib for RET fusions, larotrectinib or entrectinib for NTRK fusions, dabrafenib plus trametinib for BRAF V600E.", refs: ["lenvatinib", "sorafenib", "selpercatinib", "larotrectinib", "entrectinib", "dabrafenib", "trametinib", "rai-refractory"] },
    ],
    stateOfArt: ["Two randomised trials showed that low-risk patients can skip radioactive iodine without harm, ending decades of routine ablation.", "Active surveillance of microcarcinomas is accepted practice and is reducing overtreatment.", "Fusion-directed drugs give deep, durable responses in the few iodine-refractory patients who carry RET or NTRK fusions.", "Redifferentiation with BRAF or MEK inhibitors can restore iodine uptake in some refractory tumours."],
    history: [
      { year: 1946, title: "Radioactive iodine first treats thyroid cancer", refs: ["radioiodine-therapy"] },
      { year: 2003, title: "BRAF V600E found in papillary thyroid cancer", refs: ["braf"] },
      { year: 2010, title: "Kuma Hospital reports safe observation of microcarcinomas", note: "Ito and Miyauchi's series of over a thousand patients." },
      { year: 2014, title: "Sorafenib approved for iodine-refractory disease (DECISION)", refs: ["sorafenib"] },
      { year: 2015, title: "Lenvatinib approved (SELECT)", refs: ["lenvatinib"] },
      { year: 2022, title: "ESTIMABL2 and IoN: no radioactive iodine for low-risk disease", note: "Both trials found equivalent outcomes without ablation.", refs: ["radioiodine-therapy"] },
    ],
    pipeline: ["dabrafenib","selpercatinib","larotrectinib"], openProblems: ["Overdiagnosis and overtreatment of small tumours found by imaging.", "Which intermediate-risk patients truly benefit from radioactive iodine.", "Resistance to kinase inhibitors in refractory disease."],
    links: [{ label: "Wikipedia", url: W("Papillary_thyroid_cancer") }, { label: "American Thyroid Association guidelines", url: "https://www.thyroid.org/professionals/ata-professional-guidelines/" }] },
  { id: "follicular-thyroid-cancer", kind: "cancer", name: "Follicular thyroid cancer", group: "endocrine", parent: "thyroid", asOf, tags, wikipedia: W("Follicular_thyroid_cancer"),
    keyPapers: ["paper-ata-2015-thyroid-nodules-dtc-haugen-thyroid-2016", "paper-select-lenvatinib-nejm-2015", "paper-decision-sorafenib-lancet-2014"],
    aka: ["Follicular thyroid carcinoma", "FTC", "Oncocytic (Hurthle cell) carcinoma"],
    burden: "About one in ten thyroid cancers, commoner where iodine is scarce; it spreads through the blood to bone and lung rather than to neck nodes, and survival is somewhat lower than for papillary cancer but still high.",
    tldr: "Follicular thyroid cancer looks like a benign nodule on a needle biopsy, so the diagnosis is usually made only after surgery. It spreads through the bloodstream rather than to neck nodes, is treated like papillary cancer with surgery and radioactive iodine, and has a good outlook when caught early.",
    summary: "Follicular thyroid cancer is separated from a benign follicular adenoma only by invasion of the capsule or blood vessels, which a fine-needle biopsy cannot show; a follicular result on biopsy therefore leads to diagnostic lobectomy, and molecular tests on the aspirate now help decide who needs it. RAS mutations and the PAX8-PPARG fusion are common, and TERT promoter mutations mark aggressive disease. Minimally invasive tumours are cured by lobectomy; widely invasive tumours receive total thyroidectomy and radioactive iodine, which also treats the lung and bone metastases the disease favours. Oncocytic (Hurthle cell) carcinoma, once a follicular variant, is a separate entity in the 2022 WHO classification and takes up iodine poorly. Iodine-refractory disease is treated as in papillary cancer with lenvatinib or sorafenib.",
    subtypes: ["Minimally invasive (capsular invasion only)", "Encapsulated angioinvasive", "Widely invasive", "Oncocytic (Hurthle cell) carcinoma (separate entity since WHO 2022)"],
    biomarkers: ["RAS mutations", "PAX8-PPARG fusion", "TERT promoter mutation", "Molecular tests on indeterminate aspirates (Afirma, ThyroSeq)", "Thyroglobulin"],
    standardOfCare: [
      { setting: "Indeterminate follicular nodule", approach: "Molecular testing of the aspirate; diagnostic lobectomy when suspicious.", refs: ["thyroid"] },
      { setting: "Minimally invasive", approach: "Lobectomy alone in most cases; completion surgery and iodine only for high-risk features.", refs: ["thyroid"] },
      { setting: "Widely invasive or metastatic", approach: "Total thyroidectomy, radioactive iodine, TSH suppression; bone metastases may need surgery or radiotherapy.", refs: ["radioiodine-therapy", "palliative-radiotherapy"] },
      { setting: "Iodine-refractory", approach: "Lenvatinib or sorafenib; clinical trials of redifferentiation.", refs: ["lenvatinib", "sorafenib", "rai-refractory"] },
    ],
    stateOfArt: ["Molecular testing of indeterminate nodules spares many patients a diagnostic operation.", "Most follicular cancers are cured by surgery alone; the widely invasive minority drives the deaths.", "Oncocytic carcinoma's separation as its own entity reflects its distinct genetics and poor iodine avidity."],
    history: [
      { year: 1946, title: "Radioactive iodine treats metastatic follicular cancer", refs: ["radioiodine-therapy"] },
      { year: 2000, title: "PAX8-PPARG fusion discovered" },
      { year: 2022, title: "WHO separates oncocytic carcinoma from follicular cancer" },
    ],
    pipeline: ["dabrafenib","lenvatinib"], openProblems: ["Telling adenoma from carcinoma without surgery.", "Bone metastases respond poorly to iodine.", "Few trials specific to follicular histology."],
    links: [{ label: "Wikipedia", url: W("Follicular_thyroid_cancer") }] },
  { id: "medullary-thyroid-cancer", kind: "cancer", trials: ["exam", "zeta"], name: "Medullary thyroid cancer", group: "endocrine", parent: "thyroid", asOf, tags, wikipedia: W("Medullary_thyroid_cancer"),
    keyPapers: ["paper-libretto-531-nejm-2023", "paper-ata-medullary-thyroid-guideline-wells-thyroid-2015", "paper-exam-cabozantinib-mtc-elisei-jco-2013", "paper-zeta-vandetanib-mtc-wells-jco-2012"],
    aka: ["Medullary thyroid carcinoma", "MTC"],
    burden: "Two to four percent of thyroid cancers; a quarter are inherited through a RET mutation in the multiple endocrine neoplasia type 2 syndromes; ten-year survival ranges from above 95 percent for disease confined to the thyroid to under half once distant spread has occurred.",
    tldr: "Medullary thyroid cancer comes from the calcitonin-making C cells, not the thyroid hormone cells, so radioactive iodine does not work. Surgery is the only cure, a quarter of cases run in families through the RET gene, and the RET-selective drug selpercatinib has transformed treatment of advanced disease.",
    summary: "Medullary thyroid cancer arises from the parafollicular C cells and secretes calcitonin, which serves as its tumour marker. Germline RET mutations cause the hereditary forms (MEN2A, MEN2B and familial medullary thyroid cancer), and children who inherit them have the thyroid removed before cancer develops, timed by the mutation's risk level; most sporadic tumours carry a somatic RET M918T mutation, and a minority RAS mutations. Total thyroidectomy with central neck dissection is the only curative treatment, and calcitonin doubling time guides follow-up. For progressive advanced disease, vandetanib (2011) and cabozantinib (2012) were the first approved kinase inhibitors; selpercatinib, a RET-selective inhibitor, beat them in the LIBRETTO-531 trial and is now the standard for RET-mutant disease, with pralsetinib as an alternative. Phaeochromocytoma must be excluded before any thyroid surgery in MEN2.",
    subtypes: ["Sporadic (about 75 percent)", "Hereditary: MEN2A (with phaeochromocytoma and hyperparathyroidism)", "Hereditary: MEN2B (mucosal neuromas, marfanoid habitus, early aggressive disease)", "Familial medullary thyroid cancer only"],
    biomarkers: ["Calcitonin and CEA (diagnosis, follow-up and doubling time)", "Germline RET testing in every patient", "Somatic RET M918T", "RAS mutations in RET-negative tumours"],
    standardOfCare: [
      { setting: "Hereditary RET carriers", approach: "Prophylactic total thyroidectomy in childhood, timed by the RET codon risk category (before age one in MEN2B).", refs: ["ret", "multiple-endocrine-neoplasia"] },
      { setting: "Localised disease", approach: "Total thyroidectomy with central compartment dissection, lateral dissection when nodes are involved; no radioactive iodine; levothyroxine replacement only.", refs: ["thyroid"] },
      { setting: "Advanced RET-mutant disease", approach: "Selpercatinib first line (LIBRETTO-531 beat cabozantinib and vandetanib); pralsetinib as an alternative.", refs: ["selpercatinib", "pralsetinib", "ret"] },
      { setting: "Advanced RET-negative disease", approach: "Cabozantinib or vandetanib; external radiotherapy for local control; somatostatin analogues for diarrhoea from calcitonin.", refs: ["cabozantinib", "vandetanib"] },
    ],
    stateOfArt: ["Selpercatinib gave a response rate near 70 percent and much longer progression-free survival than the older multikinase drugs, with fewer side effects.", "Genetic testing and prophylactic surgery have made hereditary medullary cancer a preventable disease in tested families.", "Calcitonin doubling time is one of the most reliable prognostic tools in any cancer."],
    history: [
      { year: 1959, title: "Hazard describes medullary thyroid carcinoma as a distinct tumour" },
      { year: 1993, title: "RET mutations found to cause MEN2", refs: ["ret"] },
      { year: 2011, title: "Vandetanib approved", refs: ["vandetanib"] },
      { year: 2012, title: "Cabozantinib approved (EXAM trial)", refs: ["cabozantinib"] },
      { year: 2020, title: "Selpercatinib approved for RET-mutant disease", refs: ["selpercatinib"] },
      { year: 2023, title: "LIBRETTO-531: selpercatinib beats the multikinase drugs first line", refs: ["selpercatinib"] },
    ],
    pipeline: ["selpercatinib"], openProblems: ["No cure once the disease has spread beyond the neck.", "Resistance mutations to RET inhibitors (G810) are emerging.", "RET-negative sporadic disease has no targeted option."],
    links: [{ label: "Wikipedia", url: W("Medullary_thyroid_cancer") }] },
  { id: "anaplastic-thyroid-cancer", kind: "cancer", name: "Anaplastic thyroid cancer", group: "endocrine", parent: "thyroid", asOf, tags, wikipedia: W("Anaplastic_thyroid_cancer"),
    keyPapers: ["paper-subbiah-dabrafenib-trametinib-atc-jco-2018", "paper-ata-anaplastic-thyroid-guideline-bible-thyroid-2021", "paper-maniakas-neoadjuvant-braf-atc-jama-oncol-2020"],
    aka: ["Anaplastic thyroid carcinoma", "ATC", "Undifferentiated thyroid carcinoma"],
    burden: "One to two percent of thyroid cancers but a large share of thyroid cancer deaths; median survival has historically been about six months, and every case is stage IV by definition.",
    tldr: "Anaplastic thyroid cancer is the rare, fast-growing form that presents as a rapidly enlarging neck mass threatening the airway. It was almost uniformly fatal within months; combining BRAF-targeted drugs, immunotherapy, surgery and radiotherapy has lifted survival for the first time.",
    summary: "Anaplastic thyroid cancer is an undifferentiated carcinoma that usually arises from a pre-existing papillary or follicular cancer through the accumulation of TP53 and TERT mutations; about 40 percent carry BRAF V600E. It presents in older adults as a hard, rapidly growing neck mass with hoarseness, breathing or swallowing difficulty, and it does not take up iodine. Every case is staged IV. Rapid molecular testing is now urged at diagnosis because BRAF V600E tumours respond to dabrafenib plus trametinib, approved in 2018 on the ROAR basket trial, and neoadjuvant use has made some inoperable tumours resectable; pembrolizumab added to targeted therapy and chemoradiation for resectable disease are part of the multimodal approach that raised one-year survival at MD Anderson from about a fifth to over half. Airway management and early palliative care remain central.",
    subtypes: ["BRAF V600E-mutant (about 40 percent)", "RAS-mutant", "Arising from differentiated thyroid cancer", "Squamous and other rare patterns"],
    biomarkers: ["BRAF V600E (urgent testing at diagnosis)", "TP53 and TERT promoter mutations", "PD-L1 expression", "NTRK, RET and ALK fusions (rare)"],
    standardOfCare: [
      { setting: "Diagnosis", approach: "Core biopsy with rapid BRAF testing, airway assessment, staging CT and PET; multidisciplinary planning within days.", refs: ["braf"] },
      { setting: "BRAF V600E-mutant", approach: "Dabrafenib plus trametinib, with pembrolizumab in many centres; neoadjuvant use to make tumours resectable, then surgery and radiotherapy.", refs: ["dabrafenib", "trametinib", "pembrolizumab"] },
      { setting: "BRAF wild-type, resectable", approach: "Surgery followed by chemoradiation (paclitaxel- or doxorubicin-based).", refs: ["paclitaxel", "doxorubicin", "imrt-igrt"] },
      { setting: "Unresectable BRAF wild-type", approach: "Chemoradiation or immunotherapy in trials; lenvatinib in some countries; palliative radiotherapy and airway support.", refs: ["lenvatinib", "palliative-radiotherapy", "palliative-care"] },
    ],
    stateOfArt: ["Dabrafenib-trametinib was the first drug approval ever for anaplastic thyroid cancer and turns some inoperable tumours into operable ones.", "Immunotherapy with BRAF inhibition and multimodal treatment has more than doubled one-year survival in specialist centres.", "Rapid molecular testing at diagnosis, within days, is now the standard of care because the window for treatment is short."],
    history: [
      { year: 1990, title: "Anaplastic cancer classified as stage IV in every case" },
      { year: 2018, title: "Dabrafenib plus trametinib approved (ROAR)", note: "The first drug approval for this cancer.", refs: ["dabrafenib", "trametinib"] },
      { year: 2020, title: "MD Anderson reports survival gains with targeted therapy, immunotherapy and surgery" },
    ],
    pipeline: ["pembrolizumab","lenvatinib"], openProblems: ["Most patients still die within a year.", "BRAF wild-type disease has no targeted option.", "Trials are tiny because the disease is rare and fast."],
    links: [{ label: "Wikipedia", url: W("Anaplastic_thyroid_cancer") }] },
];

/**
 * Cancer subtype pages (16 Sept 2026, owner request): pleural and peritoneal mesothelioma as pages of their own under the
 * mesothelioma record, and the `parent` field that lets every subtype page hang off the type that holds it. The parent
 * page lists its subtypes at the top; the subtype page links back. Facts follow the primary trial publications named
 * in each record and the WHO classification. Registered in src/data/index.ts as cancerSubtypes.
 */
import type { CancerInput } from "@/lib/schema";

const asOf = "2026-09-16";
const W = (s: string) => `https://en.wikipedia.org/wiki/${s}`;
const tags = ["subtype-page"];

export const cancerSubtypes: CancerInput[] = [
  { id: "pleural-mesothelioma", kind: "cancer", name: "Pleural mesothelioma", group: "thoracic", parent: "mesothelioma", asOf, tags, wikipedia: W("Mesothelioma"),
    keyPapers: ["paper-checkmate-743-lancet-2021", "paper-vogelzang-pemetrexed-mesothelioma-jco-2003", "paper-mars-2-lancet-respir-med-2024", "paper-keynote-483-lancet-2023"],
    aka: ["Malignant pleural mesothelioma", "MPM"],
    burden: "About four in five mesotheliomas arise in the pleura; roughly 2,500 cases a year in the UK and 3,000 in the US, almost all decades after asbestos exposure, with incidence still rising in countries that banned asbestos late.",
    tldr: "Pleural mesothelioma grows in the lining of the lung after asbestos exposure and causes breathlessness and chest pain from fluid and thickening. It is rarely curable; the first-line choice is nivolumab with ipilimumab or pembrolizumab with chemotherapy, and surgery to remove the lining is no longer recommended outside trials.",
    summary: "Pleural mesothelioma is the commonest form of mesothelioma. It presents with pleural effusion, breathlessness and chest wall pain 20 to 50 years after asbestos exposure, and is diagnosed by thoracoscopic biopsy with immunohistochemistry (calretinin, WT1, D2-40) and loss of BAP1 or MTAP. Epithelioid histology, about two thirds of cases, carries a better outlook than biphasic or sarcomatoid disease. CheckMate 743 made nivolumab plus ipilimumab the first new first-line treatment in 16 years, and KEYNOTE-483 added pembrolizumab with platinum-pemetrexed; both are now standard, with histology guiding the choice. MARS 2 showed that extended pleurectomy and decortication harms rather than helps, so surgery is confined to diagnosis, pleurodesis and trials. Hemithoracic radiotherapy, tumour treating fields and mesothelin-directed therapies are the main lines of research.",
    subtypes: ["Epithelioid (about two thirds)", "Biphasic", "Sarcomatoid (including desmoplastic)"],
    biomarkers: ["Histology (epithelioid versus non-epithelioid)", "BAP1 loss", "CDKN2A/MTAP deletion", "Mesothelin expression", "PD-L1 (not predictive for nivolumab plus ipilimumab)"],
    terms: ["bap1-loss", "cdkn2a-homozygous-deletion"],
    standardOfCare: [
      { setting: "Diagnosis and staging", approach: "CT and PET-CT; thoracoscopic biopsy with an immunohistochemistry panel; histology and BAP1/MTAP status recorded because they drive treatment.", refs: ["mesothelioma"] },
      { setting: "First line, non-epithelioid", approach: "Nivolumab plus ipilimumab (CheckMate 743).", refs: ["nivolumab", "ipilimumab", "checkmate-743"] },
      { setting: "First line, epithelioid", approach: "Pembrolizumab with platinum-pemetrexed (KEYNOTE-483), nivolumab plus ipilimumab, or platinum-pemetrexed with or without bevacizumab, by fitness and preference.", refs: ["pembrolizumab", "pemetrexed", "keynote-483"] },
      { setting: "Surgery", approach: "Not recommended for cure outside trials after MARS 2; talc pleurodesis or an indwelling pleural catheter controls effusion.", refs: ["mars-2"] },
      { setting: "Second line", approach: "Nivolumab (CONFIRM) if not given first line; chemotherapy rechallenge or gemcitabine or vinorelbine after immunotherapy.", refs: ["nivolumab"] },
    ],
    stateOfArt: ["Immunotherapy doubled the share of patients alive at five years compared with chemotherapy alone, but most patients still die of the disease within two years.", "Randomised evidence has removed radical surgery from standard care, sparing patients a major operation with no benefit.", "Mesothelin is expressed on almost every tumour cell, and the next generation of antibody-drug conjugates and CAR-T cells is built on it."],
    history: [
      { year: 1960, title: "Wagner links pleural mesothelioma to asbestos", note: "Thirty-three cases among asbestos miners and their neighbours in South Africa." },
      { year: 2003, title: "Pemetrexed-cisplatin improves survival", refs: ["pemetrexed"] },
      { year: 2020, title: "CheckMate 743: first immunotherapy survival gain", refs: ["checkmate-743"] },
      { year: 2024, title: "MARS 2 ends radical surgery as standard", refs: ["mars-2"] },
      { year: 2024, title: "Pembrolizumab with chemotherapy approved", refs: ["keynote-483"] },
    ],
    pipeline: ["idea-adc-for-mesothelioma"],
    openProblems: ["No curative treatment for the majority; median survival with the best regimens is about 18 months.", "Sarcomatoid disease responds poorly to everything except immunotherapy.", "No screening test for exposed workers, though BAP1 germline carriers and asbestos cohorts are being followed."],
    links: [{ label: "Wikipedia", url: W("Mesothelioma") }, { label: "Mesothelioma UK", url: "https://www.mesothelioma.uk.com/" }] },
  { id: "peritoneal-mesothelioma", kind: "cancer", name: "Peritoneal mesothelioma", group: "gastrointestinal", parent: "mesothelioma", asOf, tags, wikipedia: W("Peritoneal_mesothelioma"),
    keyPapers: ["paper-yan-peritoneal-mesothelioma-crs-hipec-jco-2009", "paper-raghav-atezolizumab-bevacizumab-peritoneal-mesothelioma-cancer-discov-2021", "paper-checkmate-743-lancet-2021", "paper-vogelzang-pemetrexed-mesothelioma-jco-2003"],
    aka: ["Malignant peritoneal mesothelioma", "MPeM", "Diffuse malignant peritoneal mesothelioma"],
    burden: "About one in ten mesotheliomas; a few hundred cases a year in the US. The asbestos link is weaker than in the pleura, it affects more women and younger people, and selected patients live many years after surgery.",
    tldr: "Peritoneal mesothelioma grows in the lining of the abdomen, causing swelling, pain and fluid. Unlike its pleural cousin it is often treated with major surgery to strip the lining followed by heated chemotherapy washed through the abdomen, which can give long survival in fit patients with epithelioid disease.",
    summary: "Peritoneal mesothelioma presents with abdominal distension from ascites, pain, weight loss or a mass found at surgery, and is diagnosed by laparoscopic biopsy with the same immunohistochemistry as pleural disease. Asbestos exposure is found in only a minority; BAP1 germline mutations account for some cases, and the disease is commoner in women than pleural mesothelioma. For fit patients with epithelioid histology and disease that can be removed, cytoreductive surgery with hyperthermic intraperitoneal chemotherapy (HIPEC) is the standard in specialist centres and gives median survival of five years or more in series, though no randomised trial exists. Patients who are not candidates receive platinum-pemetrexed chemotherapy, with immunotherapy increasingly used on the basis of small trials and the pleural data. Well-differentiated papillary and multicystic forms behave almost benignly and are managed separately.",
    subtypes: ["Epithelioid (most cases)", "Biphasic and sarcomatoid (rare, poor prognosis)", "Well-differentiated papillary mesothelial tumour (indolent)", "Multicystic mesothelioma (indolent)"],
    biomarkers: ["Histology and peritoneal cancer index at laparoscopy", "BAP1 loss (somatic and germline)", "Ki-67 (prognostic after surgery)", "Completeness of cytoreduction score"],
    terms: ["bap1-loss"],
    standardOfCare: [
      { setting: "Diagnosis", approach: "CT, laparoscopy with biopsy and scoring of disease extent; germline BAP1 testing when young or with a family history.", refs: ["mesothelioma"] },
      { setting: "Resectable epithelioid disease, fit patient", approach: "Cytoreductive surgery with HIPEC in an experienced centre; long-term survival in a substantial fraction.", refs: ["hipec"] },
      { setting: "Unresectable or unfit", approach: "Platinum-pemetrexed chemotherapy; nivolumab plus ipilimumab or pembrolizumab combinations extrapolated from pleural trials and small peritoneal series.", refs: ["pemetrexed", "nivolumab", "ipilimumab", "pembrolizumab"] },
      { setting: "Indolent variants", approach: "Well-differentiated papillary and multicystic tumours: surgical removal and surveillance; systemic therapy rarely needed.", refs: ["active-surveillance"] },
    ],
    stateOfArt: ["Cytoreduction with HIPEC, pioneered by Sugarbaker, turned a disease with a median survival under a year into one where a substantial fraction of selected patients live five years or more.", "Immunotherapy is being adopted from pleural mesothelioma with encouraging early results, and peritoneal patients are now included in mesothelin-directed trials.", "Registries and consortia have replaced case series as the evidence base because randomised trials are so hard to run in a disease this rare."],
    history: [
      { year: 1908, title: "Miller and Wynn describe peritoneal mesothelioma", note: "Among the earliest descriptions of a primary tumour of the peritoneum." },
      { year: 1995, title: "Sugarbaker develops cytoreduction with HIPEC", note: "Peritonectomy procedures and heated intraperitoneal chemotherapy applied to peritoneal surface malignancy.", refs: ["hipec"] },
      { year: 2009, title: "Multi-institutional registry of 405 patients", note: "Yan and colleagues report median survival of 53 months after cytoreduction and HIPEC." },
      { year: 2021, title: "Immunotherapy series in peritoneal disease", note: "Early phase 2 and retrospective data for nivolumab plus ipilimumab and for atezolizumab plus bevacizumab." },
    ],
    pipeline: ["idea-adc-for-mesothelioma"],
    openProblems: ["No randomised trial has compared surgery plus HIPEC with systemic therapy.", "Selection for surgery relies on centre experience rather than validated criteria.", "Peritoneal patients were excluded from the pleural immunotherapy trials, so their benefit is inferred."],
    links: [{ label: "Wikipedia", url: W("Peritoneal_mesothelioma") }] },
];

/** Existing cancers that are subtypes of another recorded cancer; the parent page lists them at the top. */
export const cancerParents: Record<string, string> = {
  "polycythaemia-vera": "myeloproliferative-neoplasms", "essential-thrombocythaemia": "myeloproliferative-neoplasms",
  "uveal-melanoma": "melanoma",
  "dipg-dmg": "glioblastoma", "paediatric-low-grade-glioma": "glioblastoma",
  dlbcl: "non-hodgkin-lymphoma", "follicular-lymphoma": "non-hodgkin-lymphoma", "mantle-cell-lymphoma": "non-hodgkin-lymphoma", "burkitt-lymphoma": "non-hodgkin-lymphoma", "peripheral-t-cell-lymphoma": "non-hodgkin-lymphoma", "primary-cns-lymphoma": "non-hodgkin-lymphoma", waldenstrom: "non-hodgkin-lymphoma", "hiv-associated-lymphoma": "non-hodgkin-lymphoma", "post-transplant-lymphoproliferative-disorder": "non-hodgkin-lymphoma",
  "ewing-sarcoma": "sarcoma", osteosarcoma: "sarcoma", rhabdomyosarcoma: "sarcoma", gist: "sarcoma", "epithelioid-sarcoma": "sarcoma", "uterine-sarcoma": "sarcoma", "kaposi-sarcoma": "sarcoma", "desmoid-tumour": "sarcoma", "vascular-tumours": "sarcoma", chordoma: "sarcoma", "inflammatory-myofibroblastic-tumour": "sarcoma", "tenosynovial-giant-cell-tumour": "sarcoma",
  melanoma: "skin-cancer", "basal-cell-carcinoma": "skin-cancer", "cutaneous-scc": "skin-cancer", "merkel-cell-carcinoma": "skin-cancer",
  glioblastoma: "brain-tumours", medulloblastoma: "brain-tumours", ependymoma: "brain-tumours", craniopharyngioma: "brain-tumours", atrt: "brain-tumours", "pituitary-tumours": "brain-tumours",
  neuroblastoma: "childhood-cancers", "wilms-tumor": "childhood-cancers", retinoblastoma: "childhood-cancers", hepatoblastoma: "childhood-cancers", "pleuropulmonary-blastoma": "childhood-cancers", "paediatric-germ-cell-tumours": "childhood-cancers", "rare-childhood-cancers": "childhood-cancers",
};

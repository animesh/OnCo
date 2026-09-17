/**
 * Testicular and oesophageal subtypes (17 Sept 2026): seminoma and non-seminoma under the testicular record; squamous cell
 * carcinoma and adenocarcinoma under the oesophageal record. Facts follow the IGCCCG classification, the ESMO and NCCN
 * guidelines and the trials named in each record. Registered in src/data/index.ts as testisOesophagusSubtypes.
 */
import type { CancerInput } from "@/lib/schema";

const asOf = "2026-09-17";
const W = (s: string) => `https://en.wikipedia.org/wiki/${s}`;
const tags = ["subtype-page"];

export const testisOesophagusSubtypes: CancerInput[] = [
  { id: "seminoma", kind: "cancer", name: "Seminoma", group: "genitourinary", parent: "testicular", asOf, tags, wikipedia: W("Seminoma"),
    aka: ["Classic seminoma", "Pure seminoma", "Germinoma (when in the brain)"],
    burden: "Just over half of testicular germ cell tumours, peaking in men in their thirties; almost every patient is cured, and the effort now goes into giving the least treatment that keeps it that way.",
    tldr: "Seminoma is the slower, more radiosensitive half of testicular cancer. After removal of the testicle most men need no further treatment and are simply monitored; those who relapse or present with spread are cured with a short course of chemotherapy.",
    summary: "Seminoma arises from germ cell neoplasia in situ and presents as a painless testicular mass, with modest rises in hCG and LDH but never AFP, which would mark a non-seminomatous element. After radical inguinal orchidectomy, stage I disease is managed by surveillance in most men, since only about one in six relapse and all are salvageable; a single dose of carboplatin (MRC TE19) or, rarely now, para-aortic radiotherapy are alternatives. Stage II disease with small nodes is treated with radiotherapy or chemotherapy, and bulkier or metastatic disease with three cycles of BEP or four of EP, curing more than 90 percent; residual masses after chemotherapy are assessed with PET rather than removed. Long-term follow-up watches for second cancers and cardiovascular effects of treatment.",
    subtypes: ["Stage I seminoma (surveillance)", "Stage II seminoma (nodal)", "Advanced seminoma (IGCCCG good or intermediate risk)", "Spermatocytic tumour (older men, almost never metastasises)"],
    biomarkers: ["hCG (mildly raised in a minority) and LDH", "AFP normal by definition", "Tumour size and rete testis invasion (relapse risk in stage I)", "PET after chemotherapy for residual masses over 3 cm"],
    standardOfCare: [
      { setting: "Stage I", approach: "Orchidectomy then surveillance; single-dose carboplatin as an alternative; radiotherapy now rarely used because of second cancers.", refs: ["carboplatin", "active-surveillance"] },
      { setting: "Stage II", approach: "Radiotherapy for small-volume nodes or chemotherapy (BEP or EP) for larger nodes; de-escalation trials of carboplatin with radiotherapy ongoing.", refs: ["cisplatin", "etoposide", "bleomycin", "imrt-igrt"] },
      { setting: "Advanced", approach: "Three cycles of BEP or four of EP for good risk, four cycles of BEP for intermediate risk; PET-directed management of residual masses.", refs: ["bleomycin", "etoposide", "cisplatin", "pet"] },
    ],
    stateOfArt: ["Surveillance has replaced adjuvant radiotherapy as the standard for stage I, sparing most men any treatment beyond surgery.", "Cure rates above 95 percent make late toxicity, second cancers and heart disease the main concern.", "De-escalation trials aim to cut chemotherapy and radiotherapy doses further in stage II."],
    history: [
      { year: 1977, title: "Einhorn's cisplatin combination cures metastatic germ cell tumours", refs: ["cisplatin"] },
      { year: 2005, title: "MRC TE19: single-dose carboplatin equals radiotherapy in stage I", refs: ["carboplatin"] },
      { year: 2011, title: "Surveillance endorsed as the preferred stage I option in Europe" },
    ],
    pipeline: ["carboplatin","pet"], openProblems: ["Predicting which stage I patients will relapse.", "Late effects of platinum and radiotherapy decades on.", "Rare relapses more than five years out."],
    links: [{ label: "Wikipedia", url: W("Seminoma") }] },
  { id: "non-seminoma", kind: "cancer", name: "Non-seminomatous germ cell tumour", group: "genitourinary", parent: "testicular", asOf, tags, wikipedia: W("Testicular_cancer"),
    aka: ["NSGCT", "Non-seminoma", "Embryonal carcinoma", "Yolk sac tumour", "Choriocarcinoma", "Teratoma", "Mixed germ cell tumour"],
    burden: "Just under half of testicular germ cell tumours, in men in their twenties and thirties; cure rates are above 95 percent for early disease and about half for the small poor-risk group, whose treatment is the hardest problem left in testicular cancer.",
    tldr: "Non-seminoma is the faster-growing half of testicular cancer, marked by AFP and hCG in the blood. Surgery cures most early cases, cisplatin chemotherapy cures most of the rest, and surgeons remove what remains after chemotherapy because teratoma does not respond to drugs.",
    summary: "Non-seminomatous germ cell tumours include embryonal carcinoma, yolk sac tumour, choriocarcinoma and teratoma, usually mixed. AFP, hCG and LDH set the IGCCCG risk group and track response. After orchidectomy, stage I disease is watched, with about 30 percent relapsing (more with lymphovascular invasion) and almost all cured on relapse; one cycle of adjuvant BEP is offered to higher-risk men who prefer it. Metastatic disease receives three cycles of BEP for good risk and four for intermediate and poor risk; residual masses after chemotherapy are resected by retroperitoneal lymph node dissection because a third contain teratoma and a tenth viable cancer. Relapse is treated with conventional or high-dose salvage chemotherapy, compared head to head in the TIGER trial. Fertility preservation and long-term follow-up are routine.",
    subtypes: ["Embryonal carcinoma", "Yolk sac tumour", "Choriocarcinoma (very high hCG, haemorrhagic metastases)", "Teratoma (chemoresistant; surgery)", "Mixed germ cell tumour", "Growing teratoma syndrome"],
    biomarkers: ["AFP, hCG and LDH (IGCCCG risk grouping)", "Lymphovascular invasion (stage I relapse risk)", "Marker decline during chemotherapy", "Chromosome 12p gain (i12p) on pathology"],
    standardOfCare: [
      { setting: "Stage I", approach: "Orchidectomy then surveillance; one cycle of adjuvant BEP for men with lymphovascular invasion who choose it; nerve-sparing retroperitoneal dissection in selected cases.", refs: ["bleomycin", "etoposide", "cisplatin", "active-surveillance"] },
      { setting: "Metastatic, good risk", approach: "Three cycles of BEP (or four of EP if bleomycin is contraindicated).", refs: ["bleomycin", "etoposide", "cisplatin"] },
      { setting: "Metastatic, intermediate and poor risk", approach: "Four cycles of BEP, or VIP; poor-risk patients with slow marker decline are switched to intensified therapy (GETUG 13); treatment in high-volume centres.", refs: ["cisplatin", "etoposide"] },
      { setting: "Residual masses after chemotherapy", approach: "Retroperitoneal lymph node dissection and resection of other residual masses when markers have normalised.", refs: ["testicular"] },
      { setting: "Relapse", approach: "Conventional (TIP) or high-dose chemotherapy with stem cell support, as compared in the TIGER trial; late relapse treated surgically where possible.", refs: ["cisplatin", "autologous-stem-cell-transplant"] },
    ],
    stateOfArt: ["Testicular cancer was the first disseminated solid tumour to become curable with chemotherapy, and cure rates keep rising through risk adaptation.", "Post-chemotherapy surgery is a defining feature: teratoma and residual cancer are cut out rather than treated with more drugs.", "The remaining frontier is the poor-risk group and the balance between cure and late toxicity."],
    history: [
      { year: 1977, title: "Cisplatin combination chemotherapy cures metastatic disease (Einhorn)", refs: ["cisplatin"] },
      { year: 1987, title: "BEP becomes the standard (etoposide replaces vinblastine)", refs: ["etoposide", "bleomycin"] },
      { year: 1997, title: "IGCCCG risk classification published" },
      { year: 2014, title: "GETUG 13: marker-guided intensification in poor-risk disease" },
    ],
    pipeline: ["tiger-trial","autologous-stem-cell-transplant"], openProblems: ["Poor-risk disease still kills about half of those affected.", "Whether high-dose chemotherapy is better than conventional salvage (TIGER).", "Cardiovascular disease, hearing loss and neuropathy in long-term survivors."],
    links: [{ label: "Wikipedia", url: W("Testicular_cancer") }] },
  { id: "oesophageal-squamous-cell-carcinoma", kind: "cancer", name: "Oesophageal squamous cell carcinoma", group: "gastrointestinal", parent: "esophageal", asOf, tags, wikipedia: W("Esophageal_cancer"),
    aka: ["Esophageal squamous cell carcinoma", "ESCC", "Oesophageal SCC"],
    burden: "About 85 percent of oesophageal cancers worldwide and the dominant type across the Asian oesophageal cancer belt, East Africa and South America; in high-income countries it is now outnumbered by adenocarcinoma, and five-year survival is around 20 percent overall.",
    tldr: "Squamous cell carcinoma of the oesophagus, the world's commonest form, is linked to smoking, alcohol and very hot drinks and sits in the upper and middle gullet. It is treated with chemoradiation, with or without surgery, and immunotherapy has recently joined chemotherapy for advanced disease.",
    summary: "Oesophageal squamous cell carcinoma arises from the squamous lining of the upper and middle oesophagus; tobacco, alcohol, scalding drinks, nutritional deficiency and achalasia are its causes, and TP53 and NOTCH1 mutations its genetics. Early lesions found by endoscopy, common in Japanese and Chinese screening programmes, are removed endoscopically. Locally advanced disease is treated either with neoadjuvant chemoradiation followed by surgery (CROSS) or with definitive chemoradiation alone, which cures a similar share in this histology; adjuvant nivolumab after chemoradiation and surgery lowers recurrence when residual disease remains (CheckMate 577). Advanced disease is treated with nivolumab plus chemotherapy or nivolumab plus ipilimumab (CheckMate 648) or pembrolizumab plus chemotherapy (KEYNOTE-590); Chinese trials with camrelizumab, tislelizumab, toripalimab and sintilimab have produced the same result.",
    subtypes: ["Upper and middle third squamous cell carcinoma", "Early (T1a) squamous cell carcinoma (endoscopic resection)", "Locally advanced (chemoradiation with or without surgery)", "Metastatic (immunotherapy plus chemotherapy)"],
    biomarkers: ["PD-L1 combined positive score or tumour proportion score", "TP53 and NOTCH1 mutations", "Endoscopic Lugol staining for early lesions", "Pathological response after chemoradiation"],
    standardOfCare: [
      { setting: "Early (T1a)", approach: "Endoscopic submucosal dissection; oesophagectomy or chemoradiation if deeper invasion is found.", refs: ["endoscopic-resection"] },
      { setting: "Locally advanced", approach: "Neoadjuvant carboplatin-paclitaxel chemoradiation and surgery (CROSS), or definitive cisplatin-fluorouracil chemoradiation with surgery reserved for persistent disease; adjuvant nivolumab after incomplete response (CheckMate 577).", refs: ["cross-trial", "carboplatin", "paclitaxel", "cisplatin", "fluorouracil", "nivolumab", "checkmate-577"] },
      { setting: "Metastatic, first line", approach: "Nivolumab plus chemotherapy or nivolumab plus ipilimumab (CheckMate 648), or pembrolizumab plus chemotherapy (KEYNOTE-590).", refs: ["nivolumab", "ipilimumab", "pembrolizumab", "checkmate-648", "keynote-590"] },
      { setting: "Prevention and screening", approach: "Smoking cessation, alcohol reduction, avoiding very hot drinks; endoscopic screening in high-incidence regions of China.", refs: ["smoking-cessation-after-diagnosis", "alcohol-reduction-labelling"] },
    ],
    stateOfArt: ["Immunotherapy added to chemotherapy improved survival in every first-line trial, including several run entirely in China.", "Organ preservation with definitive chemoradiation and surveillance is an accepted alternative to surgery in this histology.", "Endoscopic screening in China detects a large share of cancers at a curable stage."],
    history: [
      { year: 1992, title: "RTOG 85-01: chemoradiation beats radiotherapy alone" },
      { year: 2012, title: "CROSS: chemoradiation before surgery doubles survival", refs: ["cross-trial"] },
      { year: 2021, title: "CheckMate 577 and KEYNOTE-590 bring immunotherapy to oesophageal cancer", refs: ["checkmate-577", "keynote-590"] },
      { year: 2022, title: "CheckMate 648: nivolumab combinations first line", refs: ["checkmate-648"] },
    ],
    pipeline: ["nivolumab","tislelizumab"], openProblems: ["Whether surgery can be omitted after a complete response to chemoradiation.", "Most cases worldwide present late without access to endoscopy.", "Nutrition, swallowing and quality of life during and after treatment."],
    links: [{ label: "Wikipedia", url: W("Esophageal_cancer") }] },
  { id: "oesophageal-adenocarcinoma", kind: "cancer", name: "Oesophageal and junctional adenocarcinoma", group: "gastrointestinal", parent: "esophageal", asOf, tags, wikipedia: W("Esophageal_cancer"),
    aka: ["Esophageal adenocarcinoma", "EAC", "Gastro-oesophageal junction adenocarcinoma", "Barrett's cancer"],
    burden: "The dominant oesophageal cancer in Western countries, where its incidence has risen several-fold since the 1970s with reflux and obesity; it affects men six times more than women, and five-year survival is about 20 percent overall.",
    tldr: "Adenocarcinoma of the lower oesophagus and junction grows out of Barrett's oesophagus, the change in the lining caused by long-standing acid reflux. Chemotherapy or chemoradiation before surgery is standard, and HER2, PD-L1 and claudin 18.2 now guide drugs for advanced disease as they do in stomach cancer.",
    summary: "Oesophageal adenocarcinoma arises in the lower oesophagus and gastro-oesophageal junction from Barrett's oesophagus, driven by reflux, obesity and smoking; TP53 mutation, chromosomal instability and amplification of HER2, EGFR, MET or KRAS are typical. Barrett's surveillance and endoscopic ablation or resection of dysplasia prevent progression. Locally advanced disease is treated with perioperative FLOT chemotherapy, which the ESOPEC trial showed gives better survival than CROSS chemoradiation, followed by oesophagectomy. Advanced disease is managed with stomach cancer regimens: nivolumab or pembrolizumab with chemotherapy for PD-L1-positive tumours, trastuzumab with chemotherapy for HER2-positive tumours, zolbetuximab for claudin 18.2-positive tumours, and trastuzumab deruxtecan after HER2-directed therapy.",
    subtypes: ["Barrett's-associated adenocarcinoma of the lower oesophagus", "Gastro-oesophageal junction adenocarcinoma (Siewert types I to III)", "HER2-positive (about 15 to 20 percent)", "Claudin 18.2-positive", "Mismatch repair-deficient (a minority)"],
    biomarkers: ["HER2 amplification", "PD-L1 combined positive score", "Claudin 18.2 expression", "Mismatch repair and microsatellite instability", "Barrett's dysplasia grade on surveillance"],
    standardOfCare: [
      { setting: "Barrett's oesophagus", approach: "Endoscopic surveillance; radiofrequency ablation or endoscopic resection for dysplasia and early cancer.", refs: ["endoscopic-resection"] },
      { setting: "Locally advanced", approach: "Perioperative FLOT (docetaxel, oxaliplatin, fluorouracil, leucovorin) and oesophagectomy, preferred over CROSS after ESOPEC; chemoradiation where chemotherapy is not tolerated.", refs: ["flot", "docetaxel", "oxaliplatin", "fluorouracil", "cross-trial"] },
      { setting: "Advanced, first line", approach: "Nivolumab or pembrolizumab with platinum-fluoropyrimidine chemotherapy for PD-L1-positive tumours; trastuzumab with chemotherapy (and pembrolizumab) for HER2-positive tumours; zolbetuximab with chemotherapy for claudin 18.2-positive tumours.", refs: ["nivolumab", "pembrolizumab", "trastuzumab", "zolbetuximab", "her2", "pdl1", "cldn18-2"] },
      { setting: "Later lines", approach: "Trastuzumab deruxtecan for HER2-positive disease; ramucirumab with paclitaxel; trifluridine-tipiracil.", refs: ["trastuzumab-deruxtecan", "ramucirumab", "paclitaxel"] },
    ],
    stateOfArt: ["ESOPEC settled a decade-long argument in favour of perioperative chemotherapy over chemoradiation for adenocarcinoma.", "Three biomarkers, HER2, PD-L1 and claudin 18.2, now decide first-line treatment of advanced disease.", "Endoscopic therapy of Barrett's dysplasia prevents cancer and has replaced surgery for early disease."],
    history: [
      { year: 1950, title: "Norman Barrett describes the columnar-lined oesophagus" },
      { year: 2010, title: "ToGA: trastuzumab for HER2-positive gastro-oesophageal cancer", refs: ["trastuzumab"] },
      { year: 2012, title: "CROSS chemoradiation before surgery", refs: ["cross-trial"] },
      { year: 2019, title: "FLOT4: perioperative FLOT beats ECF", refs: ["flot"] },
      { year: 2024, title: "ESOPEC: FLOT better than CROSS in adenocarcinoma", refs: ["flot"] },
      { year: 2024, title: "Zolbetuximab approved for claudin 18.2-positive disease", refs: ["zolbetuximab"] },
    ],
    pipeline: ["zolbetuximab","trastuzumab-deruxtecan"], openProblems: ["Barrett's surveillance finds few of the cancers that occur.", "Rising incidence with obesity.", "Oesophagectomy remains a major operation with lasting effects on eating."],
    links: [{ label: "Wikipedia", url: W("Esophageal_cancer") }] },
];

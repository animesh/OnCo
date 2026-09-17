/**
 * Pancreatic ductal adenocarcinoma (PDAC) coverage wave (17 Sept 2026, owner request): the late-stage trials that failed,
 * the one antibody approved in China, the GSK-3 inhibitor heading for phase 3, and the sponsors behind them. Each trial
 * carries its registry id and primary publication. Registered in src/data/index.ts as pdacDrugs, pdacTrials, pdacCompanies.
 */
import type { CompanyInput, DrugInput, TrialInput } from "@/lib/schema";

const asOf = "2026-09-17";
const ct = (nct: string) => ({ label: `ClinicalTrials.gov ${nct}`, url: `https://clinicaltrials.gov/study/${nct}` });

export const pdacDrugs: DrugInput[] = [
  { id: "devimistat", kind: "drug", name: "Devimistat", code: "CPI-613", aka: ["CPI-613"], modality: "Small-molecule inhibitor of mitochondrial metabolism (PDH and KGDH)", mechanism: "A lipoate analogue that disrupts the tumour's mitochondrial energy metabolism by inhibiting pyruvate dehydrogenase and alpha-ketoglutarate dehydrogenase.", status: "negative", asOf,
    tldr: "Devimistat tried to starve pancreatic cancer cells of their energy supply alongside chemotherapy; the phase 3 AVENGER 500 trial found no survival gain.",
    summary: "Devimistat (CPI-613) was developed by Rafael Pharmaceuticals, later renamed Cornerstone Pharmaceuticals, as a first-in-class drug against cancer cell metabolism. Early trials combined it with modified FOLFIRINOX in metastatic pancreatic cancer with encouraging response rates.\n\nThe phase 3 AVENGER 500 trial randomised patients with untreated metastatic pancreatic adenocarcinoma to modified FOLFIRINOX with or without devimistat. It did not improve overall survival, and a parallel phase 3 in acute myeloid leukaemia (ARMADA 2000) also missed. Development in pancreatic cancer stopped.",
    approvals: [], targets: [], cancers: ["pancreatic"], technologies: ["cytotoxic-chemotherapy"], companies: ["cornerstone-pharmaceuticals"], trials: ["avenger-500"],
    links: [ct("NCT03504423")] },
  { id: "pamrevlumab", kind: "drug", name: "Pamrevlumab", code: "FG-3019", aka: ["FG-3019"], modality: "Monoclonal antibody against connective tissue growth factor (CTGF)", mechanism: "Binds connective tissue growth factor, a driver of the dense fibrous stroma that surrounds pancreatic tumours, aiming to make them more resectable and more permeable to chemotherapy.", status: "negative", asOf,
    tldr: "Pamrevlumab targeted the scar-like tissue around pancreatic tumours; its phase 3 LAPIS trial in locally advanced disease did not lengthen survival.",
    summary: "FibroGen developed pamrevlumab for fibrotic diseases and for pancreatic cancer, where connective tissue growth factor helps build the stroma that shields tumour cells. A phase 1/2 study suggested more patients could reach surgery.\n\nThe phase 3 LAPIS trial in locally advanced unresectable pancreatic cancer, combined with gemcitabine and nab-paclitaxel or FOLFIRINOX, did not meet its overall survival endpoint, reported in 2024. A metastatic arm within the Precision Promise platform trial was also stopped for futility, ending the programme.",
    approvals: [], targets: [], cancers: ["pancreatic"], technologies: ["monoclonal-antibody"], companies: ["fibrogen"], trials: ["lapis-trial"],
    links: [ct("NCT03941093"), { label: "FibroGen announcement, LAPIS topline results (2024)", url: "https://investor.fibrogen.com/news-releases" }] },
  { id: "eryaspase", kind: "drug", name: "Eryaspase", code: "GRASPA", aka: ["GRASPA", "L-asparaginase encapsulated in red blood cells"], modality: "L-asparaginase encapsulated in donor red blood cells", mechanism: "Depletes circulating asparagine, an amino acid that pancreatic tumours with low asparagine synthetase cannot make, while the red-cell shell protects the enzyme and reduces toxicity.", status: "negative", asOf,
    tldr: "Eryaspase packed a leukaemia enzyme into red blood cells to starve pancreatic cancer of an amino acid; the phase 3 TRYbeCA-1 trial missed its survival goal.",
    summary: "Erytech Pharma, now part of Phaxiam, built eryaspase for tumours that cannot make their own asparagine. A randomised phase 2 in second-line pancreatic cancer had shown longer survival, which led to the phase 3 TRYbeCA-1 trial of eryaspase with chemotherapy against chemotherapy alone in the second line.\n\nTRYbeCA-1 reported in 2021: overall survival was not significantly improved, and the pancreatic programme ended.",
    approvals: [], targets: [], cancers: ["pancreatic"], technologies: ["cytotoxic-chemotherapy"], companies: ["phaxiam"], trials: ["trybeca-1"],
    links: [ct("NCT03665441")] },
  { id: "algenpantucel-l", kind: "drug", name: "Algenpantucel-L", code: "HyperAcute Pancreas", aka: ["HyperAcute Pancreas"], modality: "Allogeneic whole-cell vaccine expressing alpha-gal", mechanism: "Irradiated pancreatic cancer cell lines engineered to express alpha-1,3-galactosyl, a sugar humans lack, so pre-existing anti-alpha-gal antibodies attack the vaccine cells and, in theory, train immunity against shared tumour antigens.", status: "negative", asOf,
    tldr: "Algenpantucel-L was a whole-cell pancreatic cancer vaccine given after surgery; the phase 3 IMPRESS trial showed no survival benefit.",
    summary: "NewLink Genetics designed algenpantucel-L to exploit hyperacute rejection, the reaction that destroys pig organs in humans. A phase 2 study after pancreatic cancer surgery reported encouraging survival, which led to the largest adjuvant vaccine trial in the disease.\n\nIMPRESS randomised 722 patients with resected pancreatic cancer to standard adjuvant gemcitabine with or without chemoradiation, with or without algenpantucel-L. Overall survival was not improved, and a second phase 3 in borderline resectable and locally advanced disease (PILLAR) was also negative.",
    approvals: [], targets: [], cancers: ["pancreatic"], technologies: ["shared-antigen-vaccine"], companies: ["newlink-genetics"], trials: ["impress-trial"], terms: ["vaccines-and-oncolytic-viruses"],
    links: [ct("NCT01072981")] },
  { id: "elraglusib", kind: "drug", name: "Elraglusib", code: "9-ING-41", aka: ["9-ING-41"], modality: "Small-molecule GSK-3 beta inhibitor", mechanism: "Inhibits glycogen synthase kinase 3 beta, a kinase that drives NF-kB survival signalling and chemoresistance in pancreatic cancer and dampens anti-tumour immunity.", status: "phase-2", asOf,
    tldr: "Elraglusib blocks a kinase that helps pancreatic cancer resist chemotherapy; in a randomised phase 2 it lengthened survival when added to gemcitabine and nab-paclitaxel, and a phase 3 is planned.",
    summary: "Actuate Therapeutics developed elraglusib from a series of GSK-3 beta inhibitors. In the Actuate 1801 study, part 3B randomised patients with untreated metastatic pancreatic adenocarcinoma to gemcitabine and nab-paclitaxel with or without elraglusib.\n\nThe company reported that adding elraglusib improved overall survival and one-year survival, with manageable added toxicity, mainly visual disturbance and fatigue. The result is from a phase 2 trial and awaits confirmation in a phase 3, which Actuate has said it is planning with regulators.",
    approvals: [], targets: [], cancers: ["pancreatic"], technologies: ["kinase-inhibitors"], companies: ["actuate-therapeutics"], trials: ["actuate-1801"],
    links: [ct("NCT03678883"), { label: "Actuate Therapeutics: elraglusib programme", url: "https://www.actuatetherapeutics.com" }] },
];

export const pdacTrials: TrialInput[] = [
  { id: "avenger-500", kind: "trial", name: "AVENGER 500", nct: "NCT03504423", phase: "3", status: "negative", yearReported: 2024, sponsor: "Rafael Pharmaceuticals (Cornerstone)", asOf,
    setting: "Untreated metastatic pancreatic adenocarcinoma: modified FOLFIRINOX with or without devimistat",
    tldr: "Adding the metabolism drug devimistat to FOLFIRINOX did not help people with metastatic pancreatic cancer live longer.",
    summary: "AVENGER 500 was an open-label phase 3 trial in previously untreated metastatic pancreatic adenocarcinoma comparing modified FOLFIRINOX with devimistat against modified FOLFIRINOX alone. The primary endpoint was overall survival. The trial did not show a survival benefit, and response rates were similar between arms, closing the pancreatic programme for devimistat.",
    result: "No overall survival benefit from adding devimistat to modified FOLFIRINOX.",
    drugs: ["devimistat", "folfirinox"], cancers: ["pancreatic"], technologies: ["cytotoxic-chemotherapy"], links: [ct("NCT03504423")] },
  { id: "lapis-trial", kind: "trial", name: "LAPIS", nct: "NCT03941093", phase: "3", status: "negative", yearReported: 2024, sponsor: "FibroGen", asOf,
    setting: "Locally advanced unresectable pancreatic cancer: pamrevlumab with gemcitabine and nab-paclitaxel or FOLFIRINOX versus chemotherapy alone",
    tldr: "The anti-stroma antibody pamrevlumab did not help people with locally advanced pancreatic cancer live longer.",
    summary: "LAPIS randomised patients with locally advanced, unresectable pancreatic ductal adenocarcinoma to pamrevlumab or placebo with either gemcitabine plus nab-paclitaxel or FOLFIRINOX, with the aim of increasing resection and survival. FibroGen reported in 2024 that the trial did not meet its primary overall survival endpoint.",
    result: "Primary overall survival endpoint not met.",
    drugs: ["pamrevlumab", "gemcitabine-nab-paclitaxel", "folfirinox"], cancers: ["pancreatic"], technologies: ["monoclonal-antibody"], links: [ct("NCT03941093")] },
  { id: "trybeca-1", kind: "trial", name: "TRYbeCA-1", nct: "NCT03665441", phase: "3", status: "negative", yearReported: 2021, sponsor: "Erytech Pharma", asOf,
    setting: "Second-line metastatic pancreatic adenocarcinoma: eryaspase with chemotherapy versus chemotherapy alone",
    tldr: "Eryaspase, an enzyme carried inside red blood cells, did not lengthen survival when added to second-line chemotherapy for pancreatic cancer.",
    summary: "TRYbeCA-1 randomised patients with metastatic pancreatic adenocarcinoma progressing after first-line treatment to eryaspase plus gemcitabine and nab-paclitaxel or irinotecan-based chemotherapy, or chemotherapy alone. The primary endpoint of overall survival was not met when the trial reported in 2021.",
    result: "Primary overall survival endpoint not met.",
    drugs: ["eryaspase", "gemcitabine-nab-paclitaxel"], cancers: ["pancreatic"], technologies: ["cytotoxic-chemotherapy"], links: [ct("NCT03665441")] },
  { id: "impress-trial", kind: "trial", name: "IMPRESS (algenpantucel-L)", nct: "NCT01072981", phase: "3", status: "negative", yearReported: 2016, sponsor: "NewLink Genetics", asOf,
    setting: "Resected pancreatic cancer: adjuvant gemcitabine with or without chemoradiation, with or without algenpantucel-L",
    tldr: "The largest vaccine trial after pancreatic cancer surgery found that algenpantucel-L added nothing to standard chemotherapy.",
    summary: "IMPRESS enrolled 722 patients after resection of pancreatic adenocarcinoma and randomised them to standard adjuvant therapy with or without the whole-cell vaccine algenpantucel-L. Overall survival, the primary endpoint, was not improved, ending the hyperacute vaccine approach in this disease.",
    result: "No overall survival benefit.",
    drugs: ["algenpantucel-l", "gemcitabine"], cancers: ["pancreatic"], technologies: ["shared-antigen-vaccine"], terms: ["vaccines-and-oncolytic-viruses"], links: [ct("NCT01072981")] },
  { id: "notable-trial", kind: "trial", name: "NOTABLE (nimotuzumab, KRAS wild-type pancreatic cancer)", nct: "NCT02395016", phase: "3", status: "positive", yearReported: 2023, sponsor: "Biotech Pharmaceutical (China)", asOf,
    setting: "Locally advanced or metastatic KRAS wild-type pancreatic cancer: nimotuzumab plus gemcitabine versus placebo plus gemcitabine",
    tldr: "In the minority of pancreatic cancers without a KRAS mutation, adding the EGFR antibody nimotuzumab to gemcitabine helped people live longer, and China approved it in 2023.",
    summary: "NOTABLE randomised patients in China with KRAS wild-type locally advanced or metastatic pancreatic cancer to nimotuzumab or placebo with gemcitabine. Overall survival, the primary endpoint, was longer with nimotuzumab, with the benefit concentrated in patients who had not had biliary obstruction. On this trial China's regulator approved nimotuzumab for KRAS wild-type pancreatic cancer in 2023, the first EGFR-directed approval in the disease since erlotinib.",
    result: "Overall survival improved with nimotuzumab plus gemcitabine in KRAS wild-type disease.",
    drugs: ["nimotuzumab", "gemcitabine"], cancers: ["pancreatic"], targets: ["egfr", "kras"], technologies: ["monoclonal-antibody"], links: [ct("NCT02395016")] },
  { id: "actuate-1801", kind: "trial", name: "Actuate 1801 Part 3B (elraglusib)", nct: "NCT03678883", phase: "2", status: "positive", yearReported: 2025, sponsor: "Actuate Therapeutics", asOf,
    setting: "Untreated metastatic pancreatic adenocarcinoma: gemcitabine and nab-paclitaxel with or without elraglusib",
    tldr: "A randomised phase 2 found that adding the GSK-3 inhibitor elraglusib to standard chemotherapy lengthened survival in metastatic pancreatic cancer; a phase 3 is needed to confirm it.",
    summary: "Part 3B of the Actuate 1801 study randomised patients with previously untreated metastatic pancreatic ductal adenocarcinoma to gemcitabine and nab-paclitaxel with or without elraglusib. The company reported improved overall survival and one-year survival with elraglusib. As a phase 2 result it is hypothesis-generating, and Actuate has said a confirmatory phase 3 is planned.",
    result: "Overall survival longer with elraglusib in a randomised phase 2; confirmation pending.",
    drugs: ["elraglusib", "gemcitabine-nab-paclitaxel"], cancers: ["pancreatic"], technologies: ["kinase-inhibitors"], links: [ct("NCT03678883")] },
];

export const pdacCompanies: CompanyInput[] = [
  { id: "cornerstone-pharmaceuticals", kind: "company", name: "Cornerstone Pharmaceuticals (formerly Rafael Pharmaceuticals)", aka: ["Rafael Pharmaceuticals"], hq: "Cranbury, New Jersey, United States", country: "US", companyType: "biotech", website: "https://www.cornerstonepharma.com", stage: "growth", asOf,
    tldr: "The company behind devimistat, a drug against cancer cell metabolism that failed its phase 3 trials in pancreatic cancer and leukaemia.",
    summary: "Rafael Pharmaceuticals, majority owned by Rafael Holdings, developed devimistat (CPI-613) for pancreatic cancer and acute myeloid leukaemia. After both phase 3 trials missed their endpoints in 2021 and 2022 the company was renamed Cornerstone Pharmaceuticals and refocused its pipeline.",
    drugs: ["devimistat"], cancers: ["pancreatic", "aml"], links: [{ label: "Official website", url: "https://www.cornerstonepharma.com" }] },
  { id: "fibrogen", kind: "company", name: "FibroGen", aka: [], hq: "San Francisco, California, United States", country: "US", companyType: "biotech", website: "https://www.fibrogen.com", stage: "public", founded: 1993, asOf,
    tldr: "A fibrosis-focused biotech whose anti-CTGF antibody pamrevlumab failed phase 3 trials in pancreatic cancer and in lung fibrosis.",
    summary: "FibroGen, listed on Nasdaq, built its pipeline on connective tissue growth factor biology and on the anaemia drug roxadustat. Pamrevlumab was its oncology bet, tested in locally advanced pancreatic cancer in the LAPIS trial and in a Precision Promise arm; both were negative in 2024, and the programme was discontinued.",
    drugs: ["pamrevlumab"], cancers: ["pancreatic"], links: [{ label: "Official website", url: "https://www.fibrogen.com" }, { label: "Wikipedia", url: "https://en.wikipedia.org/wiki/FibroGen" }] },
  { id: "newlink-genetics", kind: "company", name: "NewLink Genetics (now Lumos Pharma)", aka: ["Lumos Pharma"], hq: "Ames, Iowa, United States", country: "US", companyType: "biotech", website: "https://www.lumos-pharma.com", stage: "public", founded: 1999, asOf,
    tldr: "The Iowa biotech that ran the largest pancreatic cancer vaccine trial, IMPRESS, and the IDO inhibitor indoximod programme; it merged into Lumos Pharma in 2020.",
    summary: "NewLink Genetics developed the HyperAcute whole-cell vaccine platform, including algenpantucel-L for pancreatic cancer, and the IDO pathway inhibitor indoximod. After IMPRESS and PILLAR failed, the company merged with Lumos Pharma in 2020 and left oncology.",
    drugs: ["algenpantucel-l"], cancers: ["pancreatic"], links: [{ label: "Wikipedia", url: "https://en.wikipedia.org/wiki/NewLink_Genetics" }] },
  { id: "actuate-therapeutics", kind: "company", name: "Actuate Therapeutics", aka: [], hq: "Fort Worth, Texas, United States", country: "US", companyType: "biotech", website: "https://www.actuatetherapeutics.com", stage: "public", founded: 2015, asOf,
    tldr: "A Texas biotech developing elraglusib, a GSK-3 beta inhibitor that improved survival in a randomised phase 2 in metastatic pancreatic cancer.",
    summary: "Actuate Therapeutics listed on Nasdaq in 2024 to fund elraglusib. Its lead programme is first-line metastatic pancreatic cancer with gemcitabine and nab-paclitaxel, where the Actuate 1801 Part 3B randomised phase 2 reported longer survival; the company is planning a confirmatory phase 3 and also studies the drug in Ewing sarcoma and other tumours.",
    drugs: ["elraglusib"], cancers: ["pancreatic", "ewing-sarcoma"], links: [{ label: "Official website", url: "https://www.actuatetherapeutics.com" }] },
];

/** Existing records that should point at the pancreatic page. */
export const pdacCrossLinks: Record<string, string[]> = {
  capecitabine: ["pancreatic"], cisplatin: ["pancreatic"], "tegafur-gimeracil-oteracil": ["pancreatic"], nimotuzumab: ["pancreatic"], adagrasib: ["pancreatic"],
  larotrectinib: ["pancreatic"], pembrolizumab: ["pancreatic"], "irreversible-electroporation": ["pancreatic"], sbrt: ["pancreatic"],
};

import type { CompanyInput, DrugInput, EntityInput, IdeaInput, PairingInput, TechnologyInput, TermInput, TrialInput } from "@/lib/schema";
import type { Spike } from "./index";
import { supplement } from "../supplement";

/**
 * BILIARY TRACT CANCER (CHOLANGIOCARCINOMA) SPIKE. Facts checked 2026-09-07.
 */
const asOf = "2026-09-07";
const W = (s: string) => `https://en.wikipedia.org/wiki/${s}`;
const ct = (nct: string) => ({ label: `ClinicalTrials.gov ${nct}`, url: `https://clinicaltrials.gov/study/${nct}` });

const t = (x: Omit<TrialInput, "kind" | "asOf">): TrialInput => ({ kind: "trial", asOf, ...x });
const d = (x: Omit<DrugInput, "kind" | "asOf">): DrugInput => ({ kind: "drug", asOf, ...x });
const tech = (x: Omit<TechnologyInput, "kind" | "asOf">): TechnologyInput => ({ kind: "technology", asOf, ...x });
const term = (x: Omit<TermInput, "kind" | "asOf">): TermInput => ({ kind: "term", asOf, ...x });
const co = (x: Omit<CompanyInput, "kind" | "asOf">): CompanyInput => ({ kind: "company", asOf, ...x });
const idea = (x: Omit<IdeaInput, "kind" | "asOf">): IdeaInput => ({ kind: "idea", asOf, ...x });
const pair = (x: Omit<PairingInput, "kind" | "asOf">): PairingInput => ({ kind: "pairing", asOf, ...x });

// ======================= COMPANIES =======================
const companies: CompanyInput[] = [
  co({ id: "incyte", trials: ["nct05429268", "nct04680052", "nct05222555", "nct07023627", "nct02955940", "nct05287113", "nct06465433", "nct04509700", "nct03934372", "nct05879822"], links: [{ label: "Official website", url: "https://www.incyte.com" }], name: "Incyte", hq: "Wilmington, DE", country: "US", companyType: "biotech", website: "https://www.incyte.com", ticker: "INCY", sections: ["targeted-therapy"],
    tldr: "Incyte makes pemigatinib, the first targeted drug approved for bile duct cancer (2020), and the JAK inhibitor ruxolitinib.",
    summary: "Incyte, based in Wilmington, Delaware, and listed as INCY, makes pemigatinib, sold as Pemazyre, the first targeted drug approved for bile duct cancer in 2020, and the JAK inhibitor ruxolitinib, proved in COMFORT-I for myelofibrosis. Pemigatinib was approved for FGFR2-fusion cholangiocarcinoma on the FIGHT-202 trial, but the first-line FIGHT-302 trial against gemcitabine and cisplatin was discontinued; the company also markets tafasitamab with MorphoSys for diffuse large B-cell lymphoma and retifanlimab, and it developed the failed IDO1 inhibitor epacadostat. OnCo links it to biliary tract cancer, lymphoma, anal cancer, Merkel cell carcinoma and myeloproliferative neoplasms. Whether FGFR inhibition can move earlier in bile duct cancer after FIGHT-302 stopped is the open question. Each product has its own page.",
    drugs: ["pemigatinib", "epacadostat", "incb123667", "incb161734", "inca33890"], cancers: ["cholangiocarcinoma"] }),
  co({ id: "taiho", links: [{ label: "Official website", url: "https://www.taiho.co.jp/en/" }], name: "Taiho Pharmaceutical (Otsuka)", hq: "Tokyo", country: "JP", companyType: "pharma", website: "https://www.taiho.co.jp/en/", sections: ["targeted-therapy", "adcs"],
    tldr: "Japanese oncology company behind futibatinib (Lytgobi) for bile duct cancer and the chemotherapy Lonsurf; acquired the ADC linker company Araris in 2025.",
    summary: "Taiho Pharmaceutical, the Tokyo-based oncology arm of Otsuka, is the company behind futibatinib, sold as Lytgobi, for bile duct cancer, and the chemotherapy Lonsurf, and in 2025 it acquired the antibody-drug conjugate linker company Araris Biotech. Futibatinib was approved in 2022 on the FOENIX-CCA2 trial for FGFR2-altered cholangiocarcinoma, Lonsurf, or trifluridine and tipiracil, is used in colorectal and gastric cancer with TAS-102 combinations under study, and OnCo also links Taiho to S-1, the tegafur, gimeracil and oteracil combination used in Asia. The Araris purchase signals a move from small molecules into ADCs. Whether a chemotherapy-rooted company can build a competitive ADC pipeline from an acquired linker platform is the open question. Futibatinib and Araris have their own pages.",
    drugs: ["futibatinib"], companies: ["araris"], cancers: ["cholangiocarcinoma", "colorectal"] }),
  co({ id: "transthera", trials: ["nct07498478", "nct05948475"], links: [{ label: "Official website", url: "https://www.transtherabio.com" }], name: "TransThera Sciences", hq: "Nanjing", country: "CN", companyType: "biotech", website: "https://www.transtherabio.com", sections: ["targeted-therapy"],
    tldr: "Chinese biotech running the first phase 3 of a next-generation FGFR inhibitor, tinengotinib, for bile duct cancer that has stopped responding to first-generation FGFR drugs.",
    summary: "TransThera Sciences, based in Nanjing, is the Chinese biotechnology company running the first phase 3 trial of a next-generation FGFR inhibitor, tinengotinib, for bile duct cancer that has stopped responding to first-generation FGFR drugs. Tinengotinib, also known as TT-00420, is a multi-kinase inhibitor potent against the FGFR2 kinase-domain mutations that drive acquired resistance, and the FIRST-308 phase 3 trial, which compares it with physician's choice chemotherapy in FGFR-altered, FGFR-inhibitor-refractory cholangiocarcinoma, dosed its first US patient in 2025. OnCo links it to biliary tract cancer and to the tinengotinib drug record. Whether a resistance-directed FGFR inhibitor can beat chemotherapy in a population that has already progressed on targeted therapy is the question the trial will answer. Tinengotinib has its own page.",
    drugs: ["tinengotinib"], cancers: ["cholangiocarcinoma"] }),
];

// ======================= TECHNOLOGIES =======================
const technologies: TechnologyInput[] = [
  tech({ id: "biliary-stenting-drainage", name: "Biliary stenting and drainage", sections: ["surgery", "supportive-care"], status: "standard-of-care", wikipedia: W("Biliary_stent"),
    tldr: "A small tube placed by endoscope or through the skin reopens a blocked bile duct, relieving jaundice so chemotherapy can be given.",
    summary: "Most patients with perihilar or distal bile duct cancer present with obstructive jaundice; ERCP-placed plastic or metal stents, or percutaneous transhepatic drainage, are required before systemic therapy (bilirubin must fall) and before surgery in selected cases. Endoscopic ultrasound-guided drainage and radiofrequency ablation of the stricture through the stent are newer adjuncts.",
    principle: "Restore bile flow across a malignant stricture; self-expanding metal stents stay patent longer than plastic.",
    strengths: ["Rapid symptom relief", "Enables chemotherapy dosing"],
    limitations: ["Cholangitis and stent occlusion", "Pre-operative drainage is debated for resectable disease"],
    cancers: ["cholangiocarcinoma", "pancreatic"], links: [{ label: "Wikipedia", url: W("Biliary_stent") }] }),
];

// ======================= TERMS =======================
const terms: TermInput[] = [
  term({ id: "biliary-anatomy-subtypes", name: "Intrahepatic, perihilar, distal and gallbladder cancer", category: "Clinical", wikipedia: W("Cholangiocarcinoma"),
    tldr: "Bile duct cancers are named by where they start: inside the liver, at the hilum where the ducts join, in the lower duct near the pancreas, or in the gallbladder. Each behaves and mutates differently.",
    summary: "Intrahepatic cholangiocarcinoma (iCCA) carries FGFR2 fusions (~10-15%) and IDH1 mutations (~15%) and is rising in incidence; perihilar (Klatskin) and distal tumours are more often HER2-amplified or KRAS-mutant; gallbladder cancer has the highest HER2 prevalence (~15-20%) and is common in Chile, India and among Indigenous Americans. Molecular profiling is guideline-recommended for all advanced biliary cancers.",
    cancers: ["cholangiocarcinoma"], targets: ["fgfr2", "idh", "her2"], links: [{ label: "Wikipedia", url: W("Cholangiocarcinoma") }] }),
  term({ id: "fgfr2-fusion", links: [{ label: "FIGHT-202: pemigatinib for previously treated FGFR2-rearranged cholangiocarcinoma (Lancet Oncology 2020)", url: "https://doi.org/10.1016/S1470-2045(20)30109-1" }], wikipedia: W("Fibroblast_growth_factor_receptor_2"), name: "FGFR2 fusions and rearrangements", category: "Genomics",
    tldr: "A broken-and-rejoined FGFR2 gene that drives about one in eight intrahepatic bile duct cancers and can be switched off with pills.",
    summary: "Detected by RNA or DNA sequencing; partners are diverse (BICC1 most common). Pemigatinib (ORR 37%) and futibatinib (ORR 42%) are approved; acquired resistance arises through FGFR2 kinase-domain mutations (N550, V565 gatekeeper) that next-generation inhibitors (tinengotinib, RLY-4008 lirafugratinib) target. Hyperphosphataemia is the class effect.",
    cancers: ["cholangiocarcinoma"], targets: ["fgfr2"], drugs: ["pemigatinib", "futibatinib", "tinengotinib"], terms: ["gene-fusion"] }),
];

// ======================= PRODUCTS =======================
const drugs: DrugInput[] = [
  d({ id: "gemcitabine-cisplatin", name: "Gemcitabine + cisplatin", modality: "Cytotoxic regimen", status: "standard-of-care", wikipedia: W("Gemcitabine"),
    tldr: "Gemcitabine plus cisplatin has been the chemotherapy backbone for bile duct cancer since 2010 and is now given with immunotherapy.",
    summary: "Gemcitabine, a nucleoside analogue that terminates DNA chains, is combined with cisplatin, which crosslinks DNA, giving two complementary attacks on dividing cells. The doublet has been the chemotherapy backbone for advanced biliary tract cancer since ABC-02 (2010) showed overall survival of 11.7 versus 8.1 months against gemcitabine alone (HR 0.64), and it is given on days 1 and 8 of a 3-week cycle for up to 8 cycles. It is now the backbone of TOPAZ-1 with durvalumab (OS HR 0.76, 24-month OS 23.6% versus 11.5%) and KEYNOTE-966 with pembrolizumab (OS 12.7 versus 10.9 months), so most patients receive it with immunotherapy. Adding nab-paclitaxel (SWOG 1815) did not improve survival. Grade 3 to 4 neutropenia (25%) and fatigue are the main toxicities, and renal function and hearing need monitoring. For a newcomer, this is the standard two-drug chemotherapy for bile duct cancer.",
    mechanism: "Nucleoside analogue (gemcitabine) plus DNA crosslinker (cisplatin).",
    dosing: { route: "Intravenous", schedule: "Gemcitabine 1000 mg/m² + cisplatin 25 mg/m² days 1 and 8 every 3 weeks, up to 8 cycles", monitoring: "Renal function, hearing, blood counts" },
    toxicity: [{ event: "Neutropenia (grade 3-4)", grade3PlusPct: 25, note: "ABC-02" }, { event: "Fatigue", grade3PlusPct: 19, note: "ABC-02" }],
    technologies: ["cytotoxic-chemotherapy", "platinum"], cancers: ["cholangiocarcinoma"], trials: ["abc-02", "topaz-1", "keynote-966", "nct05771480", "nct06109779", "nct02453282", "nct02542293", "nct03003962", "nct06225596", "nct07221253", "nct06591520"], links: [{ label: "Wikipedia", url: W("Gemcitabine") }] }),
  d({ id: "pemigatinib", links: [{ label: "FDA label (DailyMed)", url: "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=Pemigatinib" }], name: "Pemigatinib", brand: "Pemazyre", modality: "Small-molecule kinase inhibitor (FGFR1-3)", status: "approved", wikipedia: W("Pemigatinib"),
    tldr: "Pemigatinib was the first targeted therapy for bile duct cancer, for tumours with an FGFR2 gene fusion.",
    summary: "Pemigatinib is a selective oral inhibitor of FGFR1, 2 and 3, blocking the constitutively active receptor produced when FGFR2 is fused to another gene. It is used in previously treated cholangiocarcinoma with an FGFR2 fusion or rearrangement and was the first targeted therapy approved for bile duct cancer. FIGHT-202 showed an ORR of 37%, median PFS of 7.0 months and median OS of 17.5 months, with no responses in other FGF/FGFR alterations; accelerated approval followed in April 2020 (EU 2021), and it is also approved for FGFR1-rearranged myeloid and lymphoid neoplasms. Hyperphosphataemia (60%), alopecia, diarrhoea, nail toxicity and serous retinal detachment are on-target effects needing phosphate binders and eye checks. First-line FIGHT-302 was discontinued, so its place remains second line. For a newcomer, it is the first pill that targets a specific gene change in bile duct cancer.",
    mechanism: "Selective oral FGFR1-3 inhibitor.",
    mechanismSteps: ["Enters tumour cell", "Occupies ATP pocket of fusion FGFR2 kinase", "Blocks RAS-MAPK and PI3K signalling downstream", "Cell-cycle arrest; hyperphosphataemia from FGFR1 blockade in kidney"],
    dosing: { route: "Oral", schedule: "13.5 mg daily for 14 days of each 21-day cycle", modifications: "Phosphate binders and dose holds for hyperphosphataemia", monitoring: "Serum phosphate, eye exams (retinal pigment epithelial detachment)" },
    toxicity: [{ event: "Hyperphosphataemia", anyGradePct: 60, note: "FIGHT-202" }, { event: "Alopecia", anyGradePct: 49 }, { event: "Diarrhoea", anyGradePct: 47 }, { event: "Nail toxicity", anyGradePct: 43 }, { event: "Serous retinal detachment", anyGradePct: 4 }],
    approvals: [{ region: "US", year: 2020, indication: "Previously treated FGFR2-fusion/rearranged cholangiocarcinoma (accelerated)" }, { region: "EU", year: 2021, indication: "Same" }],
    targets: ["fgfr2"], technologies: ["kinase-inhibitors"], companies: ["incyte"], cancers: ["cholangiocarcinoma"], trials: ["fight-202"], terms: ["fgfr2-fusion"] }),
  d({ id: "futibatinib", name: "Futibatinib", brand: "Lytgobi", modality: "Small-molecule irreversible kinase inhibitor (FGFR1-4)", status: "approved", wikipedia: W("Futibatinib"),
    tldr: "Futibatinib is a covalent FGFR inhibitor for FGFR2-fusion bile duct cancer, with the highest response rate of the first-generation drugs.",
    summary: "Futibatinib is an irreversible inhibitor of FGFR1-4 that binds covalently to a cysteine in the kinase P-loop, a mechanism that retains activity against some resistance mutations that defeat reversible FGFR inhibitors. It is used in previously treated intrahepatic cholangiocarcinoma with an FGFR2 fusion or rearrangement. FOENIX-CCA2 (NEJM 2023) showed an ORR of 42%, median PFS of 9.0 months and median OS of 21.7 months, the highest response rate of the first-generation FGFR drugs. Accelerated approval followed in September 2022 (EMA 2023) at 20 mg daily continuously; hyperphosphataemia is near universal (85%, 30% grade 3 or higher). Whether it should be preferred over pemigatinib, and how to treat acquired FGFR2 kinase-domain mutations, are open questions now addressed by agents such as tinengotinib. For a newcomer, futibatinib is the covalent FGFR pill for bile duct cancer.",
    mechanism: "Irreversible covalent binder of the FGFR kinase P-loop cysteine.",
    dosing: { route: "Oral", schedule: "20 mg daily continuously", monitoring: "Phosphate, eyes" },
    toxicity: [{ event: "Hyperphosphataemia", anyGradePct: 85, grade3PlusPct: 30, note: "FOENIX-CCA2" }, { event: "Alopecia", anyGradePct: 33 }, { event: "Dry mouth", anyGradePct: 30 }],
    approvals: [{ region: "US", year: 2022, indication: "Previously treated FGFR2-fusion/rearranged intrahepatic cholangiocarcinoma (accelerated)" }, { region: "EU", year: 2023, indication: "Same" }],
    targets: ["fgfr2"], technologies: ["kinase-inhibitors"], companies: ["taiho"], cancers: ["cholangiocarcinoma"], trials: ["foenix-cca2", "nct06506955", "nct07710885", "nct05945823"], terms: ["fgfr2-fusion"],
    links: [{ label: "NEJM 2023", url: "https://www.nejm.org/doi/full/10.1056/NEJMoa2206834" }] }),
  d(supplement<DrugInput>({ id: "ivosidenib", kind: "drug",
    notes: ["In cholangiocarcinoma: ClarIDHy showed PFS of 2.7 versus 1.4 months (HR 0.37) and a crossover-adjusted OS benefit in previously treated IDH1-mutant disease, approved in August 2021; the response rate was 2 percent, so disease stabilisation is the benefit. In ClarIDHy nausea affected 41 percent, diarrhoea 35 percent, fatigue 31 percent and grade 3 or higher ascites 9 percent."],
    cancers: ["cholangiocarcinoma"], trials: ["claridhy"] })),
  d({ id: "tinengotinib", links: [{ label: "ClinicalTrials.gov NCT05948475: tinengotinib versus physician's choice in FGFR-altered cholangiocarcinoma (phase 3)", url: "https://clinicaltrials.gov/study/NCT05948475" }, { label: "ClinicalTrials.gov NCT05253053: TT-00420 (tinengotinib) monotherapy and combinations (phase 1/2)", url: "https://clinicaltrials.gov/study/NCT05253053" }], name: "Tinengotinib", code: "TT-00420", modality: "Small-molecule multi-kinase inhibitor (FGFR1-3, VEGFR, Aurora, JAK)", status: "phase-3",
    tldr: "A next-generation FGFR inhibitor designed to work after pemigatinib or futibatinib stop working, now in a global phase 3.",
    summary: "Tinengotinib is a type I multi-kinase inhibitor active against FGFR1-3, including the FGFR2 kinase-domain resistance mutations (N550, V565) that emerge after pemigatinib or futibatinib, plus VEGFR, Aurora and JAK kinases. It is aimed at FGFR-altered cholangiocarcinoma that has progressed on a prior FGFR inhibitor, a group with no approved targeted option. A phase 1/2 study in heavily pretreated patients, including after prior FGFR inhibitors, showed disease control with median PFS of about 5 to 6 months. The global phase 3 FIRST-308 trial randomises FGFR inhibitor-refractory patients to tinengotinib versus FOLFOX or FOLFIRI, primary endpoint PFS; the first US patient was dosed in 2025. Whether its broad kinase profile adds toxicity without benefit over selective FGFR2 inhibitors is open. For a newcomer, it is a drug for bile duct cancer that has outgrown the existing FGFR pills.",
    mechanism: "Type I inhibitor active against FGFR2 kinase-domain resistance mutations (N550, V565) plus VEGFR and Aurora kinases.",
    targets: ["fgfr2"], technologies: ["kinase-inhibitors"], companies: ["transthera"], cancers: ["cholangiocarcinoma"], trials: ["first-308", "nct07052253", "nct07498478", "nct05948475"], terms: ["fgfr2-fusion"] }),
];

// ======================= TRIALS =======================
const trials: TrialInput[] = [
  t({ id: "abc-02", name: "ABC-02", phase: "3", status: "positive", yearReported: 2010, sponsor: "Cancer Research UK", enrolled: 410,
    setting: "Locally advanced or metastatic biliary tract cancer: gemcitabine + cisplatin vs gemcitabine",
    tldr: "ABC-02 was the 2010 UK trial that gave bile duct cancer its first standard chemotherapy: 410 patients with advanced biliary tract cancer were randomised to gemcitabine plus cisplatin or gemcitabine alone, and the doublet lengthened life and delayed progression. It stayed the control arm for every first-line trial for more than a decade.",
    summary: "ABC-02, sponsored by Cancer Research UK and reported in the New England Journal of Medicine in 2010, was the UK trial that gave bile duct cancer its first standard chemotherapy, gemcitabine plus cisplatin. It randomised 410 patients with locally advanced or metastatic biliary tract cancer to the doublet or gemcitabine alone, met its primary overall survival endpoint and delayed progression, and remained the control arm for every subsequent first-line trial for more than a decade. OnCo links it to biliary tract and gallbladder cancer, the gemcitabine plus cisplatin record, Cancer Research UK and Juan W. Valle, and the result was confirmed by the Japanese BT22 trial. Whether triplet chemotherapy or immunotherapy additions, as in TOPAZ-1, now make the doublet alone obsolete is the question that followed.",
    result: "OS 11.7 vs 8.1 months, HR 0.64.",
    outcomes: [{ endpoint: "Overall survival", primary: true, unit: "months", arms: [{ name: "Gemcitabine + cisplatin", n: 204, value: 11.7 }, { name: "Gemcitabine", n: 206, value: 8.1 }], hr: 0.64, ci: [0.52, 0.80], p: "<0.001", source: "https://doi.org/10.1056/NEJMoa0908721" }],
    replication: "Confirmed by the Japanese BT22 trial and a decade of use as control arm.",
    drugs: ["gemcitabine-cisplatin"], cancers: ["cholangiocarcinoma"], links: [{ label: "NEJM 2010", url: "https://www.nejm.org/doi/full/10.1056/NEJMoa0908721" }], institutions: ["cruk"], people: ["juan-valle"] }),
  t({ id: "bilcap", links: [{ label: "ISRCTN registry entry (ISRCTN72785446)", url: "https://www.isrctn.com/ISRCTN72785446" }, { label: "Primrose et al., Lancet Oncology 2019", url: "https://doi.org/10.1016/S1470-2045(18)30915-X" }], name: "BILCAP", phase: "3", status: "mixed", yearReported: 2017, sponsor: "Cancer Research UK", enrolled: 447,
    setting: "Adjuvant capecitabine for 6 months vs observation after resection of biliary tract cancer",
    tldr: "Six months of oral chemotherapy after surgery became the standard for bile duct cancer despite a technically negative primary result.",
    summary: "BILCAP, registered as ISRCTN72785446 and sponsored by Cancer Research UK, reported in 2017 and published in Lancet Oncology in 2019, made six months of oral capecitabine after surgery the standard for bile duct cancer despite a technically negative primary result. It randomised 447 patients to capecitabine or observation after resection, and the intention-to-treat overall survival analysis missed statistical significance while the per-protocol analysis was significant, after which ASCO and ESMO guidelines adopted it as standard adjuvant therapy. OnCo links it to biliary tract and gallbladder cancer, cytotoxic chemotherapy and Cancer Research UK. Whether a per-protocol result should set a standard of care, and whether adding immunotherapy or gemcitabine to adjuvant capecitabine improves on it, are the open questions.",
    result: "OS 51.1 vs 36.4 months; ITT HR 0.81 (p=0.097), per-protocol HR 0.75.",
    outcomes: [{ endpoint: "Overall survival (ITT)", primary: true, unit: "months", arms: [{ name: "Capecitabine", n: 223, value: 51.1 }, { name: "Observation", n: 224, value: 36.4 }], hr: 0.81, ci: [0.63, 1.04], p: "0.097", source: "https://doi.org/10.1016/S1470-2045(18)30915-X" }],
    cancers: ["cholangiocarcinoma"], technologies: ["cytotoxic-chemotherapy"], institutions: ["cruk"], tags: ["lesson:itt-vs-per-protocol"] }),
  t({ id: "topaz-1", name: "TOPAZ-1", nct: "NCT03875235", phase: "3", status: "positive", yearReported: 2022, sponsor: "AstraZeneca", enrolled: 685,
    setting: "First-line advanced biliary tract cancer: gemcitabine-cisplatin + durvalumab vs + placebo",
    tldr: "TOPAZ-1 was the first immunotherapy success in bile duct cancer, with a small median gain but a growing tail of long survivors.",
    summary: "TOPAZ-1, trial NCT03875235 sponsored by AstraZeneca and reported in 2022, was the first immunotherapy success in bile duct cancer, adding durvalumab to gemcitabine and cisplatin in first-line advanced biliary tract cancer. It randomised 685 patients, met its primary overall survival endpoint with a small median gain but a growing tail of long survivors, confirmed at two years and in a three-year update in 2025, and led to approval in September 2022. OnCo links it to biliary tract and gallbladder cancer, durvalumab, gemcitabine plus cisplatin, the pairing of chemotherapy with PD-1 or PD-L1 blockade, Juan W. Valle and Do-Youn Oh, and KEYNOTE-966 with pembrolizumab reproduced the class effect. Which patients populate the durable tail, and whether a biomarker can find them in advance, is the open question.",
    result: "OS HR 0.76; 2-year OS 23.6% vs 11.5%.",
    outcomes: [{ endpoint: "Overall survival (updated)", primary: true, unit: "months", arms: [{ name: "Durvalumab + GemCis", n: 341, value: 12.9 }, { name: "Placebo + GemCis", n: 344, value: 11.3 }], hr: 0.76, ci: [0.64, 0.91], source: "https://doi.org/10.1056/EVIDoa2200015" }, { endpoint: "24-month overall survival", unit: "%", arms: [{ name: "Durvalumab + GemCis", value: 23.6 }, { name: "Placebo + GemCis", value: 11.5 }], source: "https://doi.org/10.1056/EVIDoa2200015" }],
    replication: "KEYNOTE-966 (pembrolizumab) reproduced the class effect.",
    drugs: ["durvalumab", "gemcitabine-cisplatin"], cancers: ["cholangiocarcinoma"], links: [ct("NCT03875235"), { label: "Updated OS (PubMed)", url: "https://pubmed.ncbi.nlm.nih.gov/38823398/" }, { label: "3-year update", url: "https://www.journal-of-hepatology.eu/article/S0168-8278(25)02201-9/fulltext" }], people: ["juan-valle", "oh-do-youn"] }),
  t({ id: "keynote-966", name: "KEYNOTE-966", nct: "NCT04003636", phase: "3", status: "positive", yearReported: 2023, sponsor: "Merck", enrolled: 1069,
    setting: "First-line advanced biliary tract cancer: gemcitabine-cisplatin + pembrolizumab vs + placebo",
    tldr: "A second immunotherapy trial confirmed the modest survival benefit of adding PD-1 blockade to chemotherapy in bile duct cancer.",
    summary: "KEYNOTE-966, trial NCT04003636 sponsored by Merck and reported in 2023, was the second immunotherapy trial to confirm a modest survival benefit from adding PD-1 blockade to chemotherapy in first-line advanced biliary tract cancer. It randomised 1,069 patients to pembrolizumab or placebo with gemcitabine and cisplatin, with gemcitabine continued beyond eight cycles in both arms, met its primary overall survival endpoint and led to approval in October 2023. OnCo links it to biliary tract and gallbladder cancer, pembrolizumab, gemcitabine plus cisplatin and the pairing of chemotherapy with PD-1 or PD-L1 blockade, and it replicates TOPAZ-1. Whether the modest median gain justifies routine use for every patient, given the cost, is the open question.",
    result: "OS 12.7 vs 10.9 months, HR 0.83.",
    outcomes: [{ endpoint: "Overall survival", primary: true, unit: "months", arms: [{ name: "Pembrolizumab + GemCis", n: 533, value: 12.7 }, { name: "Placebo + GemCis", n: 536, value: 10.9 }], hr: 0.83, ci: [0.72, 0.95], p: "0.0034", source: "https://doi.org/10.1016/S0140-6736(23)00727-4" }],
    replication: "Replicates TOPAZ-1.",
    drugs: ["pembrolizumab", "gemcitabine-cisplatin"], cancers: ["cholangiocarcinoma"], links: [ct("NCT04003636")] }),
  t({ id: "fight-202", name: "FIGHT-202", nct: "NCT02924376", phase: "2", status: "positive", yearReported: 2020, sponsor: "Incyte", enrolled: 147,
    setting: "Previously treated cholangiocarcinoma with FGFR2 fusions (cohort A): pemigatinib single arm",
    tldr: "FIGHT-202 is the single-arm study that produced the first targeted approval in bile duct cancer.",
    summary: "FIGHT-202, trial NCT02924376 sponsored by Incyte and reported in 2020, is the single-arm phase 2 study that produced the first targeted approval in bile duct cancer, for pemigatinib in previously treated cholangiocarcinoma with FGFR2 fusions. Among 147 patients, the 107 with FGFR2 fusions in cohort A had an objective response rate of about 37 percent with durable disease control, while patients with other FGF or FGFR alterations had no responses. OnCo links it to biliary tract cancer, FGFR2 as a target and pemigatinib. Without a randomised comparison the trial cannot show a survival advantage, and the first-line confirmatory trial FIGHT-302 was discontinued, so where FGFR inhibition best fits in the sequence is the open question.",
    result: "ORR 37%; PFS 7.0 months; OS 17.5 months.",
    outcomes: [{ endpoint: "Objective response rate", primary: true, unit: "%", arms: [{ name: "Pemigatinib (FGFR2 fusion)", n: 107, value: 35.5 }], source: "https://doi.org/10.1016/S1470-2045(20)30109-1" }, { endpoint: "Progression-free survival", unit: "months", arms: [{ name: "Pemigatinib", value: 7.0 }], source: "https://doi.org/10.1016/S1470-2045(20)30109-1" }],
    drugs: ["pemigatinib"], cancers: ["cholangiocarcinoma"], targets: ["fgfr2"], links: [ct("NCT02924376")] }),
  t({ id: "foenix-cca2", name: "FOENIX-CCA2", nct: "NCT02052778", phase: "1/2", status: "positive", yearReported: 2022, sponsor: "Taiho", enrolled: 103,
    setting: "Previously treated FGFR2-rearranged intrahepatic cholangiocarcinoma: futibatinib single arm",
    tldr: "Futibatinib produced responses in over 40% of patients whose bile duct cancer carried an FGFR2 fusion.",
    summary: "FOENIX-CCA2, trial NCT02052778 sponsored by Taiho and reported in 2022 with publication in the New England Journal of Medicine in 2023, showed that futibatinib produced responses in more than forty percent of patients whose previously treated intrahepatic cholangiocarcinoma carried an FGFR2 rearrangement. It was a single-arm phase 2 of 103 patients with an objective response rate of 42 percent and durable disease control, supporting approval. OnCo links it to biliary tract cancer, FGFR2 as a target, futibatinib and Lipika Goyal. As with pemigatinib, the absence of a randomised comparison leaves open whether an irreversible FGFR inhibitor improves survival over chemotherapy and how it should be sequenced with other FGFR drugs.",
    result: "ORR 42%; PFS 9.0 months; OS 21.7 months.",
    outcomes: [{ endpoint: "Objective response rate", primary: true, unit: "%", arms: [{ name: "Futibatinib", n: 103, value: 42 }], source: "https://doi.org/10.1056/NEJMoa2206834" }, { endpoint: "Progression-free survival", unit: "months", arms: [{ name: "Futibatinib", value: 9.0 }], source: "https://doi.org/10.1056/NEJMoa2206834" }, { endpoint: "Overall survival", unit: "months", arms: [{ name: "Futibatinib", value: 21.7 }], source: "https://doi.org/10.1056/NEJMoa2206834" }],
    drugs: ["futibatinib"], cancers: ["cholangiocarcinoma"], targets: ["fgfr2"], links: [ct("NCT02052778"), { label: "NEJM 2023", url: "https://www.nejm.org/doi/full/10.1056/NEJMoa2206834" }], people: ["lipika-goyal"] }),
  t({ id: "claridhy", name: "ClarIDHy", nct: "NCT02989857", phase: "3", status: "positive", yearReported: 2020, sponsor: "Agios (now Servier)", enrolled: 187,
    setting: "Previously treated IDH1-mutant cholangiocarcinoma: ivosidenib vs placebo",
    tldr: "The first randomised trial of a targeted drug in bile duct cancer; it slowed the disease without shrinking it.",
    summary: "ClarIDHy, trial NCT02989857 sponsored by Agios, now Servier, and reported in 2020, was the first randomised trial of a targeted drug in bile duct cancer, testing ivosidenib against placebo in previously treated IDH1-mutant cholangiocarcinoma. It randomised 187 patients, met its primary progression-free survival endpoint with a large relative effect, and showed an overall survival benefit once adjusted for crossover, but the response rate was only about two percent, so it slowed the disease without shrinking it. OnCo links it to biliary tract cancer, IDH1 and IDH2 as targets, ivosidenib and Ghassan K. Abou-Alfa. Whether a drug that stabilises rather than shrinks tumours is worth its cost in a setting with few alternatives is the open question.",
    result: "PFS HR 0.37; crossover-adjusted OS HR 0.49.",
    outcomes: [{ endpoint: "Progression-free survival", primary: true, unit: "months", arms: [{ name: "Ivosidenib", n: 126, value: 2.7 }, { name: "Placebo", n: 61, value: 1.4 }], hr: 0.37, ci: [0.25, 0.54], p: "<0.0001", source: "https://doi.org/10.1016/S1470-2045(20)30157-1" }, { endpoint: "Overall survival (crossover-adjusted)", unit: "months", arms: [{ name: "Ivosidenib", value: 10.3 }, { name: "Placebo", value: 7.5 }], hr: 0.49, source: "https://doi.org/10.1016/S1470-2045(20)30157-1" }],
    drugs: ["ivosidenib"], cancers: ["cholangiocarcinoma"], targets: ["idh"], links: [ct("NCT02989857")], people: ["ghassan-abou-alfa"] }),
  t({ id: "herizon-btc-302", name: "HERIZON-BTC-302", nct: "NCT06282575", phase: "3", status: "recruiting", sponsor: "Jazz / Zymeworks",
    setting: "First-line HER2-positive advanced biliary tract cancer: zanidatamab + standard of care (GemCis ± PD-1) vs standard of care",
    tldr: "Tests whether the HER2 bispecific antibody should be given from the start in HER2-positive bile duct cancer.",
    summary: "HERIZON-BTC-302, trial NCT06282575 sponsored by Jazz and Zymeworks, tests whether the HER2 bispecific antibody zanidatamab should be given from the start in HER2-positive advanced biliary tract cancer, added to gemcitabine and cisplatin with or without PD-1 blockade. It is the confirmatory trial for zanidatamab's accelerated approval, which rested on the single-arm HERIZON-BTC-01 study, where about forty percent of patients responded and those with the highest HER2 expression responded most often; enrolment has been under way since 2024 with no results. OnCo links it to biliary tract and gallbladder cancer, HER2 as a target, zanidatamab and gemcitabine plus cisplatin. Whether HER2-directed therapy moves from later lines into first-line treatment for this rare subgroup is the question it will answer.",
    drugs: ["zanidatamab", "gemcitabine-cisplatin"], cancers: ["cholangiocarcinoma"], targets: ["her2"], links: [ct("NCT06282575"), { label: "Post-hoc HERIZON-BTC-01 analysis", url: "https://www.ccanewsonline.com/issues/2026/march-2026-vol-7-no-1/zanidatamab-improves-survival-outcomes-in-her2-positive-biliary-tract-cancer-post-hoc-herizon-btc-01-analysis" }] }),
  t({ id: "first-308", name: "FIRST-308", phase: "3", status: "recruiting", sponsor: "TransThera",
    setting: "FGFR-altered cholangiocarcinoma refractory to chemotherapy and a first-generation FGFR inhibitor: tinengotinib vs FOLFOX/FOLFIRI",
    tldr: "The first phase 3 trial for patients whose bile duct cancer has outgrown the existing FGFR drugs.",
    summary: "FIRST-308, sponsored by TransThera, is the first phase 3 trial for patients whose bile duct cancer has outgrown the existing FGFR drugs, testing tinengotinib against FOLFOX or FOLFIRI chemotherapy in FGFR-altered cholangiocarcinoma refractory to chemotherapy and a first-generation FGFR inhibitor. It is a global randomised trial with progression-free survival as the primary endpoint, and the first US patient was dosed in 2025. OnCo links it to biliary tract cancer, FGFR2 as a target and tinengotinib. Whether a next-generation inhibitor active against kinase-domain resistance mutations can beat chemotherapy in patients who have already progressed on targeted therapy is the question it exists to answer.",
    drugs: ["tinengotinib"], cancers: ["cholangiocarcinoma"], targets: ["fgfr2"], links: [{ label: "TransThera announcement", url: "https://www.biospace.com/transthera-announces-the-global-multicenter-phase-3-clinical-trial-completed-first-patient-dosing-in-the-us-evaluating-tinengotinib-in-fgfri-relapsed-refractory-patients-with-cholangiocarcinoma" }] }),
  t({ id: "naliricc", name: "NALIRICC (AIO)", phase: "2", status: "negative", yearReported: 2024, sponsor: "AIO (Germany)", enrolled: 100,
    setting: "Second-line biliary tract cancer after gemcitabine: liposomal irinotecan + 5-FU/LV vs 5-FU/LV",
    tldr: "Adding a liposomal chemotherapy did not help in second-line bile duct cancer, contradicting an earlier Korean trial.",
    summary: "NALIRICC, run by the German AIO group and published in Lancet Gastroenterology and Hepatology in 2024, found that adding liposomal irinotecan to fluorouracil and leucovorin did not help in second-line biliary tract cancer after gemcitabine, contradicting the earlier positive Korean NIFTY trial. It was a phase 2 of 100 patients that showed no improvement in progression-free or overall survival, although a 2025 pooled analysis of the two trials modestly favoured the combination. OnCo links it to biliary tract cancer and cytotoxic chemotherapy, and notes that second-line FOLFOX, per ABC-06, gives a small benefit. Whether the discordance between the two trials reflects population differences or chance is the open question.",
    result: "OS 6.9 vs 8.2 months; not improved.",
    outcomes: [{ endpoint: "Overall survival", unit: "months", arms: [{ name: "nal-IRI + 5-FU/LV", value: 6.9 }, { name: "5-FU/LV", value: 8.2 }] }],
    cancers: ["cholangiocarcinoma"], technologies: ["cytotoxic-chemotherapy"], links: [{ label: "Lancet Gastroenterol Hepatol 2024", url: "https://www.thelancet.com/journals/langas/article/PIIS2468-1253(24)00119-5/fulltext" }], tags: ["failure", "lesson:replication"] }),
];

// ======================= PAIRINGS =======================
const pairings: PairingInput[] = [
  pair({ id: "gemcis-plus-io-btc", links: [{ label: "ClinicalTrials.gov NCT03875235: TOPAZ-1", url: "https://clinicaltrials.gov/study/NCT03875235" }, { label: "ClinicalTrials.gov NCT04003636: KEYNOTE-966", url: "https://clinicaltrials.gov/study/NCT04003636" }], name: "Gemcitabine-cisplatin + PD-(L)1 blockade in biliary cancer", a: "gemcitabine-cisplatin", b: "checkpoint-inhibitor", pairingType: "combination",
    tldr: "Chemotherapy plus immunotherapy is now the first treatment for advanced bile duct cancer, with a small average gain and a minority of long survivors.",
    summary: "Gemcitabine plus cisplatin combined with a PD-1 or PD-L1 checkpoint inhibitor is now the first-line standard for advanced biliary tract cancer, including gallbladder cancer. The pairing rests on chemotherapy-induced immunogenic cell death working together with checkpoint blockade in a group of cancers whose stroma is inflamed. Two phase 3 trials support it: TOPAZ-1 added durvalumab and KEYNOTE-966 added pembrolizumab to the chemotherapy backbone, and both were positive, with a modest average gain and a minority of patients who become long-term survivors. No predictive biomarker, whether PD-L1, tumour mutational burden or microsatellite instability, reliably identifies who those long survivors will be.",
    rationale: "Chemotherapy-induced immunogenic cell death plus checkpoint blockade; biliary cancers have an inflamed stroma.",
    evidence: "Two phase 3 trials.",
    trials: ["topaz-1", "keynote-966"], cancers: ["cholangiocarcinoma"] }),
];

// ======================= IDEAS =======================
const ideas: IdeaInput[] = [
  idea({ id: "idea-btc-ctdna-fgfr-resistance", links: [{ label: "ClinicalTrials.gov NCT02924376: FIGHT-202", url: "https://clinicaltrials.gov/study/NCT02924376" }, { label: "ClinicalTrials.gov NCT02052778: FOENIX-CCA2", url: "https://clinicaltrials.gov/study/NCT02052778" }], name: "ctDNA-guided switching among FGFR inhibitors", maturity: "early-clinical",
    tldr: "Track FGFR2 resistance mutations in blood and switch to the next-generation inhibitor that still covers them, before the scan shows progression.",
    summary: "In biliary tract cancer driven by FGFR2 fusions, resistance to pemigatinib and futibatinib arises through polyclonal FGFR2 kinase-domain mutations that appear in cell-free DNA weeks before scans show progression. The idea is to monitor plasma ctDNA serially and switch pre-emptively to a next-generation inhibitor such as tinengotinib or lirafugratinib that still covers the emerging mutation. The rationale is that these resistance mutations are drug-specific and predictable, and molecular progression precedes clinical progression. The proposed test is a randomised phase 2 of ctDNA-triggered versus imaging-triggered switching with time to chemotherapy as the endpoint, at an early clinical stage, bearing on the liquid biopsy and kinase inhibitor technologies and the FGFR2 target.",
    hypothesis: "Serial ctDNA monitoring with pre-emptive switching to a resistance-mutation-covering FGFR inhibitor extends time on FGFR-directed therapy compared with switching at radiographic progression.",
    rationale: "Resistance mutations are drug-specific and predictable; molecular progression precedes clinical progression.",
    test: "Randomised phase 2: ctDNA-triggered switch vs standard imaging-triggered switch; endpoint time to chemotherapy.",
    technologies: ["liquid-biopsy", "kinase-inhibitors"], targets: ["fgfr2"], drugs: ["pemigatinib", "futibatinib", "tinengotinib"], cancers: ["cholangiocarcinoma"], terms: ["fgfr2-fusion", "ctdna"] }),
];

const spike: Spike = {
  cancerId: "cholangiocarcinoma",
  entities: [...companies, ...technologies, ...terms, ...drugs, ...trials, ...pairings, ...ideas] as EntityInput[],
  patch: {
    tldr: "Cholangiocarcinoma is cancer of the bile ducts or gallbladder. It is rare and often found late, but it turned out to carry more targetable mutations than almost any other gastrointestinal cancer, and immunotherapy now adds to chemotherapy from the first treatment.",
    summary: "Biliary tract cancers comprise intrahepatic cholangiocarcinoma (iCCA, rising in incidence), perihilar and distal extrahepatic cholangiocarcinoma, and gallbladder cancer. They share late presentation (jaundice, weight loss) and dependence on surgical resection as the only cure, achievable in a minority, which keeps five-year survival under 20%. Risk factors differ by region: liver flukes and hepatolithiasis in East Asia, primary sclerosing cholangitis in the West, gallstones and chronic inflammation for gallbladder cancer. Biliary drainage is usually a prerequisite for any treatment.\n\nThe systemic landscape was gemcitabine-cisplatin alone from ABC-02 (2010) until TOPAZ-1 (durvalumab, 2022) and KEYNOTE-966 (pembrolizumab, 2023) added PD-(L)1 blockade with a modest median benefit but a doubling of two-year survival. Adjuvant capecitabine (BILCAP) is standard after resection. What sets biliary cancer apart is its genomic actionability: roughly 40% of intrahepatic tumours carry FGFR2 fusions (pemigatinib, futibatinib), IDH1 mutations (ivosidenib), HER2 amplification or overexpression (zanidatamab, trastuzumab deruxtecan), NRG1 fusions (zenocutuzumab, approved 2026), BRAF V600E, or MSI-high status, so molecular profiling at diagnosis is guideline-mandated.\n\nThe frontier is moving targeted agents into first line (HERIZON-BTC-302 for zanidatamab), overcoming FGFR-inhibitor resistance (tinengotinib in FIRST-308, lirafugratinib), ctDNA-guided sequencing, and finding a biomarker for the immunotherapy long-tail. Liver transplantation for unresectable perihilar tumours (Mayo protocol) and for selected intrahepatic disease is expanding. Open problems include second-line therapy after chemo-immunotherapy, gallbladder cancer's neglect in trials, and early detection in high-risk groups such as primary sclerosing cholangitis.",
    burden: "About 210,000 cases per year worldwide; incidence of intrahepatic cholangiocarcinoma has roughly doubled in Western countries over 30 years; gallbladder cancer is endemic in Chile, northern India, and among Indigenous Americans.",
    subtypes: ["Intrahepatic cholangiocarcinoma (FGFR2 fusion ~10-15%, IDH1 ~15%)", "Perihilar (Klatskin) cholangiocarcinoma", "Distal extrahepatic cholangiocarcinoma", "Gallbladder carcinoma (HER2 ~15-20%)", "Fluke-associated (Opisthorchis, Clonorchis)", "PSC-associated"],
    biomarkers: ["FGFR2 fusions/rearrangements (RNA or DNA NGS)", "IDH1 mutation", "HER2 amplification / IHC 3+", "NRG1 fusion", "BRAF V600E", "MSI/dMMR", "KRAS, TP53 (prognostic)", "CA 19-9 (monitoring)", "PD-L1 (not predictive so far)"],
    standardOfCare: [
      { setting: "Diagnosis and staging", approach: "Contrast CT/MRI with MRCP; ERCP or EUS-guided biopsy; molecular profiling (DNA + RNA NGS) for all advanced disease; biliary drainage if jaundiced.", refs: ["cgp", "rna-seq", "biliary-stenting-drainage", "mri"], guideline: { nccn: "Molecular testing recommended (category 2A)", version: "NCCN Biliary Tract Cancers 2026" } },
      { setting: "Resectable", approach: "Margin-negative resection (hepatectomy, Whipple, or radical cholecystectomy) with lymphadenectomy; adjuvant capecitabine 6 months (BILCAP).", refs: ["bilcap", "robotic-surgery"], guideline: { nccn: "Capecitabine category 2A (preferred)", esmoMcbs: "B" } },
      { setting: "Unresectable perihilar in selected patients", approach: "Neoadjuvant chemoradiation then liver transplantation (Mayo protocol) at experienced centres.", refs: ["liver-transplant-oncology"], guideline: { nccn: "Category 2B, transplant centres only" } },
      { setting: "Advanced, first line", approach: "Gemcitabine-cisplatin + durvalumab (TOPAZ-1) or + pembrolizumab (KEYNOTE-966); zanidatamab added in HER2+ disease within HERIZON-BTC-302.", refs: ["topaz-1", "keynote-966", "gemcitabine-cisplatin", "durvalumab", "pembrolizumab", "herizon-btc-302"], guideline: { nccn: "Category 1 (preferred)", esmoMcbs: "TOPAZ-1 grade 3" } },
      { setting: "Advanced, FGFR2 fusion after chemotherapy", approach: "Pemigatinib or futibatinib; tinengotinib in FIRST-308 after progression.", refs: ["pemigatinib", "futibatinib", "tinengotinib", "fight-202", "foenix-cca2", "first-308"], guideline: { nccn: "Category 2A" } },
      { setting: "Advanced, IDH1 mutation after chemotherapy", approach: "Ivosidenib (ClarIDHy).", refs: ["ivosidenib", "claridhy"], guideline: { nccn: "Category 1" } },
      { setting: "Advanced, HER2-positive after chemotherapy", approach: "Zanidatamab (IHC 3+ or amplified); trastuzumab deruxtecan (IHC 3+, tumour-agnostic).", refs: ["zanidatamab", "trastuzumab-deruxtecan"], guideline: { nccn: "Category 2A" } },
      { setting: "Advanced, other alterations", approach: "Zenocutuzumab (NRG1 fusion, approved 2026); dabrafenib-trametinib (BRAF V600E); pembrolizumab or dostarlimab (MSI-H/dMMR); larotrectinib/entrectinib (NTRK).", refs: ["zenocutuzumab", "dabrafenib-trametinib", "pembrolizumab", "dostarlimab"], guideline: { nccn: "Category 2A (tumour-agnostic)" } },
      { setting: "Second-line, no target", approach: "FOLFOX (ABC-06, modest benefit); liposomal irinotecan/5-FU had conflicting results (NIFTY positive, NALIRICC negative); clinical trials preferred.", refs: ["naliricc", "cytotoxic-chemotherapy"], guideline: { nccn: "FOLFOX category 1" } },
      { setting: "Locoregional (intrahepatic, liver-confined)", approach: "Y-90 radioembolisation, hepatic arterial infusion pump chemotherapy, or SBRT at specialised centres; no phase 3 proof of survival benefit.", refs: ["radioembolisation-tare", "sbrt"], guideline: { nccn: "Category 2B" } },
    ],
    stateOfArt: [
      "Chemo-immunotherapy first line with a doubling of two-year survival (TOPAZ-1, KEYNOTE-966).",
      "Four biomarker-directed drug classes approved (FGFR2, IDH1, HER2, NRG1), plus tumour-agnostic BRAF, MSI-H and NTRK options: ~40% of intrahepatic tumours have an actionable alteration.",
      "Next-generation FGFR inhibitors targeting resistance mutations are in phase 3 (FIRST-308).",
      "Zanidatamab moving into first line for HER2-positive disease (HERIZON-BTC-302).",
      "Liver transplantation protocols extend curative options to selected unresectable perihilar tumours.",
    ],
    history: [
      { year: 1965, title: "Klatskin describes perihilar cholangiocarcinoma", note: "Distinct clinicopathologic entity at the hepatic duct confluence." },
      { year: 1993, title: "Mayo Clinic begins neoadjuvant chemoradiation and transplant for perihilar cholangiocarcinoma", refs: ["liver-transplant-oncology"] },
      { year: 2010, title: "ABC-02: gemcitabine-cisplatin becomes standard", refs: ["abc-02", "gemcitabine-cisplatin"] },
      { year: 2013, title: "FGFR2 fusions and IDH1 mutations characterised as drivers of intrahepatic cholangiocarcinoma", refs: ["fgfr2-fusion", "idh"] },
      { year: 2017, title: "BILCAP: adjuvant capecitabine adopted", refs: ["bilcap"] },
      { year: 2020, title: "Pemigatinib: first targeted approval in biliary cancer", refs: ["pemigatinib", "fight-202"] },
      { year: 2021, title: "Ivosidenib approved (ClarIDHy); infigratinib approved then withdrawn (2022)", refs: ["ivosidenib", "claridhy"] },
      { year: 2022, title: "TOPAZ-1: first immunotherapy approval; futibatinib approved", refs: ["topaz-1", "durvalumab", "futibatinib", "foenix-cca2"] },
      { year: 2023, title: "KEYNOTE-966: pembrolizumab confirms chemo-IO", refs: ["keynote-966"] },
      { year: 2024, title: "Zanidatamab: first HER2 approval in biliary cancer; T-DXd tumour-agnostic HER2 IHC3+; NALIRICC negative", refs: ["zanidatamab", "trastuzumab-deruxtecan", "naliricc"] },
      { year: 2025, title: "TOPAZ-1 three-year survival update; FIRST-308 doses first US patient", refs: ["topaz-1", "first-308"] },
      { year: 2026, title: "Zenocutuzumab approved for NRG1-fusion cholangiocarcinoma; HERIZON-BTC-302 enrolling", refs: ["zenocutuzumab", "herizon-btc-302"] },
    ],
    pipeline: ["herizon-btc-302", "first-308", "tinengotinib", "zanidatamab", "zenocutuzumab", "trastuzumab-deruxtecan", "idea-btc-ctdna-fgfr-resistance", "liquid-biopsy", "liver-transplant-oncology", "radioembolisation-tare", "fapi-pet", "cmg901"],
    openProblems: [
      "Median survival in advanced disease is still barely a year; the immunotherapy benefit is a small tail with no predictive biomarker.",
      "FGFR inhibitor resistance (polyclonal kinase-domain mutations) limits benefit to ~7-9 months; sequencing next-generation agents is unproven.",
      "Second-line chemotherapy is weak (FOLFOX) and evidence for liposomal irinotecan is contradictory.",
      "Gallbladder cancer is under-represented in trials despite distinct biology and high HER2 prevalence.",
      "Early detection in primary sclerosing cholangitis and fluke-endemic regions is unsolved; CA 19-9 is non-specific.",
      "Molecular testing is slow and tissue is scarce from brushings; liquid biopsy adoption lags.",
      "Adjuvant evidence rests on a technically negative trial (BILCAP); immunotherapy adjuvant trials are ongoing.",
    ],
    targets: ["fgfr2", "idh", "her2", "her3", "pd1", "pdl1", "braf", "ntrk", "cldn18-2"],
    technologies: ["biliary-stenting-drainage", "liver-transplant-oncology", "radioembolisation-tare", "checkpoint-inhibitor", "kinase-inhibitors", "cgp", "rna-seq", "liquid-biopsy", "sbrt"],
    terms: ["biliary-anatomy-subtypes", "fgfr2-fusion", "ca19-9", "gene-fusion", "tumour-agnostic"],
    companies: ["astrazeneca", "merck", "incyte", "taiho", "servier", "jazz", "zymeworks", "merus", "transthera", "cruk"],
    institutions: ["mayo-clinic", "mskcc", "cruk", "royal-marsden", "asan-medical-center"],
    related: ["gemcis-plus-io-btc"],
    tags: ["spike"],
  },
};

export default spike;

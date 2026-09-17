import type { DrugInput, EntityInput, IdeaInput, PairingInput, TechnologyInput, TermInput, TrialInput } from "@/lib/schema";
import type { Spike } from "./index";
import { supplement } from "../supplement";

/**
 * NEUROENDOCRINE TUMOUR SPIKE. The cancer family that pioneered theranostics. Facts checked 2026-09-07.
 */
const asOf = "2026-09-07";
const W = (s: string) => `https://en.wikipedia.org/wiki/${s}`;
const ct = (nct: string) => ({ label: `ClinicalTrials.gov ${nct}`, url: `https://clinicaltrials.gov/study/${nct}` });

const t = (x: Omit<TrialInput, "kind" | "asOf">): TrialInput => ({ kind: "trial", asOf, ...x });
const d = (x: Omit<DrugInput, "kind" | "asOf">): DrugInput => ({ kind: "drug", asOf, ...x });
const tech = (x: Omit<TechnologyInput, "kind" | "asOf">): TechnologyInput => ({ kind: "technology", asOf, ...x });
const term = (x: Omit<TermInput, "kind" | "asOf">): TermInput => ({ kind: "term", asOf, ...x });
const idea = (x: Omit<IdeaInput, "kind" | "asOf">): IdeaInput => ({ kind: "idea", asOf, ...x });
const pair = (x: Omit<PairingInput, "kind" | "asOf">): PairingInput => ({ kind: "pairing", asOf, ...x });

// ======================= TECHNOLOGIES =======================
const technologies: TechnologyInput[] = [
  tech({ id: "sstr-pet", dependsOn: ["pet-ct", "radionuclide-generators-kits"], name: "Somatostatin receptor PET (68Ga/64Cu-DOTATATE)", sections: ["imaging", "radiopharma"], status: "standard-of-care", since: 2016, wikipedia: W("DOTA-TATE"),
    tldr: "A PET scan using a radioactive hormone mimic that lights up neuroendocrine tumours and shows whether the matching radioactive treatment will work.",
    summary: "68Ga-DOTATATE (Netspot, 2016), 68Ga-DOTATOC (2019) and 64Cu-DOTATATE (Detectnet, 2020) replaced 111In-octreotide scintigraphy, with far higher sensitivity for small lesions and bone disease. Mandatory for staging, for selecting patients for PRRT (Krenning score ≥3 or uptake above liver), and for detecting occult primaries. FDG PET complements it in high-grade or dedifferentiated disease ('flip-flop' pattern).",
    principle: "Radiolabelled somatostatin analogue binds SSTR2 on tumour cells; positron emission imaged by PET/CT.",
    strengths: ["Whole-body receptor map", "Theranostic gatekeeper for 177Lu-DOTATATE", "Changes management in ~40% of patients versus conventional imaging"],
    limitations: ["Physiologic uptake in pancreas uncinate, spleen, pituitary", "Poor sensitivity in SSTR-negative high-grade disease", "68Ga generator supply and short half-life"],
    cancers: ["neuroendocrine", "sclc"], targets: ["sstr2"], technologies: ["pet", "pet-ct"], drugs: ["lutathera"], terms: ["theranostics"], links: [{ label: "Wikipedia", url: W("DOTA-TATE") }] }),
  tech({ id: "prrt", trials: ["netter-1"], dependsOn: ["radioligand-therapy", "sstr-pet"], name: "Peptide receptor radionuclide therapy (PRRT)", sections: ["radiopharma"], status: "approved", since: 2018, wikipedia: W("Peptide_receptor_radionuclide_therapy"),
    tldr: "A radioactive version of the hormone mimic used for the scan; it homes to neuroendocrine tumour cells and irradiates them from inside.",
    summary: "177Lu-DOTATATE (Lutathera; NETTER-1 second line, NETTER-2 first line in grade 2-3) is the reference. 177Lu-edotreotide (ITM-11, COMPETE: PFS 23.9 vs 14.1 months vs everolimus; FDA PDUFA 28 August 2026) is the second beta-emitter. Alpha PRRT with 212Pb-DOTAMTATE (AlphaMedix, Breakthrough designation; phase 2 ORR 54% in PRRT-naive) and 225Ac-DOTATATE (RYZ101, ACTION-1 phase 3) aims at beta-refractory disease. Antagonist ligands (177Lu-satoreotide) bind more receptor sites than agonists.",
    principle: "An SSTR2-binding peptide is chelated to a therapeutic radionuclide and internalised by the tumour cell; beta (177Lu) or alpha (212Pb, 225Ac) emission; usually four cycles.",
    strengths: ["Systemic, receptor-targeted", "Response and quality-of-life benefit", "Imaging selects and monitors"],
    limitations: ["Myelosuppression, rare MDS/AML (~2-3%)", "Renal dose", "Not curative; retreatment data limited"],
    cancers: ["neuroendocrine"], targets: ["sstr2"], technologies: ["radioligand-therapy", "targeted-alpha-therapy", "sstr-pet"], drugs: ["lutathera", "itm-11", "alphamedix", "ryz101"], companies: ["novartis", "itm", "orano-med", "radiomedix", "rayzebio"], links: [{ label: "Wikipedia", url: W("Peptide_receptor_radionuclide_therapy") }] }),
];

// ======================= TERMS =======================
const terms: TermInput[] = [
  term({ id: "net-grade-ki67", name: "Neuroendocrine tumour grade (Ki-67) and WHO classification", category: "Pathology", wikipedia: W("Neuroendocrine_tumor"),
    tldr: "How fast the tumour cells are dividing, measured by Ki-67 staining, separates slow-growing neuroendocrine tumours from aggressive neuroendocrine carcinomas and decides the treatment.",
    summary: "WHO 2019/2022: well-differentiated NET grade 1 (Ki-67 <3%), grade 2 (3-20%), grade 3 (>20%, well-differentiated); poorly differentiated neuroendocrine carcinoma (NEC, small- or large-cell) is a separate lineage treated like small-cell lung cancer. Grade drives choice among somatostatin analogues, PRRT, targeted therapy and chemotherapy.",
    cancers: ["neuroendocrine", "sclc"], technologies: ["histopathology-ihc"], links: [{ label: "Wikipedia", url: W("Neuroendocrine_tumor") }] }),
  term({ id: "chromogranin-a", name: "Chromogranin A", category: "Biomarkers", wikipedia: W("Chromogranin_A"),
    tldr: "Chromogranin A is a protein released by neuroendocrine cells and measured in blood to follow tumour burden; it is unreliable because acid-reducing drugs and kidney disease also raise it.",
    summary: "Chromogranin A is a protein released by neuroendocrine cells and measured in blood to follow tumour burden in neuroendocrine tumours. Its sensitivity for metastatic disease is variable, and it gives false positives with proton-pump inhibitors, renal impairment and atrophic gastritis, so a single value is hard to interpret. Following the trend over time is more useful than any one measurement. The NETest, a multi-gene blood transcript assay, has been proposed as a replacement. Readers meet the term on the neuroendocrine tumours page, and it matters because acid-reducing drugs and kidney disease can raise it without any change in the cancer.",
    cancers: ["neuroendocrine"], links: [{ label: "Wikipedia", url: W("Chromogranin_A") }] }),
  term({ id: "carcinoid-syndrome", name: "Carcinoid syndrome and carcinoid heart disease", category: "Clinical", wikipedia: W("Carcinoid_syndrome"),
    tldr: "Flushing, diarrhoea and wheezing caused by hormones (mostly serotonin) released by some neuroendocrine tumours; over years it can scar the heart valves.",
    summary: "Occurs in ~20-30% of small-bowel NETs, usually with liver metastases. Somatostatin analogues control symptoms; telotristat ethyl (tryptophan hydroxylase inhibitor, 2017) treats refractory diarrhoea; 24-hour urinary 5-HIAA monitors; echocardiography screens for right-heart valve disease. Carcinoid crisis during anaesthesia or embolisation is prevented with octreotide infusion.",
    cancers: ["neuroendocrine"], drugs: ["octreotide-lanreotide"], links: [{ label: "Wikipedia", url: W("Carcinoid_syndrome") }] }),
  term({ id: "men1-hereditary-net", name: "MEN1 and hereditary neuroendocrine syndromes", category: "Genomics", wikipedia: W("Multiple_endocrine_neoplasia_type_1"),
    tldr: "Inherited conditions (MEN1, VHL, NF1, tuberous sclerosis) that cause neuroendocrine tumours, often multiple and at a young age, so families need genetic testing and surveillance.",
    summary: "MEN1 (menin loss) causes parathyroid, pituitary and pancreatic NETs; MEN1 is also the most commonly mutated gene in sporadic pancreatic NETs (~40%), with DAXX/ATRX and mTOR-pathway genes. Germline testing is recommended for pancreatic NETs, paragangliomas (SDHx) and young-onset disease. Belzutifan is approved for VHL-associated pancreatic NETs.",
    cancers: ["neuroendocrine"], targets: ["menin", "hif2a"], drugs: ["belzutifan"], technologies: ["germline-testing"], links: [{ label: "Wikipedia", url: W("Multiple_endocrine_neoplasia_type_1") }] }),
];

// ======================= PRODUCTS =======================
const drugs: DrugInput[] = [
  d({ id: "octreotide-lanreotide", links: [{ label: "FDA label (DailyMed)", url: "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=Somatostatin%20analogues" }], name: "Somatostatin analogues (octreotide, lanreotide)", brand: "Sandostatin LAR, Somatuline Depot", modality: "Peptide hormone analogue (SSTR2 agonist)", status: "approved", wikipedia: W("Octreotide"),
    tldr: "Monthly injections of a synthetic hormone that both quiets tumour hormone symptoms and slows tumour growth, the first treatment for most neuroendocrine tumours.",
    summary: "Octreotide (1988) controls carcinoid syndrome; PROMID (2009) showed octreotide LAR delays progression in midgut NETs (TTP 14.3 vs 6.0 months); CLARINET (2014) showed lanreotide improves PFS across enteropancreatic NETs (median not reached vs 18 months, HR 0.47). Standard first-line antiproliferative therapy for SSTR-positive grade 1-2 disease; also premedication against carcinoid crisis.",
    mechanism: "SSTR2/5 agonism suppresses hormone secretion and proliferation; PROMID and CLARINET established the antiproliferative effect.",
    mechanismSteps: ["Binds SSTR2 on tumour cell", "Inhibits adenylyl cyclase and hormone exocytosis", "Cell-cycle arrest via SHP-1/SHP-2 phosphatases", "Symptom relief within days; growth slowing over months"],
    dosing: { route: "Deep subcutaneous or intramuscular depot", schedule: "Octreotide LAR 30 mg or lanreotide 120 mg every 4 weeks; short-acting octreotide for breakthrough symptoms", monitoring: "Gallstones, glucose, vitamin B12" },
    toxicity: [{ event: "Diarrhoea/steatorrhoea", anyGradePct: 26, note: "CLARINET" }, { event: "Cholelithiasis", anyGradePct: 10 }, { event: "Hyperglycaemia", anyGradePct: 5 }],
    approvals: [{ region: "US", year: 1988, indication: "Carcinoid syndrome symptoms (octreotide)" }, { region: "US", year: 2014, indication: "Unresectable GEP-NETs to improve PFS (lanreotide)" }],
    targets: ["sstr2"], companies: ["novartis", "ipsen"], cancers: ["neuroendocrine"], trials: ["promid", "clarinet", "netter-1"], terms: ["carcinoid-syndrome", "prrt-term"] }),
  d(supplement<DrugInput>({ id: "everolimus", technologies: ["pi3k-akt-mtor-inhibitors"], kind: "drug", links: [{ label: "FDA label (DailyMed)", url: "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=Everolimus" }],
    approvals: [{ region: "US", year: 2011, indication: "Progressive pancreatic NETs" }, { region: "US", year: 2016, indication: "Progressive non-functional lung and GI NETs" }],
    notes: ["In neuroendocrine tumours: RADIANT-3 (2011) gave PFS 11.0 versus 4.6 months in pancreatic NETs and RADIANT-4 (2016) PFS 11.0 versus 3.9 months in lung and GI NETs; it is now the comparator that 177Lu-edotreotide beat in COMPETE. In RADIANT-3 stomatitis affected 64 percent (7 percent grade 3 or higher), rash 49 percent and pneumonitis 17 percent; dexamethasone mouthwash (SWISH) prevents most stomatitis."],
    cancers: ["neuroendocrine", "chromophobe-rcc"], targets: ["akt"], trials: ["radiant-3-4", "compete"] })),
  d({ id: "sunitinib", trials: ["nct05043090", "nct05024214", "nct03091192", "nct03673501"], links: [{ label: "FDA label (DailyMed)", url: "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=Sunitinib" }], name: "Sunitinib", brand: "Sutent", modality: "Small-molecule multi-kinase inhibitor (VEGFR, PDGFR, KIT)", status: "approved", wikipedia: W("Sunitinib"),
    tldr: "Sunitinib is an anti-angiogenic pill approved for pancreatic neuroendocrine tumours, kidney cancer and GIST.",
    summary: "Sunitinib is an oral inhibitor of VEGFR1-3, PDGFR, KIT, FLT3 and RET that blocks tumour blood-vessel growth and, in GIST, the KIT driver itself. It is approved for advanced renal cell carcinoma and imatinib-resistant GIST (2006), progressive pancreatic neuroendocrine tumours (2011, 37.5 mg daily continuously) and, little used, as adjuvant therapy in high-risk RCC (S-TRAC, 2017). The pancreatic NET phase 3 (Raymond 2011) showed PFS of 11.4 versus 5.5 months and was stopped early for benefit. In kidney cancer it has been largely displaced by immunotherapy combinations and is the control arm they beat in CheckMate 214, KEYNOTE-426, CheckMate 9ER and CLEAR, while it is still standard second line in GIST. Fatigue, diarrhoea, hand-foot syndrome, hypertension and hypothyroidism are common. For a newcomer, sunitinib defined first-line kidney cancer treatment before immunotherapy.",
    mechanism: "Oral inhibitor of VEGFR1-3, PDGFR, KIT, FLT3, RET.",
    dosing: { route: "Oral", schedule: "37.5 mg daily continuously (pNET)", monitoring: "Blood pressure, thyroid, cardiac function" },
    toxicity: [{ event: "Diarrhoea", anyGradePct: 59 }, { event: "Nausea", anyGradePct: 45 }, { event: "Hypertension", anyGradePct: 26, grade3PlusPct: 10 }, { event: "Hand-foot syndrome", anyGradePct: 23, grade3PlusPct: 6 }],
    approvals: [{ region: "US", year: 2006, indication: "Advanced RCC; GIST after imatinib" }, { region: "US", year: 2011, indication: "Progressive pancreatic NETs" }],
    targets: ["vegf", "kit"], technologies: ["kinase-inhibitors", "antiangiogenic"], companies: ["pfizer"], cancers: ["neuroendocrine", "rcc", "sarcoma", "clear-cell-rcc", "chromophobe-rcc"] }),
  d({ id: "itm-11", links: [{ label: "ClinicalTrials.gov NCT03049189 (COMPETE)", url: "https://clinicaltrials.gov/study/NCT03049189" }], name: "177Lu-edotreotide", code: "ITM-11, n.c.a. 177Lu-DOTATOC", modality: "Radioligand therapy (beta)", status: "phase-3",
    tldr: "A second lutetium radioligand for neuroendocrine tumours that beat the standard pill everolimus in a head-to-head trial and is awaiting an FDA decision.",
    summary: "COMPETE (Lancet 2025; 309 patients, grade 1-2 GEP-NETs): PFS 23.9 vs 14.1 months versus everolimus (HR 0.67); response rate higher; interim OS 63.4 vs 58.7 months, a difference that did not reach statistical significance (HR 0.78). Uses non-carrier-added 177Lu from ITM's own supply. NDA accepted with PDUFA 28 August 2026. COMPOSE (grade 2-3, versus CAPTEM/everolimus/FOLFOX) ongoing.",
    mechanism: "DOTATOC peptide (SSTR2 agonist) chelating 177Lu; four cycles of 7.5 GBq every 3 months.",
    dosing: { route: "Intravenous", schedule: "7.5 GBq every 3 months × 4 with amino-acid renal protection" },
    regulatoryEvents: [{ date: "2025-03", type: "designation", region: "US", note: "COMPETE topline at ENETS 2025", source: "https://www.itm-radiopharma.com/news/press-releases/press-releases-detail/itm-presents-positive-topline-phase-3-compete-trial-data-with-nca-177lu-edotreotide-itm-11-a-targeted-radiopharmaceutical-therapy-in-patients-with-grade-1-or-2-gastroenteropancreatic-neuroendocrine-tumors-at-the-enets-2025-conference-688/" }, { date: "2026-08-28", type: "pdufa", region: "US", note: "PDUFA goal date for GEP-NET indication", source: "https://www.cancernetwork.com/view/fda-accepts-new-drug-application-for-177lu-edotreotide-in-gep-nets" }],
    targets: ["sstr2"], technologies: ["prrt", "radioligand-therapy"], companies: ["itm"], cancers: ["neuroendocrine"], trials: ["compete", "nct04919226"] }),
  d({ id: "alphamedix", name: "212Pb-DOTAMTATE", brand: "AlphaMedix", modality: "Targeted alpha therapy (lead-212)", status: "phase-2",
    tldr: "An alpha-particle version of neuroendocrine radioligand therapy that produced responses in over half of patients who had never had PRRT, with FDA Breakthrough designation.",
    summary: "ALPHAMEDIX-02 (Sanofi/Orano Med/RadioMedix, October 2025): met all primary endpoints; ORR 54.3% in PRRT-naive patients with ~70-75% progression-free at about 3 years, and durable disease control in PRRT-exposed patients (~83% progression-free at 18 months). Breakthrough Therapy designation 2024. Sanofi acquired global rights (2024); registrational strategy under discussion. Supply relies on Orano Med's 212Pb generators.",
    mechanism: "DOTAMTATE (SSTR2 agonist) chelating 212Pb, which decays via 212Bi to emit an alpha particle at the tumour cell.",
    targets: ["sstr2"], technologies: ["prrt", "targeted-alpha-therapy"], companies: ["orano-med", "radiomedix", "sanofi"], cancers: ["neuroendocrine"], trials: ["alphamedix-02"],
    links: [{ label: "Sanofi press release Oct 2025", url: "https://www.sanofi.com/en/media-room/press-releases/2025/2025-10-08-05-00-00-3163053" }] }),
  d({ id: "capecitabine-temozolomide", links: [{ label: "ClinicalTrials.gov NCT01824875: ECOG-ACRIN E2211, temozolomide with or without capecitabine in advanced pancreatic neuroendocrine tumours (phase 2)", url: "https://clinicaltrials.gov/study/NCT01824875" }], name: "Capecitabine + temozolomide (CAPTEM)", modality: "Oral cytotoxic regimen", status: "established",
    tldr: "CAPTEM (capecitabine plus temozolomide) is an all-oral chemotherapy pair that shrinks pancreatic neuroendocrine tumours in about a third of patients.",
    summary: "ECOG-ACRIN E2211 (2018-2023): PFS 22.7 vs 14.4 months and higher response rate for CAPTEM versus temozolomide alone in pancreatic NETs; OS did not differ at final analysis. Used when tumour shrinkage is needed (bulky or symptomatic disease) and in grade 3 NETs. MGMT deficiency may predict response.",
    mechanism: "Fluoropyrimidine plus alkylating agent; capecitabine depletes MGMT, sensitising to temozolomide.",
    dosing: { route: "Oral", schedule: "Capecitabine 750 mg/m² twice daily days 1-14, temozolomide 200 mg/m² days 10-14, every 28 days", monitoring: "Blood counts, hand-foot syndrome" },
    toxicity: [{ event: "Neutropenia (grade 3-4)", grade3PlusPct: 13, note: "E2211" }, { event: "Thrombocytopenia (grade 3-4)", grade3PlusPct: 15 }, { event: "Fatigue", anyGradePct: 50 }],
    technologies: ["cytotoxic-chemotherapy"], drugs: ["temozolomide"], cancers: ["neuroendocrine"], terms: ["mgmt"], institutions: ["ecog-acrin"] }),
];

// ======================= TRIALS =======================
const trials: TrialInput[] = [
  t({ id: "promid", name: "PROMID", nct: "NCT00171873", phase: "3", status: "positive", yearReported: 2009, sponsor: "Novartis / German NET study group", enrolled: 85,
    setting: "Treatment-naive metastatic midgut NETs: octreotide LAR vs placebo",
    tldr: "Showed for the first time that a hormone-suppressing injection also slows neuroendocrine tumour growth.",
    summary: "PROMID, trial NCT00171873 sponsored by Novartis and the German NET study group and reported in 2009, showed for the first time that a hormone-suppressing somatostatin analogue injection also slows neuroendocrine tumour growth. It randomised 85 patients with treatment-naive metastatic midgut neuroendocrine tumours to octreotide LAR or placebo and met its primary endpoint of time to tumour progression with a large effect, while overall survival did not differ because of crossover and a low event rate. OnCo links it to neuroendocrine tumours and to the somatostatin analogues record, and CLARINET extended the antiproliferative effect to lanreotide across enteropancreatic tumours. Whether starting a somatostatin analogue early changes survival, rather than only delaying progression, remains unproven.",
    result: "TTP 14.3 vs 6.0 months, HR 0.34.",
    outcomes: [{ endpoint: "Time to tumour progression", primary: true, unit: "months", arms: [{ name: "Octreotide LAR", n: 42, value: 14.3 }, { name: "Placebo", n: 43, value: 6.0 }], hr: 0.34, ci: [0.20, 0.59], source: "https://doi.org/10.1200/JCO.2009.22.8510" }],
    replication: "CLARINET extended the antiproliferative effect to lanreotide across enteropancreatic NETs.",
    drugs: ["octreotide-lanreotide"], cancers: ["neuroendocrine"], links: [ct("NCT00171873")] }),
  t({ id: "clarinet", name: "CLARINET", nct: "NCT00353496", phase: "3", status: "positive", yearReported: 2014, sponsor: "Ipsen", enrolled: 204,
    setting: "Non-functioning enteropancreatic NETs, grade 1-2: lanreotide 120 mg vs placebo",
    tldr: "Lanreotide more than halved the risk of progression in gut and pancreatic neuroendocrine tumours.",
    summary: "CLARINET, trial NCT00353496 sponsored by Ipsen and reported in 2014, showed that lanreotide more than halved the risk of progression in non-functioning grade 1 to 2 gastroenteropancreatic neuroendocrine tumours. It randomised 204 patients to lanreotide 120 mg or placebo and met its primary progression-free survival endpoint, with the median not reached in the lanreotide arm, and it is the basis of lanreotide's antiproliferative label. OnCo links it to neuroendocrine tumours, the somatostatin analogues record, Ipsen and Martyn E. Caplin. Whether patients with stable disease need treatment at diagnosis or can safely wait for progression is the question the trial's design, which enrolled many stable patients, leaves open.",
    result: "PFS HR 0.47.",
    outcomes: [{ endpoint: "Progression-free survival", primary: true, unit: "months", arms: [{ name: "Lanreotide", n: 101, note: "not reached" }, { name: "Placebo", n: 103, value: 18.0 }], hr: 0.47, ci: [0.30, 0.73], p: "<0.001", source: "https://doi.org/10.1056/NEJMoa1316158" }],
    drugs: ["octreotide-lanreotide"], cancers: ["neuroendocrine"], links: [ct("NCT00353496")], companies: ["ipsen"], people: ["martyn-caplin"] }),
  t({ id: "radiant-3-4", name: "RADIANT-3 and RADIANT-4", nct: "NCT00510068", phase: "3", status: "positive", yearReported: 2011, sponsor: "Novartis", enrolled: 712,
    setting: "Progressive pancreatic NETs (RADIANT-3, n=410) and lung/GI NETs (RADIANT-4, n=302): everolimus vs placebo",
    tldr: "The two trials that made everolimus a standard pill for pancreatic, lung and gut neuroendocrine tumours.",
    summary: "RADIANT-3 and RADIANT-4, led by trial NCT00510068 and sponsored by Novartis, are the two trials, reported from 2011, that made everolimus a standard tablet for pancreatic, lung and gastrointestinal neuroendocrine tumours. RADIANT-3 randomised 410 patients with progressive pancreatic neuroendocrine tumours and RADIANT-4 302 patients with lung or gastrointestinal tumours to everolimus or placebo, and both met their primary progression-free survival endpoints with large effects, while overall survival was not significantly improved because of crossover. OnCo links them to neuroendocrine tumours, everolimus and James C. Yao. Whether everolimus should come before or after radioligand therapy, which COMPETE has now tested directly, is the open question.",
    result: "PFS HR 0.35 (pNET) and 0.48 (lung/GI).",
    outcomes: [{ endpoint: "Progression-free survival (RADIANT-3)", primary: true, unit: "months", arms: [{ name: "Everolimus", n: 207, value: 11.0 }, { name: "Placebo", n: 203, value: 4.6 }], hr: 0.35, ci: [0.27, 0.45], source: "https://doi.org/10.1056/NEJMoa1009290" }, { endpoint: "Progression-free survival (RADIANT-4)", primary: true, unit: "months", arms: [{ name: "Everolimus", n: 205, value: 11.0 }, { name: "Placebo", n: 97, value: 3.9 }], hr: 0.48, ci: [0.35, 0.67], source: "https://doi.org/10.1016/S0140-6736(15)00817-X" }],
    drugs: ["everolimus"], cancers: ["neuroendocrine"], links: [ct("NCT00510068")], people: ["james-yao"] }),
  t({ id: "cabinet", name: "CABINET (Alliance A021602)", nct: "NCT03375320", phase: "3", status: "positive", yearReported: 2024, sponsor: "Alliance / NCI / Exelixis", enrolled: 298,
    setting: "Previously treated advanced pancreatic (n=95) and extra-pancreatic (n=203) NETs: cabozantinib vs placebo",
    tldr: "Cabozantinib tripled the time without progression in neuroendocrine tumours that had outgrown other treatments, leading to a 2025 approval.",
    summary: "CABINET, Alliance trial A021602, NCT03375320, sponsored by the Alliance, the NCI and Exelixis and reported in the New England Journal of Medicine in 2024, showed that cabozantinib roughly tripled the time without progression in neuroendocrine tumours that had outgrown other treatments, leading to FDA approval in March 2025. It randomised 298 patients in separate pancreatic and extra-pancreatic cohorts to cabozantinib or placebo and met its primary progression-free survival endpoint in both, with an ESMO 2025 subgroup analysis showing a large reduction in progression risk in lung and thymic tumours. OnCo links it to neuroendocrine tumours, cabozantinib and the Alliance for Clinical Trials in Oncology. Whether cabozantinib's benefit holds against, or in sequence with, radioligand therapy is the open question.",
    result: "PFS HR 0.23 (pNET), 0.38 (epNET).",
    outcomes: [{ endpoint: "Progression-free survival (pancreatic NET)", primary: true, unit: "months", arms: [{ name: "Cabozantinib", value: 13.8 }, { name: "Placebo", value: 4.4 }], hr: 0.23, ci: [0.12, 0.42], source: "https://doi.org/10.1056/NEJMoa2403991" }, { endpoint: "Progression-free survival (extra-pancreatic NET)", primary: true, unit: "months", arms: [{ name: "Cabozantinib", value: 8.4 }, { name: "Placebo", value: 3.9 }], hr: 0.38, ci: [0.25, 0.59], source: "https://doi.org/10.1056/NEJMoa2403991" }],
    drugs: ["cabozantinib"], cancers: ["neuroendocrine"], links: [ct("NCT03375320"), { label: "ESMO 2025 subgroup (Exelixis)", url: "https://businesswire.com/news/home/20251016096352/en/Exelixis-Announces-Results-from-Subgroup-Analysis-of-CABINET-Phase-3-Pivotal-Trial-Evaluating-CABOMETYX-cabozantinib-in-Advanced-Lung-and-Thymic-Neuroendocrine-Tumors-at-ESMO-2025" }], institutions: ["alliance-oncology"] }),
  t({ id: "compete", name: "COMPETE", nct: "NCT03049189", phase: "3", status: "positive", yearReported: 2025, sponsor: "ITM Isotope Technologies Munich", enrolled: 324,
    setting: "Progressive grade 1-2 SSTR-positive GEP-NETs: 177Lu-edotreotide vs everolimus",
    tldr: "The first head-to-head trial of a radioligand against a targeted pill in neuroendocrine tumours; the radioligand won on progression-free survival.",
    summary: "COMPETE, trial NCT03049189 sponsored by ITM Isotope Technologies Munich and published in the Lancet in 2025, was the first head-to-head trial of a radioligand against a targeted tablet in neuroendocrine tumours, and the radioligand won on progression-free survival. It randomised 309 patients with progressive grade 1 to 2 somatostatin-receptor-positive gastroenteropancreatic tumours to 177Lu-edotreotide or everolimus, met its primary progression-free survival endpoint with a significantly higher response rate, and showed an interim overall survival trend that was not significant; the result supports an FDA filing with a PDUFA date of 28 August 2026. OnCo links it to peptide receptor radionuclide therapy, somatostatin receptor 2, 177Lu-edotreotide, everolimus and Jonathan R. Strosberg. Whether a second lutetium agent differentiates from lutetium dotatate is the open question.",
    result: "PFS 23.9 vs 14.1 months, HR 0.67.",
    outcomes: [{ endpoint: "Progression-free survival", primary: true, unit: "months", arms: [{ name: "177Lu-edotreotide", n: 207, value: 23.9 }, { name: "Everolimus", n: 102, value: 14.1 }], hr: 0.67, ci: [0.48, 0.95], p: "0.022", source: "https://doi.org/10.1016/S0140-6736(26)00604-5" }, { endpoint: "Overall survival (interim)", unit: "months", arms: [{ name: "177Lu-edotreotide", value: 63.4 }, { name: "Everolimus", value: 58.7 }], hr: 0.78, ci: [0.5, 1.1], p: "0.206", source: "https://doi.org/10.1016/S0140-6736(26)00604-5" }],
    drugs: ["itm-11", "everolimus"], cancers: ["neuroendocrine"], targets: ["sstr2"], technologies: ["prrt"], links: [ct("NCT03049189"), { label: "CancerNetwork: COMPETE", url: "https://www.cancernetwork.com/view/itm-11-demonstrates-superior-pfs-vs-everolimus-in-sstr-gep-nets" }], people: ["jonathan-strosberg"], related: ["src-cancer-network"] }),
  t({ id: "alphamedix-02", name: "ALPHAMEDIX-02", nct: "NCT05153772", phase: "2", status: "positive", yearReported: 2025, sponsor: "RadioMedix / Orano Med / Sanofi",
    setting: "Unresectable or metastatic SSTR-positive GEP-NETs, PRRT-naive and PRRT-exposed cohorts: 212Pb-DOTAMTATE single arm",
    tldr: "An alpha-emitting radioligand met all its primary endpoints, with responses in more than half of patients new to radioligand therapy.",
    summary: "ALPHAMEDIX-02, trial NCT05153772 sponsored by RadioMedix, Orano Med and Sanofi and reported in 2025, showed that the alpha-emitting radioligand 212Pb-DOTAMTATE met all its primary endpoints, with responses in more than half of patients with somatostatin-receptor-positive gastroenteropancreatic neuroendocrine tumours who were new to radioligand therapy. In the single-arm phase 2 the objective response rate in PRRT-naive patients was 54.3 percent, most were still progression-free around three years, and the PRRT-exposed cohort was largely progression-free at eighteen months, as Sanofi reported in October 2025; the drug holds Breakthrough Therapy designation and the registrational path is being finalised. OnCo links it to targeted alpha therapy, PRRT, 212Pb-DOTAMTATE and the pairing of beta then alpha PRRT. Whether a randomised trial confirms superiority over lutetium is the open question.",
    result: "ORR 54.3% (PRRT-naive); all primary endpoints met.",
    outcomes: [{ endpoint: "Objective response rate (PRRT-naive)", primary: true, unit: "%", arms: [{ name: "212Pb-DOTAMTATE", value: 54.3 }], source: "https://www.sanofi.com/en/media-room/press-releases/2025/2025-10-08-05-00-00-3163053" }],
    drugs: ["alphamedix"], cancers: ["neuroendocrine"], technologies: ["targeted-alpha-therapy", "prrt"], links: [ct("NCT05153772"), { label: "Sanofi press release", url: "https://www.sanofi.com/en/media-room/press-releases/2025/2025-10-08-05-00-00-3163053" }] }),
  t({ id: "action-1", name: "ACTION-1", nct: "NCT05477576", phase: "3", status: "recruiting", sponsor: "BMS (RayzeBio)",
    setting: "SSTR-positive GEP-NETs progressing after 177Lu somatostatin-analogue therapy: 225Ac-DOTATATE (RYZ101) vs investigator's choice",
    tldr: "Tests whether an actinium alpha-radioligand rescues neuroendocrine tumours after lutetium therapy fails.",
    summary: "ACTION-1, trial NCT05477576 sponsored by Bristol Myers Squibb through RayzeBio, tests whether the actinium-225 alpha-radioligand RYZ101, or 225Ac-DOTATATE, rescues somatostatin-receptor-positive gastroenteropancreatic neuroendocrine tumours after lutetium-177 somatostatin analogue therapy has failed. Its phase 1b established a fixed dose of 10.2 MBq with encouraging responses, the phase 3 against investigator's choice is enrolling with an interim analysis expected in 2026, and its dosimetry was published in the Journal of Nuclear Medicine in 2026. OnCo links it to targeted alpha therapy, actinium-225 DOTATATE, lutetium-177 dotatate and the pairing of beta then alpha PRRT. Whether an alpha emitter can overcome resistance to a beta emitter aimed at the same receptor is the question it will answer.",
    drugs: ["ryz101", "lutathera"], cancers: ["neuroendocrine"], technologies: ["targeted-alpha-therapy"], links: [ct("NCT05477576"), { label: "ACTION-1 dosimetry (JNM 2026)", url: "https://jnm.snmjournals.org/content/67/8/1239" }] }),
  t({ id: "sanet", name: "SANET-ep and SANET-p", nct: "NCT02588170", phase: "3", status: "positive", yearReported: 2020, sponsor: "Hutchmed", enrolled: 369,
    setting: "Progressive extra-pancreatic (n=198) and pancreatic (n=172) NETs: surufatinib vs placebo (China)",
    tldr: "In the SANET trials, a Chinese anti-angiogenic pill slowed both gut and pancreatic neuroendocrine tumours, but its US application was refused.",
    summary: "SANET-ep and SANET-p, led by trial NCT02588170 and sponsored by Hutchmed, showed in 2020 that the Chinese anti-angiogenic tablet surufatinib slows both extra-pancreatic and pancreatic neuroendocrine tumours, but its US application was refused. The two trials randomised 198 patients with extra-pancreatic and 172 with pancreatic progressive tumours to surufatinib or placebo in China, and both met their primary progression-free survival endpoints with large effects, leading to approval in China in 2020 and 2021, while the FDA issued a complete response letter in 2022 requiring a multiregional trial. OnCo links them to neuroendocrine tumours, anti-angiogenic therapy and VEGF and VEGFR as targets. Whether a single-country trial can ever support a US approval is the wider question the refusal raised.",
    result: "PFS HR 0.33 (ep), 0.49 (p).",
    outcomes: [{ endpoint: "Progression-free survival (SANET-ep)", primary: true, unit: "months", arms: [{ name: "Surufatinib", value: 9.2 }, { name: "Placebo", value: 3.8 }], hr: 0.33, source: "https://doi.org/10.1016/S1470-2045(20)30496-4" }, { endpoint: "Progression-free survival (SANET-p)", primary: true, unit: "months", arms: [{ name: "Surufatinib", value: 10.9 }, { name: "Placebo", value: 3.7 }], hr: 0.49, source: "https://doi.org/10.1016/S1470-2045(20)30493-9" }],
    cancers: ["neuroendocrine"], targets: ["vegf"], technologies: ["antiangiogenic"], links: [ct("NCT02588170")], tags: ["lesson:single-region-data"] }),
];

// ======================= PAIRINGS =======================
const pairings: PairingInput[] = [
  pair({ id: "sstr-pet-to-prrt", links: [{ label: "ClinicalTrials.gov NCT03049189: COMPETE", url: "https://clinicaltrials.gov/study/NCT03049189" }], name: "SSTR PET → PRRT", a: "sstr-pet", b: "prrt", pairingType: "diagnostic-therapeutic",
    tldr: "SSTR PET followed by PRRT is the original theranostic pair: the scan with the diagnostic isotope decides who gets the same molecule with the therapeutic isotope.",
    summary: "This diagnostic-therapeutic pairing links somatostatin receptor PET, using gallium-68 or copper-64 DOTATATE, to peptide receptor radionuclide therapy with lutetium-177 dotatate or 177Lu-edotreotide in neuroendocrine tumours. Because the imaging and therapeutic agents share identical peptide chemistry, the biodistribution seen on the scan predicts where the therapy will be delivered, which is the founding logic of theranostics. Every pivotal PRRT trial, including NETTER-1, NETTER-2 and COMPETE, required SSTR-avid disease on imaging, and both the intensity of uptake, graded on the Krenning scale, and the absence of FDG-avid lesions lacking SSTR predict benefit. The same template was later copied by PSMA theranostics in prostate cancer.",
    rationale: "Identical peptide chemistry means imaging biodistribution predicts therapy delivery.",
    evidence: "Embedded in all pivotal PRRT trials.",
    cancers: ["neuroendocrine"], targets: ["sstr2"], drugs: ["lutathera", "itm-11"], terms: ["theranostics"] }),
  pair({ id: "prrt-then-alpha-net", links: [{ label: "ClinicalTrials.gov NCT05153772: ALPHAMEDIX-02", url: "https://clinicaltrials.gov/study/NCT05153772" }, { label: "ClinicalTrials.gov NCT05477576: ACTION-1", url: "https://clinicaltrials.gov/study/NCT05477576" }], name: "Beta PRRT → alpha PRRT", a: "lutathera", b: "alphamedix", pairingType: "sequence",
    tldr: "When lutetium radioligand therapy stops working, alpha-emitting versions can still control the disease.",
    summary: "This sequence moves from beta-emitting lutetium-177 dotatate to an alpha-emitting radioligand, 212Pb-DOTAMTATE, when beta PRRT stops controlling a neuroendocrine tumour. Alpha particles deliver oxygen-independent clustered DNA damage that beta-resistant clones cannot repair, so the same somatostatin receptor target can be attacked again with a more destructive payload. The phase 2 ALPHAMEDIX-02 trial included a PRRT-exposed cohort in which disease control was maintained in most patients, and ACTION-1 is the randomised phase 3 test of 225Ac-DOTATATE after 177Lu. The pairing belongs to the wider topic of alpha versus beta emitters and targeted alpha therapy.",
    rationale: "Alpha particles deliver oxygen-independent clustered DNA damage that beta-resistant clones cannot repair.",
    evidence: "Phase 2 (AlphaMedix); phase 3 pending (ACTION-1).",
    trials: ["alphamedix-02", "action-1"], cancers: ["neuroendocrine"], technologies: ["targeted-alpha-therapy"], terms: ["alpha-vs-beta"] }),
];

// ======================= IDEAS =======================
const ideas: IdeaInput[] = [
  idea({ id: "idea-net-dosimetry-prrt", links: [{ label: "ClinicalTrials.gov NCT03049189: COMPETE", url: "https://clinicaltrials.gov/study/NCT03049189" }], name: "Dosimetry-personalised PRRT instead of four fixed cycles", maturity: "early-clinical",
    tldr: "Measure the radiation each patient's tumour and kidneys actually absorb and adjust the number and size of doses, instead of giving everyone four identical cycles.",
    summary: "The idea is to personalise peptide receptor radionuclide therapy with lutetium-177 dotatate or 177Lu-edotreotide by measuring the radiation each patient's tumour, kidneys and marrow actually absorb on SPECT/CT after each cycle, and adjusting the number and size of doses. The standard of 7.4 GBq for four cycles leaves many patients under-dosed relative to renal and marrow limits, uptake varies widely, and retrospective dosimetry shows tumour absorbed dose correlates with response. The hypothesis is that dosimetry-guided PRRT raises cumulative tumour dose and response rate without exceeding organ limits. The test is a randomised phase 2 of individualised versus fixed activity; P-PRRT in Canada is already testing this, and the idea addresses the wrong-doses bottleneck.",
    hypothesis: "Dosimetry-guided PRRT increases cumulative tumour dose and response rate without exceeding renal/marrow limits, versus fixed dosing.",
    rationale: "Wide inter-patient variation in uptake; SPECT/CT after each cycle makes dosimetry feasible.",
    test: "Randomised phase 2 of individualised vs fixed activity with ORR and PFS endpoints.",
    technologies: ["prrt", "spect"], terms: ["dosimetry"], drugs: ["lutathera", "itm-11"], cancers: ["neuroendocrine"] }),
  idea({ id: "idea-net-antagonist-ligands", links: [{ label: "Reidy-Lagunes et al., Phase 1 trial of the SSTR antagonist radioligand 177Lu-satoreotide tetraxetan in neuroendocrine tumours (Clinical Cancer Research 2019)", url: "https://doi.org/10.1158/1078-0432.CCR-19-1026" }], name: "SSTR antagonist radioligands to increase tumour dose", maturity: "early-clinical",
    tldr: "Radioligand therapy for neuroendocrine tumours built on somatostatin receptor antagonists rather than the agonists used today: antagonists bind the receptor in every state and are not internalised, so they occupy several times more sites per cell and deliver more radiation per dose. The test is a randomised phase 2 against agonist lutetium therapy.",
    summary: "The idea is to build peptide receptor radionuclide therapy for neuroendocrine tumours on somatostatin receptor 2 antagonists rather than the agonists used today. Antagonists bind receptors in every conformational state and are not internalised, so they occupy several times more binding sites on each cell and deliver more radiation per dose. First-in-human studies of the antagonist 177Lu-satoreotide tetraxetan showed higher tumour uptake and dose than agonists, and early trials report responses in patients refractory to agonist PRRT. The hypothesis is higher response rates at an equivalent renal dose, including in tumours with low SSTR2 expression; the test is a randomised phase 2 of antagonist versus agonist 177Lu-PRRT in grade 1 to 2 gastroenteropancreatic NETs.",
    hypothesis: "Antagonist PRRT achieves higher response rates than agonist PRRT at equivalent renal dose, including in low-SSTR-expressing tumours.",
    rationale: "Antagonists bind receptors in all conformational states and are not internalised, increasing binding sites several-fold.",
    test: "Randomised phase 2 antagonist vs agonist 177Lu-PRRT in grade 1-2 GEP-NETs.",
    technologies: ["prrt"], targets: ["sstr2"], cancers: ["neuroendocrine"] }),
];

const spike: Spike = {
  cancerId: "neuroendocrine",
  entities: [...technologies, ...terms, ...drugs, ...trials, ...pairings, ...ideas] as EntityInput[],
  patch: {
    tldr: "A family of usually slow-growing tumours that start in hormone-producing cells of the gut, pancreas and lungs. They pioneered the idea of using the same molecule to see a tumour on a scan and then to treat it with radiation.",
    summary: "Neuroendocrine neoplasms range from indolent grade 1 tumours that patients live with for decades to poorly differentiated neuroendocrine carcinomas that behave like small-cell lung cancer. Most arise in the small bowel, pancreas, rectum or lung; many secrete hormones (serotonin, insulin, gastrin) that cause syndromes, and most well-differentiated tumours express somatostatin receptor 2 (SSTR2), which is the hinge of both diagnosis and therapy. Incidence has risen six-fold over 40 years, largely from incidental detection on imaging and endoscopy.\n\nTherapy is sequenced by grade, receptor status and tempo. Somatostatin analogues (octreotide, lanreotide) control symptoms and slow growth (PROMID, CLARINET). For progression, peptide receptor radionuclide therapy with 177Lu-DOTATATE (NETTER-1; NETTER-2 first line for grade 2-3) is standard, and 177Lu-edotreotide beat everolimus head-to-head in COMPETE (PFS 23.9 vs 14.1 months) with an FDA decision due August 2026. Targeted pills (everolimus, sunitinib, and since March 2025 cabozantinib after CABINET) and chemotherapy (CAPTEM for pancreatic NETs; platinum-etoposide for neuroendocrine carcinoma) fill in. Surgery and liver-directed therapy (resection, embolisation, ablation, transplant in rare cases) remain central because disease is often liver-dominant.\n\nThe frontier is alpha-emitting PRRT: 212Pb-DOTAMTATE (AlphaMedix) met all primary endpoints in phase 2 with a 54% response rate in PRRT-naive patients and Breakthrough designation, and 225Ac-DOTATATE (RYZ101) is in the phase 3 ACTION-1 trial after lutetium failure. SSTR antagonist ligands, dosimetry-personalised dosing, and combinations with CAPTEM or immunotherapy are being tested. Open problems include the lack of randomised evidence for sequencing, the absence of effective therapy for SSTR-negative and high-grade disease, a 2-3% risk of therapy-related leukaemia after PRRT, and isotope supply.",
    burden: "About 7 per 100,000 people per year in the US, rising six-fold since the 1970s; prevalence is high because many patients live for years (>170,000 living with NETs in the US).",
    subtypes: ["Small-bowel (midgut) NET, often with carcinoid syndrome", "Pancreatic NET (functioning: insulinoma, gastrinoma, glucagonoma; non-functioning)", "Lung NET (typical and atypical carcinoid)", "Rectal and appendiceal NET (often incidental, excellent prognosis)", "Grade 3 well-differentiated NET", "Neuroendocrine carcinoma (small- and large-cell), treated like SCLC", "Hereditary: MEN1, VHL, NF1, TSC; paraganglioma/phaeochromocytoma (SDHx)"],
    biomarkers: ["Ki-67 index and mitotic count (WHO grade)", "SSTR2 expression by 68Ga/64Cu-DOTATATE PET", "FDG PET avidity (high-grade or dedifferentiated disease)", "Chromogranin A (monitoring)", "24-hour urinary 5-HIAA (carcinoid syndrome)", "Germline MEN1, VHL, SDHx testing", "MGMT status (CAPTEM response, investigational)"],
    standardOfCare: [
      { setting: "Diagnosis and staging", approach: "Histology with Ki-67 grading; 68Ga/64Cu-DOTATATE PET/CT ± FDG PET; triple-phase CT or MRI of the liver; chromogranin A and syndrome-specific hormones; germline testing for pancreatic NETs and paragangliomas.", refs: ["sstr-pet", "net-grade-ki67", "chromogranin-a", "germline-testing", "men1-hereditary-net"], guideline: { nccn: "Neuroendocrine and Adrenal Tumors", version: "NCCN 2026 / ENETS 2023" } },
      { setting: "Localised disease", approach: "Surgical resection (including primary tumour resection with liver metastases where feasible); endoscopic resection for small rectal/gastric NETs; surveillance for small incidental lesions.", refs: ["robotic-surgery"], guideline: { nccn: "Category 2A" } },
      { setting: "Advanced, grade 1-2, SSTR-positive, first line", approach: "Somatostatin analogue (octreotide LAR or lanreotide); 177Lu-DOTATATE first line for grade 2-3 (NETTER-2) with high burden.", refs: ["octreotide-lanreotide", "promid", "clarinet", "lutathera", "prrt"], guideline: { nccn: "Category 1 (SSA); category 1 PRRT for grade 2-3 first line" } },
      { setting: "Advanced, progression on SSA", approach: "PRRT with 177Lu-DOTATATE (or 177Lu-edotreotide if approved); everolimus; sunitinib (pancreatic); cabozantinib (CABINET, all sites).", refs: ["lutathera", "itm-11", "compete", "everolimus", "radiant-3-4", "sunitinib", "cabozantinib", "cabinet"], guideline: { nccn: "Category 1 for PRRT and cabozantinib; 2A sequencing" } },
      { setting: "Advanced pancreatic NET needing tumour shrinkage", approach: "CAPTEM (E2211); PRRT; liver-directed therapy for hepatic-dominant disease.", refs: ["capecitabine-temozolomide", "tace", "radioembolisation-tare", "thermal-ablation"], guideline: { nccn: "Category 2A" } },
      { setting: "Carcinoid syndrome", approach: "SSA dose escalation; telotristat ethyl for refractory diarrhoea; octreotide infusion peri-procedurally; echocardiographic screening for carcinoid heart disease.", refs: ["octreotide-lanreotide", "carcinoid-syndrome"], guideline: { nccn: "Category 2A" } },
      { setting: "Neuroendocrine carcinoma (poorly differentiated)", approach: "Platinum-etoposide (as in SCLC) ± PD-L1 inhibitor by extrapolation; FOLFIRINOX or CAPTEM in later lines; DLL3-directed agents in trials.", refs: ["carboplatin", "tarlatamab", "atezolizumab"], guideline: { nccn: "Category 2A" } },
      { setting: "After PRRT failure", approach: "Everolimus or cabozantinib; alpha PRRT in trials (ACTION-1, AlphaMedix); PRRT retreatment in selected patients.", refs: ["ryz101", "action-1", "alphamedix", "prrt-then-alpha-net"], guideline: { nccn: "Trials preferred" } },
      { setting: "VHL-associated pancreatic NET", approach: "Belzutifan (approved 2021) for non-metastatic tumours not requiring immediate surgery.", refs: ["belzutifan", "men1-hereditary-net"], guideline: { nccn: "Category 2A" } },
    ],
    stateOfArt: [
      "Theranostic paradigm is routine: SSTR PET selects, 177Lu-DOTATATE treats, including first line for grade 2-3 disease.",
      "First head-to-head radioligand-versus-drug trial (COMPETE) won on PFS; FDA decision on 177Lu-edotreotide due 28 August 2026.",
      "Cabozantinib approved (2025) across pancreatic and extra-pancreatic NETs after prior therapy, with an 81% reduction in progression risk in lung/thymic NETs.",
      "Alpha PRRT (212Pb-DOTAMTATE) met all phase 2 endpoints with Breakthrough designation; 225Ac-DOTATATE in phase 3.",
      "Germline testing and syndrome-directed care (belzutifan for VHL) are standard for pancreatic NETs.",
    ],
    history: [
      { year: 1907, title: "Oberndorfer coins 'Karzinoid' for small-bowel tumours" },
      { year: 1954, title: "Carcinoid syndrome described (Thorson)", refs: ["carcinoid-syndrome"] },
      { year: 1988, title: "Octreotide approved for carcinoid syndrome", refs: ["octreotide-lanreotide"] },
      { year: 1994, title: "111In-octreotide scintigraphy (OctreoScan) approved", note: "First SSTR imaging; later replaced by PET.", refs: ["sstr-pet"] },
      { year: 2000, title: "First 90Y- and 177Lu-DOTATOC/DOTATATE PRRT series (Rotterdam, Basel)", refs: ["prrt"] },
      { year: 2009, title: "PROMID: octreotide slows tumour growth", refs: ["promid"] },
      { year: 2011, title: "Everolimus (RADIANT-3) and sunitinib approved for pancreatic NETs", refs: ["radiant-3-4", "everolimus", "sunitinib"] },
      { year: 2014, title: "CLARINET: lanreotide antiproliferative approval", refs: ["clarinet"] },
      { year: 2016, title: "68Ga-DOTATATE PET (Netspot) approved; RADIANT-4 extends everolimus to lung/GI NETs", refs: ["sstr-pet", "radiant-3-4"] },
      { year: 2018, title: "Lutathera approved (NETTER-1): PRRT enters standard care", refs: ["lutathera", "prrt"] },
      { year: 2020, title: "SANET trials positive in China (surufatinib)", refs: ["sanet"] },
      { year: 2024, title: "NETTER-2: PRRT first line in grade 2-3; CABINET published; AlphaMedix Breakthrough designation", refs: ["lutathera", "cabinet", "alphamedix"] },
      { year: 2025, title: "Cabozantinib approved (March); COMPETE positive (ENETS, Lancet); AlphaMedix phase 2 meets all endpoints (October)", refs: ["cabozantinib", "compete", "alphamedix-02"] },
      { year: 2026, title: "FDA accepts 177Lu-edotreotide NDA (PDUFA 28 August); ACTION-1 dosimetry published; pancreatic subgroup of COMPETE at ENETS", refs: ["itm-11", "action-1"] },
    ],
    pipeline: ["itm-11", "compete", "alphamedix", "alphamedix-02", "ryz101", "action-1", "prrt", "sstr-pet", "cabozantinib", "idea-net-dosimetry-prrt", "idea-net-antagonist-ligands", "prrt-then-alpha-net", "tarlatamab", "dll3"],
    openProblems: [
      "Sequencing is unproven: no randomised trial orders SSA, PRRT, everolimus, cabozantinib and chemotherapy.",
      "SSTR-negative, FDG-avid and high-grade disease has few options; neuroendocrine carcinoma outcomes remain poor.",
      "Therapy-related MDS/AML (~2-3%) and renal toxicity after PRRT; long-term data on retreatment are thin.",
      "Overall survival benefits are hard to demonstrate because patients live for years and cross over.",
      "Isotope supply (177Lu, 212Pb, 225Ac) and nuclear-medicine capacity limit access outside major centres.",
      "Chromogranin A is an unreliable marker; better blood tests (NETest, ctDNA) are not validated for decisions.",
      "Rare syndromic and paediatric NETs lack trials; hereditary carriers need lifelong surveillance protocols.",
    ],
    targets: ["sstr2", "vegf", "met", "akt", "menin", "hif2a", "dll3"],
    technologies: ["sstr-pet", "prrt", "radioligand-therapy", "targeted-alpha-therapy", "pet-ct", "tace", "radioembolisation-tare", "thermal-ablation", "kinase-inhibitors", "germline-testing", "histopathology-ihc"],
    terms: ["net-grade-ki67", "chromogranin-a", "carcinoid-syndrome", "men1-hereditary-net", "theranostics", "alpha-vs-beta", "dosimetry"],
    companies: ["novartis", "ipsen", "itm", "orano-med", "radiomedix", "sanofi", "rayzebio", "bms", "exelixis", "pfizer"],
    institutions: ["mskcc", "uke-hamburg", "heidelberg-nct", "royal-marsden", "alliance-oncology", "ecog-acrin"],
    related: ["sstr-pet-to-prrt", "prrt-then-alpha-net", "radiopharma-roadmap", "beta-then-alpha"],
    tags: ["spike"],
  },
};

export default spike;

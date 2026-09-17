import type { DrugInput, EntityInput, IdeaInput, PairingInput, TechnologyInput, TermInput, TrialInput } from "@/lib/schema";
import type { Spike } from "./index";

/**
 * Oesophageal cancer spike (squamous cell carcinoma and adenocarcinoma). Facts checked 2026-09-07.
 * Defines tislelizumab and camrelizumab (referenced by the gastric spike) and endoscopic-resection
 * (referenced by gastric); references capox/folfox/flot from the other spikes. Register all three together.
 */
const asOf = "2026-09-07";
const W = (s: string) => `https://en.wikipedia.org/wiki/${s}`;
const ct = (nct: string) => ({ label: `ClinicalTrials.gov ${nct}`, url: `https://clinicaltrials.gov/study/${nct}` });
const NCCN_ESO = "https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1433";
const ESMO_ESO = "https://www.esmo.org/guidelines/esmo-clinical-practice-guidelines-gastrointestinal-cancers/";

type T = Omit<TrialInput, "kind" | "asOf">;
const t = (x: T): TrialInput => ({ kind: "trial", asOf, ...x });
type D = Omit<DrugInput, "kind" | "asOf">;
const d = (x: D): DrugInput => ({ kind: "drug", asOf, ...x });
type Te = Omit<TermInput, "kind" | "asOf">;
const term = (x: Te): TermInput => ({ kind: "term", asOf, ...x });

// ======================= TRIALS =======================
const trials: TrialInput[] = [
  t({ id: "cross", name: "CROSS", nct: "NTR487", phase: "3", status: "positive", yearReported: 2012, sponsor: "Dutch Cancer Society (Erasmus MC)", enrolled: 366,
    setting: "Resectable oesophageal or junctional cancer (squamous and adenocarcinoma): weekly carboplatin/paclitaxel + 41.4 Gy radiation then surgery vs surgery alone",
    tldr: "The trial that made chemotherapy plus radiation before surgery the standard for oesophageal cancer; the survival gain was still there ten years later.",
    summary: "OS 49.4 vs 24.0 months (NEJM 2012); pCR 29% (49% in squamous). Ten-year OS 38% vs 25% (JCO 2021), HR for death from oesophageal cancer 0.60. The CROSS regimen is the reference arm for CheckMate 577, SANO, and most modern trials; perioperative FLOT is the alternative for adenocarcinoma (ESOPEC 2024 favoured FLOT).",
    result: "10-year OS 38% vs 25%; median OS 49.4 vs 24.0 months.",
    outcomes: [
      { endpoint: "Overall survival", primary: true, unit: "months", arms: [{ name: "Chemoradiation + surgery", n: 178, value: 49.4 }, { name: "Surgery alone", n: 188, value: 24.0 }], hr: 0.68, source: "https://www.nejm.org/doi/full/10.1056/NEJMoa1112088" },
      { endpoint: "Overall survival at 10 years", unit: "percent", arms: [{ name: "Chemoradiation + surgery", value: 38 }, { name: "Surgery alone", value: 25 }], source: "https://ascopubs.org/doi/10.1200/JCO.20.03614" },
    ],
    replication: "Durable at 10 years; NEO-AEGIS and ESOPEC compared it against perioperative chemotherapy in adenocarcinoma with FLOT favoured in ESOPEC.",
    technologies: ["imrt-igrt", "platinum", "cytotoxic-chemotherapy"], drugs: ["carboplatin", "paclitaxel"], cancers: ["esophageal"], terms: ["neoadjuvant-adjuvant", "pcr"],
    links: [{ label: "NEJM 2012", url: "https://www.nejm.org/doi/full/10.1056/NEJMoa1112088" }, { label: "10-year outcomes, JCO 2021", url: "https://ascopubs.org/doi/10.1200/JCO.20.03614" }], people: ["jan-van-lanschot", "kitagawa-yuko"] }),
  t({ id: "sano", name: "SANO", nct: "NCT05953181", phase: "3", status: "positive", yearReported: 2023, sponsor: "Erasmus MC", enrolled: 274,
    setting: "Oesophageal cancer with clinical complete response after CROSS chemoradiation: active surveillance (surgery only on regrowth) vs standard surgery",
    tldr: "For the third of patients whose tumour vanishes after chemoradiation, watching closely and operating only if it comes back gave the same survival as immediate surgery.",
    summary: "Stepped-wedge cluster-randomised non-inferiority trial (Lancet Oncology 2025). Two-year OS non-inferior (HR 1.14, 95% CI 0.74-1.78); about a third of surveillance patients avoided oesophagectomy at 2 years, with better short-term quality of life. Regrowth was usually resectable. Establishes organ preservation as an option for cCR, with caveats about surveillance intensity.",
    result: "2-year OS non-inferior (HR 1.14); ~one-third avoided surgery.",
    outcomes: [{ endpoint: "Overall survival at 2 years (non-inferiority)", primary: true, arms: [{ name: "Active surveillance", n: 156 }, { name: "Standard surgery", n: 118 }], hr: 1.14, ci: [0.74, 1.78], p: "0.55", source: "https://www.sciencedirect.com/science/article/abs/pii/S1470204525000270" }],
    replication: "Consistent with preSANO and observational series; longer follow-up pending.",
    technologies: ["active-surveillance", "imrt-igrt"], cancers: ["esophageal"], terms: ["clinical-complete-response"], trials: ["cross"],
    links: [ct("NCT05953181"), { label: "Lancet Oncology 2025", url: "https://www.sciencedirect.com/science/article/abs/pii/S1470204525000270" }], people: ["jan-van-lanschot"] }),
  t({ id: "checkmate-577", name: "CheckMate 577", nct: "NCT02743494", phase: "3", status: "mixed", yearReported: 2021, sponsor: "BMS", enrolled: 794,
    setting: "Resected oesophageal/GEJ cancer with residual disease after neoadjuvant chemoradiation: adjuvant nivolumab 1 year vs placebo",
    tldr: "A year of immunotherapy after surgery doubled the time before cancer returned in patients whose tumour had not fully responded to chemoradiation, though the survival gain did not reach significance.",
    summary: "CheckMate 577, trial NCT02743494 sponsored by Bristol Myers Squibb and reported in 2021, showed that a year of adjuvant nivolumab doubled the time before cancer returned in patients with oesophageal or gastro-oesophageal junction cancer whose tumour had not fully responded to neoadjuvant chemoradiation and surgery, though the survival gain did not reach significance. It randomised 794 patients with residual disease to nivolumab or placebo and met its primary disease-free survival endpoint, the basis of the 2021 FDA approval, while the final overall survival analysis at ASCO 2025 favoured nivolumab without statistical significance. It remains standard in NCCN and ESMO guidance, and whether a disease-free benefit without a survival benefit should be enough is the open question.",
    result: "DFS 22.4 vs 11.0 months (HR 0.69); OS 51.7 vs 35.3 months (HR 0.85, NS).",
    outcomes: [
      { endpoint: "Disease-free survival", primary: true, unit: "months", arms: [{ name: "Nivolumab", n: 532, value: 22.4 }, { name: "Placebo", n: 262, value: 11.0 }], hr: 0.69, source: "https://www.nejm.org/doi/full/10.1056/NEJMoa2032125" },
      { endpoint: "Overall survival (final)", unit: "months", arms: [{ name: "Nivolumab", n: 532, value: 51.7 }, { name: "Placebo", n: 262, value: 35.3 }], hr: 0.85, ci: [0.70, 1.04], p: "0.1064", source: "https://ascopubs.org/doi/10.1200/JCO.2025.43.16_suppl.4000" },
    ],
    replication: "Single phase 3; real-world matched cohorts show similar OS direction.",
    drugs: ["nivolumab"], cancers: ["esophageal", "gastric", "oesophageal-squamous-cell-carcinoma", "oesophageal-adenocarcinoma"], targets: ["pd1"], terms: ["neoadjuvant-adjuvant"], trials: ["cross"],
    links: [ct("NCT02743494"), { label: "Final OS, ASCO 2025", url: "https://ascopubs.org/doi/10.1200/JCO.2025.43.16_suppl.4000" }], people: ["ronan-kelly"] }),
  t({ id: "keynote-590", name: "KEYNOTE-590", nct: "NCT03189719", phase: "3", status: "positive", yearReported: 2020, sponsor: "Merck", enrolled: 749,
    setting: "First-line advanced oesophageal cancer (squamous and adenocarcinoma) and Siewert I GEJ: pembrolizumab + cisplatin/5-FU vs chemotherapy",
    tldr: "Added immunotherapy to first-line chemotherapy for all types of oesophageal cancer, with a survival benefit that held at five years.",
    summary: "KEYNOTE-590, trial NCT03189719 sponsored by Merck and reported in 2020, added pembrolizumab to first-line cisplatin and fluorouracil chemotherapy for all types of advanced oesophageal cancer and Siewert type I junction tumours, with a survival benefit that held at five years. It randomised 749 patients and met its primary overall survival endpoint in all patients, with a larger effect in PD-L1 CPS 10 or higher, and the five-year follow-up published in ESMO Open in 2025 confirmed the benefit; the FDA approved it for all patients in March 2021 while the EMA restricted it to CPS 10 or higher. OnCo links it to oesophageal cancer, PD-1 as a target, pembrolizumab, the CPS term and Ken Kato. Benefit in PD-L1-negative disease is uncertain, which is the open question behind the regional label split.",
    result: "OS 12.4 vs 9.8 months (HR 0.73); 5-year OS HR 0.72.",
    outcomes: [{ endpoint: "Overall survival, all patients", primary: true, unit: "months", arms: [{ name: "Pembrolizumab + chemotherapy", n: 373, value: 12.4 }, { name: "Placebo + chemotherapy", n: 376, value: 9.8 }], hr: 0.73, source: "https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(21)01234-4/abstract" }, { endpoint: "Overall survival at 5-year follow-up", arms: [{ name: "Pembrolizumab + chemotherapy" }, { name: "Placebo + chemotherapy" }], hr: 0.72, ci: [0.62, 0.84], source: "https://www.esmoopen.com/article/S2059-7029(25)01723-5/fulltext" }],
    replication: "Replicated by CheckMate 648, RATIONALE-306, ESCORT-1st, JUPITER-06, and ORIENT-15 in squamous disease.",
    drugs: ["pembrolizumab"], cancers: ["esophageal", "oesophageal-squamous-cell-carcinoma", "oesophageal-adenocarcinoma"], targets: ["pd1"], terms: ["cps"], links: [ct("NCT03189719")], people: ["ken-kato"] }),
  t({ id: "checkmate-648", name: "CheckMate 648", nct: "NCT03143153", phase: "3", status: "positive", yearReported: 2021, sponsor: "BMS", enrolled: 970,
    setting: "First-line advanced oesophageal squamous cell carcinoma: nivolumab + chemotherapy, or nivolumab + ipilimumab (chemotherapy-free), vs chemotherapy",
    tldr: "Showed two immunotherapy options for squamous oesophageal cancer, including one with no chemotherapy at all, both extending survival.",
    summary: "CheckMate 648, trial NCT03143153 sponsored by Bristol Myers Squibb and reported in 2021, showed two immunotherapy options for first-line advanced oesophageal squamous cell carcinoma, nivolumab plus chemotherapy and a chemotherapy-free doublet of nivolumab plus ipilimumab, both extending survival. It randomised 970 patients across three arms and met its primary overall survival endpoint in PD-L1-positive patients for both regimens, with benefit in all randomised patients and durable separation confirmed at five-year follow-up in 2026, leading to FDA approval of both regimens in May 2022. OnCo links it to oesophageal cancer, PD-1 and CTLA-4 as targets, nivolumab, ipilimumab and Jaffer A. Ajani. Which patients are best served by avoiding chemotherapy altogether is the open question.",
    result: "PD-L1 ≥1%: OS 15.4 vs 9.1 months (nivo + chemo, HR 0.54); 13.7 vs 9.1 months (nivo + ipi, HR 0.64).",
    outcomes: [{ endpoint: "Overall survival, PD-L1 ≥1% (nivolumab + chemotherapy)", primary: true, unit: "months", arms: [{ name: "Nivolumab + chemotherapy", value: 15.4 }, { name: "Chemotherapy", value: 9.1 }], hr: 0.54, source: "https://www.nejm.org/doi/full/10.1056/NEJMoa2111380" }, { endpoint: "Overall survival, PD-L1 ≥1% (nivolumab + ipilimumab)", unit: "months", arms: [{ name: "Nivolumab + ipilimumab", value: 13.7 }, { name: "Chemotherapy", value: 9.1 }], hr: 0.64, source: "https://www.nejm.org/doi/full/10.1056/NEJMoa2111380" }],
    replication: "Consistent with KEYNOTE-590 and RATIONALE-306; the chemotherapy-free doublet is unique to this trial.",
    drugs: ["nivolumab", "ipilimumab"], cancers: ["esophageal", "oesophageal-squamous-cell-carcinoma"], targets: ["pd1", "ctla4"], links: [ct("NCT03143153"), { label: "5-year follow-up", url: "https://pubmed.ncbi.nlm.nih.gov/42575473/" }], people: ["jaffer-ajani"] }),
  t({ id: "rationale-306", name: "RATIONALE-306", nct: "NCT03783442", phase: "3", status: "positive", yearReported: 2022, sponsor: "BeOne (BeiGene)", enrolled: 649,
    setting: "First-line advanced oesophageal squamous cell carcinoma: tislelizumab + platinum chemotherapy vs placebo + chemotherapy",
    tldr: "RATIONALE-306 is the trial behind tislelizumab's US approval for squamous oesophageal cancer, with the biggest gains in PD-L1-positive tumours.",
    summary: "RATIONALE-306, trial NCT03783442 sponsored by BeOne, formerly BeiGene, and reported in 2022, is the trial behind tislelizumab's US approval for first-line advanced oesophageal squamous cell carcinoma, with the biggest gains in PD-L1-positive tumours. It randomised 649 patients to tislelizumab or placebo with platinum chemotherapy and met its primary overall survival endpoint in all patients, published in Lancet Oncology in 2023, with a larger effect in PD-L1-positive disease; the FDA approved it on 4 March 2025 restricted to PD-L1 tumour area positivity of one percent or more, and the EU approved it in 2024. OnCo links it to oesophageal cancer, PD-1 as a target and tislelizumab, and the result is consistent with KEYNOTE-590, CheckMate 648 and ESCORT-1st. Whether a fifth PD-1 antibody in this setting competes on price rather than data is the practical question.",
    result: "OS 17.2 vs 10.6 months (HR 0.66); PD-L1 ≥1% OS 16.8 vs 9.6 months.",
    outcomes: [{ endpoint: "Overall survival, all patients", primary: true, unit: "months", arms: [{ name: "Tislelizumab + chemotherapy", n: 326, value: 17.2 }, { name: "Placebo + chemotherapy", n: 323, value: 10.6 }], hr: 0.66, source: "https://www.thelancet.com/journals/lanonc/article/PIIS1470-2045(23)00108-0/abstract" }, { endpoint: "Overall survival, PD-L1 ≥1%", unit: "months", arms: [{ name: "Tislelizumab + chemotherapy", value: 16.8 }, { name: "Placebo + chemotherapy", value: 9.6 }], source: "https://www.onclive.com/view/fda-approves-first-line-tislelizumab-plus-chemotherapy-for-unresectable-or-metastatic-escc" }],
    replication: "Consistent with KEYNOTE-590, CheckMate 648, ESCORT-1st.",
    drugs: ["tislelizumab"], cancers: ["esophageal"], targets: ["pd1"], links: [ct("NCT03783442")] }),
  t({ id: "escort-1st", name: "ESCORT-1st", nct: "NCT03691090", phase: "3", status: "positive", yearReported: 2021, sponsor: "Jiangsu Hengrui", enrolled: 596,
    setting: "First-line advanced oesophageal squamous cell carcinoma (China): camrelizumab + paclitaxel/cisplatin vs placebo + chemotherapy",
    tldr: "ESCORT-1st is China's first-line immunotherapy trial for squamous oesophageal cancer, one of five that together made chemo-immunotherapy the global standard.",
    summary: "ESCORT-1st, trial NCT03691090 sponsored by Jiangsu Hengrui and published in JAMA in 2021, is China's first-line immunotherapy trial for advanced oesophageal squamous cell carcinoma, one of five concordant trials that together made chemo-immunotherapy the global standard. It randomised 596 patients to camrelizumab or placebo with paclitaxel and cisplatin and met its primary overall survival endpoint, confirmed at the final analysis in 2024; camrelizumab is approved in China for the disease but not in the United States, and the later ESCORT-NEO trial showed neoadjuvant camrelizumab plus chemotherapy raises pathologic complete response in resectable disease. OnCo links it to oesophageal cancer, PD-1 as a target, camrelizumab, Jing Huang and Rui-Hua Xu. Whether Chinese PD-1 antibodies reach patients outside China for this indication is the open question.",
    result: "OS 15.3 vs 12.0 months, HR 0.70.",
    outcomes: [{ endpoint: "Overall survival", primary: true, unit: "months", arms: [{ name: "Camrelizumab + chemotherapy", n: 298, value: 15.3 }, { name: "Placebo + chemotherapy", n: 298, value: 12.0 }], hr: 0.70, source: "https://jamanetwork.com/journals/jama/fullarticle/2784143" }],
    replication: "One of five concordant first-line ESCC chemo-IO trials.",
    drugs: ["camrelizumab"], cancers: ["esophageal"], targets: ["pd1"], links: [ct("NCT03691090"), { label: "JAMA 2021", url: "https://jamanetwork.com/journals/jama/fullarticle/2784143" }], people: ["huang-jing-cams", "xu-rui-hua"] }),
  t({ id: "panku-esophagus01", name: "PANKU-Esophagus01 (BL-B01D1-305)", nct: "NCT06304974", phase: "3", status: "positive", yearReported: 2026, sponsor: "SystImmune / BMS", enrolled: 497,
    setting: "Recurrent or metastatic oesophageal squamous cell carcinoma after PD-(L)1 inhibitor plus platinum chemotherapy: izalontamab brengitecan vs chemotherapy of physician's choice",
    tldr: "The first bispecific ADC to extend both progression-free and overall survival in oesophageal cancer, for patients whose immunotherapy has stopped working.",
    summary: "Interim analysis met dual primary endpoints of OS and BICR-assessed PFS (announced February 2026; presented ASCO 2026). 249 vs 248 patients. Second-line ESCC previously had only single-agent chemotherapy (irinotecan, taxanes) with median OS under a year. Global confirmatory trials are being planned.",
    result: "OS and PFS significantly improved at interim analysis; numbers per ASCO 2026 presentation.",
    replication: "Parallel positive phase 3 in TNBC (BL-B01D1-307) supports the agent; no second ESCC trial yet.",
    drugs: ["izalontamab-brengitecan"], cancers: ["esophageal"], targets: ["egfr", "her3"], technologies: ["bispecific-adc"], trials: ["bl-b01d1-307"],
    links: [ct("NCT06304974"), { label: "Announcement", url: "https://www.biospace.com/press-releases/izalontamab-brengitecan-iza-bren-demonstrates-statistically-significant-and-clinically-meaningful-improvements-in-overall-survival-and-progression-free-survival-in-patients-with-triple-negative-breast-cancer-and-esophageal-squamous-cell-carcinoma" }] }),
];

// ======================= DRUGS =======================
const drugs: DrugInput[] = [
  d({ id: "tislelizumab", name: "Tislelizumab", brand: "Tevimbra", code: "BGB-A317", modality: "Monoclonal antibody (anti-PD-1)", status: "approved", wikipedia: W("Tislelizumab"),
    tldr: "A Chinese-developed PD-1 blocker, engineered to avoid a side-channel that may blunt other PD-1 drugs, now approved in the US and EU for oesophageal and stomach cancer.",
    summary: "Humanised IgG4 with an Fc engineered to minimise FcγR binding (reducing macrophage-mediated T-cell clearance). US approvals: second-line ESCC (March 2024), first-line HER2-negative gastric/GEJ with chemotherapy (December 2024, RATIONALE-305), first-line ESCC PD-L1 ≥1% with chemotherapy (March 2025, RATIONALE-306). Also the PD-1 partner in HERIZON-GEA-01 with zanidatamab. Approved in China across many indications since 2019.",
    mechanism: "PD-1 blockade with reduced Fcγ receptor engagement.",
    mechanismSteps: ["Tislelizumab binds PD-1 on exhausted T cells", "PD-L1 on the tumour can no longer switch them off", "Its engineered tail avoids being grabbed by macrophages, which may otherwise strip the drug off T cells", "T cells resume attacking the tumour"],
    dosing: { route: "Intravenous", schedule: "200 mg every 3 weeks", modifications: "Withhold or discontinue for immune-related adverse events per label", monitoring: "Thyroid, liver, glucose; immune-related toxicity", source: "https://www.drugs.com/history/tevimbra.html" },
    toxicity: [{ event: "Immune-related adverse events (thyroiditis, pneumonitis, colitis, hepatitis)", note: "Class effects of PD-1 blockade" }, { event: "Rash, fatigue" }],
    approvals: [{ region: "China", year: 2019, indication: "Classical Hodgkin lymphoma (first); subsequently urothelial, NSCLC, HCC, ESCC, gastric, nasopharyngeal" }, { region: "US", year: 2024, indication: "Second-line ESCC after chemotherapy; first-line HER2-negative gastric/GEJ with chemotherapy (PD-L1 ≥1)" }, { region: "US", year: 2025, indication: "First-line ESCC, PD-L1 ≥1%, with platinum chemotherapy" }],
    regulatoryEvents: [{ date: "2024-03", type: "approval", region: "US", note: "Second-line ESCC (RATIONALE-302)" }, { date: "2024-12", type: "approval", region: "US", note: "First-line gastric/GEJ (RATIONALE-305)" }, { date: "2025-03-04", type: "approval", region: "US", note: "First-line ESCC PD-L1 ≥1% (RATIONALE-306)" }],
    targets: ["pd1"], technologies: ["checkpoint-inhibitor"], companies: ["beone"], cancers: ["esophageal", "gastric", "nsclc", "hcc"], trials: ["rationale-306", "herizon-gea-01", "rationale-302"], terms: ["irae", "fc-effector"],
    links: [{ label: "FDA approval, first-line ESCC", url: "https://www.onclive.com/view/fda-approves-first-line-tislelizumab-plus-chemotherapy-for-unresectable-or-metastatic-escc" }] }),
  d({ id: "camrelizumab", name: "Camrelizumab", brand: "AiRuiKa", code: "SHR-1210", modality: "Monoclonal antibody (anti-PD-1)", status: "approved", wikipedia: W("Camrelizumab"),
    tldr: "Camrelizumab is Jiangsu Hengrui's humanised PD-1 antibody, approved in China for oesophageal, liver and lung cancer but not in the US, where its liver cancer combination with rivoceranib drew complete response letters in 2024 and 2025 over manufacturing and inspection issues. Its signature side effect is reactive cutaneous capillary endothelial proliferation, a skin reaction seen in most patients.",
    summary: "Humanised IgG4 anti-PD-1 (Jiangsu Hengrui). ESCORT (second-line ESCC) and ESCORT-1st (first-line with chemotherapy, OS 15.3 vs 12.0 months) in China; ESCORT-NEO neoadjuvant; CARES-310 with rivoceranib in HCC (OS 22.1 vs 15.2 months). A US BLA for the HCC combination received complete response letters (2024, 2025) over manufacturing and travel-inspection issues. Distinctive toxicity: reactive cutaneous capillary endothelial proliferation (RCCEP) in most patients.",
    mechanism: "PD-1 blockade.",
    mechanismSteps: ["Camrelizumab binds PD-1 on T cells", "Blocks the PD-L1 'stop' signal from the tumour", "T cells regain the ability to kill", "A quirk of its binding causes small skin blood-vessel growths (RCCEP) in most patients"],
    dosing: { route: "Intravenous", schedule: "200 mg every 2-3 weeks" },
    toxicity: [{ event: "Reactive cutaneous capillary endothelial proliferation (RCCEP)", note: "Very common; benign, resolves after stopping" }, { event: "Immune-related adverse events" }],
    approvals: [{ region: "China", year: 2019, indication: "Classical Hodgkin lymphoma; subsequently HCC, NSCLC, ESCC (second line 2020, first line with chemotherapy 2021), nasopharyngeal" }],
    regulatoryEvents: [{ date: "2024-05", type: "crl", region: "US", note: "Complete response letter for camrelizumab + rivoceranib in HCC (manufacturing/inspection)" }, { date: "2025-03", type: "crl", region: "US", note: "Second complete response letter" }],
    targets: ["pd1"], technologies: ["checkpoint-inhibitor"], cancers: ["esophageal", "hcc", "nsclc"], trials: ["escort-1st"], terms: ["irae"],
    links: [{ label: "ESCORT-1st final analysis", url: "https://pubmed.ncbi.nlm.nih.gov/38870932/" }] }),
];

// ======================= TECHNOLOGIES =======================
const technologies: TechnologyInput[] = [
  { id: "endoscopic-resection", kind: "technology", name: "Endoscopic resection (EMR / ESD)", sections: ["surgery", "early-detection"], status: "standard-of-care", asOf, since: 1990, wikipedia: W("Endoscopic_submucosal_dissection"),
    tldr: "Endoscopic resection lifts an early cancer of the oesophagus or stomach with an injection and cuts it out from inside with a snare or electrosurgical knife, keeping the organ intact. It cures cancers confined to the mucosa (T1a) and gives a definitive depth reading; deeper invasion or lymph node spread still needs surgery.",
    summary: "Endoscopic mucosal resection (EMR) for small lesions and endoscopic submucosal dissection (ESD, developed in Japan) for larger en-bloc resections cure mucosal (T1a) cancers and high-grade dysplasia with organ preservation. Standard for Barrett's neoplasia, early squamous cancer, and early gastric cancer meeting Japanese criteria. Radiofrequency ablation eradicates residual Barrett's epithelium. Requires expert endoscopy and careful histologic staging; submucosal invasion (T1b) with risk features needs surgery.",
    principle: "Submucosal injection lifts the lesion; a snare (EMR) or electrosurgical knife (ESD) resects it en bloc for histologic assessment of depth and margins.",
    strengths: ["Organ preservation, low morbidity", "Curative for T1a disease", "Provides definitive staging"],
    limitations: ["Operator-dependent, long learning curve for ESD", "Not curative for deeper invasion or nodal disease", "Requires endoscopic surveillance afterwards"],
    cancers: ["esophageal", "gastric"], terms: ["barretts-esophagus", "endoscopic-resection-term"], technologies: ["thermal-ablation"], links: [{ label: "Wikipedia", url: W("Endoscopic_submucosal_dissection") }] },
];

// ======================= TERMS =======================
const terms: TermInput[] = [
  term({ id: "barretts-esophagus", name: "Barrett's oesophagus", category: "Biology", tldr: "A change in the lining of the lower oesophagus caused by acid reflux that can, in a minority, progress through dysplasia to adenocarcinoma. It is why Western oesophageal cancer is mostly adenocarcinoma.", summary: "Intestinal metaplasia of the distal oesophagus in ~1-2% of adults; annual progression to adenocarcinoma ~0.1-0.3%, higher with dysplasia. Surveillance endoscopy, radiofrequency ablation and endoscopic resection for dysplasia, and proton-pump inhibitors (AspECT) reduce progression. Non-endoscopic screening (Cytosponge, capsule sponge) is being evaluated for population use.", wikipedia: W("Barrett%27s_esophagus"), cancers: ["esophageal"], technologies: ["endoscopic-resection", "chemoprevention"], links: [{ label: "Wikipedia", url: W("Barrett%27s_esophagus") }], aka: ["Barrett's", "Barrett", "Barrett's esophagus", "Barrett oesophagus", "Barrett's metaplasia", "intestinal metaplasia", "barretts-oesophagus"], related: ["dysplasia", "endoscopic-resection", "radiofrequency-ablation", "gej"], sections: ["early-detection"] }),
  term({ id: "escc-vs-eac", links: [{ label: "The Cancer Genome Atlas: integrated genomic characterization of oesophageal carcinoma (Nature 2017)", url: "https://doi.org/10.1038/nature20805" }], wikipedia: W("Esophageal_cancer"), name: "Squamous cell carcinoma vs adenocarcinoma of the oesophagus", category: "Pathology", tldr: "Oesophageal cancer is two different diseases in one organ: squamous cell carcinoma (upper/mid oesophagus, tobacco and alcohol, dominant in Asia) and adenocarcinoma (lower oesophagus, reflux and obesity, dominant in the West).", summary: "ESCC is ~85% of cases worldwide, concentrated in the 'oesophageal cancer belt' from Iran to China; genetically resembles head-and-neck squamous cancer (TP53, NOTCH1, CCND1, SOX2) and responds better to chemoradiation and immunotherapy. EAC arises from Barrett's, resembles gastric adenocarcinoma (HER2 amplification in ~15-20%), and is treated on gastric-like pathways (FLOT, trastuzumab, zolbetuximab trials). Trial eligibility, PD-L1 scoring (TAP vs CPS), and surgery differ between them.", cancers: ["esophageal"], terms: ["siewert-classification", "barretts-esophagus"] }),
];

// ======================= PAIRINGS =======================
const pairings: PairingInput[] = [
  { id: "cross-then-nivolumab", links: [{ label: "ClinicalTrials.gov NCT02743494: CheckMate 577", url: "https://clinicaltrials.gov/study/NCT02743494" }], kind: "pairing", name: "CROSS chemoradiation → surgery → adjuvant nivolumab if residual disease", a: "cross", b: "nivolumab", pairingType: "sequence", asOf,
    tldr: "Chemotherapy and radiation, then surgery, then a year of immunotherapy if the operation shows cancer was still there. This is the current curative-intent pathway.",
    summary: "CROSS gives 10-year OS of 38%; CheckMate 577 adds DFS 22.4 vs 11.0 months in the ~70% with residual disease after resection (OS HR 0.85, not significant). Patients with pathologic complete response do not receive nivolumab. SANO offers surveillance instead of surgery for clinical complete responders.",
    rationale: "Residual disease after chemoradiation marks high relapse risk; radiation-induced immunogenic cell death primes T cells that PD-1 blockade sustains.",
    evidence: "Phase 3 for each step (CROSS, CheckMate 577); the sequence is guideline standard.",
    trials: ["cross", "checkmate-577", "sano"], drugs: ["nivolumab", "carboplatin", "paclitaxel"], cancers: ["esophageal"], terms: ["neoadjuvant-adjuvant", "clinical-complete-response"] },
];

// ======================= IDEAS =======================
const ideas: IdeaInput[] = [
  { id: "idea-organ-preservation-esophageal", links: [{ label: "ClinicalTrials.gov NCT05953181: SANO", url: "https://clinicaltrials.gov/study/NCT05953181" }], kind: "idea", name: "Organ preservation as the default after complete response in oesophageal cancer", maturity: "being-tested-at-scale", asOf,
    tldr: "Oesophagectomy is one of the hardest operations in surgery. If chemoradiation (with or without immunotherapy) has made the tumour disappear, skip it and watch.",
    summary: "SANO showed non-inferior 2-year survival for active surveillance in clinical complete responders after CROSS. Adding PD-1 blockade to chemoradiation (KEYNOTE-975, SKYSCRAPER-07, ESCORT-CRT) may raise complete response rates and make surveillance viable for more patients; ctDNA and PET could sharpen response assessment.",
    hypothesis: "Definitive chemoradiation + PD-1 blockade followed by ctDNA- and endoscopy-guided surveillance, with salvage surgery on regrowth, yields non-inferior 3-year OS to planned oesophagectomy in squamous cell carcinoma.",
    rationale: "ESCC is highly radiosensitive and immunotherapy-responsive; salvage surgery after regrowth was feasible in SANO.",
    test: "Randomised non-inferiority trial in ESCC with cCR after chemoradiation-IO; OS primary, oesophagectomy-free survival and quality of life secondary.",
    technologies: ["active-surveillance", "imrt-igrt", "checkpoint-inhibitor", "mrd-testing"], cancers: ["esophageal"], trials: ["sano", "cross"], terms: ["clinical-complete-response"] },
  { id: "idea-non-endoscopic-barretts-screening", links: [{ label: "BEST3: Cytosponge-trefoil factor 3 versus usual care to identify Barrett's oesophagus (Lancet 2020)", url: "https://doi.org/10.1016/S0140-6736(20)31099-0" }], kind: "idea", name: "Non-endoscopic screening for Barrett's oesophagus and early adenocarcinoma", maturity: "being-tested-at-scale", asOf,
    tldr: "A swallowed sponge on a string can sample the oesophagus in a GP's office. Screen people with chronic reflux to catch adenocarcinoma at a curable stage.",
    summary: "The proposal is to screen adults with chronic reflux or long-term acid suppression for Barrett's oesophagus and early adenocarcinoma with a swallowed capsule sponge that can be given in a GP's office rather than by endoscopy. Oesophageal adenocarcinoma has a known precursor, a defined at-risk population and curative endoscopic resection for early disease; the missing piece has been an accessible test. In BEST3, reported in the Lancet in 2020, the Cytosponge-TFF3 test detected many more cases of Barrett's than usual care, and the NIHR-funded BEST4 trial now tests whether screening reduces deaths and shifts diagnosis to stage I. Being tested at scale, with EsoGuard methylation markers and AI histology as possible add-ons, it addresses the bottleneck that the hardest cancers are found late.",
    hypothesis: "Offering capsule-sponge screening to adults on long-term acid suppression increases the proportion of oesophageal adenocarcinomas diagnosed at stage I and reduces oesophageal cancer mortality.",
    rationale: "Adenocarcinoma has a known precursor, a defined at-risk population, and curative endoscopic treatment for early disease; the missing piece is an accessible test.",
    test: "The BEST4 screening and surveillance arms (mortality and stage-shift endpoints) report in the late 2020s.",
    technologies: ["endoscopic-resection", "mced", "methylation-profiling"], cancers: ["esophageal"], terms: ["barretts-esophagus", "stage-shift"] },
];

const entities: EntityInput[] = [...trials, ...drugs, ...technologies, ...terms, ...pairings, ...ideas];

const spike: Spike = {
  cancerId: "esophageal",
  entities,
  patch: {
    asOf,
    summary: "Oesophageal cancer is two diseases: squamous cell carcinoma (ESCC, ~85% globally, driven by tobacco, alcohol, hot beverages, and nutritional factors along a belt from Iran through Central Asia to China) and adenocarcinoma (EAC, dominant in the West, arising from Barrett's oesophagus through reflux and obesity). Japan and parts of China screen high-risk populations endoscopically and cure early squamous cancers with endoscopic resection; elsewhere most patients present with dysphagia and locally advanced or metastatic disease. It causes about 510,000 new cases a year (the seventh most common cancer) and, because of late presentation, 445,000 deaths (sixth among cancers); five-year survival is about 20% overall.\n\nLocalised disease is treated with multimodality therapy. CROSS chemoradiation followed by oesophagectomy gives 10-year survival of 38% versus 25% for surgery alone; perioperative FLOT is the alternative for adenocarcinoma (ESOPEC favoured it). Definitive chemoradiation is used for cervical tumours and unfit patients. CheckMate 577 added a year of adjuvant nivolumab for residual disease after chemoradiation (DFS 22.4 vs 11.0 months), and SANO showed that patients with a clinical complete response can be watched rather than operated on with non-inferior survival. Advanced disease is treated with chemotherapy plus PD-1 blockade: pembrolizumab (KEYNOTE-590, both histologies), nivolumab ± ipilimumab (CheckMate 648, squamous), tislelizumab (RATIONALE-306, squamous PD-L1 ≥1%), and camrelizumab or sintilimab in China. HER2-positive adenocarcinoma follows the gastric pathway (trastuzumab, zanidatamab after HERIZON-GEA-01, T-DXd second line). In 2026 the EGFR×HER3 bispecific ADC izalontamab brengitecan became the first agent to improve overall survival in second-line ESCC after immunotherapy (PANKU-Esophagus01).\n\nOpen fronts: whether PD-1 blockade added to definitive chemoradiation raises cure rates (KEYNOTE-975, SKYSCRAPER-07 and Chinese trials), how far organ preservation can be pushed, non-endoscopic screening for Barrett's (BEST4), the absence of targets in squamous disease beyond PD-1 and now EGFR/HER3, and the persistent gap between Asian and Western outcomes that early detection explains.",
    burden: "~510,000 cases per year; ~85% squamous cell carcinoma globally, adenocarcinoma dominant in North America, Western Europe, and Australia. Endoscopic screening, where it exists, cures most early disease. 5-year survival is >80% for endoscopically treated early cancers and ~20% overall; ~445,000 deaths per year.",
    subtypes: ["Squamous cell carcinoma (upper/mid oesophagus; tobacco, alcohol; Asia and Africa)", "Adenocarcinoma (distal oesophagus/GEJ; Barrett's, reflux, obesity; the West)", "GEJ tumours by Siewert type (I treated as oesophageal, III as gastric)", "HER2-positive adenocarcinoma (~15-20%)", "PD-L1-high (CPS ≥10 or TAP ≥10%) tumours with greater immunotherapy benefit", "Cervical oesophageal cancer (definitive chemoradiation, no surgery)", "Early (T1a) disease amenable to endoscopic resection"],
    biomarkers: ["Histology (squamous vs adenocarcinoma) determines the pathway", "PD-L1 (CPS for adenocarcinoma/pembrolizumab; TAP score for tislelizumab in ESCC)", "HER2 IHC/ISH in adenocarcinoma", "MSI/dMMR", "CLDN18.2 in GEJ adenocarcinoma (gastric trials)", "Pathologic response after neoadjuvant therapy (residual disease → adjuvant nivolumab)", "Clinical complete response assessment (endoscopy, biopsy, PET-CT) for surveillance", "EGFR and HER3 expression (not required for iza-bren)"],
    standardOfCare: [
      { setting: "Prevention and screening", approach: "Tobacco and alcohol control; endoscopic screening of high-risk populations in China and Japan (Lugol chromoendoscopy); surveillance of Barrett's oesophagus with ablation or resection of dysplasia; non-endoscopic capsule-sponge screening in trials (BEST4).", refs: ["endoscopic-resection", "barretts-esophagus", "idea-non-endoscopic-barretts-screening"], guideline: { url: NCCN_ESO } },
      { setting: "Early (T1a, high-grade dysplasia)", approach: "Endoscopic resection (EMR/ESD) with radiofrequency ablation of residual Barrett's; oesophagectomy for T1b with high-risk features.", refs: ["endoscopic-resection"], guideline: { nccn: "Category 1 (endoscopic therapy for Tis/T1a)", url: NCCN_ESO } },
      { setting: "Resectable locally advanced (cT2-4a or N+)", approach: "CROSS chemoradiation (carboplatin/paclitaxel + 41.4 Gy) then oesophagectomy for squamous and adenocarcinoma; perioperative FLOT for adenocarcinoma/GEJ (ESOPEC). Adjuvant nivolumab for residual disease after chemoradiation (CheckMate 577).", refs: ["cross", "checkmate-577", "flot", "nivolumab", "cross-then-nivolumab"], guideline: { nccn: "Category 1 (preoperative chemoradiation; adjuvant nivolumab)", url: NCCN_ESO } },
      { setting: "Clinical complete response after chemoradiation", approach: "Active surveillance with surgery on regrowth is a non-inferior option (SANO); requires intensive endoscopic and PET surveillance.", refs: ["sano", "active-surveillance", "clinical-complete-response"], guideline: { url: ESMO_ESO } },
      { setting: "Unresectable locally advanced or cervical", approach: "Definitive chemoradiation (50-50.4 Gy with cisplatin/5-FU or carboplatin/paclitaxel); PD-1 blockade added in trials.", refs: ["imrt-igrt", "platinum"], guideline: { nccn: "Category 1 (definitive chemoradiation)", url: NCCN_ESO } },
      { setting: "Advanced squamous cell carcinoma, first line", approach: "Chemotherapy + pembrolizumab (KEYNOTE-590), nivolumab (CheckMate 648), or tislelizumab (RATIONALE-306, PD-L1 ≥1%); nivolumab + ipilimumab chemotherapy-free option; camrelizumab/sintilimab/toripalimab in China.", refs: ["keynote-590", "checkmate-648", "rationale-306", "escort-1st", "pembrolizumab", "nivolumab", "ipilimumab", "tislelizumab", "camrelizumab"], guideline: { nccn: "Category 1 (PD-L1-positive)", url: NCCN_ESO } },
      { setting: "Advanced adenocarcinoma, first line", approach: "As for gastric cancer: chemotherapy + pembrolizumab or nivolumab (PD-L1 CPS ≥5 or ≥1); trastuzumab-based therapy if HER2-positive; zolbetuximab if CLDN18.2-positive (GEJ eligible in SPOTLIGHT/GLOW).", refs: ["keynote-590", "checkmate-649", "trastuzumab", "zanidatamab", "zolbetuximab"], guideline: { url: NCCN_ESO } },
      { setting: "Second line, squamous cell carcinoma", approach: "Izalontamab brengitecan after PD-(L)1 + platinum (PANKU-Esophagus01, OS and PFS benefit, 2026; approval pending); otherwise taxane or irinotecan; nivolumab/pembrolizumab if IO-naive.", refs: ["panku-esophagus01", "izalontamab-brengitecan"], guideline: { url: ESMO_ESO } },
      { setting: "Second line, adenocarcinoma", approach: "T-DXd if HER2-positive (DESTINY-Gastric04); ramucirumab + paclitaxel; CLDN18.2 ADC after CLARITY-Gastric 01.", refs: ["destiny-gastric04", "trastuzumab-deruxtecan", "ramucirumab", "clarity-gastric01"], guideline: { url: NCCN_ESO } },
      { setting: "Palliation of dysphagia", approach: "Self-expanding metal stent, brachytherapy, or external beam radiation; nutritional support; early palliative care.", refs: ["brachytherapy", "imrt-igrt"], guideline: { url: ESMO_ESO } },
    ],
    stateOfArt: [
      "Chemoradiation before surgery (CROSS) has a durable 13-point 10-year survival gain; organ preservation after complete response is non-inferior (SANO).",
      "Adjuvant nivolumab doubles disease-free survival after incomplete response to chemoradiation (CheckMate 577), though OS was not significantly improved.",
      "Chemo-immunotherapy is first-line standard in both histologies, replicated in five phase 3 trials; PD-L1 defines the size of benefit.",
      "A chemotherapy-free immunotherapy doublet (nivolumab + ipilimumab) is an option in squamous disease.",
      "The first bispecific ADC with an OS benefit in second-line ESCC (iza-bren, 2026) gives post-immunotherapy squamous cancer its first targeted option.",
      "Endoscopic screening and resection in East Asia cure most early squamous cancers; Barrett's surveillance and ablation prevent adenocarcinoma in the West.",
    ],
    history: [
      { year: 1913, title: "Torek performs the first successful oesophagectomy for cancer" },
      { year: 1980, title: "Cisplatin/5-FU chemoradiation defined (RTOG 85-01 reported 1992)", note: "Definitive chemoradiation shown superior to radiation alone; 5-year OS 26% vs 0%.", refs: ["imrt-igrt", "platinum"] },
      { year: 1990, title: "Endoscopic mucosal resection for early oesophageal cancer (Japan)", refs: ["endoscopic-resection"] },
      { year: 2006, title: "MAGIC: perioperative chemotherapy for GEJ adenocarcinoma", refs: ["cytotoxic-chemotherapy"] },
      { year: 2010, title: "ToGA includes GEJ adenocarcinoma: trastuzumab for HER2-positive disease", refs: ["toga", "trastuzumab"] },
      { year: 2012, title: "CROSS: neoadjuvant chemoradiation becomes standard", refs: ["cross"] },
      { year: 2019, title: "PD-1 blockade second line: pembrolizumab (KEYNOTE-181) and nivolumab (ATTRACTION-3)", refs: ["pembrolizumab", "nivolumab"] },
      { year: 2021, title: "CROSS 10-year data; CheckMate 577 adjuvant nivolumab; KEYNOTE-590 and ESCORT-1st first-line chemo-IO", refs: ["cross", "checkmate-577", "keynote-590", "escort-1st"] },
      { year: 2022, title: "CheckMate 648: nivolumab + chemotherapy and nivolumab + ipilimumab approved; RATIONALE-306 reported", refs: ["checkmate-648", "rationale-306"] },
      { year: 2023, title: "SANO: active surveillance non-inferior after complete response", refs: ["sano"] },
      { year: 2024, title: "Tislelizumab approved in the US (second-line ESCC, first-line gastric); ESOPEC favours FLOT over CROSS in adenocarcinoma", refs: ["tislelizumab", "flot"] },
      { year: 2025, title: "Tislelizumab first-line ESCC approval; CheckMate 577 final OS not significant; DESTINY-Gastric04 for HER2+ GEJ", refs: ["tislelizumab", "checkmate-577", "destiny-gastric04"] },
      { year: 2026, title: "PANKU-Esophagus01: iza-bren improves OS in second-line ESCC; HERIZON-GEA-01 for HER2+ GEJ; CheckMate 648 five-year data", refs: ["panku-esophagus01", "herizon-gea-01", "checkmate-648"] },
    ],
    pipeline: ["panku-esophagus01", "izalontamab-brengitecan", "sano", "idea-organ-preservation-esophageal", "idea-non-endoscopic-barretts-screening", "herizon-gea-01", "zanidatamab", "tislelizumab", "clarity-gastric01", "mrd-testing", "fapi-pet", "cross-then-nivolumab", "checkmate-648"],
    openProblems: [
      "Most patients present with advanced disease; no Western screening for squamous cancer and only trial-stage non-endoscopic screening for Barrett's.",
      "Adjuvant nivolumab improves DFS but not significantly OS; who truly needs it (PD-L1, ctDNA) is unknown.",
      "Squamous cell carcinoma has no validated molecular targets beyond PD-1 and, since 2026, EGFR/HER3 antigen delivery.",
      "PD-L1-negative tumours derive little from chemo-immunotherapy; alternatives are lacking.",
      "Whether adding PD-1 blockade to definitive chemoradiation improves cure remains unproven pending KEYNOTE-975 and SKYSCRAPER-07.",
      "Organ preservation requires intensive surveillance and salvage surgery capacity that many centres lack.",
      "Oesophagectomy carries high morbidity; centralisation and minimally invasive approaches are unevenly adopted.",
    ],
    targets: ["pd1", "pdl1", "ctla4", "egfr", "her3", "her2", "cldn18-2", "vegf"],
    technologies: ["checkpoint-inhibitor", "bispecific-adc", "imrt-igrt", "endoscopic-resection", "active-surveillance", "brachytherapy", "robotic-surgery", "adc"],
    pathways: ["pd1-checkpoint", "ras-mapk"],
    companies: ["merck", "bms", "beone", "systimmune", "astrazeneca", "daiichi-sankyo", "jazz"],
    terms: ["escc-vs-eac", "barretts-esophagus", "siewert-classification", "clinical-complete-response", "cps", "neoadjuvant-adjuvant", "pcr"],
    institutions: ["nki", "sysucc", "ncc-japan", "cams-cancer-hospital"],
    links: [{ label: "NCCN Esophageal and EGJ Cancers guideline", url: NCCN_ESO }, { label: "ESMO oesophageal cancer guideline", url: ESMO_ESO }, { label: "NCI PDQ esophageal cancer treatment", url: "https://www.cancer.gov/types/esophageal/hp/esophageal-treatment-pdq" }],
    tags: ["spike", "gi"],
  },
};

export default spike;

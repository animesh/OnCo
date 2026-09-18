import type { CompanyInput, DrugInput, EntityInput, IdeaInput, PairingInput, TechnologyInput, TermInput, TrialInput } from "@/lib/schema";
import type { Spike } from "./index";

/**
 * SCLC spike: deepens the small-cell lung cancer record. Facts checked 2026-09-07 against
 * FDA approval notices, IASLC/ASCO reporting, and trial publications linked below.
 */
const asOf = "2026-09-07";
const W = (s: string) => `https://en.wikipedia.org/wiki/${s}`;
const ct = (nct: string) => ({ label: `ClinicalTrials.gov ${nct}`, url: `https://clinicaltrials.gov/study/${nct}` });

type T = Omit<TrialInput, "kind" | "asOf">;
const t = (x: T): TrialInput => ({ kind: "trial", asOf, ...x });
type D = Omit<DrugInput, "kind" | "asOf">;
const d = (x: D): DrugInput => ({ kind: "drug", asOf, ...x });

// ======================= TRIALS =======================
const trials: TrialInput[] = [
  t({ id: "impower133", name: "IMpower133", nct: "NCT02763579", phase: "3", status: "positive", yearReported: 2018, sponsor: "Roche", enrolled: 403,
    setting: "First-line extensive-stage SCLC: carboplatin-etoposide + atezolizumab vs carboplatin-etoposide + placebo",
    tldr: "IMpower133 was the first trial in decades to lengthen survival in extensive-stage small-cell lung cancer, by adding immunotherapy to chemotherapy.",
    summary: "Median OS 12.3 vs 10.3 months (HR 0.70); PFS 5.2 vs 4.3 months. Established chemo-immunotherapy as first-line standard (FDA March 2019). The IMbrella A extension reported the first five-year survival data for chemo-immunotherapy in ES-SCLC, with a small tail of long-term survivors in the atezolizumab arm. Benefit was independent of PD-L1 and TMB.",
    result: "OS 12.3 vs 10.3 months, HR 0.70.",
    outcomes: [
      { endpoint: "Overall survival", primary: true, unit: "months", arms: [{ name: "Atezolizumab + CE", n: 201, value: 12.3 }, { name: "Placebo + CE", n: 202, value: 10.3 }], hr: 0.70, ci: [0.54, 0.91], p: "0.007", source: "https://www.nejm.org/doi/full/10.1056/NEJMoa1809064" },
      { endpoint: "Progression-free survival", primary: true, unit: "months", arms: [{ name: "Atezolizumab + CE", value: 5.2 }, { name: "Placebo + CE", value: 4.3 }], hr: 0.77, ci: [0.62, 0.96], source: "https://doi.org/10.1056/NEJMoa1809064" },
    ],
    replication: "Replicated by CASPIAN (durvalumab, 2019) and by serplulimab (ASTRUM-005), tislelizumab (RATIONALE-312), adebrelimab and toripalimab trials in China; the class effect is one of the best-replicated in SCLC.",
    drugs: ["atezolizumab", "platinum-etoposide"], cancers: ["sclc", "extensive-stage-sclc"], technologies: ["checkpoint-inhibitor"], links: [ct("NCT02763579"), { label: "Five-year OS (IMbrella A)", url: "https://pubmed.ncbi.nlm.nih.gov/39306923/" }], people: ["anne-chiang"] }),
  t({ id: "caspian", name: "CASPIAN", nct: "NCT03043872", phase: "3", status: "positive", yearReported: 2019, sponsor: "AstraZeneca", enrolled: 805,
    setting: "First-line extensive-stage SCLC: platinum-etoposide + durvalumab (± tremelimumab) vs platinum-etoposide",
    tldr: "Confirmed that adding a PD-L1 blocker to first-line chemotherapy helps in small-cell lung cancer, and showed that adding a second immunotherapy did not help further.",
    summary: "CASPIAN, trial NCT03043872 sponsored by AstraZeneca and reported in 2019, confirmed that adding the PD-L1 antibody durvalumab to first-line platinum and etoposide helps in extensive-stage small-cell lung cancer, and showed that adding the CTLA-4 antibody tremelimumab did not help further. It randomised 805 patients, met its primary overall survival endpoint for durvalumab plus chemotherapy with a durable minority alive at three years, allowed cisplatin or carboplatin and up to six chemotherapy cycles in the control arm, and led to FDA approval in March 2020. OnCo links it to small-cell lung cancer, durvalumab, tremelimumab, the platinum-etoposide record, Luis Paz-Ares and CAPSTONE-1, and the result is consistent with IMpower133 while the failure of the CTLA-4 add-on was itself replicated by other attempts. Why only a minority gain durable benefit remains the open question.",
    result: "OS 13.0 vs 10.3 months, HR 0.73; 3-year OS 17.6% vs 5.8%.",
    outcomes: [
      { endpoint: "Overall survival", primary: true, unit: "months", arms: [{ name: "Durvalumab + EP", n: 268, value: 13.0 }, { name: "EP alone", n: 269, value: 10.3 }], hr: 0.73, ci: [0.59, 0.91], p: "0.0047", source: "https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(19)32222-6/fulltext" },
      { endpoint: "3-year overall survival rate", unit: "%", arms: [{ name: "Durvalumab + EP", value: 17.6 }, { name: "EP alone", value: 5.8 }], source: "https://doi.org/10.1016/S0140-6736(19)32222-6" },
    ],
    replication: "Consistent with IMpower133; the durvalumab-tremelimumab arm's failure was itself replicated by other CTLA-4 add-on attempts in SCLC.",
    drugs: ["durvalumab", "tremelimumab", "platinum-etoposide"], cancers: ["sclc", "extensive-stage-sclc"], links: [ct("NCT03043872")], people: ["luis-paz-ares"] }),
  t({ id: "adriatic", name: "ADRIATIC", nct: "NCT03703297", phase: "3", status: "positive", yearReported: 2024, sponsor: "AstraZeneca", enrolled: 730,
    setting: "Limited-stage SCLC without progression after concurrent chemoradiotherapy: durvalumab consolidation (up to 2 years) vs placebo",
    tldr: "ADRIATIC brought the first improvement in curative-intent small-cell lung cancer treatment in 30 years: a year or two of immunotherapy after chemoradiation lengthens life.",
    summary: "ADRIATIC, trial NCT03703297 sponsored by AstraZeneca and reported in 2024, brought the first improvement in curative-intent small-cell lung cancer treatment in thirty years: durvalumab consolidation for up to two years after concurrent chemoradiotherapy for limited-stage disease lengthens life. It randomised 730 patients without progression after chemoradiation to durvalumab or placebo and met both primary endpoints of overall and progression-free survival, leading to FDA approval on 4 December 2024, with benefit regardless of prophylactic cranial irradiation. OnCo links it to small-cell lung cancer, modern radiotherapy, prophylactic cranial irradiation, durvalumab, the limited-stage and PCI terms and Corinne Faivre-Finn, and it applies the PACIFIC template to small-cell disease. It is a single pivotal trial, and whether real-world consolidation series reproduce it is the open question.",
    result: "OS 55.9 vs 33.4 months, HR 0.73.",
    outcomes: [
      { endpoint: "Overall survival", primary: true, unit: "months", arms: [{ name: "Durvalumab", n: 264, value: 55.9 }, { name: "Placebo", n: 266, value: 33.4 }], hr: 0.73, ci: [0.57, 0.93], p: "0.0104", source: "https://www.nejm.org/doi/full/10.1056/NEJMoa2404873" },
      { endpoint: "Progression-free survival", primary: true, unit: "months", arms: [{ name: "Durvalumab", value: 16.6 }, { name: "Placebo", value: 9.2 }], hr: 0.76, ci: [0.61, 0.95], source: "https://doi.org/10.1056/NEJMoa2404873" },
    ],
    replication: "Single pivotal trial; consistent with PACIFIC in NSCLC. Real-world consolidation series are emerging.",
    drugs: ["durvalumab"], cancers: ["sclc", "limited-stage-sclc"], technologies: ["imrt-igrt", "prophylactic-cranial-irradiation"], terms: ["limited-extensive-stage", "pci-term"],
    links: [ct("NCT03703297"), { label: "FDA approval (Dec 2024)", url: "https://www.onclive.com/view/fda-approves-durvalumab-for-limited-stage-small-cell-lung-cancer" }], people: ["corinne-faivre-finn"] }),
  t({ id: "imforte", name: "IMforte", nct: "NCT05091567", phase: "3", status: "positive", yearReported: 2025, sponsor: "Roche / Jazz / PharmaMar", enrolled: 483,
    setting: "First-line maintenance after induction chemo-immunotherapy in ES-SCLC: lurbinectedin + atezolizumab vs atezolizumab",
    tldr: "IMforte produced the first maintenance treatment ever approved for extensive-stage small-cell lung cancer, adding lurbinectedin to the immunotherapy that continues after chemotherapy.",
    summary: "IMforte, trial NCT05091567 sponsored by Roche, Jazz and PharmaMar and reported at the ASCO 2025 plenary and in the Lancet in 2025, produced the first maintenance treatment ever approved for extensive-stage small-cell lung cancer, adding lurbinectedin to the atezolizumab that continues after chemotherapy. It randomised 483 patients without progression after four cycles of carboplatin, etoposide and atezolizumab to lurbinectedin plus atezolizumab or atezolizumab alone, met both primary endpoints of overall and progression-free survival, and led to FDA approval on 2 October 2025, at the cost of added myelosuppression and fatigue. The maintenance concept is now being tested with tarlatamab in DeLLphi-305, so which agent wins the maintenance slot is the open question.",
    result: "OS 13.2 vs 10.6 months (HR 0.73); PFS HR 0.54.",
    outcomes: [
      { endpoint: "Overall survival", primary: true, unit: "months", arms: [{ name: "Lurbinectedin + atezolizumab", n: 242, value: 13.2 }, { name: "Atezolizumab", n: 241, value: 10.6 }], hr: 0.73, ci: [0.57, 0.95], source: "https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(25)01011-6/abstract" },
      { endpoint: "Progression-free survival (IRF)", primary: true, unit: "months", arms: [{ name: "Lurbinectedin + atezolizumab", value: 5.4 }, { name: "Atezolizumab", value: 2.1 }], hr: 0.54, ci: [0.43, 0.67], source: "https://doi.org/10.1016/S0140-6736(25)01011-6" },
    ],
    replication: "Single phase 3; the maintenance concept is being tested with tarlatamab (DeLLphi-305) and I-DXd.",
    drugs: ["lurbinectedin", "atezolizumab"], cancers: ["sclc", "extensive-stage-sclc"], links: [ct("NCT05091567"), { label: "FDA approval (Oct 2025)", url: "https://www.roche.com/media/releases/med-cor-2025-10-03b" }] }),
  t({ id: "atlantis", name: "ATLANTIS", nct: "NCT02566993", phase: "3", status: "negative", yearReported: 2021, sponsor: "PharmaMar / Jazz", enrolled: 613,
    setting: "Relapsed SCLC after one platinum line: lurbinectedin + doxorubicin vs topotecan or CAV",
    tldr: "Lurbinectedin's confirmatory trial missed its survival goal, but the drug stayed on the market because the combination tested was not the approved monotherapy dose.",
    summary: "ATLANTIS, trial NCT02566993 sponsored by PharmaMar and Jazz and reported in 2021, was lurbinectedin's confirmatory trial in relapsed small-cell lung cancer after one platinum line, and it missed its survival goal, though the drug stayed on the market because the combination tested was not the approved monotherapy dose. It randomised 613 patients to lurbinectedin plus doxorubicin or topotecan or CAV chemotherapy, found no difference in overall survival despite better tolerability, and the 2020 accelerated monotherapy approval, based on a basket cohort response rate, was maintained with the FDA later accepting IMforte and the LAGOON trial as confirmatory routes. OnCo links it to small-cell lung cancer, lurbinectedin and topotecan. Head-to-head second-line superiority of lurbinectedin over older chemotherapy remains unproven, which is the open question.",
    result: "OS HR 0.97, not significant.",
    outcomes: [{ endpoint: "Overall survival", primary: true, unit: "months", arms: [{ name: "Lurbinectedin + doxorubicin", n: 307, value: 8.6 }, { name: "Topotecan or CAV", n: 306, value: 7.6 }], hr: 0.97, ci: [0.82, 1.15], source: "https://www.thelancet.com/journals/lanres/article/PIIS2213-2600(22)00309-5/abstract" }],
    replication: "Monotherapy activity supported by single-arm data and by IMforte in maintenance; head-to-head second-line superiority unproven.",
    drugs: ["lurbinectedin", "topotecan"], cancers: ["sclc"], tags: ["lesson:combination-dose"], links: [ct("NCT02566993")] }),
  t({ id: "dellphi-305", name: "DeLLphi-305", nct: "NCT06211036", phase: "3", status: "positive", yearReported: 2026, sponsor: "Amgen", enrolled: 563,
    result: "Met the primary overall survival endpoint at the pre-specified interim analysis (Amgen, 8 September 2026); progression-free survival and response rate also improved; figures not yet disclosed.",
    setting: "First-line maintenance in ES-SCLC after platinum-etoposide-durvalumab: tarlatamab + durvalumab vs durvalumab",
    tldr: "Tests whether adding the DLL3 T-cell engager to first-line maintenance can push median survival in extensive-stage disease past two years, as the phase 1b hinted.",
    summary: "Builds on DeLLphi-303 (phase 1b), where tarlatamab plus a PD-L1 inhibitor as first-line maintenance gave median OS 25.3 months and PFS 5.6 months. On 8 September 2026 Amgen and AstraZeneca announced that the trial met its primary overall survival endpoint at the pre-specified interim analysis, with statistically significant gains in progression-free survival and response rate; detailed figures are held for a congress presentation. A parallel phase 3 (DeLLphi-312) adds tarlatamab to induction chemo-immunotherapy.",
    drugs: ["tarlatamab", "durvalumab"], targets: ["dll3"], cancers: ["sclc", "extensive-stage-sclc"], links: [ct("NCT06211036"), { label: "Amgen topline release (8 Sep 2026)", url: "https://www.amgen.com/newsroom/press-releases/2026/09/imdelltra-in-combination-with-imfinzi-demonstrated-landmark-improvement-in-overall-survival-in-first-line-extensive-stage-small-cell-lung-cancer" }, { label: "DeLLphi-303 results (IASLC)", url: "https://www.iaslc.org/iaslc-news/press-release/tarlatamab-anti-pd-l1-first-line-maintenance-after-chemo-immunotherapy-es" }] }),
  t({ id: "ideate-lung02", name: "IDeate-Lung02", nct: "NCT06203210", phase: "3", status: "recruiting", sponsor: "Daiichi Sankyo / Merck",
    setting: "Relapsed SCLC after one prior line: ifinatamab deruxtecan vs topotecan, amrubicin, or lurbinectedin",
    tldr: "IDeate-Lung02 is the pivotal trial for the B7-H3 ADC that produced some of the highest response rates ever seen in relapsed small-cell lung cancer.",
    summary: "IDeate-Lung02, trial NCT06203210 sponsored by Daiichi Sankyo and Merck, is the pivotal phase 3 for ifinatamab deruxtecan, the B7-H3 antibody-drug conjugate that produced some of the highest response rates ever seen in relapsed small-cell lung cancer. It compares the drug with topotecan, amrubicin or lurbinectedin after one prior line, with objective response rate and overall survival as primary endpoints, following IDeate-Lung01, in which more than half of patients responded at the 12 mg/kg dose. OnCo links it to small-cell lung cancer, B7-H3 as a target, ifinatamab deruxtecan, topotecan and lurbinectedin. It is recruiting with no results, is positioned to compete with tarlatamab in the second line, and how the two should be sequenced is the open question.",
    drugs: ["ifinatamab-deruxtecan", "topotecan", "lurbinectedin"], targets: ["b7h3"], cancers: ["sclc", "extensive-stage-sclc"], links: [ct("NCT06203210"), { label: "Trial design paper", url: "https://pubmed.ncbi.nlm.nih.gov/41055143/" }] }),
  t({ id: "astrum-005", name: "ASTRUM-005", nct: "NCT04063163", phase: "3", status: "positive", yearReported: 2022, sponsor: "Henlius", enrolled: 585,
    setting: "First-line ES-SCLC: serplulimab + carboplatin-etoposide vs placebo + carboplatin-etoposide",
    tldr: "In ASTRUM-005, a Chinese PD-1 antibody produced the longest first-line survival of the chemo-immunotherapy trials; it is now approved in Europe and the UK but not yet in the US.",
    summary: "ASTRUM-005, trial NCT04063163 sponsored by Henlius and reported in 2022, showed that the Chinese PD-1 antibody serplulimab added to first-line carboplatin and etoposide in extensive-stage small-cell lung cancer produced the longest survival of the chemo-immunotherapy trials, and it is now approved in Europe, the United Kingdom and India but not yet in the United States. It randomised 585 patients and met its primary overall survival endpoint, leading to approval in China in 2022 and in the European Union in February 2025, while a US bridging study against atezolizumab, ASTRIDE, has completed enrolment. OnCo links it to small-cell lung cancer, serplulimab, the platinum-etoposide record, Shanghai Henlius Biotech, Ying Cheng, Jilin Cancer Hospital and CAPSTONE-1. Whether cross-trial differences in effect size reflect drug or population is the open question.",
    result: "OS 15.4 vs 10.9 months, HR 0.63.",
    outcomes: [{ endpoint: "Overall survival", primary: true, unit: "months", arms: [{ name: "Serplulimab + CE", n: 389, value: 15.4 }, { name: "Placebo + CE", n: 196, value: 10.9 }], hr: 0.63, ci: [0.49, 0.82], source: "https://jamanetwork.com/journals/jama/fullarticle/2796605" }],
    replication: "Consistent with IMpower133 and CASPIAN; cross-trial magnitude differences may reflect population and control-arm differences rather than drug differences.",
    drugs: ["serplulimab", "platinum-etoposide"], cancers: ["sclc", "extensive-stage-sclc"], links: [ct("NCT04063163")], people: ["cheng-ying"] }),
  t({ id: "convert", name: "CONVERT", nct: "NCT00433563", phase: "3", status: "mixed", yearReported: 2017, sponsor: "Cancer Research UK / EORTC", enrolled: 547,
    setting: "Limited-stage SCLC: twice-daily 45 Gy vs once-daily 66 Gy thoracic radiotherapy with concurrent cisplatin-etoposide",
    tldr: "Settled the radiotherapy schedule debate in limited-stage disease: neither schedule was superior, so twice-daily 45 Gy remains standard and once-daily is an acceptable alternative.",
    summary: "CONVERT, trial NCT00433563 sponsored by Cancer Research UK and the EORTC and reported in 2017, settled the radiotherapy schedule debate in limited-stage small-cell lung cancer: neither schedule was superior, so twice-daily 45 Gy remains standard and once-daily 66 Gy is an acceptable alternative. It randomised 547 patients to twice-daily or once-daily thoracic radiotherapy with concurrent cisplatin and etoposide, was designed to show superiority of the once-daily schedule and did not, with similar toxicity and both arms outperforming historical controls. OnCo links it to small-cell lung cancer, modern external beam radiotherapy, the limited-stage term and Corinne Faivre-Finn. Because it was not a non-inferiority design, whether once-daily treatment is truly equivalent rather than merely not proven superior is the open question.",
    result: "No significant difference; twice-daily 45 Gy remains standard.",
    outcomes: [{ endpoint: "Overall survival", primary: true, unit: "months", arms: [{ name: "Twice-daily 45 Gy", n: 274, value: 30 }, { name: "Once-daily 66 Gy", n: 273, value: 25 }], hr: 1.18, ci: [0.95, 1.45], source: "https://www.thelancet.com/journals/lanonc/article/PIIS1470-2045(17)30318-2/fulltext" }],
    cancers: ["sclc", "limited-stage-sclc"], technologies: ["imrt-igrt"], terms: ["limited-extensive-stage"], links: [ct("NCT00433563")], people: ["corinne-faivre-finn"] }),
];

// ======================= DRUGS =======================
const drugs: DrugInput[] = [
  d({ id: "platinum-etoposide", name: "Platinum + etoposide (EP / CE)", modality: "Cytotoxic regimen", status: "standard-of-care", wikipedia: W("Etoposide"),
    tldr: "Platinum plus etoposide has been the chemotherapy backbone of small-cell lung cancer for over 40 years, and is now given with immunotherapy.",
    summary: "Cisplatin or carboplatin with etoposide for 4 (extensive-stage) to 4-6 (limited-stage, with concurrent radiotherapy) cycles. Response rates 60-80% but relapse is near-universal in extensive-stage disease. Carboplatin is preferred with immunotherapy and in frailer patients; cisplatin with concurrent thoracic radiotherapy in fit limited-stage patients.",
    mechanism: "Platinum DNA crosslinks plus topoisomerase-II inhibition by etoposide.",
    mechanismSteps: ["Platinum forms intrastrand DNA crosslinks", "Etoposide traps topoisomerase II on DNA, causing double-strand breaks", "Rapidly dividing SCLC cells (near-universal RB1 and TP53 loss) cannot arrest and undergo apoptosis", "Surviving clones re-emerge within months, often with lineage plasticity"],
    dosing: { route: "Intravenous", schedule: "Carboplatin AUC 5 day 1 (or cisplatin 75 mg/m² day 1) + etoposide 100 mg/m² days 1-3, every 21 days, 4 cycles", modifications: "Dose reductions for neutropenia; G-CSF support with concurrent radiotherapy is avoided", monitoring: "Blood counts each cycle; renal function and hearing with cisplatin" },
    toxicity: [{ event: "Neutropenia (grade 3+)", grade3PlusPct: 40, note: "Range across trials 23-45%" }, { event: "Anaemia", anyGradePct: 40 }, { event: "Nausea", anyGradePct: 50 }, { event: "Alopecia", anyGradePct: 60 }],
    approvals: [{ region: "US", year: 1983, indication: "Etoposide approved for SCLC; platinum-etoposide became standard in the 1980s" }],
    technologies: ["cytotoxic-chemotherapy", "platinum", "topoisomerase-inhibitors"], cancers: ["sclc", "limited-stage-sclc", "extensive-stage-sclc", "extrapulmonary-nec"], trials: ["impower133", "caspian", "astrum-005"], terms: ["limited-extensive-stage"], links: [{ label: "Wikipedia", url: W("Etoposide") }] }),
  d({ id: "lurbinectedin", links: [{ label: "FDA label (DailyMed)", url: "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=Lurbinectedin" }], name: "Lurbinectedin", brand: "Zepzelca", code: "PM01183", modality: "Cytotoxic (transcription inhibitor)", status: "approved", wikipedia: W("Lurbinectedin"),
    tldr: "A marine-derived chemotherapy that jams cancer's gene-reading machinery, approved for relapsed small-cell lung cancer and, since 2025, as first-line maintenance with atezolizumab.",
    summary: "Accelerated approval June 2020 for metastatic SCLC after platinum (ORR 35%, DOR 5.3 months, basket phase 2). ATLANTIS (with doxorubicin) missed OS; IMforte (with atezolizumab as first-line maintenance) improved OS and PFS, leading to full approval on 2 October 2025. Also studied in the LAGOON second-line trial. Jazz Pharmaceuticals (US) and PharmaMar.",
    mechanism: "Binds the DNA minor groove at CG-rich promoters, stalls RNA polymerase II and triggers its degradation; also depletes tumour-associated macrophages.",
    mechanismSteps: ["Binds guanine in the DNA minor groove at active promoters", "Elongating RNA polymerase II stalls and is degraded", "Transcription-dependent double-strand breaks accumulate", "Cells with high transcriptional addiction (SCLC, TP53-mutant) die; macrophage depletion reduces immunosuppression"],
    dosing: { route: "Intravenous", schedule: "3.2 mg/m² over 60 minutes every 21 days (monotherapy); with atezolizumab 1200 mg in maintenance", modifications: "Delay and reduce for grade 3-4 neutropenia or hepatotoxicity", monitoring: "Blood counts and liver enzymes before each cycle", source: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2025/213702s004lbl.pdf" },
    toxicity: [{ event: "Neutropenia", anyGradePct: 71, grade3PlusPct: 46 }, { event: "Fatigue", anyGradePct: 77 }, { event: "Nausea", anyGradePct: 37 }, { event: "Transaminase increase", anyGradePct: 66 }],
    approvals: [{ region: "US", year: 2020, indication: "Metastatic SCLC after platinum chemotherapy (accelerated)" }, { region: "US", year: 2025, indication: "First-line maintenance with atezolizumab in ES-SCLC (full approval)" }, { region: "EU", year: 2026, indication: "Maintenance with atezolizumab in ES-SCLC after first-line induction; 29 May 2026" }],
    regulatoryEvents: [
      { date: "2020-06-15", type: "approval", region: "US", note: "Accelerated approval, second-line SCLC" },
      { date: "2025-10-02", type: "approval", region: "US", note: "Full approval with atezolizumab as first-line maintenance (IMforte)", source: "https://www.roche.com/media/releases/med-cor-2025-10-03b" },
    ],
    technologies: ["cytotoxic-chemotherapy"], companies: ["jazz", "pharmamar"], cancers: ["sclc", "extensive-stage-sclc"], trials: ["imforte", "atlantis", "nct07625644", "nct06801834", "nct06496048", "nct05652686", "nct05734066", "nct07155174", "nct07459634", "nct06088290"] }),
  d({ id: "topotecan", links: [{ label: "FDA label (DailyMed)", url: "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=Topotecan" }], name: "Topotecan", brand: "Hycamtin", modality: "Cytotoxic (topoisomerase-I inhibitor)", status: "approved", wikipedia: W("Topotecan"),
    tldr: "Topotecan is the long-standing second-line chemotherapy for relapsed small-cell lung cancer, and now the comparator that new drugs must beat.",
    summary: "Topotecan is a topoisomerase-I poison that stabilises the enzyme-DNA cleavage complex so replication forks break the DNA. Approved 1996 (IV) and 2007 (oral) for relapsed SCLC after platinum, it is given on days 1 to 5 of a 21-day cycle and also has roles in ovarian and cervical cancer. Activity is modest, with ORR around 20% and median OS around 6 to 8 months, and myelosuppression is heavy: grade 4 neutropenia in 70% of patients, so weekly blood counts and dose reductions are routine. It was the control arm in DeLLphi-304, where tarlatamab beat it with OS 13.6 versus 8.3 months, and is the comparator again in IDeate-Lung02; in ATLANTIS, lurbinectedin plus doxorubicin did not outperform it. Topotecan defines the floor for relapsed small-cell lung cancer, and new agents are judged by how far they rise above it.",
    mechanism: "Topoisomerase-I poison; stabilises the cleavage complex causing replication-associated DNA breaks.",
    mechanismSteps: ["Enters cell as active lactone", "Traps TOP1 on DNA", "Replication fork collision produces double-strand breaks", "Apoptosis in S-phase cells"],
    dosing: { route: "Intravenous or oral", schedule: "1.5 mg/m² IV days 1-5 every 21 days, or 2.3 mg/m² oral days 1-5", modifications: "Frequent dose reduction for neutropenia; renal dose adjustment", monitoring: "Weekly blood counts" },
    toxicity: [{ event: "Neutropenia (grade 4)", grade3PlusPct: 70 }, { event: "Thrombocytopenia (grade 4)", grade3PlusPct: 27 }, { event: "Anaemia", anyGradePct: 90 }, { event: "Diarrhoea (oral)", anyGradePct: 30 }],
    approvals: [{ region: "US", year: 1996, indication: "Relapsed SCLC (IV)" }, { region: "US", year: 2007, indication: "Relapsed SCLC (oral)" }],
    technologies: ["topoisomerase-inhibitors", "cytotoxic-chemotherapy"], cancers: ["sclc", "ovarian", "cervical", "extensive-stage-sclc"], trials: ["dellphi-304", "atlantis", "ideate-lung02", "nct06828354", "nct06801834", "nct06459180", "nct07604766", "nct06496048", "nct06619236", "nct06128837", "nct06500026", "nct03709680", "nct06449209", "nct07099898", "nct06679634", "nct07145333", "nct07286266"] }),
  d({ id: "serplulimab", links: [{ label: "FDA label (DailyMed)", url: "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=Serplulimab" }], name: "Serplulimab", brand: "Hansizhuang / Hetronifly", code: "HLX10", modality: "Monoclonal antibody (anti-PD-1)", status: "approved",
    tldr: "Serplulimab is a Chinese PD-1 antibody with the largest survival gain of any first-line small-cell lung cancer immunotherapy trial, approved in China, Europe, and the UK but not yet the US.",
    summary: "Serplulimab is a humanised IgG4 antibody against PD-1, given at 4.5 mg/kg every 3 weeks with carboplatin-etoposide and then as maintenance for up to 2 years. In ASTRUM-005 it produced OS 15.4 versus 10.9 months (HR 0.63) in extensive-stage SCLC, the largest survival gain among the first-line chemo-immunotherapy trials. It is approved in China (2022, the first PD-1 antibody for ES-SCLC), the EU (2025), the UK, India and Korea; Henlius develops it with Accord in Europe. In the US a bridging trial versus atezolizumab (ASTRIDE) has fully enrolled and the FDA decision is pending. Immune-related adverse events occurred in 37% of patients, with hypothyroidism in 12% and pneumonitis in 4%. It is a PD-1 drug whose data match or exceed the established Western options, but whose reach still depends on regulators outside China.",
    mechanism: "Humanised IgG4 anti-PD-1.",
    mechanismSteps: ["Binds PD-1 on exhausted T cells", "Blocks PD-L1/PD-L2 engagement", "Restores cytotoxic T-cell function against antigens released by chemotherapy"],
    dosing: { route: "Intravenous", schedule: "4.5 mg/kg every 3 weeks with carboplatin-etoposide, then maintenance until progression or 2 years" },
    toxicity: [{ event: "Immune-related adverse events (any)", anyGradePct: 37 }, { event: "Hypothyroidism", anyGradePct: 12 }, { event: "Pneumonitis", anyGradePct: 4 }],
    approvals: [{ region: "China", year: 2022, indication: "First-line ES-SCLC with chemotherapy" }, { region: "EU", year: 2025, indication: "First-line ES-SCLC with carboplatin-etoposide" }],
    regulatoryEvents: [{ date: "2025-02", type: "approval", region: "EU", note: "European Commission approval for ES-SCLC", source: "https://www.henlius.com/en/NewsDetails-5903-26.html" }, { date: "2025", type: "approval", region: "UK", note: "MHRA approval", source: "https://www.henlius.com/en/NewsDetails-5324-26.html" }],
    targets: ["pd1"], technologies: ["checkpoint-inhibitor"], companies: ["henlius"], cancers: ["sclc", "extensive-stage-sclc"], trials: ["astrum-005", "nct05353257", "nct04547166", "nct05468489", "nct07253142", "nct07269782", "nct06848699", "nct06349980", "nct05787613"], terms: ["limited-extensive-stage"] }),
];

// ======================= TECHNOLOGIES, TERMS, COMPANIES =======================
const technologies: TechnologyInput[] = [
  { id: "prophylactic-cranial-irradiation", trials: ["slotman-pci-es-sclc", "takahashi-pci"], kind: "technology", name: "Prophylactic cranial irradiation vs MRI surveillance", sections: ["radiation"], status: "established", asOf, wikipedia: W("Prophylactic_cranial_irradiation"),
    tldr: "Small-cell lung cancer spreads to the brain so often that doctors used to irradiate the whole brain pre-emptively. Regular MRI scans are now challenging that practice.",
    summary: "PCI (25 Gy in 10 fractions) reduced brain metastases and improved survival in limited-stage disease in the 1999 meta-analysis and in extensive-stage disease in the 2007 EORTC trial (which did not use MRI staging). A Japanese trial (Takahashi 2017) with MRI surveillance showed no survival benefit in extensive-stage disease. Hippocampal-avoidance PCI (PREMER, NRG CC003) reduces cognitive harm. The MAVERICK/SWOG S1827 trial of PCI versus MRI surveillance is the definitive test; results pending.",
    principle: "Whole-brain radiotherapy to sterilise micrometastases before they become symptomatic; MRI surveillance instead detects and treats them early with stereotactic radiosurgery.",
    strengths: ["Halves brain metastasis incidence", "Survival benefit in limited-stage disease with older staging"],
    limitations: ["Neurocognitive decline", "Benefit unclear when MRI surveillance is available", "Ongoing trial will settle the question"],
    cancers: ["sclc"], technologies: ["mri", "sbrt", "imrt-igrt"], terms: ["limited-extensive-stage"], links: [{ label: "Wikipedia", url: W("Prophylactic_cranial_irradiation") }] },
];

const terms: TermInput[] = [
];

const companies: CompanyInput[] = [
  { id: "pharmamar", trials: ["nct07644039", "nct06088290"], links: [{ label: "Official website", url: "https://pharmamar.com" }], kind: "company", name: "PharmaMar", hq: "Madrid", country: "ES", companyType: "biotech", website: "https://pharmamar.com", ticker: "PHM.MC", asOf, sections: ["chemotherapy"],
    tldr: "Spanish company that turns marine natural products into cancer drugs, including lurbinectedin and trabectedin.",
    summary: "PharmaMar, based in Madrid and listed as PHM.MC, is the Spanish company that turns marine natural products into cancer drugs, including lurbinectedin and trabectedin. It discovered lurbinectedin, sold as Zepzelca and partnered with Jazz in the United States, and trabectedin, sold as Yondelis, and the success of the IMforte trial in 2025 broadened lurbinectedin from relapsed small-cell lung cancer into first-line maintenance. OnCo links it to small-cell lung cancer, Ewing sarcoma and soft tissue sarcomas, and to the lurbinectedin drug record. Whether marine-derived transcription inhibitors can find further indications, or whether lurbinectedin remains its last major product, is the open question. Lurbinectedin has its own page.",
    drugs: ["lurbinectedin"], cancers: ["sclc", "sarcoma"] },
  { id: "henlius", links: [{ label: "Official website", url: "https://www.henlius.com" }], kind: "company", name: "Shanghai Henlius Biotech", hq: "Shanghai", country: "CN", companyType: "biotech", website: "https://www.henlius.com", ticker: "2696.HK", asOf, sections: ["immunotherapy"],
    tldr: "Chinese biosimilar and biologics company whose PD-1 antibody serplulimab is approved in China and Europe for small-cell lung cancer.",
    summary: "Shanghai Henlius Biotech, listed in Hong Kong as 2696.HK, is a Chinese biosimilar and biologics company whose PD-1 antibody serplulimab is approved in China and Europe for small-cell lung cancer. Serplulimab was proved in the ASTRUM-005 trial and received EU approvals in 2025 for extensive-stage small-cell lung cancer, squamous non-small-cell lung cancer and other indications, a US bridging trial has completed enrolment, and the company also sells trastuzumab and bevacizumab biosimilars. OnCo links it to small-cell lung cancer, to serplulimab and the trastuzumab biosimilars records, and to the bottleneck of regulatory divergence between regions. Whether a Chinese PD-1 antibody can gain US approval on a bridging study, having already won Europe, is the open question. Serplulimab and ASTRUM-005 have their own pages.",
    drugs: ["serplulimab", "trastuzumab-biosimilars", "hlx43", "hlx22", "hlx11", "hlx26"], cancers: ["sclc"], trials: ["astrum-005", "nct05353257", "nct04547166", "nct05468489", "nct06769152", "nct07253142", "nct07269782", "nct06848699", "nct06839066", "nct07294508", "nct06769113", "nct06349980", "nct07106892", "nct06812260", "nct06742892", "nct05787613", "nct06907615", "nct06832202"], tags: ["china"] },
];

const pairings: PairingInput[] = [
  { id: "chemo-io-then-maintenance-sclc", links: [{ label: "ClinicalTrials.gov NCT05091567: IMforte", url: "https://clinicaltrials.gov/study/NCT05091567" }, { label: "ClinicalTrials.gov NCT06211036: DeLLphi-305", url: "https://clinicaltrials.gov/study/NCT06211036" }], kind: "pairing", name: "Chemo-immunotherapy induction → maintenance intensification (SCLC)", a: "platinum-etoposide", b: "lurbinectedin", pairingType: "sequence", asOf,
    tldr: "Chemo-immunotherapy followed by maintenance in small-cell lung cancer gives four cycles of chemotherapy plus immunotherapy, then keeps the immunotherapy going and adds a second drug to hold the disease longer.",
    summary: "This sequence pairing in extensive-stage small-cell lung cancer follows four cycles of platinum plus etoposide with immunotherapy by a maintenance phase in which atezolizumab continues and lurbinectedin is added. The rationale is that the disease almost always relapses soon after induction, so attacking residual disease during the response window with a non-cross-resistant agent should delay relapse. The phase 3 IMforte trial showed that adding lurbinectedin to atezolizumab maintenance improved overall survival, leading to FDA approval in 2025, and DeLLphi-305 is testing tarlatamab in the same maintenance slot. Maintenance intensification is the first new first-line strategy in this cancer since chemo-immunotherapy itself.",
    rationale: "Extensive-stage SCLC almost always relapses within months of induction; targeting residual disease during the response window with a non-cross-resistant agent delays relapse.",
    evidence: "Phase 3 IMforte positive (2025, FDA approved); DeLLphi-305 pending.",
    drugs: ["lurbinectedin", "atezolizumab", "tarlatamab"], cancers: ["sclc"], trials: ["imforte", "dellphi-305"] },
  { id: "tarlatamab-vs-idxd-sequence", kind: "pairing", name: "Sequencing DLL3 engager and B7-H3 ADC in relapsed SCLC", a: "tarlatamab", b: "ifinatamab-deruxtecan", pairingType: "sequence", asOf,
    tldr: "Two new relapsed-disease options with different targets and mechanisms. Which comes first, and whether one works after the other, is unknown.",
    summary: "This sequencing question in relapsed small-cell lung cancer concerns tarlatamab, a DLL3-directed T-cell engager, and ifinatamab deruxtecan (I-DXd), a B7-H3-directed antibody-drug conjugate with a topoisomerase 1 payload. Tarlatamab has shown a survival benefit in DeLLphi-304, while I-DXd has produced high response rates and is in the phase 3 IDeate-Lung02 trial. Because the two drugs hit different antigens and kill by different mechanisms, they are expected not to be cross-resistant, and their toxicity profiles also differ, cytokine release syndrome for one and interstitial lung disease and neutropenia for the other, which could allow a patient-based choice. No prospective data yet say which should come first or whether one works after the other, so the pairing remains a concept.",
    rationale: "Distinct targets and killing mechanisms; toxicity profiles (CRS vs ILD/neutropenia) also differ, allowing patient-based choice.",
    evidence: "No prospective sequencing data; concept.",
    drugs: ["tarlatamab", "ifinatamab-deruxtecan"], cancers: ["sclc"], targets: ["dll3", "b7h3"] },
];

const ideas: IdeaInput[] = [
  { id: "idea-sclc-subtype-directed", links: [{ label: "DeLLphi-301: tarlatamab, a DLL3-targeting T-cell engager, in previously treated small-cell lung cancer (New England Journal of Medicine 2023)", url: "https://doi.org/10.1056/NEJMoa2307980" }, { label: "ClinicalTrials.gov NCT05740566: DeLLphi-304", url: "https://clinicaltrials.gov/study/NCT05740566" }], kind: "idea", name: "Subtype-directed therapy for SCLC (ASCL1 / NEUROD1 / POU2F3 / inflamed)", maturity: "preclinical-evidence", asOf,
    tldr: "Small-cell lung cancer is at least four diseases under the microscope's uniform appearance. Treat each by its transcription-factor subtype.",
    summary: "Small-cell lung cancer looks uniform under the microscope, but the Rudin and Gay classification splits it into transcription-factor subtypes: ASCL1-driven SCLC-A, which is DLL3-high and BCL-2 dependent, NEUROD1-driven SCLC-N, POU2F3-driven SCLC-P and the inflamed SCLC-I. The idea is to assign subtype prospectively by RNA or immunohistochemistry and treat each accordingly: tarlatamab for SCLC-A, immunotherapy for SCLC-I, Aurora kinase inhibitors for SCLC-N and PARP or ATR inhibitors for SCLC-P. The rationale is that these dependencies are reproducible in cell lines and xenografts, and a retrospective IMpower133 analysis suggested SCLC-I gained most from atezolizumab. The proposed test is a subtype-stratified umbrella trial in relapsed patients, and the evidence so far is preclinical.",
    hypothesis: "Prospective subtype assignment (RNA or IHC) will predict benefit: DLL3 engagers in SCLC-A, immunotherapy in SCLC-I, Aurora kinase inhibitors in SCLC-N, and PARP/ATR inhibitors in SCLC-P.",
    rationale: "Subtype-specific dependencies are reproducible in cell lines and PDX; DLL3 expression tracks ASCL1.",
    test: "Biomarker-stratified umbrella trial assigning relapsed patients by IHC subtype to tarlatamab, ATR inhibitor, Aurora A inhibitor, or chemo-immunotherapy.",
    cancers: ["sclc"], targets: ["dll3", "bcl2", "atr", "parp"], drugs: ["tarlatamab"] },
  { id: "idea-mri-surveillance-replaces-pci", links: [{ label: "Takahashi et al., Prophylactic cranial irradiation versus MRI observation in extensive-stage small-cell lung cancer (Lancet Oncology 2017)", url: "https://doi.org/10.1016/S1470-2045(17)30230-9" }], kind: "idea", name: "MRI surveillance replaces prophylactic cranial irradiation in SCLC", maturity: "being-tested-at-scale", asOf,
    tldr: "Instead of irradiating every patient's brain to prevent metastases, scan regularly and treat the few who develop them with focused radiation.",
    summary: "Rather than giving prophylactic cranial irradiation to every patient with small-cell lung cancer, this idea proposes MRI surveillance every three months with stereotactic radiosurgery reserved for the few who develop brain metastases. The rationale is that the benefit of PCI was shown before brain MRI was routine, and many patients irradiated would never have developed brain disease. The hypothesis is that surveillance with salvage SRS is non-inferior to PCI for overall survival and superior for cognition. A Japanese extensive-stage trial supports the approach, and the randomised SWOG S1827 MAVERICK trial of PCI versus MRI surveillance is the definitive test. Being tested at scale, it bears on the bottleneck of the brain as barrier and sanctuary.",
    hypothesis: "MRI surveillance every 3 months with salvage SRS is non-inferior to PCI for overall survival and superior for cognition.",
    rationale: "PCI's benefit was shown before routine brain MRI; many patients irradiated never develop brain disease.",
    test: "SWOG S1827 (MAVERICK), randomised PCI vs MRI surveillance, OS primary endpoint.",
    cancers: ["sclc"], technologies: ["prophylactic-cranial-irradiation", "mri", "sbrt"] },
];

const entities: EntityInput[] = [...trials, ...drugs, ...technologies, ...terms, ...companies, ...pairings, ...ideas];

const spike: Spike = {
  cancerId: "sclc",
  entities,
  patch: {
    asOf,
    summary: "Small-cell lung cancer is a high-grade neuroendocrine carcinoma, almost always caused by smoking, defined by near-universal loss of TP53 and RB1 and by explosive growth. It presents as extensive-stage disease in two thirds of patients, responds to chemotherapy in most, and relapses in almost all. For three decades the treatment was platinum-etoposide, thoracic radiotherapy for limited-stage disease, prophylactic cranial irradiation, and topotecan at relapse.\n\nThe field moved in three steps. First-line chemo-immunotherapy (IMpower133 2018, CASPIAN 2019, ASTRUM-005 2022) added two to five months of median survival and a small tail of long-term survivors. Consolidation durvalumab after chemoradiotherapy for limited-stage disease (ADRIATIC, approved December 2024) was the first curative-intent advance in 30 years, lifting median survival to nearly five years. In relapsed disease, tarlatamab, the DLL3 T-cell engager, became the first drug to beat chemotherapy on overall survival (DeLLphi-304; full FDA approval November 2025), and lurbinectedin plus atezolizumab became the first approved first-line maintenance regimen (IMforte, October 2025).\n\nWhat is next: maintenance intensification with tarlatamab (DeLLphi-305), the B7-H3 ADC ifinatamab deruxtecan in second line (IDeate-Lung02), alpha-emitting SSTR radioligands (RYZ101), subtype-directed therapy (ASCL1, NEUROD1, POU2F3, inflamed), bispecific and trispecific DLL3 engagers, and the settled question of whether MRI surveillance can replace prophylactic cranial irradiation. Screening remains limited to low-dose CT in smokers, which detects few small-cell cancers early.",
    burden: "Small-cell lung cancer makes up about 15% of lung cancers, roughly 250,000 cases a year worldwide, almost entirely in current or former smokers. Limited-stage disease is treated with curative intent and now with durvalumab consolidation. Median survival is nearly five years in limited-stage and about one year in extensive-stage disease.",
    subtypes: ["Limited-stage (one hemithorax, ~30%)", "Extensive-stage (~70%)", "SCLC-A (ASCL1-driven, DLL3-high; ~50%)", "SCLC-N (NEUROD1)", "SCLC-P (POU2F3, tuft-cell-like)", "SCLC-I (inflamed, IO-responsive)", "Transformed SCLC (from EGFR-mutant NSCLC under TKI)", "Combined small-cell / non-small-cell histology"],
    biomarkers: ["Stage (limited vs extensive) is the dominant decision", "DLL3 (not required for tarlatamab)", "B7-H3 (I-DXd trials)", "SSTR2 (RYZ101)", "Transcription-factor subtype (ASCL1/NEUROD1/POU2F3/YAP1, research)", "PD-L1 and TMB (not predictive in SCLC)", "SLFN11 (chemotherapy/PARP sensitivity, research)", "ctDNA (research)"],
    standardOfCare: [
      { setting: "Screening and diagnosis", approach: "Low-dose CT screening in heavy smokers finds some SCLC but stage shift is limited; diagnosis by bronchoscopic or CT-guided biopsy; staging with PET/CT and brain MRI.", refs: ["ct", "pet-ct", "mri"], guideline: { nccn: "SCLC guideline, staging workup", version: "NCCN SCLC v2.2026" } },
      { setting: "Very limited stage (T1-2 N0, ~5%)", approach: "Lobectomy with mediastinal node dissection or SBRT, followed by adjuvant platinum-etoposide; PCI or MRI surveillance.", refs: ["sbrt", "platinum-etoposide", "prophylactic-cranial-irradiation"], guideline: { nccn: "2A" } },
      { setting: "Limited stage", approach: "Concurrent cisplatin-etoposide with thoracic radiotherapy (45 Gy twice daily or 60-70 Gy once daily), then durvalumab consolidation up to 2 years (ADRIATIC); PCI or MRI surveillance.", refs: ["platinum-etoposide", "imrt-igrt", "durvalumab", "adriatic", "convert", "prophylactic-cranial-irradiation"], guideline: { nccn: "1 (durvalumab consolidation, category 1)", esmoMcbs: "A", version: "NCCN SCLC v2.2026" } },
      { setting: "Extensive stage, first line", approach: "Carboplatin-etoposide plus atezolizumab or durvalumab (4 cycles), then maintenance immunotherapy; lurbinectedin added to atezolizumab maintenance since 2025 (IMforte). Serplulimab-chemotherapy where approved. Consolidative thoracic radiotherapy for residual thoracic disease in good responders.", refs: ["platinum-etoposide", "atezolizumab", "durvalumab", "lurbinectedin", "impower133", "caspian", "imforte", "serplulimab"], guideline: { nccn: "1 (chemo-IO); 2A (lurbinectedin maintenance)", esmoMcbs: "3" } },
      { setting: "Relapsed, platinum-sensitive (≥90 days)", approach: "Tarlatamab (preferred, OS benefit); platinum-etoposide rechallenge; lurbinectedin; topotecan.", refs: ["tarlatamab", "dellphi-304", "lurbinectedin", "topotecan"], guideline: { nccn: "1 (tarlatamab)", esmoMcbs: "4" } },
      { setting: "Relapsed, platinum-resistant (<90 days)", approach: "Tarlatamab; lurbinectedin; topotecan; clinical trials (I-DXd, RYZ101, DLL3 bispecifics).", refs: ["tarlatamab", "lurbinectedin", "topotecan", "ifinatamab-deruxtecan", "ideate-lung02", "ryz101"], guideline: { nccn: "1 (tarlatamab)" } },
      { setting: "Brain metastases", approach: "Whole-brain radiotherapy or, increasingly, stereotactic radiosurgery for limited numbers of lesions; PCI decisions individualised.", refs: ["sbrt", "prophylactic-cranial-irradiation", "mri"] },
      { setting: "Transformed SCLC (from EGFR-mutant NSCLC)", approach: "Platinum-etoposide, often with continued EGFR TKI; immunotherapy benefit uncertain; trials.", refs: ["platinum-etoposide", "osimertinib"] },
    ],
    stateOfArt: [
      "Limited-stage: chemoradiation followed by durvalumab consolidation (ADRIATIC), median OS approaching five years.",
      "Extensive-stage first line: chemo-immunotherapy, now with lurbinectedin-atezolizumab maintenance (IMforte, 2025).",
      "Relapse: tarlatamab (DLL3×CD3) improved OS over chemotherapy (DeLLphi-304) and received full approval in November 2025.",
      "B7-H3 ADC ifinatamab deruxtecan and alpha-emitting SSTR radioligand RYZ101 are in phase 3.",
      "MRI surveillance is displacing prophylactic cranial irradiation while the definitive trial (SWOG S1827) reads out.",
      "Molecular subtypes (A/N/P/I) explain heterogeneity and are moving toward prospective use.",
    ],
    history: [
      { year: 1973, title: "VA Lung Study Group defines limited vs extensive stage", refs: ["limited-extensive-stage"] },
      { year: 1985, title: "Platinum-etoposide becomes the standard regimen", refs: ["platinum-etoposide"] },
      { year: 1992, title: "Meta-analysis: thoracic radiotherapy improves survival in limited-stage disease", refs: ["imrt-igrt"] },
      { year: 1999, title: "Prophylactic cranial irradiation improves survival in complete responders", refs: ["prophylactic-cranial-irradiation"] },
      { year: 1999, title: "Twice-daily 45 Gy (Turrisi) sets the limited-stage radiotherapy standard", refs: ["imrt-igrt"] },
      { year: 1996, title: "Topotecan approved for relapsed disease", refs: ["topotecan"] },
      { year: 2017, title: "CONVERT: once-daily 66 Gy not superior to twice-daily 45 Gy", refs: ["convert"] },
      { year: 2017, title: "Japanese trial: PCI gives no survival benefit in extensive-stage disease with MRI surveillance", refs: ["prophylactic-cranial-irradiation"] },
      { year: 2018, title: "IMpower133: first survival gain in decades with atezolizumab", refs: ["impower133", "atezolizumab"] },
      { year: 2019, title: "Rovalpituzumab tesirine (first DLL3 ADC) fails", refs: ["dll3"] },
      { year: 2019, title: "CASPIAN confirms chemo-immunotherapy with durvalumab", refs: ["caspian", "durvalumab"] },
      { year: 2020, title: "Lurbinectedin accelerated approval in relapsed SCLC", refs: ["lurbinectedin"] },
      { year: 2021, title: "SCLC molecular subtypes (A, N, P, I) proposed", refs: ["idea-sclc-subtype-directed"] },
      { year: 2024, title: "Tarlatamab accelerated approval; ADRIATIC changes limited-stage care", refs: ["tarlatamab", "adriatic"] },
      { year: 2025, title: "DeLLphi-304 OS benefit and full approval of tarlatamab; IMforte maintenance approved", refs: ["dellphi-304", "imforte", "lurbinectedin"] },
      { year: 2026, title: "Phase 3 readouts pending for I-DXd and tarlatamab maintenance", refs: ["ideate-lung02", "dellphi-305"] },
    ],
    pipeline: ["dellphi-305", "ideate-lung02", "ifinatamab-deruxtecan", "ryz101", "serplulimab", "lurbinectedin", "idea-sclc-subtype-directed", "idea-mri-surveillance-replaces-pci", "prophylactic-cranial-irradiation", "tarlatamab-vs-idxd-sequence", "chemo-io-then-maintenance-sclc", "t-cell-engager", "targeted-alpha-therapy"],
    openProblems: [
      "Extensive-stage disease almost always relapses after first-line therapy, so maintenance (lurbinectedin-atezolizumab, tarlatamab) is the current lever; median survival is still barely over a year.",
      "No validated predictive biomarker for immunotherapy benefit; PD-L1 and TMB do not work in SCLC.",
      "Sequencing of tarlatamab, I-DXd, lurbinectedin, and platinum rechallenge is untested.",
      "Cytokine release syndrome and neurotoxicity of T-cell engagers require inpatient step-up dosing that many community centres cannot provide.",
      "Prophylactic cranial irradiation versus MRI surveillance remains unresolved until SWOG S1827 reads out.",
      "Transformed SCLC arising from EGFR-mutant NSCLC has no dedicated evidence base.",
      "Screening rarely catches SCLC early; prevention is tobacco control.",
      "Trials rarely enrol patients with poor performance status, who are common in this disease.",
    ],
    targets: ["dll3", "b7h3", "sstr2", "pdl1", "pd1", "tp53", "bcl2", "atr", "parp"],
    technologies: ["t-cell-engager", "adc", "checkpoint-inhibitor", "targeted-alpha-therapy", "cytotoxic-chemotherapy", "imrt-igrt", "sbrt", "prophylactic-cranial-irradiation", "mri"],
    pathways: ["p53-cell-cycle", "apoptosis-bcl2", "pd1-checkpoint"],
    companies: ["amgen", "roche-genentech", "astrazeneca", "daiichi-sankyo", "merck", "jazz", "pharmamar", "henlius", "bms"],
    terms: ["limited-extensive-stage", "crs", "os", "pfs"],
    institutions: ["mskcc", "md-anderson", "dana-farber", "gustave-roussy"],
    links: [{ label: "NCI PDQ: small cell lung cancer treatment", url: "https://www.cancer.gov/types/lung/hp/small-cell-lung-treatment-pdq" }, { label: "IASLC: tarlatamab first-line maintenance data", url: "https://www.iaslc.org/iaslc-news/press-release/tarlatamab-anti-pd-l1-first-line-maintenance-after-chemo-immunotherapy-es" }],
  },
};

export default spike;

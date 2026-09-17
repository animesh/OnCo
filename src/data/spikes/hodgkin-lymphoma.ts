import type { EntityInput, IdeaInput, PairingInput, TargetInput, TechnologyInput, TermInput, TrialInput } from "@/lib/schema";
import type { Spike } from "./index";

/**
 * HODGKIN LYMPHOMA SPIKE. Adds the CD30 target, PET-adapted therapy, the Deauville score, landmark trials with
 * structured outcomes, pairings and ideas, and patches `hodgkin-lymphoma` to TNBC depth. Facts checked 2026-09-07.
 * References doxorubicin (sarcoma spike) and autologous-stem-cell-transplant (myeloma spike).
 */
const asOf = "2026-09-07";
const W = (s: string) => `https://en.wikipedia.org/wiki/${s}`;
const ct = (nct: string) => ({ label: `ClinicalTrials.gov ${nct}`, url: `https://clinicaltrials.gov/study/${nct}` });

const t = (x: Omit<TrialInput, "kind" | "asOf">): TrialInput => ({ kind: "trial", asOf, ...x });
const tg = (x: Omit<TargetInput, "kind" | "asOf">): TargetInput => ({ kind: "target", asOf, ...x });
const tech = (x: Omit<TechnologyInput, "kind" | "asOf">): TechnologyInput => ({ kind: "technology", asOf, ...x });
const term = (x: Omit<TermInput, "kind" | "asOf">): TermInput => ({ kind: "term", asOf, ...x });
const idea = (x: Omit<IdeaInput, "kind" | "asOf">): IdeaInput => ({ kind: "idea", asOf, ...x });
const pair = (x: Omit<PairingInput, "kind" | "asOf">): PairingInput => ({ kind: "pairing", asOf, ...x });

// ======================= TARGETS =======================
const targets: TargetInput[] = [
  tg({ id: "cd30", name: "CD30", symbol: "TNFRSF8", targetClass: "surface-antigen", wikipedia: W("CD30"),
    tldr: "CD30 is a protein on the malignant Reed-Sternberg cells of Hodgkin lymphoma and on some T-cell lymphomas, and the address for the ADC brentuximab vedotin.",
    summary: "TNF-receptor family member expressed on activated lymphocytes and near-universally on Hodgkin Reed-Sternberg cells, anaplastic large-cell lymphoma, and subsets of peripheral T-cell lymphoma and DLBCL. Brentuximab vedotin (2011) validated it; CD30 CAR-T (phase 1/2, ~60-70% ORR in relapsed Hodgkin) and CD30 bispecifics are in trials. Expression level does not predict brentuximab response well.",
    biology: "Signals via TRAF proteins to NF-κB; shed soluble CD30 is a serum marker. Sparse normal expression outside activated T and B cells.",
    whereFound: ["Classical Hodgkin lymphoma (~100%)", "Anaplastic large-cell lymphoma", "Peripheral T-cell lymphoma (subset)", "Primary mediastinal B-cell lymphoma", "Embryonal carcinoma"],
    prevalence: [
      { cancerId: "hodgkin-lymphoma", pct: 100, measure: "IHC; CD30 is a defining feature of Hodgkin Reed-Sternberg cells", source: "https://doi.org/10.1182/blood-2012-10-461848", note: "Hu 2013 (Blood); classical Hodgkin lymphoma is CD30-positive by definition" },
      { cancerId: "dlbcl", pct: 14, measure: "IHC, CD30 in 903 de novo DLBCL", source: "https://doi.org/10.1182/blood-2012-10-461848", note: "Hu 2013; CD30-positive DLBCL had better outcome and a distinct gene-expression signature" },
    ],
    cancers: ["hodgkin-lymphoma", "dlbcl"], drugs: ["brentuximab-vedotin", "eb-car30-nk"], tags: ["adc-target"], links: [{ label: "Wikipedia", url: W("CD30") }] }),
];

// ======================= TECHNOLOGIES / TERMS =======================
const technologies: TechnologyInput[] = [
  tech({ id: "pet-adapted-therapy", links: [{ label: "ClinicalTrials.gov NCT05675410: AHOD2131 (COG / NCTN)", url: "https://clinicaltrials.gov/study/NCT05675410" }, { label: "ClinicalTrials.gov NCT02661503: GHSG HD21", url: "https://clinicaltrials.gov/study/NCT02661503" }], name: "PET-adapted (response-adapted) therapy", sections: ["imaging", "chemotherapy"], status: "standard-of-care", since: 2016,
    tldr: "Scan after two cycles of chemotherapy; if the tumour has gone dark, give less treatment, and if not, give more. Hodgkin lymphoma pioneered this.",
    summary: "Interim FDG-PET after cycle 2 (PET2) scored on the Deauville scale steers escalation or de-escalation: RATHL (omit bleomycin if PET2-negative, no loss of efficacy), HD18 (shorten escalated BEACOPP), HD16/HD17 and RAPID (omit radiotherapy in early stage if PET-negative, at a small PFS cost), and HD21/S1826 (PET-guided consolidation). Being extended to DLBCL and to ctDNA-adapted designs.",
    principle: "FDG-PET measures metabolic response early; Deauville ≥4 at PET2 predicts failure, allowing therapy to be tailored before completion.",
    strengths: ["Spares most patients bleomycin, radiation or intensified chemotherapy", "Identifies the minority who need escalation"],
    limitations: ["Interim PET has imperfect positive predictive value (many PET2-positive patients are cured anyway)", "Omitting radiotherapy trades a few percent PFS for late-toxicity avoidance"],
    cancers: ["hodgkin-lymphoma", "dlbcl"], technologies: ["fdg-pet", "pet-ct"], terms: ["deauville-score"] }),
];

const terms: TermInput[] = [
  term({ id: "deauville-score", name: "Deauville five-point scale", category: "Imaging", wikipedia: W("Deauville_Criteria"),
    tldr: "A 1-to-5 score for how bright a lymphoma looks on PET compared with the liver; 1-3 is considered a complete metabolic response.",
    summary: "1: no uptake; 2: ≤ mediastinum; 3: > mediastinum but ≤ liver; 4: moderately > liver; 5: markedly > liver or new lesions. Adopted in the Lugano classification (2014); the decision point in PET-adapted Hodgkin and DLBCL trials. Inter-reader agreement is good at the extremes and weaker for score 3 vs 4.",
    cancers: ["hodgkin-lymphoma", "dlbcl"], technologies: ["fdg-pet", "pet-adapted-therapy"], links: [{ label: "Cheson et al., Lugano classification: recommendations for initial evaluation, staging and response assessment of Hodgkin and non-Hodgkin lymphoma (Journal of Clinical Oncology 2014)", url: "https://doi.org/10.1200/JCO.2013.54.8800" }] }),
  term({ id: "reed-sternberg-cell", aka: ["Reed-Sternberg cells"], name: "Reed-Sternberg cell", category: "Biology", wikipedia: W("Reed–Sternberg_cell"),
    tldr: "The Reed-Sternberg cell is the giant, often two-nucleus cancer cell of Hodgkin lymphoma; it makes up only about 1% of the tumour, and the rest is immune cells it has recruited.",
    summary: "Crippled germinal-centre B cells that have lost their B-cell programme, express CD30 and CD15, carry 9p24.1 (PD-L1/PD-L2) amplification in most cases, and are often EBV-positive. Their dependence on PD-L1 explains why Hodgkin lymphoma is the most checkpoint-inhibitor-responsive cancer (ORR ~70% for nivolumab or pembrolizumab in relapse).",
    cancers: ["hodgkin-lymphoma"], targets: ["cd30", "pdl1"], links: [{ label: "Wikipedia", url: W("Reed–Sternberg_cell") }] }),
];

// ======================= TRIALS =======================
const trials: TrialInput[] = [
  t({ id: "echelon-1", name: "ECHELON-1", nct: "NCT01712490", phase: "3", status: "positive", yearReported: 2017, sponsor: "Seagen / Takeda", enrolled: 1334,
    setting: "Untreated stage III-IV classical Hodgkin lymphoma: brentuximab vedotin + AVD vs ABVD",
    tldr: "Swapping bleomycin for the CD30 ADC in first-line chemotherapy improved survival in advanced Hodgkin lymphoma, the first frontline survival gain in decades.",
    summary: "ECHELON-1, trial NCT01712490 sponsored by Seagen and Takeda and reported in 2017 with six-year survival in the New England Journal of Medicine in 2022, showed that swapping bleomycin for the CD30 antibody-drug conjugate brentuximab vedotin in first-line chemotherapy for advanced Hodgkin lymphoma improves survival, the first frontline survival gain in decades. It randomised 1,334 patients with stage III to IV disease to brentuximab plus AVD or ABVD, met its primary modified progression-free survival endpoint and later showed an overall survival benefit, with more neuropathy and neutropenia but less lung toxicity, leading to approval in March 2018. OnCo links it to Hodgkin lymphoma, ADCs, CD30 as a target, brentuximab vedotin, Joseph M. Connors, the bleomycin caution pairing and the ECHELON-1 and S1826 papers. Whether brentuximab keeps a frontline role after S1826 is the open question.",
    result: "6-year OS 93.9% vs 89.4%, HR 0.59.",
    outcomes: [
      { endpoint: "Overall survival at 6 years", unit: "%", arms: [{ name: "BV-AVD", n: 664, value: 93.9 }, { name: "ABVD", n: 670, value: 89.4 }], hr: 0.59, ci: [0.40, 0.88], p: "0.009", source: "https://www.nejm.org/doi/full/10.1056/NEJMoa2206125" },
      { endpoint: "Modified PFS at 2 years", primary: true, unit: "%", arms: [{ name: "BV-AVD", value: 82.1 }, { name: "ABVD", value: 77.2 }], hr: 0.77, ci: [0.60, 0.98], source: "https://www.nejm.org/doi/full/10.1056/NEJMoa1708984" },
    ],
    replication: "SWOG S1826 used BV-AVD as its control and found nivolumab-AVD superior; ECHELON-1's OS benefit stands as the comparator.",
    drugs: ["brentuximab-vedotin", "doxorubicin"], cancers: ["hodgkin-lymphoma"], targets: ["cd30"], technologies: ["adc"], links: [ct("NCT01712490")], people: ["joseph-connors"] }),
  t({ id: "swog-s1826", name: "SWOG S1826", nct: "NCT03907488", phase: "3", status: "positive", yearReported: 2023, sponsor: "SWOG / NCI (with COG)", enrolled: 994,
    setting: "Untreated stage III-IV classical Hodgkin lymphoma, age ≥12: nivolumab + AVD vs brentuximab vedotin + AVD",
    tldr: "Immunotherapy plus chemotherapy beat the previous best regimen with far less nerve damage, in the first Hodgkin trial to enrol children and adults together; approved March 2026.",
    summary: "1-year PFS 94% vs 86%; 2-year PFS 92% vs 83% (HR 0.45, NEJM 2024). Peripheral neuropathy 28.1% vs 54.2%; fewer treatment discontinuations. Radiotherapy given to <1%. FDA approval 20 March 2026 for ages 12+. Now the frontline standard for advanced-stage disease in North America; HD21's BrECADD is the European alternative.",
    result: "2-year PFS 92% vs 83%, HR 0.45.",
    outcomes: [
      { endpoint: "Progression-free survival at 2 years", primary: true, unit: "%", arms: [{ name: "Nivolumab-AVD", n: 489, value: 92 }, { name: "BV-AVD", n: 487, value: 83 }], hr: 0.45, ci: [0.30, 0.65], p: "<0.001", source: "https://www.nejm.org/doi/full/10.1056/NEJMoa2405888" },
      { endpoint: "Any-grade peripheral neuropathy", unit: "%", arms: [{ name: "Nivolumab-AVD", value: 28.1 }, { name: "BV-AVD", value: 54.2 }], source: "https://doi.org/10.1056/NEJMoa2405888" },
    ],
    replication: "Consistent with phase 2 N-AVD data (CheckMate 205 cohort D) and with pembrolizumab-AVD single-arm studies; no second randomised trial yet.",
    drugs: ["nivolumab", "brentuximab-vedotin", "doxorubicin"], cancers: ["hodgkin-lymphoma"], targets: ["pd1"], technologies: ["checkpoint-inhibitor"], institutions: ["swog", "childrens-oncology-group"], links: [ct("NCT03907488"), { label: "FDA approval (Mar 2026)", url: "https://www.targetedonc.com/view/fda-approves-nivolumab-plus-avd-for-classical-hodgkin-lymphoma" }], people: ["kara-kelly", "alex-herrera"], related: ["src-targeted-oncology"] }),
  t({ id: "hd21", name: "GHSG HD21", nct: "NCT02661503", phase: "3", status: "positive", yearReported: 2024, sponsor: "German Hodgkin Study Group", enrolled: 1500,
    setting: "Untreated advanced-stage classical Hodgkin lymphoma, age 18-60: PET-guided BrECADD vs escalated BEACOPP",
    tldr: "A new brentuximab-based intensive regimen matched Europe's most effective (and most toxic) chemotherapy with far fewer side effects.",
    summary: "GHSG HD21, trial NCT02661503 sponsored by the German Hodgkin Study Group and published in the Lancet in 2024, showed that a new brentuximab-based intensive regimen, BrECADD, matched and then beat escalated BEACOPP, Europe's most effective and most toxic chemotherapy for advanced Hodgkin lymphoma, with far fewer side effects. It randomised about 1,500 patients aged 18 to 60 to PET-guided BrECADD or escalated BEACOPP for four to six cycles, met non-inferiority and then superiority on progression-free survival at four and five years, and reduced treatment-related morbidity while preserving fertility markers. OnCo links it to Hodgkin lymphoma, PET-adapted therapy, brentuximab vedotin, Peter Borchmann, the German Hodgkin Study Group and the ECHELON-1 and S1826 papers. Whether an intensive regimen is still needed when nivolumab-AVD has performed so well is the open question.",
    result: "4-year PFS 94.3% vs 90.9%, HR 0.66; less toxicity.",
    outcomes: [{ endpoint: "Progression-free survival at 4 years", primary: true, unit: "%", arms: [{ name: "BrECADD", n: 742, value: 94.3 }, { name: "eBEACOPP", n: 740, value: 90.9 }], hr: 0.66, ci: [0.45, 0.97], source: "https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(24)01315-1/fulltext" }, { endpoint: "Treatment-related morbidity", unit: "%", arms: [{ name: "BrECADD", value: 42 }, { name: "eBEACOPP", value: 59 }], source: "https://doi.org/10.1016/S0140-6736(24)01315-1" }],
    drugs: ["brentuximab-vedotin", "doxorubicin"], cancers: ["hodgkin-lymphoma"], technologies: ["pet-adapted-therapy"], institutions: ["gbg"], links: [ct("NCT02661503")], people: ["peter-borchmann"] }),
  t({ id: "rathl", name: "RATHL", nct: "NCT00678327", phase: "3", status: "positive", yearReported: 2016, sponsor: "UK NCRI / Cancer Research UK", enrolled: 1214,
    setting: "Advanced Hodgkin lymphoma: interim-PET-guided omission of bleomycin (AVD) vs continued ABVD",
    tldr: "Showed that patients whose PET scan is clear after two cycles can safely drop bleomycin and its lung toxicity.",
    summary: "RATHL, trial NCT00678327 sponsored by the UK NCRI and Cancer Research UK and published in the New England Journal of Medicine in 2016, showed that patients with advanced Hodgkin lymphoma whose PET scan is clear after two cycles can safely drop bleomycin and its lung toxicity. It enrolled 1,214 patients, randomised those with a negative interim PET to continue ABVD or switch to AVD, met its non-inferiority endpoint on progression-free survival with fewer pulmonary events, and escalated PET-positive patients to BEACOPP. OnCo links it to Hodgkin lymphoma, PET-adapted therapy, FDG PET, the Deauville scale term, Cancer Research UK, Peter Johnson and the bleomycin caution pairing, and it is concordant with GHSG HD18. It established interim PET as a treatment-steering tool, and whether PET can guide even deeper de-escalation is the open question.",
    result: "3-year PFS 85.7% (ABVD) vs 84.4% (AVD); bleomycin safely omitted.",
    outcomes: [{ endpoint: "Progression-free survival at 3 years (PET2-negative)", primary: true, unit: "%", arms: [{ name: "ABVD", n: 470, value: 85.7 }, { name: "AVD", n: 465, value: 84.4 }], source: "https://www.nejm.org/doi/full/10.1056/NEJMoa1510093" }],
    replication: "Concordant with GHSG HD18 (shortened BEACOPP after negative PET2).",
    cancers: ["hodgkin-lymphoma"], technologies: ["pet-adapted-therapy", "fdg-pet"], terms: ["deauville-score"], institutions: ["cruk"], links: [ct("NCT00678327")], people: ["peter-johnson"] }),
  t({ id: "keynote-204", name: "KEYNOTE-204", nct: "NCT02684292", phase: "3", status: "positive", yearReported: 2020, sponsor: "Merck", enrolled: 304,
    setting: "Relapsed/refractory classical Hodgkin lymphoma: pembrolizumab vs brentuximab vedotin",
    tldr: "In KEYNOTE-204, PD-1 blockade beat the CD30 ADC head to head in relapsed Hodgkin lymphoma.",
    summary: "KEYNOTE-204, trial NCT02684292 sponsored by Merck and published in Lancet Oncology in 2021, showed that PD-1 blockade with pembrolizumab beats the CD30 antibody-drug conjugate brentuximab vedotin head to head in relapsed or refractory classical Hodgkin lymphoma. It randomised 304 patients and met its primary progression-free survival endpoint with a clear advantage, leading to approval in October 2020 for relapse after at least one line in adults and at least two in children. OnCo links it to Hodgkin lymphoma, pembrolizumab and brentuximab vedotin. Whether the two drugs are better used in sequence or in combination, and which should come first, is the open question.",
    result: "PFS 13.2 vs 8.3 months, HR 0.65.",
    outcomes: [{ endpoint: "Progression-free survival (median)", primary: true, unit: "months", arms: [{ name: "Pembrolizumab", n: 151, value: 13.2 }, { name: "Brentuximab vedotin", n: 153, value: 8.3 }], hr: 0.65, ci: [0.48, 0.88], p: "0.0027", source: "https://www.thelancet.com/journals/lanonc/article/PIIS1470-2045(21)00005-X/fulltext" }],
    drugs: ["pembrolizumab", "brentuximab-vedotin"], cancers: ["hodgkin-lymphoma"], links: [ct("NCT02684292")] }),
  t({ id: "checkmate-205", name: "CheckMate 205", nct: "NCT02181738", phase: "2", status: "positive", yearReported: 2016, sponsor: "BMS", enrolled: 243,
    setting: "Relapsed/refractory classical Hodgkin lymphoma after autologous transplant: nivolumab (cohorts A-C); cohort D nivolumab-AVD frontline",
    tldr: "Established PD-1 blockade in relapsed Hodgkin lymphoma with ~70% response rates and seeded the frontline nivolumab-AVD idea.",
    summary: "CheckMate 205, trial NCT02181738 sponsored by Bristol Myers Squibb and reported in 2016, established PD-1 blockade with nivolumab in relapsed or refractory classical Hodgkin lymphoma after autologous transplant, with responses in about seventy percent of patients, and seeded the frontline nivolumab-AVD idea. Across 243 patients in cohorts A to C the response rate was 69 percent with complete responses in 16 percent and durable progression-free intervals, leading to accelerated approval in May 2016, while cohort D tested nivolumab-AVD in the frontline with very high complete response rates, the basis for SWOG S1826. OnCo links it to Hodgkin lymphoma, nivolumab and the pairing of PD-1 blockade with AVD chemotherapy. Whether PD-1 blockade can replace chemotherapy entirely in some patients is the question its cohort D opened.",
    result: "ORR 69%.",
    outcomes: [{ endpoint: "Objective response rate", primary: true, unit: "%", arms: [{ name: "Nivolumab", n: 243, value: 69 }], source: "https://doi.org/10.1200/JCO.2017.76.0793" }],
    drugs: ["nivolumab"], cancers: ["hodgkin-lymphoma"], links: [ct("NCT02181738")] }),
  t({ id: "ahod2131", name: "AHOD2131 (COG / NCTN)", nct: "NCT05675410", phase: "3", status: "recruiting", sponsor: "Children's Oncology Group / NCI",
    setting: "Newly diagnosed stage I-II classical Hodgkin lymphoma, age 5-60: standard therapy vs brentuximab vedotin + nivolumab (response-adapted), with or without radiation",
    tldr: "Asks whether early-stage Hodgkin lymphoma in children and adults can be treated with immunotherapy instead of some chemotherapy and radiation.",
    summary: "AHOD2131, trial NCT05675410 run by the Children's Oncology Group and the NCI, asks whether early-stage classical Hodgkin lymphoma in children and adults aged 5 to 60 can be treated with brentuximab vedotin plus nivolumab in a response-adapted design, instead of some chemotherapy and radiation. It uses PET after two cycles to steer therapy, has progression-free survival as its primary endpoint, measures late effects, and is ongoing with no results yet. OnCo links it to Hodgkin lymphoma, PET-adapted therapy, brentuximab vedotin, nivolumab, the Children's Oncology Group, Kara M. Kelly, the idea of chemotherapy-free early-stage Hodgkin treatment and the S1826 paper. Whether immunotherapy can spare young patients the late effects of chemotherapy and radiation without losing cures is the question it exists to answer.",
    drugs: ["brentuximab-vedotin", "nivolumab"], cancers: ["hodgkin-lymphoma"], technologies: ["pet-adapted-therapy"], institutions: ["childrens-oncology-group"], links: [ct("NCT05675410")], people: ["kara-kelly"] }),
  t({ id: "aethera", name: "AETHERA", nct: "NCT01100502", phase: "3", status: "positive", yearReported: 2015, sponsor: "Seagen", enrolled: 329,
    setting: "High-risk Hodgkin lymphoma after autologous transplant: brentuximab vedotin consolidation vs placebo",
    tldr: "In AETHERA, a year of the CD30 ADC after transplant halved relapse risk in high-risk patients.",
    summary: "AETHERA, trial NCT01100502 sponsored by Seagen and published in the Lancet in 2015, showed that a year of the CD30 antibody-drug conjugate brentuximab vedotin after autologous transplant halved the risk of relapse in high-risk Hodgkin lymphoma. It randomised 329 patients to brentuximab consolidation or placebo and met its primary progression-free survival endpoint with a large effect, while overall survival did not differ because of crossover, leading to approval in August 2015 as post-transplant consolidation. OnCo links it to Hodgkin lymphoma, autologous transplant and brentuximab vedotin. Now that brentuximab and PD-1 blockade are used before transplant, whether consolidation still adds anything is the open question.",
    result: "PFS HR 0.57.",
    outcomes: [{ endpoint: "Progression-free survival (median)", primary: true, unit: "months", arms: [{ name: "Brentuximab vedotin", n: 165, value: 42.9 }, { name: "Placebo", n: 164, value: 24.1 }], hr: 0.57, ci: [0.40, 0.81], source: "https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(15)60165-9/fulltext" }],
    drugs: ["brentuximab-vedotin"], cancers: ["hodgkin-lymphoma"], technologies: ["autologous-stem-cell-transplant"], links: [ct("NCT01100502")] }),
];

// ======================= PAIRINGS / IDEAS =======================
const pairings: PairingInput[] = [
  pair({ id: "pd1-plus-avd-hodgkin", links: [{ label: "ClinicalTrials.gov NCT03907488: SWOG S1826", url: "https://clinicaltrials.gov/study/NCT03907488" }, { label: "ClinicalTrials.gov NCT02181738: CheckMate 205", url: "https://clinicaltrials.gov/study/NCT02181738" }], name: "PD-1 blockade + AVD chemotherapy", a: "nivolumab", b: "doxorubicin", pairingType: "combination",
    tldr: "Immunotherapy given alongside standard chemotherapy from day one cures more advanced Hodgkin lymphoma with less nerve damage.",
    summary: "Giving nivolumab alongside AVD chemotherapy, whose anthracycline component is doxorubicin, from the first cycle is a combination pairing for advanced-stage classical Hodgkin lymphoma. Reed-Sternberg cells carry amplification of the PD-L1 locus at 9p24.1 and depend on immune evasion, so chemotherapy debulks the disease while PD-1 blockade engages the abundant reactive T cells already present in the tumour. In the phase 3 SWOG S1826 trial nivolumab-AVD improved progression-free survival compared with brentuximab vedotin-AVD and caused much less peripheral neuropathy, and the regimen was approved in March 2026 for patients aged 12 and over. Supporting phase 2 evidence comes from cohort D of CheckMate 205, and the linked S1826 paper covers adolescents and adults.",
    rationale: "Reed-Sternberg cells are PD-L1-amplified (9p24.1) and immune-dependent; chemotherapy debulks while PD-1 blockade engages the abundant reactive T cells in the tumour.",
    evidence: "Phase 3 (S1826) positive; phase 2 CheckMate 205 cohort D.",
    cancers: ["hodgkin-lymphoma"], trials: ["swog-s1826", "checkmate-205"] }),
  pair({ id: "bleomycin-omission-caution", links: [{ label: "ClinicalTrials.gov NCT00678327: RATHL", url: "https://clinicaltrials.gov/study/NCT00678327" }, { label: "ClinicalTrials.gov NCT01712490: ECHELON-1", url: "https://clinicaltrials.gov/study/NCT01712490" }], name: "Caution: bleomycin lung toxicity, especially with brentuximab or G-CSF", a: "brentuximab-vedotin", b: "pet-adapted-therapy", pairingType: "caution",
    tldr: "Bleomycin scars the lungs; combining it with brentuximab was fatal in early trials, and PET-adapted therapy now lets most patients skip it.",
    summary: "Bleomycin scars the lungs, and this caution pairing warns that the risk is compounded when it is combined with brentuximab vedotin or given alongside G-CSF. In the phase 1 study of brentuximab plus ABVD, pulmonary toxicity was frequent and some patients died, so the phase 3 ECHELON-1 trial dropped bleomycin and used brentuximab with AVD. The RATHL trial showed that bleomycin can be omitted after a negative interim PET scan, so PET-adapted therapy now lets most patients with Hodgkin lymphoma avoid it; the rationale is additive pneumotoxicity and the small contribution bleomycin makes once PET2 is negative. Toxicity also rises with age, renal impairment, G-CSF and oxygen exposure, and the record is also linked from the record on germ cell tumours of childhood and adolescence.",
    rationale: "Additive pneumotoxicity; bleomycin adds little efficacy once PET2 is negative.",
    evidence: "Phase 1 toxicity signal; RATHL phase 3 non-inferiority.",
    cancers: ["hodgkin-lymphoma"], trials: ["rathl", "echelon-1"] }),
];

const ideas: IdeaInput[] = [
  idea({ id: "idea-chemo-free-hodgkin", links: [{ label: "ClinicalTrials.gov NCT05675410: AHOD2131 (COG / NCTN)", url: "https://clinicaltrials.gov/study/NCT05675410" }], name: "Chemotherapy-free Hodgkin lymphoma: brentuximab + PD-1 in early stage", maturity: "early-clinical",
    tldr: "For a cancer already cured in 90% of young people, the goal is curing without the chemotherapy and radiation that cause heart disease and second cancers decades later.",
    summary: "Classical Hodgkin lymphoma is already cured in most young people, so the aim of this idea is to cure early-stage disease without the chemotherapy and radiotherapy that cause heart disease and second cancers decades later. Brentuximab vedotin plus nivolumab hits the Reed-Sternberg cell through CD30 and its immune shield through PD-1 and PD-L1, and the doublet has produced high complete response rates in relapsed disease and as frontline induction in older patients in the SGN35-015 cohort. The hypothesis is that PET- or ctDNA-adapted brentuximab-nivolumab with minimal or no chemotherapy achieves high progression-free survival in stage I to II disease with fewer late effects than ABVD-based therapy. AHOD2131, run by the Children's Oncology Group, is testing this at an early clinical stage.",
    hypothesis: "In early-stage classical Hodgkin lymphoma, PET/ctDNA-adapted brentuximab-nivolumab with minimal or no chemotherapy achieves 3-year PFS ≥90% with fewer late effects than ABVD-based therapy.",
    rationale: "Two non-cytotoxic mechanisms hit both the Reed-Sternberg cell (CD30) and its immune shield (PD-1/PD-L1); late toxicity of anthracyclines, alkylators and radiation dominates survivorship.",
    test: "AHOD2131 primary results; a follow-on trial substituting ctDNA for interim PET; 20-year late-effects registry.",
    technologies: ["pet-adapted-therapy", "checkpoint-inhibitor", "adc", "ctdna-lymphoma-monitoring"], drugs: ["brentuximab-vedotin", "nivolumab"], cancers: ["hodgkin-lymphoma"], trials: ["ahod2131"] }),
  idea({ id: "idea-cd30-car-t-hodgkin", links: [{ label: "Ramos et al., Anti-CD30 CAR-T cell therapy in relapsed and refractory Hodgkin lymphoma (Journal of Clinical Oncology 2020)", url: "https://doi.org/10.1200/JCO.20.01342" }], name: "CD30 CAR-T for multiply relapsed Hodgkin lymphoma", maturity: "early-clinical",
    tldr: "Engineer T cells against CD30 for the few patients who fail brentuximab, PD-1 blockade and transplant.",
    summary: "For the few patients with Hodgkin lymphoma who relapse after brentuximab vedotin, PD-1 blockade and transplant, this idea proposes CAR-T cells engineered against CD30. CD30 is expressed on nearly all Reed-Sternberg cells, shed CD30 does not block binding at therapeutic doses, and the inflamed microenvironment supports CAR-T trafficking. Phase 1/2 studies at UNC and Baylor and of the Tessa Therapeutics TT11 product produced responses and complete remissions in a substantial share of patients, although durability was modest, and the pivotal CHARIOT study was halted for business reasons in 2023 to 2024. The hypothesis is that CD30 CAR-T after PD-1 failure yields durable remissions and that PD-1 blockade prolongs persistence, tested in a randomised phase 2, at an early clinical stage.",
    hypothesis: "CD30 CAR-T after PD-1 failure yields durable CR in ≥40% of patients with an acceptable CRS profile, and combination with PD-1 blockade prolongs persistence.",
    rationale: "CD30 is near-universal on Reed-Sternberg cells and shed CD30 does not block binding at therapeutic doses; the inflamed microenvironment supports CAR-T trafficking.",
    test: "Randomised phase 2 of CD30 CAR-T ± nivolumab vs investigator's choice in triple-refractory disease.",
    technologies: ["car-t"], targets: ["cd30"], cancers: ["hodgkin-lymphoma"] }),
];

const entities: EntityInput[] = [...targets, ...technologies, ...terms, ...trials, ...pairings, ...ideas];

const spike: Spike = {
  cancerId: "hodgkin-lymphoma",
  entities,
  patch: {
    asOf,
    summary: "Classical Hodgkin lymphoma is a B-cell cancer in which rare, giant Reed-Sternberg cells (about 1% of the mass) recruit an inflammatory microenvironment and hide behind amplified PD-L1. It peaks in young adults and again after 55, is staged with PET-CT and the Lugano system, and is cured in more than 85% of patients overall and in over 90% of early-stage disease. Because most patients are young and will live for decades, the field's defining problem is not cure but the cost of cure: anthracycline heart disease, bleomycin lung injury, infertility, and second cancers from alkylators and radiation.\n\nThat is why Hodgkin lymphoma pioneered response-adapted therapy. Interim PET after two cycles (Deauville score) steers de-escalation (drop bleomycin after negative PET2 in RATHL; omit radiotherapy in early stage in HD16/HD17/RAPID at a small PFS cost) or escalation to BEACOPP-type regimens. Two ADC- and immunotherapy-based regimens then replaced ABVD for advanced disease: brentuximab vedotin-AVD (ECHELON-1, overall survival benefit) and, from March 2026, nivolumab-AVD (SWOG S1826, PFS HR 0.45 versus BV-AVD, neuropathy halved, children and adults together). In Europe, GHSG HD21's PET-guided BrECADD matches escalated BEACOPP's ~94% PFS with far less toxicity. Relapse is treated with PD-1 blockade (pembrolizumab beat brentuximab in KEYNOTE-204), brentuximab, salvage chemotherapy and autologous transplant, with brentuximab consolidation for high-risk patients (AETHERA); allogeneic transplant and CD30 CAR-T are options for the few who fail everything.\n\nThe next questions are how far chemotherapy can be removed. AHOD2131 tests brentuximab-nivolumab in early-stage disease across children and adults; ctDNA may replace PET for steering; older patients, who have half the cure rate of young ones, need regimens they can tolerate (nivolumab-AVD, brentuximab-based). Survivorship care for the tens of thousands cured decades ago, and the shift from radiotherapy to systemic de-escalation, remain the field's distinctive concerns.",
    burden: "~83,000 new cases a year worldwide, ~8,500 in the US, with age peaks at 20-30 and over 55. More than 85% are cured, so the research agenda is curing with less toxicity. Five-year survival is ~89% overall in high-income countries; ~23,000 deaths a year worldwide.",
    subtypes: ["Classical Hodgkin lymphoma: nodular sclerosis (most common in young adults), mixed cellularity, lymphocyte-rich, lymphocyte-depleted", "Nodular lymphocyte-predominant B-cell lymphoma (reclassified 2022; indolent, CD20+, rituximab-responsive)", "Early stage (I-II) favourable vs unfavourable (bulk, ESR, ≥3 sites)", "Advanced stage (III-IV); IPS 0-7 risk score", "Paediatric / adolescent-young-adult vs older (>60) disease", "EBV-positive (more common in children, older adults, and low-income settings)"],
    biomarkers: ["Interim PET (Deauville score) after cycle 2", "CD30 and CD15 on Reed-Sternberg cells; CD20 in NLPBL", "9p24.1 (PD-L1/PD-L2) amplification", "EBV status (EBER)", "International Prognostic Score (IPS)", "Baseline metabolic tumour volume", "ctDNA (research; PhasED-seq)", "Soluble CD30 (research)"],
    standardOfCare: [
      { setting: "Early stage, favourable (I-II)", approach: "ABVD × 2 + involved-site radiotherapy 20 Gy (HD10), or PET-adapted omission of radiotherapy after 3 cycles if PET-negative (RAPID, HD16) accepting ~5% lower PFS; AHOD2131 tests BV-nivo.", refs: ["doxorubicin", "pet-adapted-therapy", "imrt-igrt", "deauville-score", "ahod2131"], guideline: { nccn: "Category 1 (ABVD × 2 + ISRT 20 Gy or PET-adapted chemotherapy alone)", version: "NCCN Hodgkin Lymphoma 2026" } },
      { setting: "Early stage, unfavourable (I-II bulky or risk factors)", approach: "ABVD × 4 + ISRT 30 Gy, or escalated BEACOPP × 2 + ABVD × 2 + RT (HD14/HD17 PET-guided); nivolumab- or BV-containing regimens in trials.", refs: ["doxorubicin", "pet-adapted-therapy", "imrt-igrt"], guideline: { nccn: "Category 2A", version: "NCCN 2026" } },
      { setting: "Advanced stage (III-IV), age ≤60", approach: "Nivolumab-AVD × 6 (S1826; approved March 2026, no routine radiotherapy) or BV-AVD × 6 with G-CSF (ECHELON-1); in Europe PET-guided BrECADD × 4-6 (HD21) or eBEACOPP; PET-adapted ABVD/AVD (RATHL) where novel agents unavailable.", refs: ["swog-s1826", "nivolumab", "echelon-1", "brentuximab-vedotin", "hd21", "rathl", "pd1-plus-avd-hodgkin"], guideline: { nccn: "Category 1 (nivolumab-AVD preferred; BV-AVD)", esmoMcbs: "A (ECHELON-1)", version: "NCCN 2026" } },
      { setting: "Advanced stage, age >60", approach: "Nivolumab-AVD (S1826 included older adults with less toxicity than BV-AVD); sequential brentuximab → AVD → brentuximab; avoid bleomycin; ABVD/AVD with dose adaptation.", refs: ["swog-s1826", "nivolumab", "brentuximab-vedotin", "bleomycin-omission-caution"] },
      { setting: "First relapse, transplant-eligible", approach: "Salvage (ICE, DHAP, GVD, BV-nivolumab or pembrolizumab-GVD) → PET-negative → high-dose therapy and autologous transplant; brentuximab consolidation for high-risk (AETHERA); PD-1 maintenance in trials.", refs: ["autologous-stem-cell-transplant", "brentuximab-vedotin", "nivolumab", "pembrolizumab", "aethera"], guideline: { nccn: "Category 1 (ASCT after chemosensitive salvage; BV consolidation for high risk)", version: "NCCN 2026" } },
      { setting: "Relapse after transplant or transplant-ineligible", approach: "Pembrolizumab (KEYNOTE-204) or nivolumab; brentuximab vedotin if not yet given; BV + nivolumab; allogeneic transplant for fit patients after response; CD30 CAR-T in trials; palliative radiotherapy or bendamustine.", refs: ["pembrolizumab", "keynote-204", "nivolumab", "checkmate-205", "brentuximab-vedotin", "idea-cd30-car-t-hodgkin"], guideline: { nccn: "Category 1 (pembrolizumab, nivolumab, brentuximab)", version: "NCCN 2026" } },
      { setting: "Paediatric (COG / EuroNet)", approach: "Risk-adapted OEPA/COPDAC (EuroNet-PHL-C2) or ABVE-PC with brentuximab (AHOD1331, EFS benefit) and PET-guided radiotherapy omission; S1826 and AHOD2131 now enrol from age 12 or 5.", refs: ["brentuximab-vedotin", "pet-adapted-therapy", "childrens-oncology-group"] },
      { setting: "Survivorship", approach: "Lifelong surveillance for cardiac disease (anthracycline, mediastinal RT), breast cancer screening from 8 years after chest RT in women, thyroid and lung checks, fertility counselling before therapy.", refs: ["cardio-oncology", "mammography"] },
    ],
    stateOfArt: [
      "Nivolumab-AVD is the new frontline standard for advanced disease (S1826: 2-year PFS 92%, neuropathy halved), approved March 2026 for ages 12 and up.",
      "Two intensive but de-toxified European options: PET-guided BrECADD (HD21) achieves ~94% 5-year PFS with 40% less morbidity than eBEACOPP.",
      "Interim PET steers therapy for nearly every patient: bleomycin omission (RATHL), radiotherapy omission (HD16/17, RAPID), cycle number (HD18, HD21).",
      "Radiotherapy is disappearing from advanced-stage care (<1% in S1826) and being minimised in early stage.",
      "PD-1 blockade is the most effective single agent in any lymphoma relapse (ORR ~70%), and beat brentuximab head to head (KEYNOTE-204).",
      "Cure rates above 90% in young patients shift the research agenda to late effects and to older adults.",
    ],
    history: [
      { year: 1832, title: "Thomas Hodgkin describes the disease; Reed and Sternberg characterise the cell (1898-1902)", refs: ["reed-sternberg-cell"] },
      { year: 1950, title: "Peters shows extended-field radiotherapy can cure early-stage disease", refs: ["imrt-igrt"] },
      { year: 1964, title: "MOPP: the first combination chemotherapy to cure an advanced cancer (DeVita, NCI)", refs: ["cytotoxic-chemotherapy"] },
      { year: 1975, title: "ABVD introduced (Bonadonna); becomes global standard by the 1990s", refs: ["doxorubicin"] },
      { year: 1992, title: "Escalated BEACOPP developed by the German Hodgkin Study Group", refs: ["gbg"] },
      { year: 2000, title: "Autologous transplant standard for relapse; late-effects registries reveal cardiac and second-cancer burden", refs: ["autologous-stem-cell-transplant", "cardio-oncology"] },
      { year: 2011, title: "Brentuximab vedotin approved for relapsed disease; CD30 validated as an ADC target", refs: ["brentuximab-vedotin", "cd30"] },
      { year: 2014, title: "Lugano classification formalises PET staging and the Deauville scale", refs: ["lugano-classification", "deauville-score"] },
      { year: 2015, title: "AETHERA: brentuximab consolidation after transplant", refs: ["aethera"] },
      { year: 2016, title: "RATHL: bleomycin dropped after negative interim PET; nivolumab approved for relapse (CheckMate 205)", refs: ["rathl", "checkmate-205", "nivolumab"] },
      { year: 2018, title: "ECHELON-1: BV-AVD approved frontline; radiotherapy omission trials (RAPID, HD16/17) report", refs: ["echelon-1", "pet-adapted-therapy"] },
      { year: 2020, title: "KEYNOTE-204: pembrolizumab beats brentuximab in relapse", refs: ["keynote-204", "pembrolizumab"] },
      { year: 2022, title: "ECHELON-1 shows overall survival benefit; WHO reclassifies nodular lymphocyte-predominant disease", refs: ["echelon-1"] },
      { year: 2023, title: "SWOG S1826: nivolumab-AVD beats BV-AVD (ASCO plenary)", refs: ["swog-s1826"] },
      { year: 2024, title: "HD21 (BrECADD) published in Lancet; S1826 in NEJM", refs: ["hd21", "swog-s1826"] },
      { year: 2026, title: "Nivolumab-AVD approved by FDA (20 March) for ages 12+; HD21 5-year data confirm BrECADD", refs: ["swog-s1826", "nivolumab", "hd21"] },
    ],
    pipeline: ["ahod2131", "idea-chemo-free-hodgkin", "idea-cd30-car-t-hodgkin", "ctdna-lymphoma-monitoring", "pet-adapted-therapy", "cd30", "hd21"],
    openProblems: [
      "Late effects dominate: cardiac disease, breast and lung cancer after mediastinal radiotherapy, infertility; survivors need lifelong surveillance that most health systems do not organise.",
      "Older patients (>60) have roughly half the cure rate and double the toxicity; the best regimen for them is unsettled.",
      "The ~10-15% with primary refractory or early-relapsing disease still need transplant; those failing PD-1 blockade have few options beyond allogeneic transplant.",
      "Interim PET has limited positive predictive value; ctDNA-guided designs are unproven.",
      "Access: brentuximab and nivolumab are costly and unavailable in many countries where EBV-positive Hodgkin lymphoma is common in children.",
      "Nodular lymphocyte-predominant disease is now a separate entity with little trial evidence of its own.",
      "Radiotherapy omission trades a few percent of PFS for lower late toxicity; the right trade-off differs by age and sex.",
    ],
    targets: ["cd30", "pd1", "pdl1"],
    technologies: ["pet-adapted-therapy", "autologous-stem-cell-transplant", "ctdna-lymphoma-monitoring", "cardio-oncology", "imrt-igrt"],
    terms: ["deauville-score", "reed-sternberg-cell", "lugano-classification", "pfs", "os"],
    companies: ["bms", "merck", "pfizer", "takeda"],
    institutions: ["swog", "childrens-oncology-group", "gbg", "cruk", "mskcc", "dana-farber"],
    related: ["pd1-plus-avd-hodgkin", "bleomycin-omission-caution"],
    tags: ["spike"],
  },
};

export default spike;

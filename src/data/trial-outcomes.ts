import type { TrialInput } from "@/lib/schema";

/**
 * Structured outcomes, enrolment, and replication notes for every trial in the corpus.
 * Merged into the trial records by trials.ts, pipeline-trials.ts, and failures.ts.
 *
 * Rules: numbers come from the primary publication, FDA label, or the sponsor's results
 * release linked in `source`; percent endpoints use unit "%", time-to-event endpoints use
 * unit "months". Where an arm value is not public the arm is listed without a value and
 * the note says so.
 */
export type TrialOutcomeData = Pick<TrialInput, "enrolled" | "outcomes" | "replication">;

/** Authoring type: allows a note on the outcome itself; normalised into the first arm's note below. */
type OutcomeIn = NonNullable<TrialInput["outcomes"]>[number] & { note?: string };
type TrialOutcomeIn = Omit<TrialOutcomeData, "outcomes"> & { outcomes?: OutcomeIn[] };

const nejm = (id: string) => `https://www.nejm.org/doi/full/10.1056/${id}`;
const ct = (nct: string) => `https://clinicaltrials.gov/study/${nct}`;

const RAW: Record<string, TrialOutcomeIn> = {
  // ---------------- TNBC ----------------
  "keynote-522": {
    enrolled: 1174,
    outcomes: [
      { endpoint: "Pathologic complete response (ypT0/Tis ypN0)", primary: true, unit: "%", arms: [{ name: "Pembrolizumab + chemotherapy", n: 401, value: 64.8 }, { name: "Placebo + chemotherapy", n: 201, value: 51.2 }], p: "0.00055", source: nejm("NEJMoa1910549") },
      { endpoint: "Event-free survival at 5 years", primary: true, unit: "%", arms: [{ name: "Pembrolizumab + chemotherapy", n: 784, value: 81.2 }, { name: "Placebo + chemotherapy", n: 390, value: 72.2 }], hr: 0.65, ci: [0.51, 0.83], source: nejm("NEJMoa2409932") },
      { endpoint: "Overall survival at 5 years", unit: "%", arms: [{ name: "Pembrolizumab + chemotherapy", value: 86.6 }, { name: "Placebo + chemotherapy", value: 81.7 }], hr: 0.66, ci: [0.50, 0.87], p: "0.002", source: nejm("NEJMoa2409932") },
      { endpoint: "Event-free survival at 7 years", unit: "%", arms: [{ name: "Pembrolizumab + chemotherapy", value: 78.3 }, { name: "Placebo + chemotherapy", value: 69.8 }], source: "https://www.lbbc.org/news/pivotal-progress-in-tnbc-asco-2026" },
      { endpoint: "Overall survival at 7 years", unit: "%", arms: [{ name: "Pembrolizumab + chemotherapy", value: 85.1 }, { name: "Placebo + chemotherapy", value: 77.2 }], source: "https://www.lbbc.org/news/pivotal-progress-in-tnbc-asco-2026" },
    ],
    replication: "Single pivotal trial, but the EFS and OS benefits held through the 5- and 7-year analyses; consistent with IMpassion031 (atezolizumab, pCR only) and with real-world neoadjuvant pembrolizumab series.",
  },
  "keynote-355": {
    enrolled: 882,
    outcomes: [
      { endpoint: "Overall survival, PD-L1 CPS ≥10", primary: true, unit: "months", arms: [{ name: "Pembrolizumab + chemotherapy", n: 220, value: 23.0 }, { name: "Placebo + chemotherapy", n: 103, value: 16.1 }], hr: 0.73, ci: [0.55, 0.95], p: "0.0185", source: nejm("NEJMoa2202809") },
      { endpoint: "Progression-free survival, PD-L1 CPS ≥10", primary: true, unit: "months", arms: [{ name: "Pembrolizumab + chemotherapy", value: 9.7 }, { name: "Placebo + chemotherapy", value: 5.6 }], hr: 0.66, ci: [0.50, 0.88], source: nejm("NEJMoa2202809") },
      { endpoint: "Overall survival, CPS ≥1", unit: "months", arms: [{ name: "Pembrolizumab + chemotherapy", value: 17.6 }, { name: "Placebo + chemotherapy", value: 16.0 }], hr: 0.86, ci: [0.72, 1.04], note: "Not significant", source: nejm("NEJMoa2202809") },
    ],
    replication: "Consistent direction with IMpassion130 (atezolizumab, PD-L1+); IMpassion131 was negative, so the PD-L1 CPS ≥10 population and the chemotherapy partner matter. Now being superseded by ADC + pembrolizumab (ASCENT-04).",
  },
  impassion130: {
    enrolled: 902,
    outcomes: [
      { endpoint: "Progression-free survival, PD-L1+ (SP142 IC ≥1%)", primary: true, unit: "months", arms: [{ name: "Atezolizumab + nab-paclitaxel", n: 185, value: 7.5 }, { name: "Placebo + nab-paclitaxel", n: 184, value: 5.0 }], hr: 0.62, ci: [0.49, 0.78], p: "<0.001", source: nejm("NEJMoa1809615") },
      { endpoint: "Overall survival, PD-L1+", unit: "months", arms: [{ name: "Atezolizumab + nab-paclitaxel", value: 25.4 }, { name: "Placebo + nab-paclitaxel", value: 17.9 }], hr: 0.67, ci: [0.53, 0.86], note: "Not formally tested under the hierarchical design", source: "https://www.thelancet.com/journals/lanonc/article/PIIS1470-2045(19)30689-8/fulltext" },
      { endpoint: "Overall survival, ITT", unit: "months", arms: [{ name: "Atezolizumab + nab-paclitaxel", value: 21.0 }, { name: "Placebo + nab-paclitaxel", value: 18.7 }], hr: 0.87, ci: [0.75, 1.02], note: "Not significant", source: "https://doi.org/10.1056/NEJMoa1809615" },
    ],
    replication: "Not replicated: IMpassion131 with paclitaxel was negative, leading to US withdrawal in 2021. KEYNOTE-355 confirmed the broader concept of chemo-immunotherapy in PD-L1-high disease.",
  },
  ascent: {
    enrolled: 529,
    outcomes: [
      { endpoint: "Progression-free survival (patients without brain metastases)", primary: true, unit: "months", arms: [{ name: "Sacituzumab govitecan", n: 235, value: 5.6 }, { name: "Chemotherapy (TPC)", n: 233, value: 1.7 }], hr: 0.41, ci: [0.32, 0.52], p: "<0.001", source: nejm("NEJMoa2028485") },
      { endpoint: "Overall survival", unit: "months", arms: [{ name: "Sacituzumab govitecan", value: 12.1 }, { name: "Chemotherapy (TPC)", value: 6.7 }], hr: 0.48, ci: [0.38, 0.59], p: "<0.001", source: nejm("NEJMoa2028485") },
      { endpoint: "Objective response rate", unit: "%", arms: [{ name: "Sacituzumab govitecan", value: 35 }, { name: "Chemotherapy (TPC)", value: 5 }], source: nejm("NEJMoa2028485") },
    ],
    replication: "Consistent with the single-arm IMMU-132-01 basket (ORR 33%) that led to accelerated approval, with TROPiCS-02 in HR+ disease, and with the first-line ASCENT-03/04 results; real-world series report similar PFS.",
  },
  "ascent-03": {
    enrolled: 558,
    outcomes: [
      { endpoint: "Progression-free survival (BICR)", primary: true, unit: "months", arms: [{ name: "Sacituzumab govitecan", n: 279, value: 9.7 }, { name: "Chemotherapy (TPC)", n: 279, value: 6.9 }], hr: 0.62, ci: [0.50, 0.77], p: "<0.0001", source: "https://dailyreporter.esmo.org/esmo-congress-2025/breast-cancer/survival-improvements-observed-with-first-line-antibody-drug-conjugates-in-triple-negative-breast-cancer" },
      { endpoint: "Objective response rate", unit: "%", arms: [{ name: "Sacituzumab govitecan", value: 48 }, { name: "Chemotherapy (TPC)", value: 44 }] },
      { endpoint: "Overall survival", unit: "months", arms: [{ name: "Sacituzumab govitecan" }, { name: "Chemotherapy (TPC)" }], note: "Immature at the primary analysis; crossover to sacituzumab permitted on progression." },
    ],
    replication: "Consistent with ASCENT (later line) and with TROPION-Breast02 (a different TROP2 ADC in the same first-line PD-1-ineligible population), which strengthens the class effect.",
  },
  "ascent-04": {
    enrolled: 443,
    outcomes: [
      { endpoint: "Progression-free survival (BICR)", primary: true, unit: "months", arms: [{ name: "Sacituzumab govitecan + pembrolizumab", n: 221, value: 11.2 }, { name: "Chemotherapy + pembrolizumab", n: 222, value: 7.8 }], hr: 0.65, ci: [0.51, 0.84], p: "0.0009", source: "https://dailyreporter.esmo.org/esmo-congress-2025/breast-cancer/survival-improvements-observed-with-first-line-antibody-drug-conjugates-in-triple-negative-breast-cancer" },
      { endpoint: "Objective response rate", unit: "%", arms: [{ name: "Sacituzumab govitecan + pembrolizumab", value: 60 }, { name: "Chemotherapy + pembrolizumab", value: 53 }], source: "https://doi.org/10.1056/NEJMoa2508959" },
      { endpoint: "Overall survival", unit: "months", arms: [{ name: "Sacituzumab govitecan + pembrolizumab" }, { name: "Chemotherapy + pembrolizumab" }], note: "Immature; PFS2 favoured the ADC arm in the ASCO 2026 update.", source: "https://doi.org/10.1056/NEJMoa2508959" },
    ],
    replication: "First trial of ADC + PD-1 in TNBC; the design mirrors EV-302 in urothelial cancer. TROPION-Breast05 (Dato-DXd + durvalumab) will be the confirmatory sibling.",
  },
  "tropion-breast01": {
    enrolled: 732,
    outcomes: [
      { endpoint: "Progression-free survival (BICR)", primary: true, unit: "months", arms: [{ name: "Datopotamab deruxtecan", n: 365, value: 6.9 }, { name: "Chemotherapy (ICC)", n: 367, value: 4.9 }], hr: 0.63, ci: [0.52, 0.76], p: "<0.0001", source: "https://ascopubs.org/doi/10.1200/JCO.24.00920" },
      { endpoint: "Overall survival", primary: true, unit: "months", arms: [{ name: "Datopotamab deruxtecan", value: 18.6 }, { name: "Chemotherapy (ICC)", value: 18.3 }], hr: 1.01, ci: [0.83, 1.22], note: "Not significant", source: ct("NCT05104866") },
      { endpoint: "Objective response rate", unit: "%", arms: [{ name: "Datopotamab deruxtecan", value: 36.4 }, { name: "Chemotherapy (ICC)", value: 22.9 }], source: "https://doi.org/10.1200/JCO.24.00920" },
    ],
    replication: "PFS-only benefit; the OS result did not replicate the PFS signal. The HR+ population is also served by TROPiCS-02 (sacituzumab), which did show an OS benefit.",
  },
  "tropion-breast02": {
    enrolled: 644,
    outcomes: [
      { endpoint: "Progression-free survival (BICR)", primary: true, unit: "months", arms: [{ name: "Datopotamab deruxtecan", n: 323, value: 10.8 }, { name: "Chemotherapy (ICC)", n: 321, value: 5.6 }], hr: 0.57, ci: [0.47, 0.69], p: "<0.0001", source: "https://www.annalsofoncology.org/article/S0923-7534(26)00130-4/fulltext" },
      { endpoint: "Overall survival", primary: true, unit: "months", arms: [{ name: "Datopotamab deruxtecan", value: 23.7 }, { name: "Chemotherapy (ICC)", value: 18.7 }], hr: 0.79, ci: [0.64, 0.98], p: "0.0291", source: "https://www.astrazeneca.com/media-centre/press-releases/2025/datroway-demonstrated-an-unprecedented-median-overall-survival-improvement-of-five-months-vs-chemotherapy-as-1st-line-treatment-for-patients-with-metastatic-triple-negative-breast-cancer-for-whom-immunotherapy-was-not-an-option-in-tropion-breast02.html" },
    ],
    replication: "Consistent with ASCENT-03 (sacituzumab govitecan, same population, PFS HR 0.62), supporting a TROP2-ADC class effect in first-line PD-1-ineligible TNBC.",
  },
  "tropion-breast05": { enrolled: 625, outcomes: [], replication: "Ongoing; no results." },
  "bl-b01d1-307": {
    enrolled: 418,
    outcomes: [
      { endpoint: "Progression-free survival (BICR)", primary: true, unit: "months", arms: [{ name: "Izalontamab brengitecan", n: 207, value: 8.5 }, { name: "Chemotherapy (TPC)", n: 211, value: 3.1 }], hr: 0.29, ci: [0.22, 0.38], p: "<0.0001", source: "https://www.onclive.com/view/iza-bren-yields-pfs-and-os-benefits-vs-chemo-in-previously-treated-advanced-tnbc" },
      { endpoint: "Overall survival (interim, median follow-up 11 months)", primary: true, unit: "months", arms: [{ name: "Izalontamab brengitecan", value: 15.9 }, { name: "Chemotherapy (TPC)", value: 12.5 }], hr: 0.60, ci: [0.42, 0.85], p: "0.0019", source: "https://www.onclive.com/view/iza-bren-yields-pfs-and-os-benefits-vs-chemo-in-previously-treated-advanced-tnbc" },
      { endpoint: "Confirmed objective response rate (BICR)", unit: "%", arms: [{ name: "Izalontamab brengitecan", value: 51.7 }, { name: "Chemotherapy (TPC)", value: 20.5 }] },
    ],
    replication: "Single Chinese phase 3 with an interim OS analysis; a parallel positive phase 3 in oesophageal squamous cell carcinoma supports the drug, and the global IZABRIGHT-Breast01 trial will test the first-line setting. Not yet replicated outside China.",
  },
  "izabright-breast01": { enrolled: 570, outcomes: [], replication: "Ongoing; no results." },
  "optimice-pcr": { enrolled: 1295, outcomes: [], replication: "Ongoing de-escalation trial; no results." },
  "scarlet-s2212": { enrolled: 2400, outcomes: [], replication: "Ongoing; no results." },
  olympia: {
    enrolled: 1837,
    outcomes: [
      { endpoint: "Invasive disease-free survival at 3 years", primary: true, unit: "%", arms: [{ name: "Olaparib", n: 921, value: 85.9 }, { name: "Placebo", n: 915, value: 77.1 }], hr: 0.58, ci: [0.41, 0.82], p: "<0.001", source: nejm("NEJMoa2105215") },
      { endpoint: "Overall survival at 4 years", unit: "%", arms: [{ name: "Olaparib", value: 89.8 }, { name: "Placebo", value: 86.4 }], hr: 0.68, ci: [0.47, 0.97], p: "0.009", source: "https://www.annalsofoncology.org/article/S0923-7534(22)04165-7/fulltext" },
      { endpoint: "Overall survival at 6 years", unit: "%", arms: [{ name: "Olaparib", value: 87.5 }, { name: "Placebo", value: 83.2 }], hr: 0.72, ci: [0.56, 0.93], source: ct("NCT02032823") },
    ],
    replication: "Single pivotal adjuvant trial with a sustained OS benefit at 6 years; consistent with the metastatic-setting PFS benefit of olaparib (OlympiAD) and talazoparib (EMBRACA).",
  },

  // ---------------- HER2 / HR+ breast ----------------
  "destiny-breast03": {
    enrolled: 524,
    outcomes: [
      { endpoint: "Progression-free survival (BICR)", primary: true, unit: "months", arms: [{ name: "Trastuzumab deruxtecan", n: 261, value: 28.8 }, { name: "Trastuzumab emtansine", n: 263, value: 6.8 }], hr: 0.33, ci: [0.26, 0.43], p: "<0.0001", source: "https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(22)02420-5/fulltext" },
      { endpoint: "Overall survival", unit: "months", arms: [{ name: "Trastuzumab deruxtecan", value: 52.6 }, { name: "Trastuzumab emtansine", value: 42.7 }], hr: 0.73, ci: [0.56, 0.94], source: ct("NCT03529110") },
      { endpoint: "Objective response rate", unit: "%", arms: [{ name: "Trastuzumab deruxtecan", value: 78.5 }, { name: "Trastuzumab emtansine", value: 35.0 }], source: nejm("NEJMoa2115022") },
    ],
    replication: "Head-to-head ADC trial; consistent with the single-arm DESTINY-Breast01 (ORR 61%) and with DESTINY-Breast02 versus treatment of physician's choice.",
  },
  "destiny-breast04": {
    enrolled: 557,
    outcomes: [
      { endpoint: "Progression-free survival, HR+ cohort (BICR)", primary: true, unit: "months", arms: [{ name: "Trastuzumab deruxtecan", n: 331, value: 10.1 }, { name: "Chemotherapy (TPC)", n: 163, value: 5.4 }], hr: 0.51, ci: [0.40, 0.64], p: "<0.001", source: nejm("NEJMoa2203690") },
      { endpoint: "Overall survival, all patients", unit: "months", arms: [{ name: "Trastuzumab deruxtecan", n: 373, value: 23.4 }, { name: "Chemotherapy (TPC)", n: 184, value: 16.8 }], hr: 0.64, ci: [0.49, 0.84], p: "0.001", source: nejm("NEJMoa2203690") },
      { endpoint: "Progression-free survival, HR-negative (TNBC) cohort", unit: "months", arms: [{ name: "Trastuzumab deruxtecan", n: 40, value: 8.5 }, { name: "Chemotherapy (TPC)", n: 18, value: 2.9 }], hr: 0.46, ci: [0.24, 0.89], note: "Exploratory cohort", source: nejm("NEJMoa2203690") },
    ],
    replication: "Confirmed and extended by DESTINY-Breast06 (HER2-low and ultralow, chemotherapy-naive) with a near-identical PFS hazard ratio.",
  },
  "destiny-breast06": {
    enrolled: 866,
    outcomes: [
      { endpoint: "Progression-free survival, HER2-low (BICR)", primary: true, unit: "months", arms: [{ name: "Trastuzumab deruxtecan", n: 359, value: 13.2 }, { name: "Chemotherapy (TPC)", n: 354, value: 8.1 }], hr: 0.62, ci: [0.51, 0.74], p: "<0.0001", source: nejm("NEJMoa2407086") },
      { endpoint: "Progression-free survival, ITT (HER2-low + ultralow)", unit: "months", arms: [{ name: "Trastuzumab deruxtecan", n: 436, value: 13.2 }, { name: "Chemotherapy (TPC)", n: 430, value: 8.1 }], hr: 0.63, ci: [0.53, 0.75], source: nejm("NEJMoa2407086") },
      { endpoint: "Objective response rate, HER2-low", unit: "%", arms: [{ name: "Trastuzumab deruxtecan", value: 56.5 }, { name: "Chemotherapy (TPC)", value: 32.2 }], source: nejm("NEJMoa2407086") },
    ],
    replication: "Replicates DESTINY-Breast04 in an earlier line and extends it to HER2-ultralow.",
  },
  "destiny-breast09": {
    enrolled: 1157,
    outcomes: [
      { endpoint: "Progression-free survival (BICR), T-DXd + pertuzumab vs THP", primary: true, unit: "months", arms: [{ name: "Trastuzumab deruxtecan + pertuzumab", n: 383, value: 40.7 }, { name: "Taxane + trastuzumab + pertuzumab", n: 387, value: 26.9 }], hr: 0.56, ci: [0.44, 0.71], p: "<0.00001", source: "https://ascopubs.org/doi/10.1200/JCO.2025.43.17_suppl.LBA1008" },
      { endpoint: "Objective response rate", unit: "%", arms: [{ name: "Trastuzumab deruxtecan + pertuzumab", value: 85.1 }, { name: "Taxane + trastuzumab + pertuzumab", value: 78.6 }], source: "https://doi.org/10.1056/NEJMoa2508668" },
      { endpoint: "Overall survival", unit: "months", arms: [{ name: "Trastuzumab deruxtecan + pertuzumab" }, { name: "Taxane + trastuzumab + pertuzumab" }], note: "Immature at the interim analysis; early trend favoured T-DXd + pertuzumab.", source: "https://doi.org/10.1056/NEJMoa2508668" },
    ],
    replication: "Single pivotal trial versus the CLEOPATRA-era standard; the T-DXd monotherapy arm is still blinded. Consistent with the class's performance in DESTINY-Breast03.",
  },
  "destiny-breast11": {
    enrolled: 927,
    outcomes: [
      { endpoint: "Pathologic complete response (ypT0/Tis ypN0)", primary: true, unit: "%", arms: [{ name: "T-DXd → THP", n: 321, value: 67.3 }, { name: "ddAC → THP", n: 320, value: 56.3 }], p: "0.003", source: "https://web.archive.org/web/20231201043719/https://www.esmo.org/newsroom/press-releases" },
      { endpoint: "Event-free survival", unit: "months", arms: [{ name: "T-DXd → THP" }, { name: "ddAC → THP" }], note: "Immature; the T-DXd monotherapy arm was stopped early for lower efficacy." },
    ],
    replication: "Single pivotal neoadjuvant trial; pCR is a surrogate. The post-neoadjuvant DESTINY-Breast05 (T-DXd vs T-DM1) is the companion evidence in early HER2+ disease.",
  },
  natalee: {
    enrolled: 5101,
    outcomes: [
      { endpoint: "Invasive disease-free survival at 3 years", primary: true, unit: "%", arms: [{ name: "Ribociclib + NSAI", n: 2549, value: 90.4 }, { name: "NSAI alone", n: 2552, value: 87.1 }], hr: 0.75, ci: [0.62, 0.91], p: "0.003", source: nejm("NEJMoa2305488") },
      { endpoint: "Invasive disease-free survival at 4 years", unit: "%", arms: [{ name: "Ribociclib + NSAI", value: 88.5 }, { name: "NSAI alone", value: 83.6 }], hr: 0.715, ci: [0.609, 0.840], source: ct("NCT03701334") },
    ],
    replication: "Consistent with monarchE (abemaciclib) in a broader, lower-risk population; PALLAS and PENELOPE-B (palbociclib) were negative, so the effect is not a uniform class effect.",
  },
  monarche: {
    enrolled: 5637,
    outcomes: [
      { endpoint: "Invasive disease-free survival at 2 years", primary: true, unit: "%", arms: [{ name: "Abemaciclib + endocrine therapy", n: 2808, value: 92.2 }, { name: "Endocrine therapy alone", n: 2829, value: 88.7 }], hr: 0.75, ci: [0.60, 0.93], p: "0.01", source: "https://ascopubs.org/doi/10.1200/JCO.20.02514" },
      { endpoint: "Invasive disease-free survival at 5 years", unit: "%", arms: [{ name: "Abemaciclib + endocrine therapy", value: 83.6 }, { name: "Endocrine therapy alone", value: 76.0 }], hr: 0.68, ci: [0.60, 0.77], source: "https://www.thelancet.com/journals/lanonc/article/PIIS1470-2045(23)00525-2/fulltext" },
      { endpoint: "Distant relapse-free survival at 5 years", unit: "%", arms: [{ name: "Abemaciclib + endocrine therapy", value: 86.0 }, { name: "Endocrine therapy alone", value: 79.2 }], hr: 0.675, source: "https://www.thelancet.com/journals/lanonc/article/PIIS1470-2045(23)00525-2/fulltext" },
    ],
    replication: "Confirmed by NATALEE (ribociclib) for the CDK4/6 adjuvant concept in high-risk disease; the benefit widened over time (carry-over effect).",
  },
  "veritac-2": {
    enrolled: 624,
    outcomes: [
      { endpoint: "Progression-free survival, ESR1-mutant (BICR)", primary: true, unit: "months", arms: [{ name: "Vepdegestrant", n: 136, value: 5.0 }, { name: "Fulvestrant", n: 134, value: 2.1 }], hr: 0.57, ci: [0.42, 0.77], p: "<0.001", source: "https://ascopubs.org/doi/10.1200/JCO.2025.43.17_suppl.LBA1000" },
      { endpoint: "Progression-free survival, ITT", primary: true, unit: "months", arms: [{ name: "Vepdegestrant", n: 313, value: 3.7 }, { name: "Fulvestrant", n: 311, value: 3.6 }], hr: 0.83, ci: [0.68, 1.02], note: "Not significant", source: "https://ascopubs.org/doi/10.1200/JCO.2025.43.17_suppl.LBA1000" },
    ],
    replication: "Mirrors EMERALD (elacestrant): benefit confined to ESR1-mutant tumours. Two oral ER-degrading agents now show the same pattern.",
  },

  // ---------------- Lung ----------------
  adaura: {
    enrolled: 682,
    outcomes: [
      { endpoint: "Disease-free survival, stage II to IIIA", primary: true, unit: "months", arms: [{ name: "Osimertinib", n: 233 }, { name: "Placebo", n: 237, value: 19.6 }], hr: 0.17, ci: [0.11, 0.26], p: "<0.001", note: "Median DFS not reached with osimertinib at the primary analysis", source: nejm("NEJMoa2027071") },
      { endpoint: "Overall survival at 5 years, stage II to IIIA", unit: "%", arms: [{ name: "Osimertinib", value: 85 }, { name: "Placebo", value: 73 }], hr: 0.49, ci: [0.33, 0.73], p: "<0.001", source: nejm("NEJMoa2304594") },
      { endpoint: "Overall survival at 5 years, stage IB to IIIA", unit: "%", arms: [{ name: "Osimertinib", value: 88 }, { name: "Placebo", value: 78 }], hr: 0.49, ci: [0.34, 0.70], source: nejm("NEJMoa2304594") },
    ],
    replication: "Single pivotal adjuvant trial with an OS benefit; consistent with the adjuvant ALK result (ALINA) and with earlier-generation adjuvant EGFR TKI trials that improved DFS.",
  },
  flaura2: {
    enrolled: 587,
    outcomes: [
      { endpoint: "Progression-free survival (investigator)", primary: true, unit: "months", arms: [{ name: "Osimertinib + chemotherapy", n: 279, value: 25.5 }, { name: "Osimertinib", n: 278, value: 16.7 }], hr: 0.62, ci: [0.49, 0.79], p: "<0.001", source: nejm("NEJMoa2306434") },
      { endpoint: "Overall survival", unit: "months", arms: [{ name: "Osimertinib + chemotherapy", value: 47.5 }, { name: "Osimertinib", value: 37.6 }], hr: 0.77, ci: [0.61, 0.96], p: "0.02", source: ct("NCT04035486") },
    ],
    replication: "Consistent with MARIPOSA in showing that intensifying first-line therapy beyond osimertinib alone extends survival; the two regimens have not been compared directly.",
  },
  mariposa: {
    enrolled: 1074,
    outcomes: [
      { endpoint: "Progression-free survival (BICR)", primary: true, unit: "months", arms: [{ name: "Amivantamab + lazertinib", n: 429, value: 23.7 }, { name: "Osimertinib", n: 429, value: 16.6 }], hr: 0.70, ci: [0.58, 0.85], p: "<0.001", source: nejm("NEJMoa2403614") },
      { endpoint: "Overall survival", unit: "months", arms: [{ name: "Amivantamab + lazertinib", note: "Median not reached" }, { name: "Osimertinib", value: 36.7 }], hr: 0.75, ci: [0.61, 0.92], p: "0.005", source: ct("NCT04487080") },
    ],
    replication: "Single pivotal trial versus osimertinib; MARIPOSA-2 (post-osimertinib) and PALOMA-3 (subcutaneous) support the regimen in adjacent settings.",
  },
  "tropion-lung01": {
    enrolled: 605,
    outcomes: [
      { endpoint: "Progression-free survival (BICR)", primary: true, unit: "months", arms: [{ name: "Datopotamab deruxtecan", n: 299, value: 4.4 }, { name: "Docetaxel", n: 305, value: 3.7 }], hr: 0.75, ci: [0.62, 0.91], p: "0.004", source: "https://ascopubs.org/doi/10.1200/JCO.24.01544" },
      { endpoint: "Overall survival", primary: true, unit: "months", arms: [{ name: "Datopotamab deruxtecan", value: 12.9 }, { name: "Docetaxel", value: 11.8 }], hr: 0.94, ci: [0.78, 1.14], note: "Not significant", source: "https://ascopubs.org/doi/10.1200/JCO.24.01544" },
      { endpoint: "Progression-free survival, non-squamous", unit: "months", arms: [{ name: "Datopotamab deruxtecan", value: 5.5 }, { name: "Docetaxel", value: 3.6 }], hr: 0.63, ci: [0.51, 0.79], source: "https://ascopubs.org/doi/10.1200/JCO.24.01544" },
    ],
    replication: "Mixed result; the approval that followed was narrowed to EGFR-mutant NSCLC on the basis of TROPION-Lung05 (single-arm), not this trial.",
  },
  "codebreak-300": {
    enrolled: 160,
    outcomes: [
      { endpoint: "Progression-free survival (BICR), sotorasib 960 mg + panitumumab", primary: true, unit: "months", arms: [{ name: "Sotorasib 960 mg + panitumumab", n: 53, value: 5.6 }, { name: "Trifluridine-tipiracil or regorafenib", n: 54, value: 2.2 }], hr: 0.49, ci: [0.30, 0.80], p: "0.006", source: nejm("NEJMoa2308795") },
      { endpoint: "Objective response rate", unit: "%", arms: [{ name: "Sotorasib 960 mg + panitumumab", value: 26.4 }, { name: "Trifluridine-tipiracil or regorafenib", value: 0 }], source: nejm("NEJMoa2308795") },
    ],
    replication: "Consistent with KRYSTAL-1 (adagrasib + cetuximab, ORR 34%), so the KRAS G12C + anti-EGFR combination is supported by two independent programmes.",
  },
  "dellphi-304": {
    enrolled: 509,
    outcomes: [
      { endpoint: "Overall survival", primary: true, unit: "months", arms: [{ name: "Tarlatamab", n: 254, value: 13.6 }, { name: "Chemotherapy (topotecan, lurbinectedin, or amrubicin)", n: 255, value: 8.3 }], hr: 0.60, ci: [0.47, 0.77], p: "<0.001", source: ct("NCT05740566") },
      { endpoint: "Progression-free survival", unit: "months", arms: [{ name: "Tarlatamab", value: 4.2 }, { name: "Chemotherapy", value: 3.7 }], hr: 0.71, ci: [0.59, 0.86], source: ct("NCT05740566") },
      { endpoint: "Objective response rate", unit: "%", arms: [{ name: "Tarlatamab", value: 35 }, { name: "Chemotherapy", value: 20 }], source: "https://doi.org/10.1056/NEJMoa2502099" },
    ],
    replication: "Confirms the single-arm DeLLphi-301 result (ORR 40%) that supported accelerated approval; first-line data (DeLLphi-305) pending.",
  },

  // ---------------- Melanoma / IO ----------------
  "checkmate-067": {
    enrolled: 945,
    outcomes: [
      { endpoint: "Overall survival at 10 years", unit: "%", arms: [{ name: "Nivolumab + ipilimumab", n: 314, value: 43 }, { name: "Nivolumab", n: 316, value: 37 }, { name: "Ipilimumab", n: 315, value: 19 }], source: nejm("NEJMoa2407417") },
      { endpoint: "Median overall survival", unit: "months", arms: [{ name: "Nivolumab + ipilimumab", value: 71.9 }, { name: "Nivolumab", value: 36.9 }, { name: "Ipilimumab", value: 19.9 }], source: nejm("NEJMoa2407417") },
      { endpoint: "Melanoma-specific survival at 10 years", unit: "%", arms: [{ name: "Nivolumab + ipilimumab", value: 52 }, { name: "Nivolumab", value: 44 }, { name: "Ipilimumab", value: 23 }], source: nejm("NEJMoa2407417") },
      { endpoint: "Progression-free survival (co-primary)", primary: true, unit: "months", arms: [{ name: "Nivolumab + ipilimumab", value: 11.5 }, { name: "Nivolumab", value: 6.9 }, { name: "Ipilimumab", value: 2.9 }], hr: 0.42, note: "HR for combination vs ipilimumab", source: nejm("NEJMoa1504030") },
    ],
    replication: "Replicated by CheckMate 069 (phase 2) and consistent with KEYNOTE-006 for single-agent PD-1; the longest immunotherapy follow-up in any solid tumour.",
  },
  "interpath-001": {
    enrolled: 1137,
    outcomes: [
      { endpoint: "Recurrence-free survival", primary: true, arms: [{ name: "Intismeran autogene + pembrolizumab" }, { name: "Placebo + pembrolizumab" }], note: "Met; hazard ratio and medians not yet disclosed (topline 19 August 2026).", source: "https://www.merck.com/news/merck-and-moderna-announce-phase-3-interpath-001-trial-of-intismeran-autogene-plus-keytruda-met-endpoints-of-recurrence-free-survival-rfs-and-distant-metastasis-free-survival-dmfs-in-patient/" },
      { endpoint: "Distant metastasis-free survival", arms: [{ name: "Intismeran autogene + pembrolizumab" }, { name: "Placebo + pembrolizumab" }], note: "Met; numbers pending presentation." },
    ],
    replication: "Confirms the phase 2b KEYNOTE-942 signal (RFS HR 0.51 at 3 years) in a randomised phase 3; full data pending.",
  },

  // ---------------- GU ----------------
  "ev-302": {
    enrolled: 886,
    outcomes: [
      { endpoint: "Progression-free survival (BICR)", primary: true, unit: "months", arms: [{ name: "Enfortumab vedotin + pembrolizumab", n: 442, value: 12.5 }, { name: "Platinum + gemcitabine", n: 444, value: 6.3 }], hr: 0.45, ci: [0.38, 0.54], p: "<0.001", source: nejm("NEJMoa2312117") },
      { endpoint: "Overall survival", primary: true, unit: "months", arms: [{ name: "Enfortumab vedotin + pembrolizumab", value: 31.5 }, { name: "Platinum + gemcitabine", value: 16.1 }], hr: 0.47, ci: [0.38, 0.58], p: "<0.001", source: nejm("NEJMoa2312117") },
      { endpoint: "Objective response rate", unit: "%", arms: [{ name: "Enfortumab vedotin + pembrolizumab", value: 67.7 }, { name: "Platinum + gemcitabine", value: 44.4 }], source: nejm("NEJMoa2312117") },
    ],
    replication: "Confirms EV-103 (phase 1b/2, ORR 68%); the extended follow-up in 2025 maintained the OS hazard ratio.",
  },
  imvigor011: {
    enrolled: 761,
    outcomes: [
      { endpoint: "Disease-free survival (ctDNA-positive, randomised)", primary: true, unit: "months", arms: [{ name: "Atezolizumab", n: 167, value: 9.9 }, { name: "Placebo", n: 83, value: 4.8 }], hr: 0.64, ci: [0.47, 0.88], p: "0.005", source: "https://www.roche.com/media/releases/med-cor-2025-10-20b" },
      { endpoint: "Overall survival (ctDNA-positive)", unit: "months", arms: [{ name: "Atezolizumab", value: 32.8 }, { name: "Placebo", value: 21.1 }], hr: 0.59, ci: [0.41, 0.86], p: "0.005", source: "https://www.roche.com/media/releases/med-cor-2025-10-20b" },
      { endpoint: "Disease-free survival at 12 months, persistently ctDNA-negative (untreated surveillance)", unit: "%", arms: [{ name: "ctDNA-negative, surveillance only", n: 357, value: 95.4 }], note: "12-month OS 100% in this group", source: "https://www.roche.com/media/releases/med-cor-2025-10-20b" },
    ],
    replication: "Contrasts with IMvigor010 (unselected adjuvant atezolizumab, negative), whose exploratory ctDNA analysis generated the hypothesis; IMvigor011 is the prospective confirmation.",
  },
  vision: {
    enrolled: 861,
    outcomes: [
      { endpoint: "Overall survival", primary: true, unit: "months", arms: [{ name: "177Lu-PSMA-617 + standard care", n: 551, value: 15.3 }, { name: "Standard care", n: 280, value: 11.3 }], hr: 0.62, ci: [0.52, 0.74], p: "<0.001", source: nejm("NEJMoa2107322") },
      { endpoint: "Radiographic progression-free survival", primary: true, unit: "months", arms: [{ name: "177Lu-PSMA-617 + standard care", value: 8.7 }, { name: "Standard care", value: 3.4 }], hr: 0.40, ci: [0.29, 0.57], p: "<0.001", source: nejm("NEJMoa2107322") },
    ],
    replication: "Consistent with TheraP (phase 2, 177Lu-PSMA-617 vs cabazitaxel: higher PSA response, similar OS) and with PSMAfore in an earlier line.",
  },
  psmafore: {
    enrolled: 469,
    outcomes: [
      { endpoint: "Radiographic progression-free survival", primary: true, unit: "months", arms: [{ name: "177Lu-PSMA-617", n: 234, value: 12.0 }, { name: "ARPI switch", n: 234, value: 5.6 }], hr: 0.41, ci: [0.29, 0.56], p: "<0.0001", source: "https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(24)01653-2/fulltext" },
      { endpoint: "Overall survival (crossover-adjusted)", unit: "months", arms: [{ name: "177Lu-PSMA-617" }, { name: "ARPI switch" }], hr: 0.59, note: "Unadjusted OS HR 0.98 with 84% crossover from control", source: "https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(24)01653-2/fulltext" },
    ],
    replication: "Confirms VISION in the pre-chemotherapy line; SPLASH (177Lu-PSMA-I&T) showed a smaller rPFS effect and no OS benefit, so agent and setting details matter.",
  },

  // ---------------- Early detection / MRD ----------------
  "nhs-galleri": {
    enrolled: 142000,
    outcomes: [
      { endpoint: "Stage III to IV incidence, 12 prespecified cancers (primary)", primary: true, arms: [{ name: "Galleri + standard screening" }, { name: "Standard screening" }], note: "Not met: no statistically significant reduction within one year of the last screen; a fall in stage IV was offset by a rise in stage III.", source: "https://ascopost.com/news/june-2026/annual-galleri-screening-reduced-stage-iv-cancer-diagnoses-but-missed-primary-endpoint-in-first-randomized-mced-trial/" },
      { endpoint: "Relative reduction in stage IV diagnoses, rounds 2 and 3", unit: "%", arms: [{ name: "Round 2", value: 22 }, { name: "Round 3", value: 26 }], note: "Relative reduction versus control in the 12 prespecified cancers", source: "https://grail.com/press-releases/grail-reports-full-results-from-nhs-galleri-trial-demonstrating-substantial-reduction-in-stage-iv-cancer-diagnoses-at-2026-asco-annual-meeting/" },
      { endpoint: "Relative reduction in diagnosis through emergency presentation", unit: "%", arms: [{ name: "Galleri + standard screening", value: 25 }], source: "https://grail.com/press-releases/grail-reports-full-results-from-nhs-galleri-trial-demonstrating-substantial-reduction-in-stage-iv-cancer-diagnoses-at-2026-asco-annual-meeting/" },
    ],
    replication: "The only randomised MCED trial; PATHFINDER 2 (single-arm) is consistent on detection rate and PPV. Mortality benefit remains untested.",
  },
  "pathfinder-2": {
    enrolled: 35883,
    outcomes: [
      { endpoint: "Cancer signal detected", unit: "%", arms: [{ name: "Galleri, all participants", n: 25578, value: 0.93 }], source: ct("NCT05155605") },
      { endpoint: "Positive predictive value", unit: "%", arms: [{ name: "Galleri", value: 61.6 }], source: ct("NCT05155605") },
      { endpoint: "Specificity", unit: "%", arms: [{ name: "Galleri", value: 99.6 }], source: ct("NCT05155605") },
    ],
    replication: "Improves on PATHFINDER 1 (PPV 43%) with the refined classifier; the randomised NHS-Galleri trial did not meet its stage-shift primary endpoint.",
  },
  dynamic: {
    enrolled: 455,
    outcomes: [
      { endpoint: "Recurrence-free survival at 2 years (non-inferiority)", primary: true, unit: "%", arms: [{ name: "ctDNA-guided management", n: 302, value: 93.5 }, { name: "Standard management", n: 153, value: 92.4 }], note: "Non-inferiority met (margin −8.5 points)", source: nejm("NEJMoa2200075") },
      { endpoint: "Patients receiving adjuvant chemotherapy", unit: "%", arms: [{ name: "ctDNA-guided management", value: 15 }, { name: "Standard management", value: 28 }], p: "<0.001", source: nejm("NEJMoa2200075") },
    ],
    replication: "Supported by observational cohorts (CIRCULATE-Japan GALAXY); DYNAMIC-III in stage III gave a more nuanced result, and randomised escalation trials are ongoing.",
  },

  // ---------------- Pipeline (ongoing) ----------------
  "ascent-05": { enrolled: 1514, outcomes: [], replication: "Ongoing; no results." },
  "tropion-breast03": { enrolled: 1174, outcomes: [], replication: "Ongoing; no results." },

  // ---------------- Trials that live in cancer spike files ----------------
  // These entries are not applied until spikes/index.ts merges TRIAL_OUTCOMES into spike entities.
  crown: {
    enrolled: 296,
    outcomes: [
      { endpoint: "Progression-free survival at 5 years (BICR)", primary: true, unit: "%", arms: [{ name: "Lorlatinib", n: 149, value: 60 }, { name: "Crizotinib", n: 147, value: 8 }], hr: 0.19, ci: [0.13, 0.27], source: "https://ascopubs.org/doi/10.1200/JCO.24.00581" },
      { endpoint: "Intracranial progression at 5 years", unit: "%", arms: [{ name: "Lorlatinib", value: 8 }, { name: "Crizotinib", value: 40 }], note: "Cumulative incidence in patients without baseline brain metastases", source: "https://ascopubs.org/doi/10.1200/JCO.24.00581" },
    ],
    replication: "Single pivotal trial versus crizotinib; consistent with ALEX (alectinib) and eXalt3 (ensartinib) for the class, with lorlatinib showing the longest PFS.",
  },
  alina: {
    enrolled: 257,
    outcomes: [{ endpoint: "Disease-free survival, stage II to IIIA", primary: true, unit: "months", arms: [{ name: "Alectinib", n: 116, note: "Median not reached" }, { name: "Platinum chemotherapy", n: 115, value: 44.4 }], hr: 0.24, ci: [0.13, 0.45], p: "<0.001", source: nejm("NEJMoa2310532") }],
    replication: "Mirrors ADAURA (adjuvant osimertinib) for a second oncogene; OS immature.",
  },
  pacific: {
    enrolled: 713,
    outcomes: [
      { endpoint: "Progression-free survival (BICR)", primary: true, unit: "months", arms: [{ name: "Durvalumab", n: 476, value: 16.8 }, { name: "Placebo", n: 237, value: 5.6 }], hr: 0.52, ci: [0.42, 0.65], p: "<0.001", source: nejm("NEJMoa1709937") },
      { endpoint: "Overall survival at 5 years", primary: true, unit: "%", arms: [{ name: "Durvalumab", value: 42.9 }, { name: "Placebo", value: 33.4 }], hr: 0.72, ci: [0.59, 0.89], source: "https://ascopubs.org/doi/10.1200/JCO.21.01308" },
    ],
    replication: "Confirmed by the real-world PACIFIC-R cohort and by GEMSTONE-301 (sugemalimab) in the same setting.",
  },
  laura: {
    enrolled: 216,
    outcomes: [{ endpoint: "Progression-free survival (BICR)", primary: true, unit: "months", arms: [{ name: "Osimertinib", n: 143, value: 39.1 }, { name: "Placebo", n: 73, value: 5.6 }], hr: 0.16, ci: [0.10, 0.24], p: "<0.001", source: nejm("NEJMoa2402614") }],
    replication: "Single pivotal trial; consistent with ADAURA in showing large EGFR-TKI benefit after local therapy. OS immature.",
  },
  "checkmate-816": {
    enrolled: 358,
    outcomes: [
      { endpoint: "Pathologic complete response", primary: true, unit: "%", arms: [{ name: "Nivolumab + chemotherapy", n: 179, value: 24.0 }, { name: "Chemotherapy", n: 179, value: 2.2 }], p: "<0.001", source: nejm("NEJMoa2202170") },
      { endpoint: "Event-free survival", primary: true, unit: "months", arms: [{ name: "Nivolumab + chemotherapy", value: 31.6 }, { name: "Chemotherapy", value: 20.8 }], hr: 0.63, ci: [0.43, 0.91], p: "0.005", source: nejm("NEJMoa2202170") },
      { endpoint: "Overall survival at 5 years", unit: "%", arms: [{ name: "Nivolumab + chemotherapy", value: 65 }, { name: "Chemotherapy", value: 55 }], hr: 0.72, ci: [0.52, 0.99], source: nejm("NEJMoa2502256") },
    ],
    replication: "Confirmed by the perioperative trials KEYNOTE-671, AEGEAN, CheckMate 77T, and NEOTORCH, which all reproduced the EFS benefit.",
  },
  "keynote-671": {
    enrolled: 797,
    outcomes: [
      { endpoint: "Event-free survival", primary: true, unit: "months", arms: [{ name: "Pembrolizumab + chemotherapy → pembrolizumab", n: 397, value: 47.2 }, { name: "Placebo + chemotherapy → placebo", n: 400, value: 18.3 }], hr: 0.59, ci: [0.48, 0.72], source: nejm("NEJMoa2302983") },
      { endpoint: "Overall survival at 36 months", primary: true, unit: "%", arms: [{ name: "Pembrolizumab arm", value: 71.3 }, { name: "Placebo arm", value: 64.0 }], hr: 0.72, ci: [0.56, 0.93], p: "0.005", source: "https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(23)02241-2/fulltext" },
    ],
    replication: "Consistent with CheckMate 816, AEGEAN, CheckMate 77T, and NEOTORCH; the first perioperative regimen with an OS benefit.",
  },
  "keynote-024-189": {
    enrolled: 921,
    outcomes: [
      { endpoint: "KEYNOTE-024: overall survival at 5 years, PD-L1 ≥50%", primary: true, unit: "%", arms: [{ name: "Pembrolizumab", n: 154, value: 31.9 }, { name: "Chemotherapy", n: 151, value: 16.3 }], hr: 0.62, ci: [0.48, 0.81], source: "https://ascopubs.org/doi/10.1200/JCO.21.00174" },
      { endpoint: "KEYNOTE-189: overall survival, non-squamous", primary: true, unit: "months", arms: [{ name: "Pembrolizumab + chemotherapy", n: 410, value: 22.0 }, { name: "Placebo + chemotherapy", n: 206, value: 10.6 }], hr: 0.60, ci: [0.50, 0.72], source: "https://ascopubs.org/doi/10.1200/JCO.22.00975" },
    ],
    replication: "Replicated by KEYNOTE-042 (PD-L1 ≥1%), KEYNOTE-407 (squamous), IMpower150, and CheckMate 227/9LA; the most replicated result in lung immunotherapy.",
  },
  "harmoni-2": {
    enrolled: 398,
    outcomes: [{ endpoint: "Progression-free survival (IRRC)", primary: true, unit: "months", arms: [{ name: "Ivonescimab", n: 198, value: 11.1 }, { name: "Pembrolizumab", n: 200, value: 5.8 }], hr: 0.51, ci: [0.38, 0.69], p: "<0.0001", source: "https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(24)02722-3/fulltext" }],
    replication: "Single-country (China) trial; OS immature. The global HARMONi-3 interim did not reproduce the PFS margin, so replication outside China is unresolved.",
  },
  "harmoni-3": {
    enrolled: 1080,
    outcomes: [{ endpoint: "Progression-free survival (interim analysis, May 2026)", primary: true, unit: "months", arms: [{ name: "Ivonescimab + chemotherapy" }, { name: "Pembrolizumab + chemotherapy" }], note: "Interim PFS analysis did not reach statistical significance per the sponsor (announced 30 April 2026); hazard ratio and medians not disclosed. Final PFS and OS analyses pending.", source: ct("NCT05899608") }],
    replication: "Ongoing; interim PFS analysis in 2026 did not meet significance per the sponsor; OS pending.",
  },
  "herthena-lung02": {
    enrolled: 586,
    outcomes: [
      { endpoint: "Progression-free survival (BICR)", primary: true, unit: "months", arms: [{ name: "Patritumab deruxtecan", n: 293, value: 5.8 }, { name: "Platinum + pemetrexed", n: 293, value: 5.4 }], hr: 0.77, ci: [0.63, 0.94], p: "0.011", source: ct("NCT05338970") },
      { endpoint: "Overall survival", unit: "months", arms: [{ name: "Patritumab deruxtecan", value: 16.8 }, { name: "Platinum + pemetrexed", value: 16.8 }], hr: 0.98, ci: [0.79, 1.22], note: "Not significant", source: ct("NCT05338970") },
    ],
    replication: "Did not replicate the single-arm HERTHENA-Lung01 response signal into an OS benefit; the US filing was withdrawn.",
  },
  "tropion-lung05": {
    enrolled: 137,
    outcomes: [{ endpoint: "Objective response rate (BICR)", primary: true, unit: "%", arms: [{ name: "Datopotamab deruxtecan, all", n: 137, value: 35.8 }, { name: "EGFR-mutant subgroup", n: 78, value: 43.6 }], source: "https://ascopubs.org/doi/10.1200/JCO.24.00821" }],
    replication: "Single-arm phase 2 that supported the EGFR-mutant NSCLC approval; TROPION-Lung15 (randomised) will be the confirmatory trial.",
  },
  "krystal-12": {
    enrolled: 453,
    outcomes: [{ endpoint: "Progression-free survival (BICR)", primary: true, unit: "months", arms: [{ name: "Adagrasib", n: 301, value: 5.5 }, { name: "Docetaxel", n: 152, value: 3.8 }], hr: 0.58, ci: [0.45, 0.76], p: "<0.0001", source: ct("NCT04685135") }],
    replication: "Consistent with CodeBreaK 200 (sotorasib vs docetaxel, PFS HR 0.66); neither trial showed an OS benefit.",
  },
  "codebreak-200": {
    enrolled: 345,
    outcomes: [
      { endpoint: "Progression-free survival (BICR)", primary: true, unit: "months", arms: [{ name: "Sotorasib", n: 171, value: 5.6 }, { name: "Docetaxel", n: 174, value: 4.5 }], hr: 0.66, ci: [0.51, 0.86], p: "0.0017", source: "https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(23)00221-0/fulltext" },
      { endpoint: "Overall survival", unit: "months", arms: [{ name: "Sotorasib", value: 10.6 }, { name: "Docetaxel", value: 11.3 }], hr: 1.01, note: "Not significant; crossover permitted", source: "https://doi.org/10.1016/S0140-6736(23)00221-0" },
    ],
    replication: "Consistent with KRYSTAL-12 (adagrasib) on PFS; the FDA declined full approval at the 960 mg dose pending further data.",
  },
  "krascendo-1": {
    enrolled: 338,
    outcomes: [
      { endpoint: "Progression-free survival (BICR)", primary: true, unit: "months", arms: [{ name: "Divarasib" }, { name: "Sotorasib or adagrasib" }], note: "Primary endpoint met with a statistically significant, clinically meaningful improvement per the sponsor (topline 2 July 2026); medians and hazard ratio pending presentation.", source: ct("NCT06497556") },
      { endpoint: "Overall survival (interim)", unit: "months", arms: [{ name: "Divarasib" }, { name: "Sotorasib or adagrasib" }], note: "Statistically significant OS improvement at the interim analysis per the sponsor; numbers pending.", source: ct("NCT06497556") },
    ],
    replication: "Topline reported July 2026; numbers pending presentation. First head-to-head phase 3 among KRAS G12C inhibitors, so no independent replication yet.",
  },
  "libretto-431": {
    enrolled: 261,
    outcomes: [{ endpoint: "Progression-free survival (BICR), ITT-pembrolizumab population", primary: true, unit: "months", arms: [{ name: "Selpercatinib", n: 129, value: 24.8 }, { name: "Platinum-pemetrexed ± pembrolizumab", n: 83, value: 11.2 }], hr: 0.46, ci: [0.31, 0.70], p: "<0.001", source: nejm("NEJMoa2309457") }],
    replication: "Consistent with the single-arm LIBRETTO-001 (ORR 84% treatment-naive); pralsetinib (ARROW) supports the RET class.",
  },
  "telimet-nsclc-01": { enrolled: 698, outcomes: [], replication: "Ongoing confirmatory trial for the LUMINOSITY-based accelerated approval." },
  "alkove-1": {
    enrolled: 432,
    outcomes: [{ endpoint: "Objective response rate, TKI-pretreated ALK+ NSCLC (pivotal cohort)", primary: true, unit: "%", arms: [{ name: "Neladalkib, lorlatinib-pretreated", value: 51 }], source: ct("NCT05384626") }],
    replication: "Single-arm pivotal; ALKAZAR (randomised vs alectinib, first line) is ongoing.",
  },
  "soho-01": {
    enrolled: 407,
    outcomes: [{ endpoint: "Objective response rate, HER2-mutant NSCLC after platinum (Cohort D)", primary: true, unit: "%", arms: [{ name: "Sevabertinib 20 mg", value: 70.5 }], source: ct("NCT05099172") }],
    replication: "Single-arm pivotal; consistent with zongertinib (Beamion LUNG-1, ORR 71%) for oral HER2 inhibition.",
  },
  "nlst-nelson": {
    enrolled: 53454,
    outcomes: [
      { endpoint: "NLST: relative reduction in lung cancer mortality", primary: true, unit: "%", arms: [{ name: "Low-dose CT vs chest X-ray", value: 20 }], ci: [6.8, 26.7], source: nejm("NEJMoa1102873") },
      { endpoint: "NELSON: relative reduction in lung cancer mortality at 10 years (men)", primary: true, unit: "%", arms: [{ name: "Low-dose CT vs no screening", value: 24 }], source: nejm("NEJMoa1911793") },
    ],
    replication: "Two independent randomised trials on two continents agree; MILD and LUSI are consistent.",
  },
  // Prostate
  protect: {
    enrolled: 1643,
    outcomes: [{ endpoint: "Prostate-cancer-specific mortality at 15 years", primary: true, unit: "%", arms: [{ name: "Active monitoring", n: 545, value: 3.1 }, { name: "Prostatectomy", n: 553, value: 2.2 }, { name: "Radiotherapy", n: 545, value: 2.9 }], note: "No significant difference between arms", source: nejm("NEJMoa2214122") }],
    replication: "Consistent with PIVOT and SPCG-4 in showing very low mortality from low- and intermediate-risk disease under conservative management.",
  },
  "precision-mri": {
    enrolled: 500,
    outcomes: [{ endpoint: "Detection of clinically significant cancer", primary: true, unit: "%", arms: [{ name: "MRI-targeted biopsy", n: 252, value: 38 }, { name: "Standard TRUS biopsy", n: 248, value: 26 }], p: "0.005", source: nejm("NEJMoa1801993") }],
    replication: "Confirmed by PRECISE, MRI-FIRST, and the Göteborg-2 screening trial.",
  },
  stampede: {
    enrolled: 11992,
    outcomes: [
      { endpoint: "Overall survival, abiraterone arm (M1 subgroup)", primary: true, unit: "%", arms: [{ name: "ADT + abiraterone", note: "6-year OS 60%" }, { name: "ADT alone", note: "6-year OS 45%" }], hr: 0.60, ci: [0.50, 0.71], source: "https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(22)00367-1/fulltext" },
      { endpoint: "Overall survival, docetaxel arm (M1)", unit: "months", arms: [{ name: "ADT + docetaxel", value: 60 }, { name: "ADT alone", value: 45 }], hr: 0.76, source: "https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(15)01037-5/fulltext" },
    ],
    replication: "Abiraterone result replicated by LATITUDE; docetaxel result replicated by CHAARTED.",
  },
  chaarted: {
    enrolled: 790,
    outcomes: [{ endpoint: "Overall survival", primary: true, unit: "months", arms: [{ name: "ADT + docetaxel", n: 397, value: 57.6 }, { name: "ADT alone", n: 393, value: 44.0 }], hr: 0.61, ci: [0.47, 0.80], p: "<0.001", source: nejm("NEJMoa1503747") }],
    replication: "Replicated by STAMPEDE arm C; benefit concentrated in high-volume disease.",
  },
  latitude: {
    enrolled: 1209,
    outcomes: [{ endpoint: "Overall survival", primary: true, unit: "months", arms: [{ name: "ADT + abiraterone", n: 597, value: 53.3 }, { name: "ADT + placebo", n: 602, value: 36.5 }], hr: 0.66, ci: [0.56, 0.78], p: "<0.0001", source: "https://www.thelancet.com/journals/lanonc/article/PIIS1470-2045(19)30082-8/fulltext" }],
    replication: "Replicated by STAMPEDE arm G.",
  },
  arches: {
    enrolled: 1150,
    outcomes: [
      { endpoint: "Radiographic progression-free survival", primary: true, unit: "months", arms: [{ name: "ADT + enzalutamide", n: 574, note: "Median not reached" }, { name: "ADT + placebo", n: 576, value: 19.0 }], hr: 0.39, ci: [0.30, 0.50], p: "<0.001", source: "https://ascopubs.org/doi/10.1200/JCO.19.00799" },
      { endpoint: "Overall survival", unit: "months", arms: [{ name: "ADT + enzalutamide" }, { name: "ADT + placebo" }], hr: 0.66, ci: [0.53, 0.81], note: "Medians not reached at the final analysis", source: "https://ascopubs.org/doi/10.1200/JCO.22.00193" },
    ],
    replication: "Replicated by ENZAMET (enzalutamide) and TITAN (apalutamide).",
  },
  arasens: {
    enrolled: 1306,
    outcomes: [{ endpoint: "Overall survival", primary: true, unit: "months", arms: [{ name: "Darolutamide + ADT + docetaxel", n: 651, note: "Median not reached" }, { name: "Placebo + ADT + docetaxel", n: 655, value: 48.9 }], hr: 0.68, ci: [0.57, 0.80], p: "<0.001", source: nejm("NEJMoa2119115") }],
    replication: "Consistent with PEACE-1 (abiraterone triplet) in de novo metastatic disease.",
  },
  "peace-1": {
    enrolled: 1173,
    outcomes: [{ endpoint: "Overall survival, abiraterone vs no abiraterone (with ADT + docetaxel)", primary: true, unit: "months", arms: [{ name: "Abiraterone + ADT + docetaxel", value: 66 }, { name: "ADT + docetaxel", value: 52 }], hr: 0.75, ci: [0.59, 0.95], p: "0.017", source: "https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(22)00367-1/fulltext" }],
    replication: "Consistent with ARASENS for triplet therapy in high-volume de novo disease.",
  },
  embark: {
    enrolled: 1068,
    outcomes: [{ endpoint: "Metastasis-free survival, enzalutamide + leuprolide vs leuprolide", primary: true, unit: "%", arms: [{ name: "Enzalutamide + leuprolide, 5-year MFS", n: 355, value: 87.3 }, { name: "Leuprolide alone, 5-year MFS", n: 358, value: 71.4 }], hr: 0.42, ci: [0.30, 0.61], p: "<0.001", source: nejm("NEJMoa2303974") }],
    replication: "Single pivotal trial in high-risk biochemical recurrence; OS immature.",
  },
  profound: {
    enrolled: 387,
    outcomes: [
      { endpoint: "Radiographic progression-free survival, cohort A (BRCA1/2, ATM)", primary: true, unit: "months", arms: [{ name: "Olaparib", n: 162, value: 7.4 }, { name: "Enzalutamide or abiraterone", n: 83, value: 3.6 }], hr: 0.34, ci: [0.25, 0.47], p: "<0.001", source: nejm("NEJMoa1911440") },
      { endpoint: "Overall survival, cohort A", unit: "months", arms: [{ name: "Olaparib", value: 19.1 }, { name: "Enzalutamide or abiraterone", value: 14.7 }], hr: 0.69, ci: [0.50, 0.97], p: "0.02", source: nejm("NEJMoa2022485") },
    ],
    replication: "Consistent with TRITON3 (rucaparib in BRCA-altered mCRPC).",
  },
  propel: {
    enrolled: 796,
    outcomes: [
      { endpoint: "Radiographic progression-free survival (investigator), all comers", primary: true, unit: "months", arms: [{ name: "Olaparib + abiraterone", n: 399, value: 24.8 }, { name: "Placebo + abiraterone", n: 397, value: 16.6 }], hr: 0.66, ci: [0.54, 0.81], p: "<0.001", source: "https://evidence.nejm.org/doi/full/10.1056/EVIDoa2200043" },
      { endpoint: "Overall survival, all comers", unit: "months", arms: [{ name: "Olaparib + abiraterone", value: 42.1 }, { name: "Placebo + abiraterone", value: 34.7 }], hr: 0.81, ci: [0.67, 1.00], note: "Not significant; larger effect in BRCA-mutant", source: "https://www.thelancet.com/journals/lanonc/article/PIIS1470-2045(23)00382-9/fulltext" },
    ],
    replication: "Consistent with MAGNITUDE and TALAPRO-2 in HRR-mutant disease; the all-comers benefit is debated and labels differ by region.",
  },
  "talapro-2": {
    enrolled: 805,
    outcomes: [
      { endpoint: "Radiographic progression-free survival, all comers", primary: true, unit: "months", arms: [{ name: "Talazoparib + enzalutamide", n: 402, note: "Median not reached" }, { name: "Placebo + enzalutamide", n: 403, value: 21.9 }], hr: 0.63, ci: [0.51, 0.78], p: "<0.0001", source: "https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(23)01055-3/fulltext" },
      { endpoint: "Overall survival, all comers (final)", unit: "months", arms: [{ name: "Talazoparib + enzalutamide", value: 45.8 }, { name: "Placebo + enzalutamide", value: 37.0 }], hr: 0.80, ci: [0.66, 0.96], p: "0.016", source: ct("NCT03395197") },
    ],
    replication: "Consistent with PROpel and MAGNITUDE; the only PARP + ARPI combination with a significant all-comer OS benefit.",
  },
  magnitude: {
    enrolled: 423,
    outcomes: [{ endpoint: "Radiographic progression-free survival, BRCA1/2 subgroup", primary: true, unit: "months", arms: [{ name: "Niraparib + abiraterone", n: 113, value: 16.6 }, { name: "Placebo + abiraterone", n: 112, value: 10.9 }], hr: 0.53, ci: [0.36, 0.79], p: "0.001", source: "https://ascopubs.org/doi/10.1200/JCO.22.01649" }],
    replication: "Consistent with PROpel and TALAPRO-2 in BRCA-mutant disease; the HRR-negative cohort showed no benefit and was stopped for futility.",
  },
  "capitello-281": {
    enrolled: 1012,
    outcomes: [{ endpoint: "Radiographic progression-free survival, PTEN-deficient mHSPC", primary: true, unit: "months", arms: [{ name: "Capivasertib + abiraterone + ADT", value: 40.0 }, { name: "Placebo + abiraterone + ADT", value: 31.7 }], hr: 0.81, ci: [0.68, 0.96], p: "0.017", source: ct("NCT04493853") }],
    replication: "Single pivotal trial; OS immature.",
  },
  alsympca: {
    enrolled: 921,
    outcomes: [{ endpoint: "Overall survival", primary: true, unit: "months", arms: [{ name: "Radium-223", n: 614, value: 14.9 }, { name: "Placebo", n: 307, value: 11.3 }], hr: 0.70, ci: [0.58, 0.83], p: "<0.001", source: nejm("NEJMoa1213755") }],
    replication: "Single pivotal trial; the ERA 223 combination with abiraterone was harmful, so use is now restricted to monotherapy in bone-predominant disease.",
  },
  propsma: {
    enrolled: 302,
    outcomes: [{ endpoint: "Accuracy for pelvic nodal or distant metastases (AUC)", primary: true, unit: "%", arms: [{ name: "PSMA PET/CT", n: 150, value: 92 }, { name: "CT + bone scan", n: 152, value: 65 }], p: "<0.0001", source: "https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(20)30314-7/fulltext" }],
    replication: "Consistent with the OSPREY and CONDOR registrational studies for 18F-DCFPyL.",
  },
  therap: {
    enrolled: 201,
    outcomes: [
      { endpoint: "PSA response ≥50%", primary: true, unit: "%", arms: [{ name: "177Lu-PSMA-617", n: 99, value: 66 }, { name: "Cabazitaxel", n: 101, value: 37 }], p: "<0.0001", source: "https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(21)00237-3/fulltext" },
      { endpoint: "Overall survival", unit: "months", arms: [{ name: "177Lu-PSMA-617", value: 19.1 }, { name: "Cabazitaxel", value: 19.6 }], hr: 0.97, note: "Not different", source: "https://www.thelancet.com/journals/lanonc/article/PIIS1470-2045(23)00529-6/fulltext" },
    ],
    replication: "Consistent with VISION on activity; the OS equivalence with cabazitaxel is an important nuance for sequencing.",
  },
  psmaddition: {
    enrolled: 1144,
    outcomes: [{ endpoint: "Radiographic progression-free survival", primary: true, unit: "months", arms: [{ name: "177Lu-PSMA-617 + standard care (ARPI + ADT)" }, { name: "Standard care" }], hr: 0.72, ci: [0.58, 0.89], p: "0.0016", note: "Updated HR 0.67; OS HR 0.80, immature", source: ct("NCT04720157") }],
    replication: "Extends VISION and PSMAfore into hormone-sensitive disease; supported the July 2026 label expansion.",
  },
  splash: {
    enrolled: 455,
    outcomes: [
      { endpoint: "Radiographic progression-free survival", primary: true, unit: "months", arms: [{ name: "177Lu-PNT2002 (PSMA-I&T)", n: 276, value: 9.5 }, { name: "ARPI switch", n: 136, value: 6.0 }], hr: 0.71, ci: [0.55, 0.92], p: "0.0088", source: ct("NCT04647526") },
      { endpoint: "Overall survival (interim)", unit: "months", arms: [{ name: "177Lu-PNT2002" }, { name: "ARPI switch" }], hr: 1.11, note: "Numerically unfavourable at interim with crossover", source: ct("NCT04647526") },
    ],
    replication: "Smaller effect than PSMAfore (rPFS HR 0.41) with a different ligand and dosing; ECLIPSE (177Lu-PSMA-I&T) met rPFS.",
  },
  "eclipse-psma": {
    enrolled: 439,
    outcomes: [{ endpoint: "Radiographic progression-free survival", primary: true, unit: "months", arms: [{ name: "177Lu-PSMA-I&T" }, { name: "ARPI switch" }], note: "Met per sponsor; medians pending publication", source: ct("NCT05204927") }],
    replication: "Consistent with PSMAfore for the pre-chemotherapy setting; OS pending.",
  },
  alphabreak: { enrolled: 600, outcomes: [], replication: "Ongoing phase 3 of 225Ac-PSMA-I&T after 177Lu-PSMA; no results." },
  xalute: { enrolled: 707, outcomes: [], replication: "Ongoing phase 3 of xaluritamig vs cabazitaxel/ARPI; no results." },
  "mevpro-1": { enrolled: 600, outcomes: [], replication: "Ongoing phase 3 of mevrometostat + enzalutamide; no results." },
  // Pancreatic
  "rasolute-302": {
    enrolled: 500,
    outcomes: [{ endpoint: "Overall survival", primary: true, unit: "months", arms: [{ name: "Daraxonrasib", value: 13.2 }, { name: "Chemotherapy (gemcitabine/nab-paclitaxel or mFOLFOX6)", value: 6.7 }], hr: 0.40, source: ct("NCT06625320") }],
    replication: "Single pivotal trial reported 2026; consistent with the phase 1/2 signal (median OS ~14.5 months in second line). First-line RASolute 303 ongoing.",
  },
  "napoli-3": {
    enrolled: 770,
    outcomes: [{ endpoint: "Overall survival", primary: true, unit: "months", arms: [{ name: "NALIRIFOX", n: 383, value: 11.1 }, { name: "Gemcitabine + nab-paclitaxel", n: 387, value: 9.2 }], hr: 0.83, ci: [0.70, 0.99], p: "0.036", source: "https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(23)01366-1/fulltext" }],
    replication: "Consistent in direction with PRODIGE 4/ACCORD 11 (FOLFIRINOX vs gemcitabine); no direct FOLFIRINOX comparison.",
  },
  "prodige-24": {
    enrolled: 493,
    outcomes: [{ endpoint: "Disease-free survival", primary: true, unit: "months", arms: [{ name: "Adjuvant mFOLFIRINOX", n: 247, value: 21.6 }, { name: "Adjuvant gemcitabine", n: 246, value: 12.8 }], hr: 0.58, ci: [0.46, 0.73], p: "<0.001", source: nejm("NEJMoa1809775") }, { endpoint: "Overall survival (5-year update)", unit: "months", arms: [{ name: "Adjuvant mFOLFIRINOX", value: 53.5 }, { name: "Adjuvant gemcitabine", value: 35.5 }], hr: 0.68, source: "https://jamanetwork.com/journals/jamaoncology/fullarticle/2795896" }],
    replication: "Consistent with APACT (gemcitabine/nab-paclitaxel, smaller effect) and with the neoadjuvant PREOPANC-2 comparison.",
  },
  preopanc: {
    enrolled: 246,
    outcomes: [{ endpoint: "Overall survival (long-term)", primary: true, unit: "%", arms: [{ name: "Neoadjuvant chemoradiotherapy, 5-year OS", n: 119, value: 20.5 }, { name: "Upfront surgery, 5-year OS", n: 127, value: 6.5 }], hr: 0.73, ci: [0.56, 0.96], p: "0.025", source: "https://ascopubs.org/doi/10.1200/JCO.21.02233" }],
    replication: "Supported by PREOPANC-2 and ALLIANCE A021806 in favour of neoadjuvant therapy in (borderline) resectable disease.",
  },
  polo: {
    enrolled: 154,
    outcomes: [
      { endpoint: "Progression-free survival", primary: true, unit: "months", arms: [{ name: "Olaparib maintenance", n: 92, value: 7.4 }, { name: "Placebo", n: 62, value: 3.8 }], hr: 0.53, ci: [0.35, 0.82], p: "0.004", source: nejm("NEJMoa1903387") },
      { endpoint: "Overall survival", unit: "months", arms: [{ name: "Olaparib maintenance", value: 19.0 }, { name: "Placebo", value: 19.2 }], hr: 0.83, note: "Not significant", source: "https://ascopubs.org/doi/10.1200/JCO.21.01604" },
    ],
    replication: "Single pivotal trial; PFS but not OS. No confirmatory trial.",
  },
  "panova-3": {
    enrolled: 571,
    outcomes: [{ endpoint: "Overall survival", primary: true, unit: "months", arms: [{ name: "TTFields + gemcitabine/nab-paclitaxel", n: 284, value: 16.2 }, { name: "Gemcitabine/nab-paclitaxel", n: 287, value: 14.2 }], hr: 0.82, ci: [0.68, 0.99], p: "0.039", source: "https://ascopubs.org/doi/10.1200/JCO.25.00361" }],
    replication: "Single pivotal trial; open-label design and modest effect size are debated.",
  },
  "amplify-7p": {
    enrolled: 158,
    outcomes: [
      { endpoint: "Disease-free survival (ITT)", primary: true, unit: "months", arms: [{ name: "ELI-002 7P" }, { name: "Observation" }], note: "Primary endpoint not met (sponsor release, 15 June 2026); ITT hazard ratio and medians not disclosed.", source: "https://elicio.com/press_releases/elicio-therapeutics-reports-results-from-phase-2-amplify-7p-study-and-outlines-refined-phase-3-development-strategy-for-eli-002-7p-in-adjuvant-pancreatic-cancer/" },
      { endpoint: "Disease-free survival at 3 months (landmark)", unit: "%", arms: [{ name: "ELI-002 7P", value: 90.3 }, { name: "Observation", value: 76.6 }], p: "0.022", source: "https://elicio.com/press_releases/elicio-therapeutics-reports-results-from-phase-2-amplify-7p-study-and-outlines-refined-phase-3-development-strategy-for-eli-002-7p-in-adjuvant-pancreatic-cancer/" },
      { endpoint: "Disease-free survival, R0-resected subgroup (post hoc)", unit: "months", arms: [{ name: "ELI-002 7P", value: 23.8 }, { name: "Observation", value: 12.8 }], hr: 0.65, p: "0.048", note: "Post hoc analysis of 121 R0-resected patients; hypothesis-generating only.", source: "https://elicio.com/press_releases/elicio-therapeutics-reports-results-from-phase-2-amplify-7p-study-and-outlines-refined-phase-3-development-strategy-for-eli-002-7p-in-adjuvant-pancreatic-cancer/" },
    ],
    replication: "Randomised phase 2 missed its primary ITT endpoint (June 2026); the post hoc R0 subgroup signal is unreplicated and the sponsor plans a refined phase 3.",
  },
  // Glioma
  "eortc-26981": {
    enrolled: 575,
    outcomes: [{ endpoint: "Overall survival", primary: true, unit: "months", arms: [{ name: "Radiotherapy + temozolomide", n: 287, value: 14.6 }, { name: "Radiotherapy alone", n: 286, value: 12.1 }], hr: 0.63, ci: [0.52, 0.75], p: "<0.001", source: nejm("NEJMoa043330") }, { endpoint: "Overall survival at 5 years", unit: "%", arms: [{ name: "Radiotherapy + temozolomide", value: 9.8 }, { name: "Radiotherapy alone", value: 1.9 }], source: "https://www.thelancet.com/journals/lanonc/article/PIIS1470-2045(09)70025-7/fulltext" }],
    replication: "The Stupp regimen has been the control arm of every glioblastoma trial since; the MGMT-methylated benefit was confirmed repeatedly.",
  },
  "ef-14": {
    enrolled: 695,
    outcomes: [{ endpoint: "Progression-free survival", primary: true, unit: "months", arms: [{ name: "TTFields + temozolomide", n: 466, value: 6.7 }, { name: "Temozolomide", n: 229, value: 4.0 }], hr: 0.63, ci: [0.52, 0.76], p: "<0.001", source: "https://jamanetwork.com/journals/jama/fullarticle/2666504" }, { endpoint: "Overall survival", unit: "months", arms: [{ name: "TTFields + temozolomide", value: 20.9 }, { name: "Temozolomide", value: 16.0 }], hr: 0.63, ci: [0.53, 0.76], source: "https://jamanetwork.com/journals/jama/fullarticle/2666504" }],
    replication: "Single pivotal trial without a sham control; no independent randomised replication.",
  },
  indigo: {
    enrolled: 331,
    outcomes: [{ endpoint: "Progression-free survival (BIRC)", primary: true, unit: "months", arms: [{ name: "Vorasidenib", n: 168, value: 27.7 }, { name: "Placebo", n: 163, value: 11.1 }], hr: 0.39, ci: [0.27, 0.56], p: "<0.001", source: nejm("NEJMoa2304194") }],
    replication: "Single pivotal trial; the first targeted therapy in low-grade glioma. Time to next intervention also improved (HR 0.26).",
  },
  "checkmate-548": {
    enrolled: 716,
    outcomes: [{ endpoint: "Overall survival, MGMT-methylated glioblastoma", primary: true, unit: "months", arms: [{ name: "Nivolumab + RT + temozolomide", n: 358, value: 28.9 }, { name: "Placebo + RT + temozolomide", n: 358, value: 32.1 }], hr: 1.10, ci: [0.92, 1.32], note: "Not significant", source: "https://doi.org/10.1093/neuonc/noac116" }],
    replication: "Consistent with CheckMate 143 and 498: three negative randomised trials of PD-1 blockade in glioblastoma.",
  },
  "checkmate-143": {
    enrolled: 369,
    outcomes: [{ endpoint: "Overall survival, first recurrence of glioblastoma", primary: true, unit: "months", arms: [{ name: "Nivolumab", n: 184, value: 9.8 }, { name: "Bevacizumab", n: 185, value: 10.0 }], hr: 1.04, ci: [0.83, 1.30], p: "0.76", note: "Not significant", source: "https://doi.org/10.1001/jamaoncol.2020.1024" }],
    replication: "Consistent with CheckMate 498 and 548 in newly diagnosed disease: three negative randomised trials of PD-1 blockade in glioblastoma.",
  },
  "checkmate-498": {
    enrolled: 560,
    outcomes: [{ endpoint: "Overall survival, MGMT-unmethylated glioblastoma", primary: true, unit: "months", arms: [{ name: "Nivolumab + RT", n: 280, value: 13.4 }, { name: "Temozolomide + RT", n: 280, value: 14.9 }], hr: 1.31, ci: [1.09, 1.58], p: "0.0037", note: "Favours temozolomide", source: "https://doi.org/10.1093/neuonc/noac099" }],
    replication: "Consistent with CheckMate 143 and 548: three negative randomised trials of PD-1 blockade in glioblastoma.",
  },
  "cctg-ce6": {
    enrolled: 562,
    outcomes: [{ endpoint: "Overall survival, age 65 or older", primary: true, unit: "months", arms: [{ name: "Short-course RT + temozolomide", n: 281, value: 9.3 }, { name: "Short-course RT alone", n: 281, value: 7.6 }], hr: 0.67, ci: [0.56, 0.80], p: "<0.001", source: nejm("NEJMoa1611977") }],
    replication: "Single randomised trial of adding temozolomide to short-course radiotherapy; the Nordic and NOA-08 trials support hypofractionated radiotherapy or temozolomide alone in older patients, with MGMT status guiding the choice.",
  },
  "act-iv": {
    enrolled: 745,
    outcomes: [{ endpoint: "Overall survival, minimal residual disease population", primary: true, unit: "months", arms: [{ name: "Rindopepimut + temozolomide", n: 371, value: 20.1 }, { name: "Control + temozolomide", n: 374, value: 20.0 }], hr: 1.01, ci: [0.79, 1.30], note: "Not significant", source: "https://www.thelancet.com/journals/lanonc/article/PIIS1470-2045(17)30517-X/fulltext" }],
    replication: "Failed to replicate the phase 2 ACT III signal; EGFRvIII loss at recurrence in both arms undermined the target.",
  },

  // ---------------- Reported trials from spike / nutrition files ----------------
  // Mesothelioma
  "beat-meso": {
    enrolled: 400,
    outcomes: [
      { endpoint: "Overall survival", primary: true, unit: "months", arms: [{ name: "Atezolizumab + bevacizumab + carboplatin-pemetrexed", n: 200, value: 20.5 }, { name: "Bevacizumab + carboplatin-pemetrexed", n: 200, value: 18.1 }], hr: 0.84, ci: [0.66, 1.06], p: "0.14", note: "Not significant; primary endpoint not met", source: "https://doi.org/10.1016/j.annonc.2024.12.014" },
      { endpoint: "Progression-free survival", unit: "months", arms: [{ name: "Atezolizumab + bevacizumab + carboplatin-pemetrexed", value: 9.2 }, { name: "Bevacizumab + carboplatin-pemetrexed", value: 7.6 }], hr: 0.72, ci: [0.59, 0.89], p: "0.0021", source: "https://doi.org/10.1016/j.annonc.2024.12.014" },
      { endpoint: "Overall survival, non-epithelioid histology", unit: "months", arms: [{ name: "Atezolizumab + bevacizumab + carboplatin-pemetrexed" }, { name: "Bevacizumab + carboplatin-pemetrexed" }], hr: 0.51, ci: [0.32, 0.80], note: "Pre-specified histology subgroup; interaction p = 0.012 (epithelioid HR 1.01, 95% CI 0.77-1.32)", source: "https://doi.org/10.1016/j.annonc.2024.12.014" },
    ],
    replication: "Primary OS endpoint missed; the non-epithelioid benefit echoes CheckMate 743, where ipilimumab-nivolumab helped non-epithelioid disease most. Not independently replicated.",
  },
  dream3r: {
    outcomes: [{ endpoint: "Overall survival", primary: true, unit: "months", arms: [{ name: "Durvalumab + platinum-pemetrexed" }, { name: "Platinum-pemetrexed" }], note: "Trial closed early; primary OS endpoint not met at the analysis presented at ESMO 2025. Medians and hazard ratio pending publication.", source: ct("NCT04334759") }],
    replication: "Did not confirm the single-arm PrE0505 and DREAM phase 2 signals; chemo-immunotherapy in mesothelioma rests on the ipilimumab-nivolumab (CheckMate 743) and IND.227 pembrolizumab data instead.",
  },
  // Urothelial
  "ev-304": {
    enrolled: 808,
    outcomes: [
      { endpoint: "Event-free survival at 2 years", primary: true, unit: "%", arms: [{ name: "Perioperative enfortumab vedotin + pembrolizumab", n: 405, value: 79.4 }, { name: "Neoadjuvant cisplatin-gemcitabine", n: 403, value: 66.2 }], hr: 0.53, ci: [0.41, 0.70], p: "<0.001", source: nejm("NEJMoa2601486") },
      { endpoint: "Overall survival at 2 years", unit: "%", arms: [{ name: "Perioperative enfortumab vedotin + pembrolizumab", value: 86.9 }, { name: "Neoadjuvant cisplatin-gemcitabine", value: 81.3 }], hr: 0.65, ci: [0.48, 0.89], p: "0.006", source: nejm("NEJMoa2601486") },
      { endpoint: "Pathological complete response", unit: "%", arms: [{ name: "Perioperative enfortumab vedotin + pembrolizumab", value: 55.8 }, { name: "Neoadjuvant cisplatin-gemcitabine", value: 32.5 }], p: "<0.001", source: nejm("NEJMoa2601486") },
    ],
    replication: "Mirrors EV-303/KEYNOTE-905 in cisplatin-ineligible MIBC (same regimen, EFS and OS benefit), so the perioperative EV + pembrolizumab effect has now been shown in two randomised populations.",
  },
  // Melanoma
  "fianlimab-phase3-melanoma": {
    enrolled: 1546,
    outcomes: [
      { endpoint: "Progression-free survival, fianlimab 1600 mg + cemiplimab vs pembrolizumab", primary: true, unit: "months", arms: [{ name: "Fianlimab 1600 mg + cemiplimab", n: 508, value: 11.5 }, { name: "Pembrolizumab", n: 462, value: 6.4 }], hr: 0.845, ci: [0.709, 1.008], p: "0.0627", note: "Not significant; primary endpoint not met", source: "https://www.cancernetwork.com/view/fianlimab-combo-does-not-significantly-improve-pfs-in-advanced-melanoma" },
      { endpoint: "Progression-free survival, fianlimab 400 mg + cemiplimab vs pembrolizumab", primary: true, unit: "months", arms: [{ name: "Fianlimab 400 mg + cemiplimab", n: 422, value: 9.6 }, { name: "Pembrolizumab", n: 462, value: 6.4 }], hr: 0.931, ci: [0.773, 1.112], p: "0.4661", note: "Not significant", source: "https://www.cancernetwork.com/view/fianlimab-combo-does-not-significantly-improve-pfs-in-advanced-melanoma" },
      { endpoint: "Progression-free survival, cemiplimab monotherapy arm", unit: "months", arms: [{ name: "Cemiplimab", n: 154, value: 6.3 }], source: "https://www.cancernetwork.com/view/fianlimab-combo-does-not-significantly-improve-pfs-in-advanced-melanoma" },
    ],
    replication: "Second LAG-3 setback after RELATIVITY-098; the numerical PFS gain at the high dose did not reproduce the phase 1 signal, and RELATIVITY-047 remains the only positive randomised LAG-3 trial in melanoma.",
  },
  "relativity-098": {
    enrolled: 1093,
    outcomes: [{ endpoint: "Recurrence-free survival", primary: true, unit: "months", arms: [{ name: "Nivolumab + relatlimab", n: 547 }, { name: "Nivolumab", n: 546 }], hr: 1.01, ci: [0.83, 1.22], p: "0.928", note: "No difference; OS not formally tested", source: "https://doi.org/10.1038/s41591-025-04032-8" }],
    replication: "Failed to extend the RELATIVITY-047 advanced-disease benefit into the adjuvant setting; translational data attribute this to low peripheral LAG-3+ T cells without macroscopic tumour.",
  },
  "keynote-716": {
    enrolled: 976,
    outcomes: [
      { endpoint: "Recurrence-free survival (first interim analysis)", primary: true, unit: "months", arms: [{ name: "Pembrolizumab", n: 487 }, { name: "Placebo", n: 489 }], hr: 0.65, ci: [0.46, 0.92], p: "0.0066", note: "Median not reached in either arm; HR 0.61 (95% CI 0.45-0.82) at the second interim analysis", source: "https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(22)00562-1/fulltext" },
      { endpoint: "Distant metastasis-free survival at 36 months (final DMFS analysis)", unit: "%", arms: [{ name: "Pembrolizumab", value: 84.4 }, { name: "Placebo", value: 74.7 }], hr: 0.59, ci: [0.44, 0.79], source: "https://ascopubs.org/doi/10.1200/JCO.23.02355" },
      { endpoint: "Recurrence-free survival at 36 months", unit: "%", arms: [{ name: "Pembrolizumab", value: 76.2 }, { name: "Placebo", value: 63.4 }], hr: 0.62, ci: [0.49, 0.79], source: "https://ascopubs.org/doi/10.1200/JCO.23.02355" },
      { endpoint: "Recurrence-free survival at 48 months", unit: "%", arms: [{ name: "Pembrolizumab", value: 71.3 }, { name: "Placebo", value: 58.3 }], hr: 0.62, ci: [0.50, 0.78], source: "https://doi.org/10.1016/j.ejca.2025.115381" },
    ],
    replication: "Consistent with the stage III adjuvant trials (KEYNOTE-054, CheckMate 238) and with CheckMate 76K (nivolumab in stage IIB/C, RFS HR 0.42), so adjuvant PD-1 benefit in stage II is replicated across two agents. OS not yet significant.",
  },
  // Head and neck
  "javelin-hn-100": {
    enrolled: 697,
    outcomes: [{ endpoint: "Progression-free survival", primary: true, unit: "months", arms: [{ name: "Avelumab + chemoradiotherapy, then avelumab maintenance", n: 350 }, { name: "Placebo + chemoradiotherapy", n: 347 }], hr: 1.21, ci: [0.93, 1.57], p: "0.92 (one-sided)", note: "Median not reached in either arm; stopped for futility at interim analysis", source: "https://www.thelancet.com/journals/lanonc/article/PIIS1470-2045(20)30737-3/fulltext" }],
    replication: "Consistent with KEYNOTE-412 (pembrolizumab + CRT, EFS HR 0.83, not significant) and IMvoke010: concurrent PD-(L)1 blockade with definitive chemoradiotherapy has failed in three phase 3 trials.",
  },
  "nrg-hn002-hn005": {
    outcomes: [
      { endpoint: "HN005: progression-free survival at 2 years (phase II non-inferiority)", primary: true, unit: "%", arms: [{ name: "70 Gy + cisplatin (standard)", n: 136, value: 98.1 }, { name: "60 Gy + cisplatin", n: 116, value: 88.6 }, { name: "60 Gy + nivolumab", n: 132, value: 90.3 }], note: "Both de-escalated arms failed non-inferiority (HR vs standard 7.42 and 5.55; non-inferiority margin HR 2.4); the trial did not proceed to phase III", source: ct("NCT03952585") },
      { endpoint: "HN002: progression-free survival at 2 years (randomised phase II vs 85% historical control)", unit: "%", arms: [{ name: "60 Gy IMRT + weekly cisplatin", value: 90.5 }, { name: "60 Gy IMRT alone", value: 87.6 }], p: "0.04 (IMRT + cisplatin vs 85%)", note: "306 patients; only the cisplatin arm met the PFS and swallowing (MDADI) criteria to advance", source: "https://ascopubs.org/doi/10.1200/JCO.20.03128" },
    ],
    replication: "HN005 confirmed the HN002 lesson in a randomised comparison: unselected dose de-escalation in HPV-positive oropharynx cancer costs disease control, consistent with the negative De-ESCALaTE and RTOG 1016 cetuximab-substitution trials.",
  },
  // Renal
  "litespark-012": {
    enrolled: 1854,
    outcomes: [{ endpoint: "Progression-free survival (BICR) and overall survival (dual primary)", primary: true, unit: "months", arms: [{ name: "Pembrolizumab + lenvatinib + belzutifan" }, { name: "Pembrolizumab/quavonlimab + lenvatinib" }, { name: "Pembrolizumab + lenvatinib" }], note: "Neither investigational regimen met the dual primary PFS and OS endpoints at the pre-specified interim analysis (sponsor release, 21 April 2026); hazard ratios not disclosed", source: "https://www.merck.com/news/merck-and-eisai-provide-update-on-phase-3-litespark-012-trial-evaluating-first-line-combination-treatments-for-certain-patients-with-advanced-renal-cell-carcinoma-rcc/" }],
    replication: "Consistent with COSMIC-313: adding a third agent to a first-line IO doublet has not improved outcomes in clear-cell RCC. The phase Ib/II KEYMAKER-U03 signal for the belzutifan triplet did not carry into phase 3.",
  },
  "litespark-022": {
    enrolled: 1841,
    outcomes: [
      { endpoint: "Disease-free survival at 24 months (investigator-assessed)", primary: true, unit: "%", arms: [{ name: "Pembrolizumab + belzutifan", n: 921, value: 80.7 }, { name: "Pembrolizumab + placebo", n: 920, value: 73.7 }], hr: 0.72, ci: [0.59, 0.87], p: "<0.001", source: nejm("NEJMoa2518245") },
      { endpoint: "Overall survival at 24 months (interim, 29% of final events)", unit: "%", arms: [{ name: "Pembrolizumab + belzutifan", value: 96.2 }, { name: "Pembrolizumab + placebo", value: 95.7 }], hr: 0.78, ci: [0.51, 1.19], p: "0.24", note: "Not significant; immature", source: nejm("NEJMoa2518245") },
    ],
    replication: "First adjuvant RCC trial to beat pembrolizumab (KEYNOTE-564) rather than placebo; single trial, OS immature, and grade >=3 adverse events rose from 30% to 52%.",
  },
  // Colorectal
  "azur-1": {
    outcomes: [{ endpoint: "Sustained clinical complete response at 12 months (independent central review)", primary: true, unit: "%", arms: [{ name: "Dostarlimab monotherapy (single arm)" }], note: "Primary endpoint met at the interim analysis per the sponsor (13 July 2026); the rate itself is pending congress presentation. Single-arm registrational phase 2.", source: "https://www.cancernetwork.com/view/dostarlimab-yields-sustained-complete-responses-in-dmmr-msi-h-rectal-cancer" }],
    replication: "Multicentre confirmation of the Memorial Sloan Kettering single-centre cohort (cCR in all 42 evaluable patients, NEJM 2022 / ASCO 2024). FDA granted priority review in August 2026.",
  },
  "circulate-japan": {
    outcomes: [
      { endpoint: "GALAXY (observational): recurrence risk by post-operative ctDNA status (4 weeks after surgery)", arms: [{ name: "ctDNA-positive" }, { name: "ctDNA-negative" }], hr: 10.0, p: "<0.0001", note: "n = 1,039 resectable stage II-IV CRC; ctDNA positivity was the strongest prognostic factor and identified who benefited from adjuvant chemotherapy (HR 6.59)", source: "https://doi.org/10.1038/s41591-022-02115-4" },
      { endpoint: "ALTAIR (randomised phase 3): disease-free survival in post-adjuvant ctDNA-positive patients", primary: true, unit: "months", arms: [{ name: "Trifluridine/tipiracil", n: 122, value: 9.3 }, { name: "Placebo", n: 121, value: 5.55 }], hr: 0.79, ci: [0.60, 1.05], p: "0.107", note: "Primary endpoint not met", source: "https://doi.org/10.1038/s41591-026-04428-0" },
    ],
    replication: "GALAXY's prognostic ctDNA signal matches DYNAMIC, CIRCULATE-PRODIGE and BESPOKE cohorts; the interventional ALTAIR arm shows that detecting molecular recurrence does not yet translate into a DFS gain with trifluridine/tipiracil. VEGA (de-escalation) still pending.",
  },
  // Gastro-oesophageal
  "clarity-gastric01": {
    enrolled: 594,
    outcomes: [
      { endpoint: "Overall survival, third-line or later (dual primary)", primary: true, unit: "months", arms: [{ name: "Sonesitatug vedotin 2.2 mg/kg" }, { name: "Investigator's choice chemotherapy" }], note: "Met with a statistically significant, clinically meaningful improvement per the sponsor (27 July 2026); OS in the whole second-line-or-later population (key secondary) also significant. Medians and hazard ratios pending presentation.", source: "https://www.cancernetwork.com/view/sonesitatug-vedotin-improves-overall-survival-in-cldn18-2-gastric-cancer" },
      { endpoint: "Progression-free survival (BICR), second-line or later (dual primary)", primary: true, unit: "months", arms: [{ name: "Sonesitatug vedotin 2.2 mg/kg" }, { name: "Investigator's choice chemotherapy" }], note: "Trend favouring sonesitatug vedotin; did not reach statistical significance", source: "https://www.cancernetwork.com/view/sonesitatug-vedotin-improves-overall-survival-in-cldn18-2-gastric-cancer" },
    ],
    replication: "First phase 3 OS win for a CLDN18.2 ADC; builds on the phase 1 KYM901 signal and on zolbetuximab (SPOTLIGHT/GLOW) validating the target in first line. Numbers awaited.",
  },
  "panku-esophagus01": {
    enrolled: 497,
    outcomes: [
      { endpoint: "Overall survival", primary: true, unit: "months", arms: [{ name: "Izalontamab brengitecan", value: 9.8 }, { name: "Chemotherapy (physician's choice)", value: 7.2 }], hr: 0.64, ci: [0.49, 0.83], p: "0.0004", source: "https://www.prnewswire.com/news-releases/systimmune-announces-second-approval-of-iza-bren-in-china-for-the-treatment-of-recurrent-or-metastatic-esophageal-squamous-cell-carcinoma-302827983.html" },
      { endpoint: "Progression-free survival (BICR)", primary: true, unit: "months", arms: [{ name: "Izalontamab brengitecan", value: 4.2 }, { name: "Chemotherapy (physician's choice)", value: 2.0 }], hr: 0.50, ci: [0.40, 0.63], p: "<0.0001", source: "https://www.prnewswire.com/news-releases/systimmune-announces-second-approval-of-iza-bren-in-china-for-the-treatment-of-recurrent-or-metastatic-esophageal-squamous-cell-carcinoma-302827983.html" },
    ],
    replication: "Single Chinese phase 3 (ASCO 2026 oral; NMPA approval July 2026); consistent with the positive iza-bren phase 3s in nasopharyngeal carcinoma and TNBC (BL-B01D1-307). No data outside China yet.",
  },
  // HR+ breast
  "fourlight-1": {
    outcomes: [{ endpoint: "Progression-free survival (investigator-assessed)", primary: true, unit: "months", arms: [{ name: "Atirmociclib + fulvestrant" }, { name: "Fulvestrant, or everolimus + exemestane" }], hr: 0.60, ci: [0.440, 0.825], p: "0.0007", note: "Randomised phase 2, post-CDK4/6 inhibitor; medians pending presentation (topline 17 March 2026)", source: "https://www.cancernetwork.com/view/atirmociclib-fulvestrant-improves-pfs-in-hr-her2-breast-cancer" }],
    replication: "First randomised evidence that a selective CDK4 inhibitor works after CDK4/6 progression; the first-line phase 3 programme will be the confirmatory test.",
  },
  // Lymphoma
  sunmo: {
    enrolled: 208,
    outcomes: [
      { endpoint: "Progression-free survival (dual primary)", primary: true, unit: "months", arms: [{ name: "Mosunetuzumab + polatuzumab vedotin", n: 138, value: 11.5 }, { name: "R-GemOx", n: 70, value: 3.8 }], hr: 0.41, ci: [0.30, 0.60], p: "<0.0001", source: "https://ascopubs.org/doi/10.1200/JCO-25-01957" },
      { endpoint: "Overall response rate (dual primary)", primary: true, unit: "%", arms: [{ name: "Mosunetuzumab + polatuzumab vedotin", value: 70 }, { name: "R-GemOx", value: 40 }], p: "<0.0001", source: "https://ascopubs.org/doi/10.1200/JCO-25-01957" },
      { endpoint: "Complete response rate", unit: "%", arms: [{ name: "Mosunetuzumab + polatuzumab vedotin", value: 51 }, { name: "R-GemOx", value: 24 }], source: "https://ascopubs.org/doi/10.1200/JCO-25-01957" },
    ],
    replication: "Consistent with STARGLO (glofitamab + GemOx vs R-GemOx, OS benefit) for CD20xCD3 bispecific-based regimens in transplant-ineligible R/R LBCL; OS was a key secondary endpoint and is not yet mature.",
  },
  // Endometrial staging
  "fires-sentor": {
    outcomes: [
      { endpoint: "FIRES: sensitivity of sentinel-node mapping for nodal metastasis", primary: true, unit: "%", arms: [{ name: "ICG sentinel-node mapping vs complete lymphadenectomy", n: 340, value: 97.2 }], note: "95% CI 85.0-100; 385 enrolled, 340 analysed; negative predictive value 99.6% (95% CI 97.9-100)", source: "https://www.thelancet.com/journals/lanonc/article/PIIS1470-2045(17)30068-2/fulltext" },
      { endpoint: "SENTOR: sensitivity of the sentinel-node algorithm in intermediate/high-grade endometrial cancer", primary: true, unit: "%", arms: [{ name: "ICG sentinel-node biopsy vs lymphadenectomy", n: 156, value: 96 }], note: "95% CI 81-100; negative predictive value 99% (95% CI 96-100); false-negative rate 4%", source: "https://doi.org/10.1001/jamasurg.2020.5060" },
    ],
    replication: "Two independent prospective cohorts (USA and Canada) with matching accuracy, the latter in high-grade histologies; supported by the SHREC and Italian multicentre series and now standard in NCCN/ESGO guidance.",
  },
  // Perioperative / lifestyle (nutrition.ts trials)
  "prehab-trial": {
    enrolled: 251,
    outcomes: [
      { endpoint: "Severe postoperative complications (Comprehensive Complication Index > 20)", primary: true, unit: "%", arms: [{ name: "Multimodal prehabilitation", n: 123, value: 17.1 }, { name: "Standard care (ERAS)", n: 128, value: 29.7 }], p: "0.02", note: "Odds ratio 0.47 (95% CI 0.26-0.87)", source: "https://doi.org/10.1001/jamasurg.2023.0198" },
      { endpoint: "Medical complications", unit: "%", arms: [{ name: "Multimodal prehabilitation", value: 15.4 }, { name: "Standard care (ERAS)", value: 27.3 }], p: "0.02", note: "Odds ratio 0.48 (95% CI 0.26-0.89)", source: "https://doi.org/10.1001/jamasurg.2023.0198" },
      { endpoint: "6-minute walking distance at 4 weeks post-operatively (change from baseline)", primary: true, arms: [{ name: "Multimodal prehabilitation" }, { name: "Standard care (ERAS)" }], p: "0.07", note: "Mean difference 15.6 m (95% CI -1.4 to 32.6); not significant. Trial stopped early because of COVID-19.", source: "https://doi.org/10.1001/jamasurg.2023.0198" },
    ],
    replication: "Largest multicentre prehabilitation RCT; consistent in direction with the earlier Montreal single-centre trials, though the functional-capacity co-primary endpoint was not met and the trial stopped early, so the complication effect awaits replication.",
  },
  bwel: {
    outcomes: [
      { endpoint: "Invasive disease-free survival", primary: true, unit: "months", arms: [{ name: "Telephone weight-loss intervention + health education" }, { name: "Health education alone" }], note: "Event-driven primary analysis not yet published; ClinicalTrials.gov lists primary completion in 2030. Only weight and quality-of-life secondary analyses have been reported (2025-2026).", source: ct("NCT02750826") },
      { endpoint: "Weight change from baseline at 1 year", unit: "%", arms: [{ name: "Telephone weight-loss intervention + health education", n: 1591, value: -4.7 }, { name: "Health education alone", n: 1589, value: 1.0 }], p: "<0.001", note: "Mean -4.3 kg vs +0.9 kg; 3,180 women analysed", source: "https://doi.org/10.1001/jamaoncol.2025.2738" },
    ],
    replication: "Weight loss reproduces the LISA trial (letrozole-treated women) and the SUCCESS-C lifestyle arm; whether it changes breast cancer recurrence remains untested pending the BWEL primary analysis.",
  },

  // ---------------- Failures ----------------
  impassion131: {
    enrolled: 653,
    outcomes: [
      { endpoint: "Progression-free survival, PD-L1+ (investigator)", primary: true, unit: "months", arms: [{ name: "Atezolizumab + paclitaxel", n: 191, value: 6.0 }, { name: "Placebo + paclitaxel", n: 101, value: 5.7 }], hr: 0.82, ci: [0.60, 1.12], p: "0.20", note: "Not significant", source: "https://www.annalsofoncology.org/article/S0923-7534(21)02012-3/fulltext" },
      { endpoint: "Overall survival, PD-L1+", unit: "months", arms: [{ name: "Atezolizumab + paclitaxel", value: 22.1 }, { name: "Placebo + paclitaxel", value: 28.3 }], hr: 1.11, ci: [0.76, 1.64], note: "Numerically unfavourable", source: "https://www.annalsofoncology.org/article/S0923-7534(21)02012-3/fulltext" },
    ],
    replication: "Failed to replicate IMpassion130; the discordance is attributed to the taxane partner (steroid premedication with paclitaxel) and chance.",
  },

  // ---------------- China and India cell therapy (single-arm registrational studies) ----------------
  "fumanba-1": {
    enrolled: 103,
    outcomes: [
      { endpoint: "Overall response rate (efficacy-evaluable)", primary: true, unit: "%", arms: [{ name: "Equecabtagene autoleucel 1.0 × 10^6 CAR+ T cells/kg", n: 101, value: 96.0 }], note: "97 of 101 evaluable patients; 103 infused; median follow-up 13.8 months (data cut September 2022)", source: "https://doi.org/10.1001/jamaoncol.2024.4879" },
      { endpoint: "Complete response or better", unit: "%", arms: [{ name: "Equecabtagene autoleucel", n: 103, value: 74.3 }], note: "75 of 103 as reported", source: "https://doi.org/10.1001/jamaoncol.2024.4879" },
      { endpoint: "MRD negativity (10^-5)", unit: "%", arms: [{ name: "Equecabtagene autoleucel", value: 95.0 }], note: "96 patients", source: "https://doi.org/10.1001/jamaoncol.2024.4879" },
      { endpoint: "Progression-free survival at 12 months", unit: "%", arms: [{ name: "Equecabtagene autoleucel", value: 78.8 }], ci: [68.6, 86.0], note: "Median PFS not reached", source: "https://doi.org/10.1001/jamaoncol.2024.4879" },
      { endpoint: "Cytokine release syndrome, any grade", unit: "%", arms: [{ name: "Equecabtagene autoleucel", n: 103, value: 93.2 }], note: "Grade 1-2 in 92.3%; ICANS 1.9% (all grade 1-2)", source: "https://doi.org/10.1001/jamaoncol.2024.4879" },
    ],
    replication: "Single-arm phase 1b/2 across 14 Chinese centres; no randomised comparison. The response rate sits alongside zevor-cel (LUMMICAR STUDY 1, ORR 92.2%) and cilta-cel (CARTITUDE-1), so the depth of response is consistent across fully human and llama-derived BCMA CAR-Ts; 9 of 12 patients previously exposed to another CAR-T responded.",
  },
  "lummicar-1": {
    enrolled: 102,
    outcomes: [
      { endpoint: "Objective response rate (independent review committee)", primary: true, unit: "%", arms: [{ name: "Zevorcabtagene autoleucel", n: 102, value: 92.2 }], ci: [85.13, 96.55], note: "102 infused of 125 apheresed; median follow-up 20.3 months; DOR, PFS and OS not mature", source: "https://doi.org/10.1186/s40164-025-00710-y" },
      { endpoint: "Stringent complete response", unit: "%", arms: [{ name: "Zevorcabtagene autoleucel", n: 102, value: 68.6 }], note: "A further 2.9% reached complete response", source: "https://doi.org/10.1186/s40164-025-00710-y" },
      { endpoint: "Cytokine release syndrome, any grade", unit: "%", arms: [{ name: "Zevorcabtagene autoleucel", n: 102, value: 90.2 }], note: "Grade 3-4 in 6.9%; ICANS in 2 patients, both grade 1", source: "https://doi.org/10.1186/s40164-025-00710-y" },
    ],
    replication: "Single-arm phase 2 at 23 Chinese centres (patients with prior BCMA-directed or CAR-T therapy excluded). Consistent with FUMANBA-1 (eque-cel, ORR 96%) and with the North American LUMMICAR STUDY 2 dose-finding cohort; no randomised trial against standard regimens.",
  },
  "imagine-varnimcabtagene": {
    enrolled: 24,
    outcomes: [
      { endpoint: "Overall response rate at the primary endpoint", primary: true, unit: "%", arms: [{ name: "Varnimcabtagene autoleucel (IMN-003A)", n: 21, value: 80.9 }], note: "17 of 21 evaluable patients (B-cell NHL and B-ALL combined); 24 infused; median PFS not reached at the ASH 2023 cut, relapse in 9 of 24", source: "https://doi.org/10.1182/blood-2023-181120" },
      { endpoint: "Cytokine release syndrome, any grade", unit: "%", arms: [{ name: "Varnimcabtagene autoleucel (IMN-003A)", n: 24, value: 66.7 }], note: "Grade 1 in 62.5%, grade 3 or higher in 4.2%; ICANS 4.2% (grade 1 only)", source: "https://doi.org/10.1182/blood-2023-181585" },
    ],
    replication: "Figures come from ASH 2023 abstracts, not a full paper. The Indian product is the ARI-0001 construct from Hospital Clinic de Barcelona, whose CART19-BE-01 trial and compassionate-use series (including a 2026 mantle cell lymphoma report, ORR 89%) show similar activity and low rates of severe CRS, so the Bengaluru result replicates the Spanish programme in a new manufacturing site rather than an independent design.",
  },

  // ---------------- Direction-only topline readouts ----------------
  "dellphi-305": {
    enrolled: 563,
    outcomes: [
      { endpoint: "Overall survival", primary: true, unit: "months", arms: [{ name: "Tarlatamab + durvalumab maintenance" }, { name: "Durvalumab maintenance" }], note: "Met at the pre-specified interim analysis: Amgen's 8 September 2026 release describes a statistically significant and clinically meaningful improvement; medians and hazard ratio not yet disclosed, detailed data promised for an upcoming congress", source: "https://www.amgen.com/newsroom/press-releases/2026/09/imdelltra-in-combination-with-imfinzi-demonstrated-landmark-improvement-in-overall-survival-in-first-line-extensive-stage-small-cell-lung-cancer" },
      { endpoint: "Progression-free survival", unit: "months", arms: [{ name: "Tarlatamab + durvalumab maintenance" }, { name: "Durvalumab maintenance" }], note: "Statistically significant and clinically meaningful improvement per the sponsor; figures not yet public", source: "https://www.amgen.com/newsroom/press-releases/2026/09/imdelltra-in-combination-with-imfinzi-demonstrated-landmark-improvement-in-overall-survival-in-first-line-extensive-stage-small-cell-lung-cancer" },
      { endpoint: "Objective response rate", unit: "%", arms: [{ name: "Tarlatamab + durvalumab maintenance" }, { name: "Durvalumab maintenance" }], note: "Statistically significant improvement per the sponsor; figures not yet public", source: "https://www.amgen.com/newsroom/press-releases/2026/09/imdelltra-in-combination-with-imfinzi-demonstrated-landmark-improvement-in-overall-survival-in-first-line-extensive-stage-small-cell-lung-cancer" },
    ],
    replication: "First phase 3 of a DLL3 T-cell engager in first-line maintenance; consistent in direction with the DeLLphi-303 phase 1b cohort (median OS 25.3 months). DeLLphi-312 (tarlatamab added to induction chemo-immunotherapy) is the confirmatory sibling.",
  },

  // ---------------- Screening cohorts with published interim results ----------------
  istopmm: {
    enrolled: 75422,
    outcomes: [
      { endpoint: "Prevalence of smouldering multiple myeloma among screened residents aged 40 or older", unit: "%", arms: [{ name: "Screened Icelandic residents (serum protein electrophoresis, immunofixation and free light chains)", n: 75422, value: 0.53 }], ci: [0.49, 0.57], note: "80,759 consented, 75,422 screened; 0.67% in men and 0.39% in women; 193 individuals with smouldering myeloma, median age 70. The randomised primary endpoints (outcomes by follow-up strategy) have not yet been reported", source: "https://doi.org/10.1038/s41591-022-02183-6" },
    ],
    replication: "The only nationwide screening cohort for myeloma precursors, so the prevalence figure has no direct replicate; it is roughly five times higher than earlier clinic-based estimates. The randomised comparison of follow-up strategies is unreported and will decide whether screening should be adopted.",
  },
};

export const TRIAL_OUTCOMES: Record<string, TrialOutcomeData> = Object.fromEntries(
  Object.entries(RAW).map(([id, d]) => [id, {
    ...d,
    outcomes: (d.outcomes ?? []).map(({ note, ...o }) => {
      if (!note) return o;
      const [first, ...rest] = o.arms;
      return { ...o, arms: [{ ...first, note: first.note ? `${first.note}. ${note}` : note }, ...rest] };
    }),
  }]),
);

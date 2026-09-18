import type { Spike } from "./index";
import type { EntityInput } from "@/lib/schema";

const asOf = "2026-09-06";
const W = (s: string) => `https://en.wikipedia.org/wiki/${s}`;
const ct = (nct: string) => ({ label: `ClinicalTrials.gov ${nct}`, url: `https://clinicaltrials.gov/study/${nct}` });

const entities: EntityInput[] = [
  // ======================= DRUGS / REGIMENS =======================
  {
    id: "folfirinox", kind: "drug", name: "FOLFIRINOX / mFOLFIRINOX", modality: "Cytotoxic regimen", asOf, status: "standard-of-care", wikipedia: W("FOLFIRINOX"),
    tldr: "FOLFIRINOX is a four-drug chemotherapy combination that, in 2011, became the first treatment to meaningfully extend life in metastatic pancreatic cancer; it is now the standard before and after surgery.",
    summary: "Oxaliplatin, irinotecan, leucovorin, and 5-fluorouracil. PRODIGE 4/ACCORD 11 (2011): OS 11.1 vs 6.8 months versus gemcitabine in fit metastatic patients. Modified FOLFIRINOX (PRODIGE 24, 2018) became the adjuvant standard after resection with median OS ~54 months, and is the most used neoadjuvant regimen for borderline-resectable disease. Toxicity (neutropenia, diarrhoea, neuropathy) restricts it to ECOG 0-1 patients. NALIRIFOX (liposomal irinotecan) is a 2024 variant for metastatic disease.",
    mechanism: "DNA crosslinking (oxaliplatin), topoisomerase-I inhibition (irinotecan), antimetabolite (5-FU with leucovorin modulation).",
    approvals: [{ region: "Global", year: 2011, indication: "Metastatic PDAC (PRODIGE 4 / ACCORD 11; component drugs generic)" }],
    technologies: ["cytotoxic-chemotherapy", "platinum", "topoisomerase-inhibitors"], cancers: ["pancreatic"], trials: ["prodige-24", "napoli-3"], links: [{ label: "Wikipedia", url: W("FOLFIRINOX") }],
  },
  {
    id: "nalirifox", kind: "drug", name: "NALIRIFOX (liposomal irinotecan + oxaliplatin + 5-FU/LV)", brand: "Onivyde regimen", modality: "Cytotoxic regimen", asOf, status: "approved",
    tldr: "NALIRIFOX is a version of FOLFIRINOX using a liposome-wrapped irinotecan, approved in 2024 as a first-line option for metastatic pancreatic cancer.",
    summary: "NALIRIFOX combines liposomal irinotecan, which gives prolonged exposure to the active metabolite SN-38, with oxaliplatin and 5-FU/leucovorin; it is a version of FOLFIRINOX built around the liposome-wrapped drug. It is a first-line option for metastatic pancreatic adenocarcinoma in patients fit enough for a multi-drug regimen. NAPOLI 3 (n=770) showed overall survival of 11.1 versus 9.2 months (HR 0.84) and PFS of 7.4 versus 5.6 months against gemcitabine plus nab-paclitaxel, and the FDA approved it in February 2024 (Ipsen). It was the first phase 3 head-to-head win between the two chemotherapy backbones, though the absolute gain is modest and critics note the absence of a modified FOLFIRINOX arm, so whether it beats conventional FOLFIRINOX is unknown. For a newcomer, it is four-drug pancreatic chemotherapy with a longer-acting irinotecan.",
    mechanism: "Liposomal irinotecan (prolonged SN-38 exposure) with oxaliplatin and 5-FU/leucovorin.",
    approvals: [{ region: "US", year: 2024, indication: "First-line metastatic pancreatic adenocarcinoma" }, { region: "EU", year: 2016, indication: "Onivyde 2L after gemcitabine (2016); NALIRIFOX label 2025" }],
    technologies: ["cytotoxic-chemotherapy", "topoisomerase-inhibitors", "platinum"], companies: ["ipsen"], cancers: ["pancreatic"], trials: ["napoli-3"],
    links: [{ label: "OncLive: FDA approves NALIRIFOX", url: "https://www.onclive.com/view/fda-approves-frontline-nalirifox-for-metastatic-pancreatic-adenocarcinoma" }], terms: ["prodrug"],
  },
  {
    id: "gemcitabine-nab-paclitaxel", kind: "drug", name: "Gemcitabine + nab-paclitaxel", brand: "Gemzar + Abraxane", modality: "Cytotoxic regimen", asOf, status: "standard-of-care", wikipedia: W("Gemcitabine"),
    tldr: "Gemcitabine plus nab-paclitaxel is the gentler of the two standard chemotherapy backbones for pancreatic cancer, and the base on which most new drugs are being tested.",
    summary: "MPACT (2013): OS 8.5 vs 6.7 months versus gemcitabine alone. Preferred for less fit patients; the control or backbone arm in PANOVA-3 (TTFields), zoldonrasib first-line combinations, and CLDN18.2 and other add-on trials. Gemcitabine monotherapy (1997) was the standard for 14 years before FOLFIRINOX.",
    mechanism: "Nucleoside analogue (gemcitabine) plus albumin-bound taxane that may deplete stroma and increase gemcitabine delivery.",
    approvals: [{ region: "US", year: 2013, indication: "First-line metastatic pancreatic adenocarcinoma (nab-paclitaxel label)" }],
    technologies: ["cytotoxic-chemotherapy"], cancers: ["pancreatic"], drugs: ["paclitaxel"], trials: ["panova-3"], links: [{ label: "Wikipedia", url: W("Gemcitabine") }],
  },
  {
    id: "zoldonrasib", kind: "drug", name: "Zoldonrasib", code: "RMC-9805", modality: "Small-molecule RAS(ON) G12D-selective inhibitor", asOf, status: "phase-2",
    tldr: "The first drug aimed specifically at KRAS G12D, the single most common mutation in pancreatic cancer. Early combination data in 2026 showed half of previously treated patients responding.",
    summary: "Revolution Medicines' covalent tri-complex inhibitor of KRAS G12D(ON). Breakthrough Therapy designation in G12D NSCLC (2025). At ESMO GI 2026, zoldonrasib plus daraxonrasib in previously treated RAS G12D metastatic PDAC (n=60, cutoff 9 Feb 2026): ORR 50% and DCR 97% in second line, median PFS 9.6 months; grade ≥3 treatment-related events 35% (rash, anaemia, stomatitis). First-line combination with gemcitabine/nab-paclitaxel showed high response rates and ctDNA clearance. Phase 3 planning underway.",
    mechanism: "Cyclophilin-A-mediated tri-complex that covalently engages the G12D mutant aspartate and blocks effector binding in the active state.",
    targets: ["kras"], technologies: ["kras-inhibitors"], companies: ["revolution-medicines"], cancers: ["pancreatic", "nsclc", "colorectal"], drugs: ["daraxonrasib"], pathways: ["ras-mapk"],
    links: [{ label: "Revolution Medicines, ESMO GI 2026", url: "https://ir.revmed.com/news-releases/news-release-details/revolution-medicines-presents-phase-12-clinical-data-zoldonrasib" }, { label: "OncLive report", url: "https://www.onclive.com/view/zoldonrasib-combinations-show-compelling-antitumor-activity-in-ras-g12d-mutant-metastatic-pdac" }],
  },
  {
    id: "elironrasib", links: [{ label: "ClinicalTrials.gov: trials of Elironrasib", url: "https://clinicaltrials.gov/search?intr=RMC-6291" }], kind: "drug", name: "Elironrasib", code: "RMC-6291", modality: "Small-molecule RAS(ON) G12C-selective inhibitor", asOf, status: "phase-2",
    tldr: "A next-generation KRAS G12C drug that hits the active form of the protein, from the same company as daraxonrasib.",
    summary: "Elironrasib is a covalent tri-complex inhibitor that binds KRAS G12C in its active, GTP-bound (ON) state, unlike the first-generation drugs sotorasib and adagrasib, which trap the inactive OFF state. Hitting the active protein is intended to produce deeper, more durable responses and to overcome the adaptive RAS reactivation that limits OFF-state inhibitors. It is being tested alone and with daraxonrasib, the pan-RAS(ON) inhibitor from the same company, in non-small-cell lung cancer, colorectal cancer and the roughly 1 to 2% of pancreatic cancers that carry G12C. It is in phase 2 with no approval yet, and whether ON-state inhibition delivers a clinically meaningful advantage over the approved G12C drugs is the open question. For a newcomer, it is a next-generation KRAS G12C drug that hits the switched-on form of the protein.",
    mechanism: "Covalent tri-complex inhibitor of KRAS G12C in the GTP-bound state.",
    targets: ["kras"], technologies: ["kras-inhibitors"], companies: ["revolution-medicines"], cancers: ["nsclc", "colorectal", "pancreatic"], pathways: ["ras-mapk"],
  },
  {
    id: "mrtx1133", links: [{ label: "ClinicalTrials.gov NCT05737706: MRTX1133 in KRAS G12D-mutant advanced solid tumours (phase 1)", url: "https://clinicaltrials.gov/study/NCT05737706" }], kind: "drug", name: "MRTX1133", modality: "Small-molecule non-covalent KRAS G12D inhibitor", asOf, status: "phase-1",
    tldr: "MRTX1133 was the first potent chemical tool against KRAS G12D, and proved the mutation could be drugged even though it lacks the reactive handle G12C has.",
    summary: "MRTX1133 is a non-covalent small molecule that binds the switch-II pocket of KRAS G12D and inhibits both the ON and OFF states; because G12D lacks the reactive cysteine that G12C drugs exploit, it needed a different, high-affinity chemistry. It was the first potent chemical tool against KRAS G12D, a common driver in pancreatic cancer, and it produced striking regressions in pancreatic patient-derived xenograft models (Nature 2023). Poor oral bioavailability forced intravenous dosing in the phase 1/2 trial, and development slowed after Bristol Myers Squibb acquired Mirati, while covalent RAS(ON) competitors advanced. Its lasting importance is as proof that G12D can be drugged, opening the door to oral and pan-RAS successors. For a newcomer, it showed that a KRAS mutation once thought undruggable can be hit.",
    mechanism: "Non-covalent binder to the switch-II pocket of KRAS G12D, inhibiting both ON and OFF states.",
    targets: ["kras"], technologies: ["kras-inhibitors"], companies: ["bms"], cancers: ["pancreatic", "colorectal"], pathways: ["ras-mapk"],
  },
  {
    id: "eli-002-7p", kind: "drug", name: "ELI-002 7P", modality: "Off-the-shelf lymph-node-targeted KRAS peptide vaccine", asOf, status: "phase-2",
    tldr: "A ready-made vaccine against the seven commonest KRAS mutations, given after pancreatic cancer surgery. Its phase 2 missed the main goal in 2026 but showed signs of activity.",
    summary: "Elicio's amphiphile peptides (7 mKRAS antigens) plus CpG adjuvant, engineered to drain to lymph nodes. Phase 1 AMPLIFY-201 induced mKRAS-specific T cells in most patients with ctDNA reductions. Randomised phase 2 AMPLIFY-7P (adjuvant PDAC, results June 2026) did not meet its primary DFS endpoint in the intent-to-treat population; post-hoc landmark analyses reported ~14% absolute DFS benefit during active treatment. Elicio is refining a phase 3 strategy around R0-resected patients.",
    mechanism: "Albumin-binding lipid tails carry mutant-KRAS peptides to lymph nodes for dendritic cell presentation.",
    targets: ["kras"], technologies: ["shared-antigen-vaccine", "mrd-testing"], companies: ["elicio-therapeutics"], cancers: ["pancreatic", "colorectal"], trials: ["amplify-7p"],
    links: [{ label: "Elicio AMPLIFY-7P results (June 2026)", url: "https://elicio.com/press_releases/elicio-therapeutics-reports-results-from-phase-2-amplify-7p-study-and-outlines-refined-phase-3-development-strategy-for-eli-002-7p-in-adjuvant-pancreatic-cancer/" }],
  },

  // ======================= TRIALS =======================
  {
    id: "rasolute-302", kind: "trial", name: "RASolute 302", nct: "NCT06625320", phase: "3", status: "positive", yearReported: 2026, sponsor: "Revolution Medicines", asOf,
    setting: "Metastatic PDAC after one prior line of chemotherapy: daraxonrasib vs investigator's choice chemotherapy",
    tldr: "The trial that nearly doubled survival in previously treated pancreatic cancer, presented in the ASCO 2026 plenary. The biggest result in the disease's history.",
    summary: "500 patients, 59 sites. Topline 13 April 2026; presented by Brian Wolpin (Dana-Farber) at the ASCO 2026 plenary (31 May) with simultaneous NEJM publication. Median OS 13.2 vs 6.7 months (HR 0.40, p<0.0001); PFS also significantly improved. NDA submission planned under a Commissioner's National Priority Voucher. First-line (RASolute 303) and adjuvant (RASolute 304) trials follow.",
    result: "OS 13.2 vs 6.7 months, HR 0.40.",
    drugs: ["daraxonrasib"], cancers: ["pancreatic"], targets: ["kras"], technologies: ["kras-inhibitors"], institutions: ["dana-farber"],
    links: [ct("NCT06625320"), { label: "Revolution Medicines announcement", url: "https://ir.revmed.com/news-releases/news-release-details/daraxonrasib-demonstrates-unprecedented-overall-survival-benefit" }, { label: "JCO abstract LBA5", url: "https://ascopubs.org/doi/10.1200/JCO.2026.44.17_suppl.LBA5" }],
  },
  {
    id: "napoli-3", kind: "trial", name: "NAPOLI 3", nct: "NCT04083235", phase: "3", status: "positive", yearReported: 2023, sponsor: "Ipsen", asOf,
    setting: "First-line metastatic PDAC: NALIRIFOX vs gemcitabine + nab-paclitaxel",
    tldr: "The first head-to-head trial of the two chemotherapy backbones, won narrowly by the four-drug regimen.",
    summary: "NAPOLI 3, trial NCT04083235 sponsored by Ipsen and reported in 2023, was the first head-to-head trial of the two chemotherapy backbones for first-line metastatic pancreatic cancer, comparing NALIRIFOX, the four-drug regimen built on liposomal irinotecan, with gemcitabine plus nab-paclitaxel. It randomised 770 patients and met its primary overall survival endpoint, with a narrow but statistically significant advantage and a clearer gain in progression-free survival, leading to FDA approval of NALIRIFOX in February 2024. OnCo links it to pancreatic ductal adenocarcinoma, to NALIRIFOX and gemcitabine plus nab-paclitaxel, to Zev A. Wainberg, and to the bottleneck of cold tumours; the result is consistent in direction with PRODIGE 4 for FOLFIRINOX. Critics note the absence of a modified FOLFIRINOX arm, so whether the new regimen beats the older four-drug standard is the open question.",
    result: "OS HR 0.84; PFS HR 0.69.",
    drugs: ["nalirifox", "gemcitabine-nab-paclitaxel"], cancers: ["pancreatic"], links: [ct("NCT04083235")], people: ["zev-wainberg"],
  },
  {
    id: "prodige-24", kind: "trial", name: "PRODIGE 24 / CCTG PA6", nct: "NCT01526135", phase: "3", status: "positive", yearReported: 2018, sponsor: "UNICANCER / CCTG", asOf,
    setting: "Adjuvant therapy after resection of PDAC: mFOLFIRINOX vs gemcitabine",
    tldr: "Showed that giving the strong four-drug chemotherapy after pancreatic surgery adds years of life for fit patients.",
    summary: "PRODIGE 24, run with the Canadian Cancer Trials Group as CCTG PA6, trial NCT01526135 and reported in 2018, showed that giving modified FOLFIRINOX after pancreatic cancer surgery adds years of life for fit patients compared with gemcitabine. It randomised 493 patients and met its primary disease-free survival endpoint, and the overall survival benefit held in a five-year update in 2022, establishing modified FOLFIRINOX as the adjuvant standard for patients fit enough to receive it. OnCo links it to pancreatic ductal adenocarcinoma, to the FOLFIRINOX drug record and to Thierry Conroy, and the result is consistent with APACT for gemcitabine and nab-paclitaxel, which showed a smaller effect, and with the neoadjuvant PREOPANC-2 comparison. Whether the same regimen should be given before surgery rather than after is the open question. FOLFIRINOX has its own page.",
    result: "OS 54.4 vs 35.0 months, HR 0.64.",
    drugs: ["folfirinox"], cancers: ["pancreatic"], links: [ct("NCT01526135")], people: ["thierry-conroy"],
  },
  {
    id: "preopanc", kind: "trial", name: "PREOPANC-1 / PREOPANC-2", nct: "NTR3709", phase: "3", status: "mixed", yearReported: 2022, sponsor: "Dutch Pancreatic Cancer Group", asOf,
    setting: "Resectable and borderline-resectable PDAC: neoadjuvant chemoradiation (PREOPANC-1) or neoadjuvant FOLFIRINOX (PREOPANC-2) vs upfront surgery",
    tldr: "Dutch trials testing whether treating before surgery beats operating first. Chemoradiation first helped in the long run; FOLFIRINOX first did not clearly beat surgery-first with adjuvant chemotherapy.",
    summary: "PREOPANC-1: gemcitabine-based chemoradiation before surgery improved 5-year OS (20.5% vs 6.5%) in long-term follow-up, although the primary analysis had fallen short of statistical significance. PREOPANC-2 (2023): neoadjuvant FOLFIRINOX did not improve OS versus neoadjuvant gemcitabine-chemoradiation. Together with ALLIANCE A021806 and NORPACT-1, they leave the neoadjuvant question open for resectable disease while borderline-resectable disease is generally treated neoadjuvantly.",
    result: "PREOPANC-1 5-year OS 20.5% vs 6.5%; PREOPANC-2 no OS benefit.",
    drugs: ["folfirinox"], cancers: ["pancreatic"], technologies: ["imrt-igrt"], links: [{ label: "PREOPANC-1 primary analysis, JCO 2020 (NTR3709)", url: "https://doi.org/10.1200/JCO.19.02274" }, { label: "PREOPANC-1 long-term results, JCO 2022", url: "https://doi.org/10.1200/JCO.21.02233" }], people: ["marc-besselink"],
  },
  {
    id: "polo", kind: "trial", name: "POLO", nct: "NCT02184195", phase: "3", status: "mixed", yearReported: 2019, sponsor: "AstraZeneca / Merck", asOf,
    setting: "Germline BRCA-mutated metastatic PDAC not progressed on ≥16 weeks of platinum: olaparib maintenance vs placebo",
    tldr: "The first biomarker-directed drug approval in pancreatic cancer, for the roughly 5-7% with inherited BRCA mutations, though it did not extend overall survival.",
    summary: "POLO, trial NCT02184195 sponsored by AstraZeneca and Merck and reported in 2019, produced the first biomarker-directed drug approval in pancreatic cancer, for the roughly five to seven percent of patients with inherited BRCA mutations, though it did not extend overall survival. It randomised 154 patients with germline BRCA-mutated metastatic disease that had not progressed on at least sixteen weeks of platinum chemotherapy to olaparib maintenance or placebo, met its primary progression-free survival endpoint and led to FDA approval in December 2019, but overall survival was no different. OnCo links it to PARP inhibitors and germline testing, to BRCA1 and BRCA2 and PARP as targets. It is a single pivotal trial with no confirmatory study, and whether a progression benefit alone justifies maintenance is the open question.",
    result: "PFS HR 0.53; OS HR 0.83 (not significant).",
    drugs: ["olaparib"], cancers: ["pancreatic"], targets: ["brca", "parp"], technologies: ["parp-inhibitor", "germline-testing"], links: [ct("NCT02184195")], people: ["talia-golan", "hedy-kindler"],
  },
  {
    id: "panova-3", kind: "trial", name: "PANOVA-3", nct: "NCT03377491", phase: "3", status: "positive", yearReported: 2025, sponsor: "Novocure", asOf,
    setting: "Unresectable locally advanced PDAC: TTFields + gemcitabine/nab-paclitaxel vs chemotherapy alone",
    tldr: "PANOVA-3 is the trial behind the 2026 approval of a wearable electric-field device for pancreatic cancer, the first new approval in locally advanced disease in decades.",
    summary: "PANOVA-3, trial NCT03377491 sponsored by Novocure and reported in 2025, is the trial behind the 2026 approval of Optune Pax, a wearable electric-field device, for unresectable locally advanced pancreatic cancer, the first new approval in that setting in decades. It randomised 571 patients to tumour treating fields plus gemcitabine and nab-paclitaxel or chemotherapy alone, met its primary overall survival endpoint with a modest effect presented at the ASCO 2025 plenary, and also improved pain-free survival, leading to FDA approval in the first quarter of 2026. OnCo links it to pancreatic ductal adenocarcinoma, tumour treating fields, the Optune device record, gemcitabine plus nab-paclitaxel and Novocure. It is a single pivotal trial, and its open-label design and modest effect size are debated, so whether the device changes practice outside trial centres is the open question.",
    result: "OS 16.2 vs 14.2 months, HR 0.82.",
    drugs: ["optune", "gemcitabine-nab-paclitaxel"], cancers: ["pancreatic"], technologies: ["ttfields"], companies: ["novocure"], links: [ct("NCT03377491")],
  },
  {
    id: "amplify-7p", kind: "trial", name: "AMPLIFY-7P", nct: "NCT05726864", phase: "1/2", status: "negative", yearReported: 2026, sponsor: "Elicio Therapeutics", asOf,
    setting: "Adjuvant mKRAS PDAC after surgery and chemotherapy: ELI-002 7P vs observation",
    tldr: "The randomised test of an off-the-shelf KRAS vaccine after pancreatic surgery. It missed its primary goal in June 2026.",
    summary: "Did not meet the pre-specified primary DFS endpoint in the intent-to-treat population; post-hoc landmark analyses suggested ~14% absolute DFS benefit during active dosing. Company is exploring R0-resected subgroups for phase 3. A cautionary data point for shared-antigen vaccines versus personalised approaches.",
    result: "Primary DFS endpoint not met.",
    drugs: ["eli-002-7p"], cancers: ["pancreatic"], technologies: ["shared-antigen-vaccine"], links: [ct("NCT05726864")],
  },

  // ======================= TECHNOLOGIES =======================
  {
    id: "pancreatic-surveillance", kind: "technology", name: "High-risk pancreatic surveillance (CAPS / PRECEDE)", sections: ["early-detection"], status: "established", asOf,
    tldr: "Yearly MRI or endoscopic ultrasound for people with inherited risk, which catches pancreatic cancers while they are still operable.",
    summary: "The Cancer of the Pancreas Screening (CAPS) consortium and the PRECEDE consortium (>50 centres) follow carriers of BRCA2, PALB2, ATM, CDKN2A, STK11, Lynch genes, and familial pancreatic cancer kindreds with annual MRI/MRCP or EUS. In CAPS5 (2022), 77% of screen-detected cancers were stage I versus ~15% in the general population, with 5-year survival ~73%. Blood tests (CA19-9 glycan variants, MCED) and AI on prior CTs aim to extend surveillance to new-onset diabetes and other higher-risk groups.",
    principle: "Annual cross-sectional imaging of the pancreas in a population with 5-10x baseline risk; resection of high-grade precursor lesions and early cancers.",
    strengths: ["Stage shift to resectable disease in carriers", "Defines the population for blood-test validation"],
    limitations: ["Only ~10% of pancreatic cancers arise in identifiable high-risk groups", "Cyst overtreatment risk", "Cost and adherence"],
    technologies: ["mri", "ultrasound", "germline-testing", "mced"], cancers: ["pancreatic"], targets: ["brca"], terms: ["stage-shift"],
    links: [{ label: "PRECEDE consortium", url: "https://www.precedestudy.org" }],
  },
  {
    id: "pdac-organoid-pharmacotyping", links: [{ label: "Tiriac et al., Organoid profiling identifies common responders to chemotherapy in pancreatic cancer (Cancer Discovery 2018)", url: "https://doi.org/10.1158/2159-8290.CD-18-0349" }], kind: "technology", name: "PDAC organoid pharmacotyping", sections: ["drug-discovery", "diagnostics"], status: "emerging", asOf,
    tldr: "Growing a patient's pancreatic tumour as mini-organs in a dish and testing chemotherapies on them to pick the regimen most likely to work.",
    summary: "Tuveson (CSHL) and others established PDAC organoids with transcriptomic signatures predicting FOLFIRINOX versus gemcitabine sensitivity (Tiriac 2018). Prospective trials (e.g., PASS-01, HOPE) test organoid- or signature-guided first-line choice. Turnaround (~4-6 weeks) and take rate (~70%) are the practical limits; the GATA6 classical/basal-like signature is a faster proxy.",
    principle: "Endoscopic biopsy or resection tissue grown in Matrigel with defined factors; dose-response to drugs read by viability assays.",
    strengths: ["Direct functional read-out where genomics offers little", "Platform for RAS-inhibitor combination testing"],
    limitations: ["Timeline exceeds the clinical decision window for many patients", "No stroma or immune compartment"],
    technologies: ["organoids", "functional-drug-testing"], cancers: ["pancreatic"], institutions: ["cold-spring-harbor"],
  },

  // ======================= TERMS =======================
  {
    id: "ca19-9", kind: "term", name: "CA 19-9", category: "Biomarkers", asOf, wikipedia: W("CA19-9"),
    tldr: "A sugar molecule shed into the blood by most pancreatic cancers; useful to follow treatment, not to screen.",
    summary: "Sialyl-Lewis A carbohydrate antigen elevated in ~80% of PDAC; 5-10% of people (Lewis-negative) cannot make it. Prognostic at diagnosis, tracks response and recurrence, and defines eligibility in trials. Too non-specific for population screening (raised in biliary obstruction, pancreatitis), but glycan-engineered variants and combination with cfDNA are under study for high-risk surveillance.",
    cancers: ["pancreatic", "cholangiocarcinoma"], technologies: ["pancreatic-surveillance"], links: [{ label: "Wikipedia", url: W("CA19-9") }],
  },
  {
    id: "desmoplasia", kind: "term", name: "Desmoplasia (tumour stroma)", category: "Biology", asOf, wikipedia: W("Desmoplasia"),
    tldr: "The dense scar-like tissue that makes up most of a pancreatic tumour, walling off cancer cells from drugs and immune cells.",
    summary: "Cancer-associated fibroblasts, collagen, and hyaluronan can constitute 70-90% of PDAC volume, compressing vessels, limiting drug delivery, and excluding T cells. Stroma-depleting strategies failed or harmed (hedgehog inhibitors, PEGPH20 in HALO-301), revealing that stroma also restrains tumours. FAP-expressing fibroblasts are now an imaging and radioligand target rather than a depletion target.",
    cancers: ["pancreatic"], targets: ["fap"], technologies: ["fapi-pet"], terms: ["cold-vs-hot"], links: [{ label: "Wikipedia", url: W("Desmoplasia") }],
  },

  // ======================= COMPANIES =======================
  {
    id: "ipsen", trials: ["nct04243499"], links: [{ label: "Official website", url: "https://www.ipsen.com" }], kind: "company", name: "Ipsen", hq: "Paris", country: "FR", companyType: "pharma", website: "https://www.ipsen.com", ticker: "IPN.PA", asOf,
    tldr: "Ipsen is the French pharma behind Onivyde (liposomal irinotecan) and the NALIRIFOX regimen, and marketer of tovorafenib in Europe.",
    summary: "Ipsen is the Paris-based pharmaceutical company, listed as IPN.PA, behind Onivyde, the liposomal irinotecan at the heart of the NALIRIFOX regimen for pancreatic cancer, and the European marketer of tovorafenib for paediatric low-grade glioma under rights from Day One. Its oncology portfolio also includes Cabometyx outside the United States, tazemetostat for epithelioid sarcoma and somatostatin analogues for neuroendocrine tumours, with NAPOLI 3 establishing NALIRIFOX and CLARINET supporting lanreotide. OnCo links it to pancreatic ductal adenocarcinoma, glioma, neuroendocrine tumours and epithelioid sarcoma, and to the cabozantinib, irinotecan, tazemetostat and tovorafenib records. Whether NALIRIFOX becomes the default first-line regimen on value as well as efficacy is the open question. Each product has its own page.",
    drugs: ["nalirifox", "tovorafenib"], cancers: ["pancreatic", "glioblastoma"],
  },
  {
    id: "elicio-therapeutics", links: [{ label: "Official website", url: "https://elicio.com" }], kind: "company", name: "Elicio Therapeutics", hq: "Boston, MA", country: "US", companyType: "biotech", website: "https://elicio.com", ticker: "ELTX", asOf,
    tldr: "Small biotech developing lymph-node-targeted KRAS vaccines for pancreatic and colorectal cancer.",
    summary: "Elicio Therapeutics, based in Boston and listed as ELTX, is a small biotechnology company developing lymph-node-targeted vaccines against mutant KRAS for pancreatic and colorectal cancer. Its lead candidate, ELI-002 7P, is an amphiphile vaccine designed to carry mutant KRAS peptides to lymph nodes, and the AMPLIFY-7P phase 2 trial missed its primary endpoint in June 2026, after which the company said its phase 3 strategy was being refined. OnCo links it to pancreatic ductal adenocarcinoma and to the bottleneck of undruggable drivers, since KRAS vaccination is one route around the difficulty of inhibiting the protein directly. Whether a shared-antigen KRAS vaccine can succeed in a phase 3 where the phase 2 did not is the open question. ELI-002 7P has its own page.",
    drugs: ["eli-002-7p"], cancers: ["pancreatic"],
  },

  // ======================= IDEAS =======================
  {
    id: "idea-ras-inhibitor-neoadjuvant-pdac", links: [{ label: "ClinicalTrials.gov NCT06625320: RASolute 302", url: "https://clinicaltrials.gov/study/NCT06625320" }], kind: "idea", name: "RAS(ON) inhibitors to convert unresectable pancreatic cancer to resectable", maturity: "early-clinical", asOf,
    tldr: "If daraxonrasib shrinks metastatic tumours this well, use it before surgery to make more locally advanced tumours operable.",
    summary: "The proposal is to give the RAS(ON) inhibitor daraxonrasib, with or without chemotherapy, before surgery for borderline resectable and locally advanced pancreatic ductal adenocarcinoma, to see whether it raises the R0 resection rate compared with mFOLFIRINOX. Surgery remains the only route to cure, yet only a minority of patients present with resectable disease. The rationale is the deep and rapid responses seen with daraxonrasib and zoldonrasib, oral dosing, ctDNA clearance as an early surrogate, and the fact that RASolute 303 and 304 already move the drug earlier. The test would be a randomised phase 2 with R0 resection as the primary endpoint. At an early clinical stage, it addresses the bottleneck of the undruggable drivers.",
    hypothesis: "Neoadjuvant daraxonrasib (± chemotherapy) increases R0 resection rate and 2-year DFS in borderline/locally advanced PDAC compared with mFOLFIRINOX.",
    rationale: "Deep, rapid responses; oral dosing; ctDNA as an early surrogate; RASolute 303/304 already move the drug earlier.",
    test: "Randomised phase 2 with R0 resection as primary and DFS/OS secondary; pathologic response and ctDNA clearance as biomarkers.",
    drugs: ["daraxonrasib", "zoldonrasib", "folfirinox"], cancers: ["pancreatic"], targets: ["kras"], technologies: ["kras-inhibitors", "mrd-testing"], trials: ["rasolute-302"],
  },
  {
    id: "idea-mced-new-onset-diabetes", links: [{ label: "PATHFINDER: the first prospective test of a multi-cancer blood test in people without symptoms (The Lancet 2023)", url: "https://doi.org/10.1016/S0140-6736(23)01700-2" }, { label: "NHS-Galleri: design of the largest randomised trial of a multi-cancer blood test (Cancers 2022)", url: "https://doi.org/10.3390/cancers14194818" }], kind: "idea", name: "Blood-based pancreatic cancer detection in new-onset diabetes", maturity: "early-clinical", asOf,
    tldr: "Adults who suddenly develop diabetes after 50 have several times the usual risk of pancreatic cancer. Test their blood.",
    summary: "Adults who develop diabetes after the age of 50 carry a raised risk of harbouring an occult pancreatic ductal adenocarcinoma, and this idea proposes testing their blood rather than waiting for symptoms. Risk-stratified testing with a multi-cancer early detection assay such as Galleri, or a multi-analyte CA 19-9 panel, would be offered to people with a high END-PAC score, with imaging reserved for those who test positive. Because cancer is far more prevalent in this enriched group, the positive predictive value of a blood test rises into a useful range. The test would be a prospective NOD-type cohort with blinded blood testing and three years of cancer ascertainment. At an early clinical stage, it addresses the bottleneck that the hardest cancers are found late.",
    hypothesis: "Risk-stratified blood testing (MCED or multi-analyte CA19-9 panel) in high-END-PAC-score new-onset diabetes detects PDAC at resectable stage with acceptable PPV.",
    rationale: "Enriched prevalence (~1%) raises PPV to a useful range; imaging can be reserved for test-positives.",
    test: "Prospective cohort (NOD-type) with blinded blood testing and 3-year cancer ascertainment; compare stage distribution with contemporaneous controls.",
    cancers: ["pancreatic"], technologies: ["mced", "pancreatic-surveillance"], drugs: ["galleri"], terms: ["ppv", "ca19-9"],
  },

  // ======================= PAIRINGS =======================
  {
    id: "g12d-plus-pan-ras", kind: "pairing", name: "G12D-selective + pan-RAS(ON) inhibitor (zoldonrasib + daraxonrasib)", a: "zoldonrasib", b: "daraxonrasib", pairingType: "combination", asOf,
    tldr: "A drug that hits the exact mutation plus a drug that hits every RAS protein, so the tumour cannot escape through a wild-type RAS cousin.",
    summary: "This combination pairs zoldonrasib, a KRAS G12D-selective inhibitor, with daraxonrasib, a pan-RAS(ON) inhibitor, in pancreatic ductal adenocarcinoma carrying the G12D mutation. The mutant-selective drug spares normal tissue, while the pan-RAS drug blocks the wild-type RAS and secondary-mutation escape routes that limit single agents, giving vertical suppression of adaptive RAS reactivation along the RAS/RAF/MEK/ERK pathway. The evidence comes from a phase 1/2 study in second-line RAS G12D metastatic disease presented at ESMO GI 2026, which reported a high response rate and disease control with a manageable safety profile. It illustrates how a mutation-specific and a pathway-wide inhibitor can be layered so that the tumour cannot escape through a wild-type RAS relative.",
    rationale: "Mutant-selective inhibition spares normal tissue, while pan-RAS coverage blocks the wild-type RAS and secondary-mutation escape routes seen with single agents.",
    evidence: "Phase 1/2, n=60, 2026.",
    drugs: ["zoldonrasib", "daraxonrasib"], cancers: ["pancreatic"], targets: ["kras"], pathways: ["ras-mapk"],
  },
];

const spike: Spike = {
  cancerId: "pancreatic",
  entities,
  patch: {
    asOf,
    summary: "Pancreatic ductal adenocarcinoma is defined by late presentation, a near-universal KRAS mutation (G12D ~40%, G12V ~30%, G12R ~15%, G12C ~1-2%; ~10% KRAS-wild-type with actionable fusions in NRG1, NTRK, ALK, or BRAF), a desmoplastic stroma that occupies most of the tumour, and an immunologically cold microenvironment. Surgery is the only cure and only ~20% of patients present resectable; five-year survival remains ~13% overall but exceeds 40% for resected patients who complete adjuvant mFOLFIRINOX.\n\nFor thirty years the story was chemotherapy: gemcitabine (1997), FOLFIRINOX (2011), gemcitabine/nab-paclitaxel (2013), adjuvant mFOLFIRINOX (PRODIGE 24, 2018), NALIRIFOX (2024), with olaparib maintenance for germline BRCA carriers (POLO, 2019) and zenocutuzumab for NRG1 fusions (2024) as the only biomarker-directed drugs. 2026 changed the trajectory. Optune Pax tumour treating fields were approved for locally advanced disease (PANOVA-3). Daraxonrasib, a pan-RAS(ON) inhibitor, nearly doubled overall survival in previously treated metastatic disease in RASolute 302 (13.2 vs 6.7 months, HR 0.40), presented in the ASCO 2026 plenary with simultaneous NEJM publication; regulatory filing is expected under a national priority voucher. The G12D-selective zoldonrasib, combined with daraxonrasib or with chemotherapy, produced response rates never before seen in this disease.\n\nWhat remains unsolved: detection (no screening outside high-risk surveillance; MCED tests and new-onset-diabetes enrichment are the leading ideas), the stroma and immune exclusion that have defeated every checkpoint inhibitor trial, resistance to RAS inhibitors (already emerging), and the fact that half of patients are too frail for the most effective regimens. The most promising directions are RAS inhibitors moving into first line and neoadjuvant settings, personalised (autogene cevumeran) and shared-antigen (ELI-002 7P) vaccines in the adjuvant setting despite AMPLIFY-7P's miss, CLDN18.2 and FAP-directed delivery, and blood-based early detection.",
    subtypes: ["Classical (GATA6-high, better prognosis, more chemosensitive)", "Basal-like / squamous (GATA6-low, chemotherapy-resistant)", "KRAS-wild-type (~10%; NRG1, NTRK, ALK, BRAF fusions; MSI-H)", "Germline-driven (BRCA2, PALB2, ATM, CDKN2A, STK11)", "Pancreatic neuroendocrine tumours (a different disease; see neuroendocrine)"],
    biomarkers: ["CA 19-9 (prognosis and monitoring)", "KRAS mutation subtype (G12D/V/R/C; wild-type triggers fusion testing)", "Germline panel (BRCA1/2, PALB2, ATM, CDKN2A, STK11, Lynch)", "HRD / platinum sensitivity", "GATA6 (classical vs basal-like)", "ctDNA (KRAS-mutant cfDNA) for MRD and response", "FAPI PET avidity (investigational)", "CLDN18.2 IHC (trials)"],
    standardOfCare: [
      { setting: "High-risk surveillance", approach: "Annual MRI/MRCP or EUS for germline carriers and familial kindreds (CAPS/PRECEDE); germline testing for every diagnosed patient and first-degree relatives.", refs: ["pancreatic-surveillance", "germline-testing", "mri"] },
      { setting: "Resectable / borderline", approach: "Neoadjuvant mFOLFIRINOX (borderline; increasingly resectable), surgery, then adjuvant mFOLFIRINOX to complete ~6 months (PRODIGE 24); gemcitabine/capecitabine if unfit. Chemoradiation selectively (PREOPANC).", refs: ["folfirinox", "prodige-24", "preopanc", "robotic-surgery"], guideline: { version: "NCCN Guidelines: Pancreatic Adenocarcinoma", url: "https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1455" } },
      { setting: "Locally advanced unresectable", approach: "FOLFIRINOX or gem/nab-paclitaxel; TTFields with gem/nab-paclitaxel (Optune Pax, 2026); SBRT or MR-guided ablative radiotherapy; IRE in selected centres; reassess for conversion surgery.", refs: ["panova-3", "optune", "gemcitabine-nab-paclitaxel", "sbrt"], guideline: { version: "NCCN Guidelines: Pancreatic Adenocarcinoma", url: "https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1455" } },
      { setting: "Metastatic, first line", approach: "mFOLFIRINOX or NALIRIFOX (fit) or gemcitabine/nab-paclitaxel; olaparib maintenance if gBRCA after ≥16 weeks platinum; zenocutuzumab if NRG1 fusion; pembrolizumab if MSI-H; trials of RAS inhibitors + chemotherapy.", refs: ["nalirifox", "napoli-3", "polo", "zoldonrasib"], guideline: { version: "NCCN Guidelines: Pancreatic Adenocarcinoma", url: "https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1455" } },
      { setting: "Metastatic, second line", approach: "Daraxonrasib once approved (RASolute 302: OS 13.2 vs 6.7 months) is expected to become the standard; otherwise switch backbone (gem/nab-pac after FOLFIRINOX, or liposomal irinotecan/5-FU after gemcitabine).", refs: ["rasolute-302", "daraxonrasib"] },
    ],
    stateOfArt: [
      "RASolute 302 (2026): first targeted therapy to nearly double survival in pancreatic cancer; daraxonrasib heading for approval.",
      "G12D-selective zoldonrasib combinations with 50% response rates in previously treated disease.",
      "Adjuvant mFOLFIRINOX gives median OS beyond 4 years in resected fit patients.",
      "High-risk surveillance shifts ~3 in 4 detected cancers to stage I in carriers.",
      "Personalised mRNA vaccine responders remain recurrence-free for years (autogene cevumeran phase 1).",
    ],
    history: [
      { year: 1935, title: "Whipple describes pancreaticoduodenectomy", note: "Surgery becomes the only curative option, a status it still holds." },
      { year: 1982, title: "KRAS identified as a human oncogene", note: "Within a decade shown to be mutated in ~90% of pancreatic cancers.", refs: ["kras"] },
      { year: 1997, title: "Gemcitabine approved", note: "Clinical benefit response over 5-FU; the standard for 14 years.", refs: ["gemcitabine-nab-paclitaxel"] },
      { year: 2011, title: "FOLFIRINOX: OS 11.1 vs 6.8 months", note: "PRODIGE 4 / ACCORD 11 establishes combination chemotherapy for fit patients.", refs: ["folfirinox"] },
      { year: 2013, title: "Gemcitabine + nab-paclitaxel (MPACT)", refs: ["gemcitabine-nab-paclitaxel"] },
      { year: 2018, title: "Adjuvant mFOLFIRINOX (PRODIGE 24)", note: "Median OS 54 months after resection.", refs: ["prodige-24"] },
      { year: 2019, title: "POLO: olaparib maintenance in gBRCA", note: "First biomarker-directed approval.", refs: ["polo", "olaparib"] },
      { year: 2021, title: "Sotorasib proves KRAS is druggable (G12C)", note: "Only 1-2% of pancreatic cancers carry G12C, but the door is open.", refs: ["sotorasib"] },
      { year: 2023, title: "MRTX1133 regressions in G12D models; autogene cevumeran phase 1 in Nature", refs: ["mrtx1133", "autogene-cevumeran"] },
      { year: 2024, title: "NALIRIFOX approved; zenocutuzumab for NRG1 fusions", refs: ["nalirifox", "zenocutuzumab"] },
      { year: 2025, title: "PANOVA-3 positive; daraxonrasib phase 1/2 OS ~14.5 months", refs: ["panova-3", "daraxonrasib"] },
      { year: 2026, title: "RASolute 302: daraxonrasib OS 13.2 vs 6.7 months (HR 0.40)", note: "ASCO plenary and NEJM; Optune Pax approved; zoldonrasib combinations reported; AMPLIFY-7P vaccine misses.", refs: ["rasolute-302", "optune", "zoldonrasib", "amplify-7p"] },
    ],
    pipeline: ["zoldonrasib", "elironrasib", "mrtx1133", "eli-002-7p", "rasolute-302", "g12d-plus-pan-ras", "pancreatic-surveillance", "pdac-organoid-pharmacotyping", "idea-ras-inhibitor-neoadjuvant-pdac", "idea-mced-new-onset-diabetes", "idea-shared-kras-vaccine-adjuvant", "idea-fap-theranostics-pancancer", "mrd-testing"],
    openProblems: [
      "Resistance to RAS(ON) inhibitors: secondary RAS mutations, RTK bypass, and adaptive feedback are already described; combination strategies are unproven in phase 3.",
      "Half of patients are too frail for FOLFIRINOX-class regimens; RAS inhibitors may change this but toxicity (rash, stomatitis) is not trivial.",
      "No population screening; MCED sensitivity for stage I PDAC is low and PPV in average-risk adults is poor.",
      "Immune exclusion: every checkpoint inhibitor trial has failed outside MSI-H disease; vaccines must overcome a cold microenvironment.",
      "Neoadjuvant versus upfront surgery for resectable disease remains unresolved after PREOPANC-2, NORPACT-1, and Alliance A021806.",
      "Cachexia and biliary obstruction limit therapy delivery; supportive care is under-studied.",
      "Access: RAS inhibitors and TTFields will be expensive; global disparities will widen.",
    ],
    targets: ["kras", "brca", "cldn18-2", "fap", "mesothelin", "her3", "ntrk", "parp"],
    technologies: ["kras-inhibitors", "cytotoxic-chemotherapy", "ttfields", "sbrt", "irreversible-electroporation", "mr-linac", "fapi-pet", "mced", "neoantigen-mrna-vaccine", "shared-antigen-vaccine", "germline-testing", "pancreatic-surveillance", "pdac-organoid-pharmacotyping", "car-t", "liquid-biopsy"],
    pathways: ["ras-mapk", "ddr", "emt"],
    companies: ["revolution-medicines", "ipsen", "novocure", "biontech", "elicio-therapeutics", "astrazeneca", "carsgen", "bms"],
    terms: ["ca19-9", "desmoplasia", "cold-vs-hot", "mrd", "hazard-ratio"],
    trials: ["rasolute-302", "napoli-3", "prodige-24", "preopanc", "polo", "panova-3", "amplify-7p"],
    related: ["kras-roadmap", "early-detection-roadmap"],
    tags: ["spike", "gi"],
  },
};

export default spike;

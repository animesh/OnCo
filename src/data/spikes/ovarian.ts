import type { CompanyInput, DrugInput, EntityInput, IdeaInput, PairingInput, TechnologyInput, TermInput, TrialInput } from "@/lib/schema";
import type { Spike } from "./index";
import { supplement } from "../supplement";

/**
 * Ovarian cancer spike: deepens the record and adds the trials, drugs, terms, and pairings
 * it depends on. Facts checked 2026-09-07. Numbers are quoted only where a source is linked.
 */
const asOf = "2026-09-07";
const W = (s: string) => `https://en.wikipedia.org/wiki/${s}`;
const ct = (nct: string) => ({ label: `ClinicalTrials.gov ${nct}`, url: `https://clinicaltrials.gov/study/${nct}` });

type T = Omit<TrialInput, "kind" | "asOf">;
const t = (x: T): TrialInput => ({ kind: "trial", asOf, ...x });
type D = Omit<DrugInput, "kind" | "asOf">;
const d = (x: D): DrugInput => ({ kind: "drug", asOf, ...x });
type C = Omit<CompanyInput, "kind" | "asOf">;
const co = (x: C): CompanyInput => ({ kind: "company", asOf, ...x });
type Tm = Omit<TermInput, "kind" | "asOf">;
const tm = (x: Tm): TermInput => ({ kind: "term", asOf, ...x });
type P = Omit<PairingInput, "kind" | "asOf">;
const pr = (x: P): PairingInput => ({ kind: "pairing", asOf, ...x });
type I = Omit<IdeaInput, "kind" | "asOf">;
const idea = (x: I): IdeaInput => ({ kind: "idea", asOf, ...x });
type Te = Omit<TechnologyInput, "kind" | "asOf">;
const te = (x: Te): TechnologyInput => ({ kind: "technology", asOf, ...x });

// ======================= TRIALS =======================
const trials: TrialInput[] = [
  t({ id: "solo-1", name: "SOLO-1", nct: "NCT01844986", phase: "3", status: "positive", yearReported: 2018, sponsor: "AstraZeneca / Merck", enrolled: 391,
    setting: "Newly diagnosed advanced BRCA-mutated ovarian cancer in response to platinum chemotherapy: olaparib maintenance for 2 years vs placebo",
    tldr: "Two years of an olaparib pill after chemotherapy made a large share of women with BRCA-mutated ovarian cancer long-term survivors.",
    summary: "PFS HR 0.30 at the primary analysis (NEJM 2018). At 7 years, 67.0% of olaparib patients were alive versus 46.5% on placebo (HR 0.55; JCO 2023), the first PARP inhibitor trial with a clinically meaningful overall survival gain in the first-line setting and the basis for the 2018 maintenance approval. Roughly half of olaparib patients remained progression-free at 5 years.",
    result: "PFS HR 0.30; 7-year OS 67.0% vs 46.5% (HR 0.55).",
    outcomes: [
      { endpoint: "Progression-free survival", primary: true, unit: "HR", arms: [{ name: "Olaparib", n: 260 }, { name: "Placebo", n: 131 }], hr: 0.30, ci: [0.23, 0.41], source: "https://www.nejm.org/doi/full/10.1056/NEJMoa1810858" },
      { endpoint: "Overall survival at 7 years", unit: "%", arms: [{ name: "Olaparib", value: 67.0 }, { name: "Placebo", value: 46.5 }], hr: 0.55, ci: [0.40, 0.76], source: "https://ascopubs.org/doi/10.1200/JCO.22.01549" },
    ],
    replication: "PRIMA (niraparib) and PAOLA-1 (olaparib + bevacizumab) reproduced the PFS effect in HRD-positive disease; only SOLO-1 has shown a clear OS gain.",
    drugs: ["olaparib"], targets: ["brca", "parp"], cancers: ["ovarian", "high-grade-serous-ovarian-cancer", "platinum-sensitive-ovarian-cancer"], technologies: ["parp-inhibitor"], links: [ct("NCT01844986"), { label: "NEJM 2018", url: "https://www.nejm.org/doi/full/10.1056/NEJMoa1810858" }, { label: "7-year OS, JCO 2023", url: "https://ascopubs.org/doi/10.1200/JCO.22.01549" }], people: ["kathleen-moore"] }),
  t({ id: "prima", name: "PRIMA / ENGOT-OV26", nct: "NCT02655016", phase: "3", status: "mixed", yearReported: 2019, sponsor: "GSK (Tesaro)", enrolled: 733,
    setting: "Newly diagnosed advanced ovarian cancer at high risk of relapse, any BRCA/HRD status: niraparib maintenance vs placebo",
    tldr: "Extended PARP maintenance to women without BRCA mutations, but the survival benefit did not materialise on longer follow-up.",
    summary: "PFS 13.8 vs 8.2 months overall (HR 0.62) and 21.9 vs 10.4 months in HRD-positive disease (HR 0.43; NEJM 2019), leading to an all-comers first-line maintenance approval in 2020. The final overall survival analysis (2024) showed no OS difference (HR 1.01 overall), and the HR-proficient subgroup's benefit was small, prompting label debates and a shift toward HRD-guided use.",
    result: "PFS HR 0.62 overall, 0.43 HRD-positive; final OS HR 1.01.",
    outcomes: [
      { endpoint: "Progression-free survival (HRD-positive)", primary: true, unit: "months", arms: [{ name: "Niraparib", value: 21.9 }, { name: "Placebo", value: 10.4 }], hr: 0.43, ci: [0.31, 0.59], source: "https://www.nejm.org/doi/full/10.1056/NEJMoa1910962" },
      { endpoint: "Progression-free survival (overall)", primary: true, unit: "months", arms: [{ name: "Niraparib", n: 487, value: 13.8 }, { name: "Placebo", n: 246, value: 8.2 }], hr: 0.62, ci: [0.50, 0.76], source: "https://www.nejm.org/doi/full/10.1056/NEJMoa1910962" },
    ],
    replication: "ATHENA-MONO (rucaparib) reproduced the all-comers PFS gain; no all-comers OS benefit has been shown for any PARP inhibitor.",
    drugs: ["niraparib"], targets: ["parp"], cancers: ["ovarian", "high-grade-serous-ovarian-cancer", "platinum-sensitive-ovarian-cancer"], terms: ["hrd"], links: [ct("NCT02655016"), { label: "NEJM 2019", url: "https://www.nejm.org/doi/full/10.1056/NEJMoa1910962" }], people: ["antonio-gonzalez-martin"] }),
  t({ id: "paola-1", name: "PAOLA-1 / ENGOT-ov25", nct: "NCT02477644", phase: "3", status: "positive", yearReported: 2019, sponsor: "ARCAGY-GINECO / AstraZeneca", enrolled: 806,
    setting: "Newly diagnosed advanced ovarian cancer already on bevacizumab maintenance: adding olaparib vs placebo",
    tldr: "Adding olaparib to bevacizumab maintenance roughly doubled progression-free time in tumours with faulty DNA repair, and improved survival in that group.",
    summary: "PFS 22.1 vs 16.6 months overall (HR 0.59) and 37.2 vs 17.7 months in HRD-positive tumours (HR 0.33; NEJM 2019). Five-year OS in HRD-positive patients was 65.5% vs 48.4% (HR 0.62; Annals of Oncology 2023). No benefit in HRD-negative disease. Approved in 2020 for HRD-positive tumours; it established HRD testing as a decision point.",
    result: "PFS HR 0.59 overall, 0.33 HRD-positive; 5-year OS 65.5% vs 48.4% in HRD-positive.",
    outcomes: [
      { endpoint: "Progression-free survival (HRD-positive)", unit: "months", arms: [{ name: "Olaparib + bevacizumab", value: 37.2 }, { name: "Placebo + bevacizumab", value: 17.7 }], hr: 0.33, ci: [0.25, 0.45], source: "https://www.nejm.org/doi/full/10.1056/NEJMoa1911361" },
      { endpoint: "Overall survival at 5 years (HRD-positive)", unit: "%", arms: [{ name: "Olaparib + bevacizumab", value: 65.5 }, { name: "Placebo + bevacizumab", value: 48.4 }], hr: 0.62, ci: [0.45, 0.85], source: "https://www.annalsofoncology.org/article/S0923-7534(23)00658-0/fulltext" },
    ],
    drugs: ["olaparib", "bevacizumab"], targets: ["parp", "brca", "vegf"], cancers: ["ovarian", "high-grade-serous-ovarian-cancer", "platinum-sensitive-ovarian-cancer"], terms: ["hrd"], links: [ct("NCT02477644"), { label: "NEJM 2019", url: "https://www.nejm.org/doi/full/10.1056/NEJMoa1911361" }], people: ["isabelle-ray-coquard"] }),
  t({ id: "athena-mono", name: "ATHENA-MONO / GOG-3020", nct: "NCT03522246", phase: "3", status: "positive", yearReported: 2022, sponsor: "Clovis (now pharma&)", enrolled: 538,
    setting: "Newly diagnosed advanced ovarian cancer after response to first-line platinum: rucaparib maintenance vs placebo",
    tldr: "A third PARP inhibitor showed the same pattern: longer disease control after first-line chemotherapy, biggest in tumours with faulty DNA repair.",
    summary: "ATHENA-MONO, also GOG-3020, trial NCT03522246 sponsored by Clovis, now pharma&, and published in JCO in 2022, showed that a third PARP inhibitor follows the same pattern as the others: rucaparib maintenance after response to first-line platinum chemotherapy in newly diagnosed advanced ovarian cancer prolongs disease control, most in tumours with faulty DNA repair. It randomised 538 patients to rucaparib or placebo and met its primary progression-free survival endpoint in the whole population with a larger effect in homologous recombination-deficient disease. OnCo links it to ovarian cancer, PARP as a target, rucaparib and Bradley J. Monk. Clovis went bankrupt in 2022 and US first-line maintenance labelling did not follow, so whether rucaparib ever takes a place beside olaparib and niraparib in first-line maintenance is the open question.",
    result: "PFS 20.2 vs 9.2 months (HR 0.52).",
    outcomes: [{ endpoint: "Progression-free survival (ITT)", primary: true, unit: "months", arms: [{ name: "Rucaparib", n: 427, value: 20.2 }, { name: "Placebo", n: 111, value: 9.2 }], hr: 0.52, ci: [0.40, 0.68], source: "https://ascopubs.org/doi/abs/10.1200/JCO.22.01003" }],
    drugs: ["rucaparib"], targets: ["parp"], cancers: ["ovarian", "platinum-sensitive-ovarian-cancer"], links: [ct("NCT03522246"), { label: "JCO 2022", url: "https://ascopubs.org/doi/abs/10.1200/JCO.22.01003" }], people: ["bradley-monk"] }),
  t({ id: "duo-o", name: "DUO-O / ENGOT-ov46", nct: "NCT03737643", phase: "3", status: "mixed", yearReported: 2023, sponsor: "AstraZeneca", enrolled: 1130,
    setting: "Newly diagnosed non-BRCA-mutated advanced ovarian cancer: chemotherapy + bevacizumab + durvalumab, then durvalumab + bevacizumab ± olaparib maintenance, vs standard",
    tldr: "Adding immunotherapy and olaparib to bevacizumab slowed progression but has not improved survival, and the regimen is not approved.",
    summary: "DUO-O, also ENGOT-ov46, trial NCT03737643 sponsored by AstraZeneca and reported at ASCO 2023, tested adding durvalumab and olaparib to chemotherapy plus bevacizumab in newly diagnosed non-BRCA-mutated advanced ovarian cancer, and found that the combination slowed progression but has not improved survival, so the regimen is not approved. It randomised 1,130 patients, met its primary progression-free survival endpoint in the non-BRCA population for the durvalumab plus olaparib arm, but the interim overall survival analysis published in Annals of Oncology in 2025 showed no survival signal. Whether any subgroup of ovarian cancer benefits from first-line checkpoint blockade remains the open question.",
    result: "PFS HR 0.63; interim OS HR 0.95.",
    outcomes: [{ endpoint: "Progression-free survival (non-tBRCAm ITT)", primary: true, unit: "HR", arms: [{ name: "Durvalumab + olaparib + bevacizumab" }, { name: "Bevacizumab + placebo" }], hr: 0.63, ci: [0.52, 0.76], source: "https://ascopubs.org/doi/10.1200/JCO.2023.41.17_suppl.LBA5506" }],
    drugs: ["durvalumab", "olaparib", "bevacizumab"], targets: ["pdl1", "parp"], cancers: ["ovarian"], links: [ct("NCT03737643"), { label: "OncLive on OS", url: "https://www.onclive.com/view/chemotherapy-plus-durvalumab-bevacizumab-and-olaparib-fails-to-offer-os-benefit-in-newly-diagnosed-non-tbrca-mutated-ovarian-cancer" }] }),
  t({ id: "gog-0218-icon7", name: "GOG-0218 & ICON7 (bevacizumab)", nct: "NCT00262847", phase: "3", status: "mixed", yearReported: 2011, sponsor: "GOG; MRC/ICON", enrolled: 3401,
    setting: "Newly diagnosed advanced ovarian cancer: carboplatin-paclitaxel ± bevacizumab with bevacizumab maintenance",
    tldr: "Adding the blood-vessel blocker bevacizumab to first-line chemotherapy delayed relapse by a few months but did not extend life overall.",
    summary: "GOG-0218 (1,873 patients): PFS 14.1 vs 10.3 months with concurrent-plus-maintenance bevacizumab (HR 0.72); no OS benefit (NEJM 2011). ICON7 (1,528): modest PFS gain, with an OS benefit confined to high-risk (stage IV or suboptimally debulked) disease. Bevacizumab became a first-line option, mainly for high-risk patients and as the partner for olaparib in PAOLA-1.",
    result: "GOG-0218 PFS 14.1 vs 10.3 months (HR 0.72); no OS benefit.",
    outcomes: [{ endpoint: "Progression-free survival (GOG-0218)", primary: true, unit: "months", arms: [{ name: "Bevacizumab throughout", value: 14.1 }, { name: "Chemotherapy alone", value: 10.3 }], hr: 0.72, ci: [0.63, 0.82], source: "https://www.nejm.org/doi/full/10.1056/NEJMoa1104390" }],
    drugs: ["bevacizumab", "carboplatin", "paclitaxel"], targets: ["vegf"], cancers: ["ovarian"], links: [ct("NCT00262847"), { label: "GOG-0218, NEJM 2011", url: "https://www.nejm.org/doi/full/10.1056/NEJMoa1104390" }], people: ["jonathan-ledermann"] }),
  t({ id: "ovhipec-1", name: "OVHIPEC-1", nct: "NCT00426257", phase: "3", status: "positive", yearReported: 2018, sponsor: "Netherlands Cancer Institute", enrolled: 245,
    setting: "Stage III ovarian cancer at interval cytoreductive surgery after neoadjuvant chemotherapy: HIPEC with cisplatin vs surgery alone",
    tldr: "Washing the abdomen with heated chemotherapy during interval surgery extended survival by about a year.",
    summary: "OVHIPEC-1, trial NCT00426257 sponsored by the Netherlands Cancer Institute and reported in the New England Journal of Medicine in 2018, showed that washing the abdomen with heated cisplatin during interval cytoreductive surgery for stage III ovarian cancer after neoadjuvant chemotherapy extended survival by about a year. It randomised 245 patients to surgery with or without hyperthermic intraperitoneal chemotherapy, improved overall survival without increasing serious complications, and the benefit held at ten-year follow-up published in Lancet Oncology in 2023. OnCo links it to ovarian cancer, HIPEC and PIPAC intraperitoneal chemotherapy, the Netherlands Cancer Institute, Willemien J. van Driel and the pairing of HIPEC at interval surgery. Uptake remains uneven, and whether HIPEC also helps at primary surgery, which OVHIPEC-2 is testing, is the open question.",
    result: "OS 45.7 vs 33.9 months (HR 0.67).",
    outcomes: [{ endpoint: "Overall survival", unit: "months", arms: [{ name: "Surgery + HIPEC", n: 122, value: 45.7 }, { name: "Surgery alone", n: 123, value: 33.9 }], hr: 0.67, ci: [0.48, 0.94], source: "https://www.nejm.org/doi/full/10.1056/NEJMoa1708618" }],
    replication: "Korean trial (Lim et al., JAMA Surgery 2022) showed benefit in the interval-surgery subgroup; OVHIPEC-2 (primary surgery) ongoing.",
    technologies: ["hipec"], cancers: ["ovarian"], institutions: ["nki"], links: [ct("NCT00426257"), { label: "NEJM 2018", url: "https://www.nejm.org/doi/full/10.1056/NEJMoa1708618" }], people: ["willemien-van-driel"] }),
  t({ id: "desktop-iii", name: "DESKTOP III / ENGOT-ov20", nct: "NCT01166737", phase: "3", status: "positive", yearReported: 2020, sponsor: "AGO", enrolled: 408,
    setting: "First platinum-sensitive relapse with a positive AGO score: secondary cytoreductive surgery + chemotherapy vs chemotherapy alone",
    tldr: "Operating again at first relapse, in carefully selected women, added about seven months of life.",
    summary: "DESKTOP III, also ENGOT-ov20, trial NCT01166737 sponsored by the AGO group and published in the New England Journal of Medicine in 2021, showed that operating again at first platinum-sensitive relapse of ovarian cancer, in women carefully selected by a positive AGO score, adds about seven months of life. It randomised 407 patients to secondary cytoreductive surgery plus chemotherapy or chemotherapy alone, met its primary overall survival endpoint, and the benefit was concentrated in patients whose tumour was completely resected. OnCo links it to ovarian cancer, minimally invasive surgery and Andreas du Bois; it contradicted the negative surgery arm of GOG-0213, with patient selection the likely explanation, while the Chinese SOC-1 trial showed a progression benefit. Whether the AGO score can be reproduced outside expert centres is the open question.",
    result: "OS 53.7 vs 46.0 months (HR 0.75).",
    outcomes: [{ endpoint: "Overall survival", primary: true, unit: "months", arms: [{ name: "Surgery + chemotherapy", n: 206, value: 53.7 }, { name: "Chemotherapy alone", n: 201, value: 46.0 }], hr: 0.75, ci: [0.59, 0.96], source: "https://www.nejm.org/doi/full/10.1056/NEJMoa2103294" }],
    replication: "GOG-0213 found no benefit without selection criteria; SOC-1 (China) showed a PFS benefit.",
    technologies: ["robotic-surgery"], cancers: ["ovarian", "high-grade-serous-ovarian-cancer", "platinum-sensitive-ovarian-cancer"], links: [ct("NCT01166737"), { label: "NEJM 2021", url: "https://www.nejm.org/doi/full/10.1056/NEJMoa2103294" }], people: ["andreas-du-bois"] }),
  t({ id: "mirasol", name: "MIRASOL / GOG-3045", nct: "NCT04209855", phase: "3", status: "positive", yearReported: 2023, sponsor: "ImmunoGen (AbbVie)", enrolled: 453,
    setting: "Platinum-resistant ovarian cancer with high folate receptor alpha expression, 1-3 prior lines: mirvetuximab soravtansine vs chemotherapy",
    tldr: "The first ADC to extend life in ovarian cancer, for the roughly one-third of tumours with high folate receptor alpha.",
    summary: "MIRASOL, also GOG-3045, trial NCT04209855 sponsored by ImmunoGen, now AbbVie, and published in the New England Journal of Medicine in 2023, produced the first antibody-drug conjugate to extend life in ovarian cancer, for the roughly one-third of platinum-resistant tumours with high folate receptor alpha expression. It randomised 453 women with one to three prior lines to mirvetuximab soravtansine or chemotherapy, met its primary progression-free survival endpoint and improved overall survival, leading to full approval in March 2024; ocular toxicity is frequent but reversible with eye-drop prophylaxis. OnCo links it to ovarian cancer, antibody-drug conjugates, folate receptor alpha, mirvetuximab soravtansine, Kathleen N. Moore, Ursula A. Matulonis and the GOG Foundation. Whether the drug can move into platinum-sensitive or maintenance settings is the open question.",
    result: "OS 16.46 vs 12.75 months (HR 0.67).",
    outcomes: [
      { endpoint: "Progression-free survival", primary: true, unit: "months", arms: [{ name: "Mirvetuximab", n: 227, value: 5.62 }, { name: "Chemotherapy", n: 226, value: 3.98 }], hr: 0.65, ci: [0.52, 0.81], source: "https://www.nejm.org/doi/full/10.1056/NEJMoa2309169" },
      { endpoint: "Overall survival", unit: "months", arms: [{ name: "Mirvetuximab", value: 16.46 }, { name: "Chemotherapy", value: 12.75 }], hr: 0.67, ci: [0.50, 0.89], source: "https://www.nejm.org/doi/full/10.1056/NEJMoa2309169" },
    ],
    drugs: ["mirvetuximab-soravtansine"], targets: ["folr1"], cancers: ["ovarian", "platinum-resistant-ovarian-cancer"], technologies: ["adc"], links: [ct("NCT04209855"), { label: "NEJM 2023", url: "https://www.nejm.org/doi/full/10.1056/NEJMoa2309169" }], people: ["kathleen-moore", "ursula-matulonis"] }),
  t({ id: "rosella", name: "ROSELLA / GOG-3073", nct: "NCT05257408", phase: "3", status: "positive", yearReported: 2025, sponsor: "Corcept", enrolled: 381,
    setting: "Platinum-resistant ovarian cancer, 1-3 prior lines: relacorilant + nab-paclitaxel vs nab-paclitaxel",
    tldr: "Blocking cortisol signalling in tumour cells made chemotherapy work better and extended life in resistant ovarian cancer.",
    summary: "ROSELLA, also GOG-3073, trial NCT05257408 sponsored by Corcept and published in the Lancet in 2025, showed that blocking cortisol signalling in tumour cells with relacorilant makes nab-paclitaxel chemotherapy work better and extends life in platinum-resistant ovarian cancer. It randomised 381 women with one to three prior lines to relacorilant plus nab-paclitaxel or nab-paclitaxel alone, met its primary progression-free survival endpoint and improved overall survival, leading to FDA approval in the first quarter of 2026 as Lifyorli, the first-in-class glucocorticoid receptor antagonist in oncology. OnCo links it to ovarian cancer, relacorilant, paclitaxel and Corcept Therapeutics, and the record notes it as a chemosensitisation mechanism rather than a new cytotoxic. Whether the approach transfers to other chemotherapy-treated cancers is the open question.",
    result: "OS 16.0 vs 11.9 months (HR 0.69).",
    outcomes: [
      { endpoint: "Progression-free survival", primary: true, unit: "months", arms: [{ name: "Relacorilant + nab-paclitaxel", n: 188, value: 6.5 }, { name: "Nab-paclitaxel", n: 193, value: 5.5 }], hr: 0.70, ci: [0.54, 0.91], source: "https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(25)01011-6/fulltext" },
      { endpoint: "Overall survival", unit: "months", arms: [{ name: "Relacorilant + nab-paclitaxel", value: 16.0 }, { name: "Nab-paclitaxel", value: 11.9 }], hr: 0.69, source: "https://www.targetedonc.com/view/new-approaches-reshape-treatment-for-low-grade-serous-and-resistant-disease" },
    ],
    drugs: ["relacorilant", "paclitaxel"], cancers: ["ovarian", "platinum-resistant-ovarian-cancer"], companies: ["corcept"], links: [ct("NCT05257408")] }),
  t({ id: "keynote-b96", name: "KEYNOTE-B96 / ENGOT-ov65", nct: "NCT05116189", phase: "3", status: "positive", yearReported: 2025, sponsor: "Merck",
    setting: "Platinum-resistant recurrent ovarian cancer, 1-2 prior lines: pembrolizumab + weekly paclitaxel ± bevacizumab vs placebo + paclitaxel ± bevacizumab",
    tldr: "After a decade of failures, the first immunotherapy trial to extend survival in ovarian cancer, leading to the first checkpoint-inhibitor approval in the disease.",
    summary: "KEYNOTE-B96, also ENGOT-ov65, trial NCT05116189 sponsored by Merck and published in the Lancet in 2026, was, after a decade of failures, the first immunotherapy trial to extend survival in ovarian cancer, leading to the first checkpoint inhibitor approval in the disease. It randomised women with platinum-resistant recurrent disease to pembrolizumab or placebo with weekly paclitaxel, with or without bevacizumab, met its primary progression-free survival endpoint and improved overall survival in PD-L1-positive tumours, with a smaller survival benefit overall, and FDA approval followed in February 2026 for PD-L1-positive disease, including the subcutaneous formulation. OnCo links it to ovarian cancer, PD-1 and PD-L1 as targets, pembrolizumab, paclitaxel, bevacizumab and the CPS term. Why immunotherapy works in resistant but not first-line disease is the open question.",
    result: "OS 18.2 vs 14.0 months in CPS ≥1 (HR 0.76); ITT OS HR 0.82.",
    outcomes: [
      { endpoint: "Progression-free survival (CPS ≥1)", primary: true, unit: "months", arms: [{ name: "Pembrolizumab + paclitaxel ± bev", value: 8.3 }, { name: "Placebo + paclitaxel ± bev", value: 7.2 }], hr: 0.72, ci: [0.58, 0.89], source: "https://pubmed.ncbi.nlm.nih.gov/41974150/" },
      { endpoint: "Overall survival (CPS ≥1)", unit: "months", arms: [{ name: "Pembrolizumab + paclitaxel ± bev", value: 18.2 }, { name: "Placebo + paclitaxel ± bev", value: 14.0 }], hr: 0.76, ci: [0.61, 0.94], source: "https://pubmed.ncbi.nlm.nih.gov/41974150/" },
      { endpoint: "Overall survival (all patients)", unit: "months", arms: [{ name: "Pembrolizumab + paclitaxel ± bev", value: 17.7 }, { name: "Placebo + paclitaxel ± bev", value: 14.0 }], hr: 0.82, ci: [0.69, 0.97], source: "https://www.targetedonc.com/view/final-keynote-b96-analysis-confirms-survival-benefits-with-pembrolizumab-regimen-in-ovarian-cancer" },
    ],
    replication: "First positive phase 3; earlier trials (JAVELIN Ovarian 200, IMagyn050, DUO-O) were negative for OS.",
    drugs: ["pembrolizumab", "paclitaxel", "bevacizumab"], targets: ["pd1", "pdl1"], cancers: ["ovarian", "platinum-resistant-ovarian-cancer"], terms: ["cps"], links: [ct("NCT05116189"), { label: "FDA approval, ASCO Post", url: "https://ascopost.com/issues/february-25-2026/fda-approves-pembrolizumab-with-paclitaxel-for-platinum-resistant-epithelial-ovarian-fallopian-tube-or-primary-peritoneal-carcinoma/" }], related: ["src-asco-post"] }),
  t({ id: "ramp-201", name: "RAMP 201", nct: "NCT04625270", phase: "2", status: "positive", yearReported: 2024, sponsor: "Verastem",
    setting: "Recurrent low-grade serous ovarian cancer: avutometinib (RAF/MEK clamp) + defactinib (FAK inhibitor)",
    tldr: "RAMP 201 produced the first approved treatment designed for low-grade serous ovarian cancer, a slow-growing type driven by the RAS pathway that shrugs off chemotherapy.",
    summary: "In KRAS-mutant tumours, the confirmed response rate was 44% with median PFS 19.6 months and median duration of response 31.1 months; response was lower in KRAS-wild-type disease (Targeted Oncology, 2025). FDA accelerated approval 8 May 2025 for KRAS-mutated recurrent LGSOC after prior systemic therapy. The confirmatory RAMP 301 phase 3 versus chemotherapy or endocrine therapy is ongoing.",
    result: "ORR 44%, median PFS 19.6 months in KRAS-mutant LGSOC.",
    outcomes: [{ endpoint: "Objective response rate (KRAS-mutant)", primary: true, unit: "%", arms: [{ name: "Avutometinib + defactinib", value: 44 }], source: "https://www.targetedonc.com/view/avutometinib-plus-defactinib-gains-fda-approval-in-kras-ovarian-cancer" }, { endpoint: "Progression-free survival (KRAS-mutant)", unit: "months", arms: [{ name: "Avutometinib + defactinib", value: 19.6 }], source: "https://www.targetedonc.com/view/avutometinib-plus-defactinib-gains-fda-approval-in-kras-ovarian-cancer" }],
    drugs: ["avutometinib-defactinib"], targets: ["kras"], cancers: ["ovarian"], terms: ["lgsoc"], pathways: ["ras-mapk"], companies: ["verastem"], links: [ct("NCT04625270"), { label: "MSK on approval", url: "https://www.mskcc.org/news/fda-approves-avutometinib-defactinib-combination-for-treating-recurrent-low-grade-serous-ovarian-cancer-with-kras-mutation" }] }),
  t({ id: "rejoice-ovarian01", name: "REJOICE-Ovarian01", nct: "NCT06161025", phase: "2/3", status: "recruiting", sponsor: "Daiichi Sankyo / Merck",
    setting: "Platinum-resistant ovarian cancer, 1-3 prior lines: raludotatug deruxtecan (CDH6 ADC) vs physician's-choice chemotherapy",
    tldr: "Tests whether a CDH6-targeting ADC with Enhertu's payload can beat chemotherapy in resistant ovarian cancer.",
    summary: "REJOICE-Ovarian01, trial NCT06161025 sponsored by Daiichi Sankyo and Merck, is the phase 2/3 test of whether raludotatug deruxtecan, a CDH6-targeting antibody-drug conjugate carrying the same payload as trastuzumab deruxtecan, can beat physician's choice chemotherapy in platinum-resistant ovarian cancer after one to three prior lines. The phase 2 dose-optimisation part reported an objective response rate of 50.5 percent at ESMO 2025, the phase 3 part randomises at 5.6 mg/kg against chemotherapy, and readout is expected in 2026 to 2027. OnCo links it to ovarian cancer, antibody-drug conjugates, CDH6 as a target and raludotatug deruxtecan. Whether a new ADC target can match mirvetuximab's survival benefit, and in which patients, is the question it will answer.",
    result: "Phase 2 ORR 50.5%; phase 3 ongoing.",
    outcomes: [{ endpoint: "Objective response rate (phase 2 part)", unit: "%", arms: [{ name: "R-DXd", value: 50.5 }], source: "https://www.merck.com/news/raludotatug-deruxtecan-demonstrated-clinically-meaningful-response-rates-in-patients-with-recurrent-platinum-resistant-ovarian-primary-peritoneal-or-fallopian-tube-cancer-in-phase-2-part-of-rejoice-o/" }],
    drugs: ["raludotatug-deruxtecan"], targets: ["cdh6"], cancers: ["ovarian"], technologies: ["adc"], links: [ct("NCT06161025")] }),
  t({ id: "rainfol-01", name: "RAINFOL-01 (Rina-S)", nct: "NCT05579366", phase: "1/2", status: "active", yearReported: 2025, sponsor: "Genmab",
    setting: "Advanced ovarian and endometrial cancer, heavily pretreated: rinatabart sesutecan (FRα ADC, exatecan payload) across FRα expression levels",
    tldr: "A next-generation folate-receptor ADC that works even in tumours with low folate receptor, with responses in both ovarian and endometrial cancer.",
    summary: "Ovarian cohort: confirmed ORR 55.6% at 120 mg/m² (n=20) and 22.7% at 100 mg/m² (n=22) with long follow-up; endometrial cohort (n=64, after anti-PD-1 and platinum): ORR 50% at 100 mg/m² including complete responses, earning Breakthrough Therapy designation. Phase 3 RAINFOL-02 in platinum-resistant ovarian cancer is enrolling, with primary completion expected in 2027. Unlike mirvetuximab, benefit is not restricted to FRα-high tumours.",
    result: "ORR 55.6% (ovarian, 120 mg/m²); 50% (endometrial, 100 mg/m²).",
    outcomes: [{ endpoint: "Objective response rate, ovarian, 120 mg/m²", unit: "%", arms: [{ name: "Rina-S", n: 20, value: 55.6 }], source: "https://www.cancernetwork.com/view/rina-s-elicits-encouraging-antitumor-activity-in-advanced-ovarian-cancer" }, { endpoint: "Objective response rate, endometrial, 100 mg/m²", unit: "%", arms: [{ name: "Rina-S", value: 50 }], source: "https://www.cancernetwork.com/view/rina-s-earns-fda-breakthrough-therapy-designation-in-endometrial-cancer" }],
    drugs: ["rinatabart-sesutecan"], targets: ["folr1"], cancers: ["ovarian", "endometrial"], technologies: ["adc"], companies: ["genmab"], links: [ct("NCT05579366")] }),
  t({ id: "ukctocs", name: "UKCTOCS", nct: "NCT00058032", phase: "3", status: "negative", yearReported: 2021, sponsor: "UCL / MRC / CRUK", enrolled: 202638,
    setting: "Postmenopausal women aged 50-74: annual multimodal (CA-125 algorithm + ultrasound) or ultrasound screening vs no screening",
    tldr: "The largest screening trial ever run for ovarian cancer found earlier detection but no reduction in deaths, so there is still no recommended screening.",
    summary: "Over 16 years of follow-up, multimodal screening shifted stage at diagnosis but did not reduce ovarian and tubal cancer deaths by a statistically significant margin (Lancet 2021). It is the central reason no guideline recommends population screening and why effort has moved to risk-reducing salpingectomy and multi-cancer blood tests.",
    result: "No significant reduction in ovarian cancer mortality.",
    outcomes: [{ endpoint: "Ovarian and tubal cancer mortality reduction (multimodal vs none)", primary: true, unit: "%", arms: [{ name: "Multimodal screening", value: 4, note: "relative reduction, not significant" }], source: "https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(21)00731-5/fulltext" }],
    terms: ["ca-125", "stage-shift"], technologies: ["ultrasound", "mced"], cancers: ["ovarian"], institutions: ["cruk"], links: [ct("NCT00058032"), { label: "Lancet 2021", url: "https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(21)00731-5/fulltext" }], people: ["usha-menon"] }),
];

// ======================= DRUGS =======================
const drugs: DrugInput[] = [
  d(supplement<DrugInput>({ id: "bevacizumab", technologies: ["angiogenesis-models"], keyPapers: ["paper-hurwitz-bevacizumab-crc-nejm-2004"], kind: "drug",
    approvals: [{ region: "US", year: 2014, indication: "Platinum-resistant ovarian cancer with chemotherapy; recurrent/metastatic cervical cancer with chemotherapy" }, { region: "US", year: 2018, indication: "First-line stage III-IV ovarian cancer after surgery" }, { region: "US", year: 2020, indication: "First-line maintenance with olaparib in HRD-positive ovarian cancer" }],
    regulatoryEvents: [{ date: "2014-08-14", type: "approval", region: "US", note: "Cervical cancer with chemotherapy (GOG-0240)" }, { date: "2018-06-13", type: "approval", region: "US", note: "First-line ovarian cancer (GOG-0218)" }, { date: "2020-05-08", type: "approval", region: "US", note: "With olaparib as HRD-positive maintenance (PAOLA-1)" }],
    notes: ["In gynaecological oncology bevacizumab is used in first-line and recurrent ovarian cancer (GOG-0218, ICON7, OCEANS, AURELIA), as the partner for olaparib maintenance in HRD-positive disease (PAOLA-1), and in first-line cervical cancer regimens with pembrolizumab (KEYNOTE-826) or atezolizumab (BEATcc); it is given at 15 mg/kg every 3 weeks with chemotherapy and continued as maintenance. In the GOG-0218 concurrent and maintenance arm hypertension affected 42 percent (17 percent grade 3 or higher) and bowel perforation 2.6 percent."],
    cancers: ["ovarian", "cervical"], trials: ["gog-0218-icon7", "paola-1", "keynote-b96"] })),
  d({ id: "rucaparib", companies: ["pharmaand"], links: [{ label: "FDA label (DailyMed)", url: "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=Rucaparib" }], name: "Rucaparib", brand: "Rubraca", modality: "Small-molecule PARP inhibitor", status: "approved", wikipedia: W("Rucaparib"),
    tldr: "A PARP inhibitor for BRCA-mutated ovarian and prostate cancer whose original maker went bankrupt; still available, with a narrowed label.",
    summary: "Approved 2016 (BRCA-mutated ovarian cancer after ≥2 chemotherapies; later restricted after OS concerns in ARIEL4), 2018 as recurrent-disease maintenance (ARIEL3; later restricted to BRCA-mutated), and 2020 for BRCA-mutated mCRPC (TRITON2). ATHENA-MONO showed first-line maintenance PFS benefit in all comers. Clovis Oncology filed for bankruptcy in December 2022; pharma& now markets it.",
    mechanism: "PARP1/2/3 inhibitor and trapper; synthetic lethality with homologous recombination deficiency.",
    mechanismSteps: ["Enters the cell and binds PARP1 at single-strand DNA breaks", "Traps PARP on DNA, blocking base-excision repair", "Replication forks collapse into double-strand breaks", "BRCA-deficient cells cannot repair them and die"],
    dosing: { route: "Oral", schedule: "600 mg twice daily continuously", modifications: "Dose reductions to 500, 400, 300 mg for anaemia, nausea, ALT rise", monitoring: "CBC monthly; creatinine rises are usually benign (transporter inhibition)" },
    toxicity: [{ event: "Nausea", anyGradePct: 75, grade3PlusPct: 4, note: "ARIEL3" }, { event: "Anaemia", anyGradePct: 37, grade3PlusPct: 19 }, { event: "Fatigue", anyGradePct: 69, grade3PlusPct: 7 }],
    approvals: [{ region: "US", year: 2016, indication: "BRCA-mutated advanced ovarian cancer after ≥2 chemotherapies (later narrowed)" }, { region: "US", year: 2018, indication: "Maintenance in recurrent ovarian cancer after platinum response (now BRCA-mutated only)" }, { region: "US", year: 2020, indication: "BRCA-mutated mCRPC after ARPI and taxane" }],
    regulatoryEvents: [{ date: "2016-12-19", type: "approval", region: "US", note: "Accelerated approval, gBRCA/sBRCA ovarian, ≥2 prior lines" }, { date: "2018-04-06", type: "approval", region: "US", note: "Recurrent ovarian maintenance (ARIEL3)" }, { date: "2022-06", type: "label-change", region: "US", note: "Later-line treatment indication withdrawn after ARIEL4 OS imbalance" }, { date: "2022-12-11", type: "withdrawal", region: "US", note: "Clovis Oncology bankruptcy; asset sold to pharma&" }],
    targets: ["parp", "brca"], technologies: ["parp-inhibitor"], cancers: ["ovarian", "prostate", "high-grade-serous-ovarian-cancer", "platinum-sensitive-ovarian-cancer"], trials: ["athena-mono"], terms: ["hrd"] }),
  d({ id: "avutometinib-defactinib", links: [{ label: "FDA label (DailyMed)", url: "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=Avutometinib" }], name: "Avutometinib + defactinib", aka: ["Avutometinib", "Defactinib", "Avutometinib and defactinib"], brand: "Avmapki Fakzynja Co-Pack", code: "VS-6766 + VS-6063", modality: "Small-molecule RAF/MEK clamp + FAK inhibitor", status: "approved",
    tldr: "Avutometinib plus defactinib is the first treatment approved specifically for low-grade serous ovarian cancer, a slow-growing type driven by the RAS pathway.",
    summary: "Accelerated approval 8 May 2025 for adults with KRAS-mutated recurrent low-grade serous ovarian cancer after prior systemic therapy, based on RAMP 201 (ORR 44%, median DOR 31.1 months in KRAS-mutant disease). Avutometinib inhibits MEK and blocks RAF-driven MEK reactivation; defactinib blocks FAK, a resistance node. RAMP 301 (phase 3) is confirmatory; combinations in KRAS-mutant lung and pancreatic cancer are being explored.",
    mechanism: "Avutometinib is a dual RAF/MEK 'clamp' that prevents compensatory MEK phosphorylation; defactinib inhibits focal adhesion kinase, a feedback survival signal.",
    mechanismSteps: ["Avutometinib binds MEK and locks RAF-MEK in an inactive complex", "ERK signalling from mutant KRAS drops without feedback rebound", "Defactinib blocks FAK, removing an adhesion-driven escape route", "LGSOC cells arrest and regress over months"],
    dosing: { route: "Oral", schedule: "Avutometinib 3.2 mg twice weekly + defactinib 200 mg twice daily, 3 weeks on / 1 week off", monitoring: "Creatine kinase, liver enzymes, eye exams, skin", source: "https://www.onclive.com/view/accelerated-fda-approval-establishes-role-of-avutometinib-defactinib-in-kras-mutant-recurrent-low-grade-serous-ovarian-cancer" },
    toxicity: [{ event: "Nausea", anyGradePct: 67 }, { event: "Diarrhoea", anyGradePct: 58 }, { event: "Rash / dermatitis acneiform", anyGradePct: 50 }, { event: "Creatine kinase increase", anyGradePct: 61, note: "RAMP 201 pooled, per FDA label summary" }],
    approvals: [{ region: "US", year: 2025, indication: "KRAS-mutated recurrent low-grade serous ovarian cancer after prior systemic therapy (accelerated)" }],
    regulatoryEvents: [{ date: "2025-05-08", type: "approval", region: "US", note: "Accelerated approval on RAMP 201; RAMP 301 confirmatory", source: "https://www.targetedonc.com/view/avutometinib-plus-defactinib-gains-fda-approval-in-kras-ovarian-cancer" }],
    targets: ["kras"], technologies: ["kinase-inhibitors"], pathways: ["ras-mapk"], companies: ["verastem"], cancers: ["ovarian", "low-grade-serous-ovarian-cancer"], trials: ["ramp-201"], terms: ["lgsoc"] }),
  d(supplement<DrugInput>({ id: "letrozole", kind: "drug", links: [{ label: "FDA label (DailyMed)", url: "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=Letrozole" }],
    notes: ["In low-grade serous ovarian cancer, retrospective series and the NRG-GY019 trial support endocrine maintenance, and letrozole is now widely used after surgery or chemotherapy in LGSOC and in ER-positive endometrial cancer, often with palbociclib or abemaciclib; it is cheap and well tolerated, with bone loss and arthralgia the main issues."],
    cancers: ["ovarian", "endometrial", "granulosa-cell-tumour", "low-grade-serous-ovarian-cancer"], terms: ["lgsoc"], pathways: ["er-signaling"] })),
  d({ id: "trabectedin", links: [{ label: "FDA label (DailyMed)", url: "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=Trabectedin" }], name: "Trabectedin", brand: "Yondelis", modality: "Cytotoxic (DNA minor-groove binder)", status: "approved", wikipedia: W("Trabectedin"),
    tldr: "A chemotherapy derived from a sea squirt, used with liposomal doxorubicin in relapsed ovarian cancer in Europe and for sarcomas.",
    summary: "Trabectedin is a cytotoxic derived from a sea squirt that binds the DNA minor groove, bends the DNA, blocks transcription-coupled repair and modulates tumour-associated macrophages. In ovarian cancer, OVA-301 showed a PFS benefit with pegylated liposomal doxorubicin in partially platinum-sensitive relapse; the EU approved the combination in 2009, the US never did for this indication, and INOVATYON found no OS advantage over platinum. In sarcoma it is approved in the EU (2007) after anthracycline or ifosfamide and in the US (2015) for liposarcoma and leiomyosarcoma after anthracycline. Grade 3 to 4 neutropenia and ALT elevation are the main toxicities, so liver function is monitored. It is a niche chemotherapy with a distinctive mechanism, most valuable in specific sarcoma subtypes.",
    mechanism: "Binds the DNA minor groove, bends DNA, blocks transcription-coupled repair, and modulates tumour-associated macrophages.",
    dosing: { route: "Intravenous (central line)", schedule: "1.1 mg/m² with PLD every 3 weeks (ovarian, EU); 1.5 mg/m² 24-hour infusion every 3 weeks (sarcoma)", monitoring: "Liver function, CPK, CBC; dexamethasone premedication" },
    toxicity: [{ event: "Neutropenia grade 3-4", grade3PlusPct: 63, note: "OVA-301 combination arm" }, { event: "ALT increase grade 3-4", grade3PlusPct: 31 }],
    approvals: [{ region: "EU", year: 2009, indication: "Relapsed platinum-sensitive ovarian cancer with PLD" }, { region: "US", year: 2015, indication: "Liposarcoma and leiomyosarcoma after anthracycline" }],
    technologies: ["cytotoxic-chemotherapy"], cancers: ["ovarian", "sarcoma", "leiomyosarcoma", "liposarcoma"] }),
  d({ id: "pegylated-liposomal-doxorubicin", trials: ["nct06072781", "nct07604766", "nct06619236", "nct06014528", "actuate-1801", "nct04274426", "nct07286266", "nct07109414"], links: [{ label: "FDA label (DailyMed)", url: "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=Pegylated%20liposomal%20doxorubicin" }], name: "Pegylated liposomal doxorubicin", brand: "Doxil / Caelyx", code: "PLD", modality: "Cytotoxic (liposomal anthracycline)", status: "approved", wikipedia: W("Liposomal_doxorubicin"),
    tldr: "Doxorubicin wrapped in a fatty bubble so it reaches tumours with less heart damage; a workhorse of relapsed ovarian cancer.",
    summary: "Approved 1995 (Kaposi sarcoma) and 1999 for platinum-refractory ovarian cancer. Standard single agent or partner (with carboplatin in CALYPSO, with trabectedin in OVA-301, with bevacizumab in AURELIA) in relapsed disease; the comparator arm in MIRASOL and KEYNOTE-B96. Hand-foot syndrome and mucositis replace the alopecia and cardiotoxicity of free doxorubicin.",
    mechanism: "Topoisomerase II poisoning and DNA intercalation by doxorubicin, delivered by long-circulating PEGylated liposomes that extravasate in tumours.",
    dosing: { route: "Intravenous", schedule: "40-50 mg/m² every 4 weeks (ovarian)", monitoring: "LVEF at cumulative doses; skin" },
    toxicity: [{ event: "Palmar-plantar erythrodysaesthesia", anyGradePct: 51, grade3PlusPct: 24, note: "Doxil label, ovarian" }, { event: "Stomatitis", anyGradePct: 41, grade3PlusPct: 8 }],
    approvals: [{ region: "US", year: 1995, indication: "AIDS-related Kaposi sarcoma after prior chemotherapy (Doxil, NDA 050718)" }, { region: "US", year: 1999, indication: "Ovarian cancer refractory to platinum and paclitaxel" }],
    technologies: ["cytotoxic-chemotherapy", "topoisomerase-inhibitors"], cancers: ["ovarian", "multiple-myeloma", "sarcoma"], companies: ["cspc"] }),
  d({ id: "luveltamab-tazevibulin", name: "Luveltamab tazevibulin", code: "STRO-002", modality: "ADC", status: "phase-3", payload: "SC209 (hemiasterlin, tubulin inhibitor), DAR ~4", linker: "Cleavable, site-specific (Sutro XpressCF)",
    tldr: "A folate-receptor ADC designed to work across low and high receptor levels, in a pivotal ovarian cancer trial.",
    summary: "Sutro Biopharma's site-specifically conjugated FRα ADC. Phase 1 showed responses in FRα-low as well as FRα-high tumours; the phase 2/3 REFRαME-O1 trial in platinum-resistant ovarian cancer (any FRα expression >25%) is ongoing, with an interim analysis expected in 2026. Neutropenia and arthralgia are characteristic.",
    mechanism: "Anti-FRα antibody with a hemiasterlin microtubule inhibitor conjugated at defined non-natural amino acids.",
    targets: ["folr1"], technologies: ["adc", "site-specific-conjugation"], companies: ["sutro-biopharma"], cancers: ["ovarian", "endometrial"], links: [{ label: "REFRαME-O1", url: "https://clinicaltrials.gov/study/NCT05870748" }] }),
  d({ id: "rinatabart-sesutecan", links: [{ label: "ClinicalTrials.gov NCT05579366 (RAINFOL-01 (Rina-S))", url: "https://clinicaltrials.gov/study/NCT05579366" }], name: "Rinatabart sesutecan", code: "Rina-S, PRO1184", modality: "ADC", status: "phase-3", payload: "Exatecan (TOP1 inhibitor), DAR 8", linker: "Hydrophilic cleavable (ProfoundBio)",
    tldr: "Rinatabart sesutecan is a next-generation folate-receptor ADC with a topoisomerase payload that responds in both ovarian and endometrial cancer regardless of receptor level.",
    summary: "Genmab (via ProfoundBio, 2024). RAINFOL-01: ORR 55.6% in ovarian cancer at 120 mg/m² and 50% in heavily pretreated endometrial cancer at 100 mg/m², the latter earning Breakthrough Therapy designation. Phase 3 RAINFOL-02 versus chemotherapy in platinum-resistant ovarian cancer is enrolling. Neutropenia and anaemia are dose-limiting; ocular toxicity is minimal compared with mirvetuximab.",
    mechanism: "Anti-FRα IgG1 with a hydrophilic linker carrying exatecan; bystander killing extends activity to FRα-low tumours.",
    mechanismSteps: ["Binds folate receptor alpha on the tumour cell", "Internalised and trafficked to lysosomes", "Linker cleaved; exatecan released and diffuses to neighbours", "Topoisomerase I trapped; replication collapses in dividing cells"],
    regulatoryEvents: [{ date: "2025", type: "designation", region: "US", note: "Breakthrough Therapy designation, advanced endometrial cancer after PD-(L)1 and platinum", source: "https://www.cancernetwork.com/view/rina-s-earns-fda-breakthrough-therapy-designation-in-endometrial-cancer" }],
    targets: ["folr1"], technologies: ["adc", "topoisomerase-inhibitors"], companies: ["genmab"], cancers: ["ovarian", "endometrial"], trials: ["rainfol-01", "nct07604766", "nct07166094", "nct06619236", "nct07225270", "nct07564141", "nct07288177"] }),
];

// ======================= COMPANIES =======================
const companies: CompanyInput[] = [
  co({ id: "karyopharm", trials: ["nct04442022", "nct02227251", "nct02343042", "nct04414475", "nct04562389"], links: [{ label: "Official website", url: "https://www.karyopharm.com" }], name: "Karyopharm Therapeutics", hq: "Newton, MA", country: "US", companyType: "biotech", website: "https://www.karyopharm.com", ticker: "KPTI", sections: ["targeted-therapy"],
    tldr: "Karyopharm makes selinexor, the first nuclear export inhibitor, approved in myeloma; its endometrial cancer bet failed in 2026.",
    summary: "Karyopharm Therapeutics, based in Newton, Massachusetts, and listed as KPTI, makes selinexor, sold as Xpovio, the first nuclear export inhibitor, approved in multiple myeloma and diffuse large B-cell lymphoma. Its bet on endometrial cancer failed in 2026 when the phase 3 XPORT-EC-042 trial of maintenance selinexor in TP53-wild-type disease missed its primary endpoint in July, after which the company refocused on myelofibrosis and myeloma. OnCo links it to endometrial cancer, to the XPORT-EC-042 trial record and to selinexor. Whether a biomarker-selected maintenance strategy failed because of the drug or because of the TP53 hypothesis is the question the trial leaves open. Selinexor has its own page.",
    drugs: ["selinexor"] }),
];

// ======================= TERMS =======================
const terms: TermInput[] = [
  tm({ id: "ca-125", name: "CA-125", category: "Biomarkers", wikipedia: W("CA-125"),
    tldr: "A blood protein that rises in most ovarian cancers; useful for tracking treatment, useless for screening on its own.",
    summary: "MUC16 glycoprotein elevated in ~80% of advanced high-grade serous ovarian cancers but also in endometriosis, pregnancy, and other cancers. Used to monitor response (GCIG criteria) and relapse; UKCTOCS showed a CA-125 algorithm plus ultrasound detects cancer earlier without reducing deaths. HE4 and the ROMA index refine triage of pelvic masses.",
    cancers: ["ovarian"], trials: ["ukctocs"], links: [{ label: "Wikipedia", url: W("CA-125") }] }),
  tm({ id: "lgsoc", links: [{ label: "GOG 281/LOGS: trametinib versus standard of care in recurrent low-grade serous ovarian cancer (Lancet 2022)", url: "https://doi.org/10.1016/S0140-6736(21)02175-9" }], wikipedia: W("Ovarian_cancer"), name: "Low-grade serous ovarian cancer (LGSOC)", category: "Cancer biology",
    tldr: "Low-grade serous ovarian cancer is a slow-growing, RAS-driven type of ovarian cancer that resists chemotherapy but responds to hormone blockers and MEK-pathway drugs.",
    summary: "About 5-10% of serous ovarian cancers; younger patients, KRAS/BRAF/NRAS mutations in ~30-50%, wild-type TP53, strong ER expression, low proliferation. Chemotherapy response rates are under 25%; endocrine therapy and MEK/RAF pathway inhibition (trametinib in GOG 281; avutometinib + defactinib, approved 2025) are the mainstays. Contrast with high-grade serous carcinoma.",
    cancers: ["ovarian"], drugs: ["avutometinib-defactinib", "letrozole"], targets: ["kras"], pathways: ["ras-mapk"] }),
  tm({ id: "hgsoc", name: "High-grade serous ovarian carcinoma (HGSOC)", category: "Cancer biology", wikipedia: W("High-grade_serous_carcinoma"),
    tldr: "High-grade serous ovarian carcinoma is the most common type of ovarian cancer and the one most often found late; it actually starts in the fallopian tube and almost always has a broken TP53 gene, and it is the type PARP inhibitors were built for.",
    summary: "The type behind about 70% of ovarian cancer deaths, and the one where maintenance therapy has changed the most. Near-universal TP53 mutation, ~50% homologous recombination deficiency (including ~20% BRCA1/2), extensive copy-number instability, few recurrent targetable mutations. Arises from serous tubal intraepithelial carcinoma, which is why opportunistic salpingectomy prevents it. PARP inhibitors, platinum, and FRα ADCs are the main therapeutic levers.",
    cancers: ["ovarian"], targets: ["tp53", "brca", "folr1"], terms: ["hrd"], links: [{ label: "Wikipedia", url: W("High-grade_serous_carcinoma") }] }),
];

// ======================= TECHNOLOGIES =======================
const technologies: TechnologyInput[] = [
  te({ id: "risk-reducing-salpingectomy", name: "Risk-reducing and opportunistic salpingectomy", sections: ["prevention", "surgery"], status: "established", wikipedia: W("Salpingectomy"),
    tldr: "Removing the fallopian tubes, where most ovarian cancer starts, during other pelvic surgery or in women at inherited risk.",
    summary: "Because high-grade serous cancer originates in the tubal fimbria, removing the tubes at hysterectomy or instead of tubal ligation (opportunistic salpingectomy) is recommended by ACOG and SGO for average-risk women. In BRCA carriers, salpingo-oophorectomy by age 35-45 remains standard; salpingectomy with delayed oophorectomy (TUBA-WISP II, SOROCk) is under study to postpone surgical menopause. Population data from British Columbia show falling incidence after policy adoption.",
    principle: "Removing the fallopian tubes eliminates the tissue of origin of high-grade serous carcinoma while sparing ovarian hormone production.",
    strengths: ["Prevents the deadliest ovarian cancer type without hormonal consequences", "Adds little time or risk to existing surgery"],
    limitations: ["Does not prevent non-tubal ovarian cancers", "Benefit for BRCA carriers versus oophorectomy still unproven"],
    cancers: ["ovarian"], targets: ["brca"], technologies: ["chemoprevention"], terms: ["hgsoc"], links: [{ label: "Wikipedia", url: W("Salpingectomy") }] }),
];

// ======================= PAIRINGS =======================
const pairings: PairingInput[] = [
  pr({ id: "parp-plus-bevacizumab", links: [{ label: "ClinicalTrials.gov NCT02477644: PAOLA-1 / ENGOT-ov25", url: "https://clinicaltrials.gov/study/NCT02477644" }], name: "PARP inhibitor + bevacizumab maintenance (HRD-positive)", a: "olaparib", b: "bevacizumab", pairingType: "combination",
    tldr: "In tumours with faulty DNA repair, adding olaparib to bevacizumab maintenance roughly doubled progression-free time and improved survival.",
    summary: "In newly diagnosed advanced ovarian cancer with homologous recombination deficiency, adding the PARP inhibitor olaparib to bevacizumab maintenance is a combination pairing that markedly prolonged progression-free time and improved overall survival in the phase 3 PAOLA-1 / ENGOT-ov25 trial, with no benefit seen in HRD-negative tumours. The mechanistic rationale is that anti-angiogenic hypoxia may push tumour cells into HRD-like states and greater dependence on PARP, and the two agents have non-overlapping toxicity. The combination was approved in 2020. Because the benefit was confined to the HRD-positive subgroup, the pairing made HRD testing a routine first-line decision in ovarian cancer.",
    rationale: "Anti-angiogenic hypoxia may increase HRD-like states and PARP dependence; the two agents have non-overlapping toxicity.",
    evidence: "Phase 3 with OS benefit in HRD-positive subgroup.",
    trials: ["paola-1"], cancers: ["ovarian"], targets: ["parp", "vegf"], terms: ["hrd"] }),
  pr({ id: "hipec-at-interval-surgery", links: [{ label: "ClinicalTrials.gov NCT00426257: OVHIPEC-1", url: "https://clinicaltrials.gov/study/NCT00426257" }], name: "HIPEC at interval cytoreductive surgery", a: "hipec", b: "carboplatin", pairingType: "combination",
    tldr: "Heated intraperitoneal cisplatin during interval surgery, after neoadjuvant chemotherapy, extends survival in stage III disease.",
    summary: "Hyperthermic intraperitoneal chemotherapy delivered with platinum during interval cytoreductive surgery, after neoadjuvant chemotherapy for stage III ovarian cancer, is a combination pairing that extended survival in the phase 3 OVHIPEC-1 trial without additional major complications, and the benefit was confirmed at ten years of follow-up; a Korean trial is supportive. The rationale is direct high-dose exposure of residual microscopic peritoneal disease at the moment of maximal cytoreduction, with hyperthermia enhancing platinum uptake into tumour cells. The benefit appears specific to the interval-surgery setting. HIPEC at primary surgery is still being tested in OVHIPEC-2.",
    rationale: "Direct high-dose exposure of residual microscopic peritoneal disease at the moment of maximal cytoreduction, with hyperthermia enhancing platinum uptake.",
    evidence: "Phase 3 with OS benefit; one supportive Korean trial.",
    trials: ["ovhipec-1"], cancers: ["ovarian"], technologies: ["hipec"] }),
  pr({ id: "caution-pd1-first-line-ovarian", links: [{ label: "ClinicalTrials.gov NCT03737643: DUO-O / ENGOT-ov46", url: "https://clinicaltrials.gov/study/NCT03737643" }, { label: "ClinicalTrials.gov NCT05116189: KEYNOTE-B96 / ENGOT-ov65", url: "https://clinicaltrials.gov/study/NCT05116189" }], name: "Caution: checkpoint inhibitors in first-line ovarian cancer", a: "checkpoint-inhibitor", b: "ovarian", pairingType: "caution",
    tldr: "Immunotherapy added to first-line chemotherapy has failed to extend survival in ovarian cancer in every large trial so far; its only win is in PD-L1-positive platinum-resistant disease.",
    summary: "IMagyn050 (atezolizumab), JAVELIN Ovarian 100 (avelumab), and DUO-O (durvalumab ± olaparib) showed no OS benefit in newly diagnosed disease. KEYNOTE-B96 (pembrolizumab + weekly paclitaxel) is the exception, in PD-L1-positive platinum-resistant relapse. Ovarian cancer is immunologically 'cold' with low TMB.",
    rationale: "Low neoantigen burden, immunosuppressive ascites, and myeloid-rich microenvironment blunt T-cell responses; chemotherapy-induced priming appears necessary for benefit.",
    evidence: "Three negative first-line phase 3 trials; one positive relapsed-setting trial.",
    trials: ["duo-o", "keynote-b96"], cancers: ["ovarian"], targets: ["pd1", "pdl1"] }),
];

// ======================= IDEAS =======================
const ideas: IdeaInput[] = [
  idea({ id: "idea-fra-adc-sequencing-ovarian", links: [{ label: "ClinicalTrials.gov NCT04209855: MIRASOL / GOG-3045", url: "https://clinicaltrials.gov/study/NCT04209855" }], name: "Sequence folate-receptor ADCs by payload class", maturity: "preclinical-evidence",
    tldr: "Three FRα ADCs carry different poisons (tubulin, hemiasterlin, topoisomerase). Use them in sequence rather than treating them as interchangeable.",
    summary: "Three folate receptor alpha antibody-drug conjugates in ovarian cancer share an antigen but not a payload: mirvetuximab soravtansine carries the tubulin agent DM4 and is used only in FRalpha-high tumours, luveltamab tazevibulin carries a hemiasterlin, and rinatabart sesutecan carries the topoisomerase 1 inhibitor exatecan. The idea is to sequence them by payload class rather than treating them as interchangeable. The rationale is that resistance to a tubulin payload, through tubulin mutations or efflux, is not expected to cross to a topoisomerase payload, and FRalpha is rarely lost at progression. The test would be a post-mirvetuximab cohort of RAINFOL-02 or a phase 2 with paired biopsies; the evidence is preclinical, and the idea connects to the general rule of payload-class switching.",
    hypothesis: "Patients progressing on mirvetuximab retain FRα and respond to a TOP1-payload FRα ADC at rates similar to ADC-naive patients.",
    rationale: "Payload-specific resistance (tubulin mutations, efflux) does not cross to topoisomerase payloads; FRα PET or repeat biopsy can confirm antigen persistence.",
    test: "Post-mirvetuximab cohort in RAINFOL-02 or a dedicated phase 2 with paired biopsies for FRα and payload-resistance markers.",
    drugs: ["mirvetuximab-soravtansine", "rinatabart-sesutecan", "luveltamab-tazevibulin"], targets: ["folr1"], cancers: ["ovarian"], terms: ["adc-sequencing"], related: ["idea-payload-switching"] }),
  idea({ id: "idea-ctdna-guided-parp-duration", links: [{ label: "ClinicalTrials.gov NCT01844986: SOLO-1", url: "https://clinicaltrials.gov/study/NCT01844986" }, { label: "ClinicalTrials.gov NCT02655016: PRIMA / ENGOT-OV26", url: "https://clinicaltrials.gov/study/NCT02655016" }], name: "ctDNA-guided duration of PARP maintenance", maturity: "speculative",
    tldr: "Stop PARP inhibitors early in women whose blood shows no residual tumour DNA, and extend or switch in those whose ctDNA persists or reverts BRCA.",
    summary: "The two-year duration of olaparib maintenance in SOLO-1 and the three-year duration of niraparib in PRIMA were set by trial design rather than biology, so this idea proposes letting serial ctDNA decide how long each woman with ovarian cancer stays on a PARP inhibitor. Patients who are ctDNA-negative at twelve months would stop, while those with persistent ctDNA or a BRCA reversion mutation in plasma would switch to an ATR or POLQ inhibitor before radiographic progression. The rationale is that MRD-guided de-escalation has been shown in DYNAMIC and IMvigor011, and that BRCA reversion, the main resistance mechanism, is detectable in blood months before imaging relapse. The proposed test is a randomised de-escalation trial with tumour-informed ctDNA, and the idea remains speculative.",
    hypothesis: "ctDNA-negative patients at 12 months can stop PARP maintenance without loss of PFS; ctDNA-positive patients benefit from switching to an ATR or POLQ inhibitor before radiographic progression.",
    rationale: "MRD-guided de-escalation is proven in colon cancer (DYNAMIC) and bladder (IMvigor011); BRCA reversion is detectable in plasma.",
    test: "Randomised de-escalation trial with tumour-informed ctDNA at 12 months; primary endpoint 3-year PFS non-inferiority.",
    drugs: ["olaparib", "niraparib"], technologies: ["mrd-testing", "parp-inhibitor"], cancers: ["ovarian"], terms: ["mrd"], trials: ["solo-1", "prima"] }),
];

const entities: EntityInput[] = [...trials, ...drugs, ...companies, ...terms, ...technologies, ...pairings, ...ideas];

// ======================= CANCER PATCH =======================
const spike: Spike = {
  cancerId: "ovarian",
  entities,
  patch: {
    asOf,
    summary: "Ovarian cancer is a group of diseases (~320,000 new cases a year) dominated by high-grade serous carcinoma, which arises in the fallopian tube, is almost always TP53-mutant, and is diagnosed at stage III-IV in three-quarters of women because there is no symptom or screening test that catches it early. Roughly half of high-grade serous tumours have homologous recombination deficiency, including ~20% with germline or somatic BRCA1/2 mutations. Low-grade serous, endometrioid, clear-cell, and mucinous carcinomas are biologically distinct and respond differently to treatment.\n\nThe standard of care is maximal cytoreductive surgery (primary or interval, after neoadjuvant carboplatin-paclitaxel), sometimes with HIPEC, followed by maintenance therapy chosen by biomarker: olaparib for BRCA-mutated disease (SOLO-1, 7-year OS 67% vs 47%), olaparib plus bevacizumab for HRD-positive disease (PAOLA-1), niraparib for the rest with declining enthusiasm after PRIMA showed no survival gain. Platinum-sensitive relapse is treated with platinum doublets and secondary surgery in selected patients (DESKTOP III); PARP inhibitors are re-used less since later-line safety signals. Platinum-resistant disease, historically the hardest setting, now has three new options with survival benefit: mirvetuximab soravtansine for FRα-high tumours (MIRASOL), relacorilant plus nab-paclitaxel (ROSELLA, approved 2026), and pembrolizumab plus weekly paclitaxel for PD-L1-positive tumours (KEYNOTE-B96, approved February 2026, the first immunotherapy in ovarian cancer). Low-grade serous carcinoma gained its first dedicated therapy in avutometinib plus defactinib (2025).\n\nWhat comes next: folate-receptor ADCs that work regardless of expression level (rinatabart sesutecan, luveltamab tazevibulin), a CDH6 ADC (raludotatug deruxtecan) in phase 3, ATR and WEE1 inhibitors for PARP-resistant disease, and prevention by opportunistic salpingectomy now that the tubal origin is accepted. Screening remains unsolved after UKCTOCS; multi-cancer blood tests are the only live hope.",
    burden: "Ovarian cancer accounts for ~320,000 cases per year worldwide. PARP-inhibitor maintenance has turned BRCA-mutated disease into one where two-thirds of women are alive at seven years, and three new treatments that extend life arrived for platinum-resistant disease in three years. Because most cases are found at stage III-IV, it remains the gynaecologic cancer with the lowest survival: 5-year survival ~50% overall and under 30% for stage IV; ~200,000 deaths per year.",
    subtypes: ["High-grade serous carcinoma (~70%; TP53-mutant, tubal origin)", "Low-grade serous carcinoma (~5%; KRAS/BRAF, ER+, chemoresistant)", "Endometrioid carcinoma (~10%; often with endometriosis; CTNNB1, PTEN, MMR)", "Clear-cell carcinoma (~10%; ARID1A, PIK3CA; platinum-resistant; higher in East Asia)", "Mucinous carcinoma (~3%; KRAS, HER2 amplification; often gastrointestinal-like)", "Carcinosarcoma and other rare types", "Germ-cell and sex-cord stromal tumours (young women; highly curable)"],
    biomarkers: ["Germline and somatic BRCA1/2", "HRD genomic instability score (myChoice CDx, FoundationOne)", "Folate receptor alpha IHC (≥75% of cells at 2+ for mirvetuximab)", "PD-L1 CPS ≥1 (pembrolizumab, KEYNOTE-B96)", "KRAS/BRAF/NRAS (low-grade serous)", "CA-125 and HE4 (monitoring, ROMA index)", "Platinum-free interval (defines sensitive vs resistant)", "MMR/MSI (endometrioid, clear-cell)", "HER2 (mucinous, some clear-cell)"],
    standardOfCare: [
      { setting: "Prevention and risk", approach: "Germline testing for all patients; risk-reducing salpingo-oophorectomy for BRCA carriers (age 35-45); opportunistic salpingectomy at pelvic surgery for average-risk women; oral contraceptives reduce risk. No population screening (UKCTOCS negative).", refs: ["germline-testing", "risk-reducing-salpingectomy", "chemoprevention", "ukctocs"], guideline: { nccn: "Genetic/Familial High-Risk Assessment v2.2026", esmoMcbs: undefined, url: "https://www.nccn.org/guidelines/category_2" } },
      { setting: "Newly diagnosed stage I-II", approach: "Complete surgical staging; adjuvant carboplatin-paclitaxel for high-grade or stage IC-II disease; observation for low-risk stage IA-IB grade 1-2.", refs: ["carboplatin", "paclitaxel", "robotic-surgery"], guideline: { nccn: "1" } },
      { setting: "Newly diagnosed stage III-IV: surgery and chemotherapy", approach: "Primary debulking if complete resection is feasible, else 3 cycles neoadjuvant carboplatin-paclitaxel then interval debulking (with HIPEC in stage III, OVHIPEC-1) and 3 more cycles; add bevacizumab for high-risk or residual disease.", refs: ["carboplatin", "paclitaxel", "hipec", "ovhipec-1", "bevacizumab", "gog-0218-icon7"], guideline: { nccn: "1 (chemotherapy); 2A (HIPEC)" } },
      { setting: "First-line maintenance, BRCA-mutated", approach: "Olaparib 2 years (SOLO-1) or olaparib + bevacizumab (PAOLA-1) or niraparib 3 years (PRIMA).", refs: ["olaparib", "solo-1", "paola-1", "niraparib", "prima"], guideline: { nccn: "1", esmoMcbs: "A", url: "https://www.esmo.org/guidelines/esmo-clinical-practice-guidelines-gynaecological-cancers/" } },
      { setting: "First-line maintenance, HRD-positive BRCA-wild-type", approach: "Olaparib + bevacizumab (PAOLA-1, OS benefit) or niraparib (PRIMA, PFS only).", refs: ["olaparib", "bevacizumab", "paola-1", "niraparib", "hrd-testing", "parp-plus-bevacizumab"], guideline: { nccn: "1" } },
      { setting: "First-line maintenance, HRD-negative", approach: "Bevacizumab continuation if started; niraparib is an option with small PFS benefit and no OS benefit (PRIMA); observation is reasonable.", refs: ["bevacizumab", "niraparib", "prima"], guideline: { nccn: "2A" } },
      { setting: "Platinum-sensitive relapse (interval >6 months)", approach: "Secondary cytoreduction if AGO-score positive (DESKTOP III); platinum doublet (carboplatin with PLD, paclitaxel, or gemcitabine) ± bevacizumab; PARP maintenance if PARP-naive and BRCA/HRD-positive.", refs: ["desktop-iii", "carboplatin", "pegylated-liposomal-doxorubicin", "bevacizumab", "olaparib", "niraparib", "rucaparib"], guideline: { nccn: "1 (surgery in selected); 2A" } },
      { setting: "Platinum-resistant relapse, FRα-high", approach: "Mirvetuximab soravtansine (MIRASOL, OS benefit) with ophthalmic prophylaxis.", refs: ["mirvetuximab-soravtansine", "mirasol", "folr1"], guideline: { nccn: "1", esmoMcbs: "4" } },
      { setting: "Platinum-resistant relapse, PD-L1 CPS ≥1", approach: "Pembrolizumab + weekly paclitaxel ± bevacizumab (KEYNOTE-B96, approved Feb 2026).", refs: ["pembrolizumab", "paclitaxel", "bevacizumab", "keynote-b96"], guideline: { nccn: "1 (2026 update)" } },
      { setting: "Platinum-resistant relapse, other", approach: "Relacorilant + nab-paclitaxel (ROSELLA, approved 2026); single-agent weekly paclitaxel, PLD, or topotecan ± bevacizumab (AURELIA); clinical trials of FRα and CDH6 ADCs.", refs: ["relacorilant", "rosella", "pegylated-liposomal-doxorubicin", "bevacizumab", "rinatabart-sesutecan", "raludotatug-deruxtecan"], guideline: { nccn: "2A" } },
      { setting: "Low-grade serous carcinoma", approach: "Surgery; endocrine maintenance (letrozole) after chemotherapy or instead of it; at recurrence, avutometinib + defactinib if KRAS-mutated (2025), trametinib, or endocrine therapy.", refs: ["letrozole", "avutometinib-defactinib", "ramp-201", "lgsoc"], guideline: { nccn: "2A" } },
      { setting: "Rare histologies", approach: "Clear-cell: platinum-based therapy, trials of immunotherapy and ARID1A-directed agents; mucinous: consider GI regimens and HER2 testing; germ-cell: BEP chemotherapy with >90% cure.", refs: ["platinum", "checkpoint-inhibitor"] },
    ],
    stateOfArt: [
      "Biomarker-directed maintenance after first-line chemotherapy: olaparib for BRCA (7-year OS 67% vs 47%), olaparib + bevacizumab for HRD-positive disease.",
      "Three new options with overall survival benefit in platinum-resistant disease within three years: mirvetuximab (FRα-high), relacorilant + nab-paclitaxel, and pembrolizumab + paclitaxel (PD-L1-positive, first immunotherapy approval in ovarian cancer, February 2026).",
      "First treatment designed for low-grade serous carcinoma (avutometinib + defactinib, May 2025).",
      "Surgery is evidence-based at both ends: HIPEC at interval debulking adds ~12 months of survival; selected secondary cytoreduction at relapse adds ~8 months.",
      "Prevention by opportunistic salpingectomy is now routine policy in several countries because the tubal origin of high-grade serous cancer is accepted.",
      "Germline and HRD testing at diagnosis is standard and changes treatment for roughly half of patients.",
    ],
    history: [
      { year: 1976, title: "Cisplatin transforms ovarian cancer chemotherapy", note: "First platinum responses in refractory disease; carboplatin follows in the 1980s." },
      { year: 1994, title: "BRCA1 cloned; hereditary ovarian cancer explained", note: "BRCA2 in 1995; germline testing enters clinical practice over the next decade.", refs: ["brca"] },
      { year: 1996, title: "Paclitaxel-cisplatin becomes standard (GOG-111)", refs: ["paclitaxel", "platinum"] },
      { year: 2005, title: "Synthetic lethality of PARP inhibition in BRCA-deficient cells", note: "Farmer and Bryant papers in Nature set up the PARP inhibitor era.", refs: ["parp", "synthetic-lethality"] },
      { year: 2007, title: "Fallopian tube identified as origin of high-grade serous cancer", note: "Serous tubal intraepithelial carcinoma described in BRCA carriers' prophylactic specimens; leads to salpingectomy-based prevention.", refs: ["hgsoc", "risk-reducing-salpingectomy"] },
      { year: 2011, title: "Bevacizumab improves PFS (GOG-0218, ICON7)", refs: ["gog-0218-icon7", "bevacizumab"] },
      { year: 2014, title: "Olaparib: first PARP inhibitor approved", note: "For germline BRCA-mutated ovarian cancer after three lines.", refs: ["olaparib"] },
      { year: 2018, title: "SOLO-1 and OVHIPEC-1", note: "Two years of first-line olaparib maintenance (PFS HR 0.30) and HIPEC at interval surgery (OS +12 months) both reported.", refs: ["solo-1", "ovhipec-1"] },
      { year: 2019, title: "PARP maintenance extends beyond BRCA", note: "PRIMA (niraparib, all comers) and PAOLA-1 (olaparib + bevacizumab, HRD-positive).", refs: ["prima", "paola-1"] },
      { year: 2021, title: "UKCTOCS: screening does not save lives; DESKTOP III: selected surgery at relapse does", refs: ["ukctocs", "desktop-iii"] },
      { year: 2022, title: "Mirvetuximab soravtansine: first ovarian ADC", note: "Accelerated approval; full approval after MIRASOL OS benefit in 2024.", refs: ["mirvetuximab-soravtansine", "mirasol"] },
      { year: 2023, title: "SOLO-1 7-year OS benefit; PARP later-line labels narrowed", note: "First-line maintenance benefit confirmed while later-line PARP use retreats after OS imbalances (ARIEL4, SOLO3).", refs: ["solo-1", "rucaparib"] },
      { year: 2025, title: "First LGSOC therapy (avutometinib + defactinib); ROSELLA and KEYNOTE-B96 positive", refs: ["avutometinib-defactinib", "ramp-201", "rosella", "keynote-b96"] },
      { year: 2026, title: "Relacorilant and pembrolizumab approved in platinum-resistant disease", note: "First immunotherapy approval in ovarian cancer (February 2026).", refs: ["relacorilant", "pembrolizumab", "keynote-b96"] },
    ],
    pipeline: ["rinatabart-sesutecan", "rainfol-01", "luveltamab-tazevibulin", "raludotatug-deruxtecan", "rejoice-ovarian01", "puxitatug-samrotecan", "avutometinib-defactinib", "wee1", "atr", "parp-pet", "galleri", "risk-reducing-salpingectomy", "idea-fra-adc-sequencing-ovarian", "idea-ctdna-guided-parp-duration"],
    openProblems: [
      "Screening is unsolved: the UKCTOCS trial found no mortality reduction, so three-quarters of patients are still diagnosed at stage III-IV; opportunistic salpingectomy and multi-cancer blood tests are the live routes.",
      "Platinum resistance is eventually near-universal in high-grade serous disease, and each new drug adds months, not years.",
      "PARP inhibitor resistance (BRCA reversion, restored fork protection) has no approved counter; later-line PARP use has been curtailed by OS signals.",
      "Immunotherapy fails in first-line disease; benefit is confined to PD-L1-positive platinum-resistant tumours.",
      "Clear-cell, mucinous, and carcinosarcoma have no subtype-specific approved therapy.",
      "FRα-low patients are excluded from mirvetuximab; next-generation ADCs are not yet approved.",
      "Access to HRD testing, PARP inhibitors, and ADCs is limited outside high-income countries.",
      "Optimal duration of maintenance and ctDNA-guided de-escalation are untested.",
    ],
    targets: ["kras", "vegf", "pdl1", "pd1"],
    technologies: ["risk-reducing-salpingectomy", "germline-testing", "ultrasound", "robotic-surgery"],
    terms: ["ca-125", "lgsoc", "hgsoc", "cps"],
    companies: ["astrazeneca", "merck", "gsk", "abbvie", "corcept", "verastem", "genmab", "sutro-biopharma", "daiichi-sankyo", "roche-genentech"],
    related: ["parp-plus-bevacizumab", "hipec-at-interval-surgery", "caution-pd1-first-line-ovarian", "adc-generations"],
    tags: ["spike", "gyn"],
  },
};

export default spike;

import type { CompanyInput, DrugInput, EntityInput, IdeaInput, PairingInput, TechnologyInput, TermInput, TrialInput } from "@/lib/schema";
import type { Spike } from "./index";
import { supplement } from "../supplement";

/**
 * Endometrial cancer spike. Facts checked 2026-09-07. Depends on the ovarian spike for
 * shared entities (bevacizumab, letrozole, rinatabart-sesutecan, rainfol-01, karyopharm).
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
  t({ id: "ruby", name: "RUBY / ENGOT-EN6 / GOG-3031", nct: "NCT03981796", phase: "3", status: "positive", yearReported: 2023, sponsor: "GSK", enrolled: 494,
    setting: "Primary advanced (stage III-IV) or first recurrent endometrial cancer: dostarlimab + carboplatin-paclitaxel, then dostarlimab up to 3 years, vs chemotherapy",
    tldr: "Adding immunotherapy to first chemotherapy for advanced endometrial cancer extended life by more than a year on average, most dramatically in tumours with a broken DNA spell-checker.",
    summary: "In dMMR/MSI-H tumours, 24-month PFS was 61.4% vs 15.7% (HR 0.28); in the overall population PFS HR 0.64 (NEJM 2023). Overall survival in the overall population was 44.6 vs 28.2 months (HR 0.69; Annals of Oncology 2024), with dMMR OS HR 0.32. FDA approval July 2023 (dMMR) and August 2024 (all comers).",
    result: "OS 44.6 vs 28.2 months overall (HR 0.69); dMMR PFS HR 0.28.",
    outcomes: [
      { endpoint: "Progression-free survival at 24 months (dMMR/MSI-H)", primary: true, unit: "%", arms: [{ name: "Dostarlimab + chemo", value: 61.4 }, { name: "Placebo + chemo", value: 15.7 }], hr: 0.28, ci: [0.16, 0.50], source: "https://www.nejm.org/doi/full/10.1056/NEJMoa2216334" },
      { endpoint: "Overall survival (overall population)", primary: true, unit: "months", arms: [{ name: "Dostarlimab + chemo", n: 245, value: 44.6 }, { name: "Placebo + chemo", n: 249, value: 28.2 }], hr: 0.69, ci: [0.54, 0.89], source: "https://www.annalsofoncology.org/article/S0923-7534(24)00721-X/fulltext" },
    ],
    replication: "NRG-GY018/KEYNOTE-868 (pembrolizumab) and DUO-E (durvalumab) reproduced the dMMR effect; RUBY is the only one with a reported all-comers OS benefit so far.",
    drugs: ["dostarlimab", "carboplatin", "paclitaxel"], targets: ["pd1"], cancers: ["endometrial"], terms: ["msi"], links: [ct("NCT03981796"), { label: "NEJM 2023", url: "https://www.nejm.org/doi/full/10.1056/NEJMoa2216334" }, { label: "OS, Annals of Oncology 2024", url: "https://www.annalsofoncology.org/article/S0923-7534(24)00721-X/fulltext" }], people: ["mansoor-raza-mirza"] }),
  t({ id: "nrg-gy018-keynote-868", name: "NRG-GY018 / KEYNOTE-868", nct: "NCT03914612", phase: "3", status: "positive", yearReported: 2023, sponsor: "NRG Oncology / Merck", enrolled: 816,
    setting: "Advanced or recurrent endometrial cancer: pembrolizumab + carboplatin-paclitaxel then pembrolizumab maintenance vs chemotherapy, analysed by MMR status",
    tldr: "NRG-GY018 is the pembrolizumab twin of RUBY: immunotherapy plus chemotherapy cut the risk of progression by 70% in dMMR tumours and 46% in the rest.",
    summary: "NRG-GY018, also KEYNOTE-868, trial NCT03914612 run by NRG Oncology with Merck support and published in the New England Journal of Medicine in 2023, is the pembrolizumab twin of RUBY: adding immunotherapy to carboplatin and paclitaxel, followed by pembrolizumab maintenance, cut the risk of progression by seventy percent in mismatch-repair-deficient advanced or recurrent endometrial cancer and by nearly half in the rest. It randomised 816 patients analysed by mismatch repair status, met its primary progression-free survival endpoint in both cohorts, and led to FDA approval in June 2024 regardless of mismatch repair status. OnCo links it to endometrial cancer, PD-1 as a target, pembrolizumab, NRG Oncology, the dMMR term, Ramez N. Eskander and the pairing of chemotherapy with PD-1 blockade. Whether mismatch-repair-proficient patients gain a survival benefit is the open question.",
    result: "PFS HR 0.30 (dMMR), 0.54 (pMMR).",
    outcomes: [
      { endpoint: "Progression-free survival (dMMR)", primary: true, unit: "HR", arms: [{ name: "Pembrolizumab + chemo", n: 112 }, { name: "Placebo + chemo", n: 113 }], hr: 0.30, ci: [0.19, 0.48], source: "https://www.nejm.org/doi/full/10.1056/NEJMoa2302312" },
      { endpoint: "Progression-free survival (pMMR)", primary: true, unit: "HR", arms: [{ name: "Pembrolizumab + chemo", n: 294 }, { name: "Placebo + chemo", n: 294 }], hr: 0.54, ci: [0.41, 0.71], source: "https://www.nejm.org/doi/full/10.1056/NEJMoa2302312" },
    ],
    drugs: ["pembrolizumab", "carboplatin", "paclitaxel"], targets: ["pd1"], cancers: ["endometrial"], institutions: ["nrg-oncology"], terms: ["msi"], links: [ct("NCT03914612"), { label: "NEJM 2023", url: "https://www.nejm.org/doi/full/10.1056/NEJMoa2302312" }], people: ["ramez-eskander"] }),
  t({ id: "duo-e", name: "DUO-E / GOG-3041 / ENGOT-EN10", nct: "NCT04269200", phase: "3", status: "positive", yearReported: 2023, sponsor: "AstraZeneca", enrolled: 718,
    setting: "Newly diagnosed advanced or recurrent endometrial cancer: chemotherapy + durvalumab, then durvalumab ± olaparib maintenance, vs chemotherapy",
    tldr: "A third immunotherapy confirmed the benefit in dMMR disease and hinted that adding olaparib helps the mismatch-repair-proficient majority.",
    summary: "Durvalumab alone: PFS HR 0.71 overall and 0.42 in dMMR. Durvalumab + olaparib: PFS HR 0.55 overall and 0.57 in pMMR (JCO 2023). FDA approved durvalumab with chemotherapy for dMMR disease in June 2024; the EU approved both the durvalumab and durvalumab + olaparib regimens (pMMR for the latter) in 2024.",
    result: "PFS HR 0.42 (dMMR, durvalumab); 0.57 (pMMR, durvalumab + olaparib).",
    outcomes: [
      { endpoint: "Progression-free survival (dMMR, durvalumab)", unit: "HR", arms: [{ name: "Durvalumab + chemo" }, { name: "Chemo" }], hr: 0.42, ci: [0.22, 0.80], source: "https://ascopubs.org/doi/10.1200/JCO.23.02132" },
      { endpoint: "Progression-free survival (pMMR, durvalumab + olaparib)", unit: "HR", arms: [{ name: "Durvalumab + olaparib + chemo" }, { name: "Chemo" }], hr: 0.57, ci: [0.44, 0.73], source: "https://ascopubs.org/doi/10.1200/JCO.23.02132" },
    ],
    drugs: ["durvalumab", "olaparib", "carboplatin", "paclitaxel"], targets: ["pdl1", "parp"], cancers: ["endometrial"], terms: ["msi"], links: [ct("NCT04269200"), { label: "JCO 2023", url: "https://ascopubs.org/doi/10.1200/JCO.23.02132" }] }),
  t({ id: "keynote-775", name: "KEYNOTE-775 / Study 309", nct: "NCT03517449", phase: "3", status: "positive", yearReported: 2021, sponsor: "Eisai / Merck", enrolled: 827,
    setting: "Advanced endometrial cancer after platinum: lenvatinib + pembrolizumab vs doxorubicin or weekly paclitaxel",
    tldr: "A pill that blocks tumour blood vessels plus immunotherapy extended survival after chemotherapy, including in tumours that immunotherapy alone does not touch.",
    summary: "OS 18.3 vs 11.4 months in all comers (HR 0.62) and 17.4 vs 12.0 months in pMMR (HR 0.68); PFS 7.2 vs 3.8 months (NEJM 2022). Full approval 2021 for pMMR disease after platinum. Toxicity is substantial: hypertension, hypothyroidism, diarrhoea, and dose reductions in two-thirds of patients. Now largely used after first-line chemo-immunotherapy.",
    result: "OS 18.3 vs 11.4 months (HR 0.62).",
    outcomes: [
      { endpoint: "Overall survival (all comers)", primary: true, unit: "months", arms: [{ name: "Lenvatinib + pembrolizumab", n: 411, value: 18.3 }, { name: "Chemotherapy", n: 416, value: 11.4 }], hr: 0.62, ci: [0.51, 0.75], source: "https://www.nejm.org/doi/full/10.1056/NEJMoa2108330" },
      { endpoint: "Progression-free survival (all comers)", primary: true, unit: "months", arms: [{ name: "Lenvatinib + pembrolizumab", value: 7.2 }, { name: "Chemotherapy", value: 3.8 }], hr: 0.56, ci: [0.47, 0.66], source: "https://www.nejm.org/doi/full/10.1056/NEJMoa2108330" },
    ],
    drugs: ["lenvatinib", "pembrolizumab"], targets: ["vegf", "pd1"], cancers: ["endometrial"], links: [ct("NCT03517449"), { label: "NEJM 2022", url: "https://www.nejm.org/doi/full/10.1056/NEJMoa2108330" }] }),
  t({ id: "portec-3", name: "PORTEC-3", nct: "NCT00411138", phase: "3", status: "positive", yearReported: 2018, sponsor: "Dutch Gynaecological Oncology Group", enrolled: 660,
    setting: "High-risk early or stage III endometrial cancer after surgery: chemoradiation + 4 cycles chemotherapy vs pelvic radiotherapy alone",
    tldr: "Adding chemotherapy to radiation after surgery helped women with high-risk endometrial cancer, especially those whose tumours have a broken p53 gene.",
    summary: "5-year OS 81.4% vs 76.1% (HR 0.70) and failure-free survival 76.5% vs 69.1% in the updated analysis (Lancet Oncology 2019); the benefit was largest in stage III and serous cancers. Molecular analysis (de Boer/León-Castillo, JCO 2020) showed strong benefit in p53-abnormal tumours and none in POLE-mutated tumours, the basis for molecular-class-directed adjuvant therapy now tested in RAINBO.",
    result: "5-year OS 81.4% vs 76.1% (HR 0.70); benefit concentrated in p53-abnormal disease.",
    outcomes: [{ endpoint: "Overall survival at 5 years", unit: "%", arms: [{ name: "Chemoradiation + chemotherapy", n: 330, value: 81.4 }, { name: "Radiotherapy alone", n: 330, value: 76.1 }], hr: 0.70, ci: [0.51, 0.97], source: "https://www.thelancet.com/journals/lanonc/article/PIIS1470-2045(19)30395-X/fulltext" }],
    replication: "GOG-258 (chemoradiation vs chemotherapy alone) found no RFS difference, so the incremental value of radiation remains debated.",
    technologies: ["imrt-igrt", "cytotoxic-chemotherapy", "brachytherapy"], cancers: ["endometrial"], terms: ["endometrial-molecular-classes"], targets: ["tp53"], links: [ct("NCT00411138"), { label: "Lancet Oncology 2019", url: "https://www.thelancet.com/journals/lanonc/article/PIIS1470-2045(19)30395-X/fulltext" }], people: ["carien-creutzberg"] }),
  t({ id: "destiny-pantumor02", name: "DESTINY-PanTumor02", nct: "NCT04482309", phase: "2", status: "positive", yearReported: 2023, sponsor: "AstraZeneca / Daiichi Sankyo", enrolled: 267,
    setting: "HER2-expressing (IHC 2+/3+) solid tumours after ≥1 line, seven cohorts including endometrial and cervical: trastuzumab deruxtecan",
    tldr: "DESTINY-PanTumor02 gave the HER2-directed antibody-drug conjugate Enhertu to 267 patients in seven cohorts of HER2-expressing solid tumours, endometrial and cervical cancer among them. Endometrial cancer responded best, and in April 2024 the FDA granted the first tumour-agnostic HER2 approval, for tumours with the strongest HER2 staining and no satisfactory alternative.",
    summary: "DESTINY-PanTumor02, trial NCT04482309 sponsored by AstraZeneca and Daiichi Sankyo and published in JCO in 2024, showed that trastuzumab deruxtecan shrinks tumours across seven cohorts of HER2-expressing cancers, with endometrial cancer among the best responders, leading to the first tumour-agnostic HER2 approval. It was a phase 2 of 267 patients with HER2 IHC 2+ or 3+ solid tumours in seven cohorts; the endometrial cohort responded in 57.5 percent overall and 84.6 percent of IHC 3+ cases, the cervical cohort in half, and FDA accelerated approval followed in April 2024 for HER2 IHC 3+ solid tumours with no satisfactory alternative. HER2 testing is now recommended in serous endometrial carcinoma, and how far the tumour-agnostic label should reach is the open question.",
    result: "Endometrial ORR 57.5% (84.6% in IHC 3+); cervical ORR 50%.",
    outcomes: [{ endpoint: "Objective response rate, endometrial cohort", primary: true, unit: "%", arms: [{ name: "T-DXd (all HER2 IHC 2+/3+)", n: 40, value: 57.5 }, { name: "T-DXd (IHC 3+ only)", n: 13, value: 84.6 }], source: "https://ascopubs.org/doi/10.1200/JCO.23.02005" }, { endpoint: "Objective response rate, cervical cohort", unit: "%", arms: [{ name: "T-DXd (all)", n: 40, value: 50.0 }], source: "https://ascopubs.org/doi/10.1200/JCO.23.02005" }],
    drugs: ["trastuzumab-deruxtecan"], targets: ["her2"], cancers: ["endometrial", "cervical"], technologies: ["adc"], terms: ["tumour-agnostic"], links: [ct("NCT04482309"), { label: "JCO 2024", url: "https://ascopubs.org/doi/10.1200/JCO.23.02005" }], people: ["funda-meric-bernstam"] }),
  t({ id: "xport-ec-042", name: "XPORT-EC-042 / ENGOT-EN20 / GOG-3083", nct: "NCT05611931", phase: "3", status: "negative", yearReported: 2026, sponsor: "Karyopharm",
    setting: "TP53-wild-type advanced or recurrent endometrial cancer after response to platinum: maintenance selinexor vs placebo",
    tldr: "XPORT-EC-042 tested maintenance selinexor against placebo in TP53-normal advanced endometrial cancer after response to platinum chemotherapy, chasing a subgroup finding from the earlier SIENDO trial. It missed its primary endpoint in July 2026: a trend favoured selinexor but did not reach statistical significance, a lesson in the limits of post-hoc biomarker subgroups.",
    summary: "The primary PFS endpoint was not met (topline 30 July 2026). A trend favoured selinexor in the modified intent-to-treat population (median PFS 12.75 vs 7.43 months), consistent with the SIENDO exploratory subgroup that motivated the trial, but not statistically significant. Karyopharm cut its endometrial investment. A lesson in the limits of post-hoc biomarker subgroups.",
    result: "Primary PFS endpoint not met; mPFS 12.75 vs 7.43 months (mITT) not significant.",
    outcomes: [{ endpoint: "Progression-free survival (mITT)", primary: true, unit: "months", arms: [{ name: "Selinexor", value: 12.75, note: "Not statistically significant" }, { name: "Placebo", value: 7.43 }], p: "not significant", source: "https://investors.karyopharm.com/2026-07-30-Karyopharm-Announces-Topline-Results-from-Phase-3-XPORT-EC-042-Trial-in-Endometrial-Cancer" }],
    drugs: ["selinexor"], targets: ["tp53"], cancers: ["endometrial"], companies: ["karyopharm"], tags: ["failure", "lesson:subgroup"], links: [ct("NCT05611931"), { label: "Karyopharm topline", url: "https://investors.karyopharm.com/2026-07-30-Karyopharm-Announces-Topline-Results-from-Phase-3-XPORT-EC-042-Trial-in-Endometrial-Cancer" }] }),
  t({ id: "fires-sentor", name: "FIRES & SENTOR (sentinel node mapping)", nct: "NCT01673022", phase: "observational", status: "positive", yearReported: 2017, sponsor: "Academic (Indiana University; University of Toronto)",
    setting: "Endometrial cancer staging: indocyanine-green sentinel lymph node mapping compared against full lymphadenectomy",
    tldr: "Mapping and removing only the first draining lymph nodes finds spread as reliably as removing all of them, with far less lymphoedema.",
    summary: "FIRES and SENTOR, led by trial NCT01673022 and run academically at Indiana University and the University of Toronto, showed that mapping and removing only the first draining lymph nodes with indocyanine green finds spread in endometrial cancer as reliably as removing all of them, with far less lymphoedema. FIRES, published in Lancet Oncology in 2017 with 385 patients, reported sensitivity of 97.2 percent and a negative predictive value of 99.6 percent, and SENTOR, published in JAMA Surgery in 2021 with 156 high-grade patients, reported sensitivity of 96 percent and a negative predictive value of 99 percent. Sentinel node biopsy is now standard in apparent early-stage disease under NCCN and ESGO guidance, and whether it changes survival rather than only staging is the open question.",
    result: "Sensitivity 97%, NPV 99.6% (FIRES).",
    technologies: ["sentinel-node", "optical-imaging", "robotic-surgery"], cancers: ["endometrial"], links: [ct("NCT01673022"), { label: "FIRES, Lancet Oncology 2017", url: "https://www.thelancet.com/journals/lanonc/article/PIIS1470-2045(17)30068-2/fulltext" }] }),
];

// ======================= DRUGS =======================
const drugs: DrugInput[] = [
  d(supplement<DrugInput>({ id: "lenvatinib", kind: "drug",
    regulatoryEvents: [{ date: "2019-09-17", type: "approval", region: "US", note: "Accelerated approval with pembrolizumab in endometrial cancer (KEYNOTE-146)" }, { date: "2021-07-21", type: "approval", region: "US", note: "Full approval, pMMR endometrial cancer (KEYNOTE-775)" }],
    notes: ["In endometrial cancer: approved with pembrolizumab for pMMR advanced disease after platinum (KEYNOTE-775, OS 18.3 versus 11.4 months), after accelerated approval on KEYNOTE-146 in 2019; LEAP-001 in first line against chemotherapy was negative. The dose is 20 mg daily with pembrolizumab 200 mg every 3 weeks; hypertension affected 64 percent (38 percent grade 3 or higher), hypothyroidism 57 percent, diarrhoea 54 percent, and about 67 percent of KEYNOTE-775 patients needed a dose reduction. Blood pressure is checked weekly for two cycles and TSH every 6 weeks."],
    cancers: ["endometrial"], trials: ["keynote-775"], terms: ["tace-term"], pathways: ["vegf-angiogenesis"] })),
  d({ id: "selinexor", links: [{ label: "FDA label (DailyMed)", url: "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=Selinexor" }], name: "Selinexor", brand: "Xpovio", code: "KPT-330", modality: "Small-molecule XPO1 (nuclear export) inhibitor", status: "approved", wikipedia: W("Selinexor"),
    tldr: "Selinexor is a first-in-class pill that traps tumour-suppressor proteins inside the nucleus; approved in myeloma, it failed its endometrial cancer test in 2026.",
    summary: "Approved 2019 (penta-refractory myeloma with dexamethasone), 2020 (DLBCL; with bortezomib in myeloma, BOSTON). In endometrial cancer, SIENDO (2022) missed its primary endpoint but a TP53-wild-type subgroup showed a large PFS difference; the confirmatory XPORT-EC-042 missed its primary endpoint in July 2026. Nausea, fatigue, weight loss, and thrombocytopenia limit tolerability.",
    mechanism: "Covalent inhibitor of exportin-1 (XPO1/CRM1), retaining p53, RB, FOXO, and other tumour suppressors in the nucleus and reducing oncoprotein translation.",
    mechanismSteps: ["Binds XPO1 in the nuclear pore complex", "Tumour suppressors (p53, p21, RB) accumulate in the nucleus", "Oncogene mRNAs (MYC, cyclin D) are not exported", "Cells with intact p53 arrest or die"],
    dosing: { route: "Oral", schedule: "80 mg weekly with dexamethasone (myeloma); 60 mg weekly (endometrial trials)", monitoring: "Weekly CBC, sodium, weight; antiemetic prophylaxis" },
    toxicity: [{ event: "Nausea", anyGradePct: 84, grade3PlusPct: 10, note: "SIENDO selinexor arm" }, { event: "Thrombocytopenia", anyGradePct: 43, grade3PlusPct: 9 }, { event: "Fatigue", anyGradePct: 49, grade3PlusPct: 9 }],
    approvals: [{ region: "US", year: 2019, indication: "Relapsed/refractory multiple myeloma (≥4 lines) with dexamethasone" }, { region: "US", year: 2020, indication: "Relapsed/refractory DLBCL; myeloma with bortezomib after ≥1 line" }, { region: "EU", year: 2021, indication: "EU brand Nexpovio", note: "Conditional marketing authorisation" }],
    regulatoryEvents: [{ date: "2026-07-30", type: "filing", region: "US", note: "XPORT-EC-042 misses primary endpoint; endometrial development deprioritised", source: "https://cancerletter.com/clinical-roundup/20260807_8a/" }],
    targets: ["tp53"], technologies: ["kinase-inhibitors"], companies: ["karyopharm", "antengene"], cancers: ["endometrial", "multiple-myeloma", "dlbcl"], trials: ["xport-ec-042", "nct04442022", "nct06158841", "nct02227251", "nct02343042", "nct04414475", "nct04782687", "nct04562389"] }),
  d({ id: "megestrol-progestins", links: [{ label: "FDA label (DailyMed)", url: "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=Progestins" }], name: "Progestins (megestrol acetate, medroxyprogesterone, levonorgestrel IUD)", brand: "Megace; Mirena (IUD)", modality: "Hormonal therapy (progestin)", status: "approved", wikipedia: W("Megestrol_acetate"),
    tldr: "Progesterone-like hormones that can reverse early endometrial cancer in women who want to keep their uterus, and control advanced hormone-sensitive disease.",
    summary: "Fertility-sparing therapy for grade 1, stage IA endometrioid cancer or atypical hyperplasia (oral progestin or levonorgestrel IUD; complete response ~70-80% within 12 months, relapse ~30%). In advanced ER/PR-positive low-grade disease, progestins, alternating with tamoxifen (GOG-119), or aromatase inhibitors with CDK4/6 inhibitors (PALEO, NRG-GY019) give durable control with minimal toxicity.",
    mechanism: "Progesterone receptor agonism suppresses ER-driven proliferation and induces glandular differentiation of endometrial epithelium.",
    dosing: { route: "Oral or intrauterine", schedule: "Megestrol 160 mg daily; levonorgestrel 52 mg IUD; re-biopsy every 3-6 months in fertility-sparing use", monitoring: "Endometrial sampling, weight, thrombosis risk" },
    toxicity: [{ event: "Weight gain", anyGradePct: 30 }, { event: "Venous thromboembolism", note: "Increased risk with high-dose oral progestins" }],
    approvals: [{ region: "US", year: 1971, indication: "Palliative treatment of advanced endometrial and breast cancer (megestrol)" }],
    targets: ["estrogen-receptor"], technologies: ["endocrine-therapy"], cancers: ["endometrial"], pathways: ["er-signaling"] }),
];

// ======================= COMPANIES =======================
const companies: CompanyInput[] = [
  co(supplement<CompanyInput>({ id: "eisai", kind: "company", cancers: ["endometrial"] })),
];

// ======================= TERMS =======================
const terms: TermInput[] = [
  tm({ id: "endometrial-molecular-classes", wikipedia: W("Endometrial_cancer"), name: "Endometrial cancer molecular classes (POLEmut, MMRd, p53abn, NSMP)", category: "Cancer biology",
    tldr: "Four groups defined by a few tests that predict outcome better than the microscope: POLE-mutated (excellent), mismatch-repair deficient, p53-abnormal (worst), and 'no specific profile'.",
    summary: "From TCGA (Nature 2013) via the ProMisE classifier (Talhouk 2015) into the WHO 2020 classification and ESGO/ESTRO/ESP 2021 guidelines. POLE-ultramutated (~7%) almost never relapses and may need no adjuvant therapy; MMRd (~25-30%) responds to immunotherapy; p53abn (~15%; includes most serous) benefits from chemotherapy (PORTEC-3) and often carries HER2 amplification; NSMP (~50%) is heterogeneous, with L1CAM and ER status refining risk. Molecular-class-directed adjuvant trials (RAINBO programme, PORTEC-4a) are ongoing.",
    cancers: ["endometrial"], targets: ["tp53", "her2"], terms: ["msi"], trials: ["portec-3"], links: [{ label: "TCGA, Nature 2013", url: "https://www.nature.com/articles/nature12113" }] }),
];

// ======================= TECHNOLOGIES =======================
const technologies: TechnologyInput[] = [
  te({ id: "fertility-sparing-endometrial", links: [{ label: "Rodolakis et al., ESGO/ESHRE/ESGE guidelines for the fertility-sparing treatment of patients with endometrial carcinoma (International Journal of Gynecological Cancer 2023)", url: "https://doi.org/10.1136/ijgc-2022-004047" }], name: "Fertility-sparing hormonal treatment of early endometrial cancer", sections: ["hormonal", "surgery"], status: "established",
    tldr: "For young women with the earliest, low-grade endometrial cancers, progestin pills or a hormonal IUD can clear the cancer and allow pregnancy before a later hysterectomy.",
    summary: "Candidates: grade 1 endometrioid carcinoma confined to the endometrium on MRI, PR-positive, no myometrial invasion. Complete response ~70-80% at 12 months with oral megestrol/medroxyprogesterone or a levonorgestrel IUD (often combined with metformin or hysteroscopic resection); recurrence ~30%; live-birth rates ~30-40% with assisted reproduction. Hysterectomy after childbearing is recommended.",
    principle: "Progestin-induced differentiation and apoptosis of hormone-responsive endometrial cancer cells under close endometrial sampling surveillance.",
    strengths: ["Preserves fertility in a disease increasingly diagnosed in women under 45", "Minimal toxicity"],
    limitations: ["Recurrence risk ~30%", "Requires strict imaging and biopsy follow-up", "Not appropriate for grade 2-3, p53-abnormal, or invasive disease"],
    drugs: ["megestrol-progestins"], cancers: ["endometrial"], technologies: ["mri", "endocrine-therapy"] }),
];

// ======================= PAIRINGS =======================
const pairings: PairingInput[] = [
  pr({ id: "chemo-io-first-line-endometrial", links: [{ label: "ClinicalTrials.gov NCT03981796: RUBY / ENGOT-EN6 / GOG-3031", url: "https://clinicaltrials.gov/study/NCT03981796" }, { label: "ClinicalTrials.gov NCT03914612: NRG-GY018 / KEYNOTE-868", url: "https://clinicaltrials.gov/study/NCT03914612" }], name: "Chemotherapy + PD-1/PD-L1 blockade, first-line advanced endometrial cancer", a: "checkpoint-inhibitor", b: "carboplatin", pairingType: "combination",
    tldr: "Three trials with three different antibodies agree: adding immunotherapy to first chemotherapy for advanced endometrial cancer roughly triples progression-free time in dMMR tumours and helps the rest modestly.",
    summary: "Adding a PD-1 or PD-L1 antibody to first-line carboplatin-based chemotherapy for advanced or recurrent endometrial cancer is a combination pairing supported by three positive phase 3 trials with three different antibodies: RUBY with dostarlimab, NRG-GY018 / KEYNOTE-868 with pembrolizumab, and DUO-E with durvalumab with or without olaparib. Tumours with mismatch repair deficiency carry thousands of neoantigens and gain the most, while chemotherapy provides antigen release and lymphodepletion that appear to extend a more modest benefit into mismatch repair-proficient disease. RUBY also demonstrated an overall survival benefit. The consistency across these trials makes it the most reliably replicated regimen in gynaecological oncology.",
    rationale: "dMMR tumours carry thousands of neoantigens; chemotherapy provides antigen release and lymphodepletion that appear to extend benefit into pMMR disease.",
    evidence: "Three positive phase 3 trials; OS benefit shown in RUBY.",
    trials: ["ruby", "nrg-gy018-keynote-868", "duo-e"], drugs: ["dostarlimab", "pembrolizumab", "durvalumab"], cancers: ["endometrial"], terms: ["msi"] }),
  pr({ id: "lenvatinib-plus-pembrolizumab", links: [{ label: "ClinicalTrials.gov NCT03517449: KEYNOTE-775 / Study 309", url: "https://clinicaltrials.gov/study/NCT03517449" }], name: "Lenvatinib + pembrolizumab (pMMR endometrial cancer after platinum)", a: "lenvatinib", b: "pembrolizumab", pairingType: "combination",
    tldr: "An anti-angiogenic pill makes immunotherapy work in endometrial cancers that would otherwise ignore it, at the cost of significant side effects.",
    summary: "Lenvatinib plus pembrolizumab is a combination pairing for mismatch repair-proficient endometrial cancer that has progressed after platinum chemotherapy. VEGFR inhibition by lenvatinib reduces immunosuppressive myeloid cells and normalises tumour vessels so that T cells can enter, turning a cancer that largely ignores PD-1 monotherapy into one that responds. In the phase 3 KEYNOTE-775 / Study 309 trial the combination improved overall survival compared with chemotherapy both in all comers and in the pMMR population, but dose reductions and discontinuations for toxicity were common. In the first-line setting LEAP-001 failed to beat chemotherapy, so the pairing lives in the second line. It is one instance of the broader pattern of PD-1 blockade plus VEGF inhibition.",
    rationale: "VEGFR inhibition reduces immunosuppressive myeloid cells and normalises vessels for T-cell entry; the combination overcame PD-1 monotherapy's ~13% response rate in pMMR disease.",
    evidence: "Phase 3 OS benefit (second line); negative first-line trial.",
    trials: ["keynote-775"], cancers: ["endometrial"], targets: ["vegf", "pd1"], related: ["io-plus-vegf"] }),
];

// ======================= IDEAS =======================
const ideas: IdeaInput[] = [
  idea({ id: "idea-molecular-class-adjuvant-endometrial", links: [{ label: "ClinicalTrials.gov NCT00411138: PORTEC-3", url: "https://clinicaltrials.gov/study/NCT00411138" }], name: "Molecular-class-directed adjuvant therapy in endometrial cancer", maturity: "being-tested-at-scale",
    tldr: "Give adjuvant treatment by the tumour's molecular class rather than by stage and grade: nothing for POLE-mutated, immunotherapy for MMRd, chemotherapy plus targeted agents for p53-abnormal, hormones for NSMP.",
    summary: "PORTEC-3 molecular analysis showed p53abn tumours gained the most from chemoradiation and POLEmut tumours nothing. The RAINBO programme (four parallel trials: p53abn-RED with olaparib, MMRd-GREEN with durvalumab, NSMP-ORANGE with progestin, POLEmut-BLUE de-escalation) and PORTEC-4a test this prospectively.",
    hypothesis: "Molecular-class-directed adjuvant therapy improves recurrence-free survival in p53abn and MMRd disease and safely omits adjuvant therapy in POLEmut disease compared with stage-based standard care.",
    rationale: "Retrospective PORTEC and TransPORTEC analyses consistently show class-specific benefit; the classifier is cheap (three IHC stains plus POLE sequencing).",
    test: "RAINBO and PORTEC-4a read out 2027-2030; recurrence-free survival by class.",
    cancers: ["endometrial"], terms: ["endometrial-molecular-classes", "msi"], trials: ["portec-3"], drugs: ["durvalumab", "olaparib", "megestrol-progestins"], targets: ["tp53"] }),
  idea({ id: "idea-her2-adc-serous-endometrial", links: [{ label: "ClinicalTrials.gov NCT04482309: DESTINY-PanTumor02", url: "https://clinicaltrials.gov/study/NCT04482309" }], name: "HER2 ADCs as standard for HER2-positive serous endometrial cancer", maturity: "early-clinical",
    tldr: "Serous endometrial cancers often overproduce HER2. Enhertu already works in them; testing HER2 in every p53-abnormal tumour and using the ADC earlier could change outcomes for the worst subtype.",
    summary: "Serous endometrial carcinomas, which fall in the p53-abnormal molecular class, frequently amplify HER2, and this idea proposes testing HER2 in every p53-abnormal tumour and using trastuzumab deruxtecan earlier. T-DXd produced a high response rate in HER2 IHC 3+ endometrial cancer in DESTINY-PanTumor02, leading to tumour-agnostic approval, and trastuzumab with chemotherapy improved progression-free survival in a randomised phase 2 reported by Fader in 2018. The rationale is strong single-agent activity, a defined biomarker, and a subtype that is the deadliest and gains least from immunotherapy. The proposed test is a randomised phase 3 of first-line chemo-immunotherapy with or without T-DXd in HER2-positive p53abn disease, at an early clinical stage; NRG-GY026 tests trastuzumab.",
    hypothesis: "Adding T-DXd (or trastuzumab) to first-line chemo-immunotherapy in HER2-positive p53abn endometrial cancer improves PFS and OS.",
    rationale: "Strong single-agent activity, a defined biomarker, and a subtype with the highest mortality and least benefit from immunotherapy.",
    test: "Randomised phase 3 of chemo-IO ± T-DXd (or sequential T-DXd) in HER2 IHC 2+/3+ p53abn disease; NRG-GY026 tests trastuzumab/pertuzumab with chemotherapy.",
    cancers: ["endometrial"], drugs: ["trastuzumab-deruxtecan", "trastuzumab"], targets: ["her2", "tp53"], trials: ["destiny-pantumor02"], terms: ["endometrial-molecular-classes"] }),
];

const entities: EntityInput[] = [...trials, ...drugs, ...companies, ...terms, ...technologies, ...pairings, ...ideas];

// ======================= CANCER PATCH =======================
const spike: Spike = {
  cancerId: "endometrial",
  entities,
  patch: {
    asOf,
    summary: "Endometrial cancer is the most common gynaecologic cancer in high-income countries (~420,000 cases a year worldwide) and one of the few cancers whose incidence and mortality are rising, driven by obesity, diabetes, and an ageing population. Most cases are low-grade endometrioid tumours found at stage I because of postmenopausal bleeding, and are cured by hysterectomy; a minority (serous, clear-cell, carcinosarcoma, and other p53-abnormal tumours) behave like high-grade ovarian cancer and account for most deaths. Since 2013, four molecular classes (POLE-mutated, mismatch-repair deficient, p53-abnormal, no specific molecular profile) have replaced histology as the primary prognostic and predictive framework.\n\nThe standard of care for early disease is minimally invasive hysterectomy with sentinel lymph node mapping, and adjuvant therapy scaled to risk: observation or vaginal brachytherapy for low and intermediate risk, pelvic radiotherapy or chemoradiation plus chemotherapy for high risk (PORTEC-3), with molecular class increasingly steering choices and fertility-sparing progestin therapy available for young women with the earliest tumours. Advanced and recurrent disease changed in 2023: three phase 3 trials (RUBY, NRG-GY018, DUO-E) established chemotherapy plus a PD-1/PD-L1 antibody as first-line standard, with dramatic benefit in dMMR tumours and a survival gain in the whole population (RUBY, OS 44.6 vs 28.2 months). Lenvatinib plus pembrolizumab (KEYNOTE-775) remains the second-line option for mismatch-repair-proficient disease, and trastuzumab deruxtecan is approved for HER2 IHC 3+ tumours.\n\nNext: molecular-class-directed adjuvant therapy (RAINBO, PORTEC-4a), folate-receptor and TROP2 ADCs (rinatabart sesutecan with Breakthrough designation, sacituzumab tirumotecan), CDK4/6 plus endocrine therapy for low-grade ER-positive disease, and HER2 ADCs moved earlier in serous cancer. The 2026 failure of selinexor maintenance (XPORT-EC-042) is a caution about subgroup-derived hypotheses. Prevention through weight management and progestin-releasing IUDs, and equitable outcomes for Black women, whose mortality is nearly double, are the population-level problems.",
    burden: "Endometrial cancer accounts for ~420,000 cases per year worldwide and is the most common gynaecologic cancer in the US and Europe; most are found at stage I because of postmenopausal bleeding and cured by hysterectomy. Incidence and mortality are rising ~1-2% per year with obesity; ~97,000 deaths per year.",
    subtypes: ["Endometrioid (~80%; grade 1-3; usually ER/PR-positive)", "Serous (~10%; p53-abnormal; HER2 amplified in ~25-30%)", "Clear-cell (~3%)", "Carcinosarcoma (~5%; biphasic; p53-abnormal)", "Undifferentiated/dedifferentiated (often MMRd, SWI/SNF loss)", "Molecular classes: POLE-ultramutated (~7%), MMRd (~25-30%), p53-abnormal (~15%), NSMP (~50%)"],
    biomarkers: ["MMR IHC / MSI (dMMR ~25-30%; Lynch syndrome in ~3% of all cases)", "POLE exonuclease-domain mutation", "p53 IHC", "ER/PR", "HER2 IHC/ISH (serous, p53abn)", "L1CAM (NSMP risk)", "CTNNB1 (NSMP low-grade recurrence risk)", "PD-L1 (limited utility)", "FRα and TROP2 (ADC trials)", "ARID1A, PIK3CA, PTEN (targetable in trials)"],
    standardOfCare: [
      { setting: "Prevention and hereditary risk", approach: "Universal MMR testing of tumours to identify Lynch syndrome; risk-reducing hysterectomy and salpingo-oophorectomy for Lynch carriers after childbearing; levonorgestrel IUD and weight management reduce risk; no screening for average-risk women.", refs: ["germline-testing", "msi", "megestrol-progestins"], guideline: { nccn: "2A" } },
      { setting: "Diagnosis and staging", approach: "Endometrial biopsy for postmenopausal bleeding; MRI for myometrial and cervical invasion; molecular classification (p53, MMR IHC, POLE sequencing) on the diagnostic specimen.", refs: ["mri", "histopathology-ihc", "endometrial-molecular-classes"], guideline: { nccn: "2A", url: "https://www.esgo.org/guidelines/" } },
      { setting: "Early stage surgery", approach: "Minimally invasive total hysterectomy and bilateral salpingo-oophorectomy with sentinel lymph node mapping (FIRES, SENTOR); omentectomy for serous histology.", refs: ["robotic-surgery", "sentinel-node", "fires-sentor"], guideline: { nccn: "1" } },
      { setting: "Fertility-sparing (grade 1, stage IA, no invasion)", approach: "Progestin (oral or IUD) with re-biopsy every 3-6 months; hysterectomy after childbearing.", refs: ["fertility-sparing-endometrial", "megestrol-progestins"], guideline: { nccn: "2B" } },
      { setting: "Adjuvant, low and intermediate risk", approach: "Observation (low risk, POLEmut) or vaginal brachytherapy (intermediate risk; PORTEC-2); molecular class may de-escalate (PORTEC-4a).", refs: ["brachytherapy", "endometrial-molecular-classes"], guideline: { nccn: "1 (brachytherapy)" } },
      { setting: "Adjuvant, high risk (stage III, serous, p53abn, deep invasion grade 3)", approach: "Chemoradiation plus carboplatin-paclitaxel (PORTEC-3) or chemotherapy alone (GOG-258); pembrolizumab or dostarlimab added for stage III-IV per RUBY/GY018 eligibility.", refs: ["portec-3", "carboplatin", "paclitaxel", "imrt-igrt", "pembrolizumab", "dostarlimab"], guideline: { nccn: "1" } },
      { setting: "Advanced or recurrent, first line (any MMR status)", approach: "Carboplatin-paclitaxel plus dostarlimab (RUBY), pembrolizumab (NRG-GY018/KEYNOTE-868), or durvalumab (DUO-E; dMMR in the US), continued as maintenance up to 2-3 years.", refs: ["ruby", "nrg-gy018-keynote-868", "duo-e", "dostarlimab", "pembrolizumab", "durvalumab", "chemo-io-first-line-endometrial"], guideline: { nccn: "1", esmoMcbs: "4 (dMMR)" } },
      { setting: "Recurrent, pMMR, after platinum", approach: "Lenvatinib + pembrolizumab (KEYNOTE-775) if not previously given immunotherapy; T-DXd if HER2 IHC 3+; chemotherapy (doxorubicin, weekly paclitaxel); hormonal therapy for low-grade ER-positive disease.", refs: ["lenvatinib", "pembrolizumab", "keynote-775", "trastuzumab-deruxtecan", "destiny-pantumor02", "letrozole", "megestrol-progestins"], guideline: { nccn: "1 (lenvatinib-pembrolizumab)" } },
      { setting: "Recurrent, dMMR, after chemotherapy", approach: "Single-agent PD-1 blockade (dostarlimab GARNET, pembrolizumab) if immunotherapy-naive; otherwise chemotherapy or trials.", refs: ["dostarlimab", "pembrolizumab", "msi"], guideline: { nccn: "1" } },
      { setting: "HER2-positive serous", approach: "Trastuzumab with carboplatin-paclitaxel (randomised phase 2) or T-DXd for IHC 3+ after prior therapy.", refs: ["trastuzumab", "trastuzumab-deruxtecan", "her2", "destiny-pantumor02"], guideline: { nccn: "2A" } },
    ],
    stateOfArt: [
      "Chemotherapy plus PD-1/PD-L1 blockade is first-line standard for advanced disease, with a 16-month overall survival gain in RUBY and a 72% reduction in progression risk in dMMR tumours.",
      "Molecular classification (POLE, MMR, p53) is part of routine diagnosis and is beginning to direct adjuvant therapy.",
      "Sentinel lymph node mapping has replaced full lymphadenectomy, cutting lymphoedema without missing metastases.",
      "Lenvatinib plus pembrolizumab gives an 18-month median survival in pMMR disease after platinum, where PD-1 alone barely worked.",
      "HER2 IHC 3+ disease has an approved ADC (T-DXd) with an 85% response rate.",
      "Fertility-sparing hormonal therapy is an evidence-based option for the earliest tumours in young women.",
    ],
    history: [
      { year: 1971, title: "Progestins approved for advanced endometrial cancer", refs: ["megestrol-progestins"] },
      { year: 1983, title: "Bokhman's type I / type II model", note: "Oestrogen-driven low-grade versus non-hormonal high-grade tumours; superseded by molecular classes." },
      { year: 2009, title: "LAP2: laparoscopic hysterectomy equivalent to open surgery", refs: ["robotic-surgery"] },
      { year: 2010, title: "PORTEC-2: vaginal brachytherapy replaces pelvic radiation for intermediate risk", refs: ["brachytherapy"] },
      { year: 2013, title: "TCGA defines four molecular classes", note: "POLE-ultramutated, MSI-hypermutated, copy-number low, copy-number high (p53-abnormal).", refs: ["endometrial-molecular-classes"] },
      { year: 2017, title: "FIRES: sentinel node mapping validated; pembrolizumab approved for MSI-H tumours", refs: ["fires-sentor", "pembrolizumab", "msi"] },
      { year: 2018, title: "PORTEC-3: chemoradiation plus chemotherapy for high-risk disease", refs: ["portec-3"] },
      { year: 2019, title: "Lenvatinib + pembrolizumab accelerated approval (KEYNOTE-146)", refs: ["lenvatinib"] },
      { year: 2021, title: "KEYNOTE-775: lenvatinib + pembrolizumab OS benefit; dostarlimab approved for dMMR recurrence (GARNET); molecular classification enters ESGO guidelines", refs: ["keynote-775", "dostarlimab", "endometrial-molecular-classes"] },
      { year: 2023, title: "RUBY, NRG-GY018, DUO-E: chemo-immunotherapy first line", note: "Three trials in one year; dostarlimab approved for dMMR (July 2023).", refs: ["ruby", "nrg-gy018-keynote-868", "duo-e"] },
      { year: 2024, title: "All-comers approvals: pembrolizumab (June), dostarlimab (August), durvalumab dMMR (June); T-DXd tumour-agnostic HER2 approval; RUBY overall survival benefit", refs: ["pembrolizumab", "dostarlimab", "durvalumab", "trastuzumab-deruxtecan", "destiny-pantumor02"] },
      { year: 2025, title: "Rina-S Breakthrough designation in endometrial cancer", refs: ["rinatabart-sesutecan", "rainfol-01"] },
      { year: 2026, title: "Selinexor maintenance fails (XPORT-EC-042)", note: "Post-hoc TP53-wild-type subgroup hypothesis not confirmed.", refs: ["xport-ec-042", "selinexor"] },
    ],
    pipeline: ["rinatabart-sesutecan", "rainfol-01", "sacituzumab-tirumotecan", "puxitatug-samrotecan", "luveltamab-tazevibulin", "trastuzumab-deruxtecan", "idea-molecular-class-adjuvant-endometrial", "idea-her2-adc-serous-endometrial", "letrozole", "abemaciclib", "wee1", "mrd-testing"],
    openProblems: [
      "Equity: more p53-abnormal tumours and later diagnosis mean Black women in the US have nearly twice the mortality of white women; incidence and mortality are rising overall with obesity.",
      "p53-abnormal and carcinosarcoma histologies still relapse frequently despite chemoradiation; no subtype-specific therapy is approved beyond HER2.",
      "Immunotherapy benefit in pMMR disease is modest and biomarkers to select pMMR responders are lacking.",
      "Optimal adjuvant strategy by molecular class is unproven prospectively until RAINBO and PORTEC-4a report.",
      "Whether radiation adds to chemotherapy in stage III disease remains unresolved (PORTEC-3 vs GOG-258).",
      "Fertility-sparing therapy has a 30% relapse rate and no reliable predictor of response.",
      "Lenvatinib-pembrolizumab toxicity forces dose reductions in two-thirds of patients.",
    ],
    targets: ["tp53", "vegf", "pdl1", "kras"],
    technologies: ["fertility-sparing-endometrial", "sentinel-node", "brachytherapy", "mri", "germline-testing", "robotic-surgery"],
    terms: ["endometrial-molecular-classes", "tumour-agnostic"],
    companies: ["gsk", "merck", "astrazeneca", "eisai", "karyopharm", "genmab", "daiichi-sankyo"],
    institutions: ["nrg-oncology"],
    related: ["chemo-io-first-line-endometrial", "lenvatinib-plus-pembrolizumab", "io-plus-vegf"],
    tags: ["spike", "gyn"],
  },
};

export default spike;

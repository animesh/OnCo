import type { DrugInput, IdeaInput, PairingInput, TechnologyInput, TermInput, TrialInput } from "@/lib/schema";
import type { Spike } from "./index";

/**
 * Thyroid cancer spike: differentiated, medullary, and anaplastic thyroid cancer. Facts checked
 * 2026-09-07 against primary publications and regulatory notices linked in each record.
 */
const asOf = "2026-09-07";
const W = (s: string) => `https://en.wikipedia.org/wiki/${s}`;
const ct = (nct: string) => ({ label: `ClinicalTrials.gov ${nct}`, url: `https://clinicaltrials.gov/study/${nct}` });

type T = Omit<TrialInput, "kind" | "asOf">;
const t = (x: T): TrialInput => ({ kind: "trial", asOf, ...x });
type D = Omit<DrugInput, "kind" | "asOf">;
const d = (x: D): DrugInput => ({ kind: "drug", asOf, ...x });
type Tech = Omit<TechnologyInput, "kind" | "asOf">;
const tech = (x: Tech): TechnologyInput => ({ kind: "technology", asOf, ...x });
type Term = Omit<TermInput, "kind" | "asOf">;
const term = (x: Term): TermInput => ({ kind: "term", asOf, ...x });
type P = Omit<PairingInput, "kind" | "asOf">;
const pair = (x: P): PairingInput => ({ kind: "pairing", asOf, ...x });
type I = Omit<IdeaInput, "kind" | "asOf">;
const idea = (x: I): IdeaInput => ({ kind: "idea", asOf, ...x });

// ======================= TRIALS =======================
const trials: TrialInput[] = [
  t({ id: "select-lenvatinib", name: "SELECT", nct: "NCT01321554", phase: "3", status: "positive", yearReported: 2015, sponsor: "Eisai", enrolled: 392,
    setting: "Radioiodine-refractory differentiated thyroid cancer with progression: lenvatinib vs placebo",
    tldr: "Turned lenvatinib into the main drug for thyroid cancers that no longer take up radioactive iodine, quadrupling the time before the disease grew.",
    summary: "SELECT, trial NCT01321554 sponsored by Eisai and reported in 2015, turned lenvatinib into the main drug for differentiated thyroid cancers that no longer take up radioactive iodine, quadrupling the time before the disease grew. It randomised 392 patients with progressive radioiodine-refractory disease to lenvatinib or placebo, met its primary progression-free survival endpoint with a very large effect and a response rate near two-thirds against almost none on placebo, leading to FDA approval in February 2015; hypertension in about two-thirds and dose reductions in more than sixty percent drive management, and survival was confounded by crossover. OnCo links it to thyroid cancer, kinase inhibitors and anti-angiogenic therapy, VEGF and RET as targets, the radioiodine-refractory term and Martin Schlumberger. When to start a drug this toxic in a slow disease is the open question.",
    result: "PFS 18.3 vs 3.6 months; HR 0.21.",
    outcomes: [
      { endpoint: "Progression-free survival", primary: true, unit: "months", arms: [{ name: "Lenvatinib", value: 18.3 }, { name: "Placebo", value: 3.6 }], hr: 0.21, source: "https://www.nejm.org/doi/full/10.1056/NEJMoa1406470" },
      { endpoint: "Objective response rate", unit: "%", arms: [{ name: "Lenvatinib", value: 64.8 }, { name: "Placebo", value: 1.5 }], source: "https://www.nejm.org/doi/full/10.1056/NEJMoa1406470" },
    ],
    replication: "DECISION (sorafenib) showed the same direction with a smaller effect; class effect of VEGFR multikinase inhibitors is established.",
    targets: ["vegf", "ret"], cancers: ["thyroid"], technologies: ["kinase-inhibitors", "antiangiogenic"], terms: ["rai-refractory"],
    links: [ct("NCT01321554"), { label: "NEJM 2015", url: "https://www.nejm.org/doi/full/10.1056/NEJMoa1406470" }], people: ["martin-schlumberger"] }),
  t({ id: "decision-sorafenib", name: "DECISION", nct: "NCT00984282", phase: "3", status: "positive", yearReported: 2013, sponsor: "Bayer", enrolled: 417,
    setting: "Radioiodine-refractory differentiated thyroid cancer: sorafenib vs placebo",
    tldr: "The first drug approved for thyroid cancers that stopped responding to radioactive iodine.",
    summary: "DECISION, trial NCT00984282 sponsored by Bayer and reported in 2013, produced the first drug approved for differentiated thyroid cancers that stopped responding to radioactive iodine. It randomised 417 patients to sorafenib or placebo and met its primary progression-free survival endpoint, leading to FDA approval in November 2013, with hand-foot skin reaction and fatigue common. OnCo links it to thyroid cancer, kinase inhibitors, VEGF and BRAF as targets, the radioiodine-refractory term and Marcia S. Brose, and SELECT confirmed the class effect with a larger benefit for lenvatinib. Sorafenib has been largely displaced by lenvatinib but is still used, and whether it retains a niche in patients who cannot tolerate lenvatinib is the open question.",
    result: "PFS 10.8 vs 5.8 months; HR 0.59.",
    outcomes: [{ endpoint: "Progression-free survival", primary: true, unit: "months", arms: [{ name: "Sorafenib", value: 10.8 }, { name: "Placebo", value: 5.8 }], hr: 0.59, source: "https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(14)60421-9/fulltext" }],
    replication: "SELECT confirmed the class effect with a larger benefit.",
    targets: ["vegf", "braf"], cancers: ["thyroid"], technologies: ["kinase-inhibitors"], terms: ["rai-refractory"],
    links: [ct("NCT00984282"), { label: "Lancet 2014", url: "https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(14)60421-9/fulltext" }], people: ["marcia-brose"] }),
  t({ id: "libretto-531", name: "LIBRETTO-531", nct: "NCT04211337", phase: "3", status: "positive", yearReported: 2023, sponsor: "Eli Lilly", enrolled: 291,
    setting: "Untreated progressive RET-mutant medullary thyroid cancer: selpercatinib vs cabozantinib or vandetanib",
    tldr: "Showed that a drug built specifically for the RET mutation beats the older multi-target pills in medullary thyroid cancer, with far fewer side effects.",
    summary: "LIBRETTO-531, trial NCT04211337 sponsored by Eli Lilly and reported in 2023, showed that a drug built specifically for the RET mutation beats the older multi-target tablets in untreated progressive RET-mutant medullary thyroid cancer, with far fewer side effects. It randomised 291 patients to selpercatinib or cabozantinib or vandetanib, met its primary progression-free survival endpoint with a large effect, improved treatment failure-free survival and roughly halved the rate of severe adverse events, the first randomised proof that RET-selective therapy should be first line. OnCo links it to thyroid cancer and multiple endocrine neoplasia syndromes, kinase inhibitors, RET as a target, selpercatinib, vandetanib, LIBRETTO-431 and Lori J. Wirth. Whether resistance to selective RET inhibition can be met by next-generation drugs is the open question.",
    result: "PFS HR 0.28; 12-month PFS 86.8% vs 65.7%.",
    outcomes: [
      { endpoint: "Progression-free survival at 12 months", primary: true, unit: "%", arms: [{ name: "Selpercatinib", value: 86.8 }, { name: "Cabozantinib or vandetanib", value: 65.7 }], hr: 0.28, source: "https://www.nejm.org/doi/full/10.1056/NEJMoa2309719" },
    ],
    replication: "Consistent with single-arm LIBRETTO-001 and with pralsetinib (ARROW) activity in RET-mutant MTC.",
    drugs: ["selpercatinib"], targets: ["ret"], cancers: ["thyroid"], technologies: ["kinase-inhibitors"], trials: ["libretto-431"],
    links: [ct("NCT04211337"), { label: "NEJM 2023", url: "https://www.nejm.org/doi/full/10.1056/NEJMoa2309719" }], people: ["lori-wirth"] }),
  t({ id: "arrow-thyroid", name: "ARROW (thyroid cohorts)", nct: "NCT03037385", phase: "1/2", status: "positive", yearReported: 2021, sponsor: "Blueprint Medicines",
    setting: "RET-mutant medullary and RET-fusion thyroid cancer: pralsetinib",
    tldr: "ARROW is the single-arm study behind the second RET inhibitor's thyroid approvals.",
    summary: "ORR 71% in treatment-naive RET-mutant MTC and 60% after prior cabozantinib/vandetanib; 89% in RET-fusion thyroid cancer. Accelerated approval December 2020; the MTC indication was later withdrawn in the US (2023) when the confirmatory trial was not pursued, leaving selpercatinib as the RET-selective option for MTC.",
    result: "ORR 71% (naive MTC), 89% (RET-fusion thyroid).",
    outcomes: [{ endpoint: "Objective response rate, treatment-naive RET-mutant MTC", unit: "%", arms: [{ name: "Pralsetinib", value: 71 }], source: "https://www.thelancet.com/journals/landia/article/PIIS2213-8587(21)00120-0/fulltext" }],
    replication: "LIBRETTO-001/531 with selpercatinib show the same RET-selective effect.",
    drugs: ["pralsetinib"], targets: ["ret"], cancers: ["thyroid"], technologies: ["kinase-inhibitors"],
    links: [ct("NCT03037385"), { label: "Lancet Diabetes & Endocrinology 2021", url: "https://www.thelancet.com/journals/landia/article/PIIS2213-8587(21)00120-0/fulltext" }] }),
  t({ id: "estimabl2", name: "ESTIMABL2", nct: "NCT01837745", phase: "3", status: "positive", yearReported: 2022, sponsor: "Gustave Roussy / French Endocrine Tumour Group", enrolled: 776,
    setting: "Low-risk differentiated thyroid cancer (pT1a-T1b N0/Nx) after total thyroidectomy: no radioiodine vs 1.1 GBq ablation",
    tldr: "Proved that most people with small, low-risk thyroid cancers can skip radioactive iodine after surgery without any increase in recurrence.",
    summary: "ESTIMABL2, trial NCT01837745 sponsored by Gustave Roussy and the French Endocrine Tumour Group and reported in 2022, proved that most people with small, low-risk differentiated thyroid cancers can skip radioactive iodine after total thyroidectomy without any increase in recurrence. It randomised 776 patients with pT1a to T1b, node-negative tumours to no radioiodine or 1.1 GBq ablation and met its non-inferiority endpoint on event-free status at three years, confirmed at five years in 2024. OnCo links it to thyroid cancer, radioiodine therapy, radioactive iodine, the low-risk thyroid cancer term, Gustave Roussy and Martin Schlumberger, and together with IoN and HiLo it removed radioiodine from routine low-risk care in ATA and ESMO guidance; the UK IoN trial reached the same conclusion. Whether the same holds for larger low-risk tumours, as IoN suggested for pT2, is the remaining question.",
    result: "3-year event-free 95.6% vs 95.9% (non-inferior).",
    outcomes: [{ endpoint: "Patients without events at 3 years", primary: true, unit: "%", arms: [{ name: "No radioiodine", value: 95.6 }, { name: "Radioiodine 1.1 GBq", value: 95.9 }], source: "https://www.nejm.org/doi/full/10.1056/NEJMoa2111953" }],
    replication: "IoN (UK, Lancet 2025) reached the same conclusion in a pooled analysis.",
    technologies: ["radioiodine-therapy"], cancers: ["thyroid"], institutions: ["gustave-roussy"], terms: ["low-risk-dtc"],
    links: [ct("NCT01837745"), { label: "NEJM 2022", url: "https://www.nejm.org/doi/full/10.1056/NEJMoa2111953" }, { label: "5-year follow-up", url: "https://www.thelancet.com/journals/landia/article/PIIS2213-8587(24)00276-6/fulltext" }], people: ["martin-schlumberger"] }),
  t({ id: "ion-trial", name: "IoN", nct: "NCT01398085", phase: "2/3", status: "positive", yearReported: 2025, sponsor: "Cancer Research UK / UCL", enrolled: 504,
    setting: "Low-risk differentiated thyroid cancer (pT1-T2, N0/Nx, no adverse features) after thyroidectomy: no radioiodine vs radioiodine ablation",
    tldr: "The UK trial confirming that low-risk thyroid cancer patients can safely avoid radioactive iodine, published in 2025.",
    summary: "IoN, trial NCT01398085 sponsored by Cancer Research UK and UCL and published in the Lancet in 2025, is the UK trial confirming that low-risk differentiated thyroid cancer patients can safely avoid radioactive iodine after thyroidectomy. It randomised 504 patients with pT1 to T2, node-negative tumours without adverse features to no radioiodine or radioiodine ablation and met its non-inferiority endpoint on recurrence-free status at five years, extending the ESTIMABL2 finding to pT2 tumours. OnCo links it to thyroid cancer, radioiodine therapy, radioactive iodine, the low-risk thyroid cancer term and Cancer Research UK, and it replicates ESTIMABL2. Guideline bodies now recommend against routine ablation in this group, and whether patients and clinicians accept doing less is the practical question that remains.",
    result: "5-year recurrence-free ~98% (no RAI) vs ~96% (RAI).",
    outcomes: [{ endpoint: "Recurrence-free at 5 years", primary: true, unit: "%", arms: [{ name: "No radioiodine", value: 98 }, { name: "Radioiodine", value: 96 }], source: "https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(25)00629-4/fulltext" }],
    replication: "Replicates ESTIMABL2.",
    technologies: ["radioiodine-therapy"], cancers: ["thyroid"], institutions: ["cruk"], terms: ["low-risk-dtc"],
    links: [ct("NCT01398085"), { label: "Lancet 2025", url: "https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(25)00629-4/fulltext" }] }),
  t({ id: "hilo", name: "HiLo", nct: "NCT00415233", phase: "3", status: "positive", yearReported: 2012, sponsor: "Cancer Research UK", enrolled: 438,
    setting: "Differentiated thyroid cancer needing ablation: low-dose (1.1 GBq) vs high-dose (3.7 GBq) radioiodine, with recombinant TSH or thyroid hormone withdrawal",
    tldr: "Showed a third of the usual radioactive iodine dose ablates the thyroid remnant just as well, with fewer side effects and less time in isolation.",
    summary: "HiLo, trial NCT00415233 sponsored by Cancer Research UK and reported in 2012, showed that a third of the usual radioactive iodine dose ablates the thyroid remnant just as well as the high dose in differentiated thyroid cancer, with fewer side effects and less time in isolation. It randomised 438 patients needing ablation to 1.1 GBq or 3.7 GBq of radioiodine, with recombinant TSH or thyroid hormone withdrawal, and met its non-inferiority endpoint on successful ablation, while recombinant TSH avoided hypothyroid symptoms. OnCo links it to thyroid cancer, radioiodine therapy, radioactive iodine and Cancer Research UK, and the French ESTIMABL1 trial replicated low-dose non-inferiority at the same time. Low-dose ablation became standard for intermediate-risk disease and the trial paved the way to omitting ablation altogether in low-risk disease, as ESTIMABL2 and IoN then showed.",
    result: "Ablation success 85.0% (1.1 GBq) vs 88.9% (3.7 GBq), non-inferior.",
    outcomes: [{ endpoint: "Successful ablation", primary: true, unit: "%", arms: [{ name: "1.1 GBq", value: 85.0 }, { name: "3.7 GBq", value: 88.9 }], source: "https://www.nejm.org/doi/full/10.1056/NEJMoa1109589" }],
    replication: "ESTIMABL1 (France) replicated low-dose non-inferiority simultaneously.",
    technologies: ["radioiodine-therapy"], cancers: ["thyroid"], institutions: ["cruk"],
    links: [ct("NCT00415233"), { label: "NEJM 2012", url: "https://www.nejm.org/doi/full/10.1056/NEJMoa1109589" }] }),
  t({ id: "roar-atc", name: "ROAR (anaplastic thyroid cancer cohort)", nct: "NCT02034110", phase: "2", status: "positive", yearReported: 2018, sponsor: "Novartis", enrolled: 36,
    setting: "BRAF V600E-mutant anaplastic thyroid cancer: dabrafenib + trametinib",
    tldr: "Turned the most lethal thyroid cancer from a months-long death sentence into a treatable disease for the third of patients whose tumours carry a BRAF mutation.",
    summary: "ROAR, trial NCT02034110 sponsored by Novartis, is the phase 2 basket study whose anaplastic thyroid cancer cohort turned the most lethal thyroid cancer from a months-long death sentence into a treatable disease for the roughly third of patients whose tumours carry a BRAF V600E mutation. In 36 patients treated with dabrafenib plus trametinib the objective response rate was 56 percent, with survival far beyond historical expectations in the 2022 update in Annals of Oncology, leading to FDA approval in May 2018 as the first targeted therapy for the disease; neoadjuvant use now enables surgery in previously unresectable tumours. OnCo links it to thyroid cancer, BRAF as a target, the dabrafenib plus trametinib record, MD Anderson, Maria E. Cabanillas and the pairing of BRAF and MEK inhibition before surgery. Whether adding PD-1 blockade should become standard is the open question.",
    result: "ORR 56%; median OS 15 months.",
    outcomes: [{ endpoint: "Objective response rate", primary: true, unit: "%", arms: [{ name: "Dabrafenib + trametinib", n: 36, value: 56 }], source: "https://www.sciencedirect.com/science/article/pii/S0923753422000059" }],
    replication: "Consistent with MD Anderson real-world series of neoadjuvant BRAF/MEK in ATC.",
    drugs: ["dabrafenib-trametinib"], targets: ["braf"], cancers: ["thyroid"], technologies: ["kinase-inhibitors"], institutions: ["md-anderson"],
    links: [ct("NCT02034110"), { label: "Updated analysis, Annals of Oncology 2022", url: "https://www.sciencedirect.com/science/article/pii/S0923753422000059" }], people: ["maria-cabanillas"] }),
  t({ id: "astra", name: "ASTRA", nct: "NCT01843062", phase: "3", status: "negative", yearReported: 2019, sponsor: "AstraZeneca", enrolled: 401,
    setting: "High-risk differentiated thyroid cancer: selumetinib + adjuvant radioiodine vs placebo + radioiodine",
    tldr: "Adding a MEK inhibitor to boost iodine uptake before ablation did not improve complete remission rates, cooling the 'redifferentiation for everyone' idea.",
    summary: "ASTRA, trial NCT01843062 sponsored by AstraZeneca and reported in 2019, found that adding the MEK inhibitor selumetinib to boost iodine uptake before adjuvant radioiodine in high-risk differentiated thyroid cancer did not improve complete remission rates, cooling the idea of redifferentiation for everyone. It randomised 401 patients to selumetinib or placebo with radioiodine and found no difference in complete remission at eighteen months. OnCo links it to thyroid cancer, radioiodine therapy, kinase inhibitors, the MAPK pathway and the pairing of MAPK inhibitor redifferentiation followed by radioiodine. Redifferentiation remains reserved for selected radioiodine-refractory patients, where small series show MEK or BRAF and MEK inhibitors restore uptake in about half, and whether that selected use can be proved in a randomised trial is the open question.",
    result: "Complete remission 40% vs 38.5%; not significant.",
    outcomes: [{ endpoint: "Complete remission at 18 months", primary: true, unit: "%", arms: [{ name: "Selumetinib + RAI", value: 40 }, { name: "Placebo + RAI", value: 38.5 }], source: "https://ascopubs.org/doi/10.1200/JCO.21.00714" }],
    replication: "Small redifferentiation series remain positive in refractory patients; the adjuvant setting was negative.",
    technologies: ["radioiodine-therapy", "kinase-inhibitors"], cancers: ["thyroid"], pathways: ["ras-mapk"], tags: ["failure", "lesson:adjuvant-vs-active-disease"],
    links: [ct("NCT01843062"), { label: "JCO 2022", url: "https://ascopubs.org/doi/10.1200/JCO.21.00714" }] }),
];

// ======================= DRUGS =======================
const drugs: DrugInput[] = [
  d({ id: "radioactive-iodine", links: [{ label: "FDA label (DailyMed)", url: "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=Radioactive%20iodine" }], name: "Radioactive iodine (I-131)", brand: "Sodium iodide I-131", modality: "Radiopharmaceutical (beta/gamma emitter, natural uptake)", status: "approved", wikipedia: W("Iodine-131"),
    tldr: "The original targeted radiotherapy: thyroid cells soak up iodine, so radioactive iodine destroys leftover thyroid tissue and metastases while sparing everything else.",
    summary: "In use since 1946 for differentiated thyroid cancer; the archetype of theranostics (I-123 or I-131 scans image the same uptake). Roles: remnant ablation after thyroidectomy (now omitted in low-risk disease after ESTIMABL2, IoN, HiLo), adjuvant treatment of intermediate/high-risk disease, and treatment of iodine-avid metastases. Given after TSH stimulation (withdrawal or recombinant TSH). Salivary damage, secondary malignancy at high cumulative doses, and refractoriness in dedifferentiated tumours are the limits.",
    mechanism: "Sodium-iodide symporter (NIS) concentrates iodide in thyroid follicular cells; I-131 beta particles (mean path ~0.8 mm) irradiate the cell and neighbours; gamma emission enables imaging.",
    mechanismSteps: ["TSH stimulation upregulates the sodium-iodide symporter on thyroid cells", "Oral I-131 is absorbed and concentrated in thyroid tissue and iodine-avid metastases", "Beta decay deposits radiation within ~1 mm, killing the cells over weeks", "Gamma emission allows a post-therapy scan to map uptake"],
    dosing: { route: "Oral capsule or solution", schedule: "1.1 GBq (30 mCi) for remnant ablation (HiLo); 3.7-7.4 GBq for adjuvant or metastatic treatment; low-iodine diet and TSH stimulation beforehand", monitoring: "Post-therapy whole-body scan; thyroglobulin; salivary and marrow function", source: "https://www.thyroid.org/professionals/ata-professional-guidelines/" },
    toxicity: [{ event: "Sialadenitis / xerostomia", note: "Dose-dependent; common after repeated high-activity treatment", source: "https://www.thyroid.org/professionals/ata-professional-guidelines/" }],
    approvals: [{ region: "US", year: 1951, indication: "Hyperthyroidism and thyroid carcinoma (first radiopharmaceutical approval)" }],
    regulatoryEvents: [{ date: "1946", type: "approval", region: "US", note: "First therapeutic use in thyroid cancer (Seidlin); formal approval followed" }],
    targets: ["sstr2"], technologies: ["radioiodine-therapy", "radioligand-therapy"], cancers: ["thyroid"], trials: ["hilo", "estimabl2", "ion-trial"], terms: ["theranostics", "rai-refractory", "low-risk-dtc", "radioiodine-term"] }),
  d({ id: "vandetanib", links: [{ label: "FDA label (DailyMed)", url: "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=Vandetanib" }], name: "Vandetanib", brand: "Caprelsa", modality: "Small-molecule kinase inhibitor (RET, VEGFR, EGFR)", status: "approved", wikipedia: W("Vandetanib"),
    tldr: "Vandetanib was the first drug approved for medullary thyroid cancer (2011), now largely replaced by RET-selective selpercatinib.",
    summary: "Vandetanib is a multi-kinase inhibitor of RET, VEGFR2 and EGFR, given at 300 mg once daily. It was the first drug approved for medullary thyroid cancer (April 2011), for symptomatic or progressive disease, after the ZETA trial showed a PFS hazard ratio of 0.46 versus placebo. Approval came with a REMS programme because QT prolongation requires ECG and electrolyte monitoring. LIBRETTO-531 then showed the RET-selective selpercatinib was superior first line to vandetanib or cabozantinib (PFS HR 0.28, 12-month PFS 86.8% versus 65.7%) with fewer grade 3 or higher adverse events (52.8% versus 76.4%), so vandetanib is now largely replaced. Its remaining role is in patients who cannot access or tolerate selective RET inhibitors. For a newcomer, it is the original medullary thyroid cancer pill, superseded by a drug built specifically for RET.",
    mechanism: "Multikinase inhibitor of RET, VEGFR2, and EGFR.",
    mechanismSteps: ["Blocks RET kinase, the driver in hereditary and most sporadic MTC", "Blocks VEGFR2, reducing tumour blood supply", "Off-target EGFR and hERG inhibition cause rash, diarrhoea, and QT prolongation"],
    dosing: { route: "Oral", schedule: "300 mg once daily", monitoring: "ECG and electrolytes (QT prolongation REMS)", source: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2022/022405s015lbl.pdf" },
    approvals: [{ region: "US", year: 2011, indication: "Symptomatic or progressive medullary thyroid cancer" }],
    regulatoryEvents: [{ date: "2011-04-06", type: "approval", region: "US", note: "First approval for medullary thyroid cancer" }],
    targets: ["ret", "vegf", "egfr"], technologies: ["kinase-inhibitors"], companies: ["sanofi"], cancers: ["thyroid", "medullary-thyroid-cancer"], trials: ["libretto-531"] }),
];

// ======================= TECHNOLOGIES =======================
const technologies: TechnologyInput[] = [
  tech({ id: "radioiodine-therapy", name: "Radioiodine therapy and whole-body iodine scanning", sections: ["radiopharma", "radiation"], status: "standard-of-care", since: 1946, wikipedia: W("Isotopes_of_iodine#Iodine-131"),
    tldr: "Using the thyroid's natural appetite for iodine to image and treat thyroid cancer with a radioactive form of it. The oldest theranostic, and now used more selectively than it was.",
    summary: "I-123 or low-activity I-131 scans map iodine-avid tissue; therapeutic I-131 ablates remnants or treats metastases. Randomised trials (HiLo, ESTIMABL1/2, IoN) have progressively reduced activity and then removed ablation for low-risk disease. Refractory disease (no uptake, or progression despite uptake) defines the population for kinase inhibitors; redifferentiation with MEK/BRAF inhibitors can restore uptake in selected patients.",
    principle: "Thyroid cells take up iodine through the sodium-iodide symporter after TSH stimulation; the beta emission treats, the gamma emission images.",
    strengths: ["Highly selective without any engineered targeting", "Cheap, oral, curative in iodine-avid metastatic disease"],
    limitations: ["Dedifferentiated tumours lose uptake", "Salivary toxicity; radiation precautions; second cancers at high cumulative activity"],
    cancers: ["thyroid", "papillary-thyroid-cancer", "follicular-thyroid-cancer"], drugs: ["radioactive-iodine"], technologies: ["radioligand-therapy", "spect"], terms: ["theranostics", "rai-refractory"], links: [{ label: "Wikipedia", url: W("Isotopes_of_iodine#Iodine-131") }] }),
  tech({ id: "thyroid-fna-molecular", links: [{ label: "Ali et al., The 2023 Bethesda System for Reporting Thyroid Cytopathology (Thyroid 2023)", url: "https://doi.org/10.1089/thy.2023.0141" }, { label: "Haugen et al., 2015 American Thyroid Association management guidelines for thyroid nodules and differentiated thyroid cancer (Thyroid 2016)", url: "https://doi.org/10.1089/thy.2015.0020" }], name: "Thyroid nodule FNA, Bethesda cytology & molecular classifiers", sections: ["diagnostics"], status: "standard-of-care",
    tldr: "Thyroid fine-needle aspiration takes a needle sample from a thyroid lump and grades it on a six-level scale; when the result is uncertain, a gene test on the same sample can often rule cancer out and avoid surgery.",
    summary: "Ultrasound-guided fine-needle aspiration reported by the Bethesda System (I-VI). Indeterminate categories (III-IV, ~20% of nodules) historically went to diagnostic lobectomy; molecular classifiers such as Afirma GSC (RNA expression, Veracyte) and ThyroSeq v3 (DNA/RNA NGS) have negative predictive values around 95-97%, halving unnecessary surgery. TI-RADS ultrasound scoring decides which nodules to biopsy at all.",
    principle: "Cytology is combined with gene-expression or mutation/fusion panels calibrated on surgical outcomes.",
    strengths: ["Avoids surgery for most benign indeterminate nodules", "Detects BRAF, RET, RAS, TERT for risk and therapy planning"],
    limitations: ["Cost; positive predictive value is moderate", "Overdiagnosis of indolent microcarcinoma remains the systemic problem"],
    cancers: ["thyroid"], technologies: ["ultrasound", "cgp", "rna-seq"], companies: ["veracyte"], terms: ["bethesda-category", "tert-promoter"] }),
  tech({ id: "active-surveillance-thyroid", links: [{ label: "Ito et al., Patient age is significantly related to the progression of papillary microcarcinoma under observation (Thyroid 2014)", url: "https://doi.org/10.1089/thy.2013.0367" }], name: "Active surveillance of papillary microcarcinoma", sections: ["surgery", "supportive-care"], status: "established",
    tldr: "Active surveillance watches papillary thyroid cancers of 1 cm or less with ultrasound every 6 to 12 months instead of operating, because about 90% stay stable over a decade and delayed surgery works as well when needed. It is not suitable for tumours next to the windpipe or the voice nerve, and uptake outside Japan and Korea is still low.",
    summary: "Pioneered at Kuma Hospital (Japan) and Memorial Sloan Kettering: for papillary microcarcinomas (≤1 cm) without nodal or extrathyroidal disease, ~90% remain stable over a decade and delayed surgery is equally effective when needed. Endorsed by ATA guidelines; uptake outside Japan and Korea is still low. Addresses the overdiagnosis epidemic caused by ultrasound screening (South Korea's incidence rose 15-fold with no change in mortality).",
    principle: "Serial ultrasound at 6-12-month intervals with surgery triggered by growth ≥3 mm or nodal metastasis.",
    strengths: ["Avoids lifelong thyroid hormone, voice and parathyroid injury for most", "Cost-saving"],
    limitations: ["Patient anxiety; requires reliable follow-up", "Not for tumours near the trachea or nerve"],
    cancers: ["thyroid"], technologies: ["ultrasound", "active-surveillance"], institutions: ["mskcc"] }),
];

// ======================= TERMS =======================
const terms: TermInput[] = [
  term({ id: "rai-refractory", links: [{ label: "ClinicalTrials.gov NCT01321554: SELECT", url: "https://clinicaltrials.gov/study/NCT01321554" }, { label: "ClinicalTrials.gov NCT00984282: DECISION", url: "https://clinicaltrials.gov/study/NCT00984282" }], wikipedia: W("Thyroid_cancer"), name: "Radioiodine-refractory (RAI-R) thyroid cancer", category: "Clinical",
    tldr: "Thyroid cancer that no longer takes up radioactive iodine, or keeps growing despite it. This is when kinase inhibitor pills come in.",
    summary: "Defined by absence of uptake on a diagnostic scan, progression within 12 months of treatment, or cumulative activity >22.2 GBq (600 mCi) without control. Affects ~5-15% of differentiated thyroid cancers, often with BRAF V600E or TERT promoter mutations. Median survival historically 3-5 years; lenvatinib, sorafenib, and genotype-directed drugs (RET, NTRK, BRAF) apply.", cancers: ["thyroid"], technologies: ["radioiodine-therapy"], trials: ["select-lenvatinib", "decision-sorafenib"] }),
  term({ id: "low-risk-dtc", wikipedia: W("Thyroid_cancer"), links: [{ label: "2015 ATA guidelines for thyroid nodules and differentiated thyroid cancer (Haugen et al., Thyroid 2016)", url: "https://doi.org/10.1089/thy.2015.0020" }], name: "Low-risk differentiated thyroid cancer (ATA risk)", category: "Clinical",
    tldr: "Small thyroid cancers confined to the gland with no spread. They are almost always cured by surgery alone and no longer need radioactive iodine.",
    summary: "Low-risk differentiated thyroid cancer, as defined by the ATA risk system, is intrathyroidal papillary or follicular cancer with no vascular invasion, no aggressive histology and at most five microscopic nodal metastases. Such cancers are almost always cured by surgery alone: the ESTIMABL2 and IoN trials showed that radioiodine ablation adds nothing, and lobectomy rather than total thyroidectomy is acceptable for tumours of 4 cm or less. Readers meet the category in the radioiodine therapy and active surveillance entries, on the radioactive iodine drug page and under TSH suppression, which is tailored to this risk level. It matters because it is the group most exposed to overtreatment, which is why the overdiagnosis bottleneck links here.", cancers: ["thyroid"], trials: ["estimabl2", "ion-trial"], technologies: ["radioiodine-therapy", "active-surveillance-thyroid"] }),
  term({ id: "bethesda-category", wikipedia: W("Bethesda_System_for_Reporting_Thyroid_Cytopathology"), links: [{ label: "The 2023 Bethesda System for Reporting Thyroid Cytopathology (Ali et al., Thyroid 2023)", url: "https://doi.org/10.1089/thy.2023.0141" }], name: "Bethesda category (thyroid cytology)", category: "Diagnostics",
    tldr: "The Bethesda category is a six-step scale, from 'not enough cells' to 'cancer', that pathologists use to report a thyroid needle biopsy.",
    summary: "The Bethesda category is the six-step scale that pathologists use to report a thyroid needle biopsy: I non-diagnostic, II benign, III atypia of undetermined significance, IV follicular neoplasm, V suspicious and VI malignant. Readers meet it in the entry on thyroid nodule fine-needle aspiration, Bethesda cytology and molecular classifiers, because categories III and IV are the indeterminate zone where molecular classifiers change management. The 2023 revision of the system harmonised the estimated risk of malignancy attached to each category. The category matters for overdiagnosis: how indeterminate nodules are handled decides how many are sent to surgery, which is why the overdiagnosis bottleneck links to it.", cancers: ["thyroid"], technologies: ["thyroid-fna-molecular"] }),
  term({ id: "tsh-suppression", links: [{ label: "Haugen et al., 2015 American Thyroid Association management guidelines for thyroid nodules and differentiated thyroid cancer (Thyroid 2016)", url: "https://doi.org/10.1089/thy.2015.0020" }], wikipedia: W("Thyroid-stimulating_hormone"), name: "TSH suppression", category: "Clinical",
    tldr: "Giving slightly more thyroid hormone than the body needs after thyroid cancer surgery, to switch off the pituitary signal that could feed leftover cancer cells.",
    summary: "TSH suppression is the practice of giving slightly more levothyroxine than the body needs after thyroid cancer surgery, so that TSH stays below the normal range and the pituitary signal that could feed leftover cancer cells is switched off. The degree of suppression is tailored to recurrence risk, with low-risk differentiated thyroid cancer needing the least. Long-term over-suppression causes bone loss and atrial fibrillation, so guidelines now recommend a normal-range TSH for low-risk patients after a few years. Readers meet the term on the thyroid cancer page, and it is linked from the survivorship bottleneck because it is a long-term treatment whose late effects are easily neglected.", cancers: ["thyroid"], terms: ["low-risk-dtc"] }),
  term({ id: "tert-promoter", links: [{ label: "Landa et al., Frequent somatic TERT promoter mutations in thyroid cancer (Journal of Clinical Endocrinology and Metabolism 2013)", url: "https://doi.org/10.1210/jc.2013-2383" }], wikipedia: W("Telomerase_reverse_transcriptase"), aka: ["TERT promoter mutations"], name: "TERT promoter mutation", category: "Genomics",
    tldr: "A mutation that keeps the cell's immortality enzyme switched on. In thyroid cancer, having it alongside BRAF marks the tumours most likely to spread and resist iodine.",
    summary: "TERT promoter mutations, chiefly C228T and C250T, keep the telomerase enzyme switched on and so remove one brake on replicative immortality. In thyroid cancer they occur in a minority of papillary cancers and in most anaplastic cancers, and their co-occurrence with BRAF V600E is synergistic for recurrence, distant metastasis and poor outcome, marking the tumours most likely to spread and resist radioiodine. The mutation is included in the ThyroSeq molecular classifier used on indeterminate thyroid nodules and is used for risk stratification. It is also a marker in melanoma, glioma and glioblastoma, and bladder and urothelial cancer. Readers meet it within the telomere maintenance pathway and the hallmark of enabling replicative immortality.", cancers: ["thyroid", "melanoma", "glioblastoma", "urothelial"], targets: ["braf"], technologies: ["thyroid-fna-molecular"] }),
];

// ======================= PAIRINGS =======================
const pairings: PairingInput[] = [
  pair({ id: "braf-mek-neoadjuvant-atc", links: [{ label: "ClinicalTrials.gov NCT02034110: ROAR (anaplastic thyroid cancer cohort)", url: "https://clinicaltrials.gov/study/NCT02034110" }], name: "BRAF/MEK inhibition → surgery in anaplastic thyroid cancer", a: "dabrafenib-trametinib", b: "surgery", pairingType: "sequence",
    tldr: "Shrink a BRAF-mutant anaplastic thyroid tumour with pills first, then remove what is left; some patients now survive years instead of months.",
    summary: "This sequence gives the BRAF/MEK inhibitor pair dabrafenib and trametinib, often with pembrolizumab, to shrink a BRAF-mutant anaplastic thyroid cancer before surgery, then removes what remains. Anaplastic thyroid cancer can double in weeks, whereas BRAF/MEK inhibition produces responses within days, buying time for definitive local therapy. The evidence is the anaplastic cohort of the phase 2 ROAR trial plus the MD Anderson institutional series, in which previously unresectable tumours became operable and responders lived far longer than the historical expectation; there is no randomised trial because the disease is so rare. Rapid BRAF testing at diagnosis is now standard so that eligible patients can start the pills immediately.",
    rationale: "ATC doubles in weeks; BRAF/MEK inhibition produces responses within days, buying time for definitive local therapy.",
    evidence: "Phase 2 ROAR plus institutional series; no randomised trial (rarity).",
    drugs: ["dabrafenib-trametinib"], cancers: ["thyroid"], trials: ["roar-atc"], targets: ["braf"], institutions: ["md-anderson"] }),
  pair({ id: "redifferentiation-rai", links: [{ label: "ClinicalTrials.gov NCT01843062: ASTRA", url: "https://clinicaltrials.gov/study/NCT01843062" }], name: "MAPK inhibitor redifferentiation → radioiodine", a: "kinase-inhibitors", b: "radioiodine-therapy", pairingType: "sequence",
    tldr: "A short course of a MEK or BRAF pill can coax iodine-resistant thyroid cancer into taking up iodine again, letting radioactive iodine work once more.",
    summary: "This sequence uses a short course of a small-molecule MAPK pathway inhibitor, such as selumetinib or dabrafenib with trametinib, to restore radioiodine uptake in radioiodine-refractory thyroid cancer, followed by treatment with radioactive iodine. MAPK signalling suppresses the sodium-iodide symporter, and blocking the pathway for four to six weeks re-expresses NIS, so the tumour takes up iodine again. Selumetinib, reported in NEJM in 2013, and later dabrafenib and trametinib restored uptake in a substantial share of refractory patients, especially those with RAS mutations, and durable responses followed in some; the evidence is multiple phase 2 series. The adjuvant version of the approach, tested in ASTRA, was negative, so redifferentiation is reserved for refractory disease.",
    rationale: "MAPK signalling suppresses the sodium-iodide symporter; blocking it for 4-6 weeks re-expresses NIS.",
    evidence: "Multiple phase 2 series; ASTRA negative in the adjuvant setting.",
    technologies: ["kinase-inhibitors", "radioiodine-therapy"], cancers: ["thyroid"], trials: ["astra"], drugs: ["radioactive-iodine", "dabrafenib-trametinib"], pathways: ["ras-mapk"], terms: ["rai-refractory"] }),
];

// ======================= IDEAS =======================
const ideas: IdeaInput[] = [
  idea({ id: "idea-thyroid-overdiagnosis-reversal", links: [{ label: "Ahn et al., Korea's thyroid cancer epidemic: screening and overdiagnosis (NEJM 2014)", url: "https://doi.org/10.1056/NEJMp1409841" }], name: "Ultrasound restraint and surveillance to reverse thyroid cancer overdiagnosis", maturity: "being-tested-at-scale",
    tldr: "Most thyroid cancers found today would never have hurt anyone. Screen less, watch small ones, and operate only when they grow.",
    summary: "The idea is that health systems can reverse thyroid cancer overdiagnosis by screening less with ultrasound, adopting TI-RADS thresholds for biopsy, and placing papillary cancers of 1 cm or less under active surveillance, operating only when they grow. Incidence has tripled in many countries since the 1990s while deaths stayed flat, autopsies find occult papillary cancer in many adults, and the Kuma Hospital and MSK cohorts show surveillance is safe. The hypothesis is that these policies can halve thyroidectomy rates without increasing thyroid cancer deaths; South Korea's screening-driven epidemic reversed once screening was discouraged. The test is registry comparison before and after policy change; the idea addresses the overdiagnosis bottleneck.",
    hypothesis: "Health systems adopting TI-RADS biopsy thresholds and active surveillance for ≤1 cm papillary cancers can halve thyroidectomy rates without increasing thyroid cancer mortality.",
    rationale: "Autopsy studies find occult papillary cancer in up to a third of adults; Kuma Hospital and MSK cohorts show safety of surveillance.",
    test: "Regional registry comparisons before and after policy change (South Korea already provides a natural experiment); prospective surveillance cohorts outside Asia.",
    technologies: ["active-surveillance-thyroid", "thyroid-fna-molecular", "ultrasound"], cancers: ["thyroid"] }),
  idea({ id: "idea-atc-triplet-io", links: [{ label: "ClinicalTrials.gov NCT02034110: ROAR (anaplastic thyroid cancer cohort)", url: "https://clinicaltrials.gov/study/NCT02034110" }], name: "BRAF/MEK plus PD-1 blockade as standard for BRAF-mutant anaplastic thyroid cancer", maturity: "early-clinical",
    tldr: "Add immunotherapy to the two targeted pills in the most aggressive thyroid cancer, because the combination has produced multi-year survivors in early series.",
    summary: "The idea is to make dabrafenib and trametinib plus pembrolizumab the standard first-line treatment for BRAF V600E-mutant anaplastic thyroid cancer. Anaplastic thyroid cancer is immunologically hot relative to differentiated cancers, with high PD-L1 expression and mutational burden, and targeted therapy induces rapid antigen release that checkpoint blockade can exploit. MD Anderson series of the triplet report multi-year survivors and longer overall survival than the doublet, building on the anaplastic cohort of the ROAR trial. The hypothesis is that adding pembrolizumab extends overall survival; given the rarity of the disease, the test is an international randomised phase 2 of doublet versus triplet with survival at one year as primary endpoint.",
    hypothesis: "Adding pembrolizumab to dabrafenib-trametinib extends OS in BRAF V600E ATC.",
    rationale: "Targeted therapy induces rapid immunogenic response and antigen release; ATC is immunologically hot relative to differentiated cancers.",
    test: "International randomised phase 2 (doublet vs triplet) given rarity, with OS at 12 months as primary endpoint.",
    drugs: ["dabrafenib-trametinib", "pembrolizumab"], cancers: ["thyroid"], trials: ["roar-atc"], targets: ["braf", "pd1"] }),
];

// ======================= SPIKE =======================
const spike: Spike = {
  cancerId: "thyroid",
  entities: [...trials, ...drugs, ...technologies, ...terms, ...pairings, ...ideas],
  patch: {
    summary: "Thyroid cancer is really several diseases. Differentiated thyroid cancer (papillary ~85%, follicular, oncocytic) arises from follicular cells, retains iodine uptake, and has a 10-year survival above 95%; its incidence has tripled in many countries because ultrasound finds tiny tumours that would never have caused harm. Medullary thyroid cancer comes from calcitonin-producing C cells, is driven by RET mutations (hereditary in MEN2), and does not take up iodine. Anaplastic thyroid cancer is rare, dedifferentiated, and historically progressed within months; BRAF/MEK inhibition and immunotherapy have started to change that.\n\nDifferentiated disease is treated by surgery, with radioactive iodine (the first theranostic, 1946) reserved for intermediate and high-risk patients after HiLo, ESTIMABL2, and IoN showed low-risk patients gain nothing from it; active surveillance is accepted for microcarcinomas, and lobectomy suffices for many. When cancer becomes radioiodine-refractory, lenvatinib (SELECT) and sorafenib (DECISION) extend progression-free survival, and genotype directs selective therapy: selpercatinib for RET fusions, larotrectinib for NTRK, dabrafenib-trametinib for BRAF. Medullary cancer moved from vandetanib and cabozantinib to RET-selective selpercatinib after LIBRETTO-531 (2023). Anaplastic cancer with BRAF V600E responds to dabrafenib-trametinib (ROAR), often enabling surgery, and triplets with pembrolizumab are producing multi-year survivors.\n\nThe field's biggest problems are the opposite of most cancers': over-detection and over-treatment of indolent disease, alongside the unsolved lethality of anaplastic and RAI-refractory disease, resistance to RET inhibitors (solvent-front mutations), and the toxicity of long-term multikinase therapy.",
    subtypes: ["Papillary (~85%; BRAF V600E ~50%, RET/PTC fusions, RAS)", "Follicular (RAS, PAX8-PPARG)", "Oncocytic (Hürthle cell)", "Poorly differentiated", "Anaplastic (BRAF V600E ~40%, TP53, TERT)", "Medullary (RET germline in MEN2 ~25%; somatic RET M918T)", "Papillary microcarcinoma (≤1 cm; surveillance candidate)", "Paediatric differentiated thyroid cancer (fusion-driven, often nodal, excellent survival)"],
    biomarkers: ["Thyroglobulin and anti-Tg antibodies (surveillance of differentiated cancer)", "Calcitonin and CEA (medullary)", "Germline RET (MEN2 screening, prophylactic thyroidectomy)", "Somatic RET fusion/mutation (selpercatinib)", "BRAF V600E (prognosis; anaplastic targeted therapy; redifferentiation)", "TERT promoter (aggressiveness)", "NTRK, ALK fusions (tumour-agnostic drugs)", "Bethesda cytology category and molecular classifier result", "Radioiodine avidity on diagnostic scan"],
    standardOfCare: [
      { setting: "Nodule work-up", approach: "Ultrasound with TI-RADS; FNA only for nodules meeting size/appearance thresholds; Bethesda reporting; molecular classifier (Afirma, ThyroSeq) for indeterminate results.", refs: ["thyroid-fna-molecular", "ultrasound", "bethesda-category"], guideline: { nccn: "2A", url: "https://www.nccn.org/guidelines/guidelines-detail?category=1&id=1470" } },
      { setting: "Papillary microcarcinoma (≤1 cm, no spread)", approach: "Active surveillance or lobectomy; total thyroidectomy and radioiodine not indicated.", refs: ["active-surveillance-thyroid", "idea-thyroid-overdiagnosis-reversal"], guideline: { nccn: "2A" } },
      { setting: "Low-risk differentiated (pT1-T2 N0)", approach: "Lobectomy or total thyroidectomy; no radioiodine ablation (ESTIMABL2, IoN); modest TSH suppression then normal-range TSH.", refs: ["estimabl2", "ion-trial", "low-risk-dtc", "tsh-suppression"], guideline: { nccn: "2A", esmoMcbs: undefined } },
      { setting: "Intermediate/high-risk differentiated", approach: "Total thyroidectomy with therapeutic node dissection; radioiodine (1.1-3.7 GBq adjuvant; higher for known metastases) after recombinant TSH; TSH suppression.", refs: ["radioactive-iodine", "radioiodine-therapy", "hilo"], guideline: { nccn: "2A" } },
      { setting: "Radioiodine-refractory, progressive", approach: "Genotype first: selpercatinib (RET fusion), larotrectinib/entrectinib (NTRK), dabrafenib-trametinib (BRAF V600E); otherwise lenvatinib (or sorafenib); consider MAPK-inhibitor redifferentiation to restore iodine uptake.", refs: ["select-lenvatinib", "decision-sorafenib", "selpercatinib", "redifferentiation-rai", "rai-refractory"], guideline: { nccn: "1 (lenvatinib)", esmoMcbs: "3" } },
      { setting: "Medullary, localised", approach: "Total thyroidectomy with central neck dissection; prophylactic thyroidectomy in RET germline carriers by codon-based age; calcitonin surveillance.", refs: ["ret", "germline-testing"], guideline: { nccn: "2A" } },
      { setting: "Medullary, advanced progressive RET-mutant", approach: "Selpercatinib first line (LIBRETTO-531); cabozantinib or vandetanib if RET-selective therapy unavailable or failed.", refs: ["libretto-531", "selpercatinib", "vandetanib"], guideline: { nccn: "1 (preferred)", esmoMcbs: "3" } },
      { setting: "Anaplastic, BRAF V600E", approach: "Rapid BRAF testing; dabrafenib-trametinib (ROAR), often with pembrolizumab, then surgery and radiation if rendered resectable.", refs: ["roar-atc", "dabrafenib-trametinib", "braf-mek-neoadjuvant-atc", "idea-atc-triplet-io"], guideline: { nccn: "2A" } },
      { setting: "Anaplastic, BRAF wild-type", approach: "Multimodal chemoradiation (paclitaxel-based) if feasible; lenvatinib; immunotherapy for PD-L1-high or TMB-high; NTRK/RET/ALK agents if fusion-positive; early palliative care.", refs: ["imrt-igrt", "pembrolizumab"] },
      { setting: "Survivorship", approach: "Lifelong levothyroxine with risk-adapted TSH targets; calcium/PTH monitoring after surgery; salivary care after radioiodine; low-risk patients can be discharged to primary care.", refs: ["tsh-suppression", "supportive-care"] },
    ],
    stateOfArt: [
      "De-escalation is the story: radioiodine omitted for low-risk disease (ESTIMABL2, IoN), low-dose ablation when needed (HiLo), lobectomy and active surveillance for small tumours.",
      "Genotype-directed therapy covers most aggressive disease: RET (selpercatinib beat multikinase inhibitors head to head), BRAF, NTRK, ALK.",
      "Anaplastic thyroid cancer with BRAF V600E has moved from a median survival under six months to 15 months with the doublet and longer with immunotherapy added, and neoadjuvant use enables surgery.",
      "Molecular classifiers on needle biopsies have halved diagnostic surgery for indeterminate nodules.",
      "Redifferentiation with MAPK inhibitors can restore radioiodine uptake in about half of refractory patients.",
    ],
    history: [
      { year: 1946, title: "First patient treated with radioactive iodine for metastatic thyroid cancer", note: "Seidlin, Marinelli, and Oshry: the first theranostic.", refs: ["radioactive-iodine", "radioiodine-therapy"] },
      { year: 1985, title: "RET proto-oncogene identified; MEN2 germline RET mutations follow (1993)", refs: ["ret"] },
      { year: 2003, title: "BRAF V600E found in ~45% of papillary thyroid cancers", refs: ["braf"] },
      { year: 2009, title: "Bethesda System for thyroid cytology standardises nodule reporting", refs: ["bethesda-category", "thyroid-fna-molecular"] },
      { year: 2011, title: "Vandetanib: first drug for medullary thyroid cancer", refs: ["vandetanib"] },
      { year: 2012, title: "HiLo and ESTIMABL1: low-dose radioiodine ablation is enough", refs: ["hilo"] },
      { year: 2013, title: "Sorafenib approved for RAI-refractory disease (DECISION); selumetinib redifferentiation proof of concept", refs: ["decision-sorafenib", "redifferentiation-rai"] },
      { year: 2015, title: "Lenvatinib approved (SELECT); ATA guidelines endorse active surveillance and less radioiodine", refs: ["select-lenvatinib", "active-surveillance-thyroid"] },
      { year: 2018, title: "Dabrafenib-trametinib approved for BRAF V600E anaplastic thyroid cancer (ROAR); larotrectinib tumour-agnostic", refs: ["roar-atc", "dabrafenib-trametinib", "ntrk"] },
      { year: 2020, title: "Selpercatinib and pralsetinib: RET-selective inhibitors approved", refs: ["selpercatinib", "pralsetinib", "arrow-thyroid"] },
      { year: 2022, title: "ESTIMABL2: no radioiodine for low-risk disease; ASTRA adjuvant redifferentiation negative", refs: ["estimabl2", "astra"] },
      { year: 2023, title: "LIBRETTO-531: selpercatinib beats cabozantinib/vandetanib in medullary cancer", refs: ["libretto-531"] },
      { year: 2025, title: "IoN confirms omission of radioiodine in low-risk disease (Lancet)", refs: ["ion-trial"] },
      { year: 2026, title: "Selpercatinib label update (July 2026)", refs: ["selpercatinib"] },
    ],
    pipeline: ["selpercatinib", "idea-atc-triplet-io", "braf-mek-neoadjuvant-atc", "redifferentiation-rai", "idea-thyroid-overdiagnosis-reversal", "thyroid-fna-molecular", "active-surveillance-thyroid", "pembrolizumab", "cthpv-dna", "targeted-alpha-therapy", "mrd-testing", "dermoscopy-ai"],
    openProblems: [
      "Overdiagnosis: incidence has tripled with no change in mortality; most detected cancers would never have caused harm, yet surveillance uptake outside Japan and Korea remains low.",
      "Anaplastic thyroid cancer without BRAF V600E (about 60%) still has a median survival of a few months.",
      "Resistance to RET-selective inhibitors via solvent-front (G810) mutations has no approved next-generation drug.",
      "Multikinase inhibitors for RAI-refractory disease cause hypertension, weight loss, and fatigue; most patients need dose reductions and quality of life suffers.",
      "No validated way to predict which low-risk patients will be the rare ones to recur, so follow-up intensity is uniform.",
      "Redifferentiation works in about half of refractory patients but predictors and optimal regimens are undefined.",
      "Paediatric and radiation-induced thyroid cancers (Chernobyl, Fukushima cohorts) have distinct fusion-driven biology that is under-studied.",
      "Hereditary MEN2 requires lifelong surveillance and prophylactic surgery in children; long-term outcomes of RET-selective therapy in this group are unknown.",
    ],
    targets: ["ret", "braf", "ntrk", "vegf", "pd1"],
    technologies: ["radioiodine-therapy", "thyroid-fna-molecular", "active-surveillance-thyroid", "kinase-inhibitors", "germline-testing", "ultrasound"],
    terms: ["rai-refractory", "low-risk-dtc", "bethesda-category", "tsh-suppression", "tert-promoter", "theranostics"],
    trials: ["select-lenvatinib", "decision-sorafenib", "libretto-531", "arrow-thyroid", "estimabl2", "ion-trial", "hilo", "roar-atc", "astra"],
    drugs: ["radioactive-iodine", "vandetanib", "selpercatinib", "pralsetinib", "dabrafenib-trametinib"],
    companies: ["eli-lilly", "bayer", "novartis", "sanofi", "veracyte", "astrazeneca"],
    institutions: ["gustave-roussy", "cruk", "md-anderson", "mskcc"],
    related: ["radiopharma-roadmap", "braf-mek-neoadjuvant-atc", "redifferentiation-rai", "theranostics"],
    tags: ["spike", "endocrine"],
  },
};

export default spike;

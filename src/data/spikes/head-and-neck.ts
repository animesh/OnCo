import type { DrugInput, IdeaInput, PairingInput, TechnologyInput, TermInput, TrialInput } from "@/lib/schema";
import type { Spike } from "./index";

/**
 * Head and neck squamous cell carcinoma spike (including nasopharyngeal carcinoma). Facts checked
 * 2026-09-07 against primary publications, FDA notices, and company releases linked in each record.
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
  t({ id: "keynote-048", name: "KEYNOTE-048", nct: "NCT02358031", phase: "3", status: "positive", yearReported: 2019, sponsor: "Merck", enrolled: 882,
    setting: "Untreated recurrent or metastatic HNSCC: pembrolizumab alone, pembrolizumab + platinum/5-FU, or cetuximab + platinum/5-FU (EXTREME)",
    tldr: "Made immunotherapy the first treatment for advanced head and neck cancer, alone for PD-L1-rich tumours and with chemotherapy for the rest.",
    summary: "Pembrolizumab monotherapy improved OS in CPS ≥20 (14.9 vs 10.7 months) and CPS ≥1 (12.3 vs 10.3); pembrolizumab-chemotherapy improved OS in the total population (13.0 vs 10.7). FDA approval June 2019. Five-year follow-up confirmed durable survival tails. Replaced the EXTREME regimen as first line after a decade.",
    result: "OS 14.9 vs 10.7 months (CPS ≥20, monotherapy); 13.0 vs 10.7 (all, with chemotherapy).",
    outcomes: [
      { endpoint: "Overall survival, CPS ≥20, pembrolizumab monotherapy", primary: true, unit: "months", arms: [{ name: "Pembrolizumab", value: 14.9 }, { name: "Cetuximab + chemotherapy", value: 10.7 }], hr: 0.61, source: "https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(19)32591-7/fulltext" },
      { endpoint: "Overall survival, total population, pembrolizumab + chemotherapy", primary: true, unit: "months", arms: [{ name: "Pembrolizumab + chemotherapy", value: 13.0 }, { name: "Cetuximab + chemotherapy", value: 10.7 }], hr: 0.77, source: "https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(19)32591-7/fulltext" },
    ],
    replication: "CheckMate 141 (nivolumab, second line) showed the same direction; KEYNOTE-040 was borderline. Class effect of PD-1 blockade in HNSCC is consistent.",
    drugs: ["pembrolizumab"], targets: ["pd1", "pdl1"], cancers: ["head-and-neck", "oropharyngeal-cancer", "laryngeal-cancer", "oral-cavity-cancer", "recurrent-metastatic-hnscc", "hypopharyngeal-cancer", "hpv-negative-head-and-neck-cancer"], terms: ["cps"], trials: ["extreme"],
    links: [ct("NCT02358031"), { label: "Lancet 2019", url: "https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(19)32591-7/fulltext" }], people: ["barbara-burtness"] }),
  t({ id: "keynote-689", name: "KEYNOTE-689", nct: "NCT03765918", phase: "3", status: "positive", yearReported: 2025, sponsor: "Merck", enrolled: 714,
    setting: "Resectable stage III-IVA HNSCC: neoadjuvant pembrolizumab, surgery, then adjuvant pembrolizumab with (chemo)radiation vs surgery and (chemo)radiation",
    tldr: "The first new treatment for curable head and neck cancer in six years: immunotherapy around surgery doubled the time patients stayed free of events.",
    summary: "Presented AACR April 2025; FDA approval 12 June 2025 for PD-L1 CPS ≥1. In the CPS ≥1 population (n=682), median EFS 59.7 vs 29.6 months. Major pathological response in ~10% of the neoadjuvant arm predicted excellent outcomes. First perioperative approval in HNSCC and the first HNSCC approval since 2019.",
    result: "Median EFS 59.7 vs 29.6 months (CPS ≥1).",
    outcomes: [
      { endpoint: "Event-free survival (CPS ≥1)", primary: true, unit: "months", arms: [{ name: "Perioperative pembrolizumab", n: 682, value: 59.7 }, { name: "Standard of care", value: 29.6 }], source: "https://www.merck.com/news/fda-approves-keytruda-pembrolizumab-for-pd-l1-resectable-locally-advanced-head-neck-squamous-cell-carcinoma-as-neoadjuvant-treatment-continued-as-adjuvant-treatment-combined-with-radiother/" },
    ],
    replication: "No second phase 3 yet; consistent with neoadjuvant IO benefits in melanoma and lung.",
    drugs: ["pembrolizumab"], targets: ["pd1"], cancers: ["head-and-neck", "hpv-negative-head-and-neck-cancer"], terms: ["neoadjuvant-adjuvant", "efs", "cps"], technologies: ["imrt-igrt"],
    links: [ct("NCT03765918"), { label: "FDA approval, Merck", url: "https://www.merck.com/news/fda-approves-keytruda-pembrolizumab-for-pd-l1-resectable-locally-advanced-head-neck-squamous-cell-carcinoma-as-neoadjuvant-treatment-continued-as-adjuvant-treatment-combined-with-radiother/" }], people: ["ravindra-uppaluri"] }),
  t({ id: "extreme", name: "EXTREME", nct: "NCT00122460", phase: "3", status: "positive", yearReported: 2008, sponsor: "Merck KGaA", enrolled: 442,
    setting: "Untreated recurrent or metastatic HNSCC: cetuximab + platinum/5-FU vs platinum/5-FU",
    tldr: "The regimen that defined first-line treatment for advanced head and neck cancer from 2008 until immunotherapy replaced it.",
    summary: "EXTREME, trial NCT00122460 sponsored by Merck KGaA and reported in 2008, produced the regimen that defined first-line treatment for recurrent or metastatic head and neck squamous cell carcinoma from 2008 until immunotherapy replaced it. It randomised 442 patients to cetuximab plus platinum and fluorouracil or chemotherapy alone and met its primary overall survival endpoint, the first survival gain in this setting in decades, and it became the control arm for KEYNOTE-048. OnCo links it to head and neck cancer, monoclonal antibodies, platinum agents, EGFR as a target, Jan B. Vermorken and KEYNOTE-048, and the docetaxel-based TPExtreme regimen matched it. Whether cetuximab retains any first-line role now that pembrolizumab-based regimens are standard is the open question.",
    result: "OS 10.1 vs 7.4 months; HR 0.80.",
    outcomes: [{ endpoint: "Overall survival", primary: true, unit: "months", arms: [{ name: "Cetuximab + chemotherapy", value: 10.1 }, { name: "Chemotherapy", value: 7.4 }], hr: 0.80, source: "https://www.nejm.org/doi/full/10.1056/NEJMoa0802656" }],
    replication: "TPExtreme (docetaxel-based) matched it; the regimen was robust until superseded.",
    targets: ["egfr"], cancers: ["head-and-neck", "recurrent-metastatic-hnscc"], technologies: ["monoclonal-antibody", "platinum"],
    links: [ct("NCT00122460"), { label: "NEJM 2008", url: "https://www.nejm.org/doi/full/10.1056/NEJMoa0802656" }], people: ["jan-vermorken"] }),
  t({ id: "checkmate-141", name: "CheckMate 141", nct: "NCT02105636", phase: "3", status: "positive", yearReported: 2016, sponsor: "BMS", enrolled: 361,
    setting: "Platinum-refractory recurrent or metastatic HNSCC: nivolumab vs investigator's choice (methotrexate, docetaxel, or cetuximab)",
    tldr: "The first immunotherapy to extend survival in head and neck cancer, in patients who had progressed on platinum within six months.",
    summary: "CheckMate 141, trial NCT02105636 sponsored by Bristol Myers Squibb and reported in 2016, was the first immunotherapy to extend survival in head and neck cancer, in patients whose disease had progressed on platinum within six months. It randomised 361 patients to nivolumab or investigator's choice of methotrexate, docetaxel or cetuximab, met its primary overall survival endpoint with a durable tail at two years, and preserved quality of life where chemotherapy worsened it, leading to FDA approval in November 2016. OnCo links it to head and neck squamous cell carcinoma, PD-1 as a target and nivolumab, and KEYNOTE-040 with pembrolizumab showed a concordant, borderline survival benefit. Whether the minority with durable benefit can be identified in advance remains the open question for second-line immunotherapy.",
    result: "OS 7.5 vs 5.1 months; HR 0.70.",
    outcomes: [{ endpoint: "Overall survival", primary: true, unit: "months", arms: [{ name: "Nivolumab", value: 7.5 }, { name: "Investigator's choice", value: 5.1 }], hr: 0.70, source: "https://www.nejm.org/doi/full/10.1056/NEJMoa1602252" }],
    replication: "KEYNOTE-040 (pembrolizumab) showed a concordant, borderline OS benefit.",
    drugs: ["nivolumab"], targets: ["pd1"], cancers: ["head-and-neck", "oropharyngeal-cancer", "oral-cavity-cancer", "recurrent-metastatic-hnscc"],
    links: [ct("NCT02105636"), { label: "NEJM 2016", url: "https://www.nejm.org/doi/full/10.1056/NEJMoa1602252" }] }),
  t({ id: "rtog-0129", name: "RTOG 0129 (HPV analysis)", nct: "NCT00047008", phase: "3", status: "completed", yearReported: 2010, sponsor: "RTOG / NCI", enrolled: 743,
    setting: "Stage III-IV oropharyngeal and other HNSCC: accelerated vs standard fractionation chemoradiation; retrospective HPV analysis",
    tldr: "The analysis that showed HPV-positive throat cancers are a different, far more curable disease, launching two decades of de-escalation research.",
    summary: "Ang et al., NEJM 2010: 3-year OS 82.4% for HPV-positive vs 57.1% for HPV-negative oropharyngeal cancer; HPV status was the strongest prognostic factor, with tobacco exposure modifying it. Led to a separate AJCC staging system for HPV-positive disease (8th edition) and the de-escalation trials that followed.",
    result: "3-year OS 82.4% (HPV+) vs 57.1% (HPV-).",
    outcomes: [{ endpoint: "Overall survival at 3 years by HPV status", unit: "%", arms: [{ name: "HPV-positive", value: 82.4 }, { name: "HPV-negative", value: 57.1 }], source: "https://www.nejm.org/doi/full/10.1056/NEJMoa0912217" }],
    replication: "Replicated across TROG, DAHANCA, and De-ESCALaTE cohorts.",
    cancers: ["head-and-neck", "hpv-positive-oropharyngeal-cancer"], technologies: ["imrt-igrt", "hpv-vaccine"], terms: ["hpv-p16"],
    links: [ct("NCT00047008"), { label: "NEJM 2010", url: "https://www.nejm.org/doi/full/10.1056/NEJMoa0912217" }], people: ["maura-gillison", "everett-vokes"] }),
  t({ id: "nrg-hn002-hn005", name: "NRG-HN002 & NRG-HN005 (HPV+ de-escalation)", nct: "NCT03952585", phase: "2/3", status: "mixed", yearReported: 2025, sponsor: "NRG Oncology / NCI",
    setting: "Low-risk HPV-positive oropharyngeal cancer: reduced-dose radiation (60 Gy) with or without cisplatin, or with nivolumab, vs standard 70 Gy chemoradiation",
    tldr: "Attempts to give HPV-positive throat cancer patients less radiation fell short: the standard dose remained better, so de-escalation is not yet routine.",
    summary: "HN002 (phase 2, 2021) found 60 Gy with weekly cisplatin met its acceptability threshold, but 60 Gy alone did not. HN005 (phase 2/3, presented 2025) was stopped after the de-intensified arms showed diminished progression-free survival while the 70 Gy control reached 2-year PFS of 98%. HPV status alone is an insufficient selector; ctHPV-DNA and imaging-response-adapted designs are the next approach.",
    result: "HN005: de-escalated arms had worse PFS; control 2-year PFS 98%.",
    replication: "Consistent with De-ESCALaTE and RTOG 1016, where replacing cisplatin with cetuximab also harmed outcomes.",
    cancers: ["head-and-neck", "oropharyngeal-cancer", "hpv-positive-oropharyngeal-cancer"], technologies: ["imrt-igrt"], terms: ["hpv-p16"], institutions: ["nrg-oncology"], tags: ["lesson:de-escalation-needs-better-selection"],
    links: [ct("NCT03952585"), { label: "NRG Oncology HN005 summary", url: "https://www.nrgoncology.org/Home/News/Post/treatment-de-intensification-for-early-stage-hpv-positive-oropharyngeal-cancer-nrg-hn005/" }], people: ["quynh-thu-le"] }),
  t({ id: "javelin-hn-100", name: "JAVELIN Head and Neck 100", nct: "NCT02952586", phase: "3", status: "negative", yearReported: 2020, sponsor: "Merck KGaA / Pfizer", enrolled: 697,
    setting: "Locally advanced HNSCC: avelumab + chemoradiation then avelumab maintenance vs chemoradiation",
    tldr: "Adding a PD-L1 blocker to curative chemoradiation did not help, the first of several such failures in head and neck cancer.",
    summary: "JAVELIN Head and Neck 100, trial NCT02952586 sponsored by Merck KGaA and Pfizer and reported in 2020, found that adding the PD-L1 antibody avelumab to curative chemoradiation for locally advanced head and neck cancer did not help, the first of several such failures. It randomised 697 patients to avelumab with chemoradiation followed by avelumab maintenance, or chemoradiation with placebo, and was stopped for futility with no improvement in progression-free survival. OnCo links it to head and neck cancer, modern external beam radiotherapy, immune checkpoint inhibitors, PD-L1 as a target and the pairing that places immunotherapy before surgery rather than with chemoradiation. Radiation-induced lymphopenia and steroid use are suspected to blunt the effect, which is why KEYNOTE-689 placed immunotherapy before surgery.",
    result: "PFS HR 1.21; futility.",
    replication: "KEYNOTE-412 replicated the negative result with pembrolizumab.",
    targets: ["pdl1"], cancers: ["head-and-neck", "hpv-negative-head-and-neck-cancer"], technologies: ["imrt-igrt", "checkpoint-inhibitor"], tags: ["failure", "lesson:concurrent-io-with-chemoradiation"],
    links: [ct("NCT02952586"), { label: "Lancet Oncology 2021", url: "https://www.thelancet.com/journals/lanonc/article/PIIS1470-2045(20)30737-3/fulltext" }] }),
  t({ id: "trilynx", name: "TrilynX", nct: "NCT04459715", phase: "3", status: "negative", yearReported: 2024, sponsor: "Merck KGaA (Debiopharm licence)", enrolled: 730,
    setting: "Unresected locally advanced HNSCC: xevinapant + cisplatin chemoradiation vs placebo + chemoradiation",
    tldr: "TrilynX tested xevinapant, a drug meant to make tumours more sensitive to radiation, with cisplatin chemoradiation in 730 patients with locally advanced head and neck cancer. Despite a striking phase 2 result, the phase 3 was stopped for futility in 2024 with worse outcomes on xevinapant, a reminder that early wins in this disease often do not replicate.",
    summary: "TrilynX, trial NCT04459715 sponsored by Merck KGaA under licence from Debiopharm and reported in 2024, tested xevinapant, a drug meant to sensitise tumours to radiation, with cisplatin chemoradiation in unresected locally advanced head and neck cancer, and it made things worse. It randomised 730 patients and was terminated on 24 June 2024 for futility at an interim analysis, with shorter event-free survival on xevinapant than placebo, attributed partly to toxicity and treatment interruptions, after a phase 2 with a striking survival benefit; development of xevinapant was discontinued and a second phase 3, X-Ray Vision, was stopped. OnCo links it to head and neck cancer, modern external beam radiotherapy and Debiopharm. It is a reminder that early wins in this disease often do not replicate, and why a promising phase 2 reversed so completely is the open question.",
    result: "EFS 19.4 vs 33.1 months (worse with xevinapant).",
    outcomes: [{ endpoint: "Event-free survival", primary: true, unit: "months", arms: [{ name: "Xevinapant + CRT", value: 19.4 }, { name: "Placebo + CRT", value: 33.1 }], source: "https://ascopubs.org/doi/10.1200/JCO-25-00272" }],
    replication: "The phase 2 result was not reproduced; a second phase 3 (X-Ray Vision) was stopped.",
    cancers: ["head-and-neck", "hpv-negative-head-and-neck-cancer"], technologies: ["imrt-igrt"], companies: ["debiopharm"], tags: ["failure", "lesson:phase-2-to-3-attrition"],
    links: [ct("NCT04459715"), { label: "JCO 2025", url: "https://ascopubs.org/doi/10.1200/JCO-25-00272" }] }),
  t({ id: "jupiter-02", name: "JUPITER-02", nct: "NCT03581786", phase: "3", status: "positive", yearReported: 2021, sponsor: "Junshi / Coherus", enrolled: 289,
    setting: "Untreated recurrent or metastatic nasopharyngeal carcinoma: toripalimab + gemcitabine-cisplatin vs chemotherapy",
    tldr: "Brought immunotherapy to nasopharyngeal cancer, an Epstein-Barr-virus-driven cancer common in southern China, and won the first US approval for that disease.",
    summary: "JUPITER-02, trial NCT03581786 sponsored by Junshi and Coherus and reported in 2021, brought immunotherapy to nasopharyngeal carcinoma, an Epstein-Barr-virus-driven cancer common in southern China, and won the first US approval for that disease. It randomised 289 patients with untreated recurrent or metastatic disease to toripalimab or placebo with gemcitabine and cisplatin, met its primary progression-free survival endpoint with a large effect, and confirmed an overall survival benefit with six-year follow-up showing sustained separation, leading to FDA approval on 27 October 2023 and EU approval after. OnCo links it to head and neck cancer, PD-1 as a target, toripalimab, Sun Yat-sen University Cancer Center, Jun Ma and Shanghai Junshi Biosciences. Whether plasma EBV DNA can guide who needs the immunotherapy is the open question.",
    result: "PFS HR 0.52; OS HR 0.63.",
    outcomes: [{ endpoint: "Progression-free survival", primary: true, arms: [{ name: "Toripalimab + chemotherapy" }, { name: "Chemotherapy" }], hr: 0.52, source: "https://www.onclive.com/view/toripalimab-plus-chemo-maintains-survival-benefit-after-6-years-in-recurrent-metastatic-npc" }],
    replication: "CAPTAIN-1st and RATIONALE-309 independently confirmed PD-1 plus chemotherapy in NPC.",
    drugs: ["toripalimab"], targets: ["pd1"], cancers: ["head-and-neck", "nasopharyngeal"], institutions: ["sysucc"], trials: ["captain-1st"],
    links: [ct("NCT03581786"), { label: "6-year update, OncLive", url: "https://www.onclive.com/view/toripalimab-plus-chemo-maintains-survival-benefit-after-6-years-in-recurrent-metastatic-npc" }], people: ["ma-jun"] }),
  t({ id: "liger-hn1", name: "LiGeR-HN1", nct: "NCT06525220", phase: "3", status: "recruiting", sponsor: "Merus (Genmab)",
    setting: "Untreated PD-L1-positive recurrent or metastatic HNSCC: petosemtamab + pembrolizumab vs pembrolizumab",
    tldr: "Tests whether a two-armed antibody against EGFR and a stem-cell marker can lift first-line immunotherapy results in head and neck cancer.",
    summary: "Phase 2 petosemtamab + pembrolizumab reported ORR ~63% in first-line PD-L1-positive HNSCC (ASCO 2025), far above pembrolizumab's historical ~19-23%. LiGeR-HN1 (first line, includes HPV-positive disease) and LiGeR-HN2 (second line, monotherapy vs chemotherapy) are the registrational trials; interim analyses expected 2026-27.",
    drugs: ["petosemtamab", "pembrolizumab"], targets: ["egfr", "lgr5"], cancers: ["head-and-neck", "recurrent-metastatic-hnscc"], technologies: ["bispecific-antibody"], companies: ["merus", "genmab"],
    links: [ct("NCT06525220")] }),
  t({ id: "fortifi-hn01", name: "FORTIFI-HN01", nct: "NCT06788990", phase: "2/3", status: "recruiting", sponsor: "Bicara Therapeutics",
    setting: "Untreated PD-L1-positive, HPV-negative recurrent or metastatic HNSCC: ficerafusp alfa + pembrolizumab vs pembrolizumab",
    tldr: "A bifunctional antibody that blocks EGFR and soaks up TGF-beta, aiming to make HPV-negative head and neck tumours respond to immunotherapy.",
    summary: "FORTIFI-HN01, trial NCT06788990 sponsored by Bicara Therapeutics, tests ficerafusp alfa, a bifunctional antibody that blocks EGFR and soaks up TGF-beta, with pembrolizumab against pembrolizumab alone in untreated PD-L1-positive, HPV-negative recurrent or metastatic head and neck cancer. Two-year phase 1/1b data published in JCO in 2025 reported durable responses in HPV-negative disease, the phase 3 dose is fixed at 1500 mg, and Bicara expects substantial enrolment by the end of 2026 with an interim analysis in mid-2027; unlike LiGeR-HN1 it excludes HPV-positive oropharyngeal cancer. OnCo links it to head and neck cancer, bispecific antibodies, EGFR as a target, ficerafusp alfa, pembrolizumab and the pairing of an EGFR-directed bispecific with PD-1 blockade. Whether trapping TGF-beta makes cold HPV-negative tumours respond to immunotherapy is the question it will answer.",
    drugs: ["ficerafusp-alfa", "pembrolizumab"], targets: ["egfr"], cancers: ["head-and-neck", "recurrent-metastatic-hnscc", "hpv-negative-head-and-neck-cancer"], technologies: ["bispecific-antibody"],
    links: [ct("NCT06788990"), { label: "Phase 1/1b two-year results, JCO 2025", url: "https://ascopubs.org/doi/10.1200/JCO-25-02027" }] }),
];

// ======================= DRUGS =======================
const drugs: DrugInput[] = [
  d({ id: "toripalimab", name: "Toripalimab", brand: "Loqtorzi", modality: "Monoclonal antibody (anti-PD-1)", status: "approved", wikipedia: W("Toripalimab"),
    tldr: "A Chinese-developed PD-1 blocker that became the first immunotherapy approved in the US for nasopharyngeal cancer.",
    summary: "Approved by the FDA 27 October 2023 with gemcitabine-cisplatin for first-line recurrent or metastatic NPC and as monotherapy after platinum (JUPITER-02, POLARIS-02); EU approval 2024 for NPC and oesophageal squamous cell carcinoma. Broadly approved in China across lung, oesophageal, urothelial, and other cancers. Junshi Biosciences; Coherus in the US.",
    mechanism: "Humanised IgG4 anti-PD-1 with a distinct epitope and slow off-rate.",
    mechanismSteps: ["Binds PD-1 on T cells and blocks PD-L1/PD-L2 engagement", "Restores cytotoxic activity against EBV-antigen-bearing NPC cells", "Chemotherapy releases antigen and depletes suppressive cells, complementing the effect"],
    dosing: { route: "Intravenous", schedule: "240 mg every 3 weeks with gemcitabine-cisplatin for up to 6 cycles, then maintenance", monitoring: "Immune-related adverse events; thyroid function", source: "https://www.accessdata.fda.gov/drugsatfda_docs/label/2023/761240s000lbl.pdf" },
    approvals: [{ region: "US", year: 2023, indication: "Recurrent/metastatic nasopharyngeal carcinoma, first line with chemotherapy and later lines" }, { region: "China", year: 2018, indication: "Melanoma (first of many indications)" }],
    regulatoryEvents: [{ date: "2023-10-27", type: "approval", region: "US", note: "First FDA approval for nasopharyngeal carcinoma" }],
    targets: ["pd1"], technologies: ["checkpoint-inhibitor"], cancers: ["head-and-neck", "esophageal", "nasopharyngeal"], trials: ["jupiter-02", "nct07258979", "nct06679985", "nct07169994", "nct06623136", "nct05980481", "nct05302284", "nct06155383", "nct06227117", "nct06389006", "nct07111832", "nct05518045", "nct06038396", "nct06868199", "nct07392736", "nct05934331", "nct06178159", "nct06117566", "nct06823427", "nct06592326", "nct06682780", "nct07314723", "nct05615974", "nct04785196", "nct06975293", "nct06079112", "nct06088004", "nct07281976", "nct06642545"], terms: ["irae"],
    links: [{ label: "FDA approval coverage", url: "https://www.onclive.com/view/fda-approves-toripalimab-for-recurrent-or-metastatic-nasopharyngeal-carcinoma" }] }),
  d({ id: "petosemtamab", name: "Petosemtamab", code: "MCLA-158", modality: "Bispecific antibody (EGFR × LGR5)", status: "phase-3",
    tldr: "A two-armed antibody that blocks EGFR while gripping LGR5, a marker of cancer stem cells, so it hits the cells that regrow tumours.",
    summary: "Petosemtamab is a Merus Biclonics bispecific antibody that blocks EGFR with one arm while gripping LGR5, a marker of cancer stem cells, with the other; LGR5 binding drives internalisation and degradation of EGFR, and an ADCC-enhanced Fc recruits immune killing. It is aimed at head and neck squamous cell carcinoma and colorectal cancer, given at 1500 mg every 2 weeks. Phase 2 with pembrolizumab in first-line PD-L1-positive HNSCC gave an ORR of about 63%, and monotherapy about 37% in second line, earning Breakthrough Therapy designation. The registrational LiGeR-HN1 (first line) and LiGeR-HN2 (second line) trials are enrolling, with interim analyses expected 2026 to 2027; Merus was acquired by Genmab (2025). Whether the single-arm response rates hold up in randomised comparison is the key uncertainty. For a newcomer, it is a two-armed antibody designed to hit the cells that regrow tumours.",
    mechanism: "Simultaneous EGFR blockade and LGR5-mediated internalisation and degradation of EGFR; ADCC-enhanced Fc.",
    mechanismSteps: ["The LGR5 arm binds cancer stem-like cells", "The EGFR arm blocks ligand binding and drives receptor internalisation", "EGFR is degraded rather than merely blocked, silencing MAPK/PI3K signalling", "Enhanced Fc recruits NK cells for ADCC; pembrolizumab sustains T-cell activity"],
    dosing: { route: "Intravenous", schedule: "1500 mg every 2 weeks (phase 3 dose)", monitoring: "Infusion reactions (premedication), rash, hypomagnesaemia", source: "https://clinicaltrials.gov/study/NCT06525220" },
    regulatoryEvents: [{ date: "2024", type: "designation", region: "US", note: "Breakthrough Therapy designation for HNSCC" }],
    targets: ["egfr", "lgr5"], technologies: ["bispecific-antibody"], companies: ["merus", "genmab"], cancers: ["head-and-neck", "colorectal", "recurrent-metastatic-hnscc"], trials: ["liger-hn1", "nct07775287", "nct06496178", "nct07702032", "nct03526835"], drugs: ["pembrolizumab"],
    links: [ct("NCT06525220")] }),
  d({ id: "ficerafusp-alfa", name: "Ficerafusp alfa", code: "BCA101", modality: "Bifunctional antibody (EGFR × TGF-β trap)", status: "phase-3",
    tldr: "Ficerafusp alfa is an EGFR antibody fused to a TGF-beta sponge, designed to remove the immune-suppressing signal that keeps HPV-negative throat cancers cold.",
    summary: "Ficerafusp alfa (Bicara Therapeutics) is a bifunctional antibody: an anti-EGFR IgG1 with the extracellular domain of TGF-beta receptor II fused to its heavy chain, so it blocks EGFR on tumour cells and neutralises TGF-beta locally, removing an immune-suppressing signal that keeps HPV-negative head and neck tumours cold. It is given at 1500 mg every 2 weeks with pembrolizumab in first-line HPV-negative head and neck squamous cell carcinoma. A phase 1/1b study with pembrolizumab showed durable responses at two years (JCO 2025). The FORTIFI-HN01 phase 2/3 trial fixed the dose at 1500 mg, excludes HPV-positive oropharyngeal cancer, and expects an interim analysis in mid-2027. Whether trapping TGF-beta adds meaningfully to EGFR and PD-1 blockade in a randomised setting is the open question. For a newcomer, it is an EGFR antibody fused to a TGF-beta sponge.",
    mechanism: "Anti-EGFR IgG1 with a TGF-βRII extracellular domain fused to the heavy chain, neutralising TGF-β locally.",
    mechanismSteps: ["Binds EGFR on tumour cells, localising the molecule to the tumour", "The TGF-βRII trap sequesters TGF-β in the microenvironment", "Fibroblast activation and T-cell exclusion decrease; PD-1 blockade then acts on infiltrating T cells"],
    dosing: { route: "Intravenous", schedule: "1500 mg every 2 weeks with pembrolizumab", source: "https://clinicaltrials.gov/study/NCT06788990" },
    targets: ["egfr"], technologies: ["bispecific-antibody"], cancers: ["head-and-neck", "recurrent-metastatic-hnscc", "hpv-negative-head-and-neck-cancer"], trials: ["fortifi-hn01", "nct07807163"], drugs: ["pembrolizumab"],
    links: [{ label: "JCO 2025 two-year results", url: "https://ascopubs.org/doi/10.1200/JCO-25-02027" }] }),
  d({ id: "cetuximab-sarotalocan", trials: ["nct06699212"], name: "Cetuximab sarotalocan", brand: "Akalux", code: "ASP-1929, RM-1929", modality: "Photoimmunotherapy conjugate (anti-EGFR antibody-IR700 dye)", status: "approved",
    tldr: "Cetuximab sarotalocan is an EGFR antibody carrying a light-activated dye: after infusion, a red laser is shone on the tumour and the cells burst. It has been approved in Japan since 2020.",
    summary: "Cetuximab sarotalocan is Rakuten Medical's photoimmunotherapy. It was approved in Japan (September 2020) for unresectable locally advanced or recurrent head and neck cancer with conditional approval; two global phase 3 trials in locally recurrent HNSCC continue without US approval to date. Also being studied in cutaneous squamous cell carcinoma.",
    mechanism: "Cetuximab conjugated to IRDye700DX; 690 nm light triggers photochemical membrane damage in EGFR-bound cells and immunogenic cell death.",
    mechanismSteps: ["Antibody-dye conjugate binds EGFR on tumour cells within 24 hours", "Near-infrared light (690 nm) is delivered by surface or interstitial fibres", "Photochemical reaction ruptures the membrane of bound cells only", "Released antigens and damage signals recruit an immune response"],
    dosing: { route: "Intravenous infusion, then light at 24 hours", schedule: "640 mg/m² followed by 50 J/cm² (surface) or 100 J/cm (interstitial) illumination; repeatable", source: "https://www.pmda.go.jp/english/" },
    approvals: [{ region: "Japan", year: 2020, indication: "Unresectable locally advanced or recurrent head and neck cancer (conditional)" }],
    regulatoryEvents: [{ date: "2020-09-25", type: "approval", region: "Japan", note: "World-first approval of a photoimmunotherapy drug" }],
    targets: ["egfr"], technologies: ["photoimmunotherapy"], cancers: ["head-and-neck"],
    links: [{ label: "Development status", url: "https://www.pharmaceutical-technology.com/data-insights/cetuximab-sarotalocan-rakuten-medical-recurrent-head-and-neck-squamous-cell-carcinoma-likelihood-of-approval/" }] }),
];

// ======================= TECHNOLOGIES =======================
const technologies: TechnologyInput[] = [
  tech({ id: "tors", name: "Transoral robotic surgery (TORS)", sections: ["surgery"], status: "established", since: 2009, wikipedia: W("Transoral_robotic_surgery"),
    tldr: "Transoral robotic surgery removes early (T1 to T2) throat tumours through the mouth with a robot and 3D endoscope, avoiding splitting the jaw or a tracheostomy. In HPV-positive oropharyngeal cancer the pathology then guides how much radiation to add, but randomised trials found it no better than radiation for swallowing, and surgeon volume matters.",
    summary: "FDA-cleared 2009 for T1-T2 oropharyngeal tumours. Enables primary surgical management of HPV-positive oropharyngeal cancer with pathology-guided adjuvant de-escalation (ECOG 3311). ORATOR trials found comparable oncologic outcomes to radiation with different toxicity profiles (swallowing favoured radiation in ORATOR; ORATOR2 halted after surgical deaths). Selection and surgeon volume matter.",
    principle: "Da Vinci or Flex robot instruments and a 3D endoscope pass through a mouth retractor to resect the tumour with margins; neck dissection is done separately.",
    strengths: ["Avoids mandibulotomy and tracheostomy", "Pathology-based selection of adjuvant therapy"],
    limitations: ["Bleeding risk, swallowing morbidity", "Not superior to radiation in randomised comparison for function"],
    cancers: ["head-and-neck", "oropharyngeal-cancer", "hpv-positive-oropharyngeal-cancer"], technologies: ["robotic-surgery"], companies: ["intuitive-surgical"], trials: ["ecog-e3311", "pathos"], links: [{ label: "Wikipedia", url: W("Transoral_robotic_surgery") }] }),
  tech({ id: "cthpv-dna", links: [{ label: "Chera et al., Plasma circulating tumour HPV DNA for the surveillance of cancer recurrence in HPV-associated oropharyngeal cancer (Journal of Clinical Oncology 2020)", url: "https://doi.org/10.1200/JCO.19.02444" }], name: "Circulating tumour HPV DNA (ctHPV-DNA)", sections: ["diagnostics"], status: "established",
    tldr: "A blood test that detects fragments of the virus DNA shed by HPV-positive throat cancers, to confirm diagnosis, track response, and catch recurrence early.",
    summary: "Digital droplet PCR or NGS assays (NavDx, others) detect HPV16 DNA in plasma with high specificity; clearance during chemoradiation predicts cure and post-treatment surveillance detects recurrence months before imaging. Being used to select patients for response-adapted de-escalation after the failure of HPV-status-alone selection (NRG-HN005).",
    principle: "Tumour-tissue-modified viral DNA fragments quantified in cell-free plasma DNA.",
    strengths: ["Highly specific to the tumour", "Cheap, repeatable, earlier than imaging"],
    limitations: ["Only for HPV-driven disease", "Interventional trials proving benefit of acting on it are ongoing"],
    cancers: ["head-and-neck", "hpv-positive-oropharyngeal-cancer"], technologies: ["liquid-biopsy", "mrd-testing"], terms: ["hpv-p16", "ctdna"] }),
];

// ======================= TERMS =======================
const terms: TermInput[] = [
  term({ id: "hpv-p16", name: "HPV-positive (p16) head and neck cancer", category: "Biomarkers", wikipedia: W("HPV-positive_oropharyngeal_cancer"),
    tldr: "Throat cancers caused by the human papillomavirus, identified by a p16 stain. They affect younger non-smokers and are far more curable than tobacco-related cancers.",
    summary: "p16 immunohistochemistry is the surrogate for HPV-driven oropharyngeal cancer (confirmed by HPV DNA/RNA where required). Incidence is rising in Western countries and now exceeds cervical cancer in the US. Separate AJCC 8th-edition staging; 3-year OS >80% with chemoradiation (RTOG 0129). De-escalation trials have so far failed to identify who can safely receive less treatment; HPV vaccination is expected to reduce incidence from the 2030s.",
    cancers: ["head-and-neck", "hpv-positive-oropharyngeal-cancer"], technologies: ["hpv-vaccine", "cthpv-dna"], trials: ["rtog-0129", "nrg-hn002-hn005", "ecog-e3311"], links: [{ label: "Wikipedia", url: W("HPV-positive_oropharyngeal_cancer") }] }),
  term({ id: "lgr5", name: "LGR5", category: "Biology", wikipedia: W("LGR5"),
    tldr: "A marker of stem cells in the gut and of stem-like cells in tumours, used to aim drugs at the cells that regrow a cancer.",
    summary: "LGR5, leucine-rich repeat-containing G-protein-coupled receptor 5, is a Wnt target gene that marks intestinal stem cells and stem-like cells in tumours, the cells thought to regrow a cancer after treatment. In head and neck squamous cell carcinoma and colorectal cancer it is being used to aim drugs at those cells: petosemtamab binds LGR5 and uses that binding to degrade EGFR selectively in tumour cells, and LGR5-directed antibody-drug conjugates have also been explored. Readers meet the term on the petosemtamab drug page, in the LiGeR-HN1 trial and within the Wnt and beta-catenin pathway. It is also part of the wider story of cancer stem cells and phenotypic plasticity.",
    cancers: ["head-and-neck", "colorectal"], drugs: ["petosemtamab"], pathways: ["wnt"], links: [{ label: "Wikipedia", url: W("LGR5") }] }),
];

// ======================= PAIRINGS =======================
const pairings: PairingInput[] = [
  pair({ id: "io-before-surgery-hnscc", links: [{ label: "ClinicalTrials.gov NCT03765918: KEYNOTE-689", url: "https://clinicaltrials.gov/study/NCT03765918" }, { label: "ClinicalTrials.gov NCT02952586: JAVELIN Head and Neck 100", url: "https://clinicaltrials.gov/study/NCT02952586" }], name: "Immunotherapy before surgery rather than with chemoradiation (HNSCC)", a: "checkpoint-inhibitor", b: "imrt-igrt", pairingType: "sequence",
    tldr: "In head and neck cancer, immunotherapy works when given before surgery but not when given alongside chemoradiation.",
    summary: "This sequence rule in head and neck squamous cell carcinoma places immune checkpoint inhibitors before surgery rather than concurrently with modern external beam chemoradiation. T-cell priming needs an intact tumour and functioning lymphatics, and chemoradiation destroys both while the drug is on board; radiation-induced lymphopenia, steroids and loss of the antigen-rich primary are the proposed explanations. KEYNOTE-689, which gave pembrolizumab before and after surgery, improved event-free survival, whereas JAVELIN Head and Neck 100 and KEYNOTE-412, which gave it with chemoradiation, both failed. One positive phase 3 against two negative ones makes timing, not the drug, the lesson; the concept sits under neoadjuvant, adjuvant and perioperative therapy.",
    rationale: "T-cell priming needs an intact tumour and functioning lymphatics; chemoradiation destroys both while the drug is on board.",
    evidence: "One positive phase 3 versus two negative ones with the alternative sequence.",
    drugs: ["pembrolizumab"], cancers: ["head-and-neck"], trials: ["keynote-689", "javelin-hn-100"], terms: ["neoadjuvant-adjuvant"] }),
  pair({ id: "egfr-bispecific-plus-pd1-hnscc", links: [{ label: "ClinicalTrials.gov NCT06525220: LiGeR-HN1", url: "https://clinicaltrials.gov/study/NCT06525220" }, { label: "ClinicalTrials.gov NCT06788990: FORTIFI-HN01", url: "https://clinicaltrials.gov/study/NCT06788990" }], name: "EGFR-directed bispecific + PD-1 blockade", a: "petosemtamab", b: "pembrolizumab", pairingType: "combination",
    tldr: "Pairing a new EGFR antibody with immunotherapy tripled the response rate seen with immunotherapy alone in early trials.",
    summary: "This combination pairs an EGFR-directed bispecific antibody, petosemtamab or ficerafusp alfa, with the PD-1 inhibitor pembrolizumab in head and neck squamous cell carcinoma. EGFR blockade with ADCC-competent antibodies induces immunogenic cell death and, in the case of ficerafusp, also removes TGF-beta-mediated immune exclusion; PD-1 blockade then sustains the resulting T-cell response. In phase 2 single-arm studies, petosemtamab with pembrolizumab produced a response rate far above that expected with immunotherapy alone, and ficerafusp alfa with pembrolizumab produced durable responses in HPV-negative disease. Both pairings are now in registrational phase 3 trials, LiGeR-HN1 and FORTIFI-HN01, so the evidence remains uncontrolled for the moment.",
    rationale: "EGFR blockade with ADCC-competent antibodies induces immunogenic cell death and, for ficerafusp, removes TGF-β-mediated exclusion; PD-1 blockade sustains the resulting T-cell response.",
    evidence: "Phase 2 single-arm data; phase 3 pending (LiGeR-HN1, FORTIFI-HN01).",
    drugs: ["petosemtamab", "ficerafusp-alfa", "pembrolizumab"], cancers: ["head-and-neck"], trials: ["liger-hn1", "fortifi-hn01"], targets: ["egfr", "pd1"] }),
  pair({ id: "hpv-deescalation-caution", links: [{ label: "ClinicalTrials.gov NCT03952585: NRG-HN002 & NRG-HN005 (HPV+ de-escalation)", url: "https://clinicaltrials.gov/study/NCT03952585" }], name: "Caution: de-escalating radiation on HPV status alone", a: "hpv-p16", b: "imrt-igrt", pairingType: "caution",
    tldr: "Being HPV-positive is not enough to justify less radiation; trials that tried it saw more relapses.",
    summary: "This caution warns against reducing radiotherapy for HPV-positive, p16-positive head and neck cancer on the basis of HPV status alone. HPV-positive tumours are heterogeneous in smoking exposure, nodal burden and biology, so a single marker over-selects patients for less treatment. Multiple randomised trials bear this out: the 60 Gy arms of NRG-HN005, and the cetuximab-substitution trials RTOG 1016 and De-ESCALaTE, all underperformed standard cisplatin chemoradiation with modern external beam radiotherapy, with more relapses. The current approach is response-adapted selection, or selection guided by circulating tumour HPV DNA, rather than HPV status at diagnosis.",
    rationale: "HPV-positive tumours are heterogeneous in smoking exposure, nodal burden, and biology; a single marker over-selects.",
    evidence: "Multiple randomised trials.",
    cancers: ["head-and-neck"], trials: ["nrg-hn002-hn005"], technologies: ["cthpv-dna"], terms: ["hpv-p16"] }),
];

// ======================= IDEAS =======================
const ideas: IdeaInput[] = [
  idea({ id: "idea-cthpv-adapted-deescalation", links: [{ label: "ClinicalTrials.gov NCT03952585: NRG-HN002 & NRG-HN005 (HPV+ de-escalation)", url: "https://clinicaltrials.gov/study/NCT03952585" }], name: "ctHPV-DNA-adapted de-escalation of chemoradiation", maturity: "early-clinical",
    tldr: "Instead of guessing from HPV status who can get less radiation, measure the virus DNA in blood during treatment and reduce dose only when it clears fast.",
    summary: "The idea is to reduce the radiation dose in HPV-positive head and neck cancer only for patients whose circulating tumour HPV DNA clears quickly during treatment, rather than for everyone who is HPV-positive. NRG-HN005 showed that static selection on HPV status fails, whereas ctHPV-DNA kinetics track tumour kill in real time and outperform baseline staging for predicting recurrence. The hypothesis is that patients whose ctHPV-DNA clears by week 2 to 3 of chemoradiation can receive 60 Gy without loss of progression-free survival, while non-clearers receive the full 70 Gy. The test is a phase 2/3 trial of ctHPV-DNA-guided dose versus uniform 70 Gy, with progression-free survival and quality of life as endpoints; the idea sits on the radiotherapy roadmap.",
    hypothesis: "Patients whose ctHPV-DNA clears by week 2-3 of chemoradiation can receive 60 Gy without loss of PFS, while non-clearers receive 70 Gy.",
    rationale: "ctHPV-DNA kinetics track tumour kill in real time and outperform baseline staging for predicting recurrence.",
    test: "Phase 2/3 with ctHPV-DNA-guided dose assignment versus uniform 70 Gy; PFS non-inferiority in clearers and quality-of-life superiority.",
    technologies: ["cthpv-dna", "imrt-igrt"], cancers: ["head-and-neck"], trials: ["nrg-hn002-hn005"], terms: ["hpv-p16"] }),
  idea({ id: "idea-photoimmunotherapy-plus-pd1", links: [{ label: "Mitsunaga et al., Cancer cell-selective in vivo near-infrared photoimmunotherapy (Nature Medicine 2011)", url: "https://doi.org/10.1038/nm.2554" }], name: "Photoimmunotherapy as an in situ vaccine with PD-1 blockade", maturity: "early-clinical",
    tldr: "Bursting tumour cells with light releases their contents to the immune system; adding immunotherapy might turn a local treatment into a body-wide one.",
    summary: "The idea is to pair photoimmunotherapy with cetuximab sarotalocan and pembrolizumab in recurrent or metastatic head and neck squamous cell carcinoma, turning a local light-activated treatment into an in situ vaccine. Rapid necrotic-type death releases tumour antigens and danger signals while leaving immune cells intact, EGFR targeting spares dendritic cells, and animal models show abscopal responses with checkpoint blockade. The hypothesis is that illuminated lesions plus pembrolizumab produce responses in non-illuminated lesions more often than pembrolizumab alone; a phase 2 has already been run in the US. The test is a randomised phase 2 in patients with an illuminable and a distant lesion, with distant-lesion response as endpoint; it addresses the cold-tumour bottleneck.",
    hypothesis: "Photoimmunotherapy of accessible lesions plus pembrolizumab produces responses in non-illuminated lesions at a higher rate than pembrolizumab alone.",
    rationale: "Rapid necrotic-type death releases antigens and DAMPs while leaving immune cells intact; EGFR-targeting spares dendritic cells.",
    test: "Randomised phase 2 in recurrent/metastatic HNSCC with ≥1 illuminable and ≥1 distant lesion; endpoint distant-lesion response.",
    technologies: ["photoimmunotherapy", "checkpoint-inhibitor"], drugs: ["cetuximab-sarotalocan", "pembrolizumab"], cancers: ["head-and-neck"], terms: ["abscopal-effect", "immunogenic-cell-death"] }),
];

// ======================= SPIKE =======================
const spike: Spike = {
  cancerId: "head-and-neck",
  entities: [...trials, ...drugs, ...technologies, ...terms, ...pairings, ...ideas],
  patch: {
    summary: "Head and neck squamous cell carcinoma arises from the lining of the mouth, throat (oropharynx, hypopharynx), voice box, and nose, and includes the distinct Epstein-Barr-virus-driven nasopharyngeal carcinoma. Two epidemics coexist: tobacco- and alcohol-related cancers, declining in rich countries but common globally, and HPV-driven oropharyngeal cancer, rising among younger non-smokers and now the most common HPV cancer in the US. HPV-positive disease is far more curable (3-year survival >80%) and has its own staging system.\n\nCurative treatment is surgery (increasingly transoral robotic surgery) and/or cisplatin-based chemoradiation with IMRT; both leave lasting effects on speech, swallowing, and salivation, which is why de-escalation for HPV-positive disease has been pursued so hard, and why its repeated failure (RTOG 1016, De-ESCALaTE, NRG-HN005) matters. Immunotherapy transformed recurrent and metastatic disease: nivolumab (CheckMate 141) and then pembrolizumab first line (KEYNOTE-048) replaced the cetuximab-chemotherapy EXTREME regimen, and in June 2025 KEYNOTE-689 delivered the first perioperative approval, doubling event-free survival by giving pembrolizumab before and after surgery. Immunotherapy given concurrently with chemoradiation, by contrast, has failed repeatedly. Nasopharyngeal carcinoma gained its first US approval with toripalimab plus chemotherapy in 2023.\n\nWhat is coming: EGFR-directed bispecifics with pembrolizumab (petosemtamab, ficerafusp alfa) posting response rates two to three times those of pembrolizumab alone in early trials, now in phase 3; photoimmunotherapy (approved in Japan) in global phase 3; ctHPV-DNA to guide response-adapted de-escalation; and B7-H3 and EGFR×HER3 ADCs. Open problems include the lack of targets beyond EGFR and PD-1, the functional toxicity of curative treatment, and the lower cure rate of HPV-negative disease.",
    subtypes: ["Oral cavity", "Oropharynx, HPV-positive (p16+)", "Oropharynx, HPV-negative", "Larynx", "Hypopharynx", "Nasopharyngeal carcinoma (EBV-driven; endemic in southern China and Southeast Asia)", "Salivary gland cancers (distinct histologies; HER2, AR, NTRK targets)", "Sinonasal", "Cutaneous SCC of the head and neck (cemiplimab)"],
    biomarkers: ["HPV / p16 status (staging and prognosis)", "PD-L1 CPS (first-line pembrolizumab eligibility and KEYNOTE-689)", "EGFR (near-universal; cetuximab, bispecifics)", "EBV DNA (nasopharyngeal carcinoma surveillance)", "ctHPV-DNA (response and recurrence)", "TP53, CDKN2A, PIK3CA, NOTCH1 (HPV-negative genomics)", "Smoking history (modifies HPV-positive prognosis)"],
    standardOfCare: [
      { setting: "Prevention", approach: "HPV vaccination (also prevents oropharyngeal cancer in men), tobacco and alcohol cessation; no validated screening.", refs: ["hpv-vaccine"], guideline: { nccn: "Prevention guideline", esmoMcbs: undefined } },
      { setting: "Early stage (I-II) oral cavity and larynx", approach: "Single-modality surgery or radiation; sentinel node or elective neck dissection for oral cavity; larynx preservation with radiation for T1-T2 glottic cancer.", refs: ["imrt-igrt", "sentinel-node"], guideline: { nccn: "2A" } },
      { setting: "Early HPV-positive oropharynx", approach: "TORS with pathology-guided adjuvant therapy or definitive (chemo)radiation; standard 70 Gy dose because de-escalation trials failed.", refs: ["tors", "nrg-hn002-hn005", "hpv-deescalation-caution", "rtog-0129"], guideline: { nccn: "2A" } },
      { setting: "Locally advanced, resectable (stage III-IVA)", approach: "Neoadjuvant pembrolizumab, surgery, adjuvant pembrolizumab with (chemo)radiation for PD-L1 CPS ≥1 (KEYNOTE-689); otherwise surgery then risk-adapted (chemo)radiation.", refs: ["keynote-689", "pembrolizumab", "io-before-surgery-hnscc"], guideline: { nccn: "1 (CPS ≥1)", esmoMcbs: "A" } },
      { setting: "Locally advanced, unresectable or organ preservation", approach: "Cisplatin (100 mg/m² q3w or weekly) with 70 Gy IMRT; cetuximab-radiation only if cisplatin-ineligible; concurrent immunotherapy is not indicated (JAVELIN Head and Neck 100, KEYNOTE-412) and adding xevinapant to chemoradiation gave no benefit (TrilynX).", refs: ["imrt-igrt", "javelin-hn-100", "trilynx"], guideline: { nccn: "1" } },
      { setting: "Recurrent or metastatic, first line", approach: "Pembrolizumab alone (CPS ≥20, or ≥1) or with platinum/5-FU (any CPS); EXTREME if immunotherapy contraindicated.", refs: ["keynote-048", "pembrolizumab", "extreme"], guideline: { nccn: "1", esmoMcbs: "4" } },
      { setting: "Recurrent or metastatic, after platinum", approach: "Nivolumab or pembrolizumab if immunotherapy-naive; otherwise cetuximab, taxane, or methotrexate; clinical trials (bispecifics, ADCs).", refs: ["checkmate-141", "nivolumab", "liger-hn1", "fortifi-hn01"], guideline: { nccn: "1 (IO-naive)" } },
      { setting: "Locally recurrent, unresectable (Japan)", approach: "Cetuximab sarotalocan photoimmunotherapy; re-irradiation (proton or IMRT) in selected patients elsewhere.", refs: ["cetuximab-sarotalocan", "photoimmunotherapy", "proton-therapy", "bnct"] },
      { setting: "Nasopharyngeal carcinoma", approach: "Induction gemcitabine-cisplatin then chemoradiation for locoregional disease; toripalimab (or other PD-1) + gemcitabine-cisplatin for recurrent/metastatic; plasma EBV DNA for surveillance.", refs: ["jupiter-02", "toripalimab", "imrt-igrt"], guideline: { nccn: "1" } },
      { setting: "Survivorship", approach: "Swallowing and speech therapy, dental care after radiation, thyroid monitoring, lymphoedema management, smoking cessation; second primary surveillance.", refs: ["supportive-care"] },
    ],
    stateOfArt: [
      "Perioperative pembrolizumab (KEYNOTE-689) is the first curative-intent advance since cetuximab-radiation in 2006, with median event-free survival roughly doubled.",
      "Pembrolizumab-based first-line therapy for recurrent or metastatic disease produces a durable survival tail that chemotherapy never did.",
      "HPV-positive oropharyngeal cancer is recognised as a distinct, highly curable disease, but the standard dose of chemoradiation still stands because every de-escalation trial has fallen short.",
      "Nasopharyngeal carcinoma has immunotherapy-chemotherapy as first line in the US, EU, and China.",
      "Transoral robotic surgery gives many patients a surgical option without splitting the jaw.",
      "EGFR-directed bispecifics plus PD-1 blockade are showing response rates not seen before in this disease and are in phase 3.",
    ],
    history: [
      { year: 1987, title: "Cisplatin-5-FU induction and larynx preservation trials begin", note: "VA Larynx study establishes organ preservation with chemoradiation." },
      { year: 2000, title: "Concurrent cisplatin chemoradiation becomes standard for locally advanced disease", note: "Meta-analysis (MACH-NC) confirms ~6.5% absolute survival gain.", refs: ["imrt-igrt", "platinum"] },
      { year: 2006, title: "Cetuximab + radiation improves survival (Bonner)", note: "First targeted agent in HNSCC.", refs: ["egfr"] },
      { year: 2008, title: "EXTREME defines first-line therapy for recurrent/metastatic disease", refs: ["extreme"] },
      { year: 2009, title: "Transoral robotic surgery FDA-cleared", refs: ["tors"] },
      { year: 2010, title: "RTOG 0129: HPV status is the dominant prognostic factor", refs: ["rtog-0129", "hpv-p16"] },
      { year: 2016, title: "Nivolumab (CheckMate 141) and pembrolizumab approved after platinum", refs: ["checkmate-141", "nivolumab", "pembrolizumab"] },
      { year: 2018, title: "AJCC 8th edition gives HPV-positive oropharynx cancer its own staging", refs: ["hpv-p16", "tnm-staging"] },
      { year: 2019, title: "KEYNOTE-048: pembrolizumab first line; RTOG 1016 and De-ESCALaTE show cetuximab cannot replace cisplatin", refs: ["keynote-048", "hpv-deescalation-caution"] },
      { year: 2020, title: "Cetuximab sarotalocan photoimmunotherapy approved in Japan; JAVELIN H&N 100 negative", refs: ["cetuximab-sarotalocan", "javelin-hn-100"] },
      { year: 2021, title: "JUPITER-02: PD-1 plus chemotherapy in nasopharyngeal carcinoma; BNCT approved in Japan", refs: ["jupiter-02", "bnct"] },
      { year: 2023, title: "Toripalimab first US approval for nasopharyngeal carcinoma", refs: ["toripalimab"] },
      { year: 2024, title: "TrilynX (xevinapant) stopped for futility; petosemtamab Breakthrough designation", refs: ["trilynx", "petosemtamab"] },
      { year: 2025, title: "KEYNOTE-689 perioperative pembrolizumab approved; NRG-HN005 de-escalation fails; petosemtamab and ficerafusp alfa phase 3 trials", refs: ["keynote-689", "nrg-hn002-hn005", "liger-hn1", "fortifi-hn01"] },
    ],
    pipeline: ["petosemtamab", "liger-hn1", "ficerafusp-alfa", "fortifi-hn01", "cetuximab-sarotalocan", "cthpv-dna", "idea-cthpv-adapted-deescalation", "idea-photoimmunotherapy-plus-pd1", "egfr-bispecific-plus-pd1-hnscc", "tilatamig-samrotecan", "lifileucel", "bnct", "proton-therapy", "b7h3"],
    openProblems: [
      "HPV-negative, tobacco-related disease has 5-year survival around 50% and has seen little improvement in curative outcomes beyond KEYNOTE-689.",
      "De-escalation for HPV-positive disease has failed in every randomised trial; the field still lacks a validated way to identify who can receive less.",
      "Only two drug targets (EGFR and PD-1) have approved agents; PIK3CA, NOTCH, and CDKN2A alterations remain undrugged.",
      "Immunotherapy concurrent with chemoradiation has failed three times; the mechanism is not fully understood.",
      "Curative treatment causes permanent swallowing, speech, dental, and thyroid damage; survivorship care is under-resourced.",
      "Nasopharyngeal carcinoma outside East Asia is rare and under-studied; EBV-directed cell therapies remain experimental.",
      "Second primary cancers and field cancerisation in smokers are not addressed by any approved chemoprevention.",
      "Global burden falls on South Asia (oral cavity cancer from smokeless tobacco and areca nut), where access to IMRT and immunotherapy is limited.",
    ],
    targets: ["egfr", "pd1", "pdl1", "lgr5"],
    technologies: ["tors", "cthpv-dna", "imrt-igrt", "sentinel-node"],
    terms: ["hpv-p16", "lgr5", "cps", "neoadjuvant-adjuvant"],
    trials: ["keynote-048", "keynote-689", "extreme", "checkmate-141", "rtog-0129", "nrg-hn002-hn005", "javelin-hn-100", "trilynx", "jupiter-02", "liger-hn1", "fortifi-hn01"],
    drugs: ["toripalimab", "petosemtamab", "ficerafusp-alfa", "cetuximab-sarotalocan"],
    companies: ["merck", "bms", "merus", "genmab", "debiopharm", "intuitive-surgical"],
    institutions: ["nrg-oncology", "sysucc", "tata-memorial", "dana-farber"],
    related: ["io-before-surgery-hnscc", "egfr-bispecific-plus-pd1-hnscc", "hpv-deescalation-caution", "immunotherapy-roadmap"],
    tags: ["spike", "head-neck"],
  },
};

export default spike;

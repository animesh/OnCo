import type { Spike } from "./index";
import type { EntityInput } from "@/lib/schema";

const asOf = "2026-09-06";
const W = (s: string) => `https://en.wikipedia.org/wiki/${s}`;
const ct = (nct: string) => ({ label: `ClinicalTrials.gov ${nct}`, url: `https://clinicaltrials.gov/study/${nct}` });

const entities: EntityInput[] = [
  // ======================= DRUGS =======================
  {
    id: "temozolomide", kind: "drug", name: "Temozolomide", brand: "Temodar", modality: "Oral alkylating chemotherapy", asOf, status: "standard-of-care", wikipedia: W("Temozolomide"),
    tldr: "The only chemotherapy proven to extend life in glioblastoma, given during and after radiation. It works best when the tumour has switched off a repair gene called MGMT.",
    summary: "Stupp/EORTC 26981-NCIC (2005): adding concurrent and adjuvant temozolomide to radiotherapy raised median OS from 12.1 to 14.6 months and 2-year survival from 10% to 27%. Benefit concentrates in MGMT-promoter-methylated tumours (median OS ~23 months vs ~13 months unmethylated). Also standard with radiotherapy in grade 3 astrocytoma (CATNON) and, with PCV as an alternative, in oligodendroglioma. Oral, well tolerated; lymphopenia and hypermutation at recurrence are the costs.",
    mechanism: "Prodrug of MTIC; methylates O6-guanine; cytotoxicity depends on unrepaired lesions when MGMT is silenced.",
    approvals: [{ region: "US", year: 1999, indication: "Refractory anaplastic astrocytoma" }, { region: "US", year: 2005, indication: "Newly diagnosed glioblastoma with radiotherapy" }, { region: "EU", year: 1999, indication: "Temodal; malignant glioma (recurrent 1999; newly diagnosed glioblastoma with radiotherapy 2005); 26 Jan 1999" }],
    technologies: ["cytotoxic-chemotherapy", "imrt-igrt"], cancers: ["glioblastoma"], trials: ["eortc-26981"], terms: ["mgmt"], links: [{ label: "Wikipedia", url: W("Temozolomide") }],
  },
  {
    id: "lomustine", kind: "drug", name: "Lomustine (CCNU)", brand: "Gleostine", modality: "Oral nitrosourea chemotherapy", asOf, status: "standard-of-care", wikipedia: W("Lomustine"),
    tldr: "An old chemotherapy pill used when glioblastoma comes back, and the control arm most new glioblastoma drugs must beat.",
    summary: "Standard second-line agent in Europe and the control in EORTC 26101 (lomustine ± bevacizumab), REGOMA, and most recurrent-glioblastoma trials; median OS ~8-9 months at recurrence. CeTeG/NOA-09 suggested lomustine-temozolomide improves OS in MGMT-methylated newly diagnosed disease. Delayed, cumulative myelosuppression limits cycles.",
    mechanism: "Lipophilic nitrosourea; DNA alkylation and crosslinking; crosses the blood-brain barrier.",
    approvals: [{ region: "US", year: 1976, indication: "Brain tumours after surgery/radiation; Hodgkin lymphoma" }],
    technologies: ["cytotoxic-chemotherapy"], cancers: ["glioblastoma"], terms: ["blood-brain-barrier"], links: [{ label: "Wikipedia", url: W("Lomustine") }],
  },
  {
    id: "bevacizumab-glioma", kind: "drug", links: [{ label: "FDA label (DailyMed)", url: "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=Bevacizumab" }], name: "Bevacizumab (glioblastoma use)", brand: "Avastin", modality: "Monoclonal antibody (anti-VEGF)", asOf, status: "approved", wikipedia: W("Bevacizumab"),
    tldr: "A blood-vessel-blocking antibody that shrinks glioblastoma on scans and reduces swelling, but has never been shown to help patients live longer.",
    summary: "Accelerated approval for recurrent glioblastoma (2009, full 2017) on radiographic response. AVAglio and RTOG 0825 (2014): PFS gain in newly diagnosed disease without OS benefit; EORTC 26101 at recurrence: PFS but no OS benefit with lomustine. Valuable for steroid-sparing control of oedema and radiation necrosis. A case study in pseudo-response and the limits of imaging endpoints in glioma.",
    mechanism: "Neutralises VEGF-A; normalises vasculature and reduces contrast enhancement and oedema.",
    approvals: [{ region: "US", year: 2009, indication: "Recurrent glioblastoma (accelerated; full approval 2017)" }],
    targets: ["vegf"], technologies: ["antiangiogenic", "monoclonal-antibody"], companies: ["roche-genentech"], cancers: ["glioblastoma"], pathways: ["vegf-angiogenesis"], terms: ["recist"],
  },
  {
    id: "dordaviprone", trials: ["action-dmg"], kind: "drug", name: "Dordaviprone", brand: "Modeyso", code: "ONC201", modality: "Small-molecule imipridone (ClpP agonist / DRD2 antagonist)", asOf, status: "approved",
    tldr: "Dordaviprone is the first drug ever approved for a lethal childhood and young-adult brain tumour, diffuse midline glioma with the H3 K27M mutation (August 2025).",
    summary: "FDA accelerated approval 6 August 2025 for patients ≥1 year with H3 K27M-mutant diffuse midline glioma progressing after prior therapy, based on an integrated analysis of 50 patients across five trials: ORR 22%, median duration of response 10.3 months. Brain-penetrant oral agent from Oncoceutics → Chimerix → Jazz Pharmaceuticals (2025). Confirmatory phase 3 ACTION trial (newly diagnosed, after radiotherapy) ongoing. Debate continues on the strength of single-arm evidence.",
    mechanism: "Hyperactivates the mitochondrial protease ClpP and antagonises dopamine receptor D2, triggering integrated stress response and apoptosis in H3 K27M-altered cells.",
    approvals: [{ region: "US", year: 2025, indication: "Recurrent H3 K27M-mutant diffuse midline glioma, age ≥1 (accelerated)" }],
    companies: ["jazz"], cancers: ["glioblastoma"], terms: ["h3k27m", "blood-brain-barrier", "accelerated-approval"],
    links: [{ label: "FDA approval notice", url: "https://www.fda.gov/drugs/resources-information-approved-drugs/fda-grants-accelerated-approval-dordaviprone-diffuse-midline-glioma" }, { label: "OncLive", url: "https://www.onclive.com/view/fda-approves-dordaviprone-for-diffuse-midline-glioma" }, { label: "Arrillaga-Romany et al., ONC201 (dordaviprone) in recurrent H3 K27M-mutant diffuse midline glioma: pooled analysis behind the accelerated approval (Journal of Clinical Oncology 2024)", url: "https://doi.org/10.1200/JCO.23.01134" }],
  },
  {
    id: "tovorafenib", kind: "drug", name: "Tovorafenib", brand: "Ojemda", modality: "Small-molecule type II RAF inhibitor", asOf, status: "approved",
    tldr: "Tovorafenib is a pill for the most common childhood brain tumour, low-grade glioma driven by BRAF changes, approved in 2024.",
    summary: "FDA accelerated approval 23 April 2024 for relapsed/refractory paediatric low-grade glioma (age ≥6 months) with BRAF fusion/rearrangement or V600 mutation (FIREFLY-1: ORR ~51% by RANO-HGG). European conditional approval April 2026 (Ipsen, regardless of BRAF alteration type). Type II RAF inhibitor active against KIAA1549-BRAF fusions where type I inhibitors cause paradoxical activation. Phase 3 LOGGIPY-2 in first line versus chemotherapy. Day One Biopharmaceuticals.",
    mechanism: "Pan-RAF type II inhibitor binding the DFG-out conformation; blocks monomeric and dimeric BRAF signalling.",
    approvals: [{ region: "US", year: 2024, indication: "Relapsed/refractory BRAF-altered paediatric low-grade glioma (accelerated)" }, { region: "EU", year: 2026, indication: "Relapsed/refractory paediatric low-grade glioma (conditional)" }],
    targets: ["braf"], technologies: ["kinase-inhibitors"], companies: ["day-one-biopharmaceuticals", "ipsen"], cancers: ["glioblastoma"], pathways: ["ras-mapk"],
    links: [{ label: "FDA approval", url: "https://www.fda.gov/drugs/resources-information-approved-drugs/fda-grants-accelerated-approval-tovorafenib-patients-relapsed-or-refractory-braf-altered-pediatric" }],
  },
  {
    id: "dcvax-l", kind: "drug", name: "DCVax-L", modality: "Autologous dendritic cell vaccine (tumour lysate)", asOf, status: "phase-3",
    tldr: "A personalised vaccine made from the patient's own immune cells and tumour. Its 20-year-old phase 3 trial reported longer survival, but the way the result was analysed has divided the field.",
    summary: "DCVax-L is made by Northwest Biotherapeutics. Its phase 3 (NCT00045968, enrolled 2007-2015, n=331) published in JAMA Oncology 2023 using an external control comparison after a protocol change from PFS to OS: median OS 19.3 vs 16.5 months (newly diagnosed) and 13.2 vs 7.8 months (recurrent) versus matched external controls. Because almost all placebo patients crossed over and the primary endpoint was changed post hoc, most neuro-oncologists regard the evidence as inconclusive. UK MHRA marketing application submitted December 2023; it was still not FDA-approved in September 2026.",
    mechanism: "Autologous dendritic cells pulsed with autologous tumour lysate, injected intradermally to prime anti-tumour T cells.",
    technologies: ["shared-antigen-vaccine", "neoantigen-mrna-vaccine"], companies: ["northwest-biotherapeutics"], cancers: ["glioblastoma"],
    links: [{ label: "ClinicalTrials.gov NCT00045968", url: "https://clinicaltrials.gov/study/NCT00045968" }, { label: "NICE appraisal (in development)", url: "https://www.nice.org.uk/guidance/indevelopment/gid-ta10143" }],
    notes: ["Listed at phase 3 rather than approved; the external-control design and endpoint change are the reasons this remains contested."],
  },
  {
    id: "rindopepimut", links: [{ label: "ClinicalTrials.gov NCT01480479 (ACT IV)", url: "https://clinicaltrials.gov/study/NCT01480479" }], kind: "drug", name: "Rindopepimut", code: "CDX-110", modality: "Peptide vaccine (EGFRvIII)", asOf, status: "negative",
    tldr: "Rindopepimut is a peptide vaccine against EGFRvIII, a mutant protein found only on some glioblastomas. After a phase 2 that beat historical controls, the 745-patient double-blind phase 3 ACT IV found no benefit in 2016, and tumours in both arms had lost EGFRvIII at recurrence, a lesson in antigen escape.",
    summary: "EGFRvIII peptide conjugated to KLH with GM-CSF. Phase 2 (ACT III) suggested prolonged survival versus historical controls; the double-blind phase 3 ACT IV (n=745, EGFRvIII-positive newly diagnosed glioblastoma with minimal residual disease) showed no OS benefit (20.1 vs 20.0 months). Loss of EGFRvIII expression at recurrence in both arms illustrated antigen escape. Celldex discontinued the programme.",
    mechanism: "Induces humoral and cellular immunity against the EGFRvIII neoepitope.",
    targets: ["egfr"], technologies: ["shared-antigen-vaccine"], cancers: ["glioblastoma"], trials: ["act-iv"], terms: ["egfrviii"],
  },

  // ======================= TRIALS =======================
  {
    id: "eortc-26981", kind: "trial", name: "EORTC 26981 / NCIC CE.3 (Stupp trial)", nct: "NCT00006353", phase: "3", status: "positive", yearReported: 2005, sponsor: "EORTC / NCIC", asOf,
    setting: "Newly diagnosed glioblastoma: radiotherapy + concurrent and adjuvant temozolomide vs radiotherapy alone",
    tldr: "The 2005 trial that set the treatment every glioblastoma patient still receives. Nothing has replaced it in twenty years.",
    summary: "EORTC 26981 with NCIC CE.3, the Stupp trial, NCT00006353, reported in 2005, set the treatment every glioblastoma patient still receives: radiotherapy with concurrent and adjuvant temozolomide, which nothing has replaced in twenty years. It randomised 573 patients with newly diagnosed glioblastoma to radiotherapy with or without temozolomide, met its primary overall survival endpoint, and its five-year update in 2009 showed a small but real minority of long-term survivors, while the companion analysis by Hegi showed that MGMT promoter methylation predicts benefit. OnCo links it to temozolomide, the MGMT promoter methylation term, Martin J. van den Bent, Monika E. Hegi, Michael Weller and Roger Stupp, and to the brain as a bottleneck. The Stupp regimen has been the control arm of every glioblastoma trial since, and whether anything can beat it remains the field's central question.",
    result: "OS 14.6 vs 12.1 months, HR 0.63.",
    drugs: ["temozolomide"], cancers: ["glioblastoma"], technologies: ["imrt-igrt"], terms: ["mgmt"], links: [ct("NCT00006353")], people: ["martin-van-den-bent", "monika-hegi", "michael-weller", "roger-stupp"],
  },
  {
    id: "ef-14", kind: "trial", name: "EF-14", nct: "NCT00916409", phase: "3", status: "positive", yearReported: 2015, sponsor: "Novocure", asOf,
    setting: "Newly diagnosed glioblastoma after chemoradiation: TTFields + maintenance temozolomide vs temozolomide alone",
    tldr: "The trial that made a wearable electric-field device part of glioblastoma care, extending median survival by about five months.",
    summary: "EF-14, trial NCT00916409 sponsored by Novocure and reported in 2015, made a wearable electric-field device part of glioblastoma care by extending median survival by about five months when added to maintenance temozolomide. It randomised 695 patients with newly diagnosed glioblastoma after chemoradiation, open-label, to tumour treating fields plus temozolomide or temozolomide alone, met its primary progression-free survival endpoint, improved overall survival and was stopped early for efficacy, with benefit correlating with hours of device use. OnCo links it to tumour treating fields, the Optune device record, temozolomide, Novocure, Roger Stupp and the brain as a bottleneck. The trial is debated for its lack of a sham control and has no independent randomised replication, so whether the effect is real or partly an artefact of design is the open question.",
    result: "OS 20.9 vs 16.0 months, HR 0.63.",
    drugs: ["optune", "temozolomide"], cancers: ["glioblastoma"], technologies: ["ttfields"], companies: ["novocure"], links: [ct("NCT00916409")], people: ["roger-stupp"],
  },
  {
    id: "indigo", kind: "trial", name: "INDIGO", nct: "NCT04164901", phase: "3", status: "positive", yearReported: 2023, sponsor: "Servier", asOf,
    setting: "Residual or recurrent grade 2 IDH-mutant astrocytoma or oligodendroglioma after surgery, no prior RT/chemo: vorasidenib vs placebo",
    tldr: "The first targeted-therapy win in low-grade brain tumours: a pill that more than doubled the time before the tumour grew, delaying radiation and chemotherapy by years.",
    summary: "INDIGO, trial NCT04164901 sponsored by Servier and reported in 2023, delivered the first targeted-therapy win in low-grade brain tumours: the IDH inhibitor vorasidenib more than doubled the time before residual or recurrent grade 2 IDH-mutant glioma grew, delaying radiotherapy and chemotherapy by years. It randomised 331 patients with astrocytoma or oligodendroglioma after surgery and no prior radiotherapy or chemotherapy to vorasidenib or placebo, met its primary progression-free survival endpoint by blinded review with a large effect, sharply reduced the need for the next intervention, and led to FDA approval in August 2024. OnCo links it to IDH1 and IDH2 as targets, the mutant IDH pathway, Ingo K. Mellinghoff, Patrick Y. Wen and the brain as a bottleneck. Its long-term effect on survival and on malignant transformation is pending, which is the open question.",
    result: "PFS 27.7 vs 11.1 months, HR 0.39.",
    drugs: ["vorasidenib"], cancers: ["glioblastoma"], targets: ["idh"], links: [ct("NCT04164901")], people: ["ingo-mellinghoff", "patrick-wen"],
  },
  {
    id: "checkmate-548", kind: "trial", name: "CheckMate 548 & CheckMate 143 & CheckMate 498", nct: "NCT02667587", phase: "3", status: "negative", yearReported: 2020, sponsor: "BMS", asOf,
    setting: "Glioblastoma: nivolumab added to standard therapy (newly diagnosed, MGMT-methylated CM548; MGMT-unmethylated vs temozolomide CM498) and nivolumab vs bevacizumab at recurrence (CM143)",
    tldr: "CheckMate 548, 143 and 498 were three large trials, all negative: the immunotherapy that transformed melanoma and lung cancer did nothing in glioblastoma.",
    summary: "CheckMate 143 (recurrent, n=369): OS 9.8 vs 10.0 months with bevacizumab. CheckMate 498 (unmethylated, nivolumab replacing temozolomide): OS 13.4 vs 14.9 months, worse. CheckMate 548 (methylated, nivolumab added): no PFS or OS benefit. Explanations: low mutational burden, T-cell exclusion behind the blood-brain barrier, steroid immunosuppression, systemic lymphopenia. Neoadjuvant PD-1 (Cloughesy 2019) showed immune activation and remains the only encouraging signal.",
    result: "No OS benefit in any of the three trials.",
    drugs: ["nivolumab", "bevacizumab-glioma", "temozolomide"], cancers: ["glioblastoma"], targets: ["pd1"], technologies: ["checkpoint-inhibitor"], terms: ["cold-vs-hot", "blood-brain-barrier"], links: [ct("NCT02667587")],
  },
  {
    id: "act-iv", kind: "trial", name: "ACT IV", nct: "NCT01480479", phase: "3", status: "negative", yearReported: 2016, sponsor: "Celldex Therapeutics", asOf,
    setting: "Newly diagnosed EGFRvIII+ glioblastoma with minimal residual disease: rindopepimut + temozolomide vs control (KLH) + temozolomide",
    tldr: "ACT IV was a double-blind phase 3 test of rindopepimut, a vaccine against the EGFRvIII mutant protein, in 745 patients with newly diagnosed glioblastoma. It showed no benefit over a control vaccine, and because both arms beat historical expectations it taught the field how misleading historical-control comparisons can be.",
    summary: "ACT IV, trial NCT01480479 sponsored by Celldex Therapeutics and reported in 2016, was a double-blind test of the EGFRvIII vaccine rindopepimut in newly diagnosed glioblastoma with minimal residual disease that showed no benefit, and it taught the field how misleading historical-control comparisons can be. It randomised 745 patients to rindopepimut or a control vaccine with temozolomide and found no difference in overall survival, while both arms outperformed historical expectations and EGFRvIII was lost at recurrence in most patients whichever arm they were in. OnCo links it to EGFR as a target, the EGFRvIII term, rindopepimut and the brain as a bottleneck, and the trial failed to replicate the phase 2 ACT III signal. Whether a single-antigen vaccine can ever work against a target the tumour so readily discards is the question its failure answered in the negative.",
    result: "OS 20.1 vs 20.0 months; no benefit.",
    drugs: ["rindopepimut"], cancers: ["glioblastoma"], targets: ["egfr"], terms: ["egfrviii"], links: [ct("NCT01480479")],
  },

  // ======================= TECHNOLOGIES =======================
  {
    id: "litt", kind: "technology", name: "Laser interstitial thermal therapy (LITT)", sections: ["surgery"], status: "established", asOf,
    tldr: "Laser interstitial thermal therapy guides a laser fibre through a small skull hole, monitored by real-time MRI, to heat and destroy deep brain tumours a surgeon could not safely reach.",
    summary: "MRI thermometry-guided ablation (NeuroBlate, Visualase) for deep-seated or recurrent gliomas, radiation necrosis, and brain metastases. Case series suggest survival comparable to resection for selected recurrent glioblastoma; may transiently open the blood-brain barrier, enabling drug delivery (LAANTERN registry, phase 2 combinations with immunotherapy). No randomised evidence yet.",
    principle: "Stereotactically placed laser fibre delivers thermal energy; MR thermometry maps the ablation zone in real time.",
    strengths: ["Minimally invasive access to deep lesions", "Short hospital stay", "Possible BBB disruption for adjuvant drugs"],
    limitations: ["Lesion size limit (~3 cm)", "Oedema after ablation", "No randomised trials"],
    technologies: ["mri", "thermal-ablation"], cancers: ["glioblastoma"], terms: ["blood-brain-barrier"], links: [{ label: "Kamath et al., Glioblastoma treated with MRI-guided laser interstitial thermal therapy: safety, efficacy and outcomes (Neurosurgery 2018)", url: "https://doi.org/10.1093/neuros/nyy375" }],
  },
  {
    id: "bbb-focused-ultrasound", links: [{ label: "Mainprize et al., Blood-brain barrier opening in primary brain tumours with non-invasive MR-guided focused ultrasound (Scientific Reports 2019)", url: "https://doi.org/10.1038/s41598-018-36340-0" }], kind: "technology", name: "Focused-ultrasound blood-brain barrier opening", sections: ["devices", "surgery"], status: "phase-2", asOf,
    tldr: "Sound waves plus microbubbles briefly open the brain's protective barrier so chemotherapy or antibodies can get to the tumour.",
    summary: "MR-guided (Insightec Exablate) or implantable (Carthera SonoCloud-9) ultrasound with intravenous microbubbles transiently and reversibly opens the BBB. Phase 1/2 trials show 4-6x higher brain concentrations of carboplatin, temozolomide, and albumin-bound paclitaxel, and enable liquid biopsy of glioma DNA released into blood. Efficacy trials (SonoCloud-9 with carboplatin, phase 3 SONOBIRD) are underway.",
    principle: "Acoustic cavitation of circulating microbubbles mechanically loosens endothelial tight junctions for several hours.",
    strengths: ["Non-invasive or single implant", "Drug-agnostic delivery enhancement", "Enables brain liquid biopsy"],
    limitations: ["Volume treated per session", "Efficacy unproven", "Repeated sessions needed"],
    technologies: ["hifu-histotripsy", "mri", "liquid-biopsy"], companies: ["insightec"], cancers: ["glioblastoma"], terms: ["blood-brain-barrier"],
  },
  {
    id: "glioma-car-t", links: [{ label: "Majzner et al., GD2-CAR T cell therapy for H3K27M-mutated diffuse midline gliomas (Nature 2022)", url: "https://doi.org/10.1038/s41586-022-04489-4" }, { label: "Brown et al., Regression of glioblastoma after IL13Ralpha2 CAR T-cell therapy (NEJM 2016)", url: "https://doi.org/10.1056/NEJMoa1610497" }], kind: "technology", name: "CAR-T for glioma (IL13Rα2, GD2, EGFRvIII, multi-target)", sections: ["cell-therapy"], status: "phase-1", asOf,
    tldr: "Engineered immune cells delivered directly into the brain or spinal fluid. Some children with diffuse midline glioma, a brainstem tumour with no curative treatment, have had striking, if temporary, responses.",
    summary: "City of Hope IL13Rα2 CAR-T (intraventricular; one complete response 2016, phase 1 of 65 patients 2024 with 50% stable disease or better). Stanford GD2 CAR-T for H3K27M diffuse midline glioma (Majzner/Monje; Nature 2022 and 2024: radiographic and clinical improvement in most, one durable complete response). Penn EGFRvIII CAR-T showed antigen loss; dual-target CARv3-TEAM-E (MGH, 2024-26) and multi-antigen and locoregional approaches follow. Barriers: heterogeneity, antigen loss, exhaustion, neurotoxicity in a closed space.",
    principle: "Locoregional (intraventricular or intratumoural) delivery of CAR-T against glioma-restricted antigens, often repeated.",
    strengths: ["Bypasses BBB via direct CNS delivery", "Proof of activity in DIPG and recurrent GBM"],
    limitations: ["Transient responses, antigen escape", "Tumour inflammation-associated neurotoxicity (TIAN)", "Manufacturing and repeat dosing logistics"],
    technologies: ["car-t", "armored-car"], cancers: ["glioblastoma", "neuroblastoma"], institutions: ["city-of-hope", "stanford", "mgh", "penn-abramson"], targets: ["egfr"], terms: ["h3k27m", "egfrviii"],
  },

  // ======================= TERMS =======================
  {
    id: "mgmt", kind: "term", name: "MGMT promoter methylation", category: "Biomarkers", asOf, wikipedia: W("O-6-methylguanine-DNA_methyltransferase"),
    tldr: "A chemical switch that turns off a DNA-repair gene. When it is off, temozolomide works much better.",
    summary: "O6-methylguanine-DNA methyltransferase repairs the lesion temozolomide creates; promoter methylation silences it in ~40% of glioblastomas. Methylated: median OS ~23 months with chemoradiation; unmethylated: ~13 months with minimal temozolomide benefit, so unmethylated patients are the priority for novel-agent trials (e.g., CheckMate 498, which failed). Assay (MSP, pyrosequencing, methylation array) and cut-off variability persist.",
    cancers: ["glioblastoma"], drugs: ["temozolomide"], technologies: ["methylation-profiling"], links: [{ label: "Wikipedia", url: W("O-6-methylguanine-DNA_methyltransferase") }],
  },
  {
    id: "h3k27m", kind: "term", name: "H3 K27M (diffuse midline glioma)", category: "Biomarkers", asOf, wikipedia: W("Diffuse_midline_glioma"),
    tldr: "A single change in a histone protein that defines diffuse midline glioma, the childhood brain tumour with the fewest treatment options, and now the target of the first approved drug for it.",
    summary: "Lysine-to-methionine mutation at position 27 of histone H3 (H3F3A or HIST1H3B) causes global loss of H3K27 trimethylation. Defines WHO grade 4 diffuse midline glioma (including DIPG), median survival ~11 months, radiotherapy the only proven therapy until dordaviprone (2025). GD2 is overexpressed, enabling CAR-T.",
    cancers: ["glioblastoma"], drugs: ["dordaviprone"], technologies: ["glioma-car-t", "methylation-profiling"], links: [{ label: "Wikipedia", url: W("Diffuse_midline_glioma") }],
  },
  {
    id: "egfrviii", kind: "term", name: "EGFRvIII", category: "Biomarkers", asOf, wikipedia: W("EGFRvIII"),
    tldr: "EGFRvIII is a mutant, tumour-only version of the EGFR receptor found in about a third of glioblastomas. It is an ideal-looking target, yet every drug against it has failed so far.",
    summary: "In-frame deletion of exons 2-7 creating a constitutively active receptor with a tumour-specific junctional epitope. Targeted by rindopepimut (ACT IV negative), EGFRvIII CAR-T (antigen loss), bispecifics (AMG 596), and ADCs (depatuxizumab mafodotin, INTELLANCE-1 negative). Expression is heterogeneous and frequently lost at recurrence.",
    cancers: ["glioblastoma"], targets: ["egfr"], drugs: ["rindopepimut"], trials: ["act-iv"], terms: ["resistance"], links: [{ label: "Wikipedia", url: W("EGFRvIII") }],
  },
  {
    id: "blood-brain-barrier", kind: "term", name: "Blood-brain barrier (BBB)", category: "Biology", asOf, wikipedia: W("Blood–brain_barrier"),
    tldr: "The tight seal around brain blood vessels that keeps most drugs out, one of the two main reasons brain cancer is so hard to treat.",
    summary: "Endothelial tight junctions, efflux transporters (P-gp, BCRP), and pericytes exclude most antibodies and all but small, lipophilic small molecules. Glioblastoma disrupts the barrier heterogeneously (contrast enhancement) but infiltrating cells sit behind intact barrier. Strategies: lipophilic/small brain-penetrant drugs (temozolomide, lomustine, dordaviprone, vorasidenib), locoregional delivery (CAR-T, convection-enhanced), focused-ultrasound opening, LITT, and intra-arterial delivery.",
    cancers: ["glioblastoma"], technologies: ["bbb-focused-ultrasound", "litt", "glioma-car-t"], terms: ["efflux-pump"], links: [{ label: "Wikipedia", url: W("Blood–brain_barrier") }],
  },

  // ======================= COMPANIES =======================
  {
    id: "day-one-biopharmaceuticals", links: [{ label: "Official website", url: "https://www.dayonebio.com" }], kind: "company", name: "Day One Biopharmaceuticals", hq: "Brisbane, CA", country: "US", companyType: "biotech", website: "https://www.dayonebio.com", ticker: "DAWN", asOf,
    tldr: "Paediatric-first oncology company whose tovorafenib became the first targeted therapy for childhood low-grade glioma.",
    summary: "Day One Biopharmaceuticals, based in Brisbane, California, and listed as DAWN, is a paediatric-first oncology company whose tovorafenib became the first targeted therapy for childhood low-grade glioma. Ojemda, its brand of tovorafenib, was approved in the United States in 2024 on the FIREFLY-1 trial, Ipsen holds the rights outside the United States, the LOGGIPY-2 phase 3 tests it in the first-line setting, and pimasertib, a MEK inhibitor, is being developed in combinations. OnCo links it to glioma and paediatric low-grade glioma and to the bottleneck of rare and paediatric cancers without markets, which its model of developing drugs for children first is meant to answer. Whether a company can sustain itself on paediatric indications alone is the open question. Tovorafenib has its own page.",
    drugs: ["tovorafenib"], cancers: ["glioblastoma"],
  },
  {
    id: "northwest-biotherapeutics", links: [{ label: "Official website", url: "https://nwbio.com" }], kind: "company", name: "Northwest Biotherapeutics", hq: "Bethesda, MD", country: "US", companyType: "cell-therapy", website: "https://nwbio.com", ticker: "NWBO", asOf,
    tldr: "Northwest Biotherapeutics developed the DCVax-L dendritic cell vaccine for glioblastoma and is seeking UK approval on contested phase 3 data.",
    summary: "Northwest Biotherapeutics, based in Bethesda and listed as NWBO, developed DCVax-L, a dendritic cell vaccine for glioblastoma made from a patient's own tumour and immune cells, and is seeking UK approval on contested phase 3 data. Its application to the MHRA was filed in December 2023 and remains pending, manufacturing is based at Sawston in the United Kingdom, and the product is not approved by the FDA. OnCo links it to glioma and glioblastoma and to the DCVax-L drug record, where the trial design debate is covered. Whether a regulator will accept a phase 3 whose design and analysis are disputed is the open question, and the answer will matter beyond this one product. DCVax-L has its own page.",
    drugs: ["dcvax-l"], cancers: ["glioblastoma"],
  },

  // ======================= IDEAS =======================
  {
    id: "idea-neoadjuvant-io-glioblastoma", links: [{ label: "ClinicalTrials.gov NCT02667587: CheckMate 548 & CheckMate 143 & CheckMate 498", url: "https://clinicaltrials.gov/study/NCT02667587" }], kind: "idea", name: "Neoadjuvant immunotherapy with surgical window for glioblastoma", maturity: "early-clinical", asOf,
    tldr: "Give immunotherapy before surgery rather than after, so the tumour is still present to teach the immune system, then look inside it to learn what happened.",
    summary: "A Nature Medicine 2019 study by Cloughesy and colleagues showed that neoadjuvant pembrolizumab in recurrent glioblastoma increased interferon signatures and T-cell clonal expansion and was associated with longer OS than adjuvant-only in a small randomised study, the only positive checkpoint signal in the disease. Window-of-opportunity designs (GESTALT, ASCO 2026) show feasibility.",
    hypothesis: "Neoadjuvant PD-1 blockade ± vaccine or CAR-T, with steroid minimisation, improves OS in recurrent glioblastoma compared with adjuvant-only administration.",
    rationale: "Antigen supply from intact tumour, tissue-based pharmacodynamic read-outs, and avoidance of post-operative lymphopenia and dexamethasone.",
    test: "Randomised phase 2 neoadjuvant-plus-adjuvant versus adjuvant-only PD-1 in resectable recurrent GBM with mandated steroid protocols; OS primary, tissue immune correlates secondary.",
    drugs: ["pembrolizumab", "nivolumab"], cancers: ["glioblastoma"], technologies: ["checkpoint-inhibitor", "glioma-car-t"], trials: ["checkmate-548"], terms: ["neoadjuvant-adjuvant", "cold-vs-hot"],
  },
  {
    id: "idea-fus-plus-adc-glioma", links: [{ label: "Sonabend et al., Repeated blood-brain barrier opening with an implantable ultrasound device for delivery of albumin-bound paclitaxel in glioblastoma (Lancet Oncology 2023)", url: "https://doi.org/10.1016/S1470-2045(23)00112-2" }], kind: "idea", name: "Focused-ultrasound BBB opening to deliver ADCs and radioligands to glioma", maturity: "preclinical-evidence", asOf,
    tldr: "Brain tumours have targets that ADCs could hit, but antibodies cannot cross the barrier. Open the barrier with ultrasound first.",
    summary: "Depatuxizumab mafodotin (EGFR ADC) failed in INTELLANCE-1 partly through poor CNS penetration. Focused ultrasound raises antibody delivery several-fold in humans (Insightec, Carthera trials). Combining BBB opening with EGFR/EGFRvIII or B7-H3 ADCs, or with 177Lu/225Ac radioconjugates, is untested clinically.",
    hypothesis: "Opening the blood-brain barrier with focused ultrasound immediately before ADC or radioconjugate infusion achieves therapeutic intratumoural concentrations and objective responses in recurrent glioblastoma.",
    rationale: "Mechanism-agnostic delivery boost; targets (EGFR, B7-H3, IL13Rα2) are validated; payload potency compensates for limited volume.",
    test: "Phase 1 with paired pre/post-opening tumour sampling at re-resection measuring ADC concentration; expansion cohort with RANO response.",
    technologies: ["bbb-focused-ultrasound", "adc", "radioimmunotherapy"], cancers: ["glioblastoma"], targets: ["egfr", "b7h3"], terms: ["blood-brain-barrier"],
  },
];

const spike: Spike = {
  cancerId: "glioblastoma",
  entities,
  patch: {
    asOf,
    summary: "Gliomas are classified by the WHO 2021 system on molecular grounds: IDH-wild-type glioblastoma (grade 4, ~50% of gliomas, median age 65, median survival ~15 months with maximal therapy), IDH-mutant astrocytoma (grades 2-4) and 1p/19q-codeleted oligodendroglioma (better prognosis, decades of survival possible), and paediatric-type tumours including H3 K27M-mutant diffuse midline glioma (median survival ~11 months) and BRAF-altered low-grade glioma (the commonest childhood brain tumour, rarely life-threatening but chronically disabling). The two shared barriers are the blood-brain barrier, which excludes most drugs, and diffuse infiltration, which makes complete resection impossible.\n\nGlioblastoma treatment has been static since 2005: maximal safe resection (improved by 5-ALA fluorescence, intraoperative MRI, and awake mapping), radiotherapy with concurrent and adjuvant temozolomide (Stupp), and tumour treating fields (EF-14). MGMT promoter methylation predicts temozolomide benefit; unmethylated patients derive little. Every major systemic trial since has failed: bevacizumab (PFS only), rindopepimut (ACT IV), nivolumab (CheckMate 143, 498, 548), depatuxizumab mafodotin (INTELLANCE-1), and many more. At recurrence, lomustine, re-resection, re-irradiation, LITT, and bevacizumab for oedema are the options, with median survival under a year. DCVax-L's externally controlled phase 3 remains contested.\n\nProgress has come at the edges. Vorasidenib (INDIGO, approved 2024) is the first targeted therapy for grade 2 IDH-mutant glioma, delaying radiation and chemotherapy by years. Tovorafenib (2024) is the first targeted therapy for BRAF-altered paediatric low-grade glioma. Dordaviprone (August 2025) is the first drug approved for H3 K27M diffuse midline glioma. Methylation-based classification and intraoperative nanopore sequencing have transformed diagnosis. For glioblastoma itself the most promising directions are locoregional CAR-T (IL13Rα2, GD2, multi-target), focused-ultrasound and LITT-based barrier opening to deliver ADCs, radioconjugates, and chemotherapy, neoadjuvant immunotherapy with window designs, personalised neoantigen vaccines (NeoVax), and combinations built on the unmethylated-MGMT population where temozolomide adds nothing.",
    subtypes: ["Glioblastoma, IDH-wild-type (WHO grade 4; TERT promoter, EGFR amplification, +7/−10)", "Astrocytoma, IDH-mutant (grades 2-4; CDKN2A/B deletion defines grade 4)", "Oligodendroglioma, IDH-mutant and 1p/19q-codeleted (grades 2-3)", "Diffuse midline glioma, H3 K27M-altered (including DIPG)", "Paediatric low-grade glioma (BRAF fusion or V600E, NF1)", "Diffuse hemispheric glioma H3 G34-mutant; infant-type hemispheric glioma (NTRK/ALK/ROS1 fusions)"],
    biomarkers: ["IDH1/2 mutation (vorasidenib eligibility)", "1p/19q codeletion", "MGMT promoter methylation (temozolomide benefit)", "H3 K27M (dordaviprone eligibility)", "BRAF fusion / V600E (tovorafenib, dabrafenib-trametinib)", "TERT promoter, EGFR amplification, +7/−10 (molecular glioblastoma)", "CDKN2A/B homozygous deletion (grade 4 astrocytoma)", "DNA methylation class (Heidelberg classifier)", "NTRK/ALK/ROS1 fusions (infant gliomas)", "TMB / mismatch repair (rare hypermutant, IO-responsive)"],
    standardOfCare: [
      { setting: "Diagnosis", approach: "MRI with contrast; maximal safe resection with 5-ALA and intraoperative mapping; integrated histo-molecular diagnosis with methylation classification where available.", refs: ["mri", "fluorescence-guided-surgery", "methylation-profiling"] },
      { setting: "Glioblastoma, newly diagnosed", approach: "Radiotherapy 60 Gy (hypofractionated in elderly) with concurrent and 6 cycles adjuvant temozolomide; TTFields with maintenance temozolomide; trials for MGMT-unmethylated patients.", refs: ["eortc-26981", "temozolomide", "ef-14", "optune", "imrt-igrt", "mgmt"] },
      { setting: "Glioblastoma, recurrent", approach: "Re-resection or LITT if feasible; lomustine; bevacizumab for oedema/steroid sparing; re-irradiation; clinical trial (CAR-T, FUS-BBB, vaccines) strongly preferred.", refs: ["lomustine", "bevacizumab-glioma", "litt", "glioma-car-t", "bbb-focused-ultrasound", "sbrt"] },
      { setting: "IDH-mutant grade 2 glioma", approach: "Maximal resection; vorasidenib for residual/recurrent disease (INDIGO); radiotherapy plus PCV or temozolomide for high-risk or progressive disease.", refs: ["vorasidenib", "indigo"] },
      { setting: "Oligodendroglioma grade 3 / astrocytoma grade 3", approach: "Radiotherapy plus PCV (RTOG 9402, EORTC 26951) or temozolomide (CATNON).", refs: ["temozolomide", "imrt-igrt"] },
      { setting: "H3 K27M diffuse midline glioma", approach: "Radiotherapy; dordaviprone at progression (2025); GD2 CAR-T and ONC201 first-line trials.", refs: ["dordaviprone", "glioma-car-t"] },
      { setting: "Paediatric low-grade glioma", approach: "Resection where safe; chemotherapy (carboplatin/vincristine) or tovorafenib / dabrafenib-trametinib for BRAF-altered relapsed disease; avoid radiation in young children.", refs: ["tovorafenib"] },
    ],
    stateOfArt: [
      "Three first-in-class targeted approvals for glioma subtypes in 2024-25: vorasidenib (IDH-mutant), tovorafenib (BRAF paediatric), dordaviprone (H3 K27M).",
      "Molecular classification (WHO 2021, methylation classifier, intraoperative nanopore) now defines diagnosis.",
      "Locoregional CAR-T produces objective responses in recurrent glioblastoma and DIPG, though transient.",
      "Focused ultrasound opens the blood-brain barrier in humans with 4-6x higher drug delivery; efficacy trials underway.",
    ],
    history: [
      { year: 1926, title: "Bailey and Cushing classify gliomas", note: "Histologic classification that lasted, in essence, until 2016." },
      { year: 1978, title: "Radiotherapy proven to extend survival (BTSG)", note: "Whole-brain then involved-field radiation becomes standard.", refs: ["imrt-igrt"] },
      { year: 1999, title: "Temozolomide approved (anaplastic astrocytoma)", refs: ["temozolomide"] },
      { year: 2008, title: "IDH1 mutations discovered in glioma", note: "Parsons/Vogelstein glioblastoma genome sequencing; reclassification follows.", refs: ["idh"] },
      { year: 2009, title: "Bevacizumab accelerated approval at recurrence", note: "Radiographic response without survival benefit.", refs: ["bevacizumab-glioma"] },
      { year: 2014, title: "AVAglio / RTOG 0825: bevacizumab no OS benefit; 5-ALA and methylation classifier emerge", refs: ["bevacizumab-glioma", "fluorescence-guided-surgery", "methylation-profiling"] },
      { year: 2016, title: "WHO 2016 integrates molecular markers; ACT IV vaccine fails", refs: ["act-iv", "rindopepimut"] },
      { year: 2017, title: "CheckMate 143: immunotherapy fails at recurrence", refs: ["checkmate-548"] },
      { year: 2021, title: "WHO 2021: IDH-wild-type glioblastoma defined molecularly" },
      { year: 2022, title: "GD2 CAR-T responses in DIPG (Stanford)", refs: ["glioma-car-t"] },
      { year: 2023, title: "INDIGO: vorasidenib in grade 2 IDH-mutant glioma; DCVax-L contested publication", refs: ["indigo", "dcvax-l"] },
      { year: 2025, title: "Dordaviprone approved for H3 K27M diffuse midline glioma", note: "6 August 2025; first systemic therapy for the disease.", refs: ["dordaviprone"] },
      { year: 2026, title: "ASCO 2026: NeoVax personalised vaccine immune responses; multi-target CAR-T; tovorafenib EU approval", refs: ["tovorafenib", "glioma-car-t", "idea-neoadjuvant-io-glioblastoma"] },
    ],
    pipeline: ["glioma-car-t", "bbb-focused-ultrasound", "litt", "dcvax-l", "dordaviprone", "tovorafenib", "idea-neoadjuvant-io-glioblastoma", "idea-fus-plus-adc-glioma", "neoantigen-mrna-vaccine", "in-vivo-car-t"],
    openProblems: [
      "Glioblastoma's standard has not changed since 2005: every phase 3 systemic agent since temozolomide has failed, so median survival has not moved in 20 years.",
      "MGMT-unmethylated glioblastoma (~60%) gains almost nothing from chemotherapy and has no approved alternative.",
      "Blood-brain barrier and diffuse infiltration limit delivery and resection; imaging cannot distinguish progression from pseudoprogression reliably.",
      "Immunotherapy failure: low TMB, T-cell exclusion, dexamethasone, and treatment-induced lymphopenia; neoadjuvant approaches are the only signal.",
      "Antigen heterogeneity and loss (EGFRvIII, IL13Rα2) undermine single-target vaccines, ADCs, and CAR-T.",
      "Paediatric tumours (DIPG) have one approved drug with 22% response; durable control remains out of reach.",
      "Trial design: single-arm and external-control comparisons (DCVax-L, historical vaccine data) have repeatedly misled the field.",
    ],
    targets: ["idh", "egfr", "tp53", "braf", "pd1", "vegf", "b7h3"],
    technologies: ["imrt-igrt", "proton-therapy", "ttfields", "fluorescence-guided-surgery", "methylation-profiling", "litt", "bbb-focused-ultrasound", "glioma-car-t", "car-t", "epigenetic-drugs", "kinase-inhibitors", "cytotoxic-chemotherapy", "antiangiogenic", "shared-antigen-vaccine", "neoantigen-mrna-vaccine", "mri", "hyperthermia", "bnct"],
    pathways: ["ras-mapk", "p53-cell-cycle", "vegf-angiogenesis", "pd1-checkpoint", "pi3k-akt-mtor"],
    companies: ["servier", "novocure", "jazz", "day-one-biopharmaceuticals", "ipsen", "insightec", "northwest-biotherapeutics", "roche-genentech", "bms"],
    institutions: ["city-of-hope", "stanford", "mgh", "penn-abramson", "heidelberg-nct", "dkfz", "curie-nki-eortc"],
    terms: ["mgmt", "h3k27m", "egfrviii", "blood-brain-barrier", "cold-vs-hot", "accelerated-approval"],
    trials: ["eortc-26981", "ef-14", "indigo", "checkmate-548", "act-iv"],
    related: ["cell-therapy-roadmap", "immunotherapy-roadmap"],
    tags: ["spike", "cns"],
  },
};

export default spike;

import type { DrugInput, EntityInput, IdeaInput, PairingInput, TechnologyInput, TermInput, TrialInput } from "@/lib/schema";
import type { Spike } from "./index";

/**
 * Mesothelioma spike. Facts checked 2026-09-07 against trial publications, the FDA approval
 * notice for pembrolizumab (September 2024), and MARS 2 (Lancet Respiratory Medicine 2024).
 */
const asOf = "2026-09-07";
const W = (s: string) => `https://en.wikipedia.org/wiki/${s}`;
const ct = (nct: string) => ({ label: `ClinicalTrials.gov ${nct}`, url: `https://clinicaltrials.gov/study/${nct}` });

type T = Omit<TrialInput, "kind" | "asOf">;
const t = (x: T): TrialInput => ({ kind: "trial", asOf, ...x });
type D = Omit<DrugInput, "kind" | "asOf">;
const d = (x: D): DrugInput => ({ kind: "drug", asOf, ...x });

const trials: TrialInput[] = [
  t({ id: "checkmate-743", name: "CheckMate 743", nct: "NCT02899299", phase: "3", status: "positive", yearReported: 2020, sponsor: "BMS", enrolled: 605,
    setting: "Unresectable pleural mesothelioma, first line: nivolumab + ipilimumab vs platinum-pemetrexed",
    tldr: "CheckMate 743 was the first immunotherapy trial to lengthen survival in mesothelioma, and gave the first new first-line option in 16 years.",
    summary: "CheckMate 743, trial NCT02899299 sponsored by Bristol Myers Squibb and reported in 2020, was the first immunotherapy trial to lengthen survival in unresectable pleural mesothelioma, giving the first new first-line option in sixteen years. It randomised 605 patients to nivolumab plus ipilimumab or platinum and pemetrexed, met its primary overall survival endpoint with a durable minority alive at five years and the largest benefit in non-epithelioid histology, and led to FDA approval in October 2020 with severe treatment-related events in about a third. OnCo links it to mesothelioma, nivolumab, ipilimumab, pemetrexed, the histology term, Paul Baas, Solange Peters and the pairing of histology with first-line choice. Whether epithelioid patients gain enough to justify dual immunotherapy over chemotherapy combinations is the open question.",
    result: "OS 18.1 vs 14.1 months, HR 0.74; 5-year OS 14% vs 6%.",
    outcomes: [
      { endpoint: "Overall survival", primary: true, unit: "months", arms: [{ name: "Nivolumab + ipilimumab", n: 303, value: 18.1 }, { name: "Platinum + pemetrexed", n: 302, value: 14.1 }], hr: 0.74, ci: [0.60, 0.91], p: "0.002", source: "https://pubmed.ncbi.nlm.nih.gov/33485464/" },
      { endpoint: "5-year overall survival rate", unit: "%", arms: [{ name: "Nivolumab + ipilimumab", value: 14 }, { name: "Platinum + pemetrexed", value: 6 }], hr: 0.74, ci: [0.62, 0.88], source: "https://ascopubs.org/doi/10.1200/JCO-25-01328" },
    ],
    replication: "Single phase 3; consistent direction in the phase 2 MAPS2 and INITIATE studies of second-line nivolumab-ipilimumab.",
    drugs: ["nivolumab", "ipilimumab", "pemetrexed"], cancers: ["mesothelioma"], terms: ["epithelioid-vs-sarcomatoid"], links: [ct("NCT02899299")], people: ["paul-baas", "solange-peters"] }),
  t({ id: "keynote-483", name: "IND.227 / KEYNOTE-483", nct: "NCT02784171", phase: "2/3", status: "positive", yearReported: 2023, sponsor: "Canadian Cancer Trials Group / Merck", enrolled: 440,
    setting: "Unresectable pleural mesothelioma, first line: pembrolizumab + platinum-pemetrexed vs platinum-pemetrexed",
    tldr: "Showed that adding a PD-1 blocker to standard chemotherapy helps in mesothelioma, giving a second immunotherapy-based first-line option.",
    summary: "IND.227, also KEYNOTE-483, trial NCT02784171 sponsored by the Canadian Cancer Trials Group with Merck and reported in 2023, showed that adding pembrolizumab to platinum and pemetrexed helps in unresectable pleural mesothelioma, giving a second immunotherapy-based first-line option. It randomised 440 patients, met its primary overall survival endpoint with a modest effect and a much higher response rate, with benefit again concentrated in non-epithelioid disease, and led to FDA approval on 17 September 2024; it was an academic-led trial with industry drug supply. OnCo links it to mesothelioma, pembrolizumab, pemetrexed, the epithelioid versus sarcomatoid term and the histology pairing; DREAM supported it in phase 2, but the DREAM3R phase 3 was stopped early and BEAT-meso missed survival. Whether the modest benefit holds up outside non-epithelioid disease is the open question.",
    result: "OS 17.3 vs 16.1 months, HR 0.79; ORR 52% vs 29%.",
    outcomes: [
      { endpoint: "Overall survival", primary: true, unit: "months", arms: [{ name: "Pembrolizumab + chemotherapy", n: 222, value: 17.3 }, { name: "Chemotherapy", n: 218, value: 16.1 }], hr: 0.79, ci: [0.64, 0.98], p: "0.0324", source: "https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(23)01613-6/fulltext" },
      { endpoint: "Objective response rate", unit: "%", arms: [{ name: "Pembrolizumab + chemotherapy", value: 52 }, { name: "Chemotherapy", value: 29 }], source: "https://doi.org/10.1016/S0140-6736(23)01883-4" },
    ],
    replication: "Supported by DREAM (phase 2, durvalumab + chemotherapy) but DREAM3R phase 3 was stopped early; BEAT-meso (atezolizumab + bevacizumab + chemotherapy) missed OS.",
    drugs: ["pembrolizumab", "pemetrexed"], cancers: ["mesothelioma"], links: [ct("NCT02784171"), { label: "Merck OS announcement", url: "https://www.merck.com/news/keytruda-pembrolizumab-plus-chemotherapy-significantly-improved-overall-survival-versus-chemotherapy-alone-as-first-line-treatment-for-advanced-malignant-pleural-mesothelioma/" }] }),
  t({ id: "maps", name: "MAPS", nct: "NCT00651456", phase: "2/3", status: "positive", yearReported: 2016, sponsor: "IFCT (France)", enrolled: 448,
    setting: "Unresectable pleural mesothelioma, first line: cisplatin-pemetrexed ± bevacizumab",
    tldr: "In MAPS, adding the anti-VEGF antibody bevacizumab to chemotherapy lengthened survival by about three months, the first improvement after pemetrexed.",
    summary: "MAPS, trial NCT00651456 sponsored by the French IFCT group and reported in 2016, showed that adding the anti-VEGF antibody bevacizumab to first-line cisplatin and pemetrexed in unresectable pleural mesothelioma lengthened survival by about three months, the first improvement after pemetrexed itself. It randomised 448 patients and met its primary overall survival endpoint, establishing angiogenesis as a valid target in the disease. OnCo links it to mesothelioma, anti-angiogenic therapy, VEGF as a target and pemetrexed. Bevacizumab is listed by NCCN for mesothelioma but never received an FDA indication, so use varies, and because no second phase 3 replicated it while nintedanib failed in LUME-Meso, whether the anti-angiogenic benefit is real or specific to bevacizumab is the open question.",
    result: "OS 18.8 vs 16.1 months, HR 0.77.",
    outcomes: [{ endpoint: "Overall survival", primary: true, unit: "months", arms: [{ name: "Chemotherapy + bevacizumab", n: 223, value: 18.8 }, { name: "Chemotherapy", n: 225, value: 16.1 }], hr: 0.77, ci: [0.62, 0.95], p: "0.0167", source: "https://www.thelancet.com/journals/lancet/article/PIIS0140-6736(15)01238-6/fulltext" }],
    replication: "Not replicated by a second phase 3; nintedanib (LUME-Meso) failed to reproduce the anti-angiogenic benefit.",
    drugs: ["pemetrexed"], targets: ["vegf"], technologies: ["antiangiogenic"], cancers: ["mesothelioma"], links: [ct("NCT00651456")] }),
  t({ id: "mars-2", name: "MARS 2", nct: "NCT02040272", phase: "3", status: "negative", yearReported: 2024, sponsor: "Royal Brompton / NIHR (UK)", enrolled: 335,
    setting: "Resectable pleural mesothelioma: extended pleurectomy/decortication + chemotherapy vs chemotherapy alone",
    tldr: "MARS 2 is the trial that overturned decades of surgical practice: removing the lining of the lung did not help patients live longer and left them worse off.",
    summary: "Survival was worse with surgery (HR 1.28, 95% CI 1.02-1.60; median 19.3 vs 24.8 months), with more serious adverse events and poorer quality of life. Extended pleurectomy/decortication is no longer recommended outside trials in most guidelines; MARS 1 had earlier cast doubt on extrapleural pneumonectomy.",
    result: "OS HR 1.28 favouring no surgery; median 19.3 vs 24.8 months.",
    outcomes: [{ endpoint: "Overall survival", primary: true, unit: "months", arms: [{ name: "Surgery + chemotherapy", n: 169, value: 19.3 }, { name: "Chemotherapy alone", n: 166, value: 24.8 }], hr: 1.28, ci: [1.02, 1.60], source: "https://www.thelancet.com/journals/lanres/article/PIIS2213-2600(24)00119-X/fulltext" }],
    replication: "Consistent with MARS 1 feasibility results; no trial has shown a survival benefit for radical mesothelioma surgery.",
    technologies: ["pleurectomy-decortication"], cancers: ["mesothelioma"], tags: ["lesson:surgery-without-evidence"], links: [ct("NCT02040272")], people: ["dean-fennell"] }),
  t({ id: "lume-meso", name: "LUME-Meso", nct: "NCT01907100", phase: "2/3", status: "negative", yearReported: 2019, sponsor: "Boehringer Ingelheim", enrolled: 458,
    setting: "Epithelioid pleural mesothelioma, first line: cisplatin-pemetrexed ± nintedanib",
    tldr: "LUME-Meso randomised 458 patients with epithelioid pleural mesothelioma to first-line cisplatin and pemetrexed with nintedanib or placebo. The phase 2 progression signal for the multi-kinase inhibitor vanished in phase 3, with no delay in progression and no gain in life, a lesson in the unreliability of small phase 2 signals in this disease.",
    summary: "LUME-Meso, trial NCT01907100 sponsored by Boehringer Ingelheim and reported in 2019, found that the phase 2 progression signal for the multi-kinase inhibitor nintedanib vanished in phase 3. It randomised 458 patients with epithelioid pleural mesothelioma to nintedanib or placebo with first-line cisplatin and pemetrexed and found no difference in progression-free survival and no survival benefit. OnCo links it to mesothelioma, nintedanib and pemetrexed. The record treats it as a lesson in the unreliability of small randomised phase 2 progression signals in mesothelioma, and why such signals so often fail to replicate in this disease is the open question.",
    result: "PFS HR 1.01, negative.",
    outcomes: [{ endpoint: "Progression-free survival", primary: true, unit: "months", arms: [{ name: "Nintedanib + chemotherapy", n: 229, value: 6.8 }, { name: "Placebo + chemotherapy", n: 229, value: 7.0 }], hr: 1.01, ci: [0.79, 1.30], source: "https://www.thelancet.com/journals/lanres/article/PIIS2213-2600(19)30139-0/fulltext" }],
    drugs: ["nintedanib", "pemetrexed"], cancers: ["mesothelioma"], tags: ["lesson:phase-2-pfs-signal"], links: [ct("NCT01907100")] }),
  t({ id: "beat-meso", name: "BEAT-meso (ETOP 13-18)", nct: "NCT03762018", phase: "3", status: "mixed", yearReported: 2024, sponsor: "ETOP", enrolled: 400,
    setting: "Advanced pleural mesothelioma, first line: bevacizumab + carboplatin-pemetrexed ± atezolizumab",
    tldr: "Adding atezolizumab to bevacizumab-chemotherapy slowed progression but did not lengthen survival overall; it did help patients with non-epithelioid tumours.",
    summary: "BEAT-meso, ETOP trial 13-18, NCT03762018, sponsored by ETOP and reported at ASCO 2024, tested adding atezolizumab to bevacizumab plus carboplatin and pemetrexed as first-line treatment for advanced pleural mesothelioma, and found that it slowed progression but did not lengthen survival overall, though it did help patients with non-epithelioid tumours. It randomised 400 patients, missed its primary overall survival endpoint in the whole population, improved progression-free survival, and showed a survival benefit in the pre-specified non-epithelioid subgroup with a clear interaction by histology. OnCo links it to mesothelioma, atezolizumab, pemetrexed, the epithelioid versus sarcomatoid term and the ETOP IBCSG Partners Foundation, and the non-epithelioid finding echoes CheckMate 743. Whether histology should now decide who gets immunotherapy in mesothelioma is the open question.",
    result: "OS not significantly improved overall; benefit in non-epithelioid subgroup.",
    replication: "Consistent with CheckMate 743 and IND.227 histology subgroup findings.",
    drugs: ["atezolizumab", "pemetrexed"], cancers: ["mesothelioma"], terms: ["epithelioid-vs-sarcomatoid"], links: [ct("NCT03762018"), { label: "ASCO 2024 LBA8002", url: "https://ascopubs.org/doi/10.1200/JCO.2024.42.17_suppl.LBA8002" }] }),
  t({ id: "dream3r", name: "DREAM3R", nct: "NCT04334759", phase: "3", status: "negative", yearReported: 2026, sponsor: "ALTG / PrECOG",
    setting: "Unresectable pleural mesothelioma, first line: durvalumab + platinum-pemetrexed vs chemotherapy",
    tldr: "The phase 3 test of durvalumab with chemotherapy was stopped early and did not meet its goal, despite an encouraging earlier study.",
    summary: "DREAM3R, trial NCT04334759 sponsored by ALTG and PrECOG and reported in 2026, was the phase 3 test of durvalumab with platinum and pemetrexed as first-line treatment for unresectable pleural mesothelioma, and it was stopped early without meeting its primary overall survival endpoint despite an encouraging single-arm predecessor. It followed the DREAM and PrE0505 phase 2 studies, whose signals it did not confirm, with medians and hazard ratio pending publication after presentation at ESMO 2025. OnCo links it to mesothelioma, durvalumab, pemetrexed and Anna K. Nowak. Together with the modest effect in IND.227 it suggests the chemo-immunotherapy benefit in mesothelioma is real but small and histology-dependent, so first-line immunotherapy in the disease now rests on CheckMate 743 and IND.227.",
    result: "Stopped early; primary endpoint not met.",
    drugs: ["durvalumab", "pemetrexed"], cancers: ["mesothelioma"], tags: ["lesson:single-arm-to-phase-3"], links: [ct("NCT04334759"), { label: "2026 trial landscape (MesoWatch)", url: "https://mesowatch.org/news/2026/03/mesothelioma-clinical-trial-results-compared/" }], people: ["anna-nowak"] }),
  t({ id: "stellar", name: "STELLAR", nct: "NCT02397928", phase: "2", status: "positive", yearReported: 2019, sponsor: "Novocure", enrolled: 82,
    setting: "Unresectable pleural mesothelioma, first line: TTFields (150 kHz) + platinum-pemetrexed, single arm",
    tldr: "STELLAR is the small single-arm study behind the device approval of tumour treating fields in mesothelioma.",
    summary: "STELLAR, trial NCT02397928 sponsored by Novocure and reported in 2019, is the small single-arm phase 2 behind the device approval of tumour treating fields in unresectable pleural mesothelioma. It gave 80 patients TTFields at 150 kHz with first-line platinum and pemetrexed and reported longer median survival than a historical chemotherapy control, leading to FDA approval under a Humanitarian Device Exemption in May 2019. OnCo links it to mesothelioma, tumour treating fields, the Optune device record and pemetrexed. There is no randomised confirmation, the exemption pathway carries limited evidence requirements for a rare disease, and whether the device adds anything beyond chemotherapy is the open question.",
    result: "Median OS 18.2 months (single arm) vs 12.1 historical.",
    outcomes: [{ endpoint: "Overall survival (single arm vs historical)", unit: "months", arms: [{ name: "TTFields + chemotherapy", n: 80, value: 18.2 }, { name: "Historical chemotherapy control", value: 12.1 }], source: "https://doi.org/10.1016/S1470-2045(19)30532-7" }],
    replication: "Not replicated in a randomised trial; HDE approval is for a rare disease with limited evidence requirements.",
    drugs: ["optune", "pemetrexed"], technologies: ["ttfields"], cancers: ["mesothelioma"], links: [ct("NCT02397928")] }),
];

const drugs: DrugInput[] = [
  d({ id: "pemetrexed", links: [{ label: "FDA label (DailyMed)", url: "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=Pemetrexed" }], name: "Pemetrexed", brand: "Alimta (and generics)", modality: "Cytotoxic (antifolate)", status: "approved", wikipedia: W("Pemetrexed"),
    tldr: "Pemetrexed is the chemotherapy that, with a platinum drug, became the first approved treatment for mesothelioma in 2004, and is still the backbone today.",
    summary: "Pemetrexed is a multitargeted antifolate that inhibits thymidylate synthase, DHFR and GARFT, starving cells of the nucleotides needed for DNA synthesis. In EMPHACIS (2003), cisplatin-pemetrexed gave OS 12.1 versus 9.3 months compared with cisplatin alone, the first randomised survival gain in mesothelioma, and it became the first approved treatment for the disease in 2004. It is now given with pembrolizumab (KEYNOTE-483) or bevacizumab (MAPS), and it was the chemotherapy comparator that nivolumab-ipilimumab beat in CheckMate 743. It is also standard in non-squamous NSCLC, dosed at 500 mg/m2 every 21 days with a platinum for 4 to 6 cycles, then optional maintenance. Folic acid and vitamin B12 supplementation and dexamethasone premedication are required. It remains the chemotherapy backbone in mesothelioma that newer agents are added to rather than replacing.",
    mechanism: "Multitargeted antifolate inhibiting thymidylate synthase, DHFR, and GARFT.",
    mechanismSteps: ["Enters cells via the reduced folate carrier", "Polyglutamated and retained intracellularly", "Inhibits thymidylate synthase, blocking DNA synthesis", "Preferential toxicity to rapidly dividing cells; vitamin supplementation protects normal tissue"],
    dosing: { route: "Intravenous", schedule: "500 mg/m² day 1 every 21 days with cisplatin 75 mg/m² or carboplatin AUC 5; 4-6 cycles, then optional maintenance", modifications: "Hold for creatinine clearance <45 mL/min; dexamethasone premedication for rash", monitoring: "Renal function and blood counts; folic acid and B12 supplementation" },
    toxicity: [{ event: "Neutropenia (grade 3+)", grade3PlusPct: 23 }, { event: "Fatigue", anyGradePct: 48 }, { event: "Nausea", anyGradePct: 82 }, { event: "Rash", anyGradePct: 16 }],
    approvals: [{ region: "US", year: 2004, indication: "Unresectable pleural mesothelioma with cisplatin" }, { region: "US", year: 2008, indication: "Non-squamous NSCLC first line" }],
    technologies: ["cytotoxic-chemotherapy"], cancers: ["mesothelioma", "nsclc"], trials: ["keynote-483", "maps", "checkmate-743", "gefitinib-chemo-tmh"] }),
  d({ id: "nintedanib", name: "Nintedanib", brand: "Ofev (fibrosis); Vargatef (NSCLC, EU)", modality: "Small-molecule kinase inhibitor (VEGFR/FGFR/PDGFR)", status: "approved", wikipedia: W("Nintedanib"),
    tldr: "Nintedanib is a triple angiokinase inhibitor pill (VEGFR, FGFR, PDGFR) approved for pulmonary fibrosis and, in the EU, for second-line lung adenocarcinoma with docetaxel. In mesothelioma the phase 2 part of LUME-Meso suggested slower progression in epithelioid disease, but the phase 3 part showed none, a much-cited warning about small randomised phase 2 signals.",
    summary: "Nintedanib is a triple angiokinase inhibitor of VEGFR1-3, FGFR1-3 and PDGFR alpha and beta, designed to cut off tumour blood supply and stromal signalling. It is approved for idiopathic pulmonary fibrosis and, in the EU, for second-line lung adenocarcinoma with docetaxel. In mesothelioma, the LUME-Meso phase 2 suggested a PFS benefit in epithelioid disease, but the phase 3 part of the same trial showed none, with PFS 6.8 versus 7.0 months (HR 1.01) and no OS benefit. The programme is a frequently cited lesson in how unreliable small randomised phase 2 PFS signals can be in this disease. Boehringer Ingelheim developed it, and its oncology role is now limited to the EU lung indication. A plausible mechanism and an encouraging early trial are not enough until a large trial confirms them.",
    mechanism: "Triple angiokinase inhibitor of VEGFR1-3, FGFR1-3, PDGFRα/β.",
    mechanismSteps: ["Blocks VEGFR, FGFR, and PDGFR signalling in endothelial and stromal cells", "Reduces angiogenesis and fibroblast activation", "In mesothelioma, no meaningful effect on tumour progression in phase 3"],
    approvals: [{ region: "EU", year: 2014, indication: "Adenocarcinoma NSCLC after first-line chemotherapy, with docetaxel" }, { region: "US", year: 2014, indication: "Idiopathic pulmonary fibrosis (non-oncology)" }],
    targets: ["vegf", "fgfr2"], technologies: ["antiangiogenic", "kinase-inhibitors"], companies: ["boehringer-ingelheim"], cancers: ["mesothelioma"], trials: ["lume-meso"], tags: ["failure", "lesson:phase-2-pfs-signal"], links: [{ label: "EMA: Vargatef (EPAR)", url: "https://www.ema.europa.eu/en/medicines/human/EPAR/vargatef" }, { label: "Wikipedia", url: W("Nintedanib") }] }),
];

const technologies: TechnologyInput[] = [
  { id: "pleurectomy-decortication", kind: "technology", name: "Extended pleurectomy/decortication & radical mesothelioma surgery", sections: ["surgery"], status: "historic", asOf, wikipedia: W("Pleurectomy"),
    tldr: "Pleurectomy and decortication are operations that strip the tumour-bearing lining from the lung and chest wall. They were long assumed to help; the MARS 2 trial showed they do not.",
    summary: "Extrapleural pneumonectomy (removing lung, pleura, diaphragm, pericardium) was largely abandoned after MARS 1 (2011) showed high mortality without benefit. Lung-sparing extended pleurectomy/decortication remained standard in selected centres until MARS 2 (2024) showed worse survival and quality of life with surgery plus chemotherapy than chemotherapy alone. Surgery now has a limited role: diagnosis, palliation (pleurodesis, indwelling catheters), and trials.",
    principle: "Macroscopic complete resection of parietal and visceral pleura with or without lung; usually within multimodality therapy.",
    strengths: ["Symptom relief in trapped lung", "Tissue for diagnosis and research"],
    limitations: ["No survival benefit in randomised trials", "Significant morbidity and quality-of-life cost"],
    cancers: ["mesothelioma"], trials: ["mars-2"], links: [{ label: "Wikipedia", url: W("Pleurectomy") }] },
];

const terms: TermInput[] = [
  { id: "epithelioid-vs-sarcomatoid", wikipedia: "https://en.wikipedia.org/wiki/Mesothelioma", kind: "term", name: "Epithelioid vs sarcomatoid (biphasic) mesothelioma", category: "Pathology", asOf,
    tldr: "Mesothelioma comes in a slower 'epithelioid' form and an aggressive 'sarcomatoid' form. Chemotherapy works better in the first; immunotherapy helps most in the second.",
    summary: "Epithelioid (~60-70%) has median survival 14-18 months with chemotherapy; sarcomatoid (~10-20%) and biphasic (~20%) respond poorly to chemotherapy (median OS 8-12 months) but derived the largest benefit from nivolumab-ipilimumab in CheckMate 743 (OS 18.1 vs 8.8 months) and from pembrolizumab-chemotherapy. Histology is therefore the first branch in first-line decisions. BAP1 loss is common in epithelioid tumours; CDKN2A/MTAP deletion in sarcomatoid.",
    cancers: ["mesothelioma"], trials: ["checkmate-743", "keynote-483", "beat-meso"], links: [{ label: "Wikipedia", url: "https://en.wikipedia.org/wiki/Mesothelioma" }] },
];

const pairings: PairingInput[] = [
  { id: "histology-directs-first-line-meso", links: [{ label: "ClinicalTrials.gov NCT02899299: CheckMate 743", url: "https://clinicaltrials.gov/study/NCT02899299" }, { label: "ClinicalTrials.gov NCT02784171: IND.227 / KEYNOTE-483", url: "https://clinicaltrials.gov/study/NCT02784171" }], kind: "pairing", name: "Histology → first-line choice in mesothelioma", a: "histopathology-ihc", b: "checkpoint-inhibitor", pairingType: "diagnostic-therapeutic", asOf,
    tldr: "Read the tumour type under the microscope first: non-epithelioid tumours should get immunotherapy up front; epithelioid tumours can reasonably get either immunotherapy or chemo-immunotherapy.",
    summary: "In mesothelioma the histological subtype read by histopathology and immunohistochemistry now directs the first-line choice, making this a diagnostic-therapeutic pairing. Sarcomatoid and biphasic tumours are chemoresistant but more immune-infiltrated, whereas epithelioid tumours retain sensitivity to pemetrexed-based chemotherapy. In pre-specified subgroups of CheckMate 743, nivolumab plus ipilimumab gave a large survival advantage over chemotherapy in non-epithelioid disease but only a small one in epithelioid disease, and pembrolizumab plus chemotherapy in IND.227 / KEYNOTE-483 and BEAT-meso showed the same pattern. Guidelines therefore favour immunotherapy up front for non-epithelioid tumours, while epithelioid tumours can receive either immunotherapy or chemo-immunotherapy.",
    rationale: "Sarcomatoid tumours are chemoresistant but more immune-infiltrated; epithelioid tumours retain chemosensitivity.",
    evidence: "Pre-specified subgroup analyses of two phase 3 trials plus BEAT-meso.",
    drugs: ["nivolumab", "ipilimumab", "pembrolizumab", "pemetrexed"], cancers: ["mesothelioma"], terms: ["epithelioid-vs-sarcomatoid"], trials: ["checkmate-743", "keynote-483"] },
];

const ideas: IdeaInput[] = [
  { id: "idea-adc-for-mesothelioma", asOf, kind: "idea", name: "Antibody-drug conjugates for mesothelioma: why they have failed so far and how they could work", maturity: "early-clinical", actor: "industry", cost: "large", horizonYears: 6,
    tldr: "Nearly every mesothelioma carries the surface protein mesothelin, yet the one antibody-drug conjugate tried in a randomised trial did no better than chemotherapy. The idea is to fix the three reasons it failed rather than abandon the approach.",
    summary: "Mesothelioma looks ideal for antibody-drug conjugates: mesothelin is on almost every tumour cell and rare elsewhere. Anetumab ravtansine, a mesothelin antibody carrying the tubulin poison DM4, proved otherwise in 248 patients, matching vinorelbine's 4.5-month progression-free survival and no more. Three explanations have evidence behind them. Mesothelioma sheds soluble mesothelin into the blood, which binds the antibody before it reaches the tumour. Expression is patchy and the tumour grows as thin sheets with dense stroma, so few cells take up enough payload. And a tubulin payload adds little to a slow-cycling tumour that already resists chemotherapy. The idea proposes conjugates built for these facts: antibodies that bind membrane mesothelin epitopes not present on the shed form, topoisomerase I payloads with a bystander effect that kill neighbouring cells that took up no drug (the DXd and SN-38 class that transformed breast and lung cancer ADCs), regional intrapleural delivery to bypass shed antigen in blood, and combination with PD-1 blockade to turn payload-induced cell death into an immune response, which the National Cancer Institute is already testing with anetumab ravtansine and pembrolizumab. Other targets present on mesothelioma, such as folate receptor alpha, on which the conjugate Rina-S is being tested across solid tumours, and B7-H3, widen the options beyond mesothelin.",
    hypothesis: "A mesothelin- or FRα-directed conjugate with a bystander-capable topoisomerase I payload, given with PD-1 blockade, will produce a response rate above 30 percent and median progression-free survival beyond 8 months in second-line pleural mesothelioma, roughly double what vinorelbine or anetumab ravtansine achieved.",
    rationale: "Mesothelin expression is near universal in epithelioid mesothelioma; TOP1-payload ADCs with bystander killing succeeded where tubulin-payload ADCs failed in HER2-low breast cancer and in lung cancer; shed antigen and heterogeneity are documented and addressable; the pleural space is accessible for regional dosing.",
    test: "Expansion cohorts for mesothelioma in ongoing trials of TOP1-payload conjugates against mesothelin and folate receptor alpha, measuring soluble mesothelin as a stratification factor; then a randomised second-line trial against vinorelbine or gemcitabine with progression-free survival as the primary endpoint.",
    cancers: ["mesothelioma"], targets: ["mesothelin"], technologies: ["adc", "checkpoint-inhibitor"], drugs: ["anetumab-ravtansine", "trastuzumab-deruxtecan"], trials: ["anetumab-vs-vinorelbine-mpm", "nci-anetumab-pembrolizumab-mpm"],
    links: [{ label: "Kindler et al., anetumab ravtansine versus vinorelbine (Lancet Oncology 2022)", url: "https://doi.org/10.1016/S1470-2045(22)00061-4" }, { label: "Pembrolizumab with or without anetumab ravtansine, NCT03126630", url: "https://clinicaltrials.gov/study/NCT03126630" }, { label: "Rinatabart sesutecan in advanced solid tumours, NCT05579366", url: "https://clinicaltrials.gov/study/NCT05579366" }] },
  { id: "idea-mtap-prmt5-mesothelioma", links: [{ label: "Defining a Cancer Dependency Map: which genes each cancer cell line cannot live without (Cell 2017)", url: "https://doi.org/10.1016/j.cell.2017.06.010" }], kind: "idea", name: "PRMT5/MAT2A synthetic lethality for MTAP-deleted mesothelioma", maturity: "early-clinical", asOf,
    tldr: "About half of mesotheliomas have lost a gene called MTAP. That loss creates a weakness that new PRMT5 inhibitors are designed to exploit.",
    summary: "Roughly half of pleural mesotheliomas carry a co-deletion of CDKN2A and MTAP, and this idea proposes exploiting the weakness that MTAP loss creates. Loss of MTAP raises intracellular MTA, which partially inhibits PRMT5, so MTA-cooperative PRMT5 inhibitors such as AMG 193, MRTX1719 and BMS-986504, and MAT2A inhibitors, gain a therapeutic window that first-generation PRMT5 inhibitors lacked. The rationale is a strong genetic dependency in DepMap, an easy immunohistochemistry test for MTAP loss, and early responses in MTAP-deleted tumours including mesothelioma. At an early clinical stage, the test would be expansion cohorts then a randomised second-line trial, and it connects to the ideas on attacking the backup copy of a lost gene and grouping trials by broken mechanism.",
    hypothesis: "MTA-cooperative PRMT5 inhibitors will produce durable responses in MTAP-deleted mesothelioma after immunotherapy, with a therapeutic window absent for first-generation PRMT5 inhibitors.",
    rationale: "Strong genetic dependency in DepMap; MTAP deletion is easily tested by IHC; mesothelioma has among the highest MTAP-loss frequencies of any cancer.",
    test: "MTAP-deleted mesothelioma expansion cohorts in ongoing phase 1/2 trials, then a randomised second-line trial versus chemotherapy.",
    cancers: ["mesothelioma"], technologies: ["synthetic-lethality-approaches", "crispr-screens"], terms: ["synthetic-lethality"] },
  { id: "idea-mesothelin-car-t-regional", links: [{ label: "Adusumilli et al., Phase 1 trial of regional mesothelin-targeted CAR T-cell therapy with pembrolizumab in malignant pleural disease (Cancer Discovery 2021)", url: "https://doi.org/10.1158/2159-8290.CD-21-0407" }], kind: "idea", name: "Regionally delivered mesothelin CAR-T with PD-1 blockade", maturity: "early-clinical", asOf,
    tldr: "Deliver engineered T cells directly into the chest cavity where mesothelioma grows, and give immunotherapy to keep them working.",
    summary: "This idea would infuse mesothelin-directed CAR-T cells directly into the pleural cavity of patients with relapsed mesothelioma and add PD-1 blockade to keep the cells working. Mesothelin is expressed on almost all mesotheliomas, the pleural space is accessible, regional delivery avoids on-target lung toxicity, and in preclinical models CAR-T exhaustion is reversible with checkpoint blockade. A phase 1 study at Memorial Sloan Kettering Cancer Center led by Adusumilli combined intrapleural CAR-T with pembrolizumab and produced responses and some long survivors. The next step is a phase 2 with a second-line control and an armoured CAR-T arm; at an early clinical stage, it addresses the bottleneck of cold tumours and the idea of treating the body cavity rather than the bloodstream.",
    hypothesis: "Intrapleural mesothelin CAR-T plus PD-1 blockade achieves median OS beyond 24 months in relapsed mesothelioma, exceeding historical second-line outcomes.",
    rationale: "Mesothelin is near-universally expressed; the pleural space is accessible; CAR-T exhaustion is reversible with checkpoint blockade in preclinical models.",
    test: "Phase 2 with a contemporaneous control (second-line chemotherapy or nivolumab), OS endpoint; armoured (PD-1 dominant-negative) CAR-T variant as a second arm.",
    cancers: ["mesothelioma"], targets: ["mesothelin", "pd1"], technologies: ["car-t", "armored-car"], institutions: ["mskcc"] },
];

const entities: EntityInput[] = [...trials, ...drugs, ...technologies, ...terms, ...pairings, ...ideas];

const spike: Spike = {
  cancerId: "mesothelioma",
  entities,
  patch: {
    asOf,
    summary: "Malignant pleural mesothelioma arises from the lining of the lung, almost always decades after asbestos exposure, and is rising in countries that banned asbestos late or not at all. It grows along surfaces rather than as a mass, is hard to image and stage, and resists most systemic therapy. Histology is the dominant biological variable: epithelioid tumours are slower and chemosensitive; sarcomatoid and biphasic tumours are aggressive, chemoresistant, and paradoxically more immunotherapy-responsive.\n\nFor 16 years after pemetrexed-cisplatin (2004) nothing improved survival except, modestly, adding bevacizumab (MAPS, 2016). Immunotherapy then changed the first line twice: nivolumab-ipilimumab (CheckMate 743, approved 2020) and pembrolizumab with chemotherapy (IND.227/KEYNOTE-483, approved September 2024). Tumour treating fields hold a device approval on single-arm data. Radical surgery, long assumed beneficial, was shown by MARS 2 (2024) to shorten survival and worsen quality of life, and is now largely confined to trials.\n\nWhat comes next is biology-led: PRMT5 and MAT2A inhibitors for the ~40-50% of tumours with MTAP deletion, mesothelin-directed CAR-T delivered into the pleural space, ADCs and T-cell engagers against mesothelin, and better use of histology and BAP1/CDKN2A status to choose therapy. Prevention remains the biggest lever: asbestos is still mined and used in parts of Asia, Russia, and Brazil.",
    burden: "Mesothelioma causes about 30,000 cases a year worldwide, ~3,000 in the US, almost all from asbestos exposure 20-50 years earlier, so incidence is still rising in Asia and parts of Europe. Immunotherapy has produced the first tail of long-term survivors; median survival is 12-18 months.",
    subtypes: ["Epithelioid (~60-70%)", "Biphasic (~20%)", "Sarcomatoid (~10-20%, includes desmoplastic)", "Peritoneal mesothelioma (~10-15% of all mesothelioma; treated with cytoreductive surgery and HIPEC)", "Pericardial and testicular (rare)"],
    biomarkers: ["Histology (epithelioid vs non-epithelioid) drives first-line choice", "BAP1 loss (diagnostic; germline BAP1 syndrome)", "CDKN2A/MTAP deletion (diagnostic; PRMT5-inhibitor target)", "Mesothelin (CAR-T, ADC, engager target)", "PD-L1 (weakly predictive)", "Soluble mesothelin-related peptides and fibulin-3 (research)", "Asbestos exposure history"],
    standardOfCare: [
      { setting: "Diagnosis and staging", approach: "CT and PET/CT; thoracoscopic biopsy with IHC panel (calretinin, WT1, D2-40; BAP1 and MTAP loss support malignancy); histology and BAP1/MTAP status recorded for treatment planning.", refs: ["histopathology-ihc", "pet-ct", "ct"], guideline: { nccn: "MPM guideline", version: "NCCN Mesothelioma: Pleural v1.2026" } },
      { setting: "First line, non-epithelioid", approach: "Nivolumab + ipilimumab (CheckMate 743) preferred; pembrolizumab + platinum-pemetrexed alternative.", refs: ["nivolumab", "ipilimumab", "checkmate-743", "pembrolizumab", "keynote-483", "histology-directs-first-line-meso"], guideline: { nccn: "1 (preferred)", esmoMcbs: "4" } },
      { setting: "First line, epithelioid", approach: "Pembrolizumab + platinum-pemetrexed, nivolumab + ipilimumab, or platinum-pemetrexed ± bevacizumab, chosen by fitness and preference.", refs: ["pembrolizumab", "keynote-483", "nivolumab", "ipilimumab", "pemetrexed", "maps"], guideline: { nccn: "1 (chemo-IO and IO doublet); 2A (bevacizumab)", esmoMcbs: "3" } },
      { setting: "Maintenance", approach: "Continue immunotherapy per regimen; TTFields (Optune Lua) with pemetrexed-platinum under HDE approval; no maintenance chemotherapy standard.", refs: ["optune", "ttfields", "stellar"], guideline: { nccn: "2B (TTFields)" } },
      { setting: "Second line", approach: "Nivolumab (CONFIRM: OS benefit vs placebo) or nivolumab-ipilimumab if not given first line; platinum-pemetrexed rechallenge or gemcitabine/vinorelbine if IO given first; trials.", refs: ["nivolumab", "pemetrexed"], guideline: { nccn: "2A" } },
      { setting: "Surgery", approach: "Not recommended for cure outside trials after MARS 2; VATS pleurodesis or indwelling pleural catheter for effusion; extended pleurectomy/decortication (P/D) only in clinical trials.", refs: ["pleurectomy-decortication", "mars-2"], guideline: { nccn: "Selected centres/trials only" } },
      { setting: "Radiotherapy", approach: "Palliative for chest wall pain; prophylactic tract irradiation not beneficial (SMART/PIT trials); hemithoracic IMRT after surgery only in trials.", refs: ["imrt-igrt"] },
      { setting: "Peritoneal mesothelioma", approach: "Cytoreductive surgery with HIPEC in selected patients; systemic therapy extrapolated from pleural disease.", refs: ["hipec"] },
    ],
    stateOfArt: [
      "Two immunotherapy-based first-line standards (nivolumab-ipilimumab; pembrolizumab-chemotherapy), chosen by histology.",
      "Radical surgery removed from routine care after MARS 2 showed harm.",
      "Five-year survival with nivolumab-ipilimumab 14% vs 6% with chemotherapy: a small but real tail of long-term survivors.",
      "MTAP deletion and BAP1 loss are routine diagnostic markers and emerging therapeutic handles.",
      "Mesothelin CAR-T delivered regionally has produced long survivors in phase 1.",
    ],
    history: [
      { year: 1960, title: "Wagner links mesothelioma to asbestos in South African miners" },
      { year: 1989, title: "US EPA asbestos ban partly overturned (1991); many countries ban asbestos over the following decades" },
      { year: 2003, title: "EMPHACIS: pemetrexed-cisplatin improves survival", refs: ["pemetrexed"] },
      { year: 2004, title: "Pemetrexed approved: first mesothelioma drug", refs: ["pemetrexed"] },
      { year: 2011, title: "MARS 1: extrapleural pneumonectomy shows harm; practice shifts to lung-sparing surgery", refs: ["pleurectomy-decortication"] },
      { year: 2016, title: "MAPS: bevacizumab adds ~3 months", refs: ["maps"] },
      { year: 2019, title: "TTFields device approval (HDE) on STELLAR", refs: ["stellar", "optune"] },
      { year: 2019, title: "LUME-Meso fails; nintedanib abandoned in mesothelioma", refs: ["lume-meso", "nintedanib"] },
      { year: 2020, title: "CheckMate 743: nivolumab-ipilimumab approved, first new first line in 16 years", refs: ["checkmate-743", "nivolumab", "ipilimumab"] },
      { year: 2021, title: "CONFIRM: nivolumab improves survival in relapsed disease", refs: ["nivolumab"] },
      { year: 2023, title: "IND.227/KEYNOTE-483 positive for pembrolizumab-chemotherapy", refs: ["keynote-483"] },
      { year: 2024, title: "MARS 2: surgery worsens survival; pembrolizumab-chemotherapy approved (September)", refs: ["mars-2", "pembrolizumab"] },
      { year: 2024, title: "BEAT-meso misses OS; non-epithelioid subgroup benefits", refs: ["beat-meso"] },
      { year: 2025, title: "CheckMate 743 five-year data: 14% vs 6% alive", refs: ["checkmate-743"] },
      { year: 2026, title: "DREAM3R stopped early; PRMT5 inhibitors and mesothelin cell therapies advance", refs: ["dream3r", "idea-mtap-prmt5-mesothelioma", "idea-mesothelin-car-t-regional"] },
    ],
    pipeline: ["anetumab-ravtansine", "idea-adc-for-mesothelioma", "anetumab-vs-vinorelbine-mpm", "nci-anetumab-pembrolizumab-mpm", "ucl-proton-hemithoracic-mpm", "proton-therapy", "idea-mtap-prmt5-mesothelioma", "idea-mesothelin-car-t-regional", "synthetic-lethality-approaches", "car-t", "armored-car", "mesothelin", "t-cell-engager", "adc", "checkpoint-inhibitor", "ttfields", "histology-directs-first-line-meso", "fapi-pet"],
    openProblems: [
      "Even the best first-line regimens give a median survival under two years; the tail of long survivors on immunotherapy is what to build on.",
      "Epithelioid disease gains little from immunotherapy over chemotherapy; no predictive biomarker beyond histology.",
      "No approved targeted therapy despite recurrent BAP1, CDKN2A/MTAP, and NF2 alterations.",
      "Second-line options are weak once immunotherapy has been used first.",
      "Surgery's role is now unclear for the small group of early, epithelioid, node-negative patients.",
      "Response assessment is hard (modified RECIST for pleural rind); trials are small and slow.",
      "Asbestos is still produced and used in several large countries; incidence will rise there for decades.",
      "Peritoneal and rarer sites lack dedicated evidence.",
    ],
    targets: ["mesothelin", "pd1", "ctla4", "pdl1", "vegf"],
    technologies: ["checkpoint-inhibitor", "car-t", "ttfields", "synthetic-lethality-approaches", "pleurectomy-decortication", "hipec", "histopathology-ihc", "antiangiogenic"],
    pathways: ["pd1-checkpoint", "vegf-angiogenesis", "p53-cell-cycle"],
    companies: ["bms", "merck", "novocure", "boehringer-ingelheim"],
    terms: ["epithelioid-vs-sarcomatoid", "synthetic-lethality", "irae"],
    institutions: ["mskcc", "royal-marsden", "the-christie", "nki"],
    links: [{ label: "NCI PDQ: malignant mesothelioma treatment", url: "https://www.cancer.gov/types/mesothelioma/hp/mesothelioma-treatment-pdq" }],
  },
};

export default spike;

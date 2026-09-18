/**
 * Paediatric fronts (September 2026): the landmark children's cancer trials, the cooperative
 * groups and platforms that run them, and the regulatory lever (RACE for Children Act) that
 * forces new targeted drugs to be studied in children. Complements the paediatric cancer records
 * in spikes/gap-cancers.ts and spikes/nci-paediatric.ts and the trials already held in the
 * neuroblastoma, ALL, Hodgkin and sarcoma deep dives (ANBL0032, AALL1731, AHOD2131, INT-0091).
 *
 * Facts checked 2026-09-10 against PubMed abstracts and ClinicalTrials.gov records.
 * Spread into nciCoverage (src/data/nci-coverage.ts).
 */
import type { EntityInput, InstitutionInput, TermInput, TrialInput } from "@/lib/schema";
import { TRIAL_OUTCOMES } from "./trial-outcomes";

const asOf = "2026-09-10";
const ct = (nct: string) => ({ label: `ClinicalTrials.gov ${nct}`, url: `https://clinicaltrials.gov/study/${nct}` });
const doi = (label: string, d: string) => ({ label, url: `https://doi.org/${d}` });

type T = Omit<TrialInput, "kind" | "asOf">;
const t = (x: T): TrialInput => ({ kind: "trial", asOf, ...x, ...TRIAL_OUTCOMES[x.id] });
type I = Omit<InstitutionInput, "kind" | "asOf">;
const b = (x: I): InstitutionInput => ({ kind: "institution", asOf, ...x });
type Tm = Omit<TermInput, "kind" | "asOf">;
const term = (x: Tm): TermInput => ({ kind: "term", asOf, ...x });

const PAEDIATRIC_TAGS = ["nci-coverage", "paediatric"];

// =====================================================================================
// Landmark paediatric trials
// =====================================================================================
const trials: TrialInput[] = [
  t({ id: "firefly-1", name: "FIREFLY-1", nct: "NCT04775485", phase: "2", status: "positive", yearReported: 2023, sponsor: "Day One Biopharmaceuticals", enrolled: 141,
    setting: "Relapsed or refractory BRAF-altered paediatric low-grade glioma: single-arm tovorafenib (arm 1, n = 77 registrational cohort)",
    tldr: "FIREFLY-1 showed that a once-weekly pill, tovorafenib, shrinks most relapsed childhood low-grade gliomas driven by BRAF changes, including the common KIAA1549-BRAF fusion that older BRAF drugs could not treat safely. It led to the first approval of a drug for this disease.",
    summary: "Open-label phase 2 of tovorafenib, an oral type II RAF inhibitor that does not cause the paradoxical MAPK activation seen with type I BRAF inhibitors in BRAF-fusion tumours. In the registrational arm 1 (n = 77), independent review found an overall response rate of 67% by RANO-HGG criteria (the prespecified primary endpoint) and 51% by RAPNO-LGG criteria including minor responses; median duration of response 16.6 months and median time to response 3.0 months. Treatment-related adverse events led to discontinuation in 7% of patients; hair colour change, elevated creatine phosphokinase, anaemia and slowed growth velocity were characteristic. FDA accelerated approval followed on 23 April 2024 for relapsed or refractory paediatric LGG with BRAF fusion or rearrangement or BRAF V600 mutation. The confirmatory phase 3 LOGGIC/FIREFLY-2 trial compares tovorafenib with chemotherapy in the front line.",
    result: "ORR 67% (RANO-HGG) and 51% (RAPNO-LGG) in arm 1; median DOR 16.6 months.",
    outcomes: [
      { endpoint: "Overall response rate (RANO-HGG, independent review)", primary: true, unit: "%", arms: [{ name: "Tovorafenib (arm 1)", n: 77, value: 67 }], source: "https://doi.org/10.1038/s41591-023-02668-y" },
      { endpoint: "Overall response rate (RAPNO-LGG, including minor responses)", unit: "%", arms: [{ name: "Tovorafenib (arm 1)", n: 77, value: 51 }], source: "https://doi.org/10.1038/s41591-023-02668-y" },
      { endpoint: "Median duration of response", unit: "months", arms: [{ name: "Tovorafenib (arm 1)", value: 16.6 }], source: "https://doi.org/10.1038/s41591-023-02668-y" },
    ],
    replication: "Single-arm registrational study; confirmatory randomised phase 3 (LOGGIC/FIREFLY-2, NCT05566795) in newly diagnosed RAF-altered LGG is ongoing.",
    drugs: ["tovorafenib"], cancers: ["paediatric-low-grade-glioma"], companies: ["day-one-biopharmaceuticals"], targets: ["braf"], pathways: ["ras-mapk"], terms: ["race-for-children-act"],
    links: [ct("NCT04775485"), doi("Kilburn et al., Nature Medicine 2024", "10.1038/s41591-023-02668-y")],
    tags: [...PAEDIATRIC_TAGS, "cns"] }),

  t({ id: "tadpole", name: "TADPOLE (CDRB436G2201)", nct: "NCT02684058", phase: "2", status: "positive", yearReported: 2023, sponsor: "Novartis", enrolled: 110,
    setting: "Newly diagnosed BRAF V600-mutant paediatric low-grade glioma needing systemic therapy: dabrafenib + trametinib vs carboplatin + vincristine (2:1 randomisation)",
    tldr: "The first randomised trial to show that a targeted drug pair beats chemotherapy in children with a brain tumour. Children whose low-grade glioma carries a BRAF V600 mutation had far more tumour shrinkage and a much longer time before progression on dabrafenib plus trametinib than on standard carboplatin and vincristine.",
    summary: "Phase 2 randomised trial (Bouffet et al., NEJM 2023). 110 patients randomised (73 to dabrafenib plus trametinib, 37 to carboplatin plus vincristine). At a median follow-up of 18.9 months the independently assessed overall response rate was 47% versus 11% (risk ratio 4.31; 95% CI 1.7 to 11.2), clinical benefit 86% versus 46%, and median progression-free survival 20.1 versus 7.4 months (HR 0.31; 95% CI 0.17 to 0.55). Grade 3 or higher adverse events were less frequent with the targeted pair (47% versus 94%). Basis of the FDA approval of dabrafenib plus trametinib for paediatric BRAF V600E LGG in March 2023, with new liquid and dispersible formulations for young children. A separate cohort in relapsed BRAF V600 high-grade glioma also responded.",
    result: "ORR 47% vs 11%; median PFS 20.1 vs 7.4 months, HR 0.31.",
    outcomes: [
      { endpoint: "Overall response rate (independent review, RANO)", primary: true, unit: "%", arms: [{ name: "Dabrafenib + trametinib", n: 73, value: 47 }, { name: "Carboplatin + vincristine", n: 37, value: 11 }], p: "<0.001", source: "https://doi.org/10.1056/NEJMoa2303815" },
      { endpoint: "Progression-free survival", unit: "months", arms: [{ name: "Dabrafenib + trametinib", n: 73, value: 20.1 }, { name: "Carboplatin + vincristine", n: 37, value: 7.4 }], hr: 0.31, ci: [0.17, 0.55], p: "<0.001", source: "https://doi.org/10.1056/NEJMoa2303815" },
    ],
    replication: "Consistent with earlier single-arm paediatric dabrafenib and trametinib studies; the only randomised comparison so far. FIREFLY-1 addressed the BRAF-fusion population that this trial excluded.",
    drugs: ["dabrafenib-trametinib", "carboplatin", "vincristine"], cancers: ["paediatric-low-grade-glioma"], companies: ["novartis"], targets: ["braf"], pathways: ["ras-mapk"], terms: ["braf-v600-mutation", "race-for-children-act"],
    links: [ct("NCT02684058"), doi("Bouffet et al., NEJM 2023", "10.1056/NEJMoa2303815")],
    tags: [...PAEDIATRIC_TAGS, "cns"] }),

  t({ id: "action-dmg", name: "ACTION", nct: "NCT05580562", phase: "3", status: "recruiting", sponsor: "Jazz Pharmaceuticals (Chimerix until 2025)", enrolled: 510,
    setting: "Newly diagnosed H3 K27M-mutant diffuse glioma after completion of radiotherapy: dordaviprone (ONC201) vs placebo, two dosing schedules",
    tldr: "ACTION is the first placebo-controlled phase 3 trial ever run in diffuse midline glioma, the childhood brain-stem tumour that radiotherapy alone has never cured. It asks whether taking dordaviprone after radiotherapy lengthens life.",
    summary: "Randomised, double-blind, placebo-controlled phase 3 in patients aged 2 years and older with newly diagnosed H3 K27M-mutant diffuse glioma who have completed front-line radiotherapy; participants are randomised to dordaviprone once weekly, dordaviprone on two consecutive days weekly, or placebo. Primary endpoints are overall survival and progression-free survival. Dordaviprone (ONC201) is an imipridone that antagonises DRD2 and activates the mitochondrial protease ClpP, with activity concentrated in H3 K27M-mutant tumours in earlier single-arm studies; the FDA granted accelerated approval in August 2025 for recurrent H3 K27M-mutant diffuse midline glioma on the basis of pooled single-arm response data, with ACTION as the confirmatory trial. Jazz Pharmaceuticals acquired Chimerix in 2025 and now sponsors the study. Recruiting across North America, Europe, Asia and Australia; estimated enrolment 510.",
    replication: "Single-arm phase 2 data only so far; ACTION is the confirmatory trial. Its result will also be the first randomised test of any systemic agent added to radiotherapy in this disease.",
    drugs: ["dordaviprone"], cancers: ["dipg-dmg"], terms: ["h3k27m", "race-for-children-act"], bottlenecks: ["b-brain-delivery", "b-rare-cancers"],
    links: [ct("NCT05580562"), { label: "Jazz Pharmaceuticals: dordaviprone", url: "https://www.jazzpharma.com" }],
    tags: [...PAEDIATRIC_TAGS, "cns"] }),

  t({ id: "pediatric-match", name: "NCI-COG Pediatric MATCH (APEC1621)", nct: "NCT03155620", phase: "platform", status: "active", yearReported: 2022, sponsor: "National Cancer Institute / Children's Oncology Group", enrolled: 1377,
    setting: "Relapsed or refractory solid tumours, non-Hodgkin lymphomas and histiocytic disorders, age 1-21: tumour sequencing then assignment to one of a dozen single-agent targeted-therapy phase 2 arms",
    tldr: "Pediatric MATCH was the first nationwide precision-medicine trial for children: every child with a relapsed solid tumour could have their tumour sequenced and, if a matching drug existed, join a trial arm for it. It proved the plumbing works, even though most single drugs given alone did little.",
    summary: "Histology-agnostic screening protocol run by NCI and COG at Children's Oncology Group sites from 2017. Tumours underwent targeted cancer-gene panel sequencing and limited immunohistochemistry; patients with a predefined actionable alteration were assigned to phase 2 arms (selumetinib, larotrectinib, ensartinib, vemurafenib, erdafitinib, tazemetostat, samotolisib, ulixertinib, palbociclib, olaparib, tipifarnib, ivosidenib, selpercatinib, among others). In the first 1,000 tumours screened, testing was completed for 94.7%, actionable alterations were found in 31.5%, and 28.4% of patients were assigned and 13.1% enrolled on a treatment arm (Parsons et al., JCO 2022). MAPK-pathway alterations were most frequent (11.2%). Most single-agent arms produced few objective responses; the selumetinib arm in MAPK-altered tumours had no responses in 20 treated patients (Eckstein et al., JCO 2022), while larotrectinib in NTRK-fusion tumours and selpercatinib in RET-altered tumours were active. Screening is closed and arms are completing follow-up. Lessons: molecular screening at relapse is feasible nationally; single-agent targeted therapy is rarely enough outside fusion drivers; combination arms and earlier-line testing are the next step.",
    result: "Actionable alteration in 31.5% of the first 1,000 tumours; 28.4% assigned and 13.1% enrolled on a treatment arm.",
    outcomes: [
      { endpoint: "Actionable alteration detected (first 1,000 tumours)", primary: true, unit: "%", arms: [{ name: "Screened tumours", n: 1000, value: 31.5 }], source: "https://doi.org/10.1200/JCO.21.02838" },
      { endpoint: "Enrolled on a treatment arm", unit: "%", arms: [{ name: "Screened patients", n: 1000, value: 13.1 }], source: "https://doi.org/10.1200/JCO.21.02838" },
    ],
    replication: "European counterparts (ESMART, run by ITCC, and the INFORM registry in Germany) reached similar conclusions about feasibility and about the weakness of single-agent targeting outside fusion drivers.",
    drugs: ["larotrectinib", "selpercatinib", "vemurafenib", "erdafitinib", "tazemetostat", "palbociclib", "olaparib", "ivosidenib"], institutions: ["childrens-oncology-group", "nci", "itcc"], technologies: ["cgp", "ngs-bioinformatics-software"], terms: ["basket-umbrella-platform", "race-for-children-act"], bottlenecks: ["b-rare-cancers", "b-trial-design"],
    links: [ct("NCT03155620"), doi("Parsons et al., JCO 2022 (screening results)", "10.1200/JCO.21.02838"), doi("Eckstein et al., JCO 2022 (selumetinib arm)", "10.1200/JCO.21.02840"), { label: "NCI: Pediatric MATCH", url: "https://www.cancer.gov/about-cancer/treatment/clinical-trials/nci-supported/pediatric-match" }],
    tags: [...PAEDIATRIC_TAGS, "precision-medicine"] }),

  t({ id: "acns0331", name: "COG ACNS0331", nct: "NCT00085735", phase: "3", status: "mixed", yearReported: 2021, sponsor: "Children's Oncology Group", enrolled: 549,
    setting: "Average-risk medulloblastoma, age 3-21: involved-field (tumour bed) vs whole posterior fossa boost; and, in children aged 3-7, 18 Gy vs 23.4 Gy craniospinal irradiation",
    tldr: "This trial asked whether children with average-risk medulloblastoma could safely receive less radiation. Shrinking the boost to the tumour bed was safe; cutting the dose to the whole brain and spine in young children was not, so 23.4 Gy remains the floor for most.",
    summary: "Randomised phase 3 (Michalski et al., JCO 2021). 549 enrolled; 464 evaluable for the boost-volume comparison and 226 for the CSI-dose comparison. Five-year event-free survival was 82.5% with involved-field boost versus 80.5% with posterior fossa boost (HR 0.97; non-inferior), and 71.4% with 18 Gy CSI versus 82.9% with 23.4 Gy (HR 1.67; inferior). Post hoc molecular subgrouping showed the dose reduction harmed group 4 tumours most, while SHH tumours did better with involved-field boost. The trial set the current average-risk standard (23.4 Gy CSI plus tumour-bed boost to 54 Gy) and showed that further de-escalation must be subgroup-directed, which the successor trials (ACNS1422 for WNT, SIOP PNET5) now test.",
    result: "Involved-field boost non-inferior (5-year EFS 82.5% vs 80.5%); 18 Gy CSI inferior to 23.4 Gy (71.4% vs 82.9%).",
    outcomes: [
      { endpoint: "5-year event-free survival: boost volume", primary: true, unit: "%", arms: [{ name: "Involved-field boost", value: 82.5 }, { name: "Posterior fossa boost", value: 80.5 }], hr: 0.97, source: "https://doi.org/10.1200/JCO.20.02730" },
      { endpoint: "5-year event-free survival: CSI dose (age 3-7)", primary: true, unit: "%", arms: [{ name: "18 Gy CSI", value: 71.4 }, { name: "23.4 Gy CSI", value: 82.9 }], hr: 1.67, source: "https://doi.org/10.1200/JCO.20.02730" },
    ],
    replication: "Consistent with the earlier CCG 9892 and A9961 experience that 23.4 Gy with chemotherapy is safe for average risk; SIOP PNET5 is testing subgroup-directed reduction.",
    cancers: ["medulloblastoma", "medulloblastoma-wnt", "medulloblastoma-group-3-4"], technologies: ["proton-therapy", "imrt-igrt"], institutions: ["childrens-oncology-group"], drugs: ["cisplatin", "vincristine", "cyclophosphamide", "lomustine"], terms: ["late-effects", "de-escalation"], bottlenecks: ["b-survivorship", "b-toxicity-qol"],
    links: [ct("NCT00085735"), doi("Michalski et al., JCO 2021", "10.1200/JCO.20.02730")],
    tags: [...PAEDIATRIC_TAGS, "cns", "de-escalation"] }),

  t({ id: "aren0533", name: "COG AREN0533", nct: "NCT00379340", phase: "3", status: "positive", yearReported: 2018, sponsor: "Children's Oncology Group", enrolled: 395,
    setting: "Stage III-IV favourable-histology Wilms tumour: response-based omission of lung radiotherapy after complete lung nodule response; augmented chemotherapy (Regimen M) for incomplete response or 1p/16q loss of heterozygosity",
    tldr: "A risk-adapted Wilms tumour trial: children whose lung metastases vanished after six weeks of chemotherapy were spared lung radiation, while those with stubborn nodules or a high-risk chromosome pattern got stronger chemotherapy and did better than in the past.",
    summary: "Single-arm, biology- and response-adapted phase 3 (Dix et al., JCO 2018 and 2019). Among 292 assessable patients with lung metastases, 133 had complete lung nodule response after six weeks of vincristine, dactinomycin and doxorubicin (DD4A) and continued without lung radiotherapy: 4-year EFS 79.5% with excellent overall survival, though events exceeded expectation. The 159 with incomplete response, or LOH at 1p/16q, received lung radiotherapy plus four cycles of cyclophosphamide and etoposide (Regimen M): 4-year EFS 88.5%, better than the 75% target. Overall 4-year EFS and OS were 85.4% and 95.6% versus 72.5% and 84.0% in the predecessor NWTS-5. Companion analysis of patients with 1p/16q LOH showed 4-year EFS of 87.3% (stage I-II, AREN0532) and 90.2% (stage III-IV, AREN0533), improved from 68.8% and 61.3% in NWTS-5. Together with AREN0532, it made molecular and response-based risk stratification the North American Wilms standard, mirroring the SIOP approach in Europe.",
    result: "Overall 4-year EFS 85.4% and OS 95.6% (vs 72.5% and 84.0% in NWTS-5); 4-year EFS 90.2% for LOH 1p/16q stage III-IV with augmented therapy.",
    outcomes: [
      { endpoint: "4-year event-free survival (all lung-metastasis patients)", primary: true, unit: "%", arms: [{ name: "AREN0533 risk-adapted", n: 292, value: 85.4 }, { name: "NWTS-5 (historical)", value: 72.5 }], p: "<0.001", source: "https://doi.org/10.1200/JCO.2017.77.1931" },
      { endpoint: "4-year event-free survival, LOH 1p/16q stage III-IV, Regimen M", unit: "%", arms: [{ name: "AREN0533 Regimen M", n: 51, value: 90.2 }, { name: "NWTS-5 (historical)", value: 61.3 }], source: "https://doi.org/10.1200/JCO.18.01972" },
    ],
    replication: "Non-randomised against historical NWTS-5 controls; the SIOP-RTSG UMBRELLA protocol in Europe pursues the same response- and biology-adapted logic.",
    cancers: ["wilms-tumor"], institutions: ["childrens-oncology-group"], drugs: ["vincristine", "dactinomycin", "doxorubicin", "cyclophosphamide", "etoposide"], terms: ["de-escalation", "late-effects"], bottlenecks: ["b-survivorship"],
    links: [ct("NCT00379340"), doi("Dix et al., JCO 2018 (lung metastases)", "10.1200/JCO.2017.77.1931"), doi("Dix et al., JCO 2019 (LOH 1p/16q)", "10.1200/JCO.18.01972")],
    tags: [...PAEDIATRIC_TAGS, "kidney"] }),

  t({ id: "euramos-1", name: "EURAMOS-1", nct: "NCT00134030", phase: "3", status: "negative", yearReported: 2016, sponsor: "Children's Oncology Group, COSS, EOI and SSG (EURAMOS collaboration)", enrolled: 2260,
    setting: "Resectable high-grade osteosarcoma, age up to 40: MAP induction, then randomisation by histological response (good responders: MAP vs MAP + pegylated interferon alfa-2b; poor responders: MAP vs MAPIE with ifosfamide and etoposide)",
    tldr: "The largest osteosarcoma trial ever run, across four cooperative groups on two continents. Neither adding interferon for good responders nor adding ifosfamide and etoposide for poor responders improved outcomes, so three-drug MAP chemotherapy remained the standard and the field turned to new biology.",
    summary: "2,260 patients registered from 325 sites in 17 countries between 2005 and 2011. Poor responders (at least 10% viable tumour after MAP induction; 618 randomised) had identical event-free survival with MAPIE versus MAP (HR 0.98) and substantially more toxicity (Marina et al., Lancet Oncol 2016). Good responders (716 randomised) had no significant EFS gain from maintenance pegylated interferon alfa-2b, with 3-year EFS 76% overall and a large proportion never starting or stopping interferon early (Bielack et al., JCO 2015). EURAMOS-1 defined MAP (high-dose methotrexate, doxorubicin, cisplatin) as the international standard, showed that intensifying chemotherapy on the basis of histological response does not help, and demonstrated that four national groups could run one protocol. Its biobank underpins later genomic work on osteosarcoma.",
    result: "Poor responders: EFS HR 0.98 for MAPIE vs MAP, more toxicity. Good responders: no EFS benefit from interferon.",
    outcomes: [
      { endpoint: "Event-free survival, poor responders (MAPIE vs MAP)", primary: true, arms: [{ name: "MAPIE", n: 310, note: "154 events" }, { name: "MAP", n: 308, note: "153 events" }], hr: 0.98, source: "https://doi.org/10.1016/S1470-2045(16)30214-5" },
      { endpoint: "3-year event-free survival, good responders (all randomised)", unit: "%", arms: [{ name: "MAP with or without interferon alfa-2b", n: 716, value: 76 }], source: "https://doi.org/10.1200/JCO.2014.60.0734" },
    ],
    replication: "Consistent with the earlier INT-0133 and COSS experience that adding agents to MAP does not improve survival; no subsequent trial has displaced MAP.",
    cancers: ["osteosarcoma"], drugs: ["methotrexate", "doxorubicin", "cisplatin", "ifosfamide", "etoposide", "interferon-alfa"], institutions: ["childrens-oncology-group", "siop-europe"], technologies: ["limb-salvage-surgery", "cytotoxic-chemotherapy"], tags: [...PAEDIATRIC_TAGS, "bone", "lesson:intensification-without-benefit"], bottlenecks: ["b-rare-cancers", "b-negative-results"],
    links: [ct("NCT00134030"), doi("Marina et al., Lancet Oncology 2016 (poor responders)", "10.1016/S1470-2045(16)30214-5"), doi("Bielack et al., JCO 2015 (good responders)", "10.1200/JCO.2014.60.0734")] }),

  t({ id: "aaml0531", name: "COG AAML0531", nct: "NCT00372593", phase: "3", status: "positive", yearReported: 2014, sponsor: "Children's Oncology Group", enrolled: 1070,
    setting: "Newly diagnosed AML, age 0-29: standard five-course chemotherapy with or without two doses of gemtuzumab ozogamicin",
    tldr: "Adding the antibody-drug conjugate gemtuzumab ozogamicin to chemotherapy lowered the chance of relapse in children with acute myeloid leukaemia. Years after the drug had been withdrawn from the US market, this trial helped bring it back for children.",
    summary: "Randomised phase 3 (Gamis et al., JCO 2014), 1,022 evaluable patients. Gemtuzumab ozogamicin (GO, 3 mg/m2) given once in induction course 1 and once in intensification course 2 improved 3-year event-free survival (53.1% versus 46.9%; HR 0.83; 95% CI 0.70 to 0.99) through a reduction in relapse risk, with a non-significant trend in overall survival and slightly higher post-remission treatment-related mortality. Benefit was later shown to track with CD33 expression and CD33 splicing genotype, an early example of a pharmacogenomic biomarker in paediatric oncology. GO had been withdrawn in the US in 2010 after the adult SWOG S0106 trial; AAML0531 together with the adult ALFA-0701 trial supported the 2017 FDA re-approval, which included children. Successor COG trials (AAML1031, AAML1831) build on this backbone with FLT3 inhibitors and CPX-351.",
    result: "3-year EFS 53.1% vs 46.9%, HR 0.83; relapse risk reduced.",
    outcomes: [
      { endpoint: "3-year event-free survival", primary: true, unit: "%", arms: [{ name: "Chemotherapy + gemtuzumab ozogamicin", value: 53.1 }, { name: "Chemotherapy", value: 46.9 }], hr: 0.83, ci: [0.70, 0.99], source: "https://doi.org/10.1200/JCO.2014.55.3628" },
    ],
    replication: "Adult ALFA-0701 (fractionated GO) and the MRC AML15/16 meta-analysis showed the same relapse reduction; the CD33 splicing biomarker was confirmed in AAML0531 and AAML1031 correlative studies.",
    cancers: ["aml", "aml-paediatric"], drugs: ["gemtuzumab-ozogamicin", "cytarabine-7-3"], targets: ["cd33"], technologies: ["adc"], institutions: ["childrens-oncology-group"], trials: ["alfa-0701"],
    links: [ct("NCT00372593"), doi("Gamis et al., JCO 2014", "10.1200/JCO.2014.55.3628")],
    tags: [...PAEDIATRIC_TAGS, "haematologic"] }),

  t({ id: "inter-b-nhl-ritux-2010", name: "Inter-B-NHL Ritux 2010", nct: "NCT01516580", phase: "3", status: "positive", yearReported: 2020, sponsor: "Gustave Roussy (European Intergroup for Childhood NHL) and Children's Oncology Group", enrolled: 482,
    setting: "High-risk mature B-cell non-Hodgkin lymphoma or B-acute leukaemia in patients under 18 (mostly Burkitt lymphoma): LMB chemotherapy with or without six doses of rituximab",
    tldr: "Adding the antibody rituximab to intensive chemotherapy in children with high-risk Burkitt and related lymphomas cut treatment failures by about two-thirds, making an already curable disease more so. It is the model of a joint European-North American children's cancer trial.",
    summary: "Open-label international randomised phase 3 (Minard-Colin et al., NEJM 2020). Among 328 randomised patients (164 per arm; 85.7% Burkitt lymphoma), events occurred in 10 with rituximab-chemotherapy versus 28 with chemotherapy alone. Three-year event-free survival was 93.9% (95% CI 89.1 to 96.7) versus 82.3% (95% CI 75.7 to 87.5), HR 0.32 (95% CI 0.15 to 0.66), and overall survival also improved. Randomisation was stopped early for efficacy and all subsequent patients received rituximab. Rituximab roughly doubled the rate of hypogammaglobulinaemia and increased infections, so immune monitoring is part of follow-up. Rituximab plus LMB is now the standard for high-risk paediatric mature B-cell lymphoma on both sides of the Atlantic and formed the basis of the 2021 FDA paediatric label extension for rituximab.",
    result: "3-year EFS 93.9% vs 82.3%, HR 0.32; OS also improved.",
    outcomes: [
      { endpoint: "3-year event-free survival", primary: true, unit: "%", arms: [{ name: "Rituximab + LMB chemotherapy", n: 164, value: 93.9 }, { name: "LMB chemotherapy", n: 164, value: 82.3 }], hr: 0.32, ci: [0.15, 0.66], p: "0.00096 (one-sided)", source: "https://doi.org/10.1056/NEJMoa1915315" },
    ],
    replication: "Consistent with the adult experience of rituximab in aggressive B-cell lymphoma (CODOX-M/IVAC-R, DA-EPOCH-R) and with the earlier COG ANHL01P1 pilot; no contradicting paediatric data.",
    cancers: ["burkitt-lymphoma", "dlbcl"], drugs: ["rituximab", "methotrexate", "cyclophosphamide", "doxorubicin", "vincristine", "cytarabine-7-3", "etoposide"], targets: ["cd20"], institutions: ["gustave-roussy", "childrens-oncology-group", "siop-europe"], terms: ["hypogammaglobulinaemia"],
    links: [ct("NCT01516580"), doi("Minard-Colin et al., NEJM 2020", "10.1056/NEJMoa1915315")],
    tags: [...PAEDIATRIC_TAGS, "haematologic"] }),

  t({ id: "lch-iii", name: "LCH-III", nct: "NCT00276757", phase: "3", status: "positive", yearReported: 2013, sponsor: "Histiocyte Society", enrolled: 376,
    setting: "Multisystem Langerhans cell histiocytosis in children: risk-organ-positive patients randomised to vinblastine-prednisone with or without methotrexate (12 months total); risk-organ-negative responders randomised to 6 vs 12 months of vinblastine-prednisone",
    tldr: "The Histiocyte Society's third international trial showed that treating multisystem Langerhans cell histiocytosis for a full year, rather than six months, roughly halves the chance of the disease coming back, while adding methotrexate added nothing but toxicity.",
    summary: "International randomised trial (Gadner et al., Blood 2013), more than 400 patients randomised. In risk-organ-positive disease, adding methotrexate to vinblastine and prednisone did not change response, survival or reactivation; but 12 months of therapy gave 5-year survival of 84% against 62% and 69% in the identically stratified predecessor trials LCH-I and LCH-II, and reduced 5-year reactivation to 27% from 55% and 44%. In risk-organ-negative disease, 12 months of vinblastine-prednisone lowered 5-year reactivation to 37% versus 54% with 6 months (P = 0.03). One year of vinblastine-prednisone became the international standard and the backbone of LCH-IV, which tests further prolongation and the addition of 6-mercaptopurine. The trial predates the discovery that most LCH carries BRAF V600E or other MAPK mutations, which now drive targeted therapy for refractory disease.",
    result: "12 vs 6 months of vinblastine-prednisone: 5-year reactivation 37% vs 54% in risk-organ-negative disease; methotrexate added no benefit.",
    outcomes: [
      { endpoint: "5-year reactivation rate, risk-organ-negative", primary: true, unit: "%", arms: [{ name: "12 months vinblastine-prednisone", value: 37 }, { name: "6 months vinblastine-prednisone", value: 54 }], p: "0.03", source: "https://doi.org/10.1182/blood-2012-09-455774" },
      { endpoint: "5-year reactivation rate, risk-organ-positive (both arms, 12 months)", unit: "%", arms: [{ name: "LCH-III", value: 27 }, { name: "LCH-I (historical, 6 months)", value: 55 }, { name: "LCH-II (historical, 6 months)", value: 44 }], source: "https://doi.org/10.1182/blood-2012-09-455774" },
    ],
    replication: "Historical comparison with LCH-I and LCH-II for the risk-organ-positive stratum; LCH-IV (NCT02205762) is testing 12 vs 24 months.",
    cancers: ["langerhans-cell-histiocytosis"], drugs: ["vinblastine", "methotrexate"], institutions: ["histiocyte-society"], targets: ["braf"], pathways: ["ras-mapk"],
    links: [ct("NCT00276757"), doi("Gadner et al., Blood 2013", "10.1182/blood-2012-09-455774"), { label: "Histiocyte Society: LCH-IV", url: "https://histiocytesociety.org/LCH-IV" }],
    tags: [...PAEDIATRIC_TAGS, "histiocytosis"] }),

  t({ id: "ccss", name: "Childhood Cancer Survivor Study (CCSS)", nct: "NCT01120353", phase: "observational", status: "active", yearReported: 2016, sponsor: "St. Jude Children's Research Hospital / National Cancer Institute", enrolled: 50000,
    setting: "Retrospective cohort with prospective follow-up of five-year survivors of childhood cancer diagnosed 1970-1999 at 31 North American centres, with sibling controls",
    tldr: "The largest study of what happens to children after cancer is cured. Following tens of thousands of survivors for decades, it showed that heart damage, second cancers and other late effects were common after older treatments, and that gentler modern protocols have already halved late deaths.",
    summary: "NCI-funded cohort coordinated at St. Jude since 1994, covering leukaemia, lymphoma, CNS tumours, Wilms tumour, neuroblastoma, soft-tissue sarcoma and bone tumours; the expansion cohort (diagnoses 1987-1999) brought the total to more than 35,000 survivors and around 5,000 siblings. Its papers quantified the late-effects burden: by age 50 most survivors have a severe or life-threatening chronic condition, driven by anthracyclines, chest radiotherapy, cranial radiotherapy and alkylators. Armstrong et al. (NEJM 2016) analysed 34,033 survivors: of 3,958 deaths, 1,618 (41%) were health-related (746 subsequent neoplasms, 241 cardiac, 137 pulmonary). Fifteen-year all-cause mortality fell from 12.4% for diagnoses in the early 1970s to 6.0% in the 1990s, and health-related mortality from 3.5% to 2.1%, attributable to reduced cranial radiotherapy in ALL, reduced abdominal radiotherapy in Wilms tumour and less anthracycline exposure. CCSS data underpin the COG Long-Term Follow-Up Guidelines, the dexrazoxane and cardiac-screening evidence, and the case for treatment de-escalation in trials such as ACNS0331 and AREN0533. Public data are available through the CCSS website, and the St. Jude Lifetime Cohort (SJLIFE) adds clinically assessed outcomes.",
    result: "15-year all-cause mortality among five-year survivors fell from 12.4% (early 1970s) to 6.0% (1990s) as treatment exposures were reduced.",
    outcomes: [
      { endpoint: "15-year cumulative all-cause mortality by treatment era", primary: true, unit: "%", arms: [{ name: "Diagnosed early 1970s", value: 12.4 }, { name: "Diagnosed 1990s", value: 6.0 }], p: "<0.001 for trend", source: "https://doi.org/10.1056/NEJMoa1510795" },
      { endpoint: "15-year health-related mortality by treatment era", unit: "%", arms: [{ name: "Diagnosed early 1970s", value: 3.5 }, { name: "Diagnosed 1990s", value: 2.1 }], p: "<0.001 for trend", source: "https://doi.org/10.1056/NEJMoa1510795" },
    ],
    replication: "The British Childhood Cancer Survivor Study, the Nordic ALiCCS cohort and the Dutch DCOG-LATER cohort report the same late-effects pattern and falling late mortality.",
    cancers: ["all-leukemia", "hodgkin-lymphoma", "medulloblastoma", "wilms-tumor", "neuroblastoma", "rhabdomyosarcoma", "osteosarcoma", "ewing-sarcoma"], technologies: ["survivorship-care-plan", "cardio-oncology"], terms: ["late-effects", "cardiotoxicity"], institutions: ["st-jude", "nci"], bottlenecks: ["b-survivorship"], trials: ["acns0331", "aren0533"],
    links: [ct("NCT01120353"), doi("Armstrong et al., NEJM 2016", "10.1056/NEJMoa1510795"), { label: "CCSS", url: "https://ccss.stjude.org" }, { label: "COG Long-Term Follow-Up Guidelines", url: "http://www.survivorshipguidelines.org" }],
    tags: [...PAEDIATRIC_TAGS, "survivorship"] }),
];

// =====================================================================================
// Organisations
// =====================================================================================
const institutions: InstitutionInput[] = [
  b({ id: "accelerate-platform", name: "ACCELERATE", aka: ["ACCELERATE platform", "ACCELERATE Paediatric Oncology Platform"], institutionType: "consortium", city: "Brussels", country: "BE", lat: 50.850, lng: 4.352, website: "https://www.accelerate-platform.org",
    tldr: "ACCELERATE is a Brussels-based forum where children's cancer doctors, drug companies, the EMA and FDA and parents agree which new cancer drugs should be tested in children and how, so that medicines developed for adults are not left untested in childhood cancers.",
    summary: "Founded in 2013 as a joint initiative of SIOP Europe, ITCC, the European Society for Paediatric Oncology's parent groups and industry, ACCELERATE is a multi-stakeholder platform for paediatric oncology drug development. Its Paediatric Strategy Forums, held with the EMA and the FDA Oncology Center of Excellence, take a mechanism of action (ALK, MEK, BCL2, CDK4/6, ADCs, immunotherapy, radiopharmaceuticals) and agree which products should advance in children and how, an approach that feeds directly into RACE Act and EU Paediatric Regulation obligations. Other workstreams are Fit-for-Filing (making academic trial data acceptable for regulatory submissions), the Long-Term Follow-Up initiative for children on novel agents, the ACCELERATE Paediatric Oncology Master Protocol concept, and the Paediatric Oncology Preclinical Proof-of-Concept programme.",
    programs: ["Paediatric Strategy Forums (with EMA and FDA)", "Fit-for-Filing", "Long-Term Follow-Up of children on novel agents", "Pediatric Oncology Preclinical Proof-of-Concept", "Annual ACCELERATE conference"],
    links: [{ label: "ACCELERATE", url: "https://www.accelerate-platform.org" }, { label: "Paediatric Strategy Forums", url: "https://www.accelerate-platform.org/paediatric-strategy-forums/" }],
    institutions: ["siop-europe", "itcc", "ema", "fda-oce"], terms: ["race-for-children-act"], cancers: ["neuroblastoma", "dipg-dmg", "paediatric-low-grade-glioma", "all-leukemia"], bottlenecks: ["b-rare-cancers", "b-incentive-misalignment", "b-regulatory-fragmentation"], tags: PAEDIATRIC_TAGS, people: ["nicole-scobie"] }),

  b({ id: "itcc", name: "Innovative Therapies for Children with Cancer (ITCC)", aka: ["ITCC", "ITCC consortium"], institutionType: "consortium", city: "Villejuif", country: "FR", lat: 48.794, lng: 2.349, website: "https://www.itcc-consortium.org",
    tldr: "Europe's network of children's hospitals that run the first trials of new cancer drugs in children, so that European children can access experimental medicines close to home.",
    summary: "Founded in 2003 and coordinated from Gustave Roussy, ITCC links more than 60 European paediatric oncology centres and around 25 research laboratories to conduct early-phase (phase 1 and 2) trials of new anticancer agents in children and adolescents. It runs academic platform trials including ESMART (molecularly matched combinations at relapse, the European counterpart of Pediatric MATCH) and the MAPPYACTS sequencing programme, partners with industry on paediatric investigation plans, and works with SIOP Europe and ACCELERATE on regulatory strategy. ITCC-P4 built a library of paediatric patient-derived xenograft models for preclinical testing under the IMI programme.",
    programs: ["Early-phase paediatric trials network", "ESMART platform trial", "MAPPYACTS molecular profiling", "ITCC-P4 preclinical PDX platform", "Industry partnerships for paediatric investigation plans"],
    links: [{ label: "ITCC", url: "https://www.itcc-consortium.org" }],
    institutions: ["gustave-roussy", "siop-europe", "accelerate-platform", "princess-maxima", "great-ormond-street"], trials: ["pediatric-match"], technologies: ["pdx-models", "cgp"], cancers: ["neuroblastoma", "dipg-dmg", "paediatric-low-grade-glioma", "rhabdomyosarcoma"], bottlenecks: ["b-rare-cancers", "b-trial-enrolment"], tags: PAEDIATRIC_TAGS, people: ["pamela-kearns"] }),

  b({ id: "histiocyte-society", name: "Histiocyte Society", institutionType: "consortium", city: "Pitman", country: "US", lat: 39.733, lng: -75.132, website: "https://histiocytesociety.org",
    tldr: "The international society of doctors and scientists who study histiocytic disorders; its LCH trials, run since the 1990s, set the worldwide standard for treating Langerhans cell histiocytosis in children.",
    summary: "Founded in 1985, the Histiocyte Society brings together clinicians and researchers working on Langerhans cell histiocytosis, haemophagocytic lymphohistiocytosis, Erdheim-Chester disease, Rosai-Dorfman disease and juvenile xanthogranuloma. It has run the sequential international LCH-I (1991), LCH-II, LCH-III (2001-2008) and LCH-IV trials, which established vinblastine-prednisone as standard therapy and defined its duration, and the HLH-94 and HLH-2004 protocols. It publishes classification and consensus guidelines, holds an annual scientific meeting, and maintains registries that supported the recognition of histiocytoses as MAPK-driven clonal neoplasms.",
    programs: ["LCH-I to LCH-IV international trials", "HLH-94 and HLH-2004 protocols", "Histiocytosis classification and consensus guidelines", "Annual meeting and registries"],
    links: [{ label: "Histiocyte Society", url: "https://histiocytesociety.org" }],
    trials: ["lch-iii"], cancers: ["langerhans-cell-histiocytosis", "histiocytoses"], drugs: ["vinblastine"], bottlenecks: ["b-rare-cancers"], tags: PAEDIATRIC_TAGS, people: ["vasanta-nanduri"] }),
];

// =====================================================================================
// Regulatory lever
// =====================================================================================
const terms: TermInput[] = [
  term({ id: "race-for-children-act", name: "RACE for Children Act", aka: ["Research to Accelerate Cures and Equity for Children Act", "FDARA Title V section 504", "PREA molecular target amendment"], category: "regulatory",
    tldr: "A US law that makes drug companies test new targeted cancer drugs in children whenever the drug's target matters in a childhood cancer, instead of letting them skip children because their cancers are rare.",
    summary: "The RACE for Children Act was enacted as Title V of the FDA Reauthorization Act (FDARA) of 2017 and took effect for applications submitted from 18 August 2020. It amended the Pediatric Research Equity Act (PREA) so that a new drug or biologic for an adult cancer must include a paediatric investigation if it is directed at a molecular target that the FDA judges 'substantially relevant to the growth or progression of a pediatric cancer', and it removed the orphan-drug exemption from PREA for such products. The FDA Oncology Center of Excellence maintains the relevant and non-relevant molecular target lists (updated after Pediatric Oncology Subcommittee of ODAC meetings) and issues written requests and waivers. The Act complements the EU Paediatric Regulation (EC 1901/2006), whose paediatric investigation plans (PIPs) had allowed class waivers for adult-only conditions; the EU is revising that regulation to adopt a mechanism-of-action test. In practice the two levers, together with the ACCELERATE Paediatric Strategy Forums, are why paediatric plans now accompany most new ALK, MEK, BRAF, NTRK, RET, BCL2, CDK4/6 and ADC programmes, and why tovorafenib, dabrafenib-trametinib and selpercatinib reached children within a few years of adult data.",
    links: [ { label: "FDA: relevant paediatric molecular target list", url: "https://www.fda.gov/about-fda/oncology-center-excellence/pediatric-oncology" }, { label: "FDARA 2017 (Public Law 115-52)", url: "https://www.congress.gov/bill/115th-congress/house-bill/2430" }],
    institutions: ["fda-oce", "ema", "accelerate-platform", "childrens-oncology-group", "itcc"], trials: ["firefly-1", "tadpole", "pediatric-match"], drugs: ["tovorafenib", "dabrafenib-trametinib", "selpercatinib", "larotrectinib"], cancers: ["paediatric-low-grade-glioma", "dipg-dmg", "neuroblastoma"], terms: ["orphan-drug", "accelerated-approval"], related: ["bpca-prea", "eu-paediatric-regulation", "fdasia-2012", "orphan-drug-act", "eu-orphan-regulation"], bottlenecks: ["b-rare-cancers", "b-incentive-misalignment"], tags: [...PAEDIATRIC_TAGS, "regulatory"] }),
];

export const paediatricFronts: EntityInput[] = [...trials, ...institutions, ...terms];

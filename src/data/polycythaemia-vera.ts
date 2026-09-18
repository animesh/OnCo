/**
 * Polycythaemia vera (16 Sept 2026, owner request): a dedicated cancer page with its pivotal trials, plain-English terms and
 * two ideas, cross-linked to the myeloproliferative neoplasms record, the JAK2 target and the PV medicines already recorded
 * (ruxolitinib, ropeginterferon alfa-2b, rusfertide, hydroxyurea, givinostat, bomedemstat). Facts follow the primary trial
 * publications (CYTO-PV NEJM 2013, RESPONSE NEJM 2015, RESPONSE-2 Lancet Oncology 2017, PROUD-PV and CONTINUATION-PV Lancet
 * Haematology 2020, Low-PV Lancet Haematology 2021, MAJIC-PV JCO 2023, VERIFY 2025) and the regulators' approval notices.
 * Registered in src/data/index.ts as polycythaemiaVera.
 */
import type { CancerInput, IdeaInput, TermInput, TrialInput } from "@/lib/schema";

const asOf = "2026-09-16";
const W = (s: string) => `https://en.wikipedia.org/wiki/${s}`;
const ct = (nct: string) => ({ label: `ClinicalTrials.gov ${nct}`, url: `https://clinicaltrials.gov/study/${nct}` });
const tags = ["polycythaemia-vera", "mpn"];

export const pvCancer: CancerInput = {
  id: "polycythaemia-vera", kind: "cancer", name: "Polycythaemia vera (PV)", group: "haematologic", asOf, tags, wikipedia: W("Polycythemia_vera"),
  aka: ["Polycythemia vera", "PV", "Primary polycythaemia", "Vaquez disease", "Vaquez-Osler disease"],
  burden: "Around one to two new cases per 100,000 people a year, most diagnosed in their sixties; with treatment most people live for decades, and the main dangers are clots, bleeding and, late on, scarring of the marrow or leukaemia.",
  tldr: "Polycythaemia vera is a slow blood cancer in which a single faulty gene, JAK2, makes the bone marrow produce too many red cells. Thick blood causes clots, so treatment thins it (blood removal, aspirin) and, for higher-risk patients, calms the marrow with hydroxyurea, interferon or ruxolitinib; a hepcidin mimic, rusfertide, now controls red cell counts without regular blood removal.",
  summary: "Polycythaemia vera is one of the classical myeloproliferative neoplasms. Almost every case carries a mutation in JAK2 (V617F in about 95 percent, exon 12 in most of the rest) that keeps the red-cell growth signal switched on without erythropoietin. The result is a high haematocrit, often with raised platelets and white cells, an enlarged spleen, itching after warm water, burning red hands and feet, and above all a raised risk of arterial and venous thrombosis, including clots in unusual places such as the hepatic veins. Diagnosis rests on the blood count, the JAK2 mutation, a hypercellular marrow and a low erythropoietin level. Treatment is risk-adapted: everyone has low-dose aspirin and phlebotomy to keep the haematocrit under 45 percent, a target proven by the CYTO-PV trial; people over 60 or with a prior clot add a cytoreductive drug, hydroxyurea or ropeginterferon alfa-2b, with ruxolitinib for those hydroxyurea fails. Rusfertide, a hepcidin mimetic that starves red-cell production of iron, was approved in 2026 for phlebotomy-dependent disease. Over decades a minority progress to post-PV myelofibrosis and a few percent to acute leukaemia, which is why the field is now chasing molecular remission with interferon and JAK2 V617F-selective inhibitors.",
  subtypes: ["JAK2 V617F-positive (about 95 percent)", "JAK2 exon 12-mutated (about 3 percent; often isolated erythrocytosis)", "Masked PV (haemoglobin below the WHO threshold but marrow and mutation typical)", "Post-PV myelofibrosis (spent phase)", "PV in blast phase (transformation to acute myeloid leukaemia)"],
  biomarkers: ["JAK2 V617F allele burden (falls with interferon; a marker of molecular response)", "JAK2 exon 12 mutations", "Haematocrit, with treatment targeting below 45 percent", "Serum erythropoietin (low in PV, high in secondary erythrocytosis)", "Leukocyte count above 11 x 10^9/L (thrombosis risk)", "Additional mutations in TET2, ASXL1, SRSF2, IDH1/2 (progression risk)", "Age over 60 and prior thrombosis (the two risk factors that define high-risk disease)"],
  standardOfCare: [
    { setting: "Diagnosis", approach: "Full blood count, JAK2 V617F and exon 12 testing, serum erythropoietin, and bone marrow biopsy showing trilineage growth; WHO criteria (haemoglobin above 16.5 g/dL in men or 16.0 in women, or haematocrit above 49 or 48 percent). Secondary causes of a high red count (smoking, sleep apnoea, kidney or liver tumours, testosterone) are excluded first.", refs: ["jak2", "erythrocytosis"] },
    { setting: "All patients", approach: "Low-dose aspirin unless contraindicated, phlebotomy to a haematocrit under 45 percent (CYTO-PV), and control of cardiovascular risk factors.", refs: ["aspirin", "cyto-pv", "phlebotomy", "haematocrit"] },
    { setting: "Low risk (under 60, no prior clot)", approach: "Aspirin and phlebotomy alone; ropeginterferon alfa-2b is an option when phlebotomy is poorly tolerated or symptoms persist (Low-PV).", refs: ["ropeginterferon-alfa-2b", "low-pv"] },
    { setting: "High risk (over 60 or prior clot)", approach: "Add cytoreduction: hydroxyurea, or ropeginterferon alfa-2b (PROUD-PV and CONTINUATION-PV), the latter preferred in younger patients and in pregnancy.", refs: ["hydroxyurea", "ropeginterferon-alfa-2b", "proud-pv"] },
    { setting: "Hydroxyurea resistance or intolerance", approach: "Ruxolitinib (RESPONSE, RESPONSE-2, MAJIC-PV) for haematocrit control, spleen shrinkage and symptom relief; interferon if not already tried.", refs: ["ruxolitinib", "response", "response-2", "majic-pv"] },
    { setting: "Phlebotomy-dependent disease", approach: "Rusfertide, a hepcidin mimetic given by weekly injection, keeps the haematocrit under 45 percent and removes the need for phlebotomy in most patients (VERIFY).", refs: ["rusfertide", "verify", "hepcidin"] },
    { setting: "Itching and burning extremities", approach: "Antihistamines, aspirin for erythromelalgia, interferon or ruxolitinib for severe aquagenic pruritus.", refs: ["aquagenic-pruritus", "erythromelalgia"] },
    { setting: "Post-PV myelofibrosis", approach: "Managed as myelofibrosis: JAK inhibitors for spleen and symptoms, momelotinib for anaemia, allogeneic stem cell transplant for fit higher-risk patients.", refs: ["myeloproliferative-neoplasms", "ruxolitinib", "momelotinib", "post-pv-myelofibrosis"] },
  ],
  stateOfArt: [
    "Keeping the haematocrit under 45 percent cuts major clots and cardiovascular death to about a third, the single most important result in PV (CYTO-PV).",
    "Ropeginterferon alfa-2b is the first drug shown to shrink the JAK2 mutant clone in a randomised trial, and its long-term molecular responses raise the prospect of changing the course of the disease rather than only controlling counts.",
    "Ruxolitinib gives durable haematocrit and symptom control after hydroxyurea fails, and in MAJIC-PV a complete response tracked with fewer clots and progressions.",
    "Rusfertide, approved in 2026, is the first mechanistically new PV drug in a decade: by mimicking hepcidin it starves red-cell production of iron and made three quarters of patients phlebotomy-free in VERIFY.",
    "The unmet needs are a treatment that prevents progression to myelofibrosis and leukaemia, and a way to select who needs cytoreduction beyond age and clot history.",
  ],
  history: [
    { year: 1892, title: "Vaquez describes the disease", note: "Louis Henri Vaquez reports a patient with persistent excess red cells and an enlarged spleen." },
    { year: 1903, title: "Osler defines a clinical syndrome", note: "William Osler collects cases of chronic cyanosis with polycythaemia and splenomegaly." },
    { year: 1951, title: "Dameshek groups the myeloproliferative disorders", note: "PV, essential thrombocythaemia, myelofibrosis and CML proposed as related diseases of the marrow.", refs: ["myeloproliferative-neoplasms"] },
    { year: 1967, title: "Polycythemia Vera Study Group founded", note: "Louis Wasserman's cooperative group runs the first randomised PV trials, comparing phlebotomy, radiophosphorus and chlorambucil, and shows the leukaemia risk of alkylating agents." },
    { year: 2005, title: "JAK2 V617F discovered", note: "Four groups report the mutation in almost all PV; the first molecular marker for BCR-ABL1-negative MPN and the target for the JAK inhibitors that followed.", refs: ["jak2", "jak2-v617f"] },
    { year: 2013, title: "CYTO-PV proves the haematocrit target", note: "Keeping the haematocrit under 45 percent gives fewer cardiovascular deaths and major clots than a 45 to 50 percent target.", refs: ["cyto-pv", "haematocrit"] },
    { year: 2014, title: "Ruxolitinib approved for PV", note: "FDA approval in December 2014 for hydroxyurea-resistant or intolerant PV on the RESPONSE trial; EU approval followed in 2015.", refs: ["ruxolitinib", "response"] },
    { year: 2019, title: "Ropeginterferon alfa-2b approved in Europe", note: "The first interferon licensed for PV, on PROUD-PV and CONTINUATION-PV; FDA approval followed in November 2021.", refs: ["ropeginterferon-alfa-2b", "proud-pv"] },
    { year: 2021, title: "Low-PV: interferon helps low-risk patients too", note: "Ropeginterferon plus phlebotomy kept more low-risk patients at target than phlebotomy alone.", refs: ["low-pv"] },
    { year: 2023, title: "MAJIC-PV links complete response to fewer events", note: "Ruxolitinib beat best available therapy after hydroxyurea failure, and complete responders had better event-free survival.", refs: ["majic-pv", "ruxolitinib"] },
    { year: 2025, title: "VERIFY: a hepcidin mimetic replaces phlebotomy", note: "Rusfertide added to standard care made most patients phlebotomy-free over weeks 20 to 32.", refs: ["verify", "rusfertide"] },
    { year: 2026, title: "Rusfertide approved", note: "FDA approval for phlebotomy-dependent polycythaemia vera.", refs: ["rusfertide"] },
  ],
  pipeline: ["givinostat", "bomedemstat", "nct06093672", "idea-pv-clone-directed-therapy", "idea-pv-hepcidin-first"],
  openProblems: [
    "No treatment has yet been shown to prevent progression to myelofibrosis or leukaemia; interferon's molecular responses are the strongest hint.",
    "Risk stratification still rests on age and clot history; leukocyte count, allele burden and additional mutations are not yet built into treatment decisions.",
    "Whether low-risk patients should have early cytoreduction (Low-PV suggests yes for interferon) remains unsettled and depends on cost and tolerability.",
    "Aquagenic pruritus and fatigue are under-treated and poorly measured in trials.",
    "Hepcidin mimetics control counts but their effect on thrombosis and long-term outcomes is not yet known.",
  ],
  links: [{ label: "Wikipedia", url: W("Polycythemia_vera") }, { label: "MPN Research Foundation", url: "https://www.mpnresearchfoundation.org/polycythemia-vera/" }, { label: "NCI PDQ: chronic myeloproliferative neoplasms", url: "https://www.cancer.gov/types/myeloproliferative/patient/chronic-treatment-pdq" }],
};

type T = Omit<TrialInput, "kind" | "asOf">;
const t = (x: T): TrialInput => ({ kind: "trial", asOf, tags, ...x });
export const pvTrials: TrialInput[] = [
  t({ id: "cyto-pv", name: "CYTO-PV", nct: "NCT01645124", phase: "3", status: "positive", yearReported: 2013, sponsor: "GIMEMA (Gruppo Italiano Malattie Ematologiche dell'Adulto)", enrolled: 365,
    setting: "Polycythaemia vera: haematocrit target below 45 percent versus 45 to 50 percent",
    tldr: "CYTO-PV settled the most basic question in PV: keeping the haematocrit under 45 percent gives far fewer serious clots and cardiovascular deaths than a looser target.",
    summary: "CYTO-PV randomised 365 adults with polycythaemia vera to a haematocrit target below 45 percent or between 45 and 50 percent, achieved with phlebotomy and hydroxyurea. After a median of 31 months the primary endpoint of cardiovascular death or major thrombosis occurred in 2.7 percent of the low-target group and 9.8 percent of the high-target group (Marchioli and colleagues, New England Journal of Medicine 2013). The result made 45 percent the universal target.",
    result: "Cardiovascular death or major thrombosis 2.7% vs 9.8% (hazard ratio 3.91 for the higher target).",
    outcomes: [{ endpoint: "Cardiovascular death or major thrombosis", primary: true, unit: "%", arms: [{ name: "Haematocrit below 45%", n: 182, value: 2.7 }, { name: "Haematocrit 45 to 50%", n: 183, value: 9.8 }] }],
    drugs: ["hydroxyurea"], cancers: ["polycythaemia-vera", "myeloproliferative-neoplasms"], links: [ct("NCT01645124"), { label: "NEJM 2013", url: "https://www.nejm.org/doi/full/10.1056/NEJMoa1208500" }] }),
  t({ id: "response", name: "RESPONSE", nct: "NCT01243944", phase: "3", status: "positive", yearReported: 2015, sponsor: "Incyte and Novartis", enrolled: 222,
    setting: "Polycythaemia vera resistant to or intolerant of hydroxyurea, with an enlarged spleen: ruxolitinib versus best available therapy",
    tldr: "RESPONSE showed that ruxolitinib controls the haematocrit and shrinks the spleen in PV patients hydroxyurea has failed, and won the first drug approval specific to that setting.",
    summary: "RESPONSE randomised 222 patients with PV who were resistant to or intolerant of hydroxyurea and had splenomegaly to ruxolitinib or best available therapy. At week 32 the composite primary endpoint of haematocrit control without phlebotomy plus a 35 percent or greater reduction in spleen volume was reached by 21 percent on ruxolitinib versus 1 percent on best available therapy (Vannucchi and colleagues, New England Journal of Medicine 2015); haematocrit control alone was 60 percent versus 20 percent. The FDA approved ruxolitinib for this use in December 2014.",
    result: "Composite response at week 32: 21% vs 1%; haematocrit control 60% vs 20%.",
    outcomes: [{ endpoint: "Haematocrit control plus 35% spleen reduction at week 32", primary: true, unit: "%", arms: [{ name: "Ruxolitinib", n: 110, value: 21 }, { name: "Best available therapy", n: 112, value: 1 }] }],
    drugs: ["ruxolitinib"], cancers: ["polycythaemia-vera", "myeloproliferative-neoplasms"], companies: ["incyte", "novartis"], links: [ct("NCT01243944"), { label: "NEJM 2015", url: "https://www.nejm.org/doi/full/10.1056/NEJMoa1409002" }] }),
  t({ id: "response-2", name: "RESPONSE-2", nct: "NCT02038036", phase: "3", status: "positive", yearReported: 2017, sponsor: "Novartis", enrolled: 149,
    setting: "Hydroxyurea-resistant or intolerant polycythaemia vera without splenomegaly: ruxolitinib versus best available therapy",
    tldr: "RESPONSE-2 extended ruxolitinib's benefit to PV patients without an enlarged spleen: three times as many reached haematocrit control.",
    summary: "RESPONSE-2 randomised 149 patients with hydroxyurea-resistant or intolerant PV and no palpable spleen to ruxolitinib or best available therapy. Haematocrit control at week 28, the primary endpoint, was achieved by 62 percent on ruxolitinib versus 19 percent on best available therapy (Passamonti and colleagues, Lancet Oncology 2017), with better symptom scores.",
    result: "Haematocrit control at week 28: 62% vs 19%.",
    outcomes: [{ endpoint: "Haematocrit control at week 28", primary: true, unit: "%", arms: [{ name: "Ruxolitinib", n: 74, value: 62 }, { name: "Best available therapy", n: 75, value: 19 }] }],
    drugs: ["ruxolitinib"], cancers: ["polycythaemia-vera"], companies: ["novartis"], links: [ct("NCT02038036")] }),
  t({ id: "proud-pv", name: "PROUD-PV and CONTINUATION-PV", nct: "NCT01949805", phase: "3", status: "positive", yearReported: 2020, sponsor: "AOP Orphan Pharmaceuticals", enrolled: 257,
    setting: "Polycythaemia vera needing cytoreduction: ropeginterferon alfa-2b versus hydroxyurea, with long-term follow-up",
    tldr: "PROUD-PV and its extension showed that ropeginterferon matches hydroxyurea in the first year and then pulls ahead, with more complete responses and far more molecular responses by three years.",
    summary: "PROUD-PV randomised 257 patients with PV to ropeginterferon alfa-2b every two weeks or hydroxyurea; CONTINUATION-PV followed 171 of them. Non-inferiority for complete haematological response at 12 months was not formally shown, but from 24 months onward the interferon arm had more complete haematological responses with improved disease burden and a much higher rate of molecular response, with the JAK2 V617F allele burden falling steadily over years (Gisslinger and colleagues, Lancet Haematology 2020). The trials underpinned the EU approval in 2019 and the FDA approval in 2021.",
    result: "By 36 months, complete haematological response with improved disease burden and molecular response were both more frequent with ropeginterferon than hydroxyurea.",
    outcomes: [{ endpoint: "Complete haematological response with normal spleen size at 12 months (PROUD-PV)", primary: true, unit: "%", arms: [{ name: "Ropeginterferon alfa-2b", n: 122, value: 21, note: "Non-inferiority to hydroxyurea not shown at 12 months" }, { name: "Hydroxyurea", n: 123, value: 28 }], source: "https://doi.org/10.1016/S2352-3026(19)30236-4" },
      { endpoint: "Complete haematological response with improved disease burden at 36 months (CONTINUATION-PV)", primary: true, unit: "%", arms: [{ name: "Ropeginterferon alfa-2b", n: 95, value: 53 }, { name: "Hydroxyurea", n: 74, value: 38 }], p: "0.044", source: "https://doi.org/10.1016/S2352-3026(19)30236-4" },
      { endpoint: "Complete haematological response at 36 months (without the spleen criterion)", unit: "%", arms: [{ name: "Ropeginterferon alfa-2b", n: 95, value: 71 }, { name: "Hydroxyurea", n: 74, value: 51 }], p: "0.012", source: "https://doi.org/10.1016/S2352-3026(19)30236-4" }],
    drugs: ["ropeginterferon-alfa-2b", "hydroxyurea"], cancers: ["polycythaemia-vera", "myeloproliferative-neoplasms"], companies: ["pharmaessentia"], links: [ct("NCT01949805"), ct("NCT02218047"), { label: "Lancet Haematology 2020", url: "https://doi.org/10.1016/S2352-3026(19)30236-4" }] }),
  t({ id: "low-pv", name: "Low-PV", nct: "NCT03003325", phase: "2", status: "positive", yearReported: 2021, sponsor: "FROM Research Foundation, Bergamo", enrolled: 127,
    setting: "Low-risk polycythaemia vera: ropeginterferon alfa-2b plus phlebotomy versus phlebotomy alone",
    tldr: "Low-PV asked whether even low-risk patients gain from interferon: more of them stayed at the haematocrit target without progression when ropeginterferon was added to phlebotomy.",
    summary: "Low-PV randomised 127 patients with low-risk PV (under 60 with no prior thrombosis) to phlebotomy plus low-dose aspirin with or without ropeginterferon alfa-2b. At 12 months, 84 percent on ropeginterferon kept a haematocrit at or below 45 percent without progressive disease versus 60 percent with phlebotomy alone (Barbui and colleagues, Lancet Haematology 2021), with fewer phlebotomies and no excess serious harm; the benefit held at two years.",
    result: "Haematocrit at or below 45% without progression at 12 months: 84% vs 60%.",
    outcomes: [{ endpoint: "Response at 12 months", primary: true, unit: "%", arms: [{ name: "Ropeginterferon + phlebotomy", n: 64, value: 84 }, { name: "Phlebotomy alone", n: 63, value: 60 }] }],
    drugs: ["ropeginterferon-alfa-2b"], cancers: ["polycythaemia-vera"], links: [ct("NCT03003325")] }),
  t({ id: "majic-pv", name: "MAJIC-PV", phase: "2", status: "positive", yearReported: 2023, sponsor: "University of Birmingham (UK)", enrolled: 180,
    setting: "Hydroxyurea-resistant or intolerant polycythaemia vera: ruxolitinib versus best available therapy",
    tldr: "MAJIC-PV, a UK academic trial, found that ruxolitinib gave more complete responses than best available therapy and, for the first time, that a complete response went with fewer clots and progressions.",
    summary: "MAJIC-PV randomised 180 patients with PV resistant to or intolerant of hydroxyurea to ruxolitinib or best available therapy. Complete response within a year, the primary endpoint, was reached by 43 percent on ruxolitinib versus 26 percent on best available therapy; complete responders had better event-free survival (thrombosis, haemorrhage, transformation or death), and the JAK2 V617F allele burden fell more on ruxolitinib (Harrison and colleagues, Journal of Clinical Oncology 2023). Registered as ISRCTN61925716.",
    result: "Complete response within 1 year: 43% vs 26%; complete response associated with better event-free survival.",
    outcomes: [{ endpoint: "Complete response within 1 year", primary: true, unit: "%", arms: [{ name: "Ruxolitinib", n: 93, value: 43 }, { name: "Best available therapy", n: 87, value: 26 }] }],
    drugs: ["ruxolitinib"], cancers: ["polycythaemia-vera"], links: [{ label: "ISRCTN61925716", url: "https://www.isrctn.com/ISRCTN61925716" }, { label: "JCO 2023", url: "https://doi.org/10.1200/JCO.22.01935" }] }),
  t({ id: "verify", name: "VERIFY", nct: "NCT05210790", phase: "3", status: "positive", yearReported: 2025, sponsor: "Protagonist Therapeutics and Takeda", enrolled: 293,
    setting: "Phlebotomy-dependent polycythaemia vera: rusfertide versus placebo added to standard care",
    tldr: "VERIFY showed that weekly rusfertide, a hepcidin mimetic, freed most PV patients from phlebotomy and improved their symptoms, leading to the drug's approval in 2026.",
    summary: "VERIFY randomised 293 patients with PV who needed frequent phlebotomies to weekly subcutaneous rusfertide or placebo on top of their usual treatment. Over weeks 20 to 32, 77 percent on rusfertide were responders (no phlebotomy needed) versus 33 percent on placebo, with fewer phlebotomies, sustained haematocrit control and better patient-reported fatigue and itch; the results were presented at ASCO 2025 and published the same year. The FDA approved rusfertide in 2026.",
    result: "Response (no phlebotomy eligibility) weeks 20 to 32: 77% vs 33%.",
    outcomes: [{ endpoint: "Clinical response weeks 20 to 32", primary: true, unit: "%", arms: [{ name: "Rusfertide", n: 147, value: 77 }, { name: "Placebo", n: 146, value: 33 }] }],
    drugs: ["rusfertide"], cancers: ["polycythaemia-vera", "myeloproliferative-neoplasms"], companies: ["protagonist-therapeutics", "takeda"], links: [ct("NCT05210790")] }),
];

type Tm = Omit<TermInput, "kind" | "asOf">;
const tm = (x: Tm): TermInput => ({ kind: "term", asOf, tags, ...x });
export const pvTerms: TermInput[] = [
  tm({ id: "jak2-v617f", name: "JAK2 V617F", category: "Genomics and genetics", wikipedia: W("Janus_kinase_2"),
    tldr: "A single letter change in the JAK2 gene that jams the growth signal for blood cells in the on position. Almost everyone with polycythaemia vera has it, as do about half of those with essential thrombocythaemia or myelofibrosis.",
    summary: "JAK2 V617F swaps one amino acid (valine for phenylalanine at position 617) in the Janus kinase 2 enzyme, removing its brake so that red cell, platelet and white cell precursors grow without the normal hormone signals. Found in 2005, it is present in about 95 percent of polycythaemia vera and 50 to 60 percent of essential thrombocythaemia and primary myelofibrosis. The share of blood cells carrying it (the allele burden) tracks disease bulk and falls with interferon treatment, which is why it is used as a marker of molecular response.",
    cancers: ["polycythaemia-vera", "myeloproliferative-neoplasms"], targets: ["jak2"], drugs: ["ruxolitinib", "ropeginterferon-alfa-2b"], links: [{ label: "Wikipedia", url: W("Janus_kinase_2") }] }),
  tm({ id: "phlebotomy", name: "Phlebotomy (venesection)", category: "Procedures", wikipedia: W("Bloodletting"),
    tldr: "Removing about a pint of blood through a vein, as in a blood donation, to bring the red cell count down. It is the oldest treatment in polycythaemia vera and still the first.",
    summary: "Therapeutic phlebotomy removes 250 to 500 millilitres of blood at a time to lower the haematocrit, usually weekly at first and then every few months once the target is reached. It works by removing red cells and by making the patient iron-deficient, which slows red-cell production. Its drawbacks are the iron deficiency itself (fatigue, restless legs), the time and needle burden, and the fact that counts rebound between sessions; drugs such as rusfertide aim to replace it.",
    cancers: ["polycythaemia-vera"], drugs: ["rusfertide"], trials: ["cyto-pv", "verify"], links: [{ label: "Wikipedia", url: W("Bloodletting") }] }),
  tm({ id: "haematocrit", name: "Haematocrit", category: "Diagnostics and imaging", wikipedia: W("Hematocrit"),
    tldr: "The share of blood volume made up of red cells. Normal is roughly 40 to 50 percent; in polycythaemia vera treatment aims to keep it under 45 percent, because above that clots become much more likely.",
    summary: "Haematocrit is measured on every full blood count. In polycythaemia vera it is the number treatment is steered by: the CYTO-PV trial showed that a target below 45 percent, compared with 45 to 50 percent, cut cardiovascular deaths and major clots by about two thirds. Some experts use a lower target of 42 percent in women, whose normal range is lower.",
    cancers: ["polycythaemia-vera"], trials: ["cyto-pv"], links: [{ label: "Wikipedia", url: W("Hematocrit") }] }),
  tm({ id: "erythrocytosis", targets: ["jak2"], name: "Erythrocytosis (primary vs secondary)", category: "Biology basics", wikipedia: W("Polycythemia"),
    tldr: "Too many red cells. In polycythaemia vera the marrow itself is at fault (primary); far more often the cause is something else driving it, such as smoking, low oxygen, sleep apnoea, a kidney tumour or testosterone (secondary).",
    summary: "Erythrocytosis simply means a raised red cell mass. Secondary erythrocytosis is the body's response to low oxygen or to excess erythropoietin and is not a cancer; primary erythrocytosis, of which polycythaemia vera is the main form, comes from a clonal marrow disorder. The two are separated by the serum erythropoietin level (low in PV, normal or high in secondary causes), the JAK2 mutation and the marrow picture. Getting this right matters because the treatments are entirely different.",
    cancers: ["polycythaemia-vera"], links: [{ label: "Wikipedia", url: W("Polycythemia") }] }),
  tm({ id: "hepcidin", name: "Hepcidin", category: "Biology basics", wikipedia: W("Hepcidin"),
    tldr: "The liver hormone that controls how much iron the body absorbs and releases. Drugs that mimic it lock iron away so the marrow cannot make excess red cells, the idea behind rusfertide.",
    summary: "Hepcidin, made in the liver, blocks the iron exporter ferroportin on gut cells and macrophages, lowering the iron available to the bone marrow. In polycythaemia vera hepcidin is inappropriately low, so red-cell production runs unchecked. Rusfertide is an injectable hepcidin mimetic that restores the brake and replaced phlebotomy in most patients in the VERIFY trial; RNA drugs that raise the body's own hepcidin by silencing TMPRSS6 are in early trials.",
    cancers: ["polycythaemia-vera"], drugs: ["rusfertide"], trials: ["verify"], links: [{ label: "Wikipedia", url: W("Hepcidin") }] }),
  tm({ id: "aquagenic-pruritus", name: "Aquagenic pruritus", category: "Side effects", wikipedia: W("Aquagenic_pruritus"),
    tldr: "Intense itching, prickling or burning of the skin within minutes of contact with water, typically after a shower. It affects a large minority of people with polycythaemia vera and can be the most disabling symptom.",
    summary: "Aquagenic pruritus has no rash and is triggered by water of any temperature. It is thought to involve mast cells and abnormal skin nerve signalling driven by the JAK2 clone. Antihistamines help some; JAK inhibition with ruxolitinib and interferon are the most effective treatments, and phototherapy and SSRIs are used when those are not suitable.",
    cancers: ["polycythaemia-vera", "myeloproliferative-neoplasms"], drugs: ["ruxolitinib", "ropeginterferon-alfa-2b"], links: [{ label: "Wikipedia", url: W("Aquagenic_pruritus") }] }),
  tm({ id: "erythromelalgia", name: "Erythromelalgia", category: "Side effects", wikipedia: W("Erythromelalgia"),
    tldr: "Burning pain, redness and heat in the hands or feet, brought on by warmth. In polycythaemia vera and essential thrombocythaemia it comes from platelets clumping in tiny vessels and often disappears with low-dose aspirin.",
    summary: "Erythromelalgia in the myeloproliferative neoplasms is a microvascular symptom caused by activated platelets blocking small arterioles in the extremities. Its hallmark is rapid relief with aspirin, which is one reason low-dose aspirin is part of PV treatment for almost everyone. Persistent symptoms call for cytoreduction to lower the platelet count.",
    cancers: ["polycythaemia-vera", "myeloproliferative-neoplasms"], drugs: ["aspirin"], links: [{ label: "Wikipedia", url: W("Erythromelalgia") }] }),
  tm({ id: "post-pv-myelofibrosis", name: "Post-PV myelofibrosis (spent phase)", category: "Biology basics", wikipedia: W("Myelofibrosis"),
    tldr: "The late stage some people with polycythaemia vera reach after many years, when the marrow scars over, the red count falls and the spleen swells. It is treated as myelofibrosis.",
    summary: "Over one to two decades a minority of PV patients progress to post-PV myelofibrosis: marrow fibrosis, falling haemoglobin, a large spleen, constitutional symptoms and sometimes transformation to acute leukaemia. Risk rises with age, duration of disease, high white cell counts and additional mutations such as ASXL1 and SRSF2. Management follows myelofibrosis: JAK inhibitors for spleen and symptoms, momelotinib for anaemia, and allogeneic stem cell transplant for fit higher-risk patients. Preventing this transition is the main long-term goal of PV research.",
    cancers: ["polycythaemia-vera", "myeloproliferative-neoplasms"], drugs: ["ruxolitinib", "momelotinib"], links: [{ label: "Wikipedia", url: W("Myelofibrosis") }] }),
];

export const pvIdeas: IdeaInput[] = [
  { id: "idea-pv-clone-directed-therapy", asOf, kind: "idea", tags, name: "Clearing the JAK2 clone in polycythaemia vera: interferon plus mutant-selective inhibitors as a route to treatment-free remission", maturity: "early-clinical", actor: "industry", cost: "large", horizonYears: 7,
    tldr: "Today's PV drugs control blood counts but leave the mutant cells in place. Interferon is the one treatment that shrinks the clone, and the first JAK2 V617F-selective inhibitors have entered trials; combining the two could aim at molecular remission, the way imatinib did for CML.",
    summary: "Polycythaemia vera is driven by a single recurrent mutation in almost every patient, yet no treatment is given with the aim of eliminating it. Ropeginterferon alfa-2b lowers the JAK2 V617F allele burden year on year in PROUD-PV and CONTINUATION-PV, and a fraction of patients reach very low burdens. Ruxolitinib blocks wild-type and mutant JAK2 alike, which limits its dose and spares the clone. Mutant-selective JAK2 V617F inhibitors are now in first-in-human trials. The idea is to test interferon plus a mutant-selective inhibitor against interferon alone with molecular response and progression, not haematocrit, as the endpoints.",
    hypothesis: "Ropeginterferon alfa-2b combined with a JAK2 V617F-selective inhibitor will produce deep molecular responses (allele burden below 1 percent) in a majority of patients within three years, and deep responders will have a lower rate of progression to myelofibrosis than count-controlled patients.",
    rationale: "Interferon's molecular responses are durable and associated with fewer events; complete responders in MAJIC-PV had better event-free survival; CML showed that a single-driver disease can be pushed to treatment-free remission once the clone is suppressed deeply enough.",
    test: "A randomised phase 2 in high-risk PV: ropeginterferon with or without a mutant-selective JAK2 inhibitor once phase 1 doses are set, with JAK2 V617F allele burden at 24 and 36 months as the primary endpoint and progression, thrombosis and treatment discontinuation as secondary endpoints.",
    cancers: ["polycythaemia-vera", "myeloproliferative-neoplasms"], targets: ["jak2"], drugs: ["ropeginterferon-alfa-2b", "ruxolitinib"], trials: ["proud-pv", "majic-pv"], technologies: ["kinase-inhibitors"] },
  { id: "idea-pv-hepcidin-first", asOf, kind: "idea", tags, name: "Hepcidin-based control as first-line treatment in low-risk polycythaemia vera", maturity: "being-tested-at-scale", actor: "industry", cost: "medium", horizonYears: 5,
    tldr: "Rusfertide replaced phlebotomy in patients who needed it often. The open question is whether hepcidin control from diagnosis, in low-risk patients who today get phlebotomy alone, prevents the iron deficiency, the count swings and perhaps the clots that phlebotomy leaves behind.",
    summary: "Phlebotomy has been first-line PV treatment for a century, but it makes patients iron deficient, lets the haematocrit swing between sessions and is time consuming. Rusfertide and the TMPRSS6-silencing RNA drugs in early trials hold the haematocrit steady by limiting iron to the marrow. VERIFY tested rusfertide only as an add-on in phlebotomy-dependent disease. The idea is a first-line trial in low-risk patients comparing hepcidin control with standard phlebotomy on haematocrit time-in-target, symptoms and thrombosis, with cost and injection burden weighed against the benefit.",
    hypothesis: "In newly diagnosed low-risk PV, a hepcidin mimetic will keep patients within the haematocrit target for a larger share of time than phlebotomy, with fewer symptoms of iron deficiency and no increase in thrombosis.",
    rationale: "Haematocrit variability, not only the average, is linked to clot risk; VERIFY showed sustained control and better patient-reported outcomes; iron deficiency symptoms are common and under-recognised in phlebotomised patients.",
    test: "A randomised trial of about 300 low-risk patients, hepcidin mimetic versus phlebotomy plus aspirin, with time within haematocrit target over two years as the primary endpoint and thrombosis, fatigue scores and cost per patient-year as secondary endpoints.",
    cancers: ["polycythaemia-vera"], drugs: ["rusfertide"], trials: ["verify", "low-pv"], targets: [] },
];

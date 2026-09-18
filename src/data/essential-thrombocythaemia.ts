/**
 * Essential thrombocythaemia and aspirin (16 Sept 2026): a dedicated page for the second classical myeloproliferative neoplasm,
 * built like the polycythaemia vera page, plus a drug record for aspirin, which polycythaemia vera and essential
 * thrombocythaemia care and the cancer-prevention trials all reference. Facts follow the primary publications (PT-1 NEJM 2005,
 * MAJIC-ET Blood 2017, CAPP2 Lancet 2011 and 2020, ASPREE NEJM 2018) and the WHO classification. Registered in src/data/index.ts.
 */
import type { CancerInput, DrugInput, TrialInput } from "@/lib/schema";

const asOf = "2026-09-16";
const W = (s: string) => `https://en.wikipedia.org/wiki/${s}`;
const tags = ["essential-thrombocythaemia", "mpn"];

export const etCancer: CancerInput = {
  id: "essential-thrombocythaemia", kind: "cancer", name: "Essential thrombocythaemia (ET)", group: "haematologic", asOf, tags, wikipedia: W("Essential_thrombocythemia"),
  aka: ["Essential thrombocythemia", "ET", "Primary thrombocythaemia", "Essential thrombocytosis"],
  burden: "Around one to two new cases per 100,000 people a year, with a second peak in women in their thirties; life expectancy is close to normal for most, and the risks are clots, bleeding and slow progression to myelofibrosis.",
  tldr: "Essential thrombocythaemia is a slow blood cancer in which the marrow makes too many platelets. Most people need only aspirin and monitoring; those at higher risk of clots take a drug to lower the platelet count, usually hydroxyurea or interferon, with anagrelide in reserve.",
  summary: "Essential thrombocythaemia is a classical myeloproliferative neoplasm defined by a sustained platelet count above 450 x 10^9/L with a marrow full of large, mature megakaryocytes and no other explanation. About 60 percent carry JAK2 V617F, 20 to 25 percent a CALR mutation and 3 to 5 percent an MPL mutation; the rest are triple negative. Many people have no symptoms and are found on a routine blood count; others have headaches, visual disturbance, burning red hands and feet (erythromelalgia) or, at high platelet counts, paradoxical bleeding. Treatment is set by the IPSET-thrombosis score, which weighs age, prior clot, JAK2 status and cardiovascular risk: very low-risk patients may need nothing, low-risk patients take low-dose aspirin, and high-risk patients add cytoreduction with hydroxyurea or interferon, with anagrelide second line. The PT-1 trial showed hydroxyurea plus aspirin beats anagrelide plus aspirin on arterial clots and bleeding. Progression to myelofibrosis happens in a minority over decades and to acute leukaemia in a few percent. Bomedemstat, an LSD1 inhibitor, is in a phase 3 trial against hydroxyurea, and antibodies against mutant CALR are the first treatments aimed at the clone itself.",
  subtypes: ["JAK2 V617F-mutated (about 60 percent; higher thrombosis risk)", "CALR-mutated (20 to 25 percent; higher platelets, lower thrombosis risk)", "MPL-mutated (3 to 5 percent)", "Triple negative (10 to 15 percent)", "Prefibrotic primary myelofibrosis (a look-alike separated by marrow histology since WHO 2016)"],
  biomarkers: ["Platelet count above 450 x 10^9/L", "JAK2 V617F, CALR exon 9 and MPL W515 mutations", "IPSET-thrombosis score (age over 60, prior thrombosis, JAK2 V617F, cardiovascular risk factors)", "Marrow histology to exclude prefibrotic myelofibrosis", "Acquired von Willebrand deficiency at platelet counts above 1,000 x 10^9/L (bleeding risk with aspirin)"],
  terms: ["ipset-thrombosis", "mpn-driver-mutations"],
  standardOfCare: [
    { setting: "Diagnosis", approach: "Full blood count, JAK2, CALR and MPL testing, bone marrow biopsy to confirm ET and exclude prefibrotic myelofibrosis, and exclusion of reactive causes (iron deficiency, inflammation, infection, splenectomy).", refs: ["jak2", "jak2-v617f", "myeloproliferative-neoplasms"] },
    { setting: "Very low and low risk", approach: "Observation alone in very low risk (under 60, no clot, JAK2-negative); low-dose aspirin for low risk and for anyone with microvascular symptoms, once acquired von Willebrand deficiency is excluded at very high platelet counts.", refs: ["aspirin", "erythromelalgia"] },
    { setting: "High risk (over 60 with JAK2 or prior clot)", approach: "Cytoreduction to a platelet count under 400 x 10^9/L: hydroxyurea first line (PT-1), pegylated or ropeginterferon alfa-2b preferred under 60 and in pregnancy, anagrelide second line.", refs: ["hydroxyurea", "pt-1", "ropeginterferon-alfa-2b", "anagrelide"] },
    { setting: "Hydroxyurea resistance or intolerance", approach: "Switch to interferon or anagrelide; ruxolitinib did not beat best available therapy in MAJIC-ET but relieves symptoms.", refs: ["anagrelide", "ruxolitinib", "majic-et"] },
    { setting: "Progression to myelofibrosis", approach: "Managed as myelofibrosis: JAK inhibitors for spleen and symptoms, transplant for fit higher-risk patients.", refs: ["myeloproliferative-neoplasms", "post-pv-myelofibrosis", "ruxolitinib"] },
  ],
  stateOfArt: [
    "Most people with ET live a near-normal lifespan; the treatment question is who needs more than aspirin, and IPSET-thrombosis answers it better than platelet count alone.",
    "Hydroxyurea remains first line for high-risk disease because PT-1 showed fewer arterial clots and less bleeding than anagrelide.",
    "Interferons give molecular responses in JAK2- and CALR-mutated ET and are the choice in younger patients and pregnancy.",
    "Bomedemstat is the first new cytoreductive drug in a phase 3 trial against hydroxyurea in two decades.",
    "Mutant-CALR antibodies (INCA033989 and others) are the first treatments that target the ET clone itself, in early trials.",
  ],
  history: [
    { year: 1934, title: "Epstein and Goedel describe haemorrhagic thrombocythaemia", note: "The first account of a primary platelet disorder with bleeding and clotting." },
    { year: 1951, title: "Dameshek groups the myeloproliferative disorders", refs: ["myeloproliferative-neoplasms"] },
    { year: 2005, title: "JAK2 V617F found in half of ET", refs: ["jak2-v617f"] },
    { year: 2005, title: "PT-1: hydroxyurea beats anagrelide", note: "In 809 high-risk patients hydroxyurea plus aspirin gave fewer arterial clots, less bleeding and less progression to myelofibrosis than anagrelide plus aspirin.", refs: ["pt-1", "hydroxyurea", "anagrelide"] },
    { year: 2013, title: "CALR mutations discovered", note: "Klampfl and Nangalia find CALR exon 9 mutations in most JAK2-negative ET and myelofibrosis." },
    { year: 2016, title: "WHO separates prefibrotic myelofibrosis from ET", note: "Marrow histology now distinguishes true ET from early myelofibrosis, which carries a worse outlook." },
    { year: 2017, title: "MAJIC-ET: ruxolitinib not superior", note: "Ruxolitinib matched but did not beat best available therapy after hydroxyurea failure, though it eased symptoms.", refs: ["majic-et", "ruxolitinib"] },
    { year: 2023, title: "Bomedemstat enters phase 3", note: "Merck starts the Shorespan-007 trial against hydroxyurea in high-risk ET.", refs: ["bomedemstat"] },
  ],
  pipeline: ["bomedemstat", "ropeginterferon-alfa-2b"],
  openProblems: [
    "No treatment has been shown to prevent progression to myelofibrosis or leukaemia.",
    "Very low-risk patients receive nothing and low-risk patients aspirin, but the evidence for aspirin in CALR-mutated low-risk disease is thin and bleeding may outweigh benefit.",
    "Prefibrotic myelofibrosis is still often misdiagnosed as ET, and the two need different counselling.",
    "Pregnancy management rests on small series; interferon is preferred but randomised data are lacking.",
  ],
  links: [{ label: "Wikipedia", url: W("Essential_thrombocythemia") }, { label: "MPN Research Foundation", url: "https://www.mpnresearchfoundation.org/essential-thrombocythemia/" }],
};

type T = Omit<TrialInput, "kind" | "asOf">;
const t = (x: T): TrialInput => ({ kind: "trial", asOf, tags, ...x });
export const etTrials: TrialInput[] = [
  t({ id: "pt-1", name: "PT-1 (Primary Thrombocythaemia 1)", phase: "3", status: "positive", yearReported: 2005, sponsor: "Medical Research Council (UK)", enrolled: 809,
    setting: "High-risk essential thrombocythaemia: hydroxyurea plus aspirin versus anagrelide plus aspirin",
    tldr: "PT-1 is the trial that made hydroxyurea the first-line drug in high-risk ET: anagrelide gave more arterial clots, more serious bleeding and more progression to myelofibrosis.",
    summary: "PT-1 randomised 809 patients with high-risk essential thrombocythaemia to hydroxyurea or anagrelide, both with low-dose aspirin. After a median of 39 months the composite primary endpoint of arterial or venous thrombosis, serious haemorrhage or death from a thrombotic or haemorrhagic cause was more frequent on anagrelide (odds ratio 1.57); anagrelide gave more arterial clots, serious bleeding and transformation to myelofibrosis, and fewer venous clots (Harrison and colleagues, New England Journal of Medicine 2005). Registered as ISRCTN72251782.",
    result: "Composite of thrombosis, serious haemorrhage or vascular death more frequent with anagrelide (odds ratio 1.57); more arterial clots, bleeding and myelofibrosis on anagrelide.",
    outcomes: [{ endpoint: "Arterial or venous thrombosis, serious haemorrhage, or death from thrombotic or haemorrhagic causes", primary: true, arms: [{ name: "Anagrelide + low-dose aspirin", note: "Odds ratio 1.57 (95% CI 1.04-2.37) versus hydroxyurea; 809 patients, median follow-up 39 months" }, { name: "Hydroxyurea + low-dose aspirin" }], p: "0.03", source: "https://www.nejm.org/doi/full/10.1056/NEJMoa043800" }],
    drugs: ["hydroxyurea", "anagrelide"], cancers: ["essential-thrombocythaemia", "myeloproliferative-neoplasms"], links: [{ label: "ISRCTN72251782", url: "https://www.isrctn.com/ISRCTN72251782" }, { label: "NEJM 2005", url: "https://www.nejm.org/doi/full/10.1056/NEJMoa043800" }] }),
  t({ id: "majic-et", name: "MAJIC-ET", phase: "2", status: "negative", yearReported: 2017, sponsor: "University of Birmingham (UK)", enrolled: 110,
    setting: "Hydroxyurea-resistant or intolerant essential thrombocythaemia: ruxolitinib versus best available therapy",
    tldr: "MAJIC-ET found that ruxolitinib was no better than the usual second-line drugs at controlling platelets in ET, although it eased itching and other symptoms.",
    summary: "MAJIC-ET randomised 110 patients with essential thrombocythaemia resistant to or intolerant of hydroxyurea to ruxolitinib or best available therapy (mostly anagrelide or interferon). Complete response at one year, the primary endpoint, did not differ (about 47 percent in each arm), nor did thrombosis, haemorrhage or transformation; ruxolitinib improved some symptom scores (Harrison and colleagues, Blood 2017). Registered as ISRCTN61925716 alongside MAJIC-PV.",
    result: "Complete response within 1 year 46.6% (ruxolitinib) vs 44.2% (best available therapy), not significant; no difference in clots, bleeding or transformation at 2 years.",
    outcomes: [{ endpoint: "Complete response within 1 year", primary: true, unit: "%", arms: [{ name: "Ruxolitinib", n: 58, value: 46.6 }, { name: "Best available therapy", n: 52, value: 44.2 }], p: "0.40", source: "https://doi.org/10.1182/blood-2017-05-785790" }],
    drugs: ["ruxolitinib", "anagrelide"], cancers: ["essential-thrombocythaemia"], links: [{ label: "ISRCTN61925716", url: "https://www.isrctn.com/ISRCTN61925716" }] }),
];

export const aspirinDrug: DrugInput = {
  id: "aspirin", kind: "drug", name: "Aspirin", aka: ["Acetylsalicylic acid", "Low-dose aspirin"], modality: "Antiplatelet and anti-inflammatory small molecule (cyclo-oxygenase inhibitor), used in cancer for thrombosis prevention and studied for chemoprevention", mechanism: "Irreversibly blocks cyclo-oxygenase 1 in platelets, stopping thromboxane production and platelet clumping; at higher doses also blocks cyclo-oxygenase 2 and prostaglandin-driven inflammation, the proposed route to its effect on colorectal cancer.", status: "established", asOf, tags: ["mpn", "prevention"],
  tldr: "Aspirin is not a cancer drug but sits in cancer care in two places: low doses prevent clots in polycythaemia vera and essential thrombocythaemia, and long-term use lowers colorectal cancer in people with Lynch syndrome, while a trial in the healthy elderly found no benefit and possible harm.",
  summary: "In the myeloproliferative neoplasms, low-dose aspirin is given to almost everyone with polycythaemia vera and to low-risk and high-risk essential thrombocythaemia, because activated platelets cause both the microvascular symptoms (erythromelalgia, headache) and the arterial clots that drive mortality; the ECLAP trial in polycythaemia vera showed fewer combined cardiovascular events with aspirin. In prevention, the CAPP2 trial in Lynch syndrome found that 600 mg of aspirin a day for at least two years roughly halved colorectal cancers over the following decade, and long-term follow-up of cardiovascular trials suggested fewer colorectal cancer deaths. Against that, ASPREE, a trial in healthy adults over 70, found more cancer deaths on aspirin than placebo, so aspirin is not recommended for cancer prevention in older people without a specific indication. The Add-Aspirin trial is testing aspirin after treatment for breast, colorectal, gastro-oesophageal and prostate cancer. Its harms are bleeding, especially in the gut, and it must be avoided in essential thrombocythaemia with acquired von Willebrand deficiency.",
  approvals: [], targets: [], cancers: ["polycythaemia-vera", "essential-thrombocythaemia", "colorectal"], technologies: [], companies: [], trials: [],
  links: [{ label: "Wikipedia", url: W("Aspirin") }, { label: "CAPP2 long-term follow-up, Lancet 2020", url: "https://doi.org/10.1016/S0140-6736(20)30366-4" }, { label: "ASPREE cancer outcomes, JNCI 2021", url: "https://doi.org/10.1093/jnci/djaa114" }, { label: "Add-Aspirin trial", url: "https://www.addaspirintrial.org/" }],
};

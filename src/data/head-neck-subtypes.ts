/**
 * Head and neck subsites (17 Sept 2026): oropharyngeal, laryngeal and hypopharyngeal, and oral cavity cancer as pages under
 * the head and neck record, because HPV status, function preservation and surgery-versus-radiotherapy decisions differ by
 * site. Facts follow the NCCN and ESMO guidelines and the trial publications named in each record. Registered in
 * src/data/index.ts as headNeckSubtypes.
 */
import type { CancerInput } from "@/lib/schema";

const asOf = "2026-09-17";
const W = (s: string) => `https://en.wikipedia.org/wiki/${s}`;
const tags = ["subtype-page"];

export const headNeckSubtypes: CancerInput[] = [
  { id: "oropharyngeal-cancer", kind: "cancer", name: "Oropharyngeal cancer (tonsil and base of tongue)", group: "head and neck", parent: "head-and-neck", asOf, tags, wikipedia: W("Oropharyngeal_cancer"),
    aka: ["Oropharynx cancer", "Tonsil cancer", "Base of tongue cancer", "HPV-positive head and neck cancer"],
    burden: "The fastest-rising head and neck cancer in high-income countries, now driven mainly by human papillomavirus in men in their fifties and sixties; HPV-positive disease is cured in most cases, HPV-negative disease in far fewer.",
    tldr: "Cancer of the tonsils and back of the tongue now comes mostly from HPV infection rather than smoking, and behaves like a different disease: it responds well to chemoradiation, most patients are cured, and the research question is how much treatment can safely be removed.",
    summary: "Oropharyngeal squamous cell carcinoma arises in the tonsils, base of tongue, soft palate and pharyngeal wall. In North America and Europe most cases are now caused by HPV type 16 and are staged separately because they carry a far better outlook than tobacco-related, HPV-negative tumours, which are more often p53-mutant and resistant. Standard treatment is cisplatin chemoradiation, or transoral robotic surgery with neck dissection and adjuvant treatment for smaller tumours; cetuximab proved inferior to cisplatin in HPV-positive disease in RTOG 1016 and De-ESCALaTE. Trials are testing lower radiotherapy doses, fewer drugs and circulating HPV DNA to guide de-escalation in HPV-positive patients, while HPV vaccination is expected to prevent most future cases. Recurrent or metastatic disease is treated with pembrolizumab, alone or with chemotherapy, on KEYNOTE-048.",
    subtypes: ["HPV-positive (p16-positive) oropharyngeal cancer", "HPV-negative (tobacco and alcohol related) oropharyngeal cancer", "Tonsil", "Base of tongue", "Soft palate and pharyngeal wall"],
    biomarkers: ["p16 immunohistochemistry and HPV DNA or RNA", "Smoking history (worsens HPV-positive outlook)", "Circulating HPV DNA (surveillance and de-escalation trials)", "PD-L1 combined positive score (recurrent disease)", "TP53 mutation (HPV-negative)"],
    standardOfCare: [
      { setting: "Diagnosis and staging", approach: "Examination and biopsy with p16 and HPV testing, PET-CT, and separate staging for HPV-positive disease.", refs: ["hpv-testing"] },
      { setting: "Early disease", approach: "Transoral robotic or laser surgery with neck dissection, or radiotherapy alone, chosen by expected function.", refs: ["tors", "imrt-igrt"] },
      { setting: "Locally advanced disease", approach: "Cisplatin chemoradiation (70 Gy); cetuximab only for patients who cannot have cisplatin, since RTOG 1016 and De-ESCALaTE showed it inferior in HPV-positive disease.", refs: ["cisplatin", "cetuximab", "rtog-1016", "de-escalate", "bonner-cetuximab-rt"] },
      { setting: "Recurrent or metastatic", approach: "Pembrolizumab alone for PD-L1-positive disease or with platinum-fluorouracil (KEYNOTE-048); nivolumab after platinum (CheckMate 141).", refs: ["pembrolizumab", "nivolumab", "keynote-048", "checkmate-141"] },
      { setting: "Prevention", approach: "HPV vaccination of girls and boys; smoking cessation.", refs: ["hpv-vaccine", "smoking-cessation-after-diagnosis"] },
    ],
    stateOfArt: ["HPV-positive oropharyngeal cancer has an eighth-edition staging system of its own because its survival is so much better.", "De-escalation is the frontier: reduced-dose radiotherapy after induction or surgery, and circulating HPV DNA to pick who can have less, are in phase 2 and 3 trials.", "Immunotherapy is standard in recurrent disease and is being tested with chemoradiation in the curative setting."],
    history: [
      { year: 2000, title: "HPV linked to oropharyngeal cancer", note: "Gillison and colleagues show HPV16 in a distinct subset of tumours." },
      { year: 2010, title: "Ang shows HPV status is the dominant prognostic factor", note: "RTOG 0129 analysis: three-year survival 82 versus 57 percent." },
      { year: 2017, title: "Separate staging for HPV-positive disease (AJCC 8th edition)" },
      { year: 2019, title: "RTOG 1016 and De-ESCALaTE: cetuximab inferior to cisplatin", refs: ["rtog-1016", "de-escalate"] },
      { year: 2019, title: "Pembrolizumab first line in recurrent disease (KEYNOTE-048)", refs: ["keynote-048"] },
    ],
    pipeline: ["de-escalate","adaptive-radiotherapy","hpv-vaccine"], openProblems: ["How far treatment can be reduced in HPV-positive disease without losing cures.", "HPV-negative oropharyngeal cancer still has poor outcomes.", "Long-term swallowing and dry mouth after chemoradiation.", "HPV vaccination uptake in boys and in low-income countries."],
    links: [{ label: "Wikipedia", url: W("Oropharyngeal_cancer") }] },
  { id: "laryngeal-cancer", kind: "cancer", name: "Laryngeal and hypopharyngeal cancer", group: "head and neck", parent: "head-and-neck", asOf, tags, wikipedia: W("Laryngeal_cancer"),
    aka: ["Larynx cancer", "Voice box cancer", "Glottic cancer", "Supraglottic cancer", "Hypopharynx cancer"],
    burden: "About 190,000 new cases a year worldwide, overwhelmingly in smokers and heavy drinkers; early vocal cord cancers are cured in more than nine in ten patients, while hypopharyngeal cancer has among the worst outlooks in head and neck oncology.",
    tldr: "Cancer of the voice box announces itself with hoarseness and is highly curable when caught early, by laser surgery or radiotherapy that preserve the voice. Advanced disease is treated with chemoradiation to keep the larynx where possible, with total laryngectomy for the most extensive tumours or when other treatment fails.",
    summary: "Laryngeal squamous cell carcinoma arises in the glottis (vocal cords), supraglottis or subglottis; hypopharyngeal cancer arises just behind and below and is grouped with it. Persistent hoarseness leads to early diagnosis of glottic tumours, which are treated with transoral laser microsurgery or radiotherapy alone with excellent cure rates. Locally advanced disease is treated with concurrent cisplatin chemoradiation, established by RTOG 91-11 as the best way to keep the larynx, while tumours that have destroyed cartilage or the larynx's function are best treated with total laryngectomy and postoperative radiotherapy, followed by voice rehabilitation with a voice prosthesis. Hypopharyngeal cancer presents late, with swallowing difficulty and neck nodes, and often needs laryngopharyngectomy. Smoking cessation is the most important single intervention.",
    subtypes: ["Glottic (vocal cord) cancer", "Supraglottic cancer", "Subglottic cancer (rare)", "Hypopharyngeal cancer (pyriform sinus, postcricoid, posterior wall)"],
    biomarkers: ["Stage and cartilage invasion on CT", "Vocal cord mobility", "Smoking and alcohol exposure", "PD-L1 (recurrent disease)"],
    standardOfCare: [
      { setting: "Early glottic cancer", approach: "Transoral laser microsurgery or radiotherapy alone; both cure most patients and preserve the voice.", refs: ["imrt-igrt", "hypofractionated-radiotherapy"] },
      { setting: "Locally advanced, larynx preservable", approach: "Concurrent cisplatin chemoradiation (RTOG 91-11); induction chemotherapy for selection in some centres.", refs: ["cisplatin", "rtog-91-11"] },
      { setting: "Extensive disease or non-functioning larynx", approach: "Total laryngectomy with neck dissection and postoperative radiotherapy or chemoradiation; voice prosthesis rehabilitation.", refs: ["imrt-igrt"] },
      { setting: "Recurrent or metastatic", approach: "Salvage laryngectomy after radiotherapy failure; pembrolizumab-based therapy for metastatic disease (KEYNOTE-048).", refs: ["pembrolizumab", "keynote-048", "cetuximab"] },
      { setting: "Prevention", approach: "Smoking cessation and alcohol reduction; no screening programme exists.", refs: ["smoking-cessation-after-diagnosis", "alcohol-reduction-labelling"] },
    ],
    stateOfArt: ["Larynx preservation with chemoradiation cures most locally advanced cancers while keeping the voice, but late toxicity and non-cancer deaths have tempered enthusiasm for it in the most extensive tumours.", "Transoral laser surgery and single-fraction-savvy radiotherapy schedules give early glottic cancer cure rates above 90 percent.", "Voice prostheses after laryngectomy restore intelligible speech for most patients."],
    history: [
      { year: 1873, title: "Billroth performs the first total laryngectomy" },
      { year: 1991, title: "VA Larynx trial: induction chemotherapy and radiotherapy preserve the larynx in two thirds" },
      { year: 2003, title: "RTOG 91-11: concurrent cisplatin chemoradiation best for larynx preservation", refs: ["rtog-91-11"] },
      { year: 2013, title: "Long-term RTOG 91-11 data show more non-cancer deaths after concurrent treatment", refs: ["rtog-91-11"] },
    ],
    pipeline: ["pembrolizumab","adaptive-radiotherapy"], openProblems: ["Hypopharyngeal cancer survival has barely improved.", "Choosing between preservation and laryngectomy in T4 disease.", "Long-term swallowing and airway function after chemoradiation.", "Persistently high incidence where smoking remains common."],
    links: [{ label: "Wikipedia", url: W("Laryngeal_cancer") }] },
  { id: "oral-cavity-cancer", kind: "cancer", name: "Oral cavity cancer (mouth and tongue)", group: "head and neck", parent: "head-and-neck", asOf, tags, wikipedia: W("Oral_cancer"),
    aka: ["Oral cancer", "Mouth cancer", "Tongue cancer", "Oral squamous cell carcinoma"],
    burden: "About 390,000 new cases a year worldwide, with the highest rates in South Asia from betel quid and tobacco chewing; it is the commonest cancer among men in India, and five-year survival is around 60 percent overall but far lower for late-stage disease.",
    tldr: "Cancer of the mouth and tongue is caused mainly by tobacco, alcohol and betel quid and is usually visible or feelable early, yet often diagnosed late. Surgery is the mainstay, with radiotherapy or chemoradiation after operation for higher-risk disease, and reconstruction to restore speech and swallowing.",
    summary: "Oral cavity squamous cell carcinoma arises on the tongue, floor of mouth, gums, buccal mucosa, palate and lips, often from a white or red patch (leukoplakia or erythroplakia). Unlike oropharyngeal cancer it is rarely HPV-driven; tobacco, alcohol and, in South and South-East Asia, betel quid with areca nut are the causes, and a screening trial in Kerala showed that visual inspection by trained health workers reduces mouth cancer deaths in high-risk people. Treatment is surgical resection with neck dissection and free-flap reconstruction, with postoperative radiotherapy or cisplatin chemoradiation for advanced stage, positive margins or nodal spread with extranodal extension. Depth of invasion now determines stage and the need to treat the neck. Recurrent or metastatic disease is treated as for other head and neck cancers with pembrolizumab-based therapy, and metronomic methotrexate-celecoxib from Tata Memorial Hospital offers a low-cost option.",
    subtypes: ["Oral tongue", "Floor of mouth", "Buccal mucosa and gingiva (betel-quid related)", "Lip (sun-related)", "Hard palate and retromolar trigone"],
    biomarkers: ["Depth of invasion (staging and elective neck dissection)", "Extranodal extension and margin status", "TP53 mutation", "PD-L1 combined positive score (recurrent disease)"],
    standardOfCare: [
      { setting: "Screening in high-risk populations", approach: "Visual oral examination by trained workers reduced mouth cancer deaths in the Kerala trial; opportunistic examination by dentists elsewhere.", refs: ["head-and-neck"] },
      { setting: "Early disease", approach: "Wide excision with elective neck dissection when depth of invasion exceeds about 3 to 4 mm; sentinel node biopsy in selected cases.", refs: ["head-and-neck"] },
      { setting: "Locally advanced disease", approach: "Resection with neck dissection and free-flap reconstruction, then postoperative radiotherapy, or cisplatin chemoradiation for positive margins or extranodal extension.", refs: ["cisplatin", "imrt-igrt"] },
      { setting: "Recurrent or metastatic", approach: "Pembrolizumab with or without chemotherapy (KEYNOTE-048); low-cost metronomic methotrexate and celecoxib where access is limited.", refs: ["pembrolizumab", "keynote-048", "methotrexate", "metronomic-vs-cisplatin-tmh"] },
      { setting: "Prevention", approach: "Tobacco and betel quid cessation, alcohol reduction, treatment of premalignant patches.", refs: ["smoking-cessation-after-diagnosis"] },
    ],
    stateOfArt: ["Elective neck dissection improves survival even in early tongue cancer (D'Cruz, Tata Memorial, 2015).", "Free-flap reconstruction has made function-preserving resection routine.", "India's low-cost trials have set standards for resource-limited care, from metronomic chemotherapy to screening."],
    history: [
      { year: 1906, title: "Crile describes radical neck dissection" },
      { year: 2005, title: "Kerala screening trial shows visual inspection cuts oral cancer deaths in high-risk people" },
      { year: 2015, title: "Elective neck dissection improves survival in early oral cancer (Tata Memorial)" },
      { year: 2017, title: "Depth of invasion enters staging (AJCC 8th edition)" },
    ],
    pipeline: ["pembrolizumab","nivolumab"], openProblems: ["Late presentation remains the norm in the highest-incidence countries.", "Betel quid use is still rising in parts of Asia.", "Field cancerisation causes second primaries in a fifth of survivors.", "Speech and swallowing after large resections."],
    links: [{ label: "Wikipedia", url: W("Oral_cancer") }] },
];

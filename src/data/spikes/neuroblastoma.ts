import type { CompanyInput, DrugInput, EntityInput, IdeaInput, PairingInput, TargetInput, TechnologyInput, TermInput, TrialInput } from "@/lib/schema";
import type { Spike } from "./index";

/**
 * NEUROBLASTOMA SPIKE. Adds the GD2 target, anti-GD2 antibodies, eflornithine, MIBG therapy, tandem transplant,
 * INRG staging, landmark trials with structured outcomes, companies, pairings and ideas; patches `neuroblastoma`
 * to TNBC depth. Facts checked 2026-09-07. References autologous-stem-cell-transplant (myeloma spike),
 * doxorubicin (sarcoma spike), and us-worldmeds (sarcoma spike).
 */
const asOf = "2026-09-07";
const W = (s: string) => `https://en.wikipedia.org/wiki/${s}`;
const ct = (nct: string) => ({ label: `ClinicalTrials.gov ${nct}`, url: `https://clinicaltrials.gov/study/${nct}` });

const t = (x: Omit<TrialInput, "kind" | "asOf">): TrialInput => ({ kind: "trial", asOf, ...x });
const d = (x: Omit<DrugInput, "kind" | "asOf">): DrugInput => ({ kind: "drug", asOf, ...x });
const tg = (x: Omit<TargetInput, "kind" | "asOf">): TargetInput => ({ kind: "target", asOf, ...x });
const tech = (x: Omit<TechnologyInput, "kind" | "asOf">): TechnologyInput => ({ kind: "technology", asOf, ...x });
const term = (x: Omit<TermInput, "kind" | "asOf">): TermInput => ({ kind: "term", asOf, ...x });
const co = (x: Omit<CompanyInput, "kind" | "asOf">): CompanyInput => ({ kind: "company", asOf, ...x });
const idea = (x: Omit<IdeaInput, "kind" | "asOf">): IdeaInput => ({ kind: "idea", asOf, ...x });
const pair = (x: Omit<PairingInput, "kind" | "asOf">): PairingInput => ({ kind: "pairing", asOf, ...x });

// ======================= COMPANIES =======================
const companies: CompanyInput[] = [
  co({ id: "y-mabs", links: [{ label: "Official website", url: "https://www.ymabs.com" }], name: "Y-mAbs Therapeutics", hq: "New York, NY", country: "US", companyType: "biotech", website: "https://www.ymabs.com", ticker: "YMAB", sections: ["immunotherapy", "radiopharma"],
    tldr: "MSK spin-out that commercialises naxitamab, the humanised anti-GD2 antibody for relapsed neuroblastoma, and develops pretargeted radioimmunotherapy.",
    summary: "Y-mAbs Therapeutics, based in New York and listed as YMAB, is a Memorial Sloan Kettering spin-out that commercialises naxitamab, the humanised anti-GD2 antibody for relapsed neuroblastoma, and develops pretargeted radioimmunotherapy. Naxitamab, sold as Danyelza, received accelerated approval in November 2020; omburtamab, a B7-H3 antibody carrying iodine-131, was rejected by the FDA in 2022; and the SADA pretargeted radioimmunotherapy platform, with a GD2-SADA and lutetium-177 pairing, is in phase 1. OnCo links it to paediatric neuroblastoma, to GD2 as a target and to the bottleneck of rare and paediatric cancers without markets. Whether pretargeting can deliver radiation to paediatric tumours with less marrow toxicity than direct radioimmunotherapy is the open question. Naxitamab has its own page.",
    drugs: ["naxitamab"], cancers: ["neuroblastoma"], targets: ["gd2"] }),
];

// ======================= TARGET =======================
const targets: TargetInput[] = [
  tg({ id: "gd2", aka: ["Disialoganglioside GD2"], name: "GD2 (disialoganglioside)", symbol: "GD2 (B4GALNT1 product)", targetClass: "surface-antigen", wikipedia: W("GD2"),
    tldr: "GD2 is a sugar-fat molecule on the surface of neuroblastoma cells (and some other childhood and adult tumours) with almost none on normal tissue except nerves, which is why anti-GD2 drugs cause pain.",
    summary: "Disialoganglioside GD2 is expressed at high density on nearly all neuroblastomas, most osteosarcomas and melanomas, and diffuse midline gliomas, with normal expression restricted to peripheral nerves, melanocytes and CNS. Anti-GD2 antibodies (dinutuximab, dinutuximab beta, naxitamab) improved high-risk neuroblastoma survival; GD2 CAR-T (GD2-CART01, Italian phase 1/2) gives durable complete responses in relapsed disease and shows activity in diffuse midline glioma (Stanford). Neuropathic pain from nerve GD2 binding is the class toxicity.",
    biology: "Glycosphingolipid synthesised by GD2 synthase (B4GALNT1); not internalised efficiently, so antibodies act by ADCC/CDC rather than as ADC carriers.",
    whereFound: ["Neuroblastoma (~100%)", "Osteosarcoma", "Melanoma", "Diffuse midline glioma / DIPG", "Small-cell lung cancer (subset)", "Ewing sarcoma (subset)"],
    prevalence: [
      { cancerId: "sarcoma", pct: 100, measure: "IHC, GD2 in 44 of 44 osteosarcoma specimens", source: "https://doi.org/10.1002/cncr.28461", note: "Roth 2014 (Cancer); recurrent samples stained more intensely than primaries" },
    ],
    cancers: ["neuroblastoma", "sarcoma", "melanoma", "glioblastoma"], drugs: ["dinutuximab", "naxitamab"], tags: ["antibody-target", "car-t-target"], links: [{ label: "Wikipedia", url: W("GD2") }] }),
];

// ======================= TECHNOLOGIES / TERMS =======================
const technologies: TechnologyInput[] = [
  tech({ id: "tandem-transplant", links: [{ label: "ClinicalTrials.gov NCT00567567: COG ANBL0532", url: "https://clinicaltrials.gov/study/NCT00567567" }], name: "Tandem autologous transplant", sections: ["chemotherapy", "cell-therapy"], status: "standard-of-care", since: 2016,
    tldr: "Tandem transplant gives two back-to-back rounds of marrow-destroying chemotherapy, each rescued with the child's own stored stem cells, for high-risk neuroblastoma in North America. It kept more children relapse-free than one transplant in a randomised trial, but adds organ toxicity and hearing loss.",
    summary: "COG ANBL0532: tandem thiotepa-cyclophosphamide then carboplatin-etoposide-melphalan improved 3-year EFS versus single transplant (61.6% vs 48.4%), and the benefit held with anti-GD2 immunotherapy. In Europe (SIOPEN HR-NBL1), busulfan-melphalan single transplant is standard. Toxicity and cost are substantial.",
    principle: "Sequential myeloablative regimens exploit dose intensity against residual disease after induction and surgery, each rescued with cryopreserved autologous stem cells.",
    strengths: ["EFS benefit in a randomised trial", "Compatible with subsequent immunotherapy"],
    limitations: ["Cumulative organ toxicity and hearing loss", "Not adopted in Europe; single BuMel used instead"],
    cancers: ["neuroblastoma"], technologies: ["autologous-stem-cell-transplant"], trials: ["anbl0532"] }),
  tech({ id: "mibg-theranostics", name: "MIBG imaging and 131I-MIBG therapy", sections: ["radiopharma", "imaging"], status: "established", since: 1985, wikipedia: W("Iobenguane"),
    tldr: "A noradrenaline look-alike that neuroblastoma cells swallow: labelled with a small amount of radioactivity it shows the tumour on a scan; with a large amount it treats it.",
    summary: "123I-MIBG scintigraphy/SPECT is the standard staging scan (Curie score) in neuroblastoma, being partly replaced by 18F-MFBG PET. Therapeutic 131I-MIBG produces responses in ~30% of relapsed patients; COG ANBL1531 tested adding it to induction (results awaited). Also used in pheochromocytoma/paraganglioma (Azedra, discontinued 2024).",
    principle: "Norepinephrine transporter (NET) uptake concentrates radio-iodinated MIBG in adrenergic tumours; 131I delivers beta radiation.",
    strengths: ["Theranostic pair with decades of use", "Targets NET-positive disease irrespective of GD2"],
    limitations: ["Prolonged isolation and radiation precautions in children", "Myelosuppression requiring stem-cell support at high doses", "Azedra withdrawal reduced supply"],
    cancers: ["neuroblastoma", "neuroendocrine"], technologies: ["radioligand-therapy", "spect", "pet"], drugs: ["i131-mibg"], links: [{ label: "Wikipedia", url: W("Iobenguane") }] }),
];

const terms: TermInput[] = [
  term({ id: "inrg-staging", name: "INRG staging and risk groups", category: "Clinical", wikipedia: W("Neuroblastoma#Staging"),
    tldr: "INRG staging is the international system that sorts neuroblastoma into four risk groups, from the lowest (often observed, sometimes regressing on its own) to high risk (about half of patients), using age under 18 months, spread, MYCN amplification, 11q status, ploidy and histology.",
    summary: "International Neuroblastoma Risk Group (2009): stages L1/L2 (localised, by image-defined risk factors), M (metastatic), MS (infant metastatic to skin/liver/marrow). Risk groups combine stage, age (<18 months), MYCN amplification, 11q aberration, ploidy and histology. Roughly 50% of patients are high risk; very-low-risk L1/MS may be observed and regress spontaneously.",
    cancers: ["neuroblastoma"], links: [{ label: "Wikipedia", url: W("Neuroblastoma#Staging") }] }),
  term({ id: "mycn-amplification", name: "MYCN amplification", category: "Biomarkers", wikipedia: W("N-Myc"),
    tldr: "Extra copies of the MYCN oncogene, found in about 20% of neuroblastomas, mark the most aggressive disease and define high risk at any age.",
    summary: "MYCN amplification means extra copies of the MYCN oncogene, detected by FISH when a cell carries more than 10 copies, and it marks the most aggressive form of neuroblastoma, defining high-risk disease at any age. It is found in a minority of neuroblastomas and is associated with rapid progression, 1p deletion and poor outcome. MYCN itself is not directly druggable, so the approaches are indirect: BET and Aurora A inhibitors, ODC1 and polyamine inhibition with eflornithine (DFMO), which acts on the MYCN pathway, and targeting ALK co-mutations with lorlatinib in ANBL1531. Readers meet the term in the neuroblastoma record, the eflornithine drug record, the MYC pathway record, the profile of Susan L. Cohn, and the bottleneck on rare and paediatric cancers without markets.",
    cancers: ["neuroblastoma"], drugs: ["eflornithine", "lorlatinib"], links: [{ label: "Wikipedia", url: W("N-Myc") }] }),
];

// ======================= PRODUCTS =======================
const drugs: DrugInput[] = [
  d({ id: "dinutuximab", links: [{ label: "FDA label (DailyMed)", url: "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=Dinutuximab/%20dinutuximab%20beta" }], name: "Dinutuximab (ch14.18) / dinutuximab beta", brand: "Unituxin / Qarziba (EU)", modality: "Monoclonal antibody (anti-GD2, chimeric)", status: "approved", wikipedia: W("Dinutuximab"),
    tldr: "The antibody that raised cure rates in high-risk childhood neuroblastoma by about 20 points when given after transplant with immune boosters and retinoid.",
    summary: "ANBL0032: ch14.18 + GM-CSF + IL-2 + isotretinoin vs isotretinoin: 2-year EFS 66% vs 46%, OS 86% vs 75%; approved March 2015 (United Therapeutics). Dinutuximab beta (SIOPEN/EUSA/Recordati) approved in EU 2017; HR-NBL1 showed adding IL-2 to dinutuximab beta added toxicity without benefit, so IL-2 is omitted in Europe. Now also given with chemotherapy for relapse (ANBL1221: irinotecan-temozolomide-dinutuximab ORR ~50%) and during induction (ANBL17P1).",
    mechanism: "Chimeric IgG1 anti-GD2; ADCC (NK cells, granulocytes with GM-CSF) and CDC against GD2+ cells; neuropathic pain from binding to peripheral nerve GD2.",
    mechanismSteps: ["Antibody binds GD2 on the neuroblastoma cell surface", "Fc region recruits NK cells and neutrophils (ADCC) and complement (CDC)", "GM-CSF (and formerly IL-2) expands effector cells", "Tumour cells lyse; peripheral nerves also bind antibody, causing pain"],
    dosing: { route: "IV", schedule: "17.5 mg/m2/day × 4 days per cycle, 5 cycles, with GM-CSF (cycles 1, 3, 5) and isotretinoin; IL-2 omitted in European practice", modifications: "Hold for grade 3-4 infusion reactions, capillary leak, neuropathy", monitoring: "Pain management (opioids, gabapentin), hypotension, capillary leak, infusion reactions, neuropathy, electrolytes" },
    toxicity: [{ event: "Neuropathic pain", anyGradePct: 85, grade3PlusPct: 52, note: "ANBL0032 immunotherapy arm" }, { event: "Infusion reactions", grade3PlusPct: 25 }, { event: "Capillary leak syndrome", grade3PlusPct: 23 }, { event: "Hypokalaemia", grade3PlusPct: 35 }],
    approvals: [{ region: "US", year: 2015, indication: "High-risk neuroblastoma after at least partial response to induction, with GM-CSF, IL-2 and isotretinoin" }, { region: "EU", year: 2017, indication: "Dinutuximab beta: high-risk neuroblastoma after induction/transplant; relapsed/refractory disease" }],
    regulatoryEvents: [{ date: "2015-03-10", type: "approval", region: "US", note: "Unituxin (ANBL0032)" }, { date: "2017-05", type: "approval", region: "EU", note: "Dinutuximab beta (Qarziba)" }],
    targets: ["gd2"], technologies: ["monoclonal-antibody"], cancers: ["neuroblastoma"], trials: ["anbl0032", "hr-nbl1"], terms: ["adcc"] }),
  d({ id: "naxitamab", links: [{ label: "FDA label (DailyMed)", url: "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=Naxitamab" }], name: "Naxitamab", brand: "Danyelza", modality: "Monoclonal antibody (anti-GD2, humanised)", status: "approved", wikipedia: W("Naxitamab"),
    tldr: "Naxitamab is a humanised anti-GD2 antibody from Memorial Sloan Kettering, given as an outpatient with GM-CSF for relapsed neuroblastoma in bone or marrow.",
    summary: "Accelerated approval November 2020 for relapsed/refractory high-risk neuroblastoma in bone or bone marrow (Study 201: ORR 50%; MSK 12-230: ORR 45%). Phase 2 in primary refractory disease with stepped-up GM-CSF: 75% CR in a 32-patient series (2025). Outpatient 30-minute infusions but severe pain and hypertension. Y-mAbs.",
    mechanism: "Humanised 3F8 IgG1 anti-GD2 with higher affinity; ADCC/CDC enhanced by GM-CSF-primed granulocytes.",
    dosing: { route: "IV over 30-60 minutes (outpatient)", schedule: "3 mg/kg days 1, 3, 5 of each 4-week cycle with GM-CSF days -4 to 5; premedication with antihistamine, antipyretic, gabapentin, opioids", monitoring: "Pain, hypertension (including delayed), infusion reactions, neurotoxicity (transverse myelitis, RPLS), hypotension" },
    toxicity: [{ event: "Pain", anyGradePct: 100, grade3PlusPct: 65, note: "Study 201 / 12-230 pooled" }, { event: "Hypertension", anyGradePct: 42, grade3PlusPct: 28 }, { event: "Infusion-related reaction", grade3PlusPct: 32 }, { event: "Neurotoxicity", anyGradePct: 20 }],
    approvals: [{ region: "US", year: 2020, indication: "Relapsed/refractory high-risk neuroblastoma in bone or bone marrow with partial response, minor response or stable disease, with GM-CSF (accelerated)" }],
    regulatoryEvents: [{ date: "2020-11-25", type: "approval", region: "US", note: "Accelerated approval (Study 201, 12-230)" }],
    targets: ["gd2"], technologies: ["monoclonal-antibody"], companies: ["y-mabs"], cancers: ["neuroblastoma"], trials: ["naxitamab-201"] }),
  d({ id: "eflornithine", links: [{ label: "FDA label (DailyMed)", url: "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=Eflornithine" }], name: "Eflornithine (DFMO)", brand: "Iwilfin", modality: "Small-molecule ornithine decarboxylase inhibitor", status: "approved", wikipedia: W("Eflornithine"),
    tldr: "Eflornithine (DFMO) is an old sleeping-sickness drug repurposed as the first oral maintenance therapy for high-risk neuroblastoma, approved in December 2023 to reduce relapse after immunotherapy.",
    summary: "Approved 13 December 2023 (US WorldMeds) for adults and children with high-risk neuroblastoma who achieved at least a partial response to prior multiagent, multimodality therapy including anti-GD2 immunotherapy. Evidence: single-arm NMTRC003/003B (n=105) compared with an external control from ANBL0032 (EFS HR 0.48, OS HR 0.32), a controversial externally controlled approval. EU applications filed 2025. Two years of twice-daily tablets.",
    mechanism: "Irreversible inhibitor of ornithine decarboxylase (ODC1), a direct MYCN target, depleting polyamines required for neuroblastoma proliferation.",
    mechanismSteps: ["DFMO irreversibly inactivates ornithine decarboxylase", "Putrescine, spermidine and spermine fall", "MYCN-driven translation and proliferation slow", "Residual cells are held in check during two years of maintenance"],
    dosing: { route: "Oral", schedule: "Body-surface-area-based dose twice daily for 2 years (e.g. 768 mg twice daily for BSA >1.5 m2)", monitoring: "Hearing (ototoxicity), liver enzymes, counts, growth" },
    toxicity: [{ event: "Hearing loss", anyGradePct: 27, note: "NMTRC003/003B; largely pre-existing from platinum" }, { event: "Otitis media", anyGradePct: 27 }, { event: "Neutropenia", anyGradePct: 24 }, { event: "Elevated ALT", anyGradePct: 33 }],
    approvals: [{ region: "US", year: 2023, indication: "Maintenance to reduce relapse risk in high-risk neuroblastoma after ≥PR to prior therapy including anti-GD2" }],
    regulatoryEvents: [{ date: "2023-12-13", type: "approval", region: "US", note: "First oral maintenance therapy; externally controlled evidence", source: "https://ascopubs.org/doi/10.1200/JCO.24.00546" }, { date: "2025", type: "filing", region: "EU", note: "MAA submitted to EMA, UK, Australia, Switzerland", source: "https://www.onclive.com/view/eu-approval-is-sought-for-eflornithine-in-high-risk-neuroblastoma" }],
    companies: ["us-worldmeds"], cancers: ["neuroblastoma"], terms: ["mycn-amplification"], trials: ["nmtrc003"] }),
  d({ id: "i131-mibg", name: "131I-MIBG (iobenguane I-131) therapy", modality: "Radioligand therapy (beta, norepinephrine transporter)", status: "established", wikipedia: W("Iobenguane"),
    tldr: "High-dose radioactive MIBG delivers radiation from inside neuroblastoma cells that take up noradrenaline; used for relapsed disease and tested in upfront therapy.",
    summary: "Response rate ~30-40% in relapsed/refractory MIBG-avid neuroblastoma (NANT, COG studies), with myelosuppression requiring stem-cell support at ≥12 mCi/kg. COG ANBL1531 randomised 131I-MIBG added to induction (primary results pending 2026). Commercial Azedra (for pheochromocytoma) was discontinued in 2024, leaving compounding and academic supply.",
    mechanism: "Norepinephrine transporter uptake of radio-iodinated benzylguanidine; 131I beta emission (2 mm range).",
    dosing: { route: "IV", schedule: "12-18 mCi/kg single or tandem doses with autologous stem-cell support; thyroid blockade with potassium iodide", monitoring: "Radiation isolation, counts, thyroid function, secondary malignancy" },
    technologies: ["mibg-theranostics", "radioligand-therapy"], cancers: ["neuroblastoma"], trials: ["anbl1531"], links: [{ label: "Wikipedia", url: W("Iobenguane") }] }),
];

// ======================= TRIALS =======================
const trials: TrialInput[] = [
  t({ id: "anbl0032", name: "COG ANBL0032", nct: "NCT00026312", phase: "3", status: "positive", yearReported: 2010, sponsor: "Children's Oncology Group", enrolled: 226,
    setting: "High-risk neuroblastoma after transplant: ch14.18 (dinutuximab) + GM-CSF + IL-2 + isotretinoin vs isotretinoin alone",
    tldr: "The trial that made anti-GD2 immunotherapy standard for children with high-risk neuroblastoma, improving survival by about 20 points.",
    summary: "COG ANBL0032, trial NCT00026312 run by the Children's Oncology Group and published in the New England Journal of Medicine in 2010, made anti-GD2 immunotherapy standard for children with high-risk neuroblastoma, improving survival by about twenty points. It randomised 226 children after transplant to the anti-GD2 antibody ch14.18, now dinutuximab, with GM-CSF, interleukin-2 and isotretinoin, or isotretinoin alone, met its primary event-free survival endpoint at two years and improved overall survival, was stopped early for efficacy, and led to approval in 2015 with long-term follow-up confirming the gain. OnCo links it to paediatric neuroblastoma, GD2 as a target, dinutuximab, the Children's Oncology Group, Alice L. Yu, Julie R. Park and the bottleneck of paediatric cancers without markets. Whether anti-GD2 can move earlier into induction is the open question.",
    result: "2-year EFS 66% vs 46%; OS 86% vs 75%.",
    outcomes: [{ endpoint: "Event-free survival at 2 years", primary: true, unit: "%", arms: [{ name: "Immunotherapy + isotretinoin", n: 113, value: 66 }, { name: "Isotretinoin", n: 113, value: 46 }], p: "0.01", source: "https://www.nejm.org/doi/full/10.1056/NEJMoa0911123" }, { endpoint: "Overall survival at 2 years", unit: "%", arms: [{ name: "Immunotherapy + isotretinoin", value: 86 }, { name: "Isotretinoin", value: 75 }], p: "0.02", source: "https://doi.org/10.1056/NEJMoa0911123" }],
    replication: "SIOPEN HR-NBL1 confirmed anti-GD2 benefit with dinutuximab beta (and showed IL-2 adds no efficacy).",
    drugs: ["dinutuximab"], cancers: ["neuroblastoma"], targets: ["gd2"], institutions: ["childrens-oncology-group"], links: [ct("NCT00026312")], people: ["alice-yu", "julie-park"] }),
  t({ id: "anbl0532", name: "COG ANBL0532", nct: "NCT00567567", phase: "3", status: "positive", yearReported: 2016, sponsor: "Children's Oncology Group", enrolled: 665,
    setting: "High-risk neuroblastoma: tandem vs single autologous transplant after induction",
    tldr: "COG ANBL0532 showed that two transplants in a row beat one in high-risk neuroblastoma.",
    summary: "COG ANBL0532, trial NCT00567567 run by the Children's Oncology Group and published in JAMA in 2019, showed that two autologous transplants in a row beat one in high-risk neuroblastoma. It randomised 652 children after induction to tandem or single transplant and met its primary event-free survival endpoint at three years, with a larger gap when followed by anti-GD2 immunotherapy, while overall survival was not significantly different at three years. OnCo links it to paediatric neuroblastoma, tandem autologous transplant, autologous stem cell transplant, the Children's Oncology Group and Julie R. Park. Tandem transplant became the North American standard, and whether the added toxicity is justified without a survival benefit, especially where European groups use a single transplant, is the open question.",
    result: "3-year EFS 61.6% vs 48.4%.",
    outcomes: [{ endpoint: "Event-free survival at 3 years", primary: true, unit: "%", arms: [{ name: "Tandem transplant", n: 176, value: 61.6 }, { name: "Single transplant", n: 179, value: 48.4 }], p: "0.006", source: "https://jamanetwork.com/journals/jama/fullarticle/2751686" }],
    cancers: ["neuroblastoma"], technologies: ["tandem-transplant", "autologous-stem-cell-transplant"], institutions: ["childrens-oncology-group"], links: [ct("NCT00567567")], people: ["julie-park"] }),
  t({ id: "hr-nbl1", name: "SIOPEN HR-NBL1", nct: "NCT01704716", phase: "3", status: "mixed", yearReported: 2017, sponsor: "SIOPEN / Children's Cancer and Leukaemia Group", enrolled: 3700,
    setting: "High-risk neuroblastoma (Europe): multiple randomisations, including busulfan-melphalan vs CEM conditioning and dinutuximab beta ± IL-2",
    tldr: "Europe's long-running high-risk neuroblastoma trial set busulfan-melphalan as the transplant regimen and showed that adding IL-2 to anti-GD2 therapy added toxicity but not benefit.",
    summary: "R1: BuMel superior to CEM (3-year EFS 50% vs 38%; Lancet Oncol 2017). R2: dinutuximab beta + IL-2 vs dinutuximab beta alone: 3-year EFS 56% vs 60%, no benefit, more toxicity (Lancet Oncol 2018). R3/R4 explored induction regimens (rapid COJEC vs modified N7; 2025 report). Over 3,700 children enrolled since 2002.",
    result: "BuMel > CEM (EFS 50% vs 38%); IL-2 adds no benefit to anti-GD2.",
    outcomes: [{ endpoint: "Event-free survival at 3 years (R1 conditioning)", unit: "%", arms: [{ name: "Busulfan-melphalan", n: 296, value: 50 }, { name: "CEM", n: 302, value: 38 }], p: "0.0005", source: "https://www.thelancet.com/journals/lanonc/article/PIIS1470-2045(17)30070-0/fulltext" }, { endpoint: "Event-free survival at 3 years (R2 immunotherapy)", unit: "%", arms: [{ name: "Dinutuximab beta + IL-2", n: 200, value: 56 }, { name: "Dinutuximab beta", n: 206, value: 60 }], source: "https://www.thelancet.com/journals/lanonc/article/PIIS1470-2045(18)30578-3/fulltext" }],
    drugs: ["dinutuximab"], cancers: ["neuroblastoma"], technologies: ["autologous-stem-cell-transplant"], links: [ct("NCT01704716")], people: ["ruth-ladenstein"] }),
  t({ id: "anbl1531", name: "COG ANBL1531", nct: "NCT03126916", phase: "3", status: "active", sponsor: "Children's Oncology Group",
    setting: "Newly diagnosed high-risk neuroblastoma: 131I-MIBG added to induction (randomised, MIBG-avid); lorlatinib added for ALK-aberrant tumours (non-randomised arm)",
    tldr: "COG ANBL1531 is the current North American high-risk trial, adding targeted radiation during induction and an ALK pill for children whose tumours carry ALK mutations.",
    summary: "COG ANBL1531, trial NCT03126916 run by the Children's Oncology Group, is the current North American trial for newly diagnosed high-risk neuroblastoma, adding iodine-131 MIBG targeted radiation during induction in a randomised comparison for MIBG-avid tumours and the ALK inhibitor lorlatinib in a non-randomised arm for children whose tumours carry ALK aberrations. It also tests reduced-intensity therapy in the standard arm and tracks uptake of eflornithine maintenance, with the primary MIBG randomisation results expected in 2026 to 2027 and encouraging response rates reported from the lorlatinib arm. OnCo links it to paediatric neuroblastoma, MIBG imaging and therapy, ALK as a target, 131I-MIBG therapy, lorlatinib, the Children's Oncology Group and Yael P. Mossé. Whether targeted radiation during induction improves cure rates is the question it will answer.",
    drugs: ["i131-mibg", "lorlatinib"], cancers: ["neuroblastoma"], technologies: ["mibg-theranostics"], targets: ["alk"], institutions: ["childrens-oncology-group"], links: [ct("NCT03126916")], people: ["yael-mosse"] }),
  t({ id: "gd2-cart01", name: "GD2-CART01 (Bambino Gesù phase 1/2)", nct: "NCT03373097", phase: "1/2", status: "positive", yearReported: 2023, sponsor: "Ospedale Pediatrico Bambino Gesù", enrolled: 27,
    setting: "Relapsed/refractory high-risk neuroblastoma: third-generation GD2 CAR-T with inducible caspase-9 safety switch",
    tldr: "GD2-CART01 was the first CAR-T to produce durable complete remissions in a childhood solid tumour: two-thirds responded and a third achieved complete remission.",
    summary: "NEJM 2023: ORR 63%, CR 33%; 3-year OS 60%, EFS 36%; grade 1-2 CRS common, one grade 3; safety switch not needed. Nature Medicine 2025 long-term update: ORR 66%, complete responses sustained 8-18+ years in earlier-generation recipients, and 5 of 8 patients treated in remission disease-free at 10-15 years. Phase 2 expansion and commercialisation (Italy) under way.",
    result: "ORR 63%, CR 33%; 3-year OS 60%.",
    outcomes: [{ endpoint: "Objective response rate", primary: true, unit: "%", arms: [{ name: "GD2-CART01", n: 27, value: 63 }], source: "https://www.nejm.org/doi/full/10.1056/NEJMoa2210859" }, { endpoint: "Overall survival at 3 years", unit: "%", arms: [{ name: "GD2-CART01", value: 60 }], source: "https://doi.org/10.1056/NEJMoa2210859" }],
    replication: "Stanford GD2 CAR-T (with IL-15, in DIPG/DMG) and Baylor GD2 CAR-T show consistent GD2 targetability; no randomised trial yet.",
    cancers: ["neuroblastoma"], targets: ["gd2"], technologies: ["car-t", "armored-car"], terms: ["crs"], links: [ct("NCT03373097"), { label: "Nature Medicine 2025 long-term", url: "https://www.nature.com/articles/s41591-025-03513-0" }], people: ["crystal-mackall"] }),
  t({ id: "naxitamab-201", name: "Naxitamab Study 201", nct: "NCT03363373", phase: "2", status: "positive", yearReported: 2020, sponsor: "Y-mAbs", enrolled: 74,
    setting: "Relapsed/refractory high-risk neuroblastoma in bone/bone marrow: naxitamab + GM-CSF",
    tldr: "Study 201 was the single-arm phase 2 of 74 patients behind naxitamab's approval for relapsed or refractory high-risk neuroblastoma in bone or bone marrow: given with GM-CSF as an outpatient, the antibody produced responses in half of patients. Without a randomised comparison against dinutuximab, equal efficacy is unproven.",
    summary: "Naxitamab Study 201, trial NCT03363373 sponsored by Y-mAbs and reported in 2020 with the full cohort published in Nature Communications in 2025, was the pivotal single-arm study behind naxitamab's approval for relapsed or refractory high-risk neuroblastoma in bone or bone marrow. In 74 patients treated with naxitamab and GM-CSF the objective response rate was 50 percent, with complete responses in 38 percent at the interim analysis and durable responses, and the drug can be given as an outpatient. OnCo links it to paediatric neuroblastoma, naxitamab, Nai-Kong V. Cheung and the bottleneck of rare and paediatric cancers without markets. Without a randomised comparison against dinutuximab, whether naxitamab's outpatient convenience comes with equal efficacy is the open question.",
    result: "ORR 50%.",
    outcomes: [{ endpoint: "Objective response rate", primary: true, unit: "%", arms: [{ name: "Naxitamab + GM-CSF", n: 74, value: 50 }], source: "https://www.nature.com/articles/s41467-025-56619-x" }],
    drugs: ["naxitamab"], cancers: ["neuroblastoma"], links: [ct("NCT03363373")], people: ["nai-kong-cheung"] }),
  t({ id: "nmtrc003", name: "NMTRC003/003B (DFMO maintenance)", nct: "NCT02395666", phase: "2", status: "positive", yearReported: 2023, sponsor: "Beat Childhood Cancer Consortium", enrolled: 105,
    setting: "High-risk neuroblastoma in remission after standard therapy including anti-GD2: 2 years of oral eflornithine (single arm, externally controlled)",
    tldr: "NMTRC003 was the single-arm study, compared against historical patients, that got eflornithine approved as maintenance; the design remains debated.",
    summary: "NMTRC003 and 003B, trial NCT02395666 sponsored by the Beat Childhood Cancer Consortium and published in JCO in 2024, was the single-arm study, compared against historical patients, that got oral eflornithine approved as two years of maintenance for high-risk neuroblastoma in remission after standard therapy including anti-GD2 immunotherapy, and the design remains debated. In 105 enrolled patients, event-free and overall survival were better than in a propensity-matched external control drawn from ANBL0032, and the FDA approved the drug in December 2023 while acknowledging the externally controlled design in a rare paediatric setting. A randomised trial has not been done, and uptake is being tracked in ANBL1531, so whether the benefit is real remains the open question.",
    result: "EFS HR 0.48 vs external control.",
    outcomes: [{ endpoint: "Event-free survival", primary: true, arms: [{ name: "Eflornithine", n: 90 }, { name: "External control (ANBL0032)", n: 270 }], hr: 0.48, ci: [0.27, 0.85], source: "https://ascopubs.org/doi/10.1200/JCO.24.00546" }],
    replication: "Not replicated in a randomised trial; uptake tracked in ANBL1531.",
    drugs: ["eflornithine"], cancers: ["neuroblastoma"], tags: ["lesson:external-control"], links: [ct("NCT02395666")] }),
];

// ======================= PAIRINGS / IDEAS =======================
const pairings: PairingInput[] = [
  pair({ id: "anti-gd2-plus-chemo-relapse", links: [{ label: "ANBL1221: irinotecan-temozolomide with temsirolimus or dinutuximab in children with refractory or relapsed neuroblastoma (Lancet Oncology 2017)", url: "https://doi.org/10.1016/S1470-2045(17)30355-8" }], name: "Anti-GD2 antibody + irinotecan-temozolomide (chemoimmunotherapy)", a: "dinutuximab", b: "temozolomide", pairingType: "combination",
    tldr: "Adding the anti-GD2 antibody to relapse chemotherapy doubled response rates in relapsed neuroblastoma, and the idea is now moving into first-line induction.",
    summary: "Adding the anti-GD2 antibody dinutuximab to irinotecan and temozolomide chemotherapy is a combination pairing for relapsed neuroblastoma that has become the standard treatment at first relapse. Chemotherapy releases antigen and depletes suppressive cells while the antibody directs antibody-dependent cellular cytotoxicity against GD2, a disialoganglioside that chemotherapy does not downregulate. In the randomised phase 2 ANBL1221 trial the irinotecan-temozolomide-dinutuximab arm produced far more responses than the temsirolimus comparator, and a confirmatory expansion supported the result. The concept is now moving into first-line induction in ANBL17P1, which tests dinutuximab during induction, and naxitamab combined with chemotherapy shows a similar pattern.",
    rationale: "Chemotherapy releases antigen and depletes suppressive cells while the antibody directs ADCC; GD2 is not downregulated by chemotherapy.",
    evidence: "Randomised phase 2 (ANBL1221) and confirmatory expansion.",
    cancers: ["neuroblastoma"], targets: ["gd2"], drugs: ["dinutuximab", "naxitamab", "temozolomide"] }),
  pair({ id: "il2-anti-gd2-caution", links: [{ label: "ClinicalTrials.gov NCT01704716: SIOPEN HR-NBL1", url: "https://clinicaltrials.gov/study/NCT01704716" }], name: "Caution: IL-2 added to anti-GD2 therapy", a: "dinutuximab", b: "cytokine-therapy", pairingType: "caution",
    tldr: "Interleukin-2 was part of the original immunotherapy package but a large European trial showed it adds toxicity and no benefit, so it has been dropped.",
    summary: "Interleukin-2 was part of the original anti-GD2 immunotherapy package for high-risk neuroblastoma, and this caution pairing records why it has been dropped. In the R2 randomised comparison of the SIOPEN HR-NBL1 trial, adding subcutaneous IL-2 to dinutuximab beta produced no meaningful improvement in event-free survival but far more severe toxicity. The rationale is that IL-2 expands regulatory T cells and causes capillary leak, whereas the NK-cell-mediated antibody-dependent cytotoxicity that the anti-GD2 antibody relies on is sufficiently supported by GM-CSF. European protocols omit IL-2 and the Children's Oncology Group has since removed it as well in ANBL1531, so the combination now stands as a warning example within the broader cytokine therapy record.",
    rationale: "IL-2 expands regulatory T cells and causes capillary leak; NK-mediated ADCC is sufficiently supported by GM-CSF.",
    evidence: "Randomised phase 3 (HR-NBL1).",
    cancers: ["neuroblastoma"], drugs: ["dinutuximab"], trials: ["hr-nbl1"] }),
];

const ideas: IdeaInput[] = [
  idea({ id: "idea-gd2-car-t-frontline-consolidation", links: [{ label: "ClinicalTrials.gov NCT03373097: GD2-CART01 (Bambino Gesù phase 1/2)", url: "https://clinicaltrials.gov/study/NCT03373097" }], name: "GD2 CAR-T as consolidation in high-risk neuroblastoma", maturity: "early-clinical",
    tldr: "Give engineered GD2 T cells to children in remission after standard therapy, where the long-term data show the deepest and longest cures.",
    summary: "This idea would give GD2-directed CAR-T cells to children with high-risk neuroblastoma who are in remission after induction, surgery and transplant, replacing or following tandem transplant and anti-GD2 antibody therapy. Long-term follow-up of the GD2-CART01 phase 1/2 trial at Bambino Gesù showed that most children infused with no evidence of disease have remained disease-free for many years, far better than expected with standard therapy. The rationale is that minimal residual disease is the ideal setting for CAR-T, that GD2 is retained after chemotherapy, and that a safety switch mitigates risk. The proposed test is a randomised phase 2/3 within COG or SIOPEN; at an early clinical stage, it addresses the bottleneck of rare and paediatric cancers and sits in the paediatric roadmap.",
    hypothesis: "GD2 CAR-T consolidation after induction, surgery and transplant improves 3-year EFS from ~60% to ≥75% in high-risk neuroblastoma with acceptable CRS and no chronic neuropathy.",
    rationale: "Minimal residual disease is the ideal CAR-T setting; GD2 is retained after chemotherapy; safety switch mitigates risk.",
    test: "Randomised phase 2/3 within COG or SIOPEN: standard anti-GD2 immunotherapy vs anti-GD2 followed by GD2 CAR-T; EFS primary.",
    technologies: ["car-t", "armored-car"], targets: ["gd2"], cancers: ["neuroblastoma"], trials: ["gd2-cart01"] }),
  idea({ id: "idea-mfbg-pet-replaces-mibg", links: [{ label: "Pandit-Taskar et al., Biodistribution and dosimetry of 18F-meta-fluorobenzylguanidine: a first-in-human PET study (Journal of Nuclear Medicine 2017)", url: "https://doi.org/10.2967/jnumed.117.193169" }], name: "18F-MFBG PET replacing 123I-MIBG scintigraphy", maturity: "early-clinical",
    tldr: "A same-day PET tracer could replace the two-day, low-resolution MIBG scan children now undergo repeatedly.",
    summary: "Children with neuroblastoma repeatedly undergo 123I-MIBG scintigraphy, a two-day, low-resolution scan, and this idea proposes replacing it with same-day 18F-MFBG PET. 18F-meta-fluorobenzylguanidine uses the same norepinephrine-transporter biology as MIBG but gains PET resolution and 18F logistics, needs no sedation across two days, and early data show higher lesion detection. The hypothesis is that MFBG PET/CT detects more lesions than MIBG SPECT with equal specificity, and that Curie-type scoring on MFBG predicts outcome at least as well. Prospective paired comparisons are under way at MSK and in COG imaging studies and an NDA is in progress; at an early clinical stage, it sits within the paediatric oncology roadmap alongside the MIBG theranostics and PET records.",
    hypothesis: "18F-MFBG PET/CT detects more lesions than 123I-MIBG SPECT with equal specificity, and Curie-type scoring on MFBG predicts outcome at least as well.",
    rationale: "MFBG uses the same norepinephrine-transporter biology as MIBG but with PET resolution and 18F logistics.",
    test: "Paired prospective comparison in newly diagnosed and relapsed patients; response prediction analysis.",
    technologies: ["mibg-theranostics", "pet"], cancers: ["neuroblastoma"] }),
];

const entities: EntityInput[] = [...companies, ...targets, ...technologies, ...terms, ...drugs, ...trials, ...pairings, ...ideas];

const spike: Spike = {
  cancerId: "neuroblastoma",
  entities,
  patch: {
    asOf,
    summary: "Neuroblastoma arises from developing sympathetic nerve cells, usually in the adrenal gland or along the spine, and is the most common cancer of infants and the most common extracranial solid tumour of childhood. It spans the widest clinical range in oncology: some infant tumours (stage MS) regress without treatment, while high-risk disease (about half of patients, defined by INRG stage, age over 18 months, MYCN amplification and other genomic features) is cured in only 50-60% despite the most intensive therapy given to children, which is where anti-GD2 antibodies and CAR-T have made their gains. ALK mutations (~10%) are the main druggable driver; MYCN, though not directly druggable, points to polyamine and ALK biology.\n\nHigh-risk therapy is a year-long sequence: five to six cycles of induction chemotherapy, surgery, myeloablative chemotherapy with autologous stem-cell rescue (tandem transplant in North America after ANBL0532; busulfan-melphalan single transplant in Europe after HR-NBL1), radiotherapy to the primary site, then anti-GD2 immunotherapy (dinutuximab or dinutuximab beta with GM-CSF; IL-2 abandoned after HR-NBL1) and isotretinoin. Anti-GD2 antibody raised survival by about 20 points (ANBL0032). Since December 2023, two years of oral eflornithine (DFMO) is approved as maintenance on the strength of an externally controlled study; naxitamab and irinotecan-temozolomide-dinutuximab treat relapse; lorlatinib is being added for ALK-aberrant tumours and 131I-MIBG tested in induction (ANBL1531).\n\nNeuroblastoma is also where CAR-T first produced lasting cures in a solid tumour: GD2-CART01 (Bambino Gesù, NEJM 2023) achieved 63% responses and 33% complete remissions in relapsed disease, with some remissions lasting more than a decade. The open questions are whether cell therapy can consolidate first-line remission, how to reduce the lifelong burden of hearing loss, infertility and second cancers in survivors, how to treat MYCN-amplified relapse, and how to bring anti-GD2 therapy to the majority of children in the world who cannot access it.",
    burden: "~7-8% of childhood cancers; ~800 US cases a year; median age at diagnosis ~18 months; 5-year survival >90% for low/intermediate risk and ~50-60% for high risk.",
    subtypes: ["Very-low and low risk (L1, MS in infants; often observation or surgery alone)", "Intermediate risk (L2, M in infants; moderate chemotherapy)", "High risk (stage M >18 months, or MYCN-amplified at any age)", "ALK-mutated or amplified (~10%; lorlatinib-responsive)", "MYCN-amplified (~20%)", "Relapsed/refractory (MIBG-avid vs non-avid; marrow vs soft-tissue)", "Ganglioneuroblastoma / ganglioneuroma (differentiated spectrum)", "Opsoclonus-myoclonus-associated (paraneoplastic)"],
    biomarkers: ["INRG stage and image-defined risk factors", "Age (<18 months)", "MYCN amplification (FISH)", "ALK mutation/amplification", "11q aberration, 1p deletion, ploidy, segmental chromosomal aberrations", "INPC histology", "Urinary catecholamines (VMA/HVA)", "123I-MIBG Curie score / 18F-MFBG PET", "Bone marrow minimal residual disease (PHOX2B, TH qPCR)", "GD2 expression (near-universal)"],
    standardOfCare: [
      { setting: "Very-low / low risk (L1, MS)", approach: "Observation with serial imaging for asymptomatic L1/MS (many regress); surgery alone for resectable L1; short chemotherapy only for symptoms or progression.", refs: ["inrg-staging", "ultrasound"], guideline: { nccn: "COG/SIOPEN low-risk protocols (observation or surgery)", version: "COG ANBL1232 / SIOPEN LINES" } },
      { setting: "Intermediate risk", approach: "2-8 cycles of moderate chemotherapy (carboplatin, etoposide, cyclophosphamide, doxorubicin) guided by response and biology; surgery; isotretinoin in some protocols.", refs: ["doxorubicin", "cytotoxic-chemotherapy", "inrg-staging"] },
      { setting: "High risk: induction", approach: "5-6 cycles (COG: topotecan-cyclophosphamide × 2 then cisplatin-etoposide, cyclophosphamide-doxorubicin-vincristine; SIOPEN: rapid COJEC); stem-cell harvest; ANBL1531 adds 131I-MIBG (randomised) or lorlatinib (ALK); ANBL17P1 adds dinutuximab to induction.", refs: ["anbl1531", "i131-mibg", "lorlatinib", "dinutuximab", "doxorubicin"], guideline: { nccn: "COG ANBL1531 backbone", version: "COG 2026" } },
      { setting: "High risk: local control", approach: "Surgical resection of primary after induction (gross total where safe); external-beam radiotherapy 21.6 Gy to primary site (boost to residual) and MIBG-avid metastatic sites; proton therapy where available.", refs: ["imrt-igrt", "proton-therapy"] },
      { setting: "High risk: consolidation", approach: "Tandem autologous transplant (thiotepa-cyclophosphamide, then CEM) in North America (ANBL0532); single busulfan-melphalan transplant in Europe (HR-NBL1).", refs: ["tandem-transplant", "autologous-stem-cell-transplant", "anbl0532", "hr-nbl1"], guideline: { nccn: "COG standard (tandem); SIOPEN standard (BuMel)", version: "2026" } },
      { setting: "High risk: post-consolidation", approach: "Anti-GD2 antibody (dinutuximab + GM-CSF + isotretinoin; dinutuximab beta in Europe, no IL-2) × 5-6 cycles; then eflornithine maintenance 2 years (US, 2023).", refs: ["dinutuximab", "anbl0032", "eflornithine", "nmtrc003", "il2-anti-gd2-caution"], guideline: { nccn: "Dinutuximab: FDA-approved standard; eflornithine: FDA-approved maintenance", version: "2026" } },
      { setting: "Relapsed / refractory", approach: "Irinotecan-temozolomide + dinutuximab or naxitamab (ANBL1221); naxitamab + GM-CSF for marrow/bone disease; 131I-MIBG for MIBG-avid disease; lorlatinib for ALK; GD2 CAR-T (Italy, trials); DFMO-based maintenance; palliative radiotherapy.", refs: ["dinutuximab", "naxitamab", "naxitamab-201", "i131-mibg", "lorlatinib", "gd2-cart01", "anti-gd2-plus-chemo-relapse"] },
      { setting: "Survivorship", approach: "Audiology (platinum, DFMO), endocrine and fertility follow-up, cardiac surveillance (anthracycline), second-malignancy screening, neurocognitive support; lifelong late-effects clinic.", refs: ["cardio-oncology"] },
    ],
    stateOfArt: [
      "Anti-GD2 immunotherapy after transplant is standard worldwide (ANBL0032), with IL-2 removed after HR-NBL1 showed no benefit.",
      "Tandem transplant (North America) and busulfan-melphalan (Europe) are the two evidence-based consolidation standards.",
      "Eflornithine is the first oral maintenance therapy approved (December 2023), on an externally controlled study.",
      "GD2 CAR-T produced durable complete remissions in relapsed neuroblastoma, the first such result in a childhood solid tumour.",
      "ALK inhibition with lorlatinib for ALK-aberrant tumours and 131I-MIBG during induction are being tested in ANBL1531.",
      "Risk-adapted de-escalation: many infants and low-risk patients are observed or cured with surgery alone.",
    ],
    history: [
      { year: 1910, title: "James Homer Wright describes neuroblastoma and its rosettes" },
      { year: 1971, title: "Spontaneous regression of stage IV-S (now MS) disease recognised (Evans staging)", refs: ["inrg-staging"] },
      { year: 1983, title: "MYCN amplification linked to aggressive disease (Brodeur, Schwab)", refs: ["mycn-amplification"] },
      { year: 1985, title: "131I-MIBG therapy first used in relapsed neuroblastoma", refs: ["mibg-theranostics"] },
      { year: 1999, title: "CCG-3891: myeloablative therapy with autologous rescue and isotretinoin improve survival", refs: ["autologous-stem-cell-transplant"] },
      { year: 2008, title: "ALK mutations identified as a hereditary and somatic driver", refs: ["alk"] },
      { year: 2009, title: "INRG classification unifies international risk grouping", refs: ["inrg-staging"] },
      { year: 2010, title: "ANBL0032: anti-GD2 immunotherapy raises survival ~20 points (NEJM)", refs: ["anbl0032", "dinutuximab"] },
      { year: 2015, title: "Dinutuximab approved (US); dinutuximab beta in EU 2017", refs: ["dinutuximab"] },
      { year: 2017, title: "HR-NBL1: busulfan-melphalan beats CEM; IL-2 adds no benefit (2018)", refs: ["hr-nbl1"] },
      { year: 2019, title: "ANBL0532: tandem transplant improves EFS (JAMA)", refs: ["anbl0532", "tandem-transplant"] },
      { year: 2020, title: "Naxitamab approved for relapsed disease (accelerated)", refs: ["naxitamab", "naxitamab-201"] },
      { year: 2023, title: "GD2-CART01 in NEJM: durable CAR-T remissions in a solid tumour; eflornithine approved (13 Dec)", refs: ["gd2-cart01", "eflornithine", "nmtrc003"] },
      { year: 2025, title: "Long-term GD2 CAR-T follow-up (Nature Medicine); naxitamab primary-refractory phase 2 (75% CR); eflornithine EU filing", refs: ["gd2-cart01", "naxitamab", "eflornithine"] },
      { year: 2026, title: "ANBL1531 MIBG randomisation maturing; ALK arm reports", refs: ["anbl1531"] },
    ],
    pipeline: ["anbl1531", "i131-mibg", "lorlatinib", "gd2-cart01", "idea-gd2-car-t-frontline-consolidation", "idea-mfbg-pet-replaces-mibg", "mibg-theranostics", "eflornithine", "naxitamab", "anti-gd2-plus-chemo-relapse", "tandem-transplant", "y-mabs"],
    openProblems: [
      "Relapsed high-risk neuroblastoma is rarely curable; MYCN-amplified relapse worst of all.",
      "Anti-GD2 therapy causes severe neuropathic pain; less painful antibody formats (e.g., humanised, Fc-engineered) and CAR-T are needed.",
      "Long-term toxicity of tandem transplant, cisplatin (hearing loss), and radiation in children who will live 70 years.",
      "Eflornithine's approval rests on an external control; a randomised trial is unlikely, so uncertainty persists.",
      "Access: anti-GD2 antibodies are expensive and unavailable in most low- and middle-income countries where most children with cancer live.",
      "MYCN remains undruggable directly; polyamine and Aurora/BET strategies are indirect.",
      "GD2 CAR-T needs randomised evidence and manufacturing at scale; only a few centres can deliver it.",
      "Imaging burden: repeated MIBG scans with sedation; MFBG PET adoption is slow.",
    ],
    targets: ["gd2", "alk"],
    technologies: ["tandem-transplant", "mibg-theranostics", "autologous-stem-cell-transplant", "car-t", "monoclonal-antibody", "proton-therapy"],
    terms: ["inrg-staging", "mycn-amplification", "efs", "adcc", "crs"],
    companies: ["y-mabs", "us-worldmeds"],
    institutions: ["childrens-oncology-group", "mskcc", "dana-farber", "stanford", "city-of-hope"],
    related: ["anti-gd2-plus-chemo-relapse", "il2-anti-gd2-caution"],
    tags: ["spike"],
  },
};

export default spike;

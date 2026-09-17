import type { EntityInput } from "@/lib/schema";
import { TRIAL_OUTCOMES } from "./trial-outcomes";

/**
 * The failure museum: drugs, technologies, and trials that did not work, and what each taught.
 * Every entry carries tag "failure" and a "lesson:<category>" tag used to group the /failures/ page:
 *   lesson:wrong-drug        the molecule did not do what it was claimed to do
 *   lesson:wrong-target      the biology did not hold in humans
 *   lesson:phase-2-mirage    an encouraging phase 2 that phase 3 could not reproduce
 *   lesson:toxicity          efficacy present but the therapeutic window was not
 *   lesson:partner-and-biomarker  the combination partner or assay choice decided the outcome
 *   lesson:regulatory        approval logic, confirmatory trials, and withdrawals
 * Integrated into the corpus via src/data/index.ts (spread `failures` into ALL_INPUTS).
 */
const asOf = "2026-09-06";
const W = (s: string) => `https://en.wikipedia.org/wiki/${s}`;

const raw: EntityInput[] = [
  {
    id: "tiragolumab", kind: "drug", name: "Tiragolumab", code: "RG6058, MTIG7192A", modality: "Monoclonal antibody (anti-TIGIT)", asOf, status: "negative",
    tldr: "An immune-brake blocker that looked excellent in a phase 2 lung cancer trial and then failed every phase 3.",
    summary: "CITYSCAPE (phase 2, 2020) showed tiragolumab plus atezolizumab roughly doubled response rate in PD-L1-high NSCLC. Phase 3 SKYSCRAPER-01 (PD-L1-high NSCLC) missed PFS and OS; SKYSCRAPER-02 (extensive-stage SCLC) was negative; SKYSCRAPER-06 (non-squamous NSCLC) was worse than control. Roche discontinued most of the programme in 2024 and 2025. Other anti-TIGIT antibodies (domvanalimab, ociperlimab) showed no clearer benefit.\n\nLesson: a small randomised phase 2 with a surrogate endpoint in a selected population can mislead; redundancy between checkpoints means blocking a second one does not necessarily add to PD-1/PD-L1 blockade.",
    mechanism: "IgG1 anti-TIGIT with intact Fc; blocks TIGIT-PVR interaction on T and NK cells.",
    targets: ["tigit", "pdl1"], technologies: ["checkpoint-inhibitor", "tigit-blockade"], companies: ["roche-genentech"], cancers: ["nsclc", "sclc"], drugs: ["atezolizumab"], related: ["tigit-plus-pd1-caution"],
    tags: ["failure", "lesson:phase-2-mirage"],
    links: [{ label: "Roche SKYSCRAPER-01 final analysis (2024)", url: "https://www.roche.com/media/releases/med-cor-2024-11-26" }],
  },
  {
    id: "magrolimab", kind: "drug", name: "Magrolimab", code: "Hu5F9-G4, GS-4721", modality: "Monoclonal antibody (anti-CD47)", asOf, status: "withdrawn",
    tldr: "The first 'don't eat me' signal blocker. Gilead paid $4.9B for it; it was stopped in 2024 after trials showed more deaths, not fewer.",
    summary: "Magrolimab blocks CD47 so macrophages can phagocytose tumour cells. Early single-arm data with azacitidine in TP53-mutant AML and MDS were striking. ENHANCE (higher-risk MDS) was stopped for futility in 2023; ENHANCE-2 (TP53-mutant AML) and ENHANCE-3 (unfit AML) were halted in 2024 after an increased risk of death in the magrolimab arms; the FDA placed a full clinical hold. Gilead had acquired Forty Seven for $4.9B in 2020.\n\nLesson: a ubiquitous target (CD47 is on every red cell) plus an immunosuppressed population is a narrow window; single-arm response rates in TP53-mutant disease were not predictive of survival.",
    mechanism: "Humanised IgG4 anti-CD47; blocks the CD47-SIRPα 'don't eat me' signal, enabling macrophage phagocytosis.",
    targets: ["cd47"], technologies: ["monoclonal-antibody", "cd47-blockade"], companies: ["gilead"], cancers: ["aml"],
    tags: ["failure", "lesson:toxicity"],
    links: [{ label: "Gilead discontinues magrolimab in AML (Feb 2024) (page moved; nearest live section)", url: "https://www.gilead.com/news-and-press/press-room/press-releases/" }], pathways: ["cd47-sirpa"],
  },
  {
    id: "rovalpituzumab-tesirine", kind: "drug", name: "Rovalpituzumab tesirine", code: "Rova-T, SC16LD6.5", modality: "ADC", asOf, status: "withdrawn", wikipedia: W("Rovalpituzumab_tesirine"),
    tldr: "Rovalpituzumab tesirine (Rova-T) was the first drug against DLL3 in small-cell lung cancer. AbbVie bought it for $5.8B and abandoned it after two failed phase 3 trials. The target later worked with a different weapon.",
    summary: "A DLL3-directed ADC with a PBD dimer payload (DAR ~2). Phase 2 TRINITY showed modest response rates with high toxicity (effusions, oedema, photosensitivity). Phase 3 TAHOE (second line vs topotecan) was stopped for shorter survival in the Rova-T arm; MERU (first-line maintenance) failed. AbbVie ended development in 2019 after the 2016 Stemcentrx acquisition. Tarlatamab, a DLL3×CD3 T-cell engager, later improved survival in the same setting (DeLLphi-304, 2025).\n\nLesson: target validation and modality are separable. DLL3 was the right address; a PBD payload with a narrow window in a frail population was the wrong weapon.",
    mechanism: "Humanised anti-DLL3 with PBD dimer (SC-DR002) via cleavable linker.",
    payload: "PBD dimer (SC-DR002)", linker: "Cleavable dipeptide",
    targets: ["dll3"], technologies: ["adc"], companies: ["abbvie"], cancers: ["sclc"], drugs: ["tarlatamab"],
    tags: ["failure", "lesson:wrong-drug"],
    links: [{ label: "TAHOE phase 3 (J Thorac Oncol 2021)", url: "https://www.jto.org/article/S1556-0864(21)02264-5/fulltext" }],
  },
  {
    id: "iniparib", kind: "drug", name: "Iniparib", code: "BSI-201, SAR240550", modality: "Small molecule (claimed PARP inhibitor)", asOf, status: "negative", wikipedia: W("Iniparib"),
    tldr: "Billed as the first PARP inhibitor for triple-negative breast cancer, it failed its phase 3 in 2011. It turned out not to inhibit PARP at all.",
    summary: "A randomised phase 2 (O'Shaughnessy, NEJM 2011) in metastatic TNBC showed improved response, PFS, and OS when iniparib was added to gemcitabine-carboplatin. The phase 3 (n=519) missed both co-primary endpoints. Subsequent biochemistry showed iniparib does not trap or inhibit PARP1/2 at clinically relevant concentrations; it acts as a non-specific thiol-reactive compound. Sanofi (which had bought BiPar for up to $500M) discontinued it after a negative phase 3 in squamous NSCLC (2013).\n\nLesson: mechanism claims should be verified before a class label is attached; the true PARP inhibitors (olaparib, talazoparib) later succeeded in BRCA-mutant breast cancer.",
    mechanism: "Originally described as a PARP1 inhibitor; later shown to be a non-selective cysteine-modifying agent without PARP inhibition.",
    targets: ["parp"], technologies: ["parp-inhibitor"], companies: ["sanofi"], cancers: ["tnbc", "nsclc"], drugs: ["olaparib", "talazoparib"],
    tags: ["failure", "lesson:wrong-drug"],
    links: [{ label: "Iniparib is not a PARP inhibitor (Clin Cancer Res 2012)", url: "https://aacrjournals.org/clincancerres/article/18/2/510/76892/A-Deep-Look-at-the-PARP-Inhibitor-Iniparib" }],
  },
  {
    id: "bempegaldesleukin", kind: "drug", name: "Bempegaldesleukin", code: "NKTR-214, bempeg", modality: "Engineered cytokine (PEGylated IL-2)", asOf, status: "negative", wikipedia: W("Bempegaldesleukin"),
    tldr: "Bempegaldesleukin was a re-engineered interleukin-2 meant to be a safer version of a famous old immunotherapy. It added nothing to nivolumab in three phase 3 trials.",
    summary: "Bempegaldesleukin is a PEGylated IL-2 prodrug biased toward the CD122 receptor to expand CD8 T cells over regulatory T cells. Phase 1/2 PIVOT-02 with nivolumab reported high response rates in melanoma. In 2022, PIVOT IO-001 (melanoma), PIVOT-09 (RCC), and PIVOT-10 (urothelial) all failed to improve response, PFS, or OS over nivolumab alone; BMS and Nektar ended the collaboration (BMS had paid $1.85B upfront in 2018).\n\nLesson: single-arm combination response rates in melanoma are unreliable because nivolumab alone already produces them; biological rationale (Treg sparing) did not translate.",
    mechanism: "IL-2 with releasable PEG chains; preferential CD122 (IL-2Rβγ) engagement.",
    technologies: ["cytokine-therapy"], companies: ["bms", "nektar-therapeutics"], cancers: ["melanoma", "rcc", "urothelial"], drugs: ["nivolumab"],
    tags: ["failure", "lesson:phase-2-mirage"],
    links: [{ label: "PIVOT IO-001 (J Clin Oncol 2023)", url: "https://ascopubs.org/doi/10.1200/JCO.23.00172" }],
  },
  {
    id: "adu-s100", kind: "drug", name: "ADU-S100 (MIW815)", code: "ADU-S100", modality: "Small molecule (STING agonist, intratumoural)", asOf, status: "withdrawn",
    tldr: "ADU-S100 was the first STING agonist in the clinic. Injected directly into tumours, it produced almost no responses, alone or with checkpoint blockade.",
    summary: "A cyclic dinucleotide STING agonist from Aduro (partnered with Novartis). Phase 1 monotherapy and combinations with spartalizumab or ipilimumab produced single-digit response rates; Novartis returned rights in 2019 and Aduro discontinued the programme in 2020. Merck's MK-1454 followed the same path. The pathway remains important (it mediates immune effects of radiation and ADCs), and systemic and antibody-conjugated STING agonists continue.\n\nLesson: intratumoural delivery to one lesion rarely produces systemic immunity in humans as it does in mice; pharmacology (rapid clearance, dosing) matters as much as the target.",
    mechanism: "Synthetic cyclic dinucleotide activating STING → TBK1 → IRF3 → type I interferon.",
    pathways: ["cgas-sting"], technologies: ["sting-agonist"], companies: ["novartis"], cancers: ["melanoma", "head-and-neck"],
    tags: ["failure", "lesson:wrong-drug"],
    links: [{ label: "ADU-S100 phase 1 (Cancer Discov 2023)", url: "https://aacrjournals.org/cancerdiscovery/article/13/5/1117/725648" }],
  },
  {
    id: "eprenetapopt", companies: ["aprea-therapeutics"], kind: "drug", name: "Eprenetapopt", code: "APR-246", modality: "Small molecule (p53 reactivator)", asOf, status: "negative", wikipedia: W("Eprenetapopt"),
    tldr: "Eprenetapopt (APR-246) was a drug meant to refold mutant p53, the most common broken protein in cancer. Its phase 3 in blood cancer failed in 2020.",
    summary: "Eprenetapopt (APR-246) is a prodrug of methylene quinuclidinone, proposed to covalently modify mutant p53 and restore wild-type conformation. Phase 2 with azacitidine in TP53-mutant MDS reported ~50% complete remission. The phase 3 (n=154) missed its primary endpoint of complete remission rate in 2020 (33% vs 22%, not significant). Aprea pivoted away. Subsequent studies suggest much of the activity reflected glutathione depletion and oxidative stress rather than p53 refolding.\n\nLesson: TP53 remains undrugged by direct reactivation; the field moved to mutation-specific correctors (rezatapopt for Y220C) and to exploiting p53-loss dependencies (WEE1, ATR).",
    mechanism: "Converted to MQ, which alkylates cysteines in mutant p53 (claimed) and depletes glutathione.",
    targets: ["tp53"], cancers: ["aml"], pathways: ["p53-cell-cycle"],
    tags: ["failure", "lesson:wrong-target"],
    links: [{ label: "Aprea phase 3 topline (Dec 2020)", url: "https://www.globenewswire.com/news-release/2020/12/28/2150865/0/en/Aprea-Therapeutics-Announces-Results-of-Primary-Endpoint-from-Phase-3-Trial-of-Eprenetapopt-in-TP53-Mutant-Myelodysplastic-Syndromes-MDS.html" }],
  },
  {
    id: "tusamitamab-ravtansine", kind: "drug", name: "Tusamitamab ravtansine", code: "SAR408701", modality: "ADC", asOf, status: "withdrawn",
    tldr: "Tusamitamab ravtansine was Sanofi's ADC against the classic CEA tumour marker, stopped for futility in lung cancer in 2023.",
    summary: "A CEACAM5-directed ADC with a DM4 maytansinoid payload. Phase 3 CARMEN-LC03 (vs docetaxel in CEACAM5-high non-squamous NSCLC) was stopped in December 2023 when an interim analysis showed the PFS endpoint would not be met; OS was not improved. Sanofi discontinued the whole programme.\n\nLesson: a tubulin-inhibitor payload at DAR ~4 with a non-permeable release mechanism could not match the TOP1-payload ADC bar set in lung cancer; CEACAM5 itself remains under study with T-cell engagers.",
    mechanism: "Humanised anti-CEACAM5 IgG1 with DM4 via cleavable SPDB linker.",
    payload: "DM4 (ravtansine)", linker: "SPDB disulfide",
    targets: ["ceacam5"], technologies: ["adc"], companies: ["sanofi"], cancers: ["nsclc"],
    tags: ["failure", "lesson:wrong-drug"],
    links: [{ label: "Sanofi press release, CARMEN-LC03 (Dec 2023) (page moved; nearest live section)", url: "https://www.sanofi.com/en/media-room/press-releases/2023/" }],
  },
  {
    id: "impassion131", kind: "trial", name: "IMpassion131", nct: "NCT03125902", phase: "3", status: "negative", yearReported: 2020, sponsor: "Roche", asOf,
    setting: "First-line metastatic TNBC: atezolizumab + paclitaxel vs paclitaxel",
    tldr: "IMpassion131 was the sister trial to the first immunotherapy success in breast cancer. It failed, and the approval it was meant to confirm was withdrawn.",
    summary: "IMpassion130 (nab-paclitaxel partner) had shown a PFS benefit in PD-L1-positive metastatic TNBC and won accelerated approval in 2019. IMpassion131 used conventional paclitaxel (which requires steroid premedication) and showed no PFS or OS benefit; OS trended worse in the atezolizumab arm. Roche withdrew the US TNBC indication in 2021. Pembrolizumab with chemotherapy (KEYNOTE-355) became the standard instead.\n\nLesson: the chemotherapy partner (steroid premedication, immunogenic cell death profile) and the PD-L1 assay (SP142 vs 22C3) can decide an immunotherapy trial; confirmatory trials must replicate the winning design.",
    result: "PFS HR 0.82 (not significant); OS trend unfavourable; US indication withdrawn 2021.",
    drugs: ["atezolizumab", "paclitaxel", "pembrolizumab"], cancers: ["tnbc"], trials: ["impassion130", "keynote-355"], terms: ["cps", "accelerated-approval"],
    tags: ["failure", "lesson:partner-and-biomarker"],
    links: [{ label: "ClinicalTrials.gov NCT03125902", url: "https://clinicaltrials.gov/study/NCT03125902" }, { label: "Annals of Oncology 2021", url: "https://www.annalsofoncology.org/article/S0923-7534(21)02073-7/fulltext" }],
  },
  {
    id: "epacadostat", kind: "drug", name: "Epacadostat", code: "INCB024360", modality: "Small molecule (IDO1 inhibitor)", asOf, status: "negative", wikipedia: W("Epacadostat"),
    tldr: "An enzyme blocker meant to stop tumours starving T cells of tryptophan. Its 2018 phase 3 failure ended an entire class overnight.",
    summary: "IDO1 degrades tryptophan to kynurenine, suppressing T cells. Epacadostat plus pembrolizumab produced ~55% response rates in a phase 1/2 melanoma cohort. ECHO-301/KEYNOTE-252 (n=706, first-line melanoma) showed no PFS or OS difference (2018). Incyte, Merck, BMS, and others halted more than a dozen IDO1 trials within weeks; the drug may never have achieved adequate pathway inhibition in tumours.\n\nLesson: pharmacodynamic proof of target engagement in the tumour should precede phase 3; a large uncontrolled response rate on a pembrolizumab backbone in melanoma is not evidence of added benefit.",
    mechanism: "Selective, reversible IDO1 enzyme inhibitor.",
    technologies: ["checkpoint-inhibitor"], companies: ["merck"], cancers: ["melanoma"], drugs: ["pembrolizumab"],
    tags: ["failure", "lesson:phase-2-mirage"],
    links: [{ label: "ECHO-301/KEYNOTE-252 (Lancet Oncol 2019)", url: "https://www.thelancet.com/journals/lanonc/article/PIIS1470-2045(19)30274-8/fulltext" }],
  },
  {
    id: "trastuzumab-duocarmazine", kind: "drug", name: "Trastuzumab duocarmazine", code: "SYD985", modality: "ADC", asOf, status: "withdrawn",
    tldr: "A HER2 ADC with a DNA-alkylating payload that beat chemotherapy in a phase 3 trial yet never reached the market, because eye and lung toxicity and a stronger rival arrived first.",
    summary: "Byondis' duocarmycin-payload HER2 ADC improved PFS over physician's choice in pretreated HER2+ metastatic breast cancer (TULIP, 2021; PFS 7.0 vs 4.9 months) but with frequent ocular toxicity (~78%) and ILD. The FDA issued a complete response letter in 2023; the EMA application was withdrawn in 2024. Trastuzumab deruxtecan's DESTINY-Breast03 result made its niche disappear.\n\nLesson: statistical significance is not enough when a competitor redefines the standard; payload toxicity profile decides whether an ADC survives.",
    mechanism: "Trastuzumab with seco-DUBA duocarmycin via cleavable Val-Cit linker; DNA alkylation.",
    payload: "seco-DUBA (duocarmycin)", linker: "Val-Cit cleavable",
    targets: ["her2"], technologies: ["adc"], cancers: ["breast-her2-positive"], drugs: ["trastuzumab-deruxtecan"],
    tags: ["failure", "lesson:toxicity"],
    links: [{ label: "TULIP (Ann Oncol 2021 abstract)", url: "https://www.annalsofoncology.org/article/S0923-7534(21)04434-8/fulltext" }],
  },
  {
    id: "melflufen", companies: ["oncopeptides"], kind: "drug", name: "Melphalan flufenamide", brand: "Pepaxto", code: "melflufen", modality: "Peptide-drug conjugate", asOf, status: "withdrawn", wikipedia: W("Melphalan_flufenamide"),
    tldr: "A myeloma drug given accelerated approval in 2021 and withdrawn in the US months later when its confirmatory trial suggested it shortened survival.",
    summary: "Melflufen is a lipophilic peptide-conjugated alkylator activated by aminopeptidases enriched in myeloma cells. Accelerated approval (February 2021) rested on the single-arm HORIZON response rate. The confirmatory OCEAN trial met its PFS endpoint but showed an overall survival detriment in a subgroup (patients with prior autologous transplant), leading to a partial clinical hold, an ODAC vote against, and US withdrawal (2021; formal FDA withdrawal 2024). It remains approved in the EU with restrictions.\n\nLesson: accelerated approval on response rate carries real risk when the confirmatory trial shows harm; the same subgroup could be a true signal or noise, and regulators in the US and EU read it differently.",
    mechanism: "Peptidase-activated alkylating prodrug of melphalan.",
    technologies: ["peptide-drug-conjugate"], cancers: ["multiple-myeloma"], terms: ["accelerated-approval"],
    tags: ["failure", "lesson:regulatory"],
    links: [{ label: "FDA withdrawal of Pepaxto approval (Feb 2024) (page moved; nearest live section)", url: "https://www.fda.gov/drugs/drug-safety-and-availability/" }],
  },
];

export const failures: EntityInput[] = raw.map((t) => (t.kind === "trial" ? { ...t, ...TRIAL_OUTCOMES[t.id] } : t));

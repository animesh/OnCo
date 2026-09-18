/**
 * Registry trials -> cancer subtype pages.
 *
 * The ClinicalTrials.gov ingestion (src/data/pipeline-trials*.ts, tag `ctgov-ingest`) maps every trial to a parent cancer
 * (nsclc, colorectal, prostate ...). The subtype pages (src/data/*-subtypes.ts, `parent` field) split those cancers by
 * driver or disease state (EGFR-mutant NSCLC, KRAS G12C colorectal, extensive-stage SCLC, metastatic castration-resistant
 * prostate cancer ...). This script reads each registry trial's `name` and `setting` (the registry's brief and official
 * titles) for the driver and state tokens of every subtype whose parent the trial already lists, and adds the subtype id
 * to the trial's `cancers` array. The parent is never removed and cancer-side `trials` arrays are not touched, so the
 * subtype page gains the trial through the reverse index and no cancer page grows.
 *
 * Every subtype has a hand-written rule in RULES: `any` tokens (one must appear), optional `all` tokens (each must appear,
 * used to pin paediatric or newly-diagnosed pages) and `none` tokens (any rejects: the driver excluded or negative, the
 * opposite disease state, a token used in another sense). Driver rules use neg() so "EGFR-negative", "without EGFR",
 * "EGFR wild-type" and "excluding EGFR" reject. Rejections seen when a plan was reviewed by reading the trial names are
 * pinned in REJECT by `trial>subtype` with the reason, so a re-run after the next ingestion reproduces the review.
 *
 *   npx tsx scripts/subtype-trial-links.ts --plan            list every match per subtype with the trial name and the token that fired
 *   npx tsx scripts/subtype-trial-links.ts --plan --quiet    counts per subtype only
 *   npx tsx scripts/subtype-trial-links.ts --apply           write the subtype ids into the trial records through the editor in scripts/orphan-links.ts
 *   npx tsx scripts/subtype-trial-links.ts --plan --only kras-g12c-nsclc,prostate-mcrpc     limit to some subtypes
 *   npx tsx scripts/subtype-trial-links.ts --plan --all-trials                              also consider curated (non-registry) trials
 *
 * Add to RULES when a subtype page is created; add to REJECT (with a reason) when a plan shows a false positive rather
 * than hand-editing the output. The script refuses to run when a rule names a subtype or parent that is not in the graph.
 */
import { graph } from "../src/lib/graph";
import type { Entity } from "../src/lib/schema";
import { applyEdits } from "./orphan-links";

type TrialEntity = Extract<Entity, { kind: "trial" }>;
/** `near`: for disease-state tokens ("advanced", "relapsed"), the cancer must be named within NEAR characters of the token, so "advanced solid tumours" baskets do not count as advanced melanoma. */
type Rule = { subtype: string; parents: string[]; any: RegExp[]; all?: RegExp[]; none?: RegExp[]; near?: RegExp };
const NEAR = 70;
type Edit = { targetId: string; targetKind: string; targetName: string; field: string; add: string; why: string };
export type Match = { trial: TrialEntity; subtype: string; token: string };

const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
/** A gene or marker token with boundaries that allow "EGFR-mutant", "EGFR+" and "(EGFR)" but not "hEGFR" or "EGFR2". */
const gene = (t: string) => new RegExp(`(?<![A-Za-z0-9])${esc(t)}(?![A-Za-z0-9])`, "i");
/** The same token written as excluded, negative or wild-type: reject the trial for that driver's subtype. */
const neg = (t: string) => new RegExp(`(${esc(t)}[- ]?(negative|neg\\b|wild([- ]?type)?\\b|WT\\b|non[- ]?mutant|unselected)|(without|no|lacking|excluding|not harbou?ring|negative for|wild[- ]?type for|absence of)( an?| any| known| the)?( (activating|actionable|sensiti[sz]ing|targetable|driver|known))?( ,?(or|and) )?( ?[A-Za-z0-9/,-]{1,12}){0,4}? ?${esc(t)})`, "i");
const w = (s: string) => new RegExp(`\\b${s}\\b`, "i");
const PAED = /p(a)?ediatric|child(ren|hood)?|infant|adolescent|young (people|adults|patients)|\bAYA\b/i;
const NEWLY = /newly[- ]diagnosed|previously untreated|treatment[- ]na[iï]ve|untreated|first[- ]line|front[- ]?line|\bNDMM\b/i;
const RELAPSED = /relapsed?\b|refractory|\bR\/R\b|\bRR\b|previously treated|pre-?treated|second[- ]line|later[- ]line/i;
const EARLY_BREAST = /\bearly\b|adjuvant|neoadjuvant|operable|(?<!un)resectable|stage (I|II|III)\b(?!I*V)|residual (invasive )?disease|high[- ]risk|node[- ]positive|curative/i;
const ADVANCED_BREAST = /metastatic|unresectable|stage IV|locally advanced|recurrent|inoperable|\badvanced\b/i;
const MELANOMA = /melanoma/i, ENDOMETRIAL = /endometri|uterine/i, LIVER = /hepatocellular|\bHCC\b|liver/i, BREAST = /breast|\bTNBC\b/i, HN = /head and neck|\bHNSCC\b|\bSCCHN\b|oropharyn|laryn|oral cavity|hypopharyn/i;
const CERVIX = /cervi/i, BLADDER = /urothelial|bladder|\bUC\b|\bUTUC\b/i, LUNG = /lung|\bNSCLC\b/i, MYELOMA = /myeloma|\bMM\b|\bRRMM\b|\bNDMM\b/i, CLL = /\bCLL\b|chronic lymphocytic|\bSLL\b/i;
const ALL = /leuk|lymphoblastic|\bALL\b/i, AML = /\bAML\b|myeloid|leuk/i, MDS = /\bMDS\b|myelodysplastic/i, OVARY = /ovar|fallopian|peritoneal|gyn(a)?ecolog/i, RENAL = /renal|kidney|\bRCC\b/i, OESOPHAGUS = /esophag|oesophag|\bGEJ\b|\bGOJ\b|junction/i;
const ADULT_ONLY = /adolescents? (and|or) adults?|adults? (and|or) adolescents?/i;
const MSI = [/\bMSI-?H\b/i, /MSI[- ]high/i, /microsatellite instability[- ]high/i, /microsatellite[- ]unstable/i, /\bdMMR\b/i, /mismatch[- ]repair[- ]deficien/i, /deficient mismatch repair/i, /\bMMR-?d(eficient)?\b/i, /\bMMRd\b/];
const MSS = [/\bMSS\b/i, /microsatellite[- ]stable/i, /\bpMMR\b/i, /mismatch[- ]repair[- ]proficien/i, /proficient mismatch repair/i, /non-?MSI-?H|non-?dMMR/i];
/** Bispecific, CAR or ADC constructs that name a target the patients were not selected for. */
const CONSTRUCT = /\bCAR[- ]?(T|NK)\b|mesothelin|\bMSLN\b/i;

/** Tokens from each subtype's name and aliases, with the exclusions the review needed. Keep alphabetical by parent. */
export const RULES: Rule[] = [
  // acute lymphoblastic leukaemia
  { subtype: "all-infant", parents: ["all-leukemia"], any: [w("infants?"), /KMT2A|MLL[- ]?r/i], all: [PAED] },
  { subtype: "all-paediatric-high-risk", parents: ["all-leukemia"], any: [/high[- ]risk/i, /\bT-ALL\b/, /T-cell acute lymphoblastic/i], all: [PAED], none: [/standard[- ]risk/i, ADULT_ONLY] },
  { subtype: "all-paediatric-ph-positive", parents: ["all-leukemia"], any: [/Ph\+|Philadelphia[- ](chromosome[- ])?positive|BCR[-:]*ABL1?[- ]?positive/i], all: [PAED], none: [/Ph-like|BCR[-:]*ABL1?-like/i, ADULT_ONLY] },
  { subtype: "all-paediatric-relapsed", parents: ["all-leukemia"], any: [RELAPSED], all: [PAED], none: [NEWLY, ADULT_ONLY], near: ALL },
  { subtype: "all-paediatric-standard-risk", parents: ["all-leukemia"], any: [/standard[- ]risk|average[- ]risk|low[- ]risk/i], all: [PAED], none: [/high[- ]risk/i] },
  { subtype: "all-ph-like", parents: ["all-leukemia"], any: [/Ph-like|BCR[-:]*ABL1?-like/i] },
  // acute myeloid leukaemia
  { subtype: "aml-flt3", parents: ["aml"], any: [gene("FLT3")], none: [neg("FLT3")] },
  { subtype: "aml-idh", parents: ["aml"], any: [gene("IDH1"), gene("IDH2"), gene("IDH")], none: [neg("IDH1"), neg("IDH2"), neg("IDH")] },
  { subtype: "aml-npm1-kmt2a", parents: ["aml"], any: [gene("NPM1"), gene("KMT2A"), /MLL[- ]?r/i, /menin/i], none: [neg("NPM1"), neg("KMT2A")] },
  { subtype: "aml-older-unfit", parents: ["aml"], any: [/\bunfit\b/i, /ineligible for (intensive|standard)/i, /not (eligible|suitable|fit) for (intensive|standard)/i, /intensive (chemotherapy|induction)[- ]ineligible/i, /\bolder\b|elderly/i, /aged? (60|65|70|75)/i, /(≥|>=) ?(60|65|70|75) years/i, /low[- ]intensity/i], near: AML },
  { subtype: "aml-paediatric", parents: ["aml"], any: [PAED] },
  { subtype: "aml-secondary", parents: ["aml"], any: [/secondary AML|\bsAML\b/i, /therapy[- ]related/i, /\bt-AML\b/i, /myelodysplasia[- ]related/i, /AML.{0,20}(from|following|after|post).{0,20}(MDS|MPN|myelodysplastic)/i] },
  { subtype: "apl", parents: ["aml"], any: [/promyelocytic/i, /\bAPL\b/, /PML[-:]*RARA/i] },
  // basal and squamous skin cancers
  { subtype: "locally-advanced-bcc", parents: ["basal-cell-carcinoma"], any: [/locally advanced|metastatic|\badvanced\b|unresectable/i], near: /basal[- ]cell|\bBCC\b/i },
  { subtype: "advanced-cutaneous-scc", parents: ["cutaneous-scc"], any: [/locally advanced|metastatic|\badvanced\b|unresectable/i], near: /cutaneous squamous|\bcSCC\b|squamous cell carcinoma of the skin/i },
  { subtype: "basal-cell-carcinoma", parents: ["skin-cancer"], any: [/basal[- ]cell/i] },
  { subtype: "cutaneous-scc", parents: ["skin-cancer"], any: [/cutaneous squamous|squamous cell carcinoma of the skin|\bcSCC\b/i] },
  { subtype: "melanoma", parents: ["skin-cancer"], any: [/melanoma/i] },
  { subtype: "merkel-cell-carcinoma", parents: ["skin-cancer"], any: [/Merkel/i] },
  // biliary
  { subtype: "ampullary", parents: ["biliary-tract-cancer", "cholangiocarcinoma"], any: [/ampull/i] },
  { subtype: "gallbladder", parents: ["biliary-tract-cancer", "cholangiocarcinoma"], any: [/gall ?bladder/i] },
  { subtype: "intrahepatic-cholangiocarcinoma", parents: ["cholangiocarcinoma", "biliary-tract-cancer"], any: [/intrahepatic/i, /\biCCA\b/, gene("FGFR2"), gene("IDH1")], none: [neg("FGFR2"), neg("IDH1")] },
  { subtype: "extrahepatic-cholangiocarcinoma", parents: ["cholangiocarcinoma", "biliary-tract-cancer"], any: [/extrahepatic|peri-?hilar|\bhilar\b|distal (bile duct|cholangio)|Klatskin/i] },
  // brain
  { subtype: "atrt", parents: ["brain-tumours", "childhood-cancers"], any: [/rhabdoid|\bATRT\b|AT\/RT/i] },
  { subtype: "cns-germ-cell-tumours", parents: ["brain-tumours"], any: [/germ cell|germinoma/i] },
  { subtype: "craniopharyngioma", parents: ["brain-tumours"], any: [/craniopharyngioma/i] },
  { subtype: "ependymoma", parents: ["brain-tumours", "glioblastoma"], any: [/ependymoma/i] },
  { subtype: "glioblastoma", parents: ["brain-tumours"], any: [/glioblastoma|glioma|\bGBM\b/i] },
  { subtype: "medulloblastoma", parents: ["brain-tumours", "childhood-cancers"], any: [/medulloblastoma/i] },
  { subtype: "meningioma", parents: ["brain-tumours"], any: [/meningioma/i] },
  { subtype: "pituitary-tumours", parents: ["brain-tumours", "neuroendocrine"], any: [/pituitary|prolactinoma|acromegaly|Cushing/i] },
  { subtype: "secondary-brain-tumours", parents: ["brain-tumours"], any: [/brain metasta|CNS metasta|intracranial metasta|cerebral metasta|leptomeningeal/i] },
  { subtype: "spinal-cord-tumours", parents: ["brain-tumours"], any: [/spinal cord|intramedullary/i] },
  { subtype: "vestibular-schwannoma", parents: ["brain-tumours"], any: [/schwannoma|acoustic neuroma|\bNF2\b/i] },
  { subtype: "dipg-dmg", parents: ["glioblastoma", "brain-tumours"], any: [/\bDIPG\b|pontine|diffuse midline|H3[- ]?K27/i] },
  { subtype: "idh-mutant-astrocytoma", parents: ["glioblastoma", "brain-tumours"], any: [/IDH[- ]?mut/i, gene("IDH1"), gene("IDH2"), /astrocytoma/i, /low(er)?[- ]grade glioma/i, /grade (2|3|II|III)\b.{0,10}glioma/i], none: [neg("IDH"), neg("IDH1"), /wild[- ]?type/i, /pilocytic|optic pathway|p(a)?ediatric low/i] },
  { subtype: "oligodendroglioma", parents: ["glioblastoma", "brain-tumours"], any: [/oligodendroglioma/i, /1p\/19q/] },
  { subtype: "paediatric-high-grade-glioma", parents: ["glioblastoma", "brain-tumours", "childhood-cancers"], any: [/high[- ]grade glioma|\bpHGG\b|glioblastoma/i], all: [PAED], none: [/DIPG|pontine|diffuse midline/i] },
  { subtype: "paediatric-low-grade-glioma", parents: ["glioblastoma", "brain-tumours", "childhood-cancers"], any: [/low[- ]grade glioma|\bpLGG\b|pilocytic|optic pathway/i], all: [PAED] },
  // breast
  { subtype: "ductal-carcinoma-in-situ", parents: ["breast-cancer", "breast-hr-positive", "breast-her2-positive", "tnbc"], any: [/\bDCIS\b|ductal carcinoma in situ/i] },
  { subtype: "her2-low-metastatic-breast-cancer", parents: ["breast-cancer", "breast-hr-positive", "tnbc"], any: [/HER2[- ]?(low|ultra-?low)/i, /IHC ?1\+/i], all: [ADVANCED_BREAST], near: BREAST },
  { subtype: "inflammatory-breast-cancer", parents: ["breast-cancer", "breast-hr-positive", "breast-her2-positive", "tnbc"], any: [/inflammatory breast/i] },
  { subtype: "male-breast-cancer", parents: ["breast-cancer", "breast-hr-positive", "breast-her2-positive", "tnbc"], any: [/\bmale breast|men with breast|breast cancer in men/i] },
  { subtype: "her2-positive-breast-brain-metastases", parents: ["breast-her2-positive"], any: [/brain metasta|CNS metasta|intracranial|leptomeningeal|central nervous system metasta/i], none: [/with or without[^.]{0,40}(brain|CNS|central nervous system)/i] },
  { subtype: "her2-positive-early-breast-cancer", parents: ["breast-her2-positive"], any: [EARLY_BREAST], none: [ADVANCED_BREAST, /HER2[- ]?low/i], near: BREAST },
  { subtype: "hr-positive-early-high-risk", parents: ["breast-hr-positive"], any: [EARLY_BREAST], none: [ADVANCED_BREAST, /triple[- ]negative|\bTNBC\b|HER2[- ]?positive|HER2\+/i], near: BREAST },
  { subtype: "hr-positive-metastatic-post-cdk46", parents: ["breast-hr-positive"], any: [/(after|following|prior|progress\w*|previously treated|pre-?treated|resistan\w*|failure|exposed|received)[^.]{0,80}CDK ?4\/6/i, /CDK ?4\/6[^.]{0,80}(progress\w*|prior|previous\w*|pre-?treat\w*|failure|resistan\w*|exposed|after)/i, gene("ESR1"), gene("PIK3CA"), /\bAKT1?\b/, /\bPTEN\b/, /endocrine[- ]resistan/i, /post[- ]CDK/i], all: [ADVANCED_BREAST], none: [EARLY_BREAST, /first[- ]line|untreated|treatment[- ]na[iï]ve|endocrine[- ]sensitive|received no prior|no prior (systemic|therapy|treatment)/i], near: BREAST },
  { subtype: "tnbc-early", parents: ["tnbc"], any: [EARLY_BREAST], none: [ADVANCED_BREAST], near: BREAST },
  { subtype: "tnbc-metastatic", parents: ["tnbc"], any: [ADVANCED_BREAST], none: [EARLY_BREAST], near: BREAST },
  // cervical
  { subtype: "early-cervical-cancer", parents: ["cervical"], any: [/early[- ]stage|stage IA|stage IB1|stage IB2|radical hysterectomy|trachelectomy|fertility[- ]sparing/i], none: [/locally advanced|metastatic|recurrent|persistent/i], near: CERVIX },
  { subtype: "locally-advanced-cervical-cancer", parents: ["cervical"], any: [/locally advanced|stage IB3|stage II\b|stage III\b|stage IVA\b|chemoradi|\bLACC\b|node[- ]positive/i], none: [/metastatic|recurrent|persistent|stage IVB/i], near: CERVIX },
  { subtype: "recurrent-metastatic-cervical-cancer", parents: ["cervical"], any: [/recurrent|metastatic|persistent|stage IVB/i], none: [/chemoradi|definitive|locally advanced/i], near: CERVIX },
  // childhood
  { subtype: "hepatoblastoma", parents: ["childhood-cancers"], any: [/hepatoblastoma/i] },
  { subtype: "neuroblastoma", parents: ["childhood-cancers"], any: [/neuroblastoma/i] },
  { subtype: "retinoblastoma", parents: ["childhood-cancers"], any: [/retinoblastoma/i] },
  { subtype: "wilms-tumor", parents: ["childhood-cancers"], any: [/Wilms|nephroblastoma/i] },
  { subtype: "paediatric-germ-cell-tumours", parents: ["childhood-cancers"], any: [/germ cell|germinoma/i] },
  { subtype: "pleuropulmonary-blastoma", parents: ["childhood-cancers"], any: [/pleuropulmonary|\bPPB\b|DICER1/i] },
  { subtype: "neuroblastoma-high-risk", parents: ["neuroblastoma"], any: [/high[- ]risk|MYCN|stage 4\b|metastatic/i], none: [/low[- ]risk|intermediate[- ]risk|stage 4S|stage MS/i], near: /neuroblastoma/i },
  { subtype: "neuroblastoma-intermediate-risk", parents: ["neuroblastoma"], any: [/intermediate[- ]risk/i] },
  { subtype: "neuroblastoma-low-risk", parents: ["neuroblastoma"], any: [/low[- ]risk|stage 4S|stage MS/i], none: [/high[- ]risk/i] },
  // chronic lymphocytic leukaemia
  { subtype: "cll-relapsed", parents: ["cll"], any: [RELAPSED], none: [NEWLY], near: CLL },
  { subtype: "cll-treatment-naive", parents: ["cll"], any: [NEWLY], none: [RELAPSED], near: CLL },
  { subtype: "richter-transformation-cll", parents: ["cll", "non-hodgkin-lymphoma", "dlbcl"], any: [/Richter/i] },
  // chronic myeloid leukaemia
  { subtype: "cml-advanced-phase", parents: ["cml"], any: [/accelerated[- ]phase|blast[- ](phase|crisis)|CML-AP|CML-BP|advanced[- ]phase/i] },
  { subtype: "cml-chronic-phase", parents: ["cml"], any: [/chronic[- ]phase|CP-CML|CML-CP/i], none: [/accelerated|blast/i] },
  // colorectal
  { subtype: "braf-v600e-colorectal", parents: ["colorectal"], any: [gene("BRAF")], none: [neg("BRAF")] },
  { subtype: "early-onset-colorectal", parents: ["colorectal"], any: [/early[- ]onset|young[- ]onset|early[- ]age[- ]onset|under (the age of )?50|younger than 50/i] },
  { subtype: "her2-amplified-colorectal", parents: ["colorectal"], any: [gene("HER2"), gene("ERBB2")], none: [neg("HER2"), neg("ERBB2")] },
  { subtype: "kras-g12c-colorectal", parents: ["colorectal"], any: [/G12C/] },
  { subtype: "msi-high-colorectal", parents: ["colorectal"], any: MSI, none: MSS },
  { subtype: "rectal-cancer", parents: ["colorectal"], any: [/\brect(al|um)\b/i], none: [/metastatic colorectal|\bmCRC\b/i] },
  // endometrial
  { subtype: "advanced-recurrent-endometrial-cancer", parents: ["endometrial"], any: [/advanced|recurrent|metastatic|stage III\b|stage IV/i], none: [/\bearly\b|stage I\b|stage II\b|adjuvant(?![^.]{0,60}(advanced|stage III))/i], near: ENDOMETRIAL },
  { subtype: "endometrial-mmr-deficient", parents: ["endometrial"], any: MSI, none: MSS },
  { subtype: "endometrial-nsmp", parents: ["endometrial"], any: [/\bNSMP\b|no specific molecular/i] },
  { subtype: "endometrial-p53-abnormal", parents: ["endometrial"], any: [/p53/i, /uterine (papillary )?serous|serous (endometrial|uterine|carcinoma)/i], none: [/p53[- ]?wild/i, /T?P53 ?WT\b/i] },
  { subtype: "endometrial-pole-ultramutated", parents: ["endometrial"], any: [gene("POLE"), /ultramutated/i] },
  { subtype: "uterine-carcinosarcoma", parents: ["endometrial", "sarcoma", "uterine-sarcoma"], any: [/carcinosarcoma/i] },
  // oesophageal
  { subtype: "oesophageal-adenocarcinoma", parents: ["esophageal"], any: [/adenocarcinoma|\bEAC\b|gastro-?(o)?esophageal junction|\bGEJ\b|\bGOJ\b/i], none: [/squamous/i], near: OESOPHAGUS },
  { subtype: "oesophageal-squamous-cell-carcinoma", parents: ["esophageal"], any: [/squamous|\bESCC\b|\bOSCC\b/i], none: [/adenocarcinoma/i], near: OESOPHAGUS },
  // gastric
  { subtype: "early-gastric-cancer", parents: ["gastric"], any: [/early gastric|\bT1\b gastric|endoscopic (submucosal|resection)|\bESD\b/i] },
  { subtype: "gastric-cldn18-2-positive", parents: ["gastric"], any: [/CLDN ?18\.2|claudin[- ]?18(\.2)?/i], none: [neg("CLDN18.2"), neg("Claudin 18.2")] },
  { subtype: "gastric-her2-positive", parents: ["gastric"], any: [gene("HER2"), gene("ERBB2")], none: [neg("HER2"), neg("ERBB2"), /HER2[- ]?low/i, /non-?expression/i] },
  { subtype: "gastric-msi-high", parents: ["gastric"], any: MSI, none: MSS },
  { subtype: "gastric-pdl1-high", parents: ["gastric"], any: [/PD-?L1[^.]{0,40}(CPS|≥|>=|positive|high|expressing|express)/i, /\bCPS ?(≥|>=|of |at least )?\d/i], none: [neg("PD-L1"), /CPS ?(<|≤|less than)|PD-L1[- ]?(negative|low)/i] },
  // gastrointestinal stromal tumour
  { subtype: "gist", parents: ["sarcoma"], any: [/\bGIST\b|gastrointestinal stromal/i] },
  { subtype: "gist-imatinib-resistant", parents: ["gist"], any: [/imatinib[- ](resistant|refractory|intolerant)/i, /(after|following|progress\w*( on)?|failure of|failed|prior|previously treated with|pre-?treated with|refractory to|resistant to)[^.]{0,30}imatinib/i, /(second|third|fourth)[- ]line/i, /prior (tyrosine kinase|TKI)/i], none: [/PDGFRA|D842V/i] },
  { subtype: "gist-kit-exon-11", parents: ["gist"], any: [/exon ?11/i] },
  { subtype: "gist-pdgfra-d842v", parents: ["gist"], any: [/PDGFRA|D842V/i] },
  // hepatocellular carcinoma
  { subtype: "hcc-advanced", parents: ["hcc"], any: [/\badvanced\b|unresectable|metastatic|BCLC[- ](stage )?C\b|portal vein/i], none: [/adjuvant|(?<!un)resectable|resected|intermediate|BCLC[- ](stage )?[AB]\b|\bTACE\b|transarterial|ablation|\bearly\b|transplant/i], near: LIVER },
  { subtype: "hcc-intermediate", parents: ["hcc"], any: [/intermediate/i, /BCLC[- ](stage )?B\b/i, /\bTACE\b|transarterial chemoemboli/i], none: [/adjuvant|resected|\bearly\b|BCLC[- ](stage )?A\b/i], near: LIVER },
  { subtype: "hcc-early", parents: ["hcc"], any: [/\bearly\b|(?<!un)(?<!non-)(?<!non )resect(ion|able|ed)|ablation|adjuvant|Milan|transplant|BCLC[- ](stage )?[0A]\b/i], none: [/unresectable|\badvanced\b|metastatic|intermediate|BCLC[- ](stage )?[BC]\b/i], near: LIVER },
  // head and neck
  { subtype: "hpv-negative-head-and-neck-cancer", parents: ["head-and-neck", "oropharyngeal-cancer"], any: [/HPV[- ]?negative|p16[- ]?negative|HPV[- ]unrelated|non[- ]HPV/i] },
  { subtype: "laryngeal-cancer", parents: ["head-and-neck"], any: [/laryn|larynx|glottic|hypopharyn/i] },
  { subtype: "oral-cavity-cancer", parents: ["head-and-neck"], any: [/oral cavity|oral squamous|oral cancer|\btongue\b|\bmouth\b/i] },
  { subtype: "oropharyngeal-cancer", parents: ["head-and-neck"], any: [/oropharyn|tonsil|base of (the )?tongue/i] },
  { subtype: "recurrent-metastatic-hnscc", parents: ["head-and-neck"], any: [/recurrent|metastatic|\bR\/M\b/i], none: [/locally advanced|definitive|chemoradi|(?<!un)resectable|resected|adjuvant|neoadjuvant|\bearly\b/i], near: HN },
  { subtype: "hypopharyngeal-cancer", parents: ["laryngeal-cancer", "head-and-neck"], any: [/hypopharyn|pyriform|piriform|postcricoid/i] },
  { subtype: "buccal-mucosa-cancer", parents: ["oral-cavity-cancer", "head-and-neck"], any: [/buccal|gingivobuccal|\bcheek\b/i] },
  { subtype: "lip-cancer", parents: ["oral-cavity-cancer", "head-and-neck"], any: [/\blip\b/i] },
  { subtype: "oral-tongue-cancer", parents: ["oral-cavity-cancer", "head-and-neck"], any: [/oral tongue|floor of (the )?mouth|\btongue\b/i], none: [/base of (the )?tongue/i] },
  { subtype: "hpv-positive-oropharyngeal-cancer", parents: ["oropharyngeal-cancer", "head-and-neck"], any: [/HPV[- ]?(positive|associated|related|driven|mediated)|p16[- ]?positive|HPV\+/i], none: [/HPV[- ]?negative/i] },
  { subtype: "adenoid-cystic-carcinoma", parents: ["salivary-gland", "head-and-neck"], any: [/adenoid cystic/i] },
  { subtype: "mucoepidermoid-carcinoma", parents: ["salivary-gland", "head-and-neck"], any: [/mucoepidermoid/i] },
  { subtype: "salivary-duct-carcinoma", parents: ["salivary-gland", "head-and-neck"], any: [/salivary duct/i] },
  // lung: non-small-cell
  { subtype: "alk-positive-nsclc", parents: ["nsclc"], any: [gene("ALK")], none: [neg("ALK")] },
  { subtype: "braf-v600e-nsclc", parents: ["nsclc"], any: [gene("BRAF")], none: [neg("BRAF")] },
  { subtype: "egfr-mutant-nsclc", parents: ["nsclc"], any: [gene("EGFR")], none: [neg("EGFR"), /anti-EGFR|EGFR[- ]expressing|express(es|ing)? EGFR/i, CONSTRUCT] },
  { subtype: "her2-mutant-nsclc", parents: ["nsclc"], any: [gene("HER2"), gene("ERBB2")], none: [neg("HER2"), neg("ERBB2"), CONSTRUCT, /NRG1/] },
  { subtype: "kras-g12c-nsclc", parents: ["nsclc"], any: [/G12C/] },
  { subtype: "met-altered-nsclc", parents: ["nsclc"], any: [/(?<![A-Za-z0-9])MET(?![A-Za-z0-9])/, /METex14|MET ?exon ?14|c-?MET/i], none: [neg("MET"), /anti-c-?MET|anti-EGFR|EGFR-MET bispecific/i, CONSTRUCT] },
  { subtype: "ntrk-fusion-nsclc", parents: ["nsclc"], any: [gene("NTRK"), /NTRK[123]|TRK fusion/i], none: [neg("NTRK")] },
  { subtype: "pdl1-high-nsclc", parents: ["nsclc"], any: [/PD-?L1[^.]{0,60}(high|50 ?%|50 percent|(≥|>=|at least|greater than or equal to) ?50)/i, /(high|(≥|>=|at least) ?50 ?%)[^.]{0,20}PD-?L1/i], none: [/EGFR[- ]?(mutant|mutated|positive)|ALK[- ]?(positive|rearranged)|G12C/i, /(<|≤|less than) ?50|TPS ?(<|≤) ?50|\b1[- ]?(to|-)[- ]?49\b|low PD-L1|PD-L1[- ]?(low|negative)|negative for PD-L1|(≥|>=|at least) ?1 ?%|1 ?% or (more|greater)/i] },
  { subtype: "resectable-nsclc", parents: ["nsclc"], any: [/(?<!un)resectable|operable|early[- ]stage|perioperative|neoadjuvant|\badjuvant\b|stage (I|IB|II|IIA|IIB|IIIA)\b|completely resected/i], none: [/unresectable|inoperable|metastatic|stage IV|stage IIIB|stage IIIC|locally advanced(?![^.]{0,20}resectable)/i], near: LUNG },
  { subtype: "ret-fusion-nsclc", parents: ["nsclc"], any: [/(?<![A-Za-z0-9])RET(?![A-Za-z0-9])/], none: [neg("RET")] },
  { subtype: "ros1-positive-nsclc", parents: ["nsclc"], any: [gene("ROS1")], none: [neg("ROS1")] },
  { subtype: "stage-iii-unresectable-nsclc", parents: ["nsclc"], any: [/unresectable[^.]{0,40}stage III|stage III[^.]{0,40}unresectable|inoperable[^.]{0,30}stage III|stage III[^.]{0,30}inoperable|stage IIIB|stage IIIC|locally advanced[^.]{0,40}(unresectable|inoperable)|(unresectable|inoperable)[^.]{0,20}locally advanced|definitive (chemo)?radi/i], none: [/stage IV|metastatic|(?<!un)resectable|resected|neoadjuvant/i], near: LUNG },
  // lung: small-cell
  { subtype: "extensive-stage-sclc", parents: ["sclc"], any: [/extensive[- ](stage|disease)|\bES-SCLC\b|metastatic small[- ]cell|stage IV small/i], none: [/limited[- ](stage|disease)|\bLS-SCLC\b/i] },
  { subtype: "limited-stage-sclc", parents: ["sclc"], any: [/limited[- ](stage|disease)|\bLS-SCLC\b/i], none: [/extensive[- ](stage|disease)|\bES-SCLC\b/i] },
  // myelodysplastic syndromes
  { subtype: "mds-higher-risk", parents: ["mds"], any: [/higher[- ]risk|high(er)?[- ]risk|very high|intermediate-2|IPSS-R (intermediate|high)|excess blasts|\bHR-MDS\b/i], none: [/lower[- ]risk|low[- ]risk|\bLR-MDS\b/i], near: MDS },
  { subtype: "mds-lower-risk", parents: ["mds"], any: [/lower[- ]risk|low[- ]risk|\bLR-MDS\b|transfusion[- ]dependent|an(a)?emia/i], none: [/higher[- ]risk|high[- ]risk|\bHR-MDS\b/i], near: MDS },
  // melanoma
  { subtype: "acral-melanoma", parents: ["melanoma"], any: [/acral/i] },
  { subtype: "advanced-melanoma", parents: ["melanoma"], any: [/unresectable|metastatic|stage IV|\badvanced\b/i], none: [/\bresected\b|adjuvant|(?<!un)resectable|stage II\b|stage IIB|stage IIC|uveal|ocular/i], near: MELANOMA },
  { subtype: "braf-v600-melanoma", parents: ["melanoma"], any: [gene("BRAF")], none: [neg("BRAF")] },
  { subtype: "mucosal-melanoma", parents: ["melanoma"], any: [/mucosal/i] },
  { subtype: "stage-ii-melanoma", parents: ["melanoma"], any: [/stage IIB|stage IIC|stage II\b/i], none: [/stage III|unresectable|metastatic/i], near: MELANOMA },
  { subtype: "stage-iii-melanoma", parents: ["melanoma"], any: [/\bresected\b|adjuvant/i], all: [/stage III/i], none: [/unresectable|uveal/i], near: MELANOMA },
  { subtype: "uveal-melanoma", parents: ["melanoma"], any: [/uveal|ocular|choroidal/i] },
  // mesothelioma
  { subtype: "peritoneal-mesothelioma", parents: ["mesothelioma"], any: [/peritoneal/i] },
  { subtype: "pleural-mesothelioma", parents: ["mesothelioma"], any: [/pleural|\bMPM\b/i] },
  // multiple myeloma
  { subtype: "myeloma-relapsed-refractory", parents: ["multiple-myeloma"], any: [RELAPSED, /\bRRMM\b/], none: [NEWLY], near: MYELOMA },
  { subtype: "myeloma-transplant-eligible", parents: ["multiple-myeloma"], any: [/transplant[- ]eligible|eligible for (autologous |high[- ]dose |stem cell )*(transplant|ASCT)|\bASCT\b|autologous (stem cell|hematopoietic|haematopoietic)|\bTE[- ]NDMM\b/i], all: [NEWLY], none: [/ineligible|not eligible|non[- ]?eligible|not (a )?candidate|not (intended|planned) for|no intent/i], near: MYELOMA },
  { subtype: "myeloma-transplant-ineligible", parents: ["multiple-myeloma"], any: [/transplant[- ]ineligible|(ineligible|not eligible|not (a )?candidate|non[- ]?eligible|not intended|not planned)[^.]{0,40}transplant|transplant[^.]{0,30}(is not|not) (planned|intended)|non[- ]transplant|\bTIE?[- ]NDMM\b|\bfrail/i], all: [NEWLY], near: MYELOMA },
  { subtype: "plasma-cell-leukaemia", parents: ["multiple-myeloma"], any: [/plasma cell leuk/i] },
  { subtype: "smouldering-myeloma", parents: ["multiple-myeloma"], any: [/smou?ldering|\bSMM\b/i] },
  // myeloproliferative neoplasms
  { subtype: "essential-thrombocythaemia", parents: ["myeloproliferative-neoplasms"], any: [/essential thrombocyth|\bET\b/], none: [/post[- ]?(essential thrombocyth|ET\b)/i] },
  { subtype: "polycythaemia-vera", parents: ["myeloproliferative-neoplasms"], any: [/polycyth(a)?emia|\bPV\b/], none: [/post[- ]?(polycyth(a)?emia|PV\b)/i] },
  { subtype: "primary-myelofibrosis", parents: ["myeloproliferative-neoplasms"], any: [/myelofibrosis|\bPMF\b/i] },
  // neuroendocrine
  { subtype: "extrapulmonary-nec", parents: ["neuroendocrine"], any: [/neuroendocrine carcinoma|extrapulmonary|\bNEC\b|\bGEP-NEC\b/i], none: [/small[- ]cell lung/i] },
  { subtype: "grade-3-net", parents: ["neuroendocrine"], any: [/grade 3 (neuroendocrine|NET|well)|\bNET G3\b|\bG3 NET\b|high[- ]grade well[- ]differentiated/i] },
  { subtype: "lung-net", parents: ["neuroendocrine"], any: [/(?<![a-z])(lung|pulmonary) (neuroendocrine|NET|carcinoid)|bronchial|bronchopulmonary|typical carcinoid|atypical carcinoid/i] },
  { subtype: "pancreatic-net", parents: ["neuroendocrine"], any: [/(?<![a-z])pancreatic (neuroendocrine|NET)|\bpNET\b|\bpanNET\b|islet cell|insulinoma|gastrinoma|gastroenteropancreatic|\bGEP-?NETs?\b/i] },
  { subtype: "small-intestinal-net", parents: ["neuroendocrine"], any: [/small (intestin|bowel)|midgut|ileal|jejun|\bSI-NET\b|gastroenteropancreatic|\bGEP-?NETs?\b/i] },
  // non-Hodgkin lymphoma
  { subtype: "burkitt-lymphoma", parents: ["non-hodgkin-lymphoma"], any: [/Burkitt/i] },
  { subtype: "dlbcl", parents: ["non-hodgkin-lymphoma"], any: [/diffuse large B|\bDLBCL\b/i] },
  { subtype: "follicular-lymphoma", parents: ["non-hodgkin-lymphoma"], any: [/follicular lymphoma/i] },
  { subtype: "hiv-associated-lymphoma", parents: ["non-hodgkin-lymphoma", "dlbcl"], any: [/\bHIV\b|AIDS[- ]related|plasmablastic|primary effusion/i] },
  { subtype: "mantle-cell-lymphoma", parents: ["non-hodgkin-lymphoma"], any: [/mantle cell/i] },
  { subtype: "marginal-zone-lymphoma", parents: ["non-hodgkin-lymphoma"], any: [/marginal zone|\bMALT\b|\bMZL\b/i] },
  { subtype: "peripheral-t-cell-lymphoma", parents: ["non-hodgkin-lymphoma"], any: [/peripheral T-cell|\bPTCL\b|T-cell lymphoma|anaplastic large/i] },
  { subtype: "post-transplant-lymphoproliferative-disorder", parents: ["non-hodgkin-lymphoma", "dlbcl"], any: [/post-?transplant lymphoproliferative|\bPTLD\b/i] },
  { subtype: "primary-cns-lymphoma", parents: ["non-hodgkin-lymphoma", "dlbcl", "brain-tumours"], any: [/primary (CNS|central nervous system) lymphoma|\bPCNSL\b/i] },
  { subtype: "primary-mediastinal-b-cell-lymphoma", parents: ["non-hodgkin-lymphoma", "dlbcl"], any: [/primary mediastinal|\bPMBC?L\b/i] },
  { subtype: "waldenstrom", parents: ["non-hodgkin-lymphoma"], any: [/Waldenstr|lymphoplasmacytic/i] },
  { subtype: "cutaneous-t-cell-lymphoma", parents: ["peripheral-t-cell-lymphoma", "non-hodgkin-lymphoma"], any: [/cutaneous T-cell|\bCTCL\b|mycosis fungoides|S[eé]zary/i] },
  // ovarian
  { subtype: "clear-cell-ovarian-cancer", parents: ["ovarian"], any: [/clear[- ]cell/i, /\bOCCC\b/], near: OVARY },
  { subtype: "granulosa-cell-tumour", parents: ["ovarian"], any: [/granulosa/i] },
  { subtype: "high-grade-serous-ovarian-cancer", parents: ["ovarian"], any: [/high[- ]grade serous|\bHGSOC\b|\bHGSC\b/i] },
  { subtype: "low-grade-serous-ovarian-cancer", parents: ["ovarian"], any: [/low[- ]grade serous|\bLGSOC\b|\bLGSC\b/i] },
  { subtype: "mucinous-ovarian-cancer", parents: ["ovarian"], any: [/(?<!non)(?<!non-)mucinous/i] },
  { subtype: "platinum-resistant-ovarian-cancer", parents: ["ovarian"], any: [/platinum[- ](resistant|refractory)|\bPROC\b/i], none: [/platinum[- ]sensitive/i], near: OVARY },
  { subtype: "platinum-sensitive-ovarian-cancer", parents: ["ovarian"], any: [/platinum[- ]sensitive|\bPSOC\b|\bPSROC\b/i], none: [/platinum[- ](resistant|refractory)/i], near: OVARY },
  // prostate
  { subtype: "prostate-bcr", parents: ["prostate"], any: [/biochemical(ly)?[- ]recurren|rising PSA|PSA (recurrence|relapse|progression after)|\bBCR\b/i], none: [/metastatic(?! ?castration)|\bmCRPC\b|\bmHSPC\b/i] },
  { subtype: "prostate-high-risk", parents: ["prostate"], any: [/(very )?high[- ]risk[^.]{0,40}(locali[sz]ed|prostate)|(locali[sz]ed|non-?metastatic)[^.]{0,40}(very )?high[- ]risk|unfavou?rable intermediate|locally advanced prostate|clinically node[- ]positive/i], none: [/(?<!non[- ])metastatic|castration[- ]resistant|\bCRPC\b|biochemical/i] },
  { subtype: "prostate-intermediate-risk", parents: ["prostate"], any: [/intermediate[- ]risk/i], none: [/(?<!non[- ])metastatic|castration[- ]resistant|\bCRPC\b|unfavou?rable intermediate(?![^.]{0,30}favou?rable)/i] },
  { subtype: "prostate-low-risk", parents: ["prostate"], any: [/\b(very )?low[- ]risk/i, /active surveillance/i], none: [/(?<!non[- ])metastatic|castration[- ]resistant|\bCRPC\b|high[- ]risk/i] },
  { subtype: "prostate-mcrpc", parents: ["prostate"], any: [/\bmCRPC\b/i, /metastatic castrat(e|ion)[- ]resistant/i, /castrat(e|ion)[- ]resistant[^.]{0,40}metastatic/i, /metastatic CRPC/i, /hormone[- ]refractory[^.]{0,20}metastatic|metastatic hormone[- ]refractory/i], none: [/non[- ]?metastatic|\bnmCRPC\b|\bM0\b/i] },
  { subtype: "prostate-mhspc", parents: ["prostate"], any: [/\bmHSPC\b|\bmCSPC\b/i, /metastatic (hormone|castrat(e|ion))[- ](sensitive|na[iï]ve)/i, /(hormone|castrat(e|ion))[- ](sensitive|na[iï]ve)[^.]{0,40}metastatic/i, /de novo metastatic/i], none: [/castrat(e|ion)[- ]resistant|\bCRPC\b/i] },
  { subtype: "prostate-nepc", parents: ["prostate"], any: [/neuroendocrine prostate|small[- ]cell[^.]{0,20}prostate|\bNEPC\b|aggressive[- ]variant/i] },
  { subtype: "prostate-nmcrpc", parents: ["prostate"], any: [/\bnmCRPC\b/i, /non[- ]?metastatic castrat(e|ion)[- ]resistant/i, /M0 CRPC/i, /castrat(e|ion)[- ]resistant[^.]{0,30}non[- ]?metastatic/i] },
  // renal cell carcinoma
  { subtype: "chromophobe-rcc", parents: ["rcc"], any: [/chromophobe/i] },
  { subtype: "clear-cell-rcc", parents: ["rcc"], any: [/clear[- ]cell/i, /\bccRCC\b/], none: [/non[- ]clear/i], near: RENAL },
  { subtype: "papillary-rcc", parents: ["rcc"], any: [/papillary/i, /\bpRCC\b/] },
  // sarcoma
  { subtype: "alveolar-soft-part-sarcoma", parents: ["sarcoma"], any: [/alveolar soft part|\bASPS\b/i] },
  { subtype: "chondrosarcoma", parents: ["sarcoma"], any: [/chondrosarcoma/i] },
  { subtype: "chordoma", parents: ["sarcoma"], any: [/chordoma/i] },
  { subtype: "dermatofibrosarcoma-protuberans", parents: ["sarcoma"], any: [/dermatofibrosarcoma|\bDFSP\b/i] },
  { subtype: "desmoid-tumour", parents: ["sarcoma"], any: [/desmoid|aggressive fibromatosis/i] },
  { subtype: "epithelioid-sarcoma", parents: ["sarcoma"], any: [/epithelioid sarcoma/i] },
  { subtype: "ewing-sarcoma", parents: ["sarcoma"], any: [/Ewing/i] },
  { subtype: "extremity-soft-tissue-sarcoma", parents: ["sarcoma"], any: [/extremit|\blimb\b/i] },
  { subtype: "inflammatory-myofibroblastic-tumour", parents: ["sarcoma"], any: [/inflammatory myofibroblastic|\bIMT\b/i] },
  { subtype: "kaposi-sarcoma", parents: ["sarcoma"], any: [/Kaposi/i] },
  { subtype: "leiomyosarcoma", parents: ["sarcoma"], any: [/leiomyosarcoma|\bLMS\b/i] },
  { subtype: "liposarcoma", parents: ["sarcoma"], any: [/liposarcoma/i] },
  { subtype: "malignant-peripheral-nerve-sheath-tumour", parents: ["sarcoma"], any: [/nerve sheath|\bMPNST\b/i] },
  { subtype: "myxofibrosarcoma", parents: ["sarcoma"], any: [/myxofibrosarcoma/i] },
  { subtype: "osteosarcoma", parents: ["sarcoma"], any: [/osteosarcoma/i] },
  { subtype: "pecoma", parents: ["sarcoma"], any: [/PEComa|perivascular epithelioid/i] },
  { subtype: "retroperitoneal-sarcoma", parents: ["sarcoma"], any: [/retroperitoneal/i] },
  { subtype: "rhabdomyosarcoma", parents: ["sarcoma", "childhood-cancers"], any: [/rhabdomyosarcoma/i] },
  { subtype: "synovial-sarcoma", parents: ["sarcoma"], any: [/synovial sarcoma|SS18/i] },
  { subtype: "tenosynovial-giant-cell-tumour", parents: ["sarcoma"], any: [/tenosynovial|giant cell tumou?r of the tendon|\bPVNS\b|pigmented villonodular|\bTGCT\b/i] },
  { subtype: "undifferentiated-pleomorphic-sarcoma", parents: ["sarcoma"], any: [/undifferentiated pleomorphic|\bUPS\b/] },
  { subtype: "uterine-sarcoma", parents: ["sarcoma", "endometrial"], any: [/uterine (sarcoma|leiomyosarcoma)|endometrial stromal/i] },
  { subtype: "vascular-tumours", parents: ["sarcoma"], any: [/angiosarcoma|h(a)?emangioendothelioma/i] },
  { subtype: "angiosarcoma", parents: ["vascular-tumours", "sarcoma"], any: [/angiosarcoma/i] },
  { subtype: "epithelioid-haemangioendothelioma", parents: ["vascular-tumours", "sarcoma"], any: [/epithelioid h(a)?emangioendothelioma|\bEHE\b/i] },
  // testicular
  { subtype: "non-seminoma", parents: ["testicular"], any: [/non-?seminoma|\bNSGCT\b/i] },
  { subtype: "seminoma", parents: ["testicular"], any: [/(?<!non-)(?<!non )seminoma/i] },
  // thyroid
  { subtype: "anaplastic-thyroid-cancer", parents: ["thyroid"], any: [/anaplastic|\bATC\b/i] },
  { subtype: "follicular-thyroid-cancer", parents: ["thyroid"], any: [/follicular thyroid|H[üu]rthle|oncocytic/i] },
  { subtype: "medullary-thyroid-cancer", parents: ["thyroid"], any: [/medullary|\bMTC\b/i] },
  { subtype: "papillary-thyroid-cancer", parents: ["thyroid"], any: [/papillary/i] },
  // urothelial
  { subtype: "muscle-invasive-bladder-cancer", parents: ["urothelial"], any: [/(?<!non[- ])muscle[- ]invasive|\bMIBC\b|metastatic|unresectable|locally advanced|\badvanced\b|cystectomy/i], none: [/non[- ]?muscle[- ]invasive|\bNMIBC\b|superficial|\bBCG\b|intravesical/i], near: BLADDER },
  { subtype: "non-muscle-invasive-bladder-cancer", parents: ["urothelial"], any: [/non[- ]?muscle[- ]invasive|\bNMIBC\b|\bBCG\b|intravesical|superficial bladder|carcinoma in situ of the bladder/i], none: [/(?<!non[- ])muscle[- ]invasive|metastatic|\badvanced\b/i], near: BLADDER },
];

/** Reviewed false positives, `trial>subtype`, with the reason; a re-run keeps rejecting them. */
export const REJECT = new Map<string, string>([
  ["nct05748171>all-paediatric-high-risk", "high-risk grades the first relapse here; the relapsed page holds it"],
  ["nct05587296>hr-positive-early-high-risk", "elinzanetant for vasomotor symptoms on endocrine therapy; high risk is not the disease state studied"],
  ["nct05320198>mds-lower-risk", "myelofibrosis or MDS with anaemia; the MDS risk group is not stated"],
  ["nct07551362>gastric-her2-positive", "dual-target CLDN18.2/HER2 CAR-NK; patients need either antigen, not HER2 positivity"],
  ["nct07551362>gastric-cldn18-2-positive", "dual-target CLDN18.2/HER2 CAR-NK; patients need either antigen, not CLDN18.2 positivity"],
]);

/** Text the tokens are read from: the registry brief title and the official title (`setting`). */
export function textOf(t: TrialEntity): string {
  return `${t.name} | ${t.setting ?? ""}`;
}

export function matchTrial(t: TrialEntity, rule: Rule): string | undefined {
  if (t.cancers.includes(rule.subtype) || !rule.parents.some((p) => t.cancers.includes(p))) return undefined;
  const text = textOf(t);
  const hit = rule.any.map((re) => firstHit(text, re, rule.near)).find((h) => h !== undefined);
  if (hit === undefined) return undefined;
  if (rule.all && !rule.all.every((re) => re.test(text))) return undefined;
  if (rule.none?.some((re) => re.test(text))) return undefined;
  return hit;
}

/** First occurrence of `re` in `text`; with `near`, the first occurrence that has the cancer named within NEAR characters on either side. */
function firstHit(text: string, re: RegExp, near?: RegExp): string | undefined {
  const g = new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g");
  for (const m of text.matchAll(g)) {
    if (!near) return m[0];
    const at = m.index ?? 0;
    if (near.test(text.slice(Math.max(0, at - NEAR), at + m[0].length + NEAR))) return m[0];
  }
  return undefined;
}

export type PlanOptions = { only?: Set<string>; allTrials?: boolean };

export function plan(opts: PlanOptions = {}): { matches: Match[]; rejected: Array<Match & { reason: string }>; counts: Map<string, number> } {
  const g = graph();
  for (const r of RULES) {
    const s = g.get(r.subtype);
    if (s?.kind !== "cancer") throw new Error(`RULES names ${r.subtype}, which is not a cancer record`);
    for (const p of r.parents) if (g.get(p)?.kind !== "cancer") throw new Error(`RULES for ${r.subtype} names parent ${p}, which is not a cancer record`);
  }
  const trials = (g.kind("trial") as TrialEntity[]).filter((t) => opts.allTrials || t.tags.includes("ctgov-ingest"));
  const matches: Match[] = [];
  const rejected: Array<Match & { reason: string }> = [];
  const counts = new Map<string, number>();
  for (const rule of RULES) {
    if (opts.only && !opts.only.has(rule.subtype)) continue;
    for (const t of trials) {
      const token = matchTrial(t, rule);
      if (!token) continue;
      const reason = REJECT.get(`${t.id}>${rule.subtype}`);
      if (reason) { rejected.push({ trial: t, subtype: rule.subtype, token, reason }); continue; }
      matches.push({ trial: t, subtype: rule.subtype, token });
      counts.set(rule.subtype, (counts.get(rule.subtype) ?? 0) + 1);
    }
  }
  return { matches, rejected, counts };
}

/** The official title around the first appearance of the token, so a reviewer sees the qualifier that fired. */
function window(setting: string, token: string, before = 80, after = 110): string {
  const i = setting.toLowerCase().indexOf(token.toLowerCase());
  if (i < 0) return setting.slice(0, before + after);
  return `${i > before ? "..." : ""}${setting.slice(Math.max(0, i - before), i + after)}${i + after < setting.length ? "..." : ""}`;
}

export function toEdits(matches: Match[]): Edit[] {
  return matches.map((m) => ({ targetId: m.trial.id, targetKind: "trial", targetName: m.trial.name, field: "cancers", add: m.subtype, why: `subtype token "${m.token}"` }));
}

if (process.argv[1]?.endsWith("subtype-trial-links.ts")) {
  const write = process.argv.includes("--apply");
  const quiet = process.argv.includes("--quiet");
  const onlyArg = process.argv.indexOf("--only");
  const only = onlyArg >= 0 ? new Set(process.argv[onlyArg + 1].split(",")) : undefined;
  const { matches, rejected, counts } = plan({ only, allTrials: process.argv.includes("--all-trials") });
  const g = graph();
  if (!quiet) {
    let current = "";
    for (const m of [...matches].sort((a, b) => a.subtype.localeCompare(b.subtype) || a.trial.id.localeCompare(b.trial.id))) {
      if (m.subtype !== current) { current = m.subtype; console.log(`\n## ${current} (${counts.get(current)})`); }
      const t = m.trial;
      console.log(`  ${t.id} [${m.token}] ${t.name.slice(0, 110)} || ${window(t.setting ?? "", m.token)}`);
    }
    for (const r of rejected) console.log(`REJECT ${r.trial.id}>${r.subtype} [${r.token}] ${r.reason}`);
  }
  console.log(`\n${matches.length} matches across ${counts.size} subtypes (${rejected.length} pinned rejections)`);
  const byParent = new Map<string, number>();
  for (const [sub, n] of counts) { const parent = (g.get(sub) as { parent?: string }).parent ?? "?"; byParent.set(parent, (byParent.get(parent) ?? 0) + n); }
  console.log("by subtype: " + [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([k, v]) => `${k} ${v}`).join(", "));
  console.log("by parent:  " + [...byParent.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([k, v]) => `${k} ${v}`).join(", "));
  const noMatch = RULES.filter((r) => !only || only.has(r.subtype)).filter((r) => !counts.has(r.subtype)).map((r) => r.subtype);
  console.log(`no match: ${noMatch.length} subtypes (${noMatch.join(", ")})`);
  if (write || process.argv.includes("--plan")) {
    const { changed, skipped } = applyEdits(toEdits(matches), write);
    if (write) for (const c of changed) console.log("EDIT  " + c);
    for (const s of skipped) console.log("SKIP  " + s);
    console.log(`${changed.length} ${write ? "applied" : "applicable"}, ${skipped.length} skipped`);
  }
}

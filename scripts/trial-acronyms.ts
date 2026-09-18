/**
 * Trial acronyms for registry records.
 *
 * The ClinicalTrials.gov ingestion (src/data/pipeline-trials-wave*.ts, tag `ctgov-ingest`) names each trial by its
 * registry title, so a search for the acronym patients hear (MARIPOSA-2, KEYNOTE-671, CheckMate 9LA, ADAURA,
 * DESTINY-Lung02) finds nothing. This script derives the acronym for every registry trial whose `aka` lacks one:
 *
 *   1. from the brief title (`name`) or official title (`setting`) when the acronym is written there
 *        - the record id spelled in the title when the ingestion named the record by its acronym ("taishan-301")
 *        - a bracketed token: "... Nasopharyngeal Carcinoma (TAISHAN-301)"
 *        - a leading "Study Name:" segment: "Symbiotic-GI-03: A Study to Learn About ..."
 *        - an all-caps or CamelCaps word with a dash-number: "KEYNOTE-671", "IMpower010", "TROPION-Lung08"
 *   2. otherwise from `protocolSection.identificationModule.acronym` on the CT.gov v2 API, 300 ms apart, at most
 *      MAX requests per run (default 600), phase 3 trials first; every answer (including "no acronym") is cached in
 *      /tmp/ctgov-cache/acronyms.json so re-runs continue where the previous run stopped.
 *
 * Every candidate passes one filter (`reject`): it must look like a study name (two capitals or a dash-number, 3-30
 * characters, at most three words) and must not be a drug code (AZD9291, PF-08634404, SHR-A1811; prefixes are learned
 * from the drug records plus DRUG_PREFIXES), a regimen (DPd, R-CHP), a gene or biomarker (from the target records plus
 * GENES), a bare organisation (from the company and institution records plus ORGS), a phase, a generic word (STOP,
 * GENERIC_WORDS), or an abbreviation spelled from the words before its bracket ("Low-Grade Serous Ovarian Cancer
 * (LGSOC)"). Rejections are printed with the reason; extend the lists rather than hand-editing the output when the
 * plan shows a false positive.
 *
 * The acronym is appended to the record's `aka` through the editor in scripts/orphan-links.ts; `name` is never touched
 * and existing aliases are preserved. Records whose `aka` already carries an acronym-shaped alias are skipped, so the
 * script is idempotent.
 *
 *   npx tsx scripts/trial-acronyms.ts --plan                 list every planned alias with its source and every rejection
 *   npx tsx scripts/trial-acronyms.ts --plan --no-fetch      titles and cache only, no network
 *   npx tsx scripts/trial-acronyms.ts --apply                write the aliases into the records
 *   npx tsx scripts/trial-acronyms.ts --apply --max=200      cap this run's CT.gov requests
 *   npx tsx scripts/trial-acronyms.ts --plan --quiet         counts only
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { graph } from "../src/lib/graph";
import type { Entity } from "../src/lib/schema";
import { applyEdits } from "./orphan-links";

type TrialEntity = Extract<Entity, { kind: "trial" }>;
type Edit = { targetId: string; targetKind: string; targetName: string; field: string; add: string; why: string };
export type Source = "title:id" | "title:brackets" | "title:leading" | "title:token" | "ctgov:acronym";
export type Candidate = { trial: TrialEntity; acronym: string; source: Source };
export type Rejection = { trial: TrialEntity; candidate: string; source: Source; reason: string };

const CACHE_DIR = process.argv.find((a) => a.startsWith("--cache="))?.slice(8) ?? "/tmp/ctgov-cache";
const CACHE = join(CACHE_DIR, "acronyms.json");
const STUDIES = join(CACHE_DIR, "studies.json");
const PAUSE_MS = 300;
const API = "https://clinicaltrials.gov/api/v2/studies";
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const norm = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]/g, "");

/** Whole-candidate stop list: endpoints, disease abbreviations, phases, modalities, regions and study-design terms that titles bracket or capitalise. */
const STOP = new Set([
  "STUDY", "TRIAL", "PHASE", "PART", "ARM", "COHORT", "STAGE", "GROUP", "GRADE", "LINE", "CYCLE", "DAY", "WEEK", "MONTH", "YEAR", "TYPE", "STEP", "VERSION", "PROTOCOL",
  "PILOT", "EXTENSION", "SUBSTUDY", "SUB-STUDY", "ROLLOVER", "FOLLOW-UP", "REGISTRY", "PLATFORM", "UMBRELLA", "BASKET", "MASTER", "SCREENING", "OBSERVATIONAL", "RANDOMIZED", "RANDOMISED",
  "OPEN-LABEL", "DOUBLE-BLIND", "PLACEBO", "CONTROLLED", "MULTICENTER", "MULTICENTRE", "INTERNATIONAL", "GLOBAL", "PIVOTAL", "CONFIRMATORY", "EXPLORATORY", "ADAPTIVE", "PROSPECTIVE",
  "RCT", "ITT", "IIT", "IST", "PP", "SAP", "CRF", "ECRF", "EPRO", "PRO", "PROS", "QOL", "HRQOL", "AE", "AES", "SAE", "TEAE", "DLT", "MTD", "RP2D", "OBD", "PK", "PD", "ADA", "TK",
  "OS", "PFS", "DFS", "EFS", "MFS", "RFS", "IDFS", "DDFS", "BCFS", "TTP", "ORR", "DOR", "DCR", "CBR", "PCR", "MPR", "CR", "PR", "SD", "MRD", "CTDNA", "TTD", "PFS2", "TFI", "TWIST",
  "NSCLC", "SCLC", "ES-SCLC", "LS-SCLC", "TNBC", "HCC", "RCC", "CRC", "MCRC", "CRPC", "MCRPC", "HSPC", "MHSPC", "NMCRPC", "HNSCC", "SCCHN", "GEJ", "GOJ", "BTC", "PDAC", "UC", "MUC", "MIBC", "NMIBC", "UTUC",
  "AML", "ALL", "CLL", "SLL", "MDS", "MPN", "MM", "RRMM", "NDMM", "SMM", "DLBCL", "FL", "MCL", "MZL", "PTCL", "CTCL", "HL", "CHL", "NHL", "LBCL", "PCNSL", "PMBCL", "WM", "LPL", "CML", "CMML", "MF", "PV", "ET",
  "GBM", "DIPG", "NPC", "ESCC", "EAC", "GC", "GIST", "NET", "NETS", "NEN", "NENS", "NEC", "MPM", "MTC", "DTC", "ATC", "ACC", "PTC", "OC", "EOC", "PSOC", "PROC", "HGSOC", "LGSOC", "EC", "CC", "CIN", "VIN", "GTN",
  "BC", "MBC", "EBC", "ABC", "HR+", "HER2+", "HER2-", "HER2LOW", "MEL", "CSCC", "BCC", "BCCS", "MCC", "STS", "GCT", "TGCT", "NBL", "RMS", "EWS", "OSA", "ATRT", "LGG", "HGG", "DMG", "MB", "EPN", "MPNST", "PPGL", "PRCC",
  "CUP", "CNS", "GI", "GU", "GYN", "HEENT", "ENT", "ADC", "ADCS", "CAR-T", "CART", "CAR", "TCR", "TIL", "TILS", "NK", "BITE", "MAB", "TKI", "TKIS", "IO", "ICI", "ICIS", "CPI", "PARPI", "CDK4/6I", "BTKI",
  "SBRT", "SABR", "IMRT", "VMAT", "SRS", "SRT", "WBRT", "PCI", "RT", "CRT", "CCRT", "TRT", "PBT", "EBRT", "HDR", "LDR", "BT", "IORT", "HIPEC", "PIPAC", "TACE", "TARE", "SIRT", "RFA", "MWA", "HIFU", "IRE", "TURBT", "TAE",
  "MRI", "PET", "CT", "PET/CT", "PET-CT", "FDG", "PSMA-PET", "SPECT", "EUS", "ERCP", "IHC", "US", "USA", "EU", "UK", "NHS", "IV", "SC", "PO", "IM", "IT", "IP", "BID", "QD", "QW", "Q2W", "Q3W", "Q4W", "Q6W",
  "SOC", "TPC", "BSC", "BAT", "CHEMO", "CTX", "HSCT", "ASCT", "AHCT", "ALLO", "AUTO", "HCT", "SCT", "BMT", "DLI", "GVHD", "CRS", "ICANS", "TLS", "VOD", "MDT", "AI", "ML", "NGS", "WGS", "WES", "NACT", "CIPN",
  "RECIST", "IRECIST", "MRECIST", "RANO", "IRANO", "IMWG", "IWG", "IWCLL", "PCWG3", "ELN", "IPSS", "IPSS-R", "ISS", "R-ISS", "CTCAE", "PRO-CTCAE", "ECOG", "KPS", "IIEF", "IIEF-5", "IPSS-M",
  "EORTC", "QLQ", "QLQ-C30", "FACT-G", "FACT", "EQ-5D", "SF-36", "HADS", "MDASI", "ESAS", "BPI", "NRS", "VAS", "PHQ-9", "GAD-7", "MMSE", "MOCA", "PGIC", "PGIS",
  "COVID", "COVID-19", "SARS-COV-2", "HIV", "HBV", "HCV", "HPV", "EBV", "CMV", "HHV", "HP", "BMI", "BSA", "GFR", "EGFR-TKI", "TKI-NAIVE", "WT", "MUT", "POS", "NEG",
  "MSI", "MSI-H", "MSS", "DMMR", "PMMR", "TMB", "TMB-H", "HRD", "HRR", "HRRM", "BRCAM", "BRCAWT", "GBRCA", "TBRCA", "CPS", "TPS", "TC", "IC", "TAP", "PDL1", "PD-L1", "PD1", "PD-1",
  "USP", "NCT", "EUDRACT", "EUCT", "IND", "NDA", "BLA", "FDA", "EMA", "MHRA", "PMDA", "NMPA", "TGA", "ANVISA", "IRB", "IEC", "GCP", "ICH", "WHO", "AJCC", "UICC", "FIGO", "TNM", "ISUP", "WHO/ISUP",
  "DXD", "T-DXD", "DATO-DXD", "T-DM1", "SG", "EV", "PEG", "PEGYLATED", "ARV", "ARSI", "ARPI", "ADT", "ADT+", "LHRH", "GNRH", "AIS", "SERD", "SERDS", "SERM", "CDK4/6", "MRNA", "SIRNA", "CFDNA",
  "MOA", "MOAB", "IGG", "IGG1", "IGG4", "FC", "FAB", "SCFV", "VHH", "TME", "DC", "DCS", "APC", "TREG", "MDSC", "TAM", "CAF", "ECM", "EMT", "CSC", "CTC", "CTCS",
  "MAGE-A4", "MAGE", "NY-ESO-1", "PRAME", "WT1", "AFP", "CEA", "CA-125", "CA125", "CA19-9", "PSA", "LDH", "CRP", "IL-6", "HBA1C",
  "BREAST", "LUNG", "PROSTATE", "COLON", "RECTAL", "GASTRIC", "LIVER", "KIDNEY", "BLADDER", "OVARIAN", "CERVICAL", "PANCREATIC", "BRAIN", "SKIN", "BLOOD", "BONE", "HEAD", "NECK",
  "PANTUMOR", "PANTUMOUR", "TLBL", "TLL", "CML-AP", "CML-CP",
  "CANCER", "CARCINOMA", "TUMOR", "TUMOUR", "TUMORS", "TUMOURS", "SOLID", "ADVANCED", "METASTATIC", "RECURRENT", "REFRACTORY", "RELAPSED", "RESECTABLE", "UNRESECTABLE", "LOCALIZED", "LOCALISED",
  "ADJUVANT", "NEOADJUVANT", "PERIOPERATIVE", "MAINTENANCE", "INDUCTION", "CONSOLIDATION", "SALVAGE", "FIRST-LINE", "SECOND-LINE", "FRONTLINE", "FIRST", "SECOND", "THIRD", "NEW", "NOVEL", "VERSUS", "VS", "VS.",
  "AND", "OR", "THE", "OF", "IN", "WITH", "FOR", "TO", "A", "AN", "ON", "AT", "BY", "PLUS", "ALONE", "COMBINED", "COMBINATION", "MONOTHERAPY", "THERAPY", "TREATMENT", "PATIENTS", "PARTICIPANTS", "SUBJECTS",
  "CHINA", "JAPAN", "KOREA", "TAIWAN", "INDIA", "EUROPE", "AMERICA", "ASIA", "ASIAN", "CHINESE", "JAPANESE", "KOREAN", "GERMANY", "FRANCE", "ITALY", "SPAIN", "CANADA", "AUSTRALIA", "BRAZIL",
]);

/** Words that make a phrase a description rather than a name; every word of a candidate is checked. */
const GENERIC_WORDS = new Set([
  "STUDY", "TRIAL", "SUBSTUDY", "SUB", "PHASE", "STAGE", "COHORT", "PART", "ARM", "GROUP", "STEP", "VERSION", "PROTOCOL", "TYPE", "TITLE", "OFFICIAL", "FORMERLY", "PREVIOUSLY", "PROPOSED", "SELECTED", "EXCLUDING", "INCLUDING",
  "ANTI", "NON", "PRE", "POST", "PERI", "NEO", "THE", "AND", "OR", "TO", "OF", "IN", "WITH", "FOR", "VS", "VERSUS", "PLUS", "ALONE", "ONLY", "OTHER", "SINGLE", "DUAL", "SLOW", "EARLY", "LATE", "HIGH", "LOW", "RISK", "BOUND", "ORAL",
  "CANCER", "CANCERS", "CARCINOMA", "TUMOR", "TUMOUR", "TUMORS", "TUMOURS", "LYMPHOMA", "LEUKEMIA", "LEUKAEMIA", "MYELOMA", "SARCOMA", "MELANOMA", "GLIOMA", "NEOPLASM", "NEOPLASMS", "LESIONS", "METASTASES", "DISEASE",
  "CELL", "CELLS", "LYMPHOCYTES", "INHIBITOR", "INHIBITORS", "ANTAGONIST", "AGONIST", "SUPERAGONIST", "ANTIBODY", "ANTIBODIES", "INJECTION", "TABLETS", "CAPSULES", "INFUSION", "VACCINE", "THERAPY", "TREATMENT", "REGIMEN", "CHEMOTHERAPY", "RADIOTHERAPY", "IMMUNOTHERAPY",
  "PATIENTS", "PARTICIPANTS", "SUBJECTS", "ADULTS", "CHILDREN", "ADJUVANT", "NEOADJUVANT", "CONSOLIDATION", "INDUCTION", "SALVAGE", "RESECTABLE", "UNRESECTABLE", "ADVANCED", "METASTATIC", "RECURRENT", "REFRACTORY", "RELAPSED",
  "TAL", "TEC", "LBL", "LL", "PACC", "PVEK",
  "CHILD", "PUGH", "GLEASON", "KARNOFSKY", "PIVOTAL", "RAT", "POLYMORPHA", "HANSENULA", "VERO", "MASTER", "PILOT", "REGISTRY", "PLATFORM", "UMBRELLA", "BASKET", "WINDOW", "OPPORTUNITY", "BELIEVE", "WIDER",
  "CHOP", "CHP", "CHOEP", "GDP", "GEMOX", "DHAP", "ICE", "ESHAP", "EPOCH", "BEACOPP", "ABVD", "FOLFOX", "FOLFIRI", "FOLFOXIRI", "FOLFIRINOX", "FLOT", "XELOX", "CAPOX", "CAPEOX", "SOX", "XELIRI", "GEMCIS", "GEMCARBO", "TPF", "TCHP", "CMF", "BEP", "VIP", "TIP", "VAC", "VDC", "CVP", "VRD", "KRD", "DRD", "DVD", "DPD", "DKD", "EPD", "PVD", "BRD", "IRD", "KPD", "ERD", "RVD", "VMP", "VTD", "DEX",
  "BNCT", "CRISPR", "CAS9", "FAPI", "DXD", "CART", "TCR", "TIL", "MMAE", "CCNU", "TMZ", "BEV", "MIRV", "INO", "BCG", "FIH", "FIM", "FPI", "SMM", "NOS", "MRD", "EOC", "HSIL", "LSIL",
]);

/** Compound and product names that titles bracket like acronyms; extend from the plan output. */
const NOT_TRIALS = new Set([
  "AA-P", "AB-BNCT", "TAL-D", "TAL-DP", "TAL-P", "TEC-DR", "MEZIKD", "MEZIVD", "B-PD", "B-VD", "R-CHP", "R-GDP", "R-GEMOX", "ODRO-CHOP", "GEMABRAXNE", "HYD-SULFATE", "R-DXD", "I-DXD", "RINA-S", "EMI-LE", "DELTEX", "OSTEODEX", "NANO2", "DECOY20", "MDNA11", "IGPRO20",
  "NECVAX-NEO1", "GEO-CM04S1", "ADAPT-001", "ATTR-01", "IMNN-001", "BOLD-100", "RIMO-301", "RAPA-201", "TORL-5", "SMART101", "SNIPR001", "ELCIN", "LIDU", "EGRF", "ICB", "WOO", "PD1-IL2M", "TRANSCON", "STEAP2", "PIWIL1", "LILRB2", "METTL3", "NCAM1", "ALPK1", "CLDN",
  "EB-DTKN-401", "EB-DUALNK", "EB-HC01", "SONOCLOUD-9", "TAL-DR", "TAL-TEC", "TEC-D", "D-VD",
]);

/** Gene, target, virus and biomarker symbols; each word of a candidate is checked. Target records add to this list. */
const GENES = new Set([
  "EGFR", "ALK", "ROS1", "KRAS", "NRAS", "HRAS", "BRAF", "HER2", "HER3", "HER", "ERBB2", "ERBB3", "MET", "CMET", "C-MET", "RET", "NTRK", "NTRK1", "NTRK2", "NTRK3", "TRK", "FGFR", "FGFR1", "FGFR2", "FGFR3", "FGFR4",
  "IDH1", "IDH2", "FLT3", "NPM1", "KMT2A", "TP53", "PIK3CA", "AKT", "AKT1", "PTEN", "ESR1", "AR", "AR-V7", "CDK4", "CDK6", "CDK2", "CDK7", "TROP2", "TROP-2", "TROP", "CLDN18", "CLDN18.2", "CLDN6", "CLDN", "DLL3", "B7-H3", "B7H3", "B7-H4",
  "CEACAM5", "CEACAM", "NECTIN4", "NECTIN-4", "NECTIN", "TIGIT", "LAG3", "LAG-3", "LAG", "TIM3", "TIM-3", "VEGF", "VEGFR", "VEGFR2", "VEGFA", "CD20", "CD19", "CD38", "CD3", "CD33", "CD123", "CD30", "CD22", "CD79B", "CD70", "CD47", "CD73", "CD40", "CD137", "CD28",
  "BCMA", "GPRC5D", "FCRH5", "PSMA", "SSTR", "SSTR2", "SSTRS", "FAP", "GD2", "MSLN", "MUC16", "MUC1", "FOLR1", "FRA", "FR-ALPHA", "STEAP1", "STEAP2", "STEAP", "PSCA", "HLA", "HLA-A2", "CTLA4", "CTLA-4", "OX40", "GITR", "ICOS", "NKG2A",
  "STK11", "KEAP1", "SMARCA4", "ARID1A", "CCNE1", "MTAP", "PRMT5", "MDM2", "XPO1", "PARP", "PARP1", "ATR", "ATM", "WEE1", "PLK1", "AURKA", "HDAC", "EZH2", "EZH", "DNMT", "TERT", "RB1", "MYC", "MYCN", "BCL2", "BCL-2", "BCL6", "MCL1", "MCL-1",
  "MEK", "MEK1", "ERK", "PI3K", "MTOR", "JAK", "JAK1", "JAK2", "BTK", "SYK", "PKC", "IL-2", "IL2", "IL-15", "IL15", "IL-12", "IL12", "IL-6", "TGF", "TGF-BETA", "TGFB", "TNF", "GM-CSF", "G-CSF", "HGF", "IGF-1R", "IGF1R", "HIF", "HIF-2", "HIF2A",
  "BRCA", "BRCA1", "BRCA2", "PALB2", "RAD51C", "RAD51D", "CHEK2", "MLH1", "MSH2", "MSH6", "PMS2", "POLE", "G12C", "G12D", "G12V", "V600E", "V600", "T790M", "C797S", "L858R", "EX19DEL", "EXON19", "EXON20", "EXON14", "EX20INS",
  "UGT1A1", "DPYD", "KIT", "PDGFRA", "PDGFRB", "SDH", "MITF", "NF1", "NF2", "TSC1", "TSC2", "VHL", "FH", "MENIN", "KMT2A-R", "MLL", "MLL-R", "CBL", "SF3B1", "U2AF1", "SRSF2", "ASXL1", "RUNX1", "CEBPA", "DNMT3A", "TET2",
  "EPCAM", "EPHA2", "AXL", "LRRC15", "ROR1", "ROR2", "SEZ6", "LIV-1", "TF", "TFRC", "CDH6", "CDH17", "ITGB6", "PTK7", "SLC34A2", "NAPI2B", "GCC", "GUCY2C", "LY6E", "ALPP", "ALPPL2", "5T4", "TPBG", "ENPP3", "CD74", "CD37", "CD25", "CD7", "CD5",
  "IDO1", "IDO", "TDO", "A2AR", "CD39", "PVRIG", "PSGL-1", "SIRPA", "SIRPALPHA", "CD24", "CD276", "IL13RA2", "EGFRVIII", "GP100", "MART-1", "TYRP1", "MELAN-A", "SOX2", "SOX10", "LIN28B", "NCAM1", "ALPK1", "LILRB2", "METTL3", "PIWIL1", "CAIX", "CA9", "CSPG4", "MAGE", "MAGE-A4",
  "HPV", "EBV", "HBV", "HCV", "HIV", "CMV", "PD1", "PDL1", "PD-L1", "PD-1", "EGRF", "FAK", "MAT2A", "EPHRINB2", "WRN", "POLQ", "POLQI", "WRNI", "BTKI",
]);

/** Cooperative groups, agencies and other organisations; a bare match rejects, but "NRG-GY018" or "PRODIGE 89" pass. Company and institution records add to this list. */
const ORGS = new Set([
  "NCI", "NIH", "NRG", "SWOG", "ECOG", "ECOG-ACRIN", "ACRIN", "COG", "CCTG", "NCIC", "EORTC", "GOG", "GBG", "ABCSG", "JCOG", "WJOG", "KCSG", "TROG", "AGITG", "ANZUP", "ANZGOG", "UNICANCER", "GERCOR", "PRODIGE", "FFCD", "AIO", "GEICAM", "SOLTI",
  "NSABP", "RTOG", "ALLIANCE", "CALGB", "ACOSOG", "HOVON", "GIMEMA", "GHSG", "LYSA", "GELA", "CRUK", "MRC", "NIHR", "ASCO", "ESMO", "AACR", "ASH", "EHA", "ASTRO", "ESTRO", "SITC", "ENGOT", "GCIG", "AGO", "AGO-OVAR", "NSGO", "MITO", "MANGO", "BGOG", "GINECO",
  "CTONG", "CSCO", "CSWOG", "CACA", "JSMO", "JGOG", "KGOG", "TGOG", "HECOG", "SAKK", "IFCT", "GFPC", "GOIRC", "GOIM", "GIM", "ITMO", "IBCSG", "BIG", "TRIO", "PBTC", "SIOP", "SIOPE", "SIOPEN", "CIBMTR", "EBMT", "BMT-CTN", "CTN",
  "UKCRC", "NCRI", "CTU", "ICR", "ICR-CTSU", "CTSU", "MSKCC", "MSK", "MDACC", "DFCI", "DF/HCC", "MGH", "BWH", "UCSF", "UCLA", "UCSD", "UNC", "UPENN", "OSU", "MCW", "NYU", "JHU", "UW", "UM", "UMICH", "MAYO", "CCF", "CHOP", "SJCRH", "COH",
  "NCCN", "NCC", "NCCH", "SYSUCC", "CAMS", "PUMCH", "PKU", "PKUCH", "FUSCC", "SJTU", "ZJU", "HUST", "TJMUCH", "HMU", "CMU", "SCH", "CHCAMS", "AMC", "SNUH", "SMC", "YUHS", "NTUH", "CGMH", "NCKUH",
  "ISCIII", "GEMCAD", "TTD", "GECP", "SEOM", "SOGUG", "GEINO", "GETNE", "GOTEL", "PETHEMA", "GELTAMO", "CIBERONC", "VHIO", "IGTP", "IOB", "HUVH", "HUVR", "ICO", "CNIO", "INCLIVA", "FJD", "HULP", "H12O", "HCB", "HUCA",
  "JANSSEN", "PFIZER", "ROCHE", "GENENTECH", "MERCK", "MSD", "BMS", "AZ", "ASTRAZENECA", "NOVARTIS", "LILLY", "AMGEN", "GILEAD", "ABBVIE", "BAYER", "BEIGENE", "HENGRUI", "TAKEDA", "DAIICHI", "SEAGEN", "REGENERON", "SANOFI", "GSK", "BOEHRINGER", "BI", "ONO", "EISAI", "ASTELLAS", "OTSUKA", "SUMITOMO", "KYOWA", "CHUGAI",
]);

/** Letter prefixes of investigational codes with four or more letters and a vowel, which the shape rules alone would let through ("ABBV-400", "LOXO-292"). Drug records add to this list. */
const DRUG_PREFIXES = new Set([
  "ABBV", "MEDI", "IMGN", "ASKB", "ASKC", "ASKG", "ASCA", "ASTX", "HMPL", "MRTX", "SSGJ", "JSKN", "REGN", "ADCT", "ARRY", "INCB", "LOXO", "STRO", "AGEN", "INCMGA", "MORAB", "TAVO", "ORIC", "ELVN", "IDRX", "ALXN", "NKTR", "SNDX", "RXDX", "ENMD", "ALRN", "ATRC",
  "MGCD", "LNCB", "JMKX", "VERT", "TPST", "ZKAB", "MCLA", "ABSK", "AVID", "BEBT", "CMAB", "CPGJ", "HTMC", "NBTXR", "ORIN", "SYHA", "JCAR", "JWCAR", "GTAEXS", "ILKN", "IMNN", "BOLD", "RIMO", "RAPA", "TORL", "ADAPT", "ATTR", "AVZO", "SMART", "SNIPR", "DECOY", "MDNA", "NANO", "IGPRO", "SIBP", "ADCE",
]);

/** Everything the graph knows as a drug, gene, or organisation, normalised, plus learned drug-code prefixes. */
export function vocab() {
  const g = graph();
  const drugs = new Set<string>(), genes = new Set<string>(GENES), orgs = new Set<string>(ORGS), prefixes = new Set<string>(DRUG_PREFIXES);
  const learn = (s: string) => { const m = /^([A-Za-z]{2,6})[- ]?[A-Za-z]?\d/.exec(s.trim()); if (m) prefixes.add(m[1].toUpperCase()); };
  for (const d of g.kind("drug")) {
    if (d.kind !== "drug") continue;
    for (const s of [d.id, d.name, d.code, d.brand, ...d.aka]) if (s) { drugs.add(norm(s)); learn(s); }
  }
  for (const t of g.kind("target")) { if (t.kind !== "target") continue; for (const s of [t.name, t.symbol, ...t.aka]) if (s) genes.add(s.toUpperCase()); }
  for (const k of ["company", "institution"] as const) for (const c of g.kind(k)) for (const s of [c.name, ...c.aka]) orgs.add(s.toUpperCase());
  // Names and aliases already in the corpus outside the registry ingestion: an acronym that another record claims
  // (the curated VISION trial, a drug brand) is skipped so a search for it keeps one answer.
  const claimed = new Map<string, string>();
  for (const e of g.entities) if (!e.tags.includes("ctgov-ingest")) for (const s of [e.name, ...e.aka]) if (!claimed.has(norm(s))) claimed.set(norm(s), e.id);
  return { drugs, genes, orgs, prefixes, claimed };
}
type Vocab = ReturnType<typeof vocab>;

const upper = (s: string) => (s.match(/[A-Z]/g) ?? []).length;
const hasVowel = (s: string) => /[AEIOUY]/i.test(s);
const digitRuns = (s: string) => s.match(/\d+/g) ?? [];

/** An investigational compound code: a short letter prefix and a run of digits (AZD9291, PF-08634404, SHR-A1811, BL-B01D1, MEDI4736, DS-8201a, MK-3475A-F84). */
function codeShape(s: string, prefixes: Set<string>, strict = true): boolean {
  const compact = s.replace(/\s+/g, "");
  if (digitRuns(compact).some((d) => d.length >= 4)) return true;
  // letters, optional dash, optional single letter before the digits (SHR-A1811, BL-B01D1), digits, anything
  const m = /^([A-Za-z]+)(-?)([A-Za-z]?)(\d+)([A-Za-z0-9-]*)$/.exec(compact);
  if (m) {
    const [, letters, dash, midLetter, digits] = m;
    if (prefixes.has(letters.toUpperCase())) return true;
    if (letters.length <= 3) return true;
    if (digits.length >= 4) return true;
    if (!hasVowel(letters)) return true;
    if (dash && midLetter && letters.length <= 3) return true;
  }
  // ASCA101, JCAR017, GTAEXS617: capitals straight into three digits with no separator is a compound, not a study name
  // (title tokens only; the registry's own acronym field says INAVO120 is a study)
  if (strict && !/[\s-]/.test(s) && /^[A-Z]{4,6}\d{3}[A-Za-z0-9]*$/.test(compact)) return true;
  if (/(^|[^A-Za-z])CAR-?T?\d/i.test(compact) || /[A-Z]x[A-Z0-9]|[a-z]x[A-Z][A-Z0-9]/.test(compact)) return true;
  return false;
}

/** Is the token spelled from the words just before its bracket ("Low-Grade Serous Ovarian Cancer (LGSOC)", "monomethyl auristatin E (MMAE)", "Claudin (CLDN)")? */
export function abbreviates(token: string, before: string): boolean {
  let letters = token.replace(/[^A-Za-z]/g, "");
  if (/[a-z]s$/.test(letters) && letters.length > 3) letters = letters.slice(0, -1);
  if (letters.length < 2) return false;
  const words = before.split(/[\s\-–—/,;:()]+/).filter((w) => /[A-Za-z]/.test(w)).map((w) => w.toLowerCase());
  const small = new Set(["of", "and", "the", "in", "with", "for", "or", "a", "an", "to", "plus", "versus", "vs", "by", "on", "at"]);
  const L = letters.toLowerCase();
  const n = words.length;
  const fits = (li: number, wi: number, ci: number): boolean => {
    if (li === L.length) return wi === n - 1;
    if (wi >= n) return false;
    const at = words[wi].indexOf(L[li], ci);
    if (at >= 0 && fits(li + 1, wi, at + 1)) return true;
    let next = wi + 1;
    while (next < n && small.has(words[next])) next++;
    if (next < n && words[next][0] === L[li] && fits(li + 1, next, 1)) return true;
    return false;
  };
  for (let start = Math.max(0, n - 8); start < n; start++) if (words[start][0] === L[0] && fits(1, start, 1)) return true;
  return false;
}

const NUMBERISH = /^[A-Za-z]{0,10}-?\d{1,3}[A-Za-z]{0,2}$/;
/** A word that could carry a study name on its own: "ROSETTA", "CodeBreaK", "Morpheus"; not "LR", "China", "Substudy". */
const strong = (w: string) => w.length >= 4 && hasVowel(w) && (upper(w) >= 2 || w.length >= 6) && !STOP.has(w.toUpperCase()) && !GENERIC_WORDS.has(w.toUpperCase());
const clean = (raw: string) => raw.replace(/[™®©]/g, " ").replace(/\s+-/g, "-").replace(/-\s+/g, "-").trim().replace(/\s+/g, " ").replace(/^the\s+/i, "").replace(/\s+(study|trial)$/i, "").replace(/[.]$/, "");

/**
 * Returns a reason when the candidate is not a trial acronym; undefined when it passes. `strict` is for title-derived
 * candidates (each further word must be a number, a short capital group, or CamelCaps); registry acronyms are looser.
 * `before` is the title text preceding a bracketed candidate, for the abbreviation test.
 */
export function reject(raw: string, v: Vocab, trial?: TrialEntity, strict = true, before = ""): string | undefined {
  const s = clean(raw);
  if (s.length < 3 || s.length > 30) return "length";
  if (/[:;,/\\|"'`“”‘’]/.test(s)) return "punctuation";
  if (!/^[A-Za-z0-9][A-Za-z0-9 .+&-]*$/.test(s)) return "characters";
  const parts = s.split(" ");
  const words = s.split(/[- .]+/).filter(Boolean);
  if (parts.length > 3 || words.length > 4) return "too many words";
  // registry acronyms may start lower-case (eVOLVE-Lung02, iMMagine-3) or be one capitalised coined word (Astefania, Celestimo)
  if (!/^[A-Z]/.test(s) && (strict || upper(s) < 3)) return "lower-case start";
  if (upper(s) < 2 && !/\d/.test(s) && (strict || !/^[A-Z][a-z]{5,}$/.test(s))) return "no capitals";
  const U = s.toUpperCase();
  const N = norm(s);
  if (STOP.has(U) || STOP.has(N) || NOT_TRIALS.has(U) || GENERIC_WORDS.has(U)) return "generic";
  if (/^(PHASE|PH)\s*[0-9IVX]+[AB]?$/i.test(s) || /^[IVX]+[AB]?$/.test(s)) return "phase";
  if (/^NCT\d+/i.test(s)) return "registry id";
  if (v.orgs.has(U)) return "organisation";
  if (v.genes.has(U) || v.genes.has(N)) return "gene";
  if (/^[A-Za-z]{1,3}$/.test(s)) return "abbreviation";
  const lettersOnly = s.replace(/[^A-Za-z]/g, "");
  if (words.every((w) => w.length <= 3) && /^[A-Za-z]{3,6}$/.test(lettersOnly) && upper(lettersOnly) >= 2 && (/d$/.test(lettersOnly) || /dex$/i.test(lettersOnly))) return "regimen";
  if (/DXd$/.test(s) || /^(Ig|Anti|Non|Sub)[A-Z-]/.test(s)) return "compound";
  if (/\d(st|nd|rd|th)$/i.test(s)) return "ordinal";
  if (/[a-z]TM$/.test(s)) return "trademark";
  if (words.length === 2 && STOP.has(words[0].toUpperCase()) && NUMBERISH.test(words[1]) && /^\d/.test(words[1])) return `generic (${words[0]})`;
  // a gene beside a coined word is a name ("KLK2-comPAS", "REVEAL-ND NPM1"); a gene beside a mutation or a class is not ("KRAS G12C", "EGFR-TKI")
  const hasStrongNonGene = words.some((w) => strong(w) && !v.genes.has(w.toUpperCase()));
  for (const w of words) {
    const W = w.toUpperCase();
    if (GENERIC_WORDS.has(W)) return `generic (${w})`;
    if (v.genes.has(W) && !hasStrongNonGene) return `gene (${w})`;
    if (/^(G1[23][A-Z]|V600[EK]?|T790M|C797S|L858R|EX(ON)?\d+(DEL|INS)?)$/i.test(W)) return `mutation (${w})`;
    for (const g of ["BRAF", "KRAS", "NRAS", "EGFR", "PIK3CA", "HER2", "ERBB2", "IDH1", "IDH2", "FGFR", "ALK", "ROS1", "MET", "RET", "KIT", "BRCA"]) if (W !== g && W.startsWith(g) && /^([A-Z]?\d|MUT|M$|POS|NEG|WT$)/i.test(W.slice(g.length))) return `mutation (${w})`;
    if (w.length >= 5 && v.drugs.has(norm(w))) return `drug (${w})`;
    if (/^[a-z]{3,}$/.test(w)) return `lower-case word (${w})`;
  }
  if (v.drugs.has(N)) return "drug";
  if (codeShape(s, v.prefixes, strict)) return "drug code";
  if (/(mab|nib|tinib|ciclib|parib|lisib|rafenib|zomib|platin|taxel|rubicin|tecan|mustine|vedotin|deruxtecan|govitecan|ecan|domide|statin)$/i.test(words[0]) && /^[A-Z][a-z]+$/.test(words[0])) return "drug name";
  // Multi-part names: "CodeBreaK 202", "IMbrella A", "ROSETTA Breast-01", "EPCORE FL-1" pass; "Substudy 01A", "NK Cells", "China ARCHES" do not (strict).
  const first = parts[0];
  if (strict) {
    // "Beamion LUNG-2", "Keynote B59" and "China ARCHES" pass on their second part; "Substudy 01A" fails on the generic word above
    const nameLike = (p: string) => upper(p) >= 2 || /\d/.test(p);
    if (!nameLike(first) && !parts.slice(1).some(nameLike)) return "first word not a name";
    for (const p of parts.slice(1)) if (!(NUMBERISH.test(p) || /^[A-Z]{1,8}$/.test(p) || (upper(p) >= 2 && /[a-z]/.test(p)))) return `descriptive word (${p})`;
  }
  if (!/\d/.test(s) && !words.some(strong)) for (const w of words) if (STOP.has(w.toUpperCase())) return `generic (${w})`;
  if (strict && !/\d/.test(s) && words.length === 1 && /^[A-Z]{4}$/.test(s) && !hasVowel(s)) return "abbreviation";
  if (before && !/\d/.test(s) && abbreviates(s, before)) return "abbreviation of the preceding words";
  if (trial && N === norm(trial.name)) return "equals name";
  return undefined;
}

/** Title-derived candidates in priority order: the id spelled in the title, brackets, leading "Name:" segment, capitalised word with a dash-number. */
export function fromTitles(trial: TrialEntity, v: Vocab): { candidate?: Candidate; rejections: Rejection[] } {
  const rejections: Rejection[] = [];
  const seen = new Set<string>();
  const tryOne = (acronym: string, source: Source, before = ""): Candidate | undefined => {
    const a = clean(acronym);
    if (!a || seen.has(a)) return undefined;
    seen.add(a);
    const why = reject(a, v, trial, true, before);
    if (why) { rejections.push({ trial, candidate: a, source, reason: why }); return undefined; }
    return { trial, acronym: a, source };
  };
  const titles = [trial.name, trial.setting].filter(Boolean);
  // 0. the ingestion named some records by their acronym (checkmate-9la, taishan-301): find it in the title with its case
  if (!/^nct\d+$/.test(trial.id)) {
    const pattern = new RegExp(`(?<![A-Za-z0-9])${trial.id.split("-").map((p) => p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")).join("[- ]?")}(?![A-Za-z0-9])`, "i");
    for (const t of titles) {
      const m = pattern.exec(t);
      if (m) { const c = tryOne(m[0], "title:id"); if (c) return { candidate: c, rejections }; }
    }
  }
  // 1. bracketed token: "(MARIPOSA-2)", "（TAISHAN-302）", "(CheckMate 9LA)", "[KEYNOTE-671]"
  for (const t of titles) {
    for (const m of t.matchAll(/[(\[（]\s*([A-Za-z][A-Za-z0-9.]*(?:[- ][A-Za-z0-9.]+){0,3})\s*[)\]）]/g)) {
      const c = tryOne(m[1], "title:brackets", t.slice(Math.max(0, (m.index ?? 0) - 120), m.index));
      if (c) return { candidate: c, rejections };
    }
  }
  // 2. leading segment: "Symbiotic-GI-03: A Study ...", "ADAURA: ...", "KEYNOTE-671 - A Study ..."
  for (const t of titles) {
    const m = /^([A-Za-z][A-Za-z0-9]*(?:[- ][A-Za-z0-9]+){0,2})\s*(?::|：|\s[-–—]\s)\s*\S/.exec(t);
    if (m && (upper(m[1]) >= 2 || /\d/.test(m[1]))) {
      const c = tryOne(m[1], "title:leading");
      if (c) return { candidate: c, rejections };
    }
  }
  // 3. all-caps or CamelCaps word with a number: "KEYNOTE-671", "IMpower010", "TROPION-Lung08", "CheckMate 9LA", "MARIPOSA-2"
  for (const t of titles) {
    const letters = t.match(/[A-Za-z]/g) ?? [];
    const shouting = letters.length && letters.filter((ch) => ch === ch.toUpperCase()).length / letters.length > 0.6;
    if (shouting) continue;
    for (const m of t.matchAll(/(?<![A-Za-z0-9-])([A-Z][A-Za-z]{3,})(?:-([A-Za-z]{1,6})?(\d{1,3})([A-Za-z]{1,2})?|([A-Za-z]{1,6})?(\d{1,3})([A-Za-z]{1,2})?| (\d{1,3})([A-Z]{1,2}))(?![A-Za-z0-9])/g)) {
      const word = m[1];
      if (upper(word) < 2 || !hasVowel(word)) continue;
      // gene-shaped (STEAP2, LILRB2, KEAP1) and compound-shaped (MDNA11, DECOY20) tokens without a dash are left to the registry
      if (/^[A-Z]{3,6}\d{1,2}$/.test(m[0]) || /^[A-Z][A-Za-z]{2,6}\d{1,2}$/.test(m[0])) continue;
      const c = tryOne(m[0], "title:token");
      if (c) return { candidate: c, rejections };
    }
  }
  return { rejections };
}

/** Does an existing alias already look like a trial acronym? Records with one are left alone. */
export function hasAcronym(t: TrialEntity, v: Vocab): boolean {
  return t.aka.some((a) => !reject(a, v, undefined, false));
}

type Cache = Record<string, string | null>;
function readCache(): Cache {
  const c: Cache = existsSync(CACHE) ? (JSON.parse(readFileSync(CACHE, "utf8")) as Cache) : {};
  // An earlier CT.gov pull may have kept the acronym on the study rows; use it before spending requests.
  if (existsSync(STUDIES)) {
    try {
      for (const s of JSON.parse(readFileSync(STUDIES, "utf8")) as Array<{ nct?: string; acronym?: string }>) if (s.nct && typeof s.acronym === "string" && !(s.nct in c)) c[s.nct] = s.acronym;
    } catch { /* ignore a malformed cache */ }
  }
  return c;
}
function writeCache(c: Cache) { mkdirSync(dirname(CACHE), { recursive: true }); writeFileSync(CACHE, JSON.stringify(c, null, 1)); }

async function fetchAcronym(nct: string): Promise<string | null | undefined> {
  const url = `${API}/${nct}?fields=protocolSection.identificationModule`;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const r = await fetch(url, { headers: { Accept: "application/json", "User-Agent": "OnCo/1.0 (github.com/judegomila/OnCo)" } });
      if (r.status === 404) return null;
      if (!r.ok) { await sleep(1500 * (attempt + 1)); continue; }
      const j = (await r.json()) as { protocolSection?: { identificationModule?: { acronym?: string } } };
      return j.protocolSection?.identificationModule?.acronym?.trim() || null;
    } catch { await sleep(1500 * (attempt + 1)); }
  }
  return undefined;
}

const PHASE_RANK: Record<string, number> = { "3": 0, "2/3": 1, "2": 2, "1/2": 3, platform: 4, "1": 5, "4": 6, observational: 7 };
const STATUS_RANK: Record<string, number> = { recruiting: 0, active: 1 };

export async function plan(opts: { fetch: boolean; max: number; log?: (s: string) => void }) {
  const log = opts.log ?? (() => {});
  const g = graph();
  const v = vocab();
  const trials = (g.kind("trial") as TrialEntity[]).filter((t) => t.tags.includes("ctgov-ingest") && t.nct);
  const already = trials.filter((t) => hasAcronym(t, v));
  const todo = trials.filter((t) => !hasAcronym(t, v));
  const candidates: Candidate[] = [];
  const rejections: Rejection[] = [];
  const needFetch: TrialEntity[] = [];
  /** True (and a rejection recorded) when another record already owns the acronym as its name or alias. */
  const claimed = (c: Candidate): boolean => {
    const owner = v.claimed.get(norm(c.acronym));
    if (!owner || owner === c.trial.id) return false;
    rejections.push({ trial: c.trial, candidate: c.acronym, source: c.source, reason: `already the name or alias of ${owner}` });
    return true;
  };
  for (const t of todo) {
    const r = fromTitles(t, v);
    rejections.push(...r.rejections);
    if (r.candidate && !claimed(r.candidate)) candidates.push(r.candidate); else needFetch.push(t);
  }
  const cache = readCache();
  const rank = (t: TrialEntity) => (PHASE_RANK[t.phase] ?? 9) * 10 + (STATUS_RANK[t.status ?? ""] ?? 5);
  needFetch.sort((a, b) => rank(a) - rank(b) || a.id.localeCompare(b.id));
  let requests = 0, cacheHits = 0, failed = 0, noAcronym = 0, fetched = 0;
  for (const t of needFetch) {
    const nct = t.nct!.toUpperCase();
    let acronym: string | null | undefined;
    if (nct in cache) { acronym = cache[nct]; cacheHits++; }
    else if (opts.fetch && requests < opts.max) {
      requests++;
      acronym = await fetchAcronym(nct);
      if (acronym === undefined) { failed++; log(`  fetch failed ${nct}`); }
      else { cache[nct] = acronym; if (requests % 50 === 0) writeCache(cache); }
      await sleep(PAUSE_MS);
    } else continue;
    if (acronym === undefined) continue;
    if (acronym === null) { noAcronym++; continue; }
    fetched++;
    const why = reject(acronym, v, t, false);
    if (why) rejections.push({ trial: t, candidate: acronym, source: "ctgov:acronym", reason: why });
    else { const c: Candidate = { trial: t, acronym: clean(acronym), source: "ctgov:acronym" }; if (!claimed(c)) candidates.push(c); }
  }
  if (requests) writeCache(cache);
  const unresolved = needFetch.filter((t) => !(t.nct!.toUpperCase() in cache)).length;
  return { trials, already, todo, candidates, rejections, needFetch, requests, cacheHits, failed, noAcronym, fetched, unresolved };
}

if (process.argv[1]?.endsWith("trial-acronyms.ts")) {
  const write = process.argv.includes("--apply");
  const quiet = process.argv.includes("--quiet");
  const max = Number(process.argv.find((a) => a.startsWith("--max="))?.slice(6) ?? 600);
  plan({ fetch: !process.argv.includes("--no-fetch"), max, log: (s) => console.log(s) }).then((p) => {
    const bySource = new Map<Source, number>();
    for (const c of p.candidates) bySource.set(c.source, (bySource.get(c.source) ?? 0) + 1);
    if (!quiet) {
      for (const c of p.candidates.sort((a, b) => a.source.localeCompare(b.source) || a.trial.id.localeCompare(b.trial.id))) console.log(`  + ${c.trial.id.padEnd(28)} ${c.acronym.padEnd(24)} ${c.source.padEnd(16)} ${c.trial.name.slice(0, 90)}`);
      console.log("");
      for (const r of p.rejections) console.log(`  - ${r.trial.id.padEnd(28)} ${r.candidate.padEnd(24)} ${r.source.padEnd(16)} rejected: ${r.reason}`);
      console.log("");
    }
    console.log(`registry trials ${p.trials.length}; already carry an acronym ${p.already.length}; examined ${p.todo.length}`);
    console.log(`aliases planned ${p.candidates.length}: ${[...bySource].map(([s, n]) => `${s} ${n}`).join(", ")}`);
    console.log(`rejected ${p.rejections.length} (title ${p.rejections.filter((r) => r.source !== "ctgov:acronym").length}, ctgov ${p.rejections.filter((r) => r.source === "ctgov:acronym").length})`);
    console.log(`ctgov: needed ${p.needFetch.length}, cache hits ${p.cacheHits}, requests ${p.requests}, failed ${p.failed}, acronym returned ${p.fetched}, none registered ${p.noAcronym}, still unresolved ${p.unresolved}`);
    const edits: Edit[] = p.candidates.map((c) => ({ targetId: c.trial.id, targetKind: "trial", targetName: c.trial.name, field: "aka", add: c.acronym, why: c.source }));
    const res = applyEdits(edits, write);
    if (!quiet) for (const s of res.skipped) console.log(`  skipped ${s}`);
    console.log(`${write ? "applied" : "would apply"} ${res.applied.length} edits, skipped ${res.skipped.length}${write ? "" : " (--apply to write)"}`);
  });
}

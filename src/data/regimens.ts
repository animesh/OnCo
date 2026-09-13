/**
 * Regimen library: named chemotherapy, immunotherapy and targeted-therapy regimens with components, doses,
 * days, cycle length, cycle count, setting, intent, emetogenicity and G-CSF need.
 *
 * Side data (not entities). `drugId` on a component and every `cancers` / `trials` / `drugs` id must resolve in
 * the graph; `validateRegimens()` in src/lib/regimens.ts throws at build time if one does not. Components with
 * no product record (leucovorin, prednisone, dexamethasone, capecitabine, dacarbazine, daunorubicin, fludarabine)
 * carry a name only.
 *
 * Doses are the published protocol or label doses for a typical adult; they are reference values, not
 * prescriptions. Every regimen cites the pivotal publication (DOI) or the NCCN guideline that lists it.
 * Emetogenicity follows the NCCN Antiemesis / MASCC-ESMO classification of the most emetogenic component
 * (high = >90% risk without prophylaxis, moderate 30-90%, low 10-30%, minimal <10%). G-CSF follows the ASCO
 * 2015 / NCCN febrile-neutropenia risk bands: "recommended" when the regimen's FN risk is above 20% or the
 * protocol mandates it, "consider" for 10-20% with patient risk factors, "not routine" below 10%.
 */
export type Route = "IV" | "PO" | "SC" | "IT" | "Intravesical" | "RT";

export type RegimenComponent = {
  name: string;
  /** Product id in the corpus, when one exists. */
  drugId?: string;
  dose: string;
  route: Route;
  /** Days of the cycle on which this component is given (1-based). */
  days: number[];
  /** Continuous infusion length in hours, starting on the first listed day. */
  infusionHours?: number;
  note?: string;
};

export type Intent = "neoadjuvant" | "adjuvant" | "perioperative" | "chemoradiation" | "first line" | "later line" | "maintenance" | "induction" | "consolidation" | "conditioning" | "curative";
export type Emetogenicity = "minimal" | "low" | "moderate" | "high";
export type Gcsf = "recommended" | "consider" | "not routine" | "built in";

export type Regimen = {
  id: string;
  name: string;
  aka?: string[];
  cancers: string[];
  /** Clinical setting, in the words a protocol would use. */
  setting: string;
  intent: Intent;
  cycleDays: number;
  /** "6", "4 then surgery", "until progression", "12 (6 months)". */
  cycles: string;
  components: RegimenComponent[];
  emetogenicity: Emetogenicity;
  gcsf: Gcsf;
  /** Trial ids in the corpus that established the regimen. */
  trials?: string[];
  /** Product ids the regimen is the same thing as, or is built on, beyond the components (e.g. the FOLFOX record). */
  drugs?: string[];
  source: { label: string; url: string };
  notes?: string[];
  asOf: string;
};

const doi = (d: string) => `https://doi.org/${d}`;
const nccn = (id: number) => `https://www.nccn.org/guidelines/guidelines-detail?category=1&id=${id}`;
const NCCN = {
  breast: nccn(1419), colon: nccn(1428), rectal: nccn(1461), pancreatic: nccn(1455), gastric: nccn(1434), esophageal: nccn(1433),
  nsclc: nccn(1450), sclc: nccn(1462), bladder: nccn(1417), prostate: nccn(1459), kidney: nccn(1440), testicular: nccn(1468),
  ovarian: nccn(1453), uterine: nccn(1473), cervical: nccn(1426), bcell: nccn(1480), hodgkin: nccn(1439), cll: nccn(1478),
  myeloma: nccn(1445), aml: nccn(1411), all: nccn(1410), melanoma: nccn(1492), sts: nccn(1464), bone: nccn(1418), cns: nccn(1425),
  hcc: nccn(1514), biliary: nccn(1517), headneck: nccn(1437), net: nccn(1448), meso: nccn(1512), anal: nccn(1414),
};

const AS_OF = "2026-09-09";
const c = (name: string, drugId: string | undefined, dose: string, route: Route, days: number[], extra: Partial<RegimenComponent> = {}): RegimenComponent => ({ name, drugId, dose, route, days, ...extra });
const range = (a: number, b: number) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const LV = (dose = "400 mg/m²", days = [1]) => c("Leucovorin (folinic acid)", undefined, dose, "IV", days, { note: "2-hour infusion before fluorouracil" });
const FU_BOLUS_CI = (): RegimenComponent[] => [c("Fluorouracil bolus", "fluorouracil", "400 mg/m²", "IV", [1]), c("Fluorouracil infusion", "fluorouracil", "2,400 mg/m²", "IV", [1, 2], { infusionHours: 46 })];
const PEMBRO = (days = [1]) => c("Pembrolizumab", "pembrolizumab", "200 mg", "IV", days, { note: "or 400 mg every 6 weeks" });

export const regimens: Regimen[] = [
  // ============================ Gastrointestinal ============================
  { id: "mfolfox6", name: "mFOLFOX6", aka: ["FOLFOX"], cancers: ["colorectal", "gastric", "esophageal", "pancreatic"], setting: "Adjuvant stage III colon (6 months) or metastatic colorectal and upper GI first line", intent: "first line", cycleDays: 14, cycles: "12 (6 months adjuvant); until progression metastatic",
    components: [c("Oxaliplatin", "oxaliplatin", "85 mg/m²", "IV", [1]), LV(), ...FU_BOLUS_CI()], emetogenicity: "moderate", gcsf: "not routine",
    trials: ["paradigm", "sunlight"], drugs: ["folfox"], source: { label: "MOSAIC, NEJM 2004 (FOLFOX4); mFOLFOX6 per NCCN Colon Cancer", url: doi("10.1056/NEJMoa032709") },
    notes: ["Oxaliplatin neuropathy is cumulative; IDEA showed 3 months of CAPOX is non-inferior for low-risk stage III (T1-3 N1).", "Bevacizumab 5 mg/kg or an anti-EGFR antibody is added on day 1 in metastatic disease by RAS/BRAF status and sidedness."], asOf: AS_OF },
  { id: "capox", name: "CAPOX", aka: ["XELOX"], cancers: ["colorectal", "gastric", "esophageal"], setting: "Adjuvant stage III colon (3 or 6 months), rectal total neoadjuvant therapy, metastatic first line", intent: "adjuvant", cycleDays: 21, cycles: "4 (3 months) or 8 (6 months)",
    components: [c("Oxaliplatin", "oxaliplatin", "130 mg/m²", "IV", [1]), c("Capecitabine", undefined, "1,000 mg/m² twice daily", "PO", range(1, 14))], emetogenicity: "moderate", gcsf: "not routine",
    drugs: ["capox"], source: { label: "NCCN Colon Cancer; IDEA collaboration, NEJM 2018", url: doi("10.1056/NEJMoa1713709") },
    notes: ["Capecitabine dose is often started at 850 mg/m² in older patients or with renal impairment; check creatinine clearance.", "Hand-foot syndrome and diarrhoea drive dose holds; warfarin interaction is a boxed warning."], asOf: AS_OF },
  { id: "folfiri", aka: ["FOLFIRI-BEVACIZUMAB", "FOLFIRI-CETUXIMAB"], name: "FOLFIRI", cancers: ["colorectal", "gastric"], setting: "Metastatic colorectal first or second line (with bevacizumab, aflibercept, ramucirumab or an anti-EGFR antibody)", intent: "first line", cycleDays: 14, cycles: "until progression",
    components: [c("Irinotecan", "irinotecan", "180 mg/m²", "IV", [1]), LV(), ...FU_BOLUS_CI()], emetogenicity: "moderate", gcsf: "not routine",
    trials: ["crystal-fire3"], drugs: ["folfiri"], source: { label: "NCCN Colon Cancer; Douillard, Lancet 2000", url: doi("10.1016/S0140-6736(00)02034-1") },
    notes: ["UGT1A1*28 homozygotes have higher neutropenia risk; consider a lower irinotecan start dose."], asOf: AS_OF },
  { id: "folfirinox", name: "FOLFIRINOX", cancers: ["pancreatic"], setting: "Metastatic pancreatic cancer, performance status 0-1", intent: "first line", cycleDays: 14, cycles: "12 (6 months) or until progression",
    components: [c("Oxaliplatin", "oxaliplatin", "85 mg/m²", "IV", [1]), c("Irinotecan", "irinotecan", "180 mg/m²", "IV", [1]), LV(), ...FU_BOLUS_CI()], emetogenicity: "moderate", gcsf: "consider",
    drugs: ["folfirinox"], source: { label: "PRODIGE 4 / ACCORD 11, NEJM 2011", url: doi("10.1056/NEJMoa1011923") },
    notes: ["Grade 3-4 neutropenia 45.7% in PRODIGE 4 without mandated G-CSF; many centres give primary prophylaxis or use the modified regimen below.", "Often classified as high emetogenic risk in practice because two moderate-risk agents are combined."], asOf: AS_OF },
  { id: "mfolfirinox-adjuvant", name: "mFOLFIRINOX (adjuvant)", cancers: ["pancreatic"], setting: "Resected pancreatic cancer, fit patients, started within 12 weeks of surgery", intent: "adjuvant", cycleDays: 14, cycles: "12 (6 months)",
    components: [c("Oxaliplatin", "oxaliplatin", "85 mg/m²", "IV", [1]), c("Irinotecan", "irinotecan", "150 mg/m²", "IV", [1]), LV(), c("Fluorouracil infusion", "fluorouracil", "2,400 mg/m²", "IV", [1, 2], { infusionHours: 46, note: "no bolus" })], emetogenicity: "moderate", gcsf: "consider",
    trials: ["prodige-24"], drugs: ["folfirinox"], source: { label: "PRODIGE 24 / CCTG PA6, NEJM 2018", url: doi("10.1056/NEJMoa1809775") },
    notes: ["Median OS 54.4 vs 35.0 months against gemcitabine; irinotecan was reduced from 180 to 150 mg/m² after early toxicity."], asOf: AS_OF },
  { id: "gem-nabpac", name: "Gemcitabine + nab-paclitaxel", cancers: ["pancreatic"], setting: "Metastatic pancreatic cancer first line; adjuvant option when FOLFIRINOX is not tolerated", intent: "first line", cycleDays: 28, cycles: "until progression",
    components: [c("nab-Paclitaxel", "paclitaxel", "125 mg/m²", "IV", [1, 8, 15]), c("Gemcitabine", "gemcitabine", "1,000 mg/m²", "IV", [1, 8, 15])], emetogenicity: "low", gcsf: "not routine",
    drugs: ["gemcitabine-nab-paclitaxel"], source: { label: "MPACT, NEJM 2013", url: doi("10.1056/NEJMoa1304369") }, asOf: AS_OF },
  { id: "gemcitabine-mono", name: "Gemcitabine monotherapy", cancers: ["pancreatic", "cholangiocarcinoma"], setting: "Frail patients or adjuvant when combinations are not tolerated", intent: "first line", cycleDays: 28, cycles: "6 (adjuvant); until progression",
    components: [c("Gemcitabine", "gemcitabine", "1,000 mg/m²", "IV", [1, 8, 15])], emetogenicity: "low", gcsf: "not routine",
    source: { label: "Burris, JCO 1997 (7 weekly doses then 3 of 4 weeks); CONKO-001 adjuvant", url: doi("10.1200/JCO.1997.15.6.2403") }, asOf: AS_OF },
  { id: "nalirifox", name: "NALIRIFOX", cancers: ["pancreatic"], setting: "Metastatic pancreatic cancer first line", intent: "first line", cycleDays: 14, cycles: "until progression",
    components: [c("Liposomal irinotecan", "irinotecan", "50 mg/m²", "IV", [1]), c("Oxaliplatin", "oxaliplatin", "60 mg/m²", "IV", [1]), LV(), c("Fluorouracil infusion", "fluorouracil", "2,400 mg/m²", "IV", [1, 2], { infusionHours: 46 })], emetogenicity: "moderate", gcsf: "not routine",
    trials: ["napoli-3"], drugs: ["nalirifox"], source: { label: "NAPOLI 3, Lancet 2023", url: doi("10.1016/S0140-6736(23)01366-1") }, asOf: AS_OF },
  { id: "gemcis", name: "Gemcitabine + cisplatin", aka: ["GemCis"], cancers: ["cholangiocarcinoma", "urothelial"], setting: "Advanced biliary tract cancer first line (with durvalumab or pembrolizumab); cisplatin-eligible urothelial cancer", intent: "first line", cycleDays: 21, cycles: "8 (biliary, 24 weeks); 4-6 (urothelial)",
    components: [c("Cisplatin", "cisplatin", "25 mg/m² (biliary) or 70 mg/m² day 1 (urothelial)", "IV", [1, 8]), c("Gemcitabine", "gemcitabine", "1,000 mg/m²", "IV", [1, 8])], emetogenicity: "high", gcsf: "not routine",
    trials: ["abc-02", "topaz-1", "keynote-966"], drugs: ["gemcitabine-cisplatin"], source: { label: "ABC-02, NEJM 2010", url: doi("10.1056/NEJMoa0908721") },
    notes: ["TOPAZ-1 adds durvalumab 1,500 mg every 3 weeks for 8 cycles then every 4 weeks; KEYNOTE-966 adds pembrolizumab 200 mg every 3 weeks.", "In urothelial cancer cisplatin is 70 mg/m² on day 1 only (von der Maase, JCO 2000)."], asOf: AS_OF },
  { id: "flot", name: "FLOT", cancers: ["gastric", "esophageal"], setting: "Resectable gastric or gastro-oesophageal junction adenocarcinoma, cT2 or higher or node-positive", intent: "perioperative", cycleDays: 14, cycles: "4 before and 4 after surgery",
    components: [c("Docetaxel", "docetaxel", "50 mg/m²", "IV", [1]), c("Oxaliplatin", "oxaliplatin", "85 mg/m²", "IV", [1]), LV("200 mg/m²"), c("Fluorouracil infusion", "fluorouracil", "2,600 mg/m²", "IV", [1, 2], { infusionHours: 24 })], emetogenicity: "moderate", gcsf: "consider",
    trials: ["matterhorn"], drugs: ["flot"], source: { label: "FLOT4-AIO, Lancet 2019", url: doi("10.1016/S0140-6736(18)32557-1") },
    notes: ["MATTERHORN adds durvalumab 1,500 mg every 4 weeks to perioperative FLOT and continues it for 12 cycles."], asOf: AS_OF },
  { id: "cross", name: "CROSS chemoradiation", cancers: ["esophageal", "gastric"], setting: "Resectable oesophageal or junctional cancer (T1N1 or T2-3N0-1), before surgery", intent: "neoadjuvant", cycleDays: 7, cycles: "5 weekly doses with 41.4 Gy in 23 fractions",
    components: [c("Carboplatin", "carboplatin", "AUC 2", "IV", [1]), c("Paclitaxel", "paclitaxel", "50 mg/m²", "IV", [1]), c("Radiotherapy", undefined, "1.8 Gy per fraction, 5 days a week", "RT", range(1, 5))], emetogenicity: "low", gcsf: "not routine",
    trials: ["cross", "checkmate-577"], source: { label: "CROSS, NEJM 2012", url: doi("10.1056/NEJMoa1112088") },
    notes: ["CheckMate 577: adjuvant nivolumab for one year if residual disease at surgery."], asOf: AS_OF },
  { id: "nivo-folfox-gastric", name: "Nivolumab + FOLFOX or CAPOX", cancers: ["gastric", "esophageal"], setting: "Unresectable or metastatic HER2-negative gastric, junctional or oesophageal adenocarcinoma, first line (benefit concentrated in PD-L1 CPS 5 or above)", intent: "first line", cycleDays: 14, cycles: "until progression; nivolumab up to 2 years",
    components: [c("Nivolumab", "nivolumab", "240 mg (with FOLFOX) or 360 mg every 3 weeks with CAPOX", "IV", [1]), c("Oxaliplatin", "oxaliplatin", "85 mg/m²", "IV", [1]), LV(), ...FU_BOLUS_CI()], emetogenicity: "moderate", gcsf: "not routine",
    trials: ["checkmate-649"], source: { label: "CheckMate 649, Lancet 2021", url: doi("10.1016/S0140-6736(21)00797-2") }, asOf: AS_OF },
  { id: "pembro-cis-fu-esophageal", name: "Pembrolizumab + cisplatin + fluorouracil", cancers: ["esophageal", "gastric"], setting: "Advanced oesophageal or Siewert type 1 junctional cancer, first line", intent: "first line", cycleDays: 21, cycles: "chemotherapy 6; pembrolizumab up to 35",
    components: [PEMBRO(), c("Cisplatin", "cisplatin", "80 mg/m²", "IV", [1]), c("Fluorouracil infusion", "fluorouracil", "800 mg/m² per day", "IV", range(1, 5), { infusionHours: 120 })], emetogenicity: "high", gcsf: "not routine",
    trials: ["keynote-590"], source: { label: "KEYNOTE-590, Lancet 2021", url: doi("10.1016/S0140-6736(21)01234-4") }, asOf: AS_OF },
  { id: "tas102-bev", name: "Trifluridine/tipiracil + bevacizumab", cancers: ["colorectal"], setting: "Refractory metastatic colorectal cancer after two lines", intent: "later line", cycleDays: 28, cycles: "until progression",
    components: [c("Trifluridine/tipiracil", "trifluridine-tipiracil", "35 mg/m² twice daily", "PO", [...range(1, 5), ...range(8, 12)]), c("Bevacizumab", "bevacizumab", "5 mg/kg", "IV", [1, 15])], emetogenicity: "low", gcsf: "not routine",
    trials: ["sunlight"], source: { label: "SUNLIGHT, NEJM 2023", url: doi("10.1056/NEJMoa2214963") }, asOf: AS_OF },
  { id: "atezo-bev-hcc", name: "Atezolizumab + bevacizumab", cancers: ["hcc"], setting: "Unresectable hepatocellular carcinoma, Child-Pugh A, varices treated", intent: "first line", cycleDays: 21, cycles: "until progression",
    components: [c("Atezolizumab", "atezolizumab", "1,200 mg", "IV", [1]), c("Bevacizumab", "bevacizumab", "15 mg/kg", "IV", [1])], emetogenicity: "minimal", gcsf: "not routine",
    trials: ["imbrave150"], source: { label: "IMbrave150, NEJM 2020", url: doi("10.1056/NEJMoa1915745") }, notes: ["Endoscopy for varices within 6 months before starting; bleeding risk with bevacizumab."], asOf: AS_OF },
  { id: "stride", name: "STRIDE (tremelimumab + durvalumab)", cancers: ["hcc"], setting: "Unresectable hepatocellular carcinoma, first line", intent: "first line", cycleDays: 28, cycles: "until progression",
    components: [c("Tremelimumab", "tremelimumab", "300 mg single priming dose", "IV", [1], { note: "cycle 1 only" }), c("Durvalumab", "durvalumab", "1,500 mg", "IV", [1])], emetogenicity: "minimal", gcsf: "not routine",
    trials: ["himalaya"], source: { label: "HIMALAYA, NEJM Evidence 2022", url: doi("10.1056/EVIDoa2100070") }, asOf: AS_OF },
  { id: "mitomycin-fu-crt-anal", name: "Mitomycin + fluorouracil chemoradiation", aka: ["Nigro regimen"], cancers: ["anal"], setting: "Localised anal squamous cell carcinoma, definitive treatment", intent: "chemoradiation", cycleDays: 56, cycles: "1 (two chemotherapy pulses across 5-6 weeks of radiotherapy)",
    components: [c("Mitomycin", "mitomycin", "10 mg/m² (maximum 20 mg)", "IV", [1, 29]), c("Fluorouracil infusion", "fluorouracil", "1,000 mg/m² per day", "IV", [...range(1, 4), ...range(29, 32)], { infusionHours: 96 }), c("Radiotherapy", undefined, "50.4-54 Gy in 28-30 fractions", "RT", range(1, 40).filter((d) => d % 7 !== 6 && d % 7 !== 0))], emetogenicity: "moderate", gcsf: "not routine",
    source: { label: "RTOG 98-11, JAMA 2008", url: doi("10.1001/jama.299.16.1914") }, asOf: AS_OF },
  { id: "captem", name: "CAPTEM", cancers: ["neuroendocrine"], setting: "Advanced pancreatic neuroendocrine tumour", intent: "first line", cycleDays: 28, cycles: "until progression (E2211 to 13 cycles)",
    components: [c("Capecitabine", undefined, "750 mg/m² twice daily", "PO", range(1, 14)), c("Temozolomide", "temozolomide", "200 mg/m²", "PO", range(10, 14))], emetogenicity: "moderate", gcsf: "not routine",
    drugs: ["capecitabine-temozolomide"], source: { label: "ECOG-ACRIN E2211, JCO 2023", url: doi("10.1200/JCO.22.01013") }, asOf: AS_OF },
  { id: "lutathera-prrt", name: "177Lu-DOTATATE (PRRT)", cancers: ["neuroendocrine"], setting: "SSTR-positive gastroenteropancreatic NET after somatostatin analogue", intent: "later line", cycleDays: 56, cycles: "4",
    components: [c("Lutetium-177 dotatate", "lutathera", "7.4 GBq", "IV", [1], { note: "with amino-acid infusion for renal protection" }), c("Octreotide LAR", "octreotide-lanreotide", "30 mg", "SC", [1], { note: "given after each dose; continue during and after treatment" })], emetogenicity: "low", gcsf: "not routine",
    trials: ["compete"], source: { label: "NETTER-1, NEJM 2017", url: doi("10.1056/NEJMoa1607427") }, asOf: AS_OF },
  { id: "everolimus-net", name: "Everolimus", cancers: ["neuroendocrine", "rcc", "breast-hr-positive"], setting: "Advanced progressive NET (RADIANT-3, RADIANT-4); RCC and HR-positive breast cancer after prior therapy", intent: "later line", cycleDays: 28, cycles: "until progression",
    components: [c("Everolimus", "everolimus", "10 mg once daily", "PO", range(1, 28))], emetogenicity: "minimal", gcsf: "not routine",
    trials: ["radiant-3-4"], source: { label: "RADIANT-4, Lancet 2016", url: doi("10.1016/S0140-6736(15)00817-X") }, notes: ["Stomatitis is reduced by dexamethasone mouthwash prophylaxis (SWISH)."], asOf: AS_OF },

  // ============================ Breast ============================
  { id: "ddac-t", name: "Dose-dense AC → T", aka: ["ddAC-T", "AC-T", "AC followed by T"], cancers: ["tnbc", "breast-hr-positive", "breast-her2-positive"], setting: "Node-positive or high-risk early breast cancer, adjuvant or neoadjuvant", intent: "adjuvant", cycleDays: 14, cycles: "4 AC then 4 paclitaxel (16 weeks)",
    components: [c("Doxorubicin", "doxorubicin", "60 mg/m²", "IV", [1], { note: "cycles 1-4" }), c("Cyclophosphamide", "cyclophosphamide", "600 mg/m²", "IV", [1], { note: "cycles 1-4" }), c("Paclitaxel", "paclitaxel", "175 mg/m² every 2 weeks × 4, or 80 mg/m² weekly × 12", "IV", [1], { note: "cycles 5-8" })], emetogenicity: "high", gcsf: "built in",
    source: { label: "CALGB 9741, JCO 2003", url: doi("10.1200/JCO.2003.09.081") }, notes: ["Cumulative doxorubicin 240 mg/m²; pegfilgrastim on day 2 of each AC cycle is what makes the 14-day schedule possible.", "Weekly paclitaxel × 12 (ECOG E1199) is at least as effective as every-2-week dosing with less neuropathy."], asOf: AS_OF },
  { id: "tc4", name: "TC (docetaxel + cyclophosphamide)", cancers: ["breast-hr-positive", "tnbc"], setting: "Early breast cancer when an anthracycline is not wanted", intent: "adjuvant", cycleDays: 21, cycles: "4 (6 for higher risk)",
    components: [c("Docetaxel", "docetaxel", "75 mg/m²", "IV", [1]), c("Cyclophosphamide", "cyclophosphamide", "600 mg/m²", "IV", [1])], emetogenicity: "moderate", gcsf: "recommended",
    source: { label: "US Oncology 9735, JCO 2006", url: doi("10.1200/JCO.2006.06.5391") }, notes: ["Febrile neutropenia risk above 20% in older patients; primary G-CSF prophylaxis is usual."], asOf: AS_OF },
  { id: "keynote-522", name: "KEYNOTE-522 (pembrolizumab + chemotherapy, then adjuvant pembrolizumab)", cancers: ["tnbc"], setting: "Stage II-III triple-negative breast cancer", intent: "neoadjuvant", cycleDays: 21, cycles: "4 paclitaxel-carboplatin then 4 AC/EC, surgery, then 9 adjuvant pembrolizumab",
    components: [PEMBRO(), c("Paclitaxel", "paclitaxel", "80 mg/m²", "IV", [1, 8, 15], { note: "cycles 1-4" }), c("Carboplatin", "carboplatin", "AUC 5 day 1 (or AUC 1.5 weekly)", "IV", [1], { note: "cycles 1-4" }), c("Doxorubicin", "doxorubicin", "60 mg/m² (or epirubicin 90 mg/m²)", "IV", [1], { note: "cycles 5-8" }), c("Cyclophosphamide", "cyclophosphamide", "600 mg/m²", "IV", [1], { note: "cycles 5-8" })], emetogenicity: "high", gcsf: "consider",
    trials: ["keynote-522"], source: { label: "KEYNOTE-522, NEJM 2020 (Schmid)", url: doi("10.1056/NEJMoa1910549") }, notes: ["pCR 64.8% vs 51.2%; event-free survival and overall survival benefit confirmed at later analyses.", "Immune-related endocrinopathies (thyroid, adrenal, hypophysitis) can be permanent; check baseline TSH and cortisol."], asOf: AS_OF },
  { id: "tchp", name: "TCHP", cancers: ["breast-her2-positive"], setting: "Stage II-III HER2-positive breast cancer, neoadjuvant", intent: "neoadjuvant", cycleDays: 21, cycles: "6, then HP to complete 1 year",
    components: [c("Docetaxel", "docetaxel", "75 mg/m²", "IV", [1]), c("Carboplatin", "carboplatin", "AUC 6", "IV", [1]), c("Trastuzumab", "trastuzumab", "8 mg/kg loading then 6 mg/kg", "IV", [1]), c("Pertuzumab", "pertuzumab", "840 mg loading then 420 mg", "IV", [1])], emetogenicity: "high", gcsf: "recommended",
    trials: ["destiny-breast11"], source: { label: "TRYPHAENA, Ann Oncol 2013; NCCN Breast Cancer", url: doi("10.1093/annonc/mdt182") }, notes: ["Diarrhoea is the limiting toxicity; carboplatin AUC 6 is often reduced to AUC 5.", "DESTINY-Breast11 (T-DXd × 4 then THP) reported a higher pCR than ddAC-THP and is entering guidelines."], asOf: AS_OF },
  { id: "apt", name: "APT (weekly paclitaxel + trastuzumab)", cancers: ["breast-her2-positive"], setting: "Stage I HER2-positive breast cancer, node-negative, tumour 3 cm or smaller", intent: "adjuvant", cycleDays: 7, cycles: "12 weekly, then trastuzumab every 3 weeks to 1 year",
    components: [c("Paclitaxel", "paclitaxel", "80 mg/m²", "IV", [1]), c("Trastuzumab", "trastuzumab", "4 mg/kg loading then 2 mg/kg weekly; 6 mg/kg every 3 weeks after chemotherapy", "IV", [1])], emetogenicity: "low", gcsf: "not routine",
    trials: ["apt-trial"], source: { label: "APT, NEJM 2015 (Tolaney)", url: doi("10.1056/NEJMoa1406281") }, notes: ["7-year disease-free survival 93%; T-DM1 × 17 (ATEMPT) is the alternative."], asOf: AS_OF },
  { id: "thp-cleopatra", name: "THP (docetaxel + trastuzumab + pertuzumab)", cancers: ["breast-her2-positive"], setting: "HER2-positive metastatic breast cancer first line, then HP maintenance", intent: "first line", cycleDays: 21, cycles: "docetaxel 6 or more; HP until progression",
    components: [c("Docetaxel", "docetaxel", "75 mg/m²", "IV", [1]), c("Trastuzumab", "trastuzumab", "8 mg/kg loading then 6 mg/kg", "IV", [1]), c("Pertuzumab", "pertuzumab", "840 mg loading then 420 mg", "IV", [1])], emetogenicity: "low", gcsf: "consider",
    trials: ["cleopatra", "destiny-breast09"], source: { label: "CLEOPATRA, NEJM 2012", url: doi("10.1056/NEJMoa1113216") }, notes: ["Median OS 57.1 months; DESTINY-Breast09 (T-DXd + pertuzumab) now competes for first line."], asOf: AS_OF },
  { id: "tdxd-breast", name: "Trastuzumab deruxtecan 5.4 mg/kg", cancers: ["breast-her2-positive", "breast-hr-positive", "tnbc", "nsclc"], setting: "HER2-positive metastatic breast cancer second line; HER2-low or ultralow after chemotherapy or endocrine therapy; HER2-mutant NSCLC", intent: "later line", cycleDays: 21, cycles: "until progression",
    components: [c("Trastuzumab deruxtecan", "trastuzumab-deruxtecan", "5.4 mg/kg (6.4 mg/kg in gastric cancer)", "IV", [1])], emetogenicity: "moderate", gcsf: "not routine",
    trials: ["destiny-breast03", "destiny-breast04", "destiny-breast06"], source: { label: "DESTINY-Breast04, NEJM 2022", url: doi("10.1056/NEJMoa2203690") }, notes: ["Interstitial lung disease in about 10-15%: hold for any grade, permanently discontinue for grade 2 or above.", "Moderately emetogenic: three-drug antiemetic prophylaxis is recommended."], asOf: AS_OF },
  { id: "sacituzumab", name: "Sacituzumab govitecan", cancers: ["tnbc", "breast-hr-positive", "urothelial"], setting: "Metastatic TNBC after two lines (one for metastatic disease); HR-positive after endocrine therapy and two chemotherapies", intent: "later line", cycleDays: 21, cycles: "until progression",
    components: [c("Sacituzumab govitecan", "sacituzumab-govitecan", "10 mg/kg", "IV", [1, 8])], emetogenicity: "moderate", gcsf: "consider",
    trials: ["ascent", "tropics-02"], source: { label: "ASCENT, NEJM 2021", url: doi("10.1056/NEJMoa2028485") }, notes: ["Neutropenia and diarrhoea are the main toxicities; UGT1A1*28 homozygotes are at higher risk."], asOf: AS_OF },
  { id: "capecitabine-create-x", name: "Capecitabine (post-neoadjuvant)", cancers: ["tnbc", "breast-hr-positive"], setting: "Residual invasive disease after neoadjuvant chemotherapy, HER2-negative", intent: "adjuvant", cycleDays: 21, cycles: "6-8",
    components: [c("Capecitabine", undefined, "1,250 mg/m² twice daily", "PO", range(1, 14))], emetogenicity: "low", gcsf: "not routine",
    source: { label: "CREATE-X, NEJM 2017", url: doi("10.1056/NEJMoa1612645") }, notes: ["Benefit concentrated in triple-negative disease; KEYNOTE-522 pembrolizumab and OlympiA olaparib now compete in this setting."], asOf: AS_OF },
  { id: "olaparib-adjuvant", name: "Olaparib (adjuvant, OlympiA)", cancers: ["tnbc", "breast-hr-positive"], setting: "Germline BRCA1/2, HER2-negative, high-risk early breast cancer after chemotherapy", intent: "adjuvant", cycleDays: 28, cycles: "13 (one year)",
    components: [c("Olaparib", "olaparib", "300 mg twice daily", "PO", range(1, 28))], emetogenicity: "low", gcsf: "not routine",
    trials: ["olympia"], source: { label: "OlympiA, NEJM 2021", url: doi("10.1056/NEJMoa2105215") }, asOf: AS_OF },
  { id: "cdk46-ai", name: "CDK4/6 inhibitor + aromatase inhibitor", cancers: ["breast-hr-positive"], setting: "HR-positive, HER2-negative advanced breast cancer, first line (and adjuvant abemaciclib or ribociclib for high-risk early disease)", intent: "first line", cycleDays: 28, cycles: "until progression (adjuvant: 2 years abemaciclib, 3 years ribociclib)",
    components: [c("Palbociclib 125 mg or ribociclib 400-600 mg once daily", "palbociclib", "days 1-21 of 28", "PO", range(1, 21)), c("Abemaciclib (alternative)", "abemaciclib", "150 mg twice daily continuously", "PO", range(1, 28)), c("Letrozole", "letrozole", "2.5 mg once daily", "PO", range(1, 28))], emetogenicity: "minimal", gcsf: "not routine",
    trials: ["paloma-2", "monaleesa-2", "monarch-3", "monarche", "natalee"], drugs: ["ribociclib"], source: { label: "MONALEESA-2, NEJM 2016; NCCN Breast Cancer", url: doi("10.1056/NEJMoa1609709") }, notes: ["Ribociclib: ECG for QTc at baseline, day 14 and cycle 2; avoid QT-prolonging drugs.", "Abemaciclib: diarrhoea in most patients, start loperamide at first loose stool."], asOf: AS_OF },
  { id: "eribulin", name: "Eribulin", cancers: ["breast-hr-positive", "tnbc", "sarcoma"], setting: "Metastatic breast cancer after an anthracycline and a taxane; liposarcoma", intent: "later line", cycleDays: 21, cycles: "until progression",
    components: [c("Eribulin", "eribulin", "1.4 mg/m² (1.23 mg/m² as free base)", "IV", [1, 8])], emetogenicity: "low", gcsf: "not routine",
    source: { label: "EMBRACE, Lancet 2011", url: doi("10.1016/S0140-6736(11)60070-6") }, asOf: AS_OF },

  // ============================ Thoracic ============================
  { id: "keynote-189", name: "Pembrolizumab + pemetrexed + platinum", cancers: ["nsclc"], setting: "Metastatic non-squamous NSCLC without EGFR/ALK alteration, first line, any PD-L1", intent: "first line", cycleDays: 21, cycles: "4 with platinum, then pembrolizumab + pemetrexed maintenance up to 35 cycles",
    components: [PEMBRO(), c("Pemetrexed", "pemetrexed", "500 mg/m²", "IV", [1]), c("Carboplatin AUC 5 or cisplatin 75 mg/m²", "carboplatin", "day 1, cycles 1-4", "IV", [1])], emetogenicity: "moderate", gcsf: "not routine",
    trials: ["keynote-024-189"], source: { label: "KEYNOTE-189, NEJM 2018", url: doi("10.1056/NEJMoa1801005") }, notes: ["Folic acid, vitamin B12 and dexamethasone premedication for pemetrexed.", "Cisplatin makes the regimen highly emetogenic."], asOf: AS_OF },
  { id: "keynote-407", name: "Pembrolizumab + carboplatin + paclitaxel", cancers: ["nsclc"], setting: "Metastatic squamous NSCLC, first line", intent: "first line", cycleDays: 21, cycles: "4 with chemotherapy, then pembrolizumab up to 35",
    components: [PEMBRO(), c("Carboplatin", "carboplatin", "AUC 6", "IV", [1]), c("Paclitaxel 200 mg/m² day 1, or nab-paclitaxel 100 mg/m² days 1, 8, 15", "paclitaxel", "cycles 1-4", "IV", [1])], emetogenicity: "moderate", gcsf: "not routine",
    source: { label: "KEYNOTE-407, NEJM 2018", url: doi("10.1056/NEJMoa1810865") }, asOf: AS_OF },
  { id: "checkmate-9la", name: "Nivolumab + ipilimumab + 2 cycles of platinum doublet", cancers: ["nsclc"], setting: "Metastatic NSCLC without EGFR/ALK alteration, first line", intent: "first line", cycleDays: 21, cycles: "chemotherapy 2; nivolumab up to 2 years",
    components: [c("Nivolumab", "nivolumab", "360 mg", "IV", [1]), c("Ipilimumab", "ipilimumab", "1 mg/kg every 6 weeks", "IV", [1], { note: "alternate cycles" }), c("Platinum doublet by histology", "carboplatin", "cycles 1-2 only", "IV", [1])], emetogenicity: "moderate", gcsf: "not routine",
    source: { label: "CheckMate 9LA, Lancet Oncology 2021", url: doi("10.1016/S1470-2045(20)30641-0") }, asOf: AS_OF },
  { id: "osimertinib", name: "Osimertinib", cancers: ["nsclc"], setting: "EGFR ex19del or L858R NSCLC: first line metastatic (FLAURA), adjuvant for 3 years after resection (ADAURA), after chemoradiation (LAURA)", intent: "first line", cycleDays: 28, cycles: "until progression; 3 years adjuvant",
    components: [c("Osimertinib", "osimertinib", "80 mg once daily", "PO", range(1, 28))], emetogenicity: "minimal", gcsf: "not routine",
    trials: ["flaura2", "adaura", "laura"], source: { label: "FLAURA, NEJM 2018", url: doi("10.1056/NEJMoa1713137") }, notes: ["FLAURA2 adds pemetrexed-platinum × 4 then pemetrexed maintenance for a PFS gain at the cost of chemotherapy toxicity.", "QTc and LVEF monitoring; strong CYP3A inducers reduce exposure."], asOf: AS_OF },
  { id: "cis-vinorelbine-adjuvant", name: "Cisplatin + vinorelbine (adjuvant)", cancers: ["nsclc"], setting: "Completely resected stage IB (4 cm or larger) to IIIA NSCLC", intent: "adjuvant", cycleDays: 28, cycles: "4",
    components: [c("Cisplatin", "cisplatin", "50 mg/m²", "IV", [1, 8]), c("Vinorelbine", "vinorelbine", "25 mg/m²", "IV", [1, 8, 15, 22])], emetogenicity: "high", gcsf: "not routine",
    source: { label: "JBR.10, NEJM 2005", url: doi("10.1056/NEJMoa043623") }, notes: ["Followed by osimertinib (EGFR), alectinib (ALK) or pembrolizumab/atezolizumab where eligible."], asOf: AS_OF },
  { id: "pacific", name: "Chemoradiation then durvalumab (PACIFIC)", cancers: ["nsclc"], setting: "Unresectable stage III NSCLC without progression after platinum-based chemoradiation", intent: "consolidation", cycleDays: 28, cycles: "12 months of durvalumab",
    components: [c("Durvalumab", "durvalumab", "10 mg/kg every 2 weeks or 1,500 mg every 4 weeks", "IV", [1])], emetogenicity: "minimal", gcsf: "not routine",
    trials: ["pacific"], source: { label: "PACIFIC, NEJM 2017", url: doi("10.1056/NEJMoa1709937") }, notes: ["Start within 42 days of the last radiotherapy fraction; pneumonitis risk is additive with radiation."], asOf: AS_OF },
  { id: "ep-sclc", name: "Cisplatin + etoposide (EP)", cancers: ["sclc", "nsclc", "neuroendocrine"], setting: "Limited-stage SCLC with concurrent thoracic radiotherapy; stage III NSCLC chemoradiation; high-grade neuroendocrine carcinoma", intent: "chemoradiation", cycleDays: 21, cycles: "4",
    components: [c("Cisplatin", "cisplatin", "75 mg/m²", "IV", [1]), c("Etoposide", "etoposide", "100 mg/m²", "IV", [1, 2, 3])], emetogenicity: "high", gcsf: "not routine",
    trials: ["adriatic", "convert"], drugs: ["platinum-etoposide"], source: { label: "NCCN Small Cell Lung Cancer; CONVERT, Lancet Oncology 2017", url: doi("10.1016/S1470-2045(17)30318-2") }, notes: ["ADRIATIC: durvalumab consolidation for up to 2 years after chemoradiation in limited-stage disease.", "G-CSF is generally avoided during concurrent thoracic radiotherapy."], asOf: AS_OF },
  { id: "ce-atezo", name: "Carboplatin + etoposide + atezolizumab (or durvalumab)", cancers: ["sclc"], setting: "Extensive-stage SCLC, first line", intent: "first line", cycleDays: 21, cycles: "4, then checkpoint inhibitor maintenance until progression",
    components: [c("Carboplatin", "carboplatin", "AUC 5", "IV", [1]), c("Etoposide", "etoposide", "100 mg/m²", "IV", [1, 2, 3]), c("Atezolizumab 1,200 mg (IMpower133) or durvalumab 1,500 mg (CASPIAN)", "atezolizumab", "day 1; maintenance every 3-4 weeks", "IV", [1])], emetogenicity: "moderate", gcsf: "not routine",
    trials: ["impower133", "caspian", "imforte"], drugs: ["platinum-etoposide", "durvalumab"], source: { label: "IMpower133, NEJM 2018", url: doi("10.1056/NEJMoa1809064") }, notes: ["IMforte: lurbinectedin added to atezolizumab maintenance improves PFS and OS."], asOf: AS_OF },
  { id: "topotecan-sclc", name: "Topotecan", cancers: ["sclc", "ovarian", "cervical"], setting: "Relapsed SCLC; platinum-resistant ovarian or cervical cancer", intent: "later line", cycleDays: 21, cycles: "until progression",
    components: [c("Topotecan", "topotecan", "1.5 mg/m² IV (or 2.3 mg/m² oral)", "IV", range(1, 5))], emetogenicity: "low", gcsf: "consider",
    source: { label: "NCCN Small Cell Lung Cancer; von Pawel, JCO 1999", url: doi("10.1200/JCO.1999.17.2.658") }, asOf: AS_OF },
  { id: "tarlatamab", name: "Tarlatamab", cancers: ["sclc"], setting: "Extensive-stage SCLC after platinum-based chemotherapy", intent: "later line", cycleDays: 14, cycles: "until progression (step-up in cycle 1)",
    components: [c("Tarlatamab", "tarlatamab", "1 mg day 1, 10 mg day 8 and day 15, then 10 mg every 2 weeks", "IV", [1, 8], { note: "inpatient monitoring 22-24 h after the first two doses for cytokine release syndrome" })], emetogenicity: "minimal", gcsf: "not routine",
    trials: ["dellphi-304"], source: { label: "DeLLphi-301, NEJM 2023", url: doi("10.1056/NEJMoa2307980") }, notes: ["CRS in about half of patients, mostly grade 1-2; ICANS-like neurotoxicity in about 10%."], asOf: AS_OF },
  { id: "cis-pem-meso", name: "Cisplatin + pemetrexed", cancers: ["mesothelioma", "nsclc"], setting: "Unresectable pleural mesothelioma (with or without bevacizumab); non-squamous NSCLC", intent: "first line", cycleDays: 21, cycles: "6",
    components: [c("Cisplatin", "cisplatin", "75 mg/m²", "IV", [1]), c("Pemetrexed", "pemetrexed", "500 mg/m²", "IV", [1])], emetogenicity: "high", gcsf: "not routine",
    trials: ["maps", "beat-meso"], source: { label: "Vogelzang, JCO 2003", url: doi("10.1200/JCO.2003.11.136") }, asOf: AS_OF },
  { id: "nivo-ipi-meso", name: "Nivolumab + ipilimumab (mesothelioma)", cancers: ["mesothelioma"], setting: "Unresectable pleural mesothelioma first line, especially non-epithelioid", intent: "first line", cycleDays: 42, cycles: "up to 2 years",
    components: [c("Nivolumab", "nivolumab", "360 mg every 3 weeks", "IV", [1, 22]), c("Ipilimumab", "ipilimumab", "1 mg/kg every 6 weeks", "IV", [1])], emetogenicity: "minimal", gcsf: "not routine",
    trials: ["checkmate-743"], source: { label: "CheckMate 743, Lancet 2021", url: doi("10.1016/S0140-6736(20)32714-8") }, asOf: AS_OF },

  // ============================ Genitourinary ============================
  { id: "ddmvac", name: "Dose-dense MVAC", aka: ["ddMVAC", "accelerated MVAC", "MVAC"], cancers: ["urothelial"], setting: "Muscle-invasive bladder cancer, cisplatin-eligible, before cystectomy", intent: "neoadjuvant", cycleDays: 14, cycles: "3-4 (6 in VESPER)",
    components: [c("Methotrexate", "methotrexate", "30 mg/m²", "IV", [1]), c("Vinblastine", "vinblastine", "3 mg/m²", "IV", [2]), c("Doxorubicin", "doxorubicin", "30 mg/m²", "IV", [2]), c("Cisplatin", "cisplatin", "70 mg/m²", "IV", [2])], emetogenicity: "high", gcsf: "built in",
    trials: ["niagara"], source: { label: "NCCN Bladder Cancer; Sternberg (EORTC 30924), JCO 2001", url: doi("10.1200/JCO.2001.19.10.2638") }, notes: ["NIAGARA (gemcitabine-cisplatin + durvalumab) is the alternative perioperative standard."], asOf: AS_OF },
  { id: "ev-pembro", name: "Enfortumab vedotin + pembrolizumab", cancers: ["urothelial"], setting: "Locally advanced or metastatic urothelial cancer, first line, regardless of cisplatin eligibility", intent: "first line", cycleDays: 21, cycles: "until progression; pembrolizumab up to 35 cycles",
    components: [c("Enfortumab vedotin", "enfortumab-vedotin", "1.25 mg/kg (maximum 125 mg)", "IV", [1, 8]), PEMBRO()], emetogenicity: "low", gcsf: "not routine",
    trials: ["ev-302"], source: { label: "EV-302 / KEYNOTE-A39, NEJM 2024", url: doi("10.1056/NEJMoa2312117") }, notes: ["Skin reactions (including SJS/TEN), peripheral neuropathy and hyperglycaemia are enfortumab's signals; hold for glucose above 13.9 mmol/L (250 mg/dL)."], asOf: AS_OF },
  { id: "bcg-induction-maintenance", name: "Intravesical BCG, induction and maintenance", cancers: ["urothelial"], setting: "High-risk non-muscle-invasive bladder cancer after complete TURBT", intent: "adjuvant", cycleDays: 7, cycles: "6 weekly inductions, then 3 weekly instillations at 3, 6, 12, 18, 24, 30 and 36 months",
    components: [c("BCG", "bcg-intravesical", "one full-dose vial (reduced dose during shortages)", "Intravesical", [1], { note: "held in the bladder for 2 hours" })], emetogenicity: "minimal", gcsf: "not routine",
    trials: ["potomac", "sunrise-1"], source: { label: "SWOG 8507 maintenance schedule; NCCN Bladder Cancer", url: NCCN.bladder }, asOf: AS_OF },
  { id: "docetaxel-prostate", name: "Docetaxel + prednisone", cancers: ["prostate"], setting: "Metastatic hormone-sensitive (with ADT, 6 cycles: CHAARTED, ARASENS) or castration-resistant prostate cancer", intent: "first line", cycleDays: 21, cycles: "6 (hormone-sensitive); up to 10 (castration-resistant)",
    components: [c("Docetaxel", "docetaxel", "75 mg/m²", "IV", [1]), c("Prednisone", undefined, "5 mg twice daily", "PO", range(1, 21))], emetogenicity: "low", gcsf: "consider",
    trials: ["chaarted", "arasens", "peace-1"], source: { label: "TAX 327, NEJM 2004; CHAARTED, NEJM 2015", url: doi("10.1056/NEJMoa1503747") }, notes: ["ARASENS adds darolutamide 600 mg twice daily; PEACE-1 adds abiraterone."], asOf: AS_OF },
  { id: "cabazitaxel", name: "Cabazitaxel + prednisone", cancers: ["prostate"], setting: "Metastatic castration-resistant prostate cancer after docetaxel and an AR-pathway inhibitor", intent: "later line", cycleDays: 21, cycles: "until progression (up to 10)",
    components: [c("Cabazitaxel", "cabazitaxel", "20 mg/m² (25 mg/m² in selected patients)", "IV", [1]), c("Prednisone", undefined, "10 mg once daily", "PO", range(1, 21))], emetogenicity: "low", gcsf: "recommended",
    source: { label: "CARD, NEJM 2019", url: doi("10.1056/NEJMoa1911206") }, notes: ["Primary G-CSF prophylaxis is advised at 25 mg/m² and for patients over 65 or with prior febrile neutropenia."], asOf: AS_OF },
  { id: "abiraterone", name: "Abiraterone + prednisone with ADT", cancers: ["prostate"], setting: "High-risk metastatic hormone-sensitive (LATITUDE, STAMPEDE) or castration-resistant prostate cancer", intent: "first line", cycleDays: 28, cycles: "until progression",
    components: [c("Abiraterone acetate", "abiraterone", "1,000 mg once daily on an empty stomach", "PO", range(1, 28)), c("Prednisone", undefined, "5 mg once daily (twice daily in castration-resistant disease)", "PO", range(1, 28)), c("GnRH agonist or antagonist", "leuprolide", "per depot schedule", "SC", [1])], emetogenicity: "minimal", gcsf: "not routine",
    trials: ["latitude", "stampede"], source: { label: "LATITUDE, NEJM 2017", url: doi("10.1056/NEJMoa1704174") }, notes: ["Food increases exposure up to tenfold; take at least 1 hour before or 2 hours after a meal.", "Monitor potassium, blood pressure and liver enzymes; hypokalaemia and hypertension are mineralocorticoid effects."], asOf: AS_OF },
  { id: "lu-psma", name: "177Lu-PSMA-617", cancers: ["prostate"], setting: "PSMA PET-positive metastatic castration-resistant prostate cancer after an AR-pathway inhibitor (PSMAfore) and, in VISION, after taxane", intent: "later line", cycleDays: 42, cycles: "6",
    components: [c("Lutetium-177 vipivotide tetraxetan", "pluvicto", "7.4 GBq", "IV", [1])], emetogenicity: "low", gcsf: "not routine",
    trials: ["vision", "psmafore", "psmaddition"], drugs: ["ga68-psma-11", "pylarify"], source: { label: "VISION, NEJM 2021", url: doi("10.1056/NEJMoa2107322") }, notes: ["Dry mouth, nausea, fatigue and cytopenias; renal function and marrow reserve are checked before each cycle."], asOf: AS_OF },
  { id: "bep", name: "BEP", cancers: ["testicular", "ovarian"], setting: "Metastatic germ cell tumour: 3 cycles good risk, 4 cycles intermediate or poor risk", intent: "curative", cycleDays: 21, cycles: "3 (good risk) or 4",
    components: [c("Bleomycin", "bleomycin", "30 units", "IV", [1, 8, 15]), c("Etoposide", "etoposide", "100 mg/m²", "IV", range(1, 5)), c("Cisplatin", "cisplatin", "20 mg/m²", "IV", range(1, 5))], emetogenicity: "high", gcsf: "consider",
    source: { label: "de Wit, JCO 2001 (3 vs 4 BEP); NCCN Testicular Cancer", url: doi("10.1200/JCO.2001.19.6.1629") }, notes: ["Bleomycin lung toxicity: avoid in smokers, renal impairment or age over 40 where EP × 4 is equivalent for good-risk disease.", "Cycles are given on schedule regardless of counts; delays cost cures."], asOf: AS_OF },
  { id: "nivo-ipi-rcc", name: "Nivolumab + ipilimumab (RCC)", cancers: ["rcc"], setting: "Untreated advanced clear-cell RCC, IMDC intermediate or poor risk", intent: "first line", cycleDays: 21, cycles: "4 combination, then nivolumab 240 mg every 2 weeks or 480 mg every 4 weeks",
    components: [c("Nivolumab", "nivolumab", "3 mg/kg", "IV", [1]), c("Ipilimumab", "ipilimumab", "1 mg/kg", "IV", [1])], emetogenicity: "minimal", gcsf: "not routine",
    trials: ["checkmate-214"], source: { label: "CheckMate 214, NEJM 2018", url: doi("10.1056/NEJMoa1712126") }, asOf: AS_OF },
  { id: "pembro-axitinib", name: "Pembrolizumab + axitinib", cancers: ["rcc"], setting: "Untreated advanced clear-cell RCC, any IMDC risk", intent: "first line", cycleDays: 21, cycles: "pembrolizumab up to 35 cycles; axitinib until progression",
    components: [PEMBRO(), c("Axitinib", "axitinib", "5 mg twice daily (titrate to 7 then 10 mg)", "PO", range(1, 21))], emetogenicity: "minimal", gcsf: "not routine",
    trials: ["keynote-426"], source: { label: "KEYNOTE-426, NEJM 2019", url: doi("10.1056/NEJMoa1816714") }, notes: ["Hepatitis on the combination can be either drug: hold both, then rechallenge axitinib first."], asOf: AS_OF },
  { id: "sunitinib", name: "Sunitinib 4/2", cancers: ["rcc", "gist", "neuroendocrine"], setting: "Advanced clear-cell RCC favourable risk or when immunotherapy is contraindicated; imatinib-resistant GIST; pancreatic NET", intent: "first line", cycleDays: 42, cycles: "until progression",
    components: [c("Sunitinib", "sunitinib", "50 mg once daily, 4 weeks on / 2 weeks off (37.5 mg continuous in NET)", "PO", range(1, 28))], emetogenicity: "minimal", gcsf: "not routine",
    trials: ["checkmate-214"], source: { label: "Motzer, NEJM 2007", url: doi("10.1056/NEJMoa065044") }, asOf: AS_OF },

  // ============================ Gynaecological ============================
  { id: "carbo-taxol", aka: ["CARBOPLATIN-TAXOL", "Carboplatin-paclitaxel"], name: "Carboplatin + paclitaxel", cancers: ["ovarian", "endometrial", "cervical", "nsclc"], setting: "Ovarian cancer adjuvant or neoadjuvant (6 cycles); advanced endometrial cancer with pembrolizumab or dostarlimab; NSCLC", intent: "first line", cycleDays: 21, cycles: "6",
    components: [c("Carboplatin", "carboplatin", "AUC 5-6", "IV", [1]), c("Paclitaxel", "paclitaxel", "175 mg/m²", "IV", [1])], emetogenicity: "high", gcsf: "not routine",
    trials: ["ruby", "nrg-gy018-keynote-868", "duo-e"], source: { label: "GOG-158 (Ozols), JCO 2003; NCCN Ovarian Cancer", url: doi("10.1200/JCO.2003.02.153") }, notes: ["Carboplatin AUC 4 or above is classed as highly emetogenic by NCCN; three-drug prophylaxis including an NK1 antagonist.", "RUBY: dostarlimab 500 mg every 3 weeks × 6 then 1,000 mg every 6 weeks up to 3 years. NRG-GY018: pembrolizumab 200 mg every 3 weeks × 6 then 400 mg every 6 weeks."], asOf: AS_OF },
  { id: "carbo-taxol-bev", aka: ["Carboplatin-paclitaxel-bevacizumab"], name: "Carboplatin + paclitaxel + bevacizumab, then bevacizumab maintenance", cancers: ["ovarian"], setting: "Stage III-IV ovarian cancer, especially with residual disease or ascites", intent: "first line", cycleDays: 21, cycles: "6 with chemotherapy; bevacizumab to 15 months (GOG-218) or 12 months (ICON7)",
    components: [c("Carboplatin", "carboplatin", "AUC 6", "IV", [1]), c("Paclitaxel", "paclitaxel", "175 mg/m²", "IV", [1]), c("Bevacizumab", "bevacizumab", "15 mg/kg (7.5 mg/kg in ICON7), from cycle 2", "IV", [1])], emetogenicity: "high", gcsf: "not routine",
    trials: ["gog-0218-icon7", "paola-1"], source: { label: "GOG-0218, NEJM 2011", url: doi("10.1056/NEJMoa1104390") }, notes: ["PAOLA-1: add olaparib 300 mg twice daily for 2 years in HRD-positive disease."], asOf: AS_OF },
  { id: "weekly-paclitaxel-ovarian", name: "Weekly paclitaxel", cancers: ["ovarian", "breast-hr-positive", "tnbc"], setting: "Platinum-resistant ovarian cancer (with or without bevacizumab); metastatic breast cancer", intent: "later line", cycleDays: 28, cycles: "until progression",
    components: [c("Paclitaxel", "paclitaxel", "80 mg/m²", "IV", [1, 8, 15]), c("Bevacizumab (optional, AURELIA)", "bevacizumab", "10 mg/kg", "IV", [1, 15])], emetogenicity: "low", gcsf: "not routine",
    trials: ["mirasol"], source: { label: "AURELIA, JCO 2014", url: doi("10.1200/JCO.2013.51.4489") }, asOf: AS_OF },
  { id: "pld-ovarian", name: "Pegylated liposomal doxorubicin", cancers: ["ovarian", "kaposi-sarcoma", "multiple-myeloma"], setting: "Platinum-resistant or partially platinum-sensitive ovarian cancer; Kaposi sarcoma", intent: "later line", cycleDays: 28, cycles: "until progression",
    components: [c("Pegylated liposomal doxorubicin", "pegylated-liposomal-doxorubicin", "40 mg/m² (20 mg/m² every 2-3 weeks in Kaposi sarcoma)", "IV", [1])], emetogenicity: "low", gcsf: "not routine",
    source: { label: "Gordon, JCO 2001; NCCN Ovarian Cancer", url: doi("10.1200/JCO.2001.19.14.3312") }, notes: ["Hand-foot syndrome and stomatitis; cardiotoxicity lower than conventional doxorubicin but cumulative dose still counts."], asOf: AS_OF },
  { id: "olaparib-maintenance", name: "Olaparib maintenance", cancers: ["ovarian", "prostate", "pancreatic"], setting: "Newly diagnosed BRCA-mutant advanced ovarian cancer after platinum response (2 years); recurrent platinum-sensitive disease; BRCA/HRR-mutant prostate; germline BRCA pancreatic after platinum", intent: "maintenance", cycleDays: 28, cycles: "2 years (SOLO-1) or until progression",
    components: [c("Olaparib", "olaparib", "300 mg twice daily", "PO", range(1, 28))], emetogenicity: "low", gcsf: "not routine",
    trials: ["solo-1", "profound", "polo", "propel"], source: { label: "SOLO-1, NEJM 2018", url: doi("10.1056/NEJMoa1810858") }, notes: ["Anaemia is the commonest dose-limiting toxicity; check blood counts monthly for the first year."], asOf: AS_OF },
  { id: "niraparib-maintenance", name: "Niraparib maintenance", cancers: ["ovarian"], setting: "Newly diagnosed advanced ovarian cancer after platinum response, regardless of BRCA status", intent: "maintenance", cycleDays: 28, cycles: "3 years (PRIMA) or until progression",
    components: [c("Niraparib", "niraparib", "200 mg once daily if weight under 77 kg or platelets under 150 × 10⁹/L; otherwise 300 mg", "PO", range(1, 28))], emetogenicity: "low", gcsf: "not routine",
    trials: ["prima"], source: { label: "PRIMA, NEJM 2019", url: doi("10.1056/NEJMoa1910962") }, notes: ["Individualised starting dose cut grade 3 thrombocytopenia from 48% to 21%."], asOf: AS_OF },
  { id: "mirvetuximab", name: "Mirvetuximab soravtansine", cancers: ["ovarian"], setting: "Folate receptor alpha-high platinum-resistant ovarian cancer, 1-3 prior lines", intent: "later line", cycleDays: 21, cycles: "until progression",
    components: [c("Mirvetuximab soravtansine", "mirvetuximab-soravtansine", "6 mg/kg adjusted ideal body weight", "IV", [1])], emetogenicity: "low", gcsf: "not routine",
    trials: ["mirasol"], source: { label: "MIRASOL, NEJM 2023", url: doi("10.1056/NEJMoa2309169") }, notes: ["Ocular toxicity: baseline and periodic eye examination, steroid and lubricating eye drops."], asOf: AS_OF },
  { id: "cisplatin-crt-cervical", name: "Weekly cisplatin chemoradiation (with pembrolizumab for high-risk disease)", cancers: ["cervical", "vulvar", "head-and-neck"], setting: "Locally advanced cervical cancer (FIGO IB2-IVA); pembrolizumab for FIGO 2014 III-IVA or node-positive", intent: "chemoradiation", cycleDays: 7, cycles: "5-6 weekly doses with external beam and brachytherapy",
    components: [c("Cisplatin", "cisplatin", "40 mg/m² (maximum 70 mg)", "IV", [1]), c("Pembrolizumab (KEYNOTE-A18)", "pembrolizumab", "200 mg every 3 weeks × 5, then 400 mg every 6 weeks × 15", "IV", [1], { note: "every third week" }), c("Radiotherapy", undefined, "45-50.4 Gy external beam plus brachytherapy", "RT", range(1, 5))], emetogenicity: "moderate", gcsf: "not routine",
    trials: ["keynote-a18", "interlace"], source: { label: "Rose, NEJM 1999; NCCN Cervical Cancer", url: doi("10.1056/NEJM199904153401502") }, notes: ["INTERLACE: 6 weeks of induction carboplatin AUC 2 + paclitaxel 80 mg/m² before chemoradiation improved OS."], asOf: AS_OF },
  { id: "keynote-826", name: "Pembrolizumab + platinum + paclitaxel ± bevacizumab (cervical)", cancers: ["cervical"], setting: "Persistent, recurrent or metastatic cervical cancer, PD-L1 CPS 1 or above", intent: "first line", cycleDays: 21, cycles: "chemotherapy 6; pembrolizumab up to 35",
    components: [PEMBRO(), c("Paclitaxel", "paclitaxel", "175 mg/m²", "IV", [1]), c("Cisplatin 50 mg/m² or carboplatin AUC 5", "cisplatin", "day 1", "IV", [1]), c("Bevacizumab (optional)", "bevacizumab", "15 mg/kg", "IV", [1])], emetogenicity: "high", gcsf: "not routine",
    trials: ["keynote-826"], source: { label: "KEYNOTE-826, NEJM 2021", url: doi("10.1056/NEJMoa2112435") }, asOf: AS_OF },

  // ============================ Haematological ============================
  { id: "r-chop", aka: ["R-CHOP-21"], name: "R-CHOP", cancers: ["dlbcl", "follicular-lymphoma", "mantle-cell-lymphoma"], setting: "Diffuse large B-cell lymphoma, first line (6 cycles; 3-4 with radiotherapy for limited stage)", intent: "curative", cycleDays: 21, cycles: "6",
    components: [c("Rituximab", "rituximab", "375 mg/m²", "IV", [1]), c("Cyclophosphamide", "cyclophosphamide", "750 mg/m²", "IV", [1]), c("Doxorubicin", "doxorubicin", "50 mg/m²", "IV", [1]), c("Vincristine", "vincristine", "1.4 mg/m² (maximum 2 mg)", "IV", [1]), c("Prednisone", undefined, "100 mg once daily", "PO", range(1, 5))], emetogenicity: "moderate", gcsf: "consider",
    trials: ["polarix"], source: { label: "Coiffier (GELA LNH-98.5), NEJM 2002", url: doi("10.1056/NEJMoa011795") }, notes: ["G-CSF is recommended for patients over 65 or with comorbidity (FN risk 10-20%).", "Hepatitis B serology before rituximab; check LVEF before doxorubicin."], asOf: AS_OF },
  { id: "pola-r-chp", name: "Pola-R-CHP", cancers: ["dlbcl"], setting: "Untreated DLBCL, IPI 2-5", intent: "curative", cycleDays: 21, cycles: "6, then rituximab alone cycles 7-8",
    components: [c("Polatuzumab vedotin", "polatuzumab-vedotin", "1.8 mg/kg", "IV", [1]), c("Rituximab", "rituximab", "375 mg/m²", "IV", [1]), c("Cyclophosphamide", "cyclophosphamide", "750 mg/m²", "IV", [1]), c("Doxorubicin", "doxorubicin", "50 mg/m²", "IV", [1]), c("Prednisone", undefined, "100 mg once daily", "PO", range(1, 5))], emetogenicity: "moderate", gcsf: "recommended",
    trials: ["polarix"], source: { label: "POLARIX, NEJM 2022", url: doi("10.1056/NEJMoa2115304") }, notes: ["Vincristine is replaced by polatuzumab; G-CSF primary prophylaxis was mandated in POLARIX."], asOf: AS_OF },
  { id: "r-ice", name: "R-ICE", cancers: ["dlbcl"], setting: "Relapsed or refractory DLBCL, salvage before autologous transplant (late relapse) or bridging", intent: "induction", cycleDays: 14, cycles: "2-3",
    components: [c("Rituximab", "rituximab", "375 mg/m²", "IV", [1]), c("Etoposide", "etoposide", "100 mg/m²", "IV", [1, 2, 3]), c("Carboplatin", "carboplatin", "AUC 5 (maximum 800 mg)", "IV", [2]), c("Ifosfamide", "ifosfamide", "5,000 mg/m² with mesna", "IV", [2], { infusionHours: 24 })], emetogenicity: "high", gcsf: "built in",
    trials: ["zuma-7", "transform"], source: { label: "Kewalramani, Blood 2004", url: doi("10.1182/blood-2003-11-3911") }, notes: ["ZUMA-7 and TRANSFORM: CAR-T beats salvage chemotherapy plus transplant for early relapse (within 12 months)."], asOf: AS_OF },
  { id: "abvd", name: "ABVD", cancers: ["hodgkin-lymphoma"], setting: "Classical Hodgkin lymphoma: 2-4 cycles early stage (PET-adapted), 6 cycles advanced stage", intent: "curative", cycleDays: 28, cycles: "2-6",
    components: [c("Doxorubicin", "doxorubicin", "25 mg/m²", "IV", [1, 15]), c("Bleomycin", "bleomycin", "10 units/m²", "IV", [1, 15]), c("Vinblastine", "vinblastine", "6 mg/m²", "IV", [1, 15]), c("Dacarbazine", undefined, "375 mg/m²", "IV", [1, 15])], emetogenicity: "high", gcsf: "not routine",
    trials: ["rathl"], source: { label: "RATHL, NEJM 2016 (PET-adapted omission of bleomycin)", url: doi("10.1056/NEJMoa1510093") }, notes: ["RATHL: drop bleomycin after a negative interim PET (AVD) with no loss of efficacy.", "Give on schedule regardless of neutrophil count; G-CSF increases bleomycin lung toxicity."], asOf: AS_OF },
  { id: "bv-avd", name: "BV-AVD", cancers: ["hodgkin-lymphoma"], setting: "Stage III-IV classical Hodgkin lymphoma", intent: "curative", cycleDays: 28, cycles: "6",
    components: [c("Brentuximab vedotin", "brentuximab-vedotin", "1.2 mg/kg", "IV", [1, 15]), c("Doxorubicin", "doxorubicin", "25 mg/m²", "IV", [1, 15]), c("Vinblastine", "vinblastine", "6 mg/m²", "IV", [1, 15]), c("Dacarbazine", undefined, "375 mg/m²", "IV", [1, 15])], emetogenicity: "high", gcsf: "recommended",
    trials: ["echelon-1"], source: { label: "ECHELON-1, NEJM 2018", url: doi("10.1056/NEJMoa1708984") }, notes: ["Primary G-CSF prophylaxis after excess febrile neutropenia in the trial; peripheral neuropathy in two-thirds."], asOf: AS_OF },
  { id: "n-avd", name: "N-AVD (nivolumab + AVD)", cancers: ["hodgkin-lymphoma"], setting: "Stage III-IV classical Hodgkin lymphoma, age 12 and above", intent: "curative", cycleDays: 28, cycles: "6",
    components: [c("Nivolumab", "nivolumab", "240 mg (3 mg/kg under 18 years)", "IV", [1, 15]), c("Doxorubicin", "doxorubicin", "25 mg/m²", "IV", [1, 15]), c("Vinblastine", "vinblastine", "6 mg/m²", "IV", [1, 15]), c("Dacarbazine", undefined, "375 mg/m²", "IV", [1, 15])], emetogenicity: "high", gcsf: "consider",
    trials: ["swog-s1826"], source: { label: "SWOG S1826, NEJM 2024", url: doi("10.1056/NEJMoa2405888") }, asOf: AS_OF },
  { id: "br", name: "Bendamustine + rituximab (BR)", cancers: ["follicular-lymphoma", "mantle-cell-lymphoma", "cll", "waldenstrom"], setting: "Indolent lymphoma and mantle cell lymphoma first line; fit CLL without del(17p) where targeted agents are unavailable", intent: "first line", cycleDays: 28, cycles: "6",
    components: [c("Bendamustine", "bendamustine", "90 mg/m² (70 mg/m² in CLL combinations)", "IV", [1, 2]), c("Rituximab", "rituximab", "375 mg/m²", "IV", [1])], emetogenicity: "moderate", gcsf: "not routine",
    source: { label: "StiL NHL1, Lancet 2013", url: doi("10.1016/S0140-6736(12)61763-2") }, notes: ["Prolonged lymphopenia: PJP and herpes prophylaxis; avoid BR immediately before CAR-T collection."], asOf: AS_OF },
  { id: "ven-obi", name: "Venetoclax + obinutuzumab (fixed duration)", cancers: ["cll"], setting: "Untreated CLL, all fitness levels", intent: "first line", cycleDays: 28, cycles: "12 (venetoclax cycles 1 day 22 to end of cycle 12; obinutuzumab cycles 1-6)",
    components: [c("Obinutuzumab", "obinutuzumab", "100 mg day 1, 900 mg day 2, 1,000 mg days 8 and 15 (cycle 1); 1,000 mg day 1 cycles 2-6", "IV", [1, 2, 8, 15]), c("Venetoclax", "venetoclax", "20 → 50 → 100 → 200 → 400 mg weekly ramp-up from cycle 1 day 22, then 400 mg daily", "PO", range(22, 28))], emetogenicity: "minimal", gcsf: "not routine",
    trials: ["cll14", "cll13-gaia"], source: { label: "CLL14, NEJM 2019", url: doi("10.1056/NEJMoa1815281") }, notes: ["Tumour lysis risk stratified by lymph node size and lymphocyte count; hospital ramp-up for high risk.", "Strong CYP3A inhibitors are contraindicated during ramp-up."], asOf: AS_OF },
  { id: "vrd", name: "VRd", cancers: ["multiple-myeloma"], setting: "Newly diagnosed myeloma (with daratumumab as D-VRd in transplant-eligible patients)", intent: "induction", cycleDays: 21, cycles: "8 (SWOG S0777); 4-6 before transplant",
    components: [c("Bortezomib", "bortezomib", "1.3 mg/m²", "SC", [1, 4, 8, 11]), c("Lenalidomide", "lenalidomide", "25 mg once daily", "PO", range(1, 14)), c("Dexamethasone", undefined, "20 mg", "PO", [1, 2, 4, 5, 8, 9, 11, 12])], emetogenicity: "minimal", gcsf: "not routine",
    trials: ["perseus", "imroz"], source: { label: "SWOG S0777, Lancet 2017", url: doi("10.1016/S0140-6736(16)31594-X") }, notes: ["Weekly bortezomib (VRd-lite, 35-day cycles) is standard for frail patients.", "Thromboprophylaxis with lenalidomide-dexamethasone; herpes zoster prophylaxis with bortezomib."], asOf: AS_OF },
  { id: "d-vrd", name: "D-VRd (PERSEUS)", cancers: ["multiple-myeloma"], setting: "Newly diagnosed transplant-eligible myeloma: 4 induction cycles, ASCT, 2 consolidation cycles, then D-R maintenance", intent: "induction", cycleDays: 28, cycles: "4 induction, 2 consolidation",
    components: [c("Daratumumab", "daratumumab", "1,800 mg weekly cycles 1-2, every 2 weeks cycles 3-6, every 4 weeks thereafter", "SC", [1, 8, 15, 22]), c("Bortezomib", "bortezomib", "1.3 mg/m²", "SC", [1, 4, 8, 11]), c("Lenalidomide", "lenalidomide", "25 mg once daily", "PO", range(1, 21)), c("Dexamethasone", undefined, "40 mg", "PO", [1, 2, 3, 4, 9, 10, 11, 12])], emetogenicity: "minimal", gcsf: "not routine",
    trials: ["perseus", "cepheus"], source: { label: "PERSEUS, NEJM 2024", url: doi("10.1056/NEJMoa2312054") }, asOf: AS_OF },
  { id: "drd", name: "DRd (daratumumab + lenalidomide + dexamethasone)", cancers: ["multiple-myeloma"], setting: "Newly diagnosed transplant-ineligible myeloma (MAIA); relapsed myeloma (POLLUX)", intent: "first line", cycleDays: 28, cycles: "until progression",
    components: [c("Daratumumab", "daratumumab", "16 mg/kg IV or 1,800 mg SC: weekly cycles 1-2, every 2 weeks cycles 3-6, then every 4 weeks", "SC", [1, 8, 15, 22]), c("Lenalidomide", "lenalidomide", "25 mg once daily", "PO", range(1, 21)), c("Dexamethasone", undefined, "40 mg weekly (20 mg over 75 years)", "PO", [1, 8, 15, 22])], emetogenicity: "minimal", gcsf: "not routine",
    source: { label: "MAIA, NEJM 2019", url: doi("10.1056/NEJMoa1817249") }, asOf: AS_OF },
  { id: "melphalan-asct", name: "High-dose melphalan and autologous stem-cell transplant", cancers: ["multiple-myeloma"], setting: "Transplant-eligible myeloma after induction", intent: "consolidation", cycleDays: 1, cycles: "1 (tandem in selected high-risk patients)",
    components: [c("Melphalan", "melphalan", "200 mg/m² (140 mg/m² if over 70 or renal impairment)", "IV", [1], { note: "day -2 or -1; stem cells reinfused day 0" })], emetogenicity: "high", gcsf: "built in",
    source: { label: "IFM 2009, NEJM 2017", url: doi("10.1056/NEJMoa1611750") }, notes: ["Followed by lenalidomide 10 mg maintenance (with daratumumab in PERSEUS) until progression."], asOf: AS_OF },
  { id: "lenalidomide-maintenance", name: "Lenalidomide maintenance", cancers: ["multiple-myeloma"], setting: "After autologous transplant", intent: "maintenance", cycleDays: 28, cycles: "until progression (or 2 years in some protocols)",
    components: [c("Lenalidomide", "lenalidomide", "10 mg once daily (15 mg after 3 months if tolerated)", "PO", range(1, 21))], emetogenicity: "minimal", gcsf: "not routine",
    source: { label: "McCarthy meta-analysis, JCO 2017", url: doi("10.1200/JCO.2017.72.6679") }, notes: ["Second primary malignancies are increased; the OS benefit outweighs them."], asOf: AS_OF },
  { id: "teclistamab", name: "Teclistamab", cancers: ["multiple-myeloma"], setting: "Relapsed or refractory myeloma after 3 or more lines including a PI, IMiD and CD38 antibody", intent: "later line", cycleDays: 7, cycles: "weekly until progression; every 2 weeks after 6 months in complete response",
    components: [c("Teclistamab", "teclistamab", "step-up 0.06 mg/kg and 0.3 mg/kg, then 1.5 mg/kg weekly", "SC", [1], { note: "step-up doses 2-4 days apart with inpatient monitoring" })], emetogenicity: "minimal", gcsf: "not routine",
    trials: ["majestec-1", "majestec-3"], source: { label: "MajesTEC-1, NEJM 2022", url: doi("10.1056/NEJMoa2203478") }, notes: ["CRS in 72% (mostly grade 1-2); infections in 76%: IVIG for hypogammaglobulinaemia, PJP and antiviral prophylaxis."], asOf: AS_OF },
  { id: "7-3", name: "7+3 (cytarabine + anthracycline) ± midostaurin", cancers: ["aml"], setting: "Fit adults with newly diagnosed AML; midostaurin for FLT3-mutated disease (quizartinib for FLT3-ITD)", intent: "induction", cycleDays: 28, cycles: "1-2 induction, then consolidation",
    components: [c("Cytarabine", undefined, "100-200 mg/m² per day", "IV", range(1, 7), { infusionHours: 168 }), c("Daunorubicin 60-90 mg/m² or idarubicin 12 mg/m²", undefined, "daily", "IV", [1, 2, 3]), c("Midostaurin (FLT3-mutated)", "midostaurin", "50 mg twice daily", "PO", range(8, 21))], emetogenicity: "moderate", gcsf: "not routine",
    trials: ["ratify", "quantum-first"], drugs: ["cytarabine-7-3", "quizartinib"], source: { label: "RATIFY, NEJM 2017; NCCN Acute Myeloid Leukemia", url: doi("10.1056/NEJMoa1614359") }, notes: ["Gemtuzumab ozogamicin 3 mg/m² on days 1, 4 and 7 is added for favourable-risk CD33-positive AML (ALFA-0701)."], asOf: AS_OF },
  { id: "ven-aza", name: "Venetoclax + azacitidine", cancers: ["aml", "mds"], setting: "Newly diagnosed AML unfit for intensive chemotherapy", intent: "first line", cycleDays: 28, cycles: "until progression",
    components: [c("Azacitidine", "azacitidine", "75 mg/m²", "SC", range(1, 7)), c("Venetoclax", "venetoclax", "100 mg day 1, 200 mg day 2, then 400 mg daily (cycle 1 ramp-up); often days 1-21 from cycle 2", "PO", range(1, 28))], emetogenicity: "moderate", gcsf: "not routine",
    trials: ["viale-a"], source: { label: "VIALE-A, NEJM 2020", url: doi("10.1056/NEJMoa2012971") }, notes: ["Azole antifungals: reduce venetoclax to 100 mg (posaconazole) or 200 mg (voriconazole).", "Marrow at day 21-28 of cycle 1; delay the next cycle if hypoplastic and in remission."], asOf: AS_OF },
  { id: "atra-ato", name: "ATRA + arsenic trioxide", cancers: ["aml"], setting: "Low or intermediate-risk acute promyelocytic leukaemia (WBC 10 × 10⁹/L or less)", intent: "induction", cycleDays: 28, cycles: "induction until complete remission (up to 60 days), then 4 consolidation courses",
    components: [c("Tretinoin (ATRA)", "tretinoin-atra", "45 mg/m² per day in two doses", "PO", range(1, 28)), c("Arsenic trioxide", "arsenic-trioxide", "0.15 mg/kg per day", "IV", range(1, 28))], emetogenicity: "minimal", gcsf: "not routine",
    source: { label: "Lo-Coco (APL0406), NEJM 2013", url: doi("10.1056/NEJMoa1300874") }, notes: ["Differentiation syndrome: start dexamethasone 10 mg twice daily at the first sign; QTc and electrolytes with arsenic."], asOf: AS_OF },
  { id: "blinatumomab", name: "Blinatumomab", cancers: ["all-leukemia"], setting: "B-ALL: MRD-positive, relapsed/refractory, or consolidation in frontline regimens (E1910, AALL1731)", intent: "consolidation", cycleDays: 42, cycles: "2 (consolidation) to 5",
    components: [c("Blinatumomab", "blinatumomab", "28 µg/day continuous infusion (9 µg/day days 1-7 of cycle 1 in relapsed disease)", "IV", range(1, 28), { infusionHours: 672 })], emetogenicity: "minimal", gcsf: "not routine",
    trials: ["tower", "e1910", "aall1731"], source: { label: "TOWER, NEJM 2017; E1910, NEJM 2024", url: doi("10.1056/NEJMoa1609783") }, notes: ["Dexamethasone premedication; hospital admission for the first 3 days of cycle 1 and 2 days of cycle 2 for CRS and neurotoxicity."], asOf: AS_OF },
  { id: "inotuzumab", name: "Inotuzumab ozogamicin", cancers: ["all-leukemia"], setting: "Relapsed or refractory CD22-positive B-ALL", intent: "later line", cycleDays: 21, cycles: "up to 6 (2-3 if proceeding to transplant)",
    components: [c("Inotuzumab ozogamicin", "inotuzumab-ozogamicin", "0.8 mg/m² day 1, 0.5 mg/m² days 8 and 15 (cycle 1); 0.5 mg/m² all doses once in remission", "IV", [1, 8, 15])], emetogenicity: "low", gcsf: "not routine",
    trials: ["ino-vate"], source: { label: "INO-VATE, NEJM 2016", url: doi("10.1056/NEJMoa1509277") }, notes: ["Veno-occlusive disease after transplant: limit to 2 cycles and avoid dual-alkylator conditioning."], asOf: AS_OF },
  { id: "flu-cy-car-t", name: "Fludarabine + cyclophosphamide lymphodepletion, then CD19 CAR-T", cancers: ["dlbcl", "all-leukemia", "follicular-lymphoma", "mantle-cell-lymphoma"], setting: "Relapsed or refractory large B-cell lymphoma (second line if refractory or relapse within 12 months), B-ALL, follicular and mantle cell lymphoma", intent: "curative", cycleDays: 6, cycles: "single course (days -5 to 0)",
    components: [c("Fludarabine", undefined, "30 mg/m² per day", "IV", [1, 2, 3], { note: "days -5 to -3" }), c("Cyclophosphamide", "cyclophosphamide", "500 mg/m² per day", "IV", [1, 2, 3], { note: "days -5 to -3" }), c("CAR-T cells (axicabtagene, lisocabtagene, tisagenlecleucel)", "axicabtagene-ciloleucel", "product-specific dose, e.g. 2 × 10⁶ CAR-positive cells/kg", "IV", [6], { note: "day 0" })], emetogenicity: "moderate", gcsf: "not routine",
    trials: ["zuma-7", "transform", "eliana"], drugs: ["lisocabtagene-maraleucel", "tisagenlecleucel"], source: { label: "ZUMA-7, NEJM 2022", url: doi("10.1056/NEJMoa2116133") }, notes: ["Tocilizumab for CRS grade 2 and above; dexamethasone for ICANS. Bridging therapy is often needed during manufacture."], asOf: AS_OF },
  { id: "imatinib", name: "Imatinib", cancers: ["cml", "gist", "all-leukemia"], setting: "Chronic-phase CML; adjuvant GIST for 3 years after resection of high-risk tumours; metastatic GIST", intent: "first line", cycleDays: 28, cycles: "indefinite (CML; treatment-free remission in deep response); 3 years adjuvant GIST",
    components: [c("Imatinib", "imatinib", "400 mg once daily with food (600-800 mg for KIT exon 9 GIST or accelerated phase)", "PO", range(1, 28))], emetogenicity: "minimal", gcsf: "not routine",
    trials: ["ssgxviii"], source: { label: "IRIS, NEJM 2003; SSGXVIII/AIO, JAMA 2012", url: doi("10.1056/NEJMoa022457") }, asOf: AS_OF },

  // ============================ Skin ============================
  { id: "nivo-ipi-melanoma", name: "Nivolumab + ipilimumab (melanoma)", cancers: ["melanoma", "uveal-melanoma"], setting: "Unresectable or metastatic melanoma, especially with brain metastases or PD-L1-negative disease", intent: "first line", cycleDays: 21, cycles: "4 combination, then nivolumab 480 mg every 4 weeks up to 2 years",
    components: [c("Ipilimumab", "ipilimumab", "3 mg/kg", "IV", [1]), c("Nivolumab", "nivolumab", "1 mg/kg", "IV", [1])], emetogenicity: "minimal", gcsf: "not routine",
    trials: ["checkmate-067", "dreamseq"], source: { label: "CheckMate 067, NEJM 2015; 10-year update NEJM 2025", url: doi("10.1056/NEJMoa1504030") }, notes: ["Grade 3-4 immune-related events in about 59%; the flipped-dose (nivolumab 3 mg/kg + ipilimumab 1 mg/kg, CheckMate 511) is less toxic."], asOf: AS_OF },
  { id: "pembrolizumab-flat", name: "Pembrolizumab monotherapy", cancers: ["melanoma", "nsclc", "head-and-neck", "colorectal", "cutaneous-scc", "merkel-cell-carcinoma"], setting: "Adjuvant melanoma stage IIB-IV (1 year); PD-L1 TPS 50% or above NSCLC; MSI-high tumours; recurrent head and neck (CPS 1 or above)", intent: "first line", cycleDays: 21, cycles: "up to 35 cycles (2 years); 17 cycles adjuvant melanoma",
    components: [c("Pembrolizumab", "pembrolizumab", "200 mg every 3 weeks or 400 mg every 6 weeks", "IV", [1])], emetogenicity: "minimal", gcsf: "not routine",
    trials: ["keynote-006", "keynote-716", "keynote-024-189", "keynote-177", "keynote-048"], source: { label: "KEYNOTE-006, NEJM 2015; FDA label (flat dosing)", url: doi("10.1056/NEJMoa1503093") }, asOf: AS_OF },
  { id: "dab-tram", name: "Dabrafenib + trametinib", cancers: ["melanoma", "nsclc", "thyroid", "glioblastoma"], setting: "BRAF V600-mutant melanoma (adjuvant 1 year or metastatic), NSCLC, anaplastic thyroid cancer and tumour-agnostic use", intent: "first line", cycleDays: 28, cycles: "until progression; 12 months adjuvant",
    components: [c("Dabrafenib", "dabrafenib-trametinib", "150 mg twice daily", "PO", range(1, 28)), c("Trametinib", "dabrafenib-trametinib", "2 mg once daily", "PO", range(1, 28))], emetogenicity: "low", gcsf: "not routine",
    trials: ["combi-ad", "roar-atc"], source: { label: "COMBI-d, NEJM 2014; COMBI-AD, NEJM 2017", url: doi("10.1056/NEJMoa1406037") }, notes: ["Pyrexia in over half of patients: interrupt both drugs at the first fever.", "Dabrafenib induces CYP3A4 and CYP2C9: hormonal contraception may fail."], asOf: AS_OF },
  { id: "nivo-rela", name: "Nivolumab + relatlimab", cancers: ["melanoma"], setting: "Unresectable or metastatic melanoma, first line", intent: "first line", cycleDays: 28, cycles: "until progression",
    components: [c("Nivolumab + relatlimab (fixed dose)", "relatlimab-nivolumab", "480 mg nivolumab / 160 mg relatlimab", "IV", [1])], emetogenicity: "minimal", gcsf: "not routine",
    trials: ["relativity-047"], source: { label: "RELATIVITY-047, NEJM 2022", url: doi("10.1056/NEJMoa2109970") }, asOf: AS_OF },

  // ============================ Sarcoma and paediatric ============================
  { id: "doxorubicin-sts", name: "Doxorubicin", cancers: ["sarcoma"], setting: "Advanced soft-tissue sarcoma, first line", intent: "first line", cycleDays: 21, cycles: "6 (cumulative dose 450 mg/m²)",
    components: [c("Doxorubicin", "doxorubicin", "75 mg/m²", "IV", [1])], emetogenicity: "moderate", gcsf: "consider",
    source: { label: "EORTC 62012, Lancet Oncology 2014", url: doi("10.1016/S1470-2045(14)70063-4") }, notes: ["Doxorubicin + ifosfamide (AIM) adds response rate but not survival; reserve for symptomatic bulk or neoadjuvant use (ISG-STS 1001)."], asOf: AS_OF },
  { id: "trabectedin", name: "Trabectedin", cancers: ["sarcoma"], setting: "Liposarcoma and leiomyosarcoma after an anthracycline", intent: "later line", cycleDays: 21, cycles: "until progression",
    components: [c("Trabectedin", "trabectedin", "1.5 mg/m² through a central line", "IV", [1], { infusionHours: 24 })], emetogenicity: "moderate", gcsf: "not routine",
    source: { label: "Demetri, JCO 2016", url: doi("10.1200/JCO.2015.62.4734") }, notes: ["Dexamethasone 20 mg IV 30 minutes before each dose reduces hepatotoxicity."], asOf: AS_OF },
  { id: "vdc-ie", name: "Interval-compressed VDC/IE", cancers: ["ewing-sarcoma"], setting: "Localised Ewing sarcoma, 14 alternating cycles (induction then consolidation around local therapy)", intent: "curative", cycleDays: 28, cycles: "7 alternating pairs (14 cycles, each 2 weeks)",
    components: [c("Vincristine", "vincristine", "2 mg/m² (maximum 2 mg)", "IV", [1]), c("Doxorubicin", "doxorubicin", "37.5 mg/m² per day (75 mg/m² per cycle; dactinomycin replaces it after 375 mg/m²)", "IV", [1, 2]), c("Cyclophosphamide", "cyclophosphamide", "1,200 mg/m² with mesna", "IV", [1]), c("Ifosfamide", "ifosfamide", "1,800 mg/m² per day with mesna", "IV", range(15, 19)), c("Etoposide", "etoposide", "100 mg/m² per day", "IV", range(15, 19))], emetogenicity: "high", gcsf: "built in",
    trials: ["euro-ewing-2012", "int-0091"], source: { label: "AEWS0031, JCO 2012 (Womer)", url: doi("10.1200/JCO.2011.41.5703") }, notes: ["Every-2-week cycles improved 5-year EFS from 65% to 73% versus every 3 weeks, with G-CSF after each cycle."], asOf: AS_OF },
  { id: "map", name: "MAP (methotrexate, doxorubicin, cisplatin)", cancers: ["osteosarcoma"], setting: "Resectable high-grade osteosarcoma, patients under 40: 10 weeks before surgery, then postoperative cycles to about 29 weeks", intent: "curative", cycleDays: 35, cycles: "2 preoperative blocks; postoperative blocks to complete 12 methotrexate doses",
    components: [c("Cisplatin", "cisplatin", "120 mg/m²", "IV", [1]), c("Doxorubicin", "doxorubicin", "37.5 mg/m² per day", "IV", [1, 2]), c("High-dose methotrexate", "methotrexate", "12 g/m² (maximum 20 g) with leucovorin rescue", "IV", [22, 29], { infusionHours: 4 })], emetogenicity: "high", gcsf: "consider",
    source: { label: "EURAMOS-1, Lancet Oncology 2016", url: doi("10.1016/S1470-2045(16)30214-5") }, notes: ["Methotrexate levels at 24, 48 and 72 hours with leucovorin until below 0.1 µmol/L; hydrate and alkalinise urine.", "Cumulative doxorubicin 450 mg/m²: dexrazoxane is used in some protocols."], asOf: AS_OF },
  { id: "stupp", name: "Temozolomide chemoradiation then adjuvant temozolomide (Stupp)", cancers: ["glioblastoma"], setting: "Newly diagnosed glioblastoma, age 70 or under, performance status 0-2 (hypofractionated variants for older patients)", intent: "chemoradiation", cycleDays: 28, cycles: "6 weeks concurrent, then 6 adjuvant cycles (12 with TTFields)",
    components: [c("Temozolomide (concurrent)", "temozolomide", "75 mg/m² daily for 42 days with radiotherapy 60 Gy in 30 fractions", "PO", range(1, 28), { note: "weeks 1-6" }), c("Temozolomide (adjuvant)", "temozolomide", "150 mg/m² cycle 1, then 200 mg/m²", "PO", range(1, 5), { note: "cycles 1-6, starting 4 weeks after radiotherapy" }), c("Radiotherapy", undefined, "2 Gy per fraction, 5 days a week", "RT", range(1, 28).filter((d) => d % 7 !== 6 && d % 7 !== 0))], emetogenicity: "moderate", gcsf: "not routine",
    trials: ["eortc-26981", "ef-14"], source: { label: "Stupp, NEJM 2005", url: doi("10.1056/NEJMoa043330") }, notes: ["PJP prophylaxis during concurrent phase (lymphopenia); benefit largest with MGMT promoter methylation.", "EF-14: adding TTFields to adjuvant temozolomide extended median OS from 16.0 to 20.9 months."], asOf: AS_OF },

  // ============================ Head and neck ============================
  { id: "cisplatin-crt-hn", name: "High-dose cisplatin chemoradiation", cancers: ["head-and-neck", "nasopharyngeal"], setting: "Locally advanced head and neck squamous cell carcinoma, definitive or postoperative (positive margins or extranodal extension)", intent: "chemoradiation", cycleDays: 21, cycles: "3 with 70 Gy in 35 fractions (2 cycles is often all that is delivered)",
    components: [c("Cisplatin", "cisplatin", "100 mg/m² (weekly 40 mg/m² is the alternative)", "IV", [1]), c("Radiotherapy", undefined, "2 Gy per fraction, 5 days a week", "RT", range(1, 21).filter((d) => d % 7 !== 6 && d % 7 !== 0))], emetogenicity: "high", gcsf: "not routine",
    trials: ["rtog-0129", "nrg-hn002-hn005"], source: { label: "NCCN Head and Neck Cancers; RTOG 0129; Bernier/Cooper, NEJM 2004", url: doi("10.1056/NEJMoa032641") }, notes: ["Cumulative cisplatin of at least 200 mg/m² is the target; ototoxicity and nephrotoxicity are the cost."], asOf: AS_OF },
  { id: "tpf", aka: ["TPF"], name: "TPF induction", cancers: ["head-and-neck"], setting: "Locally advanced head and neck cancer where induction is chosen (larynx preservation, bulky nodes)", intent: "induction", cycleDays: 21, cycles: "3-4, then chemoradiation",
    components: [c("Docetaxel", "docetaxel", "75 mg/m²", "IV", [1]), c("Cisplatin", "cisplatin", "75 mg/m²", "IV", [1]), c("Fluorouracil infusion", "fluorouracil", "750 mg/m² per day", "IV", range(1, 5), { infusionHours: 120 })], emetogenicity: "high", gcsf: "recommended",
    source: { label: "TAX 323 (EORTC 24971), NEJM 2007", url: doi("10.1056/NEJMoa071028") }, notes: ["Antibiotic prophylaxis and G-CSF were required in TAX 324; treatment-related deaths limit use to fit patients."], asOf: AS_OF },
  { id: "keynote-048", name: "Pembrolizumab + platinum + fluorouracil", cancers: ["head-and-neck"], setting: "Recurrent or metastatic head and neck squamous cell carcinoma, first line", intent: "first line", cycleDays: 21, cycles: "chemotherapy 6; pembrolizumab up to 35",
    components: [PEMBRO(), c("Cisplatin 100 mg/m² or carboplatin AUC 5", "cisplatin", "day 1", "IV", [1]), c("Fluorouracil infusion", "fluorouracil", "1,000 mg/m² per day", "IV", range(1, 4), { infusionHours: 96 })], emetogenicity: "high", gcsf: "not routine",
    trials: ["keynote-048", "extreme"], source: { label: "KEYNOTE-048, Lancet 2019", url: doi("10.1016/S0140-6736(19)32591-7") }, notes: ["Pembrolizumab alone for CPS 1 or above (or 20 or above) when a chemotherapy-free start is preferred. EXTREME (cetuximab + platinum + 5-FU) is the older standard."], asOf: AS_OF },
  { id: "gp-npc", name: "Gemcitabine + cisplatin (nasopharyngeal)", cancers: ["nasopharyngeal"], setting: "Locoregionally advanced nasopharyngeal carcinoma, induction before chemoradiation; recurrent or metastatic disease with toripalimab", intent: "induction", cycleDays: 21, cycles: "3 induction (6 with toripalimab in metastatic disease)",
    components: [c("Gemcitabine", "gemcitabine", "1,000 mg/m²", "IV", [1, 8]), c("Cisplatin", "cisplatin", "80 mg/m²", "IV", [1]), c("Toripalimab (recurrent or metastatic, JUPITER-02)", "toripalimab", "240 mg", "IV", [1])], emetogenicity: "high", gcsf: "not routine",
    trials: ["jupiter-02"], source: { label: "Zhang, NEJM 2019 (induction GP)", url: doi("10.1056/NEJMoa1905287") }, asOf: AS_OF },
];

/**
 * Regulatory status of approved and late-stage products across seven regions.
 *
 *   US = FDA · EU = European Commission on EMA opinion · UK = MHRA · JP = PMDA/MHLW · CN = NMPA · AU = TGA · IN = CDSCO (DCGI)
 *
 * Rules: a region is recorded only when the status can be traced to a regulator page, an EPAR, a company
 * release, or the corpus' own sourced approvals. Absent = unknown/not researched, NOT "not approved".
 * `year` is the year of the first approval in that region for any oncology indication. EU EPAR pages
 * checked directly are marked `verified` and carry `verifiedOn` = EPAR_CHECKED, the date of the last check;
 * scripts/fetch-ema.ts re-checks every EU row against the EMA register weekly and moves the stamp forward when
 * all rows agree (per-row results in public/regional/verified.json). Japanese rows with a day-month note were read from
 * the PMDA "List of Approved Drugs" (REGION_META.JP.url, April 2004 onwards); UK rows sourced to a GOV.UK press notice
 * carry the notice URL. Other rows carry regulator search links.
 * "not-filed" is used only where a sponsor has publicly said so or where a product is regionally
 * exclusive by design (e.g. China-only PD-1 antibodies without ex-China filings).
 */
export type Region = "US" | "EU" | "UK" | "JP" | "CN" | "AU" | "IN";
export const REGIONS: Region[] = ["US", "EU", "UK", "JP", "CN", "AU", "IN"];
export const REGION_META: Record<Region, { label: string; regulator: string; url: string; flag: string }> = {
  US: { label: "United States", regulator: "FDA", url: "https://www.fda.gov/drugs/resources-information-approved-drugs/oncology-cancer-hematologic-malignancies-approval-notifications", flag: "🇺🇸" },
  EU: { label: "European Union", regulator: "EMA / European Commission", url: "https://www.ema.europa.eu/en/medicines", flag: "🇪🇺" },
  UK: { label: "United Kingdom", regulator: "MHRA (NICE for reimbursement)", url: "https://products.mhra.gov.uk/", flag: "🇬🇧" },
  JP: { label: "Japan", regulator: "PMDA / MHLW", url: "https://www.pmda.go.jp/english/review-services/reviews/approved-information/drugs/0002.html", flag: "🇯🇵" },
  CN: { label: "China", regulator: "NMPA", url: "https://english.nmpa.gov.cn/", flag: "🇨🇳" },
  AU: { label: "Australia", regulator: "TGA (PBS for reimbursement)", url: "https://www.tga.gov.au/resources/artg", flag: "🇦🇺" },
  IN: { label: "India", regulator: "CDSCO (DCGI)", url: "https://cdsco.gov.in/opencms/opencms/en/Approval_new/Approved-New-Drugs/", flag: "🇮🇳" },
};

export type RegionalStatus = "approved" | "conditional" | "under-review" | "not-filed" | "withdrawn" | "rejected";
export type RegionalEntry = { status: RegionalStatus; year?: number; indication?: string; source?: string; note?: string; verified?: boolean; /** ISO date of the last check against the regulator (EU rows: the EMA register). */ verifiedOn?: string };

/** Date the EU rows marked V() were last checked against the EMA register. Updated by scripts/fetch-ema.ts. */
export const EPAR_CHECKED = "2026-09-10";
export type RegionalRow = Partial<Record<Region, RegionalEntry>>;

const epar = (slug: string) => `https://www.ema.europa.eu/en/medicines/human/EPAR/${slug}`;
const mhra = (brand: string) => `https://products.mhra.gov.uk/?search=${encodeURIComponent(brand)}`;
const tga = (brand: string) => `https://www.tga.gov.au/resources/artg?search_api_views_fulltext=${encodeURIComponent(brand)}`;
/** MHRA approval notice on GOV.UK (used where the UK decision is documented by a press notice rather than only the SmPC search). */
const govuk = (slug: string) => `https://www.gov.uk/government/news/${slug}`;
const PMDA = REGION_META.JP.url;
const NMPA = REGION_META.CN.url;
const CDSCO = REGION_META.IN.url;
/** India rows: recorded only where a CDSCO listing, a company page or a primary paper supports the status. Year = first Indian approval where known; biosimilar and generic entry is noted because it sets the price. */
const IN = (year?: number, source?: string, indication?: string, note?: string): RegionalEntry => A(year, source ?? CDSCO, indication, note);

const A = (year?: number, source?: string, indication?: string, note?: string): RegionalEntry => ({ status: "approved", year, source, indication, note });
const C = (year?: number, source?: string, indication?: string, note?: string): RegionalEntry => ({ status: "conditional", year, source, indication, note });
const V = (e: RegionalEntry): RegionalEntry => ({ ...e, verified: true, verifiedOn: EPAR_CHECKED });
const NF = (note?: string): RegionalEntry => ({ status: "not-filed", note });
const W = (year?: number, source?: string, note?: string): RegionalEntry => ({ status: "withdrawn", year, source, note });
const UR = (note?: string, source?: string): RegionalEntry => ({ status: "under-review", note, source });
const R = (year?: number, note?: string): RegionalEntry => ({ status: "rejected", year, note });
/** EU entry for a legacy product authorised nationally by member states (no centralised EPAR exists). Year only where the first national approval is known. */
const EU_NATIONAL = (year?: number, note = "National authorisations; no centralised EPAR"): RegionalEntry => A(year, undefined, undefined, note);
/** Row for a combination regimen: each component holds its own authorisations and there is no single marketing authorisation for the regimen, so the row carries the note rather than a year. */
const REGIMEN_NOTE = "Combination regimen of individually authorised medicines; no single marketing authorisation";
const regimen = (usYear?: number): RegionalRow => ({ US: A(usYear, undefined, undefined, REGIMEN_NOTE), EU: A(undefined, undefined, undefined, REGIMEN_NOTE), UK: A(undefined, undefined, undefined, REGIMEN_NOTE) });

/** Six-region row for a long-established global product (approved everywhere, first years by region). India is added per row where sourced. */
function global(brand: string, slug: string, us: number, eu: number, uk: number, jp: number, cn: number, au: number, note?: string): RegionalRow {
  return { US: A(us, undefined, undefined, note), EU: A(eu, epar(slug)), UK: A(uk, mhra(brand)), JP: A(jp, PMDA), CN: A(cn, NMPA), AU: A(au, tga(brand)) };
}

export const regionalApprovals: Record<string, RegionalRow> = {
  // ================= ADCs =================
  "trastuzumab-deruxtecan": global("Enhertu", "enhertu", 2019, 2021, 2021, 2020, 2023, 2022, "HER2+ then HER2-low; EU/UK HER2-low 2023; China HER2+ breast Feb 2023"),
  "sacituzumab-govitecan": { US: A(2020), EU: A(2021, epar("trodelvy"), "mTNBC ≥2 lines; HR+ 2023"), UK: A(2021, mhra("Trodelvy")), JP: A(2024, PMDA, "TNBC (Daiichi Sankyo licence)"), CN: A(2022, NMPA, "mTNBC (Everest Medicines)"), AU: A(2022, tga("Trodelvy")) },
  "datopotamab-deruxtecan": { US: A(2025), EU: V(A(2025, epar("datroway"), "HR+/HER2- mBC after endocrine + chemo; 4 Apr 2025")), UK: A(2025, mhra("Datroway")), JP: A(2024, PMDA, "Datroway, HR+/HER2- breast cancer; 27 Dec 2024 (first approval globally)"), CN: UR("Filed for HR+/HER2- breast; not yet approved"), AU: UR("Under TGA evaluation") },
  "sacituzumab-tirumotecan": { US: UR("BLA planned after TroFuse phase 3; Commissioner's National Priority Voucher July 2026"), EU: NF("No MAA announced"), CN: A(2024, NMPA, "Pretreated TNBC (Nov 2024); EGFR-mutant NSCLC after TKI (Mar 2025)") },
  "trastuzumab-emtansine": global("Kadcyla", "kadcyla", 2013, 2013, 2013, 2013, 2020, 2013),
  "enfortumab-vedotin": { US: A(2019), EU: A(2022, epar("padcev"), "mUC after platinum + PD-1; 1L with pembrolizumab 2024"), UK: A(2022, mhra("Padcev")), JP: A(2021, PMDA), CN: UR("Filed by Astellas; bridging study ongoing"), AU: A(2023, tga("Padcev")) },
  "brentuximab-vedotin": global("Adcetris", "adcetris", 2011, 2012, 2012, 2014, 2020, 2013),
  "polatuzumab-vedotin": global("Polivy", "polivy", 2019, 2020, 2020, 2021, 2023, 2020),
  "mirvetuximab-soravtansine": { US: A(2022), EU: V(A(2024, epar("elahere"), "FRα+ platinum-resistant ovarian; 14 Nov 2024")), UK: A(2025, govuk("mirvetuximab-soravtansine-approved-to-treat-adult-patients-who-have-ovarian-fallopian-tube-or-primary-peritoneal-cancer"), "28 Jul 2025"), JP: UR("PMDA filing 2025"), CN: NF("Hansoh licence; NDA status not public"), AU: UR("Under TGA evaluation") },
  "tisotumab-vedotin": { US: A(2021), EU: V(A(2025, epar("tivdak"), "Recurrent/metastatic cervical after systemic therapy; 28 Mar 2025")), UK: A(2025, govuk("mhra-approves-tisotumab-vedotin-for-the-treatment-of-cervical-cancer"), "2 Dec 2025"), JP: A(2025, PMDA, "Tivdak, advanced or recurrent cervical cancer after chemotherapy; 27 Mar 2025 (Genmab Japan)") },
  "telisotuzumab-vedotin": { US: A(2025, undefined, "c-MET-high NSCLC (accelerated)"), EU: UR("MAA submitted 2025") },
  zynlonta: { US: A(2021), EU: A(2022, epar("zynlonta"), "R/R DLBCL ≥2 lines (conditional)"), UK: A(2023, mhra("Zynlonta")), CN: A(2025, NMPA, "Overland ADCT licence") },
  "gemtuzumab-ozogamicin": { US: A(2000, undefined, "Withdrawn 2010, re-approved 2017"), EU: A(2018, epar("mylotarg")), UK: A(2018, mhra("Mylotarg")), JP: A(2005, PMDA), AU: A(2020, tga("Mylotarg")) },
  "belantamab-mafodotin": { US: A(2020, undefined, "Withdrawn 2022; re-approved Oct 2025 in combination"), EU: V(A(2025, epar("blenrep"), "R/R myeloma with BorDex or PomDex; 23 Jul 2025")), UK: A(2025, mhra("Blenrep"), "First re-approval globally (MHRA Apr 2025)"), JP: A(2025, PMDA), CN: A(2025, NMPA), AU: UR("TGA evaluation") },
  "inotuzumab-ozogamicin": global("Besponsa", "besponsa", 2017, 2017, 2017, 2018, 2021, 2018),
  "disitamab-vedotin": { US: NF("Pfizer (ex-China) running global phase 3 trials; no US filing yet"), CN: A(2021, NMPA, "HER2+ gastric (Jun 2021); HER2-expressing urothelial (Dec 2021)") },
  "izalontamab-brengitecan": { US: UR("BMS global development; no BLA filed"), CN: UR("NDA for pretreated TNBC and ESCC under NMPA priority review 2026") },
  "trastuzumab-rezetecan": { CN: A(2025, NMPA, "HER2-mutant NSCLC; HER2+ breast (Hengrui)") },
  "patritumab-deruxtecan": { US: W(2025, undefined, "BLA withdrawn May 2025 after CRL (manufacturing) and HERTHENA-Lung02 OS miss") },
  "raludotatug-deruxtecan": { US: UR("Phase 3 REJOICE-Ovarian01 ongoing") },
  "ifinatamab-deruxtecan": { US: UR("Breakthrough designation; IDeate-Lung02 phase 3 ongoing") },
  "zilovertamab-vedotin": { US: UR("Phase 3 waveLINE-003 ongoing") },
  cmg901: { US: UR("Phase 3 CLARITY-Gastric01 ongoing"), CN: UR("Phase 3 in China") },
  arx788: { CN: UR("NDA accepted for HER2+ breast cancer (NovoCodex)") },
  "trastuzumab-brengitecan": { CN: UR("Phase 3 in HER2+ breast cancer") },
  "luveltamab-tazevibulin": { US: UR("Phase 2/3 REFRaME-O1") },
  "rinatabart-sesutecan": { US: UR("Phase 3 RAINFOL-01") },
  "pivekimab-sunirine": { US: A(2026, undefined, "Decnupaz, BPDCN") },

  // ================= Checkpoint inhibitors =================
  pembrolizumab: global("Keytruda", "keytruda", 2014, 2015, 2015, 2016, 2018, 2015),
  nivolumab: global("Opdivo", "opdivo", 2014, 2015, 2015, 2014, 2018, 2016, "Japan first (melanoma, July 2014)"),
  ipilimumab: global("Yervoy", "yervoy", 2011, 2011, 2011, 2015, 2021, 2011),
  atezolizumab: global("Tecentriq", "tecentriq", 2016, 2017, 2017, 2018, 2020, 2017),
  durvalumab: global("Imfinzi", "imfinzi", 2017, 2018, 2018, 2018, 2019, 2018),
  avelumab: global("Bavencio", "bavencio", 2017, 2017, 2017, 2017, 2020, 2018),
  cemiplimab: { US: A(2018), EU: A(2019, epar("libtayo")), UK: A(2019, mhra("Libtayo")), JP: A(2022, PMDA, "Libtayo; 23 Dec 2022"), AU: A(2020, tga("Libtayo")) },
  dostarlimab: { US: A(2021), EU: A(2021, epar("jemperli")), UK: A(2021, mhra("Jemperli")), AU: A(2023, tga("Jemperli")) },
  tremelimumab: { US: A(2022), EU: A(2023, epar("imjudo")), UK: A(2023, mhra("Imjudo")), JP: A(2022, PMDA), AU: A(2023, tga("Imjudo")) },
  "relatlimab-nivolumab": { US: A(2022), EU: A(2022, epar("opdualag"), "Melanoma, PD-L1 <1% restriction"), UK: A(2023, mhra("Opdualag")), AU: A(2023, tga("Opdualag")) },
  tislelizumab: { US: A(2024, undefined, "ESCC 2L (Mar 2024); 1L ESCC and gastric 2024-25"), EU: A(2023, epar("tevimbra")), UK: A(2024, mhra("Tevimbra")), JP: A(2025, PMDA), CN: A(2019, NMPA, "First approval: cHL, Dec 2019"), AU: A(2024, tga("Tevimbra")) },
  toripalimab: { US: A(2023, undefined, "Nasopharyngeal carcinoma (first PD-1 for NPC)"), EU: A(2024, epar("loqtorzi")), UK: A(2025, mhra("Loqtorzi")), CN: A(2018, NMPA, "Melanoma (Dec 2018); 10+ indications"), AU: A(2025, tga("Loqtorzi")) },
  serplulimab: { US: UR("BLA for ES-SCLC; bridging trial ASTRIDE"), EU: A(2025, epar("hetronifly"), "ES-SCLC with chemotherapy"), UK: A(2025, mhra("Hetronifly")), CN: A(2022, NMPA, "MSI-H solid tumours (Mar 2022); ES-SCLC") },
  camrelizumab: { US: UR("CRLs May 2024, Mar 2025 (with rivoceranib, HCC); resubmission"), CN: A(2019, NMPA, "cHL (May 2019); multiple indications"), EU: NF() },
  "camrelizumab-rivoceranib": { US: UR("Third CRL 23 Jul 2026 for 1L HCC"), CN: A(2023, NMPA, "1L unresectable HCC (Jan 2023)") },
  cadonilimab: { US: NF("Akeso has not filed ex-China"), CN: A(2022, NMPA, "Recurrent/metastatic cervical (Jun 2022); 1L gastric (Sep 2024)") },
  ivonescimab: { US: UR("Summit BLA for EGFR-mutant NSCLC post-TKI; PDUFA Nov 2026 (HARMONi-3 interim PFS miss noted)"), EU: NF("No MAA announced"), CN: A(2024, NMPA, "EGFR-mutant NSCLC after TKI (May 2024); 1L PD-L1+ NSCLC (Apr 2025)") },
  fianlimab: { US: UR("Phase 3 in melanoma missed primary endpoint 2026") },
  cosibelimab: { US: A(2024, undefined, "Unloxcyt, cutaneous SCC (Dec 2024)") },
  penpulimab: { US: A(2025, undefined, "Non-keratinising NPC (Apr 2025)"), CN: A(2021, NMPA, "Akeso; cHL (Aug 2021), later NPC and NSCLC") },
  retifanlimab: { US: A(2023), EU: A(2024, epar("zynyz"), "Merkel cell carcinoma"), UK: A(2026, govuk("mhra-approvesretifanlimabzynyz-for-the-treatment-of-advanced-merkel-cell-skin-cancer"), "Advanced Merkel cell carcinoma; 6 Jul 2026"), JP: A(2025, PMDA, "Zynyz, unresectable or recurrent squamous cell carcinoma of the anal canal; 22 Dec 2025 (Incyte Japan)") },
  sintilimab: { US: R(2022, "CRL Mar 2022 for ORIENT-11 (single-country trial); ODAC 14 to 1"), EU: NF("No MAA"), CN: A(2018, NMPA, "cHL Dec 2018; NSCLC and HCC 2021; ESCC 2022; gastric 2023") },
  sugemalimab: { US: NF("No BLA"), EU: A(2024, epar("cejemly"), "1L metastatic NSCLC with platinum chemotherapy; Jul 2024"), UK: UR("MHRA application"), CN: A(2021, NMPA, "1L metastatic NSCLC Dec 2021; stage III after CRT 2022") },
  adebrelimab: { US: NF("No BLA"), CN: A(2023, NMPA, "1L ES-SCLC with carboplatin-etoposide (Mar 2023)") },
  envafolimab: { US: NF("TRACON North American programme discontinued"), CN: A(2021, NMPA, "Previously treated MSI-H/dMMR solid tumours (Nov 2021); first subcutaneous PD-L1") },

  // ================= Bispecifics / T-cell engagers =================
  blinatumomab: global("Blincyto", "blincyto", 2014, 2015, 2015, 2018, 2020, 2016),
  teclistamab: { US: A(2022), EU: C(2022, epar("tecvayli"), "R/R myeloma ≥3 lines (conditional, Aug 2022)"), UK: A(2022, mhra("Tecvayli")), JP: A(2024, PMDA), CN: A(2025, NMPA), AU: A(2024, tga("Tecvayli")) },
  elranatamab: { US: A(2023), EU: C(2023, epar("elrexfio")), UK: A(2024, mhra("Elrexfio")), JP: A(2024, PMDA), AU: A(2024, tga("Elrexfio")) },
  talquetamab: { US: A(2023), EU: C(2023, epar("talvey")), UK: A(2024, mhra("Talvey")), JP: A(2025, PMDA), AU: A(2024, tga("Talvey")) },
  linvoseltamab: { US: A(2025), EU: V(C(2025, epar("lynozyfic"), "R/R myeloma ≥3 lines; 23 Apr 2025 (conditional)")), UK: A(2025, mhra("Lynozyfic")) },
  glofitamab: { US: A(2023, undefined, "Accelerated; STARGLO CRL Jul 2025"), EU: C(2023, epar("columvi")), UK: A(2023, mhra("Columvi")), JP: A(2024, PMDA), CN: A(2024, NMPA), AU: A(2024, tga("Columvi")) },
  epcoritamab: { US: A(2023), EU: C(2023, epar("tepkinly"), "EU brand Tepkinly"), UK: A(2023, mhra("Tepkinly")), JP: A(2023, PMDA, "Epkinly; DLBCL"), AU: A(2024, tga("Tepkinly")) },
  mosunetuzumab: { US: A(2022), EU: C(2022, epar("lunsumio")), UK: A(2022, mhra("Lunsumio")), JP: A(2024, PMDA), AU: A(2023, tga("Lunsumio")) },
  odronextamab: { US: A(2025, undefined, "CRL Mar 2024; approved Jul 2025"), EU: C(2024, epar("ordspono"), "EU brand Ordspono; FL and DLBCL ≥2 lines"), UK: A(2025, mhra("Ordspono")) },
  tarlatamab: { US: A(2024, undefined, "Accelerated May 2024; full approval Dec 2025"), EU: V(A(2026, epar("imdylltra"), "ES-SCLC after platinum-based chemotherapy; 29 May 2026")), UK: A(2024, govuk("tarlatamab-approved-to-treat-adult-patients-with-small-cell-lung-cancer"), "ES-SCLC after platinum-based chemotherapy; 31 Dec 2024"), JP: A(2024, PMDA, "Imdelltra, small cell lung cancer progressed after chemotherapy; 27 Dec 2024"), AU: UR("TGA evaluation") },
  tebentafusp: { US: A(2022), EU: A(2022, epar("kimmtrak")), UK: A(2022, mhra("Kimmtrak")), AU: A(2023, tga("Kimmtrak")), JP: UR("PMDA filing 2025") },
  amivantamab: { US: A(2021), EU: A(2021, epar("rybrevant"), "Exon 20; 1L with lazertinib Jan 2025"), UK: A(2022, mhra("Rybrevant")), JP: A(2024, PMDA), CN: A(2024, NMPA, "Exon 20 insertion NSCLC"), AU: A(2023, tga("Rybrevant")) },
  zanidatamab: { US: A(2024), EU: V(C(2025, epar("ziihera"), "HER2+ biliary tract after ≥1 line; 27 Jun 2025 (conditional)")), UK: A(2026, govuk("mhra-approves-zanidatamab-ziihera-for-the-treatment-of-biliary-tract-cancer"), "HER2+ biliary tract cancer; 19 Feb 2026"), CN: A(2025, NMPA, "BeOne; HER2+ BTC") },
  zenocutuzumab: { US: A(2024), EU: UR("MAA submitted 2025; no EPAR yet") },
  brenetafusp: { US: UR("Phase 3 PRISM-MEL-301") },
  xaluritamig: { US: UR("Phase 3 XALute") },
  pasritamig: { US: UR("Phase 3 in mCRPC") },
  petosemtamab: { US: UR("Phase 3 LiGeR-HN1/2") },
  "ficerafusp-alfa": { US: UR("Phase 3 FORTIFI-HN01") },
  bemarituzumab: { US: UR("FORTITUDE-101 positive on OS 2025; BLA expected"), CN: UR("Zai Lab NDA") },

  // ================= Cell therapies =================
  tisagenlecleucel: { US: A(2017), EU: A(2018, epar("kymriah")), UK: A(2018, mhra("Kymriah")), JP: A(2019, PMDA, "First CAR-T in Japan"), CN: NF("Novartis has not filed in China"), AU: A(2018, tga("Kymriah")) },
  "axicabtagene-ciloleucel": { US: A(2017), EU: A(2018, epar("yescarta")), UK: A(2018, mhra("Yescarta")), JP: A(2021, PMDA, "Daiichi Sankyo"), CN: A(2021, NMPA, "Fosun Kite; first CAR-T approved in China (Jun 2021)"), AU: A(2019, tga("Yescarta")) },
  "lisocabtagene-maraleucel": { US: A(2021), EU: A(2022, epar("breyanzi")), UK: A(2022, mhra("Breyanzi")), JP: A(2021, PMDA), AU: A(2022, tga("Breyanzi")) },
  "idecabtagene-vicleucel": { US: A(2021), EU: A(2021, epar("abecma")), UK: A(2021, mhra("Abecma")), JP: A(2022, PMDA), AU: A(2022, tga("Abecma")) },
  "ciltacabtagene-autoleucel": { US: A(2022), EU: A(2022, epar("carvykti")), UK: A(2022, mhra("Carvykti")), JP: A(2022, PMDA), CN: A(2024, NMPA, "Legend Biotech; R/R myeloma"), AU: A(2023, tga("Carvykti")) },
  "obecabtagene-autoleucel": { US: A(2024), EU: V(C(2025, epar("aucatzyl"), "R/R B-ALL adults ≥26; 17 Jul 2025 (conditional)")), UK: A(2025, govuk("obecabtagene-autoleucel-conditionally-approved-to-treat-adults-with-relapsed-or-refractory-b-cell-precursor-acute-lymphoblastic-leukaemia"), "R/R B-ALL (conditional); 24 Apr 2025") },
  lifileucel: { US: A(2024, undefined, "Accelerated Feb 2024"), EU: W(2025, epar("amtagvi"), "MAA withdrawn 22 Jul 2025 after CHMP signalled a negative opinion (response rate, deaths, manufacturing)"), UK: UR("MHRA application 2025"), CN: NF(), AU: UR("TGA evaluation") },
  "afamitresgene-autoleucel": { US: A(2024, undefined, "Accelerated Aug 2024; full approval Jun 2026"), EU: NF("No MAA; US WorldMeds acquired US rights 2025") },
  "satricabtagene-autoleucel": { US: UR("US phase 1b/2 (CARsgen)"), CN: A(2025, NMPA, "CLDN18.2+ advanced gastric/GEJ after ≥2 lines (Sep 2025); first CAR-T for a solid tumour") },
  "relmacabtagene-autoleucel": { US: NF("China only (JW Therapeutics)"), CN: A(2021, NMPA, "R/R LBCL Sep 2021; R/R follicular lymphoma 2022") },
  "equecabtagene-autoleucel": { US: NF("RMAT designation; no BLA"), CN: A(2023, NMPA, "R/R multiple myeloma after 3 or more lines (Jun 2023)") },
  "zevorcabtagene-autoleucel": { US: NF("US development (LUMMICAR-2) deprioritised"), CN: A(2024, NMPA, "R/R multiple myeloma after 3 or more lines (Feb 2024)") },
  "inaticabtagene-autoleucel": { CN: A(2023, NMPA, "Adult R/R B-ALL") },
  "anitocabtagene-autoleucel": { US: UR("BLA accepted; PDUFA 27 Dec 2026") },
  "dcvax-l": { UK: UR("MHRA application under review since 2023; no decision published"), US: NF("No BLA") },
  "brexucabtagene-autoleucel": { US: A(2020), EU: A(2020, epar("tecartus"), "MCL after ≥2 lines incl. a BTK inhibitor (Dec 2020); adult B-ALL 2022"), UK: A(2020, mhra("Tecartus")), AU: A(undefined, tga("Tecartus")) },
  "sipuleucel-t": { US: A(2010), EU: W(2015, epar("provenge"), "Authorised Sep 2013; marketing authorisation withdrawn May 2015 at the holder's request (commercial)") },

  // ================= Radiopharmaceuticals and imaging =================
  pluvicto: { US: A(2022), EU: A(2022, epar("pluvicto"), "mCRPC post-ARPI and taxane; pre-chemo 2025"), UK: A(2023, mhra("Pluvicto")), JP: A(2025, PMDA, "PSMA+ mCRPC (Mar 2025)"), CN: UR("NMPA review; Novartis China"), AU: A(2023, tga("Pluvicto")) },
  lutathera: { US: A(2018), EU: A(2017, epar("lutathera"), "First approval globally (Sep 2017)"), UK: A(2018, mhra("Lutathera")), JP: A(2021, PMDA), CN: A(2024, NMPA), AU: A(2018, tga("Lutathera")) },
  "radium-223": global("Xofigo", "xofigo", 2013, 2013, 2013, 2016, 2020, 2014),
  pylarify: { US: A(2021), EU: A(2023, epar("pylclari"), "EU brand Pylclari (Curium)"), UK: A(2023, mhra("Pylclari")) },
  "ga68-psma-11": { US: A(2020, undefined, "UCSF/UCLA Ga-68 PSMA-11 Dec 2020; Illuccix, Locametz 2021-22"), EU: A(2022, epar("locametz")), UK: A(2022, mhra("Locametz")), JP: A(2025, PMDA, "Locametz kit (gozetotide), PSMA PET to select patients for PSMA-targeted therapy; 19 Sep 2025"), AU: A(2021, tga("Illuccix"), "Illuccix (Telix), Nov 2021") },
  flotufolastat: { US: A(2023), EU: UR("MAA (Blue Earth Diagnostics)") },
  "radioactive-iodine": global("Sodium iodide I-131", "sodium-iodide-131", 1951, 1990, 1990, 1990, 1990, 1990, "Legacy product; national approvals predate modern registers"),
  "lu177-psma-it": { US: UR("SPLASH phase 3 met rPFS, missed OS; BLA decision pending"), EU: UR("ECLIPSE/SPLASH; no MAA decision") },
  "ac225-psma": { US: UR("Phase 3 AcTION / AlphaBreak / PAnTHA") },
  ryz101: { US: UR("Phase 3 ACTION-1") },
  "itm-11": { US: UR("PDUFA 28 Aug 2026 (COMPETE); decision not yet in corpus"), EU: UR("MAA 2026") },
  "aminolevulinic-acid-gleolan": { US: A(2017, undefined, "Gleolan"), EU: A(2007, epar("gliolan")), UK: A(2007, mhra("Gliolan")), JP: A(2013, PMDA, "Alaglio (SBI Pharma)"), AU: A(undefined, tga("Gliolan")) },
  "fluciclovine-f18": { US: A(2016), EU: A(2017, epar("axumin")), UK: A(2017, mhra("Axumin")), JP: A(2021, PMDA, "Axumin, imaging of suspected newly identified malignant glioma for resection planning; 23 Mar 2021 (Nihon Medi-Physics)") },
  "fluoroestradiol-f18": { US: A(2020, undefined, "Cerianna") },
  "ga68-dotatate": { US: A(2016, undefined, "Netspot (Ga-68 DOTATATE) 2016; Detectnet (Cu-64) 2020"), EU: A(undefined, epar("somakit-toc"), "SomaKit TOC (Ga-68 DOTATOC kit); no centralised DOTATATE kit"), UK: A(undefined, mhra("SomaKit TOC")) },
  pafolacianine: { US: A(2021, undefined, "Cytalux; ovarian 2021, lung 2022") },
  pegulicianine: { US: A(2024, undefined, "Lumisight") },
  "tilmanocept-tc99m": { US: A(2013), EU: W(2024, epar("lymphoseek"), "Authorised Nov 2014; marketing authorisation withdrawn at Navidea's request 10 Jun 2024"), UK: A(2014, mhra("Lymphoseek")) },

  // ================= Kinase and small-molecule targeted =================
  osimertinib: global("Tagrisso", "tagrisso", 2015, 2016, 2016, 2016, 2017, 2016),
  furmonertinib: { US: UR("ArriVent: EGFR exon 20 insertion programme (FURVENT phase 3)"), CN: A(2021, NMPA, "T790M 2L Mar 2021; 1L EGFR-mutant Jun 2022") },
  aumolertinib: { US: NF("No NDA"), EU: A(2026, epar("aumseqa"), "Aumseqa: first-line EGFR exon 19 deletion or L858R advanced NSCLC, and T790M-positive NSCLC; February 2026"), CN: A(2020, NMPA, "T790M 2L Mar 2020; 1L EGFR-mutant Dec 2021") },
  icotinib: { US: NF(), CN: A(2011, NMPA, "First China-invented targeted cancer drug; 2L NSCLC 2011, 1L 2014, adjuvant 2021") },
  savolitinib: { US: NF("Global SAFFRON phase 3 with osimertinib ongoing"), EU: NF(), CN: A(2021, NMPA, "MET exon 14 NSCLC (conditional Jun 2021); with osimertinib 2025") },
  anlotinib: { US: NF(), CN: A(2018, NMPA, "3L NSCLC May 2018; sarcoma and SCLC 2019; MTC 2020") },
  rivoceranib: { US: UR("With camrelizumab, 1L HCC: three CRLs (2024, 2025, 2026)"), CN: A(2014, NMPA, "3L gastric Oct 2014 (as apatinib); HCC 2L 2020; 1L HCC with camrelizumab 2023") },
  donafenib: { US: NF(), CN: A(2021, NMPA, "1L HCC Jun 2021; RAI-refractory thyroid 2022") },
  dalpiciclib: { US: NF(), CN: A(2021, NMPA, "HR+/HER2- ABC with fulvestrant Dec 2021; 1L with AI 2023") },
  orelabrutinib: { US: NF(), CN: A(2020, NMPA, "R/R CLL/SLL and MCL Dec 2020; MZL 2023") },
  tucidinostat: { US: NF(), JP: A(2021, PMDA, "R/R adult T-cell leukaemia-lymphoma (HBI-8000)"), CN: A(2014, NMPA, "R/R PTCL Dec 2014; HR+ breast with exemestane 2019") },
  lorlatinib: global("Lorbrena", "lorviqua", 2018, 2019, 2019, 2018, 2022, 2019, "EU brand Lorviqua"),
  alectinib: global("Alecensa", "alecensa", 2015, 2017, 2017, 2014, 2018, 2016, "Japan first (Jul 2014)"),
  neladalkib: { US: UR("PDUFA 27 Nov 2026 (ALKOVE-1)") },
  lazertinib: { US: A(2024), EU: V(A(2025, epar("lazcluze"), "1L EGFR-mutant NSCLC with amivantamab; 20 Jan 2025")), UK: A(2025, govuk("lazertinib-approved-for-use-in-combination-with-amivantamab-for-the-treatment-of-adults-with-non-small-cell-lung-cancer"), "6 Mar 2025"), JP: A(2025, PMDA), CN: A(2025, NMPA) },
  sotorasib: { US: A(2021, undefined, "Accelerated; CRL Dec 2023 for full approval; CRC with panitumumab Jan 2025"), EU: C(2022, epar("lumykras"), "EU brand Lumykras"), UK: A(2021, mhra("Lumykras"), "MHRA Project Orbis first"), JP: A(2022, PMDA), CN: NF("Amgen has not filed in China"), AU: A(2022, tga("Lumykras")) },
  fulzerasib: { US: NF("Verastem develops the follow-on VS-7375 in the US"), CN: A(2024, NMPA, "KRAS G12C NSCLC after 1 or more lines (Aug 2024); first in China") },
  garsorasib: { US: NF("No NDA"), CN: A(2024, NMPA, "KRAS G12C NSCLC after 1 or more lines (Aug 2024)") },
  adagrasib: { US: A(2022), EU: V(C(2024, epar("krazati"), "KRAS G12C NSCLC after ≥1 line; 5 Jan 2024 (conditional)")), UK: A(2024, mhra("Krazati")), JP: UR("PMDA filing"), AU: A(2024, tga("Krazati")) },
  divarasib: { US: UR("Phase 3 Krascendo 1 topline Jul 2026") },
  olomorasib: { US: UR("Phase 3 SUNRAY-01") },
  daraxonrasib: { US: A(2026, "https://www.fda.gov/drugs/novel-drug-approvals-fda/novel-drug-approvals-2026", "Previously treated metastatic pancreatic cancer (Rasonque, 26 August 2026)", "RASolute 302") },
  encorafenib: { US: A(2018), EU: A(2018, epar("braftovi")), UK: A(2018, mhra("Braftovi")), JP: A(2019, PMDA), CN: A(2023, NMPA), AU: A(2019, tga("Braftovi")) },
  binimetinib: { US: A(2018), EU: A(2018, epar("mektovi")), UK: A(2018, mhra("Mektovi")), JP: A(2019, PMDA), AU: A(2019, tga("Mektovi")) },
  "dabrafenib-trametinib": global("Tafinlar + Mekinist", "tafinlar", 2014, 2013, 2013, 2016, 2019, 2013, "US combination approval January 2014 (each drug alone May 2013); tumour-agnostic BRAF V600E label US 2022"),
  vemurafenib: global("Zelboraf", "zelboraf", 2011, 2012, 2012, 2014, 2017, 2012),
  cobimetinib: { US: A(2015), EU: A(2015, epar("cotellic")), UK: A(2015, mhra("Cotellic")), JP: A(2018, PMDA), AU: A(2016, tga("Cotellic")) },
  selpercatinib: { US: A(2020), EU: A(2021, epar("retsevmo"), "EU brand Retsevmo"), UK: A(2021, mhra("Retsevmo")), JP: A(2021, PMDA), CN: A(2022, NMPA), AU: A(2021, tga("Retsevmo")) },
  pralsetinib: { US: A(2020), EU: W(2024, epar("gavreto"), "Authorised Nov 2021; marketing authorisation withdrawn at Blueprint's request 24 Oct 2024"), UK: A(2021, mhra("Gavreto")), CN: A(2021, NMPA, "CStone"), AU: A(2022, tga("Gavreto")) },
  "capmatinib-tepotinib": { US: A(2020), EU: A(2022, epar("tepmetko"), "Tepmetko 2022; Tabrecta 2022"), UK: A(2022, mhra("Tepmetko")), JP: A(2020, PMDA, "Tepotinib first approval globally (Mar 2020)"), CN: A(2023, NMPA), AU: A(2021, tga("Tabrecta")) },
  zongertinib: { US: A(2025), EU: UR("MAA under review; no EPAR yet"), JP: A(2025, PMDA, "Hernexeos, HER2 (ERBB2)-mutant NSCLC after chemotherapy; 19 Sep 2025 (Nippon Boehringer Ingelheim)"), CN: A(2025, NMPA, "HER2-mutant NSCLC") },
  sevabertinib: { US: A(2025), EU: UR("MAA 2026"), UK: A(2026, govuk("sevabertinib-approved-to-treat-adults-with-her2-positive-lung-cancer-that-has-spread-or-cannot-be-removed-by-surgery"), "HER2-mutant NSCLC; 2 Apr 2026") },
  zidesamtinib: { US: A(2026), EU: UR("MAA planned") },
  repotrectinib: { US: A(2023), EU: V(C(2025, epar("augtyro"), "ROS1+ NSCLC; NTRK+ solid tumours; 13 Jan 2025 (conditional)")), UK: A(2025, mhra("Augtyro")), JP: A(2024, PMDA), CN: A(2025, NMPA) },
  tucatinib: { US: A(2020), EU: A(2021, epar("tukysa")), UK: A(2021, mhra("Tukysa")), JP: A(2026, PMDA, "Tukysa, HER2+ inoperable or recurrent breast cancer after chemotherapy; 19 Feb 2026 (Pfizer Japan)"), CN: A(2023, NMPA), AU: A(2021, tga("Tukysa")) },
  neratinib: { US: A(2017), EU: A(2018, epar("nerlynx")), UK: A(2018, mhra("Nerlynx")), AU: A(2019, tga("Nerlynx")) },
  lapatinib: global("Tykerb", "tyverb", 2007, 2008, 2008, 2009, 2013, 2007, "EU brand Tyverb"),
  pyrotinib: { CN: A(2018, NMPA, "HER2+ metastatic breast (Aug 2018)"), US: NF("Hengrui; no US filing") },
  imatinib: { ...global("Gleevec", "glivec", 2001, 2001, 2001, 2001, 2002, 2001, "EU brand Glivec"), IN: IN(undefined, "https://en.wikipedia.org/wiki/Novartis_v._Union_of_India_%26_Others", "CML, GIST", "Generic imatinib (Natco Veenat and others) sold since before product patents (2005); the Supreme Court refused Novartis's patent on the beta-crystalline form on 1 April 2013 under section 3(d)") },
  dasatinib: global("Sprycel", "sprycel", 2006, 2006, 2006, 2009, 2011, 2007),
  ponatinib: { US: A(2012), EU: A(2013, epar("iclusig")), UK: A(2013, mhra("Iclusig")), JP: A(2016, PMDA), AU: A(2015, tga("Iclusig")) },
  asciminib: { US: A(2021), EU: A(2022, epar("scemblix")), UK: A(2022, mhra("Scemblix")), JP: A(2022, PMDA), CN: A(2023, NMPA), AU: A(2022, tga("Scemblix")) },
  ibrutinib: global("Imbruvica", "imbruvica", 2013, 2014, 2014, 2016, 2017, 2015),
  acalabrutinib: { US: A(2017), EU: A(2020, epar("calquence")), UK: A(2020, mhra("Calquence")), JP: A(2021, PMDA), CN: A(2023, NMPA), AU: A(2020, tga("Calquence")) },
  zanubrutinib: { US: A(2019), EU: A(2021, epar("brukinsa")), UK: A(2021, mhra("Brukinsa")), JP: A(2024, PMDA, "Brukinsa; 27 Dec 2024"), CN: A(2020, NMPA), AU: A(2020, tga("Brukinsa")) },
  pirtobrutinib: { US: A(2023), EU: C(2023, epar("jaypirca")), UK: A(2024, mhra("Jaypirca")), JP: A(2024, PMDA, "Jaypirca, relapsed or refractory mantle cell lymphoma; 24 Jun 2024") },
  nemtabrutinib: { US: UR("Phase 3 BELLWAVE-011") },
  "bgb-16673": { US: UR("Phase 3 CaDAnCe-304") },
  venetoclax: global("Venclexta", "venclyxto", 2016, 2016, 2016, 2019, 2020, 2017, "EU brand Venclyxto"),
  sonrotoclax: { US: A(2026, undefined, "Accelerated, MCL (May 2026)"), CN: A(2025, NMPA, "R/R MCL") },
  midostaurin: global("Rydapt", "rydapt", 2017, 2017, 2017, 2019, 2021, 2017),
  gilteritinib: { US: A(2018), EU: A(2019, epar("xospata")), UK: A(2019, mhra("Xospata")), JP: A(2018, PMDA, "First approval globally (Sep 2018)"), CN: A(2021, NMPA), AU: A(2019, tga("Xospata")) },
  quizartinib: { US: A(2023, undefined, "CRL 2019; approved Jul 2023"), EU: A(2023, epar("vanflyta")), UK: A(2024, govuk("quizartinib-approved-to-treat-adult-patients-with-a-type-of-blood-cancer"), "11 Mar 2024"), JP: A(2019, PMDA, "First approval globally (Jun 2019)"), CN: A(2025, NMPA) },
  ivosidenib: { US: A(2018), EU: A(2023, epar("tibsovo")), UK: A(2023, mhra("Tibsovo")), JP: A(2025, PMDA, "Tibsovo, IDH1-mutant AML; 27 Mar 2025 (Nihon Servier)"), CN: A(2022, NMPA, "CStone"), AU: A(2023, tga("Tibsovo")) },
  enasidenib: { US: A(2017), EU: W(2021, undefined, "MAA withdrawn 2021"), CN: NF() },
  olutasidenib: { US: A(2022), EU: UR("MAA (Rigel)") },
  vorasidenib: { US: A(2024), EU: V(A(2025, epar("voranigo"), "Grade 2 IDH-mutant glioma ≥12 yrs; 17 Sep 2025")), UK: A(2025, govuk("vorasidenib-approved-to-treat-patients-12-years-and-older-with-grade-2-astrocytoma-or-oligodendroglioma-with-a-susceptible-idh1-or-idh2-mutation"), "16 Sep 2025"), JP: UR("PMDA filing 2025"), AU: A(2025, tga("Voranigo")) },
  revumenib: { US: A(2024), EU: UR("MAA submitted 2025; no EPAR yet") },
  ziftomenib: { US: A(2025), EU: UR("Kura/Kyowa Kirin MAA") },
  azacitidine: global("Vidaza", "vidaza", 2004, 2008, 2008, 2011, 2017, 2009),
  "decitabine-cedazuridine": { US: A(2020), EU: A(2023, epar("inaqovi"), "EU brand Inaqovi"), UK: A(2023, mhra("Inaqovi")), AU: A(2022, tga("Inqovi")) },
  "cpx-351": { US: A(2017), EU: A(2018, epar("vyxeos-liposomal")), UK: A(2018, mhra("Vyxeos")), JP: A(2024, PMDA), AU: A(2021, tga("Vyxeos")) },
  tagraxofusp: { US: A(2018), EU: A(2021, epar("elzonris")), UK: A(2021, mhra("Elzonris")), JP: A(2025, PMDA, "Elzonris, blastic plasmacytoid dendritic cell neoplasm; 22 Dec 2025 (Nippon Shinyaku)") },
  palbociclib: global("Ibrance", "ibrance", 2015, 2016, 2016, 2017, 2018, 2017),
  ribociclib: global("Kisqali", "kisqali", 2017, 2017, 2017, 2019, 2023, 2017),
  abemaciclib: global("Verzenio", "verzenios", 2017, 2018, 2018, 2018, 2020, 2019, "EU brand Verzenios"),
  atirmociclib: { US: UR("Phase 3 FOURLIGHT-3") },
  alpelisib: { US: A(2019), EU: A(2020, epar("piqray")), UK: A(2020, mhra("Piqray")), JP: A(2022, PMDA), CN: A(2024, NMPA), AU: A(2020, tga("Piqray")) },
  capivasertib: { US: A(2023), EU: V(A(2024, epar("truqap"), "ER+/HER2- mBC with PIK3CA/AKT1/PTEN alteration; 17 Jun 2024")), UK: A(2024, govuk("capivasertib-approved-to-treat-patients-with-advanced-breast-cancer"), "13 Aug 2024"), JP: A(2024, PMDA), CN: A(2025, NMPA), AU: A(2024, tga("Truqap")) },
  inavolisib: { US: A(2024), EU: V(A(2025, epar("itovebi"), "PIK3CA-mutant ER+/HER2- mBC with palbociclib + fulvestrant; 18 Jul 2025")), UK: A(2025, govuk("mhra-approves-inavolisib-for-the-treatment-of-breast-cancer"), "26 Nov 2025"), JP: A(2025, PMDA), CN: A(2025, NMPA), AU: UR("TGA evaluation") },
  gedatolisib: { US: A(2026), EU: UR("MAA planned") },
  everolimus: global("Afinitor", "afinitor", 2009, 2009, 2009, 2010, 2013, 2009),
  olaparib: global("Lynparza", "lynparza", 2014, 2014, 2014, 2018, 2018, 2016),
  niraparib: { US: A(2017), EU: A(2017, epar("zejula")), UK: A(2017, mhra("Zejula")), JP: A(2020, PMDA), CN: A(2019, NMPA, "Zai Lab"), AU: A(2018, tga("Zejula")) },
  rucaparib: { US: A(2016), EU: A(2018, epar("rubraca")), UK: A(2018, mhra("Rubraca")), AU: A(2020, tga("Rubraca")) },
  talazoparib: { US: A(2018), EU: A(2019, epar("talzenna")), UK: A(2019, mhra("Talzenna")), JP: A(2024, PMDA, "Talzenna, BRCA-mutant metastatic CRPC; 18 Jan 2024"), CN: A(2021, NMPA), AU: A(2019, tga("Talzenna")) },
  belzutifan: { US: A(2021), EU: V(C(2025, epar("welireg"), "ccRCC after ≥2 lines; VHL-associated tumours; 12 Feb 2025 (conditional)")), UK: A(2025, mhra("Welireg")), JP: A(2025, PMDA), AU: A(2025, tga("Welireg")) },
  avapritinib: { US: A(2020), EU: A(2020, epar("ayvakyt"), "EU brand Ayvakyt"), UK: A(2020, mhra("Ayvakyt")), CN: A(2021, NMPA, "CStone"), AU: A(2022, tga("Ayvakyt")) },
  ripretinib: { US: A(2020), EU: A(2021, epar("qinlock")), UK: A(2021, mhra("Qinlock")), CN: A(2021, NMPA, "Zai Lab"), AU: A(2020, tga("Qinlock")) },
  nirogacestat: { US: A(2023), EU: A(2025, epar("ogsiveo")), UK: A(2026, govuk("nirogacestat-hydrobromide-approved-to-treat-desmoid-tumours"), "Desmoid tumours; 7 Jan 2026") },
  vimseltinib: { US: A(2025), EU: V(A(2025, epar("romvimza"), "Symptomatic TGCT where surgery has been exhausted or would cause unacceptable morbidity; 17 Sep 2025")), UK: A(2026, govuk("vimseltinib-romvimza-approved-for-use-in-adults-to-treat-tenosynovial-giant-cell-tumours"), "TGCT; 14 Aug 2026") },
  "avutometinib-defactinib": { US: A(2025, undefined, "Accelerated, KRAS-mutant recurrent LGSOC (May 2025)"), EU: UR("MAA 2026") },
  cabozantinib: { US: A(2012, undefined, undefined, "Cometriq 2012 (MTC); Cabometyx 2016"), EU: A(2014, epar("cometriq"), "Cometriq for medullary thyroid cancer; 21 Mar 2014. Cabometyx (RCC) Sep 2016"), UK: A(2014, mhra("Cometriq")), JP: A(2020, PMDA), CN: A(2023, NMPA), AU: A(2017, tga("Cabometyx")) },
  lenvatinib: global("Lenvima", "lenvima", 2015, 2015, 2015, 2015, 2018, 2015),
  sorafenib: { ...global("Nexavar", "nexavar", 2005, 2006, 2006, 2008, 2006, 2006), IN: IN(undefined, "https://en.wikipedia.org/wiki/Natco_Pharma", "HCC, RCC", "Bayer's Nexavar; India's first compulsory licence (Natco, March 2012) cut the price by about 97%") },
  regorafenib: global("Stivarga", "stivarga", 2012, 2013, 2013, 2013, 2017, 2013),
  sunitinib: global("Sutent", "sutent", 2006, 2006, 2006, 2008, 2007, 2006),
  pazopanib: global("Votrient", "votrient", 2009, 2010, 2010, 2012, 2017, 2010),
  axitinib: global("Inlyta", "inlyta", 2012, 2012, 2012, 2012, 2015, 2012),
  tivozanib: { US: A(2021), EU: A(2017, epar("fotivda"), "EU first (Aug 2017)"), UK: A(2017, mhra("Fotivda")) },
  fruquintinib: { US: A(2023), EU: A(2024, epar("fruzaqla")), UK: A(2024, govuk("fruquintinib-approved-to-treat-adult-patients-with-metastatic-colorectal-cancer"), "20 Sep 2024"), JP: A(2024, PMDA), CN: A(2018, NMPA, "First approval globally (Sep 2018)"), AU: A(2025, tga("Fruzaqla")) },
  "trifluridine-tipiracil": global("Lonsurf", "lonsurf", 2015, 2016, 2016, 2014, 2019, 2018, "Japan first (Mar 2014)"),
  vandetanib: { US: A(2011), EU: C(2012, epar("caprelsa")), UK: A(2012, mhra("Caprelsa")), JP: A(2015, PMDA), AU: A(2013, tga("Caprelsa")) },
  erdafitinib: { US: A(2019), EU: A(2024, epar("balversa")), UK: A(2024, mhra("Balversa")), JP: A(2024, PMDA), AU: A(2025, tga("Balversa")) },
  pemigatinib: { US: A(2020), EU: C(2021, epar("pemazyre")), UK: A(2021, mhra("Pemazyre")), JP: A(2021, PMDA), CN: A(2022, NMPA, "Innovent"), AU: A(2022, tga("Pemazyre")) },
  futibatinib: { US: A(2022), EU: C(2023, epar("lytgobi")), UK: A(2023, mhra("Lytgobi")), JP: A(2023, PMDA) },
  tinengotinib: { US: UR("Phase 3 FIRST-308"), CN: UR("Phase 3") },
  tovorafenib: { US: A(2024), EU: A(2026, epar("ojemda"), "Paediatric low-grade glioma (Apr 2026)"), UK: A(2026, mhra("Ojemda")) },
  dordaviprone: { US: A(2025, undefined, "Accelerated; H3 K27M-mutant diffuse midline glioma (Aug 2025)"), EU: UR("MAA (Jazz)") },
  selinexor: { US: A(2019), EU: C(2021, epar("nexpovio"), "EU brand Nexpovio"), UK: A(2021, mhra("Nexpovio")), CN: A(2021, NMPA, "Antengene"), AU: A(2022, tga("Xpovio")) },
  mevrometostat: { US: UR("Phase 3 MEVPRO-1/2") },
  eflornithine: { US: A(2023, undefined, "Iwilfin, high-risk neuroblastoma maintenance"), EU: NF("USWM has not filed in EU") },
  relacorilant: { US: A(2026), EU: UR("MAA (Corcept) 2026") },
  afatinib: { US: A(2013, undefined, "US brand Gilotrif"), EU: A(2013, epar("giotrif"), "EU brand Giotrif"), UK: A(2013, mhra("Giotrif")), JP: A(2014, PMDA), CN: A(2017, NMPA), AU: A(undefined, tga("Giotrif")) },
  erlotinib: { US: A(2004), EU: A(2005, epar("tarceva")), UK: A(2005, mhra("Tarceva")), JP: A(2007, PMDA), CN: A(undefined, NMPA), AU: A(undefined, tga("Tarceva")) },
  gefitinib: { US: A(2003, undefined, "Accelerated 2003; restricted 2005; EGFR-mutant 1L label 2015"), EU: A(2009, epar("iressa")), UK: A(2009, mhra("Iressa")), JP: A(2002, PMDA, "First approval globally (Jul 2002)"), CN: A(2005, NMPA), AU: A(undefined, tga("Iressa")) },
  dacomitinib: { US: A(2018), EU: A(2019, epar("vizimpro")), UK: A(2019, mhra("Vizimpro")), JP: A(2019, PMDA), CN: A(2019, NMPA), AU: A(undefined, tga("Vizimpro")) },
  sunvozertinib: { US: A(2025), CN: A(2023, NMPA, "Dizal; EGFR exon 20 insertion NSCLC after platinum (Aug 2023)") },
  crizotinib: { US: A(2011), EU: A(2012, epar("xalkori"), "Conditional Oct 2012; full approval 2015"), UK: A(2012, mhra("Xalkori")), JP: A(2012, PMDA), CN: A(2013, NMPA), AU: A(undefined, tga("Xalkori")) },
  ceritinib: { US: A(2014), EU: A(2015, epar("zykadia"), "Conditional May 2015; full approval 2017"), UK: A(2015, mhra("Zykadia")), JP: A(2016, PMDA), CN: A(2018, NMPA), AU: A(undefined, tga("Zykadia")) },
  brigatinib: { US: A(2017), EU: A(2018, epar("alunbrig")), UK: A(2018, mhra("Alunbrig")), JP: A(2021, PMDA), CN: A(2022, NMPA), AU: A(undefined, tga("Alunbrig")) },
  ensartinib: { US: A(2024, undefined, "Ensacove"), CN: A(2020, NMPA, "Betta; ALK+ NSCLC after crizotinib (Nov 2020)") },
  entrectinib: { US: A(2019), EU: A(2020, epar("rozlytrek"), "Conditional Jul 2020"), UK: A(2020, mhra("Rozlytrek")), JP: A(2019, PMDA, "First approval globally (NTRK, Jun 2019)"), CN: A(2022, NMPA), AU: A(undefined, tga("Rozlytrek")) },
  larotrectinib: { US: A(2018), EU: A(2019, epar("vitrakvi"), "Conditional Sep 2019"), UK: A(2019, mhra("Vitrakvi")), JP: A(2021, PMDA), CN: A(2022, NMPA), AU: A(undefined, tga("Vitrakvi")) },
  taletrectinib: { US: A(2025, undefined, "Ibtrozi (Jun 2025)"), JP: A(2025, PMDA, "Ibtrozi, ROS1 fusion-positive NSCLC; 19 Sep 2025 (Nippon Kayaku)"), CN: A(2025, NMPA, "Innovent; ROS1+ NSCLC (Jan 2025)") },
  nilotinib: { US: A(2007), EU: A(2007, epar("tasigna")), UK: A(2007, mhra("Tasigna")), JP: A(2009, PMDA), CN: A(2009, NMPA), AU: A(undefined, tga("Tasigna")) },
  bosutinib: { US: A(2012), EU: A(2013, epar("bosulif")), UK: A(2013, mhra("Bosulif")), JP: A(2014, PMDA), AU: A(undefined, tga("Bosulif")) },
  ruxolitinib: { US: A(2011), EU: A(2012, epar("jakavi"), "EU brand Jakavi"), UK: A(2012, mhra("Jakavi")), JP: A(2014, PMDA), CN: A(2017, NMPA), AU: A(undefined, tga("Jakavi")) },
  fedratinib: { US: A(2019), EU: A(2021, epar("inrebic")), UK: A(undefined, mhra("Inrebic")), JP: A(2025, PMDA, "Inrebic, myelofibrosis; 24 Jun 2025 (Bristol Myers Squibb)"), AU: A(undefined, tga("Inrebic")) },
  pacritinib: { US: A(2022, undefined, "Accelerated, Vonjo (Feb 2022)") },
  momelotinib: { US: A(2023), EU: A(2024, epar("omjjara"), "EU brand Omjjara"), UK: A(2024, mhra("Omjjara")), JP: A(2024, PMDA, "Omjjara, myelofibrosis; 24 Jun 2024 (GSK)") },
  idelalisib: { US: A(2014), EU: A(2014, epar("zydelig")), UK: A(2014, mhra("Zydelig")), AU: A(undefined, tga("Zydelig")) },
  duvelisib: { US: A(2018), EU: W(2026, epar("copiktra"), "Authorised May 2021; marketing authorisation withdrawn at Secura Bio's request 16 Feb 2026 (commercial reasons)") },
  glasdegib: { US: A(2018), EU: A(2020, epar("daurismo")), UK: A(2020, mhra("Daurismo")) },
  ixazomib: { US: A(2015), EU: A(2016, epar("ninlaro")), UK: A(2016, mhra("Ninlaro")), JP: A(2017, PMDA), CN: A(2018, NMPA), AU: A(undefined, tga("Ninlaro")) },
  vismodegib: { US: A(2012), EU: A(2013, epar("erivedge")), UK: A(2013, mhra("Erivedge")), AU: A(undefined, tga("Erivedge")) },
  sonidegib: { US: A(2015), EU: A(2015, epar("odomzo")), UK: A(2015, mhra("Odomzo")), AU: A(undefined, tga("Odomzo")) },
  pexidartinib: { US: A(2019), EU: W(2020, undefined, "Daiichi Sankyo withdrew the Turalio MAA (Jul 2020) after the CHMP signalled a negative opinion") },
  temsirolimus: { US: A(2007), EU: A(2007, epar("torisel"), "Advanced RCC Nov 2007; MCL added 2009"), UK: A(2007, mhra("Torisel")), JP: A(2010, PMDA) },
  belinostat: { US: A(2014, undefined, "Accelerated, PTCL (Jul 2014)") },
  romidepsin: { US: A(2009), EU: W(undefined, undefined, "MAA withdrawn by Celgene before a CHMP opinion"), JP: A(2017, PMDA) },
  pralatrexate: { US: A(2009), EU: R(2012, "CHMP negative opinion (2012)"), JP: A(2017, PMDA, "Difolta (Mundipharma)") },
  mitotane: { US: A(1970), EU: A(2004, epar("lysodren")), UK: A(2004, mhra("Lysodren")), JP: A(undefined, PMDA, "Opeprim") },
  "tretinoin-atra": { US: A(1995), EU: EU_NATIONAL(), UK: A(undefined, mhra("Vesanoid")), JP: A(undefined, PMDA), CN: A(undefined, NMPA), AU: A(undefined, tga("Vesanoid")) },
  "arsenic-trioxide": { US: A(2000), EU: A(2002, epar("trisenox")), UK: A(2002, mhra("Trisenox")), JP: A(2004, PMDA), CN: A(undefined, NMPA, "Domestic arsenic trioxide injections"), AU: A(undefined, tga("Trisenox")) },

  // ================= Hormonal =================
  abiraterone: { ...global("Zytiga", "zytiga", 2011, 2011, 2011, 2014, 2015, 2012), IN: IN(undefined, "https://en.wikipedia.org/wiki/Abiraterone_acetate", "mCRPC", "Many Indian generics; about $238 a month in 2019") },
  enzalutamide: global("Xtandi", "xtandi", 2012, 2013, 2013, 2014, 2019, 2014),
  apalutamide: global("Erleada", "erleada", 2018, 2019, 2019, 2019, 2019, 2018),
  darolutamide: global("Nubeqa", "nubeqa", 2019, 2020, 2020, 2020, 2021, 2020),
  relugolix: { US: A(2020), EU: A(2022, epar("orgovyx")), UK: A(2022, mhra("Orgovyx")), JP: A(2019, PMDA, "Relumina (uterine fibroids) 2019; prostate later"), AU: A(2023, tga("Orgovyx")) },
  goserelin: global("Zoladex", "zoladex", 1989, 1987, 1987, 1991, 1996, 1990, "Legacy product"),
  tamoxifen: global("Nolvadex", "nolvadex", 1977, 1973, 1973, 1981, 1990, 1976, "Legacy product; UK first (1973)"),
  letrozole: global("Femara", "femara", 1997, 1996, 1996, 2006, 2000, 1997),
  exemestane: global("Aromasin", "aromasin", 1999, 1999, 1999, 2002, 2001, 2000),
  fulvestrant: global("Faslodex", "faslodex", 2002, 2004, 2004, 2011, 2010, 2004),
  elacestrant: { US: A(2023), EU: A(2023, epar("orserdu")), UK: A(2024, mhra("Orserdu")), JP: UR("PMDA filing"), AU: A(2024, tga("Orserdu")) },
  imlunestrant: { US: A(2025), EU: V(A(2026, epar("inluriyo"), "ESR1-mutant ER+/HER2- mBC; 9 Jan 2026")), UK: A(2026, govuk("mhra-approves-imlunestrant-tosylate-inluryo-a-new-treatment-for-breast-cancer"), "24 Feb 2026"), JP: A(2025, PMDA, "Inluriyo; 22 Dec 2025") },
  camizestrant: { US: A(2026, undefined, "Etcamah, 4 Sep 2026, after 6-3 negative ODAC"), EU: V(A(2026, epar("etcamah"), "ER+/HER2- advanced breast cancer with emergent ESR1 mutation, with a CDK4/6 inhibitor; 20 Jul 2026")) },
  vepdegestrant: { US: A(2026), EU: UR("MAA (Arvinas/Pfizer)") },
  giredestrant: { US: UR("evERA positive; NDA 2026") },
  "megestrol-progestins": global("Megace", "megestrol", 1971, 1970, 1970, 1980, 1995, 1975, "Legacy product"),
  "octreotide-lanreotide": global("Sandostatin", "sandostatin", 1988, 1988, 1988, 1991, 1996, 1990),
  bicalutamide: { US: A(1995), EU: EU_NATIONAL(1995, "National authorisations (Casodex); no centralised EPAR"), UK: A(1995, mhra("Casodex")), JP: A(1999, PMDA), CN: A(undefined, NMPA), AU: A(undefined, tga("Casodex")) },
  degarelix: { US: A(2008), EU: A(2009, epar("firmagon")), UK: A(2009, mhra("Firmagon")), JP: A(2012, PMDA, "Gonax (Astellas)"), CN: A(2018, NMPA), AU: A(undefined, tga("Firmagon")) },
  leuprolide: { US: A(1985), EU: EU_NATIONAL(), UK: A(undefined, mhra("Prostap")), JP: A(undefined, PMDA, "Leuplin (Takeda)"), CN: A(undefined, NMPA), AU: A(undefined, tga("Lucrin")) },

  // ================= Chemotherapy and regimens =================
  paclitaxel: global("Taxol", "paclitaxel", 1992, 1993, 1993, 1997, 1995, 1994),
  docetaxel: global("Taxotere", "taxotere", 1996, 1995, 1995, 1996, 1996, 1996),
  carboplatin: global("Paraplatin", "carboplatin", 1989, 1986, 1986, 1990, 1990, 1988),
  cisplatin: global("Platinol", "cisplatin", 1978, 1979, 1979, 1983, 1985, 1980),
  doxorubicin: global("Adriamycin", "doxorubicin", 1974, 1971, 1971, 1975, 1980, 1975),
  "pegylated-liposomal-doxorubicin": global("Doxil", "caelyx-pegylated-liposomal", 1995, 1996, 1996, 2007, 2003, 1997, "EU brand Caelyx"),
  ifosfamide: global("Ifex", "ifosfamide", 1988, 1980, 1980, 1985, 1990, 1985),
  pemetrexed: global("Alimta", "alimta", 2004, 2004, 2004, 2007, 2005, 2004),
  topotecan: global("Hycamtin", "hycamtin", 1996, 1996, 1996, 2000, 2000, 1998),
  cabazitaxel: global("Jevtana", "jevtana", 2010, 2011, 2011, 2014, 2020, 2011),
  trabectedin: { US: A(2015), EU: A(2007, epar("yondelis"), "EU first (Sep 2007), soft-tissue sarcoma"), UK: A(2007, mhra("Yondelis")), JP: A(2015, PMDA), AU: A(2010, tga("Yondelis")) },
  lurbinectedin: { US: A(2020), EU: V(A(2026, epar("zepzelca"), "Maintenance with atezolizumab in ES-SCLC after first-line induction; 29 May 2026")), AU: A(2023, tga("Zepzelca")) },
  nalirifox: { US: A(2024, undefined, "Onivyde + oxaliplatin/5-FU/LV for 1L metastatic PDAC"), EU: A(2016, epar("onivyde-pegylated-liposomal"), "Onivyde 2L after gemcitabine (2016); NALIRIFOX label 2025"), UK: A(2016, mhra("Onivyde")), AU: A(2018, tga("Onivyde")) },
  bortezomib: global("Velcade", "velcade", 2003, 2004, 2004, 2006, 2005, 2005),
  carfilzomib: global("Kyprolis", "kyprolis", 2012, 2015, 2015, 2016, 2021, 2015),
  lenalidomide: global("Revlimid", "revlimid", 2005, 2007, 2007, 2010, 2013, 2007),
  iberdomide: { US: A(2026, "https://dailymed.nlm.nih.gov/dailymed/search.cfm?query=Iberdomide", "Multiple myeloma after at least one prior line, with daratumumab-hyaluronidase and dexamethasone (Zenbexus)", "Label effective 13 August 2026; EXCALIBER-Maintenance phase 3 ongoing") },
  mezigdomide: { US: UR("SUCCESSOR phase 3") },
  golcadomide: { US: UR("Phase 3 GOLSEEK") },
  cyclophosphamide: { US: A(1959), EU: EU_NATIONAL(), UK: A(undefined, mhra("Cyclophosphamide")), JP: A(undefined, PMDA, "Endoxan"), CN: A(undefined, NMPA), AU: A(undefined, tga("Cyclophosphamide")) },
  melphalan: { US: A(1964), EU: EU_NATIONAL(), UK: A(undefined, mhra("Alkeran")), JP: A(undefined, PMDA, "Alkeran"), CN: A(undefined, NMPA), AU: A(undefined, tga("Alkeran")) },
  bendamustine: { US: A(2008), EU: A(2010, undefined, "National/decentralised authorisations (Levact, Ribomustin); no centralised EPAR"), UK: A(2010, mhra("Levact")), JP: A(2010, PMDA, "Treakisym (SymBio)") },
  treosulfan: { US: A(2025, undefined, "Grafapex (Jan 2025)"), EU: A(2019, epar("trecondi"), "EU brand Trecondi"), UK: A(2019, mhra("Trecondi")) },
  methotrexate: { US: A(1953), EU: EU_NATIONAL(), UK: A(undefined, mhra("Methotrexate")), JP: A(undefined, PMDA), CN: A(undefined, NMPA), AU: A(undefined, tga("Methotrexate")) },
  fluorouracil: { US: A(1962), EU: EU_NATIONAL(), UK: A(undefined, mhra("Fluorouracil")), JP: A(undefined, PMDA), CN: A(undefined, NMPA), AU: A(undefined, tga("Fluorouracil")) },
  gemcitabine: { US: A(1996), EU: EU_NATIONAL(undefined, "National authorisations (Gemzar); no centralised EPAR"), UK: A(undefined, mhra("Gemzar")), JP: A(1999, PMDA), CN: A(undefined, NMPA), AU: A(undefined, tga("Gemzar")) },
  hydroxyurea: { US: A(1967), EU: A(undefined, epar("siklos"), "Hydrea national; Siklos (sickle cell) centralised 2007"), UK: A(undefined, mhra("Hydrea")), JP: A(undefined, PMDA), CN: A(undefined, NMPA), AU: A(undefined, tga("Hydrea")) },
  cladribine: { US: A(1993), EU: A(2004, epar("litak"), "Litak (subcutaneous) centralised; Leustatin national"), UK: A(undefined, mhra("Leustat")), JP: A(undefined, PMDA, "Leustatin"), AU: A(undefined, tga("Leustatin")) },
  asparaginase: { US: A(1994), EU: A(2016, epar("oncaspar"), "Oncaspar centralised 2016; Erwinase and native asparaginases national"), UK: A(undefined, mhra("Oncaspar")), JP: A(undefined, PMDA, "Leunase (native E. coli asparaginase)"), CN: A(undefined, NMPA), AU: A(undefined, tga("Oncaspar")) },
  irinotecan: { US: A(1996), EU: A(undefined, epar("onivyde-pegylated-liposomal"), "Campto national; Onivyde centralised 2016"), UK: A(undefined, mhra("Campto")), JP: A(1994, PMDA, "First approval globally (Campto / Topotecin, 1994)"), CN: A(undefined, NMPA), AU: A(undefined, tga("Campto")) },
  oxaliplatin: { US: A(2002), EU: A(1996, undefined, "National authorisation (Eloxatine, France 1996); no centralised EPAR"), UK: A(undefined, mhra("Eloxatin")), JP: A(2005, PMDA, "Elplat"), CN: A(undefined, NMPA), AU: A(undefined, tga("Eloxatin")) },
  eribulin: { US: A(2010), EU: A(2011, epar("halaven")), UK: A(2011, mhra("Halaven")), JP: A(2011, PMDA), CN: A(2019, NMPA), AU: A(undefined, tga("Halaven")) },
  vinorelbine: { US: A(1994), EU: A(1989, undefined, "National authorisation (Navelbine, France 1989); no centralised EPAR"), UK: A(undefined, mhra("Navelbine")), JP: A(undefined, PMDA), CN: A(undefined, NMPA), AU: A(undefined, tga("Navelbine")) },
  vincristine: { US: A(1963), EU: EU_NATIONAL(), UK: A(undefined, mhra("Vincristine")), JP: A(undefined, PMDA, "Oncovin"), CN: A(undefined, NMPA), AU: A(undefined, tga("Vincristine")) },
  vinblastine: { US: A(1965), EU: EU_NATIONAL(), UK: A(undefined, mhra("Vinblastine")), JP: A(undefined, PMDA), CN: A(undefined, NMPA), AU: A(undefined, tga("Vinblastine")) },
  etoposide: { US: A(1983), EU: EU_NATIONAL(), UK: A(undefined, mhra("Etoposide")), JP: A(undefined, PMDA), CN: A(undefined, NMPA), AU: A(undefined, tga("Etoposide")) },
  bleomycin: { US: A(1973), EU: EU_NATIONAL(), UK: A(undefined, mhra("Bleomycin")), JP: A(undefined, PMDA), CN: A(undefined, NMPA), AU: A(undefined, tga("Bleomycin")) },
  dactinomycin: { US: A(1964), EU: EU_NATIONAL(), UK: A(undefined, mhra("Cosmegen")), JP: A(undefined, PMDA, "Cosmegen"), CN: A(undefined, NMPA), AU: A(undefined, tga("Cosmegen")) },
  mitomycin: { US: A(1974), EU: EU_NATIONAL(), UK: A(undefined, mhra("Mitomycin")), JP: A(undefined, PMDA), CN: A(undefined, NMPA), AU: A(undefined, tga("Mitomycin")) },
  temozolomide: { US: A(1999), EU: A(1999, epar("temodal"), "Temodal; malignant glioma (recurrent 1999; newly diagnosed glioblastoma with radiotherapy 2005); 26 Jan 1999"), UK: A(1999, mhra("Temodal")), JP: A(2006, PMDA, "Temodal capsules, malignant glioma; 26 Jul 2006") },
  lomustine: { US: A(1976, undefined, "CeeNU 1976; Gleostine"), EU: EU_NATIONAL(undefined, "National authorisations (e.g. Cecenu, Germany); no centralised EPAR") },
  // Combination regimens: the components hold the authorisations.
  capox: regimen(),
  "cytarabine-7-3": regimen(1969),
  flot: regimen(),
  folfiri: regimen(),
  folfirinox: regimen(),
  folfox: regimen(),
  "gemcitabine-cisplatin": regimen(),
  "gemcitabine-nab-paclitaxel": regimen(),
  "platinum-etoposide": regimen(),

  // ================= Antibodies (non-checkpoint) =================
  trastuzumab: { ...global("Herceptin", "herceptin", 1998, 2000, 2000, 2001, 2002, 2000), IN: IN(undefined, "https://www.biocon.com", "HER2+ breast and gastric", "Roche's Herceptin (also as Herclon via Emcure); Biocon-Mylan CANMAb, the first trastuzumab biosimilar approved anywhere, launched 2014") },
  "trastuzumab-biosimilars": global("Ogivri / Kanjinti / Herzuma", "ogivri", 2017, 2017, 2018, 2018, 2020, 2018),
  pertuzumab: global("Perjeta", "perjeta", 2012, 2013, 2013, 2013, 2018, 2013),
  margetuximab: { US: A(2020), CN: A(2024, NMPA, "Zai Lab"), EU: W(2022, undefined, "MAA withdrawn 2022") },
  bevacizumab: { ...global("Avastin", "avastin", 2004, 2005, 2005, 2007, 2010, 2005), IN: IN(undefined, "https://web.archive.org/web/20220505192107/https://www.heteroworld.com/", "Colorectal and other Avastin indications", "Roche's Avastin; Indian biosimilars from Hetero (2016), Biocon (Krabeva), Enzene (2023) and others") },
  "bevacizumab-glioma": { US: A(2009, undefined, "Recurrent GBM (accelerated 2009; full 2017)"), EU: NF("CHMP negative opinion for GBM 2009-10; not approved in EU for glioma"), JP: A(2013, PMDA), AU: A(2010, tga("Avastin")) },
  cetuximab: global("Erbitux", "erbitux", 2004, 2004, 2004, 2008, 2006, 2005),
  panitumumab: global("Vectibix", "vectibix", 2006, 2007, 2007, 2010, 2021, 2008),
  ramucirumab: global("Cyramza", "cyramza", 2014, 2014, 2014, 2015, 2022, 2015),
  rituximab: { ...global("Rituxan", "mabthera", 1997, 1998, 1998, 2001, 2000, 1998, "EU brand MabThera"), IN: IN(undefined, "https://www.drreddys.com", "NHL, CLL", "Roche's MabThera; Dr Reddy's Reditux (2007) was the first rituximab biosimilar approved anywhere; Hetero (2015) and others followed") },
  obinutuzumab: global("Gazyva", "gazyvaro", 2013, 2014, 2014, 2018, 2021, 2014, "EU brand Gazyvaro"),
  daratumumab: global("Darzalex", "darzalex", 2015, 2016, 2016, 2017, 2019, 2016),
  isatuximab: global("Sarclisa", "sarclisa", 2020, 2020, 2020, 2020, 2022, 2020),
  tafasitamab: { US: A(2020), EU: C(2021, epar("minjuvi"), "EU brand Minjuvi"), UK: A(2021, mhra("Minjuvi")), JP: A(2025, PMDA, "Minjuvi, relapsed or refractory follicular lymphoma; 22 Dec 2025 (Incyte Japan)"), AU: A(2022, tga("Minjuvi")) },
  dinutuximab: { US: A(2015, undefined, "Unituxin"), EU: A(2017, epar("qarziba"), "Dinutuximab beta (Qarziba, EUSA/Recordati)"), UK: A(2017, mhra("Qarziba")), JP: A(2021, PMDA, "Dinutuximab beta"), AU: A(2020, tga("Qarziba")) },
  naxitamab: { US: A(2020, undefined, "Accelerated"), EU: NF("Y-mAbs withdrew EU MAA 2022"), CN: A(2024, NMPA, "SciClone") },
  zolbetuximab: { US: A(2024, undefined, "Oct 2024 after 2024 CRL for manufacturing"), EU: V(A(2024, epar("vyloy"), "1L CLDN18.2+ HER2- gastric/GEJ; 19 Sep 2024")), UK: A(2024, govuk("mhra-approves-zolbetuximab"), "14 Aug 2024"), JP: A(2024, PMDA, "First approval globally (Mar 2024)"), CN: A(2025, NMPA), AU: A(2025, tga("Vyloy")) },
  elotuzumab: { US: A(2015), EU: A(2016, epar("empliciti")), UK: A(2016, mhra("Empliciti")), JP: A(2016, PMDA), AU: A(undefined, tga("Empliciti")) },
  mogamulizumab: { US: A(2018), EU: A(2018, epar("poteligeo")), UK: A(2018, mhra("Poteligeo")), JP: A(2012, PMDA, "First approval globally (CCR4+ ATL, Mar 2012)") },

  // ================= Haematology, cytokines, immunomodulators and supportive care =================
  aldesleukin: { US: A(1992), EU: EU_NATIONAL(), UK: A(undefined, mhra("Proleukin")), AU: A(undefined, tga("Proleukin")) },
  mifamurtide: { US: R(2007, "FDA not-approvable letter (Aug 2007); never approved in the US"), EU: A(2009, epar("mepact")), UK: A(2009, mhra("Mepact")) },
  thalidomide: { US: A(1998, undefined, "ENL 1998; multiple myeloma 2006"), EU: A(2008, epar("thalidomide-bms"), "EPAR formerly Thalidomide Celgene"), UK: A(2008, mhra("Thalidomide")), JP: A(2008, PMDA, "Thaled (Fujimoto)"), AU: A(undefined, tga("Thalomid")) },
  pomalidomide: { US: A(2013), EU: A(2013, epar("imnovid"), "EU brand Imnovid"), UK: A(2013, mhra("Imnovid")), JP: A(2015, PMDA), CN: A(2020, NMPA), AU: A(undefined, tga("Pomalyst")) },
  luspatercept: { US: A(2019, undefined, "Beta-thalassaemia 2019; MDS 2020"), EU: A(2020, epar("reblozyl")), UK: A(2020, mhra("Reblozyl")), JP: A(2024, PMDA, "Reblozyl, anaemia associated with myelodysplastic syndromes; 18 Jan 2024"), AU: A(undefined, tga("Reblozyl")) },
  "ropeginterferon-alfa-2b": { US: A(2021), EU: A(2019, epar("besremi"), "First approval globally (Feb 2019)"), UK: A(2019, mhra("Besremi")), JP: A(2023, PMDA) },
  rusfertide: { US: A(2026, undefined, "Mimrylo, polycythaemia vera") },
  imetelstat: { US: A(2024), EU: A(2025, epar("rytelo")) },
  belumosudil: { US: A(2021), UK: A(undefined, mhra("Rezurock")), JP: A(undefined, PMDA, "Meiji Seika") },
  "sodium-thiosulfate": { US: A(2022, undefined, "Pedmark"), EU: A(2023, epar("pedmarqsi"), "EU brand Pedmarqsi"), UK: A(undefined, mhra("Pedmarqsi")) },
  // ================= Oncolytic viruses, vaccines, intravesical =================
  "talimogene-laherparepvec": { US: A(2015), EU: A(2015, epar("imlygic")), UK: A(2016, mhra("Imlygic")), AU: A(2016, tga("Imlygic")) },
  "vusolimogene-oderparepvec": { US: A(2026, undefined, "Accelerated Aug 2026 after Jul 2025 CRL"), EU: NF("No MAA announced") },
  "nadofaragene-firadenovec": { US: A(2022), EU: V(C(2026, epar("adstiladrin"), "BCG-unresponsive NMIBC with CIS; 28 May 2026 (conditional)")), UK: UR("MHRA review") },
  "nogapendekin-alfa": { US: A(2024), EU: V(C(2026, epar("anktiva"), "BCG-unresponsive NMIBC with CIS, with BCG; 16 Feb 2026 (conditional)")), UK: A(2025, mhra("Anktiva")) },
  "tar-200": { US: A(2025, undefined, "Inlexzo, BCG-unresponsive NMIBC (Sep 2025)"), EU: UR("MAA 2026") },
  "bcg-intravesical": { US: A(1990, undefined, "TICE BCG"), EU: EU_NATIONAL(undefined, "National authorisations (BCG-medac, OncoTICE); no centralised EPAR"), UK: A(undefined, mhra("BCG")) },
  cretostimogene: { US: UR("Rolling BLA (CG Oncology)") },
  "gardasil-9": global("Gardasil 9", "gardasil-9", 2014, 2015, 2015, 2020, 2018, 2015, "Gardasil (4-valent) 2006 US"),
  "intismeran-autogene": { US: UR("INTerpath-001 positive Aug 2026; filings to follow") },

  // ================= Withdrawn products and EU-only authorisations (EMA register) ==========  melflufen: { US: W(2021, undefined, "Pepaxto accelerated approval Feb 2021; withdrawn from the US market by Oncopeptides Oct 2021"), EU: A(2022, epar("pepaxti"), "Pepaxti with dexamethasone; multiple myeloma after ≥3 prior lines, refractory to a PI, an IMiD and an anti-CD38 antibody; 17 Aug 2022") },
  panobinostat: { US: W(2022, undefined, "Farydak accelerated approval Feb 2015; US approval withdrawn 2022 at Secura Bio's request"), EU: A(2015, epar("farydak"), "Farydak with bortezomib and dexamethasone; relapsed/refractory myeloma after ≥2 prior regimens; 28 Aug 2015") },
  nintedanib: { EU: A(2014, epar("vargatef"), "Vargatef with docetaxel; adenocarcinoma NSCLC after first-line chemotherapy; 21 Nov 2014", "US approval (Ofev) is for pulmonary fibrosis, not oncology"), UK: A(2014, mhra("Vargatef")) },
  "moxetumomab-pasudotox": { US: W(2023, undefined, "Lumoxiti accelerated approval Sep 2018; discontinued by AstraZeneca and withdrawn 2023"), EU: W(2021, epar("lumoxiti"), "Authorised 8 Feb 2021; marketing authorisation withdrawn at the holder's request 23 Jul 2021") },
  "trastuzumab-duocarmazine": { US: R(2023, "Complete response letter May 2023 (Byondis)"), EU: W(undefined, epar("jivadco"), "Marketing authorisation application withdrawn before a CHMP opinion") },
  copanlisib: { US: W(2023, undefined, "Aliqopa accelerated approval Sep 2017; withdrawn by Bayer Nov 2023 after CHRONOS-4"), EU: W(undefined, epar("aliqopa"), "Marketing authorisation application withdrawn before a CHMP opinion") },
  mobocertinib: { US: W(2023, undefined, "Exkivity accelerated approval Sep 2021; withdrawn by Takeda Oct 2023 after EXCLAIM-2"), EU: W(undefined, epar("exkivity"), "Marketing authorisation application withdrawn before a CHMP opinion") },

  // ================= India-first products =================
  "talicabtagene-autoleucel": { IN: IN(2023, "https://immunoact.com", "Relapsed or refractory B-cell lymphoma and B-ALL", "NexCAR19 (ImmunoACT); first CAR-T approved in India") },
  "varnimcabtagene-autoleucel": { IN: IN(2024, "https://www.immuneel.com", "Relapsed or refractory B-cell lymphoma", "Qartemi (Immuneel); Indian version of Barcelona's ARI-0001, which is approved in Spain under the hospital exemption") },
  cervavac: { IN: IN(2022, "https://www.seruminstitute.com/product_ind_cervavac.php", "Quadrivalent HPV vaccine, ages 9-26", "Serum Institute of India; introduced 2023") },
  // ================= Devices and tests =================
  optune: { US: A(2011, undefined, "GBM 2011/2015; NSCLC 2024; pancreatic 2026"), EU: A(2015, undefined, "CE mark (GBM); pancreatic and NSCLC CE marks 2024-26", "CE mark is not an EMA authorisation"), JP: A(2016, PMDA, "GBM"), CN: A(2020, NMPA, "GBM (Zai Lab)") },
  "foundationone-cdx": { US: A(2017, undefined, "FDA PMA companion diagnostic"), JP: A(2018, PMDA, "First CGP test approved in Japan"), EU: A(2019, undefined, "CE-IVD", "IVDR transition; CE marking is not an EMA approval") },
  shield: { US: A(2024, undefined, "FDA PMA; Medicare coverage"), EU: NF("CE-IVD not sought") },
  galleri: { US: UR("PMA submitted Jan 2026; advisory committee 23 Sep 2026"), UK: UR("NHS-Galleri final results 2026; no NHS rollout decision"), EU: NF("No CE-IVD filing announced") },
  "artera-ai-prostate": { US: A(2025, undefined, "FDA de novo, Aug 2025") },
  "artera-ai-breast": { US: A(2026, undefined, "FDA 510(k)/de novo, May 2026") },
  "cetuximab-sarotalocan": { US: UR("Phase 3 in recurrent head and neck (Rakuten Medical)"), JP: A(2020, PMDA, "Akalux + BioBlade laser, recurrent HNSCC (Sep 2020); first photoimmunotherapy approval globally") },
  // ================= China-only approvals recorded on 16 Sept 2026 (pipeline wave 2) =================
  olverembatinib: { CN: A(2021, NMPA, "CML with T315I mutation (Nov 2021); later resistant or intolerant CML") },
  vebreltinib: { CN: A(2023, NMPA, "NSCLC with MET exon 14 skipping (Nov 2023)") },
  tunlametinib: { CN: A(2024, NMPA, "NRAS-mutant advanced melanoma after immunotherapy") },
  glecirasib: { CN: A(2024, NMPA, "KRAS G12C-mutant NSCLC after prior systemic therapy") },
  glumetinib: { CN: A(2023, NMPA, "NSCLC with MET exon 14 skipping") },
  zimberelimab: { CN: A(2021, NMPA, "Relapsed or refractory classical Hodgkin lymphoma; later cervical cancer") },
  rezvilutamide: { CN: A(2022, NMPA, "High-volume metastatic hormone-sensitive prostate cancer (Jun 2022)") },
  golidocitinib: { CN: A(2024, NMPA, "Relapsed or refractory peripheral T-cell lymphoma (Jun 2024)") },
  pucotenlimab: { CN: A(2022, NMPA, "MSI-H/dMMR solid tumours and melanoma after prior therapy (Jul 2022)") },
  limertinib: { CN: A(2024, NMPA, "EGFR T790M-mutant NSCLC after prior EGFR inhibitor") },
  befotertinib: { CN: A(2023, NMPA, "EGFR T790M-positive NSCLC after first- or second-generation EGFR inhibitors (May 2023); first-line EGFR-mutant NSCLC (2024)") },
  fluzoparib: { CN: A(2020, NMPA, "Germline BRCA-mutated platinum-sensitive recurrent ovarian cancer after two or more lines (Dec 2020); maintenance after platinum (2021)") },
  pamiparib: { CN: A(2021, NMPA, "Germline BRCA-mutated recurrent advanced ovarian, fallopian tube or primary peritoneal cancer after two or more lines (May 2021)") },
  dabrafenib: { CN: A(2019, NMPA, "BRAF V600 mutation-positive unresectable or metastatic melanoma, with trametinib (Dec 2019)") },
  benmelstobart: { CN: A(2024, NMPA, "Extensive-stage small-cell lung cancer, first line, with anlotinib and platinum-etoposide chemotherapy (2024)") },
  iruplinalkib: { CN: A(2023, NMPA, "ALK-positive NSCLC after crizotinib (June 2023); first line (2024)") },
  flumatinib: { CN: A(2019, NMPA, "Newly diagnosed Philadelphia chromosome-positive chronic myeloid leukaemia, chronic phase (Nov 2019)") },
  utidelone: { CN: A(2021, NMPA, "Recurrent or metastatic breast cancer after anthracycline and taxane, with capecitabine (Mar 2021)") },
  inetetamab: { CN: A(2020, NMPA, "HER2-positive metastatic breast cancer after chemotherapy, with vinorelbine (June 2020)") },
  linperlisib: { CN: A(2022, NMPA, "Relapsed or refractory follicular lymphoma after two or more lines, conditional (Nov 2022)") },
  gumarontinib: { CN: A(2023, NMPA, "NSCLC with MET exon 14 skipping, conditional (Mar 2023)") },
  surufatinib: { CN: A(2020, NMPA, "Advanced non-pancreatic neuroendocrine tumours (Dec 2020); pancreatic neuroendocrine tumours (June 2021)") },
  "recombinant-human-endostatin": { CN: A(2005, NMPA, "Advanced NSCLC with vinorelbine and cisplatin (Sept 2005)") },
  "h101-oncolytic-adenovirus": { CN: A(2005, NMPA, "Late-stage nasopharyngeal carcinoma with chemotherapy (Nov 2005)") },
  "iparomlimab-tuvonralimab": { CN: A(2024, NMPA, "Recurrent or metastatic cervical cancer after platinum chemotherapy (Sept 2024)") },
  mecapegfilgrastim: { CN: A(2018, NMPA, "Prevention of chemotherapy-induced neutropenia in non-myeloid cancers (May 2018)") },
};

/** Convenience: which regions have an approval (approved or conditional). */
export function approvedRegions(row: RegionalRow): Region[] {
  return REGIONS.filter((r) => { const s = row[r]?.status; return s === "approved" || s === "conditional"; });
}

/** True when a product's approvals lie entirely outside the US and EU (e.g. China-only antibodies): a regional product rather than a gap in our records. */
/** Tests, assays, imaging kits and AI software are cleared as devices, not authorised as medicines, so they carry no regional drug-approval row. */
export function isDiagnostic(modality?: string): boolean {
  return /\b(test|assay|kit|software|diagnostic|imaging agent|screening|classifier|panel)\b/i.test(modality ?? "");
}

/** A product's own `approvals` field names a US or EU approval, so it counts as anchored even without a curated regional row. */
export function hasAnchorApproval(d: { approvals?: Array<{ region: string }> }): boolean {
  return (d.approvals ?? []).some((a) => /^(US|USA|United States|FDA|EU|Europe|European Union|EMA)$/i.test(a.region.trim()));
}

export function regionSpecific(row: RegionalRow): boolean {
  return !row.US && !row.EU && approvedRegions(row).length > 0;
}

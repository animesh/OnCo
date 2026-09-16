/**
 * What the NHS offers for cancer: NICE technology appraisal (TA) outcomes, Cancer Drugs Fund (CDF) managed
 * access, and Scottish Medicines Consortium (SMC) advice for approved oncology products, plus a plain-English
 * explainer of how NHS cancer care and drug funding are organised.
 *
 * Rules: a TA number and year are recorded only where the appraisal is well known and the number could be
 * stated with confidence; the row links to the guidance page so it can be checked in one click. Where the
 * outcome is known but the TA number was not verified, no number is recorded and the row links to a NICE
 * search. Where nothing could be stated confidently the status is "unknown" with a NICE search link, which
 * means "not yet researched", not "not funded". Many products have several TAs (one per indication); the row
 * records one flagship appraisal and names others in the note. SMC status is "accepted" if SMC has accepted
 * the medicine for at least one cancer indication (often restricted); it is omitted where not checked.
 * Long-established generics (platinums, taxanes, anthracyclines, hormones) were never appraised as TAs and
 * are funded routinely through local formularies and NHS England chemotherapy protocols; they are marked
 * "not appraised" with that note. Verify at nice.org.uk and with the treating team before relying on a row.
 */

export type NiceStatus = "recommended" | "optimised" | "cdf" | "not recommended" | "in development" | "terminated" | "not appraised" | "unknown";

export type UkCoverage = {
  drugId: string;
  nice: { status: NiceStatus; ta?: string; year?: number; indication?: string; url?: string; note?: string };
  smc?: { status: string; id?: string; url?: string };
  awmsg?: string;
  nhsEnglandCommissioned?: boolean;
  cdfNote?: string;
  sources: Array<{ label: string; url: string }>;
};

/** Display order: what the NHS funds first, then pending, then refusals, then gaps in our research. */
export const NICE_STATUS_ORDER: NiceStatus[] = ["recommended", "optimised", "cdf", "in development", "not recommended", "terminated", "not appraised", "unknown"];

export const NICE_STATUS_LABEL: Record<NiceStatus, string> = {
  recommended: "NICE recommended",
  optimised: "Recommended (optimised)",
  cdf: "Cancer Drugs Fund",
  "not recommended": "Not recommended",
  "in development": "Appraisal in progress",
  terminated: "Appraisal terminated",
  "not appraised": "Not appraised",
  unknown: "Not yet researched",
};

export const NICE_STATUS_TIP: Record<NiceStatus, string> = {
  recommended: "NICE published a technology appraisal recommending the medicine; NHS England and Wales must fund it within 90 days for the appraised indication.",
  optimised: "Recommended for a narrower group than the licence, or with a condition such as a stopping rule or a confidential discount.",
  cdf: "Recommended for use through the Cancer Drugs Fund under a managed access agreement while more data are collected; NICE reappraises at the end of the period.",
  "not recommended": "NICE did not recommend routine NHS funding for the appraised indication at the price offered. Individual funding requests or later resubmissions are possible.",
  "in development": "An appraisal is scheduled or in progress. The medicine may be available through the company's early access scheme or the CDF interim funding route.",
  terminated: "NICE stopped the appraisal, usually because the company did not submit evidence; the medicine is not routinely funded for that indication.",
  "not appraised": "No technology appraisal exists: either a long-established generic that is funded routinely, or a product not licensed in the UK. Read the note.",
  unknown: "OnCo has not yet sourced the NICE position for this product; follow the link to search NICE.",
};

export const NICE_SEARCH = (q: string) => `https://www.nice.org.uk/search?q=${encodeURIComponent(q)}`;
export const CDF_LIST_URL = "https://www.england.nhs.uk/cancer/cdf/cancer-drugs-fund-list/";
export const SMC_SEARCH = (q: string) => `https://scottishmedicines.org.uk/medicines-advice/?keywords=${encodeURIComponent(q)}`;
const ta = (n: number) => `https://www.nice.org.uk/guidance/ta${n}`;

type Opts = { note?: string; smc?: string; cdfNote?: string; awmsg?: string; commissioned?: boolean };

function row(drugId: string, name: string, status: NiceStatus, taNo: number | undefined, year: number | undefined, indication: string | undefined, o: Opts = {}): UkCoverage {
  const url = taNo ? ta(taNo) : NICE_SEARCH(name);
  const sources: UkCoverage["sources"] = [{ label: taNo ? `NICE TA${taNo}` : `NICE search: ${name}`, url }];
  if (status === "cdf") sources.push({ label: "NHS England Cancer Drugs Fund list", url: CDF_LIST_URL });
  if (o.smc) sources.push({ label: `SMC advice: ${name}`, url: SMC_SEARCH(name) });
  return {
    drugId,
    nice: { status, ta: taNo ? `TA${taNo}` : undefined, year, indication, url, note: o.note },
    smc: o.smc ? { status: o.smc, url: SMC_SEARCH(name) } : undefined,
    awmsg: o.awmsg,
    nhsEnglandCommissioned: o.commissioned ?? (status === "recommended" || status === "optimised" || status === "cdf" ? true : undefined),
    cdfNote: o.cdfNote,
    sources,
  };
}

const rec = (id: string, name: string, taNo: number, year: number, ind: string, o: Opts = {}) => row(id, name, "recommended", taNo, year, ind, o);
const opt = (id: string, name: string, taNo: number, year: number, ind: string, o: Opts = {}) => row(id, name, "optimised", taNo, year, ind, o);
const cdf = (id: string, name: string, taNo: number, year: number, ind: string, o: Opts = {}) => row(id, name, "cdf", taNo, year, ind, { ...o, cdfNote: o.cdfNote ?? "Entered the Cancer Drugs Fund under a managed access agreement; check the current CDF list for whether it has since moved to routine commissioning." });
const notRec = (id: string, name: string, taNo: number, year: number, ind: string, o: Opts = {}) => row(id, name, "not recommended", taNo, year, ind, o);
const term = (id: string, name: string, taNo: number, year: number, ind: string, o: Opts = {}) => row(id, name, "terminated", taNo, year, ind, o);
const recNoTa = (id: string, name: string, ind: string, o: Opts = {}) => row(id, name, "recommended", undefined, undefined, ind, { ...o, note: `${o.note ? o.note + " " : ""}TA number not verified; follow the NICE search link.` });
const generic = (id: string, name: string, note?: string) => row(id, name, "not appraised", undefined, undefined, undefined, { note: note ?? "Long-established generic: never subject to a technology appraisal; funded routinely through hospital formularies and NHS England systemic anti-cancer therapy protocols.", commissioned: true });
const notUk = (id: string, name: string, note?: string) => row(id, name, "not appraised", undefined, undefined, undefined, { note: note ?? "No UK marketing authorisation yet, so no NICE appraisal. Access only through a clinical trial or a company early access scheme.", commissioned: false });
const inDev = (id: string, name: string, note?: string) => row(id, name, "in development", undefined, undefined, undefined, { note: note ?? "Recently licensed; a NICE appraisal is scheduled or in progress. Interim access may be possible via the CDF interim funding route once NICE issues positive draft guidance." });

const list: UkCoverage[] = [
  // ================= Checkpoint inhibitors =================
  opt("pembrolizumab", "pembrolizumab", 531, 2018, "Untreated PD-L1 ≥50% metastatic NSCLC (2-year stopping rule)", { note: "One of NICE's most-appraised medicines: melanoma (TA357, TA366, adjuvant TA766), NSCLC (TA428, TA531, TA557, TA600), classical Hodgkin lymphoma (TA540), urothelial (TA522), head and neck (TA661), RCC with axitinib (TA692), TNBC (TA801, TA851), MSI-H colorectal (TA709), oesophageal (TA737) and more. Most are optimised with a 2-year treatment stop. With chemoradiotherapy for untreated FIGO 2014 stage 3 to 4A locally advanced cervical cancer (KEYNOTE-A18): TA1177 (July 2026), within the licence. Relapsed or refractory classical Hodgkin lymphoma from age 3 after 2 or more treatments when a transplant is not possible: TA967 (May 2024). Adjuvant treatment of high-risk resected NSCLC after platinum chemotherapy (KEYNOTE-091): TA1037 (February 2025), within the licence. With gemcitabine and cisplatin for untreated advanced biliary tract cancer: TA966 (April 2024), terminated appraisal. Adjuvant renal cell carcinoma at increased risk of recurrence after nephrectomy (KEYNOTE-564): TA830 (October 2022), within the licence. Adjuvant completely resected stage 2B or 2C melanoma from age 12 (KEYNOTE-716): TA837 (October 2022).", smc: "accepted" }),
  rec("nivolumab", "nivolumab", 484, 2017, "Previously treated non-squamous NSCLC", { note: "Also melanoma (TA384; with ipilimumab TA400; adjuvant TA558), RCC (TA417; with ipilimumab TA655), squamous NSCLC (TA483), head and neck (TA490), classical Hodgkin lymphoma (TA462), adjuvant oesophageal (TA736), gastric with chemotherapy (TA857). With ipilimumab for untreated MSI-high or dMMR metastatic colorectal cancer (CheckMate 8HW): TA1065 (May 2025), within the licence. Adjuvant treatment of resected high-risk melanoma: TA980 (June 2024), terminated appraisal. With chemotherapy for untreated urothelial cancer: TA1141 (March 2026), terminated appraisal. Adjuvant muscle-invasive urothelial cancer at high risk of recurrence with PD-L1 1% or more: TA817 (August 2022). With ipilimumab for untreated unresectable malignant pleural mesothelioma, performance status 0 or 1: TA818 (August 2022). With chemotherapy for neoadjuvant treatment of resectable NSCLC (CheckMate 816): TA876 (March 2023), within the licence.", smc: "accepted" }),
  rec("ipilimumab", "ipilimumab", 319, 2014, "Previously untreated advanced melanoma", { note: "TA268 (previously treated melanoma, 2012) was the first checkpoint inhibitor NICE recommended; combinations with nivolumab in TA400 (melanoma) and TA655 (RCC). With nivolumab for untreated MSI-high or dMMR metastatic colorectal cancer (CheckMate 8HW): TA1065 (May 2025), within the licence.", smc: "accepted" }),
  rec("atezolizumab", "atezolizumab", 520, 2018, "NSCLC after chemotherapy", { note: "Also urothelial (TA492), extensive-stage SCLC with chemotherapy (TA639), HCC with bevacizumab (TA666), 1L NSCLC monotherapy (TA705), adjuvant NSCLC (TA823). The TNBC combination with nab-paclitaxel entered the CDF in 2020 and was later withdrawn after IMpassion131. Adjuvant treatment of resected NSCLC after platinum chemotherapy when PD-L1 is high (IMpower010): TA1071 (June 2025), within the licence. Untreated NSCLC when platinum-doublet chemotherapy is unsuitable: TA1047 (March 2025), terminated appraisal.", smc: "accepted" }),
  cdf("durvalumab", "durvalumab", 578, 2019, "Unresectable stage III NSCLC after chemoradiation (PACIFIC)", { note: "Moved to routine commissioning after the CDF period. Also extensive-stage SCLC with platinum-etoposide (TA798), and with tremelimumab in HCC (TA916). Perioperative treatment with FLOT then adjuvant durvalumab alone for resectable gastric or gastro-oesophageal junction adenocarcinoma: TA1160 (June 2026). Untreated advanced or recurrent mismatch repair deficient endometrial cancer with platinum chemotherapy then maintenance durvalumab: TA1190 (September 2026), with a 3-year stop; the maintenance combination with olaparib for mismatch repair proficient disease was not recommended in the same guidance. Limited-stage small cell lung cancer that has not progressed after platinum chemoradiotherapy (ADRIATIC): TA1099 (October 2025), within the licence.", smc: "accepted" }),
  rec("avelumab", "avelumab", 788, 2022, "Maintenance for urothelial cancer after platinum chemotherapy (JAVELIN Bladder 100)", { note: "Merkel cell carcinoma was appraised in TA517 (2018). With axitinib for untreated advanced renal cell carcinoma, favourable-risk (IMDC) disease only: TA1120 (January 2026).", smc: "accepted" }),
  cdf("cemiplimab", "cemiplimab", 592, 2019, "Advanced cutaneous squamous cell carcinoma", { note: "Also PD-L1 ≥50% NSCLC (TA770, 2022). Untreated PD-L1 1% or more advanced NSCLC with platinum chemotherapy, where pembrolizumab with chemotherapy would otherwise be offered: TA1165 (June 2026). Recurrent or metastatic cervical cancer after platinum chemotherapy, no prior immunotherapy, stop after 32 cycles: TA1174 (July 2026). An earlier cervical cancer appraisal, TA901 (June 2023), was terminated before TA1174. The cutaneous squamous cell carcinoma indication moved from the Cancer Drugs Fund to routine commissioning with a 2-year stopping rule: TA802 (June 2022). Untreated PD-L1-positive advanced NSCLC monotherapy: TA848 (December 2022), terminated appraisal.", smc: "accepted" }),
  opt("dostarlimab", "dostarlimab", 1189, 2026, "dMMR/MSI-H advanced or recurrent endometrial cancer after platinum chemotherapy, stopped after 3 years", { note: "Replaces TA779 (2022), under which dostarlimab entered the Cancer Drugs Fund; TA1189 (August 2026) moves it to routine commissioning with a commercial arrangement. First-line combination with carboplatin-paclitaxel for dMMR/MSI-H disease (RUBY): TA1064 (May 2025), with a commercial arrangement.", smc: "accepted" }),
  rec("tremelimumab", "tremelimumab", 916, 2023, "With durvalumab for untreated advanced or unresectable HCC (HIMALAYA)", { smc: "accepted" }),
  rec("relatlimab-nivolumab", "nivolumab-relatlimab", 950, 2024, "Untreated unresectable or metastatic melanoma (PD-L1 <1%)"),
  term("tislelizumab", "tislelizumab", 1068, 2025, "Unresectable advanced oesophageal squamous cell cancer after platinum-based chemotherapy", { note: "MHRA-licensed (Tevimbra, PLGB 53789/0003) but not routinely funded in September 2026. All three published NICE appraisals were terminated in 2025: TA1068 (second-line oesophageal squamous cell cancer, BeiGene withdrew its submission, May 2025), TA1058 (untreated NSCLC in combination, no submission, April 2025) and TA1072 (NSCLC after platinum chemotherapy, June 2025); the company said it would not launch the NSCLC indications in the UK. Two appraisals are in progress: untreated advanced oesophageal squamous cell cancer with chemotherapy (ID5113, expected publication 10 February 2027) and a cost-comparison review of TA1068 (ID6682)." }),
  inDev("toripalimab", "toripalimab", "MHRA-licensed (Loqtorzi, PL 60874/0001). NICE is appraising toripalimab with chemotherapy for untreated recurrent or metastatic nasopharyngeal cancer (ID6406): draft guidance consultation 27 August to 18 September 2026, second committee meeting 4 November 2026, expected publication 13 January 2027. The oesophageal squamous cell cancer appraisal (TA1024, December 2024) was terminated after Shanghai Junshi Bioscience asked to delay its evidence submission."),
  rec("serplulimab", "serplulimab", 1167, 2026, "With carboplatin and etoposide for untreated extensive-stage small-cell lung cancer", { note: "Published 18 June 2026 with a commercial arrangement; NHS England must fund it within 90 days. MHRA-licensed (Hetronifly, PL 20075/1559). Further appraisals (untreated squamous and non-squamous NSCLC, oesophageal squamous cell cancer, perioperative gastric cancer) are awaiting development." }),
  notUk("camrelizumab", "camrelizumab"),
  notUk("cadonilimab", "cadonilimab"),
  notUk("penpulimab", "penpulimab"),
  notUk("cosibelimab", "cosibelimab"),
  inDev("retifanlimab", "retifanlimab", "MHRA-licensed (Zynyz, PL 42338/0024; public assessment report July 2026). NICE is appraising retifanlimab with platinum-based chemotherapy for untreated inoperable, recurrent or metastatic squamous cell anal canal cancer (ID6482, expected publication 16 December 2026). An earlier appraisal for anal canal cancer after platinum chemotherapy (ID3815) was discontinued in December 2022, and NICE has no appraisal for Merkel cell carcinoma. Untreated NSCLC with chemotherapy is in development."),

  // ================= ADCs =================
  cdf("trastuzumab-deruxtecan", "trastuzumab deruxtecan", 704, 2021, "HER2-positive unresectable or metastatic breast cancer after 2 or more anti-HER2 treatments", { note: "Second-line HER2-positive (DESTINY-Breast03) recommended in TA862 (2023). HER2-low breast cancer (DESTINY-Breast04) was not recommended in final guidance in 2024 after a dispute over the severity modifier, a decision widely criticised by patient groups; check NICE for any later resubmission. Gastric and NSCLC indications are separate appraisals. HER2-low metastatic breast cancer after chemotherapy (DESTINY-Breast04): TA992 (July 2024), not recommended within the licence. HER2-mutated advanced NSCLC after platinum chemotherapy: TA976 (May 2024), terminated appraisal.", smc: "accepted" }),
  rec("trastuzumab-emtansine", "trastuzumab emtansine", 458, 2017, "HER2-positive metastatic breast cancer after trastuzumab and a taxane", { note: "Adjuvant use for residual invasive disease after neoadjuvant therapy (KATHERINE) recommended in TA632 (2020).", smc: "accepted" }),
  rec("sacituzumab-govitecan", "sacituzumab govitecan", 819, 2022, "Unresectable triple-negative breast cancer after 2 or more systemic treatments", { note: "HR-positive/HER2-negative breast cancer (TROPiCS-02) appraised separately; check NICE.", smc: "accepted" }),
  rec("enfortumab-vedotin", "enfortumab vedotin", 982, 2024, "Locally advanced or metastatic urothelial cancer after platinum chemotherapy and a PD-1/PD-L1 inhibitor", { note: "Untreated unresectable or metastatic urothelial cancer with pembrolizumab when platinum chemotherapy is suitable (EV-302): TA1097 (September 2025), within the licence with a commercial arrangement.", smc: "accepted" }),
  rec("brentuximab-vedotin", "brentuximab vedotin", 446, 2017, "CD30-positive Hodgkin lymphoma after autologous transplant or 2 prior therapies", { note: "Also systemic anaplastic large cell lymphoma (TA478) and CD30-positive cutaneous T-cell lymphoma (TA524).", smc: "accepted" }),
  cdf("polatuzumab-vedotin", "polatuzumab vedotin", 649, 2020, "With bendamustine-rituximab for relapsed or refractory DLBCL not eligible for transplant", { note: "First-line pola-R-CHP for DLBCL (POLARIX) recommended in TA874 (2023).", smc: "accepted" }),
  rec("gemtuzumab-ozogamicin", "gemtuzumab ozogamicin", 545, 2018, "Untreated de novo CD33-positive AML with standard induction chemotherapy", { smc: "accepted" }),
  rec("inotuzumab-ozogamicin", "inotuzumab ozogamicin", 541, 2018, "Relapsed or refractory CD22-positive B-cell precursor ALL", { smc: "accepted" }),
  rec("belantamab-mafodotin", "belantamab mafodotin", 1149, 2026, "With bortezomib and dexamethasone for previously treated multiple myeloma (DREAMM-7)", { note: "The UK was the first country to re-license belantamab (MHRA, April 2025). NICE recommended the pomalidomide combination in February 2026 (TA1133) and the bortezomib combination in April 2026 (TA1149)." }),
  rec("mirvetuximab-soravtansine", "mirvetuximab soravtansine", 1169, 2026, "Folate receptor-alpha-positive, platinum-resistant high-grade serous ovarian, fallopian tube or primary peritoneal cancer after 1 to 3 lines of systemic treatment", { note: "Published 24 June 2026 with a commercial arrangement. MHRA-licensed (Elahere, PL 41042/0100). A combination with bevacizumab is awaiting development." }),
  rec("tisotumab-vedotin", "tisotumab vedotin", 1164, 2026, "Recurrent or metastatic cervical cancer that has progressed on or after systemic treatment", { note: "Published 11 June 2026 with a commercial arrangement. MHRA-licensed (Tivdak, PL 18645/0008)." }),
  opt("zynlonta", "loncastuximab tesirine", 947, 2024, "Relapsed or refractory DLBCL or high-grade B-cell lymphoma after 2 or more systemic treatments, only after polatuzumab vedotin or where it is contraindicated or not tolerated", { note: "Published 31 January 2024 with a commercial arrangement. MHRA-licensed (Zynlonta, PLGB 30941/0023). A combination with rituximab for DLBCL (ID6686) is in development." }),
  notUk("datopotamab-deruxtecan", "datopotamab deruxtecan", "Not on the MHRA products register in September 2026 (EU authorisation as Datroway, 4 April 2025, for HR-positive HER2-negative breast cancer after endocrine therapy and chemotherapy). NICE suspended its HR-positive breast cancer appraisal (ID6348) on 16 February 2026 because the company said it would not submit evidence; the NSCLC after platinum appraisal was discontinued, and several other indications are awaiting development."),
  notUk("telisotuzumab-vedotin", "telisotuzumab vedotin"),
  notUk("disitamab-vedotin", "disitamab vedotin"),
  notUk("trastuzumab-rezetecan", "trastuzumab rezetecan"),
  notUk("pivekimab-sunirine", "pivekimab sunirine"),

  // ================= Bispecifics and T-cell engagers =================
  rec("blinatumomab", "blinatumomab", 450, 2017, "Philadelphia-negative relapsed or refractory B-cell precursor ALL", { note: "MRD-positive B-ALL recommended in TA589 (2019). With chemotherapy at the start of consolidation for MRD-negative Philadelphia-negative CD19-positive B-ALL (E1910): TA1049 (March 2025).", smc: "accepted" }),
  rec("glofitamab", "glofitamab", 927, 2023, "Relapsed or refractory DLBCL after 2 or more systemic treatments", { smc: "accepted" }),
  cdf("epcoritamab", "epcoritamab", 954, 2024, "Relapsed or refractory DLBCL after 2 or more systemic treatments", { note: "Relapsed or refractory follicular lymphoma after 2 or more lines of systemic treatment, stopped after 3 years (EPCORE NHL-1): TA1139 (March 2026).", smc: "accepted" }),
  cdf("mosunetuzumab", "mosunetuzumab", 892, 2023, "Relapsed or refractory follicular lymphoma after 2 or more systemic treatments", { smc: "accepted" }),
  rec("teclistamab", "teclistamab", 1015, 2024, "Relapsed and refractory multiple myeloma after 3 or more treatments (including an immunomodulatory drug, a proteasome inhibitor and an anti-CD38 antibody) that progressed on the last treatment", { note: "Published 13 November 2024 with a commercial arrangement, replacing the terminated TA869 (2023). Appraisals for use after 1 or more treatments alone (ID6628) and with daratumumab (ID6201) are in development." }),
  cdf("elranatamab", "elranatamab", 1023, 2024, "Relapsed and refractory multiple myeloma after 3 or more treatments (including an immunomodulatory drug, a proteasome inhibitor and an anti-CD38 antibody) that progressed on the last treatment", { note: "Published 11 December 2024 with managed access. The managed access review (ID6653) is expected to publish on 28 January 2027. Earlier-line and post-transplant maintenance appraisals are awaiting development." }),
  rec("talquetamab", "talquetamab", 1114, 2025, "Relapsed and refractory multiple myeloma after 3 or more treatments (including an immunomodulatory drug, a proteasome inhibitor and an anti-CD38 antibody) that progressed on the last treatment", { note: "Published 3 December 2025 with a commercial arrangement. A combination with daratumumab after 1 or more treatments (ID6625) is in development." }),
  inDev("linvoseltamab", "linvoseltamab", "NICE appraisal for relapsed or refractory multiple myeloma after 3 or more treatments (ID6609) is in progress, expected publication 17 February 2027. Not on the MHRA products register in September 2026, so no UK licence could be confirmed."),
  notUk("odronextamab", "odronextamab", "Not on the MHRA products register in September 2026; the EU granted a conditional authorisation (Ordspono, 22 August 2024) for relapsed or refractory follicular lymphoma and DLBCL after 2 or more lines. The NICE follicular lymphoma appraisal (ID6726) is awaiting development with no expected date."),
  notRec("tarlatamab", "tarlatamab", 1091, 2025, "Extensive-stage small cell lung cancer after 2 or more lines of treatment including platinum chemotherapy (DeLLphi-301)", { note: "Published 20 August 2025: NICE said tarlatamab should not be used for this indication, so it is not routinely funded in England. It is FDA-approved (Imdelltra, May 2024)." }),
  rec("tebentafusp", "tebentafusp", 1027, 2025, "HLA-A*02:01-positive unresectable or metastatic uveal melanoma", { note: "NICE recommended tebentafusp in January 2025 with a commercial arrangement.", smc: "accepted" }),
  rec("amivantamab", "amivantamab", 1122, 2026, "With lazertinib for untreated EGFR exon 19 deletion or exon 21 L858R advanced NSCLC", { note: "Published 21 January 2026 with commercial arrangements for both medicines. TA1158 (May 2026) recommends amivantamab with carboplatin and pemetrexed for untreated EGFR exon 20 insertion NSCLC with managed access via the Cancer Drugs Fund. TA850 (December 2022) did not recommend monotherapy for exon 20 insertion NSCLC after platinum chemotherapy. Subcutaneous amivantamab and the post-TKI combination with chemotherapy (ID6305) are at earlier stages." }),
  rec("zanidatamab", "zanidatamab", 1153, 2026, "HER2-positive (IHC3) unresectable or metastatic biliary tract cancer after at least 1 line of systemic treatment", { note: "Published 7 May 2026 with a commercial arrangement. MHRA-licensed (Ziihera, PL 36772/0002). Untreated HER2-positive gastro-oesophageal adenocarcinoma with chemotherapy, with or without tislelizumab (ID6672), is in development." }),
  notUk("zenocutuzumab", "zenocutuzumab"),

  // ================= Cell and gene therapies =================
  cdf("tisagenlecleucel", "tisagenlecleucel", 554, 2018, "Relapsed or refractory B-cell ALL in people up to 25 years", { note: "The first CAR-T NICE recommended, within weeks of EU licensing. DLBCL use (TA567, 2019, CDF) was not recommended for routine commissioning when reappraised as TA933 (November 2023). Delivered only at NHS England-designated CAR-T centres after national CAR-T clinical panel review. B-cell ALL in people 25 and under, relapsed after transplant or second or later relapse: reappraised as TA975 (May 2024), recommended within the licence. Follicular lymphoma after 2 or more therapies: TA842 (November 2022), terminated appraisal.", smc: "accepted" }),
  cdf("axicabtagene-ciloleucel", "axicabtagene ciloleucel", 559, 2019, "Relapsed or refractory DLBCL or PMBCL after 2 or more systemic therapies", { note: "Moved to routine commissioning in TA872 (2023); second-line DLBCL (ZUMA-7) recommended in TA895 (2023). Delivered at designated CAR-T centres. Relapsed or refractory follicular lymphoma after 3 or more systemic treatments: TA894 (June 2023), not recommended.", smc: "accepted" }),
  cdf("brexucabtagene-autoleucel", "brexucabtagene autoleucel", 677, 2021, "Relapsed or refractory mantle cell lymphoma after a BTK inhibitor", { note: "Relapsed or refractory B-cell ALL in people 26 and over: TA893 (June 2023), recommended through the Cancer Drugs Fund.", smc: "accepted" }),
  rec("lisocabtagene-maraleucel", "lisocabtagene maraleucel", 1048, 2025, "Large B-cell lymphoma refractory to, or relapsed within 12 months of, first-line chemoimmunotherapy when an autologous stem cell transplant would be suitable", { note: "Published 26 March 2025 with a commercial arrangement. TA1159 (June 2026) also recommends it for relapsed or refractory DLBCL or primary mediastinal B-cell lymphoma after 2 or more lines, using the least expensive suitable CAR-T (including axicabtagene ciloleucel). Terminated: second-line use when a transplant is unsuitable (TA1083, July 2025) and follicular lymphoma (TA1186, August 2026); the CLL appraisal was discontinued and mantle cell lymphoma is awaiting development." }),
  term("idecabtagene-vicleucel", "idecabtagene vicleucel", 1084, 2025, "Relapsed or refractory multiple myeloma after 2 to 4 treatments", { note: "MHRA-licensed (Abecma, PLGB 15105/0191) but not funded on the NHS: Bristol Myers Squibb made no evidence submission for either appraisal, so TA936 (after 3 or more treatments, November 2023) and TA1084 (after 2 to 4 treatments, July 2025) were both terminated." }),
  term("ciltacabtagene-autoleucel", "ciltacabtagene autoleucel", 889, 2023, "Relapsed or refractory multiple myeloma", { note: "TA889 (May 2023) was terminated after Janssen withdrew its submission, saying it would not launch in the UK for that indication at the time. A new appraisal for relapsed, lenalidomide-refractory myeloma after 1 to 3 therapies (GID-TA12518, deferred from D5) is in progress with expected publication 7 April 2027. MHRA-licensed (Carvykti, PLGB 00242/0745)." }),
  opt("obecabtagene-autoleucel", "obecabtagene autoleucel", 1116, 2025, "Relapsed or refractory B-cell precursor ALL in people aged 26 and over", { note: "Published 11 December 2025 with a commercial arrangement; NICE limited use to people aged 26 and over. UK-developed CD19 CAR-T (UCL/Autolus); MHRA-licensed (Aucatzyl, PLGB 46113/0001)." }),
  notUk("lifileucel", "lifileucel"),
  notUk("afamitresgene-autoleucel", "afamitresgene autoleucel"),
  notUk("satricabtagene-autoleucel", "satricabtagene autoleucel"),
  rec("talimogene-laherparepvec", "talimogene laherparepvec", 410, 2016, "Unresectable regionally or distantly metastatic melanoma (stage IIIB-IVM1a) when systemically administered immunotherapy is not suitable", { smc: "accepted (restricted)" }),
  notRec("sipuleucel-t", "sipuleucel-T", 332, 2015, "Asymptomatic or minimally symptomatic metastatic hormone-relapsed prostate cancer", { note: "Never marketed in the UK; EU licence withdrawn 2015." }),
  notUk("nadofaragene-firadenovec", "nadofaragene firadenovec"),
  term("nogapendekin-alfa-inbakicept", "nogapendekin alfa inbakicept", 1163, 2026, "With BCG for BCG-unresponsive non-muscle-invasive bladder cancer with carcinoma in situ", { note: "Terminated evaluation published 4 June 2026: NICE stopped the appraisal, so the medicine is not routinely funded in England. FDA-approved (Anktiva) since April 2024." }),
  notUk("vusolimogene-oderparepvec", "vusolimogene oderparepvec"),

  // ================= Breast =================
  rec("palbociclib", "palbociclib", 495, 2017, "With an aromatase inhibitor for untreated HR-positive, HER2-negative advanced breast cancer", { note: "With fulvestrant after endocrine therapy: TA619 (2020, from CDF to routine).", smc: "accepted" }),
  rec("ribociclib", "ribociclib", 496, 2017, "With an aromatase inhibitor for untreated HR-positive, HER2-negative advanced breast cancer", { note: "With fulvestrant: TA593 (2019) and TA687 (2021, pre/perimenopausal). Adjuvant use with an aromatase inhibitor for high-risk early breast cancer (NATALEE): TA1086 (August 2025), within the licence.", smc: "accepted" }),
  rec("abemaciclib", "abemaciclib", 563, 2019, "With an aromatase inhibitor for untreated HR-positive, HER2-negative advanced breast cancer", { note: "With fulvestrant: TA579 (2019). Adjuvant use for high-risk early breast cancer (monarchE): TA810 (2022).", smc: "accepted" }),
  rec("alpelisib", "alpelisib", 816, 2022, "With fulvestrant for PIK3CA-mutated HR-positive, HER2-negative advanced breast cancer after a CDK4/6 inhibitor", { smc: "accepted" }),
  rec("capivasertib", "capivasertib", 1063, 2025, "With fulvestrant for HR-positive HER2-negative advanced breast cancer with PIK3CA, AKT1 or PTEN alterations after a CDK4/6 inhibitor plus an aromatase inhibitor", { note: "Published 15 May 2025 with a commercial arrangement. UK-discovered AKT inhibitor (ICR/AstraZeneca). The triple-negative breast cancer appraisal was discontinued; capivasertib with abiraterone for PTEN-deficient hormone-sensitive prostate cancer is awaiting development." }),
  inDev("inavolisib", "inavolisib"),
  opt("elacestrant", "elacestrant", 1036, 2025, "ER-positive HER2-negative advanced breast cancer with an activating ESR1 mutation after at least 12 months of endocrine treatment plus a CDK4/6 inhibitor", { note: "Published 5 February 2025 with a commercial arrangement; the 12-month prior-treatment condition narrows the licence. The combination with everolimus (ID6753) is awaiting development." }),
  inDev("camizestrant", "camizestrant"),
  rec("tepotinib", "tepotinib", 789, 2022, "Advanced NSCLC with MET exon 14 skipping alterations", { note: "Published 18 May 2022, within the licence with a commercial arrangement; the only MET inhibitor routinely funded in England." }),
  term("capmatinib", "capmatinib", 884, 2023, "Advanced NSCLC with MET exon 14 skipping", { note: "Terminated appraisal published 3 May 2023: NICE stopped the appraisal, so capmatinib is not routinely funded in England. FDA accelerated approval (Tabrecta) since 2020." }),
  opt("mirdametinib", "mirdametinib", 1192, 2026, "Symptomatic, inoperable NF1 plexiform neurofibromas in people aged 2 to 17, using the least expensive suitable MEK inhibitor", { note: "Published 16 September 2026 with a commercial arrangement; the guidance asks prescribers to choose the cheapest suitable option among the MEK inhibitors for this indication." }),
  term("imlunestrant", "imlunestrant", 1168, 2026, "ER-positive HER2-negative advanced breast cancer after endocrine therapy", { note: "Terminated evaluation published 18 June 2026: NICE stopped the appraisal, so imlunestrant is not routinely funded in England." }),
  inDev("vepdegestrant", "vepdegestrant"),
  notUk("gedatolisib", "gedatolisib"),
  rec("pertuzumab", "pertuzumab", 509, 2018, "With trastuzumab and docetaxel for HER2-positive metastatic breast cancer", { note: "Adjuvant use for node-positive early HER2-positive disease: TA569 (2019). Phesgo (subcutaneous with trastuzumab) is used where the TAs apply.", smc: "accepted" }),
  rec("trastuzumab", "trastuzumab", 34, 2002, "HER2-positive advanced breast cancer", { note: "Adjuvant early breast cancer: TA107 (2006). HER2-positive gastric cancer: TA208 (2010). Biosimilars and the subcutaneous form are used under the same guidance and have cut the NHS price substantially.", smc: "accepted" }),
  row("trastuzumab-biosimilars", "trastuzumab biosimilars", "not appraised", undefined, undefined, undefined, { note: "Biosimilars are not appraised separately: they fall under the originator's TAs (TA34, TA107, TA208). NHS England's biosimilar commissioning framework drove rapid switching from 2018.", commissioned: true }),
  notRec("lapatinib", "lapatinib", 257, 2012, "With an aromatase inhibitor for HER2-positive, HR-positive metastatic breast cancer", { note: "Also not recommended with capecitabine after trastuzumab (2010). Rarely used on the NHS." }),
  rec("neratinib", "neratinib", 612, 2019, "Extended adjuvant treatment of HR-positive, HER2-positive early breast cancer completed less than 1 year after trastuzumab", { smc: "accepted" }),
  rec("tucatinib", "tucatinib", 786, 2022, "With trastuzumab and capecitabine for HER2-positive breast cancer after 2 or more anti-HER2 treatments", { smc: "accepted" }),
  notUk("margetuximab", "margetuximab"),
  rec("eribulin", "eribulin", 423, 2016, "Locally advanced or metastatic breast cancer after 2 or more chemotherapy regimens", { smc: "accepted" }),
  rec("everolimus", "everolimus", 432, 2017, "Advanced renal cell carcinoma after previous treatment", { note: "Also HR-positive breast cancer with exemestane (TA421, 2016) and neuroendocrine tumours (TA449, 2017, with sunitinib).", smc: "accepted" }),
  rec("olaparib", "olaparib", 381, 2016, "Maintenance for relapsed platinum-sensitive BRCA-mutated ovarian cancer", { note: "First-line ovarian maintenance TA598 (2019, CDF); adjuvant BRCA-mutated HER2-negative early breast cancer TA886 (2023); BRCA-mutated mCRPC TA887 (2023). With abiraterone for untreated hormone-relapsed metastatic prostate cancer when docetaxel is unsuitable (PROpel): TA951 (February 2024), within the licence. Germline BRCA-mutated HER2-negative advanced breast cancer after anthracycline and taxane (OlympiAD): TA1040 (February 2025), within the licence. Previously treated BRCA-mutated hormone-relapsed metastatic prostate cancer was first appraised as TA831 (October 2022).", smc: "accepted" }),
  cdf("niraparib", "niraparib", 528, 2018, "Maintenance for relapsed platinum-sensitive ovarian, fallopian tube or peritoneal cancer", { note: "First-line maintenance after platinum (PRIMA): TA673 (2021, CDF then routine). Both indications now routinely commissioned regardless of BRCA status.", smc: "accepted" }),
  cdf("rucaparib", "rucaparib", 611, 2019, "Maintenance for relapsed platinum-sensitive ovarian, fallopian tube or peritoneal cancer", { note: "Relapsed platinum-sensitive maintenance reappraised after the ARIEL3 overall survival data: TA1007 (September 2024), recommended within the licence. First-line maintenance for advanced high-grade ovarian, fallopian tube or peritoneal cancer after response to platinum chemotherapy (ATHENA-MONO): TA1055 (April 2025), recommended.", smc: "accepted" }),
  rec("talazoparib", "talazoparib", 952, 2024, "HER2-negative locally advanced or metastatic breast cancer with germline BRCA1/2 mutations after an anthracycline or taxane (and endocrine therapy if HR-positive)", { note: "Published 21 February 2024 with a commercial arrangement. TA1130 (February 2026) recommends talazoparib with enzalutamide for untreated hormone-relapsed metastatic prostate cancer only when chemotherapy is not indicated and abiraterone is not tolerated or precluded; the HRR-mutated hormone-sensitive prostate cancer appraisal (ID6460) is in development." }),
  notRec("fulvestrant", "fulvestrant", 239, 2011, "Locally advanced or metastatic breast cancer as monotherapy", { note: "Now generic and widely used on the NHS as the partner drug in CDK4/6, alpelisib and capivasertib combinations, all of which are NICE recommended.", commissioned: true }),
  rec("letrozole", "letrozole and other aromatase inhibitors", 112, 2006, "Adjuvant hormonal therapy for early oestrogen-receptor-positive breast cancer", { note: "Anastrozole, letrozole and exemestane are all generic; NICE NG101 governs use. Anastrozole was licensed for breast cancer prevention in 2023 under the MHRA repurposing programme.", smc: "accepted" }),
  generic("exemestane", "exemestane", "Generic aromatase inhibitor covered by TA112 and NICE NG101; funded routinely."),
  generic("tamoxifen", "tamoxifen", "Generic; recommended in NICE NG101 for ER-positive breast cancer and for risk reduction in high-risk women (CG164). Funded routinely."),
  generic("goserelin", "goserelin / leuprolide (ovarian function suppression)", "Generic GnRH agonists; NG101 recommends ovarian function suppression for premenopausal ER-positive breast cancer. Funded routinely."),
  generic("megestrol-progestins", "progestins", "Generic progestins and the levonorgestrel IUD; funded routinely, no TA."),
  rec("pegylated-liposomal-doxorubicin", "pegylated liposomal doxorubicin", 91, 2005, "Advanced ovarian cancer after first-line platinum chemotherapy", { smc: "accepted" }),

  // ================= Lung =================
  cdf("osimertinib", "osimertinib", 654, 2020, "Untreated EGFR mutation-positive NSCLC (FLAURA)", { note: "Moved to routine commissioning. T790M after a first-generation TKI: TA416 (2016, CDF then routine). Adjuvant stage IB-IIIA (ADAURA): TA761 (2022). With pemetrexed and platinum chemotherapy for untreated EGFR-mutant advanced NSCLC (FLAURA2): TA1060 (May 2025), recommended within the licence. Unresectable stage III EGFR-mutant NSCLC after platinum chemoradiotherapy (LAURA): TA1156 (May 2026), recommended within the licence. Adjuvant stage IB to IIIA EGFR-mutant NSCLC after complete resection (ADAURA) reappraised as TA1043 (February 2025), recommended within the licence.", smc: "accepted" }),
  rec("gefitinib", "gefitinib", 192, 2010, "Untreated EGFR mutation-positive NSCLC", { smc: "accepted" }),
  rec("erlotinib", "erlotinib", 258, 2012, "Untreated EGFR mutation-positive NSCLC", { note: "Second-line NSCLC: TA162 (2008).", smc: "accepted" }),
  rec("afatinib", "afatinib", 310, 2014, "Untreated EGFR mutation-positive NSCLC", { smc: "accepted" }),
  rec("dacomitinib", "dacomitinib", 595, 2019, "Untreated EGFR mutation-positive NSCLC", { smc: "accepted" }),
  rec("crizotinib", "crizotinib", 406, 2016, "Untreated ALK-positive advanced NSCLC", { note: "ROS1-positive NSCLC: TA529 (2018). ROS1-positive advanced NSCLC in people who have not had a ROS1 inhibitor: TA1021 (December 2024), with a commercial arrangement.", smc: "accepted" }),
  rec("ceritinib", "ceritinib", 500, 2018, "Untreated ALK-positive advanced NSCLC", { note: "After crizotinib: TA395 (2016).", smc: "accepted" }),
  rec("alectinib", "alectinib", 536, 2018, "Untreated ALK-positive advanced NSCLC", { note: "Adjuvant stage IB (4 cm or larger) to IIIA ALK-positive NSCLC after complete resection (ALINA): TA1014 (November 2024), recommended within the licence.", smc: "accepted" }),
  rec("brigatinib", "brigatinib", 670, 2021, "Untreated ALK-positive advanced NSCLC", { note: "After crizotinib: TA571 (2019).", smc: "accepted" }),
  cdf("lorlatinib", "lorlatinib", 628, 2020, "ALK-positive NSCLC after alectinib, ceritinib or crizotinib then another TKI", { note: "Untreated ALK-positive advanced NSCLC (CROWN): first appraised as TA909 (July 2023), then TA1103 (October 2025), with a commercial arrangement.", smc: "accepted" }),
  notUk("ensartinib", "ensartinib"),
  notUk("taletrectinib", "taletrectinib"),
  cdf("entrectinib", "entrectinib", 643, 2020, "NTRK fusion-positive solid tumours (histology-independent)", { note: "ROS1-positive NSCLC: TA644 (2020). The first tumour-agnostic appraisals in NICE's history. Review of the NTRK fusion-positive solid tumour appraisal in people 12 and over: TA1118 (January 2026), terminated appraisal.", smc: "accepted" }),
  cdf("larotrectinib", "larotrectinib", 630, 2020, "NTRK fusion-positive solid tumours (histology-independent)", { smc: "accepted" }),
  notUk("repotrectinib", "repotrectinib", "Not on the MHRA products register in September 2026 (EU conditional authorisation as Augtyro, 13 January 2025, for ROS1-positive NSCLC and NTRK fusion-positive solid tumours). NICE discontinued the ROS1 NSCLC appraisal (ID6277) on 10 February 2026 after hearing nothing further from the company since May 2024, and suspended the NTRK appraisal on 31 March 2025 because the company was no longer pursuing an MHRA marketing authorisation for that indication."),
  cdf("selpercatinib", "selpercatinib", 742, 2021, "RET fusion-positive advanced NSCLC after platinum chemotherapy", { note: "RET-altered thyroid cancer: TA711 (2021, CDF). Untreated NSCLC (LIBRETTO-431) appraised later.", smc: "accepted" }),
  notRec("pralsetinib", "pralsetinib", 812, 2022, "RET fusion-positive advanced NSCLC in people who have not had a RET inhibitor", { note: "Published 3 August 2022: not recommended within its marketing authorisation. The thyroid cancer appraisal (ID4018) was discontinued. Selpercatinib was appraised for untreated RET fusion-positive NSCLC in TA911 (2023). MHRA-licensed (Gavreto, PLGB 00031/0929)." }),
  rec("capmatinib-tepotinib", "tepotinib", 789, 2022, "Tepotinib for MET exon 14 skipping advanced NSCLC", { note: "Capmatinib has no UK licence; tepotinib is the NHS option.", smc: "accepted" }),
  cdf("sotorasib", "sotorasib", 781, 2022, "KRAS G12C-mutated advanced NSCLC after 1 or more systemic therapies", { note: "The CDF period ended after CodeBreaK 200 showed a modest PFS gain; NICE's 2024 reappraisal did not recommend routine commissioning at the price offered. Check the current position.", smc: "accepted" }),
  term("adagrasib", "adagrasib", 1076, 2025, "Previously treated KRAS G12C mutation-positive advanced NSCLC", { note: "Terminated 2 July 2025: after the first committee meeting NICE preferred to use overall survival data from KRYSTAL-12, which were immature, and Bristol Myers Squibb will consider restarting when the final analysis is available. MHRA-licensed (Krazati, PLGB 15105/0194). Combinations with pembrolizumab (NSCLC) and cetuximab (colorectal) are awaiting development; sotorasib (TA781) is under managed access review." }),
  rec("lazertinib", "lazertinib", 1122, 2026, "With amivantamab for untreated EGFR exon 19 deletion or exon 21 L858R advanced NSCLC", { note: "Published 21 January 2026; both companies provide their products under commercial arrangements. Lazertinib with amivantamab and platinum chemotherapy after a TKI (ID6305) is awaiting development." }),
  notUk("sunvozertinib", "sunvozertinib"),
  notUk("zongertinib", "zongertinib"),
  notUk("sevabertinib", "sevabertinib"),
  rec("pemetrexed", "pemetrexed", 181, 2009, "First-line treatment of non-squamous NSCLC with cisplatin", { note: "Also malignant pleural mesothelioma (TA135, 2008) and maintenance (TA190, TA402). Generic since 2016.", smc: "accepted" }),
  notRec("ramucirumab", "ramucirumab", 378, 2016, "Advanced gastric or gastro-oesophageal junction cancer after chemotherapy", { note: "Also not recommended for NSCLC (TA403, 2016). HCC with high AFP appraised later. Not routinely available on the NHS." }),
  notUk("lurbinectedin", "lurbinectedin", "Licensed in the US and EU but no UK marketing authorisation confirmed; NICE position not yet researched."),
  rec("dabrafenib-trametinib", "dabrafenib with trametinib", 396, 2016, "Unresectable or metastatic BRAF V600-mutated melanoma", { note: "Adjuvant stage III melanoma: TA544 (2018). BRAF V600E NSCLC: TA898 (2023). Dabrafenib monotherapy: TA321 (2014). BRAF V600E low-grade and high-grade glioma in children and young people aged 1 year and over: TA977 (May 2024), recommended within the licence.", smc: "accepted" }),
  rec("vemurafenib", "vemurafenib", 269, 2012, "BRAF V600 mutation-positive unresectable or metastatic melanoma", { smc: "accepted" }),
  rec("cobimetinib", "cobimetinib", 414, 2016, "With vemurafenib for BRAF V600 mutation-positive melanoma", { smc: "accepted" }),
  rec("encorafenib", "encorafenib", 562, 2019, "With binimetinib for BRAF V600 mutation-positive melanoma", { note: "With cetuximab for BRAF V600E metastatic colorectal cancer after systemic therapy: TA668 (2020, CDF then routine). First-line BRAF V600E advanced NSCLC with binimetinib: TA1150 (May 2026), first line only, with commercial arrangements.", smc: "accepted" }),
  rec("binimetinib", "binimetinib", 562, 2019, "With encorafenib for BRAF V600 mutation-positive melanoma", { note: "First-line BRAF V600E advanced NSCLC with encorafenib: TA1150 (May 2026).", smc: "accepted" }),

  // ================= Gastrointestinal and hepatobiliary =================
  rec("cetuximab", "cetuximab", 439, 2017, "With chemotherapy for untreated RAS wild-type metastatic colorectal cancer", { note: "Head and neck squamous cell carcinoma with radiotherapy: TA145 (2008). Earlier mCRC appraisal TA176 (2009).", smc: "accepted" }),
  rec("panitumumab", "panitumumab", 439, 2017, "With chemotherapy for untreated RAS wild-type metastatic colorectal cancer", { smc: "accepted" }),
  notRec("bevacizumab", "bevacizumab", 212, 2010, "Metastatic colorectal cancer with oxaliplatin or fluorouracil-based chemotherapy", { note: "NICE has never recommended bevacizumab for colorectal (TA118, TA212), ovarian (TA284, TA285), breast (TA214) or cervical cancer. It was widely funded by the pre-2016 Cancer Drugs Fund and later removed. Biosimilars (from 2020) have cut the price; some indications are funded via local policies. Bevacizumab with atezolizumab for HCC is funded under TA666.", commissioned: false }),
  notUk("bevacizumab-glioma", "bevacizumab for glioblastoma", "Not licensed for glioblastoma in the EU or UK (EMA refused 2009); not funded on the NHS except via trials or individual funding requests."),
  rec("regorafenib", "regorafenib", 555, 2019, "Advanced HCC after sorafenib", { note: "GIST after imatinib and sunitinib: TA488 (2017). Previously treated metastatic colorectal cancer: TA866 (February 2023), recommended within the licence after an earlier appraisal had not recommended it.", smc: "accepted" }),
  rec("trifluridine-tipiracil", "trifluridine-tipiracil", 405, 2016, "Metastatic colorectal cancer after standard therapies", { note: "Metastatic gastric or GOJ cancer after 2 or more therapies: TA669 (2021). With bevacizumab for metastatic colorectal cancer after 2 lines of treatment (SUNLIGHT): TA1008 (September 2024), recommended within the licence. The gastric and gastro-oesophageal junction indication was reappraised as TA852 (December 2022), recommended within the licence.", smc: "accepted" }),
  opt("fruquintinib", "fruquintinib", 1079, 2025, "Third-line or later metastatic colorectal cancer after fluoropyrimidine, oxaliplatin and irinotecan chemotherapy (and anti-EGFR treatment if RAS wild-type), only when trifluridine-tipiracil with bevacizumab is not suitable", { note: "Published 23 July 2025 with a commercial arrangement." }),
  rec("irinotecan", "irinotecan", 93, 2005, "Irinotecan, oxaliplatin and raltitrexed for advanced colorectal cancer", { note: "Generic; funded routinely. Liposomal irinotecan (Onivyde) with 5-FU for pancreatic cancer after gemcitabine was appraised in TA440 (2017).", smc: "accepted" }),
  rec("oxaliplatin", "oxaliplatin", 93, 2005, "Advanced colorectal cancer (FOLFOX-type regimens)", { note: "Also adjuvant stage III colon cancer (TA100, 2006). Generic; funded routinely.", smc: "accepted" }),
  generic("fluorouracil", "fluorouracil", "Generic backbone of colorectal, gastric, pancreatic, breast and head and neck regimens for 60 years; funded routinely. NHS England has required DPYD testing before fluoropyrimidines since 2020."),
  term("nalirifox", "NALIRIFOX (liposomal irinotecan regimen)", 1052, 2025, "Liposomal irinotecan with oxaliplatin, fluorouracil and folinic acid for untreated metastatic pancreatic cancer", { note: "Terminated 2 April 2025: Servier made no evidence submission, saying the regimen was unlikely to be cost-effective for this population. Liposomal irinotecan was recommended second line after gemcitabine in TA440 (2017)." }),
  rec("gemcitabine", "gemcitabine", 25, 2001, "Advanced pancreatic cancer", { note: "One of the earliest cancer TAs. Generic; funded routinely across pancreatic, bladder, lung, ovarian and breast regimens.", smc: "accepted" }),
  rec("paclitaxel", "paclitaxel / nab-paclitaxel", 476, 2017, "Nab-paclitaxel with gemcitabine for untreated metastatic pancreatic cancer", { note: "Conventional paclitaxel is generic and funded routinely across breast, ovarian, lung and other cancers.", smc: "accepted" }),
  rec("sorafenib", "sorafenib", 474, 2017, "Advanced HCC (Child-Pugh A)", { note: "Originally rejected (TA189, 2010) and funded via the old CDF; recommended after a price cut. Also differentiated thyroid cancer (TA535, 2018).", smc: "accepted" }),
  rec("lenvatinib", "lenvatinib", 551, 2018, "Untreated advanced HCC", { note: "Progressive radioactive iodine-refractory differentiated thyroid cancer: TA535 (2018). With pembrolizumab for endometrial cancer (TA904, 2023) and RCC (TA858, 2023).", smc: "accepted" }),
  rec("cabozantinib", "cabozantinib", 463, 2017, "Advanced RCC after VEGF-targeted therapy", { note: "Untreated RCC: TA542 (2018). Advanced hepatocellular carcinoma after sorafenib, Child-Pugh A and good performance status only: TA849 (December 2022), with a commercial arrangement. With nivolumab for untreated RCC: TA964 (2024). Previously treated differentiated thyroid cancer unsuitable for or refractory to radioactive iodine: TA928 (November 2023), not recommended.", smc: "accepted" }),
  cdf("pemigatinib", "pemigatinib", 722, 2021, "FGFR2 fusion or rearrangement-positive cholangiocarcinoma after 1 or more systemic therapies", { smc: "accepted" }),
  rec("futibatinib", "futibatinib", 1005, 2024, "Locally advanced or metastatic cholangiocarcinoma with an FGFR2 fusion or rearrangement after at least 1 line of systemic treatment", { note: "Published 11 September 2024 with a commercial arrangement, as an alternative to pemigatinib." }),
  rec("ivosidenib", "ivosidenib", 948, 2024, "Locally advanced or metastatic cholangiocarcinoma with an IDH1 R132 mutation after 1 or more systemic treatments", { note: "Published 31 January 2024 with a commercial arrangement. TA979 (June 2024) also recommends ivosidenib with azacitidine for untreated IDH1 R132-mutated AML when intensive induction chemotherapy is unsuitable. The relapsed or refractory AML appraisal (ID1548) was discontinued." }),
  notRec("zolbetuximab", "zolbetuximab", 1046, 2025, "With fluoropyrimidine and platinum chemotherapy for untreated claudin-18.2-positive HER2-negative advanced gastric or gastro-oesophageal junction adenocarcinoma", { note: "Published 12 March 2025: not recommended within its marketing authorisation. MHRA-licensed (Vyloy, PLGB 00166/0439). A pancreatic cancer appraisal with nab-paclitaxel and gemcitabine (ID6444) is in development." }),
  generic("docetaxel", "docetaxel", "Generic; TA101 (2006) recommended docetaxel for metastatic hormone-refractory prostate cancer and it is standard in breast, lung, gastric and head and neck regimens."),
  generic("cisplatin", "cisplatin"),
  generic("carboplatin", "carboplatin"),
  generic("etoposide", "etoposide"),
  generic("doxorubicin", "doxorubicin"),
  generic("cyclophosphamide", "cyclophosphamide"),
  generic("ifosfamide", "ifosfamide"),
  generic("methotrexate", "methotrexate"),
  generic("vincristine", "vincristine"),
  generic("vinblastine", "vinblastine"),
  generic("vinorelbine", "vinorelbine"),
  generic("bleomycin", "bleomycin"),
  generic("dactinomycin", "dactinomycin"),
  generic("melphalan", "melphalan", "Generic melphalan is standard for autologous transplant conditioning in myeloma and funded routinely. The Hepzato hepatic delivery system for uveal melanoma liver metastases is not UK-licensed."),
  generic("mitomycin", "mitomycin C", "Generic; intravesical mitomycin is standard after TURBT (NICE NG2). Jelmyto and Zusduri formulations are not UK-licensed."),
  rec("topotecan", "topotecan", 184, 2009, "Relapsed small-cell lung cancer", { note: "Also recurrent cervical cancer with cisplatin (TA183, 2009). Generic.", smc: "accepted" }),
  generic("hydroxyurea", "hydroxycarbamide", "Generic; first-line cytoreduction in polycythaemia vera and essential thrombocythaemia and used in CML and sickle cell disease. Funded routinely."),
  generic("cladribine", "cladribine", "Generic; standard first-line for hairy cell leukaemia. Funded routinely."),
  generic("mitotane", "mitotane", "Only licensed drug for adrenocortical carcinoma; funded routinely without a TA."),

  // ================= Genitourinary =================
  rec("abiraterone", "abiraterone", 259, 2012, "Metastatic castration-resistant prostate cancer after docetaxel", { note: "Before chemotherapy: TA387 (2016). Newly diagnosed high-risk hormone-sensitive disease (STAMPEDE/LATITUDE) was not recommended in TA721 (2021), but abiraterone went generic in 2022 and NHS England commissioned it for mHSPC via national policy.", smc: "accepted" }),
  rec("enzalutamide", "enzalutamide", 316, 2014, "Metastatic castration-resistant prostate cancer after docetaxel", { note: "Before chemotherapy: TA377 (2016). Hormone-sensitive metastatic disease: TA712 (2021). Non-metastatic CRPC: TA580 (2019). Non-metastatic prostate cancer after radical prostatectomy or radiotherapy: TA994 (August 2024), terminated appraisal.", smc: "accepted" }),
  rec("apalutamide", "apalutamide", 740, 2021, "With ADT for hormone-sensitive metastatic prostate cancer", { note: "High-risk non-metastatic CRPC: TA741 (2021).", smc: "accepted" }),
  rec("darolutamide", "darolutamide", 660, 2020, "High-risk non-metastatic hormone-relapsed prostate cancer", { note: "With docetaxel and ADT for metastatic hormone-sensitive disease (ARASENS): TA903 (2023).", smc: "accepted" }),
  rec("degarelix", "degarelix", 404, 2016, "Advanced hormone-dependent prostate cancer with spinal metastases", { smc: "accepted (restricted)" }),
  rec("relugolix", "relugolix", 995, 2024, "Advanced hormone-sensitive prostate cancer, and alongside or before radiotherapy for high-risk localised or locally advanced disease", { note: "Published 14 August 2024, recommended within its marketing authorisation. The relugolix combination products for uterine fibroids (TA832) and endometriosis (TA1057) are separate, non-cancer appraisals." }),
  generic("leuprolide", "leuprorelin and GnRH agonists", "Generic and biosimilar GnRH agonists (leuprorelin, goserelin, triptorelin) are the backbone of NHS androgen deprivation; funded routinely without a TA."),
  generic("bicalutamide", "bicalutamide", "Generic; NICE NG131 covers use with GnRH agonists. Funded routinely."),
  rec("cabazitaxel", "cabazitaxel", 391, 2016, "Metastatic hormone-relapsed prostate cancer after docetaxel", { smc: "accepted" }),
  rec("radium-223", "radium-223 dichloride", 412, 2016, "Hormone-relapsed prostate cancer with bone metastases after docetaxel (or not suitable for it)", { smc: "accepted (restricted)" }),
  rec("pluvicto", "lutetium-177 vipivotide tetraxetan", 930, 2023, "PSMA-positive hormone-relapsed metastatic prostate cancer after 2 or more treatments (VISION)", { note: "Initially not recommended in draft guidance; recommended in November 2023 after a revised commercial deal. A later evaluation of use before a taxane (TA1179) was terminated. Delivered at NHS nuclear medicine centres with PSMA PET selection." }),
  rec("sunitinib", "sunitinib", 169, 2009, "First-line advanced or metastatic RCC", { note: "GIST after imatinib: TA179 (2009). Pancreatic NETs: TA449 (2017). Generic since 2022.", smc: "accepted" }),
  rec("pazopanib", "pazopanib", 215, 2011, "First-line advanced RCC", { smc: "accepted" }),
  rec("axitinib", "axitinib", 333, 2015, "Advanced RCC after failure of prior systemic treatment", { note: "With pembrolizumab first-line: TA692 (2021).", smc: "accepted" }),
  rec("tivozanib", "tivozanib", 512, 2018, "First-line advanced RCC", { smc: "accepted" }),
  notRec("temsirolimus", "temsirolimus", 178, 2009, "First-line poor-prognosis advanced RCC", { note: "TA178 (bevacizumab, sorafenib, sunitinib and temsirolimus for RCC) recommended only sunitinib." }),
  cdf("belzutifan", "belzutifan", 1011, 2024, "Von Hippel-Lindau disease needing treatment for associated renal cell carcinomas, CNS haemangioblastomas or pancreatic neuroendocrine tumours when localised procedures are unsuitable", { note: "Published 16 October 2024 with managed access. The previously treated advanced RCC appraisal (ID6154) was discontinued in February 2026 after the company stopped engaging; combinations with pembrolizumab (adjuvant RCC), with lenvatinib and with pembrolizumab-lenvatinib are in development, and phaeochromocytoma or paraganglioma is awaiting development." }),
  rec("erdafitinib", "erdafitinib", 1062, 2025, "Unresectable or metastatic urothelial cancer with susceptible FGFR3 alterations after at least 1 line of treatment that included a PD-1 or PD-L1 inhibitor", { note: "Published 12 May 2025 with a commercial arrangement. MHRA-licensed (Balversa, PLGB 00242/0768-0770). The tumour-agnostic FGFR appraisal (ID4058) was discontinued." }),
  notUk("tar-200", "TAR-200 (gemcitabine intravesical system)"),

  // ================= Haematology: myeloma =================
  rec("bortezomib", "bortezomib", 129, 2007, "Multiple myeloma at first relapse", { note: "Untreated myeloma with thalidomide: TA228 (2011). Induction before transplant: TA311 (2014). Mantle cell lymphoma: TA370. Generic since 2019. TA129 introduced the first NHS response-based rebate scheme.", smc: "accepted" }),
  rec("lenalidomide", "lenalidomide", 171, 2009, "Multiple myeloma after 2 or more prior therapies", { note: "Also del(5q) MDS (TA322, 2014), untreated myeloma with dexamethasone (TA587, 2019), maintenance after transplant (TA680, 2021), and combinations with daratumumab and ixazomib. Generic since 2023, which has unlocked many combinations.", smc: "accepted" }),
  rec("pomalidomide", "pomalidomide", 427, 2017, "Multiple myeloma after 3 or more treatments including lenalidomide and bortezomib", { note: "Originally rejected in 2015 and funded via the old CDF.", smc: "accepted" }),
  rec("thalidomide", "thalidomide", 228, 2011, "Untreated multiple myeloma with an alkylating agent and a corticosteroid (transplant-ineligible)", { smc: "accepted" }),
  rec("carfilzomib", "carfilzomib", 457, 2017, "With dexamethasone for myeloma after 1 prior therapy", { note: "With lenalidomide and dexamethasone (KRd): TA695 (2021). With daratumumab and dexamethasone for relapsed or refractory myeloma: TA841 (November 2022), terminated appraisal.", smc: "accepted" }),
  cdf("ixazomib", "ixazomib", 505, 2018, "With lenalidomide and dexamethasone for myeloma after 2 or 3 lines", { note: "Reappraised in TA870 (2023) and recommended for routine commissioning.", smc: "accepted" }),
  cdf("daratumumab", "daratumumab", 573, 2019, "With bortezomib and dexamethasone for myeloma after 1 prior therapy (CASTOR)", { note: "Monotherapy after 3 lines: TA510 (2018, CDF). D-VTd induction before transplant: TA783 (2022). DVd moved to routine: TA763 (2022). With lenalidomide and dexamethasone for untreated myeloma when a transplant is unsuitable (MAIA): TA917 (October 2023), recommended within the licence. Subcutaneous form used throughout. With bortezomib, lenalidomide and dexamethasone for untreated myeloma when a transplant is unsuitable (CEPHEUS): TA1170 (June 2026). DVd reappraised for people who have had just 1 previous line including or unsuitable for lenalidomide: TA897 (June 2023).", smc: "accepted" }),
  cdf("isatuximab", "isatuximab", 658, 2020, "With pomalidomide and dexamethasone for myeloma after 3 or more treatments", { note: "With carfilzomib and dexamethasone (IKEMA) appraised 2023. With bortezomib, lenalidomide and dexamethasone for untreated myeloma when a transplant is unsuitable (IMROZ): TA1098 (September 2025), within the licence.", smc: "accepted" }),
  term("elotuzumab", "elotuzumab", 434, 2017, "Previously treated multiple myeloma", { note: "Terminated 22 March 2017: Bristol-Myers Squibb made no evidence submission. Later appraisals for untreated myeloma (ID966) and with pomalidomide-dexamethasone (ID1467) were discontinued. MHRA-licensed (Empliciti, PLGB 15105/0129-0130) but not routinely funded." }),
  rec("selinexor", "selinexor", 970, 2024, "With dexamethasone for penta-refractory multiple myeloma after 4 or more treatments that progressed on the last treatment", { note: "Published 8 May 2024 with a commercial arrangement. TA974 (May 2024) also recommends selinexor with bortezomib and dexamethasone, but only after 1 prior line if refractory to both daratumumab and lenalidomide, or after 2 prior lines if refractory to lenalidomide. Myelofibrosis (with ruxolitinib), endometrial cancer maintenance and the pomalidomide combination are awaiting development." }),

  // ================= Haematology: lymphoma and CLL =================
  rec("rituximab", "rituximab", 65, 2003, "Aggressive (diffuse large B-cell) non-Hodgkin lymphoma with CHOP", { note: "Follicular lymphoma (TA110, TA137, TA226), CLL (TA174, TA193). Biosimilars since 2017 dominate NHS use. Subcutaneous form available.", smc: "accepted" }),
  rec("obinutuzumab", "obinutuzumab", 343, 2015, "With chlorambucil for untreated CLL unsuitable for fludarabine-based therapy", { note: "Rituximab-refractory follicular lymphoma with bendamustine: TA472 (2017). Untreated advanced follicular lymphoma: TA513 (2018). With venetoclax for CLL: TA663 (2020).", smc: "accepted" }),
  rec("ibrutinib", "ibrutinib", 429, 2017, "CLL after 1 prior therapy, or untreated CLL with 17p deletion or TP53 mutation", { note: "Waldenström macroglobulinaemia: TA491 (2017). Relapsed or refractory mantle cell lymphoma: TA502 (2018). Untreated CLL without high-risk features recommended 2021. With venetoclax, fixed duration, for untreated CLL (GLOW and CAPTIVATE): TA891 (May 2023), within the licence with commercial arrangements.", smc: "accepted" }),
  rec("acalabrutinib", "acalabrutinib", 689, 2021, "Untreated CLL (with 17p/TP53 or unsuitable for FCR/BR) and CLL after 1 prior therapy", { note: "Untreated mantle cell lymphoma with bendamustine-rituximab (ECHO) when a transplant is not suitable: TA1184 (August 2026). With venetoclax, without obinutuzumab, for untreated CLL (AMPLIFY): TA1185 (August 2026).", smc: "accepted" }),
  rec("zanubrutinib", "zanubrutinib", 931, 2023, "Untreated CLL (with 17p/TP53 or unsuitable for FCR/BR) and CLL after 1 prior therapy", { note: "Waldenström macroglobulinaemia: TA833 (2022). Marginal zone lymphoma after anti-CD20 treatment: TA1001 (September 2024), recommended within the licence. Relapsed or refractory mantle cell lymphoma after 1 line of treatment: TA1081 (July 2025), with a commercial arrangement. Follicular lymphoma with obinutuzumab after 2 or more treatments: TA978 (May 2024), terminated appraisal.", smc: "accepted" }),
  opt("pirtobrutinib", "pirtobrutinib", 1173, 2026, "Relapsed or refractory CLL after a BTK inhibitor, only when retreatment with a covalent BTK inhibitor is not clinically appropriate", { note: "Published 1 July 2026 with a commercial arrangement. The mantle cell lymphoma appraisal (ID3975) is still in progress with no expected date; its scoping consultation ran 27 August to 11 September 2026. Untreated CLL and the combination with venetoclax-rituximab are at earlier stages." }),
  rec("venetoclax", "venetoclax", 663, 2020, "With obinutuzumab for untreated CLL", { note: "Monotherapy for 17p/TP53 CLL: TA487 (2017, CDF). With rituximab for relapsed CLL: TA561 (2019). With azacitidine or low-dose cytarabine for AML unsuitable for intensive chemotherapy: TA765 (2022). Fixed-duration ibrutinib-venetoclax for untreated CLL: TA891 (May 2023), within the licence with commercial arrangements. The obinutuzumab combination for untreated CLL was reappraised as TA1119 (January 2026), recommended within the licence. With acalabrutinib, without obinutuzumab, for untreated CLL (AMPLIFY): TA1185 (August 2026).", smc: "accepted" }),
  rec("idelalisib", "idelalisib", 359, 2015, "With rituximab for CLL after 1 prior therapy or untreated with 17p/TP53", { note: "Rarely used since BTK and BCL2 inhibitors arrived.", smc: "accepted" }),
  notUk("duvelisib", "duvelisib", "EU marketing authorisation application withdrawn; no UK licence. NICE appraisal for relapsed or refractory CLL after 2 or more treatments: TA811 (July 2022), terminated."),
  rec("bendamustine", "bendamustine", 216, 2011, "First-line CLL (Binet B/C) when fludarabine combination is not appropriate", { note: "Generic; also used in lymphoma regimens (BR) and as the partner in TA472 and TA649.", smc: "accepted" }),
  notRec("tafasitamab", "tafasitamab", 883, 2023, "With lenalidomide for relapsed or refractory DLBCL in people who cannot have an autologous stem cell transplant", { note: "Published 3 May 2023: not recommended within its marketing authorisation; the evidence came from a small study with no direct comparison against polatuzumab vedotin with bendamustine-rituximab. MHRA-licensed (Minjuvi, PLGB 42338/0016). Appraisals in follicular lymphoma with lenalidomide-rituximab (ID6413) and untreated DLBCL with R-CHOP (ID6568) are in development." }),
  opt("mogamulizumab", "mogamulizumab", 754, 2021, "Sézary syndrome after at least 1 systemic treatment; mycosis fungoides stage 2B or above after at least 2 systemic treatments", { note: "Published 15 December 2021 with a commercial arrangement; the mycosis fungoides recommendation is narrower than the licence. The adult T-cell leukaemia-lymphoma appraisal (ID1390) was discontinued." }),
  notUk("belinostat", "belinostat"),
  notUk("pralatrexate", "pralatrexate"),
  notUk("romidepsin", "romidepsin", "EU licence for PTCL withdrawn; no UK licence."),
  term("tagraxofusp", "tagraxofusp", 782, 2022, "Blastic plasmacytoid dendritic cell neoplasm", { note: "Terminated 30 March 2022: Stemline Therapeutics made no evidence submission. MHRA-licensed (Elzonris, PLGB 53425/0001) but not routinely funded." }),
  rec("belumosudil", "belumosudil", 949, 2024, "Chronic graft-versus-host disease after 2 or more systemic treatments in people aged 12 and over", { note: "Published 7 February 2024 with a commercial arrangement." }),

  // ================= Haematology: leukaemia and myeloid =================
  rec("imatinib", "imatinib", 70, 2003, "Chronic phase CML (first-line)", { note: "Unresectable or metastatic KIT-positive GIST: TA86 (2004). Adjuvant GIST: TA326 (2014). Generic since 2017; now costs the NHS a small fraction of the original price.", smc: "accepted" }),
  rec("dasatinib", "dasatinib", 426, 2016, "CML resistant or intolerant to imatinib", { note: "Untreated chronic phase CML: TA425 (2016). Generic since 2021.", smc: "accepted" }),
  rec("nilotinib", "nilotinib", 251, 2012, "Untreated chronic phase CML (dasatinib, nilotinib and standard-dose imatinib)", { note: "After imatinib: TA241 (2012) and TA426 (2016).", smc: "accepted" }),
  rec("bosutinib", "bosutinib", 401, 2016, "CML after prior TKI when imatinib, nilotinib and dasatinib are not appropriate", { note: "Untreated CML appraised 2018; check NICE.", smc: "accepted" }),
  rec("ponatinib", "ponatinib", 451, 2017, "CML or Ph-positive ALL resistant to dasatinib or nilotinib, or with T315I", { smc: "accepted" }),
  rec("asciminib", "asciminib", 813, 2022, "Chronic phase CML after 2 or more TKIs", { note: "Untreated CML (ASC4FIRST) appraised 2025-26.", smc: "accepted" }),
  rec("asparaginase", "pegaspargase", 408, 2016, "Acute lymphoblastic leukaemia in children, young people and adults", { note: "Erwinia asparaginase is used for hypersensitivity; recombinant Rylaze is not UK-licensed.", smc: "accepted" }),
  rec("azacitidine", "azacitidine", 218, 2011, "Intermediate-2 or high-risk MDS, CMML, and AML with 20-30% blasts not eligible for transplant", { note: "AML with more than 30% blasts (TA399, 2016) was not recommended. Oral azacitidine (Onureg) for maintenance in AML in remission after induction (QUAZAR AML-001): TA827 (October 2022), recommended within the licence. Generic injectable since 2020.", smc: "accepted" }),
  term("decitabine-cedazuridine", "decitabine-cedazuridine", 932, 2023, "Untreated AML when intensive chemotherapy is unsuitable", { note: "Terminated 23 November 2023: Otsuka made no evidence submission. MHRA-licensed (Inaqovi, PLGB 50697/0033). A cost-comparison appraisal of decitabine-cedazuridine with venetoclax (ID6601) is in progress with no expected date." }),
  rec("midostaurin", "midostaurin", 523, 2018, "Untreated FLT3 mutation-positive AML with standard chemotherapy", { smc: "accepted" }),
  rec("gilteritinib", "gilteritinib", 642, 2020, "Relapsed or refractory FLT3 mutation-positive AML", { smc: "accepted" }),
  rec("quizartinib", "quizartinib", 1013, 2024, "Newly diagnosed FLT3-ITD-positive AML with standard induction and consolidation chemotherapy, then alone as maintenance", { note: "Published 23 October 2024 with a commercial arrangement. The relapsed or refractory AML appraisal (ID1325) was discontinued." }),
  rec("glasdegib", "glasdegib", 647, 2020, "With low-dose cytarabine for untreated AML unsuitable for intensive chemotherapy", { smc: "accepted" }),
  notUk("enasidenib", "enasidenib", "EU marketing authorisation application withdrawn 2019; no UK licence."),
  notUk("olutasidenib", "olutasidenib"),
  notUk("revumenib", "revumenib"),
  notUk("ziftomenib", "ziftomenib"),
  notUk("sonrotoclax", "sonrotoclax"),
  rec("cpx-351", "CPX-351 (liposomal daunorubicin-cytarabine)", 552, 2018, "Untreated therapy-related AML or AML with myelodysplasia-related changes", { smc: "accepted" }),
  rec("arsenic-trioxide", "arsenic trioxide", 526, 2018, "Acute promyelocytic leukaemia (untreated low-to-intermediate risk with ATRA, and relapsed)", { smc: "accepted" }),
  generic("tretinoin-atra", "tretinoin (ATRA)", "Standard for APL with arsenic trioxide (TA526) or chemotherapy; funded routinely without its own TA."),
  rec("ruxolitinib", "ruxolitinib", 386, 2016, "Disease-related splenomegaly or symptoms in myelofibrosis (intermediate-2 or high risk)", { note: "Polycythaemia vera resistant or intolerant to hydroxycarbamide appraised 2023. Acute graft versus host disease with an inadequate response to corticosteroids, age 12 and over: TA1054 (April 2025), recommended within the licence with a commercial arrangement. The paediatric chronic GVHD appraisal (TA1132) was terminated.", smc: "accepted" }),
  rec("fedratinib", "fedratinib", 756, 2021, "Myelofibrosis-related splenomegaly or symptoms after ruxolitinib", { smc: "accepted" }),
  opt("momelotinib", "momelotinib", 957, 2024, "Intermediate-2 or high-risk myelofibrosis with moderate to severe anaemia, in people who have not had a JAK inhibitor or have had ruxolitinib", { note: "Published 20 March 2024 with a commercial arrangement; the risk-group condition narrows the licence." }),
  notUk("pacritinib", "pacritinib"),
  term("luspatercept", "luspatercept", 844, 2022, "Anaemia caused by myelodysplastic syndromes", { note: "Terminated 24 November 2022: BMS made no evidence submission (the beta-thalassaemia appraisal TA843 was terminated the same day). MHRA-licensed (Reblozyl, PLGB 15105/0153-0154). A new MDS appraisal including a review of TA844 (ID6696) is awaiting development, as are myelofibrosis anaemia and haemoglobin H disease." }),
  notUk("imetelstat", "imetelstat", "Not on the MHRA products register in September 2026 (EU authorisation as Rytelo, 7 March 2025, for transfusion-dependent anaemia in lower-risk MDS after ESA failure). NICE suspended the MDS appraisal (ID3922) on 16 February 2024 while the company confirms its UK regulatory filing plans; myelofibrosis after a JAK inhibitor is awaiting development."),
  inDev("ropeginterferon-alfa-2b", "ropeginterferon alfa-2b", "MHRA-licensed (Besremi, PLGB 21344/0026-0027). The NICE appraisal for polycythaemia vera without symptomatic splenomegaly (ID1596) has been listed as in progress since scoping in May 2019 with no expected publication date, so there is no NICE recommendation; funding is by local decision or individual funding request."),
  notUk("rusfertide", "rusfertide"),
  rec("treosulfan", "treosulfan", 640, 2020, "With fludarabine as conditioning before allogeneic stem cell transplant for malignant disease, where a reduced-intensity regimen would be suitable", { note: "Published 5 August 2020, recommended within its marketing authorisation. Not enough evidence was presented for children or for people who could tolerate myeloablative conditioning. The paediatric non-malignant disease appraisal (TA945, January 2024) was terminated; adult non-malignant disease (ID1540) is awaiting development." }),

  // ================= Sarcoma, bone, neuroendocrine, thyroid, CNS, rare =================
  rec("trabectedin", "trabectedin", 185, 2010, "Advanced soft tissue sarcoma after anthracyclines and ifosfamide", { smc: "accepted" }),
  rec("mifamurtide", "mifamurtide", 235, 2011, "High-grade resectable non-metastatic osteosarcoma after macroscopically complete surgical resection (age 2-30)", { smc: "accepted" }),
  rec("ripretinib", "ripretinib", 1146, 2026, "Advanced GIST after 3 or more kinase inhibitors including imatinib", { note: "Published 28 April 2026 with a commercial arrangement, replacing TA881 (May 2023)." }),
  rec("avapritinib", "avapritinib", 1012, 2024, "Advanced systemic mastocytosis (aggressive SM, SM with an associated haematological neoplasm, mast cell leukaemia)", { note: "Published 6 November 2024 with a commercial arrangement. The GIST appraisal (TA730, September 2021) was terminated after Blueprint Medicines withdrew, saying it would not launch avapritinib in the UK for that indication. Indolent systemic mastocytosis (ID6578) is in development." }),
  notUk("nirogacestat", "nirogacestat", "EU-licensed 2025 for desmoid tumours; UK licence and NICE position not yet researched."),
  notUk("pexidartinib", "pexidartinib", "EU marketing authorisation application withdrawn 2020; no UK licence."),
  notUk("vimseltinib", "vimseltinib"),
  rec("dinutuximab", "dinutuximab beta", 538, 2018, "High-risk neuroblastoma after induction, high-dose chemotherapy and stem cell transplant, or relapsed/refractory", { note: "Dinutuximab (Unituxin) is US-only; dinutuximab beta (Qarziba) is the UK product.", smc: "accepted" }),
  notUk("naxitamab", "naxitamab"),
  notUk("eflornithine", "eflornithine (DFMO)"),
  rec("lutathera", "lutetium-177 dotatate", 539, 2018, "Unresectable or metastatic, progressive, well-differentiated somatostatin receptor-positive GEP-NETs", { smc: "accepted" }),
  generic("octreotide-lanreotide", "somatostatin analogues", "Octreotide and lanreotide are long-established for functional NET symptoms and tumour control (CLARINET, PROMID); funded routinely without a TA."),
  notRec("vandetanib", "vandetanib", 550, 2018, "Aggressive and symptomatic unresectable, locally advanced or metastatic medullary thyroid cancer", { note: "Published 12 December 2018: not recommended within its marketing authorisation. Cabozantinib was appraised for medullary thyroid cancer in TA516 (2018) and selpercatinib for RET-altered thyroid cancer in TA1038 and TA1039 (2025). The NSCLC and differentiated thyroid cancer appraisals were discontinued. MHRA-licensed (Caprelsa)." }),
  generic("radioactive-iodine", "radioactive iodine (I-131)", "Standard of care for differentiated thyroid cancer for 80 years; delivered through NHS nuclear medicine departments (BTA guideline). No TA."),
  notRec("vismodegib", "vismodegib", 489, 2017, "Symptomatic metastatic or locally advanced basal cell carcinoma unsuitable for surgery or radiotherapy", { note: "Was funded under the old CDF before 2016; not routinely available since. Individual funding requests possible." }),
  row("sonidegib", "sonidegib", "not appraised", undefined, undefined, "Locally advanced basal cell carcinoma not amenable to curative surgery or radiotherapy", { note: "MHRA-licensed (Odomzo, PLGB 31750/0166; EU authorisation 14 August 2015) but NICE has never published a technology appraisal (a NICE search in September 2026 returns no guidance), so funding is by local decision or individual funding request. SMC position not checked: the SMC search is rendered in the browser and returned no readable results." }),
  rec("vorasidenib", "vorasidenib", 1147, 2026, "IDH-mutant grade 2 astrocytoma or oligodendroglioma after surgery (INDIGO)", { note: "MHRA-licensed 2025; NICE recommended it in April 2026 after a commercial deal." }),
  notUk("dordaviprone", "dordaviprone"),
  inDev("tovorafenib", "tovorafenib", "NICE appraisal for relapsed or refractory paediatric low-grade glioma with a BRAF fusion, rearrangement or V600 mutation in people aged 6 months and over (ID6557) is in progress with no expected date (scoping consultation July 2025). Not on the MHRA products register in September 2026; the EU granted a conditional authorisation (Ojemda) on 20 April 2026."),
  row("optune", "Optune (tumour treating fields)", "not appraised", undefined, undefined, undefined, { note: "NICE published a Medtech innovation briefing (MIB) rather than a TA; tumour treating fields are not routinely commissioned by NHS England for glioblastoma. Available privately or via trials.", commissioned: false }),
  row("aminolevulinic-acid-gleolan", "5-aminolevulinic acid (Gliolan)", "recommended", undefined, undefined, "Fluorescence-guided resection of high-grade glioma", { note: "Recommended in NICE guideline NG99 (brain tumours, 2018) rather than a TA; routinely used in NHS neurosurgical centres.", commissioned: true }),
  notUk("cetuximab-sarotalocan", "cetuximab sarotalocan", "Japan-only licence (Akalux). Not on the MHRA products register and no NICE guidance or appraisal exists (a NICE search in September 2026 returns nothing). The EMA search page could not be fetched (HTTP 401), so no EU register entry could be confirmed."),
  notUk("relacorilant", "relacorilant", "Not on the MHRA products register in September 2026 and no NICE guidance or appraisal exists (a NICE search returns nothing). The EMA search page could not be fetched (HTTP 401), so any EU application could not be confirmed. Access only through a clinical trial."),
  notUk("avutometinib-defactinib", "avutometinib with defactinib"),
  generic("aldesleukin", "aldesleukin (high-dose IL-2)", "Licensed for metastatic RCC since 1989; largely superseded and rarely used on the NHS. No TA."),
  rec("sodium-thiosulfate", "sodium thiosulfate (Pedmark)", 1034, 2025, "Preventing hearing loss from cisplatin chemotherapy in people aged 1 month to 17 years with localised, non-metastatic solid tumours", { note: "Published 22 January 2025 with a commercial arrangement (anhydrous sodium thiosulfate)." }),

  // ================= Vaccines, diagnostics and imaging agents =================
  row("gardasil-9", "Gardasil 9 (HPV vaccine)", "not appraised", undefined, undefined, "National HPV vaccination programme", { note: "Not a TA: HPV vaccination is a national immunisation programme on JCVI advice. Gardasil 9 has been the programme vaccine since 2022, offered to all children aged 12-13 (single dose since 2023) and to men who have sex with men up to 45 via sexual health clinics.", commissioned: true }),
  row("ga68-psma-11", "gallium-68 PSMA-11 PET", "not appraised", undefined, undefined, "PSMA PET-CT for prostate cancer staging and recurrence", { note: "Radiopharmaceuticals are not appraised as TAs. PSMA PET-CT is commissioned by NHS England (clinical commissioning policy) for biochemical recurrence and high-risk staging, and is required to select patients for Pluvicto. Locametz and Illuccix are MHRA-licensed kits.", commissioned: true }),
  row("ga68-dotatate", "gallium-68 DOTATATE PET", "not appraised", undefined, undefined, "Somatostatin receptor PET for neuroendocrine tumours", { note: "Available at NHS PET centres and required before Lutathera (TA539). No TA.", commissioned: true }),
  notUk("pylarify", "piflufolastat F-18", "US product; UK PSMA PET uses gallium-68 PSMA-11 or F-18 PSMA-1007 supplied by NHS radiopharmacies."),
  notUk("flotufolastat", "flotufolastat F-18"),
  notUk("fluciclovine-f18", "fluciclovine F-18", "EU-licensed but not commissioned for routine NHS use; PSMA PET is preferred."),
  notUk("fluoroestradiol-f18", "fluoroestradiol F-18"),
  row("tilmanocept-tc99m", "technetium-99m tilmanocept", "not appraised", undefined, undefined, undefined, { note: "EU-licensed sentinel node tracer; NHS sentinel node biopsy mostly uses Tc-99m nanocolloid. No TA.", commissioned: false }),
  notUk("pafolacianine", "pafolacianine"),
  notUk("pegulicianine", "pegulicianine"),
  row("foundationone-cdx", "FoundationOne CDx", "not appraised", undefined, undefined, undefined, { note: "NHS England does not commission commercial CGP panels routinely; tumour profiling is delivered by the seven NHS Genomic Laboratory Hubs under the National Genomic Test Directory, including whole genome sequencing for some cancers. Commercial panels may be obtained privately.", commissioned: false }),
  notUk("shield", "Shield blood test", "US-only blood-based colorectal screening test; NHS bowel screening uses the FIT stool test."),
  row("artera-ai-breast", "ArteraAI Breast", "not appraised", undefined, undefined, undefined, { note: "Not available on the NHS; NICE has assessed AI prognostic tools via early value assessments, not TAs.", commissioned: false }),
  row("artera-ai-prostate", "ArteraAI Prostate", "not appraised", undefined, undefined, undefined, { note: "Not available on the NHS; NICE early value assessment route applies to digital prognostic tools.", commissioned: false }),
  notUk("daraxonrasib", "daraxonrasib"),
  notUk("zidesamtinib", "zidesamtinib"),
  notUk("pyrotinib", "pyrotinib"),
];

export const coverageUk: Record<string, UkCoverage> = Object.fromEntries(list.map((c) => [c.drugId, c]));

/** Plain-English explainer of how NHS cancer care and drug funding work across the four nations. */
export const NHS_SYSTEM: Array<{ id: string; title: string; plain: string; detail: string; links: Array<{ label: string; url: string }> }> = [
  {
    id: "pathway",
    title: "How you get into cancer care: GP, urgent referral, and the waiting-time standards",
    plain: "Almost everyone starts with their GP. If the GP suspects cancer they make an urgent referral and you should hear within two weeks and be told whether you have cancer within 28 days. If you do, treatment should start within 62 days of the referral.",
    detail: "NICE guideline NG12 sets the symptom thresholds at which a GP must refer on the urgent suspected cancer pathway (roughly a 3% risk of cancer). In England the old 'two-week wait' target was replaced in October 2023 by three standards: the 28-day Faster Diagnosis Standard (told you have or do not have cancer within 28 days of referral or screening; target 75%, rising to 80% by March 2026), the 31-day standard (treatment within a month of the decision to treat; 96%), and the 62-day standard (first treatment within 62 days of urgent referral, screening or consultant upgrade; 85%). Performance is published monthly and many trusts miss the 62-day target, so ask your cancer nurse specialist where you are on the pathway. Scotland, Wales and Northern Ireland publish their own 31- and 62-day figures. Emergency presentations (via A&E) account for roughly a fifth of diagnoses and have worse outcomes.",
    links: [
      { label: "NICE NG12: suspected cancer recognition and referral", url: "https://www.nice.org.uk/guidance/ng12" },
      { label: "NHS England: Faster Diagnosis Standard (archived copy)", url: "https://web.archive.org/web/20251231165538/https://www.england.nhs.uk/cancer/faster-diagnosis/" },
      { label: "Cancer waiting times statistics", url: "https://www.england.nhs.uk/statistics/statistical-work-areas/cancer-waiting-times/" },
      { label: "NHS: cancer overview and referral", url: "https://www.nhs.uk/conditions/cancer/" },
    ],
  },
  {
    id: "mdt",
    title: "Who decides your treatment: the multidisciplinary team, cancer alliances and specialist centres",
    plain: "Your case is discussed by a team of specialists (the MDT) who agree a recommended plan before it is put to you. Common cancers are treated locally; rare cancers, complex surgery and cell therapy are concentrated in a small number of specialist centres.",
    detail: "Every NHS cancer patient should have their diagnosis and plan reviewed at a weekly multidisciplinary team meeting (surgeon, oncologist, radiologist, pathologist, clinical nurse specialist and others) and be assigned a named key worker, usually a clinical nurse specialist. England's Cancer Alliances (around 20) coordinate services across regions and run rapid diagnostic centres and the lung screening programme. Care is tiered: local trusts deliver most chemotherapy and radiotherapy; tertiary centres such as The Royal Marsden, The Christie, UCLH, Guy's, Leeds, Birmingham, Glasgow's Beatson, Cardiff's Velindre and Belfast City deliver specialised surgery, sarcoma, neuro-oncology, teenage and young adult and paediatric oncology. Ask your MDT whether your cancer type has a nationally designated centre; you can be referred anywhere in the NHS.",
    links: [
      { label: "NHS England: Cancer Alliances", url: "https://www.england.nhs.uk/cancer/cancer-alliances-improving-care-locally/" },
      { label: "Macmillan: your multidisciplinary team", url: "https://www.macmillan.org.uk/cancer-information-and-support/treatment/preparing-for-treatment/your-multidisciplinary-team" },
      { label: "NHS England: national cancer programme", url: "https://www.england.nhs.uk/cancer/" },
    ],
  },
  {
    id: "nice",
    title: "NICE technology appraisals: how a drug gets funded, and the cost-per-QALY threshold",
    plain: "A new cancer drug is only routinely available on the NHS in England, Wales and Northern Ireland once NICE has appraised it and judged that its benefit is worth its price. If NICE says yes, the NHS must fund it within three months. Almost all recent yes decisions depend on a confidential discount.",
    detail: "NICE runs a single technology appraisal (TA) for each new medicine and indication, usually in parallel with licensing so guidance lands within a few months of MHRA approval. The company submits a cost-effectiveness model; an independent evidence review group critiques it; a committee decides. NICE normally accepts treatments below £20,000 per quality-adjusted life year (QALY) and needs strong justification between £20,000 and £30,000. Until 2022 an 'end-of-life' rule let drugs for people with under 24 months to live and a gain of 3+ months be accepted up to about £50,000 per QALY. The 2022 methods update replaced it with a severity modifier that weights QALYs by 1.2 or 1.7 for conditions with large absolute and proportional health loss; this catches most advanced cancers but not all, which is why some drugs for earlier-stage or HER2-low disease have been rejected. Outcomes are: recommended; recommended with optimisation (a narrower population, a stopping rule, or a Patient Access Scheme discount); recommended for the Cancer Drugs Fund; or not recommended. NHS England must fund positive TAs within 90 days. Wales and Northern Ireland adopt NICE TAs; Scotland uses the SMC instead.",
    links: [
      { label: "NICE technology appraisal guidance list", url: "https://www.nice.org.uk/guidance/published?ngt=Technology%20appraisal%20guidance" },
      { label: "NICE health technology evaluations manual (PMG36)", url: "https://www.nice.org.uk/process/pmg36" },
      { label: "NICE: technology appraisal guidance explained", url: "https://www.nice.org.uk/about/what-we-do/our-programmes/nice-guidance/nice-technology-appraisal-guidance" },
    ],
  },
  {
    id: "cdf",
    title: "The Cancer Drugs Fund and managed access",
    plain: "When NICE thinks a cancer drug is promising but the evidence is not yet good enough to say yes, it can be funded from the Cancer Drugs Fund for about two years while more data are collected, then re-decided. Patients get it straight away; the company carries the financial risk.",
    detail: "The original CDF (2010-2016) paid for drugs NICE had rejected and overspent badly. Since July 2016 it has been a managed access fund run jointly by NICE and NHS England with a fixed budget (£340 million a year). A drug enters the CDF when NICE judges it has plausible potential to be cost-effective but material uncertainty; a managed access agreement sets the data to be collected (often from SACT, the national chemotherapy dataset, plus the ongoing trial) and a confidential price. Interim funding from the CDF starts from the point of positive draft guidance, so CDF drugs are often available in England before anywhere else in Europe. At the end of the period NICE reappraises and either moves the drug to routine commissioning or, occasionally, withdraws it for new patients (existing patients continue). Well over a hundred drug-indication pairs have passed through, including CAR-T therapies, osimertinib, durvalumab and pembrolizumab combinations. The live CDF list is published by NHS England and updated monthly.",
    links: [
      { label: "NHS England: Cancer Drugs Fund", url: "https://www.england.nhs.uk/cancer/cdf/" },
      { label: "Current CDF list (updated monthly)", url: CDF_LIST_URL },
      { label: "NICE: managed access", url: "https://www.nice.org.uk/about/what-we-do/our-programmes/managed-access" },
    ],
  },
  {
    id: "imf",
    title: "The Innovative Medicines Fund",
    plain: "The Innovative Medicines Fund does for non-cancer medicines what the Cancer Drugs Fund does for cancer: it pays for promising treatments while evidence is collected. Some supportive treatments and rare-disease therapies relevant to cancer patients come through it.",
    detail: "Launched in June 2022 with £340 million a year, matching the CDF, the IMF extends managed access to any medicine NICE cannot yet recommend routinely, including gene therapies and treatments for rare inherited cancer syndromes or complications such as graft-versus-host disease. Together the two funds give NHS England a £680 million managed access envelope. The IMF uses the same interim funding mechanism from positive draft guidance and the same data-collection agreements. Patient charities have pressed for the two funds to be merged and for the managed access period to be more flexible.",
    links: [
      { label: "NHS England: Innovative Medicines Fund", url: "https://www.england.nhs.uk/medicines-2/innovative-medicines-fund/" },
    ],
  },
  {
    id: "specialised",
    title: "Specialised commissioning: CAR-T centres, proton beam therapy, stereotactic radiosurgery",
    plain: "The most complex treatments are paid for and planned nationally rather than locally, and delivered at a handful of accredited hospitals. If you need CAR-T, protons or radiosurgery you may travel, but the NHS funds it.",
    detail: "NHS England directly commissions around 150 specialised services. CAR-T cell therapy is delivered at JACIE-accredited centres (roughly 15 adult and 3 paediatric, including UCLH, King's, The Christie, Manchester Royal Infirmary, Birmingham, Bristol, Leeds, Newcastle, Glasgow, Cardiff and Great Ormond Street) after a national CAR-T clinical panel confirms eligibility; the drug cost sits with NICE-approved TAs and the CDF. High-energy proton beam therapy opened at The Christie (Manchester, 2018) and UCLH (London, 2021); indications are mainly paediatric and young adult tumours, base-of-skull chordoma and selected head and neck and spinal tumours, decided by a national proton panel, with overseas referral no longer routine. Stereotactic radiosurgery and stereotactic ablative radiotherapy (SABR) are commissioned at designated centres for brain metastases, vestibular schwannoma, early lung cancer and oligometastatic disease under national clinical commissioning policies. Blood and marrow transplantation, sarcoma surgery, hepatobiliary and oesophago-gastric surgery, teenage and young adult cancer and paediatric oncology are also nationally commissioned.",
    links: [
      { label: "NHS England: specialised services", url: "https://www.england.nhs.uk/commissioning/spec-services/" },
      { label: "NHS England: CAR-T therapy", url: "https://www.england.nhs.uk/cancer/cdf/car-t-therapy/" },
      { label: "NHS England: proton beam therapy", url: "https://www.england.nhs.uk/commissioning/spec-services/highly-spec-services/pbt/" },
      { label: "NHS England clinical commissioning policies", url: "https://www.england.nhs.uk/publication/?filter-category=clinical-commissioning-policies" },
    ],
  },
  {
    id: "scotland",
    title: "Scotland: the SMC, the New Medicines Fund and PACS",
    plain: "Scotland does not use NICE for new medicines. The Scottish Medicines Consortium decides, usually within months of licensing, and a New Medicines Fund covers the cost of end-of-life and rare-disease drugs. If a drug has been turned down, your consultant can still ask for it for you through PACS Tier 2.",
    detail: "The Scottish Medicines Consortium (SMC) appraises every new medicine for NHS Scotland; its decisions are 'accepted', 'accepted for restricted use' or 'not recommended', and health boards must make accepted medicines available. Since 2014 the Patient and Clinician Engagement (PACE) process gives extra weight to end-of-life and orphan medicines, and an ultra-orphan pathway allows three years of data collection. The New Medicines Fund (funded from pharmaceutical rebates) reimburses health boards for these medicines. Where SMC has not accepted a medicine, a clinician can apply under the Peer Approved Clinical System: PACS Tier 1 for ultra-orphan drugs and PACS Tier 2 (which replaced Individual Patient Treatment Requests in 2018) for any drug the SMC has rejected or not appraised. Scottish cancer waiting times use a 31-day and 62-day standard; the three regional cancer networks are NCA, SCAN and WoSCAN.",
    links: [
      { label: "Scottish Medicines Consortium: medicines advice", url: "https://scottishmedicines.org.uk/medicines-advice/" },
      { label: "Scottish Government: NHS medicines policy", url: "https://www.gov.scot/policies/nhs-medicines/" },
      { label: "PACS Tier 2 guidance", url: "https://www.gov.scot/publications/peer-approved-clinical-system-tier-two/" },
    ],
  },
  {
    id: "wales-ni",
    title: "Wales and Northern Ireland: AWTTC, One Wales and the New Treatment Fund; NI adoption of NICE",
    plain: "Wales and Northern Ireland follow NICE decisions, with their own rules on top. Wales has a fund that guarantees access within two months of a yes, and a One Wales route for medicines NICE has not looked at. Northern Ireland adopts NICE guidance a little later and runs its own individual funding requests.",
    detail: "In Wales, NICE TAs apply and the New Treatment Fund (since 2017) requires health boards to make newly recommended medicines available within 60 days. The All Wales Therapeutics and Toxicology Centre (AWTTC) supports the All Wales Medicines Strategy Group (AWMSG), which appraises medicines NICE does not intend to cover and runs the One Wales process for a consistent national position on unlicensed or non-appraised medicines, replacing seven different individual patient funding request policies. Velindre Cancer Centre (Cardiff) and the South West Wales and North Wales cancer centres deliver care, with Welsh patients travelling to English centres for CAR-T and protons. In Northern Ireland the Department of Health endorses NICE TAs (usually within weeks) and the Health and Social Care system funds them; regional cancer services are centred on Belfast City Hospital's Cancer Centre and the North West Cancer Centre at Altnagelvin, and an Individual Funding Request process covers non-approved treatments. NI cancer waiting-time performance has been the weakest in the UK.",
    links: [
      { label: "All Wales Therapeutics and Toxicology Centre", url: "https://awttc.nhs.wales/" },
      { label: "Welsh Government: New Treatment Fund", url: "https://www.gov.wales/new-treatment-fund" },
      { label: "Department of Health NI: NICE guidance endorsement", url: "https://www.health-ni.gov.uk/topics/safety-and-quality-standards/nice-guidance" },
    ],
  },
  {
    id: "screening",
    title: "Screening programmes: breast, bowel, cervical and lung",
    plain: "The NHS invites healthy people for four cancer screens: mammograms for women 50 to 71, a stool test for bowel cancer from 50, cervical screening for women 25 to 64, and low-dose CT lung checks for current and former smokers aged 55 to 74. You do not need a GP referral; invitations are automatic if you are registered with a GP.",
    detail: "Breast screening: three-yearly mammography for women 50-70 (invited up to 71; older women can self-refer); AI-assisted reading is being trialled (EDITH). Bowel screening: the faecal immunochemical test (FIT) every two years, extended in England from 60-74 down to 50-74 by 2025; a positive FIT leads to colonoscopy. Scotland has offered FIT from 50 since 2017; Wales and Northern Ireland are lowering to 50. Cervical screening: primary HPV testing, every three years at 25-49 and every five years at 50-64; England moved to five-yearly for HPV-negative women in July 2025 (Scotland and Wales already had), and HPV self-sampling is being introduced for under-screened women. Lung: the Targeted Lung Health Check programme (low-dose CT for people aged 55-74 who smoke or used to, identified via GP records) is being rolled out across England as the national NHS Lung Cancer Screening Programme, with full coverage planned by 2029; it has raised the share of lung cancers found at stage I-II to roughly three-quarters in screened areas. There is no national prostate screening; the UK National Screening Committee is reviewing PSA-based and risk-stratified screening (TRANSFORM trial) and has recommended a targeted programme for men with BRCA variants.",
    links: [
      { label: "NHS screening overview", url: "https://www.nhs.uk/conditions/nhs-screening/" },
      { label: "Breast screening", url: "https://www.nhs.uk/conditions/breast-screening-mammogram/" },
      { label: "Bowel cancer screening", url: "https://www.nhs.uk/conditions/bowel-cancer-screening/" },
      { label: "Cervical screening", url: "https://www.nhs.uk/conditions/cervical-screening/" },
      { label: "Lung cancer screening (Targeted Lung Health Checks)", url: "https://www.nhs.uk/conditions/lung-health-checks/" },
      { label: "UK National Screening Committee recommendations", url: "https://view-health-screening-recommendations.service.gov.uk/" },
    ],
  },
  {
    id: "genomics",
    title: "Genomic testing: the NHS Genomic Medicine Service and the National Genomic Test Directory",
    plain: "If your cancer is one where a gene test changes treatment, the NHS tests for it as standard through seven regional genomic laboratories. The list of what is tested for which cancer is public, so you can check whether your tumour should have been profiled.",
    detail: "The NHS Genomic Medicine Service (launched 2018, the first national system of its kind) delivers tumour and germline testing through seven Genomic Laboratory Hubs in England, with equivalent services in Scotland, Wales (All Wales Medical Genomics Service) and Northern Ireland. The National Genomic Test Directory, updated annually, lists every funded test by cancer type: small and large panels for solid tumours; fusion panels for lung and sarcoma; whole genome sequencing for sarcoma, paediatric cancers, acute leukaemias and some CNS tumours; germline BRCA and Lynch testing with eligibility criteria; and pharmacogenomic tests such as DPYD before fluoropyrimidines. Turnaround targets are 14 to 21 days for panels. Liquid biopsy (ctDNA) for lung cancer mutations was added in 2024-25 after a national pilot. Ask your team which tests were requested and whether your tumour meets the criteria for a large panel or WGS; a companion diagnostic named in a NICE TA (e.g. HER2, PD-L1, FRα, CLDN18.2) must be available where the drug is.",
    links: [
      { label: "NHS Genomic Medicine Service", url: "https://www.england.nhs.uk/genomics/nhs-genomic-med-service/" },
      { label: "National Genomic Test Directory", url: "https://www.england.nhs.uk/publication/national-genomic-test-directories/" },
      { label: "Genomics England", url: "https://www.genomicsengland.co.uk/" },
    ],
  },
  {
    id: "trials",
    title: "Clinical trials: NIHR, Be Part of Research, and how to ask",
    plain: "Around one in eight NHS cancer patients joins a clinical trial. You can search for trials yourself and ask your oncologist to refer you to the trial site, which may be a different hospital. Trials give free access to drugs the NHS does not yet fund.",
    detail: "The National Institute for Health and Care Research (NIHR) funds the research infrastructure in every NHS trust in England, with parallel bodies in Scotland (NHS Research Scotland), Wales (Health and Care Research Wales) and Northern Ireland. The NIHR Be Part of Research service and Cancer Research UK's trial finder both list open UK cancer trials by cancer type and location. Experimental Cancer Medicine Centres (ECMCs, 17 adult and a paediatric network) run early-phase trials of new drugs. Your oncologist can refer you to any UK trial site; travel costs may be reimbursed by the trial. Ask specifically whether a trial is open for your cancer at your line of treatment, and whether a molecular profiling study (e.g. DETERMINE for rare cancers, or TARGET National) could open drug-matched options. Compassionate access outside trials is via the MHRA's Early Access to Medicines Scheme (EAMS) or company-funded named-patient programmes.",
    links: [
      { label: "NIHR Be Part of Research", url: "https://bepartofresearch.nihr.ac.uk/" },
      { label: "Cancer Research UK trial finder", url: "https://www.cancerresearchuk.org/about-cancer/find-a-clinical-trial" },
      { label: "Experimental Cancer Medicine Centres", url: "https://www.ecmcnetwork.org.uk/" },
      { label: "MHRA Early Access to Medicines Scheme", url: "https://www.gov.uk/guidance/apply-for-the-early-access-to-medicines-scheme-eams" },
    ],
  },
  {
    id: "private",
    title: "Private and self-funded treatment, and how it fits with NHS care",
    plain: "You can pay privately for a drug the NHS will not fund and still receive the rest of your care on the NHS. The private drug must be given separately, but you cannot be removed from NHS care for paying for something extra. Many private hospitals host NHS consultants and can run trials too.",
    detail: "Since the 2009 Richards review, NHS patients in England may pay for additional private drugs ('top-ups') without losing NHS entitlement, provided the private element is delivered separately (different appointment or setting) so that NHS resources do not subsidise it. Private medical insurance typically covers licensed cancer drugs regardless of NICE status, subject to policy limits, and a growing share of new drugs are first used in the UK in the private sector. Self-funding costs are high: a year of a modern immunotherapy or ADC at list price is often £50,000 to £150,000, though some companies offer patient access schemes. Private hospital groups offer proton therapy, tumour treating fields and drugs NICE has rejected. A private consultation for a second opinion or a specific test can be followed by an NHS referral back; NHS consultants will accept privately obtained scans and genomics. Discuss any private element with your NHS team so records stay complete and drug interactions are managed.",
    links: [
      { label: "Guidance on NHS patients who wish to pay for additional private care", url: "https://www.gov.uk/government/publications/guidance-on-nhs-patients-who-wish-to-pay-for-additional-private-care" },
      { label: "Macmillan: private treatment", url: "https://www.macmillan.org.uk/cancer-information-and-support/treatment/getting-treatment/private-treatment" },
    ],
  },
  {
    id: "prescriptions",
    title: "Free prescriptions and help with NHS costs",
    plain: "If you have cancer in England you can get all your NHS prescriptions free, not only cancer drugs, with a medical exemption certificate your GP or oncologist signs. Prescriptions are already free for everyone in Scotland, Wales and Northern Ireland. Hospital-administered cancer drugs are always free.",
    detail: "Since April 2009 people undergoing treatment for cancer, the effects of cancer, or the effects of cancer treatment are entitled to a five-year medical exemption certificate (form FP92A, signed by a GP or hospital doctor) that covers all NHS prescriptions in England. The certificate can be renewed while any of those conditions applies. Wigs and fabric supports are free on the NHS in Wales and Scotland and on low income in England; dental treatment and sight tests may be free on income grounds. Hospital car parking must be free for frequent outpatient attenders including cancer patients in England (since 2020), and is free in Wales and Scotland. Travel to hospital may be reimbursed under the Healthcare Travel Costs Scheme if you receive qualifying benefits, and some Cancer Alliances and charities run transport services.",
    links: [
      { label: "NHS: free prescriptions and medical exemption certificates", url: "https://www.nhs.uk/nhs-services/prescriptions/free-nhs-prescriptions/" },
      { label: "Healthcare Travel Costs Scheme", url: "https://www.nhs.uk/nhs-services/help-with-health-costs/healthcare-travel-costs-scheme-htcs/" },
      { label: "Macmillan: help with health costs", url: "https://www.macmillan.org.uk/cancer-information-and-support/get-help/financial-help" },
    ],
  },
  {
    id: "benefits",
    title: "Money: PIP, Universal Credit, sick pay, Macmillan grants and the special rules for terminal illness",
    plain: "Cancer usually costs money: lost income, travel, heating. You may be able to claim Personal Independence Payment (or Attendance Allowance over state pension age), get faster and higher payments under the special rules if a clinician says you may have less than 12 months, and receive one-off grants from Macmillan and other charities.",
    detail: "Personal Independence Payment (PIP; Adult Disability Payment in Scotland) is not means-tested and pays roughly £70 to £190 a week depending on how cancer or its treatment affects daily living and mobility. If a clinician completes an SR1 form stating you may have 12 months or less to live, claims for PIP, Universal Credit, Employment and Support Allowance and Attendance Allowance are fast-tracked, paid at the highest rate and not subject to a face-to-face assessment. Employees are entitled to Statutory Sick Pay for up to 28 weeks, and cancer counts as a disability under the Equality Act from diagnosis, giving rights to reasonable adjustments and protection from dismissal. Macmillan grants (typically a few hundred pounds) help with heating, clothing and travel; Macmillan's welfare rights advisers and Citizens Advice can complete benefit forms with you. Carers may claim Carer's Allowance. Young people have specific support through Teenage Cancer Trust and Young Lives vs Cancer, which pays a registration grant.",
    links: [
      { label: "GOV.UK: Personal Independence Payment", url: "https://www.gov.uk/pip" },
      { label: "GOV.UK: special rules for end of life (SR1)", url: "https://www.gov.uk/government/publications/dwp-factual-medical-reports-guidance-for-healthcare-professionals/special-rules-for-end-of-life" },
      { label: "Macmillan grants", url: "https://www.macmillan.org.uk/cancer-information-and-support/get-help/financial-help/macmillan-grants" },
      { label: "Macmillan: benefits and financial support", url: "https://www.macmillan.org.uk/cancer-information-and-support/get-help/financial-help/benefits" },
    ],
  },
  {
    id: "palliative",
    title: "Palliative care and hospices",
    plain: "Palliative care is symptom control and support at any stage of cancer, not only at the end of life, and you can have it alongside active treatment. Hospice care is free, mostly charity-run with part NHS funding, and includes home visits, day services and inpatient stays.",
    detail: "Every NHS cancer centre has a specialist palliative care team (consultants in palliative medicine, nurses, sometimes pharmacists and social workers) who can be involved from diagnosis for pain, breathlessness, nausea and psychological distress; early palliative care improves quality of life and in some trials survival. Community palliative care is delivered by district nurses, GPs, Marie Curie nurses and hospice-at-home teams. The UK's 200-plus hospices are mostly charities receiving roughly a third of their funding from the NHS; care is free to patients. Advance care planning (ReSPECT forms, lasting power of attorney, preferred place of care) is offered and recorded on shared records. Fast-track NHS Continuing Healthcare funding covers a package of care at home or in a care home when someone is rapidly deteriorating. Children's palliative care is coordinated through Together for Short Lives.",
    links: [
      { label: "NHS: end of life care", url: "https://www.nhs.uk/conditions/end-of-life-care/" },
      { label: "Hospice UK: find a hospice", url: "https://www.hospiceuk.org/" },
      { label: "Marie Curie", url: "https://www.mariecurie.org.uk/" },
      { label: "NICE NG142: end of life care for adults", url: "https://www.nice.org.uk/guidance/ng142" },
    ],
  },
  {
    id: "second-opinion",
    title: "Second opinions and choosing where to be treated",
    plain: "You can ask for a second opinion within the NHS and you can ask to be treated at a different hospital, including a specialist centre. There is no legal right to a second opinion, but it is rarely refused, and your own consultant or GP can arrange it.",
    detail: "Under the NHS Constitution you have a right to choose the provider for your first outpatient appointment after GP referral, and once in cancer care your MDT can refer you to any NHS specialist centre for an opinion or treatment. A second opinion is usually arranged by your consultant or GP with a copy of your notes and imaging; specialist centres such as The Royal Marsden and The Christie receive many. For rare cancers, ask whether your case has been discussed at a national or supra-regional MDT (e.g. sarcoma, neuro-oncology, ocular melanoma, thymic tumours). Patients sometimes seek a private second opinion for speed and then continue on the NHS. If you feel you have been refused reasonable care, the Patient Advice and Liaison Service (PALS) at each trust and Macmillan's support line can help you make the request.",
    links: [
      { label: "NHS: how to get a second opinion", url: "https://www.nhs.uk/nhs-services/gps/how-to-get-a-second-opinion/" },
      { label: "NHS Constitution for England", url: "https://www.gov.uk/government/publications/the-nhs-constitution-for-england" },
      { label: "Macmillan: getting a second opinion", url: "https://www.macmillan.org.uk/cancer-information-and-support/treatment/preparing-for-treatment/getting-a-second-opinion" },
    ],
  },
  {
    id: "help",
    title: "Where to get help now: Macmillan, Cancer Research UK nurses, Maggie's",
    plain: "Three free services answer questions and support anyone affected by cancer in the UK: Macmillan's support line (0808 808 00 00, 8am to 8pm every day), Cancer Research UK's nurse helpline (0808 800 4040, weekdays), and Maggie's centres next to major cancer hospitals where you can walk in without an appointment.",
    detail: "Macmillan Cancer Support runs the largest network: a support line staffed by nurses, welfare rights advisers, financial guides and work-support specialists; an online community; Macmillan nurses and information centres in most cancer hospitals; and grants. Cancer Research UK's nurse helpline answers questions about diagnosis, treatment, trials and evidence, and its Cancer Chat forum is moderated by nurses. Maggie's has more than 20 walk-in centres at major UK cancer hospitals offering psychological support, benefits advice, exercise and relaxation classes and a kitchen table, plus online support. Cancer-specific charities (Breast Cancer Now, Prostate Cancer UK, Bowel Cancer UK, Roy Castle Lung Cancer Foundation, Blood Cancer UK, Myeloma UK, Pancreatic Cancer UK, The Brain Tumour Charity, Sarcoma UK, Teenage Cancer Trust and many others) run helplines with specialist nurses. Mental health support is available via NHS Talking Therapies and, in many centres, clinical psychology within the cancer service.",
    links: [
      { label: "Macmillan Cancer Support", url: "https://www.macmillan.org.uk/" },
      { label: "Cancer Research UK: nurse helpline and Cancer Chat", url: "https://www.cancerresearchuk.org/about-cancer/cancer-chat" },
      { label: "Maggie's centres", url: "https://www.maggies.org/" },
    ],
  },
];

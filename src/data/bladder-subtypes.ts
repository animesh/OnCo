/**
 * Bladder cancer subtypes (17 Sept 2026): non-muscle-invasive and muscle-invasive urothelial cancer as pages under the
 * bladder and urothelial record, because the two are managed by different specialists with different aims: keeping the
 * bladder tumour-free versus removing or sterilising the bladder. Facts follow the EAU and NCCN guidelines and the trials
 * named in each record. Registered in src/data/index.ts as bladderSubtypes.
 */
import type { CancerInput } from "@/lib/schema";

const asOf = "2026-09-17";
const W = (s: string) => `https://en.wikipedia.org/wiki/${s}`;
const tags = ["subtype-page"];

export const bladderSubtypes: CancerInput[] = [
  { id: "non-muscle-invasive-bladder-cancer", kind: "cancer", name: "Non-muscle-invasive bladder cancer", group: "genitourinary", parent: "urothelial", asOf, tags, wikipedia: W("Bladder_cancer"),
    aka: ["NMIBC", "Superficial bladder cancer", "Ta, T1 and carcinoma in situ of the bladder"],
    burden: "About three quarters of new bladder cancers; rarely fatal at this stage but it recurs in half of patients and progresses to muscle invasion in a fifth of the high-risk group, so years of cystoscopic surveillance make it one of the most expensive cancers to manage.",
    tldr: "Most bladder cancers are found while still confined to the lining. They are scraped out through the urethra and, when higher risk, treated with BCG instilled into the bladder; the challenge is the frequent recurrences and the patients whose tumours stop responding to BCG.",
    summary: "Non-muscle-invasive bladder cancer includes papillary tumours confined to the mucosa (Ta) or lamina propria (T1) and flat carcinoma in situ. It is diagnosed by cystoscopy and removed by transurethral resection, with a single immediate dose of intravesical chemotherapy for low-risk tumours. Intermediate- and high-risk disease receives induction and maintenance intravesical BCG, the oldest cancer immunotherapy in use, which halves recurrence and reduces progression. Tumours that recur despite adequate BCG are called BCG-unresponsive; radical cystectomy is the standard, and bladder-sparing alternatives have arrived: pembrolizumab (KEYNOTE-057), nadofaragene firadenovec, nogapendekin alfa inbakicept with BCG, the gemcitabine-releasing device TAR-200 and the oncolytic virus cretostimogene. Worldwide BCG shortages have pushed dose-reduction and chemotherapy substitutes into practice. Blue-light cystoscopy improves detection of flat lesions.",
    subtypes: ["Low-grade Ta papillary tumours (low risk)", "High-grade Ta and T1 tumours (high risk)", "Carcinoma in situ", "BCG-unresponsive disease", "Upper tract urothelial carcinoma of the renal pelvis and ureter (related)"],
    biomarkers: ["Grade and stage (EAU and AUA risk groups)", "Carcinoma in situ and lymphovascular invasion", "FGFR3 mutations (common in low-grade disease)", "Urinary biomarkers and cytology for surveillance", "Molecular subtypes under study"],
    standardOfCare: [
      { setting: "Diagnosis and resection", approach: "Cystoscopy, transurethral resection with muscle in the specimen, blue-light or enhanced imaging for carcinoma in situ; re-resection of T1 tumours.", refs: ["urothelial"] },
      { setting: "Low risk", approach: "Single immediate instillation of mitomycin or gemcitabine after resection; surveillance cystoscopy.", refs: ["mitomycin", "gemcitabine"] },
      { setting: "Intermediate and high risk", approach: "Induction and one to three years of maintenance BCG; intravesical chemotherapy when BCG is unavailable; early cystectomy for the highest-risk T1 disease.", refs: ["bcg-and-intravesical-therapy"] },
      { setting: "BCG-unresponsive", approach: "Radical cystectomy, or bladder-sparing treatment: pembrolizumab, nadofaragene firadenovec, nogapendekin alfa inbakicept with BCG, TAR-200, cretostimogene in trials and early approvals.", refs: ["cystectomy", "pembrolizumab", "nadofaragene-firadenovec", "nogapendekin-alfa-inbakicept", "tar-200", "cretostimogene"] },
    ],
    stateOfArt: ["BCG remains the standard forty years on, and shortages have shown how much depends on one biologic.", "Four bladder-sparing options for BCG-unresponsive disease have been approved or reached late trials since 2020, an unprecedented pace for this stage.", "Intravesical drug-releasing devices and gene therapies show that local delivery, not systemic drugs, is the frontier here."],
    history: [
      { year: 1976, title: "Morales reports intravesical BCG", refs: ["bcg-and-intravesical-therapy"] },
      { year: 1990, title: "BCG approved for carcinoma in situ of the bladder", refs: ["bcg-and-intravesical-therapy"] },
      { year: 2020, title: "Pembrolizumab approved for BCG-unresponsive carcinoma in situ", refs: ["pembrolizumab"] },
      { year: 2022, title: "Nadofaragene firadenovec: first gene therapy for bladder cancer", refs: ["nadofaragene-firadenovec"] },
      { year: 2024, title: "Nogapendekin alfa inbakicept with BCG approved", refs: ["nogapendekin-alfa-inbakicept"] },
    ],
    pipeline: ["tar-200", "cretostimogene"], openProblems: ["Recurrent BCG shortages.", "Predicting who will progress to muscle invasion.", "The burden and cost of lifelong cystoscopy.", "Comparing the new bladder-sparing options with each other and with cystectomy."],
    links: [{ label: "Wikipedia", url: W("Bladder_cancer") }] },
  { id: "muscle-invasive-bladder-cancer", kind: "cancer", name: "Muscle-invasive and advanced bladder cancer", group: "genitourinary", parent: "urothelial", asOf, tags, wikipedia: W("Bladder_cancer"),
    aka: ["MIBC", "Invasive urothelial carcinoma", "Metastatic urothelial carcinoma"],
    burden: "About a quarter of bladder cancers at diagnosis plus those that progress from superficial disease; half of patients with muscle invasion die of it within five years despite surgery, and metastatic disease had a median survival near a year until antibody-drug conjugates and immunotherapy changed it.",
    tldr: "Once bladder cancer has grown into the muscle it needs more than scraping out: chemotherapy then removal of the bladder, or chemoradiation to keep it. For cancer that has spread, the antibody-drug conjugate enfortumab vedotin with pembrolizumab has replaced platinum chemotherapy as the first treatment.",
    summary: "Muscle-invasive urothelial carcinoma is treated with cisplatin-based neoadjuvant chemotherapy followed by radical cystectomy and urinary diversion, or by trimodality bladder preservation (maximal resection plus chemoradiation) in suitable patients. Perioperative immunotherapy has entered practice: adjuvant nivolumab after cystectomy (CheckMate 274) and durvalumab with neoadjuvant chemotherapy and after surgery (NIAGARA), which improved overall survival. For metastatic disease, enfortumab vedotin with pembrolizumab nearly doubled survival compared with platinum chemotherapy (EV-302) and became the standard first-line treatment in 2023; erdafitinib is used for FGFR3-altered tumours, and platinum chemotherapy followed by avelumab maintenance remains an option. Molecular subtypes (luminal, basal) and circulating tumour DNA are being used to select who needs adjuvant treatment.",
    subtypes: ["Muscle-invasive, organ-confined (T2)", "Locally advanced (T3 to T4, node-positive)", "Metastatic urothelial carcinoma", "FGFR3-altered urothelial carcinoma", "Variant histologies (squamous, small cell, plasmacytoid, micropapillary)"],
    biomarkers: ["Cisplatin eligibility (kidney function, hearing, performance status)", "PD-L1 expression (selects immunotherapy in some settings)", "FGFR3 mutations and fusions (erdafitinib)", "Nectin-4 expression (near universal; enfortumab vedotin target)", "Circulating tumour DNA after cystectomy (adjuvant selection)"],
    standardOfCare: [
      { setting: "Muscle-invasive, cisplatin-eligible", approach: "Neoadjuvant cisplatin-based chemotherapy (dose-dense MVAC or gemcitabine-cisplatin) with durvalumab (NIAGARA), then radical cystectomy with lymph node dissection and adjuvant durvalumab; adjuvant nivolumab for high-risk residual disease (CheckMate 274).", refs: ["cisplatin", "gemcitabine", "durvalumab", "niagara", "cystectomy", "nivolumab", "checkmate-274"] },
      { setting: "Bladder preservation", approach: "Maximal transurethral resection followed by chemoradiation, with salvage cystectomy for recurrence, in patients with unifocal tumours and no carcinoma in situ or in those unfit for surgery.", refs: ["imrt-igrt", "radiosensitisers", "cisplatin"] },
      { setting: "Metastatic, first line", approach: "Enfortumab vedotin plus pembrolizumab (EV-302); gemcitabine-platinum followed by avelumab maintenance where the combination is unavailable.", refs: ["enfortumab-vedotin", "pembrolizumab", "ev-302"] },
      { setting: "Later lines", approach: "Erdafitinib for FGFR3 alterations; platinum chemotherapy or enfortumab vedotin if not given first line; clinical trials.", refs: ["erdafitinib", "fgfr3-receptor", "enfortumab-vedotin"] },
    ],
    stateOfArt: ["EV-302 was the first trial in forty years to beat platinum chemotherapy first line, and it did so by a wide margin.", "Perioperative immunotherapy now improves survival around cystectomy, and circulating tumour DNA promises to select who needs it.", "Bladder preservation with chemoradiation gives survival similar to cystectomy in selected patients and is under-used."],
    history: [
      { year: 1985, title: "MVAC chemotherapy established for advanced disease", refs: ["cisplatin"] },
      { year: 2003, title: "Neoadjuvant MVAC improves survival before cystectomy (SWOG 8710)", refs: ["cisplatin"] },
      { year: 2016, title: "Atezolizumab: first immunotherapy approval in bladder cancer" },
      { year: 2019, title: "Erdafitinib: first targeted drug for FGFR3-altered urothelial cancer", refs: ["erdafitinib"] },
      { year: 2021, title: "Adjuvant nivolumab (CheckMate 274)", refs: ["checkmate-274"] },
      { year: 2023, title: "EV-302: enfortumab vedotin plus pembrolizumab replaces platinum first line", refs: ["ev-302"] },
      { year: 2024, title: "NIAGARA: perioperative durvalumab improves survival", refs: ["niagara"] },
    ],
    pipeline: ["durvalumab","erdafitinib","enfortumab-vedotin"], openProblems: ["Cisplatin-ineligible patients still have fewer options.", "Choosing between cystectomy and bladder preservation lacks randomised evidence.", "Variant histologies are excluded from most trials.", "Cost and access to antibody-drug conjugates."],
    links: [{ label: "Wikipedia", url: W("Bladder_cancer") }] },
];

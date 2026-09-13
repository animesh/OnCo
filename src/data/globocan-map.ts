/**
 * Maps OnCo cancer ids to GLOBOCAN 2022 cancer codes (see public/globocan/countries.json → cancers).
 *
 * GLOBOCAN reports by anatomical site (ICD-10), not by molecular subtype or histology, so several OnCo
 * cancers share one site total and a few have no direct estimate at all. Every such case is stated in
 * `note` and surfaced on the page as a data gap rather than silently approximated.
 *
 *  codes: one code, or several codes that are summed (mutually exclusive ICD ranges, so counts and
 *         age-standardised rates add; cumulative risk does not and is left blank for sums).
 *  shared: true when the site total is shared with other OnCo cancers (subtype split unavailable).
 */
export type GlobocanMapping = { codes: number[]; label: string; note?: string; shared?: boolean };

export const GLOBOCAN_MAP: Record<string, GlobocanMapping> = {
  tnbc: { codes: [20], label: "Breast (all subtypes)", shared: true, note: "GLOBOCAN reports breast cancer as one site. TNBC is roughly 10-15% of cases; the figures shown are for all breast cancer." },
  "breast-hr-positive": { codes: [20], label: "Breast (all subtypes)", shared: true, note: "GLOBOCAN reports breast cancer as one site. HR+/HER2- disease is roughly 70% of cases; the figures shown are for all breast cancer." },
  "breast-her2-positive": { codes: [20], label: "Breast (all subtypes)", shared: true, note: "GLOBOCAN reports breast cancer as one site. HER2+ disease is roughly 15-20% of cases; the figures shown are for all breast cancer." },
  nsclc: { codes: [15], label: "Trachea, bronchus and lung", shared: true, note: "GLOBOCAN does not split lung cancer by histology. NSCLC is roughly 85% of lung cancer; figures are for all lung cancer." },
  sclc: { codes: [15], label: "Trachea, bronchus and lung", shared: true, note: "GLOBOCAN does not split lung cancer by histology. SCLC is roughly 15% of lung cancer; figures are for all lung cancer." },
  colorectal: { codes: [41], label: "Colorectum (colon, rectum, anus)" },
  pancreatic: { codes: [13], label: "Pancreas" },
  gastric: { codes: [7], label: "Stomach" },
  esophageal: { codes: [6], label: "Oesophagus" },
  hcc: { codes: [11], label: "Liver and intrahepatic bile ducts", shared: true, note: "ICD-10 C22 combines hepatocellular carcinoma with intrahepatic cholangiocarcinoma (HCC is roughly 75-85% of the total)." },
  cholangiocarcinoma: { codes: [], label: "No direct estimate", note: "Intrahepatic cholangiocarcinoma is inside the liver total (C22); gallbladder cancer (C23) is reported separately; extrahepatic bile duct cancer (C24) is not reported as its own site. No country-level estimate exists for biliary tract cancer as OnCo defines it." },
  prostate: { codes: [27], label: "Prostate" },
  urothelial: { codes: [30], label: "Bladder", note: "Upper-tract urothelial cancers (renal pelvis, ureter) are not included in the bladder site." },
  rcc: { codes: [29], label: "Kidney", note: "The kidney site (C64) includes all renal parenchymal cancers; RCC is over 90%." },
  ovarian: { codes: [25], label: "Ovary" },
  endometrial: { codes: [24], label: "Corpus uteri" },
  cervical: { codes: [23], label: "Cervix uteri" },
  melanoma: { codes: [16], label: "Melanoma of skin", note: "Uveal and mucosal melanoma are not included." },
  glioblastoma: { codes: [31], label: "Brain, central nervous system", shared: true, note: "All brain and CNS tumours combined; glioblastoma is roughly half of malignant gliomas and GLOBOCAN does not report grade or IDH status." },
  "head-and-neck": { codes: [1, 2, 3, 4, 5, 14], label: "Head and neck (lip/oral, salivary, oro-, naso-, hypopharynx, larynx)", note: "Sum of six GLOBOCAN sites. Counts and age-standardised rates add; cumulative risk is left blank." },
  sarcoma: { codes: [], label: "No direct estimate", note: "GLOBOCAN reports Kaposi sarcoma only; soft-tissue and bone sarcomas fall under 'other specified cancers' and cannot be separated." },
  thyroid: { codes: [32], label: "Thyroid" },
  neuroendocrine: { codes: [], label: "No direct estimate", note: "Neuroendocrine tumours are reported under their organ of origin (pancreas, lung, small intestine) and cannot be separated." },
  mesothelioma: { codes: [18], label: "Mesothelioma" },
  neuroblastoma: { codes: [], label: "No direct estimate", note: "Neuroblastoma is grouped under 'other specified cancers'; GLOBOCAN has no paediatric tumour-type breakdown. See IARC's International Incidence of Childhood Cancer instead." },
  aml: { codes: [36], label: "Leukaemia (all types)", shared: true, note: "GLOBOCAN reports leukaemia as one site; AML is roughly a quarter of cases worldwide." },
  "all-leukemia": { codes: [36], label: "Leukaemia (all types)", shared: true, note: "GLOBOCAN reports leukaemia as one site; ALL is the commonest childhood cancer but a minority of adult leukaemia." },
  cll: { codes: [36], label: "Leukaemia (all types)", shared: true, note: "GLOBOCAN reports leukaemia as one site; CLL is roughly a quarter of leukaemia in Western countries and rare in East Asia." },
  dlbcl: { codes: [34], label: "Non-Hodgkin lymphoma (all subtypes)", shared: true, note: "GLOBOCAN reports NHL as one site; DLBCL is roughly 30-40% of cases." },
  "hodgkin-lymphoma": { codes: [33], label: "Hodgkin lymphoma" },
  "multiple-myeloma": { codes: [35], label: "Multiple myeloma" },
  gallbladder: { codes: [12], label: "Gallbladder" },
  "kaposi-sarcoma": { codes: [19], label: "Kaposi sarcoma" },
  vulvar: { codes: [21], label: "Vulva" },
  vaginal: { codes: [22], label: "Vagina" },
  penile: { codes: [26], label: "Penis" },
  testicular: { codes: [28], label: "Testis" },
  "basal-cell-carcinoma": { codes: [17], label: "Non-melanoma skin cancer", shared: true, note: "GLOBOCAN counts all non-melanoma skin cancers together and many registries under-record them; basal cell and cutaneous squamous cell carcinoma share this total." },
  "cutaneous-scc": { codes: [17], label: "Non-melanoma skin cancer", shared: true, note: "GLOBOCAN counts all non-melanoma skin cancers together and many registries under-record them; basal cell and cutaneous squamous cell carcinoma share this total." },
};

/** The special "all cancers excluding non-melanoma skin cancer" code. */
export const ALL_CANCERS_CODE = 39;

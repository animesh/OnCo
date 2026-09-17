/**
 * Parent cancer pages (17 Sept 2026): breast, lung, leukaemia and biliary tract cancer as overview records so their subtype
 * pages hang off a page that lists them, following the owner's rule that every family shows its types at the top. Each
 * overview stays short on treatment detail and points to the subtype pages that carry it. Registered in src/data/index.ts.
 */
import type { CancerInput } from "@/lib/schema";

const asOf = "2026-09-17";
const W = (s: string) => `https://en.wikipedia.org/wiki/${s}`;
const tags = ["parent-page"];

export const cancerParentsWave2: CancerInput[] = [
  { id: "breast-cancer", kind: "cancer", name: "Breast cancer (all types)", group: "breast", asOf, tags, wikipedia: W("Breast_cancer"),
    aka: ["Breast carcinoma", "Carcinoma of the breast"],
    burden: "The commonest cancer worldwide, with about 2.3 million new cases and 670,000 deaths a year; in high-income countries about nine in ten women diagnosed are alive five years later.",
    tldr: "Breast cancer is not one disease. Which of three receptor patterns the tumour carries decides its treatment: hormone receptor-positive (about 70 percent), HER2-positive (about 15 percent) or triple-negative (about 15 percent). The pages for each type hold the detail; this page holds what they share.",
    summary: "Breast cancer arises from the milk ducts or lobules and is classified by the receptors on its cells: oestrogen and progesterone receptors, and HER2. Hormone receptor-positive, HER2-negative disease is treated with endocrine therapy and CDK4/6 inhibitors; HER2-positive disease with HER2 antibodies and antibody-drug conjugates; triple-negative disease with chemotherapy, immunotherapy and, for BRCA carriers, PARP inhibitors. Ductal carcinoma in situ is a precursor confined to the duct, and about one percent of cases occur in men. Screening mammography from around age 50, breast-conserving surgery with radiotherapy, sentinel node biopsy and genomic tests that spare chemotherapy are common to all types. Most patients present early and are cured; metastatic disease is treatable for years but rarely curable.",
    subtypes: ["HR-positive / HER2-negative breast cancer", "HER2-positive breast cancer", "Triple-negative breast cancer (TNBC)", "Ductal carcinoma in situ (DCIS)", "Male breast cancer", "Invasive lobular carcinoma", "Inflammatory breast cancer"],
    biomarkers: ["Oestrogen and progesterone receptors", "HER2 (including HER2-low)", "Ki-67 and grade", "Genomic recurrence scores (Oncotype DX, MammaPrint)", "BRCA1/2 and other germline variants", "PD-L1 (triple-negative)", "ESR1 and PIK3CA mutations (advanced hormone receptor-positive)"],
    standardOfCare: [
      { setting: "Screening", approach: "Mammography every one to three years from around age 40 to 50 depending on country; MRI for high-risk women.", refs: ["mammography"] },
      { setting: "Early disease, all types", approach: "Breast-conserving surgery with radiotherapy or mastectomy, sentinel node biopsy, then treatment by receptor type on the subtype pages.", refs: ["breast-hr-positive", "breast-her2-positive", "tnbc", "hypofractionated-radiotherapy"] },
      { setting: "Ductal carcinoma in situ", approach: "Surgery with or without radiotherapy and endocrine therapy; active surveillance under study.", refs: ["ductal-carcinoma-in-situ"] },
    ],
    stateOfArt: ["Five-year survival above 90 percent in early disease across high-income countries, driven by screening, endocrine therapy and HER2-targeted drugs.", "Antibody-drug conjugates such as trastuzumab deruxtecan have redrawn the HER2 boundary and moved into HER2-low disease.", "Genomic tests spare most node-negative hormone receptor-positive patients chemotherapy.", "Omission of radiotherapy in older low-risk women and one-week hypofractionation are reducing treatment burden."],
    history: [
      { year: 1894, title: "Halsted radical mastectomy", note: "The standard operation for seventy years." },
      { year: 1977, title: "Tamoxifen approved", note: "The first targeted hormonal therapy for breast cancer.", refs: ["tamoxifen"] },
      { year: 1985, title: "NSABP B-06: lumpectomy plus radiotherapy equals mastectomy" },
      { year: 1998, title: "Trastuzumab approved", note: "The first HER2-targeted antibody.", refs: ["trastuzumab"] },
      { year: 2000, title: "Molecular subtypes described", note: "Perou and Sorlie's expression profiling defines luminal, HER2-enriched and basal-like breast cancers." },
      { year: 2015, title: "CDK4/6 inhibitors approved", refs: ["palbociclib"] },
      { year: 2022, title: "Trastuzumab deruxtecan in HER2-low disease", refs: ["trastuzumab-deruxtecan"] },
    ],
    pipeline: ["trastuzumab-deruxtecan","datopotamab-deruxtecan","oral-serds"], openProblems: ["Metastatic disease remains incurable for almost everyone.", "Triple-negative and inflammatory breast cancer still have the worst outlook.", "Overdiagnosis from screening and overtreatment of low-risk DCIS.", "Survival gaps between countries and between Black and white women in the same country."],
    links: [{ label: "Wikipedia", url: W("Breast_cancer") }, { label: "NCI PDQ", url: "https://www.cancer.gov/types/breast" }] },
  { id: "lung-cancer", kind: "cancer", name: "Lung cancer (all types)", group: "thoracic", asOf, tags, wikipedia: W("Lung_cancer"),
    aka: ["Bronchogenic carcinoma", "Lung carcinoma"],
    burden: "The leading cause of cancer death worldwide, with about 2.5 million new cases and 1.8 million deaths a year; most cases are caused by smoking, and survival depends heavily on the stage at diagnosis.",
    tldr: "Lung cancer splits into non-small-cell (about 85 percent) and small-cell (about 15 percent) disease, which behave and are treated very differently. The subtype pages carry the detail; this page covers screening, staging and what the types share.",
    summary: "Lung cancer is divided by histology into non-small-cell lung cancer, itself split into adenocarcinoma, squamous and large-cell carcinoma, and small-cell lung cancer, a fast-growing neuroendocrine tumour almost always linked to smoking. Non-small-cell disease has more than a dozen targetable driver mutations and is treated with surgery, radiotherapy, targeted drugs and immunotherapy by stage and biology; small-cell disease is treated with chemotherapy, immunotherapy and radiotherapy and relapses quickly. Low-dose CT screening of heavy smokers cuts lung cancer deaths by about a fifth, and tobacco control remains the largest lever. Mesothelioma and thymic tumours are separate thoracic cancers.",
    subtypes: ["Non-small-cell lung cancer (adenocarcinoma, squamous, large cell)", "Small-cell lung cancer", "Carcinoid and other neuroendocrine tumours of the lung", "Pleuropulmonary blastoma (childhood)"],
    biomarkers: ["EGFR, ALK, ROS1, KRAS G12C, BRAF V600E, MET exon 14, RET, NTRK, HER2 mutations (non-small-cell)", "PD-L1 expression", "Stage by TNM and PET-CT", "Circulating tumour DNA for minimal residual disease"],
    standardOfCare: [
      { setting: "Screening", approach: "Annual low-dose CT for people aged about 50 to 80 with a heavy smoking history (NLST, NELSON).", refs: ["nlst-nelson"] },
      { setting: "Diagnosis and staging", approach: "CT, PET-CT, bronchoscopy or CT-guided biopsy, endobronchial ultrasound of nodes, brain MRI; molecular testing on every non-squamous non-small-cell tumour.", refs: ["nsclc", "pet"] },
      { setting: "Treatment", approach: "By type and stage on the subtype pages: surgery or stereotactic radiotherapy for early disease, chemoradiation with immunotherapy for locally advanced, targeted or immune therapy for metastatic disease.", refs: ["nsclc", "sclc", "sbrt"] },
    ],
    stateOfArt: ["Immunotherapy and targeted drugs have doubled or tripled survival in metastatic non-small-cell disease over a decade.", "CT screening is now recommended in the US, UK and much of Europe but uptake is low.", "Small-cell lung cancer has gained immunotherapy and the DLL3 T-cell engager tarlatamab after decades without progress."],
    history: [
      { year: 1950, title: "Doll and Hill link smoking to lung cancer" },
      { year: 2004, title: "EGFR mutations explain gefitinib responses", refs: ["gefitinib"] },
      { year: 2011, title: "NLST: CT screening cuts lung cancer deaths by 20 percent", refs: ["nlst-nelson"] },
      { year: 2015, title: "Nivolumab approved: immunotherapy enters lung cancer", refs: ["nivolumab"] },
      { year: 2024, title: "Tarlatamab: first targeted drug for small-cell lung cancer", refs: ["tarlatamab"] },
    ],
    pipeline: ["tarlatamab","datopotamab-deruxtecan"], openProblems: ["Most patients still present with advanced disease.", "Resistance to every targeted drug emerges within one to three years.", "Screening reaches a small fraction of those eligible.", "Small-cell lung cancer survival remains under a year for most with extensive disease."],
    links: [{ label: "Wikipedia", url: W("Lung_cancer") }, { label: "NCI PDQ", url: "https://www.cancer.gov/types/lung" }] },
  { id: "leukaemia", kind: "cancer", name: "Leukaemia (all types)", group: "haematologic", asOf, tags, wikipedia: W("Leukemia"),
    aka: ["Leukemia", "Blood cancer (leukaemias)"],
    burden: "About 490,000 new cases and 300,000 deaths a year worldwide; the commonest cancer of childhood, where most cases are now cured, and a group of very different diseases in adults.",
    tldr: "Leukaemia means cancer of the blood-forming cells, but the four main types share little beyond the name: acute lymphoblastic and acute myeloid leukaemia are emergencies treated with intensive therapy, while chronic lymphocytic and chronic myeloid leukaemia are slow diseases controlled for years with pills. Each has its own page.",
    summary: "Leukaemias arise when a blood stem cell or its progeny acquires mutations that block maturation and drive proliferation, flooding the marrow and blood with abnormal cells. They are classified by speed (acute or chronic) and lineage (lymphoid or myeloid). Acute lymphoblastic leukaemia is the commonest childhood cancer and is cured in about 90 percent of children; acute myeloid leukaemia is mainly a disease of older adults treated with intensive chemotherapy, venetoclax combinations and transplant; chronic lymphocytic leukaemia is often watched for years and then controlled with BTK and BCL2 inhibitors; chronic myeloid leukaemia became the model of targeted therapy with imatinib. Rarer forms include hairy cell leukaemia and chronic myelomonocytic leukaemia. CAR-T cells and bispecific antibodies are changing the acute leukaemias.",
    subtypes: ["Acute lymphoblastic leukaemia (ALL)", "Acute myeloid leukaemia (AML)", "Chronic lymphocytic leukaemia (CLL)", "Chronic myeloid leukaemia (CML)", "Hairy cell leukaemia", "Chronic myelomonocytic leukaemia (CMML)", "Blastic plasmacytoid dendritic cell neoplasm (BPDCN)"],
    biomarkers: ["Flow cytometry immunophenotype", "Cytogenetics and fusion genes (BCR-ABL1, PML-RARA, KMT2A)", "Mutations (FLT3, NPM1, IDH1/2, TP53, IGHV status)", "Measurable residual disease by flow or PCR"],
    standardOfCare: [
      { setting: "Diagnosis", approach: "Blood count and film, bone marrow aspirate and biopsy, flow cytometry, cytogenetics and molecular panel; the subtype then sets the pathway.", refs: ["flow-cytometry-mrd", "cytogenetics-fish"] },
      { setting: "Treatment", approach: "By type on the subtype pages: intensive chemotherapy and transplant for acute leukaemias, tyrosine kinase inhibitors for CML, BTK and BCL2 inhibitors for CLL.", refs: ["all-leukemia", "aml", "cll", "cml"] },
      { setting: "Supportive care", approach: "Growth factor support, transfusion, infection prevention and tumour lysis prophylaxis around intensive treatment.", refs: ["g-csf-growth-factors", "transfusion-support"] },
    ],
    stateOfArt: ["Childhood ALL cure rates near 90 percent through risk-adapted chemotherapy and measurable residual disease monitoring.", "CML patients live near-normal lifespans on tyrosine kinase inhibitors, and many can stop treatment.", "Venetoclax made AML treatable in older adults; CAR-T and blinatumomab rescued relapsed ALL.", "Treatment-free remission and measurable residual disease guide therapy across the chronic leukaemias."],
    history: [
      { year: 1845, title: "Virchow names leukaemia", note: "White blood in a patient's vessels described as a disease of the blood itself." },
      { year: 1948, title: "Farber induces remissions in childhood ALL with aminopterin" },
      { year: 1960, title: "Philadelphia chromosome discovered in CML" },
      { year: 2001, title: "Imatinib approved", note: "The first kinase inhibitor and the model for targeted therapy.", refs: ["imatinib"] },
      { year: 2017, title: "Tisagenlecleucel: the first CAR-T approval, for childhood ALL", refs: ["tisagenlecleucel"] },
    ],
    pipeline: ["menin-inhibitors","car-t"], openProblems: ["Adult ALL and TP53-mutated AML still have poor outcomes.", "Infant and relapsed childhood leukaemias.", "Access to CAR-T and transplant outside rich countries.", "Late effects of childhood treatment."],
    links: [{ label: "Wikipedia", url: W("Leukemia") }, { label: "NCI PDQ", url: "https://www.cancer.gov/types/leukemia" }] },
  { id: "biliary-tract-cancer", kind: "cancer", name: "Biliary tract cancer (all types)", group: "gastrointestinal", asOf, tags, wikipedia: W("Biliary_tract_cancer"),
    aka: ["Biliary cancer", "Cancers of the bile ducts, gallbladder and ampulla"],
    burden: "Around 200,000 cases a year worldwide, rare in the West and common in parts of Asia and South America; most present late and five-year survival is under 20 percent overall.",
    tldr: "Biliary tract cancers arise in the bile ducts inside or outside the liver, the gallbladder or the ampulla where the duct meets the bowel. They share a poor outlook and the same first-line chemotherapy with immunotherapy, but differ in causes and in the targetable mutations they carry. Each has its own page.",
    summary: "Biliary tract cancers are adenocarcinomas of the bile duct system. Intrahepatic cholangiocarcinoma arises within the liver, perihilar and distal cholangiocarcinoma along the main ducts, gallbladder cancer in the gallbladder and ampullary cancer at the junction with the duodenum. Causes include liver fluke infection, primary sclerosing cholangitis, gallstones and, in Chile and India, a high background rate of gallbladder cancer. Surgery is the only cure and is possible in a minority; gemcitabine-cisplatin with durvalumab or pembrolizumab is the first-line treatment for advanced disease, and intrahepatic tumours often carry FGFR2 fusions or IDH1 mutations with approved targeted drugs. The subtype pages carry the detail.",
    subtypes: ["Cholangiocarcinoma (intrahepatic, perihilar and distal bile duct)", "Gallbladder cancer", "Ampullary cancer (ampulla of Vater)"],
    biomarkers: ["FGFR2 fusions and IDH1 mutations (intrahepatic)", "HER2 amplification (gallbladder, extrahepatic)", "Microsatellite instability", "CA 19-9"],
    standardOfCare: [
      { setting: "Resectable disease", approach: "Surgery followed by six months of capecitabine (BILCAP).", refs: ["bilcap", "capecitabine"] },
      { setting: "Advanced disease", approach: "Gemcitabine-cisplatin with durvalumab (TOPAZ-1) or pembrolizumab; targeted therapy for FGFR2 and IDH1 alterations on progression.", refs: ["cholangiocarcinoma", "gemcitabine", "cisplatin", "durvalumab"] },
      { setting: "Second line by biology", approach: "Pemigatinib or futibatinib for FGFR2 fusions, ivosidenib for IDH1 mutations, FOLFOX otherwise.", refs: ["pemigatinib", "futibatinib", "ivosidenib", "oxaliplatin"] },
    ],
    stateOfArt: ["Immunotherapy added to chemotherapy improved survival for the first time in a decade (TOPAZ-1, KEYNOTE-966).", "FGFR2 and IDH1 inhibitors made intrahepatic cholangiocarcinoma a model for molecular selection in a rare cancer.", "Liver transplantation for selected perihilar tumours and liver-directed therapy for intrahepatic disease are expanding."],
    history: [
      { year: 1965, title: "Klatskin describes perihilar cholangiocarcinoma" },
      { year: 2010, title: "ABC-02: gemcitabine-cisplatin becomes standard", refs: ["abc-02"] },
      { year: 2020, title: "Pemigatinib: first FGFR2 inhibitor approved", refs: ["pemigatinib"] },
      { year: 2022, title: "Durvalumab added to chemotherapy (TOPAZ-1)", refs: ["durvalumab"] },
    ],
    pipeline: ["pemigatinib","futibatinib","ivosidenib"], openProblems: ["Most patients are diagnosed too late for surgery.", "No screening even in high-incidence regions.", "Resistance to FGFR2 inhibitors within a year.", "Gallbladder cancer lacks any approved targeted drug."],
    links: [{ label: "Wikipedia", url: W("Biliary_tract_cancer") }, { label: "NCI PDQ: bile duct cancer", url: "https://www.cancer.gov/types/liver/patient/bile-duct-treatment-pdq" }] },
];

export const cancerParentsWave2Map: Record<string, string> = {
  "breast-hr-positive": "breast-cancer", "breast-her2-positive": "breast-cancer", tnbc: "breast-cancer", "ductal-carcinoma-in-situ": "breast-cancer", "male-breast-cancer": "breast-cancer",
  nsclc: "lung-cancer", sclc: "lung-cancer",
  "all-leukemia": "leukaemia", aml: "leukaemia", cll: "leukaemia", cml: "leukaemia", "hairy-cell-leukemia": "leukaemia", cmml: "leukaemia", bpdcn: "leukaemia",
  cholangiocarcinoma: "biliary-tract-cancer", gallbladder: "biliary-tract-cancer", ampullary: "biliary-tract-cancer",
};

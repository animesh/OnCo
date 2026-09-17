import type { InstitutionInput, PersonInput } from "@/lib/schema";

/**
 * Institution networks (17 Sept 2026, roadmap rows 110 and 111): records added while mining network and
 * consortium sites for their members, leaders and portfolio, and while giving weakly connected institution
 * pages their first people. The membership links themselves live on the existing institution records
 * (parker-institute, cruk, nci, unicancer, dkfz) so that the graph shows them from both sides. Everything here
 * was checked against the organisation's own page on the asOf date; roles change, so re-check.
 *
 * - `networkInstitutions`: the German Cancer Consortium (DKTK), which had no record although eight of its
 *   partner sites already do.
 * - `networkPeople`: the Parker Institute's founding chief executive and current chief executive, and the
 *   publicly named lead clinician of five patient-bookable centres that had no linked person.
 * - `tldrZh`: Chinese TL;DRs for the records above, merged into src/data/i18n/zh.ts by the main session.
 */
const asOf = "2026-09-17";

type I = Omit<InstitutionInput, "kind" | "asOf">;
const inst = (x: I): InstitutionInput => ({ kind: "institution", asOf, ...x });

type P = Omit<PersonInput, "kind" | "asOf"> & { institutionId: string };
const p = (x: P): PersonInput => ({ kind: "person", asOf, institutions: [x.institutionId], links: x.profiles, ...x });

export const networkInstitutions: InstitutionInput[] = [
  inst({ id: "dktk", name: "German Cancer Consortium (DKTK)", aka: ["Deutsches Konsortium für Translationale Krebsforschung", "DKTK"], institutionType: "consortium", city: "Heidelberg", country: "DE", lat: 49.416, lng: 8.676, website: "https://dktk.dkfz.de",
    tldr: "Germany's national translational cancer research network: the DKFZ in Heidelberg as core centre plus university hospitals and institutes at seven other sites, so that laboratory findings reach patients across the country rather than in one city.",
    summary: "The German Cancer Consortium (Deutsches Konsortium für Translationale Krebsforschung, DKTK) is one of the German Centres for Health Research funded by the federal and state governments. Its own site describes more than twenty institutions and teaching hospitals joined in translational research centres at eight locations: Heidelberg as the core centre at the German Cancer Research Center (DKFZ), with partner sites in Berlin (Charité), Dresden (TU Dresden, University Hospital Carl Gustav Carus and the Helmholtz-Zentrum Dresden-Rossendorf), Essen and Düsseldorf, Frankfurt and Mainz (including the Georg-Speyer-Haus), Freiburg (including the Max Planck Institute of Immunobiology and Epigenetics), Munich (LMU and TUM with their university hospitals) and Tübingen. The consortium runs joint research programmes and shared platforms, among them the NCT/DKTK MASTER programme that sequences the genomes of rare and young-adult cancers to guide treatment, run from Heidelberg by Stefan Fröhling. OnCo links it to the partner-site records that already exist and to the DKFZ, which coordinates it.",
    programs: ["Eight partner sites and one core centre", "NCT/DKTK MASTER precision oncology programme", "Joint funding programmes and shared platforms", "School of Oncology"],
    links: [{ label: "DKTK: partner sites", url: "https://dktk.dkfz.de/en/sites/overview" }, { label: "DKTK: about", url: "https://dktk.dkfz.de/en" }],
    institutions: ["dkfz", "charite", "nct-dresden", "essen-wtz", "uct-frankfurt", "uct-mainz", "ccc-freiburg", "lmu-munich", "tum-munich", "ccc-tuebingen"], people: ["stefan-froehling"], technologies: ["wes-wgs", "cgp"], bottlenecks: ["b-translational-valley", "b-data-silos"] }),
];

export const networkPeople: PersonInput[] = [
  // =================== Parker Institute for Cancer Immunotherapy ===================
  p({ id: "jeffrey-bluestone", name: "Jeffrey A. Bluestone", role: "Founding President and Chief Executive Officer, Parker Institute for Cancer Immunotherapy (2016 to 2021); Chief Executive Officer and President, Sonoma BioTherapeutics", institutionId: "parker-institute", institutions: ["parker-institute", "ucsf"],
    specialisms: ["T cell immunology", "Immune tolerance and regulatory T cells", "Checkpoint biology (CTLA-4)", "Research institute leadership"],
    tldr: "The immunologist who ran the Parker Institute from its launch in 2016, building a shared research network across leading US cancer centres; he came from UCSF and now leads a regulatory T cell company.",
    summary: "Jeffrey Bluestone is a T cell immunologist whose laboratory work on CTLA-4 and on regulatory T cells underpins both checkpoint immunotherapy and cell therapies for autoimmunity. He was the Parker Institute for Cancer Immunotherapy's founding President and Chief Executive Officer from its public launch in 2016, and remains on its board, which lists him as Chief Executive Officer and President of Sonoma BioTherapeutics. His UCSF profile records him as the A.W. and Mary Margaret Clausen Distinguished Professor of Metabolism and Endocrinology and Professor Emeritus in the Diabetes Center. His publications are listed on PubMed.",
    profiles: [{ label: "UCSF profile", url: "https://profiles.ucsf.edu/jeffrey.bluestone" }, { label: "PICI leadership and board", url: "https://www.parkerici.org/about/leadership-staff/" }, { label: "PubMed", url: "https://pubmed.ncbi.nlm.nih.gov/?term=Bluestone+JA%5BAuthor%5D" }],
    technologies: ["checkpoint-inhibitor", "immunotherapy"], targets: ["ctla4"], tags: ["leadership", "immunotherapy"] }),

  p({ id: "karen-knudsen", name: "Karen E. Knudsen", role: "Chief Executive Officer and Board Member, Parker Institute for Cancer Immunotherapy", institutionId: "parker-institute",
    specialisms: ["Prostate cancer biology", "Cancer centre leadership", "Research strategy and partnerships"],
    tldr: "The cancer biologist and former American Cancer Society chief executive who now runs the Parker Institute for Cancer Immunotherapy.",
    summary: "Karen Knudsen is Chief Executive Officer and a board member of the Parker Institute for Cancer Immunotherapy, which describes her as a globally recognised cancer scientist and executive leader focused on turning all cancers into curable diseases. Before joining PICI in 2024 she was Chief Executive Officer of the American Cancer Society and its advocacy arm, and earlier directed the Sidney Kimmel Cancer Center at Thomas Jefferson University in Philadelphia. Her own research concerned prostate cancer, in particular the androgen receptor and DNA repair. Her publications are listed on PubMed.",
    profiles: [{ label: "PICI profile", url: "https://www.parkerici.org/person/karen-e-knudsen/" }, { label: "PubMed", url: "https://pubmed.ncbi.nlm.nih.gov/?term=Knudsen+KE%5BAuthor%5D+prostate" }],
    cancers: ["prostate"], tags: ["leadership", "immunotherapy"] }),

  // =================== Patient-bookable centres with no linked person (row 111) ===================
  p({ id: "santosh-kesari", name: "Santosh Kesari", role: "Founder, Asthra Health; neuro-oncologist", institutionId: "asthra-health",
    specialisms: ["Neuro-oncology", "Brain tumours", "Precision medicine second opinions"],
    tldr: "The neuro-oncologist who founded Asthra Health in Santa Monica, a practice giving outside opinions on complex cancers.",
    summary: "Santosh Kesari is a board-certified neurologist and neuro-oncologist and the founder of Asthra Health, which its site describes as technology-enabled precision medicine in oncology, neurology, autoimmunity and longevity health for patients with advanced cancers and complex neurological conditions. His clinical and research work concerns brain tumours, including glioblastoma and brain metastases. His publications are listed on PubMed.",
    profiles: [{ label: "Asthra Health", url: "https://asthrahealth.com/" }, { label: "PubMed", url: "https://pubmed.ncbi.nlm.nih.gov/?term=Kesari+S%5BAuthor%5D+glioblastoma" }],
    cancers: ["glioblastoma"], tags: ["leadership"] }),

  p({ id: "richard-baum", papers: [{"title":"Phase 3 Trial of 177Lu-Dotatate for Midgut Neuroendocrine Tumors","journal":"N Engl J Med","year":2017,"doi":"10.1056/nejmoa1607427","url":"https://doi.org/10.1056/nejmoa1607427","note":"Europe PMC author record matched by affiliation"},{"title":"FDG PET and PET/CT: EANM procedure guidelines for tumour PET imaging: version 1.0","journal":"Eur J Nucl Med Mol Imaging","year":2010,"doi":"10.1007/s00259-009-1297-4","url":"https://doi.org/10.1007/s00259-009-1297-4","note":"Europe PMC author record matched by affiliation"},{"title":"German Multicenter Study Investigating 177Lu-PSMA-617 Radioligand Therapy in Advanced Prostate Cancer Patients","journal":"J Nucl Med","year":2017,"doi":"10.2967/jnumed.116.183194","url":"https://doi.org/10.2967/jnumed.116.183194","note":"Europe PMC author record matched by affiliation"}], name: "Richard P. Baum", role: "Nuclear medicine specialist, Curanosticum Wiesbaden-Frankfurt", institutionId: "curanosticum",
    specialisms: ["Nuclear medicine", "Peptide receptor radionuclide therapy", "PSMA radioligand therapy", "Theranostics"],
    tldr: "One of the pioneers of peptide receptor radionuclide therapy for neuroendocrine tumours, now practising at the Curanosticum theranostics centre in Wiesbaden.",
    summary: "Richard Baum is a specialist in nuclear medicine whom Curanosticum describes as one of the leading experts in therapeutic nuclear medicine and part of its medical team since 2020. The centre offers PET-CT, radioiodine therapy, PSMA radioligand therapy and DOTATOC receptor radionuclide therapy. Before Wiesbaden he built the theranostics programme at the Zentralklinik Bad Berka, where lutetium-177 and yttrium-90 labelled somatostatin analogues were used to treat thousands of patients with neuroendocrine tumours, work that preceded the approvals of lutetium-177 dotatate and lutetium-177 PSMA-617. His publications are listed on PubMed.",
    profiles: [{ label: "Curanosticum", url: "https://www.curanosticum.de/en/" }, { label: "PubMed", url: "https://pubmed.ncbi.nlm.nih.gov/?term=Baum+RP%5BAuthor%5D+radionuclide" }],
    technologies: ["radioligand-therapy", "lu177-radioligand-therapy", "psma-pet"], cancers: ["neuroendocrine", "prostate"], tags: ["leadership"] }),

  p({ id: "ebrahim-delpassand", name: "Ebrahim S. Delpassand", role: "Chief Executive Officer and Medical Director, Excel Diagnostics and Nuclear Oncology Center", institutionId: "excel-diagnostics-nuclear-oncology",
    specialisms: ["Nuclear medicine", "Radiopharmaceutical therapy", "Molecular imaging", "Radiopharmaceutical trials"],
    tldr: "The nuclear medicine physician who founded and leads Excel Diagnostics in Houston, a radiopharmaceutical therapy centre that also runs early trials of new radioligands.",
    summary: "Ebrahim Delpassand is Chief Executive Officer and medical director of Excel Diagnostics and Nuclear Oncology Center in Houston, which its site describes as a Radiopharmaceutical Therapy Center of Excellence designated by the Society of Nuclear Medicine and Molecular Imaging, offering PET-CT and other imaging, radionuclide therapy and clinical trials. He has been an investigator on early trials of somatostatin and PSMA radioligands. His publications are listed on PubMed.",
    profiles: [{ label: "Excel Diagnostics", url: "https://www.exceldiagnostics.com/" }, { label: "PubMed", url: "https://pubmed.ncbi.nlm.nih.gov/?term=Delpassand+ES%5BAuthor%5D" }],
    technologies: ["radioligand-therapy", "psma-pet"], tags: ["leadership"] }),

  p({ id: "sant-chawla", papers: [{"title":"Pazopanib for metastatic soft-tissue sarcoma (PALETTE): a randomised, double-blind, placebo-controlled phase 3 trial","journal":"The Lancet","year":2012,"doi":"10.1016/s0140-6736(12)60651-5","url":"https://doi.org/10.1016/s0140-6736(12)60651-5","note":"OpenAlex author record matched by institution"},{"title":"Entrectinib in patients with advanced or metastatic NTRK fusion-positive solid tumours: integrated analysis of three phase 1–2 trials","journal":"The Lancet Oncology","year":2019,"doi":"10.1016/s1470-2045(19)30691-6","url":"https://doi.org/10.1016/s1470-2045(19)30691-6","note":"OpenAlex author record matched by institution"},{"title":"The Oral Neurokinin-1 Antagonist Aprepitant for the Prevention of Chemotherapy-Induced Nausea and Vomiting: A Multinational, Randomized, Double-Blind, Placebo-Controlled Trial in Patients Receiving High-Dose Cisplatin—The Aprepitant Protocol 052 Study Group","journal":"Journal of Clinical Oncology","year":2003,"doi":"10.1200/jco.2003.01.095","url":"https://doi.org/10.1200/jco.2003.01.095","note":"OpenAlex author record matched by institution"}], name: "Sant P. Chawla", role: "Medical Director, Sarcoma Oncology Center", institutionId: "sarcoma-oncology-center",
    specialisms: ["Sarcoma", "Early phase trials", "Medical oncology"],
    tldr: "The Santa Monica medical oncologist whose sarcoma practice has run many of the field's early and late phase drug trials, including the aldoxorubicin programme.",
    summary: "Sant Chawla is Medical Director of the Sarcoma Oncology Center in Santa Monica, California, a sarcoma-focused practice that its site describes as offering access to clinical trials and novel investigational therapies alongside multimodal treatment planning. He is board certified in internal medicine and medical oncology. OnCo's record of the centre notes that he led the aldoxorubicin trials in soft tissue sarcoma and co-founded Gemini Therapeutics, the company formed to carry aldoxorubicin forward. His publications are listed on PubMed.",
    profiles: [{ label: "Sarcoma Oncology Center", url: "https://www.sarcomaoncology.com/" }, { label: "PubMed", url: "https://pubmed.ncbi.nlm.nih.gov/?term=Chawla+SP%5BAuthor%5D+sarcoma" }],
    cancers: ["sarcoma", "osteosarcoma"], trials: ["aldoxorubicin-phase-3-sts"], companies: ["gemini-therapeutics"], drugs: ["aldoxorubicin"], tags: ["leadership", "trialist"] }),

  p({ id: "charles-simone", papers: [{"title":"Proton FLASH Radiotherapy for the Treatment of Symptomatic Bone Metastases","journal":"JAMA Oncology","year":2022,"doi":"10.1001/jamaoncol.2022.5843","url":"https://doi.org/10.1001/jamaoncol.2022.5843","note":"OpenAlex author record matched by institution"},{"title":"Stereotactic body radiation therapy for early-stage non-small cell lung cancer: Executive Summary of an ASTRO Evidence-Based Guideline","journal":"Practical Radiation Oncology","year":2017,"doi":"10.1016/j.prro.2017.04.014","url":"https://doi.org/10.1016/j.prro.2017.04.014","note":"OpenAlex author record matched by institution"}], name: "Charles B. Simone II", role: "Chief Medical Officer, New York Proton Center", institutionId: "new-york-proton-center",
    specialisms: ["Radiation oncology", "Proton therapy", "Thoracic oncology"],
    tldr: "The radiation oncologist who is chief medical officer of the New York Proton Center, the proton therapy centre founded by Memorial Sloan Kettering, Montefiore and Mount Sinai.",
    summary: "Charles Simone is Chief Medical Officer of the New York Proton Center, which its leadership page lists alongside Chief Executive Officer Christopher Panczner and Director of Medical Physics Haibo Lin. The centre was created through a partnership of three academic medical centres, Memorial Sloan Kettering Cancer Center, Montefiore and Mount Sinai, and describes itself as the first and only proton therapy centre in New York. His research concerns proton therapy for lung and other thoracic cancers and the comparative evidence for particle therapy. His publications are listed on PubMed.",
    profiles: [{ label: "New York Proton Center: leadership", url: "https://www.nyproton.com/about/leadership" }, { label: "PubMed", url: "https://pubmed.ncbi.nlm.nih.gov/?term=Simone+CB%5BAuthor%5D+proton" }],
    technologies: ["proton-therapy"], cancers: ["nsclc"], tags: ["leadership"] }),
];

/** Chinese TL;DRs for the records above, keyed by record id; merged into src/data/i18n/zh.ts by the main session. */
export const tldrZh: Record<string, string> = {
  dktk: "德国国家转化癌症研究网络：以海德堡德国癌症研究中心为核心，加上另外七个城市的大学医院和研究所，让实验室发现在全国范围内惠及患者，而不只在一座城市。",
  "jeffrey-bluestone": "自2016年成立起领导帕克癌症免疫治疗研究所的免疫学家，把美国多家顶尖癌症中心组成一个共享研究网络；他来自加州大学旧金山分校，现在领导一家调节性T细胞公司。",
  "karen-knudsen": "癌症生物学家、前美国癌症协会首席执行官，现任帕克癌症免疫治疗研究所首席执行官。",
  "santosh-kesari": "在圣莫尼卡创办Asthra Health的神经肿瘤学家，该诊所为复杂癌症病例提供外部诊疗意见。",
  "richard-baum": "神经内分泌肿瘤肽受体放射性核素治疗的先驱之一，现在威斯巴登的Curanosticum诊疗中心行医。",
  "ebrahim-delpassand": "创办并领导休斯顿Excel Diagnostics的核医学医生，该中心提供放射性药物治疗，并开展新型放射性配体的早期试验。",
  "sant-chawla": "圣莫尼卡的肿瘤内科医生，其肉瘤诊所承担了该领域许多早期和晚期药物试验，包括aldoxorubicin项目。",
  "charles-simone": "纽约质子中心首席医疗官、放射肿瘤学家；该中心由纪念斯隆-凯特琳、蒙蒂菲奥里和西奈山共同创办。",
};

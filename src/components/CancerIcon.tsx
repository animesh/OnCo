/**
 * Monoline wireframe organ / tissue icons for every cancer type.
 *
 * Hand-drawn 32x32 glyphs: 1.5px currentColor stroke, round joins and caps,
 * no fills except small dots used as tumour / nodule markers where they aid
 * meaning. Subtypes share their organ's glyph (tnbc -> breast, sclc -> lung,
 * aml -> blood ...). Unknown ids fall back to a generic cell.
 *
 * Server-safe: no hooks, no client state.
 */

type Glyph = {
  /** SVG path data, stroked only. */
  paths: readonly string[];
  /** Filled marker dots as [cx, cy, r]. */
  dots?: ReadonlyArray<readonly [number, number, number]>;
};

const GLYPHS = {
  // ── Solid organs ────────────────────────────────────────────────────────
  breast: {
    paths: ["M4 19C4 12 10 10 16 14C22 10 28 12 28 19C28 24 24 27 20 26C18 25.5 17 24 16 22C15 24 14 25.5 12 26C8 27 4 24 4 19Z"],
    dots: [[10, 19, 1.25], [22, 19, 1.25]],
  },
  lung: {
    paths: [
      "M16 3V10",
      "M16 10C16 12 15 13.5 13.5 14",
      "M16 10C16 12 17 13.5 18.5 14",
      "M13.5 12C10 12 5 17 5 23C5 27 7 28 9.5 28C12.5 28 13.5 26.5 13.5 23V12Z",
      "M18.5 12C22 12 27 17 27 23C27 27 25 28 22.5 28C19.5 28 18.5 26.5 18.5 23V12Z",
    ],
    dots: [[22.5, 20, 1.25]],
  },
  prostate: {
    paths: [
      "M9 11C9 5 23 5 23 11C23 13 21 14 19 14H13C11 14 9 13 9 11Z",
      "M11 18C11 15 13 14 16 14C19 14 21 15 21 18C21 22 18.5 24 16 24C13.5 24 11 22 11 18Z",
      "M16 24V29",
    ],
    dots: [[18.5, 19, 1.25]],
  },
  colon: {
    paths: [
      "M4.5 27V12C4.5 7.5 8 4.5 12 4.5H20C24 4.5 27.5 7.5 27.5 12V20C27.5 24 24 27.5 20 27.5H19C18.5 27.5 18.5 28 18.5 29",
      "M9.5 27V12C9.5 10.5 10.5 9.5 12 9.5H20C21.5 9.5 22.5 10.5 22.5 12V20C22.5 21.5 21.5 22.5 20 22.5H18C15 22.5 13.5 25 13.5 29",
      "M4.5 27C4.5 29.5 9.5 29.5 9.5 27",
    ],
    dots: [[7, 20, 1.25]],
  },
  pancreas: {
    paths: [
      "M9 6C4 8 3 20 8 24",
      "M5 15C5 10 9 8 12 9C16 10 20 12 27 11C29 11 29 14 27 14.5C21 16 17 18 13 19C9 20 5 19 5 15Z",
      "M8 14.5C13 14 19 13.5 26 12.5",
    ],
    dots: [[10, 13, 1.25]],
  },
  liver: {
    paths: ["M3 14C3 9 7 7 12 7L26 7C28 7 29 9 28 11C27 14 22 15 18 17L11 23C8 25 4 23 3 19Z", "M18 7C19 11 17 14 15 16"],
    dots: [[9, 15, 1.25]],
  },
  "bile-duct": {
    paths: [
      "M8 4C8 9 12 12 16 12C20 12 24 9 24 4",
      "M16 12V28",
      "M16 19C15.5 18 14.8 17.3 14 17",
      "M14 17C10 15 6 19 7 23C8 27 12 28 13.5 25C15 22 14 19 14 17Z",
    ],
    dots: [[16, 15, 1.75], [10, 22, 1.25]],
  },
  stomach: {
    paths: [
      "M12 3V8C12 12 5 13 5 18C5 24 10 28 16 28C22 28 25 25 26 21",
      "M16.5 3V8C16.5 12 21 15 24 16.5C26 17.5 26.5 19 26 21",
      "M26 21C27 23 28 24 29 25",
    ],
    dots: [[12, 22, 1.25]],
  },
  oesophagus: {
    paths: ["M14 3V20C14 24 10 25 10 28H22C22 25 18 24 18 20V3"],
    dots: [[16, 12, 1.25]],
  },
  kidney: {
    paths: [
      "M13 4C7 4 5 10 5 16C5 22 8 28 14 28C18 28 20 25 20 22C20 19 17 18 17 15C17 12 20 12 20 9C20 6 17 4 13 4Z",
      "M17.5 15C21 15 23 17 23 20V29",
    ],
    dots: [[11, 12, 1.25]],
  },
  bladder: {
    paths: ["M6 15C6 9 11 6 16 6C21 6 26 9 26 15C26 21 22 26 16 26C10 26 6 21 6 15Z", "M8 2C8 5 9 7 10 9", "M24 2C24 5 23 7 22 9", "M16 26V30"],
    dots: [[11, 18, 1.25]],
  },
  brain: {
    paths: [
      "M16 4C10 4 5 9 5 15C5 21 9 27 16 28C23 27 27 21 27 15C27 9 22 4 16 4Z",
      "M16 4V28",
      "M9 11C12 10 13 14 10 16",
      "M8 21C11 19 13 22 11 25",
      "M23 11C20 10 19 14 22 16",
      "M24 21C21 19 19 22 21 25",
    ],
  },
  thyroid: {
    paths: [
      "M16 3V29",
      "M14 11C9 10 6 14 6 19C6 23 9 26 12 25C14 24.5 14 22 14 20C14 17 15 16 16 16C17 16 18 17 18 20C18 22 18 24.5 20 25C23 26 26 23 26 19C26 14 23 10 18 11",
    ],
    dots: [[10, 18, 1.25]],
  },
  adrenal: {
    paths: [
      "M14 14C9 14 7 18 7 22C7 26 9 29 14 29C17 29 19 27 19 25C19 23 17 22 17 20.5C17 19 19 18.5 19 17C19 15 17 14 14 14Z",
      "M6.5 12.5C8 8 12 5 15 5.5C18 6 20.5 9 21 12L13 13.5Z",
    ],
    dots: [[13.5, 10, 1.25]],
  },
  thymus: {
    paths: ["M13 4C9 9 6 16 8 24C9 27 13 28 15 26C16 22 15 12 13 4Z", "M19 4C23 9 26 16 24 24C23 27 19 28 17 26C16 22 17 12 19 4Z"],
    dots: [[11, 20, 1.25]],
  },
  salivary: {
    paths: [
      "M5.75 11a3.25 3.25 0 1 0 6.5 0a3.25 3.25 0 1 0-6.5 0",
      "M12.25 8a3.25 3.25 0 1 0 6.5 0a3.25 3.25 0 1 0-6.5 0",
      "M16.75 13a3.25 3.25 0 1 0 6.5 0a3.25 3.25 0 1 0-6.5 0",
      "M8.75 17a3.25 3.25 0 1 0 6.5 0a3.25 3.25 0 1 0-6.5 0",
      "M13.75 22a3.25 3.25 0 1 0 6.5 0a3.25 3.25 0 1 0-6.5 0",
      "M23 13.5C26 15 28 18 29 21",
    ],
    dots: [[12, 17, 1.25]],
  },
  // ── Gynaecological / reproductive ──────────────────────────────────────
  ovary: {
    paths: ["M4 18C4 13 9 10 14 11C19 12 24 15 24 19C24 23 19 26 14 25C9 24 4 22 4 18Z", "M24 19C29 17 29 9 25 6C23 4.5 21 5 19 6", "M19 6L17 4", "M19 6L17 7.5", "M19 6L18 9"],
    dots: [[10, 17, 1.25], [15, 20, 1.25]],
  },
  uterus: {
    paths: [
      "M10 12C10 8 22 8 22 12C22 17 20 20 19 23C18.5 26 13.5 26 13 23C12 20 10 17 10 12Z",
      "M10 12C7 10 5 11 4 14",
      "M22 12C25 10 27 11 28 14",
      "M4 14.5a1.5 1.5 0 1 0 0 3a1.5 1.5 0 1 0 0-3",
      "M28 14.5a1.5 1.5 0 1 0 0 3a1.5 1.5 0 1 0 0-3",
    ],
    dots: [[16, 15, 1.25]],
  },
  cervix: {
    paths: [
      "M7 3C8 9 12 12 13 14C12 17 12 20 13 22C10 23 8 26 6 29",
      "M25 3C24 9 20 12 19 14C20 17 20 20 19 22C22 23 24 26 26 29",
      "M13.5 22C13.5 20.5 18.5 20.5 18.5 22C18.5 23.5 13.5 23.5 13.5 22Z",
      "M16 13V20",
    ],
  },
  testis: {
    paths: ["M12 27C7 27 5 22 5 17C5 12 8 8 12 8C16 8 19 12 19 17C19 22 17 27 12 27Z", "M19 12C22 12 24 14 24 18C24 22 22 26 19 26", "M13 8C13 5 16 3 22 3"],
    dots: [[10, 16, 1.25]],
  },
  // ── Skin, bone, soft tissue ────────────────────────────────────────────
  skin: {
    paths: ["M3 13H11C13 13 13 9 16 9C19 9 19 13 21 13H29", "M7 13V6C7 4 9 3 10 4", "M3 19H29", "M3 25C7 23 9 27 13 25C17 23 19 27 23 25C27 23 28 25 29 25"],
    dots: [[16, 11.5, 1.5]],
  },
  bone: {
    paths: [
      "M11 4C8 4 7 7 8.5 8.5C7 10 8 12.5 10.5 12.5C11.5 12.5 12 12 13 12V20C12 20 11.5 19.5 10.5 19.5C8 19.5 7 22 8.5 23.5C7 25 8 28 11 28C13 28 13.5 26.5 16 26.5C18.5 26.5 19 28 21 28C24 28 25 25 23.5 23.5C25 22 24 19.5 21.5 19.5C20.5 19.5 20 20 19 20V12C20 12 20.5 12.5 21.5 12.5C24 12.5 25 10 23.5 8.5C25 7 24 4 21 4C19 4 18.5 5.5 16 5.5C13.5 5.5 13 4 11 4Z",
    ],
    dots: [[16, 17, 1.5]],
  },
  muscle: {
    paths: ["M4 16C8 9 24 9 28 16C24 23 8 23 4 16Z", "M8 14C14 12 18 12 24 14", "M8 18C14 20 18 20 24 18", "M4 16H2", "M28 16H30"],
    dots: [[12, 16, 1.25]],
  },
  // ── Blood and lymph ────────────────────────────────────────────────────
  blood: {
    paths: [
      "M4.5 11a5.5 5.5 0 1 0 11 0a5.5 5.5 0 1 0-11 0",
      "M7.5 11C7.5 9.8 12.5 9.8 12.5 11C12.5 12.2 7.5 12.2 7.5 11Z",
      "M15.5 22a5.5 5.5 0 1 0 11 0a5.5 5.5 0 1 0-11 0",
      "M18.5 22C18.5 20.8 23.5 20.8 23.5 22C23.5 23.2 18.5 23.2 18.5 22Z",
      "M17.5 9a4.5 4.5 0 1 0 9 0a4.5 4.5 0 1 0-9 0",
    ],
    dots: [[22, 9, 1.75]],
  },
  lymph: {
    paths: ["M16 10C22 10 26 13 26 17C26 21 22 24 16 24C10 24 6 21 6 17C6 13 10 10 16 10Z", "M9 4L11 10", "M16 3V10", "M23 4L21 10", "M16 24V29"],
    dots: [[11, 16, 1.25], [19, 18, 1.25]],
  },
  "plasma-cell": {
    paths: ["M16 5C22 5 27 10 27 16C27 22 22 27 16 27C10 27 5 22 5 16C5 10 10 5 16 5Z", "M7 18a5 5 0 1 0 10 0a5 5 0 1 0-10 0", "M17 13C19 11 21 11 22.5 12"],
    dots: [[10, 16.5, 1], [14, 16.5, 1], [10, 19.5, 1], [14, 19.5, 1]],
  },
  // ── Head, neck, nervous system, eye ─────────────────────────────────────
  eye: {
    paths: ["M3 16C8 8 24 8 29 16C24 24 8 24 3 16Z", "M10 16a6 6 0 1 0 12 0a6 6 0 1 0-12 0"],
    dots: [[16, 16, 2]],
  },
  throat: {
    paths: ["M8 5C9 9 8 12 10 15L14 18H18L22 15C24 12 23 9 24 5", "M16 5V9", "M13 18V29", "M19 18V29", "M13 22H19", "M13 26H19"],
    dots: [[11, 11, 1.25]],
  },
  nerve: {
    paths: ["M6 10a4 4 0 1 0 8 0a4 4 0 1 0-8 0", "M7 7L3 3", "M10 6V2", "M7 12L3 14", "M13 7L17 3", "M13 12C18 15 20 20 26 26", "M26 26L29 24", "M26 26L28 29", "M26 26L24 29"],
    dots: [[10, 10, 1.25]],
  },
  child: {
    paths: ["M11 8a5 5 0 1 0 10 0a5 5 0 1 0-10 0", "M16 13V22", "M16 16L10 20", "M16 16L22 20", "M16 22L12 29", "M16 22L20 29"],
  },
  // ── Thoracic lining, GI accessories ────────────────────────────────────
  pleura: {
    paths: ["M21 4C13 5 5 11 5 20C5 25 8 29 13 29C17 29 21 27 21 22Z", "M18.5 7C13 8 8 13 8 20C8 24 10 26.5 13 26.5C16 26.5 18.5 24.5 18.5 22Z"],
    dots: [[6.5, 20, 1.1], [13, 27.75, 1.1]],
  },
  anus: {
    paths: ["M10 3V13C10 19 12 24 16 27C20 24 22 19 22 13V3", "M6 15C6 22 10 27 16 29C22 27 26 22 26 15"],
    dots: [[12.5, 19, 1.25]],
  },
  appendix: {
    paths: ["M7 4V15C7 21 11 25 17 25H21C24 25 26 23 26 20V4", "M11 23C8 25 7 28 9 30"],
    dots: [[9.5, 29, 1.5]],
  },
  // ── Unknown primary / fallback ─────────────────────────────────────────
  unknown: {
    paths: ["M5 16a11 11 0 1 0 22 0a11 11 0 1 0-22 0", "M12.5 13C12.5 10.5 14 9 16 9C18 9 19.5 10.5 19.5 12.5C19.5 15 16 15.5 16 18"],
    dots: [[16, 22, 1.25]],
  },
  cell: {
    paths: ["M5 16a11 11 0 1 0 22 0a11 11 0 1 0-22 0", "M12 16a4 4 0 1 0 8 0a4 4 0 1 0-8 0"],
    dots: [[22, 11, 1], [9, 21, 1]],
  },
} satisfies Record<string, Glyph>;

export type CancerIconId = keyof typeof GLYPHS;

export const CANCER_ICON_IDS = Object.keys(GLYPHS) as CancerIconId[];

const FALLBACK: CancerIconId = "cell";

/** Cancer entity id -> icon id. Subtypes share their organ's icon. */
const MAP = {
  // breast
  tnbc: "breast",
  "breast-hr-positive": "breast",
  "breast-her2-positive": "breast",
  "male-breast-cancer": "breast",
  "ductal-carcinoma-in-situ": "breast",
  "hr-positive-early-high-risk": "breast", "hr-positive-metastatic-post-cdk46": "breast", "her2-low-metastatic-breast-cancer": "breast", "her2-positive-early-breast-cancer": "breast", "her2-positive-breast-brain-metastases": "breast",
  "tnbc-early": "breast", "tnbc-metastatic": "breast", "inflammatory-breast-cancer": "breast", "paget-disease-of-the-nipple": "breast", "phyllodes-tumour": "breast",
  // lung / thoracic
  nsclc: "lung",
  sclc: "lung",
  mesothelioma: "pleura",
  "thymic-epithelial": "thymus",
  "pleuropulmonary-blastoma": "lung",
  "inflammatory-myofibroblastic-tumour": "lung",
  // gastrointestinal
  colorectal: "colon",
  pancreatic: "pancreas",
  gastric: "stomach",
  gist: "stomach",
  "gastric-her2-positive": "stomach", "gastric-cldn18-2-positive": "stomach", "gastric-pdl1-high": "stomach", "gastric-msi-high": "stomach", "early-gastric-cancer": "stomach",
  "gist-kit-exon-11": "stomach", "gist-pdgfra-d842v": "stomach", "gist-imatinib-resistant": "stomach",
  esophageal: "oesophagus",
  hcc: "liver", "hcc-early": "liver", "hcc-intermediate": "liver", "hcc-advanced": "liver",
  hepatoblastoma: "liver",
  cholangiocarcinoma: "bile-duct", "intrahepatic-cholangiocarcinoma": "bile-duct", "extrahepatic-cholangiocarcinoma": "bile-duct",
  gallbladder: "bile-duct",
  ampullary: "bile-duct",
  anal: "anus",
  appendiceal: "appendix",
  "small-bowel": "colon",
  // genitourinary
  prostate: "prostate",
  urothelial: "bladder",
  urethral: "bladder",
  rcc: "kidney",
  "wilms-tumor": "kidney",
  testicular: "testis",
  penile: "testis",
  // gynaecologic
  ovarian: "ovary",
  endometrial: "uterus",
  "gestational-trophoblastic": "uterus",
  "uterine-sarcoma": "uterus",
  cervical: "cervix",
  vulvar: "cervix",
  vaginal: "cervix",
  // skin
  melanoma: "skin",
  "cutaneous-scc": "skin",
  "basal-cell-carcinoma": "skin",
  "merkel-cell-carcinoma": "skin",
  "kaposi-sarcoma": "skin",
  // central nervous system
  glioblastoma: "brain",
  medulloblastoma: "brain",
  "primary-cns-lymphoma": "brain",
  "paediatric-low-grade-glioma": "brain",
  "dipg-dmg": "brain",
  atrt: "brain",
  ependymoma: "brain",
  craniopharyngioma: "brain",
  "pituitary-tumours": "brain",
  // head and neck
  "head-and-neck": "throat",
  nasopharyngeal: "throat",
  sinonasal: "throat",
  "nut-carcinoma": "throat",
  "salivary-gland": "salivary",
  // eye
  "uveal-melanoma": "eye",
  retinoblastoma: "eye",
  // sarcoma / bone / soft tissue
  sarcoma: "muscle",
  rhabdomyosarcoma: "muscle",
  "desmoid-tumour": "muscle",
  "epithelioid-sarcoma": "muscle",
  "vascular-tumours": "muscle",
  osteosarcoma: "bone",
  "ewing-sarcoma": "bone",
  chordoma: "bone",
  "tenosynovial-giant-cell-tumour": "bone",
  // endocrine
  thyroid: "thyroid",
  "parathyroid-carcinoma": "thyroid",
  neuroendocrine: "nerve",
  "pheochromocytoma-paraganglioma": "nerve",
  "multiple-endocrine-neoplasia": "nerve",
  adrenocortical: "adrenal",
  // paediatric
  neuroblastoma: "child",
  "paediatric-germ-cell-tumours": "child",
  "rare-childhood-cancers": "child",
  // haematologic: leukaemias and marrow
  aml: "blood",
  "all-leukemia": "blood",
  cll: "blood",
  cml: "blood",
  cmml: "blood",
  mds: "blood",
  "myeloproliferative-neoplasms": "blood",
  "systemic-mastocytosis": "blood",
  "hairy-cell-leukemia": "blood",
  bpdcn: "blood",
  "langerhans-cell-histiocytosis": "blood",
  histiocytoses: "blood",
  // haematologic: lymphomas
  dlbcl: "lymph",
  "hodgkin-lymphoma": "lymph",
  "follicular-lymphoma": "lymph",
  "mantle-cell-lymphoma": "lymph",
  "peripheral-t-cell-lymphoma": "lymph",
  "burkitt-lymphoma": "lymph",
  "hiv-associated-lymphoma": "lymph",
  "post-transplant-lymphoproliferative-disorder": "lymph",
  // haematologic: plasma cell
  "multiple-myeloma": "plasma-cell",
  waldenstrom: "plasma-cell",
  // other
  "cancer-of-unknown-primary": "unknown",
} satisfies Record<string, CancerIconId>;

export const CANCER_ICON: Record<string, string> = MAP;

export function iconIdFor(cancerId: string): string {
  return (MAP as Record<string, CancerIconId | undefined>)[cancerId] ?? FALLBACK;
}

export function CancerIcon({ cancerId, className = "h-6 w-6" }: { cancerId: string; className?: string }) {
  const glyph: Glyph = GLYPHS[iconIdFor(cancerId) as CancerIconId] ?? GLYPHS[FALLBACK];
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true" focusable="false" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      {glyph.paths.map((d, i) => (
        <path key={i} d={d} />
      ))}
      {glyph.dots?.map(([cx, cy, r], i) => (
        <circle key={`d${i}`} cx={cx} cy={cy} r={r} fill="currentColor" stroke="none" />
      ))}
    </svg>
  );
}

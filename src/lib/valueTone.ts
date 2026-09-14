/**
 * Colour tones for facet values, so a table of otherwise identical white rows can be read at a glance.
 * Keyed by facet key (as used in EntityBrowser rows) then by the displayed value. Light and dark theme pairs.
 */
const T = {
  zinc: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800/60 dark:text-zinc-200",
  amber: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200",
  sky: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200",
  emerald: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200",
  violet: "bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-200",
  indigo: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-200",
  rose: "bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200",
  orange: "bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200",
  pink: "bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-200",
  cyan: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/40 dark:text-cyan-200",
  lime: "bg-lime-100 text-lime-800 dark:bg-lime-900/40 dark:text-lime-200",
  teal: "bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-200",
  fuchsia: "bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900/40 dark:text-fuchsia-200",
  yellow: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-200",
} as const;

const TONES: Record<string, Record<string, string>> = {
  maturity: { "Speculative": T.zinc, "Preclinical evidence": T.amber, "Early clinical": T.sky, "Being tested at scale": T.emerald },
  actor: { Research: T.violet, Clinic: T.sky, Industry: T.indigo, Regulator: T.rose, Payer: T.amber, Policy: T.orange, Patients: T.pink, Data: T.cyan, Philanthropy: T.lime, Engineering: T.teal },
  cost: { Small: T.emerald, Medium: T.amber, Large: T.rose },
  // Companies (COMPANY_TYPE_LABEL), institutions (institutionType), pairings and papers all use the "type" facet.
  type: {
    "Large pharma": T.indigo, Biotech: T.violet, Diagnostics: T.teal, "Imaging equipment": T.sky, "Devices & RT hardware": T.orange, "AI & software": T.cyan,
    Radiopharmaceuticals: T.lime, "Cell therapy": T.pink, Services: T.zinc, Nonprofit: T.emerald, Investor: T.amber,
    "Cancer center": T.pink, Hospital: T.sky, Consortium: T.violet, "Research institute": T.teal, Government: T.rose, University: T.indigo,
    Rct: T.emerald, "Meta analysis": T.teal, Observational: T.sky, Translational: T.violet, Review: T.zinc, Basic: T.indigo, Methods: T.amber, Guideline: T.rose, "Real world": T.orange,
  },
  class: { "Surface antigen": T.sky, Kinase: T.violet, Enzyme: T.amber, Checkpoint: T.emerald, "Nuclear receptor": T.rose, Transcription: T.indigo, "Tumor suppressor": T.teal, Stroma: T.lime, Oncogene: T.orange, Other: T.zinc },
  group: {
    Haematologic: T.rose, Paediatric: T.pink, Gastrointestinal: T.amber, Endocrine: T.lime, Gynaecologic: T.violet, Sarcoma: T.orange, Skin: T.yellow, Genitourinary: T.sky,
    Breast: T.fuchsia, "Head and neck": T.indigo, "Central nervous system": T.zinc, Thoracic: T.cyan, Lung: T.cyan, Other: T.zinc,
  },
  stage: { Startup: T.lime, "Growth stage": T.emerald, Public: T.sky, "Large private": T.indigo, Acquired: T.amber, Defunct: T.zinc },
};

/** Tone classes for a facet value, or undefined when the facet has no colour scheme. */
export function valueTone(facet: string, value: string): string | undefined {
  return TONES[facet]?.[value];
}

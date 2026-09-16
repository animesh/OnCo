/**
 * Canonical glossary categories. Terms are written across many files with category labels that drifted
 * ("Regulatory", "regulatory", "Regulation", "policy"; "Genetics", "genetics", "Genomics"), which made the
 * glossary grid ragged and split the same idea over several tiles. Every term is mapped here to one of
 * twenty categories at load time (see ALL_INPUTS in ./index.ts); the raw files are left as written.
 *
 * Twenty categories fill the grid evenly at 2, 4 and 5 columns. Each has an animation in
 * ./term-animations.ts, which a test asserts.
 */
export const TERM_CATEGORIES = [
  "Treatment jargon", "Biology basics", "Cancer biology", "Procedures", "Clinic basics", "Clinical", "Trials", "Regulation & policy",
  "Biomarkers", "Pathology", "Side effects", "ADC chemistry", "Genomics & genetics", "Nutrition & lifestyle", "Endpoints", "Anatomy",
  "Diagnostics & imaging", "Immunology", "Resistance", "Epidemiology & prevention",
] as const;
export type TermCategory = (typeof TERM_CATEGORIES)[number];

/** Raw label (lower-cased) → canonical category. Labels not listed and not canonical fall back to "Clinic basics". */
const ALIASES: Record<string, TermCategory> = {
  "pharmacology": "Treatment jargon", "radiopharma": "Treatment jargon",
  "biology": "Cancer biology",
  "clinical": "Clinical",
  "trials & regulation": "Trials", "trials": "Trials",
  "regulatory": "Regulation & policy", "regulation": "Regulation & policy", "policy": "Regulation & policy",
  "biomarker": "Biomarkers", "pathology & biomarkers": "Biomarkers",
  "toxicity": "Side effects",
  "adc": "ADC chemistry",
  "genomics": "Genomics & genetics", "genetics": "Genomics & genetics",
  "diagnostics": "Diagnostics & imaging", "imaging": "Diagnostics & imaging",
  "epidemiology": "Epidemiology & prevention", "prevention": "Epidemiology & prevention", "screening": "Epidemiology & prevention",
};

/** Terms whose umbrella label ("Trials & regulation", "Pathology & biomarkers") splits by meaning; decided term by term. */
const OVERRIDES: Record<string, TermCategory> = {
  // Trials & regulation → the regulatory half
  "bla-nda": "Regulation & policy", "complete-response-letter": "Regulation & policy", "conditional-approval": "Regulation & policy",
  "fast-track-rmat": "Regulation & policy", "full-approval": "Regulation & policy", "hta": "Regulation & policy", "approval-withdrawal": "Regulation & policy",
  "label-indication": "Regulation & policy", "odac": "Regulation & policy", "orphan-designation": "Regulation & policy", "regulatory-agencies": "Regulation & policy",
  // Pathology & biomarkers → the pathology half, and two that belong elsewhere
  "blasts": "Pathology", "carcinoma-in-situ": "Pathology", "dcis": "Pathology", "dysplasia": "Pathology", "lymphovascular-invasion": "Pathology",
  "perineural-invasion": "Pathology", "resection-margins": "Pathology", "tumour-differentiation": "Pathology", "staging-systems": "Pathology",
  "child-pugh": "Pathology", "cirrhosis": "Pathology", "deauville": "Diagnostics & imaging", "performance-status": "Clinical",
  // lower-case "clinical" pair
  "financial-toxicity": "Clinical",
};

const CANON = new Map<string, TermCategory>(TERM_CATEGORIES.map((c) => [c.toLowerCase(), c]));

export function canonicalTermCategory(id: string, raw: string): TermCategory {
  const o = OVERRIDES[id]; if (o) return o;
  const key = raw.trim().toLowerCase();
  return CANON.get(key) ?? ALIASES[key] ?? "Clinic basics";
}

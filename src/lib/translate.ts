import type { Kind } from "./schema";

/**
 * Helpers for browser translation and screen readers.
 *
 * The site language switch changes <html lang>, menus, headings and translated TL;DRs; record summaries, tables of
 * data and English-only pages stay English. Two attributes tell translators and assistive technology the truth:
 *   lang="en"        on containers whose text stays English whatever the site language (see `EN_TEXT`)
 *   translate="no"   on names and identifiers that must never be translated: drug and product names, gene and protein
 *                    symbols, trial ids and acronyms, company and institution names, doses and units, database ids.
 *                    The `notranslate` class is the same instruction for Google's translator, which predates the
 *                    attribute and still honours the class.
 */

/** Spread onto a container whose text stays English whatever the site language. */
export const EN_TEXT = { lang: "en" } as const;

/** Spread onto an element whose text must not be translated (a name, a symbol, an id, a dose). */
export const NO_TRANSLATE = { translate: "no", className: "notranslate" } as const;

/** Kinds whose names are proper nouns or identifiers rather than words: translators must leave them as they are. */
export const NO_TRANSLATE_KINDS: ReadonlySet<Kind> = new Set<Kind>(["drug", "target", "company", "institution", "trial", "person", "journal", "collection"]);

/** True when a record's name is a proper noun or identifier (a drug, a gene, a company, a trial, a person). */
export function isProperNoun(kind: Kind | undefined): boolean {
  return !!kind && NO_TRANSLATE_KINDS.has(kind);
}

/**
 * Attributes for an element showing a record's name: `translate="no"` plus the `notranslate` class for proper-noun
 * kinds, `lang="en"` otherwise (a cancer or a glossary term is an English word a translator should translate).
 * `className` is merged with any classes you pass.
 */
export function nameAttrs(kind: Kind | undefined, className = ""): { translate?: "no"; lang?: "en"; className?: string } {
  if (isProperNoun(kind)) return { translate: "no", className: className ? `${className} notranslate` : "notranslate" };
  return className ? { lang: "en", className } : { lang: "en" };
}

/**
 * Doses and units inside a sentence ("150 mg twice daily", "2 Gy in 30 fractions", "7.4 GBq") wrapped so translators leave
 * the number and its unit alone while translating the words around them. Returns plain text when there is nothing to wrap.
 */
export const DOSE_RE = /\b\d[\d,.]*(?:\s?(?:x|×)\s?\d[\d,.]*)?(?:\s?(?:mg\/m2|mg\/m²|mg\/kg|mcg\/kg|µg\/kg|mg|mcg|µg|ug|g|kg|mL|ml|L|Gy|cGy|MBq|GBq|mCi|kBq|IU|MIU|units?|U|mmol|mol|nM|µM|uM|mM|%))(?=[\s,.;:)]|$)/g;

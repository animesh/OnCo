/**
 * Which picture a table row shows beside its name, and how big the stand-in tile must be when a row has none.
 *
 * Pure and dependency-free so both the client table (EntityBrowser) and the corpus tests can use it. The rule
 * the owner asked for: a row never shows an empty gap where its neighbours show a molecule, drawing, organ
 * icon or logo. It borrows a picture that fits the record first (set by the row builders), then shows an
 * initials tile for organisations and people, and finally the kind's own symbol in the kind's colour.
 */

/** The visual-bearing fields of a browser row; a structural subset of BrowserRow so this file imports nothing. */
export type VisualFields = {
  molecule?: string;
  target?: unknown;
  schematic?: unknown;
  term?: unknown;
  cancerIcon?: string;
  sectionIcon?: string;
  logo?: string;
  avatar?: "org" | "person";
  kind?: string;
};

export type VisualSource = "molecule" | "target" | "schematic" | "term" | "section" | "cancer" | "logo" | "initials" | "kind" | "none";

/** The most specific picture the row will show, in the order the table renders them. "none" is the gap this module exists to prevent. */
export function visualSource(r: VisualFields): VisualSource {
  if (r.molecule) return "molecule";
  if (r.target) return "target";
  if (r.schematic) return "schematic";
  if (r.term) return "term";
  if (r.sectionIcon) return "section";
  if (r.cancerIcon) return "cancer";
  if (r.logo) return "logo";
  if (r.avatar) return "initials";
  if (r.kind) return "kind";
  return "none";
}

/** True when the row shows something in the visual slot (a picture, an initials tile or the kind symbol). */
export const hasVisual = (r: VisualFields): boolean => visualSource(r) !== "none";

export type Slot = { className: string; round: boolean };

const WIDE: ReadonlySet<VisualSource> = new Set(["target", "schematic", "term", "section", "cancer"]);

/**
 * The size of the stand-in tile for a whole table, matched to what the other rows show so columns never jump:
 * the wide 40 x 56 px drawing slot when any row has a drawing or organ icon, the 40 x 40 px molecule slot when
 * rows show molecules, the 28 px avatar when rows show logos or portraits (round when every one is a person).
 * Null when no row has any visual, in which case the table has no picture column and nothing is added.
 */
export function fallbackSlot(rows: readonly VisualFields[]): Slot | null {
  let wide = false, molecule = false, avatar = false, allPeople = true;
  for (const r of rows) {
    const s = visualSource(r);
    if (WIDE.has(s)) wide = true;
    else if (s === "molecule") molecule = true;
    else if (s === "logo" || s === "initials") { avatar = true; if (r.avatar !== "person") allPeople = false; }
  }
  if (wide) return { className: "h-10 w-14", round: false };
  if (molecule) return { className: "h-10 w-10", round: false };
  if (avatar) return { className: "h-7 w-7", round: allPeople };
  return null;
}

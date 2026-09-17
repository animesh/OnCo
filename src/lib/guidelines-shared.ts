/**
 * Guideline helpers safe for client components: no graph import. src/lib/guidelines.ts re-exports these and adds the
 * graph-backed functions, so server code keeps one import while the client bundle stays free of the corpus.
 */
import type { GuidelineChange, GuidelineVersion } from "@/data/guideline-versions";
import type { GuidelineMapEntry, Stance } from "@/data/guideline-map";

export function diffVersions(list: GuidelineVersion[], from: string | null, to: string): { added: GuidelineChange[]; removed: GuidelineChange[]; recategorised: GuidelineChange[]; versions: GuidelineVersion[] } {
  const sorted = list.slice().sort((a, b) => a.date.localeCompare(b.date));
  const fromIdx = from ? sorted.findIndex((v) => v.id === from) : -1;
  const toIdx = sorted.findIndex((v) => v.id === to);
  const slice = toIdx < 0 ? [] : sorted.slice(fromIdx + 1, toIdx + 1);
  const changes = slice.flatMap((v) => v.changes);
  return { added: changes.filter((c) => c.kind === "added"), removed: changes.filter((c) => c.kind === "removed"), recategorised: changes.filter((c) => c.kind === "recategorised"), versions: slice };
}

const POSITIVE: Stance[] = ["preferred", "recommended"];
const NEGATIVE: Stance[] = ["restricted", "not-recommended"];

export type Concordance = "concordant" | "discordant" | "partial";

/** Concordant when every body that has appraised it is positive; discordant when at least one is negative. */
export function concordanceOf(e: Pick<GuidelineMapEntry, "bodies">): Concordance {
  const appraised = e.bodies.filter((b) => b.stance !== "not-appraised");
  if (appraised.some((b) => NEGATIVE.includes(b.stance))) return appraised.some((b) => POSITIVE.includes(b.stance)) ? "discordant" : "partial";
  return appraised.length < e.bodies.length ? "partial" : "concordant";
}

export const STANCE_LABEL: Record<Stance, string> = { preferred: "Preferred", recommended: "Recommended", restricted: "Restricted", "not-recommended": "Not recommended", "not-appraised": "Not appraised" };
export const STANCE_CLASS: Record<Stance, string> = {
  preferred: "bg-emerald-200 text-emerald-950 dark:bg-emerald-800/70 dark:text-emerald-50",
  recommended: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/50 dark:text-emerald-100",
  restricted: "bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100",
  "not-recommended": "bg-rose-100 text-rose-900 dark:bg-rose-900/40 dark:text-rose-100",
  "not-appraised": "bg-foreground/5 text-muted",
};

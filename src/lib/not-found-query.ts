import { KIND_META, KINDS, type Kind } from "./schema";
import { issueUrl } from "./issue-links";

/**
 * Pure helpers behind the 404 page: turn a failed path into search words, remember misses in this browser,
 * and build the prefilled bug report. Nothing here touches the DOM, so the page's client component stays thin
 * and the logic is unit-tested.
 */

/** Path words that never help a search: kind hubs, file extensions and site plumbing. */
const NOISE = new Set<string>([
  ...KINDS.flatMap((k) => [KIND_META[k].route, KIND_META[k].plural, KIND_META[k].label.toLowerCase()].flatMap((s) => s.toLowerCase().split(/[^a-z0-9]+/))),
  "index", "html", "htm", "php", "aspx", "www", "amp", "page", "pages", "api", "v1", "en", "zh", "json", "xml", "onco", "cc",
]);

/** Words of a failed path: decoded, lower-cased, split on / - _ . and other punctuation, without kind plurals, numbers or plumbing. */
export function pathTokens(pathname: string): string[] {
  let decoded = pathname;
  try { decoded = decodeURIComponent(pathname); } catch { decoded = pathname.replace(/%[0-9a-f]{0,2}/gi, " "); }
  const words = decoded.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
  const out: string[] = [];
  for (const w of words) {
    if (w.length < 2 || /^\d+$/.test(w) || NOISE.has(w) || out.includes(w)) continue;
    out.push(w);
  }
  return out;
}

/** The lexical search query for a failed path, or "" when the path holds nothing worth searching. */
export function pathToQuery(pathname: string): string {
  return pathTokens(pathname).join(" ");
}

const ROUTE_TO_KIND: Record<string, Kind> = Object.fromEntries(KINDS.map((k) => [KIND_META[k].route, k]));

/** The kind whose hub the failed path sits under (/drugs/anything/ gives "drug"), or null. */
export function kindFromPath(pathname: string): Kind | null {
  const first = pathname.replace(/^\/+/, "").split("/")[0]?.toLowerCase() ?? "";
  return ROUTE_TO_KIND[first] ?? null;
}

/** localStorage key holding the paths this browser has failed to find, newest last. */
export const MISSED_PATHS_KEY = "onco:missed-paths";
export const MISSED_PATHS_CAP = 50;

/** Append a miss to the list: a repeat moves to the end rather than duplicating, and the list keeps its newest 50. */
export function recordMiss(list: readonly string[], path: string): string[] {
  const next = list.filter((p) => p !== path);
  next.push(path);
  return next.slice(-MISSED_PATHS_CAP);
}

/** Read the stored list defensively: anything but an array of strings counts as empty. */
export function parseMissed(raw: string | null): string[] {
  if (!raw) return [];
  try {
    const v: unknown = JSON.parse(raw);
    return Array.isArray(v) ? v.filter((x): x is string => typeof x === "string") : [];
  } catch { return []; }
}

/** The "Report this broken link" issue: the bug form with the address and, when known, the page that linked here. */
export function brokenLinkIssueUrl(path: string, referrer?: string): string {
  const url = `https://onco.cc${path}`;
  const what = [`Broken link: ${url} showed the not-found page.`, referrer ? `Linked from: ${referrer}` : "", "Expected: the page, or a redirect to where it moved."].filter(Boolean).join("\n");
  return issueUrl("bug", { url, what }, { title: `bug: broken link ${path}` });
}

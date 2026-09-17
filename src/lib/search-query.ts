/**
 * Pure helpers for the search results page (/search/?q=&kind=): query normalisation, the
 * question heuristic that decides whether to offer an Ask OnCo answer, and the shareable URLs.
 * Browser-safe, no graph, no data imports.
 */

/** Longest query the page will run; anything longer is pasted text, not a search. */
export const MAX_QUERY = 200;

/** Fewer word-and-concept hits than this and the page offers "Did you mean" suggestions. */
export const FEW_HITS = 3;

/** Openers that make a query read as a question even without a question mark. */
const QUESTION_OPENERS = /^(what|how|why|is|does|can|which|who|where|when|are|should|do|will|could)\b/i;

/** Trim, collapse whitespace, straighten curly quotes and strip wrapping quotes. Case is kept: MiniSearch lower-cases itself. */
export function normaliseQuery(raw: string | null | undefined): string {
  if (!raw) return "";
  let q = raw.replace(/[‘’‚]/g, "'").replace(/[“”„]/g, '"').replace(/\s+/g, " ").trim();
  if (q.length >= 2 && ((q.startsWith('"') && q.endsWith('"')) || (q.startsWith("'") && q.endsWith("'")))) q = q.slice(1, -1).trim();
  return q.length > MAX_QUERY ? q.slice(0, MAX_QUERY).trim() : q;
}

/** The words MiniSearch should see: a trailing question mark or full stop adds nothing to a word search. */
export function searchTerms(q: string): string {
  return normaliseQuery(q).replace(/[?!.]+$/g, "").trim();
}

/** "what is her2?", "How does Enhertu work", "is TNBC hereditary": a question, so Ask OnCo can have a go. */
export function looksLikeQuestion(q: string): boolean {
  const n = normaliseQuery(q);
  if (!n) return false;
  if (n.endsWith("?")) return true;
  // A lone opener ("what", "how") is not a question yet; it needs something to ask about.
  return QUESTION_OPENERS.test(n) && n.split(" ").length >= 2;
}

/** The kinds a `?kind=` value may take; anything else is ignored rather than trusted. */
export function parseKind(value: string | null | undefined, allowed: readonly string[]): string | null {
  if (!value) return null;
  const v = value.trim().toLowerCase();
  return allowed.includes(v) ? v : null;
}

export type SearchState = { q: string; kind: string | null };

/** Read the page state from a query string ("?q=…&kind=…"). */
export function parseSearchState(search: string, allowedKinds: readonly string[]): SearchState {
  const p = new URLSearchParams(search.startsWith("?") ? search.slice(1) : search);
  return { q: normaliseQuery(p.get("q")), kind: parseKind(p.get("kind"), allowedKinds) };
}

/** Query string for a state, or "" when there is nothing to keep. Every state of the page is shareable through this. */
export function searchQueryString(state: SearchState): string {
  const p = new URLSearchParams();
  const q = normaliseQuery(state.q);
  if (q) p.set("q", q);
  if (state.kind && q) p.set("kind", state.kind);
  const s = p.toString();
  return s ? `?${s}` : "";
}

export function searchHref(q: string, kind: string | null = null): string {
  return `/search/${searchQueryString({ q, kind })}`;
}

export function askHref(q: string): string {
  return `/ask/?q=${encodeURIComponent(normaliseQuery(q))}`;
}

/** Drop suggestions that only repeat the query, keep at most `max`, best first. */
export function usefulSuggestions(query: string, suggestions: Array<{ suggestion: string }>, max = 3): string[] {
  const q = searchTerms(query).toLowerCase();
  const out: string[] = [];
  for (const s of suggestions) {
    const t = s.suggestion.trim().toLowerCase();
    if (!t || t === q || out.includes(t)) continue;
    out.push(t);
    if (out.length >= max) break;
  }
  return out;
}

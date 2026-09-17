/**
 * The per-cancer appointment sheet (/prep/[id]/): what the reader knows, what is unclear, changes to discuss,
 * which questions are ticked, and the answers and next steps written after the visit. Browser-only state in
 * localStorage under one key, one entry per cancer; nothing is sent anywhere. SSR-safe like prep.ts.
 */
export type SheetState = {
  /** Keys of ticked corpus questions (see prep.ts `questionKey`); undefined means "all ticked". */
  picked?: string[];
  know: string;
  unclear: string;
  changes: string;
  answers: string;
  next: string;
  /** ISO timestamp of the last save. */
  savedAt?: string;
};

export const SHEET_KEY = "onco:prep-sheet:v1";
export const EMPTY_SHEET: SheetState = { know: "", unclear: "", changes: "", answers: "", next: "" };

type Store = Record<string, Partial<SheetState>>;

function readStore(): Store {
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(SHEET_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : {};
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? (parsed as Store) : {};
  } catch {
    return {};
  }
}

const str = (v: unknown) => (typeof v === "string" ? v : "");

export function loadSheet(cancerId: string): SheetState {
  const s = readStore()[cancerId];
  if (!s) return { ...EMPTY_SHEET };
  return {
    picked: Array.isArray(s.picked) ? s.picked.filter((x): x is string => typeof x === "string") : undefined,
    know: str(s.know), unclear: str(s.unclear), changes: str(s.changes), answers: str(s.answers), next: str(s.next),
    savedAt: typeof s.savedAt === "string" ? s.savedAt : undefined,
  };
}

export function saveSheet(cancerId: string, s: SheetState): SheetState {
  const next = { ...s, savedAt: new Date().toISOString() };
  if (typeof window !== "undefined") window.localStorage.setItem(SHEET_KEY, JSON.stringify({ ...readStore(), [cancerId]: next }));
  return next;
}

export function clearSheet(cancerId: string) {
  if (typeof window === "undefined") return;
  const store = readStore();
  delete store[cancerId];
  window.localStorage.setItem(SHEET_KEY, JSON.stringify(store));
}

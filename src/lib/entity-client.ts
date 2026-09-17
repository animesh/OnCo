/**
 * Browser loader for one record with its neighbours, /api/v1/entities/<id>.json. Fetched once per id and
 * cached for the session, so Ask OnCo and the search page's "Related" strip share requests.
 */
import type { AskEntityRecord } from "./ask-compose";

const cache = new Map<string, Promise<AskEntityRecord | null>>();

/** Resolves to null when the id is unknown or the network fails; never throws. */
export function loadEntityRecord(id: string): Promise<AskEntityRecord | null> {
  let p = cache.get(id);
  if (!p) {
    p = fetch(`/api/v1/entities/${encodeURIComponent(id)}.json`).then(async (r) => (r.ok ? ((await r.json()) as AskEntityRecord) : null)).catch(() => null);
    cache.set(id, p);
  }
  return p;
}

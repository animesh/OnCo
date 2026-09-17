"use client";

import { useCallback } from "react";
import { useProfile } from "./profile";

/**
 * The reader's remembered cancer: one id, stored with the browser profile (`onco:profile:v1`, field `cancerId`),
 * so the choice made in "For me" follows them to the header chip, the home page, the cancer hub, the trials list
 * and search. Nothing leaves the browser. This file has no graph access: callers pass the small list of cancers
 * (id, name, route) from a server component and resolve the id against it.
 */
export type MyCancerLite = { id: string; name: string; route: string };

/** The remembered cancer id, whether storage has been read yet, and setters that persist. */
export function useMyCancer(): { id: string | undefined; ready: boolean; set: (id: string | undefined) => void; clear: () => void } {
  const [profile, update, ready] = useProfile();
  const set = useCallback((id: string | undefined) => update({ cancerId: id }), [update]);
  const clear = useCallback(() => update({ cancerId: undefined }), [update]);
  return { id: profile.cancerId, ready, set, clear };
}

/** Resolve the remembered id against the list the page shipped; undefined when unset or unknown. */
export function pickMyCancer<T extends MyCancerLite>(cancers: readonly T[], id: string | undefined): T | undefined {
  return id ? cancers.find((c) => c.id === id) : undefined;
}

/**
 * A name short enough for a header chip. An upper-case abbreviation in brackets wins ("Non-small cell lung cancer (NSCLC)"
 * -> "NSCLC"); otherwise the bracketed qualifier is dropped and long names are cut at a word boundary.
 */
export function shortCancerName(name: string, max = 26): string {
  const m = name.match(/\(([A-Z][A-Z0-9-]{1,7})\)/);
  if (m) return m[1];
  const bare = name.replace(/\s*\([^)]*\)\s*$/, "").trim();
  if (bare.length <= max) return bare;
  const cut = bare.slice(0, max + 1);
  const at = cut.lastIndexOf(" ");
  return `${(at > 8 ? cut.slice(0, at) : bare.slice(0, max)).replace(/[\s,;:]+$/, "")}…`;
}

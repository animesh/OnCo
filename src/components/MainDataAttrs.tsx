"use client";

import { useEffect } from "react";

/**
 * Keeps `data-onco-id` and `data-onco-kind` on `<main>` in step with the record on screen. The static HTML gets the
 * same attributes from the inline script in `MachineLinks`; this covers client-side navigation, where inline scripts
 * do not run again, and clears them when the reader leaves record pages.
 */
export function MainDataAttrs({ id, kind }: { id: string; kind: string }) {
  useEffect(() => {
    const main = document.getElementById("main");
    if (!main) return;
    main.dataset.oncoId = id;
    main.dataset.oncoKind = kind;
    return () => { delete main.dataset.oncoId; delete main.dataset.oncoKind; };
  }, [id, kind]);
  return null;
}

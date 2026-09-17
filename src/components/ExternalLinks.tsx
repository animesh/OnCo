"use client";

import { useEffect } from "react";

/**
 * Every link that leaves onco.cc opens in a new tab, so a reader mid-research keeps their place. One delegated
 * listener on the document covers links rendered anywhere (records, tables, markdown) without touching each one;
 * links that already set a target, download links and same-origin links are left alone.
 */
export function ExternalLinks() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || a.target || a.hasAttribute("download")) return;
      let url: URL;
      try { url = new URL(a.href, window.location.href); } catch { return; }
      if (!/^https?:$/.test(url.protocol) || url.host === window.location.host) return;
      a.target = "_blank";
      a.rel = a.rel ? `${a.rel} noopener` : "noopener";
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);
  return null;
}

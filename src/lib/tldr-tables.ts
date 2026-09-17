"use client";
import { useEffect, useState } from "react";
import type { Lang } from "@/lib/layer";

/**
 * Translated and simplified TL;DR tables, loaded on demand. Each table is a megabyte or more of text; importing them
 * statically put every language into every page's JavaScript. A reader who stays in English downloads none of them, and
 * a reader who picks Chinese downloads Chinese once.
 */
export type TldrTable = Record<string, string>;
export type TableKey = Exclude<Lang, "en"> | "simple";

const LOADERS: Record<TableKey, () => Promise<TldrTable>> = {
  es: () => import("@/data/i18n/es").then((m) => m.tldr_es),
  zh: () => import("@/data/i18n/zh").then((m) => m.tldr_zh),
  pt: () => import("@/data/i18n/pt").then((m) => m.tldr_pt),
  hi: () => import("@/data/i18n/hi").then((m) => m.tldr_hi),
  fr: () => import("@/data/i18n/fr").then((m) => m.tldr_fr),
  de: () => import("@/data/i18n/de").then((m) => m.tldr_de),
  ja: () => import("@/data/i18n/ja").then((m) => m.tldr_ja),
  ar: () => import("@/data/i18n/ar").then((m) => m.tldr_ar),
  simple: () => import("@/data/simple").then((m) => m.simple),
};

const loaded = new Map<TableKey, TldrTable>();
const pending = new Map<TableKey, Promise<TldrTable>>();

export function loadTable(key: TableKey): Promise<TldrTable> {
  const have = loaded.get(key);
  if (have) return Promise.resolve(have);
  let p = pending.get(key);
  if (!p) { p = LOADERS[key]().then((t) => { loaded.set(key, t); pending.delete(key); return t; }); pending.set(key, p); }
  return p;
}

/** The table for `key`, or undefined until it has loaded (English text is shown meanwhile). `null` means none is needed. */
export function useTable(key: TableKey | null): TldrTable | undefined {
  const [ready, setReady] = useState<{ key: TableKey; table: TldrTable } | null>(null);
  useEffect(() => {
    if (!key || loaded.has(key)) return;
    let live = true;
    loadTable(key).then((t) => { if (live) setReady({ key, table: t }); });
    return () => { live = false; };
  }, [key]);
  if (!key) return undefined;
  return loaded.get(key) ?? (ready && ready.key === key ? ready.table : undefined);
}

/** Which table a reader's layer needs: simplified English, a translation, or none. */
export function tableKeyFor(level: string, lang: Lang): TableKey | null {
  if (level === "simple") return "simple";
  return lang === "en" ? null : lang;
}

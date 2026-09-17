"use client";

import { useLayer, type Lang } from "@/lib/layer";
import { t } from "@/lib/i18n/ui";
import { reviewed } from "@/data/i18n/reviewed";
import { tableKeyFor, useTable, type TldrTable } from "@/lib/tldr-tables";

type Mark = { text: string; title: string; tone: "muted" | "ok" };

/** The TL;DR for `id` in `lang` when the loaded table has one, else the English text. For tables and cards. */
export function tldrFor(id: string, tldr: string, lang: Lang, table?: TldrTable): string {
  if (lang === "en" || !table) return tldr;
  return table[id] ?? tldr;
}

/** Which mark to show beside a translated TL;DR: reviewed by a named speaker, machine-assisted, or English fallback. */
export function translationMark(id: string, lang: Lang, hasTranslation: boolean): Mark | null {
  if (lang === "en") return null;
  if (!hasTranslation) return { text: t("tldr.en", lang), title: t("tldr.enTitle", lang), tone: "muted" };
  const r = reviewed[id]?.filter((x) => x.lang === lang).sort((a, b) => b.date.localeCompare(a.date))[0];
  if (r) return { text: t("tldr.reviewed", lang), title: t("tldr.reviewedTitle", lang, { reviewer: `${r.reviewer}${r.role ? `, ${r.role}` : ""}`, date: r.date }), tone: "ok" };
  return { text: t("tldr.mt", lang), title: t("tldr.mtTitle", lang), tone: "muted" };
}

/**
 * Renders the TL;DR for an entity in the reader's chosen level and language.
 *  - level "simple": the simplified text when one exists (English only), else the TL;DR
 *  - lang != en:      the translated TL;DR when one exists, marked "Reviewed" or "MT" (machine-assisted),
 *                     else English with an EN mark
 * Server renders the English TL;DR; the client swaps after hydration.
 */
export function TldrText({ id, tldr, simple: simpleProp, className = "" }: { id: string; tldr: string; simple?: string; className?: string }) {
  const [layer] = useLayer();
  const table = useTable(layer.level === "simple" && simpleProp ? null : tableKeyFor(layer.level, layer.lang));
  let text = tldr;
  let mark: Mark | null = null;
  let hasTranslation = false;
  if (layer.level === "simple") {
    const s = simpleProp ?? table?.[id];
    if (s) text = s;
  } else if (layer.lang !== "en" && table) {
    // Until the language table has loaded the English text shows without a mark, so nothing flashes "EN" and then changes.
    const tr = table[id];
    if (tr) { text = tr; hasTranslation = true; }
    mark = translationMark(id, layer.lang, !!tr);
  }
  // The text's own language: English when it is a simplified or untranslated fallback, so screen readers and
  // browser translation treat it correctly even when <html lang> is something else.
  const textLang = layer.level === "simple" || !hasTranslation ? "en" : layer.lang;
  return (
    <span className={className} lang={textLang}>
      {text}
      {mark && (
        <span lang={layer.lang} className={`ms-1.5 align-middle text-[10px] font-semibold border rounded px-1 ${mark.tone === "ok" ? "text-emerald-800 border-emerald-300 dark:text-emerald-200 dark:border-emerald-800" : "text-muted border-border"}`} title={mark.title}>{mark.text}</span>
      )}
    </span>
  );
}

/** Languages in which this id's translation has a named review. */
export function reviewedLangs(id: string): Lang[] {
  return [...new Set((reviewed[id] ?? []).map((r) => r.lang))];
}

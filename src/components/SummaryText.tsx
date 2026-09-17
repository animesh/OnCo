"use client";

import { useState, type ReactNode } from "react";
import { LANGS, useLayer } from "@/lib/layer";
import { dirFor, useT } from "@/lib/i18n/ui";
import { paragraphs } from "@/lib/text";
import { translationFixUrl } from "@/lib/issue-links";
import type { Kind } from "@/lib/schema";
import type { SummaryLang, SummaryTranslations } from "@/lib/summary-translations";

/**
 * The long summary of a record in the reader's language when a valid machine translation exists, else the English.
 *
 * The server renders the English (the children: paragraphs with term hovers, lang="en"). After hydration, when the
 * site language is not English and `translations` holds that language, the translation replaces it, marked with its
 * own `lang` and `dir`, a line saying it is machine translated with a link to the translation-fix issue form
 * (record and language prefilled), and a toggle back to the English. `translations` is the small per-record map from
 * summaryTranslationsFor (only hashes matching the current English reach here), never a whole dictionary.
 */
export function SummaryText({ e, translations, children }: { e: { kind: Kind; id: string; name: string }; translations: SummaryTranslations; children: ReactNode }) {
  const [layer] = useLayer();
  const { t } = useT();
  const [showEnglish, setShowEnglish] = useState(false);
  const lang = layer.lang;
  const tr = lang === "en" ? undefined : translations[lang as SummaryLang];
  if (!tr) return <>{children}</>;
  const native = LANGS.find((l) => l.code === lang)?.native ?? lang;
  const label = LANGS.find((l) => l.code === lang)?.label ?? lang;
  const line = "mt-2 text-xs text-muted flex flex-wrap items-center gap-x-2 gap-y-1";
  if (showEnglish) {
    return (
      <div>
        {children}
        <p className={line} lang={lang}>
          <button type="button" onClick={() => setShowEnglish(false)} className="underline">{t("summary.showTranslation", { lang: native })}</button>
        </p>
      </div>
    );
  }
  return (
    <div>
      <div lang={lang} dir={dirFor(lang)} className="prose-onco text-[15px] leading-relaxed max-w-3xl">
        {paragraphs(tr.text).map((p, i) => <p key={i}>{p}</p>)}
      </div>
      <p className={line} lang={lang} dir={dirFor(lang)} title={`${tr.model}, ${tr.date}`}>
        <span>{t("summary.mt")};</span>
        <a href={translationFixUrl(e, label, { model: tr.model, date: tr.date })} target="_blank" rel="noopener noreferrer" className="underline">{t("summary.mtReport")}</a>
        <span aria-hidden="true">·</span>
        <button type="button" onClick={() => setShowEnglish(true)} className="underline">{t("summary.showEnglish")}</button>
      </p>
    </div>
  );
}

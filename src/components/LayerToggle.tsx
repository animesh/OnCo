"use client";

import { useEffect, useRef, useState } from "react";
import { LANGS, LEVELS, LAYER_KEY, useLayer } from "@/lib/layer";
import { useT, type UiKey } from "@/lib/i18n/ui";

/** Compact header control for reading level and site language. */
export function LayerToggle({ className = "" }: { className?: string }) {
  const [layer, update] = useLayer();
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDoc); document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onKey); };
  }, []);

  const lang = LANGS.find((l) => l.code === layer.lang) ?? LANGS[0];
  const level = LEVELS.find((l) => l.code === layer.level) ?? LEVELS[0];
  const levelLabel = (code: string) => t(`level.${code}` as UiKey);
  const nonDefault = layer.level !== "technical" || layer.lang !== "en";

  return (
    <div ref={box} className={`relative ${className}`}>
      <button type="button" onClick={() => setOpen((o) => !o)} aria-haspopup="dialog" aria-expanded={open} aria-label={t("layer.aria")}
        className={`ctl px-2.5 ${nonDefault ? "border-accent bg-accent-soft" : ""}`} title={`${levelLabel(level.code)} · ${lang.native}`}>
        {/* Both runs of text share one baseline (see .ctl-text), whatever their sizes. */}
        <span className="ctl-text">
          <span aria-hidden className="font-semibold tracking-tight">Aa</span>
          <span className="ctl-label text-muted xl:hidden 2xl:inline">{lang.code.toUpperCase()}</span>
        </span>
      </button>
      {/* Phones: span the viewport below the header (an end-anchored 18rem panel would run off the far edge). */}
      {open && (
        <div role="dialog" aria-label={t("layer.aria")} className="fixed inset-x-4 top-[calc(var(--header-h)+0.375rem)] z-50 sm:absolute sm:inset-x-auto sm:end-0 sm:top-full sm:mt-1.5 sm:w-72 card shadow-pop p-3 text-sm">
          <div className="kicker mb-1.5">{t("layer.readingLevel")}</div>
          <div className="flex rounded-lg border border-border overflow-hidden mb-1.5 p-0.5 gap-0.5 bg-surface">
            {LEVELS.map((l) => (
              <button key={l.code} type="button" onClick={() => update({ level: l.code })} aria-pressed={layer.level === l.code}
                className={`flex-1 rounded-md px-2 py-1.5 transition-colors ${layer.level === l.code ? "bg-foreground text-background font-medium shadow-sm" : "hover:bg-card"}`}>{levelLabel(l.code)}</button>
            ))}
          </div>
          <p className="text-xs text-muted mb-3 leading-relaxed">{t(`level.${level.code}.blurb` as UiKey)}.</p>
          <div className="kicker mb-1.5">{t("layer.siteLanguage")}</div>
          <div className="grid grid-cols-3 gap-1">
            {LANGS.map((l) => (
              <button key={l.code} type="button" onClick={() => update({ lang: l.code })} title={l.label} lang={l.code} aria-pressed={layer.lang === l.code}
                className={`rounded-md border px-1 py-1.5 text-xs transition-colors ${layer.lang === l.code ? "bg-foreground text-background border-foreground font-medium" : "border-border hover:bg-surface"}`}>{l.native}</button>
            ))}
          </div>
          <p className="text-[11px] text-muted mt-2.5 leading-relaxed">{t("layer.blurb")}</p>
          {nonDefault && <button type="button" onClick={() => update({ level: "technical", lang: "en" })} className="mt-2 text-xs underline text-muted hover:text-foreground">{t("reset")}</button>}
        </div>
      )}
    </div>
  );
}

/**
 * Inline script that applies the saved language to <html> before first paint: `lang` so the browser offers
 * translation straight away, `dir="rtl"` for Arabic so the layout does not flip after hydration, and the
 * data attributes CSS keys off. Mirrors `applyLayer` in src/lib/layer.ts.
 */
export function LayerScript() {
  const js = `try{var l=JSON.parse(localStorage.getItem(${JSON.stringify(LAYER_KEY)})||"{}");var g=l.lang||"en";var h=document.documentElement;h.lang=g;h.dir=g==="ar"?"rtl":"ltr";h.dataset.lang=g;h.dataset.level=l.level||"technical"}catch(e){}`;
  return <script dangerouslySetInnerHTML={{ __html: js }} />;
}

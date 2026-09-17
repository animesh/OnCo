"use client";

import { useEffect, useRef, useState } from "react";
import { REGION_META, REGION_ORDER, useRegion, guessRegion } from "@/lib/region";
import { useT, type UiKey } from "@/lib/i18n/ui";

/** Header control: which country's regulator decides what "approved" means on this site. Not a language switch. */
export function RegionToggle() {
  const { region, setRegion } = useRegion();
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDoc); document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onKey); };
  }, [open]);
  const countryName = (r: string) => t(`country.${r}` as UiKey);
  const meta = region ? { label: countryName(region), regulator: REGION_META[region].regulator, flag: REGION_META[region].flag } : { label: t("region.global"), regulator: t("region.allRegulators"), flag: "🌐" };
  return (
    <div ref={box} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)} aria-haspopup="listbox" aria-expanded={open} aria-label={t("region.aria", { region: meta.label })} title={t("region.title", { region: meta.label, regulator: meta.regulator })}
        className="ctl px-2 gap-1.5 text-sm">
        <span aria-hidden className="text-base leading-none">{meta.flag}</span>
        <span className="hidden sm:inline xl:hidden 2xl:inline text-xs font-medium">{region}</span>
      </button>
      {open && (
        <div role="listbox" aria-label={t("region.listbox")} className="absolute end-0 top-full mt-1.5 z-50 card shadow-pop w-72 p-1.5 max-sm:fixed max-sm:inset-x-3 max-sm:top-[calc(var(--header-h)+0.375rem)] max-sm:w-auto max-sm:max-h-[75vh] max-sm:overflow-y-auto">
          <div className="px-2.5 pt-1.5 pb-2 text-xs text-muted leading-snug">
            {t("region.intro").split("{approved}").map((part, i, arr) => <span key={i}>{part}{i < arr.length - 1 && <span className="font-medium text-foreground">{t("region.approved")}</span>}</span>)}
          </div>
          <button role="option" aria-selected={region === null} onClick={() => { setRegion(null); window.setTimeout(() => setOpen(false), 80); }} className={`w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-start text-sm hover:bg-surface ${region === null ? "bg-surface font-medium" : ""}`}>
            <span aria-hidden className="text-lg leading-none">🌐</span>
            <span className="min-w-0"><span className="block leading-snug">{t("region.global")}</span><span className="block text-xs text-muted leading-snug">{t("region.globalBlurb")}</span></span>
            {region === null && <span className="ms-auto text-xs text-accent">{t("selected")}</span>}
          </button>
          <button type="button" onClick={() => { setRegion(guessRegion()); window.setTimeout(() => setOpen(false), 80); }} className="w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-start text-sm hover:bg-surface text-muted"><span aria-hidden className="text-lg leading-none">📍</span><span className="leading-snug">{t("region.useBrowser")}</span></button>
          <div className="my-1 border-t border-border" />
          {REGION_ORDER.map((r) => {
            const m = REGION_META[r];
            const on = r === region;
            return (
              <button key={r} role="option" aria-selected={on} onClick={() => { setRegion(r); window.setTimeout(() => setOpen(false), 80); }}
                className={`w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-start text-sm hover:bg-surface ${on ? "bg-surface font-medium" : ""}`}>
                <span aria-hidden className="text-lg leading-none">{m.flag}</span>
                <span className="min-w-0"><span className="block leading-snug">{countryName(r)}</span><span className="block text-xs text-muted leading-snug">{m.regulator}</span></span>
                {on && <span className="ms-auto text-xs text-accent">{t("selected")}</span>}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

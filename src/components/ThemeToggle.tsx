"use client";

import { useEffect, useState } from "react";
import { useT, type UiKey } from "@/lib/i18n/ui";

export type Theme = "system" | "light" | "dark" | "contrast";
const KEY = "onco:theme";
const ORDER: Theme[] = ["light", "dark", "contrast", "system"];
/** Drawn icons (not text glyphs), so each one sits on the control's centre like the other header icons. */
const S = { fill: "none", stroke: "currentColor", strokeWidth: 1.75, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const ICON: Record<Theme, React.ReactElement> = {
  light: <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden {...S}><circle cx="12" cy="12" r="4" /><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8" /></svg>,
  dark: <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden {...S}><path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" /></svg>,
  contrast: <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden {...S}><circle cx="12" cy="12" r="8.5" /><path d="M12 3.5v17A8.5 8.5 0 0 0 12 3.5Z" fill="currentColor" stroke="none" /></svg>,
  system: <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden {...S}><rect x="3" y="4.5" width="18" height="12" rx="2" /><path d="M8 20h8M12 16.5V20" /></svg>,
};

function apply(t: Theme) {
  const root = document.documentElement;
  if (t === "system") root.removeAttribute("data-theme"); else root.setAttribute("data-theme", t);
}

/**
 * Theme switch: auto (follows the OS), light, dark, high contrast. Persisted in localStorage and
 * applied via data-theme on <html>; CSS variables for each live near the top of globals.css.
 * Render <ThemeScript /> in <head> (or the top of <body>) to apply the saved theme before paint.
 */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const [theme, setTheme] = useState<Theme>("light");
  const { t } = useT();
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const saved = localStorage.getItem(KEY) as Theme | null;
      if (saved && ORDER.includes(saved)) setTheme(saved);
    });
    return () => cancelAnimationFrame(id);
  }, []);
  const set = (th: Theme) => { setTheme(th); localStorage.setItem(KEY, th); apply(th); };
  const next = ORDER[(ORDER.indexOf(theme) + 1) % ORDER.length];
  const label = (th: Theme) => t(`theme.${th}` as UiKey);
  return (
    <button type="button" onClick={() => set(next)} title={t("theme.title", { current: label(theme), next: label(next) })} aria-label={t("theme.aria", { current: label(theme), next: label(next) })}
      className={`ctl ctl-icon ${className}`}>
      {ICON[theme]}
    </button>
  );
}

/** Inline script that applies the saved theme before first paint (avoids a flash). */
export function ThemeScript() {
  // Light is the default; "system" follows the OS only when a reader chooses it.
  const js = `try{var t=localStorage.getItem("${KEY}")||"light";if(t!=="system"){document.documentElement.setAttribute("data-theme",t)}}catch(e){document.documentElement.setAttribute("data-theme","light")}`;
  return <script dangerouslySetInnerHTML={{ __html: js }} />;
}

"use client";

import { useEffect, useState } from "react";
import { useT, type UiKey } from "@/lib/i18n/ui";

export type Theme = "system" | "light" | "dark" | "contrast";
const KEY = "onco:theme";
const ORDER: Theme[] = ["light", "dark", "contrast", "system"];
const ICON: Record<Theme, string> = { system: "◐", light: "☀", dark: "☾", contrast: "◑" };

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
      <span aria-hidden className="text-base leading-none">{ICON[theme]}</span>
    </button>
  );
}

/** Inline script that applies the saved theme before first paint (avoids a flash). */
export function ThemeScript() {
  // Light is the default; "system" follows the OS only when a reader chooses it.
  const js = `try{var t=localStorage.getItem("${KEY}")||"light";if(t!=="system"){document.documentElement.setAttribute("data-theme",t)}}catch(e){document.documentElement.setAttribute("data-theme","light")}`;
  return <script dangerouslySetInnerHTML={{ __html: js }} />;
}

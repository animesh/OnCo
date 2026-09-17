"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useT } from "@/lib/i18n/ui";

/** `label` is the English section name; it is translated through the chrome dictionary where a translation exists. */
export type Tab = { id: string; label: string; content: ReactNode; count?: number };

/** Below the site header (3.5rem) plus this bar (3rem): where sticky table headers should stop. */
const CONTENT_STYLE = { "--sticky-top": "calc(var(--header-h) + 3rem)" } as CSSProperties;

/**
 * Section navigator for long object pages. All sections are rendered one after another so the
 * page reads top to bottom (and so print gets every section, see PrintButton); a sticky, high-contrast
 * bar lists the sections, highlights the one in view (scroll-spy), and scrolls to a section on click.
 * The section id is kept in the URL hash and on the bar as `data-active` for other components.
 *
 * Accessibility: the bar is navigation (a list of same-page links), not a tablist, because no panel is ever
 * hidden; `aria-current` marks the section in view and Left/Right/Home/End move focus between the tabs.
 * The tabs form one compact strip (shared hairline, rounded ends, active tab filled); the count on each tab
 * is hidden while it is active, since the reader is looking at the objects themselves.
 */
export function Tabs({ tabs, ariaLabel }: { tabs: Tab[]; ariaLabel?: string }) {
  const [active, setActive] = useState(tabs[0]?.id);
  const { t: tT, tl } = useT();
  const bar = useRef<HTMLDivElement>(null);
  const suppress = useRef(false);

  const jump = (id: string, smooth = true) => {
    const el = document.getElementById(`sec-${id}`);
    if (!el) return;
    suppress.current = true;
    setActive(id);
    window.history.replaceState(null, "", `#${id}`);
    const top = el.getBoundingClientRect().top + window.scrollY - 112;
    window.scrollTo({ top, behavior: smooth ? "smooth" : "auto" });
    setTimeout(() => { suppress.current = false; }, 700);
  };

  // Scroll-spy.
  useEffect(() => {
    const els = tabs.map((t) => document.getElementById(`sec-${t.id}`)).filter((x): x is HTMLElement => !!x);
    if (!els.length) return;
    const io = new IntersectionObserver((entries) => {
      if (suppress.current) return;
      const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (visible[0]) setActive(visible[0].target.id.replace(/^sec-/, ""));
    }, { rootMargin: "-120px 0px -60% 0px", threshold: 0 });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [tabs]);

  // Open on the hashed section.
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const h = window.location.hash.replace(/^#/, "");
      if (h && tabs.some((t) => t.id === h)) jump(h, false);
    });
    return () => cancelAnimationFrame(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Left/Right/Home/End move focus between tabs; Enter or Space on a focused tab follows the link as usual. */
  const onBarKey = (e: React.KeyboardEvent) => {
    if (!["ArrowRight", "ArrowLeft", "Home", "End"].includes(e.key)) return;
    const pills = [...(bar.current?.querySelectorAll<HTMLAnchorElement>("a[data-id]") ?? [])];
    if (!pills.length) return;
    const i = pills.indexOf(document.activeElement as HTMLAnchorElement);
    const next = e.key === "Home" ? 0 : e.key === "End" ? pills.length - 1 : e.key === "ArrowRight" ? (i + 1) % pills.length : (i - 1 + pills.length) % pills.length;
    e.preventDefault();
    pills[next].focus();
  };

  // Keep the active tab in view inside the bar.
  useEffect(() => {
    const el = bar.current?.querySelector<HTMLElement>(`[data-id="${active}"]`);
    el?.scrollIntoView({ block: "nearest", inline: "nearest" });
  }, [active]);

  return (
    <div>
      <nav ref={bar} aria-label={ariaLabel ?? tT("sections")} data-tabbar data-active={active} onKeyDown={onBarKey}
        className="tabbar sticky top-14 z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 h-12 bg-background/90 backdrop-blur border-b border-border flex items-center overflow-x-auto no-scrollbar">
        {/* One strip of adjoining tabs (see .tabstrip in globals.css); on phones the bar scrolls sideways and the active tab is kept in view. */}
        <div className="tabstrip">
          {tabs.map((t) => {
            const on = t.id === active;
            return (
              <a key={t.id} href={`#${t.id}`} data-id={t.id} onClick={(e) => { e.preventDefault(); jump(t.id); }} aria-current={on ? "true" : undefined} className="tab">
                <span>{tl(t.label)}</span>
                {t.count !== undefined && <span className="tab-count">{t.count}</span>}
              </a>
            );
          })}
        </div>
      </nav>
      <div className="pt-6 space-y-14" style={CONTENT_STYLE}>
        {tabs.map((t) => (
          <section key={t.id} id={`sec-${t.id}`} aria-labelledby={`h-${t.id}`} data-section={t.id} className="scroll-mt-28 print-section">
            {t.id === "overview" && <h2 id={`h-${t.id}`} className="sr-only print:not-sr-only print:text-xl print:font-semibold print:mb-3">{tl(t.label)}</h2>}
            {t.id !== "overview" && (
              <div className="flex items-baseline gap-3 mb-4 pb-2 border-b border-border">
                <h2 id={`h-${t.id}`} className="text-xl font-semibold tracking-tight">{tl(t.label)}</h2>
                {t.count !== undefined && <span className="text-sm text-muted tabular-nums">{t.count}</span>}
                <a href="#top" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="ms-auto text-xs text-muted hover:text-foreground hover:underline">{tT("top")} <span aria-hidden>↑</span></a>
              </div>
            )}
            {t.content}
          </section>
        ))}
      </div>
    </div>
  );
}

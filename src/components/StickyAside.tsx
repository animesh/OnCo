"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * The right-hand column of a record page (roadmap row 138).
 *
 * The outer div is the grid item. Grid items stretch to the row by default, so this column is always exactly as
 * tall as the main column when the main column is the taller of the two, and the sticky <aside> inside it has that
 * box as its containing block: it can travel down the page only until its bottom meets the column's bottom, which
 * is the main content's bottom, so it can never reach the footer. Sticky on the grid item itself (the old layout)
 * relied on the browser using the grid area as the constraint, which is where the overlap crept in. On a short page
 * the row is as tall as the aside, the aside sits at the top and there is nothing to stick to.
 *
 * When the aside is taller than the space under the header it does not stick at all: a pinned box taller than the
 * viewport can never be read to its bottom, and it would sit over whatever follows until the row ends. `topPx` is the
 * sticky offset in pixels (7rem for the header plus the tab bar); the measure includes it.
 */
export function StickyAside({ children, className = "", top = "lg:top-28", topPx = 112 }: { children: ReactNode; className?: string; top?: string; topPx?: number }) {
  const ref = useRef<HTMLElement>(null);
  const [tall, setTall] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => setTall(el.offsetHeight + topPx + 16 > window.innerHeight);
    // ResizeObserver reports once on observe, so the first measure happens without a synchronous state change here.
    const ro = new ResizeObserver(check);
    ro.observe(el);
    window.addEventListener("resize", check);
    return () => { ro.disconnect(); window.removeEventListener("resize", check); };
  }, [topPx]);

  return (
    <div className={`min-w-0 ${className}`}>
      <aside ref={ref} className={`space-y-4 ${tall ? "" : `lg:sticky ${top}`}`} data-tall={tall ? "" : undefined}>{children}</aside>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { Tip, COLUMN_TIPS } from "@/components/Tip";
import { useT } from "@/lib/i18n/ui";
import { fillNodes } from "@/components/T";

export type Column<T> = {
  key: string;
  /** English header; translated through the chrome dictionary where a translation exists. */
  label: string;
  render: (row: T, index: number) => ReactNode;
  sortable?: boolean;
  className?: string;
  /** Tailwind visibility classes, e.g. "hidden md:table-cell". */
  hide?: string;
  /** Plain-English explanation shown on hover of the header; falls back to COLUMN_TIPS by label. */
  tip?: string;
};

export type SortState = { key: string; dir: 1 | -1 };

/**
 * Full-width, sortable results table shared by the filterable views.
 * The header row sticks below the site header (see `--sticky-top` in globals.css); on small
 * screens the table scrolls sideways inside its card instead.
 */
export function ResultsTable<T>({ columns, rows, rowKey, sort, onSort, empty, scroll = false, pageSize }: {
  columns: Column<T>[]; rows: T[]; rowKey: (r: T) => string; sort?: SortState; onSort?: (key: string) => void; empty?: string;
  /** Keep the table scrolling sideways inside its card at every width (for tables wider than the page). */
  scroll?: boolean;
  /** When set, this many rows render at first and another page is added each time the reader nears the foot of the table; a Show all button remains for those who want everything at once. */
  pageSize?: number;
}) {
  const [limit, setLimit] = useState(pageSize ?? Infinity);
  // Reset the window when the rows change (a new filter or sort), the React pattern for state derived from props.
  const [prevRows, setPrevRows] = useState(rows);
  if (rows !== prevRows) { setPrevRows(rows); setLimit(pageSize ?? Infinity); }
  const { t, tl } = useT();
  const capped = pageSize !== undefined && rows.length > limit;
  const visible = capped ? rows.slice(0, limit) : rows;
  const foot = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!capped || !foot.current || typeof IntersectionObserver === "undefined") return;
    const el = foot.current;
    const io = new IntersectionObserver((entries) => { if (entries.some((e) => e.isIntersecting)) setLimit((n) => n + (pageSize ?? 0)); }, { rootMargin: "600px 0px" });
    io.observe(el);
    return () => io.disconnect();
  }, [capped, pageSize, limit]);
  return (
    <div className={`card results-table overflow-x-auto ${scroll ? "" : "lg:overflow-x-visible"}`}>
      <table className="onco">
        <thead>
          <tr>
            {columns.map((c) => {
              const tip = c.tip ?? COLUMN_TIPS[c.label];
              const sorted = sort?.key === c.key;
              const text = tl(c.label);
              const label = tip ? <Tip text={tip} title={text}><span className="underline decoration-dotted decoration-foreground/30 underline-offset-[3px] cursor-help">{text}</span></Tip> : text;
              return (
                <th key={c.key} scope="col" className={`${c.hide ?? ""} ${c.className ?? ""}`} aria-sort={sorted ? (sort!.dir === -1 ? "descending" : "ascending") : undefined}>
                  {c.sortable && onSort ? (
                    <button type="button" onClick={() => onSort(c.key)} className={`group inline-flex items-center gap-1 rounded-sm py-1.5 -my-1.5 ${sorted ? "text-foreground" : ""}`} title={sorted ? (sort!.dir === -1 ? t("table.sortedDesc") : t("table.sortedAsc")) : t("table.sortBy", { col: text })}>
                      {label}
                      <span aria-hidden className={`inline-block w-3 text-center text-[11px] leading-none ${sorted ? "text-accent" : "text-muted/40 group-hover:text-muted"}`}>
                        {sorted ? (sort!.dir === -1 ? "↓" : "↑") : "↕"}
                      </span>
                    </button>
                  ) : label}
                </th>
              );
            })}
          </tr>
        </thead>
        {/* Cells hold record data (English); cells that render translated text set their own lang. */}
        <tbody lang="en">
          {visible.map((r, i) => (
            <tr key={rowKey(r)}>
              {columns.map((c) => <td key={c.key} className={`${c.hide ?? ""} ${c.className ?? ""}`}>{c.render(r, i)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && <div className="px-6 py-12 text-center text-muted text-sm">{empty ?? t("table.nothingMatches")}</div>}
      {capped && <div ref={foot} className="px-4 py-3 border-t border-border text-sm"><button type="button" onClick={() => setLimit(Infinity)} className="underline">{t("table.showAll", { n: rows.length.toLocaleString("en-GB") })}</button> <span className="text-muted">{t("table.showingFirst", { n: pageSize })}</span></div>}
    </div>
  );
}

/** Toolbar row: filters at the start, count and controls at the end. The noun is translated when it is a kind plural. */
export function Toolbar({ left, right, count, total, noun }: { left: ReactNode; right?: ReactNode; count: number; total?: number; noun: string }) {
  const { t, noun: tn } = useT();
  const n = <span className="font-semibold tabular-nums">{count.toLocaleString("en-GB")}</span>;
  const line = total !== undefined && total !== count
    ? fillNodes(t("toolbar.countOf"), { count: n, total: <span className="text-muted">{total.toLocaleString("en-GB")}</span>, noun: <span className="text-muted">{tn(noun)}</span> })
    : fillNodes(t("toolbar.count"), { count: n, noun: <span className="text-muted">{tn(noun)}</span> });
  return (
    <div className="flex flex-wrap items-center gap-2 mb-3">
      {left}
      <div className="ms-auto flex items-center gap-3 text-sm whitespace-nowrap">
        <span aria-live="polite">{line}</span>
        {right}
      </div>
    </div>
  );
}

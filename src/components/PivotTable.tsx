"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FacetSelect } from "./filters/FacetSelect";
import { STATUS_LABEL } from "@/lib/text";
import { DownloadTable } from "./DownloadTable";
import type { CsvRow } from "@/lib/csv";

export type Fact = {
  id: string; kind: "drug" | "trial" | "technology"; name: string; route: string; status?: string; rank: number;
  dims: Record<Dim, string[]>;
};
export type Dim = "cancer" | "target" | "modality" | "company" | "front" | "status" | "phase";
export type DimMeta = Record<Dim, { label: string; ids?: Record<string, string>; /** Page for a header label, when the dimension is made of records (cancers, targets, companies). */ routes?: Record<string, string> }>;

const DIMS: Dim[] = ["cancer", "target", "modality", "company", "front", "status", "phase"];
const TIER_RANK: Record<string, number> = { approved: 6, "standard-of-care": 6, positive: 5, "phase-3": 5, established: 4, completed: 4, recruiting: 3, active: 3, "phase-2": 3, emerging: 2, "phase-1": 2, preclinical: 1, concept: 0, planned: 0, mixed: 1, historic: 0, negative: 0, withdrawn: 0 };
const TIER_LABEL = ["none", "preclinical", "phase 1 / emerging", "phase 2 / recruiting", "established", "phase 3 / positive", "approved"];
const TIER_BG = ["", "bg-violet-100 dark:bg-violet-900/30", "bg-violet-200 dark:bg-violet-900/50", "bg-amber-100 dark:bg-amber-900/40", "bg-sky-100 dark:bg-sky-900/40", "bg-sky-200 dark:bg-sky-900/60", "bg-emerald-200 dark:bg-emerald-900/60"];

export function PivotTable({ facts, meta }: { facts: Fact[]; meta: DimMeta }) {
  const [kind, setKind] = useState<Fact["kind"]>("drug");
  const [rowDim, setRowDim] = useState<Dim>("cancer");
  const [colDim, setColDim] = useState<Dim>("modality");
  const [minCount, setMinCount] = useState(1);

  const pool = useMemo(() => facts.filter((f) => f.kind === kind), [facts, kind]);

  const { rows, cols, cells } = useMemo(() => {
    const rowCount = new Map<string, number>(), colCount = new Map<string, number>();
    const cells = new Map<string, { n: number; best: number; ids: string[] }>();
    for (const f of pool) {
      const rs = f.dims[rowDim], cs = f.dims[colDim];
      for (const r of rs) rowCount.set(r, (rowCount.get(r) ?? 0) + 1);
      for (const c of cs) colCount.set(c, (colCount.get(c) ?? 0) + 1);
      const tier = TIER_RANK[f.status ?? ""] ?? 0;
      for (const r of rs) for (const c of cs) {
        const k = `${r}|${c}`;
        const cell = cells.get(k) ?? { n: 0, best: 0, ids: [] };
        cell.n++; cell.best = Math.max(cell.best, tier); cell.ids.push(f.id);
        cells.set(k, cell);
      }
    }
    const rows = [...rowCount.entries()].sort((a, b) => b[1] - a[1]).map(([k]) => k);
    const cols = [...colCount.entries()].sort((a, b) => b[1] - a[1]).map(([k]) => k);
    return { rows, cols, cells };
  }, [pool, rowDim, colDim]);

  const visibleRows = rows.filter((r) => cols.some((c) => (cells.get(`${r}|${c}`)?.n ?? 0) >= minCount));
  const visibleCols = cols.filter((c) => rows.some((r) => (cells.get(`${r}|${c}`)?.n ?? 0) >= minCount)).slice(0, 24);

  const linkFor = (r: string, c: string) => {
    const kindRoute = kind === "drug" ? "drugs" : kind === "trial" ? "trials" : "technologies";
    const cancerId = rowDim === "cancer" ? meta.cancer.ids?.[r] : colDim === "cancer" ? meta.cancer.ids?.[c] : undefined;
    return cancerId ? `/explore/?cancer=${cancerId}&kind=${kind}` : `/${kindRoute}/`;
  };
  const dimOptions = DIMS.map((d) => ({ value: d, label: meta[d].label }));
  const nounFor = (k: Fact["kind"]) => (k === "drug" ? "products" : k === "trial" ? "trials" : "technologies");
  const cellLabel = (dim: Dim, v: string) => (dim === "status" ? STATUS_LABEL[v] ?? v : v);
  /** The grid as shown: one record per visible row, one field per visible column, plus the row total. */
  const exportRows = (): CsvRow[] => visibleRows.map((r) => {
    const row: CsvRow = { [meta[rowDim].label]: cellLabel(rowDim, r) };
    for (const c of visibleCols) { const cell = cells.get(`${r}|${c}`); row[cellLabel(colDim, c)] = cell && cell.n >= minCount ? cell.n : 0; }
    row.Total = pool.filter((f) => f.dims[rowDim].includes(r)).length;
    return row;
  });

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <FacetSelect label="Count" options={[{ value: "drug", label: "Products" }, { value: "trial", label: "Trials" }, { value: "technology", label: "Technologies" }]} value={kind} onChange={(v) => { if (v) setKind(v as Fact["kind"]); }} searchable={false} allLabel="Products" width="w-44" />
        <FacetSelect label="Rows" options={dimOptions.filter((o) => o.value !== colDim)} value={rowDim} onChange={(v) => { if (v) setRowDim(v as Dim); }} searchable={false} allLabel="Cancer" width="w-44" />
        <FacetSelect label="Columns" options={dimOptions.filter((o) => o.value !== rowDim)} value={colDim} onChange={(v) => { if (v) setColDim(v as Dim); }} searchable={false} allLabel="Modality" width="w-44" />
        <button type="button" onClick={() => { setRowDim(colDim); setColDim(rowDim); }} className="text-sm underline text-muted">Swap axes</button>
        <label className="ml-auto text-sm flex items-center gap-2 text-muted">Min count <input type="number" min={1} value={minCount} onChange={(e) => setMinCount(Math.max(1, Number(e.target.value) || 1))} className="w-14 rounded-md border border-border bg-card px-2 py-1 text-sm" /></label>
        <span className="text-sm"><span className="font-semibold tabular-nums">{pool.length}</span> <span className="text-muted">{nounFor(kind)} · {visibleRows.length} × {visibleCols.length}</span></span>
        <DownloadTable rows={exportRows} name={`${nounFor(kind)} by ${meta[rowDim].label} and ${meta[colDim].label}`} />
      </div>
      <div className="card overflow-x-auto">
        <table className="onco text-xs">
          <thead>
            <tr>
              <th className="sticky left-0 bg-card z-10">{meta[rowDim].label} \ {meta[colDim].label}</th>
              {visibleCols.map((c) => { const href = meta[colDim].routes?.[c]; const label = colDim === "status" ? STATUS_LABEL[c] ?? c : c; return <th key={c} className="max-w-[120px] whitespace-normal align-bottom">{href ? <Link href={href} className="hover:underline">{label}</Link> : label}</th>; })}
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((r) => {
              const total = pool.filter((f) => f.dims[rowDim].includes(r)).length;
              return (
                <tr key={r}>
                  <td className="sticky left-0 bg-card z-10 font-medium whitespace-nowrap">{(() => { const href = meta[rowDim].routes?.[r]; const label = rowDim === "status" ? STATUS_LABEL[r] ?? r : r; return href ? <Link href={href} className="hover:underline">{label}</Link> : label; })()}</td>
                  {visibleCols.map((c) => {
                    const cell = cells.get(`${r}|${c}`);
                    if (!cell || cell.n < minCount) return <td key={c} className="text-center text-muted/40">·</td>;
                    return (
                      <td key={c} className={`text-center tabular-nums ${TIER_BG[cell.best]}`} title={`${cell.n} · best evidence: ${TIER_LABEL[cell.best]}\n${cell.ids.slice(0, 12).join(", ")}${cell.ids.length > 12 ? "…" : ""}`}>
                        <Link href={linkFor(r, c)} className="block font-semibold hover:underline">{cell.n}</Link>
                      </td>
                    );
                  })}
                  <td className="text-center tabular-nums text-muted">{total}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted">
        <span>Cell colour = best evidence tier in the cell:</span>
        {[6, 5, 4, 3, 2, 1].map((t) => <span key={t} className={`chip ${TIER_BG[t]}`}>{TIER_LABEL[t]}</span>)}
        <span className="ml-auto">Click a count to open the filtered list, or a cancer, target or company name to open its page. Hover for the ids. Columns capped at 24 by frequency.</span>
      </div>
      {cols.length > 24 && <p className="text-xs text-muted mt-1">Showing the 24 most frequent columns of {cols.length}. Raise the minimum count or swap axes to narrow.</p>}
    </div>
  );
}

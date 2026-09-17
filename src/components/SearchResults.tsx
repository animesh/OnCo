"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { SearchResult } from "minisearch";
import { loadSearch } from "./SearchBox";
import { MoleculeSlot } from "./MoleculeSlot";
import { FacetSelect } from "./filters/FacetSelect";
import type { SearchDoc } from "@/lib/search-index";
import { KIND_META, type Kind } from "@/lib/schema";
import { KIND_COLOR, STATUS_LABEL, statusClass } from "@/lib/text";
import { loadSemantic } from "@/lib/semantic-client";
import { fuseRanks, semanticSearch } from "@/lib/semantic";

type Row = SearchDoc & { lexical?: string[]; concept?: string[]; both: boolean; rank: number };

const TOP = 40;

/**
 * Full search results: lexical (MiniSearch over names, aliases, TL;DRs and tags) and concept search
 * (TF-IDF over each record plus the names of everything it links to) fused by reciprocal rank, with the
 * reason each hit matched. State lives in ?q= so results are shareable.
 */
export function SearchResults() {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<Row[] | null>(null);
  const [kind, setKind] = useState<string | null>(null);
  const [semanticReady, setSemanticReady] = useState<boolean | null>(null);
  const latest = useRef("");

  const run = useCallback(async (value: string) => {
    latest.current = value;
    if (!value.trim()) { setRows(null); return; }
    const [{ ms, byId }, index] = await Promise.all([loadSearch(), loadSemantic()]);
    if (latest.current !== value) return;
    setSemanticReady(!!index);
    const lexical = ms.search(value).slice(0, TOP) as SearchResult[];
    const concept = index ? semanticSearch(index, value, TOP) : [];
    const lexTerms = new Map(lexical.map((h) => [String(h.id), Object.keys(h.match ?? {})]));
    const conTerms = new Map(concept.map((h) => [h.id, h.matched.slice(0, 4)]));
    const fused = fuseRanks([lexical.map((h) => ({ id: String(h.id) })), concept]).slice(0, TOP);
    setRows(fused.map((f, i) => ({ ...byId.get(f.id)!, lexical: lexTerms.get(f.id), concept: conTerms.get(f.id), both: f.in.length === 2, rank: i + 1 })).filter((r) => r.id));
  }, []);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const p = new URLSearchParams(window.location.search);
      const initial = p.get("q") ?? "";
      if (initial) { setQ(initial); run(initial); }
    });
    return () => cancelAnimationFrame(id);
  }, [run]);
  useEffect(() => {
    const p = new URLSearchParams();
    if (q.trim()) p.set("q", q.trim());
    const qs = p.toString();
    window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  }, [q]);

  const kindCounts = useMemo(() => { const m = new Map<string, number>(); for (const r of rows ?? []) m.set(r.kind, (m.get(r.kind) ?? 0) + 1); return m; }, [rows]);
  const shown = (rows ?? []).filter((r) => !kind || r.kind === kind);

  return (
    <div>
      <form onSubmit={(e) => { e.preventDefault(); run(q); }} className="flex flex-wrap gap-2 mb-4">
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} autoFocus placeholder="drug for HER2-low breast cancer, PSMA radioligand trial, who leads ADC trials in Madrid…" aria-label="Search OnCo" className="flex-1 min-w-[16rem] rounded-lg border border-border bg-card px-3 py-3 text-base outline-none focus:ring-2 focus:ring-accent/40" />
        <button type="submit" className="rounded-lg bg-foreground text-background px-4 py-2 text-sm font-medium">Search</button>
        {q.trim() && <Link href={`/ask/?q=${encodeURIComponent(q.trim())}`} className="rounded-lg border border-border bg-card px-4 py-2 text-sm hover:bg-foreground/5">Ask OnCo this</Link>}
      </form>
      {rows && (
        <div className="flex flex-wrap items-center gap-3 mb-3 text-sm">
          <span className="text-muted">{shown.length} of {rows.length} results</span>
          <FacetSelect label="Kind" options={[...kindCounts.entries()].sort((a, b) => b[1] - a[1]).map(([k, n]) => ({ value: k, label: (k === "page" ? "Page" : KIND_META[k as Kind].label), count: n }))} value={kind} onChange={(v) => setKind(v as string | null)} searchable={false} allLabel="All kinds" width="w-48" />
          {semanticReady === false && <span className="text-xs text-muted">Concept index not built for this deployment; showing lexical matches only.</span>}
        </div>
      )}
      {rows && rows.length === 0 && <p className="text-sm text-muted">No matches. Try a product, target, cancer or trial name, or a plainer phrase.</p>}
      {rows && rows.length > 0 && (
        <ol className="space-y-2">
          {shown.map((r) => (
            <li key={r.id} className="card p-3 flex items-start gap-3">
              <span className="text-xs text-muted tabular-nums w-6 pt-1">{r.rank}</span>
              {r.kind === "drug" && <MoleculeSlot drugId={r.id} name={r.name} className="h-10 w-10" />}
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`chip border ${(r.kind === "page" ? "border-border text-muted" : KIND_COLOR[r.kind])}`}>{(r.kind === "page" ? "Page" : KIND_META[r.kind].label)}</span>
                  <Link href={r.route} className="font-medium hover:underline">{r.name}</Link>
                  {r.status && <span className={`chip ${statusClass(r.status)}`}>{STATUS_LABEL[r.status] ?? r.status}</span>}
                </div>
                <p className="text-sm text-muted mt-1 line-clamp-2">{r.tldr}</p>
                <p className="text-xs mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
                  {r.lexical && r.lexical.length > 0 && <span><span className="text-muted">Words: </span>{r.lexical.slice(0, 4).join(", ")}</span>}
                  {r.concept && r.concept.length > 0 && <span><span className="text-muted">Concepts: </span>{r.concept.join(", ")}</span>}
                  {r.both && <span className="text-emerald-700 dark:text-emerald-300">Both searches agree</span>}
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}
      <details className="mt-6 text-xs text-muted">
        <summary className="cursor-pointer">How results are ranked</summary>
        <p className="mt-1 max-w-3xl">Two searches run in your browser. The word search matches names, aliases, TL;DRs and tags, with prefixes and small typos allowed. The concept search scores each record&apos;s full text plus the names of every object it links to, so a product can match a cancer or biomarker it treats even when its own text never uses that word. The two rankings are merged by reciprocal rank; a record found by both rises. Nothing is sent to a server.</p>
      </details>
    </div>
  );
}

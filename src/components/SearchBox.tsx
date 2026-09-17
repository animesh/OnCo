"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import MiniSearch from "minisearch";
import type { SearchDoc } from "@/lib/search-index";
import { KIND_META } from "@/lib/schema";
import { KIND_COLOR } from "@/lib/text";
import { loadSemantic } from "@/lib/semantic-client";
import { semanticSearch } from "@/lib/semantic";

let cache: Promise<{ ms: MiniSearch<SearchDoc>; docs: SearchDoc[]; byId: Map<string, SearchDoc> }> | null = null;

export function loadSearch() {
  if (!cache) {
    cache = fetch("/api/v1/search.json")
      .then((r) => { if (!r.ok) throw new Error("Search index unavailable"); return r.json(); })
      .then((docs: SearchDoc[]) => {
        const ms = new MiniSearch<SearchDoc>({
          fields: ["name", "aka", "tldr", "tags", "id"],
          storeFields: ["id", "kind", "name", "tldr", "route", "status"],
          searchOptions: { boost: { name: 4, aka: 3, id: 2 }, prefix: true, fuzzy: 0.2 },
        });
        ms.addAll(docs);
        return { ms, docs, byId: new Map(docs.map((d) => [d.id, d])) };
      })
      .catch((error) => { cache = null; throw error; });
  }
  return cache;
}

type Hit = SearchDoc & { concept?: string[] };

/** Fewer than this many lexical hits triggers the concept-search fallback. */
const FALLBACK_BELOW = 3;

export function SearchBox({ large = false, autoFocus = false }: { large?: boolean; autoFocus?: boolean }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState<Hit[]>([]);
  const [ready, setReady] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    loadSearch().then(() => setReady(true));
  }, [open]);

  const latest = useRef("");
  const runSearch = (value: string) => {
    latest.current = value;
    if (!value.trim()) { setResults([]); return; }
    loadSearch().then(async ({ ms, byId }) => {
      if (latest.current !== value) return;
      const lexical = ms.search(value).slice(0, 12) as unknown as SearchDoc[];
      setResults(lexical);
      if (lexical.length >= FALLBACK_BELOW) return;
      // Too few exact matches: add concept matches (paraphrases, linked names), labelled as such.
      const index = await loadSemantic();
      if (!index || latest.current !== value) return;
      const seen = new Set(lexical.map((h) => h.id));
      const extra: Hit[] = semanticSearch(index, value, 10).filter((h) => !seen.has(h.id)).map((h) => ({ ...byId.get(h.id)!, concept: h.matched.slice(0, 3) })).filter((h) => h.id).slice(0, 12 - lexical.length);
      setResults([...lexical, ...extra]);
    });
  };

  useEffect(() => {
    const onDoc = (e: MouseEvent) => { if (box.current && !box.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const placeholder = useMemo(() => "Search TROP2, Enhertu, PSMA PET, TNBC, Gustave Roussy…", []);
  const close = () => { setOpen(false); setQ(""); setResults([]); };

  return (
    <div ref={box} className="relative">
      <input
        type="search"
        value={q}
        autoFocus={autoFocus}
        onChange={(e) => { setQ(e.target.value); setOpen(true); runSearch(e.target.value); }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder}
        aria-label="Search OnCo"
        className={`w-full rounded-lg border border-border bg-card px-3 ${large ? "py-3 text-base" : "py-1.5 text-sm"} outline-none focus:ring-2 focus:ring-accent/40`}
      />
      {open && q.trim() && (
        <div className="absolute z-50 mt-1 w-full card shadow-xl max-h-96 overflow-auto">
          {!ready && <div className="p-3 text-sm text-muted">Loading index…</div>}
          {ready && results.length === 0 && <div className="p-3 text-sm text-muted">No matches.</div>}
          <ul>
            {results.map((r) => (
              <li key={r.id}>
                <Link href={r.route} onClick={close} className="flex items-start gap-3 px-3 py-2 hover:bg-foreground/5">
                  <span className={`chip mt-0.5 border ${(r.kind === "page" ? "border-border text-muted" : KIND_COLOR[r.kind])}`}>{(r.kind === "page" ? "Page" : KIND_META[r.kind].label)}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-medium truncate">{r.name}</span>
                    <span className="block text-xs text-muted line-clamp-2">{r.tldr}</span>
                  </span>
                  {r.concept && <span className="chip bg-foreground/5 text-[10px] shrink-0 mt-0.5" title={`Concept match on: ${r.concept.join(", ")}`}>concept</span>}
                </Link>
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-border px-3 py-2 text-xs">
            <Link href={`/search/?q=${encodeURIComponent(q.trim())}`} onClick={close} className="underline">All results and why they match</Link>
            <Link href={`/ask/?q=${encodeURIComponent(q.trim())}`} onClick={close} className="underline">Ask OnCo this as a question</Link>
          </div>
        </div>
      )}
    </div>
  );
}

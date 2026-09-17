"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { KIND_META, type Kind } from "@/lib/schema";
import { useT } from "@/lib/i18n/ui";
import { KIND_COLOR, STATUS_LABEL, statusClass } from "@/lib/text";
import { FacetSelect } from "./filters/FacetSelect";
import { Tip } from "./Tip";
import { CancerIcon } from "./CancerIcon";
import { MoleculeSlot } from "./MoleculeSlot";
import { RedCards } from "./RedCards";
import { ChangesGlyph } from "./MyCancer";
import { useMyCancer } from "@/lib/use-my-cancer";
import type { RedCard } from "@/lib/red-cards";
import { ForMeSituation } from "./ForMeSituation";

export type Lite = { id: string; name: string; tldr: string; route: string; status?: string };
export type PickerCancer = { id: string; name: string; group: string; tldr: string; route: string; stateOfArt: string[]; redCards: RedCard[]; pipeline: Lite[]; groups: Partial<Record<Kind, Lite[]>> };

const ORDER: Kind[] = ["drug", "technology", "trial", "target", "pairing", "idea", "pathway", "company", "institution", "person", "roadmap", "term", "collection", "section"];

/** Plain words for each object type, for readers who do not know the jargon. */
const KIND_HINT: Partial<Record<Kind, string>> = {
  drug: "Medicines, tests and devices", technology: "Ways of treating or detecting", trial: "Studies in people", target: "Molecules drugs aim at",
  pairing: "Combinations that work together", idea: "Proposals with a test", pathway: "Cell signalling routes", company: "Who makes it",
  institution: "Where it is studied", person: "Who leads the work", roadmap: "How a field unfolds", term: "Words explained", collection: "Databases and registries", section: "Broad fronts of oncology",
};

const HOPEFUL = ["approved", "standard-of-care", "established", "positive"];

/**
 * "For me": pick one or more cancers from a searchable dropdown, choose a type with large tiles,
 * search within the results. Everything shown is what works or could work; failures are left out.
 */
export function CancerPicker({ cancers }: { cancers: PickerCancer[] }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [kind, setKind] = useState<Kind | "all">("all");
  const [q, setQ] = useState("");
  const [onlyApproved, setOnlyApproved] = useState(false);
  const { kind: kindName } = useT();
  // The remembered cancer (item 102): preselect it once storage has been read, and remember the first cancer chosen here.
  const my = useMyCancer();
  const touched = useRef(false);
  useEffect(() => { if (my.ready && !touched.current && my.id && cancers.some((c) => c.id === my.id)) setSelected([my.id]); }, [my.ready, my.id, cancers]);
  const choose = (ids: string[]) => { touched.current = true; setSelected(ids); if (ids[0] && ids[0] !== my.id) my.set(ids[0]); if (!ids.length && my.id) my.clear(); };
  const plural = (k: Kind) => kindName(k, "plural") ?? KIND_META[k].plural;
  const chosen = cancers.filter((c) => selected.includes(c.id));

  const cancerOptions = useMemo(() => cancers.map((c) => ({ value: c.id, label: c.name, group: c.group[0].toUpperCase() + c.group.slice(1) })), [cancers]);

  const merged = useMemo(() => {
    const out = new Map<Kind, Map<string, Lite & { n: number }>>();
    for (const c of chosen) for (const [k, list] of Object.entries(c.groups) as Array<[Kind, Lite[]]>) {
      const m = out.get(k) ?? new Map();
      for (const e of list) { const prev = m.get(e.id); m.set(e.id, { ...e, n: (prev?.n ?? 0) + 1 }); }
      out.set(k, m);
    }
    return out;
  }, [chosen]);

  const needle = q.trim().toLowerCase();
  const filterItems = (items: Array<Lite & { n: number }>) => {
    let out = items;
    if (onlyApproved) out = out.filter((e) => !e.status || HOPEFUL.includes(e.status));
    if (needle) out = out.filter((e) => `${e.name} ${e.tldr}`.toLowerCase().includes(needle));
    return out.sort((a, b) => b.n - a.n || a.name.localeCompare(b.name));
  };
  const counts = new Map<Kind, number>();
  for (const k of ORDER) { const m = merged.get(k); if (m) { const n = filterItems([...m.values()]).length; if (n) counts.set(k, n); } }
  const total = [...counts.values()].reduce((a, b) => a + b, 0);
  const kindsShown = kind === "all" ? ORDER.filter((k) => counts.has(k)) : counts.has(kind) ? [kind] : [];

  return (
    <div>
      {/* Single control row */}
      <div className="sticky top-14 z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2 bg-background/95 backdrop-blur border-b border-border flex flex-wrap items-center gap-2">
        <FacetSelect label="Cancer type" options={cancerOptions} value={selected} onChange={(v) => choose(v as string[])} multi searchable placeholder="Search cancers…" width="w-72" />
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search within results…" aria-label="Search within results" disabled={!chosen.length}
          className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-accent/40 w-60 disabled:opacity-50" />
        <label className="text-sm flex items-center gap-2"><input type="checkbox" checked={onlyApproved} onChange={(e) => setOnlyApproved(e.target.checked)} /> approved or standard of care only</label>
        {(selected.length > 0 || q || kind !== "all") && <button onClick={() => { choose([]); setQ(""); setKind("all"); }} className="text-sm underline text-muted">Clear</button>}
        {chosen.length > 0 && <span className="ml-auto text-sm text-muted tabular-nums">{total} things for {chosen.length === 1 ? chosen[0].name : `${chosen.length} cancers`}</span>}
      </div>

      {chosen.length === 0 && (
        <div className="mt-8">
          <div className="card p-8 text-center"><div className="text-lg font-medium">Start by choosing a cancer type above.</div><p className="text-muted mt-1">You can pick more than one. Everything below the line will be about your selection.</p></div>
          <div className="kicker mt-8 mb-2">Or tap one</div>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
            {cancers.map((c) => (
              <button key={c.id} onClick={() => choose([c.id])} className="card p-3 text-left hover:shadow-md transition flex gap-3">
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent"><CancerIcon cancerId={c.id} className="h-7 w-7" /></span>
                <span className="min-w-0"><span className="block text-xs text-muted capitalize">{c.group}</span><span className="block font-medium leading-snug">{c.name}</span><span className="block text-xs text-muted mt-0.5 line-clamp-2">{c.tldr}</span></span>
              </button>
            ))}
          </div>
        </div>
      )}

      {chosen.map((c) => (
        <div key={c.id} className="card p-5 mt-6">
          <div className="flex items-center justify-between gap-3"><h2 className="text-xl font-semibold flex items-center gap-3"><span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent"><CancerIcon cancerId={c.id} className="h-7 w-7" /></span><Link href={c.route} className="hover:underline">{c.name}</Link></h2><span className="flex flex-wrap items-center gap-3 shrink-0 text-sm"><Link href={`${c.route}changes/`} className="chip border border-border bg-card hover:bg-foreground/5"><ChangesGlyph className="h-3 w-3" />What changed</Link><Link href={c.route} className="underline">Full page →</Link></span></div>
          <p className="text-[15px] mt-1">{c.tldr}</p>
          <div className="grid gap-4 sm:grid-cols-2 mt-4 text-sm">
            <div><div className="kicker mb-1">State of the art</div><ul className="list-disc pl-5 space-y-1">{c.stateOfArt.map((s, i) => <li key={i}>{s}</li>)}</ul></div>
            <div><div className="kicker mb-1">Coming down the pipeline</div><div className="flex flex-wrap gap-1.5">{c.pipeline.map((p) => <Tip key={p.id} title={p.name} text={p.tldr} href={p.route}><Link href={p.route} className="chip border bg-card border-border hover:bg-foreground/5">{p.name}</Link></Tip>)}</div></div>
          </div>
          {c.redCards.length > 0 && <div className="mt-5"><RedCards cards={c.redCards} cancerName={c.name} compact /></div>}
          {/* The situation view (item 101) follows the remembered cancer (or the only one chosen); other selections keep the simple view. */}
          {(c.id === my.id || chosen.length === 1) && <ForMeSituation cancerId={c.id} cancerName={c.name} />}
        </div>
      ))}

      {chosen.length > 0 && (
        <>
          {/* Type tiles: large, labelled in plain words, with counts */}
          <div className="grid gap-2 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 mt-8" role="tablist" aria-label="Type of thing">
            <button role="tab" aria-selected={kind === "all"} onClick={() => setKind("all")} className={`card p-3 text-left transition ${kind === "all" ? "ring-2 ring-foreground" : "hover:shadow-md"}`}>
              <div className="font-semibold">Everything</div><div className="text-xs text-muted">All types together</div><div className="text-2xl font-semibold tabular-nums mt-1">{total}</div>
            </button>
            {ORDER.filter((k) => counts.has(k)).map((k) => (
              <button key={k} role="tab" aria-selected={kind === k} onClick={() => setKind(kind === k ? "all" : k)} className={`card p-3 text-start border transition ${KIND_COLOR[k]} ${kind === k ? "ring-2 ring-foreground" : "hover:shadow-md"}`}>
                <div className="font-semibold capitalize">{plural(k)}</div><div className="text-xs opacity-80">{KIND_HINT[k]}</div><div className="text-2xl font-semibold tabular-nums mt-1">{counts.get(k)}</div>
              </button>
            ))}
          </div>

          <div className="space-y-10 mt-8">
            {kindsShown.map((k) => {
              const items = filterItems([...(merged.get(k)?.values() ?? [])]);
              if (!items.length) return null;
              return (
                <section key={k} id={`type-${k}`}>
                  <div className="flex items-baseline gap-3 mb-3 pb-2 border-b border-border"><h3 className="text-xl font-semibold capitalize">{plural(k)}</h3><span className="text-sm text-muted">{KIND_HINT[k]}</span><span className="ms-auto text-sm text-muted tabular-nums">{items.length}</span></div>
                  <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((e) => (
                      <Link key={e.id} href={e.route} className={`card p-3 hover:shadow-md transition border ${KIND_COLOR[k]} ${k === "drug" ? "flex gap-3" : ""}`}>
                        {k === "drug" && <MoleculeSlot drugId={e.id} name={e.name} className="h-14 w-14" />}
                        <span className="min-w-0 block">
                          <div className="flex items-center gap-2">{e.status && <span className={`chip ${statusClass(e.status)}`}>{STATUS_LABEL[e.status] ?? e.status}</span>}{chosen.length > 1 && e.n > 1 && <span className="text-xs text-muted">{e.n} of your cancers</span>}</div>
                          <div className="font-medium mt-1 leading-snug">{e.name}</div>
                          <p className="text-xs text-muted mt-0.5 line-clamp-2">{e.tldr}</p>
                        </span>
                      </Link>
                    ))}
                  </div>
                </section>
              );
            })}
            {total === 0 && <div className="card p-8 text-center text-muted">Nothing matches. Clear the search or the approved-only filter.</div>}
          </div>
        </>
      )}
    </div>
  );
}

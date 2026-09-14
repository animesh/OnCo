"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { MoleculeThumb } from "./MoleculeThumb";
import { MoleculeViewer, type StructureEntry } from "./MoleculeViewer";
import { FacetSelect } from "./filters/FacetSelect";
import { Toolbar } from "./filters/ResultsTable";
import { placeholderKind } from "./MoleculeSlot";

export type GalleryDrug = {
  id: string; name: string; route: string; modality: string; modalityGroup: string; status?: string; statusLabel: string;
  targets: Array<{ id: string; name: string }>; payloadClass?: string; entries: StructureEntry[];
};
export type MissingDrug = { id: string; name: string; route: string; modality: string; status?: string };


/**
 * Browsable grid of every product with a self-hosted 3D structure. Filters by modality group, payload class,
 * target and approval status; clicking a card opens the full viewer in a dialog. The list of products with no
 * structure sits below, grouped by the reason, and doubles as the work list for the next fetch-structures run.
 */
export function MoleculeGallery({ drugs, missing }: { drugs: GalleryDrug[]; missing: MissingDrug[] }) {
  const [group, setGroup] = useState<string | null>(null);
  const [payload, setPayload] = useState<string | null>(null);
  const [target, setTarget] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<GalleryDrug | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const d = dialog.current; if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  const count = (key: (d: GalleryDrug) => Array<[string, string]>) => { const m = new Map<string, { label: string; count: number }>(); for (const d of drugs) for (const [v, l] of key(d)) { const e = m.get(v) ?? { label: l, count: 0 }; e.count++; m.set(v, e); } return [...m.entries()].map(([value, e]) => ({ value, label: e.label, count: e.count })).sort((a, b) => a.label.localeCompare(b.label)); };
  const groupOptions = useMemo(() => count((d) => [[d.modalityGroup, d.modalityGroup]]), [drugs]); // eslint-disable-line react-hooks/exhaustive-deps
  const payloadOptions = useMemo(() => count((d) => d.payloadClass ? [[d.payloadClass, d.payloadClass]] : []), [drugs]); // eslint-disable-line react-hooks/exhaustive-deps
  const targetOptions = useMemo(() => count((d) => d.targets.map((t) => [t.id, t.name])), [drugs]); // eslint-disable-line react-hooks/exhaustive-deps
  const statusOptions = useMemo(() => count((d) => d.status ? [[d.status, d.statusLabel]] : []), [drugs]); // eslint-disable-line react-hooks/exhaustive-deps

  const shown = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return drugs.filter((d) => (!group || d.modalityGroup === group) && (!payload || d.payloadClass === payload) && (!target || d.targets.some((t) => t.id === target)) && (!status || d.status === status) && (!needle || d.name.toLowerCase().includes(needle) || d.modality.toLowerCase().includes(needle) || d.targets.some((t) => t.name.toLowerCase().includes(needle))));
  }, [drugs, group, payload, target, status, q]);

  const missingByReason = useMemo(() => {
    const m = new Map<string, { label: string; why: string; items: MissingDrug[] }>();
    for (const d of missing) { const k = placeholderKind(d.modality); const e = m.get(k.id) ?? { label: k.label, why: k.why, items: [] }; e.items.push(d); m.set(k.id, e); }
    return [...m.values()].sort((a, b) => b.items.length - a.items.length);
  }, [missing]);

  return (
    <div className="space-y-6">
      <Toolbar count={shown.length} total={drugs.length} noun="molecules"
        left={<>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, modality, target" className="rounded-md border border-border bg-card px-2.5 py-1.5 text-sm w-56" aria-label="Search molecules" />
          <FacetSelect label="Modality" options={groupOptions} value={group} onChange={(v) => setGroup(v as string | null)} searchable={false} allLabel="All modalities" width="w-52" />
          <FacetSelect label="Payload class" options={payloadOptions} value={payload} onChange={(v) => setPayload(v as string | null)} searchable={false} allLabel="Any payload" width="w-56" />
          <FacetSelect label="Target" options={targetOptions} value={target} onChange={(v) => setTarget(v as string | null)} allLabel="Any target" width="w-48" />
          <FacetSelect label="Status" options={statusOptions} value={status} onChange={(v) => setStatus(v as string | null)} searchable={false} allLabel="Any status" width="w-44" />
        </>} />

      {shown.length === 0 ? <p className="text-sm text-muted">No molecule matches. Clear a filter.</p> : (
        <ul className="grid gap-3 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {shown.map((d) => (
            <li key={d.id}>
              <div className="card overflow-hidden hover:shadow-md transition group">
                <Link href={d.route} className="block" aria-label={`${d.name}: open the product page`}>
                  <div className="bg-gradient-to-b from-foreground/[0.03] to-transparent"><MoleculeThumb drugId={d.id} className="h-28" /></div>
                  <div className="p-2.5 pb-1">
                    <div className="font-medium text-sm leading-snug truncate group-hover:underline" title={d.name}>{d.name}</div>
                    <div className="text-[11px] text-muted truncate" title={d.modality}>{d.modality}</div>
                    <div className="text-[11px] text-muted truncate mt-0.5">{d.entries[0].label}</div>
                  </div>
                </Link>
                <div className="px-2.5 pb-2 flex items-center justify-between gap-2 text-[11px]">
                  <Link href={d.route} className="text-muted hover:text-accent underline-offset-2 hover:underline">Product page</Link>
                  <button type="button" onClick={() => setOpen(d)} className="chip border border-border bg-card hover:bg-foreground/5" aria-label={`Open ${d.name} in the 3D viewer`}>3D viewer</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <dialog ref={dialog} onClose={() => setOpen(null)} className="backdrop:bg-black/50 bg-card text-foreground rounded-xl border border-border p-0 w-[min(96vw,900px)] max-h-[90vh] overflow-auto">
        {open && (
          <div className="p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <div className="text-lg font-semibold">{open.name}</div>
                <div className="text-sm text-muted">{open.modality}{open.targets.length ? ` · ${open.targets.map((t) => t.name).join(", ")}` : ""}</div>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link href={open.route} className="text-sm underline">Product page →</Link>
                <button type="button" onClick={() => setOpen(null)} className="rounded border border-border px-2 py-1 text-sm hover:bg-foreground/5" aria-label="Close">Close</button>
              </div>
            </div>
            <MoleculeViewer key={open.id} entries={open.entries} />
          </div>
        )}
      </dialog>

      <section className="mt-10">
        <h2 className="text-lg font-semibold tracking-tight">Products without a structure yet ({missing.length})</h2>
        <p className="text-sm text-muted mt-1 max-w-3xl">Cells, vaccines, tests and devices have no single molecule to draw. The rest of this list is the work queue: once a product is matched to a PubChem or PDB entry, its structure is fetched and the thumbnail appears everywhere the product is mentioned. Know the right entry? <Link className="underline" href="/suggest/">Suggest it</Link>.</p>
        <div className="grid gap-4 md:grid-cols-2 mt-4">
          {missingByReason.map((g) => (
            <div key={g.label} className="card p-4">
              <div className="flex items-baseline justify-between gap-2"><div className="font-medium">{g.label}</div><span className="text-xs text-muted tabular-nums">{g.items.length}</span></div>
              <p className="text-xs text-muted mt-0.5 mb-2">{g.why}</p>
              <div className="flex flex-wrap gap-1.5">
                {g.items.map((d) => <Link key={d.id} href={d.route} className="chip border bg-card border-border hover:bg-foreground/5" title={d.modality}>{d.name}</Link>)}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

"use client";

import { useState } from "react";
import { Molecule3D, type StructureEntry } from "./Molecule3D";

export type { StructureEntry };

/**
 * Structure panel for a product page or the gallery dialog: one chip per structure entry (payload, antibody,
 * drug bound to its target), the Molecule3D model of the selected one, then its label, note and source link.
 * Self-hosted JSON (see scripts/fetch-structures.ts); no runtime calls to external services.
 */
export function MoleculeViewer({ entries }: { entries: StructureEntry[] }) {
  const [i, setI] = useState(0);
  const entry = entries[Math.min(i, entries.length - 1)];
  if (!entry) return null;
  return (
    <div className="card overflow-hidden">
      <Molecule3D key={entry.file} entry={entry} />
      <div className="px-4 py-3 border-t border-border text-sm" lang="en">
        {entries.length > 1 && (
          <div className="flex flex-wrap gap-1.5 mb-2" role="tablist" aria-label="Structures">
            {entries.map((e, k) => (
              <button key={e.file + k} type="button" role="tab" aria-selected={k === i} onClick={() => setI(k)} translate="no" className={`chip border notranslate ${k === i ? "bg-foreground text-background border-foreground" : "bg-card border-border hover:bg-foreground/5"}`}>{e.label}</button>
            ))}
          </div>
        )}
        <div className="font-medium notranslate" translate="no">{entry.label}</div>
        {entry.note && <p className="text-xs text-muted mt-1">{entry.note}</p>}
      </div>
    </div>
  );
}

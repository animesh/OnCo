"use client";

import { useState } from "react";
import Link from "next/link";
import { MoleculeThumb, hasMolecule } from "./MoleculeThumb";

/**
 * Inline chip for a product mention. On hover or focus it shows the product's rotating molecule,
 * so any drug named in a standard-of-care row, history event, or roadmap step can be seen at once.
 */
export function DrugChip({ id, name, route, className = "", tldr }: { id: string; name: string; route: string; className?: string; tldr?: string }) {
  const [open, setOpen] = useState(false);
  const has = hasMolecule(id);
  return (
    <span className="relative inline-block" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)} onFocus={() => setOpen(true)} onBlur={() => setOpen(false)}>
      <Link href={route} translate="no" className={`chip border notranslate hover:brightness-95 ${className}`}>{has && <span aria-hidden className="text-[9px] opacity-70">⟳</span>}{name}</Link>
      {open && has && (
        <span className="absolute left-0 top-full z-40 mt-1 w-56 card shadow-xl overflow-hidden pointer-events-none">
          <MoleculeThumb drugId={id} className="h-32" />
          <span className="block px-3 py-2 text-xs" lang="en"><span className="font-medium notranslate" translate="no">{name}</span>{tldr && <span className="block text-muted line-clamp-2 mt-0.5">{tldr}</span>}</span>
        </span>
      )}
    </span>
  );
}

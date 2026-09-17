import Link from "next/link";
import type { Kind } from "@/lib/schema";
import { KIND_COLOR } from "@/lib/text";
import { KindIcon } from "./KindIcon";
import { Tip } from "./Tip";

/** Plain words for the few kinds whose id is not what the site calls them. */
const WORD: Partial<Record<Kind, string>> = { section: "front", paper: "key paper", drug: "treatment" };
export const kindWord = (k: Kind): string => WORD[k] ?? k;

/**
 * The stand-in shown in a table's picture slot when a row has no molecule, drawing, organ icon, logo or
 * portrait of its own: the kind's monoline symbol on a soft tile in the kind's colour, the exact size of the
 * real visuals in that table so columns line up. Explained on hover like the molecule placeholder, and linked
 * to the record's page like every other row visual. Server-safe: no hooks, no data imports.
 */
export function RowVisualFallback({ kind, name, route, className = "h-10 w-14", round = false }: {
  kind: Kind; name: string; route?: string; className?: string; round?: boolean;
}) {
  const word = kindWord(kind);
  const small = /\bh-[4-7]\b/.test(className);
  const tile = (
    <span role="img" aria-label={`${name}: ${word} symbol, no picture yet`}
      className={`inline-flex shrink-0 items-center justify-center border ${KIND_COLOR[kind] ?? "bg-accent-soft text-accent border-border"} ${round ? "rounded-full" : "rounded-md"} ${className}`}>
      <KindIcon kind={kind} className={small ? "h-4 w-4" : "h-5 w-5"} />
    </span>
  );
  return (
    <Tip title={name} text={`No picture for this ${word} yet, so its ${word} symbol stands in.`} href={route}>
      {route ? <Link href={route} tabIndex={-1} aria-hidden className="inline-flex shrink-0">{tile}</Link> : tile}
    </Tip>
  );
}

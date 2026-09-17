"use client";

import Link from "next/link";
import { CancerIcon } from "./CancerIcon";
import { pickMyCancer, shortCancerName, useMyCancer, type MyCancerLite } from "@/lib/use-my-cancer";

/**
 * The remembered cancer, wherever it helps: a header chip, the home hero button, a pinned tile on the cancer hub,
 * a one-tap trials filter. Each takes the small (id, name, route) list from a server component and resolves the
 * stored id against it, so none of these imports the graph. Until storage has been read they render their unset
 * state, which is also what the server rendered, so hydration is clean.
 */
export type MyCancerTile = MyCancerLite & { group?: string; tldr?: string };

function PickGlyph({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="8" /><circle cx="12" cy="12" r="2.5" /><path d="M12 4v2M12 18v2M4 12h2M18 12h2" />
    </svg>
  );
}

/** Header chip next to the profile icon: the chosen cancer with its icon, or "My cancer" opening the picker. */
export function MyCancerChip({ cancers, className = "" }: { cancers: MyCancerLite[]; className?: string }) {
  const { id } = useMyCancer();
  const mine = pickMyCancer(cancers, id);
  const base = `inline-flex h-10 max-w-[11rem] items-center gap-1.5 rounded-[0.625rem] border px-2.5 text-sm font-medium transition ${className}`;
  if (!mine) {
    return (
      <Link href="/for-me/" className={`${base} border-border bg-card text-muted hover:text-foreground hover:border-border-strong`} title="Choose your cancer type; OnCo remembers it in this browser" aria-label="My cancer: not chosen yet, open the picker">
        <PickGlyph className="h-4 w-4 shrink-0" /><span className="hidden sm:inline truncate">My cancer</span>
      </Link>
    );
  }
  return (
    <Link href={mine.route} className={`${base} border-accent/40 bg-accent-soft text-accent hover:border-accent`} title={`${mine.name}: your remembered cancer type. Change it in For me.`} aria-label={`My cancer: ${mine.name}`}>
      <CancerIcon cancerId={mine.id} className="h-5 w-5 shrink-0" /><span className="hidden sm:inline truncate">{shortCancerName(mine.name)}</span>
    </Link>
  );
}

/** Home hero: "Research my cancer type" until a cancer is remembered, then "Continue with <cancer>" straight to its page. */
export function MyCancerContinue({ cancers }: { cancers: MyCancerLite[] }) {
  const { id } = useMyCancer();
  const mine = pickMyCancer(cancers, id);
  if (!mine) return <Link href="/for-me/" className="btn btn-primary">Research my cancer type <span aria-hidden>→</span></Link>;
  return (
    <Link href={mine.route} className="btn btn-primary inline-flex items-center gap-2" title={mine.name}>
      <CancerIcon cancerId={mine.id} className="h-5 w-5" />Continue with {shortCancerName(mine.name)} <span aria-hidden>→</span>
    </Link>
  );
}

/** Cancer hub: the chosen cancer pinned above the grouped grid, with a link to change it. Renders nothing when unset. */
export function MyCancerPin({ cancers }: { cancers: MyCancerTile[] }) {
  const { id } = useMyCancer();
  const mine = pickMyCancer(cancers, id);
  if (!mine) return null;
  return (
    <div className="mb-8">
      <div className="kicker mb-2 flex items-center gap-1.5"><PickGlyph className="h-3.5 w-3.5 text-accent" />My cancer</div>
      <div className="flex flex-wrap items-stretch gap-2">
        <Link href={mine.route} title={mine.tldr} className="card p-3 flex items-center gap-3 border-accent/40 hover:shadow-md transition min-w-0 max-w-md">
          <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent"><CancerIcon cancerId={mine.id} className="h-8 w-8" /></span>
          <span className="min-w-0"><span className="block text-xs text-muted capitalize">{mine.group}</span><span className="block font-medium leading-snug">{mine.name}</span>{mine.tldr && <span className="block text-xs text-muted mt-0.5 line-clamp-2">{mine.tldr}</span>}</span>
        </Link>
        <div className="flex flex-col justify-center gap-1.5 text-sm">
          <Link href={`${mine.route}changes/`} className="chip border border-border bg-card hover:bg-foreground/5"><ChangesGlyph className="h-3 w-3" />What changed</Link>
          <Link href={`/trials/?cancers=${encodeURIComponent(mine.name)}`} className="chip border border-border bg-card hover:bg-foreground/5"><TrialGlyph className="h-3 w-3" />Trials</Link>
          <Link href="/for-me/" className="chip border border-border bg-card hover:bg-foreground/5 text-muted"><PickGlyph className="h-3 w-3" />Change</Link>
        </div>
      </div>
    </div>
  );
}

/** Trials index: one tap to the table filtered to the chosen cancer (the browser reads `?cancers=` on mount). */
export function MyCancerTrialsFilter({ cancers }: { cancers: MyCancerLite[] }) {
  const { id } = useMyCancer();
  const mine = pickMyCancer(cancers, id);
  if (!mine) return <Link href="/for-me/" className="rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium inline-flex items-center gap-1.5"><PickGlyph className="h-4 w-4 text-accent" />Trials for my cancer →</Link>;
  return (
    <Link href={`/trials/?cancers=${encodeURIComponent(mine.name)}`} className="rounded-lg border border-accent/40 bg-accent-soft text-accent px-4 py-2 text-sm font-medium inline-flex items-center gap-1.5" title={`Only trials linked to ${mine.name}`}>
      <CancerIcon cancerId={mine.id} className="h-4 w-4" />Trials for {shortCancerName(mine.name)} →
    </Link>
  );
}

export function ChangesGlyph({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /><path d="M4 4l2.5 2.5M20 4l-2.5 2.5" />
    </svg>
  );
}

export function TrialGlyph({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M9 3h6M10 3v6.5L4.5 19a1.5 1.5 0 0 0 1.3 2.3h12.4a1.5 1.5 0 0 0 1.3-2.3L14 9.5V3" /><path d="M7.5 15h9" />
    </svg>
  );
}

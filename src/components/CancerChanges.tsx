import Link from "next/link";
import { KindIcon } from "./KindIcon";
import { WatchButton } from "./WatchButton";
import { CHANGE_KIND_LABEL, type ChangeGroup, type ChangeItem, type ChangeKind } from "@/lib/cancer-changes";
import { ChangesGlyph } from "./MyCancer";

/**
 * The dated changes for a cancer, grouped by month, newest first. Each row links to the record it came from and
 * names the field the date was read from. Shared by the full page (/cancers/<id>/changes/) and the cancer tab.
 */
const KIND_CLASS: Record<ChangeKind, string> = {
  approval: "border-emerald-300/70 bg-emerald-50 text-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-100 dark:border-emerald-900",
  regulatory: "border-sky-300/70 bg-sky-50 text-sky-900 dark:bg-sky-950/40 dark:text-sky-100 dark:border-sky-900",
  guideline: "border-violet-300/70 bg-violet-50 text-violet-900 dark:bg-violet-950/40 dark:text-violet-100 dark:border-violet-900",
  trial: "border-amber-300/70 bg-amber-50 text-amber-900 dark:bg-amber-950/40 dark:text-amber-100 dark:border-amber-900",
  history: "border-border bg-surface text-foreground",
  record: "border-border bg-card text-muted",
};

const EXPLAIN: Record<ChangeKind, string> = {
  approval: "A regulator cleared this medicine for use.",
  regulatory: "A step on the way to, or after, approval.",
  guideline: "The written standard of care was updated.",
  trial: "A study in people reported its result.",
  history: "A milestone in how this cancer is treated.",
  record: "When this page itself was last checked or edited.",
};

function ChangeGlyph({ kind, className = "h-3 w-3" }: { kind: ChangeKind; className?: string }) {
  const common = { viewBox: "0 0 24 24", className, fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  switch (kind) {
    case "approval": return <svg {...common}><path d="M4 12.5l5 5L20 6.5" /></svg>;
    case "regulatory": return <svg {...common}><path d="M4 20h16M6 20V9l6-5 6 5v11M10 20v-5h4v5" /></svg>;
    case "guideline": return <svg {...common}><path d="M6 3h9l4 4v14H6z" /><path d="M9 12h6M9 16h6" /></svg>;
    case "trial": return <KindIcon kind="trial" className={className} />;
    case "history": return <svg {...common}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></svg>;
    default: return <svg {...common}><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" /></svg>;
  }
}

export function ChangeKindChip({ kind }: { kind: ChangeKind }) {
  return <span className={`chip border ${KIND_CLASS[kind]}`} title={EXPLAIN[kind]}><ChangeGlyph kind={kind} />{CHANGE_KIND_LABEL[kind]}</span>;
}

function ChangeRow({ it }: { it: ChangeItem }) {
  return (
    <li>
      <Link href={it.href} className="card block p-3 hover:shadow-md transition">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs text-muted tabular-nums">{it.date}</span>
          <ChangeKindChip kind={it.kind} />
          <span className="chip border border-border bg-card text-muted" title={`Read from the ${it.field} field of ${it.ref.name}`}><KindIcon kind={it.ref.kind} className="h-3 w-3" />{it.ref.name}</span>
        </div>
        <div className="font-medium leading-snug mt-1.5">{it.title}</div>
        <p className="text-sm text-muted mt-0.5 line-clamp-2">{it.detail ?? EXPLAIN[it.kind]}</p>
      </Link>
    </li>
  );
}

export function ChangesGroups({ groups }: { groups: ChangeGroup[] }) {
  if (!groups.length) return <p className="text-sm text-muted">No dated changes are recorded for this cancer yet.</p>;
  return (
    <div className="space-y-8">
      {groups.map((g) => (
        <section key={g.key} aria-labelledby={`month-${g.key}`}>
          <h2 id={`month-${g.key}`} className="kicker mb-2 flex items-center gap-1.5"><ChangesGlyph className="h-3.5 w-3.5 text-accent" />{g.label} <span className="text-muted font-normal normal-case tabular-nums">· {g.items.length}</span></h2>
          <ul className="grid gap-2 sm:grid-cols-2">{g.items.map((it, i) => <ChangeRow key={`${it.href}-${it.date}-${i}`} it={it} />)}</ul>
        </section>
      ))}
    </div>
  );
}

/** "Follow" line: the existing Watch button and the feed it feeds. */
export function FollowLine({ cancer }: { cancer: { id: string; name: string; route: string; asOf: string } }) {
  return (
    <div className="card p-3 flex flex-wrap items-center gap-3 text-sm">
      <span className="inline-flex items-center gap-1.5 font-medium"><ChangesGlyph className="h-4 w-4 text-accent" />Follow</span>
      <span className="text-muted">Watch this cancer and <Link href="/saved/" className="underline hover:text-foreground">Saved</Link> shows what changed since you last looked.</span>
      <span className="ms-auto"><WatchButton id={cancer.id} kind="cancer" name={cancer.name} route={cancer.route} asOf={cancer.asOf} /></span>
    </div>
  );
}

/** A short preview for the cancer page tab: the newest items and the link to the full list. */
export function ChangesPreview({ items, total, href }: { items: ChangeItem[]; total: number; href: string }) {
  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
        <p className="text-sm text-muted">Dated changes read from the records linked to this cancer: approvals, regulatory steps, reported trials, guideline versions and milestones. Newest first; no date is inferred.</p>
        <Link href={href} className="text-sm underline shrink-0">All {total} changes by month →</Link>
      </div>
      <ul className="grid gap-2 sm:grid-cols-2">{items.map((it, i) => <ChangeRow key={`${it.href}-${it.date}-${i}`} it={it} />)}</ul>
    </div>
  );
}

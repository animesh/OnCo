import Link from "next/link";
import { disagreementsFor, STANCE_META, type ModelReview } from "@/lib/model-reviews";

type P = { className?: string };
const S = { fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
const Svg = ({ className = "h-4 w-4", children }: P & { children: React.ReactNode }) => <svg viewBox="0 0 24 24" aria-hidden focusable="false" className={className} {...S}>{children}</svg>;

/** A chip with pins: the model panel. */
export const PanelIcon = (p: P) => <Svg {...p}><rect x="6" y="6" width="12" height="12" rx="2" /><rect x="9.5" y="9.5" width="5" height="5" rx="1" /><path d="M9 2v4M15 2v4M9 18v4M15 18v4M2 9h4M2 15h4M18 9h4M18 15h4" /></Svg>;
/** Two arrows pulling apart: models disagree. */
export const DisagreeIcon = (p: P) => <Svg {...p}><path d="M4 12h6M14 12h6M10 12l-3-3M10 12l-3 3M14 12l3-3M14 12l3 3" /></Svg>;
/** A person with a tick: human review. */
export const HumanIcon = (p: P) => <Svg {...p}><circle cx="10" cy="8" r="3.5" /><path d="M3.5 20a6.5 6.5 0 0 1 13 0" /><path d="M15.5 14.5l2 2 3.5-4" /></Svg>;

const CONFIDENCE_CLS = { low: "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300", medium: "bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-200", high: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200" } as const;

/** One line, repeated wherever model output is shown, so nobody mistakes it for clinical review. */
export function MachineCommentaryNote({ className = "" }: { className?: string }) {
  return <p className={`text-[11px] text-muted ${className}`}>Machine commentary by named AI models on a date, not clinical review. Claims are tied to the record&apos;s own sources; check them before relying on anything here.</p>;
}

export function StanceChip({ stance, count }: { stance: keyof typeof STANCE_META; count?: number }) {
  const m = STANCE_META[stance];
  return <span className={`chip ${m.cls}`} title={m.blurb}>{m.label}{count !== undefined ? ` ${count}` : ""}</span>;
}

/**
 * The model panel box on a record page: one card per model (name, version, date, confidence, summary,
 * verdicts as stance chips with their sources), a "Models disagree" strip when the same claim drew
 * different stances, and the human review path below.
 */
export function ModelPanel({ reviews, recordId, humanReviewUrl, children }: { reviews: ModelReview[]; recordId: string; humanReviewUrl?: string; children?: React.ReactNode }) {
  const disagreements = disagreementsFor(reviews);
  const panelHref = `/review/#panel`;
  return (
    <div className="card p-3 text-xs space-y-3">
      <div className="flex items-center justify-between gap-2">
        <Link href={panelHref} className="inline-flex items-center gap-1.5 font-semibold text-sm hover:underline"><PanelIcon className="h-4 w-4 text-accent" />Model panel</Link>
        <span className="chip bg-accent-soft text-accent">{reviews.length} model{reviews.length === 1 ? "" : "s"}</span>
      </div>
      <MachineCommentaryNote />

      {disagreements.length > 0 && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 dark:border-rose-900 dark:bg-rose-950/30 p-2.5 space-y-1.5">
          <div className="inline-flex items-center gap-1.5 font-medium text-rose-800 dark:text-rose-200"><DisagreeIcon className="h-4 w-4" />Models disagree on {disagreements.length} claim{disagreements.length === 1 ? "" : "s"}</div>
          <ul className="space-y-1.5">
            {disagreements.map((d) => (
              <li key={d.claim}>
                <div className="text-foreground/90">{d.claim}</div>
                <div className="flex flex-wrap gap-1 mt-1">{d.positions.map((p) => <span key={p.model.id} className={`chip ${STANCE_META[p.stance].cls}`} title={p.note}>{p.model.name}: {STANCE_META[p.stance].label}</span>)}</div>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="space-y-3">
        {reviews.map((r) => {
          const counts = r.verdicts.reduce<Record<string, number>>((acc, v) => ((acc[v.stance] = (acc[v.stance] ?? 0) + 1), acc), {});
          const key = `${r.model.id}-${r.date}`;
          return (
            <details key={key} className="rounded-lg border border-border p-2.5 group">
              <summary className="cursor-pointer list-none">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="font-medium text-sm">{r.model.name}</span>
                  <span className="text-muted">{r.model.provider} · v{r.model.version}</span>
                  <span className="text-muted tabular-nums">{r.date}</span>
                  <span className={`chip ${CONFIDENCE_CLS[r.confidence]}`} title="How far the record's own sources let the model check it">{r.confidence} confidence</span>
                  {r.example && <span className="chip border border-dashed border-foreground/30 text-muted" title="Hand-written illustration of the shape, not a model's output">Example</span>}
                </div>
                <p className="mt-1.5 text-foreground/85 leading-relaxed">{r.summary}</p>
                <div className="flex flex-wrap gap-1 mt-1.5">
                  {(Object.keys(STANCE_META) as Array<keyof typeof STANCE_META>).filter((s) => counts[s]).map((s) => <StanceChip key={s} stance={s} count={counts[s]} />)}
                  <span className="text-muted ml-auto group-open:hidden">Show verdicts</span><span className="text-muted ml-auto hidden group-open:inline">Hide verdicts</span>
                </div>
              </summary>
              <ul className="mt-2 space-y-2 border-t border-border pt-2">
                {r.verdicts.map((v, i) => (
                  <li key={i} className="flex gap-2">
                    <div className="shrink-0 pt-px"><StanceChip stance={v.stance} /></div>
                    <div className="min-w-0">
                      <div className="text-foreground/90">{v.claim}</div>
                      <div className="text-muted mt-0.5">{v.note}</div>
                      {v.source && <a className="underline break-words text-muted" href={v.source.url} rel="noopener">{v.source.label}</a>}
                    </div>
                  </li>
                ))}
              </ul>
            </details>
          );
        })}
      </div>

      <div className="border-t border-border pt-2 text-muted">
        <span className="inline-flex items-center gap-1.5"><HumanIcon className="h-4 w-4" />{children ?? <>Human reviews sit on top of the panel. {humanReviewUrl ? <><a className="underline" href={humanReviewUrl} rel="noopener">Add a clinical review</a> or see the </> : "See the "}<Link className="underline" href="/review/#queue">review queue</Link>.</>}</span>
        <span className="sr-only">Record {recordId}</span>
      </div>
    </div>
  );
}

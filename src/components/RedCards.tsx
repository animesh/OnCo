import Link from "next/link";
import { TONE_LABEL, type RedCard, type RedCardTone } from "@/lib/red-cards";

/**
 * "Red cards": up to six warnings a patient should know for a cancer, each saying what it is, which treatment it
 * concerns and where the source is. Plain props, so the same strip renders on the server (cancer page) and inside
 * the client-side For me picker. Renders nothing when there are no cards. Orientation, not medical advice: the
 * thresholds are quoted from labels and guidelines, and the team's own instructions win.
 */
const TONE_CLASS: Record<RedCardTone, string> = {
  emergency: "border-rose-300 bg-rose-50/70 text-rose-950 dark:bg-rose-950/30 dark:border-rose-900 dark:text-rose-100",
  "call-now": "border-amber-300 bg-amber-50/70 text-amber-950 dark:bg-amber-950/30 dark:border-amber-900 dark:text-amber-100",
  "call-today": "border-border bg-surface",
  caution: "border-sky-300 bg-sky-50/70 text-sky-950 dark:bg-sky-950/30 dark:border-sky-900 dark:text-sky-100",
  info: "border-border bg-card",
};

function ToneGlyph({ tone, className = "h-4 w-4" }: { tone: RedCardTone; className?: string }) {
  const common = { viewBox: "0 0 24 24", className, fill: "none", stroke: "currentColor", strokeWidth: 1.7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true };
  switch (tone) {
    case "emergency": return <svg {...common}><path d="M12 3 2.5 20h19L12 3Z" /><path d="M12 9.5v5M12 17.2v.1" /></svg>;
    case "call-now": return <svg {...common}><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z" /></svg>;
    case "call-today": return <svg {...common}><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></svg>;
    case "caution": return <svg {...common}><path d="M9 3h6M10 3v6.5L4.5 19a1.5 1.5 0 0 0 1.3 2.3h12.4a1.5 1.5 0 0 0 1.3-2.3L14 9.5V3" /><path d="M7.5 15h9" /></svg>;
    default: return <svg {...common}><circle cx="12" cy="12" r="8.5" /><path d="M12 11v5M12 8v.1" /></svg>;
  }
}

export function RedCardsGlyph({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="6" y="3" width="12" height="18" rx="2" /><path d="M9 8h6M9 12h6M9 16h3" />
    </svg>
  );
}

export function RedCards({ cards, cancerName, compact = false }: { cards: RedCard[]; cancerName?: string; compact?: boolean }) {
  if (!cards.length) return null;
  const drugs = [...new Map(cards.flatMap((c) => c.concerns).map((d) => [d.id, d])).values()].sort((a, b) => a.name.localeCompare(b.name));
  return (
    <section aria-label={`Red cards${cancerName ? ` for ${cancerName}` : ""}`} className={compact ? "" : "mt-8"}>
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
        <h2 className={`${compact ? "text-base" : "text-lg"} font-semibold tracking-tight inline-flex items-center gap-2`}><RedCardsGlyph className="h-4 w-4 text-accent" />Red cards</h2>
        <span className="text-xs text-muted">From the labels and guidelines behind the standard of care. Your team&apos;s thresholds win.</span>
      </div>
      <ul className={`grid gap-2 ${compact ? "sm:grid-cols-2" : "sm:grid-cols-2 lg:grid-cols-3"}`}>
        {cards.map((c) => (
          <li key={c.id} className={`rounded-xl border p-3 text-sm flex flex-col gap-1.5 ${TONE_CLASS[c.tone]}`}>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide"><ToneGlyph tone={c.tone} className="h-3.5 w-3.5 shrink-0" />{TONE_LABEL[c.tone]}</div>
            <div className="font-medium leading-snug">{c.title}</div>
            <p className="text-[13px] leading-snug opacity-90">{c.body}</p>
            <div className="mt-auto flex flex-wrap items-center gap-1 pt-1">
              {c.concerns.map((d) => <Link key={d.id} href={d.route} className="chip border border-current/20 bg-background/60 hover:bg-background">{d.name}</Link>)}
              {c.source.url ? <a href={c.source.url} rel="noopener" className="ms-auto text-[11px] underline decoration-current/30 hover:decoration-current opacity-80">source</a> : <span className="ms-auto text-[11px] opacity-70">{c.source.label}</span>}
            </div>
          </li>
        ))}
      </ul>
      <p className="text-xs text-muted mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-1">
        <span>See all on the product pages:</span>
        {drugs.map((d) => <Link key={d.id} href={d.route} className="underline hover:text-foreground">{d.name}</Link>)}
        <span>·</span><Link href="/navigator/" className="underline hover:text-foreground">Printable cards in the navigator</Link>
      </p>
    </section>
  );
}

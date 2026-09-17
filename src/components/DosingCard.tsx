import type { ReactNode } from "react";
import type { Drug } from "@/lib/schema";
import { DOSE_RE, EN_TEXT } from "@/lib/translate";

/**
 * A sentence with its doses and units ("150 mg twice daily", "2 Gy in 30 fractions") wrapped in translate="no", so a
 * browser translator renders the words around them and leaves the numbers and units exactly as the label states them.
 */
export function Doses({ text }: { text: string }): ReactNode {
  const out: ReactNode[] = [];
  let last = 0;
  for (const m of text.matchAll(DOSE_RE)) {
    const at = m.index ?? 0;
    if (at > last) out.push(text.slice(last, at));
    out.push(<span key={at} translate="no" className="notranslate">{m[0]}</span>);
    last = at + m[0].length;
  }
  if (!out.length) return text;
  if (last < text.length) out.push(text.slice(last));
  return <>{out}</>;
}

/** Dosing, schedule, modifications, and monitoring from the label. */
export function DosingCard({ drug }: { drug: Drug }) {
  const d = drug.dosing;
  if (!d) return null;
  const rows: Array<[string, string | undefined]> = [["Route", d.route], ["Schedule", d.schedule], ["Dose modifications", d.modifications], ["Monitoring", d.monitoring]];
  return (
    <div className="card p-4" {...EN_TEXT}>
      <div className="kicker mb-2">Dosing & schedule</div>
      <dl className="grid gap-3 sm:grid-cols-[160px_1fr] text-[15px]">
        {rows.filter(([, v]) => v).map(([k, v]) => (
          <div key={k} className="contents"><dt className="text-muted text-sm">{k}</dt><dd className="leading-relaxed"><Doses text={v ?? ""} /></dd></div>
        ))}
      </dl>
      {d.source && <p className="text-xs text-muted mt-3">Source: <a className="underline break-all" href={d.source} rel="noopener">{d.source.includes("dailymed") ? "US prescribing information (DailyMed)" : d.source.replace(/^https?:\/\//, "")}</a>. Doses are for orientation; the current label governs.</p>}
    </div>
  );
}

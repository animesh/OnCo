"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { HOLD_CLASS, HOLD_LABEL, irae, IRAE_SOURCES, type Grade } from "@/data/irae";
import { PrintButton } from "@/components/PrintButton";

/**
 * Organ selector with a printable management card per organ system. The chosen organ lives in the URL hash so a
 * card can be linked; the print stylesheet strips site chrome and the card is laid out to fit one page.
 */
export type IciLite = { id: string; name: string; route: string; modality: string };

export function IraeGuide({ icis }: { icis: IciLite[] }) {
  const [organ, setOrgan] = useState(irae[0].id);
  const [grade, setGrade] = useState<Grade | 0>(0);
  useEffect(() => {
    const raf = requestAnimationFrame(() => { const h = window.location.hash.replace(/^#/, ""); if (irae.some((e) => e.id === h)) setOrgan(h); });
    return () => cancelAnimationFrame(raf);
  }, []);
  const pick = (id: string) => { setOrgan(id); window.history.replaceState(window.history.state, "", `#${id}`); };
  const e = useMemo(() => irae.find((x) => x.id === organ) ?? irae[0], [organ]);
  const systems = useMemo(() => [...new Set(irae.map((x) => x.organ))], []);
  const shown = grade ? e.grades.filter((g) => g.grade === grade) : e.grades;

  return (
    <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
      <aside className="no-print lg:sticky lg:top-20 self-start max-h-[85vh] overflow-auto pr-1">
        {systems.map((s) => (
          <div key={s} className="mb-3">
            <div className="kicker mb-1">{s}</div>
            <ul className="space-y-0.5">
              {irae.filter((x) => x.organ === s).map((x) => (
                <li key={x.id}><button type="button" onClick={() => pick(x.id)} aria-pressed={x.id === organ} className={`w-full text-left rounded-md px-2 py-1.5 text-sm ${x.id === organ ? "bg-accent/10 text-accent font-medium" : "hover:bg-foreground/5"}`}>{x.event}</button></li>
              ))}
            </ul>
          </div>
        ))}
        <div className="mt-4">
          <div className="kicker mb-1">Grade filter</div>
          <div role="radiogroup" aria-label="Grade" className="inline-flex rounded-lg border border-border bg-card p-0.5 text-sm">
            {([0, 1, 2, 3, 4] as const).map((g) => <button key={g} type="button" role="radio" aria-checked={grade === g} onClick={() => setGrade(g)} className={`rounded-md px-2.5 py-1 ${grade === g ? "bg-foreground text-background" : "hover:bg-foreground/5"}`}>{g === 0 ? "All" : `G${g}`}</button>)}
          </div>
        </div>
      </aside>

      <article className="card p-5 sm:p-6" id={e.id}>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="kicker">{e.organ}</div>
            <h2 className="text-xl font-semibold mt-0.5">{e.event}</h2>
            <p className="text-sm text-muted mt-1 max-w-2xl">{e.incidence}</p>
          </div>
          <div className="no-print text-xs text-muted flex flex-col items-end gap-1"><PrintButton /><span>Card fits one page</span></div>
        </div>

        <div className="mt-4 rounded-lg border border-border bg-surface p-3 text-sm"><span className="font-medium">Work-up:</span> {e.workup}</div>

        <div className="mt-4 overflow-x-auto">
          <table className="onco">
            <thead><tr><th className="min-w-[8.5rem]">Grade</th><th className="min-w-[160px]">Checkpoint inhibitor</th><th className="min-w-[220px]">Steroids</th><th className="min-w-[240px]">If refractory / other measures</th><th className="min-w-[200px]">Rechallenge</th></tr></thead>
            <tbody>
              {shown.map((g) => (
                <tr key={g.grade}>
                  <td className="min-w-[8.5rem]"><div className="font-semibold whitespace-nowrap tabular-nums">Grade {g.grade}</div><div className="text-xs text-muted mt-0.5 max-w-[160px]">{g.defines}</div></td>
                  <td><span className={`chip ${HOLD_CLASS[g.hold]}`}>{HOLD_LABEL[g.hold]}</span></td>
                  <td className="text-sm">{g.steroid}</td>
                  <td className="text-sm text-foreground/85">{g.escalation ?? "-"}{g.note && <div className="text-xs text-muted mt-1">{g.note}</div>}</td>
                  <td className="text-sm">{g.rechallenge}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {e.differences && <p className="mt-3 text-sm"><span className="font-medium">Where the guidelines differ:</span> <span className="text-foreground/85">{e.differences}</span></p>}

        <div className="mt-4 grid gap-3 sm:grid-cols-2 text-xs text-muted">
          <div><span className="font-medium text-foreground/80">Sources:</span> {e.sources.map((s, i) => <span key={s.url}>{i > 0 && "; "}<a href={s.url} target="_blank" rel="noopener noreferrer" className="underline">{s.label}</a></span>)}</div>
          <div className="no-print"><span className="font-medium text-foreground/80">Products:</span> {icis.map((d, i) => <span key={d.id}>{i > 0 && ", "}<Link href={d.route} className="underline">{d.name}</Link></span>)}. <Link href="/toxicity/" className="underline">Compare toxicity rates →</Link></div>
        </div>
        <p className="mt-3 text-[11px] text-muted">Steroid tapers are over at least 4-6 weeks; give PJP prophylaxis above 20 mg prednisone-equivalent for over 4 weeks, gastric protection and bone protection; screen for HBV and TB before infliximab. General rule across guidelines: grade 2 hold and resume at grade 1 on 10 mg/day or less; grade 4 permanently discontinue except endocrinopathies controlled by replacement. Not medical advice. Sources: {Object.values(IRAE_SOURCES).map((s) => s.label.split(" (")[0]).join(", ")}.</p>
      </article>
    </div>
  );
}

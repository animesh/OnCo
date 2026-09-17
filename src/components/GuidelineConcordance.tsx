"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { BODY_META, type GuidelineBodyId, type GuidelineMapEntry } from "@/data/guideline-map";
import { concordanceOf, STANCE_CLASS, STANCE_LABEL, type Concordance } from "@/lib/guidelines-shared";
import { FacetSelect } from "./filters/FacetSelect";
import { Tip } from "./Tip";

/**
 * Concordance table: one row per setting, one column per guideline body, cells coloured by stance, rows where the
 * bodies disagree highlighted. Filter by cancer, body and verdict. Data is the side file `guideline-map.ts`,
 * resolved to names at build time by the page.
 */
export type ConcordanceRow = Omit<GuidelineMapEntry, "refs"> & { cancerName: string; cancerRoute: string; refs: Array<{ id: string; name: string; route: string }> };

const BODIES: GuidelineBodyId[] = ["NCCN", "ESMO", "NICE", "ASCO"];
const VERDICT_LABEL: Record<Concordance, string> = { concordant: "Bodies agree", discordant: "Bodies disagree", partial: "Partly appraised" };
const VERDICT_CLASS: Record<Concordance, string> = { concordant: "bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-100", discordant: "bg-rose-100 text-rose-900 dark:bg-rose-900/40 dark:text-rose-100", partial: "bg-foreground/5 text-muted" };

export function GuidelineConcordance({ rows }: { rows: ConcordanceRow[] }) {
  const [cancerSel, setCancerSel] = useState<string[]>([]);
  const [verdictSel, setVerdictSel] = useState<string | null>(null);
  const [onlyDisagree, setOnlyDisagree] = useState(false);
  const withVerdict = useMemo(() => rows.map((r) => ({ r, verdict: concordanceOf(r) })), [rows]);
  const cancerOptions = useMemo(() => [...new Map(rows.map((r) => [r.cancerId, r.cancerName])).entries()].map(([value, label]) => ({ value, label })).sort((a, b) => a.label.localeCompare(b.label)), [rows]);
  const shown = withVerdict.filter(({ r, verdict }) => (!cancerSel.length || cancerSel.includes(r.cancerId)) && (!verdictSel || verdict === verdictSel) && (!onlyDisagree || verdict === "discordant"));

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <FacetSelect label="Cancer" options={cancerOptions} value={cancerSel} onChange={(v) => setCancerSel(v as string[])} multi searchable allLabel="Any" width="w-56" />
        <FacetSelect label="Verdict" options={(Object.keys(VERDICT_LABEL) as Concordance[]).map((v) => ({ value: v, label: VERDICT_LABEL[v] }))} value={verdictSel} onChange={(v) => setVerdictSel(v as string | null)} searchable={false} allLabel="Any" width="w-48" />
        <label className="inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={onlyDisagree} onChange={(e) => setOnlyDisagree(e.target.checked)} /> Only where bodies disagree</label>
        <span className="ml-auto text-sm text-muted"><span className="font-semibold text-foreground tabular-nums">{shown.length}</span> of {rows.length} settings</span>
      </div>
      <div className="card overflow-x-auto">
        <table className="onco">
          <thead>
            <tr>
              <th className="min-w-[260px]">Setting and intervention</th>
              {BODIES.map((b) => <th key={b} className="text-center min-w-[150px]"><Tip title={`${BODY_META[b].label} · ${BODY_META[b].region}`} text={BODY_META[b].what} href={BODY_META[b].url} linkLabel="Body website →"><span className="underline decoration-dotted decoration-foreground/30 underline-offset-[3px] cursor-help">{b}</span></Tip></th>)}
              <th>Verdict</th>
            </tr>
          </thead>
          <tbody>
            {shown.map(({ r, verdict }) => (
              <tr key={r.key} className={verdict === "discordant" ? "bg-rose-50/60 dark:bg-rose-950/20" : ""}>
                <td>
                  <div className="text-xs text-muted"><Link href={r.cancerRoute} className="hover:underline">{r.cancerName}</Link> · {r.setting}</div>
                  <div className="font-medium text-sm mt-0.5">{r.intervention}</div>
                  <div className="mt-1 flex flex-wrap gap-1">{r.refs.map((x) => <Link key={x.id} href={x.route} className="chip border bg-card border-border text-[11px] hover:bg-foreground/5">{x.name}</Link>)}</div>
                </td>
                {BODIES.map((b) => {
                  const e = r.bodies.find((x) => x.body === b);
                  if (!e) return <td key={b} className="text-center text-muted/40" aria-label={`${b}: no entry`}>·</td>;
                  const tip = `${e.recommendation}${e.grade ? ` Grade: ${e.grade}.` : ""}${e.note ? ` ${e.note}` : ""} (${e.date})`;
                  return (
                    <td key={b} className="text-center align-top">
                      <Tip title={`${b}: ${STANCE_LABEL[e.stance]}`} text={tip} href={e.url} linkLabel="Source →">
                        <a href={e.url} target="_blank" rel="noopener noreferrer" className={`chip cursor-help ${STANCE_CLASS[e.stance]}`}>{STANCE_LABEL[e.stance]}</a>
                      </Tip>
                      {e.grade && <div className="text-[11px] text-muted mt-1 max-w-[160px] mx-auto leading-tight">{e.grade}</div>}
                      <div className="text-[10px] text-muted/70 mt-0.5 tabular-nums">{e.date}</div>
                    </td>
                  );
                })}
                <td><span className={`chip ${VERDICT_CLASS[verdict]}`}>{VERDICT_LABEL[verdict]}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
        {shown.length === 0 && <div className="px-6 py-12 text-center text-muted text-sm">Nothing matches. Clear a filter.</div>}
      </div>
    </div>
  );
}

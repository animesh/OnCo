"use client";

import { useMemo } from "react";
import Link from "next/link";
import { biomarkers } from "@/data/biomarkers";
import { scoreRows, type MatchRow } from "@/lib/biomarker-match";
import { conditionQuery } from "@/lib/ctgov";
import { STAGES, useProfile, type Stage } from "@/lib/profile";
import { STATUS_LABEL, statusClass } from "@/lib/text";
import { ProfileBar, type ProfileCancer, type ProfileLine } from "./ProfileBar";
import { TrialFinderGeo } from "./TrialFinderGeo";
import { CaregiverPanel, type CareDetail, type QuestionItem, type SupportItem } from "./CaregiverPanel";
import { KindIcon } from "./KindIcon";
import { MoleculeThumb, hasMolecule } from "./MoleculeThumb";
import { TechThumb } from "./TechThumb";

/** The visual the site already draws for this record: a technology schematic, a rotating molecule for the top drug rows, else the kind's icon. */
function RowVisual({ r, rank }: { r: MatchRow; rank: number }) {
  if (r.kind === "technology") return <TechThumb id={r.id} sections={[]} name={r.name} route={r.route} className="h-9 w-12" />;
  if (r.kind === "drug" && rank < 8 && hasMolecule(r.id)) return <div className="h-9 w-12 overflow-hidden rounded-md border border-border bg-card"><MoleculeThumb drugId={r.id} className="h-9 w-12" /></div>;
  return <div className="h-9 w-12 flex items-center justify-center rounded-md border border-border bg-foreground/5 text-muted"><KindIcon kind={r.kind} className="h-5 w-5" /></div>;
}

export type SocRef = { id: string; name: string; route: string; status?: string; kind: string; technologies: string[] };
export type SocRow = { setting: string; approach: string; refs: SocRef[] };
export type NavCancer = ProfileCancer & { route: string; tldr: string; stateOfArt: string[]; soc: SocRow[]; pipeline: string[] };

export type NavigatorData = {
  cancers: NavCancer[];
  rows: MatchRow[];
  lines: ProfileLine[];
  details: Record<string, CareDetail>;
  support: SupportItem[];
  questions: Record<string, QuestionItem[]>;
};

const EVIDENCE: Record<string, number> = { approved: 10, "standard-of-care": 10, established: 6, "phase-3": 6, positive: 6, emerging: 3, "phase-2": 4, "phase-1": 2, preclinical: 1, concept: 0 };
const HOPEFUL = (s?: string) => !["negative", "withdrawn", "historic"].includes(s ?? "");

/** Which standard-of-care rows apply to a stage, by matching the row's setting text. */
function settingMatches(setting: string, stage: Stage): boolean {
  const s = setting.toLowerCase();
  const metastatic = /metastatic|advanced|recurrent|relapsed|unresectable|castration|later line|second|third|refractory/.test(s);
  const early = /stage i\b|stage i-|stage ii|early|localised|localized|resectable|neoadjuvant|adjuvant|screening|prevention|newly diagnosed|frontline|limited/.test(s);
  const locallyAdvanced = /stage iii|locally advanced|unresectable stage|intermediate/.test(s);
  switch (stage) {
    case "early": return early || (!metastatic && !locallyAdvanced);
    case "locally-advanced": return locallyAdvanced || (early && !/screening|prevention/.test(s));
    case "metastatic-first-line": return metastatic && !/later line|second|third|after|refractory|relapse/.test(s);
    case "metastatic-later": return metastatic;
    default: return true;
  }
}

export function Navigator({ data }: { data: NavigatorData }) {
  const [profile, , ready] = useProfile();
  const cancer = data.cancers.find((c) => c.id === profile.cancerId);
  const selectedBm = biomarkers.filter((b) => profile.biomarkers.includes(b.id));
  const tried = useMemo(() => new Set(profile.priorLines), [profile.priorLines]);

  // Expand "tried" to the technologies/classes and targets those products belong to, for caution matching.
  const triedClasses = useMemo(() => {
    const s = new Set<string>(tried);
    for (const r of data.rows) if (tried.has(r.id)) { r.technologies.forEach((t) => s.add(t)); r.targets.forEach((t) => s.add(t)); }
    return s;
  }, [data.rows, tried]);

  const socRows = useMemo(() => cancer ? cancer.soc.filter((r) => settingMatches(r.setting, profile.stage)) : [], [cancer, profile.stage]);
  const socRefIds = useMemo(() => new Set(socRows.flatMap((r) => r.refs.map((x) => x.id))), [socRows]);
  const pipelineIds = useMemo(() => new Set(cancer?.pipeline ?? []), [cancer]);

  const options = useMemo(() => {
    if (!cancer) return [];
    const bmScores = new Map(scoreRows(data.rows, selectedBm, cancer.id).map((s) => [s.row.id, s]));
    return data.rows
      .filter((r) => (r.kind === "drug" || r.kind === "technology") && r.cancers.includes(cancer.id) && HOPEFUL(r.status) && !tried.has(r.id))
      .map((r) => {
        const bm = bmScores.get(r.id);
        const parts: Array<[string, number]> = [];
        const ev = EVIDENCE[r.status ?? ""] ?? 0; if (ev) parts.push([STATUS_LABEL[r.status ?? ""] ?? r.status ?? "", ev]);
        if (socRefIds.has(r.id)) parts.push(["standard of care for this setting", 8]);
        if (pipelineIds.has(r.id)) parts.push(["in the pipeline", 4]);
        if (bm) parts.push([`biomarker match: ${bm.hits.join(", ")}`, bm.score]);
        const score = parts.reduce((a, [, v]) => a + v, 0);
        return { r, score, parts };
      })
      .filter((x) => x.score > 0)
      .sort((a, b) => b.score - a.score || a.r.name.localeCompare(b.r.name));
  }, [cancer, data.rows, selectedBm, tried, socRefIds, pipelineIds]);

  const cautions = useMemo(() => data.rows.filter((r) => r.pair?.caution && (triedClasses.has(r.pair.a) || triedClasses.has(r.pair.b) || r.technologies.some((t) => triedClasses.has(t)) || r.targets.some((t) => triedClasses.has(t)))), [data.rows, triedClasses]);

  const careTreatments: CareDetail[] = useMemo(() => {
    const ids = [...profile.priorLines, ...options.slice(0, 4).map((o) => o.r.id)];
    return [...new Set(ids)].map((id) => data.details[id]).filter((x): x is CareDetail => !!x);
  }, [profile.priorLines, options, data.details]);

  return (
    <div className="space-y-8">
      <ProfileBar cancers={data.cancers} lines={data.lines} />

      <div className="card p-4 border-rose-300 bg-rose-50/60 dark:bg-rose-950/20 dark:border-rose-900 text-sm">
        <span className="font-semibold">Not medical advice.</span> This navigator ranks what is documented in OnCo for a cancer, stage, and biomarker set. It does not know your case, your fitness, your prior responses, or local availability. Use it to prepare questions, then decide with your clinical team.
      </div>

      {!ready && <p className="text-sm text-muted">Loading your profile…</p>}
      {ready && !cancer && (
        <div className="card p-8 text-center text-muted">Choose a cancer type in the profile bar to build the line-of-therapy view. Add stage, biomarkers, and treatments already received to sharpen it.</div>
      )}

      {cancer && (
        <>
          <section>
            <div className="flex flex-wrap items-baseline justify-between gap-2 mb-3">
              <h2 className="text-xl font-semibold"><Link href={cancer.route} className="hover:underline">{cancer.name}</Link><span className="text-muted font-normal text-base"> · {STAGES.find((s) => s.id === profile.stage)?.label}</span></h2>
              <Link href={cancer.route} className="text-sm underline">Full cancer page →</Link>
            </div>
            <p className="text-[15px]">{cancer.tldr}</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold mb-2">Standard of care for this setting <span className="text-muted text-sm font-normal">({socRows.length} of {cancer.soc.length} settings)</span></h2>
            {socRows.length === 0 && <p className="text-sm text-muted">No standard-of-care rows match this stage; set stage to &quot;Not sure&quot; to see all.</p>}
            <div className="space-y-3">
              {socRows.map((r, i) => (
                <div key={i} className="card p-4">
                  <div className="font-medium">{r.setting}</div>
                  <p className="text-[15px] text-foreground/85 mt-1">{r.approach}</p>
                  {r.refs.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {r.refs.map((x) => <Link key={x.id} href={x.route} className={`chip border ${tried.has(x.id) ? "line-through opacity-60 bg-foreground/5 border-border" : "bg-card border-border hover:bg-foreground/5"}`}>{x.name}{tried.has(x.id) && <span className="ml-1 no-underline">✓ tried</span>}</Link>)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {cautions.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold mb-2">Cautions</h2>
              <div className="grid gap-3 md:grid-cols-2">
                {cautions.map((c) => <Link key={c.id} href={c.route} className="card p-4 border-amber-300 dark:border-amber-900 hover:shadow-md transition"><div className="font-medium">⚠ {c.name}</div><p className="text-sm text-muted mt-1 line-clamp-3">{c.tldr}</p></Link>)}
              </div>
            </section>
          )}

          <section>
            <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
              <h2 className="text-lg font-semibold">Next options, ranked <span className="text-muted text-sm font-normal">{options.length}</span></h2>
              <details className="text-xs text-muted"><summary className="cursor-pointer">How the rank works</summary><p className="mt-1 max-w-md">Evidence tier (approved 10 … concept 0) + 8 if it appears in the standard-of-care rows for this setting + 4 if it is in the cancer&apos;s pipeline + biomarker match points from the tumour-board matcher. It ranks documentation and evidence, not benefit for you.</p></details>
            </div>
            <div className="card overflow-x-auto">
              <table className="onco">
                <thead><tr><th>#</th><th>Option</th><th>Phase / status</th><th className="hidden md:table-cell">Why it ranks</th><th>Score</th></tr></thead>
                <tbody>
                  {options.slice(0, 40).map((o, i) => (
                    <tr key={o.r.id}>
                      <td className="tabular-nums text-muted">{i + 1}</td>
                      <td className="min-w-[220px]"><div className="flex items-start gap-3"><Link href={o.r.route} className="shrink-0" aria-hidden tabIndex={-1}><RowVisual r={o.r} rank={i} /></Link><div><Link href={o.r.route} className="font-medium hover:underline">{o.r.name}</Link><div className="text-xs text-muted line-clamp-2 max-w-lg">{o.r.meta && <span className="text-foreground/70">{o.r.meta} · </span>}{o.r.tldr}</div></div></div></td>
                      <td>{o.r.status && <span className={`chip ${statusClass(o.r.status)}`}>{STATUS_LABEL[o.r.status] ?? o.r.status}</span>}</td>
                      <td className="hidden md:table-cell"><div className="flex flex-wrap gap-1">{o.parts.map(([k, v]) => <span key={k} className="chip bg-foreground/5 text-[10px]">{k} +{v}</span>)}</div></td>
                      <td className="tabular-nums font-semibold">{o.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {options.length === 0 && <div className="p-6 text-center text-sm text-muted">Nothing left to rank for this combination.</div>}
            </div>
          </section>

          {profile.mode === "caregiver" && (
            <section>
              <h2 className="text-lg font-semibold mb-2">For caregivers</h2>
              <CaregiverPanel treatments={careTreatments} support={data.support} questions={data.questions[cancer.id] ?? []} cancerName={cancer.name.replace(/\s*\(.*?\)\s*$/, "")} />
            </section>
          )}

          <section>
            <h2 className="text-lg font-semibold mb-2">Recruiting trials</h2>
            <TrialFinderGeo condition={conditionQuery(cancer.name)} title={cancer.name} />
          </section>
        </>
      )}
    </div>
  );
}

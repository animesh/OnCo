"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useProfile } from "@/lib/profile";
import { REGION_META, REGION_ORDER, useRegion, type Region } from "@/lib/region";
import { assembleSituation, hasSituation, NOT_TESTED, type Situation, type SituationData, type SituationItem, type SituationSectionId, type SituationTone } from "@/lib/for-me-situation";
import { RedCards } from "./RedCards";

/**
 * The situation form and the sections it drives on the "For me" page (roadmap item 101). The per-cancer data is
 * the static JSON at /api/v1/for-me/<id>.json (written by scripts/build-api.ts from src/lib/for-me-situation-data.ts),
 * fetched when the reader opens the form; the reader's answers live in the browser profile (onco:profile:v1) and the
 * country comes from the header's region toggle. Simple mode (cancer only) stays the default: the form sits behind a
 * disclosure and the sections appear once the reader has said something more. Orientation, not medical advice.
 */

const cache = new Map<string, Promise<SituationData | null>>();
function loadSituation(id: string): Promise<SituationData | null> {
  let p = cache.get(id);
  if (!p) {
    p = fetch(`/api/v1/for-me/${encodeURIComponent(id)}.json`).then(async (r) => (r.ok ? ((await r.json()) as SituationData) : null)).catch(() => null);
    cache.set(id, p);
  }
  return p;
}

/** One monoline glyph per section: 24x24, 1.5px stroke, currentColor, like GuideIcon and KindIcon. */
const GLYPH: Record<SituationSectionId | "form" | "forget", string> = {
  // Map pin: where you are
  where: "M12 21s-6-5.3-6-11a6 6 0 0 1 12 0c0 5.7-6 11-6 11ZM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z",
  // Clipboard with a tick: the standard row
  standard: "M9 4h6a1 1 0 0 1 1 1v1H8V5a1 1 0 0 1 1-1ZM6 6h2m8 0h2a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1M9 13l2 2 4-4",
  // Double helix: biomarkers
  biomarkers: "M8 3c0 4.5 8 4.5 8 9s-8 4.5-8 9M16 3c0 4.5-8 4.5-8 9s8 4.5 8 9M9.5 6.5h5M9.5 17.5h5M8.5 12h7",
  // Flask: trials
  trials: "M9 3v6l-4.5 8A2 2 0 0 0 6.2 20h11.6a2 2 0 0 0 1.7-3L15 9V3M8 3h8M7.5 14h9",
  // Triangle with a mark: warnings
  warnings: "M12 3 2.5 20h19L12 3ZM12 9.5v5M12 17.2v.1",
  // Speech bubble with a question mark: questions
  questions: "M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v9a1.5 1.5 0 0 1-1.5 1.5H10l-4.5 4v-4H5.5A1.5 1.5 0 0 1 4 14.5v-9ZM10 9a2 2 0 1 1 3 1.7c-.6.4-1 .8-1 1.5M12 14.2v.1",
  // Calendar: the first 60 days
  first60: "M4 6.5A1.5 1.5 0 0 1 5.5 5h13A1.5 1.5 0 0 1 20 6.5v12a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5v-12ZM4 10h16M8 3v4M16 3v4M8 14h3M13 14h3M8 17h3",
  // Printer: appointment sheet
  sheet: "M7 8V4h10v4M5 8h14a1.5 1.5 0 0 1 1.5 1.5v6H17v-3H7v3H3.5v-6A1.5 1.5 0 0 1 5 8ZM7 15.5h10V20H7z",
  // Id card with a pen: the form
  form: "M3 6.5A1.5 1.5 0 0 1 4.5 5h15A1.5 1.5 0 0 1 21 6.5v11a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5v-11ZM8.5 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM5.5 16a3 3 0 0 1 6 0M14 9h4M14 12.5h4M14 16h2.5",
  // Eraser: forget everything
  forget: "M4 16.5 13.5 7a2 2 0 0 1 2.8 0l3.7 3.7a2 2 0 0 1 0 2.8L14.5 19H8.5l-4.5-2.5ZM8.5 19h12M9 11.5l5.5 5.5",
};

function Glyph({ id, className = "h-5 w-5" }: { id: keyof typeof GLYPH; className?: string }) {
  return <svg viewBox="0 0 24 24" aria-hidden focusable="false" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d={GLYPH[id]} /></svg>;
}

const TONE_CLASS: Record<SituationTone, string> = {
  plain: "border-border bg-card text-foreground",
  had: "border-border bg-surface text-muted",
  match: "border-accent/40 bg-accent-soft text-accent",
  approved: "border-emerald-300 bg-emerald-50/70 text-emerald-950 dark:bg-emerald-950/30 dark:border-emerald-900 dark:text-emerald-100",
  unknown: "border-border bg-card text-muted",
  caution: "border-amber-300 bg-amber-50/70 text-amber-950 dark:bg-amber-950/30 dark:border-amber-900 dark:text-amber-100",
};

function Item({ it }: { it: SituationItem }) {
  return (
    <li className="card p-3 text-sm flex flex-col gap-1">
      <div className="flex flex-wrap items-center gap-1.5">
        <Link href={it.route} className="font-medium leading-snug hover:underline">{it.name}</Link>
        {it.badge && <span className={`chip border text-[11px] ${TONE_CLASS[it.tone ?? "plain"]}`}>{it.badge}</span>}
      </div>
      {it.note && <p className="text-xs text-muted leading-snug">{it.note}</p>}
      {it.source && <a href={it.source.url} rel="noopener" target="_blank" className="text-[11px] text-muted underline decoration-foreground/20 hover:decoration-foreground self-start">{it.source.label}</a>}
    </li>
  );
}

function Check({ checked, onChange, children }: { checked: boolean; onChange: (v: boolean) => void; children: React.ReactNode }) {
  return <label className="flex items-start gap-2 text-sm leading-snug cursor-pointer"><input type="checkbox" className="mt-0.5" checked={checked} onChange={(e) => onChange(e.target.checked)} />{children}</label>;
}

export function ForMeSituation({ cancerId, cancerName }: { cancerId: string; cancerName: string }) {
  const [profile, update, ready, reset] = useProfile();
  const { region, setRegion, ready: regionReady } = useRegion();
  const [open, setOpen] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  /** The last file read, keyed by cancer id so a change of cancer never shows the previous cancer's records. `data: null` means the read failed. */
  const [loaded, setLoaded] = useState<{ id: string; data: SituationData | null } | null>(null);
  const data = loaded?.id === cancerId ? loaded.data : null;
  const failed = loaded?.id === cancerId && loaded.data === null;

  const situation: Situation = useMemo(() => ({
    setting: profile.setting, biomarkers: profile.biomarkers, hadTreatments: profile.hadTreatments, wantsTrials: profile.wantsTrials, diagnosedRecently: profile.diagnosedRecently, region,
  }), [profile.setting, profile.biomarkers, profile.hadTreatments, profile.wantsTrials, profile.diagnosedRecently, region]);
  const told = ready && hasSituation(situation);

  // Fetch the cancer's file once the reader opens the form or has answers saved; nothing is loaded for the simple view.
  useEffect(() => {
    if (!(open || told)) return;
    let live = true;
    loadSituation(cancerId).then((d) => { if (live) setLoaded({ id: cancerId, data: d && d.cancer.id === cancerId ? d : null }); });
    return () => { live = false; };
  }, [cancerId, open, told, attempt]);

  const sections = useMemo(() => (told && data ? assembleSituation(data, situation) : []), [told, data, situation]);

  const toggle = (field: "biomarkers" | "hadTreatments", key: string, on: boolean) => {
    const cur = profile[field];
    update({ [field]: on ? [...new Set([...cur, key])] : cur.filter((k) => k !== key) });
  };
  const socDrugs = data ? data.drugs.filter((d) => d.inStandardOfCare) : [];
  const lines = data ? [...new Set(data.rows.map((r) => r.lineLabel))] : [];

  return (
    <div className="mt-5" id="situation">
      {/* Opens itself when answers are saved; the reader can still fold it away (dismissed) and reopen it. */}
      <details className="card p-0 overflow-hidden" open={(open || (told && !dismissed)) || undefined} onToggle={(e) => { const o = (e.currentTarget as HTMLDetailsElement).open; setOpen(o); setDismissed(!o); }}>
        <summary className="cursor-pointer list-none px-4 py-3 flex items-center gap-3 hover:bg-surface">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent"><Glyph id="form" /></span>
          <span className="min-w-0">
            <span className="block font-medium">Tell OnCo more about your situation</span>
            <span className="block text-xs text-muted">Setting, biomarkers, treatments already had, country and whether you want trials. Saved in this browser only; nothing is sent anywhere.</span>
          </span>
          <span className="ms-auto text-xs text-muted shrink-0">{told ? "Editing" : "Optional"}</span>
        </summary>
        {!data && (
          <div className="px-4 pb-4 pt-3 text-sm text-muted border-t border-border" aria-live="polite">
            {failed ? <>The record file for {cancerName} could not be loaded. <button type="button" onClick={() => { cache.delete(cancerId); setLoaded(null); setAttempt((a) => a + 1); }} className="underline">Try again</button>.</> : `Reading the ${cancerName} records…`}
          </div>
        )}
        {data && <div className="px-4 pb-4 pt-1 grid gap-4 md:grid-cols-2 text-sm border-t border-border">
          <div className="grid gap-4">
            <label className="block">
              <span className="kicker block mb-1">Stage or setting</span>
              <select value={profile.setting && data.rows.some((r) => r.id === profile.setting) ? profile.setting : ""} onChange={(e) => update({ setting: e.target.value || undefined })} className="w-full rounded-lg border border-border bg-card px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-accent/40">
                <option value="">Not sure / not chosen</option>
                {lines.map((l) => <optgroup key={l} label={l}>{data.rows.filter((r) => r.lineLabel === l).map((r) => <option key={r.id} value={r.id}>{r.setting}</option>)}</optgroup>)}
              </select>
              <span className="block text-xs text-muted mt-1">{data.rows.length ? `The ${data.rows.length} settings are the rows of the standard of care recorded for ${data.cancer.name}.` : `No standard-of-care rows are recorded for ${data.cancer.name}.`}</span>
            </label>
            <div>
              <span className="kicker block mb-1">Treatments already had</span>
              {socDrugs.length ? (
                <div className="grid gap-1 max-h-48 overflow-y-auto pr-1">{socDrugs.map((d) => <Check key={d.id} checked={profile.hadTreatments.includes(d.id)} onChange={(v) => toggle("hadTreatments", d.id, v)}>{d.name} <span className="text-xs text-muted">{d.modality}</span></Check>)}</div>
              ) : <p className="text-xs text-muted">The standard of care for {data.cancer.name} names no product to tick.</p>}
            </div>
          </div>
          <div className="grid gap-4">
            <div>
              <span className="kicker block mb-1">Biomarkers on your report</span>
              {data.biomarkers.length ? (
                <div className="grid gap-1 max-h-48 overflow-y-auto pr-1">
                  {data.biomarkers.map((b) => <Check key={b.key} checked={profile.biomarkers.includes(b.key)} onChange={(v) => toggle("biomarkers", b.key, v)}>{b.label}{b.targets.length > 0 && <span className="text-xs text-muted"> · {b.targets.map((t) => t.name).join(", ")}</span>}</Check>)}
                  <Check checked={profile.biomarkers.includes(NOT_TESTED)} onChange={(v) => toggle("biomarkers", NOT_TESTED, v)}><span className="font-medium">Not tested / I do not know</span></Check>
                </div>
              ) : <p className="text-xs text-muted">The record for {data.cancer.name} lists no biomarkers.</p>}
            </div>
            <div>
              <span className="kicker block mb-1">Country</span>
              <div className="flex flex-wrap gap-1.5" role="group" aria-label="Country">
                <button type="button" onClick={() => setRegion(null)} className={`chip border ${region === null ? "border-accent/40 bg-accent-soft text-accent" : "border-border bg-card hover:bg-surface"}`}>Global</button>
                {REGION_ORDER.map((r: Region) => <button key={r} type="button" onClick={() => setRegion(r)} className={`chip border ${region === r ? "border-accent/40 bg-accent-soft text-accent" : "border-border bg-card hover:bg-surface"}`}><span aria-hidden>{REGION_META[r].flag}</span> {REGION_META[r].label}</button>)}
              </div>
              <span className="block text-xs text-muted mt-1">{regionReady && region ? `Approval status below is read for ${REGION_META[region].regulator}. Same setting as the globe in the header.` : "Choose a country to read approval status for its regulator."}</span>
            </div>
            <div className="grid gap-1">
              <Check checked={profile.wantsTrials} onChange={(v) => update({ wantsTrials: v })}>I want to see trials that fit</Check>
              <Check checked={profile.diagnosedRecently} onChange={(v) => update({ diagnosedRecently: v })}>The diagnosis is recent (adds the first 60 days)</Check>
            </div>
          </div>
          <div className="md:col-span-2 flex flex-wrap items-center gap-3 pt-1 border-t border-border">
            <button type="button" onClick={() => reset()} className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm hover:bg-surface"><Glyph id="forget" className="h-4 w-4" />Forget everything</button>
            <span className="text-xs text-muted">Clears the cancer and every answer from this browser. The country setting in the header is kept.</span>
          </div>
        </div>}
      </details>

      {told && data && (
        <div className="mt-6 space-y-8" aria-label={`Your situation with ${data.cancer.name}`}>
          <p className="text-xs text-muted">Each block is read from the records it links to. Where your answers match no record, it says so. Orientation, not medical advice.</p>
          {sections.map((s) => (
            <section key={s.id} id={`situation-${s.id}`} className="relative pl-12 sm:pl-14 scroll-mt-28">
              <span className="absolute left-0 top-0 inline-flex h-9 w-9 items-center justify-center rounded-xl bg-accent-soft text-accent"><Glyph id={s.id} className="h-5 w-5" /></span>
              <h3 className="text-lg font-semibold tracking-tight leading-snug"><a href={`#situation-${s.id}`} className="hover:underline">{s.title}</a></h3>
              <p className="text-[15px] leading-relaxed mt-1">{s.lead}</p>
              {s.empty && <p className="mt-2 rounded-lg border border-dashed border-border px-3 py-2 text-sm text-muted">{s.empty}</p>}
              {s.items.length > 0 && <ul className="grid gap-2 sm:grid-cols-2 mt-3">{s.items.map((it) => <Item key={`${s.id}-${it.id}`} it={it} />)}</ul>}
              {s.redCards && s.redCards.length > 0 && <div className="mt-3"><RedCards cards={s.redCards} cancerName={data.cancer.name} compact /></div>}
              {s.questions && s.questions.length > 0 && (
                <ol className="mt-3 space-y-2">
                  {s.questions.map((q, i) => <li key={i} className="card p-3 text-sm"><div className="font-medium leading-snug">{q.question}</div><div className="text-xs text-muted mt-0.5">{q.why} <span className="opacity-70">({q.setting})</span></div></li>)}
                </ol>
              )}
              {s.links.length > 0 && <div className="flex flex-wrap gap-1.5 mt-3 text-xs">{s.links.map((l) => l.href.startsWith("http") ? <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="chip border border-border bg-card hover:bg-surface">{l.label}</a> : <Link key={l.href} href={l.href} className="chip border border-border bg-card hover:bg-surface">{l.label}</Link>)}</div>}
            </section>
          ))}
        </div>
      )}
    </div>
  );
}

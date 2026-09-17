"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { loadPrep, questionKey, savePrep, type PrepState } from "@/lib/prep";
import { clearSheet, EMPTY_SHEET, loadSheet, saveSheet, type SheetState } from "@/lib/prep-sheet";
import type { SheetData } from "@/lib/first-60-days";
import { GuideIcon, type GuideIconId } from "./GuideIcon";
import { CancerIcon } from "./CancerIcon";

const today = () => new Date().toISOString().slice(0, 10);

/** A section of the sheet: icon, title, optional "hidden when printing" note. */
function Part({ icon, title, children, aside }: { icon: GuideIconId; title: string; children: React.ReactNode; aside?: React.ReactNode }) {
  return (
    <section className="prep-part">
      <div className="flex items-baseline justify-between gap-3 mb-1.5">
        <h2 className="flex items-center gap-2 font-semibold text-[15px]"><span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-accent-soft text-accent print:bg-transparent print:text-black"><GuideIcon id={icon} className="h-3.5 w-3.5" /></span>{title}</h2>
        {aside && <span className="no-print text-xs text-muted">{aside}</span>}
      </div>
      {children}
    </section>
  );
}

/** A free-text field: a textarea on screen, the typed text (or ruled blank lines) on paper. */
function Field({ label, value, onChange, lines = 3, placeholder }: { label: string; value: string; onChange: (v: string) => void; lines?: number; placeholder?: string }) {
  return (
    <div className="prep-field">
      <div className="text-xs text-muted mb-0.5">{label}</div>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={lines} placeholder={placeholder} aria-label={label} className="print:hidden w-full rounded-lg border border-border bg-card px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-accent/40" />
      {value.trim() ? <p className="hidden print:block text-sm whitespace-pre-wrap">{value.trim()}</p> : <div className="hidden print:block prep-lines" style={{ height: `${lines * 1.5}rem` }} aria-hidden />}
    </div>
  );
}

/**
 * The one-page appointment sheet for a cancer: details, questions (the cancer's own set plus the reader's,
 * ticked state and text kept in this browser), the words to expect, what to bring, the treatments the standard
 * of care names, and room for the answers and next steps. Ticks made on /prep/ for the same cancer carry over.
 */
export function PrepSheet({ data }: { data: SheetData }) {
  const [sheet, setSheet] = useState<SheetState>(EMPTY_SHEET);
  const [prep, setPrep] = useState<PrepState | null>(null);
  const [ready, setReady] = useState(false);
  const [draft, setDraft] = useState("");
  const [showWhy, setShowWhy] = useState(false);

  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const p = loadPrep();
      const s = loadSheet(data.cancer.id);
      // First visit: seed the ticks from the prep pack when it was built for this cancer.
      if (!s.picked && p.cancerId === data.cancer.id && p.picked.length) s.picked = p.picked;
      setPrep(p); setSheet(s); setReady(true);
    });
    return () => cancelAnimationFrame(id);
  }, [data.cancer.id]);

  const commit = (patch: Partial<SheetState>) => setSheet((s) => saveSheet(data.cancer.id, { ...s, ...patch }));
  const commitPrep = (patch: Partial<PrepState>) => setPrep((p) => { const next = savePrep({ ...(p ?? loadPrep()), ...patch }); return next; });

  const picked = useMemo(() => new Set(sheet.picked ?? data.questions.map(questionKey)), [sheet.picked, data.questions]);
  const chosen = data.questions.filter((q) => picked.has(questionKey(q)));
  const custom = prep?.custom ?? [];
  const toggle = (k: string) => { const next = new Set(picked); if (next.has(k)) next.delete(k); else next.add(k); commit({ picked: [...next] }); };
  const addCustom = () => { const t = draft.trim(); if (!t) return; commitPrep({ custom: [...custom, t] }); setDraft(""); };
  const reset = () => { clearSheet(data.cancer.id); setSheet(EMPTY_SHEET); };

  const settings = [...new Set(chosen.map((q) => q.setting))];

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
      {/* Controls: hidden when printing */}
      <div className="no-print space-y-4">
        <div className="card p-4">
          <h2 className="font-semibold mb-1">Tick the questions to print</h2>
          <p className="text-xs text-muted mb-2">All of this cancer&apos;s questions start ticked. Untick what does not apply; ticks are kept in this browser. <button type="button" onClick={() => setShowWhy((v) => !v)} className="underline">{showWhy ? "Hide" : "Show"} why each matters</button>.</p>
          <ul className="space-y-1.5 max-h-[28rem] overflow-y-auto pr-1">
            {data.questions.map((q) => { const k = questionKey(q); return (
              <li key={k}><label className="flex gap-2 cursor-pointer text-sm leading-snug"><input type="checkbox" className="mt-1 shrink-0" checked={picked.has(k)} onChange={() => toggle(k)} /><span><span className="text-xs text-muted">{q.setting}: </span>{q.question}{showWhy && <span className="block text-xs text-muted">{q.why}</span>}</span></label></li>
            ); })}
          </ul>
        </div>
        <div className="card p-4">
          <h2 className="font-semibold mb-1">Your own questions</h2>
          <div className="flex gap-2">
            <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustom(); } }} placeholder="Type a question and press Enter" aria-label="Add your own question" className="flex-1 rounded-lg border border-border bg-card px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-accent/40" />
            <button type="button" onClick={addCustom} className="rounded-lg bg-accent text-white px-3 py-1.5 text-sm font-medium hover:brightness-110">Add</button>
          </div>
          {custom.length > 0 && <ul className="mt-2 space-y-1 text-sm">{custom.map((c, i) => <li key={`${i}-${c}`} className="flex items-start justify-between gap-3"><span>{c}</span><button type="button" onClick={() => commitPrep({ custom: custom.filter((_, j) => j !== i) })} className="text-xs underline text-muted shrink-0">Remove</button></li>)}</ul>}
          <p className="text-xs text-muted mt-2">Shared with the <Link href="/prep/" className="underline">prep pack</Link>, so questions you add there appear here too.</p>
        </div>
        <div className="card p-4 text-sm">
          <h2 className="font-semibold mb-1 flex items-center gap-2"><GuideIcon id="print" className="h-4 w-4 text-accent" />Print or save as PDF</h2>
          <p className="text-muted text-xs">Use <button type="button" onClick={() => window.print()} className="underline text-foreground">Print</button> (or Ctrl+P, Cmd+P on a Mac). To keep a copy, choose <strong>Save as PDF</strong> as the destination in the print dialog. Only the sheet prints; the controls stay on screen. Your typed notes print where you typed them; empty fields print as ruled lines to write on.</p>
          {ready && (sheet.savedAt || custom.length > 0) ? <p className="text-xs text-muted mt-2">Saved in this browser. <button type="button" onClick={reset} className="underline">Clear this sheet</button>.</p> : null}
        </div>
      </div>

      {/* The sheet: what prints */}
      <article className="prep-sheet card p-5 sm:p-6 print:border-0 print:p-0 print:shadow-none space-y-5" aria-label="Appointment sheet">
        <header className="flex items-start gap-3 border-b border-border pb-3">
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent print:hidden"><CancerIcon cancerId={data.cancer.id} className="h-6 w-6" /></span>
          <div className="min-w-0 flex-1">
            <div className="kicker">Appointment sheet</div>
            <h1 className="text-xl font-semibold leading-tight"><Link href={data.cancer.route} className="hover:underline">{data.cancer.name}</Link></h1>
            <p className="text-xs text-muted mt-0.5">Prepared {ready ? today() : ""} with OnCo (onco.cc/prep/{data.cancer.id}/). Orientation, not medical advice; your team knows your case.</p>
          </div>
        </header>

        <Part icon="details" title="My details">
          <div className="grid grid-cols-2 gap-x-6 gap-y-2 text-sm">
            {["Name", "Date of appointment", "Hospital and clinician", "Who is coming with me"].map((l) => <div key={l} className="prep-blank"><span className="text-xs text-muted">{l}</span><span className="block border-b border-dotted border-border h-6" aria-hidden /></div>)}
          </div>
        </Part>

        <Part icon="now" title="What I know, what is unclear, changes to discuss" aside="Saved in this browser">
          <div className="grid sm:grid-cols-3 gap-3">
            <Field label="What I know so far" value={sheet.know} onChange={(v) => commit({ know: v })} placeholder="Diagnosis, stage, results I have been given" />
            <Field label="What is unclear to me" value={sheet.unclear} onChange={(v) => commit({ unclear: v })} placeholder="Words, letters or results I did not follow" />
            <Field label="Changes since last time" value={sheet.changes} onChange={(v) => commit({ changes: v })} placeholder="New symptoms and when they started, medicines, side effects" />
          </div>
        </Part>

        <Part icon="questions" title="My questions" aside={`${chosen.length + custom.length} on the sheet`}>
          {chosen.length + custom.length === 0 && <p className="text-sm text-muted">Tick questions on the left, or add your own.</p>}
          {settings.map((s) => (
            <div key={s} className="mt-2">
              <div className="text-xs text-muted mb-0.5">{s}</div>
              <ol className="space-y-1 text-sm">
                {chosen.filter((q) => q.setting === s).map((q) => <li key={questionKey(q)} className="grid grid-cols-[1.25rem_1fr] gap-1"><span className="tabular-nums text-muted">{chosen.indexOf(q) + 1}.</span><span>{q.question}<span className="hidden print:block h-6 border-b border-dotted border-border/60" aria-hidden /></span></li>)}
              </ol>
            </div>
          ))}
          {custom.length > 0 && (
            <div className="mt-2">
              <div className="text-xs text-muted mb-0.5">My own</div>
              <ol className="space-y-1 text-sm">{custom.map((c, i) => <li key={`${i}-${c}`} className="grid grid-cols-[1.25rem_1fr] gap-1"><span className="tabular-nums text-muted">{chosen.length + i + 1}.</span><span>{c}<span className="hidden print:block h-6 border-b border-dotted border-border/60" aria-hidden /></span></li>)}</ol>
            </div>
          )}
        </Part>

        {data.terms.length > 0 && (
          <Part icon="words" title="The words I may hear">
            <ul className="grid sm:grid-cols-2 gap-x-4 gap-y-1 text-sm">
              {data.terms.map((t) => <li key={t.id}><Link href={t.route} className="font-medium underline decoration-foreground/20 underline-offset-[3px] hover:decoration-foreground">{t.name}</Link>{t.tldr && <span className="text-muted">: {t.tldr}</span>}</li>)}
            </ul>
          </Part>
        )}

        {(data.tests.rows.length > 0 || data.tests.technologies.length > 0 || data.tests.biomarkers.length > 0) && (
          <Part icon="bring" title="Tests and results to bring">
            {data.tests.rows.map((r) => <p key={r.setting} className="text-sm"><span className="font-medium">{r.setting}:</span> {r.approach}</p>)}
            {data.tests.biomarkers.length > 0 && <p className="text-sm mt-1"><span className="font-medium">Biomarker results to ask for:</span> {data.tests.biomarkers.join(", ")}.</p>}
            {data.tests.technologies.length > 0 && <p className="text-sm mt-1"><span className="font-medium">Scans and tests linked to this cancer:</span> {data.tests.technologies.map((t, i) => <span key={t.id}>{i > 0 && ", "}<Link href={t.route} className="underline decoration-foreground/20 underline-offset-[3px]">{t.name}</Link></span>)}.</p>}
            <p className="text-xs text-muted mt-1">Bring copies of scan reports, pathology and blood results, and a list of every medicine and supplement.</p>
          </Part>
        )}

        {data.treatments.length > 0 && (
          <Part icon="decisions" title="The treatments I may be offered">
            <ul className="space-y-1.5 text-sm">
              {data.treatments.map((r, i) => (
                <li key={`${r.setting}-${i}`}><span className="font-medium">{r.setting}:</span> {r.approach}{r.refs.length > 0 && <span className="text-muted"> ({r.refs.map((l, j) => <span key={l.id}>{j > 0 && ", "}<Link href={l.route} className="underline decoration-foreground/20 underline-offset-[3px]">{l.name}</Link></span>)})</span>}</li>
              ))}
            </ul>
            <p className="text-xs text-muted mt-1">From the standard of care recorded for this cancer; which apply depends on your stage and biomarkers. Ask which the team recommends and why.</p>
          </Part>
        )}

        <Part icon="answers" title="Answers and next steps" aside="Saved in this browser">
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="What I was told" value={sheet.answers} onChange={(v) => commit({ answers: v })} lines={5} placeholder="Write during or straight after the visit" />
            <Field label="Agreed next steps, dates and who to call" value={sheet.next} onChange={(v) => commit({ next: v })} lines={5} placeholder="Tests booked, referrals, when treatment starts, contact numbers" />
          </div>
        </Part>

        <footer className="text-xs text-muted border-t border-border pt-2">
          Made with OnCo, a public, cited, work-in-progress map of oncology. Verify anything here at its source. Nothing on this page is medical advice.
          <span className="no-print"> More: <Link href={`/first-60-days/${data.cancer.id}/`} className="underline">the first 60 days with {data.cancer.name}</Link>, the <Link href="/prep/" className="underline">prep pack</Link>, the <Link href="/navigator/" className="underline">navigator</Link>.</span>
        </footer>
      </article>
    </div>
  );
}

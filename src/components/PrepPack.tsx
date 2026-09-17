"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useProfile } from "@/lib/profile";
import { clearPrep, EMPTY_PREP, groupBySetting, loadPrep, prepFileName, questionKey, savePrep, toText, type PrepQuestion, type PrepState } from "@/lib/prep";
import { FacetSelect } from "./filters/FacetSelect";
import { PrintButton } from "./PrintButton";
import { CancerIcon } from "./CancerIcon";

export type PrepCancer = { id: string; name: string; group: string; route: string; source: "handwritten" | "generated"; questions: PrepQuestion[] };
export type PrepData = { cancers: PrepCancer[]; lines: Record<string, { name: string; route: string }> };

const today = () => new Date().toISOString().slice(0, 10);

/**
 * Build a one-page question list for an appointment. Cancer choice is seeded from the browser profile;
 * ticks, custom questions and notes persist in localStorage under "onco:prep:v1". Print strips the
 * controls and leaves the pack; download writes a Markdown file from the browser, no server involved.
 */
export function PrepPack({ data }: { data: PrepData }) {
  const [profile, , profileReady] = useProfile();
  const [state, setState] = useState<PrepState>(EMPTY_PREP);
  const [ready, setReady] = useState(false);
  const [draft, setDraft] = useState("");

  // Read saved state after mount so the server HTML matches the first client render.
  useEffect(() => {
    const id = requestAnimationFrame(() => { setState(loadPrep()); setReady(true); });
    return () => cancelAnimationFrame(id);
  }, []);

  // If the pack has no cancer yet, fall back to the one in the profile; it is written to the pack on the first change.
  const profileCancerId = profileReady && data.cancers.some((c) => c.id === profile.cancerId) ? profile.cancerId : undefined;
  const cancerId = state.cancerId ?? (ready ? profileCancerId : undefined);

  const commit = (patch: Partial<PrepState>) => setState((s) => savePrep({ ...s, cancerId: s.cancerId ?? cancerId, ...patch }));

  const cancer = data.cancers.find((c) => c.id === cancerId);
  const picked = useMemo(() => new Set(state.picked), [state.picked]);
  const chosen = useMemo(() => (cancer ? cancer.questions.filter((q) => picked.has(questionKey(q))) : []), [cancer, picked]);
  const treatments = profile.priorLines.map((id) => data.lines[id]).filter((x): x is { name: string; route: string } => !!x);
  const groups = cancer ? groupBySetting(cancer.questions) : [];
  const total = chosen.length + state.custom.length;
  // Numbering for the printed pack: corpus questions in setting order, then the reader's own.
  const chosenGroups = groupBySetting(chosen);
  const ordered = chosenGroups.flatMap(([, qs]) => qs);
  const numberOf = (q: PrepQuestion) => ordered.indexOf(q) + 1;

  const toggle = (q: PrepQuestion) => {
    const k = questionKey(q);
    commit({ picked: picked.has(k) ? state.picked.filter((x) => x !== k) : [...state.picked, k] });
  };
  const setGroup = (qs: PrepQuestion[], on: boolean) => {
    const keys = qs.map(questionKey);
    const rest = state.picked.filter((k) => !keys.includes(k));
    commit({ picked: on ? [...rest, ...keys] : rest });
  };
  const addCustom = () => {
    const t = draft.trim();
    if (!t) return;
    commit({ custom: [...state.custom, t] });
    setDraft("");
  };
  const download = () => {
    const date = today();
    const text = toText({ cancerName: cancer?.name, questions: chosen, custom: state.custom, treatments: treatments.map((t) => t.name), notes: state.notes, date });
    const blob = new Blob([text], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = prepFileName(cancer?.name, date);
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  };
  const reset = () => { clearPrep(); setState(EMPTY_PREP); };

  const cancerOptions = data.cancers.map((c) => ({ value: c.id, label: c.name, group: c.group[0].toUpperCase() + c.group.slice(1) }));

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      {/* Builder: hidden when printing */}
      <div className="no-print">
        <div className="sticky top-14 z-30 -mx-4 sm:-mx-6 px-4 sm:px-6 py-2 bg-background/95 backdrop-blur border-b border-border flex flex-wrap items-center gap-2">
          <FacetSelect label="Cancer type" options={cancerOptions} value={cancerId ?? null} onChange={(v) => commit({ cancerId: (v as string | null) ?? undefined, picked: [] })} allLabel="Choose" placeholder="Search cancers…" width="w-72" />
          {cancer && <button type="button" onClick={() => setGroup(cancer.questions, picked.size < cancer.questions.length)} className="text-sm underline text-muted">{picked.size < cancer.questions.length ? "Tick all" : "Untick all"}</button>}
          {ready && (state.cancerId || state.picked.length || state.custom.length || state.notes) ? <button type="button" onClick={reset} className="text-sm underline text-muted">Start again</button> : null}
          <span className="ml-auto text-sm text-muted tabular-nums">{total} question{total === 1 ? "" : "s"} in your pack</span>
        </div>

        {!cancer && (
          <div className="mt-6">
            <div className="card p-8 text-center"><div className="text-lg font-medium">Start by choosing a cancer type above.</div><p className="text-muted mt-1">Each cancer has its own question set. Hand-written where we have one, otherwise built from that cancer&apos;s standard of care, biomarkers and open problems.</p></div>
            <div className="kicker mt-8 mb-2">Or tap one</div>
            <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {data.cancers.map((c) => (
                <button key={c.id} type="button" onClick={() => commit({ cancerId: c.id, picked: [] })} className="card p-3 text-left hover:shadow-md transition flex gap-3">
                  <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent"><CancerIcon cancerId={c.id} className="h-6 w-6" /></span>
                  <span className="min-w-0"><span className="block text-xs text-muted capitalize">{c.group}</span><span className="block font-medium leading-snug">{c.name}</span><span className="block text-xs text-muted mt-0.5">{c.questions.length} questions{c.source === "handwritten" ? ", hand-written" : ""}</span></span>
                </button>
              ))}
            </div>
          </div>
        )}

        {cancer && (
          <div className="mt-6 space-y-6">
            <p className="text-sm text-muted">Questions for <Link href={cancer.route} className="underline">{cancer.name}</Link>{cancer.source === "generated" ? ", generated from its standard of care, biomarkers and open problems. Hand-written sets exist for some cancers; this one is on the list." : ", written by hand for this cancer."} Tick what you want to ask. Prefer one page with room for the answers? Open the <Link href={`/prep/${cancer.id}/`} className="underline">appointment sheet for {cancer.name}</Link>. The &ldquo;why&rdquo; line is for you; it is left off the printed page if you prefer plain questions.</p>
            {groups.map(([setting, qs]) => {
              const allOn = qs.every((q) => picked.has(questionKey(q)));
              return (
                <section key={setting} className="card p-4">
                  <div className="flex items-baseline justify-between gap-3 mb-2">
                    <h3 className="font-semibold">{setting}</h3>
                    <button type="button" onClick={() => setGroup(qs, !allOn)} className="text-xs underline text-muted">{allOn ? "Untick section" : "Tick section"}</button>
                  </div>
                  <ul className="space-y-2">
                    {qs.map((q) => {
                      const k = questionKey(q);
                      return (
                        <li key={k}>
                          <label className="flex gap-3 cursor-pointer">
                            <input type="checkbox" className="mt-1 shrink-0" checked={picked.has(k)} onChange={() => toggle(q)} />
                            <span className="text-[15px] leading-snug">{q.question}<span className="block text-xs text-muted mt-0.5">{q.why}</span></span>
                          </label>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              );
            })}

            <section className="card p-4">
              <h3 className="font-semibold mb-2">Your own questions</h3>
              <div className="flex gap-2">
                <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustom(); } }} placeholder="Type a question and press Enter" aria-label="Add your own question"
                  className="flex-1 rounded-lg border border-border bg-card px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-accent/40" />
                <button type="button" onClick={addCustom} className="rounded-lg bg-accent text-white px-3 py-1.5 text-sm font-medium hover:brightness-110">Add</button>
              </div>
              {state.custom.length > 0 && (
                <ul className="mt-3 space-y-1.5 text-sm">
                  {state.custom.map((c, i) => <li key={`${i}-${c}`} className="flex items-start justify-between gap-3"><span>{c}</span><button type="button" onClick={() => commit({ custom: state.custom.filter((_, j) => j !== i) })} className="text-xs underline text-muted shrink-0">Remove</button></li>)}
                </ul>
              )}
            </section>

            <section className="card p-4">
              <h3 className="font-semibold mb-1">Notes to mention</h3>
              <p className="text-xs text-muted mb-2">New symptoms and when they started, other medicines and supplements, allergies, what you have read, who is coming with you.</p>
              <textarea value={state.notes} onChange={(e) => commit({ notes: e.target.value })} rows={4} aria-label="Notes to mention" className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-accent/40" />
            </section>

            <section className="card p-4">
              <h3 className="font-semibold mb-1">Treatments so far</h3>
              {treatments.length ? (
                <p className="text-sm">Taken from your browser profile: {treatments.map((t, i) => <span key={t.route}>{i > 0 && ", "}<Link href={t.route} className="underline">{t.name}</Link></span>)}. Change them in the <Link href="/navigator/" className="underline">navigator</Link>.</p>
              ) : (
                <p className="text-sm text-muted">Nothing recorded yet. Add treatments already received under &ldquo;Already tried&rdquo; in the <Link href="/navigator/" className="underline">navigator</Link> and they will be listed on the pack.</p>
              )}
            </section>
          </div>
        )}
      </div>

      {/* The pack itself: what prints */}
      <div>
        <div className="lg:sticky lg:top-20">
          <div className="no-print flex flex-wrap items-center gap-3 mb-3 text-sm">
            <PrintButton />
            <button type="button" onClick={download} disabled={total === 0} className="underline disabled:opacity-50 disabled:no-underline">Download as text</button>
            {state.savedAt && ready && <span className="text-xs text-muted ml-auto">Saved in this browser</span>}
          </div>
          <article className="card p-5 print:border-0 print:p-0" aria-label="Your appointment pack">
            <div className="kicker">Questions for my appointment</div>
            <h2 className="text-xl font-semibold mt-0.5">{cancer ? cancer.name : "Choose a cancer type"}</h2>
            <p className="text-xs text-muted mt-1">Prepared {today()} with OnCo (onco.cc). Orientation, not medical advice.</p>
            {treatments.length > 0 && (
              <div className="mt-4"><div className="kicker mb-1">Treatments so far</div><ul className="list-disc pl-5 text-sm space-y-0.5">{treatments.map((t) => <li key={t.route}>{t.name}</li>)}</ul></div>
            )}
            {total === 0 && <p className="text-sm text-muted mt-4">Tick questions on the left, or add your own, and they appear here.</p>}
            {chosenGroups.map(([setting, qs]) => (
              <div key={setting} className="mt-4">
                <div className="kicker mb-1">{setting}</div>
                <ol className="space-y-2 text-sm">
                  {qs.map((q) => (
                    <li key={questionKey(q)} className="grid grid-cols-[1.5rem_1fr] gap-1">
                      <span className="tabular-nums text-muted">{numberOf(q)}.</span>
                      <span>{q.question}<span className="block text-xs text-muted print:hidden">{q.why}</span><span className="hidden print:block h-8 border-b border-dotted border-border/60" aria-hidden /></span>
                    </li>
                  ))}
                </ol>
              </div>
            ))}
            {state.custom.length > 0 && (
              <div className="mt-4">
                <div className="kicker mb-1">My own questions</div>
                <ol className="space-y-2 text-sm">
                  {state.custom.map((c, i) => (
                    <li key={`${i}-${c}`} className="grid grid-cols-[1.5rem_1fr] gap-1"><span className="tabular-nums text-muted">{ordered.length + i + 1}.</span><span>{c}<span className="hidden print:block h-8 border-b border-dotted border-border/60" aria-hidden /></span></li>
                  ))}
                </ol>
              </div>
            )}
            {state.notes.trim() && <div className="mt-4"><div className="kicker mb-1">Notes to mention</div><p className="text-sm whitespace-pre-wrap">{state.notes.trim()}</p></div>}
          </article>
        </div>
      </div>
    </div>
  );
}

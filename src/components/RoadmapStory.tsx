"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { STATUS_LABEL, statusClass } from "@/lib/text";
import { useAnimationBudget, useMotionSnapshot } from "@/lib/use-animation-budget";

export type StoryRef = { id: string; kind: string; name: string; tldr: string; route: string; status?: string };
export type StoryStep = { era: string; title: string; description: string; status: "historic" | "current" | "emerging" | "speculative"; refs: StoryRef[] };

const TONE: Record<StoryStep["status"], string> = { historic: "bg-zinc-400", current: "bg-emerald-500", emerging: "bg-amber-500", speculative: "bg-violet-500" };
const TONE_STATUS: Record<StoryStep["status"], string> = { historic: "historic", current: "approved", emerging: "phase-2", speculative: "concept" };

/**
 * Scroll-driven roadmap narrative: a sticky timeline on the left tracks the step in view;
 * each step on the right shows its description and the entities it references as cards.
 * "Play" auto-scrolls step by step. Respects prefers-reduced-motion (jumps instead of smooth scroll).
 */
export function RoadmapStory({ title, steps }: { title: string; steps: StoryStep[] }) {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const refs = useRef<Array<HTMLElement | null>>([]);

  useEffect(() => {
    const els = refs.current.filter((x): x is HTMLElement => !!x);
    if (!els.length) return;
    const io = new IntersectionObserver((entries) => {
      const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible) setActive(Number((visible.target as HTMLElement).dataset.step));
    }, { rootMargin: "-35% 0px -50% 0px", threshold: [0, 0.25, 0.5, 0.75, 1] });
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [steps.length]);

  const go = (i: number) => {
    const el = refs.current[i];
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const top = el.getBoundingClientRect().top + window.scrollY - 120;
    window.scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
  };

  // Auto-play: advance every 6 s; stop after the last step (state change happens inside the timer callback).
  // The timer waits while the tab is hidden (shared animation budget) and resumes where it was.
  const motion = useMotionSnapshot(useAnimationBudget(null));
  useEffect(() => {
    if (!playing || motion.hidden) return;
    const t = setTimeout(() => { if (active >= steps.length - 1) setPlaying(false); else go(active + 1); }, active >= steps.length - 1 ? 0 : 6000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playing, active, motion.hidden]);

  return (
    <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
      <aside className="lg:sticky lg:top-28 self-start">
        <div className="flex items-center justify-between mb-3">
          <div className="kicker">{title}</div>
          <button type="button" onClick={() => { if (!playing) go(active >= steps.length - 1 ? 0 : active); setPlaying((p) => !p); }} aria-pressed={playing} className="chip border border-border bg-card hover:bg-foreground/5">{playing ? "❚❚ Pause" : "▶ Play"}</button>
        </div>
        <ol className="relative border-l-2 border-border ml-2" aria-label="Timeline">
          {steps.map((s, i) => {
            const on = i === active;
            return (
              <li key={i} className="ml-5 py-2">
                <span className={`absolute -left-[7px] mt-2 h-3 w-3 rounded-full ring-4 ring-background ${TONE[s.status]} ${on ? "scale-150" : ""} transition-transform`} />
                <button type="button" onClick={() => { setPlaying(false); go(i); }} aria-current={on ? "step" : undefined} className={`text-left text-sm leading-snug ${on ? "text-foreground font-semibold" : "text-muted hover:text-foreground"}`}>
                  <span className="block text-[11px] uppercase tracking-wider">{s.era}</span>
                  {s.title}
                </button>
              </li>
            );
          })}
        </ol>
        <div className="mt-3 text-xs text-muted flex flex-wrap gap-2">
          {(["historic", "current", "emerging", "speculative"] as const).map((k) => <span key={k} className="inline-flex items-center gap-1"><span className={`h-2 w-2 rounded-full ${TONE[k]}`} />{k}</span>)}
        </div>
      </aside>

      <div className="space-y-16">
        {steps.map((s, i) => (
          <section key={i} ref={(el) => { refs.current[i] = el; }} data-step={i} aria-labelledby={`story-step-${i}`} className={`transition-opacity ${i === active ? "opacity-100" : "opacity-60"}`}>
            <div className="flex flex-wrap items-center gap-2"><span className="kicker">{s.era}</span><span className={`chip ${statusClass(TONE_STATUS[s.status])}`}>{s.status}</span><span className="text-xs text-muted">step {i + 1} of {steps.length}</span></div>
            <h3 id={`story-step-${i}`} className="text-2xl font-semibold tracking-tight mt-1">{s.title}</h3>
            <p className="text-[15px] leading-relaxed mt-3 max-w-3xl">{s.description}</p>
            {s.refs.length > 0 && (
              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {s.refs.map((r) => (
                  <Link key={r.id} href={r.route} className="card p-3 hover:shadow-md transition">
                    <div className="flex items-center gap-2 mb-1"><span className="chip bg-foreground/5 capitalize">{r.kind}</span>{r.status && <span className={`chip ${statusClass(r.status)}`}>{STATUS_LABEL[r.status] ?? r.status}</span>}</div>
                    <div className="font-medium leading-snug">{r.name}</div>
                    <p className="text-xs text-muted mt-0.5 line-clamp-2">{r.tldr}</p>
                  </Link>
                ))}
              </div>
            )}
          </section>
        ))}
        <div className="h-[30vh]" aria-hidden />
      </div>
    </div>
  );
}

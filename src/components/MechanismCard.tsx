"use client";

import { useEffect, useRef, useState } from "react";
import { useAnimationBudget, useMotionSnapshot } from "@/lib/use-animation-budget";

type StepKind = "bind" | "enter" | "release" | "damage" | "death" | "immune" | "spread" | "other";

function classify(step: string): StepKind {
  const s = step.toLowerCase();
  if (/bind|dock|recogni|occup/.test(s)) return "bind";
  if (/internalis|endocyt|enter|cross|absorb|infus|inject|traffick|circulat|home/.test(s)) return "enter";
  if (/releas|cleav|degrad|ubiquit|proteasom|trapped|expand|prime/.test(s)) return "release";
  if (/dna|break|replicat|microtubule|mitosis|arrest|signal|phosphor|blocked|transcription|stop|collapse/.test(s)) return "damage";
  if (/die|death|apopto|kill|lyse|regress|shrink|clear/.test(s)) return "death";
  if (/t cell|t-cell|immune|interferon|cytokine|nk|macrophag|dendritic|antigen/.test(s)) return "immune";
  if (/bystander|neighbour|crossfire|diffus|spread/.test(s)) return "spread";
  return "other";
}

/** Small monochrome SVG glyph per step kind, drawn in the wireframe style used elsewhere. */
function Glyph({ kind, active }: { kind: StepKind; active: boolean }) {
  const stroke = active ? "currentColor" : "currentColor";
  const common = { fill: "none", stroke, strokeWidth: 1.4, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <svg viewBox="0 0 48 48" className={`h-12 w-12 ${active ? "text-accent" : "text-muted"}`} aria-hidden>
      <circle cx="24" cy="24" r="21" {...common} strokeDasharray={active ? undefined : "2 3"} opacity={0.5} />
      {kind === "bind" && <><path d="M14 30 L14 20 L22 20" {...common} /><path d="M34 18 L34 28 L26 28" {...common} /><circle cx="24" cy="24" r="2.5" {...common} /></>}
      {kind === "enter" && <><circle cx="26" cy="26" r="12" {...common} /><path d="M6 14 L20 22" {...common} /><path d="M16 22 L20 22 L19 18" {...common} /></>}
      {kind === "release" && <><path d="M18 14 L18 24" {...common} /><path d="M30 14 L30 24" {...common} /><path d="M18 24 L24 30 L30 24" {...common} /><circle cx="24" cy="36" r="2.5" {...common} /></>}
      {kind === "damage" && <><path d="M14 20 C 20 14, 28 26, 34 20" {...common} /><path d="M14 28 C 20 22, 28 34, 34 28" {...common} /><path d="M22 10 L26 38" {...common} strokeDasharray="3 3" /></>}
      {kind === "death" && <><path d="M14 18 C 18 12, 30 12, 34 18 C 38 26, 30 36, 24 36 C 18 36, 10 26, 14 18 Z" {...common} strokeDasharray="4 3" /><path d="M20 22 L28 30 M28 22 L20 30" {...common} /></>}
      {kind === "immune" && <><circle cx="17" cy="26" r="8" {...common} /><circle cx="33" cy="22" r="7" {...common} /><path d="M25 25 L26 24" {...common} /><path d="M12 20 L10 16 M22 20 L24 16 M14 34 L12 38" {...common} /></>}
      {kind === "spread" && <><circle cx="24" cy="24" r="4" {...common} /><circle cx="12" cy="18" r="3" {...common} strokeDasharray="2 2" /><circle cx="36" cy="18" r="3" {...common} strokeDasharray="2 2" /><circle cx="24" cy="38" r="3" {...common} strokeDasharray="2 2" /><path d="M21 22 L14 19 M27 22 L34 19 M24 28 L24 35" {...common} /></>}
      {kind === "other" && <circle cx="24" cy="24" r="6" {...common} />}
    </svg>
  );
}

/** Animated mechanism stepper: auto-advances every ~3 s, pauses on hover, static when reduced motion is preferred. */
export function MechanismCard({ steps, title = "Mechanism, step by step" }: { steps: string[]; title?: string }) {
  const [i, setI] = useState(0);
  const [paused, setPaused] = useState(false);
  // Shared animation budget: no auto-advance under reduced motion, off screen, in a hidden tab or on a low-budget device.
  const box = useRef<HTMLDivElement>(null);
  const motion = useMotionSnapshot(useAnimationBudget(box, { wakeOnHover: false }));
  const reduced = motion.reduced;

  useEffect(() => {
    if (paused || !motion.active || steps.length < 2) return;
    const t = setInterval(() => setI((x) => (x + 1) % steps.length), 3000);
    return () => clearInterval(t);
  }, [paused, motion.active, steps.length]);

  if (!steps.length) return null;
  return (
    <div ref={box} className="card p-4" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="flex items-baseline justify-between"><div className="kicker">{title}</div><span className="text-[10px] text-muted">{paused ? "paused" : reduced ? "" : "auto-advancing · hover to pause"}</span></div>
      <div className="mt-3 flex items-start gap-1 overflow-x-auto no-scrollbar pb-1">
        {steps.map((s, k) => (
          <button key={k} type="button" onClick={() => { setI(k); setPaused(true); }} aria-current={k === i} className="relative flex flex-col items-center shrink-0 w-[4.5rem] group">
            <Glyph kind={classify(s)} active={k === i} />
            <span className={`mt-1 text-[10px] tabular-nums ${k === i ? "text-foreground font-semibold" : "text-muted"}`}>{k + 1}</span>
            {k < steps.length - 1 && <span className="sr-only">then</span>}
          </button>
        ))}
      </div>
      <div className="mt-2 h-1 rounded bg-foreground/5 overflow-hidden"><div className="h-full bg-accent/70 transition-all duration-500" style={{ width: `${((i + 1) / steps.length) * 100}%` }} /></div>
      <p className="mt-3 text-[15px] leading-relaxed min-h-[3.5rem]"><span className="font-semibold text-accent mr-2">{i + 1}.</span>{steps[i]}</p>
    </div>
  );
}

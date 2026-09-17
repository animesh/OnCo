"use client";

import { useMotionSnapshot, type MotionGate } from "@/lib/use-animation-budget";

/**
 * "Tap to animate" chip for a canvas that is drawn still because the device has a low animation budget
 * (Save-Data or four or fewer cores). Renders nothing otherwise, and nothing under reduced motion, where the
 * static frame is the intended picture. Lives in its own component so the canvas itself never re-renders.
 */
export function MotionHint({ gate, className = "" }: { gate: MotionGate; className?: string }) {
  const s = useMotionSnapshot(gate);
  if (!s.low || s.reduced || s.tapped || !s.visible) return null;
  return (
    <button type="button" onClick={() => gate.play(true)} className={`absolute right-3 bottom-3 chip border border-border bg-card/90 text-xs hover:bg-foreground/5 ${className}`}>
      Tap to animate
    </button>
  );
}

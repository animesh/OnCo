"use client";

import { useRef, type HTMLAttributes } from "react";
import { useAnimationBudget, useMotionSnapshot } from "@/lib/use-animation-budget";

/**
 * A box whose CSS keyframe animations (elements carrying the `motion-css` class) pause while it is off screen, the
 * tab is hidden, or the device has a low animation budget: it sets `data-motion-paused` and globals.css does the
 * rest. Server components wrap decorative animation in it (the garden hero); client components with their own
 * ref use the hook directly.
 */
export function MotionScope({ children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  const ref = useRef<HTMLDivElement>(null);
  const gate = useAnimationBudget(ref, { wakeOnHover: false });
  const s = useMotionSnapshot(gate);
  return <div ref={ref} data-motion-paused={s.active ? undefined : ""} {...rest}>{children}</div>;
}

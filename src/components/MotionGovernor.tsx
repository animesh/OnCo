"use client";

import { useEffect } from "react";
import { ensureMotionEnv } from "@/lib/use-animation-budget";

/**
 * Mounts the page-wide animation signals (src/lib/use-animation-budget.ts) so <html data-motion="low reduced hidden">
 * is written even on pages with only CSS animations (the garden sway, the body map). Renders nothing.
 */
export function MotionGovernor() {
  useEffect(() => { ensureMotionEnv(); }, []);
  return null;
}

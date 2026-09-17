"use client";

import { useEffect, useState, useSyncExternalStore, type RefObject } from "react";

/**
 * One animation budget for the whole site (roadmap row 127: animation performance on Android and slower phones).
 *
 * Every custom animation (rotating molecules, wireframe schematics, the docking scene, the garden sway, the body
 * map's breathing, the resistance map's spinning rings, the auto-advancing steppers) asks this module whether it may
 * run right now. The answer combines:
 *
 *   - visibility: the element is on screen (IntersectionObserver) and the tab is shown (document.visibilityState);
 *   - the reader's motion preference: prefers-reduced-motion means a static frame, always;
 *   - the device: `navigator.connection.saveData` or four or fewer cores is a low budget, so the first frame is drawn
 *     still and the animation starts on a tap (or a hover on a pointer device);
 *   - a concurrency cap per pool: at most `max` thumbnails of one kind spin at once (default six); the others stay
 *     still until a slot frees up or the pointer is over them.
 *
 * The device signals are also written to <html data-motion="low reduced hidden"> (MotionGovernor mounts this from
 * the root layout) so CSS keyframe animations can pause under the same rules without any script per element.
 *
 * `useAnimationBudget(ref)` returns a stable gate: components read `gate.state.active` inside their own
 * requestAnimationFrame loop (see `runFrameLoop`) and never re-render per frame. `useMotionSnapshot(gate)` is the
 * reactive form for the few pieces of UI that show the state (a "tap to animate" chip, a paused data attribute).
 */

export type MotionEnv = {
  /** prefers-reduced-motion: reduce. Static frame, no loop. */
  reduced: boolean;
  /** Save-Data, prefers-reduced-data or four or fewer cores. Static first frame, animate on tap or hover. */
  low: boolean;
  /** The tab is hidden. */
  hidden: boolean;
};

export type MotionState = MotionEnv & {
  /** The element intersects the viewport (true when no element is observed). */
  visible: boolean;
  /** A pointer is over the element (wakes capped and low-budget animations). */
  hovered: boolean;
  /** The reader tapped the element to animate it (low budget). */
  tapped: boolean;
  /** Holds one of its pool's concurrent slots (true when not in a pool). */
  slot: boolean;
  /** Run the animation loop now. */
  active: boolean;
};

export type MotionGate = {
  readonly state: MotionState;
  /** Called after every state change. Returns the unsubscribe function. */
  subscribe(cb: () => void): () => void;
  /** Start (or stop) this animation by hand: the tap on a low-budget device. */
  play(on?: boolean): void;
};

export type BudgetOptions = {
  /** Name of the concurrency pool ("molecule", "schematic"); omit for uncapped. */
  pool?: string;
  /** Concurrent slots in the pool. */
  max?: number;
  /** Fraction of the element that must be on screen. */
  threshold?: number;
  /** A pointer over the element wakes a capped or low-budget animation. */
  wakeOnHover?: boolean;
  /** A click on the element toggles play on low-budget devices. */
  tapToPlay?: boolean;
};

export const DEFAULT_POOL_MAX = 6;
/** Cores at or below which a device counts as a low budget. */
export const LOW_CORES = 4;

const SERVER_STATE: MotionState = { reduced: false, low: false, hidden: false, visible: false, hovered: false, tapped: false, slot: true, active: false };

/* ------------------------------------------------------------------------------------------------------------------
   Pure rules (unit-tested in use-animation-budget.test.ts).
   ------------------------------------------------------------------------------------------------------------------ */

export type NavigatorLike = { connection?: { saveData?: boolean } | null; hardwareConcurrency?: number };

/** Low budget: the reader asked to save data, or the device has four or fewer cores. Unknown core counts (Safari) are not low. */
export function isLowBudget(nav: NavigatorLike | undefined, reducedData = false, override?: string | null): boolean {
  if (override === "low") return true;
  if (override === "full") return false;
  if (!nav) return reducedData;
  if (nav.connection?.saveData === true) return true;
  if (typeof nav.hardwareConcurrency === "number" && nav.hardwareConcurrency > 0 && nav.hardwareConcurrency <= LOW_CORES) return true;
  return reducedData;
}

/** Whether an animation runs, from its signals. Reduced motion always wins; hover wakes anything else that is on screen. */
export function deriveActive(s: Omit<MotionState, "active">): boolean {
  if (!s.visible || s.hidden || s.reduced) return false;
  if (s.hovered) return true;
  if (!s.slot) return false;
  return !s.low || s.tapped;
}

/**
 * Slot allocation for one pool: members already holding a slot keep it while they are visible; free slots go to the
 * other visible members in order; anything off screen holds nothing.
 */
export function allocateSlots(members: Array<{ visible: boolean; slot: boolean }>, max: number): boolean[] {
  const out = members.map(() => false);
  let n = 0;
  members.forEach((m, i) => { if (m.visible && m.slot && n < max) { out[i] = true; n++; } });
  members.forEach((m, i) => { if (m.visible && !out[i] && n < max) { out[i] = true; n++; } });
  return out;
}

/** Tokens for <html data-motion>: which signals are on, space separated, in a fixed order. */
export function motionFlags(env: MotionEnv): string {
  return [env.low && "low", env.reduced && "reduced", env.hidden && "hidden"].filter(Boolean).join(" ");
}

/* ------------------------------------------------------------------------------------------------------------------
   Page-wide signals: one listener set for the whole document.
   ------------------------------------------------------------------------------------------------------------------ */

type Env = MotionEnv & { subs: Set<() => void> };
let env: Env | null = null;

const OVERRIDE_KEY = "onco.motion";
function readOverride(): string | null {
  try { return window.localStorage.getItem(OVERRIDE_KEY); } catch { return null; }
}

function writeFlags(e: MotionEnv) {
  const flags = motionFlags(e);
  const root = document.documentElement;
  if (flags) root.dataset.motion = flags; else delete root.dataset.motion;
}

/** The shared device and tab signals, created on first use; also mirrors them to <html data-motion>. */
export function ensureMotionEnv(): Env {
  if (env) return env;
  if (typeof window === "undefined") return { reduced: false, low: false, hidden: false, subs: new Set() };
  const nav = navigator as Navigator & NavigatorLike & { connection?: (EventTarget & { saveData?: boolean }) | null };
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const reducedData = window.matchMedia("(prefers-reduced-data: reduce)");
  const e: Env = {
    reduced: reducedMotion.matches,
    low: isLowBudget(nav, reducedData.matches, readOverride()),
    hidden: document.visibilityState === "hidden",
    subs: new Set(),
  };
  const emit = () => { writeFlags(e); for (const cb of e.subs) cb(); };
  reducedMotion.addEventListener("change", () => { e.reduced = reducedMotion.matches; emit(); });
  const relow = () => { e.low = isLowBudget(nav, reducedData.matches, readOverride()); emit(); };
  reducedData.addEventListener("change", relow);
  nav.connection?.addEventListener?.("change", relow);
  document.addEventListener("visibilitychange", () => { e.hidden = document.visibilityState === "hidden"; emit(); });
  writeFlags(e);
  env = e;
  return e;
}

/* ------------------------------------------------------------------------------------------------------------------
   Pools: the per-page cap on concurrent animations of one kind.
   ------------------------------------------------------------------------------------------------------------------ */

type Member = { gate: GateImpl };
type Pool = { max: number; members: Set<Member> };
const pools = new Map<string, Pool>();

function poolFor(name: string, max: number): Pool {
  let p = pools.get(name);
  if (!p) { p = { max, members: new Set() }; pools.set(name, p); }
  else p.max = Math.max(p.max, max);
  return p;
}

function rebalance(p: Pool) {
  const list = [...p.members];
  const slots = allocateSlots(list.map((m) => ({ visible: m.gate.state.visible, slot: m.gate.state.slot })), p.max);
  list.forEach((m, i) => { if (m.gate.state.slot !== slots[i]) m.gate.set({ slot: slots[i] }); });
}

/* ------------------------------------------------------------------------------------------------------------------
   Gates.
   ------------------------------------------------------------------------------------------------------------------ */

class GateImpl implements MotionGate {
  state: MotionState = { ...SERVER_STATE, slot: true };
  private subs = new Set<() => void>();
  subscribe = (cb: () => void) => { this.subs.add(cb); return () => { this.subs.delete(cb); }; };
  play = (on?: boolean) => { this.set({ tapped: on ?? !this.state.tapped }); };
  /** Merge a change, recompute `active`, notify when anything moved. */
  set(patch: Partial<Omit<MotionState, "active">>) {
    const next = { ...this.state, ...patch };
    next.active = deriveActive(next);
    let changed = false;
    for (const k of Object.keys(next) as Array<keyof MotionState>) if (next[k] !== this.state[k]) { changed = true; break; }
    if (!changed) return;
    this.state = next;
    for (const cb of this.subs) cb();
  }
}

/** Wire a gate to the page: device signals, the element's visibility, hover and tap, and its pool. Returns the teardown. */
function attach(gate: GateImpl, el: Element | null, opts: BudgetOptions): () => void {
  const e = ensureMotionEnv();
  const onEnv = () => gate.set({ reduced: e.reduced, low: e.low, hidden: e.hidden });
  e.subs.add(onEnv);
  const cleanups: Array<() => void> = [() => { e.subs.delete(onEnv); }];

  const pool = opts.pool ? poolFor(opts.pool, opts.max ?? DEFAULT_POOL_MAX) : null;
  const member: Member | null = pool ? { gate } : null;
  if (pool && member) { pool.members.add(member); gate.set({ slot: false }); }
  const onVisible = (visible: boolean) => {
    gate.set({ visible });
    if (pool) rebalance(pool);
  };

  if (el && typeof IntersectionObserver !== "undefined") {
    const io = new IntersectionObserver(([entry]) => onVisible(entry.isIntersecting), { threshold: opts.threshold ?? 0.05 });
    io.observe(el);
    cleanups.push(() => io.disconnect());
  } else {
    onVisible(true);
  }

  if (el && opts.wakeOnHover !== false) {
    const over = () => gate.set({ hovered: true });
    const out = () => gate.set({ hovered: false });
    el.addEventListener("pointerenter", over);
    el.addEventListener("pointerleave", out);
    el.addEventListener("pointercancel", out);
    cleanups.push(() => { el.removeEventListener("pointerenter", over); el.removeEventListener("pointerleave", out); el.removeEventListener("pointercancel", out); });
  }
  if (el && opts.tapToPlay) {
    const tap = () => { if (gate.state.low) gate.play(); };
    el.addEventListener("click", tap);
    cleanups.push(() => el.removeEventListener("click", tap));
  }

  gate.set({ reduced: e.reduced, low: e.low, hidden: e.hidden });
  return () => {
    for (const c of cleanups) c();
    if (pool && member) { pool.members.delete(member); gate.set({ visible: false, hovered: false }); rebalance(pool); }
  };
}

/**
 * The gate for one animated element. `ref` is the element to watch (null: always counts as visible, for loops that
 * are not tied to one box). The returned object is stable for the component's life, so effects can depend on it.
 */
export function useAnimationBudget(ref: RefObject<Element | null> | null, opts: BudgetOptions = {}): MotionGate {
  const [gate] = useState(() => new GateImpl());
  const { pool, max, threshold, wakeOnHover, tapToPlay } = opts;
  useEffect(() => attach(gate, ref?.current ?? null, { pool, max, threshold, wakeOnHover, tapToPlay }), [gate, ref, pool, max, threshold, wakeOnHover, tapToPlay]);
  return gate;
}

/** Reactive view of a gate's state, for UI that shows it. Re-renders on each change, so keep it out of frame loops. */
export function useMotionSnapshot(gate: MotionGate): MotionState {
  return useSyncExternalStore(gate.subscribe, () => gate.state, () => SERVER_STATE);
}

/**
 * Drive a requestAnimationFrame loop from a gate. `draw(time, state)` runs each frame while the gate is active
 * (at most `fps` frames a second; low-budget devices are capped at 30) and once more, still, whenever the gate turns
 * inactive while on screen, so the canvas shows a frame rather than going blank. Returns the teardown.
 */
export function runFrameLoop(gate: MotionGate, draw: (time: number, state: MotionState) => void, opts: { fps?: number } = {}): () => void {
  let raf = 0, last = 0, running = false;
  const loop = (time: number) => {
    const s = gate.state;
    if (!s.active) { running = false; return; }
    const gap = s.low ? Math.max(opts.fps ? 1000 / opts.fps : 0, 1000 / 30) : opts.fps ? 1000 / opts.fps : 0;
    if (time - last >= gap) { draw(time, s); last = time; }
    raf = requestAnimationFrame(loop);
  };
  const sync = () => {
    const s = gate.state;
    if (s.active) { if (!running) { running = true; raf = requestAnimationFrame(loop); } }
    else { cancelAnimationFrame(raf); running = false; if (s.visible) draw(performance.now(), s); }
  };
  const unsub = gate.subscribe(sync);
  draw(performance.now(), gate.state);
  sync();
  return () => { unsub(); cancelAnimationFrame(raf); running = false; };
}

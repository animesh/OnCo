"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * A browser-only profile that personalises OnCo. Stored in localStorage under one key.
 * Nothing here is ever sent anywhere; there is no server.
 */
export type ProfileMode = "patient" | "caregiver" | "clinician";
export type Stage = "early" | "locally-advanced" | "metastatic-first-line" | "metastatic-later" | "unknown";

export type Profile = {
  cancerId?: string;
  stage: Stage;
  /** Biomarker ids from src/data/biomarkers.ts, or per-cancer keys chosen in For me (slug of the cancer record's biomarker wording, or "not-tested"). */
  biomarkers: string[];
  /** Product or technology ids already received. */
  priorLines: string[];
  country?: string;
  postcode?: string;
  mode: ProfileMode;
  /** For me situation (roadmap item 101): the decision-section id of the standard-of-care row the reader is in. */
  setting?: string;
  /** Drug ids from the standard of care the reader has already had. */
  hadTreatments: string[];
  /** Whether the For me page should look for trials. */
  wantsTrials: boolean;
  /** Whether the diagnosis is recent (adds the first-60-days guide). */
  diagnosedRecently: boolean;
};

export const STAGES: Array<{ id: Stage; label: string; hint: string }> = [
  { id: "early", label: "Early / localised", hint: "Stage I-II, operable, before or after surgery" },
  { id: "locally-advanced", label: "Locally advanced", hint: "Stage III, not yet spread to distant organs" },
  { id: "metastatic-first-line", label: "Metastatic, first treatment", hint: "Stage IV, no systemic therapy for metastatic disease yet" },
  { id: "metastatic-later", label: "Metastatic, later lines", hint: "Stage IV, after at least one treatment for metastatic disease" },
  { id: "unknown", label: "Not sure", hint: "Show everything" },
];

export const MODES: Array<{ id: ProfileMode; label: string; hint: string }> = [
  { id: "patient", label: "Patient", hint: "Plain language first" },
  { id: "caregiver", label: "Caregiver", hint: "Logistics, side effects, when to call" },
  { id: "clinician", label: "Clinician", hint: "Technical detail first" },
];

const KEY = "onco:profile:v1";
const EMPTY: Profile = { stage: "unknown", biomarkers: [], priorLines: [], mode: "patient", hadTreatments: [], wantsTrials: true, diagnosedRecently: false };

export function loadProfile(): Profile {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const p = JSON.parse(raw) as Partial<Profile>;
    return { ...EMPTY, ...p, biomarkers: p.biomarkers ?? [], priorLines: p.priorLines ?? [], hadTreatments: p.hadTreatments ?? [], wantsTrials: p.wantsTrials ?? true, diagnosedRecently: p.diagnosedRecently ?? false };
  } catch {
    return EMPTY;
  }
}

export function saveProfile(p: Profile) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, JSON.stringify(p));
  window.dispatchEvent(new CustomEvent("onco:profile", { detail: p }));
}

export function clearProfile() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(KEY);
  window.dispatchEvent(new CustomEvent("onco:profile", { detail: EMPTY }));
}

/** React hook: the profile, a setter that persists, and whether it has been read from storage yet. */
export function useProfile(): [Profile, (patch: Partial<Profile>) => void, boolean, () => void] {
  const [profile, setProfile] = useState<Profile>(EMPTY);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Defer the initial read so the server-rendered HTML matches the first client render.
    const id = requestAnimationFrame(() => { setProfile(loadProfile()); setReady(true); });
    const onChange = (e: Event) => setProfile((e as CustomEvent<Profile>).detail);
    const onStorage = (e: StorageEvent) => { if (e.key === KEY) setProfile(loadProfile()); };
    window.addEventListener("onco:profile", onChange);
    window.addEventListener("storage", onStorage);
    return () => { cancelAnimationFrame(id); window.removeEventListener("onco:profile", onChange); window.removeEventListener("storage", onStorage); };
  }, []);

  const update = useCallback((patch: Partial<Profile>) => {
    const next = { ...loadProfile(), ...patch };
    saveProfile(next);
  }, []);

  const reset = useCallback(() => clearProfile(), []);

  return [profile, update, ready, reset];
}

export function isProfileEmpty(p: Profile): boolean {
  return !p.cancerId && p.stage === "unknown" && p.biomarkers.length === 0 && p.priorLines.length === 0 && !p.country && !p.postcode && !p.setting && p.hadTreatments.length === 0 && p.wantsTrials && !p.diagnosedRecently;
}

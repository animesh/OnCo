"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useProfile } from "@/lib/profile";
import { loadPrep } from "@/lib/prep";
import { CancerIcon } from "./CancerIcon";

export type RememberedOption = { id: string; name: string; group: string };

/**
 * The cancer the reader chose earlier (browser profile from the navigator or For me, else the prep pack) with a
 * link into a per-cancer route under `base`. Nothing leaves the browser. Renders a neutral prompt until the
 * stored choice has been read, so the server HTML matches the first client render.
 */
export function RememberedCancer({ cancers, base, verb }: { cancers: RememberedOption[]; base: string; verb: string }) {
  const [profile, , profileReady] = useProfile();
  const [prepId, setPrepId] = useState<string | undefined>();
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => { setPrepId(loadPrep().cancerId); setReady(true); });
    return () => cancelAnimationFrame(id);
  }, []);
  const chosenId = (profileReady && profile.cancerId) || (ready ? prepId : undefined);
  const chosen = cancers.find((c) => c.id === chosenId);

  if (!ready || !profileReady) return <div className="card p-5 text-sm text-muted" aria-live="polite">Looking for a cancer type saved in this browser…</div>;
  if (!chosen) {
    return (
      <div className="card p-5">
        <div className="font-medium">No cancer type saved in this browser yet.</div>
        <p className="text-sm text-muted mt-1">Pick one below, or choose it once in <Link href="/for-me/" className="underline">For me</Link> or the <Link href="/navigator/" className="underline">navigator</Link> and every patient page will remember it.</p>
      </div>
    );
  }
  return (
    <Link href={`${base}${chosen.id}/`} className="card p-5 flex items-center gap-4 hover:shadow-md transition">
      <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent-soft text-accent"><CancerIcon cancerId={chosen.id} className="h-7 w-7" /></span>
      <span className="min-w-0">
        <span className="block text-xs text-muted capitalize">{chosen.group} · saved in this browser</span>
        <span className="block text-lg font-semibold leading-snug">{verb} {chosen.name}</span>
        <span className="block text-sm text-muted mt-0.5">Not the right one? Change it in <span className="underline">For me</span> or pick another below.</span>
      </span>
    </Link>
  );
}

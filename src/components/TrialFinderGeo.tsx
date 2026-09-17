"use client";

import { Fragment, useEffect, useMemo, useState } from "react";
import { buildGeoApiUrl, buildGeoSearchUrl, COUNTRIES, geocode, parseGeoStudies, type GeoStudy } from "@/lib/ctgov-geo";
import { ELIGIBILITY_FIELDS, parseEligibilities, withExtraFields, type Eligibility } from "@/lib/ctgov";
import { parseCriteria, score, type Check, type Score, type Verdict } from "@/lib/eligibility";
import { biomarkers } from "@/data/biomarkers";
import { useProfile, type Profile } from "@/lib/profile";
import { FacetSelect } from "./filters/FacetSelect";

const BIOMARKER_LABELS: Record<string, string> = Object.fromEntries(biomarkers.map((b) => [b.id, b.label]));

const VERDICT: Record<Verdict, { label: string; className: string }> = {
  likely: { label: "Likely eligible", className: "bg-emerald-50 text-emerald-800 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-200 dark:border-emerald-900" },
  unclear: { label: "Unclear", className: "bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/30 dark:text-amber-200 dark:border-amber-900" },
  unlikely: { label: "Unlikely", className: "bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/30 dark:text-rose-200 dark:border-rose-900" },
};
const STATUS: Record<Check["status"], { mark: string; label: string; className: string }> = {
  met: { mark: "✓", label: "Matches your profile", className: "text-emerald-700 dark:text-emerald-300" },
  unmet: { mark: "✕", label: "Contradicted by your profile", className: "text-rose-700 dark:text-rose-300" },
  unknown: { mark: "?", label: "Only the team can check", className: "text-muted" },
};

/**
 * "Could I join?" pre-screen for one trial: the registry's free-text criteria parsed into a checklist and
 * scored against the browser profile. Rough by design; every panel links to the full criteria.
 */
function EligibilityPanel({ nctId, elig, profile, drugNames }: { nctId: string; elig?: Eligibility; profile: Profile; drugNames: Record<string, string> }) {
  const result: Score | null = useMemo(() => {
    if (!elig?.criteria) return null;
    return score(parseCriteria(elig.criteria), { stage: profile.stage, biomarkers: profile.biomarkers, priorLines: profile.priorLines }, { biomarkerLabels: BIOMARKER_LABELS, drugNames });
  }, [elig, profile.stage, profile.biomarkers, profile.priorLines, drugNames]);
  const fullUrl = `https://clinicaltrials.gov/study/${nctId}#participation-criteria`;
  const profileEmpty = !profile.biomarkers.length && !profile.priorLines.length;
  const registry = [elig?.minimumAge && `minimum age ${elig.minimumAge}`, elig?.maximumAge && `maximum age ${elig.maximumAge}`, elig?.sex && elig.sex !== "ALL" && `${elig.sex.toLowerCase()} only`].filter(Boolean);
  return (
    <div className="rounded-lg border border-border bg-surface p-3 text-sm">
      {!result ? (
        <p className="text-muted">The registry did not return eligibility text for this trial. <a className="underline" href={fullUrl} rel="noopener">Read the full criteria on ClinicalTrials.gov</a>.</p>
      ) : (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <span className={`chip border ${VERDICT[result.verdict].className}`}>{VERDICT[result.verdict].label}</span>
            <span className="text-muted">{result.reasons[0]}</span>
          </div>
          {profileEmpty && <p className="text-xs text-muted mt-2">Your profile has no biomarkers or treatments yet. Add them in the Navigator or Tumour board and this pre-screen gets sharper.</p>}
          {registry.length > 0 && <p className="text-xs text-muted mt-2">Registry summary: {registry.join(", ")}.</p>}
          {result.checklist.length > 0 && (
            <ul className="mt-3 space-y-2">
              {result.checklist.map((c, i) => (
                <li key={i} className="grid grid-cols-[1.25rem_1fr] gap-2">
                  <span className={`font-semibold ${STATUS[c.status].className}`} aria-label={STATUS[c.status].label} title={STATUS[c.status].label}>{STATUS[c.status].mark}</span>
                  <div>
                    <div className="leading-snug">{c.criterion.text}<span className="text-muted"> ({c.criterion.kind})</span></div>
                    <div className="text-xs text-muted mt-0.5">{c.why}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
          <p className="text-xs text-muted mt-3">
            {result.unassessed > 0 && <>{result.unassessed} further criteri{result.unassessed === 1 ? "on" : "a"} (organ function, other conditions, timing) can only be checked by the trial team. </>}
            This is a rough pre-screen read by software from the registry text; the trial team decides who can join. <a className="underline" href={fullUrl} rel="noopener">Read the full criteria on ClinicalTrials.gov</a>.
          </p>
        </>
      )}
    </div>
  );
}

/**
 * Recruiting trials from ClinicalTrials.gov, filtered by country and optionally by distance from a
 * postcode or place. Loads on demand. Nearest site and distance are computed in the browser. Each row
 * opens a "Could I join?" pre-screen built from the registry's eligibility text and the browser profile.
 */
export function TrialFinderGeo({ condition, intervention, title, drugNames = {} }: { condition?: string; intervention?: string; title: string; /** Names for the profile's prior-line ids so criteria like "prior trastuzumab" can be matched; ids are used when absent. */ drugNames?: Record<string, string> }) {
  const [profile, update, ready] = useProfile();
  const [country, setCountry] = useState<string | null>(null);
  const [place, setPlace] = useState("");
  const [radius, setRadius] = useState(100);
  const [center, setCenter] = useState<{ lat: number; lon: number; label: string } | null>(null);
  const [state, setState] = useState<"idle" | "loading" | "done" | "error" | "geocode-failed">("idle");
  const [studies, setStudies] = useState<GeoStudy[]>([]);
  const [eligibility, setEligibility] = useState<Record<string, Eligibility>>({});
  const [open, setOpen] = useState<Set<string>>(new Set());
  const toggle = (id: string) => setOpen((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });

  // Seed the filters from the saved profile once it has loaded.
  useEffect(() => {
    if (!ready) return;
    const id = requestAnimationFrame(() => { setCountry((c) => c ?? profile.country ?? null); setPlace((p) => p || profile.postcode || ""); });
    return () => cancelAnimationFrame(id);
  }, [ready, profile.country, profile.postcode]);

  const searchUrl = buildGeoSearchUrl({ condition, intervention, country: country ?? undefined });

  const load = async () => {
    setState("loading");
    try {
      let c = center;
      if (place.trim() && (!c || c.label !== place)) {
        const g = await geocode(place.trim(), country ?? undefined);
        if (!g) { setState("geocode-failed"); return; }
        c = { ...g, label: place };
        setCenter(c);
      }
      if (!place.trim()) c = null;
      const url = withExtraFields(buildGeoApiUrl({ condition, intervention, country: country ?? undefined, center: c ? { lat: c.lat, lon: c.lon, radiusMi: radius } : undefined, pageSize: 20 }), ELIGIBILITY_FIELDS);
      const r = await fetch(url);
      if (!r.ok) throw new Error(String(r.status));
      const json = await r.json();
      setStudies(parseGeoStudies(json, c ? { lat: c.lat, lon: c.lon } : undefined));
      setEligibility(parseEligibilities(json));
      setOpen(new Set());
      setState("done");
      update({ country: country ?? undefined, postcode: place.trim() || undefined });
    } catch {
      setState("error");
    }
  };

  return (
    <div className="card p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <div className="kicker">Recruiting trials near you · live from ClinicalTrials.gov</div>
          <div className="font-medium mt-0.5">{title}</div>
          <div className="text-xs text-muted mt-0.5">{condition && <span>condition: <em>{condition}</em></span>}{condition && intervention && " · "}{intervention && <span>intervention: <em>{intervention}</em></span>}</div>
        </div>
        <a href={searchUrl} rel="noopener" className="underline text-muted text-sm">Open on ClinicalTrials.gov →</a>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <FacetSelect label="Country" options={COUNTRIES.map((c) => ({ value: c, label: c }))} value={country} onChange={(v) => setCountry(v as string | null)} allLabel="Anywhere" width="w-56" />
        <input value={place} onChange={(e) => setPlace(e.target.value)} placeholder="Postcode or city (optional)" aria-label="Postcode or city" className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-accent/40 w-56" />
        <label className="text-sm text-muted flex items-center gap-1.5">within
          <select value={radius} onChange={(e) => setRadius(Number(e.target.value))} className="rounded-md border border-border bg-card px-2 py-1 text-sm">
            {[25, 50, 100, 250, 500].map((r) => <option key={r} value={r}>{r} mi</option>)}
          </select>
        </label>
        <button type="button" onClick={load} className="rounded-lg bg-accent text-white px-3 py-1.5 text-sm font-medium hover:brightness-110">{state === "idle" ? "Find trials" : "Search again"}</button>
      </div>
      <p className="text-[11px] text-muted mt-2">Country and place are remembered in this browser only. A postcode is sent to OpenStreetMap&apos;s Nominatim service to find coordinates when you press the button; nothing else leaves your device.</p>

      {state === "loading" && <p className="text-sm text-muted mt-3">Querying ClinicalTrials.gov…</p>}
      {state === "geocode-failed" && <p className="text-sm text-muted mt-3">Could not find that place. Try a city name, or clear it to search by country only.</p>}
      {state === "error" && <p className="text-sm text-muted mt-3">Could not reach ClinicalTrials.gov from your browser. <a className="underline" href={searchUrl} rel="noopener">Run the same search there</a>.</p>}
      {state === "done" && studies.length === 0 && <p className="text-sm text-muted mt-3">No recruiting trials matched. Widen the radius, clear the place, or <a className="underline" href={searchUrl} rel="noopener">broaden the search on ClinicalTrials.gov</a>.</p>}
      {state === "done" && studies.length > 0 && (
        <div className="overflow-x-auto mt-3">
          {center && <p className="text-xs text-muted mb-2">Distances from {center.label}. Nearest site shown; most trials have several.</p>}
          <table className="onco">
            <thead><tr><th>NCT</th><th>Title</th><th>Phase</th>{center && <th>Nearest site</th>}<th>Sites{country ? ` in ${country}` : ""}</th><th>Sponsor</th><th>Could I join?</th></tr></thead>
            <tbody>
              {studies.map((s) => {
                const inCountry = country ? s.sites.filter((x) => x.country === country) : s.sites;
                const cities = [...new Set(inCountry.map((x) => x.city).filter(Boolean))];
                const isOpen = open.has(s.nctId);
                return (
                  <Fragment key={s.nctId}>
                    <tr>
                      <td><a className="underline font-mono text-xs notranslate" translate="no" href={`https://clinicaltrials.gov/study/${s.nctId}`} rel="noopener">{s.nctId}</a></td>
                      <td className="max-w-md">{s.title}</td>
                      <td className="tabular-nums whitespace-nowrap">{s.phase}</td>
                      {center && <td className="whitespace-nowrap">{s.nearest ? <><span className="tabular-nums font-medium">{Math.round(s.nearest.km)} km</span><div className="text-xs text-muted">{s.nearest.site.city}{s.nearest.site.country ? `, ${s.nearest.site.country}` : ""}</div></> : <span className="text-muted">-</span>}</td>}
                      <td className="text-muted text-xs max-w-xs">{cities.length ? `${cities.slice(0, 6).join(", ")}${cities.length > 6 ? ` +${cities.length - 6}` : ""}` : `${s.sites.length} sites`}</td>
                      <td className="text-muted">{s.sponsor}</td>
                      <td className="whitespace-nowrap">
                        <button type="button" onClick={() => toggle(s.nctId)} aria-expanded={isOpen} aria-controls={`elig-${s.nctId}`} className="text-sm underline decoration-foreground/30 hover:decoration-foreground">{isOpen ? "Hide" : "Could I join?"}</button>
                      </td>
                    </tr>
                    {isOpen && (
                      <tr id={`elig-${s.nctId}`}>
                        <td colSpan={center ? 7 : 6} className="!py-3">
                          <EligibilityPanel nctId={s.nctId} elig={eligibility[s.nctId]} profile={profile} drugNames={drugNames} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
          <p className="text-xs text-muted mt-2">Recruiting status, sites, and eligibility change often; confirm on the registry and with your clinical team. &ldquo;Could I join?&rdquo; is a rough pre-screen scored against the profile saved in this browser; nothing is sent anywhere.</p>
        </div>
      )}
    </div>
  );
}

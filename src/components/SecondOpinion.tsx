"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FacetSelect } from "./filters/FacetSelect";
import { Tip } from "./Tip";
import { useProfile } from "@/lib/profile";
import { useRegion } from "@/lib/region";
import { REGION_COUNTRIES, regionForCountry, type ReferralRoute } from "@/data/referral-routes";
import type { Region } from "@/data/regional-approvals";
import { REGION_META } from "@/data/regional-approvals";
import { CentreTable } from "./CentreTable";
import { unpackCentreRows, type CentreLink, type CentrePack, type CentreRow } from "@/lib/centre-table";

/** A centre row for the finder: the measurable record fields built in src/lib/centre-table.ts. Cancers carry packed links; rows are unpacked for the chosen cancer. */
export type SoCentre = CentreRow;
export type SoPerson = { id: string; name: string; role: string; route: string; institutionId?: string; institutionName?: string; specialisms: string[] };
export type SoCancer = { id: string; name: string; group: string; route: string; centres: CentreLink[]; people: SoPerson[] };
export type SoCountry = { code: string; label: string; n: number };

function CentreRow({ c }: { c: SoCentre }) {
  return (
    <li className="py-2.5 flex items-start gap-3">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
          <Link href={c.route} className="font-medium hover:underline">{c.name}</Link>
          <span className="text-xs text-muted">{c.city}, {c.country}</span>
          {c.newsweek !== undefined && <Tip title="Newsweek oncology rank" text="Position in the Newsweek and Statista World's Best Specialized Hospitals 2026 list for oncology."><span className="chip bg-foreground/5 text-[10px] cursor-help">Newsweek #{c.newsweek}</span></Tip>}
          {c.designations.map((d) => <Tip key={d.key} title={d.label} text="Recorded on the institution record: a designation, accreditation or network membership, with the body's page where OnCo has one." href={d.href}>{d.href ? <Link href={d.href} className="chip bg-foreground/5 text-[10px]">{d.label}</Link> : <span className="chip bg-foreground/5 text-[10px] cursor-help">{d.label}</span>}</Tip>)}
          {c.trials.length > 0 && <Tip title={`${c.trials.length} trial${c.trials.length === 1 ? "" : "s"} for this cancer`} text={c.trials.slice(0, 5).map((t) => t.name).join(" · ")} href={`${c.route}#connected`}><Link href={`${c.route}#connected`} className="chip bg-foreground/5 text-[10px] tabular-nums">{c.trials.length} trial{c.trials.length === 1 ? "" : "s"}</Link></Tip>}
          {c.leadershipRank !== undefined && <Tip title="Trial leadership rank" text="Rank among all institutions in OnCo by presence in the pivotal trials, products and technologies recorded here. A coverage measure as much as a merit one."><Link href="/leadership/" className="chip bg-foreground/5 text-[10px]">Trial leadership #{c.leadershipRank}</Link></Tip>}
        </div>
        <div className="text-xs text-muted mt-0.5 line-clamp-1">via {c.via.slice(0, 4).join(", ")}{c.viaTotal > 4 ? ` +${c.viaTotal - 4}` : ""}</div>
      </div>
    </li>
  );
}

function RouteCard({ r }: { r: ReferralRoute }) {
  return (
    <div className="card p-5">
      <div className="kicker">How second opinions work</div>
      <h2 className="text-lg font-semibold mt-0.5">{r.title}</h2>
      <ol className="list-decimal pl-5 mt-3 space-y-1.5 text-sm leading-relaxed">{r.howItWorks.map((s, i) => <li key={i}>{s}</li>)}</ol>
      <div className="grid gap-4 sm:grid-cols-2 mt-4 text-sm">
        <div><div className="kicker mb-1">Cost</div><p>{r.cost}</p></div>
        {r.timeline && <div><div className="kicker mb-1">Timing</div><p>{r.timeline}</p></div>}
      </div>
      {r.remoteReview.length > 0 && (
        <div className="mt-4">
          <div className="kicker mb-1">Remote review and where to start</div>
          <ul className="space-y-2 text-sm">
            {r.remoteReview.map((s) => (
              <li key={s.url}><a className="font-medium underline" href={s.url} rel="noopener">{s.name}</a>{s.cost && <span className="text-muted"> · {s.cost}</span>}<div className="text-muted text-xs mt-0.5">{s.note}</div></li>
            ))}
          </ul>
        </div>
      )}
      <p className="text-xs text-muted mt-4 border-t border-border pt-3">Sources: {r.sources.map((s, i) => <span key={s.url}>{i > 0 && " · "}<a className="underline" href={s.url} rel="noopener">{s.label}</a></span>)} · checked {r.asOf}</p>
    </div>
  );
}

/**
 * Second-opinion finder: pick a cancer and a country; see the centres OnCo links to that cancer (in your
 * country first), the people who work on it, and how referral for a second opinion works where you live.
 */
export function SecondOpinion({ cancers, routes, countries, countryNames, pack }: { cancers: SoCancer[]; routes: ReferralRoute[]; countries: SoCountry[]; countryNames: Record<string, string>; pack: CentrePack }) {
  const [profile, , profileReady] = useProfile();
  const { region: chosen, ready: regionReady } = useRegion();
  // Global view starts from the US routes; the picker below lets the reader change country.
  const region = chosen ?? "US";
  const [cancerId, setCancerId] = useState<string | null>(null);
  const [country, setCountry] = useState<string | null>(null);
  const [routeRegion, setRouteRegion] = useState<Region | null>(null);

  useEffect(() => {
    if (!profileReady) return;
    const id = requestAnimationFrame(() => setCancerId((c) => c ?? (profile.cancerId && cancers.some((x) => x.id === profile.cancerId) ? profile.cancerId : null)));
    return () => cancelAnimationFrame(id);
  }, [profileReady, profile.cancerId, cancers]);

  useEffect(() => {
    if (!regionReady) return;
    const id = requestAnimationFrame(() => {
      setCountry((c) => c ?? REGION_COUNTRIES[region][0]);
      setRouteRegion((r) => r ?? region);
    });
    return () => cancelAnimationFrame(id);
  }, [regionReady, region]);

  const cancer = cancers.find((c) => c.id === cancerId);
  const centres = useMemo(() => (cancer ? unpackCentreRows(cancer.centres, pack) : []), [cancer, pack]);
  const effectiveRegion: Region = routeRegion ?? (country ? regionForCountry(country) : undefined) ?? region;
  const route = routes.find((r) => r.region === effectiveRegion);

  const { here, nearby, elsewhere } = useMemo(() => {
    const list = centres;
    if (!country) return { here: [], nearby: [], elsewhere: list };
    const reg = regionForCountry(country);
    const regionCodes = reg ? REGION_COUNTRIES[reg] : [];
    return {
      here: list.filter((c) => c.country === country),
      nearby: list.filter((c) => c.country !== country && regionCodes.includes(c.country)),
      elsewhere: list.filter((c) => c.country !== country && !regionCodes.includes(c.country)),
    };
  }, [centres, country]);

  const countryOptions = countries.map((c) => ({ value: c.code, label: c.label, count: c.n }));
  const cancerOptions = cancers.map((c) => ({ value: c.id, label: c.name, group: c.group[0].toUpperCase() + c.group.slice(1) }));
  const countryLabel = countries.find((c) => c.code === country)?.label ?? country ?? "";

  return (
    <div>
      <div className="card p-3 flex flex-wrap items-center gap-2">
        <FacetSelect label="Cancer" options={cancerOptions} value={cancerId} onChange={(v) => setCancerId(v as string | null)} allLabel="Choose" width="w-72" />
        <FacetSelect label="Your country" options={countryOptions} value={country} onChange={(v) => { const c = v as string | null; setCountry(c); if (c) { const r = regionForCountry(c); if (r) setRouteRegion(r); } }} allLabel="Anywhere" width="w-60" />
        <FacetSelect label="Referral rules for" options={(Object.keys(REGION_META) as Region[]).map((r) => ({ value: r, label: REGION_META[r].label }))} value={effectiveRegion} onChange={(v) => { if (v) setRouteRegion(v as Region); }} searchable={false} width="w-52" highlight={false} />
        <span className="text-[11px] text-muted basis-full">Cancer and country are seeded from your browser profile and region switcher; nothing leaves your device.</span>
      </div>

      {!cancer && (
        <div className="card p-8 text-center mt-6">
          <div className="text-lg font-medium">Choose a cancer to see where the expertise is.</div>
          <p className="text-muted mt-1 text-sm">The referral guide for your region is below and does not need a cancer.</p>
        </div>
      )}

      {cancer && (
        <div className="mt-6 grid gap-6 lg:grid-cols-[3fr_2fr]">
          <div className="space-y-6">
            <div className="card p-5">
              <div className="flex items-baseline justify-between gap-3">
                <div>
                  <div className="kicker">Expert centres</div>
                  <h2 className="text-xl font-semibold mt-0.5"><Link href={cancer.route} className="hover:underline">{cancer.name}</Link></h2>
                </div>
                <span className="text-sm text-muted tabular-nums">{centres.length} centres</span>
              </div>
              {centres.length === 0 && <p className="text-sm text-muted mt-3">No institutions are linked to this cancer yet. Start from the general <Link className="underline" href="/institutions/">institution ranking</Link>.</p>}
              {country && here.length > 0 && (<><div className="kicker mt-4">In {countryLabel}</div><ul className="divide-y divide-border">{here.map((c) => <CentreRow key={c.id} c={c} />)}</ul></>)}
              {country && here.length === 0 && centres.length > 0 && <p className="text-sm text-muted mt-3">None of the linked centres is in {countryLabel}. The list below is the rest of the world, nearest region first.</p>}
              {nearby.length > 0 && (<><div className="kicker mt-4">Same region</div><ul className="divide-y divide-border">{nearby.map((c) => <CentreRow key={c.id} c={c} />)}</ul></>)}
              {elsewhere.length > 0 && (<><div className="kicker mt-4">{country ? "Elsewhere" : "All centres"}</div><ul className="divide-y divide-border">{elsewhere.map((c) => <CentreRow key={c.id} c={c} />)}</ul></>)}
              <p className="text-xs text-muted mt-4 border-t border-border pt-3">Ordered by Newsweek oncology rank, then by trials for this cancer and research output recorded in OnCo. This reflects what OnCo has recorded, not a judgement of quality; a centre that treats many patients with your cancer but is missing here is a gap to report.</p>
            </div>

            {centres.length > 0 && (
              <div className="card p-5">
                <div className="kicker">Compare the centres</div>
                <h3 className="text-lg font-semibold mt-0.5 mb-3">What can be measured, side by side</h3>
                <CentreTable rows={centres} cancerName={cancer.name.replace(/\s*\(.*?\)\s*$/, "")} countryNames={countryNames} compact />
              </div>
            )}

            <div className="card p-5">
              <div className="kicker">People who work on this cancer</div>
              <h3 className="text-lg font-semibold mt-0.5">Clinicians and scientists</h3>
              {cancer.people.length === 0 ? <p className="text-sm text-muted mt-2">No people are linked to this cancer yet.</p> : (
                <ul className="divide-y divide-border mt-2">
                  {cancer.people.map((p) => (
                    <li key={p.id} className="py-2.5">
                      <div className="flex flex-wrap items-baseline gap-x-2"><Link href={p.route} className="font-medium hover:underline">{p.name}</Link>{p.institutionName && <span className="text-xs text-muted">{p.institutionName}</span>}</div>
                      <div className="text-xs text-muted mt-0.5 line-clamp-2">{p.role}</div>
                      {p.specialisms.length > 0 && <div className="flex flex-wrap gap-1 mt-1">{p.specialisms.slice(0, 5).map((s) => <span key={s} className="chip bg-foreground/5 text-[10px]">{s}</span>)}</div>}
                    </li>
                  ))}
                </ul>
              )}
              <p className="text-xs text-muted mt-3">Listing here means the person&apos;s page in OnCo links to this cancer or names it as a specialism. It is not an endorsement and does not mean they accept new patients.</p>
            </div>
          </div>

          <div className="space-y-6">{route && <RouteCard r={route} />}</div>
        </div>
      )}

      {!cancer && route && <div className="mt-6 max-w-3xl"><RouteCard r={route} /></div>}

      <div className="card p-4 mt-6 text-sm text-muted">
        <span className="font-medium text-foreground">What a second opinion is for.</span> Confirming the diagnosis and stage, checking that all relevant biomarkers were tested, hearing whether a different sequence of treatments or a trial is reasonable, and, for surgery or radiotherapy, whether a higher-volume centre would do it differently. Bring your <Link className="underline" href="/prep/">question list</Link> and your <Link className="underline" href="/navigator/">line-of-therapy summary</Link>. OnCo is orientation, not medical advice.
      </div>
    </div>
  );
}

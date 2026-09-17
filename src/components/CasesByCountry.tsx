"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { geoNaturalEarth1, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import type { Topology, GeometryCollection } from "topojson-specification";
import type { FeatureCollection, Geometry } from "geojson";
import { FacetSelect } from "./filters/FacetSelect";
import { Sparkline } from "./TrendChart";
import { ResultsTable, Toolbar, type Column, type SortState } from "./filters/ResultsTable";
import { GentleSection } from "./GentleSection";
import { rowsForCancerIn, sitesForCountry, type CancerRows, type CountryProfile, type CountryRow, type Globocan } from "@/lib/globocan-core";

export type CancerOption = { id: string; name: string; group: string; route: string };

export type CasesProps = {
  cancers: CancerOption[];
  /** "All cancers" rows, pre-rendered so the first paint has a full table before the dataset loads. */
  initial: CancerRows;
  countryList: Array<{ iso3: string; name: string }>;
  /** Static JSON (public/globocan/countries.json) fetched on the client for every other selection. */
  dataUrl: string;
  gaps: { noEstimate: string[]; shared: string[]; failedCountries: string[] };
  meta: { year: number; fetched: string; sourceUrl: string };
};

const WORLD_URL = "https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json";
const fmt = (n: number | null | undefined, d = 0) => n === null || n === undefined ? null : n.toLocaleString("en-GB", { maximumFractionDigits: d, minimumFractionDigits: d });
const NoData = () => <span className="text-muted/60 italic text-xs">no data</span>;
type Metric = "incAsr" | "mortAsr" | "cases" | "deaths";
const METRICS: Array<[Metric, string]> = [["incAsr", "Incidence rate (ASR per 100k)"], ["cases", "New cases (count)"], ["mortAsr", "Mortality rate (ASR per 100k)"], ["deaths", "Deaths (count)"]];
const MORTALITY_NOTE = "Deaths and death rates by country mix every stage, subtype and year of diagnosis, and reflect access to screening and treatment as much as the disease itself. Survival for any one person differs by stage, subtype and year; each cancer page leads with what can be done.";

export function CasesByCountry({ cancers, initial, countryList, dataUrl, gaps, meta }: CasesProps) {
  const [data, setData] = useState<Globocan | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [cancer, setCancer] = useState<string | null>(null);
  const [regions, setRegions] = useState<string[]>([]);
  const [hdi, setHdi] = useState<string[]>([]);
  const [metric, setMetric] = useState<Metric>("incAsr");
  const [q, setQ] = useState("");
  const [country, setCountry] = useState<string | null>(null);
  const [sort, setSort] = useState<SortState>({ key: "cases", dir: -1 });

  useEffect(() => {
    let alive = true;
    fetch(dataUrl).then((r) => r.json()).then((d: Globocan) => { if (alive) setData(d); }).catch(() => { if (alive) setLoadError(true); });
    return () => { alive = false; };
  }, [dataUrl]);
  const cancerIds = useMemo(() => new Set(cancers.map((c) => c.id)), [cancers]);
  const countryIds = useMemo(() => new Set(countryList.map((c) => c.iso3)), [countryList]);
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const p = new URLSearchParams(window.location.search);
      const c = p.get("cancer"); if (c && cancerIds.has(c)) setCancer(c);
      const k = p.get("country"); if (k && countryIds.has(k)) setCountry(k);
    });
    return () => cancelAnimationFrame(id);
  }, [cancerIds, countryIds]);
  useEffect(() => {
    const p = new URLSearchParams(); if (cancer) p.set("cancer", cancer); if (country) p.set("country", country);
    const qs = p.toString(); window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  }, [cancer, country]);

  const sel: CancerRows = useMemo(() => (data ? rowsForCancerIn(data, cancer) : cancer ? { rows: [], mapping: initial.mapping, world: null } : initial), [data, cancer, initial]);
  const loading = !!cancer && !data && !loadError;
  const profile: CountryProfile | null = useMemo(() => (country && data ? sitesForCountry(data, country) : null), [country, data]);
  const regionOptions = useMemo(() => [...new Set(sel.rows.map((r) => r.region))].sort().map((r) => ({ value: r, label: r, count: sel.rows.filter((x) => x.region === r).length })), [sel]);
  const hdiOptions = useMemo(() => ["Very High HDI", "High HDI", "Medium HDI", "Low HDI"].filter((h) => sel.rows.some((r) => r.hdi === h)).map((h) => ({ value: h, label: h, count: sel.rows.filter((r) => r.hdi === h).length })), [sel]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const list = sel.rows.filter((r) => (!regions.length || regions.includes(r.region)) && (!hdi.length || (r.hdi && hdi.includes(r.hdi))) && (!needle || `${r.name} ${r.area}`.toLowerCase().includes(needle)));
    const val = (r: CountryRow): number => sort.key === "name" ? 0 : sort.key === "region" ? 0 : ((r as unknown as Record<string, number | null>)[sort.key] ?? -Infinity);
    list.sort((a, b) => sort.key === "name" ? sort.dir * a.name.localeCompare(b.name) : sort.key === "region" ? sort.dir * a.region.localeCompare(b.region) : sort.dir * (val(a) - val(b)) || a.name.localeCompare(b.name));
    return list;
  }, [sel, regions, hdi, q, sort]);

  const onSort = (key: string) => setSort((s) => (s.key === key ? { key, dir: s.dir === 1 ? -1 : 1 } : { key, dir: key === "name" || key === "region" ? 1 : -1 }));
  const cancerName = cancers.find((c) => c.id === cancer)?.name ?? "All cancers";
  const cancerOptions = useMemo(() => cancers.map((c) => ({ value: c.id, label: c.name, group: c.group })), [cancers]);
  const countryOptions = useMemo(() => [...countryList].sort((a, b) => a.name.localeCompare(b.name)).map((c) => ({ value: c.iso3, label: c.name })), [countryList]);

  const columns: Column<CountryRow>[] = [
    { key: "rank", label: "#", render: (_, i) => <span className="tabular-nums text-muted">{i + 1}</span>, className: "w-10" },
    { key: "name", label: "Country", sortable: true, render: (r) => <button type="button" onClick={() => setCountry(r.iso3)} className="font-medium hover:underline text-left">{r.name}</button> },
    { key: "region", label: "Region", sortable: true, hide: "hidden md:table-cell", render: (r) => <span className="text-muted">{r.region}</span> },
    { key: "hdi", label: "HDI", hide: "hidden lg:table-cell", render: (r) => <span className="text-muted">{r.hdi?.replace(" HDI", "") ?? "-"}</span> },
    { key: "cases", label: "New cases", sortable: true, render: (r) => r.cases === null ? <NoData /> : <span className="tabular-nums">{fmt(r.cases)}</span> },
    { key: "incAsr", label: "Incidence ASR", sortable: true, render: (r) => r.incAsr === null ? <NoData /> : <span className="tabular-nums">{fmt(r.incAsr, 1)}</span> },
    { key: "trend", label: "Trend", hide: "hidden xl:table-cell", tip: "Incidence rate across the GLOBOCAN editions on file; one dot means only one edition is available.", render: (r) => <Sparkline cancerId={cancer} iso3={r.iso3} /> },
    { key: "cumRisk", label: "Risk to 74", sortable: true, hide: "hidden lg:table-cell", tip: "Chance of being diagnosed before age 75, in the absence of competing causes.", render: (r) => r.cumRisk === null ? <NoData /> : <span className="tabular-nums">{fmt(r.cumRisk, 1)}%</span> },
    { key: "pop", label: "Population", sortable: true, hide: "hidden lg:table-cell", render: (r) => r.pop ? <span className="tabular-nums text-muted">{fmt(r.pop / 1e6, 1)}M</span> : <NoData /> },
  ];
  /** Mortality columns live in their own folded table so the first view is about where cancer occurs, not where people die. */
  const mortalityColumns: Column<CountryRow>[] = [
    { key: "rank", label: "#", render: (_, i) => <span className="tabular-nums text-muted">{i + 1}</span>, className: "w-10" },
    { key: "name", label: "Country", sortable: true, render: (r) => <button type="button" onClick={() => setCountry(r.iso3)} className="font-medium hover:underline text-left">{r.name}</button> },
    { key: "cases", label: "New cases", sortable: true, render: (r) => r.cases === null ? <NoData /> : <span className="tabular-nums">{fmt(r.cases)}</span> },
    { key: "deaths", label: "Deaths", sortable: true, render: (r) => r.deaths === null ? <NoData /> : <span className="tabular-nums">{fmt(r.deaths)}</span> },
    { key: "mortAsr", label: "Mortality ASR", sortable: true, render: (r) => r.mortAsr === null ? <NoData /> : <span className="tabular-nums">{fmt(r.mortAsr, 1)}</span> },
    { key: "mi", label: "M:I ratio", sortable: true, hide: "hidden sm:table-cell", tip: "Deaths divided by new cases in the same year; a rough proxy for how early cancers are found and how well care is delivered in a country, not for any one person's outlook.", render: (r) => r.mi === null ? <NoData /> : <span className="tabular-nums">{fmt(r.mi, 2)}</span> },
  ];

  const noEstimate = sel.mapping.codes.length === 0;

  return (
    <div>
      <Toolbar
        count={filtered.length} total={sel.rows.length} noun="countries"
        left={<>
          <FacetSelect label="Cancer" options={cancerOptions} value={cancer} onChange={(v) => setCancer(v as string | null)} allLabel="All cancers" width="w-72" />
          <FacetSelect label="Region" options={regionOptions} value={regions} onChange={(v) => setRegions(v as string[])} multi searchable={false} allLabel="Any" width="w-52" />
          <FacetSelect label="HDI" options={hdiOptions} value={hdi} onChange={(v) => setHdi(v as string[])} multi searchable={false} allLabel="Any" width="w-44" />
          <FacetSelect label="Map colour" options={METRICS.map(([v, l]) => ({ value: v, label: l }))} value={metric} onChange={(v) => { if (v) setMetric(v as Metric); }} searchable={false} allLabel="Incidence rate" width="w-64" />
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Find a country…" aria-label="Find a country" className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-accent/40 w-48" />
        </>}
        right={<FacetSelect label="One country" options={countryOptions} value={country} onChange={(v) => setCountry(v as string | null)} allLabel="None" width="w-60" />}
      />

      {loadError && <div className="card p-3 mb-4 text-sm border-rose-300 bg-rose-50/60 dark:bg-rose-950/20">The GLOBOCAN dataset could not be loaded, so only the all-cancers table is available. Reload to try again.</div>}
      {/* Gap banner for the selected cancer */}
      {loading ? <div className="card p-3 mb-4 text-sm text-muted">Loading GLOBOCAN dataset…</div> : <div className={`card p-3 mb-4 text-sm ${noEstimate ? "border-rose-300 bg-rose-50/60 dark:bg-rose-950/20" : sel.mapping.shared ? "border-amber-300 bg-amber-50/60 dark:bg-amber-950/20" : ""}`}>
        <span className="font-medium">{cancerName}</span>
        <span className="text-muted"> → GLOBOCAN site: </span><span className="font-medium">{sel.mapping.label}</span>
        {sel.mapping.note && <p className="text-muted mt-1">{sel.mapping.note}</p>}
        {noEstimate && <p className="mt-1 font-medium text-rose-700 dark:text-rose-300">We lack country-level case numbers for this cancer. The table and map below show “no data” on purpose rather than an approximation.</p>}
        {sel.world && !noEstimate && <p className="text-muted mt-1">World {meta.year}: {fmt(sel.world.cases)} new cases, incidence ASR {fmt(sel.world.incAsr, 1)} per 100,000.</p>}
      </div>}

      {country && (profile ? <CountryPanel c={profile} cancers={cancers} onClose={() => setCountry(null)} /> : <div className="card p-4 mb-4 text-sm text-muted">{loadError ? "Country view unavailable: dataset failed to load." : `Loading ${countryList.find((c) => c.iso3 === country)?.name ?? country}…`}</div>)}

      <Choropleth rows={filtered} metric={metric} label={METRICS.find(([m]) => m === metric)?.[1] ?? ""} onPick={(iso3) => setCountry(iso3)} />

      <div className="mt-4">
        <ResultsTable columns={columns} rows={filtered} rowKey={(r) => r.iso3} sort={sort} onSort={onSort} empty={loading ? "Loading…" : "No countries match."} />
      </div>

      {!noEstimate && (
        <GentleSection className="mt-6" title="deaths and death rates by country" why="GLOBOCAN's estimated deaths, mortality rate and deaths-to-cases ratio for the same countries, for readers who want them."
          reassurance={<>{MORTALITY_NOTE}{sel.world ? ` World ${meta.year}: ${fmt(sel.world.cases)} new cases and ${fmt(sel.world.deaths)} deaths; mortality ASR ${fmt(sel.world.mortAsr, 1)} per 100,000.` : ""}</>}>
          <ResultsTable columns={mortalityColumns} rows={filtered} rowKey={(r) => r.iso3} sort={sort} onSort={onSort} empty={loading ? "Loading…" : "No countries match."} />
        </GentleSection>
      )}

      <details className="card p-4 mt-6 text-sm">
        <summary className="cursor-pointer font-medium">What we lack, and why</summary>
        <ul className="list-disc pl-5 mt-2 space-y-1 text-muted">
          <li><span className="text-foreground">No direct estimate</span> for {gaps.noEstimate.length} OnCo cancers ({gaps.noEstimate.map((id) => cancers.find((c) => c.id === id)?.name ?? id).join(", ")}): GLOBOCAN reports by anatomical site, and these are histologies or subtypes it does not separate.</li>
          <li><span className="text-foreground">Shared site totals</span> for {gaps.shared.length} cancers ({gaps.shared.map((id) => cancers.find((c) => c.id === id)?.name.replace(/ \(.*\)$/, "") ?? id).join(", ")}): breast subtypes, lung histologies, leukaemia types, and lymphoma subtypes share one number each.</li>
          <li><span className="text-foreground">Estimates, not counts.</span> GLOBOCAN combines registry data where it exists with modelled estimates elsewhere; quality varies by country (IARC grades each country&apos;s method). Age-standardised rates use the World standard population.</li>
          <li><span className="text-foreground">Both sexes, all ages, {meta.year} only.</span> No sex split, age split, stage, or trend is shown here.</li>
          {gaps.failedCountries.length > 0 && <li><span className="text-foreground">Countries not fetched:</span> {gaps.failedCountries.join(", ")}.</li>}
          <li>Data fetched {meta.fetched} from <a className="underline" href={meta.sourceUrl} rel="noopener">IARC Global Cancer Observatory</a>.</li>
        </ul>
      </details>
    </div>
  );
}

function CountryPanel({ c, cancers, onClose }: { c: CountryProfile; cancers: CancerOption[]; onClose: () => void }) {
  const sites = c.sites;
  const byId = new Map(cancers.map((x) => [x.id, x]));
  return (
    <div className="card p-4 mb-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
        <div><span className="text-lg font-semibold">{c.name}</span><span className="text-muted text-sm"> · {c.region}{c.hdi ? ` · ${c.hdi}` : ""}{c.pop ? ` · ${fmt(c.pop / 1e6, 1)}M people` : ""}</span></div>
        <button type="button" onClick={onClose} className="text-sm underline text-muted">Close</button>
      </div>
      <div className="overflow-x-auto">
        <table className="onco">
          <thead><tr><th>#</th><th>Cancer site (GLOBOCAN)</th><th>OnCo pages</th><th>New cases</th><th>Incidence ASR</th><th className="hidden sm:table-cell">Risk to 74</th></tr></thead>
          <tbody>
            {sites.map((s, i) => (
              <tr key={`${c.iso3}-${s.code}`}>
                <td className="tabular-nums text-muted">{i + 1}</td>
                <td className="font-medium">{(() => { const first = s.oncoIds.map((id) => byId.get(id)).find(Boolean); return first ? <Link href={first.route} className="hover:underline">{s.label}</Link> : s.label; })()}</td>
                <td className="text-sm">{s.oncoIds.length ? s.oncoIds.map((id) => byId.get(id)).filter(Boolean).map((x) => <Link key={x!.id} href={x!.route} className="underline mr-2">{x!.name.replace(/ \(.*\)$/, "")}</Link>) : <span className="text-muted/60 text-xs italic">no OnCo page</span>}</td>
                <td className="tabular-nums">{s.cases === null ? <NoData /> : fmt(s.cases)}</td>
                <td className="tabular-nums">{s.incAsr === null ? <NoData /> : fmt(s.incAsr, 1)}</td>
                <td className="tabular-nums hidden sm:table-cell">{s.cumRisk === null ? <NoData /> : `${fmt(s.cumRisk, 1)}%`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <GentleSection className="mt-3 border-dashed" title={`deaths by cancer in ${c.name}`} why="GLOBOCAN's estimated deaths and mortality rate for each site, for readers who want them." reassurance={MORTALITY_NOTE}>
        <div className="overflow-x-auto">
          <table className="onco">
            <thead><tr><th>#</th><th>Cancer site (GLOBOCAN)</th><th>New cases</th><th>Deaths</th><th>Mortality ASR</th></tr></thead>
            <tbody>
              {sites.map((s, i) => (
                <tr key={`${c.iso3}-${s.code}-m`}>
                  <td className="tabular-nums text-muted">{i + 1}</td>
                  <td className="font-medium">{(() => { const first = s.oncoIds.map((id) => byId.get(id)).find(Boolean); return first ? <Link href={first.route} className="hover:underline">{s.label}</Link> : s.label; })()}</td>
                  <td className="tabular-nums">{s.cases === null ? <NoData /> : fmt(s.cases)}</td>
                  <td className="tabular-nums">{s.deaths === null ? <NoData /> : fmt(s.deaths)}</td>
                  <td className="tabular-nums">{s.mortAsr === null ? <NoData /> : fmt(s.mortAsr, 1)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </GentleSection>
    </div>
  );
}

function Choropleth({ rows, metric, label, onPick }: { rows: CountryRow[]; metric: Metric; label: string; onPick: (iso3: string) => void }) {
  const [land, setLand] = useState<FeatureCollection<Geometry> | null>(null);
  const [hover, setHover] = useState<CountryRow | null>(null);
  const W = 960, H = 470;
  useEffect(() => {
    let alive = true;
    fetch(WORLD_URL).then((r) => r.json()).then((topo: Topology) => { if (alive) setLand(feature(topo, topo.objects.countries as GeometryCollection) as unknown as FeatureCollection<Geometry>); }).catch(() => setLand(null));
    return () => { alive = false; };
  }, []);
  const projection = useMemo(() => geoNaturalEarth1().fitSize([W, H], { type: "Sphere" }), []);
  const path = useMemo(() => geoPath(projection), [projection]);
  const byNum = useMemo(() => new Map(rows.map((r) => [r.isonum, r])), [rows]);
  const values = rows.map((r) => r[metric]).filter((v): v is number => v !== null);
  const max = Math.max(1, ...values);
  // Quantile-ish scale so a few giant countries do not wash out the map for counts.
  const sorted = [...values].sort((a, b) => a - b);
  const q = (p: number) => sorted[Math.min(sorted.length - 1, Math.floor(p * sorted.length))] ?? max;
  const stops = [q(0.2), q(0.4), q(0.6), q(0.8), max];
  const colour = (v: number | null) => {
    if (v === null) return "url(#nodata)";
    const i = stops.findIndex((s) => v <= s);
    return ["#fde2e2", "#fbb4b4", "#f47b7b", "#dc3c3c", "#8f1414"][i < 0 ? 4 : i];
  };
  return (
    <div className="card p-2 relative">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label={`World map coloured by ${label}`}>
        <defs><pattern id="nodata" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="6" height="6" className="fill-zinc-100 dark:fill-zinc-800" /><line x1="0" y1="0" x2="0" y2="6" className="stroke-zinc-300 dark:stroke-zinc-600" strokeWidth="1.5" /></pattern></defs>
        <path d={path({ type: "Sphere" }) ?? ""} className="fill-sky-50 dark:fill-sky-950/30" />
        {land && land.features.map((f, i) => {
          const r = byNum.get(Number(f.id));
          return <path key={i} d={path(f) ?? ""} fill={r ? colour(r[metric]) : "url(#nodata)"} className="stroke-background cursor-pointer" strokeWidth={0.5} onMouseEnter={() => setHover(r ?? null)} onMouseLeave={() => setHover(null)} onClick={() => r && onPick(r.iso3)} />;
        })}
        {!land && <text x={W / 2} y={H / 2} textAnchor="middle" className="fill-muted" style={{ fontSize: 14 }}>Loading map…</text>}
      </svg>
      <div className="absolute left-3 bottom-3 flex items-center gap-2 text-[11px] text-muted bg-background/80 rounded px-2 py-1">
        <span>{label}</span>
        {["#fde2e2", "#fbb4b4", "#f47b7b", "#dc3c3c", "#8f1414"].map((c, i) => <span key={c} className="inline-flex items-center gap-1"><span className="inline-block h-3 w-3 rounded-sm" style={{ background: c }} />{i === 0 ? "low" : i === 4 ? "high" : ""}</span>)}
        <span className="inline-flex items-center gap-1"><span className="inline-block h-3 w-3 rounded-sm bg-[repeating-linear-gradient(45deg,#d4d4d8_0_2px,#f4f4f5_2px_4px)]" />no data / filtered out</span>
      </div>
      {hover && <div className="absolute right-3 top-3 card px-3 py-2 text-sm shadow"><div className="font-medium">{hover.name}</div><div className="text-muted">{hover[metric] === null ? "no data" : `${label.split(" (")[0]}: ${fmt(hover[metric], metric.endsWith("Asr") ? 1 : 0)}`}</div></div>}
    </div>
  );
}

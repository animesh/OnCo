"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { ResultsTable, Toolbar, type Column, type SortState } from "./filters/ResultsTable";
import { FacetSelect } from "./filters/FacetSelect";
import { Tip } from "./Tip";
import { useRegion } from "@/lib/region";
import { REGION_META } from "@/data/regional-approvals";
import { REGION_COUNTRIES } from "@/data/referral-routes";
import type { CentreRow } from "@/lib/centre-pack";

/**
 * Sortable table of the centres linked to one cancer, with the measurable facts the corpus holds on each:
 * designations, trials for this cancer, research output, machines on record, Newsweek rank. A country filter and,
 * when the reader has chosen a region in the header switcher, a "near you" marker on centres in that region. Nothing
 * is fetched and no geolocation is used: the region comes from the existing toggle in localStorage.
 */
export function CentreTable({ rows, cancerName, countryNames, compact = false }: { rows: CentreRow[]; cancerName: string; countryNames: Record<string, string>; compact?: boolean }) {
  const { region } = useRegion();
  const [country, setCountry] = useState<string | null>(null);
  const [nearOnly, setNearOnly] = useState(false);
  const [sort, setSort] = useState<SortState>({ key: "rank", dir: 1 });

  const regionCodes = useMemo(() => (region ? REGION_COUNTRIES[region] : []), [region]);
  const near = useCallback((r: CentreRow) => regionCodes.includes(r.country), [regionCodes]);
  const nearCount = rows.filter(near).length;

  const countryOptions = useMemo(() => {
    const counts = new Map<string, number>();
    for (const r of rows) counts.set(r.country, (counts.get(r.country) ?? 0) + 1);
    return [...counts.entries()].map(([code, n]) => ({ value: code, label: countryNames[code] ?? code, count: n })).sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  }, [rows, countryNames]);

  const filtered = useMemo(() => {
    let list = rows;
    if (country) list = list.filter((r) => r.country === country);
    if (nearOnly && regionCodes.length) list = list.filter(near);
    const dir = sort.dir;
    const key = sort.key;
    const val = (r: CentreRow): number | string => {
      switch (key) {
        case "name": return r.name;
        case "country": return countryNames[r.country] ?? r.country;
        case "designations": return r.designations.length;
        case "trials": return r.trials.length;
        case "works": return r.research?.works ?? -1;
        case "cited": return r.research?.cited ?? -1;
        case "technologies": return r.technologies.length;
        case "newsweek": return r.newsweek ?? 999;
        default: return 0;
      }
    };
    if (key === "rank") return list;
    return [...list].sort((a, b) => { const x = val(a), y = val(b); const c = typeof x === "string" && typeof y === "string" ? x.localeCompare(y) : Number(x) - Number(y); return c * dir || a.name.localeCompare(b.name); });
  }, [rows, country, nearOnly, sort, regionCodes, near, countryNames]);

  const onSort = (k: string) => setSort((s) => (s.key === k ? { key: k, dir: s.dir === 1 ? -1 : 1 } : { key: k, dir: k === "name" || k === "country" || k === "newsweek" ? 1 : -1 }));

  const hasResearch = rows.some((r) => r.research);
  const years = rows.find((r) => r.research)?.research?.years;

  const columns: Column<CentreRow>[] = [
    { key: "name", label: "Centre", sortable: true, render: (r) => (
      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
          <Link href={r.route} className="font-medium hover:underline">{r.name}</Link>
          {near(r) && region && <Tip title="Near you" text={`In your chosen region (${REGION_META[region].label}). Change the region from the globe in the header.`}><span className="chip bg-accent-soft text-accent text-[10px] cursor-help">Near you</span></Tip>}
        </div>
        <div className="text-xs text-muted mt-0.5">{r.city} · <span className="capitalize">{r.institutionType.replace("-", " ")}</span></div>
        {r.programmes.length > 0 && <div className="text-xs mt-0.5"><Tip title="Programme on record" text={`The institution record lists a programme that names ${cancerName}.`}><span className="chip bg-foreground/5 text-[10px] cursor-help">Programme: {r.programmes.slice(0, 2).join(", ")}</span></Tip></div>}
      </div>
    ) },
    { key: "country", label: "Country", sortable: true, hide: "hidden sm:table-cell", render: (r) => <Link href={`/institutions/?country=${encodeURIComponent(r.country)}`} className="hover:underline whitespace-nowrap">{countryNames[r.country] ?? r.country}</Link> },
    { key: "designations", label: "Designations", sortable: true, hide: "hidden md:table-cell", tip: "Designations and memberships recorded on the institution: NCI designation, OECI accreditation, CRUK centre, NHS alliance, Unicancer, IRCCS and similar. From the record's fields and tags.", render: (r) => r.designations.length ? (
      <div className="flex flex-wrap gap-1">{r.designations.map((d) => d.href ? <Link key={d.key} href={d.href} className="chip bg-foreground/5 text-[10px] hover:bg-foreground/10">{d.label}</Link> : <span key={d.key} className="chip bg-foreground/5 text-[10px]">{d.label}</span>)}</div>
    ) : <span className="text-muted text-xs">none recorded</span> },
    { key: "trials", label: "Trials here", sortable: true, className: "tabular-nums", tip: `Trials in OnCo linked to both this centre and ${cancerName}. A coverage count, not the centre's full trial portfolio.`, render: (r) => r.trials.length ? (
      <Tip title={`${r.trials.length} trial${r.trials.length === 1 ? "" : "s"} for ${cancerName}`} text={r.trials.slice(0, 6).map((t) => t.name).join(" · ") + (r.trials.length > 6 ? ` and ${r.trials.length - 6} more` : "")} href={`${r.route}#connected`} linkLabel="See on the centre page →"><Link href={`${r.route}#connected`} className="underline decoration-dotted underline-offset-[3px]">{r.trials.length}</Link></Tip>
    ) : <span className="text-muted">0</span> },
    ...(hasResearch ? [
      { key: "works", label: "Oncology papers", sortable: true, className: "tabular-nums", hide: "hidden md:table-cell", tip: `Oncology works ${years ? `${years[0]}-${years[1]}` : "in the fetch window"} from OpenAlex (CC0), matched to the institution. Output, not quality.`, render: (r: CentreRow) => r.research ? <Link href={`${r.route}#research`} className="underline decoration-dotted underline-offset-[3px]">{r.research.works.toLocaleString("en-GB")}</Link> : <span className="text-muted text-xs">not matched</span> },
      { key: "cited", label: "Citations", sortable: true, className: "tabular-nums", hide: "hidden lg:table-cell", tip: "Citations to those works, summed by OpenAlex.", render: (r: CentreRow) => r.research ? <span>{r.research.cited.toLocaleString("en-GB")}</span> : <span className="text-muted">-</span> },
    ] satisfies Column<CentreRow>[] : []),
    { key: "technologies", label: "Machines and methods", sortable: true, hide: compact ? "hidden xl:table-cell" : "hidden lg:table-cell", tip: "Technologies the institution record lists (proton therapy, CAR-T manufacturing, PET tracers and so on). Only what is recorded; absence is a gap, not a lack.", render: (r) => r.technologies.length ? (
      <div className="flex flex-wrap gap-1">{r.technologies.slice(0, 4).map((t) => <Link key={t.id} href={t.route} className="chip border bg-card border-border text-[10px] hover:bg-foreground/5">{t.name}</Link>)}{r.technologies.length > 4 && <Link href={`${r.route}#connected`} className="chip bg-foreground/5 text-[10px]">+{r.technologies.length - 4}</Link>}</div>
    ) : <span className="text-muted text-xs">none recorded</span> },
    { key: "newsweek", label: "Newsweek rank", sortable: true, className: "tabular-nums", hide: "hidden sm:table-cell", tip: "Position in the Newsweek and Statista World's Best Specialized Hospitals 2026 list for oncology. A survey-based list; unranked centres show a dash.", render: (r) => r.newsweek ? <Link href="/institutions/" className="underline decoration-dotted underline-offset-[3px]">#{r.newsweek}</Link> : <span className="text-muted">-</span> },
  ];

  const regionLabel = region ? REGION_META[region].label : null;

  return (
    <div>
      <Toolbar
        noun="centres"
        count={filtered.length}
        total={rows.length}
        left={<>
          <FacetSelect label="Country" options={countryOptions} value={country} onChange={(v) => setCountry(v as string | null)} allLabel="Anywhere" width="w-56" />
          {region && nearCount > 0 && (
            <button type="button" onClick={() => setNearOnly((x) => !x)} aria-pressed={nearOnly} className={`chip border text-xs ${nearOnly ? "bg-accent-soft border-accent text-accent" : "bg-card border-border hover:bg-foreground/5"}`}>
              Near you: {regionLabel} ({nearCount})
            </button>
          )}
          {region && nearCount === 0 && <span className="text-xs text-muted">No linked centre is in your region ({regionLabel}).</span>}
          {!region && <span className="text-xs text-muted">Choose a region from the globe in the header to mark centres near you.</span>}
        </>}
      />
      <ResultsTable columns={columns} rows={filtered} rowKey={(r) => r.id} sort={sort} onSort={onSort} scroll={compact} pageSize={compact ? 15 : 40} empty="No linked centre matches this filter." />
      <div className="text-xs text-muted mt-3 space-y-1">
        <p><span className="font-medium text-foreground">These are the things we can measure; they are not a ranking of quality.</span> Each column is a field on the institution record or a count over what OnCo has linked; a centre that treats many patients with {cancerName} but is thinly recorded here will look small.</p>
        <p><span className="font-medium text-foreground">Not known:</span> OnCo holds no case-volume or outcome figures for centres, so none are shown. Where a national audit or registry publishes them, the centre&apos;s page links to it. Default order: Newsweek rank, then trials for this cancer, then research output.</p>
      </div>
    </div>
  );
}

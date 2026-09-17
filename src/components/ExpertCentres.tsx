import Link from "next/link";
import { graph } from "@/lib/graph";
import { routeFor } from "@/lib/schema";
import { centreRowsFor, countryName } from "@/lib/centre-table";
import { CentreTable } from "./CentreTable";

/**
 * Institutions that matter for one cancer: those linked to the cancer directly, plus those linked to its
 * pipeline items, trials, guideline refs and history. Server component; the rows are built here from record
 * fields and graph counts (src/lib/centre-table.ts) and handed to the sortable client table.
 */
export function ExpertCentres({ cancerId }: { cancerId: string }) {
  const g = graph();
  const cancer = g.must(cancerId);
  if (cancer.kind !== "cancer") return null;

  const rows = centreRowsFor(cancerId);
  const countryNames = Object.fromEntries([...new Set(rows.map((r) => r.country))].map((c) => [c, countryName(c)]));
  const cancerCommons = g.get("cancer-commons");
  const nCountries = Object.keys(countryNames).length;
  const withTrials = rows.filter((r) => r.trials.length).length;

  return (
    <div className="card p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-3 mb-3">
        <div>
          <div className="kicker">Where the expertise is</div>
          <h3 className="text-lg font-semibold mt-0.5">Expert centres</h3>
        </div>
        {rows.length > 0 && <div className="text-xs text-muted tabular-nums">{rows.length} centres in {nCountries} countr{nCountries === 1 ? "y" : "ies"} · {withTrials} with a trial for this cancer on record · <Link className="underline" href="/second-opinion/">second-opinion finder →</Link></div>}
      </div>
      {rows.length === 0 ? (
        <p className="text-sm text-muted">No institutions are linked to this cancer yet. The general <Link className="underline" href="/institutions/">institution ranking</Link> is the place to start.</p>
      ) : (
        <CentreTable rows={rows} cancerName={cancer.name.replace(/\s*\(.*?\)\s*$/, "")} countryNames={countryNames} compact />
      )}
      <div className="text-sm text-muted mt-4 border-t border-border pt-3">
        <span className="font-medium text-foreground">Seeking a second opinion:</span> ask your oncologist for a referral to a high-volume centre; most accept records and pathology by mail or telehealth. In the US, use the NCI&apos;s <a className="underline" href="https://www.cancer.gov/research/infrastructure/cancer-centers/find" rel="noopener">Find a Cancer Center</a> tool
        {cancerCommons && <> or the nonprofit <Link className="underline" href={routeFor(cancerCommons)}>{cancerCommons.name}</Link>, which navigates options for advanced cancers at no cost</>}. The <Link className="underline" href="/second-opinion/">second-opinion finder</Link> explains how referral works in your country.
      </div>
    </div>
  );
}

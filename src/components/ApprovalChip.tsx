"use client";

import { STATUS_LABEL, statusClass } from "@/lib/text";
import { regionalApprovals, REGION_META, type Region, type RegionalStatus } from "@/data/regional-approvals";
import { useRegion } from "@/lib/region";
import { Tip } from "./Tip";

const LABEL: Record<RegionalStatus, string> = { approved: "Approved", conditional: "Conditional approval", "under-review": "Under review", "not-filed": "Not filed", withdrawn: "Withdrawn", rejected: "Rejected" };
const TONE: Record<RegionalStatus, string> = { approved: "approved", conditional: "phase-3", "under-review": "phase-2", "not-filed": "mixed", withdrawn: "withdrawn", rejected: "negative" };

/**
 * Status for a product as seen from the reader's country. Approved products show the regulator's verdict for the
 * selected region plus flags for every other region where they are approved; earlier-stage products show their
 * global phase. Falls back gracefully when a region has not been researched.
 */
export function ApprovalChip({ drugId, status, compact = false }: { drugId: string; status?: string; compact?: boolean }) {
  const { region } = useRegion();
  const row = regionalApprovals[drugId];
  const approvedIn = row ? (Object.keys(row) as Region[]).filter((r) => row[r]?.status === "approved" || row[r]?.status === "conditional") : [];
  const flags = (skip?: Region) => approvedIn.filter((r) => r !== skip).map((r) => <span key={r} aria-label={`approved in ${REGION_META[r].label}`} title={`${REGION_META[r].label}${row?.[r]?.year ? ` · ${row[r]!.year}` : ""}`} className="text-[11px] leading-none">{REGION_META[r].flag}</span>);

  // Not an approved product anywhere we know of: plain global status.
  const globallyApproved = status === "approved" || status === "standard-of-care" || approvedIn.length > 0;
  if (!globallyApproved) return status ? <span className={`chip whitespace-nowrap ${statusClass(status)}`}>{STATUS_LABEL[status] ?? status}</span> : null;

  if (!region) {
    const first = approvedIn.length ? Math.min(...approvedIn.map((r) => row?.[r]?.year ?? 9999)) : undefined;
    const tip = approvedIn.length ? `Approved in ${approvedIn.map((r) => REGION_META[r].label).join(", ")}. Choose your country in the top bar to see the verdict that applies to you.` : "Recorded as approved; choose your country in the top bar to see which regulators have cleared it.";
    return (
      <Tip title="🌐 Global view" text={tip} href="/regulatory/regions/" linkLabel="Compare all regions →">
        <span className={`chip cursor-help inline-flex items-center gap-1 whitespace-nowrap ${statusClass("approved")}`}>Approved{!compact && first && first !== 9999 ? <span className="opacity-70 tabular-nums">{first}</span> : null}{!compact && <span className="inline-flex gap-0.5 ml-0.5">{flags()}</span>}</span>
      </Tip>
    );
  }
  const here = row?.[region];
  const meta = REGION_META[region];
  if (here) {
    const tip = `${LABEL[here.status]} in ${meta.label} (${meta.regulator})${here.year ? `, ${here.year}` : ""}${here.indication ? `: ${here.indication}` : ""}${here.note ? `. ${here.note}` : ""}${approvedIn.filter((r) => r !== region).length ? `. Also approved in ${approvedIn.filter((r) => r !== region).map((r) => REGION_META[r].label).join(", ")}.` : ""}`;
    return (
      <Tip title={`${meta.flag} ${meta.label}`} text={tip} href="/regulatory/regions/" linkLabel="Compare all regions →">
        <span className={`chip cursor-help inline-flex items-center gap-1 whitespace-nowrap ${statusClass(TONE[here.status])}`}>
          <span aria-hidden>{meta.flag}</span>{LABEL[here.status]}{!compact && here.year && here.status === "approved" ? <span className="opacity-70 tabular-nums">{here.year}</span> : null}
          {!compact && <span className="inline-flex gap-0.5 ml-0.5">{flags(region)}</span>}
        </span>
      </Tip>
    );
  }
  // Approved somewhere, but this region is not in our records.
  const tip = approvedIn.length
    ? `No ${meta.regulator} record in our data yet for ${meta.label}. Approved in ${approvedIn.map((r) => REGION_META[r].label).join(", ")}.`
    : `Recorded as approved (usually by the FDA). We have not yet mapped ${meta.label} for this product.`;
  return (
    <Tip title={`${meta.flag} ${meta.label}: not mapped`} text={tip} href="/regulatory/regions/" linkLabel="Compare all regions →">
      <span className={`chip cursor-help inline-flex items-center gap-1 ${statusClass("mixed")}`}>
        <span aria-hidden className="opacity-60">{meta.flag}</span>Not mapped here
        {!compact && <span className="inline-flex gap-0.5 ml-0.5">{approvedIn.length ? flags() : <span className="text-[11px] opacity-70">approved</span>}</span>}
      </span>
    </Tip>
  );
}

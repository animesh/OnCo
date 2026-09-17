/**
 * Client-safe shapes and packing for the expert-centre table. No graph or filesystem imports: the server builds the
 * rows (see centre-table.ts), packs them once per page, and the client components unpack them.
 */
import type { Institution } from "./schema";

export type CentreDesignation = { key: string; label: string; href?: string };

export type CentreResearch = { works: number; cited: number; clinicalTrials: number; years: [number, number] };

export type CentreRow = {
  id: string;
  name: string;
  route: string;
  website?: string;
  city: string;
  country: string;
  institutionType: Institution["institutionType"];
  /** How the centre is linked to this cancer in the corpus ("this cancer", trial and product names). May be trimmed in packed form; `viaTotal` keeps the full count. */
  via: string[];
  viaTotal: number;
  newsweek?: number;
  nci?: Institution["nci"];
  designations: CentreDesignation[];
  programmes: string[];
  /** Trials in the corpus linked to both this centre and this cancer. */
  trials: Array<{ id: string; name: string; route: string }>;
  research: CentreResearch | null;
  technologies: Array<{ id: string; name: string; route: string }>;
  leadershipRank?: number;
};

export type CentreBase = Omit<CentreRow, "via" | "viaTotal" | "trials" | "programmes">;
export type CentreLink = { i: string; v: string[]; vn: number; t: string[]; p: string[] };
export type CentrePack = { institutions: Record<string, CentreBase>; trials: Record<string, { name: string; route: string }> };

const VIA_KEEP = 5;

export function packCentreRows(byCancer: Record<string, CentreRow[]>): { pack: CentrePack; links: Record<string, CentreLink[]> } {
  const institutions: Record<string, CentreBase> = {};
  const trials: Record<string, { name: string; route: string }> = {};
  const links: Record<string, CentreLink[]> = {};
  for (const [cancerId, rows] of Object.entries(byCancer)) {
    links[cancerId] = rows.map((r) => {
      const { via, viaTotal, trials: ts, programmes, ...base } = r;
      void viaTotal;
      institutions[r.id] ??= base;
      for (const t of ts) trials[t.id] ??= { name: t.name, route: t.route };
      return { i: r.id, v: via.slice(0, VIA_KEEP), vn: via.length, t: ts.map((t) => t.id), p: programmes };
    });
  }
  return { pack: { institutions, trials }, links };
}

export function unpackCentreRows(links: CentreLink[], pack: CentrePack): CentreRow[] {
  const out: CentreRow[] = [];
  for (const l of links) {
    const base = pack.institutions[l.i];
    if (!base) continue;
    out.push({ ...base, via: l.v, viaTotal: l.vn, programmes: l.p, trials: l.t.map((id) => ({ id, ...(pack.trials[id] ?? { name: id, route: `/trials/${id}/` }) })) });
  }
  return out;
}

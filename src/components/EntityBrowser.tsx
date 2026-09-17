"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { valueTone } from "@/lib/valueTone";
import { ValueIcon } from "@/components/ValueIcon";
import { Tip } from "@/components/Tip";
import { MoleculeSlot } from "./MoleculeSlot";
import { ApprovalChip } from "./ApprovalChip";
import { flagFor, COUNTRY_FACETS } from "@/lib/flags";
import { TargetThumb } from "./TargetThumb";
import { TechThumb } from "./TechThumb";
import { TermThumb } from "./TermThumb";
import { RowAvatar } from "./RowAvatar";
import { CancerIcon } from "./CancerIcon";
import { FrontIcon } from "./FrontIcon";
import type { TargetSchematicTarget } from "./TargetSchematic";
import { STATUS_LABEL, STATUS_TIPS, statusClass } from "@/lib/text";
import { FacetSelect } from "./filters/FacetSelect";
import { ResultsTable, Toolbar, type Column, type SortState } from "./filters/ResultsTable";
import { DownloadTable } from "./DownloadTable";
import { SaveViewButton } from "./SaveViewButton";
import type { CsvRow } from "@/lib/csv";
import { useT } from "@/lib/i18n/ui";
import { tldrFor } from "./TldrText";
import { useTable } from "@/lib/tldr-tables";

/**
 * One templated, full-width, sortable and filterable table for any kind of entity.
 * The server page turns entities into BrowserRow[] with facet values and extra columns;
 * this component owns the single control row at the top and the table below.
 *
 * Filter state lives in the URL (`?group=Solid&type=Cancer+center&q=her2&sort=-name`): facet keys are the
 * query keys, values repeat (or are comma-separated), `q` is the search box and `sort` is the column key with
 * a leading `-` for descending. The URL is read once on mount and rewritten with `history.replaceState` as
 * filters change, so any view is linkable and the page stays a static export (no server search params).
 * A compact form `?v=<base64url JSON {f,q,s}>` is also accepted on load (for short shared links); it is
 * expanded into the readable form on the first write. "Save view" stores the URL under a name (see /saved/).
 */
export type BrowserRow = {
  id: string; name: string; tldr: string; route: string; status?: string;
  /** Drug id: renders a small rotating molecule beside the name, or an explained placeholder when there is no structure. */
  molecule?: string;
  modality?: string;
  /** Target: renders a small animated schematic of the target class beside the name. */
  target?: TargetSchematicTarget;
  /** Technology: renders its small rotating schematic beside the name. */
  schematic?: { id: string; sections: string[] };
  /** Glossary term: renders its category schematic beside the name. */
  term?: { category: string };
  /** Organ icon (a cancer id) beside the name, for anatomical and pathological terms. */
  cancerIcon?: string;
  /** Front icon (a section id) beside the name. */
  sectionIcon?: string;
  /** Facet values keyed by facet key; arrays for multi-valued facets. */
  facets: Record<string, string[]>;
  /** Extra columns keyed by column key: formatted strings, numbers, lists of links, glossary-marked text, or facet chips. */
  cols: Record<string, CellValue>;
  /** Optional numeric sort keys for extra columns. */
  sortKeys?: Record<string, number>;
  /** Secondary sort when the chosen column ties (higher first), e.g. year reported for trials sorted by status. */
  tie?: number;
  sub?: string;
  logo?: string;
  /** Render the logo as a circle with object-cover (portraits). */
  round?: boolean;
  /** Organisation or person row: show an initials tile when there is no usable logo or portrait. */
  avatar?: "org" | "person";
};

/** A linked object; `tip` is the object's one-line explanation, shown on hover. */
export type LinkItem = { label: string; href: string; tip?: string };
/** A list of linked objects. */
export type LinkList = LinkItem[];
/**
 * A clickable chip that sets a facet in the same table (and so in the URL): `facet` is the facet key,
 * `value` the exact facet value, `label` what to print (defaults to the value), `tip` extra hover text.
 */
export type FacetLink = { facet: string; value: string; label?: string; tip?: string };
/** Free text with glossary marks: each mark is a span with a one-line explanation and a link to the term page. */
export type RichText = { text: string; marks: Array<{ s: number; e: number; label: string; tip: string; href: string }> };
/** Anything a table cell can hold. Lists may mix entity links and facet chips (e.g. a trial's sponsors). */
export type CellValue = string | number | undefined | RichText | FacetLink | Array<LinkItem | FacetLink>;

const isRich = (v: unknown): v is RichText => !!v && typeof v === "object" && !Array.isArray(v) && "text" in (v as object);
const isFacetLink = (v: unknown): v is FacetLink => !!v && typeof v === "object" && !Array.isArray(v) && "facet" in (v as object);
const itemLabel = (i: LinkItem | FacetLink): string => ("href" in i ? i.label : (i.label ?? i.value));
/** The plain text of a cell: what search matches against and what text sorting compares. */
export const cellText = (v: CellValue): string => (Array.isArray(v) ? v.map(itemLabel).join(", ") : isRich(v) ? v.text : isFacetLink(v) ? itemLabel(v) : String(v ?? ""));

export type FacetDef = { key: string; label: string; searchable?: boolean; width?: string; order?: string[] };
export type ColDef = { key: string; label: string; sortable?: boolean; hide?: string; className?: string; numeric?: boolean; chip?: boolean; tip?: string; /** Tips for chip/string values keyed by value, e.g. { "Phase 3": "..." }. */ valueTips?: Record<string, string> };

const STATUS_ORDER = ["approved", "standard-of-care", "positive", "phase-3", "established", "completed", "recruiting", "active", "phase-2", "emerging", "phase-1", "preclinical", "concept", "planned", "mixed", "historic", "negative", "withdrawn"];
const STATUS_FACET: FacetDef = { key: "status", label: "Phase / status", searchable: false, width: "w-48", order: STATUS_ORDER };
const QUERY_KEY = "q";
const SORT_KEY = "sort";
const VIEW_KEY = "v";

/** Decode `?v=` (base64url JSON `{ f: facets, q: search, s: sort }`) into ordinary query parameters. */
function decodeView(v: string): URLSearchParams | null {
  try {
    const json = atob(v.replace(/-/g, "+").replace(/_/g, "/"));
    const view = JSON.parse(json) as { f?: Record<string, string[]>; q?: string; s?: { key: string; dir: 1 | -1 } };
    const p = new URLSearchParams();
    for (const [k, vals] of Object.entries(view.f ?? {})) for (const x of vals) if (typeof x === "string") p.append(k, x);
    if (typeof view.q === "string" && view.q) p.set(QUERY_KEY, view.q);
    if (view.s?.key) p.set(SORT_KEY, `${view.s.dir === -1 ? "-" : ""}${view.s.key}`);
    return p;
  } catch { return null; }
}

/** Encode the state as the compact `v` value; the inverse of `decodeView`. Exported for tests and share links. */
export function encodeView(state: { f: Record<string, string[]>; q: string; s: SortState }): string {
  const f = Object.fromEntries(Object.entries(state.f).filter(([, v]) => v.length));
  return btoa(JSON.stringify({ f, q: state.q || undefined, s: state.s })).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function EntityBrowser({ rows, facets, columns, noun, defaultSort, hideStatus = false, hideTldr = false, external = null, onExternalChange }: {
  rows: BrowserRow[]; facets: FacetDef[]; columns: ColDef[]; noun: string; defaultSort?: SortState; hideStatus?: boolean; hideTldr?: boolean;
  /** Facet values set by a parent (e.g. a map legend); merged with the internal selection for that key and shown as selected. */
  external?: { key: string; values: string[] } | null;
  /** Called when the user changes the externally controlled facet from inside the table (or clears all filters). */
  onExternalChange?: (values: string[]) => void;
}) {
  const [q, setQ] = useState("");
  const [own, setOwn] = useState<Record<string, string[]>>({});
  const { t, tl, status: statusText, noun: nounText, lang } = useT();
  const tldrTable = useTable(lang === "en" ? null : lang);
  /** True once the URL has been read, so the write-back effect never clobbers a shared link with the empty initial state. */
  const [synced, setSynced] = useState(false);
  /** Effective selection: the internal choice plus whatever the parent set on the controlled key. */
  const sel = useMemo(() => {
    if (!external?.values.length) return own;
    return { ...own, [external.key]: [...new Set([...(own[external.key] ?? []), ...external.values])] };
  }, [own, external]);
  const setFacet = (key: string, vals: string[]) => {
    if (external && key === external.key) {
      if (onExternalChange) { onExternalChange(vals); setOwn((s) => ({ ...s, [key]: [] })); return; }
      setOwn((s) => ({ ...s, [key]: vals.filter((v) => !external.values.includes(v)) }));
      return;
    }
    setOwn((s) => ({ ...s, [key]: vals }));
  };
  const root = useRef<HTMLDivElement>(null);
  /**
   * A facet chip: select exactly that value, or clear it when it is already selected. Filtering shortens the
   * table, so if the control row has scrolled off the top, bring it back into view rather than leave the
   * reader looking at whatever follows the table.
   */
  const clickFacet = (f: FacetLink) => {
    const cur = sel[f.facet] ?? [];
    setFacet(f.facet, cur.includes(f.value) ? cur.filter((v) => v !== f.value) : [f.value]);
    requestAnimationFrame(() => {
      const top = root.current?.getBoundingClientRect().top;
      if (top !== undefined && top < 0) window.scrollTo({ top: window.scrollY + top - 120, behavior: "smooth" });
    });
  };
  const clearAll = () => { setOwn({}); setQ(""); onExternalChange?.([]); };
  const baseSort = useMemo<SortState>(() => defaultSort ?? { key: hideStatus ? "name" : "status", dir: 1 }, [defaultSort, hideStatus]);
  const [sort, setSort] = useState<SortState>(baseSort);

  const allFacets = useMemo(() => (hideStatus ? facets : [STATUS_FACET, ...facets]), [facets, hideStatus]);
  const facetVals = (r: BrowserRow, k: string) => (k === "status" ? (r.status ? [r.status] : []) : (r.facets[k] ?? []));
  const facetLabel = (key: string) => tl(allFacets.find((f) => f.key === key)?.label ?? key);

  // Read the URL once on mount (deferred a frame, as the other URL-backed views do, so the effect sets no state
  // synchronously). Values repeat (`?cancers=A&cancers=B`) or are comma-separated; a raw value that is itself a
  // known facet value is kept whole so values containing commas survive.
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      let params = new URLSearchParams(window.location.search);
      const compact = params.get(VIEW_KEY);
      if (compact) { const decoded = decodeView(compact); if (decoded) params = decoded; }
      const next: Record<string, string[]> = {};
      let ext: string[] = [];
      for (const f of allFacets) {
        const raw = params.getAll(f.key);
        if (!raw.length) continue;
        const known = new Set(rows.flatMap((r) => facetVals(r, f.key)));
        const vals = [...new Set(raw.flatMap((s) => (known.has(s) ? [s] : s.split(",").map((x) => x.trim()).filter(Boolean))))];
        if (!vals.length) continue;
        if (external && f.key === external.key && onExternalChange) ext = vals; else next[f.key] = vals;
      }
      if (Object.keys(next).length) setOwn(next);
      if (ext.length) onExternalChange?.(ext);
      const q0 = params.get(QUERY_KEY);
      if (q0) setQ(q0);
      const s0 = params.get(SORT_KEY);
      if (s0) {
        const key = s0.replace(/^-/, "");
        const known = key === "name" || (key === "status" && !hideStatus) || columns.some((c) => c.key === key && c.sortable);
        if (known) setSort({ key, dir: s0.startsWith("-") ? -1 : 1 });
      }
      setSynced(true);
    });
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount only: the URL seeds state, then state owns the URL
  }, []);

  // Write the selection and search back to the URL, leaving unrelated query keys and the hash alone.
  useEffect(() => {
    if (!synced) return;
    const url = new URL(window.location.href);
    for (const f of allFacets) url.searchParams.delete(f.key);
    url.searchParams.delete(QUERY_KEY); url.searchParams.delete(SORT_KEY); url.searchParams.delete(VIEW_KEY);
    for (const f of allFacets) for (const v of sel[f.key] ?? []) url.searchParams.append(f.key, v);
    if (q.trim()) url.searchParams.set(QUERY_KEY, q.trim());
    if (sort.key !== baseSort.key || sort.dir !== baseSort.dir) url.searchParams.set(SORT_KEY, `${sort.dir === -1 ? "-" : ""}${sort.key}`);
    const next = url.pathname + url.search + url.hash;
    if (next !== window.location.pathname + window.location.search + window.location.hash) window.history.replaceState(window.history.state, "", next);
  }, [synced, sel, q, sort, baseSort, allFacets]);

  const matches = (r: BrowserRow, skip?: string) => {
    const needle = q.trim().toLowerCase();
    if (needle && !`${r.name} ${r.tldr} ${r.sub ?? ""} ${Object.values(r.facets).flat().join(" ")} ${Object.values(r.cols).map((v) => cellText(v)).join(" ")}`.toLowerCase().includes(needle)) return false;
    for (const f of allFacets) {
      if (f.key === skip) continue;
      const want = sel[f.key]; if (!want || !want.length) continue;
      if (!want.some((w) => facetVals(r, f.key).includes(w))) return false;
    }
    return true;
  };

  const filtered = useMemo(() => {
    const list = rows.filter((r) => matches(r));
    const statusIdx = (s?: string) => { const i = STATUS_ORDER.indexOf(s ?? ""); return i < 0 ? 99 : i; };
    list.sort((a, b) => {
      let d = 0;
      if (sort.key === "name") d = a.name.localeCompare(b.name);
      else if (sort.key === "status") d = statusIdx(a.status) - statusIdx(b.status);
      else if (a.sortKeys && b.sortKeys && sort.key in a.sortKeys) d = (a.sortKeys[sort.key] ?? 0) - (b.sortKeys[sort.key] ?? 0);
      else d = cellText(a.cols[sort.key]).localeCompare(cellText(b.cols[sort.key]));
      return sort.dir * d || (b.tie ?? 0) - (a.tie ?? 0) || a.name.localeCompare(b.name);
    });
    return list;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, q, sel, sort]);

  /** Options per facet, counted over rows that pass every other filter (so counts answer "what happens if I pick this?"). */
  const options = useMemo(() => {
    const out: Record<string, { value: string; label: string; count: number; icon?: React.ReactNode }[]> = {};
    for (const f of allFacets) {
      const counts = new Map<string, number>();
      for (const r of rows) if (matches(r, f.key)) for (const v of facetVals(r, f.key)) counts.set(v, (counts.get(v) ?? 0) + 1);
      let arr = [...counts.entries()];
      arr = f.order ? arr.sort((a, b) => (f.order!.indexOf(a[0]) + 1 || 999) - (f.order!.indexOf(b[0]) + 1 || 999)) : arr.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
      const dot = (v: string) => { let h = 0; for (const ch of v) h = (h * 31 + ch.charCodeAt(0)) % 360; return <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ background: `hsl(${h} 55% 55%)` }} />; };
      out[f.key] = arr.map(([v, n]) => ({ value: v, label: f.key === "status" ? statusText(v) : v, count: n, icon: COUNTRY_FACETS.has(f.key) ? flagFor(v) || undefined : f.key === "status" ? <span className={`inline-block h-2.5 w-2.5 rounded-full ${statusClass(v).split(" ").find((c) => c.startsWith("bg-")) ?? "bg-foreground/30"}`} /> : ["type","group","stage","severity","maturity","modality","access","scope","category","class","kind","actor","cost","front","specialism","license","nci","phase"].includes(f.key) ? dot(v) : undefined }));
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, q, sel, lang]);

  const onSort = (key: string) => setSort((s) => (s.key === key ? { key, dir: s.dir === 1 ? -1 : 1 } : { key, dir: 1 }));
  const active = Object.values(sel).some((a) => a.length) || q;
  /** Changes whenever the URL-backed state changes; SaveViewButton re-checks the saved list on it. */
  const stateKey = JSON.stringify([sel, q, sort]);
  /** The filtered rows as flat records for CSV/JSON: identity, status, every facet, every column as text. */
  const exportRows = (): CsvRow[] => filtered.map((r) => {
    const row: CsvRow = { id: r.id, name: r.name };
    if (!hideStatus) row.status = r.status ? STATUS_LABEL[r.status] ?? r.status : "";
    if (r.sub) row.sub = r.sub;
    row.tldr = r.tldr;
    row.url = typeof window === "undefined" ? r.route : new URL(r.route, window.location.origin).toString();
    for (const f of facets) row[f.key] = (r.facets[f.key] ?? []).join("; ");
    for (const c of columns) row[c.key] = cellText(r.cols[c.key]);
    return row;
  });

  /** A facet chip: a button that filters the table by that value, with a tooltip saying so. */
  const facetChip = (f: FacetLink, extraTip?: string, className?: string) => {
    const label = itemLabel(f);
    const fl = facetLabel(f.facet);
    const on = (sel[f.facet] ?? []).includes(f.value);
    const action = on ? t("table.filteringBy", { facet: fl, value: label }) : t("table.filterBy", { facet: fl, value: label });
    const tip = [f.tip, extraTip, action].filter(Boolean).join(" ");
    const tone = valueTone(f.facet, label);
    const look = className ? `${className} ${on ? "ring-2 ring-accent/50" : ""}` : tone ? `${tone} ${on ? "ring-2 ring-accent/50" : "hover:ring-2 hover:ring-accent/30"}` : on ? "bg-accent-soft text-accent border-accent" : "bg-foreground/5 hover:bg-accent-soft hover:text-accent";
    return (
      <Tip title={label} text={tip}>
        <button type="button" onClick={() => clickFacet(f)} aria-label={t("table.filterBy", { facet: fl, value: label })} aria-pressed={on}
          className={`chip cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/40 inline-flex items-center gap-1 ${look}`}>
          <ValueIcon facet={f.facet} value={label} />{label}
        </button>
      </Tip>
    );
  };
  const entityLink = (l: LinkItem) => (l.tip
    ? <Tip title={l.label} text={l.tip} href={l.href}><Link href={l.href} className="hover:underline hover:text-foreground underline decoration-dotted decoration-foreground/25 underline-offset-[3px]">{l.label}</Link></Tip>
    : <Link href={l.href} className="hover:underline hover:text-foreground">{l.label}</Link>);

  const tableCols: Column<BrowserRow>[] = [
    { key: "name", label: t("name"), sortable: true, render: (r) => (
      <div className="min-w-[220px] flex items-start gap-2">
        {r.molecule && <MoleculeSlot drugId={r.molecule} modality={r.modality} name={r.name} className="h-10 w-10" />}
        {r.target && <TargetThumb target={r.target} route={r.route} />}
        {r.schematic && <TechThumb id={r.schematic.id} sections={r.schematic.sections} name={r.name} route={r.route} />}
        {r.term && <TermThumb category={r.term.category} name={r.name} route={r.route} />}
        {r.sectionIcon && <Link href={r.route} aria-label={`${r.name} front icon`} className="inline-flex h-10 w-14 shrink-0 items-center justify-center rounded-md border border-border bg-accent-soft text-accent"><FrontIcon id={r.sectionIcon} className="h-6 w-6" /></Link>}
        {r.cancerIcon && <Link href={r.route} aria-label={`${r.name} organ icon`} className="inline-flex h-10 w-14 shrink-0 items-center justify-center rounded-md border border-border bg-accent-soft text-accent"><CancerIcon cancerId={r.cancerIcon} className="h-7 w-7" /></Link>}
        {(r.logo || r.avatar) && !r.molecule && <RowAvatar src={r.logo} name={r.name} round={r.round || r.avatar === "person"} />}
        <div><Link href={r.route} data-row className="font-medium hover:underline">{r.name}</Link>{r.sub && <div className="text-xs text-muted">{r.sub}</div>}{!hideTldr && <div className="text-xs text-muted line-clamp-2 max-w-lg">{tldrFor(r.id, r.tldr, lang, tldrTable)}</div>}</div>
      </div>) },
    ...(hideStatus ? [] : [{ key: "status", label: "Phase / status", sortable: true, render: (r: BrowserRow) => r.molecule
      ? <ApprovalChip drugId={r.molecule} status={r.status} />
      : r.status ? facetChip({ facet: "status", value: r.status, label: statusText(r.status) }, STATUS_TIPS[r.status], statusClass(r.status)) : null } as Column<BrowserRow>]),
    ...columns.map((c): Column<BrowserRow> => ({
      key: c.key, label: c.label, sortable: c.sortable, hide: c.hide, className: c.className, tip: c.tip,
      render: (r) => {
        const v = r.cols[c.key];
        if (v === undefined || v === "" || (Array.isArray(v) && v.length === 0)) return <span className="text-muted"><span aria-hidden>-</span><span className="sr-only">{t("none")}</span></span>;
        if (isRich(v)) {
          const parts: React.ReactNode[] = []; let pos = 0;
          v.marks.forEach((m, i) => { if (m.s > pos) parts.push(v.text.slice(pos, m.s)); parts.push(<Tip key={i} title={m.label} text={m.tip} href={m.href} linkLabel="Glossary page →"><Link href={m.href} className="underline decoration-dotted decoration-foreground/30 underline-offset-[3px] hover:text-foreground">{v.text.slice(m.s, m.e)}</Link></Tip>); pos = m.e; });
          if (pos < v.text.length) parts.push(v.text.slice(pos));
          return <span className="text-muted">{parts}</span>;
        }
        if (isFacetLink(v)) return facetChip(v, c.valueTips?.[itemLabel(v)]);
        if (Array.isArray(v)) {
          const allChips = v.every((i) => !("href" in i));
          return <span className={allChips ? "inline-flex flex-wrap gap-1" : `text-muted ${c.numeric ? "tabular-nums" : ""}`}>{v.map((l, i) => "href" in l
            ? <span key={`l:${l.href}`}>{i > 0 && ", "}{entityLink(l)}</span>
            : <span key={`f:${l.facet}:${l.value}`}>{i > 0 && !allChips && ", "}{facetChip(l, c.valueTips?.[itemLabel(l)])}</span>)}</span>;
        }
        const vt = c.valueTips?.[String(v)];
        const cell = c.chip ? <span className={`chip inline-flex items-center gap-1 ${valueTone(c.key, String(v)) ?? "bg-foreground/5"}`}><ValueIcon facet={c.key} value={String(v)} />{v}</span> : <span className={`text-muted ${c.numeric ? "tabular-nums" : ""}`}>{v}</span>;
        return vt ? <Tip title={String(v)} text={vt}><span className="cursor-help">{cell}</span></Tip> : cell;
      },
    })),
  ];

  return (
    <div ref={root}>
      <Toolbar
        count={filtered.length} total={rows.length} noun={noun}
        left={<>
          {allFacets.map((f) => {
            const opts = options[f.key] ?? [];
            if (!opts.length && !(sel[f.key]?.length)) return null;
            return <FacetSelect key={f.key} label={f.label} options={opts} value={sel[f.key] ?? []} onChange={(v) => setFacet(f.key, v as string[])} multi searchable={f.searchable ?? true} allLabel="Any" width={f.width ?? "w-48"} />;
          })}
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={`${t("table.filterNoun", { noun: nounText(noun) })}…`} aria-label={t("table.filterNoun", { noun: nounText(noun) })} className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-accent/40 w-56" />
          {active ? <button type="button" onClick={clearAll} className="text-sm underline text-muted">{t("clear")}</button> : null}
        </>}
        right={<>
          <SaveViewButton noun={noun} count={filtered.length} stateKey={stateKey} />
          <DownloadTable rows={exportRows} name={noun} />
        </>}
      />
      <ResultsTable columns={tableCols} rows={filtered} rowKey={(r) => r.id} sort={sort} onSort={onSort} pageSize={100} />
    </div>
  );
}

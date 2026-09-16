/**
 * Universe lists: what exists in the world, so OnCo can say how much of it is covered.
 *
 * Each source below is a public list or count with a stable URL. The script snapshots it into
 * src/data/universe-lists/<name>.json with the same envelope every time:
 *
 *   { checked, source: { label, url }, method, total, items? , ...extras }
 *
 * `total` is the denominator used by src/data/universe.ts; `items` (when the source is a list rather
 * than a count) is what src/lib/completeness.ts diffs against the corpus to name the missing entries.
 * A source that cannot be reached leaves its previous snapshot untouched, so a bad week never zeroes
 * a denominator. Nothing here is invented: every number is parsed from the page or API named in
 * `source.url`, and `method` says how.
 *
 * Run: npm run fetch:universe            Weekly via .github/workflows/refresh-universe.yml.
 * Only one source:  npm run fetch:universe -- --only=nci-cancer-drugs,ctgov
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { FDA_OCE_URL, decodeEntities, getJson, getText, parseOcePage, sleep, stripTags, today } from "./feed-utils";

const OUT_DIR = join(process.cwd(), "src", "data", "universe-lists");
const ONLY = process.argv.find((a) => a.startsWith("--only="))?.slice(7).split(",").filter(Boolean);

export type Envelope<T = unknown> = {
  checked: string;
  source: { label: string; url: string };
  method: string;
  total: number;
  items?: T[];
} & Record<string, unknown>;

const errors: string[] = [];
const uniq = <T,>(a: T[]) => [...new Set(a)];
const clean = (s: string) => decodeEntities(stripTags(s)).replace(/\s+/g, " ").trim();

function save(name: string, data: Envelope): void {
  mkdirSync(OUT_DIR, { recursive: true });
  writeFileSync(join(OUT_DIR, `${name}.json`), JSON.stringify(data, null, 1) + "\n");
  console.log(`universe: ${name}: total ${data.total}${data.items ? ` (${data.items.length} items)` : ""}`);
}

function previous(name: string): Envelope | null {
  const p = join(OUT_DIR, `${name}.json`);
  if (!existsSync(p)) return null;
  try { return JSON.parse(readFileSync(p, "utf8")) as Envelope; } catch { return null; }
}

/** Run one source. On failure keep the previous snapshot and record the error. */
async function source(name: string, run: () => Promise<Envelope | null>): Promise<void> {
  if (ONLY && !ONLY.includes(name)) return;
  try {
    const data = await run();
    if (!data) throw new Error("no data");
    if (data.total <= 0) throw new Error("parsed zero");
    save(name, data);
  } catch (e) {
    const msg = `${name}: ${(e as Error).message}`;
    errors.push(msg);
    console.warn(`universe: FAILED ${msg}; keeping previous snapshot${previous(name) ? "" : " (none exists)"}`);
  }
}

// ---------------------------------------------------------------------------------------------------
// Drugs: NCI "A to Z List of Cancer Drugs" (FDA-approved cancer drugs, brand names and combinations).
// ---------------------------------------------------------------------------------------------------
const NCI_AZ_URL = "https://www.cancer.gov/about-cancer/treatment/drugs/cancer-drugs";
export type NciDrug = { slug: string; url: string; names: string[] };

export function parseNciDrugs(html: string): { items: NciDrug[]; entries: number } {
  const bySlug = new Map<string, Set<string>>();
  let entries = 0;
  for (const m of html.matchAll(/<a[^>]*href="\/about-cancer\/treatment\/drugs\/([a-z0-9-]+)"[^>]*data-entity-type="node"[^>]*>([\s\S]*?)<\/a>/g)) {
    const name = clean(m[2]);
    if (!name) continue;
    entries++;
    const set = bySlug.get(m[1]) ?? new Set<string>();
    set.add(name);
    bySlug.set(m[1], set);
  }
  const items = [...bySlug].map(([slug, names]) => ({ slug, url: `https://www.cancer.gov/about-cancer/treatment/drugs/${slug}`, names: [...names].sort((a, b) => (a.includes("(") ? 1 : 0) - (b.includes("(") ? 1 : 0) || a.localeCompare(b)) }));
  items.sort((a, b) => a.names[0].localeCompare(b.names[0]));
  return { items, entries };
}

async function nciDrugs(): Promise<Envelope<NciDrug> | null> {
  const html = await getText(NCI_AZ_URL, { accept: "text/html" });
  if (!html) return null;
  const { items, entries } = parseNciDrugs(html);
  return {
    checked: today(), source: { label: "NCI: A to Z List of Cancer Drugs", url: NCI_AZ_URL },
    method: "Every link in the A to Z list that points to a drug page; brand-name entries that point to the same page as the generic are folded into one item, so the total is distinct drug pages (single agents and named combinations).",
    total: items.length, entries, items,
  };
}

// ---------------------------------------------------------------------------------------------------
// Cancer types: NCI "A to Z List of Cancer Types" and the GLOBOCAN 2022 site list.
// ---------------------------------------------------------------------------------------------------
const NCI_TYPES_URL = "https://www.cancer.gov/types";
export type NciType = { name: string; link: string };

export function parseNciTypes(html: string): NciType[] {
  const seen = new Map<string, NciType>();
  for (const m of html.matchAll(/<option value="([^"]+)" data-link="([^"]+)"/g)) {
    const name = clean(m[1]);
    if (!seen.has(name)) seen.set(name, { name, link: `https://www.cancer.gov${m[2]}` });
  }
  return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name));
}

async function nciTypes(): Promise<Envelope<NciType> | null> {
  const html = await getText(NCI_TYPES_URL, { accept: "text/html" });
  if (!html) return null;
  const items = parseNciTypes(html);
  return {
    checked: today(), source: { label: "NCI: A to Z List of Cancer Types", url: NCI_TYPES_URL },
    method: "Every entry in the 'Find a cancer type' A to Z list (distinct names; several names can share one NCI page).",
    total: items.length, pages: uniq(items.map((i) => i.link)).length, items,
  };
}

type MetaCancer = { cancer: number; label: string; ICD: string; cancer_order: number };
export type GlobocanSite = { code: number; label: string; icd: string };
async function globocanSites(): Promise<Envelope<GlobocanSite> | null> {
  const url = "https://gco-api.iarc.fr/api/globocan/v3/2022/meta/cancers/all/";
  const meta = await getJson<MetaCancer[]>(url);
  if (!meta || !Array.isArray(meta)) return null;
  const items = meta.filter((c) => c.cancer >= 1 && c.cancer <= 36).map((c) => ({ code: c.cancer, label: c.label.trim(), icd: c.ICD })).sort((a, b) => a.code - b.code);
  return {
    checked: today(), source: { label: "IARC Global Cancer Observatory: GLOBOCAN 2022", url: "https://gco.iarc.who.int/today" },
    method: "The 36 cancer sites GLOBOCAN 2022 estimates (codes 1 to 36 from the GCO metadata API; the aggregate codes 37 to 41 are excluded).",
    total: items.length, items,
  };
}

// ---------------------------------------------------------------------------------------------------
// Institutions: NCI-designated cancer centres, OECI members, NHS England cancer alliances, UICC members.
// ---------------------------------------------------------------------------------------------------
const NCI_CENTERS_URL = "https://www.cancer.gov/research/infrastructure/cancer-centers/find";
export type NciCenter = { slug: string; name: string; url: string; website?: string };

export function parseNciCenters(html: string): Array<Pick<NciCenter, "slug" | "name" | "url">> {
  const seen = new Map<string, Pick<NciCenter, "slug" | "name" | "url">>();
  for (const m of html.matchAll(/<a[^>]*href="[^"]*cancer-centers\/find\/([a-z0-9-]+)"[^>]*>([\s\S]*?)<\/a>/g)) {
    const name = clean(m[2]);
    if (!name || seen.has(m[1])) continue;
    seen.set(m[1], { slug: m[1], name, url: `https://www.cancer.gov/research/infrastructure/cancer-centers/find/${m[1]}` });
  }
  return [...seen.values()].sort((a, b) => a.name.localeCompare(b.name));
}

async function nciCenters(): Promise<Envelope<NciCenter> | null> {
  const html = await getText(NCI_CENTERS_URL, { accept: "text/html" });
  if (!html) return null;
  const base = parseNciCenters(html);
  if (base.length < 50) throw new Error(`only ${base.length} centres parsed`);
  const prev = new Map(((previous("nci-cancer-centers")?.items as NciCenter[] | undefined) ?? []).map((c) => [c.slug, c.website]));
  const items: NciCenter[] = [];
  for (const c of base) {
    let website = prev.get(c.slug);
    const page = await getText(c.url, { accept: "text/html", tries: 2 });
    const m = page?.match(/class="cgdp-profile-box__website-url"[^>]*href="([^"]+)"/) ?? page?.match(/href="([^"]+)"[^>]*class="cgdp-profile-box__website-url"/);
    if (m) website = m[1];
    items.push(website ? { ...c, website } : c);
    await sleep(200);
  }
  return {
    checked: today(), source: { label: "NCI: Find a Cancer Center", url: NCI_CENTERS_URL },
    method: "Every centre profile linked from the NCI 'Find a Cancer Center' page (one entry per centre, even when a centre is listed in several states); the website comes from each profile page.",
    total: items.length, items,
  };
}

const OECI_URL = "https://www.oeci.eu/MemberList.aspx";
export type OeciMember = { id: string; name: string; altName?: string; country: string; website?: string; membership: string; leaders: string[] };

export function parseOeci(html: string): OeciMember[] {
  const countries: Array<{ pos: number; name: string }> = [];
  for (const m of html.matchAll(/<div class='sections col-12' id='([^']+)'/g)) countries.push({ pos: m.index ?? 0, name: m[1].replace(/_/g, " ") });
  const heads = [...html.matchAll(/id="ContentPlaceHolder1_(ctl\d+)_lblTit"[^>]*>([\s\S]*?)<\/span>/g)];
  const out: OeciMember[] = [];
  for (let i = 0; i < heads.length; i++) {
    const h = heads[i];
    const start = h.index ?? 0;
    const end = i + 1 < heads.length ? (heads[i + 1].index ?? html.length) : Math.min(html.length, start + 20000);
    const block = html.slice(start, end);
    const pre = h[1];
    const name = clean(h[2]);
    if (!name) continue;
    const alt = block.match(new RegExp(`id="ContentPlaceHolder1_${pre}_lblStTit"[^>]*>([\\s\\S]*?)</span>`))?.[1];
    const id = block.match(new RegExp(`id="ContentPlaceHolder1_${pre}_lbl_ID">([^<]*)<`))?.[1]?.trim() ?? "";
    const membership = block.match(new RegExp(`id="ContentPlaceHolder1_${pre}_lbl_tipoMember"[^>]*>([^<]*)<`))?.[1]?.trim() ?? "Member";
    const website = block.match(/<a class='text-decoration-none text-warning' href='([^']+)'/)?.[1]?.trim();
    const dirBlock = block.match(new RegExp(`id="ContentPlaceHolder1_${pre}_lblDirectors"[^>]*>([\\s\\S]*?)</span>`))?.[1] ?? "";
    const leaders = uniq([...dirBlock.matchAll(/<b>([^<]+)<\/b>/g)].map((m) => clean(m[1])).filter(Boolean));
    let country = "";
    for (const c of countries) if (c.pos < start) country = c.name;
    const altName = alt ? clean(alt) : undefined;
    out.push({ id, name, altName: altName && altName !== name ? altName : undefined, country, website, membership, leaders });
  }
  return out;
}

async function oeci(): Promise<Envelope<OeciMember> | null> {
  const html = await getText(OECI_URL, { accept: "text/html" });
  if (!html) return null;
  const items = parseOeci(html);
  const byType: Record<string, number> = {};
  for (const i of items) byType[i.membership] = (byType[i.membership] ?? 0) + 1;
  return {
    checked: today(), source: { label: "OECI: Member Profiles", url: OECI_URL },
    method: "Every member profile on the Organisation of European Cancer Institutes member list (full, associate and corresponding members), with the leaders named on each profile.",
    total: items.length, byMembership: byType, items,
  };
}

const NHS_URL = "https://www.england.nhs.uk/cancer/cancer-alliances-improving-care-locally/";
export type NhsAlliance = { name: string; website: string };

export function parseNhsAlliances(html: string): NhsAlliance[] {
  const start = html.search(/Map of Cancer Alliances/i);
  const region = start >= 0 ? html.slice(start) : html;
  const ol = region.match(/<ol[^>]*>([\s\S]*?)<\/ol>/)?.[1] ?? "";
  const out: NhsAlliance[] = [];
  for (const m of ol.matchAll(/<li[^>]*>\s*<a[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g)) {
    const name = clean(m[2]);
    if (name) out.push({ name, website: m[1] });
  }
  return out;
}

async function nhsAlliances(): Promise<Envelope<NhsAlliance> | null> {
  const html = await getText(NHS_URL, { accept: "text/html" });
  if (!html) return null;
  const items = parseNhsAlliances(html);
  return {
    checked: today(), source: { label: "NHS England: Cancer Alliances", url: NHS_URL },
    method: "The numbered list of Cancer Alliances under 'Map of Cancer Alliances in England' on the NHS England page.",
    total: items.length, items,
  };
}

async function uicc(): Promise<Envelope | null> {
  const url = "https://www.uicc.org/membership";
  const html = await getText(url, { accept: "text/html" });
  if (!html) return null;
  const text = clean(html);
  const m = text.match(/(\d[\d,]*)\s+member organisations?\s+in\s+(\d[\d,]*)\s+countries/i);
  if (!m) throw new Error("count phrase not found");
  return {
    checked: today(), source: { label: "UICC: Membership", url },
    method: "The member-organisation count stated on the UICC membership page (a round figure published by UICC, so approximate).",
    total: Number(m[1].replace(/,/g, "")), countries: Number(m[2].replace(/,/g, "")),
  };
}

// ---------------------------------------------------------------------------------------------------
// Journals: NLM Catalog, journals currently indexed for MEDLINE with the broad subject term Neoplasms.
// ---------------------------------------------------------------------------------------------------
export type NlmJournal = { nlmId: string; title: string; medlineTa?: string; issn: string[]; country?: string };
type EsearchJson = { esearchresult?: { count?: string; idlist?: string[] } };
type EsummaryJson = { result?: Record<string, { uid?: string; titlemainlist?: Array<{ title?: string }>; medlineta?: string; issnlist?: Array<{ issn?: string }>; country?: string }> };

async function nlmJournals(): Promise<Envelope<NlmJournal> | null> {
  const term = "neoplasms[st] AND currentlyindexed[All]";
  const search = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=nlmcatalog&term=${encodeURIComponent(term)}&retmode=json&retmax=1000`;
  const es = await getJson<EsearchJson>(search);
  const ids = es?.esearchresult?.idlist ?? [];
  if (!ids.length) return null;
  const items: NlmJournal[] = [];
  for (let i = 0; i < ids.length; i += 100) {
    const chunk = ids.slice(i, i + 100);
    const sm = await getJson<EsummaryJson>(`https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi?db=nlmcatalog&id=${chunk.join(",")}&retmode=json`);
    for (const id of chunk) {
      const r = sm?.result?.[id];
      if (!r) continue;
      const title = (r.titlemainlist?.[0]?.title ?? "").replace(/\.\s*$/, "").trim();
      if (!title) continue;
      items.push({ nlmId: id, title, medlineTa: r.medlineta || undefined, issn: uniq((r.issnlist ?? []).map((x) => x.issn ?? "").filter(Boolean)), country: r.country || undefined });
    }
    await sleep(400);
  }
  items.sort((a, b) => a.title.localeCompare(b.title));
  return {
    checked: today(), source: { label: "NLM Catalog: journals currently indexed for MEDLINE, broad subject term Neoplasms", url: `https://www.ncbi.nlm.nih.gov/nlmcatalog?term=${encodeURIComponent(term)}` },
    method: "E-utilities esearch on the NLM Catalog for 'neoplasms[st] AND currentlyindexed[All]' (the MEDLINE broad subject term for cancer journals), then esummary for titles and ISSNs.",
    total: Number(es?.esearchresult?.count ?? items.length), items,
  };
}

// ---------------------------------------------------------------------------------------------------
// Key papers: the 100 most-cited works whose primary OpenAlex topic is in the Oncology subfield.
// ---------------------------------------------------------------------------------------------------
export type OpenAlexWork = { id: string; doi?: string; title: string; year: number; cited: number };
type OaJson = { meta?: { count?: number }; results?: Array<{ id: string; doi?: string | null; display_name: string; publication_year: number; cited_by_count: number }> };

async function openalexTop(): Promise<Envelope<OpenAlexWork> | null> {
  const url = "https://api.openalex.org/works?filter=primary_topic.subfield.id:subfields/2730&sort=cited_by_count:desc&per-page=100&select=id,doi,display_name,publication_year,cited_by_count";
  const j = await getJson<OaJson>(url);
  if (!j?.results?.length) return null;
  const items = j.results.map((r) => ({ id: r.id, doi: r.doi ? r.doi.replace(/^https?:\/\/doi\.org\//i, "").toLowerCase() : undefined, title: r.display_name, year: r.publication_year, cited: r.cited_by_count }));
  return {
    checked: today(), source: { label: "OpenAlex: most-cited works, subfield Oncology", url },
    method: "OpenAlex works filtered to primary_topic.subfield = Oncology (2730), sorted by citation count, first 100.",
    total: items.length, worksInSubfield: j.meta?.count, items,
  };
}

// ---------------------------------------------------------------------------------------------------
// Pathways: KEGG cancer pathway maps (BRITE br08901) and Reactome pathways matching "cancer".
// ---------------------------------------------------------------------------------------------------
export type KeggPathway = { id: string; name: string; group: "overview" | "specific" };

export function parseKeggCancer(text: string): KeggPathway[] {
  const out: KeggPathway[] = [];
  let group: KeggPathway["group"] | null = null;
  for (const line of text.split("\n")) {
    if (/^B\s+Cancer: overview/.test(line)) group = "overview";
    else if (/^B\s+Cancer: specific/.test(line)) group = "specific";
    else if (/^B/.test(line)) group = null;
    else if (group) {
      const m = line.match(/^C\s+(\d{5})\s+(.+?)\s*$/);
      if (m) out.push({ id: `hsa${m[1]}`, name: m[2], group });
    }
  }
  return out;
}

async function keggCancer(): Promise<Envelope<KeggPathway> | null> {
  const text = await getText("https://rest.kegg.jp/get/br:br08901", { accept: "text/plain" });
  if (!text) return null;
  const items = parseKeggCancer(text);
  return {
    checked: today(), source: { label: "KEGG PATHWAY: Human Diseases, Cancer", url: "https://www.genome.jp/kegg/pathway.html#disease" },
    method: "Maps listed under 'Cancer: overview' and 'Cancer: specific types' in KEGG BRITE br08901 (pathway map hierarchy), via the KEGG REST API.",
    total: items.length, items,
  };
}

async function reactomeCancer(): Promise<Envelope | null> {
  const url = "https://reactome.org/ContentService/search/query?query=cancer&species=Homo%20sapiens&types=Pathway&cluster=true";
  const j = await getJson<{ results?: Array<{ typeName: string; entriesCount: number }> }>(url);
  const n = j?.results?.find((r) => r.typeName === "Pathway")?.entriesCount;
  if (!n) return null;
  return {
    checked: today(), source: { label: "Reactome: pathways matching 'cancer' (human)", url: "https://reactome.org/content/query?q=cancer&species=Homo+sapiens&types=Pathway" },
    method: "Reactome ContentService search for 'cancer', species Homo sapiens, type Pathway; the number of matching pathways. A text search, so approximate.",
    total: n,
  };
}

// ---------------------------------------------------------------------------------------------------
// Terms: NCI Dictionary of Cancer Terms, total number of terms (patient dictionary, English).
// ---------------------------------------------------------------------------------------------------
async function nciDictionary(): Promise<Envelope | null> {
  const url = "https://webapis.cancer.gov/glossary/v1/Terms/count/Cancer.gov/Patient/en";
  const text = await getText(url, { accept: "application/json" });
  const n = Number(text?.trim());
  if (!Number.isFinite(n) || n <= 0) return null;
  return {
    checked: today(), source: { label: "NCI Dictionary of Cancer Terms", url: "https://www.cancer.gov/publications/dictionaries/cancer-terms" },
    method: "The term count returned by the NCI glossary API for the English patient dictionary.",
    total: n,
  };
}

// ---------------------------------------------------------------------------------------------------
// Trials and companies: ClinicalTrials.gov v2 counts and industry lead sponsors of phase 3 cancer trials.
// ---------------------------------------------------------------------------------------------------
type CtCount = { totalCount?: number; nextPageToken?: string; studies?: Array<{ protocolSection?: { identificationModule?: { nctId?: string }; sponsorCollaboratorsModule?: { leadSponsor?: { name?: string; class?: string } } } }> };
const CT = "https://clinicaltrials.gov/api/v2/studies?query.cond=cancer";
const INTERVENTIONAL = "AREA%5BStudyType%5DINTERVENTIONAL";

async function ctCount(extra: string): Promise<number> {
  const j = await getJson<CtCount>(`${CT}&${extra}&countTotal=true&pageSize=1&fields=NCTId`);
  if (typeof j?.totalCount !== "number") throw new Error(`ClinicalTrials.gov count failed for ${extra}`);
  return j.totalCount;
}

export type CtSponsor = { name: string; studies: number };
async function ctgov(): Promise<Envelope | null> {
  const interventional = await ctCount(`filter.advanced=${INTERVENTIONAL}`);
  await sleep(300);
  const phase3 = await ctCount(`filter.advanced=${INTERVENTIONAL}%20AND%20AREA%5BPhase%5DPHASE3`);
  await sleep(300);
  const recruiting = await ctCount(`filter.advanced=${INTERVENTIONAL}&filter.overallStatus=RECRUITING`);
  await sleep(300);
  // Industry lead sponsors of phase 3 interventional cancer trials.
  const counts = new Map<string, number>();
  let token: string | undefined;
  let studies = 0;
  for (let page = 0; page < 30; page++) {
    const url = `${CT}&filter.advanced=${INTERVENTIONAL}%20AND%20AREA%5BPhase%5DPHASE3%20AND%20AREA%5BLeadSponsorClass%5DINDUSTRY&pageSize=1000&fields=NCTId,LeadSponsorName,LeadSponsorClass${token ? `&pageToken=${token}` : ""}`;
    const j = await getJson<CtCount>(url);
    if (!j?.studies) break;
    for (const s of j.studies) {
      const name = s.protocolSection?.sponsorCollaboratorsModule?.leadSponsor?.name?.trim();
      if (!name) continue;
      studies++;
      counts.set(name, (counts.get(name) ?? 0) + 1);
    }
    token = j.nextPageToken;
    if (!token) break;
    await sleep(400);
  }
  const sponsors: CtSponsor[] = [...counts].map(([name, n]) => ({ name, studies: n })).sort((a, b) => b.studies - a.studies || a.name.localeCompare(b.name));
  return {
    checked: today(), source: { label: "ClinicalTrials.gov: interventional studies, condition 'cancer'", url: "https://clinicaltrials.gov/search?cond=cancer&aggFilters=studyType:int" },
    method: "ClinicalTrials.gov API v2 with query.cond=cancer and countTotal=true: interventional studies; of those, phase 3; of those, recruiting. Sponsors: distinct lead sponsor names (class INDUSTRY) across all phase 3 interventional cancer studies, so subsidiaries and name variants count separately.",
    total: interventional, phase3, recruiting, industryPhase3: { studies, sponsors: sponsors.length }, items: sponsors,
  };
}

export type OceSponsor = { name: string; approvals: number; first: string; last: string };
const SUFFIX_ONLY = /^(Inc|LLC|Ltd|Corp|Co|GmbH|LP|plc|SA|AG|Limited|Corporation|Company)\.?$/i;
/**
 * The sponsor named in brackets after the drug in an OCE notification:
 *   "approved daraxonrasib (RASONQUE, Revolution Medicines, Inc.), an inhibitor" -> "Revolution Medicines, Inc."
 *   "approved penpulimab-kcqx (Akeso Biopharma Co., Ltd.) with"                  -> "Akeso Biopharma Co., Ltd."
 *   "approval to adagrasib (Krazati; Mirati Therapeutics, Inc.) plus"            -> "Mirati Therapeutics, Inc."
 *   "sunvozertinib (Zegfrovy, Dizal (Jiangsu) Pharmaceutical Co., Ltd.)"          -> "Dizal (Jiangsu) Pharmaceutical Co., Ltd."
 * Returns undefined for notices that are not approvals (labelling communications).
 */
export function sponsorFromOceSummary(summary: string): string | undefined {
  if (!/approv|authoriz|clear/i.test(summary)) return undefined;
  const m = summary.match(/\(((?:[^()]|\([^()]*\))*)\)/);
  if (!m) return undefined;
  let content = m[1].trim();
  // "(melphalan ... System (Hepzato Kit, Delcath Systems, Inc.))": the sponsor is in the inner bracket at the end.
  const inner = content.match(/\(([^()]*,[^()]*)\)\s*$/);
  if (inner) content = inner[1].trim();
  if (content.includes(";")) content = content.split(";").pop()!.trim();
  const comma = content.indexOf(",");
  if (comma < 0) return content.length >= 3 && !/^[A-Z0-9-]+$/.test(content) ? content : undefined; // "(Keytruda, Merck)" always has a comma; a bare brand is not a sponsor
  const first = content.slice(0, comma).trim();
  const rest = content.slice(comma + 1).trim();
  // "(Akeso Biopharma Co., Ltd.)": the first segment is the company and the rest is only a suffix.
  const name = SUFFIX_ONLY.test(rest) ? `${first}, ${rest}` : rest;
  return name || undefined;
}

async function fdaOceSponsors(): Promise<Envelope<OceSponsor> | null> {
  const html = await getText(FDA_OCE_URL, { accept: "text/html" });
  if (!html) return null;
  const items = parseOcePage(html);
  if (!items.length) return null;
  const by = new Map<string, OceSponsor>();
  for (const it of items) {
    const name = sponsorFromOceSummary(it.summary);
    if (!name) continue;
    const key = name.toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\b(inc|llc|ltd|corporation|corp|company|co|gmbh|lp|plc|sa|ag|limited|usa|us|u s)\b/g, "").replace(/\s+/g, " ").trim();
    const cur = by.get(key);
    if (cur) { cur.approvals++; cur.first = it.date < cur.first ? it.date : cur.first; cur.last = it.date > cur.last ? it.date : cur.last; }
    else by.set(key, { name, approvals: 1, first: it.date, last: it.date });
  }
  const out = [...by.values()].sort((a, b) => b.approvals - a.approvals || a.name.localeCompare(b.name));
  const dates = items.map((i) => i.date).sort();
  return {
    checked: today(), source: { label: "FDA Oncology Center of Excellence: approval notifications", url: FDA_OCE_URL },
    method: "Sponsor named in brackets in each FDA OCE oncology approval notification on the current page, grouped after removing corporate suffixes. Covers the notifications the page still lists (see window), so it is a floor for 'companies with a recent FDA oncology approval'.",
    total: out.length, notifications: items.length, window: { from: dates[0], to: dates[dates.length - 1] }, items: out,
  };
}

// ---------------------------------------------------------------------------------------------------
// Targets: ChEMBL, distinct mechanism-of-action targets of approved drugs with an oncology indication.
// ---------------------------------------------------------------------------------------------------
const CHEMBL = "https://www.ebi.ac.uk/chembl/api/data";
const ONCO_MESH = ["Neoplasm", "Carcinoma", "Leukemia", "Lymphoma", "Myeloma", "Melanoma", "Sarcoma", "Glioma", "Glioblastoma", "Tumor", "Cancer", "Mesothelioma", "Blastoma", "Adenoma"];
type IndicationJson = { page_meta?: { total_count?: number; next?: string | null }; drug_indications?: Array<{ molecule_chembl_id: string; parent_molecule_chembl_id?: string; mesh_heading?: string }> };
type MechanismJson = { mechanisms?: Array<{ molecule_chembl_id: string; target_chembl_id?: string | null; action_type?: string | null }> };
type TargetJson = { targets?: Array<{ target_chembl_id: string; pref_name: string; target_type: string; target_components?: Array<{ target_component_synonyms?: Array<{ component_synonym: string; syn_type: string }> }> }> };
export type ChemblTarget = { id: string; name: string; type: string; symbols: string[]; drugs: number; url: string };

async function chemblTargets(): Promise<Envelope<ChemblTarget> | null> {
  const molecules = new Set<string>();
  for (const term of ONCO_MESH) {
    for (let offset = 0; offset < 20000; offset += 1000) {
      const j = await getJson<IndicationJson>(`${CHEMBL}/drug_indication.json?max_phase_for_ind=4&mesh_heading__icontains=${term}&limit=1000&offset=${offset}`);
      if (!j?.drug_indications) break;
      for (const d of j.drug_indications) molecules.add(d.parent_molecule_chembl_id || d.molecule_chembl_id);
      if (!j.page_meta?.next) break;
      await sleep(300);
    }
    await sleep(300);
  }
  if (molecules.size < 100) throw new Error(`only ${molecules.size} oncology molecules`);
  const mols = [...molecules];
  const byTarget = new Map<string, Set<string>>();
  for (let i = 0; i < mols.length; i += 40) {
    const j = await getJson<MechanismJson>(`${CHEMBL}/mechanism.json?molecule_chembl_id__in=${mols.slice(i, i + 40).join(",")}&limit=1000`);
    for (const m of j?.mechanisms ?? []) {
      if (!m.target_chembl_id) continue;
      const s = byTarget.get(m.target_chembl_id) ?? new Set<string>();
      s.add(m.molecule_chembl_id);
      byTarget.set(m.target_chembl_id, s);
    }
    await sleep(300);
  }
  const ids = [...byTarget.keys()];
  const items: ChemblTarget[] = [];
  for (let i = 0; i < ids.length; i += 40) {
    const j = await getJson<TargetJson>(`${CHEMBL}/target.json?target_chembl_id__in=${ids.slice(i, i + 40).join(",")}&limit=1000`);
    for (const t of j?.targets ?? []) {
      const symbols = uniq((t.target_components ?? []).flatMap((c) => (c.target_component_synonyms ?? []).filter((s) => s.syn_type === "GENE_SYMBOL").map((s) => s.component_synonym)));
      items.push({ id: t.target_chembl_id, name: t.pref_name, type: t.target_type, symbols, drugs: byTarget.get(t.target_chembl_id)?.size ?? 0, url: `https://www.ebi.ac.uk/chembl/explore/target/${t.target_chembl_id}` });
    }
    await sleep(300);
  }
  items.sort((a, b) => b.drugs - a.drugs || a.name.localeCompare(b.name));
  return {
    checked: today(), source: { label: "ChEMBL: mechanism targets of approved drugs with an oncology indication", url: "https://www.ebi.ac.uk/chembl/" },
    method: `ChEMBL API: drug indications with max_phase_for_ind=4 (approved) whose MeSH heading contains one of ${ONCO_MESH.join(", ")}; the distinct parent molecules' mechanisms of action; the distinct targets of those mechanisms, with gene symbols from the target components. Includes non-protein targets (DNA, tubulin) and drugs whose oncology indication is supportive.`,
    total: items.length, molecules: molecules.size, items,
  };
}

// ---------------------------------------------------------------------------------------------------

type EvenOneCompany = { name: string; website: string; tag: string };
const EVENONE_URL = "https://evenone.ventures/";
/** Even One Ventures embeds its portfolio as a JavaScript array (`companies = [...]`) in the page; parse it rather than the rendered tiles. */
function parseEvenOne(html: string): EvenOneCompany[] {
  const i = html.indexOf("companies = ["); if (i < 0) return [];
  const j = html.indexOf("];", i); const src = html.slice(i + "companies = ".length, j + 1);
  const arr = new Function("return " + src)() as Array<{ name?: string; url?: string; tag?: string }>;
  return arr.filter((c) => c && c.name).map((c) => ({ name: String(c.name).trim(), website: String(c.url ?? "").trim(), tag: String(c.tag ?? "").trim() }));
}
async function evenone(): Promise<Envelope<EvenOneCompany> | null> {
  const html = await getText(EVENONE_URL, { accept: "text/html" });
  if (!html) return null;
  const items = parseEvenOne(html);
  return {
    checked: today(), source: { label: "Even One Ventures: portfolio", url: EVENONE_URL },
    method: "The companies array embedded in the Even One Ventures home page (name, website and sector tag), read weekly so new portfolio companies surface on /completeness/.",
    total: items.length, items,
  };
}

async function main() {
  await source("nci-cancer-drugs", nciDrugs);
  await source("nci-cancer-types", nciTypes);
  await source("globocan-sites", globocanSites);
  await source("nci-cancer-centers", nciCenters);
  await source("oeci-members", oeci);
  await source("nhs-cancer-alliances", nhsAlliances);
  await source("evenone-portfolio", evenone);
  await source("uicc-members", uicc);
  await source("nlm-oncology-journals", nlmJournals);
  await source("openalex-top-oncology-papers", openalexTop);
  await source("kegg-cancer-pathways", keggCancer);
  await source("reactome-cancer-pathways", reactomeCancer);
  await source("nci-dictionary", nciDictionary);
  await source("ctgov-oncology", ctgov);
  await source("fda-oce-sponsors", fdaOceSponsors);
  await source("chembl-oncology-targets", chemblTargets);
  if (errors.length) {
    console.warn(`universe: ${errors.length} source(s) failed:\n  ${errors.join("\n  ")}`);
    if (errors.length >= 15) process.exit(1);
  }
}

if (process.argv[1]?.endsWith("fetch-universe.ts")) main();

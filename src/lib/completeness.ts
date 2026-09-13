/**
 * Completeness: OnCo's count against each external denominator in src/data/universe.ts.
 *
 * For every denominator this computes how many of the world's items are in the corpus, the coverage
 * percentage, and (when the source is a list) the items still missing, matched on the same scope as
 * the denominator: approved products against the NCI list of FDA-approved drugs, NCI centres against
 * institutions by website domain, journals by ISSN, papers by DOI, and so on. Matching is by
 * normalised names and identifiers, never fuzzy scoring, so a match can always be checked by hand.
 * Where a denominator has no list, "in OnCo" is simply the corpus count under that scope.
 */
import { graph, type Graph } from "./graph";
import { UNIVERSE, UNIVERSE_LISTS, type Denominator } from "@/data/universe";
import { GLOBOCAN_MAP } from "@/data/globocan-map";
import { regimens } from "@/data/regimens";
import type { Kind } from "./schema";

export type MissingItem = { name: string; url?: string; detail?: string };

export type Coverage = {
  den: Denominator;
  /** Items (or records) in OnCo under this scope. For list denominators, the number of listed items matched. */
  ours: number;
  /** Coverage percentage, one decimal, capped at 100. `null` when there is no denominator. */
  pct: number | null;
  /** Missing items, when the denominator has a list; sorted by importance where the list carries one. */
  missing: MissingItem[];
  /** True when `missing` names every gap (false for count-only denominators). */
  listed: boolean;
};

// ---------------------------------------------------------------------------------------------------
// Normalisation
// ---------------------------------------------------------------------------------------------------

/** Lowercase, no diacritics, US spellings, punctuation to spaces. "Acute lymphoblastic leukaemia" and "Acute Lymphoblastic Leukemia" agree. */
export function norm(s: string): string {
  return s
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/aemia/g, "emia").replace(/oesophag/g, "esophag").replace(/haemat/g, "hemat").replace(/paediat/g, "pediat").replace(/gynaec/g, "gynec").replace(/tumour/g, "tumor").replace(/oedema/g, "edema")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/** "Enhertu (fam-trastuzumab deruxtecan-nxki)" -> ["Enhertu", "fam-trastuzumab deruxtecan-nxki"]; "Gleolan / Gliolan" -> both. */
export function nameParts(s: string): string[] {
  const out: string[] = [];
  const outer = s.replace(/\s*\([^)]*\)\s*/g, " ").trim();
  if (outer) out.push(outer);
  for (const m of s.matchAll(/\(([^)]+)\)/g)) out.push(m[1].trim());
  return out.flatMap((p) => p.split(/\s*(?:\/|;|,\s(?=[A-Z]))\s*/)).map((p) => p.trim()).filter(Boolean);
}

const SALTS = /\b(acetate|hydrochloride|mesylate|maleate|malate|tartrate|citrate|sulfate|sulphate|phosphate|sodium|potassium|calcium|disodium|dimaleate|ditosylate|tosylate|fumarate|succinate|besylate|bromide|dihydrochloride|hydrobromide|for injection|injection|oral|tablets?|capsules?|liposomal|liposome|nanoparticle|albumin bound|albumin stabilized nanoparticle formulation)\b/g;
/** Drug keys: parts of the name, aliases, brands and codes, with and without salt words and FDA biologic suffixes. */
export function drugKeys(d: { name: string; aka: string[]; brand?: string; code?: string }): Set<string> {
  const raw = [...nameParts(d.name), ...d.aka.flatMap(nameParts), ...(d.brand ? nameParts(d.brand.replace(/\(generic\)/i, "")) : []), ...(d.code ? d.code.split(/\s*[,;]\s*/) : [])];
  return keysFrom(raw);
}

function keysFrom(raw: string[]): Set<string> {
  const keys = new Set<string>();
  for (const r of raw) {
    const n = norm(r.replace(/^fam-|^ado-/i, "").replace(/-[a-z]{4}$/, ""));
    if (n.length < 3 || /^(generic|and|the)$/.test(n)) continue;
    keys.add(n);
    const loose = n.replace(SALTS, " ").replace(/\s+/g, " ").trim();
    if (loose.length >= 3) keys.add(loose);
  }
  return keys;
}

const CORP = /\b(inc|llc|ltd|limited|corporation|corp|company|co|gmbh|lp|l l c|plc|sa|ag|nv|bv|ab|kk|kabushiki kaisha|holdings?|group|usa|us|u s|and|pharmaceuticals?|pharmaceutical|pharma|biopharma|biopharmaceuticals?|biotech|biotechnology|biologics|biosciences?|therapeutics|medicines?|medicine|oncology|research|development|r and d|international|global|healthcare|health|sciences?|laboratories|labs?|s p a|spa|srl|s r l|s a s|sas|se|kgaa|a s|ltda|pty|pte|dohme|sharp|a subsidiary of|a wholly owned subsidiary of|a [a-z ]+? company|operations|products)\b/g;
/** Well-known sponsor names that differ from the OnCo record name. Keys and values are stripped keys (see companyKey). */
const COMPANY_ALIASES: Record<string, string> = { glaxosmithkline: "gsk", "hoffmann la roche": "roche", "f hoffmann la roche": "roche", genentech: "roche", janssen: "johnson johnson", "msd": "merck", "merck sharp dohme": "merck", "merck sharp and dohme": "merck", "bristol myers squibb": "bristol myers squibb", "kite": "gilead", "loxo": "eli lilly", "seagen": "pfizer", "immunogen": "abbvie",
  // Subsidiaries that register trials under their own name (ClinicalTrials.gov lead sponsor) but belong to a corpus company.
  "suzhou suncadia": "jiangsu hengrui", "shandong suncadia": "jiangsu hengrui", "shanghai shengdi": "jiangsu hengrui", "shanghai hengrui": "jiangsu hengrui", "biotheus": "biontech", "shanghai jmt bio": "cspc", "cspc zhongqi technology": "cspc", "cspc megalith": "cspc", "aragon": "johnson johnson", "risen suzhou tech": "shanghai junshi", "klus": "sichuan kelun", "shanghai ming ju": "jw therapeutics" };

/** Normalised company name with corporate words removed: "Merck Sharp & Dohme LLC" -> "merck"; "Eli Lilly and Company" -> "eli lilly". */
export function companyKey(s: string): string {
  const n = norm(s.replace(/&/g, " "));
  const stripped = n.replace(CORP, " ").replace(/\s+/g, " ").trim();
  const k = stripped.length >= 3 ? stripped : n;
  return COMPANY_ALIASES[k] ?? k;
}

/** Company keys: the name and aliases as written and stripped, plus the names inside "(incl. X, Y)". */
export function companyKeys(c: { name: string; aka: string[] }): Set<string> {
  const raw = [...nameParts(c.name.replace(/incl\.?\s*/i, "")), ...c.aka.flatMap(nameParts)];
  const keys = new Set<string>();
  for (const r of raw) {
    const n = norm(r.replace(/&/g, " "));
    if (n.length >= 3) keys.add(n);
    const k = companyKey(r);
    if (k.length >= 3) keys.add(k);
  }
  return keys;
}

/** A sponsor matches a company when its stripped key equals a company key, or contains a distinctive (5+ character) company key as whole words. */
function companyMatches(sponsor: string, keys: Set<string>): boolean {
  const k = companyKey(sponsor);
  if (keys.has(k) || keys.has(norm(sponsor))) return true;
  for (const c of keys) if (c.length >= 5 && (k.startsWith(c + " ") || k.endsWith(" " + c) || k.includes(" " + c + " "))) return true;
  return false;
}

/** "https://www.mdanderson.org/path" -> "mdanderson.org". */
export function host(url?: string): string | undefined {
  if (!url) return undefined;
  try { return new URL(url.startsWith("http") ? url : `https://${url}`).hostname.replace(/^www\./, "").toLowerCase(); } catch { return undefined; }
}

/**
 * An absolute http(s) URL fit for an href, or undefined. Source lists write websites loosely ("www.x.fi",
 * "a.lt, b.lt", "htttps://"), and a bare host in an href becomes a broken relative link on the page.
 */
export function webUrl(url?: string): string | undefined {
  if (!url) return undefined;
  const first = url.split(/[,\s]+/)[0].replace(/^h+t+p+s?:\/+/i, (m) => (/s:/i.test(m) ? "https://" : "http://"));
  const abs = /^https?:\/\//i.test(first) ? first : `https://${first}`;
  try { const u = new URL(abs); return u.hostname.includes(".") ? u.toString() : undefined; } catch { return undefined; }
}

const TITLES = /\b(prof|professor|dr|drs|mr|mrs|ms|md|phd|dsc|frcp|frcs|mba|msc|mph|jr|sr|dott|dottssa|univ|priv|doz|med|dipl|ing|hab|h c|em|emer|sir|dame|hon|pd|obe|cbe|mbe)\b\.?/g;
/** "Prof. Dr Shahrokh Shariat" -> "shahrokh shariat". */
export function personKey(s: string): string {
  return norm(s.replace(/\./g, " ")).replace(TITLES, " ").replace(/\s+/g, " ").trim();
}

/** Corpus target symbols: "AKT1/2/3" -> akt1, akt2, akt3; "BRCA1, BRCA2" -> both; the name and aliases as written too. */
export function targetKeys(t: { name: string; aka: string[]; symbol?: string }): Set<string> {
  const keys = new Set<string>();
  for (const s of [t.name, ...t.aka]) for (const p of nameParts(s)) { const n = norm(p); if (n.length >= 2) keys.add(n); }
  if (t.symbol) {
    const tokens = t.symbol.split(/[\s,;]+|\s*\/\s*/).filter(Boolean);
    let prefix = "";
    for (const tok of tokens) {
      const m = tok.match(/^([A-Za-z][A-Za-z0-9]*?)(\d+)$/);
      if (/^\d+$/.test(tok) && prefix) keys.add(norm(prefix + tok));
      else {
        keys.add(norm(tok));
        // Fusion symbols: "BCR-ABL1" and "BCR::ABL1" also count as their partners.
        for (const part of tok.split(/::|-/)) if (part.length >= 2) keys.add(norm(part));
        if (m) prefix = m[1];
      }
    }
    const n = norm(t.symbol);
    if (n) keys.add(n);
  }
  return keys;
}

const CANCER_WORDS = /\b(cancers?|carcinomas?|tumou?rs?|of the|childhood|adult)\b/g;
/** Cancer keys: name and aliases, split at "and" and parentheses, with and without the generic words (cancer, carcinoma, tumour). */
export function cancerKeys(c: { name: string; aka: string[] }): Set<string> {
  const keys = new Set<string>();
  for (const s of [c.name, ...c.aka]) {
    for (const p of nameParts(s).flatMap((x) => [x, ...x.split(/\s+(?:and|&)\s+/)])) {
      const n = norm(p);
      if (n.length < 3) continue;
      keys.add(n);
      const bare = n.replace(CANCER_WORDS, " ").replace(/\s+/g, " ").trim();
      if (bare.length >= 3) keys.add(bare);
    }
  }
  return keys;
}

/** An NCI cancer-type name is covered when one of its keys equals a corpus key, or when a corpus key extends it ("her2 positive breast cancer" covers "breast cancer"). */
function cancerMatches(cand: Set<string>, corpusKeys: Set<string>): boolean {
  for (const k of cand) {
    if (corpusKeys.has(k)) return true;
    if (k.length >= 6 && !/^(childhood|adult|cancer|tumors?)$/.test(k)) for (const c of corpusKeys) if (c.startsWith(k + " ") || c.endsWith(" " + k)) return true;
  }
  return false;
}

/** Institution keys: name and aliases split on commas and slashes, plus the website host. */
export function institutionKeys(i: { name: string; aka: string[]; website?: string }): Set<string> {
  const keys = new Set<string>();
  for (const s of [i.name, ...i.aka]) for (const p of nameParts(s)) { const n = norm(p.replace(/^the\s+/i, "")); if (n.length >= 4) { keys.add(n); keys.add(n.replace(/\bcomprehensive\b/g, " ").replace(/\s+/g, " ").trim()); } }
  const h = host(i.website);
  if (h) keys.add(`host:${h}`);
  return keys;
}

/** Two normalised institution names agree when equal, or when the longer starts or ends with the shorter and the shorter is at least 10 characters ("ucla jonsson comprehensive cancer center" and "jonsson comprehensive cancer center"). */
function institutionNamesAgree(a: string, b: string): boolean {
  if (a === b) return true;
  const [s, l] = a.length <= b.length ? [a, b] : [b, a];
  return s.length >= 10 && (l.startsWith(s + " ") || l.endsWith(" " + s));
}

// ---------------------------------------------------------------------------------------------------
// Per-denominator resolvers
// ---------------------------------------------------------------------------------------------------

type Result = { ours: number; missing: MissingItem[]; listed: boolean };
type Resolver = (g: Graph) => Result;

/** KEGG cancer maps mapped by hand to the OnCo pathway pages that cover the same biology. Disease-specific maps (colorectal cancer, glioma, ...) map to the KEGG-derived pages in src/data/pathways-kegg.ts. */
export const KEGG_TO_ONCO: Record<string, string[]> = {
  hsa05200: ["rtk-activation", "ras-mapk", "pi3k-akt-mtor", "wnt", "p53-cell-cycle", "apoptosis-bcl2", "vegf-angiogenesis", "jak-stat", "notch", "hedgehog", "tgf-beta", "hif-vhl", "cell-cycle-engine-cdks"],
  hsa05202: ["transcription-addiction"],
  hsa05204: ["mutagenesis-signatures"],
  hsa05208: ["keap1-nrf2"],
  hsa05203: ["oncogenic-viruses"],
  hsa05230: ["cancer-metabolism"],
  hsa05235: ["pd1-checkpoint"],
  // Wave 2 (src/data/pathways-kegg.ts): one OnCo page per remaining KEGG cancer map.
  hsa05206: ["micrornas-in-cancer"],
  hsa05205: ["proteoglycans-in-cancer"],
  hsa05207: ["chemical-carcinogenesis-receptor-activation"],
  hsa05231: ["choline-metabolism-in-cancer"],
  hsa05210: ["colorectal-cancer-signalling"],
  hsa05212: ["pancreatic-cancer-signalling"],
  hsa05225: ["hepatocellular-carcinoma-signalling"],
  hsa05226: ["gastric-cancer-signalling"],
  hsa05214: ["glioma-signalling"],
  hsa05216: ["thyroid-cancer-signalling"],
  hsa05221: ["aml-signalling"],
  hsa05220: ["cml-signalling"],
  hsa05217: ["basal-cell-carcinoma-signalling"],
  hsa05218: ["melanoma-signalling"],
  hsa05211: ["renal-cell-carcinoma-signalling"],
  hsa05219: ["bladder-cancer-signalling"],
  hsa05215: ["prostate-cancer-signalling"],
  hsa05213: ["endometrial-cancer-signalling"],
  hsa05224: ["breast-cancer-signalling"],
  hsa05222: ["sclc-signalling"],
  hsa05223: ["nsclc-signalling"],
};

function countOnly(count: (g: Graph) => number): Resolver {
  return (g) => ({ ours: count(g), missing: [], listed: false });
}

function drugsNci(g: Graph): Result {
  const keys = new Set<string>();
  for (const d of g.kind("drug")) for (const k of drugKeys(d)) keys.add(k);
  // NCI lists combination regimens (ABVD, R-CHOP, FOLFIRI-cetuximab) alongside single agents; OnCo covers those as regimen pages.
  for (const r of regimens) for (const k of keysFrom([r.name, ...(r.aka ?? [])].flatMap(nameParts))) keys.add(k);
  let ours = 0;
  const missing: MissingItem[] = [];
  for (const it of UNIVERSE_LISTS["nci-cancer-drugs"].items) {
    const hit = keysFrom(it.names.flatMap(nameParts)).size > 0 && [...keysFrom(it.names.flatMap(nameParts))].some((k) => keys.has(k));
    if (hit) ours++;
    else missing.push({ name: it.names[0], url: it.url, detail: it.names.length > 1 ? `also ${it.names.slice(1).join(", ")}` : undefined });
  }
  return { ours, missing, listed: true };
}

function cancersNci(g: Graph): Result {
  const keys = new Set<string>();
  for (const c of g.kind("cancer")) for (const k of cancerKeys(c)) keys.add(k);
  let ours = 0;
  const missing: MissingItem[] = [];
  for (const it of UNIVERSE_LISTS["nci-cancer-types"].items) {
    if (cancerMatches(cancerKeys({ name: it.name, aka: [] }), keys)) ours++;
    else missing.push({ name: it.name, url: it.link });
  }
  return { ours, missing, listed: true };
}

function cancersGlobocan(): Result {
  const covered = new Set<number>();
  for (const m of Object.values(GLOBOCAN_MAP)) for (const c of m.codes) {
    if (c >= 1 && c <= 36) covered.add(c);
    if (c === 41) { covered.add(8); covered.add(9); covered.add(10); } // colorectum aggregate spans colon, rectum and anus
  }
  const missing: MissingItem[] = UNIVERSE_LISTS["globocan-sites"].items.filter((s) => !covered.has(s.code)).map((s) => ({ name: s.label, detail: `ICD-10 ${s.icd}`, url: "https://gco.iarc.who.int/today" }));
  return { ours: UNIVERSE_LISTS["globocan-sites"].items.filter((s) => covered.has(s.code)).length, missing, listed: true };
}

function targetsChembl(g: Graph): Result {
  const keys = new Set<string>();
  for (const t of g.kind("target")) for (const k of targetKeys(t)) keys.add(k);
  let ours = 0;
  const missing: MissingItem[] = [];
  for (const it of UNIVERSE_LISTS["chembl-oncology-targets"].items) {
    const cand = [...it.symbols.map(norm), norm(it.name)];
    if (cand.some((k) => k && keys.has(k))) ours++;
    else missing.push({ name: it.symbols.length ? `${it.name} (${it.symbols.slice(0, 4).join(", ")}${it.symbols.length > 4 ? ", ..." : ""})` : it.name, url: it.url, detail: `${it.drugs} approved drug${it.drugs === 1 ? "" : "s"} act on it; ${it.type.toLowerCase()}` });
  }
  return { ours, missing, listed: true };
}

function companiesAgainst(list: Array<{ name: string; detail: string }>): Resolver {
  return (g) => {
    const keys = new Set<string>();
    for (const c of g.kind("company")) for (const k of companyKeys(c)) keys.add(k);
    let ours = 0;
    const missing: MissingItem[] = [];
    for (const it of list) {
      if (companyMatches(it.name, keys)) ours++;
      else missing.push({ name: it.name, detail: it.detail });
    }
    return { ours, missing, listed: true };
  };
}

function institutionsAgainst(list: Array<{ names: string[]; website?: string; url?: string; detail?: string }>): Resolver {
  return (g) => {
    const insts = g.kind("institution").map((i) => institutionKeys(i));
    const hosts = new Set<string>();
    const names: string[] = [];
    for (const ks of insts) for (const k of ks) { if (k.startsWith("host:")) hosts.add(k); else names.push(k); }
    let ours = 0;
    const missing: MissingItem[] = [];
    for (const it of list) {
      const h = host(it.website);
      const cand = it.names.flatMap((n) => nameParts(n)).map((p) => norm(p.replace(/^the\s+/i, ""))).flatMap((n) => [n, n.replace(/\bcomprehensive\b/g, " ").replace(/\s+/g, " ").trim()]).filter((n) => n.length >= 4);
      const hit = (h && hosts.has(`host:${h}`)) || cand.some((c) => names.some((n) => institutionNamesAgree(c, n)));
      if (hit) ours++;
      else missing.push({ name: it.names[0], url: webUrl(it.url ?? it.website), detail: it.detail });
    }
    return { ours, missing, listed: true };
  };
}

function peopleOeciLeaders(g: Graph): Result {
  const keys = new Set(g.kind("person").flatMap((p) => [p.name, ...p.aka].map(personKey)));
  let ours = 0;
  const missing: MissingItem[] = [];
  for (const m of UNIVERSE_LISTS["oeci-members"].items) {
    if (!m.leaders.length) continue;
    const leader = m.leaders[0];
    if (keys.has(personKey(leader))) ours++;
    else missing.push({ name: leader, url: webUrl(m.website), detail: `${m.altName ?? m.name}, ${m.country}` });
  }
  return { ours, missing, listed: true };
}

function peopleNciDirectors(g: Graph): number {
  const nci = new Set(g.kind("institution").filter((i) => i.nci).map((i) => i.id));
  return g.kind("person").filter((p) => {
    if (!p.institutionId || !nci.has(p.institutionId)) return false;
    const first = p.role.split(/[;,]/)[0].trim();
    return /^(?:(?:president|ceo|chief executive officer)\s+(?:and|&)\s+)?director\b/i.test(first) && !/associate|deputy|assistant|co-director|vice/i.test(first);
  }).length;
}

function pathwaysKegg(g: Graph): Result {
  let ours = 0;
  const missing: MissingItem[] = [];
  for (const it of UNIVERSE_LISTS["kegg-cancer-pathways"].items) {
    const ids = (KEGG_TO_ONCO[it.id] ?? []).filter((id) => g.get(id)?.kind === "pathway");
    if (ids.length) ours++;
    else missing.push({ name: it.name, url: `https://www.kegg.jp/pathway/${it.id}`, detail: it.group === "specific" ? "disease-specific map" : "overview map" });
  }
  return { ours, missing, listed: true };
}

function pathwaysHallmarks(g: Graph): Result {
  let ours = 0;
  const missing: MissingItem[] = [];
  for (const it of UNIVERSE_LISTS["hallmarks-2022"].items) {
    if (it.oncoIds.some((id) => g.get(id)?.kind === "pathway")) ours++;
    else missing.push({ name: it.name, detail: it.type, url: UNIVERSE_LISTS["hallmarks-2022"].source.url });
  }
  return { ours, missing, listed: true };
}

function journalsNlm(g: Graph): Result {
  const issn = new Set<string>();
  const names = new Set<string>();
  for (const j of g.kind("journal")) {
    if (j.issn) issn.add(j.issn.toUpperCase());
    for (const n of [j.name, ...j.aka, ...j.matchNames]) names.add(norm(n));
  }
  let ours = 0;
  const missing: MissingItem[] = [];
  for (const it of UNIVERSE_LISTS["nlm-oncology-journals"].items) {
    const hit = it.issn.some((x) => issn.has(x.toUpperCase())) || names.has(norm(it.title)) || (it.medlineTa ? names.has(norm(it.medlineTa)) : false);
    if (hit) ours++;
    else missing.push({ name: it.title, url: `https://www.ncbi.nlm.nih.gov/nlmcatalog/${it.nlmId}`, detail: [it.medlineTa, it.country].filter(Boolean).join(", ") });
  }
  return { ours, missing, listed: true };
}

function papersOpenalex(g: Graph): Result {
  const dois = new Set<string>();
  for (const p of g.kind("paper")) {
    if (p.doi) dois.add(p.doi.toLowerCase().replace(/^https?:\/\/doi\.org\//, ""));
    for (const l of p.links) { const m = l.url.match(/doi\.org\/(10\.[^\s?#]+)/i); if (m) dois.add(m[1].toLowerCase()); }
  }
  let ours = 0;
  const missing: MissingItem[] = [];
  for (const it of UNIVERSE_LISTS["openalex-top-oncology-papers"].items) {
    if (it.doi && dois.has(it.doi)) ours++;
    else missing.push({ name: it.title, url: it.doi ? `https://doi.org/${it.doi}` : it.id, detail: `${it.year}, ${it.cited.toLocaleString("en-GB")} citations` });
  }
  return { ours, missing, listed: true };
}

const RESOLVERS: Record<string, Resolver> = {
  "drugs-nci-az": drugsNci,
  "cancers-nci-az": cancersNci,
  "cancers-globocan": cancersGlobocan,
  "targets-chembl": targetsChembl,
  "trials-ctgov-interventional": countOnly((g) => g.kind("trial").filter((t) => t.nct).length),
  "trials-ctgov-phase3": countOnly((g) => g.kind("trial").filter((t) => t.nct && (t.phase === "3" || t.phase === "2/3")).length),
  "trials-ctgov-recruiting": countOnly((g) => g.kind("trial").filter((t) => t.nct && (t.status === "recruiting" || t.status === "active")).length),
  "companies-ctgov-industry-p3": companiesAgainst(UNIVERSE_LISTS["ctgov-oncology"].items.map((s) => ({ name: s.name, detail: `${s.studies} phase 3 cancer trial${s.studies === 1 ? "" : "s"} as lead sponsor` }))),
  "companies-fda-oce": companiesAgainst(UNIVERSE_LISTS["fda-oce-sponsors"].items.map((s) => ({ name: s.name, detail: `${s.approvals} FDA oncology approval notification${s.approvals === 1 ? "" : "s"}, ${s.first.slice(0, 4)} to ${s.last.slice(0, 4)}` }))),
  "institutions-nci": institutionsAgainst(UNIVERSE_LISTS["nci-cancer-centers"].items.map((c) => ({ names: [c.name], website: c.website, url: c.url }))),
  "institutions-oeci": institutionsAgainst(UNIVERSE_LISTS["oeci-members"].items.map((m) => ({ names: [m.altName ?? m.name, m.name], website: m.website, url: m.website, detail: `${m.country}; ${m.membership.toLowerCase()}` }))),
  "institutions-nhs-alliances": institutionsAgainst(UNIVERSE_LISTS["nhs-cancer-alliances"].items.map((a) => ({ names: [a.name], website: a.website, url: a.website }))),
  "institutions-uicc": countOnly((g) => g.kind("institution").length),
  "people-oeci-leaders": peopleOeciLeaders,
  "people-nci-directors": countOnly(peopleNciDirectors),
  "pathways-kegg-cancer": pathwaysKegg,
  "pathways-hallmarks": pathwaysHallmarks,
  "pathways-reactome": countOnly((g) => g.kind("pathway").length),
  "journals-nlm": journalsNlm,
  "papers-openalex-top100": papersOpenalex,
  "terms-nci-dictionary": countOnly((g) => g.kind("term").length),
};

/** Coverage percentage, one decimal, capped at 100; null without a denominator. */
export function pctOf(ours: number, total: number | null): number | null {
  if (total === null || total <= 0) return null;
  return Math.min(100, Math.round((ours / total) * 1000) / 10);
}

let cached: Coverage[] | undefined;

/** Every denominator with OnCo's count, coverage and missing items; computed once per build. */
export function completeness(): Coverage[] {
  if (cached) return cached;
  const g = graph();
  cached = UNIVERSE.map((den) => {
    const r = RESOLVERS[den.id];
    if (!r) {
      // OnCo-defined kinds: report the corpus count, no denominator.
      const ours = den.kind === "none" ? 0 : g.kind(den.kind as Kind).length;
      return { den, ours, pct: null, missing: [], listed: false };
    }
    const { ours, missing, listed } = r(g);
    return { den, ours, pct: pctOf(ours, den.total), missing, listed };
  });
  return cached;
}

export function coverageFor(id: string): Coverage | undefined {
  return completeness().find((c) => c.den.id === id);
}

/** The single headline: matched items over listed items across every list-backed denominator. */
export function headline(rows = completeness()): { ours: number; total: number; pct: number } {
  const listed = rows.filter((r) => r.listed && r.den.total !== null);
  const ours = listed.reduce((s, r) => s + r.ours, 0);
  const total = listed.reduce((s, r) => s + (r.den.total ?? 0), 0);
  return { ours, total, pct: pctOf(ours, total) ?? 0 };
}

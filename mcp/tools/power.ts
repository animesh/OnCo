/** Power tools: biomarker_match, compare, regimens, calendar, toxicity_compare, path_between. */
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { biomarkers } from "../../src/data/biomarkers";
import { calendar } from "../../src/data/calendar";
import { scoreRows } from "../../src/lib/biomarker-match";
import { matchRows } from "../../src/lib/biomarker-match-rows";
import { describePath, findPaths, hopLabel } from "../../src/lib/paths";
import { pathData } from "../../src/lib/paths-data";
import type { Entity } from "../../src/lib/schema";
import { brief, fail, g, text, url } from "./context";

const names = (ids: string[]) => ids.map((id) => g.must(id).name);

/** The same field set the Compare page shows, per kind. */
function compareFields(e: Entity): Record<string, string | number | string[] | undefined> {
  switch (e.kind) {
    case "drug": return { brand: e.brand, code: e.code, modality: e.modality, mechanism: e.mechanism, payload: e.payload, linker: e.linker, targets: names(e.targets), cancers: names(e.cancers), companies: names(e.companies), firstApproval: e.approvals.length ? Math.min(...e.approvals.map((a) => a.year)) : undefined, approvals: e.approvals.map((a) => `${a.region} ${a.year}: ${a.indication}`), dosing: e.dosing ? `${e.dosing.route}; ${e.dosing.schedule}` : undefined, grade3Toxicities: e.toxicity.filter((t) => t.grade3PlusPct !== undefined).map((t) => `${t.event} ${t.grade3PlusPct}%`), keyTrials: names(e.trials) };
    case "technology": return { principle: e.principle, generation: e.generation, since: e.since, strengths: e.strengths, limitations: e.limitations, cancers: names(e.cancers), drugs: names(e.drugs), targets: names(e.targets) };
    case "target": return { symbol: e.symbol, targetClass: e.targetClass, biology: e.biology, whereFound: e.whereFound, drugs: names(e.drugs), cancers: names(e.cancers), pathways: names(e.pathways), prevalence: e.prevalence.map((p) => `${g.must(p.cancerId).name}: ${p.pct}${typeof p.pct === "number" ? "%" : ""}`) };
    case "trial": return { nct: e.nct, phase: e.phase, setting: e.setting, sponsor: e.sponsor, enrolled: e.enrolled, yearReported: e.yearReported, result: e.result, outcomes: e.outcomes.map((o) => `${o.endpoint}: ${o.arms.map((a) => `${a.name}${a.value !== undefined ? ` ${a.value}${o.unit ?? ""}` : ""}`).join(" vs ")}${o.hr !== undefined ? ` (HR ${o.hr})` : ""}`), drugs: names(e.drugs), cancers: names(e.cancers), replication: e.replication };
    case "cancer": return { group: e.group, burden: e.burden, subtypes: e.subtypes, biomarkers: e.biomarkers, standardOfCare: e.standardOfCare.map((s) => `${s.setting}: ${s.approach}`), stateOfArt: e.stateOfArt, pipeline: names(e.pipeline), openProblems: e.openProblems };
    default: return { tags: e.tags, related: names(e.related) };
  }
}

function toxicityFamily(event: string): string {
  const e = event.toLowerCase();
  const table: Array<[RegExp, string]> = [[/neutro/, "Neutropenia"], [/anaem|anemia|haemoglobin|hemoglobin/, "Anaemia"], [/thrombocyt|platelet/, "Thrombocytopenia"], [/lymph/, "Lymphopenia"], [/diarr/, "Diarrhoea"], [/nausea/, "Nausea"], [/vomit/, "Vomiting"], [/fatigue|asthenia/, "Fatigue"], [/rash|cutaneous|skin/, "Rash / skin"], [/neuropath|paraesth|paresth/, "Peripheral neuropathy"], [/stomatitis|mucos/, "Stomatitis"], [/alopecia|hair/, "Alopecia"], [/appetite/, "Decreased appetite"], [/ild|interstitial|pneumonitis/, "ILD / pneumonitis"], [/crs|cytokine release/, "Cytokine release syndrome"], [/icans|neurolog|neurotox/, "Neurotoxicity"], [/infect|pneumonia/, "Infections"], [/hepat|\balt\b|\bast\b|transamin/, "Hepatotoxicity"], [/eye|ocular|kerat|vision|conjunct/, "Ocular"], [/qt/, "QT prolongation"], [/hypergly/, "Hyperglycaemia"], [/thyroid/, "Thyroid"], [/colitis/, "Colitis"]];
  for (const [re, fam] of table) if (re.test(e)) return fam;
  return event;
}

export function registerPower(server: McpServer) {
  const matchable = matchRows();

  server.registerTool("biomarker_match", {
    title: "Match biomarkers to options",
    description: `Tumour-board style matching: given biomarker ids (and optionally a cancer id), rank products, technologies, trials, pairings, ideas and targets that those biomarkers unlock, with the matched biomarkers per row. Score: target match 3, term 2, technology 2, tag 1 per biomarker; +2 if relevant to the cancer; +2 approved / +1 phase 3. Biomarker ids: ${biomarkers.map((b) => b.id).join(", ")}.`,
    inputSchema: { biomarkers: z.array(z.string()).min(1).describe("Biomarker ids (see description) or exact labels"), cancerId: z.string().optional(), limit: z.number().int().min(1).max(100).default(25) },
  }, async ({ biomarkers: wanted, cancerId, limit }) => {
    const selected = wanted.map((w) => biomarkers.find((b) => b.id === w || b.label.toLowerCase() === w.toLowerCase())).filter((b): b is (typeof biomarkers)[number] => !!b);
    if (!selected.length) return fail(`No known biomarkers among ${wanted.join(", ")}. Ids: ${biomarkers.map((b) => b.id).join(", ")}`);
    if (cancerId && !g.get(cancerId)) return fail(`Unknown cancer "${cancerId}"`);
    const scored = scoreRows(matchable, selected, cancerId ?? null).slice(0, limit);
    return text({ biomarkers: selected.map((b) => ({ id: b.id, label: b.label, note: b.note })), matches: scored.map((s) => ({ id: s.row.id, kind: s.row.kind, name: s.row.name, status: s.row.status, meta: s.row.meta, score: s.score, matchedBiomarkers: s.hits, caution: s.row.pair?.caution || undefined, url: `https://onco.cc${s.row.route}` })) });
  });

  server.registerTool("compare", {
    title: "Compare records side by side",
    description: "Compare two to five records of the same kind (drug, technology, target, trial or cancer) on the fields the Compare page shows. Returns one column per record and flags the fields that differ.",
    inputSchema: { ids: z.array(z.string()).min(2).max(5) },
  }, async ({ ids }) => {
    const items = ids.map((id) => g.get(id));
    const missing = ids.filter((_, i) => !items[i]);
    if (missing.length) return fail(`Unknown ids: ${missing.join(", ")}`);
    const es = items as Entity[];
    if (new Set(es.map((e) => e.kind)).size > 1) return fail(`All records must be the same kind; got ${es.map((e) => `${e.id} (${e.kind})`).join(", ")}`);
    const cols = es.map((e) => ({ ...brief(e), fields: compareFields(e) }));
    const keys = [...new Set(cols.flatMap((c) => Object.keys(c.fields)))];
    const differs = keys.filter((k) => new Set(cols.map((c) => JSON.stringify(c.fields[k] ?? null))).size > 1);
    return text({ kind: es[0].kind, columns: cols, differingFields: differs, compareUrl: `https://onco.cc/compare/?ids=${ids.join(",")}` });
  });

  server.registerTool("regimens", {
    title: "Standard-of-care regimens for a cancer",
    description: "The standard-of-care rows for a cancer: setting, approach, the products and trials each cites (with URLs), and guideline mapping (NCCN category, ESMO-MCBS) where recorded. Optionally filter by a setting keyword such as 'first line', 'adjuvant' or 'relapsed'.",
    inputSchema: { cancerId: z.string().min(1), setting: z.string().optional() },
  }, async ({ cancerId, setting }) => {
    const c = g.get(cancerId);
    if (!c || c.kind !== "cancer") return fail(`Unknown cancer "${cancerId}"`);
    const rowsOut = c.standardOfCare.filter((s) => !setting || s.setting.toLowerCase().includes(setting.toLowerCase())).map((s) => ({ setting: s.setting, approach: s.approach, guideline: s.guideline, refs: s.refs.map((id) => brief(g.must(id))) }));
    return text({ cancer: brief(c), asOf: c.asOf, regimens: rowsOut });
  });

  server.registerTool("calendar", {
    title: "Readout and decision calendar",
    description: "Upcoming and past dated events: PDUFA dates, advisory committees, expected readouts, congresses and policy dates, each with the OnCo records it concerns and a source where confirmed. Filter by date range (YYYY-MM-DD, YYYY-MM or YYYY-Qn), kind, or a record id.",
    inputSchema: { from: z.string().optional(), to: z.string().optional(), kind: z.enum(["pdufa", "adcom", "readout-expected", "congress", "policy"]).optional(), refId: z.string().optional(), limit: z.number().int().min(1).max(200).default(50) },
  }, async ({ from, to, kind, refId, limit }) => {
    const items = calendar.filter((e) => (!from || e.date >= from) && (!to || e.date <= to) && (!kind || e.kind === kind) && (!refId || e.refs.includes(refId))).sort((a, b) => a.date.localeCompare(b.date)).slice(0, limit);
    return text(items.map((e) => ({ ...e, refs: e.refs.map((id) => { const x = g.get(id); return x ? { id, name: x.name, url: url(x) } : { id }; }) })));
  });

  server.registerTool("toxicity_compare", {
    title: "Compare adverse-event rates",
    description: "Grade 3+ and any-grade adverse-event rates across products, from the prescribing information or pivotal trial as recorded in OnCo. Give product ids, or a modality keyword (e.g. 'ADC', 'CDK4/6', 'radioligand') to compare a class. Events are grouped into families (Neutropenia, Diarrhoea, ILD / pneumonitis...). Blank means not recorded, not zero; trial populations differ.",
    inputSchema: { ids: z.array(z.string()).optional(), modality: z.string().optional(), grade3Only: z.boolean().default(false) },
  }, async ({ ids, modality, grade3Only }) => {
    const drugs = g.kind("drug").filter((d) => d.toxicity.length && ((ids && ids.includes(d.id)) || (modality && d.modality.toLowerCase().includes(modality.toLowerCase()))));
    if (!drugs.length) return fail("No products with recorded toxicity match. Give product ids or a modality keyword.");
    const families = new Set<string>();
    const table = drugs.map((d) => {
      const byFamily: Record<string, { anyGradePct?: number; grade3PlusPct?: number; event: string; source?: string }> = {};
      for (const t of d.toxicity) { if (grade3Only && t.grade3PlusPct === undefined) continue; const f = toxicityFamily(t.event); families.add(f); byFamily[f] = { event: t.event, anyGradePct: t.anyGradePct, grade3PlusPct: t.grade3PlusPct, source: t.source }; }
      return { ...brief(d), modality: d.modality, toxicity: byFamily };
    });
    return text({ families: [...families].sort(), products: table, compareUrl: "https://onco.cc/toxicity/" });
  });

  const data = pathData();
  const idx = new Map(data.nodes.map((n, i) => [n.id, i]));
  server.registerTool("path_between", {
    title: "How two records are related",
    description: "Shortest routes between any two records through the knowledge graph, every hop labelled with the relationship (e.g. 'links target', 'standard of care for', 'pathway node'). Answers questions like 'how is the Hippo pathway related to sacituzumab govitecan?'. Up to three routes, max six hops.",
    inputSchema: { from: z.string().min(1), to: z.string().min(1), k: z.number().int().min(1).max(5).default(3) },
  }, async ({ from, to, k }) => {
    const a = idx.get(from), b = idx.get(to);
    if (a === undefined || b === undefined) return fail(`Unknown id: ${a === undefined ? from : to}`);
    const paths = findPaths(data, a, b, k);
    return text({ from: brief(g.must(from)), to: brief(g.must(to)), hops: paths[0]?.hops.length ?? null, paths: paths.map((p) => { let prev = data.nodes[p.start]; return { text: describePath(data, p), steps: p.hops.map((h) => { const n = data.nodes[h.node]; const label = hopLabel(h.via, h.forward, prev.kind, n.kind); prev = n; return { relationship: label, to: { id: n.id, kind: n.kind, name: n.name, url: `https://onco.cc${n.route}` } }; }) }; }), url: `https://onco.cc/path/?from=${from}&to=${to}` });
  });
}

import type { BrowserRow, ColDef, FacetDef, FacetLink, LinkItem } from "@/components/EntityBrowser";
import { graph } from "@/lib/graph";
import { logoSrc } from "@/lib/logos";
import { portraitSrc } from "@/lib/portraits";
import { rankInstitutions } from "@/lib/ranking";
import { routeFor, type Entity, type Kind } from "@/lib/schema";
import { COMPANY_TYPE_LABEL, portfolioOf, STAGE_LABEL, STAGE_ORDER, STAGE_TIP, stageOf } from "@/lib/startups";
import { termVisual, type TermVisual } from "@/lib/term-visual";

/**
 * Row, facet and column builders for the templated kind index tables (/ideas/, /drugs/, /people/ ...).
 * Kept out of the page file so tests can check every row without rendering: in particular that each row
 * has a visual (a molecule, drawing, organ icon, logo, initials tile or the kind's own symbol), never a gap.
 */

export const cap = (s: string) => s[0].toUpperCase() + s.slice(1);
const short = (s: string) => s.replace(/ \(.*\)$/, "");
const logoFor = (id: string, website?: string) => logoSrc(id, website);

/** Hero role tags (see /heroes/) shown as a chip facet on /people/, so "Donors" or "Patients" can be picked out of the full list. */
const HERO_ROLE_LABEL: Record<string, string> = { donor: "Donors", patient: "Patients", carer: "Family", advocate: "Advocates", pioneer: "Pioneers" };
/** Every kind gets the same templated table; this function decides facets, columns, and row values per kind. */
export function buildBrowser(k: Kind): { rows: BrowserRow[]; facets: FacetDef[]; columns: ColDef[]; hideStatus?: boolean; hideTldr?: boolean; defaultSort?: { key: string; dir: 1 | -1 } } {
  const g = graph();
  const names = (ids: string[]) => ids.map((id) => short(g.must(id).name));
  const links = (ids: string[]) => ids.map((id) => { const x = g.must(id); return { label: short(x.name), href: routeFor(x), tip: x.tldr }; });
  const base = (e: Entity): BrowserRow => ({ id: e.id, name: e.name, tldr: e.tldr, route: routeFor(e), status: e.status, kind: e.kind, facets: {}, cols: {} });
  /**
   * A picture borrowed from what the record links to, for kinds with no drawing of their own (ideas, trials,
   * roadmaps, pairings, pathways, bottlenecks): the organ icon of its first cancer, else the rotating drawing
   * of its first technology, else (only where asked, since the molecule slot also drives the approval chip)
   * the molecule of its first product. Empty when nothing fits, and the table then shows the kind's symbol.
   */
  const borrowed = (e: Entity, withMolecule = false): Partial<BrowserRow> => {
    if (e.cancers[0]) return { cancerIcon: e.cancers[0] };
    const t = e.technologies.map((id) => g.get(id)).find((x) => x?.kind === "technology");
    if (t && t.kind === "technology") return { schematic: { id: t.id, sections: t.sections } };
    const d = withMolecule ? e.drugs.map((id) => g.get(id)).find((x) => x?.kind === "drug") : undefined;
    if (d && d.kind === "drug") return { molecule: d.id, modality: d.modality };
    return {};
  };
  /** The first non-empty set of visual fields. */
  const firstOf = (...parts: Partial<BrowserRow>[]): Partial<BrowserRow> => parts.find((p) => Object.keys(p).length) ?? {};
  const frontsOf = (e: Entity) => [...new Set([...e.sections, ...e.technologies.flatMap((t) => g.must(t).sections)])].map((id) => g.must(id).name);
  const inc = (id: string, kind: Kind) => g.incoming(id).get(kind) ?? [];
  /** A cell that filters the same table by `facet` = `value` when clicked; undefined when there is no value. */
  const fl = (facet: string, value: string | number | undefined, extra?: Pick<FacetLink, "label" | "tip">): FacetLink | undefined => (value === undefined || value === "" ? undefined : { facet, value: String(value), ...extra });
  const link = (e: Entity, label?: string): LinkItem => ({ label: label ?? short(e.name), href: routeFor(e), tip: e.tldr });
  /**
   * A count of linked objects that opens the matching section of the object's page (`#products`, `#ideas`,
   * `#connected`, ...). `noun` is singular; the tip reads "See all N products from Pfizer". Zero stays a plain 0.
   */
  const count = (n: number, e: Entity, anchor: string, noun: string, rel = "for"): LinkItem[] | number => {
    if (!n) return 0;
    const what = `${n.toLocaleString("en-GB")} ${n === 1 ? noun : noun.endsWith("y") ? `${noun.slice(0, -1)}ies` : `${noun}s`}`;
    return [{ label: n.toLocaleString("en-GB"), href: `${routeFor(e)}#${anchor}`, tip: `See ${n === 1 ? "the" : "all"} ${what} ${rel} ${short(e.name)}.` }];
  };
  /** Position of a value in a "what works first" ordering; unknown values sort last. */
  const rank = (order: readonly string[], v: string) => { const i = order.indexOf(v); return i < 0 ? order.length : i; };

  /**
   * Companies and institutions by the names trial sponsors use for them: the full name, the name without its
   * parenthetical, each half of "Roche / Genentech", anything after "incl." or "formerly", and a few house aliases.
   */
  const orgIndex = (() => {
    const m = new Map<string, Entity>();
    const add = (k: string, e: Entity) => { const key = k.trim().toLowerCase(); if (key && !m.has(key)) m.set(key, e); };
    for (const e of [...g.kind("company"), ...g.kind("institution")]) {
      add(e.name, e); add(short(e.name), e);
      for (const part of short(e.name).split(/\s*\/\s*/)) add(part, e);
      const par = e.name.match(/\((incl\.|formerly)\s*([^)]*)\)/i)?.[2];
      if (par) for (const a of par.split(/,\s*/)) add(a, e);
    }
    const alias: Record<string, string> = { bms: "bms", merck: "merck", msd: "merck", janssen: "johnson-johnson", "j&j": "johnson-johnson", lilly: "eli-lilly", nci: "nci", roche: "roche-genentech", genentech: "roche-genentech", alliance: "alliance-oncology", "ecog-acrin": "ecog-acrin", swog: "swog", cruk: "cruk", cog: "childrens-oncology-group", legend: "legend-biotech", jazz: "jazz", hengrui: "hengrui", "jiangsu hengrui": "hengrui", kite: "gilead", gilead: "gilead", seagen: "pfizer", beone: "beone" };
    for (const [k, id] of Object.entries(alias)) { const e = g.get(id); if (e) m.set(k, e); }
    return m;
  })();
  const org = (name: string) => orgIndex.get(name.toLowerCase()) ?? orgIndex.get(short(name).toLowerCase());
  /** A sponsor string such as "Daiichi Sankyo / AstraZeneca" as a list: a page link for each organisation in the corpus, a sponsor facet chip for the rest. */
  const sponsorParts = (s?: string) => (s ?? "").split(/\s*\/\s*/).map((p) => p.trim()).filter(Boolean);
  const sponsorCell = (s?: string): Array<LinkItem | FacetLink> => sponsorParts(s).map((p) => { const e = org(p); return e ? link(e, p) : { facet: "sponsor", value: p }; });

  /** Journal records by every name papers use for them. */
  const journalByName = new Map<string, Entity>();
  for (const j of g.kind("journal")) for (const n of [j.name, ...j.matchNames]) if (!journalByName.has(n)) journalByName.set(n, j);
  const journalCell = (name: string): LinkItem[] | FacetLink => { const j = journalByName.get(name); return j ? [link(j, name)] : { facet: "journal", value: name }; };

  switch (k) {
    case "cancer": return {
      hideStatus: true,
      rows: g.kind("cancer").map((c) => { const drugs = (g.forCancer(c.id).get("drug") ?? []).length; return { ...base(c), cancerIcon: c.id, facets: { group: [cap(c.group)] }, cols: { group: fl("group", cap(c.group)), soc: count(c.standardOfCare.length, c, "care", "care setting"), pipeline: count(c.pipeline.length, c, "pipeline", "pipeline entry"), history: count(c.history.length, c, "history", "history event"), drugs: count(drugs, c, "relevant", "product") }, sortKeys: { soc: c.standardOfCare.length, pipeline: c.pipeline.length, history: c.history.length, drugs } }; }),
      facets: [{ key: "group", label: "Group", searchable: false }],
      columns: [{ key: "group", label: "Group" }, { key: "drugs", label: "Products", sortable: true, numeric: true }, { key: "soc", label: "Care settings", sortable: true, numeric: true, hide: "hidden md:table-cell" }, { key: "pipeline", label: "Pipeline", sortable: true, numeric: true, hide: "hidden md:table-cell" }, { key: "history", label: "History events", sortable: true, numeric: true, hide: "hidden lg:table-cell" }],
      defaultSort: { key: "drugs", dir: -1 },
    };
    case "section": return {
      hideStatus: true,
      rows: g.kind("section").sort((a, b) => a.order - b.order).map((s) => ({ ...base(s), sectionIcon: s.id, facets: {}, cols: { techs: count(inc(s.id, "technology").length, s, "technologies", "technology", "listed under"), order: s.order }, sortKeys: { techs: inc(s.id, "technology").length, order: s.order } })),
      facets: [],
      columns: [{ key: "techs", label: "Technologies", sortable: true, numeric: true }],
      defaultSort: { key: "order", dir: 1 },
    };
    case "technology": return {
      rows: g.kind("technology").map((t) => ({ ...base(t), schematic: { id: t.id, sections: t.sections }, facets: { front: t.sections.map((id) => g.must(id).name), cancers: names(t.cancers), targets: names(t.targets), tags: t.tags }, cols: { front: links(t.sections), since: t.since, generation: t.generation, drugs: count(inc(t.id, "drug").length, t, "products", "product", "built on") }, sortKeys: { since: typeof t.since === "number" ? t.since : 0, drugs: inc(t.id, "drug").length } })),
      facets: [{ key: "front", label: "Front", searchable: false, width: "w-52" }, { key: "cancers", label: "Cancer", width: "w-52" }, { key: "targets", label: "Target" }, { key: "tags", label: "Tag", searchable: false, width: "w-40" }],
      columns: [{ key: "front", label: "Front", hide: "hidden md:table-cell" }, { key: "generation", label: "Generation", hide: "hidden lg:table-cell" }, { key: "since", label: "Since", sortable: true, numeric: true, hide: "hidden sm:table-cell" }, { key: "drugs", label: "Products", sortable: true, numeric: true }],
    };
    case "target": return {
      hideStatus: true,
      rows: g.kind("target").map((t) => ({ ...base(t), sub: t.symbol, target: { id: t.id, name: t.name, targetClass: t.targetClass, tldr: t.tldr }, facets: { class: [cap(t.targetClass.replace("-", " "))], cancers: names(t.cancers), tags: t.tags }, cols: { class: fl("class", cap(t.targetClass.replace("-", " "))), drugs: count(inc(t.id, "drug").length, t, "products", "product", "aimed at"), techs: count(inc(t.id, "technology").length, t, "connected", "technology", "aimed at"), cancers: links(t.cancers) }, sortKeys: { drugs: inc(t.id, "drug").length, techs: inc(t.id, "technology").length } })),
      facets: [{ key: "class", label: "Class", searchable: false }, { key: "cancers", label: "Cancer", width: "w-52" }, { key: "tags", label: "Tag", searchable: false, width: "w-40" }],
      columns: [{ key: "class", label: "Class", hide: "hidden sm:table-cell" }, { key: "drugs", label: "Products", sortable: true, numeric: true }, { key: "techs", label: "Technologies", sortable: true, numeric: true, hide: "hidden md:table-cell" }, { key: "cancers", label: "Cancers", hide: "hidden lg:table-cell" }],
      defaultSort: { key: "drugs", dir: -1 },
    };
    case "drug": {
      const modalityClass = (m: string) => /bispecific adc/i.test(m) ? "Bispecific ADC" : /^adc/i.test(m) ? "ADC" : /engager|immtac/i.test(m) ? "T-cell engager" : /bispecific/i.test(m) ? "Bispecific antibody" : /monoclonal/i.test(m) ? "Monoclonal antibody" : /car-t|til|tcr-t/i.test(m) ? "Cell therapy" : /radioligand|alpha|theranostic/i.test(m) ? "Radiopharmaceutical" : /pet imaging|imaging agent/i.test(m) ? "Imaging agent" : /vaccine/i.test(m) ? "Vaccine" : /oncolytic/i.test(m) ? "Oncolytic virus" : /device/i.test(m) ? "Device" : /test|assay|profiling|detection|diagnostic|classifier/i.test(m) ? "Diagnostic test" : /cytotoxic|regimen/i.test(m) ? "Chemotherapy" : /protac|degrader/i.test(m) ? "Degrader" : /small-molecule|serd|inhibitor|antagonist/i.test(m) ? "Small molecule" : m;
      const payloadClass = (p?: string) => !p ? undefined : /top|sn-38|dxd|exatecan|belotecan|camptothecin|t030|ed-04/i.test(p) ? "Topoisomerase-I" : /mmae|mmaf|dm1|dm4|maytans|auristatin|tubulin/i.test(p) ? "Tubulin" : /pbd|calicheamicin|dna/i.test(p) ? "DNA-damaging" : "Other";
      return {
        rows: g.kind("drug").map((d) => {
          const first = d.approvals.length ? Math.min(...d.approvals.map((a) => a.year)) : undefined, last = d.approvals.length ? Math.max(...d.approvals.map((a) => a.year)) : undefined;
          const pc = payloadClass(d.payload);
          return { ...base(d), molecule: d.id, modality: d.modality, sub: [d.brand, d.code].filter(Boolean).join(" · "), facets: { cancers: names(d.cancers), modality: [modalityClass(d.modality)], targets: names(d.targets), companies: names(d.companies), front: frontsOf(d), payload: pc ? [pc] : [] }, cols: { modality: d.technologies.length ? [{ label: modalityClass(d.modality), href: routeFor(g.must(d.technologies[0])), tip: g.must(d.technologies[0]).tldr }] : fl("modality", modalityClass(d.modality)), targets: links(d.targets), cancers: links(d.cancers), companies: links(d.companies), approved: first ? (last && last !== first ? `${first} to ${last}` : String(first)) : undefined }, sortKeys: { approved: last ?? 0 } };
        }),
        facets: [{ key: "cancers", label: "Cancer", width: "w-56" }, { key: "modality", label: "Modality", searchable: false }, { key: "targets", label: "Target", width: "w-44" }, { key: "companies", label: "Company" }, { key: "front", label: "Front", searchable: false, width: "w-44" }, { key: "payload", label: "ADC payload", searchable: false, width: "w-44" }],
        columns: [{ key: "modality", label: "Modality", sortable: true, hide: "hidden sm:table-cell" }, { key: "targets", label: "Targets", hide: "hidden md:table-cell" }, { key: "cancers", label: "Cancers", hide: "hidden lg:table-cell" }, { key: "companies", label: "Companies", hide: "hidden lg:table-cell" }, { key: "approved", label: "Approved", sortable: true, numeric: true }],
      };
    }
    case "company": {
      const label = COMPANY_TYPE_LABEL;
      return {
        hideStatus: true,
        rows: g.kind("company").map((c) => {
          const products = new Set([...c.drugs, ...inc(c.id, "drug").map((d) => d.id)]).size;
          const techs = new Set([...c.technologies, ...inc(c.id, "technology").map((t) => t.id)]).size;
          const stage = stageOf(c);
          const stageLabel = stage ? STAGE_LABEL[stage] : undefined;
          const portfolio = c.companyType === "investor" ? portfolioOf(c.id).length : 0;
          return {
            ...base(c), logo: logoFor(c.id, c.website), avatar: "org", sub: `${c.hq}, ${c.country}${c.ticker ? ` · ${c.ticker}` : ""}${c.ycBatch ? ` · YC ${c.ycBatch}` : ""}`,
            facets: { type: [label[c.companyType] ?? c.companyType], stage: stageLabel ? [stageLabel] : [], country: [c.country], front: c.sections.map((id) => g.must(id).name), cancers: names(c.cancers), investor: c.investors.map((id) => g.must(id).name) },
            cols: { type: fl("type", label[c.companyType] ?? c.companyType), stage: fl("stage", stageLabel, stage ? { tip: STAGE_TIP[stage] } : undefined), hq: c.hq, country: fl("country", c.country), products: c.companyType === "investor" ? count(portfolio, c, "portfolio", "portfolio company", "backed by") : count(products, c, "products", "product", "from"), techs: count(techs, c, "connected", "technology", "from") },
            sortKeys: { products: c.companyType === "investor" ? portfolio : products, techs },
          };
        }),
        facets: [{ key: "type", label: "Type", searchable: false, width: "w-52" }, { key: "stage", label: "Stage", searchable: false, width: "w-44", order: STAGE_ORDER.map((s) => STAGE_LABEL[s]) }, { key: "country", label: "Country", searchable: false, width: "w-40" }, { key: "front", label: "Front", searchable: false, width: "w-44" }, { key: "cancers", label: "Cancer", width: "w-52" }, { key: "investor", label: "Investor", width: "w-52" }],
        columns: [{ key: "type", label: "Type", sortable: true, hide: "hidden sm:table-cell" }, { key: "stage", label: "Stage", sortable: true, hide: "hidden md:table-cell", tip: "Startup, growth stage, public, large private, acquired or wound down. Listed companies default to public; click a chip to filter." }, { key: "hq", label: "HQ", hide: "hidden md:table-cell" }, { key: "country", label: "Country", sortable: true, hide: "hidden lg:table-cell", tip: "Country of the headquarters, as a two-letter code." }, { key: "products", label: "Products", sortable: true, numeric: true, tip: "Products linked to the company; for investors, the number of portfolio companies in OnCo." }, { key: "techs", label: "Technologies", sortable: true, numeric: true, hide: "hidden lg:table-cell" }],
        defaultSort: { key: "products", dir: -1 },
      };
    }
    case "institution": {
      const ranked = rankInstitutions();
      return {
        hideStatus: true, hideTldr: true,
        rows: ranked.map((r) => { const i = r.institution; return { ...base(i), logo: logoFor(i.id, i.website), avatar: "org", sub: [i.university, `${i.city}, ${i.country}`].filter(Boolean).join(" · "), facets: { type: [cap(i.institutionType.replace("-", " "))], country: [i.country], nci: i.nci ? [cap(i.nci)] : [], cancers: names(i.cancers) }, cols: { rank: r.rank, type: fl("type", cap(i.institutionType.replace("-", " "))), country: fl("country", i.country), newsweek: i.newsweekOncology2026, nci: fl("nci", i.nci ? cap(i.nci) : undefined), links: count(r.links, i, "connected", "linked object", "at"), score: r.score }, sortKeys: { rank: r.rank, newsweek: i.newsweekOncology2026 ?? 999, links: r.links, score: r.score } }; }),
        facets: [{ key: "type", label: "Type", searchable: false, width: "w-48" }, { key: "country", label: "Country", searchable: false, width: "w-40" }, { key: "nci", label: "NCI", searchable: false, width: "w-40" }, { key: "cancers", label: "Cancer", width: "w-52" }],
        columns: [{ key: "rank", label: "#", sortable: true, numeric: true }, { key: "type", label: "Type", hide: "hidden md:table-cell" }, { key: "country", label: "Country", sortable: true, hide: "hidden lg:table-cell" }, { key: "newsweek", label: "Newsweek 2026", sortable: true, numeric: true, hide: "hidden sm:table-cell" }, { key: "nci", label: "NCI", hide: "hidden lg:table-cell" }, { key: "links", label: "Linked objects", sortable: true, numeric: true, hide: "hidden sm:table-cell" }, { key: "score", label: "Score", sortable: true, numeric: true }],
        defaultSort: { key: "score", dir: -1 },
      };
    }
    case "pathway": return {
      hideStatus: true,
      rows: g.kind("pathway").map((p) => ({ ...base(p), ...borrowed(p), facets: { cancers: names(p.cancers) }, cols: { nodes: p.nodes.length, targets: links(p.targets), drugs: count(p.drugs.length, p, "connected", "product", "acting on") }, sortKeys: { nodes: p.nodes.length, drugs: p.drugs.length } })),
      facets: [{ key: "cancers", label: "Cancer", width: "w-52" }],
      columns: [{ key: "targets", label: "Druggable nodes", hide: "hidden md:table-cell" }, { key: "drugs", label: "Products", sortable: true, numeric: true }, { key: "nodes", label: "Nodes", sortable: true, numeric: true, hide: "hidden sm:table-cell" }],
    };
    case "term": return {
      hideStatus: true,
      rows: g.kind("term").map((t) => ({ ...base(t), ...termRowVisual(termVisual(t, g), t.category), facets: { category: [t.category] }, cols: { category: fl("category", t.category), links: count(g.degree(t.id), t, "connected", "linked object", "for") }, sortKeys: { links: g.degree(t.id) } })),
      facets: [{ key: "category", label: "Category", searchable: false, width: "w-48" }],
      columns: [{ key: "category", label: "Category", sortable: true }, { key: "links", label: "Links", sortable: true, numeric: true, hide: "hidden sm:table-cell" }],
      defaultSort: { key: "category", dir: 1 },
    };
    case "trial": return {
      rows: g.kind("trial").map((t) => ({ ...base(t), ...borrowed(t), sub: t.nct, facets: { phase: [`Phase ${t.phase}`], cancers: names(t.cancers), sponsor: sponsorParts(t.sponsor), drugs: names(t.drugs) }, cols: { phase: fl("phase", `Phase ${t.phase}`), cancers: links(t.cancers), drugs: links(t.drugs), sponsor: sponsorCell(t.sponsor), year: t.yearReported }, sortKeys: { year: t.yearReported ?? 0 }, tie: t.yearReported ?? 0 })),
      facets: [{ key: "cancers", label: "Cancer", width: "w-56" }, { key: "phase", label: "Phase", searchable: false, width: "w-40" }, { key: "drugs", label: "Product", width: "w-48" }, { key: "sponsor", label: "Sponsor", width: "w-48" }],
      columns: [{ key: "phase", label: "Phase", sortable: true, hide: "hidden sm:table-cell" }, { key: "drugs", label: "Products", hide: "hidden md:table-cell" }, { key: "cancers", label: "Cancers", hide: "hidden lg:table-cell" }, { key: "sponsor", label: "Sponsor", hide: "hidden lg:table-cell" }, { key: "year", label: "Reported", sortable: true, numeric: true }],
      // What works first: positive and approved results at the top, negative and withdrawn last; newest first within a status.
      defaultSort: { key: "status", dir: 1 },
    };
    case "pairing": {
      /** What works first: approved combinations and standard sequences, then companion pairs and platforms, cautions last. */
      const ORDER = ["combination", "sequence", "diagnostic-therapeutic", "platform", "caution"] as const;
      const typeLabel = (t: string) => cap(t.replace("-", " → "));
      return {
        hideStatus: true,
        rows: g.kind("pairing").map((p) => ({ ...base(p), ...firstOf(techVisual(g, p.a), techVisual(g, p.b), borrowed(p)), facets: { type: [typeLabel(p.pairingType)], cancers: names(p.cancers) }, cols: { type: fl("type", typeLabel(p.pairingType)), a: links([p.a]), b: links([p.b]), cancers: links(p.cancers) }, sortKeys: { type: rank(ORDER, p.pairingType) } })),
        facets: [{ key: "type", label: "Type", searchable: false, width: "w-52", order: ORDER.map(typeLabel) }, { key: "cancers", label: "Cancer", width: "w-52" }],
        columns: [{ key: "type", label: "Type", sortable: true, chip: true, tip: "Combination: given together. Sequence: one after the other. Diagnostic → therapeutic: a test that picks the treatment. Platform: a shared technology. Caution: a pairing to avoid." }, { key: "a", label: "First", hide: "hidden md:table-cell" }, { key: "b", label: "Second", hide: "hidden md:table-cell" }, { key: "cancers", label: "Cancers", hide: "hidden lg:table-cell" }],
        defaultSort: { key: "type", dir: 1 },
      };
    }
    case "roadmap": return {
      hideStatus: true,
      rows: g.kind("roadmap").map((r) => ({ ...base(r), ...borrowed(r), facets: { cancers: names(r.cancers) }, cols: { cancers: links(r.cancers), steps: count(r.steps.length, r, "steps", "step", "of"), current: r.steps.filter((s) => s.status === "current").length, emerging: r.steps.filter((s) => s.status === "emerging").length }, sortKeys: { steps: r.steps.length } })),
      facets: [{ key: "cancers", label: "Cancer", width: "w-52" }],
      columns: [{ key: "cancers", label: "Cancers", hide: "hidden md:table-cell" }, { key: "steps", label: "Steps", sortable: true, numeric: true }, { key: "current", label: "Current", numeric: true, hide: "hidden sm:table-cell" }, { key: "emerging", label: "Emerging", numeric: true, hide: "hidden sm:table-cell" }],
    };
    case "idea": {
      /** Most evidence first: being tested at scale, early clinical, preclinical evidence, speculative. */
      const ORDER = ["being-tested-at-scale", "early-clinical", "preclinical-evidence", "speculative"] as const;
      const matLabel = (m: string) => cap(m.replace(/-/g, " "));
      return {
      hideStatus: true,
      rows: g.kind("idea").map((i) => ({ ...base(i), ...borrowed(i, true), facets: { maturity: [matLabel(i.maturity)], bottleneck: names(i.bottlenecks), actor: i.actor ? [cap(i.actor)] : [], cost: i.cost ? [cap(i.cost)] : [], cancers: names(i.cancers), technologies: names(i.technologies) }, cols: { maturity: fl("maturity", matLabel(i.maturity)), bottlenecks: links(i.bottlenecks), actor: fl("actor", i.actor ? cap(i.actor) : undefined), cost: fl("cost", i.cost ? cap(i.cost) : undefined), cancers: links(i.cancers), technologies: links(i.technologies) }, sortKeys: { maturity: rank(ORDER, i.maturity) } })),
      facets: [{ key: "bottleneck", label: "Bottleneck", width: "w-60" }, { key: "maturity", label: "Maturity", searchable: false, width: "w-52", order: ORDER.map(matLabel) }, { key: "actor", label: "Who acts", searchable: false, width: "w-44" }, { key: "cost", label: "Cost to try", searchable: false, width: "w-40" }, { key: "cancers", label: "Cancer", width: "w-52" }, { key: "technologies", label: "Technology", width: "w-52" }],
      columns: [{ key: "maturity", label: "Maturity", sortable: true, chip: true }, { key: "bottlenecks", label: "Bottleneck", hide: "hidden md:table-cell" }, { key: "actor", label: "Who acts", sortable: true, hide: "hidden lg:table-cell" }, { key: "cost", label: "Cost", sortable: true, hide: "hidden xl:table-cell" }, { key: "technologies", label: "Technologies", hide: "hidden lg:table-cell" }, { key: "cancers", label: "Cancers", hide: "hidden xl:table-cell" }],
      defaultSort: { key: "maturity", dir: 1 },
      };
    }
    case "journal": return {
      hideStatus: true,
      rows: g.kind("journal").map((j) => { const papers = g.kind("paper").filter((p) => p.journal === j.name || j.matchNames.includes(p.journal)); return { ...base(j), logo: logoFor(j.id, j.url), avatar: "org", sub: j.publisher, facets: { scope: [j.scope], access: j.access ? [cap(j.access.replace(/-/g, " "))] : [], publisher: [j.publisher] }, cols: { scope: fl("scope", j.scope), access: fl("access", j.access ? cap(j.access.replace(/-/g, " ")) : undefined), publisher: fl("publisher", j.publisher), papers: count(papers.length, j, "key-papers", "key paper", "published in"), impact: j.impactFactor ? j.impactFactor.value : undefined }, sortKeys: { papers: papers.length, impact: j.impactFactor?.value ?? 0 } }; }),
      facets: [{ key: "scope", label: "Scope", width: "w-52" }, { key: "access", label: "Access", searchable: false, width: "w-44" }, { key: "publisher", label: "Publisher", width: "w-52" }],
      columns: [{ key: "scope", label: "Scope", sortable: true, hide: "hidden md:table-cell" }, { key: "access", label: "Access", sortable: true, chip: true, hide: "hidden lg:table-cell" }, { key: "publisher", label: "Publisher", sortable: true, hide: "hidden xl:table-cell", tip: "The company or society that publishes the journal." }, { key: "papers", label: "Key papers", sortable: true, numeric: true }, { key: "impact", label: "Impact factor", sortable: true, numeric: true, hide: "hidden sm:table-cell" }],
      defaultSort: { key: "papers", dir: -1 },
    };
    case "paper": return {
      hideStatus: true,
      rows: g.kind("paper").map((p) => ({ ...base(p), logo: journalLogo(g, p.journal), sub: `${p.authors} · ${p.journal} ${p.year}`, facets: { type: [cap(p.paperType.replace(/-/g, " "))], year: [String(p.year)], journal: [p.journal], cancers: names(p.cancers), changed: [p.changedPractice ? "Changed practice" : "Did not (yet)"] }, cols: { changed: fl("changed", p.changedPractice ? "Changed practice" : "Did not (yet)"), type: fl("type", cap(p.paperType.replace(/-/g, " "))), year: fl("year", p.year), journal: journalCell(p.journal), cancers: links(p.cancers), drugs: links(p.drugs.slice(0, 3)) }, sortKeys: { year: p.year, changed: p.changedPractice ? 0 : 1 }, tie: p.year })),
      facets: [{ key: "type", label: "Type", searchable: false, width: "w-44" }, { key: "cancers", label: "Cancer", width: "w-52" }, { key: "journal", label: "Journal", width: "w-52" }, { key: "year", label: "Year", searchable: false, width: "w-32" }, { key: "changed", label: "Practice", searchable: false, width: "w-44", order: ["Changed practice", "Did not (yet)"] }],
      columns: [{ key: "changed", label: "Practice", sortable: true, tip: "Whether the paper changed what clinicians do: guidelines, approvals, or the standard of care." }, { key: "type", label: "Type", sortable: true, chip: true }, { key: "journal", label: "Journal", sortable: true, hide: "hidden md:table-cell" }, { key: "year", label: "Year", sortable: true, numeric: true }, { key: "cancers", label: "Cancers", hide: "hidden lg:table-cell" }, { key: "drugs", label: "Products", hide: "hidden xl:table-cell" }],
      // What works first: papers that changed practice at the top, newest first within each group.
      defaultSort: { key: "changed", dir: 1 },
    };
    case "bottleneck": return {
      hideStatus: true,
      rows: g.kind("bottleneck").map((b) => { const ideas = inc(b.id, "idea"); return { ...base(b), ...borrowed(b), facets: { stage: [cap(b.stage.replace(/-/g, " "))], severity: [cap(b.severity)], cancers: names(b.cancers) }, cols: { stage: fl("stage", cap(b.stage.replace(/-/g, " "))), severity: fl("severity", cap(b.severity)), ideas: count(ideas.length, b, "ideas", "idea", "to fix"), technologies: links(b.technologies.slice(0, 4)) }, sortKeys: { ideas: ideas.length, severity: b.severity === "critical" ? 0 : b.severity === "major" ? 1 : 2 } }; }),
      facets: [{ key: "stage", label: "Stage", searchable: false, width: "w-56" }, { key: "severity", label: "Severity", searchable: false, width: "w-40" }, { key: "cancers", label: "Cancer", width: "w-52" }],
      columns: [{ key: "stage", label: "Stage", sortable: true, chip: true }, { key: "severity", label: "Severity", sortable: true, chip: true }, { key: "ideas", label: "Ideas to fix it", sortable: true, numeric: true }, { key: "technologies", label: "Technologies that relieve it", hide: "hidden lg:table-cell" }],
      defaultSort: { key: "severity", dir: 1 },
    };
    case "person": return {
      hideStatus: true,
      rows: g.kind("person").map((p) => { const inst = p.institutionId ? g.get(p.institutionId) : undefined; return { ...base(p), logo: portraitSrc(p.id), round: true, avatar: "person", sub: `${p.role}${inst ? ` · ${inst.name}` : ""}`, facets: { specialism: p.specialisms, institution: inst ? [inst.name] : [], cancers: names(p.cancers), country: inst && inst.kind === "institution" ? [inst.country] : [], role: p.tags.filter((t) => t in HERO_ROLE_LABEL).map((t) => HERO_ROLE_LABEL[t]) }, cols: { institution: inst ? [link(inst, inst.name)] : undefined, specialisms: p.specialisms.map((s) => ({ facet: "specialism", value: s })), papers: count(p.papers.length, p, "papers", "paper", "by"), trials: count(p.trials.length, p, "connected", "trial", "linked to") }, sortKeys: { papers: p.papers.length, trials: p.trials.length } }; }),
      facets: [{ key: "role", label: "Heroes", searchable: false, width: "w-40", order: Object.values(HERO_ROLE_LABEL) }, { key: "specialism", label: "Specialism", width: "w-56" }, { key: "institution", label: "Institution", width: "w-56" }, { key: "cancers", label: "Cancer", width: "w-52" }, { key: "country", label: "Country", searchable: false, width: "w-40" }],
      columns: [{ key: "institution", label: "Institution", hide: "hidden md:table-cell" }, { key: "specialisms", label: "Specialisms", hide: "hidden lg:table-cell" }, { key: "papers", label: "Papers listed", sortable: true, numeric: true }, { key: "trials", label: "Trials", sortable: true, numeric: true, hide: "hidden sm:table-cell" }],
      defaultSort: { key: "name", dir: 1 },
    };
    case "collection": return {
      hideStatus: true,
      rows: g.kind("collection").map((c) => { const lic = c.license?.split(/[;(]/)[0].trim(); return { ...base(c), logo: logoFor(c.id, c.url), avatar: "org", sub: c.maintainer, facets: { license: lic ? [lic] : [] }, cols: { holds: c.holds, license: fl("license", lic, { tip: c.license && c.license !== lic ? c.license : undefined }) } }; }),
      facets: [{ key: "license", label: "Licence", searchable: false, width: "w-56" }],
      columns: [{ key: "holds", label: "Holds", hide: "hidden md:table-cell" }, { key: "license", label: "Licence", hide: "hidden lg:table-cell" }],
    };
  }
}
/** Browser-row fields for a glossary term's picture: one slot only, the most specific available. */
function termRowVisual(v: TermVisual, category: string): Partial<BrowserRow> {
  switch (v.kind) {
    case "target": return { target: v.target };
    case "molecule": return { molecule: v.drugId, modality: v.modality };
    case "tech": return { schematic: { id: v.tech.id, sections: v.tech.sections } };
    case "cancer": return { cancerIcon: v.cancerId };
    default: return { term: { category } };
  }
}

/** Logo of the journal a paper appeared in, matched by the journal's name or its alternative names. */
const journalLogoCache = new Map<string, string | undefined>();
function journalLogo(g: ReturnType<typeof graph>, journal: string): string | undefined {
  if (journalLogoCache.has(journal)) return journalLogoCache.get(journal);
  const j = g.kind("journal").find((x) => x.name === journal || x.matchNames.includes(journal));
  const src = j ? logoSrc(j.id, j.url) : undefined;
  journalLogoCache.set(journal, src); return src;
}
/** The small rotating schematic of a technology, for rows about a pairing or roadmap built on it. */
function techVisual(g: ReturnType<typeof graph>, id: string): Partial<BrowserRow> {
  const e = g.get(id); return e?.kind === "technology" ? { schematic: { id: e.id, sections: e.sections } } : {};
}

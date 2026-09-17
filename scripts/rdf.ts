/**
 * The RDF view of one record, in one place, so that the corpus N-Triples file and the per-record Turtle files
 * (both written by scripts/build-triples.ts) say the same thing. Pure functions, no I/O.
 *
 * Vocabulary: schema.org types and properties where they fit (name, description, url, sameAs for Wikipedia,
 * dateModified), owl:sameAs to Wikidata items from src/data/wikidata-ids.ts, and an OnCo namespace
 * (https://onco.cc/ns#) for the typed relationship fields (cancers, targets, drugs, ...) and kind-specific
 * scalars (status, modality, phase). Every subject is the record's own page URL, so the graph dereferences.
 */
import type { Graph } from "../src/lib/graph";
import { REL_FIELDS, routeFor, type Entity, type Kind } from "../src/lib/schema";
import { wikidataIds } from "../src/data/wikidata-ids";

export const SITE = "https://onco.cc";
export const NS = `${SITE}/ns#`;
export const SCHEMA = "https://schema.org/";
export const RDF_TYPE = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
export const OWL = "http://www.w3.org/2002/07/owl#";
export const OWL_SAME_AS = `${OWL}sameAs`;
export const XSD = "http://www.w3.org/2001/XMLSchema#";

export const TYPE: Record<Kind, string> = {
  cancer: "MedicalCondition", section: "DefinedTerm", technology: "MedicalTherapy", target: "BioChemEntity", drug: "Drug", company: "Organization",
  institution: "MedicalOrganization", pathway: "BioChemEntity", term: "DefinedTerm", trial: "MedicalTrial", pairing: "MedicalTherapy", roadmap: "CreativeWork",
  idea: "CreativeWork", collection: "Dataset", person: "Person", bottleneck: "Thing", paper: "ScholarlyArticle", journal: "Periodical",
};

/** N-Triples terms. Every term here is also a valid Turtle term, so the Turtle writer only needs to compact them. */
export const iri = (s: string) => `<${s}>`;
export const lit = (s: string, lang?: string) => `"${s.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n").replace(/\r/g, "")}"${lang ? `@${lang}` : ""}`;
export const typed = (s: string, t: string) => `"${s}"^^<${XSD}${t}>`;

/** The page URL of a record, which is also its IRI. */
export const pageIri = (e: { kind: Kind; id: string }) => `${SITE}${routeFor(e)}`;

/** A predicate IRI and an object term (N-Triples form). */
export type Triple = [predicate: string, object: string];

function scalars(e: Entity): Triple[] {
  const out: Triple[] = [];
  if (e.status) out.push([`${NS}status`, lit(e.status)]);
  for (const t of e.tags) out.push([`${NS}tag`, lit(t)]);
  switch (e.kind) {
    case "drug": out.push([`${NS}modality`, lit(e.modality)]); if (e.brand) out.push([`${SCHEMA}alternateName`, lit(e.brand)]); for (const a of e.approvals) out.push([`${NS}approval`, lit(`${a.region} ${a.year}: ${a.indication}`)]); break;
    case "trial": out.push([`${NS}phase`, lit(e.phase)]); if (e.nct) out.push([`${SCHEMA}identifier`, lit(e.nct)]); break;
    case "target": if (e.symbol) out.push([`${SCHEMA}alternateName`, lit(e.symbol)]); out.push([`${NS}targetClass`, lit(e.targetClass)]); break;
    case "company": out.push([`${SCHEMA}addressCountry`, lit(e.country)]); if (e.website) out.push([`${SCHEMA}url`, iri(e.website)]); break;
    case "institution": out.push([`${SCHEMA}addressCountry`, lit(e.country)], [`${SCHEMA}addressLocality`, lit(e.city)], [`${SCHEMA}latitude`, typed(String(e.lat), "decimal")], [`${SCHEMA}longitude`, typed(String(e.lng), "decimal")]); if (e.website) out.push([`${SCHEMA}url`, iri(e.website)]); break;
    case "paper": if (e.doi) out.push([`${SCHEMA}sameAs`, iri(`https://doi.org/${e.doi}`)]); out.push([`${SCHEMA}datePublished`, typed(String(e.year), "gYear")], [`${SCHEMA}author`, lit(e.authors)]); break;
    case "journal": out.push([`${SCHEMA}publisher`, lit(e.publisher)], [`${SCHEMA}url`, iri(e.url)]); if (e.issn) out.push([`${SCHEMA}issn`, lit(e.issn)]); break;
    case "person": out.push([`${SCHEMA}jobTitle`, lit(e.role)]); if (e.orcid) out.push([`${SCHEMA}sameAs`, iri(`https://orcid.org/${e.orcid}`)]); break;
    case "collection": out.push([`${SCHEMA}url`, iri(e.url)]); if (e.license) out.push([`${SCHEMA}license`, lit(e.license)]); break;
    default: break;
  }
  return out;
}

/**
 * Every triple whose subject is the record: its type and scalars, its outgoing relations (as the IRIs of the
 * neighbours' pages) and its owl:sameAs to Wikidata. The subject itself is `pageIri(e)`.
 */
export function recordTriples(g: Graph, e: Entity): Triple[] {
  const s = iri(pageIri(e));
  const out: Triple[] = [];
  const add = (p: string, o: string) => out.push([p, o]);
  add(RDF_TYPE, iri(`${SCHEMA}${TYPE[e.kind]}`));
  add(`${NS}kind`, lit(e.kind));
  add(`${SCHEMA}identifier`, lit(e.id));
  add(`${SCHEMA}name`, lit(e.name, "en"));
  for (const a of e.aka) add(`${SCHEMA}alternateName`, lit(a, "en"));
  add(`${SCHEMA}description`, lit(e.tldr, "en"));
  add(`${SCHEMA}url`, s);
  add(`${SCHEMA}dateModified`, typed(e.asOf, "date"));
  if (e.wikipedia) add(`${SCHEMA}sameAs`, iri(e.wikipedia));
  const qid = wikidataIds[e.id];
  if (qid) add(OWL_SAME_AS, iri(`http://www.wikidata.org/entity/${qid}`));
  for (const l of e.links) add(`${SCHEMA}citation`, iri(l.url));
  for (const [p, o] of scalars(e)) add(p, o);
  for (const f of REL_FIELDS) for (const to of e[f]) add(`${NS}${f}`, iri(pageIri(g.must(to))));
  if (e.kind === "pairing") { add(`${NS}pairs`, iri(pageIri(g.must(e.a)))); add(`${NS}pairs`, iri(pageIri(g.must(e.b)))); }
  if (e.kind === "cancer") { for (const p of e.pipeline) add(`${NS}pipeline`, iri(pageIri(g.must(p)))); for (const r of e.standardOfCare) for (const ref of r.refs) add(`${NS}standardOfCare`, iri(pageIri(g.must(ref)))); }
  if (e.kind === "person" && e.institutionId) add(`${SCHEMA}affiliation`, iri(pageIri(g.must(e.institutionId))));
  return out;
}

/** The record's triples as N-Triples lines (no trailing newline on the last line). */
export function toNTriples(e: Entity, triples: Triple[]): string[] {
  const s = iri(pageIri(e));
  return triples.map(([p, o]) => `${s} ${iri(p)} ${o} .`);
}

/** Prefixes the Turtle writer may use, in the order they are declared. Only those a file uses are declared in it. */
export const TURTLE_PREFIXES: ReadonlyArray<readonly [prefix: string, namespace: string]> = [
  ["schema", SCHEMA],
  ["onco", NS],
  ["owl", OWL],
  ["xsd", XSD],
];

/** A safe Turtle local name: letters and digits only, so nothing needs escaping. Every term in our vocabularies fits. */
const LOCAL = /^[A-Za-z][A-Za-z0-9]*$/;

/**
 * One record as Turtle: a header comment, the prefixes the file uses (declared once), then a single subject with a
 * predicate-object list; objects sharing a predicate are joined with commas. `rdf:type` is written as `a`. Terms that
 * do not fit a declared prefix stay as full IRIs, so nothing is lost and no blank nodes appear.
 */
export function toTurtle(e: Entity, triples: Triple[]): string {
  const used = new Set<string>();
  const compact = (term: string): string => {
    if (term.startsWith("<")) {
      const full = term.slice(1, -1);
      for (const [prefix, ns] of TURTLE_PREFIXES) {
        if (full.startsWith(ns) && LOCAL.test(full.slice(ns.length))) { used.add(prefix); return `${prefix}:${full.slice(ns.length)}`; }
      }
      return term;
    }
    const m = /^("[\s\S]*")\^\^<([^>]+)>$/.exec(term);
    if (m && m[2].startsWith(XSD) && LOCAL.test(m[2].slice(XSD.length))) { used.add("xsd"); return `${m[1]}^^xsd:${m[2].slice(XSD.length)}`; }
    return term;
  };
  const byPredicate = new Map<string, string[]>();
  for (const [p, o] of triples) {
    const key = p === RDF_TYPE ? "a" : compact(iri(p));
    const list = byPredicate.get(key) ?? [];
    list.push(compact(o));
    byPredicate.set(key, list);
  }
  const body = [...byPredicate].map(([p, objects]) => `  ${p} ${objects.join(", ")}`);
  const header = [`# OnCo record ${e.id} (${e.kind}). Data CC BY-NC 4.0, attribute "Data from OnCo (onco.cc)". Whole corpus: ${SITE}/api/v1/onco.nt`];
  for (const [prefix, ns] of TURTLE_PREFIXES) if (used.has(prefix)) header.push(`@prefix ${prefix}: <${ns}> .`);
  return `${header.join("\n")}\n\n${iri(pageIri(e))}\n${body.join(" ;\n")} .\n`;
}

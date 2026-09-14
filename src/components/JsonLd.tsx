import type { Entity } from "@/lib/schema";
import { KIND_META, routeFor } from "@/lib/schema";
import { graph } from "@/lib/graph";
import { SITE, SITE_NAME, absoluteUrl, entityCrumbs, type Crumb } from "@/lib/seo";

type Node = Record<string, unknown>;
const CTX = "https://schema.org";
const LICENSE_URL = "https://creativecommons.org/licenses/by-nc/4.0/";

/** One `<script type="application/ld+json">`. `undefined` fields are dropped; `<` is escaped so the script cannot be closed early. */
function Script({ data }: { data: Node }) {
  const json = JSON.stringify(JSON.parse(JSON.stringify(data))).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}

/** Distinct, non-empty values; `undefined` when nothing is left so the key is dropped rather than emitted as `[]`. */
const uniq = <T,>(xs: Array<T | undefined>): T[] | undefined => {
  const out = [...new Set(xs.filter((x): x is T => x !== undefined && x !== null && x !== ""))];
  return out.length ? out : undefined;
};
const shortName = (s: string) => s.replace(/ \(.*\)$/, "");

/** Reference to another OnCo record: name plus the page it lives on. */
function ref(id: string, type: string): Node | undefined {
  const x = graph().get(id);
  return x ? { "@type": type, name: x.name, url: absoluteUrl(routeFor(x)) } : undefined;
}

/** Organization reference: company/institution website when we have one, else the OnCo page. */
function orgRef(id: string): Node | undefined {
  const x = graph().get(id);
  if (!x) return undefined;
  const website = "website" in x ? x.website : undefined;
  return { "@type": "Organization", name: x.name, url: website ?? absoluteUrl(routeFor(x)), sameAs: website ? absoluteUrl(routeFor(x)) : undefined };
}

const INSTITUTION_TYPE: Record<string, string> = {
  university: "CollegeOrUniversity",
  hospital: "Hospital",
  "cancer-center": "MedicalOrganization",
  "research-institute": "ResearchOrganization",
  government: "GovernmentOrganization",
  consortium: "Organization",
};

/** schema.org MedicalStudyStatus values we can map without guessing. */
const TRIAL_STATUS: Record<string, string> = { recruiting: "Recruiting", completed: "Completed", withdrawn: "Withdrawn", planned: "NotYetRecruiting" };

/** Regulatory status as text, from the sourced approvals list; omitted when there is nothing to say. */
function legalStatus(e: Extract<Entity, { kind: "drug" }>): string | undefined {
  if (e.approvals.length) {
    const first = new Map<string, number>();
    for (const a of e.approvals) first.set(a.region, Math.min(first.get(a.region) ?? a.year, a.year));
    return `Approved: ${[...first].sort((a, b) => a[1] - b[1]).map(([r, y]) => `${r} (${y})`).join(", ")}`;
  }
  if (e.status === "withdrawn") return "Withdrawn";
  if (e.status && /^phase-|^preclinical$/.test(e.status)) return "Investigational";
  return undefined;
}

/** The typed node for one entity. Only fields present in the record are emitted; nothing is inferred. */
function entityNode(e: Entity): Node {
  const url = absoluteUrl(routeFor(e));
  const base: Node = { "@context": CTX, "@type": "Thing", "@id": url, name: e.name, description: e.tldr, url, alternateName: e.aka.length ? e.aka : undefined, sameAs: e.wikipedia, dateModified: e.asOf, license: LICENSE_URL, isPartOf: { "@id": `${SITE}/api/#dataset` }, subjectOf: { "@type": "DigitalDocument", url: `${SITE}/api/v1/context/${e.id}.md`, encodingFormat: "text/markdown" } };
  switch (e.kind) {
    case "drug":
      return {
        ...base,
        "@type": "Drug",
        nonProprietaryName: shortName(e.name),
        alternateName: uniq([...e.aka, e.brand, e.code]),
        drugClass: e.modality,
        mechanismOfAction: e.mechanism,
        administrationRoute: e.dosing?.route,
        manufacturer: e.companies.length ? e.companies.map(orgRef).filter(Boolean) : undefined,
        legalStatus: legalStatus(e),
        indication: uniq(e.approvals.map((a) => a.indication))?.map((name) => ({ "@type": "ApprovedIndication", name })),
      };
    case "cancer":
      return { ...base, "@type": "MedicalCondition", possibleTreatment: e.drugs.length ? e.drugs.slice(0, 25).map((id) => ref(id, "Drug")).filter(Boolean) : undefined };
    case "trial":
      return {
        ...base,
        "@type": "MedicalTrial",
        identifier: e.nct,
        phase: e.phase && /^\d/.test(e.phase) ? `Phase ${e.phase}` : undefined,
        status: e.status ? TRIAL_STATUS[e.status] : undefined,
        sponsor: e.sponsor ? { "@type": "Organization", name: e.sponsor } : undefined,
        studySubject: e.drugs.length ? e.drugs.map((id) => ref(id, "Drug")).filter(Boolean) : undefined,
        healthCondition: e.cancers.length ? e.cancers.map((id) => ref(id, "MedicalCondition")).filter(Boolean) : undefined,
        sameAs: uniq([e.wikipedia, e.nct ? `https://clinicaltrials.gov/study/${e.nct}` : undefined]),
      };
    case "company":
      return {
        ...base,
        "@type": "Organization",
        url: e.website,
        mainEntityOfPage: url,
        sameAs: uniq([e.wikipedia, url]),
        address: { "@type": "PostalAddress", addressLocality: e.hq, addressCountry: e.country.toUpperCase() },
        foundingDate: e.founded ? String(e.founded) : undefined,
        tickerSymbol: e.ticker,
      };
    case "institution":
      return {
        ...base,
        "@type": INSTITUTION_TYPE[e.institutionType] ?? "Organization",
        url: e.website,
        mainEntityOfPage: url,
        sameAs: uniq([e.wikipedia, url]),
        address: { "@type": "PostalAddress", addressLocality: e.city, addressCountry: e.country.toUpperCase() },
        geo: { "@type": "GeoCoordinates", latitude: e.lat, longitude: e.lng },
        parentOrganization: e.university ? { "@type": "CollegeOrUniversity", name: e.university } : undefined,
      };
    case "journal":
      return {
        ...base,
        "@type": "Periodical",
        url: e.url,
        mainEntityOfPage: url,
        sameAs: uniq([e.wikipedia, url]),
        issn: e.issn,
        publisher: { "@type": "Organization", name: e.publisher },
      };
    case "paper":
      return {
        ...base,
        "@type": "MedicalScholarlyArticle",
        headline: e.name,
        author: e.authors,
        datePublished: String(e.year),
        isPartOf: { "@type": "Periodical", name: e.journal },
        identifier: uniq([e.doi ? { "@type": "PropertyValue", propertyID: "DOI", value: e.doi } : undefined, e.pmid ? { "@type": "PropertyValue", propertyID: "PMID", value: e.pmid } : undefined]),
        sameAs: uniq([e.wikipedia, e.doi ? `https://doi.org/${e.doi}` : undefined, e.pmid ? `https://pubmed.ncbi.nlm.nih.gov/${e.pmid}/` : undefined]),
      };
    case "person":
      return {
        ...base,
        "@type": "Person",
        jobTitle: e.role,
        affiliation: e.institutionId ? orgRef(e.institutionId) : undefined,
        knowsAbout: e.specialisms.length ? e.specialisms : undefined,
        sameAs: uniq([e.wikipedia, e.orcid ? (e.orcid.startsWith("http") ? e.orcid : `https://orcid.org/${e.orcid}`) : undefined, ...e.profiles.map((p) => p.url)]),
      };
    case "term":
      return { ...base, "@type": "DefinedTerm", inDefinedTermSet: { "@type": "DefinedTermSet", name: `${SITE_NAME} glossary`, url: `${SITE}/terms/` } };
    case "collection":
      return { ...base, "@type": "DataCatalog", url: e.url, mainEntityOfPage: url, sameAs: uniq([e.wikipedia, url]), license: e.license, provider: e.maintainer ? { "@type": "Organization", name: e.maintainer } : undefined };
    default:
      return base;
  }
}

/** schema.org BreadcrumbList for a crumb trail; the visible `Breadcrumbs` component renders the same list. */
export function breadcrumbNode(items: Crumb[]): Node {
  return {
    "@context": CTX,
    "@type": "BreadcrumbList",
    itemListElement: items.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.label, item: absoluteUrl(c.href) })),
  };
}

/** JSON-LD for an entity page: the typed entity plus its breadcrumb trail. */
export function JsonLd({ e }: { e: Entity }) {
  return (
    <>
      <Script data={entityNode(e)} />
      <Script data={breadcrumbNode(entityCrumbs(e))} />
    </>
  );
}

/** BreadcrumbList on its own, for non-entity pages that show a trail. */
export function BreadcrumbJsonLd({ items }: { items: Crumb[] }) {
  return <Script data={breadcrumbNode(items)} />;
}

/** Dataset node for the API and About pages: the corpus as a citable, licensed, downloadable dataset with every distribution listed. */
export function DatasetJsonLd() {
  const g = graph();
  const counts = Object.entries(KIND_META).map(([k, m]) => `${g.kind(k as Entity["kind"]).length} ${m.label.toLowerCase()}`).join(", ");
  const dl = (path: string, format: string, name: string) => ({ "@type": "DataDownload", name, contentUrl: `${SITE}${path}`, encodingFormat: format });
  return (
    <Script
      data={{
        "@context": CTX,
        "@type": "Dataset",
        "@id": `${SITE}/api/#dataset`,
        name: "OnCo: a cited knowledge graph of oncology",
        description: `${g.entities.length.toLocaleString("en-GB")} records across ${counts}, each with a plain-English TL;DR, a technical summary, dated facts and links to primary sources. Not medical advice.`,
        url: `${SITE}/api/`,
        sameAs: ["https://github.com/judegomila/OnCo"],
        license: LICENSE_URL,
        isAccessibleForFree: true,
        creator: { "@type": "Organization", name: SITE_NAME, url: SITE },
        publisher: { "@type": "Organization", name: SITE_NAME, url: SITE },
        citation: "https://github.com/judegomila/OnCo/blob/main/CITATION.cff",
        keywords: ["oncology", "cancer", "clinical trials", "targeted therapy", "immunotherapy", "knowledge graph", "drug approvals", "cancer centres"],
        inLanguage: "en",
        distribution: [
          dl("/api/v1/all.json", "application/json", "Every record (JSON)"),
          dl("/api/v1/all.ndjson", "application/x-ndjson", "Every record (NDJSON)"),
          dl("/api/v1/onco.nt", "application/n-triples", "RDF triples"),
          dl("/api/v1/schema.json", "application/schema+json", "JSON Schema"),
          dl("/api/v1/openapi.json", "application/vnd.oai.openapi+json", "OpenAPI 3.1"),
          dl("/llms-full.txt", "text/plain", "Full corpus for language models"),
          dl("/llms.txt", "text/plain", "Corpus guide for language models"),
        ],
      }}
    />
  );
}

/** WebSite node for the home page. The SearchAction target is /explore/, which reads `?q=` into its text filter. */
export function WebSiteJsonLd({ description }: { description: string }) {
  return (
    <Script
      data={{
        "@context": CTX,
        "@type": "WebSite",
        "@id": `${SITE}/#website`,
        name: SITE_NAME,
        url: `${SITE}/`,
        description,
        inLanguage: "en",
        potentialAction: {
          "@type": "SearchAction",
          target: { "@type": "EntryPoint", urlTemplate: `${SITE}/explore/?q={search_term_string}` },
          "query-input": "required name=search_term_string",
        },
      }}
    />
  );
}

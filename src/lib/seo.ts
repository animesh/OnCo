import type { Metadata } from "next";
import { KIND_META, routeFor, type Entity, type Kind } from "./schema";

/** Canonical origin. Every canonical URL, sitemap entry and JSON-LD `url` is built from this. */
export const SITE = "https://onco.cc";
export const SITE_NAME = "OnCo";

/** Absolute URL for a site path (paths are always `/…/` because `trailingSlash: true`). */
export const absoluteUrl = (path: string) => `${SITE}${path.startsWith("/") ? path : `/${path}`}`;

export const cap = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

/** Public display name of a kind: "Treatments & tests" for drugs, else the capitalised plural. */
export const kindTitle = (k: Kind) => KIND_META[k].title ?? cap(KIND_META[k].plural);

/**
 * Meta description from a TL;DR: whole sentences up to `max` characters; if the first sentence alone is too long,
 * cut at a word boundary and add an ellipsis. Never returns a fragment that ends mid-word.
 */
export function describe(text: string, max = 155): string {
  const t = text.replace(/\s+/g, " ").trim();
  if (t.length <= max) return t;
  const sentences = t.split(/(?<=[.!?])\s+/);
  let out = "";
  for (const s of sentences) {
    const next = out ? `${out} ${s}` : s;
    if (next.length > max) break;
    out = next;
  }
  if (out) return out;
  const cut = t.slice(0, max - 1);
  const atWord = cut.lastIndexOf(" ");
  return `${(atWord > max / 2 ? cut.slice(0, atWord) : cut).replace(/[,;:\s]+$/, "")}…`;
}

/**
 * Metadata for a page: canonical URL, Open Graph and Twitter copies of the title/description, and an explicit
 * index/follow. The site Open Graph image comes from `src/app/opengraph-image.png` (file-based metadata) and is
 * applied by Next on top of this, so it is not repeated here. `title` is the page part only; the root layout
 * template appends " · OnCo" to `<title>` and we mirror that for the social cards.
 */
export const FEED_TYPES = { "application/atom+xml": [ { url: "/feeds/changelog.xml", title: "OnCo changelog" }, { url: "/feeds/regulatory.xml", title: "OnCo regulatory events" }, { url: "/feeds/calendar.xml", title: "OnCo readout calendar" }, { url: "/feeds/pulse.xml", title: "OnCo research pulse" } ] };

export function pageMeta({ title, description, path, absoluteTitle, noindex }: { title: string; description: string; path: string; absoluteTitle?: string; noindex?: boolean }): Metadata {
  const fullTitle = absoluteTitle ?? `${title} · ${SITE_NAME}`;
  const url = absoluteUrl(path);
  const desc = describe(description);
  return {
    title: absoluteTitle ? { absolute: absoluteTitle } : title,
    description: desc,
    alternates: { canonical: url, types: FEED_TYPES },
    openGraph: { title: fullTitle, description: desc, url, siteName: SITE_NAME, type: "website", locale: "en_GB", images: [{ url: `${SITE}/og.png`, width: 1200, height: 630, alt: SITE_NAME }] },
    twitter: { card: "summary_large_image", title: fullTitle, description: desc, images: [`${SITE}/og.png`] },
    robots: noindex ? { index: false, follow: true } : { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large", "max-video-preview": -1 },
  };
}

/** Search engines show about this many characters of a <title>; longer ones are cut mid-word, so we cut at a word boundary first. */
export const TITLE_MAX = 60;

/** `text` cut at a word boundary so that it plus `reserve` more characters fits `TITLE_MAX`; unchanged when it already fits. */
export function shortTitle(text: string, reserve: number): string {
  const t = text.replace(/\s+/g, " ").trim();
  const budget = TITLE_MAX - reserve;
  if (t.length <= budget) return t;
  const cut = t.slice(0, budget - 1);
  const atWord = cut.lastIndexOf(" ");
  return `${(atWord > budget / 2 ? cut.slice(0, atWord) : cut).replace(/[,;:(\-\s]+$/, "")}…`;
}

/**
 * "Name · Kind" (layout template adds " · OnCo"). Long names, mostly registry trial titles and paper titles, are cut
 * at a word boundary so the whole <title> stays within `TITLE_MAX`. A trial's registry id stands in for the kind
 * label: people search by NCT number, and the id says "trial" on its own.
 */
export function entityTitle(e: Entity): string {
  const tail = e.kind === "trial" && e.nct ? e.nct : KIND_META[e.kind].label;
  return `${shortTitle(e.name, ` · ${tail} · ${SITE_NAME}`.length)} · ${tail}`;
}

/** One machine-readable twin of a record: site path, media type and a link title. */
export type MachineRoute = { url: string; type: string; title: string };

/**
 * The machine-readable twins of one record. Shared by the `<link rel="alternate">` tags (`entityMeta`), the JSON-LD
 * `subjectOf` and the hidden agent block (`MachineLinks`), so the three always name the same files.
 */
export function machineRoutes(e: { id: string; name: string }): { json: MachineRoute; markdown: MachineRoute } {
  return {
    json: { url: `/api/v1/entities/${e.id}.json`, type: "application/json", title: `${e.name}: JSON record with neighbours` },
    markdown: { url: `/api/v1/context/${e.id}.md`, type: "text/markdown", title: `${e.name}: Markdown context for language models` },
  };
}

/**
 * Corpus-level machine entry points, for the hidden agent block and llms.txt. Tool names are the ones registered by
 * packages/onco-mcp/src/server.ts and src/lib/webmcp-tools.ts; src/lib/agent-surface.test.ts keeps them in step.
 */
export const MACHINE = {
  api: "/api/",
  meta: "/api/v1/meta.json",
  openapi: "/api/v1/openapi.json",
  search: "/api/v1/search.json",
  triples: "/api/v1/onco.nt",
  llms: "/llms.txt",
  mcp: { command: "npx -y onco-mcp", tools: ["search", "get_entity", "list_kind", "ask", "context", "compare"] },
  webmcp: { tools: ["onco_search", "onco_get_entity"] },
} as const;

/** Metadata for an entity page. */
export function entityMeta(e: Entity): Metadata {
  const m = pageMeta({ title: entityTitle(e), description: e.tldr, path: routeFor(e) });
  // Machine-readable twins of the page, so agents and crawlers find the Markdown context and the JSON record from the HTML.
  const { json, markdown } = machineRoutes(e);
  const types = { ...FEED_TYPES, [markdown.type]: [{ url: markdown.url, title: markdown.title }], [json.type]: [{ url: json.url, title: json.title }] };
  return { ...m, alternates: { ...m.alternates, types } };
}

export type Crumb = { label: string; href: string };

/** Home › Kind › Name. Shared by the visible breadcrumb and the BreadcrumbList JSON-LD so they always agree. */
export function entityCrumbs(e: Entity): Crumb[] {
  return [
    { label: "Home", href: "/" },
    { label: kindTitle(e.kind), href: `/${KIND_META[e.kind].route}/` },
    { label: e.name, href: routeFor(e) },
  ];
}

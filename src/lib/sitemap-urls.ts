import { regimens } from "../data/regimens";
import { guidelineCancerIds } from "./guidelines";
import { sequencingIndex } from "./sequencing";
import { existsSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { graph } from "./graph";
import { KIND_META, KINDS, routeFor } from "./schema";
import { NAV_GROUPS } from "./nav";
import { digests } from "../data/digests";
import { paths } from "../data/paths";
import { absoluteUrl } from "./seo";

export type SitemapUrl = { url: string; lastModified?: string };

/** Sitemaps are capped at 50,000 URLs by the protocol; we split well before that. */
export const SITEMAP_CHUNK = 45_000;

/** Routes that other work may add; listed only if a page exists for them at build time. */
const GUARDED_ROUTES = ["/coverage/us/", "/coverage/uk/", "/roadmap/", "/mechanics/", "/heroes/"];

/** Routes that render but should not be in the sitemap (iframe cards, JSON). */
const EXCLUDED_PREFIXES = ["/embed/", "/saved/", "/offline/"];

const APP_DIR = join(process.cwd(), "src", "app");

/**
 * Does `src/app` contain a literal page for this route? Route groups `(x)` are transparent; dynamic `[param]`
 * directories deliberately do not match, because a static export only serves the params it generated.
 */
export function routeExists(route: string, dir = APP_DIR): boolean {
  const segs = route.split("/").filter(Boolean);
  const walk = (d: string, i: number): boolean => {
    if (!existsSync(d)) return false;
    if (i === segs.length) return existsSync(join(d, "page.tsx"));
    const entries = readdirSync(d, { withFileTypes: true }).filter((x) => x.isDirectory());
    for (const x of entries) {
      if (x.name.startsWith("(") && walk(join(d, x.name), i)) return true;
      if (x.name === segs[i] && walk(join(d, x.name), i + 1)) return true;
    }
    return false;
  };
  return walk(dir, 0);
}

/** Every fully static route under `src/app` (no dynamic segments), as `/a/b/`. */
export function staticRoutes(dir = APP_DIR): string[] {
  const out: string[] = [];
  const walk = (d: string, prefix: string) => {
    if (!existsSync(d)) return;
    if (existsSync(join(d, "page.tsx"))) out.push(prefix || "/");
    for (const x of readdirSync(d, { withFileTypes: true })) {
      if (!x.isDirectory() || x.name.startsWith("[") || x.name.startsWith("_")) continue;
      walk(join(d, x.name), x.name.startsWith("(") ? prefix : `${prefix}${x.name}/`);
    }
  };
  walk(dir, "/");
  return out.map((r) => (r === "/" ? r : r.startsWith("/") ? r : `/${r}`));
}

const later = (a?: string, b?: string) => (!a ? b : !b ? a : a > b ? a : b);

/** Every indexable URL on the site, deduplicated, with `lastModified` where a record carries an `asOf` date. */
export function sitemapUrls(): SitemapUrl[] {
  const g = graph();
  const seen = new Set<string>();
  const out: SitemapUrl[] = [];
  const add = (path: string, lastModified?: string) => {
    if (EXCLUDED_PREFIXES.some((p) => path.startsWith(p))) return;
    const url = absoluteUrl(path);
    if (seen.has(url)) return;
    seen.add(url);
    out.push(lastModified ? { url, lastModified } : { url });
  };

  const newest: Partial<Record<string, string>> = {};
  let newestAll: string | undefined;
  for (const e of g.entities) {
    newest[e.kind] = later(newest[e.kind], e.asOf);
    newestAll = later(newestAll, e.asOf);
  }

  add("/", newestAll);
  for (const k of KINDS) add(`/${KIND_META[k].route}/`, newest[k]);
  for (const grp of NAV_GROUPS) {
    add(grp.href);
    for (const it of grp.items) if (it.href.startsWith("/")) add(it.href);
  }
  for (const r of staticRoutes()) add(r);
  for (const r of GUARDED_ROUTES) if (routeExists(r)) add(r);
  for (const d of digests) add(`/digests/${d.id}/`);
  for (const p of paths) add(`/paths/${p.id}/`);
  for (const e of g.entities) add(routeFor(e), e.asOf);
  for (const t of graph().kind("target")) out.push({ url: absoluteUrl(`/dossiers/${t.id}/`), lastModified: t.asOf });
  for (const r of regimens) out.push({ url: absoluteUrl(`/regimens/${r.id}/`), lastModified: r.asOf });
  for (const c of sequencingIndex()) out.push({ url: absoluteUrl(`/sequencing/${c.id}/`) });
  for (const c of g.kind("cancer")) { add(`/first-60-days/${c.id}/`, c.asOf); add(`/prep/${c.id}/`, c.asOf); }
  for (const id of guidelineCancerIds()) out.push({ url: absoluteUrl(`/guidelines/${id}/`) });
  return out;
}

export function chunkUrls<T>(urls: T[], size = SITEMAP_CHUNK): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < urls.length; i += size) chunks.push(urls.slice(i, i + size));
  return chunks.length ? chunks : [[]];
}

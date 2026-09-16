/* OnCo service worker: offline for a static site.
 *
 * Strategy
 *  - shell (home, offline page, manifest) is cached on install;
 *  - hashed build assets under /_next/static/ are cache-first (immutable by construction);
 *  - the search index and entity JSON under /api/v1/ are stale-while-revalidate;
 *  - molecule structures, logos and other media are cache-first on demand;
 *  - page navigations are network-first with a short timeout, then the cached copy, then /offline/.
 * Visited pages accumulate in the page cache, capped at PAGE_LIMIT entries (oldest evicted).
 * Bump VERSION to drop every old cache on the next activation. Registered by src/components/RegisterSW.tsx.
 */
const VERSION = "onco-v2";
const SHELL_CACHE = `${VERSION}-shell`;
const PAGE_CACHE = `${VERSION}-pages`;
const ASSET_CACHE = `${VERSION}-assets`;
const DATA_CACHE = `${VERSION}-data`;
const MEDIA_CACHE = `${VERSION}-media`;
const SHELL = ["/", "/offline/", "/manifest.webmanifest", "/saved/"];
const PAGE_LIMIT = 200;
const MEDIA_LIMIT = 400;
const NETWORK_TIMEOUT_MS = 6000;

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(SHELL_CACHE).then((c) => c.addAll(SHELL).catch(() => undefined)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  );
});

self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") self.skipWaiting();
});

const isNavigation = (req) => req.mode === "navigate" || (req.headers.get("accept") || "").includes("text/html");

async function trim(cacheName, limit) {
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  for (let i = 0; i < keys.length - limit; i++) await cache.delete(keys[i]);
}

async function cacheFirst(req, cacheName, limit) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(req);
  if (hit) return hit;
  const res = await fetch(req);
  if (res.ok) { cache.put(req, res.clone()); if (limit) trim(cacheName, limit); }
  return res;
}

async function staleWhileRevalidate(req, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(req);
  const refresh = fetch(req).then((res) => { if (res.ok) cache.put(req, res.clone()); return res; }).catch(() => undefined);
  return hit || (await refresh) || Response.error();
}

async function networkFirstPage(req) {
  const cache = await caches.open(PAGE_CACHE);
  try {
    // Give the network a head start; after the timeout serve a cached copy if there is one, otherwise keep waiting for the
    // network. The offline page is for a real network failure, not a slow connection or a cold edge.
    const network = fetch(req).then((res) => { if (res && res.ok) { cache.put(req, res.clone()); trim(PAGE_CACHE, PAGE_LIMIT); } return res; });
    const timeout = new Promise((resolve) => setTimeout(() => resolve(null), NETWORK_TIMEOUT_MS));
    const first = await Promise.race([network.catch(() => null), timeout]);
    if (first) return first;
    const cached = (await cache.match(req)) || (await cache.match(req, { ignoreSearch: true }));
    if (cached) return cached;
    return await network;
  } catch {
    const hit = (await cache.match(req)) || (await cache.match(req, { ignoreSearch: true }));
    if (hit) return hit;
    const shell = await caches.open(SHELL_CACHE);
    return (await shell.match(req, { ignoreSearch: true })) || (await shell.match("/offline/")) || Response.error();
  }
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (url.pathname.startsWith("/_next/static/")) { event.respondWith(cacheFirst(req, ASSET_CACHE)); return; }
  if (url.pathname.startsWith("/api/v1/") || url.pathname === "/provenance.json" || url.pathname.startsWith("/feeds/")) { event.respondWith(staleWhileRevalidate(req, DATA_CACHE)); return; }
  if (/^\/(structures|logos|globocan|openalex|trials|papers)\//.test(url.pathname) || /\.(svg|png|jpg|jpeg|webp|ico|woff2?|json)$/.test(url.pathname)) { event.respondWith(cacheFirst(req, MEDIA_CACHE, MEDIA_LIMIT)); return; }
  if (isNavigation(req)) { event.respondWith(networkFirstPage(req)); return; }
});

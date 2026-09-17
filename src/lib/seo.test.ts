import { describe as suite, it, expect } from "vitest";
import { describe, pageMeta, shortTitle, TITLE_MAX } from "./seo";
import { sitemapUrls, chunkUrls, SITEMAP_CHUNK, routeExists } from "./sitemap-urls";

suite("describe", () => {
  it("returns short text unchanged", () => {
    expect(describe("Short.")).toBe("Short.");
  });
  it("keeps whole sentences under the limit", () => {
    const a = "First sentence here.", b = "Second sentence is quite a bit longer than the first one and pads it out.", c = "Third sentence that would push it over the limit by a comfortable margin.";
    const d = describe(`${a} ${b} ${c}`);
    expect(d).toBe(`${a} ${b}`);
    expect(d.length).toBeLessThanOrEqual(155);
  });
  it("cuts a single overlong sentence at a word boundary with an ellipsis", () => {
    const d = describe("word ".repeat(60).trim());
    expect(d.length).toBeLessThanOrEqual(155);
    expect(d.endsWith("…")).toBe(true);
    expect(d).not.toMatch(/\s…$/);
  });
});

suite("shortTitle", () => {
  it("returns a fitting name unchanged", () => {
    expect(shortTitle("Trastuzumab deruxtecan", 20)).toBe("Trastuzumab deruxtecan");
  });
  it("cuts at a word boundary, drops trailing punctuation and adds an ellipsis", () => {
    const t = shortTitle("A Study to Evaluate the Safety, Tolerability, Pharmacokinetics, and Preliminary Antitumor Activity of X", 21);
    expect(t.length + 21).toBeLessThanOrEqual(TITLE_MAX);
    expect(t.endsWith("…")).toBe(true);
    expect(t).not.toMatch(/[,\s]…$/);
  });
});

suite("pageMeta", () => {
  it("sets canonical, social copies and index/follow", () => {
    const m = pageMeta({ title: "Cancers", description: "One page per disease.", path: "/cancers/" });
    expect(m.alternates?.canonical).toBe("https://onco.cc/cancers/");
    expect(m.robots).toEqual({ index: true, follow: true, "max-snippet": -1, "max-image-preview": "large", "max-video-preview": -1 });
    expect((m.openGraph as { url?: string }).url).toBe("https://onco.cc/cancers/");
    expect((m.twitter as { title?: string }).title).toBe("Cancers · OnCo");
  });
});

suite("sitemapUrls", () => {
  const urls = sitemapUrls();
  it("lists the home page, every kind index, every nav route and every entity, once each, excluding embeds", () => {
    const set = new Set(urls.map((u) => u.url));
    expect(set.size).toBe(urls.length);
    expect(set.has("https://onco.cc/")).toBe(true);
    expect(set.has("https://onco.cc/cancers/")).toBe(true);
    expect(set.has("https://onco.cc/explore/")).toBe(true);
    expect(set.has("https://onco.cc/regulatory/regions/")).toBe(true);
    expect(urls.length).toBeGreaterThan(1000);
    for (const u of urls) {
      expect(u.url.startsWith("https://onco.cc/")).toBe(true);
      expect(u.url.endsWith("/")).toBe(true);
      expect(u.url).not.toContain("/embed/");
    }
  });
  it("guards optional routes by checking the app directory for a literal page", () => {
    expect(routeExists("/about/")).toBe(true);
    expect(routeExists("/regulatory/regions/")).toBe(true);
    expect(routeExists("/cancers/")).toBe(false); // served by [kind], not a literal page
    expect(routeExists("/definitely-not-a-route/")).toBe(false);
  });
  it("chunks at the sitemap size limit", () => {
    expect(chunkUrls(urls).length).toBe(Math.ceil(urls.length / SITEMAP_CHUNK));
    expect(chunkUrls(urls, 10).length).toBe(Math.ceil(urls.length / 10));
  });
});

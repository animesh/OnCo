import type { MetadataRoute } from "next";
import { SITE } from "@/lib/seo";

/** Required for metadata routes under `output: "export"`. AI agents get an explicit allow so the JSON API is open to them; see docs/LAUNCH.md. */
export const dynamic = "force-static";

/**
 * `out/robots.txt`. Everything is crawlable except the raw JSON under /api/v1/: it duplicates every entity page
 * as a JSON blob, so letting it into the index would surface ~8,000 machine-readable duplicates next to the real
 * pages. The /api/ documentation page stays indexable and the JSON stays fetchable by anything that ignores robots.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      // AI assistants and their crawlers: the whole site including the JSON API, so agents can read records directly.
      { userAgent: ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-User", "Claude-SearchBot", "anthropic-ai", "PerplexityBot", "Perplexity-User", "Google-Extended", "Applebot-Extended", "CCBot", "meta-externalagent", "Amazonbot", "DuckAssistBot", "YouBot", "cohere-ai", "MistralAI-User"], allow: ["/", "/api/v1/"] },
      // Search engines: every page, the Markdown context, but not the raw JSON duplicates.
      { userAgent: "*", allow: ["/", "/api/v1/context/"], disallow: ["/api/v1/"] },
    ],
    sitemap: `${SITE}/sitemap.xml`,
  };
}

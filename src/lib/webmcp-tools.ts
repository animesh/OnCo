import { z } from "zod";
import { KINDS } from "./schema";
import { EXPORT_LICENCE } from "./csv";
import type { WebMCPTool } from "./webmcp";

const searchInput = z.object({
  query: z.string().trim().min(1).max(300),
  kind: z.enum(KINDS).optional(),
  limit: z.number().int().min(1).max(20).default(10),
}).strict();
const entityInput = z.object({
  id: z.string().min(1).max(200).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
}).strict();
const disclaimer = "OnCo is an orientation tool, not medical advice. Records may be incomplete or out of date; verify claims at their linked primary sources.";

function tool<T>(name: string, description: string, schema: z.ZodType<T>, run: (input: T) => Promise<unknown>): WebMCPTool {
  return {
    name, description,
    inputSchema: z.toJSONSchema(schema, { io: "input" }),
    annotations: { readOnlyHint: true, untrustedContentHint: true },
    async execute(input) {
      const parsed = schema.safeParse(input);
      if (!parsed.success) return { isError: true, error: "Invalid arguments", issues: parsed.error.issues.map(({ path, message }) => ({ path, message })), attribution: EXPORT_LICENCE, disclaimer };
      try {
        return { data: await run(parsed.data), attribution: EXPORT_LICENCE, disclaimer };
      } catch {
        return { isError: true, error: "OnCo data could not be loaded. Check the connection and try again, or use the site search.", attribution: EXPORT_LICENCE, disclaimer };
      }
    },
  };
}

export function createWebMCPTools(): WebMCPTool[] {
  return [
    tool("onco_search", "Search OnCo's public oncology records by name, alias, or keywords (lexical search). Returns record IDs, summaries and page URLs; optionally filter by kind. Not personalised medical advice.", searchInput, async ({ query, kind, limit }) => {
      const { loadSearch } = await import("@/components/SearchBox");
      const { ms, byId } = await loadSearch();
      const results = ms.search(query)
        .map((hit) => byId.get(String(hit.id)))
        .filter((doc) => doc && (!kind || doc.kind === kind))
        .slice(0, limit)
        .map((doc) => ({ id: doc!.id, kind: doc!.kind, name: doc!.name, tldr: doc!.tldr, status: doc!.status, url: new URL(doc!.route, window.location.origin).href }));
      return { results, searchUrl: new URL(`/search/?q=${encodeURIComponent(query)}`, window.location.origin).href };
    }),
    tool("onco_get_entity", "Read a public OnCo record using an exact ID from onco_search. Returns the full dated record, primary-source links and connected records. Verify facts at source; not medical advice.", entityInput, async ({ id }) => {
      const response = await fetch(`/api/v1/entities/${id}.json`);
      if (response.status === 404) return { found: false, id };
      if (!response.ok) throw new Error("Record unavailable");
      const record = await response.json();
      return { found: true, ...record, url: new URL(record.route, window.location.origin).href };
    }),
  ];
}

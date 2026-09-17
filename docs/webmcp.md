# WebMCP in the web app

The app progressively exposes two read-only tools to a WebMCP-capable browser:

| Tool | Arguments | Result |
| --- | --- | --- |
| `onco_search` | `query` (1–300 characters), optional `kind`, optional `limit` (1–20, default 10) | Lexical matches from the same MiniSearch index as the search UI, with IDs, summaries, status and same-origin page URLs. |
| `onco_get_entity` | Exact kebab-case `id` from search | Full static API record, dated facts and source links, neighbours, and page URL. Missing IDs return `found: false`. |

Every result includes the data attribution and an orientation/not-medical-advice disclaimer. Tools do not change user settings, navigate, submit forms, access accounts, or provide personalised medical advice. Search is lexical; the full search page also supports concept search. The existing stdio MCP servers remain available independently.

`src/components/WebMCP.tsx` mounts once in the root layout. It feature-detects `document.modelContext.registerTool` before importing tool definitions. Data loads only on invocation. Registration uses an owned `AbortSignal`; cleanup and partial-failure rollback do not clear anyone else's tools. This also handles React development effect remounting. Unsupported browsers continue to use the ordinary UI without a polyfill or extra data download. Registration failures are caught and reported to the console.

Inputs are validated at execution time as well as described by JSON Schema. Limits bound search results; IDs cannot become arbitrary URLs or paths. Data is fetched from the current origin's existing `/api/v1/` export. A failed search-index request clears the shared cache so a later invocation can retry. HTTP and decoding failures produce recoverable error results.

## API and compatibility

This implementation targets the experimental September 2026 imperative API, not the earlier `navigator.modelContext`/`unregisterTool` API. WebMCP remains subject to change and requires a supporting browser and secure context (localhost is suitable for development). No origin-trial token or browser flags are shipped in this change.

References checked 17 September 2026:

- [Chrome imperative API documentation](https://developer.chrome.com/docs/ai/webmcp/imperative-api), updated 11 September 2026.
- [Web Machine Learning Community Group draft](https://webmachinelearning.github.io/webmcp/), dated 15 September 2026.

## Testing

Run `npm ci`, `npm run validate`, `npm run typecheck`, `npm run lint`, `npm test`, and `npm run build`. The WebMCP tests cover unsupported environments, async import/unmount races, independent remount lifetimes, synchronous and asynchronous registration failures, invalid arguments, path traversal, filtering before limiting, missing records, malformed responses, and network errors/retry.

For browser checks, run `npm run dev`, open `/search/` in a WebMCP-capable browser and discover the two tools using the browser's agent interface. Call `onco_search` with `{"query":"trastuzumab","kind":"drug","limit":2}`, then `onco_get_entity` with `{"id":"trastuzumab"}`. Verify IDs, source links, attribution and disclaimer. Call the lookup with a nonexistent kebab-case ID to verify `found: false`. Navigate within the app and verify the root tools remain available.

In a browser without WebMCP, use the search form and follow a result normally. Do not install a polyfill to simulate lack of support. Browser-provided WebMCP bridges may expose non-configurable properties, so deleting or overwriting `document.modelContext` is not a portable fallback test; the automated lifecycle test verifies that the unavailable path does not load tools.

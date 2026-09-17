/** Small structural types for the experimental September 2026 WebMCP API. */
export type WebMCPTool = {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  annotations: { readOnlyHint: boolean; untrustedContentHint: boolean };
  execute: (input: unknown) => Promise<unknown>;
};

export type WebMCPContext = {
  registerTool: (tool: WebMCPTool, options: { signal: AbortSignal }) => void | Promise<void>;
};

/** Own only our registrations; never clear another component's tools. */
export function registerWebMCP(
  context: WebMCPContext | undefined,
  loadTools: () => Promise<WebMCPTool[]>,
  report: (error: unknown) => void = (error) => console.warn("OnCo WebMCP registration failed", error),
): () => void {
  const controller = new AbortController();
  if (typeof context?.registerTool === "function") {
    void (async () => {
      try {
        const tools = await loadTools();
        for (const tool of tools) {
          if (controller.signal.aborted) return;
          await context.registerTool(tool, { signal: controller.signal });
        }
      } catch (error) {
        // Roll back partial registration. Failure must never break the ordinary UI.
        const cancelled = controller.signal.aborted;
        controller.abort();
        if (!cancelled) report(error);
      }
    })();
  }
  return () => controller.abort();
}

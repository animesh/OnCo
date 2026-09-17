"use client";

import { useEffect } from "react";
import { registerWebMCP, type WebMCPContext } from "@/lib/webmcp";

/** Progressive enhancement: no index downloads or extra UI in unsupported browsers. */
export function WebMCP() {
  useEffect(() => registerWebMCP(
    (document as Document & { modelContext?: WebMCPContext }).modelContext,
    async () => (await import("@/lib/webmcp-tools")).createWebMCPTools(),
  ), []);
  return null;
}

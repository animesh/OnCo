import { describe, expect, it, vi } from "vitest";
import { registerWebMCP, type WebMCPTool } from "./webmcp";

const tools = ["a", "b"].map((name) => ({ name }) as WebMCPTool);
const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("WebMCP lifecycle", () => {
  it("does not load tools when unsupported", () => {
    const load = vi.fn();
    registerWebMCP(undefined, load)();
    expect(load).not.toHaveBeenCalled();
  });
  it("registers with an owned signal and cleans up", async () => {
    const registerTool = vi.fn();
    const dispose = registerWebMCP({ registerTool }, async () => tools);
    await flush();
    expect(registerTool.mock.calls.map(([t]) => t.name)).toEqual(["a", "b"]);
    const signal = registerTool.mock.calls[0][1].signal;
    expect(signal.aborted).toBe(false);
    dispose();
    expect(signal.aborted).toBe(true);
  });
  it("does not register after unmount during import", async () => {
    const registerTool = vi.fn();
    const dispose = registerWebMCP({ registerTool }, async () => tools);
    dispose();
    await flush();
    expect(registerTool).not.toHaveBeenCalled();
  });
  it.each([false, true])("rolls back synchronous/asynchronous failure (%s)", async (asyncFailure) => {
    const error = new Error("registration rejected");
    const registerTool = vi.fn().mockImplementationOnce(() => undefined).mockImplementationOnce(() => {
      if (asyncFailure) return Promise.reject(error);
      throw error;
    });
    const report = vi.fn();
    registerWebMCP({ registerTool }, async () => tools, report);
    await flush();
    expect(registerTool.mock.calls[0][1].signal.aborted).toBe(true);
    expect(report).toHaveBeenCalledWith(error);
  });
  it("handles a failed import without an unhandled rejection", async () => {
    const report = vi.fn();
    registerWebMCP({ registerTool: vi.fn() }, async () => { throw new Error("import"); }, report);
    await flush();
    expect(report).toHaveBeenCalledOnce();
  });
  it("supports cleanup then remount with independent signals", async () => {
    const registerTool = vi.fn();
    const dispose = registerWebMCP({ registerTool }, async () => tools);
    await flush();
    dispose();
    const disposeAgain = registerWebMCP({ registerTool }, async () => tools);
    await flush();
    expect(registerTool.mock.calls[0][1].signal.aborted).toBe(true);
    expect(registerTool.mock.calls[2][1].signal.aborted).toBe(false);
    disposeAgain();
  });
});

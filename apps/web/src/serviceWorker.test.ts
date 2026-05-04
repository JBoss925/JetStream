import { afterEach, describe, expect, it, vi } from "vitest";
import { registerServiceWorker } from "./serviceWorker";

describe("registerServiceWorker", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("does nothing when service workers are not supported", () => {
    const addEventListener = vi.spyOn(window, "addEventListener");
    vi.stubGlobal("navigator", {});

    registerServiceWorker();

    expect(addEventListener).not.toHaveBeenCalled();
  });

  it("registers the service worker immediately when the document has loaded", () => {
    const register = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal("navigator", { serviceWorker: { register } });
    vi.spyOn(document, "readyState", "get").mockReturnValue("complete");

    registerServiceWorker();

    expect(register).toHaveBeenCalledWith("/sw.js");
  });

  it("waits for the load event before registering during initial load", () => {
    const register = vi.fn().mockResolvedValue(undefined);
    const addEventListener = vi.spyOn(window, "addEventListener");
    vi.stubGlobal("navigator", { serviceWorker: { register } });
    vi.spyOn(document, "readyState", "get").mockReturnValue("loading");

    registerServiceWorker();

    expect(register).not.toHaveBeenCalled();
    expect(addEventListener).toHaveBeenCalledWith("load", expect.any(Function), { once: true });

    const loadHandler = addEventListener.mock.calls[0][1] as EventListener;
    loadHandler(new Event("load"));

    expect(register).toHaveBeenCalledWith("/sw.js");
  });
});

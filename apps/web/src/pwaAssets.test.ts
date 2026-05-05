import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const publicPath = (fileName: string) => join(process.cwd(), "public", fileName);

describe("PWA assets", () => {
  it("declares native install metadata and checked-in icons", () => {
    const manifest = JSON.parse(
      readFileSync(publicPath("manifest.webmanifest"), "utf8"),
    ) as {
      name: string;
      short_name: string;
      display: string;
      start_url: string;
      scope: string;
      theme_color: string;
      icons: Array<{ src: string; sizes: string; type: string; purpose: string }>;
    };

    expect(manifest).toMatchObject({
      name: "JetStream",
      short_name: "JetStream",
      display: "standalone",
      start_url: "/",
      scope: "/",
      theme_color: "#0f7668",
    });
    expect(manifest.icons).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          src: "/icon.svg",
          sizes: "any",
          type: "image/svg+xml",
        }),
        expect.objectContaining({
          src: "/pwa-192.png",
          sizes: "192x192",
          type: "image/png",
        }),
        expect.objectContaining({
          src: "/pwa-512.png",
          sizes: "512x512",
          type: "image/png",
        }),
        expect.objectContaining({ src: "/pwa-maskable-512.png", purpose: "maskable" }),
      ]),
    );

    expect(existsSync(publicPath("apple-touch-icon.png"))).toBe(true);
    expect(readFileSync(publicPath("icon.svg"), "utf8")).toContain("#0f7668");
    expect(existsSync(publicPath("pwa-192.png"))).toBe(true);
    expect(existsSync(publicPath("pwa-512.png"))).toBe(true);
    expect(existsSync(publicPath("pwa-maskable-512.png"))).toBe(true);
  });

  it("keeps the service worker focused on app assets and Open-Meteo requests", () => {
    const serviceWorker = readFileSync(publicPath("sw.js"), "utf8");

    expect(serviceWorker).toContain("/manifest.webmanifest");
    expect(serviceWorker).toContain("api.open-meteo.com");
    expect(serviceWorker).toContain("geocoding-api.open-meteo.com");
    expect(serviceWorker).toContain("networkFirst(request, \"/index.html\")");
  });
});

import { beforeEach, describe, expect, it, vi } from "vitest";
import type { LocationOption } from "@jetstream-weather/domain";
import { getWeather, searchLocations } from "./weatherApi";

const location: LocationOption = {
  id: "london",
  name: "London",
  region: "England",
  country: "United Kingdom",
  latitude: 51.5072,
  longitude: -0.1276,
  timezone: "Europe/London",
};

function okJson(payload: unknown) {
  return Promise.resolve({
    ok: true,
    json: async () => payload,
  } as Response);
}

function forecastPayload() {
  const hours = Array.from({ length: 50 }, (_, index) => `2026-05-03T${String(index).padStart(2, "0")}:00`);

  return {
    timezone: "Europe/London",
    current: {
      time: "2026-05-03T02:45",
      temperature_2m: 64,
      relative_humidity_2m: 62,
      apparent_temperature: 61,
      is_day: 1,
      precipitation: 0,
      weather_code: 3,
      cloud_cover: 97,
      pressure_msl: 1009,
      wind_speed_10m: 5.6,
      wind_gusts_10m: 13,
      wind_direction_10m: 270,
    },
    hourly: {
      time: hours,
      temperature_2m: hours.map((_, index) => 60 + index),
      apparent_temperature: hours.map((_, index) => 58 + index),
      relative_humidity_2m: hours.map((_, index) => 50 + index),
      precipitation_probability: hours.map((_, index) => index),
      weather_code: hours.map(() => 3),
      cloud_cover: hours.map((_, index) => 40 + index),
      wind_speed_10m: hours.map((_, index) => 5 + index),
      wind_direction_10m: hours.map((_, index) => (index * 15) % 360),
    },
    daily: {
      time: Array.from({ length: 7 }, (_, index) => `2026-05-${String(index + 3).padStart(2, "0")}`),
      weather_code: [3, 61, 71, 95, 0, 45, 53],
      temperature_2m_max: [67, 66, 64, 63, 65, 69, 71],
      temperature_2m_min: [56, 55, 53, 52, 54, 58, 59],
      sunrise: Array.from({ length: 7 }, (_, index) => `2026-05-${String(index + 3).padStart(2, "0")}T05:30`),
      sunset: Array.from({ length: 7 }, (_, index) => `2026-05-${String(index + 3).padStart(2, "0")}T20:30`),
      precipitation_probability_max: [40, 60, 70, 90, 0, 5, 55],
      uv_index_max: [6.3, 5.8, 4.2, 7.1, 8.4, 9.2, 3.7],
    },
  };
}

describe("weatherApi", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
    localStorage.clear();
    window.history.replaceState(null, "", "/");
  });

  it("uses the backend BFF by default for location search", async () => {
    const fetch = vi.fn((_url: URL | string) => okJson([location]));
    vi.stubGlobal("fetch", fetch);

    await expect(searchLocations("London, England, United Kingdom")).resolves.toEqual([location]);

    const [request] = fetch.mock.calls[0] as [URL | string];
    const requestUrl = String(request);
    expect(requestUrl).toContain("http://localhost:3000/api/locations/search");
    expect(requestUrl).toContain("name=London");
    expect(requestUrl).toContain("region=England");
    expect(requestUrl).toContain("country=United+Kingdom");
    expect(requestUrl).not.toContain("query=");
  });

  it("uses the backend BFF by default for weather", async () => {
    const fetch = vi.fn((_url: URL | string) =>
      okJson({
        location,
        units: "imperial",
        current: {
          observedAt: "2026-05-03T12:00",
          temperature: 64,
          apparentTemperature: 61,
          weatherCode: 3,
          summary: "Overcast",
          family: "clouds",
          isDay: true,
        },
        hourly: [],
        daily: [],
        insights: [],
        source: { provider: "open-meteo", attribution: "Weather data by Open-Meteo" },
        fetchedAt: "2026-05-03T12:01:00Z",
      }),
    );
    vi.stubGlobal("fetch", fetch);

    await getWeather(location, "imperial");

    const [request] = fetch.mock.calls[0] as [URL | string];
    const requestUrl = decodeURIComponent(String(request));
    expect(requestUrl).toContain("http://localhost:3000/api/weather");
    expect(requestUrl).toContain("latitude=51.5072");
    expect(requestUrl).toContain("longitude=-0.1276");
    expect(requestUrl).toContain("units=imperial");
  });

  it("omits optional backend region and falls back to auto timezone when needed", async () => {
    const fetch = vi.fn((_url: URL | string) =>
      okJson({
        location,
        units: "imperial",
        current: {
          observedAt: "2026-05-03T12:00",
          temperature: 64,
          apparentTemperature: 61,
          weatherCode: 3,
          summary: "Overcast",
          family: "clouds",
          isDay: true,
        },
        hourly: [],
        daily: [],
        insights: [],
        source: { provider: "open-meteo", attribution: "Weather data by Open-Meteo" },
        fetchedAt: "2026-05-03T12:01:00Z",
      }),
    );
    vi.stubGlobal("fetch", fetch);

    await getWeather({ ...location, region: undefined, timezone: "" }, "imperial");

    const [request] = fetch.mock.calls[0] as [URL | string];
    const requestUrl = decodeURIComponent(String(request));
    expect(requestUrl).toContain("timezone=auto");
    expect(requestUrl).not.toContain("region=");
  });

  it("can switch to direct Open-Meteo mode from a hidden query parameter", async () => {
    window.history.replaceState(null, "", "/?weatherSource=direct");
    const fetch = vi.fn((url: URL | string) => {
      const text = String(url);
      if (text.includes("geocoding-api")) {
        return okJson({
          results: [
            {
              id: 2643743,
              name: "London",
              admin1: "England",
              country: "United Kingdom",
              latitude: 51.5085,
              longitude: -0.1257,
              timezone: "Europe/London",
            },
          ],
        });
      }

      return okJson(forecastPayload());
    });
    vi.stubGlobal("fetch", fetch);

    await expect(searchLocations("London, England")).resolves.toEqual([
      expect.objectContaining({ id: "2643743", name: "London" }),
    ]);
    const weather = await getWeather(location, "metric");

    expect(localStorage.getItem("jetstream:data-source")).toBeNull();
    expect(String(fetch.mock.calls[0][0])).toContain("geocoding-api.open-meteo.com");
    expect(String(fetch.mock.calls[0][0])).toContain("name=London");
    expect(String(fetch.mock.calls[0][0])).not.toContain("name=London%2C");
    expect(String(fetch.mock.calls[1][0])).toContain("api.open-meteo.com");
    expect(String(fetch.mock.calls[1][0])).toContain("temperature_unit=celsius");
    expect(String(fetch.mock.calls[1][0])).toContain("wind_gusts_10m");
    expect(String(fetch.mock.calls[1][0])).toContain("uv_index_max");
    expect(weather.current.windGusts).toBe(13);
    expect(weather.daily[0]?.uvIndexMax).toBe(6.3);
    expect(weather.hourly[0]).toMatchObject({
      time: "2026-05-03T03:00",
      humidity: 53,
      cloudCover: 43,
      windDirection: 45,
    });
  });

  it("surfaces backend and Open-Meteo error payload messages", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: false,
        status: 502,
        json: async () => ({ message: ["Upstream", "failed"] }),
      })),
    );

    await expect(searchLocations("London")).rejects.toThrow("Upstream failed");
  });

  it("surfaces Open-Meteo reason strings and unreadable error payloads", async () => {
    vi.stubGlobal(
      "fetch",
      vi
        .fn()
        .mockResolvedValueOnce({
          ok: false,
          status: 400,
          json: async () => ({ reason: "Bad latitude" }),
        })
        .mockResolvedValueOnce({
          ok: false,
          status: 503,
          json: async () => {
            throw new Error("Invalid JSON");
          },
        }),
    );

    await expect(searchLocations("London")).rejects.toThrow("Bad latitude");
    await expect(searchLocations("London")).rejects.toThrow(
      "Weather request failed with status 503.",
    );
  });

  it("surfaces a generic message when an error payload has no detail", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: false,
        status: 500,
        json: async () => ({}),
      })),
    );

    await expect(searchLocations("London")).rejects.toThrow(
      "Weather request failed. Please try again.",
    );
  });

  it("uses explicit direct mode for short geocoding queries without fetching", async () => {
    window.history.replaceState(null, "", "/?weatherSource=direct");
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);

    await expect(searchLocations("a")).resolves.toEqual([]);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("ignores stale saved direct mode when the URL and build env do not request it", async () => {
    localStorage.setItem("jetstream:data-source", "direct");
    const fetch = vi.fn((_url: URL | string) => okJson([location]));
    vi.stubGlobal("fetch", fetch);

    await searchLocations("London");

    const [request] = fetch.mock.calls[0] as [URL | string];
    expect(String(request)).toContain("http://localhost:3000/api/locations/search");
    expect(localStorage.getItem("jetstream:data-source")).toBe("direct");
  });
});

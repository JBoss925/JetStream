import { BadGatewayException } from "@nestjs/common";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { LocationOption } from "@jetstream-weather/domain";
import { OpenMeteoService } from "./open-meteo.service.js";

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

function openMeteoForecastPayload() {
  const hours = Array.from({ length: 51 }, (_, index) => `2026-05-03T${String(index).padStart(2, "0")}:00`);

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
      relative_humidity_2m: hours.map((_, index) => Math.min(100, 50 + index)),
      precipitation_probability: hours.map((_, index) => index % 101),
      weather_code: hours.map((_, index) => (index % 2 === 0 ? 3 : 61)),
      cloud_cover: hours.map((_, index) => Math.min(100, 40 + index)),
      wind_speed_10m: hours.map((_, index) => 5 + index),
      wind_direction_10m: hours.map((_, index) => (index * 15) % 360),
    },
    daily: {
      time: Array.from({ length: 7 }, (_, index) => `2026-05-${String(3 + index).padStart(2, "0")}`),
      weather_code: [3, 61, 71, 95, 0, 45, 53],
      temperature_2m_max: [67, 66, 64, 63, 65, 69, 71],
      temperature_2m_min: [56, 55, 53, 52, 54, 58, 59],
      sunrise: Array.from({ length: 7 }, (_, index) => `2026-05-${String(3 + index).padStart(2, "0")}T05:30`),
      sunset: Array.from({ length: 7 }, (_, index) => `2026-05-${String(3 + index).padStart(2, "0")}T20:30`),
      precipitation_probability_max: [40, 60, 70, 90, 0, 5, 55],
      uv_index_max: [6.3, 5.8, 4.2, 7.1, 8.4, 9.2, 3.7],
    },
  };
}

describe("OpenMeteoService", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it("normalizes geocoding results to location options", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        okJson({
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
        }),
      ),
    );

    const results = await new OpenMeteoService().searchLocations("London, England");

    expect(results).toEqual([
      expect.objectContaining({
        id: "2643743",
        name: "London",
        region: "England",
        country: "United Kingdom",
        timezone: "Europe/London",
      }),
    ]);
    expect(fetch).toHaveBeenCalledWith(
      expect.objectContaining({ pathname: "/v1/search" }),
      expect.objectContaining({ headers: { accept: "application/json" } }),
    );
    const [requestUrl] = (fetch as ReturnType<typeof vi.fn>).mock.calls[0] as [URL];
    expect(requestUrl.searchParams.get("name")).toBe("London");
  });

  it("sorts geocoding results by parsed region and country", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(() =>
        okJson({
          results: [
            {
              id: 6058560,
              name: "London",
              admin1: "Ontario",
              country: "Canada",
              latitude: 42.9834,
              longitude: -81.233,
              timezone: "America/Toronto",
            },
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
        }),
      ),
    );

    await expect(new OpenMeteoService().searchLocations("London, Eng")).resolves.toEqual([
      expect.objectContaining({
        id: "2643743",
        region: "England",
        country: "United Kingdom",
      }),
      expect.objectContaining({
        id: "6058560",
        region: "Ontario",
        country: "Canada",
      }),
    ]);
  });

  it("returns no geocoding results for too-short queries without fetching", async () => {
    const fetch = vi.fn();
    vi.stubGlobal("fetch", fetch);

    await expect(new OpenMeteoService().searchLocations("a")).resolves.toEqual([]);
    expect(fetch).not.toHaveBeenCalled();
  });

  it("requests rich Open-Meteo fields and normalizes current hourly and daily weather", async () => {
    const fetch = vi.fn((_url: URL | string) => okJson(openMeteoForecastPayload()));
    vi.stubGlobal("fetch", fetch);

    const weather = await new OpenMeteoService().getWeather(location, "imperial");
    const [requestUrl] = fetch.mock.calls[0] as [URL];

    expect(requestUrl.searchParams.get("temperature_unit")).toBe("fahrenheit");
    expect(requestUrl.searchParams.get("wind_speed_unit")).toBe("mph");
    expect(requestUrl.searchParams.get("forecast_hours")).toBe("48");
    expect(requestUrl.searchParams.get("hourly")).toContain("relative_humidity_2m");
    expect(requestUrl.searchParams.get("hourly")).toContain("cloud_cover");
    expect(requestUrl.searchParams.get("hourly")).toContain("wind_direction_10m");
    expect(requestUrl.searchParams.get("current")).toContain("wind_gusts_10m");
    expect(requestUrl.searchParams.get("daily")).toContain("uv_index_max");
    expect(weather.location.timezone).toBe("Europe/London");
    expect(weather.current).toMatchObject({
      temperature: 64,
      humidity: 62,
      cloudCover: 97,
      windGusts: 13,
      windDirection: 270,
      family: "clouds",
    });
    expect(weather.hourly).toHaveLength(48);
    expect(weather.hourly[0]).toMatchObject({
      time: "2026-05-03T03:00",
      humidity: 53,
      cloudCover: 43,
      windDirection: 45,
    });
    expect(weather.daily).toHaveLength(7);
    expect(weather.daily[0]?.uvIndexMax).toBe(6.3);
    expect(weather.insights.length).toBeGreaterThan(0);
  });

  it("uses metric Open-Meteo units when requested", async () => {
    const fetch = vi.fn((_url: URL | string) => okJson(openMeteoForecastPayload()));
    vi.stubGlobal("fetch", fetch);

    await new OpenMeteoService().getWeather(location, "metric");
    const [requestUrl] = fetch.mock.calls[0] as [URL];

    expect(requestUrl.searchParams.get("temperature_unit")).toBe("celsius");
    expect(requestUrl.searchParams.get("wind_speed_unit")).toBe("kmh");
    expect(requestUrl.searchParams.get("precipitation_unit")).toBe("mm");
  });

  it("turns Open-Meteo errors into BadGatewayException messages", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: false,
        status: 400,
        json: async () => ({ reason: "Latitude is required" }),
      })),
    );

    await expect(new OpenMeteoService().getWeather(location, "imperial")).rejects.toThrow(
      BadGatewayException,
    );
    await expect(new OpenMeteoService().getWeather(location, "imperial")).rejects.toThrow(
      "Latitude is required",
    );
  });

  it("falls back to status text when an Open-Meteo error body is unreadable", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: false,
        status: 503,
        json: async () => {
          throw new Error("Invalid JSON");
        },
      })),
    );

    await expect(new OpenMeteoService().getWeather(location, "imperial")).rejects.toThrow(
      "Open-Meteo request failed with status 503.",
    );
  });

  it("uses the generic Open-Meteo error when a failure payload has no reason", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: false,
        status: 500,
        json: async () => ({}),
      })),
    );

    await expect(new OpenMeteoService().getWeather(location, "imperial")).rejects.toThrow(
      "Open-Meteo request failed. Please try again.",
    );
  });
});

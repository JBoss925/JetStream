import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { testWeatherScenarios } from "../testWeatherScenarios";
import { App } from "./App";

const weatherPayload = {
  location: {
    id: "charlotte-nc",
    name: "Charlotte",
    region: "North Carolina",
    country: "United States",
    latitude: 35.2271,
    longitude: -80.8431,
    timezone: "America/New_York",
  },
  units: "imperial",
  current: {
    observedAt: "2026-05-01T12:00:00Z",
    temperature: 78,
    apparentTemperature: 80,
    weatherCode: 2,
    summary: "Partly cloudy",
    family: "clouds",
    humidity: 52,
    windSpeed: 8,
    windGusts: 18,
    windDirection: 180,
    pressure: 1014,
    cloudCover: 48,
    precipitation: 0,
    isDay: true,
  },
  hourly: Array.from({ length: 8 }, (_, index) => ({
    time: `2026-05-01T${String(13 + index).padStart(2, "0")}:00:00Z`,
    temperature: 79 + index,
    apparentTemperature: 80 + index,
    weatherCode: index % 2 === 0 ? 2 : 61,
    summary: index % 2 === 0 ? "Partly cloudy" : "Light rain",
    family: index % 2 === 0 ? "clouds" : "rain",
    humidity: 52 + index,
    cloudCover: 48 + index,
    windSpeed: 8 + index,
    windDirection: (180 + index * 20) % 360,
    precipitationProbability: 20 + index,
  })),
  daily: Array.from({ length: 7 }, (_, index) => ({
    date: `2026-05-${String(index + 1).padStart(2, "0")}`,
    tempMin: 69 + index,
    tempMax: 85 + index,
    weatherCode: 2,
    summary: "Partly cloudy",
    family: "clouds",
    sunrise: `2026-05-${String(index + 1).padStart(2, "0")}T10:32:00Z`,
    sunset: `2026-05-${String(index + 1).padStart(2, "0")}T23:59:00Z`,
    uvIndexMax: 6.3 + index * 0.2,
  })),
  insights: [
    {
      id: "comfort",
      kind: "comfort",
      severity: "info",
      title: "Day range",
      message: "Expect 85° / 69°F today with partly cloudy right now.",
    },
  ],
  source: {
    provider: "open-meteo",
    attribution: "Weather data by Open-Meteo",
  },
  fetchedAt: "2026-05-01T12:01:00Z",
};

describe("App", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("loads and renders default weather", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => weatherPayload,
      })),
    );

    render(<App />);

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Charlotte" })).toBeVisible();
    });
    expect(screen.getAllByText("Partly cloudy").length).toBeGreaterThan(0);
    expect(screen.getByRole("heading", { name: "What matters right now" })).toBeVisible();
    expect(screen.getByText("Wind")).toBeVisible();
    expect(screen.getByText(/Gusts up to 18 mph\./)).toBeVisible();
    expect(screen.getByText("Atmosphere")).toBeVisible();
    expect(screen.getByText("Precipitation")).toBeVisible();
    expect(screen.getByText("Daylight")).toBeVisible();
    expect(screen.getByText("6.3 (High)")).toBeVisible();
    expect(screen.getByText("Humidity")).toBeVisible();
    expect(screen.getByText("Cloud cover")).toBeVisible();
    expect(screen.getByLabelText("Hourly wind speed")).toBeInTheDocument();
    expect(screen.getByLabelText("Hourly humidity and cloud cover")).toBeInTheDocument();
    expect(screen.getByLabelText("Hourly precipitation probability")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "7-Day Forecast" })).toBeVisible();
    expect(screen.getByTestId("wind-arrow")).toHaveStyle({
      transform: "rotate(0deg)",
    });
  });

  it("surfaces live weather errors and can retry the request", async () => {
    const fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 502,
        json: async () => ({ message: "Open-Meteo unavailable" }),
      })
      .mockResolvedValue({
        ok: true,
        json: async () => weatherPayload,
      });
    vi.stubGlobal("fetch", fetch);
    const user = userEvent.setup();

    render(<App />);

    expect(await screen.findByText("Open-Meteo unavailable")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Retry" }));

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "Charlotte" })).toBeVisible();
    });
    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("persists unit, theme, and color theme changes", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => weatherPayload,
      })),
    );
    const user = userEvent.setup();

    render(<App />);

    await user.click(screen.getByRole("button", { name: "C" }));
    await user.click(screen.getByRole("button", { name: "Switch to light theme" }));
    await user.click(screen.getByRole("button", { name: "Choose color theme" }));
    await user.click(screen.getByRole("menuitemradio", { name: "Amber" }));

    expect(localStorage.getItem("jetstream-weather:units")).toBe("metric");
    expect(localStorage.getItem("jetstream-weather:theme")).toBe("light");
    expect(localStorage.getItem("jetstream-weather:color-theme")).toBe("amber");
  });

  it("uses a legacy saved default location for the first live weather request", async () => {
    localStorage.setItem(
      "jetstream-weather:default-location",
      JSON.stringify({
        id: "denver-co",
        name: "Denver",
        region: "Colorado",
        country: "United States",
        latitude: 39.7392,
        longitude: -104.9903,
        timezone: "America/Denver",
      }),
    );
    const fetch = vi.fn(async (_url: URL | string) => ({
      ok: true,
      json: async () => weatherPayload,
    }));
    vi.stubGlobal("fetch", fetch);

    render(<App />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });
    const [request] = fetch.mock.calls[0] as [URL | string];
    const requestUrl = decodeURIComponent(String(request));
    expect(requestUrl).toContain("name=Denver");
    expect(requestUrl).toContain("latitude=39.7392");
    expect(requestUrl).toContain("longitude=-104.9903");
  });

  it("restores a saved test scenario without calling the live API", () => {
    localStorage.setItem(
      "jetstream-weather:default-location",
      JSON.stringify({
        mode: "test",
        scenarioId: "drizzle-humid",
        location: {
          id: "portland-or",
          name: "Portland",
          region: "Oregon",
          country: "United States",
          latitude: 45.5152,
          longitude: -122.6784,
          timezone: "America/Los_Angeles",
        },
      }),
    );
    const fetch = vi.fn(async () => ({
      ok: true,
      json: async () => weatherPayload,
    }));
    vi.stubGlobal("fetch", fetch);

    render(<App />);

    expect(fetch).not.toHaveBeenCalled();
    expect(screen.getByRole("button", { name: "Test" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByLabelText("Scenario")).toHaveValue("drizzle-humid");
    expect(screen.getByRole("heading", { name: "Portland" })).toBeVisible();
  });

  it("falls back to the first test scenario when a saved scenario id is stale", () => {
    localStorage.setItem(
      "jetstream-weather:default-location",
      JSON.stringify({
        mode: "test",
        scenarioId: "deleted-scenario",
        location: {
          id: "stale",
          name: "Stale",
          region: "Fixture",
          country: "Test",
          latitude: 0,
          longitude: 0,
          timezone: "UTC",
        },
      }),
    );
    vi.stubGlobal("fetch", vi.fn());

    render(<App />);

    expect(screen.getByRole("heading", { name: "Phoenix" })).toBeVisible();
  });

  it("renders test backend scenarios without calling the live API", async () => {
    const fetch = vi.fn(async () => ({
      ok: true,
      json: async () => weatherPayload,
    }));
    vi.stubGlobal("fetch", fetch);
    const user = userEvent.setup();

    render(<App />);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalled();
    });
    fetch.mockClear();

    await user.click(screen.getByRole("button", { name: "Test" }));
    expect(fetch).not.toHaveBeenCalled();
    expect(screen.getByRole("heading", { name: "Phoenix" })).toBeVisible();

    await user.selectOptions(screen.getByLabelText("Scenario"), "storm-hail-critical");
    expect(screen.getByRole("heading", { name: "Oklahoma City" })).toBeVisible();
    expect(screen.getAllByText("Severe thunderstorm with hail").length).toBeGreaterThan(0);
  });

  it("saves the displayed weather location as the default", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => ({
        ok: true,
        json: async () => weatherPayload,
      })),
    );
    const user = userEvent.setup();

    render(<App />);

    await user.click(screen.getByRole("button", { name: "Test" }));
    expect(screen.getByRole("heading", { name: "Phoenix" })).toBeVisible();
    await user.click(
      screen.getByRole("button", { name: "Save current location as default" }),
    );

    const savedDefault = JSON.parse(
      localStorage.getItem("jetstream-weather:default-location") ?? "{}",
    ) as { mode?: string; scenarioId?: string; location?: { name?: string } };

    expect(savedDefault).toMatchObject({
      mode: "test",
      scenarioId: "clear-hot-dry",
      location: { name: "Phoenix" },
    });
    expect(
      screen.getByRole("button", { name: "Current location is your default" }),
    ).toBeVisible();
  });

  it("includes test scenarios for every supported weather family", () => {
    expect(new Set(testWeatherScenarios.map((scenario) => scenario.family))).toEqual(
      new Set(["clear", "clouds", "fog", "drizzle", "rain", "snow", "storm", "mixed"]),
    );
  });

  it("includes night test scenarios for every supported weather family", () => {
    const nightFamilies = new Set(
      testWeatherScenarios
        .filter((scenario) => !scenario.build("imperial").current.isDay)
        .map((scenario) => scenario.family),
    );

    expect(nightFamilies).toEqual(
      new Set(["clear", "clouds", "fog", "drizzle", "rain", "snow", "storm", "mixed"]),
    );
  });

  it("keeps every test fixture inside the normalized weather contract", () => {
    for (const scenario of testWeatherScenarios) {
      const weather = scenario.build("imperial");

      expect(weather.hourly).toHaveLength(12);
      expect(weather.daily).toHaveLength(7);
      expect(weather.insights.length).toBeGreaterThan(0);
      expect(weather.current.family).toBe(scenario.family);
      expect(weather.current.isDay).toBe(
        scenario.id.endsWith("-night") ? false : weather.current.isDay,
      );

      for (const point of weather.hourly) {
        expect(point.precipitationProbability ?? 0).toBeGreaterThanOrEqual(0);
        expect(point.precipitationProbability ?? 0).toBeLessThanOrEqual(100);
      }
    }
  });
});

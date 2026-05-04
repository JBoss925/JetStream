import { describe, expect, it } from "vitest";
import { deriveWeatherInsights } from "../src/insights.js";
import type { NormalizedWeatherResponse } from "../src/weather.types.js";

const baseWeather: Omit<NormalizedWeatherResponse, "insights"> = {
  location: {
    id: "charlotte-us",
    name: "Charlotte",
    region: "North Carolina",
    country: "United States",
    latitude: 35.22,
    longitude: -80.84,
    timezone: "America/New_York",
  },
  units: "imperial",
  current: {
    observedAt: "2026-05-01T12:00:00Z",
    temperature: 72,
    apparentTemperature: 74,
    weatherCode: 1,
    summary: "Mostly clear",
    family: "clear",
    humidity: 44,
    windSpeed: 8,
    isDay: true,
  },
  hourly: [
    {
      time: "2026-05-01T13:00:00Z",
      temperature: 75,
      weatherCode: 1,
      summary: "Mostly clear",
      family: "clear",
      precipitationProbability: 10,
    },
  ],
  daily: [
    {
      date: "2026-05-01",
      tempMin: 61,
      tempMax: 82,
      weatherCode: 1,
      summary: "Mostly clear",
      family: "clear",
      sunrise: "2026-05-01T10:30:00Z",
      sunset: "2026-05-02T00:05:00Z",
    },
  ],
  source: {
    provider: "open-meteo",
    attribution: "Weather data by Open-Meteo",
  },
  fetchedAt: "2026-05-01T12:01:00Z",
};

describe("deriveWeatherInsights", () => {
  it("includes day range and daylight insights for ordinary weather", () => {
    const insights = deriveWeatherInsights(baseWeather);

    expect(insights).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "comfort",
          message: "Expect 82° / 61°F today with mostly clear right now.",
        }),
        expect.objectContaining({ id: "daylight" }),
      ]),
    );
  });

  it("warns when rain is likely in the next twelve hours", () => {
    const insights = deriveWeatherInsights({
      ...baseWeather,
      hourly: [
        {
          time: "2026-05-01T15:00:00Z",
          temperature: 72,
          weatherCode: 63,
          summary: "Rain",
          family: "rain",
          precipitationProbability: 70,
        },
      ],
    });

    expect(insights).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ id: "umbrella", severity: "warning" }),
      ]),
    );
  });

  it("marks storm precipitation as critical umbrella guidance", () => {
    const insights = deriveWeatherInsights({
      ...baseWeather,
      hourly: [
        {
          time: "2026-05-01T15:00:00Z",
          temperature: 72,
          weatherCode: 95,
          summary: "Thunderstorm",
          family: "storm",
          precipitationProbability: 20,
        },
      ],
    });

    expect(insights).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "umbrella",
          title: "Bring rain gear",
          severity: "critical",
        }),
      ]),
    );
  });

  it("uses snow-specific wet weather copy", () => {
    const insights = deriveWeatherInsights({
      ...baseWeather,
      hourly: [
        {
          time: "2026-05-01T15:00:00Z",
          temperature: 28,
          weatherCode: 75,
          summary: "Heavy snow",
          family: "snow",
          precipitationProbability: 90,
        },
      ],
    });

    expect(insights).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "umbrella",
          title: "Snow possible",
        }),
      ]),
    );
  });

  it("warns for apparent temperature deltas before generic cold or heat copy", () => {
    const insights = deriveWeatherInsights({
      ...baseWeather,
      current: {
        ...baseWeather.current,
        temperature: 82,
        apparentTemperature: 91,
      },
    });

    expect(insights).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "feels-like",
          message: "It feels like 91°F, 9°F away from the measured temperature.",
        }),
      ]),
    );
  });

  it("warns for cold conditions when apparent temperature is close", () => {
    const insights = deriveWeatherInsights({
      ...baseWeather,
      current: {
        ...baseWeather.current,
        temperature: 34,
        apparentTemperature: 36,
      },
    });

    expect(insights).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: "cold" })]),
    );
  });

  it("warns for heat conditions when apparent temperature is close", () => {
    const insights = deriveWeatherInsights({
      ...baseWeather,
      current: {
        ...baseWeather.current,
        temperature: 94,
        apparentTemperature: 96,
      },
    });

    expect(insights).toEqual(
      expect.arrayContaining([expect.objectContaining({ id: "heat" })]),
    );
  });

  it("warns for strong winds using metric thresholds and units", () => {
    const insights = deriveWeatherInsights({
      ...baseWeather,
      units: "metric",
      current: {
        ...baseWeather.current,
        temperature: 18,
        apparentTemperature: 18,
        windSpeed: 45,
      },
      daily: [
        {
          ...baseWeather.daily[0],
          tempMin: 12,
          tempMax: 21,
        },
      ],
    });

    expect(insights).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "wind",
          message: "Winds are near 45 km/h. Secure loose outdoor items.",
        }),
      ]),
    );
  });

  it("omits range and daylight copy when daily data is incomplete", () => {
    const insights = deriveWeatherInsights({
      ...baseWeather,
      daily: [],
    });

    expect(insights.map((insight) => insight.id)).not.toContain("comfort");
    expect(insights.map((insight) => insight.id)).not.toContain("daylight");
  });

  it("limits output to four highest-priority insights", () => {
    const insights = deriveWeatherInsights({
      ...baseWeather,
      current: {
        ...baseWeather.current,
        temperature: 94,
        apparentTemperature: 104,
        windSpeed: 32,
      },
      hourly: [
        {
          time: "2026-05-01T15:00:00Z",
          temperature: 94,
          weatherCode: 95,
          summary: "Thunderstorm",
          family: "storm",
          precipitationProbability: 90,
        },
      ],
    });

    expect(insights).toHaveLength(4);
    expect(insights.map((insight) => insight.id)).toEqual([
      "comfort",
      "feels-like",
      "umbrella",
      "wind",
    ]);
  });

  it("treats wet weather without probability and missing wind as safe defaults", () => {
    const insights = deriveWeatherInsights({
      ...baseWeather,
      current: {
        ...baseWeather.current,
        windSpeed: undefined,
      },
      hourly: [
        {
          time: "2026-05-01T15:00:00Z",
          temperature: 34,
          weatherCode: 57,
          summary: "Dense freezing drizzle",
          family: "mixed",
        },
      ],
    });

    expect(insights).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          id: "umbrella",
          title: "Bring rain gear",
        }),
      ]),
    );
    expect(insights.map((insight) => insight.id)).not.toContain("wind");
  });
});

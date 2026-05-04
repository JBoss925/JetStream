import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { NormalizedWeatherResponse } from "@jetstream-weather/domain";
import { WeatherDashboard } from "./WeatherDashboard";
import { testWeatherScenarios } from "../testWeatherScenarios";

function weather(id = "clear-hot-dry"): NormalizedWeatherResponse {
  const scenario = testWeatherScenarios.find((item) => item.id === id);
  if (!scenario) {
    throw new Error(`Unknown scenario ${id}`);
  }

  return scenario.build("imperial");
}

describe("WeatherDashboard", () => {
  it("renders sparse optional weather data with fallback copy", () => {
    const sparse = weather("missing-optional-sensors");

    render(
      <WeatherDashboard
        weather={{
          ...sparse,
          location: { ...sparse.location, region: undefined },
          current: {
            ...sparse.current,
            humidity: undefined,
            cloudCover: undefined,
            pressure: undefined,
            windSpeed: undefined,
            windDirection: undefined,
            precipitationProbability: 55,
            uvIndex: undefined,
          },
          hourly: sparse.hourly.map((point) => ({
            ...point,
            humidity: undefined,
            cloudCover: undefined,
            windSpeed: undefined,
            windDirection: undefined,
          })),
          daily: sparse.daily.map((day) => ({
            ...day,
            sunrise: undefined,
            sunset: undefined,
            uvIndexMax: undefined,
          })),
        }}
      />,
    );

    expect(screen.getByText("Fixture")).toBeVisible();
    expect(screen.getByText("-- hPa")).toBeVisible();
    expect(screen.getByText("Pressure unavailable")).toBeVisible();
    expect(screen.getByRole("heading", { name: "Unavailable" })).toBeVisible();
    expect(screen.getByText("Daylight unavailable")).toBeVisible();
    expect(screen.getAllByText("--").length).toBeGreaterThan(0);
    expect(screen.getByText("Calm winds with little directional movement.")).toBeVisible();
  });

  it("renders daylight, wind, pressure, and precipitation edge states", () => {
    const storm = weather("storm-hail-critical");
    const afterSunset = {
      ...storm,
      current: {
        ...storm.current,
        observedAt: storm.daily[0].sunset ?? storm.current.observedAt,
        pressure: 1030,
        precipitationProbability: undefined,
      },
      hourly: storm.hourly.map((point) => ({
        ...point,
        precipitationProbability: 0,
      })),
    };

    render(<WeatherDashboard weather={afterSunset} />);

    expect(screen.getByText("High pressure")).toBeVisible();
    expect(screen.getByText("Sun has set")).toBeVisible();
    expect(screen.getByText("0% chance next 12 hours")).toBeVisible();
    expect(screen.getByText(/Damaging gusts may drive winds/)).toBeVisible();
  });

  it("updates precipitation drop lanes during animation loops", () => {
    const random = vi.spyOn(Math, "random").mockReturnValue(0.5);
    const rainy = weather("heavy-rain-windy");

    const { container } = render(<WeatherDashboard weather={rainy} />);
    const drop = container.querySelector(".precipitation-drop");

    expect(drop).not.toBeNull();
    fireEvent.animationIteration(drop as Element);

    expect((drop as HTMLElement).style.getPropertyValue("--drop-left")).not.toBe("");

    random.mockReturnValue(1);
    fireEvent.animationIteration(drop as Element);
    expect((drop as HTMLElement).style.getPropertyValue("--drop-left")).not.toBe("");
  });

  it("handles invalid times, empty forecasts, and wind copy fallbacks", () => {
    const base = weather("clear-hot-dry");

    render(
      <WeatherDashboard
        weather={{
          ...base,
          units: "metric",
          current: {
            ...base.current,
            observedAt: "invalid",
            windSpeed: 12,
            windGusts: 12,
            windDirection: undefined,
            uvIndex: 12,
          },
          hourly: [],
          daily: [],
        }}
      />,
    );

    expect(screen.getByText(/Updated --/)).toBeVisible();
    expect(screen.getByText("Variable winds with shifting direction.")).toBeVisible();
    expect(screen.getByText("Daylight unavailable")).toBeVisible();
    expect(screen.getByText("12 (Extreme)")).toBeVisible();
    expect(screen.getByText("-- - --")).toBeVisible();
  });

  it("falls back when daylight timestamps are invalid", () => {
    const base = weather("clear-hot-dry");

    render(
      <WeatherDashboard
        weather={{
          ...base,
          daily: [
            {
              ...base.daily[0],
              sunrise: "bad-sunrise",
              sunset: "bad-sunset",
            },
          ],
        }}
      />,
    );

    expect(screen.getAllByText("--").length).toBeGreaterThan(0);
    expect(screen.getByText("Daylight unavailable")).toBeVisible();
  });

  it("covers daylight countdown and wind severity variants", () => {
    const base = weather("clear-hot-dry");

    const variants: NormalizedWeatherResponse[] = [
      {
        ...base,
        current: {
          ...base.current,
          observedAt: "2026-07-18T12:02:00Z",
          windSpeed: 2,
          windGusts: 2,
          windDirection: 90,
        },
        daily: [
          { ...base.daily[0], sunrise: "2026-07-18T12:32:00Z", sunset: "2026-07-18T14:32:00Z", uvIndexMax: 4 },
        ],
      },
      {
        ...base,
        current: {
          ...base.current,
          observedAt: "2026-07-18T11:32:00Z",
          windSpeed: 14,
          windDirection: 180,
        },
        daily: [
          { ...base.daily[0], sunrise: "2026-07-18T12:32:00Z", sunset: "2026-07-18T14:32:00Z", uvIndexMax: 9 },
        ],
      },
      {
        ...base,
        current: {
          ...base.current,
          observedAt: "2026-07-18T13:02:00Z",
          windSpeed: 24,
          windDirection: 270,
        },
        daily: [
          { ...base.daily[0], sunrise: "2026-07-18T12:32:00Z", sunset: "2026-07-18T14:32:00Z", uvIndexMax: 2 },
        ],
      },
    ];

    const { rerender } = render(<WeatherDashboard weather={variants[0]} />);
    expect(screen.getByText(/Light, barely moving winds drifting/)).toBeVisible();
    expect(screen.getByText("30 min until sunrise")).toBeVisible();
    expect(screen.getByText("4 (Moderate)")).toBeVisible();

    rerender(<WeatherDashboard weather={variants[1]} />);
    expect(screen.getByText(/Steady winds are tracking/)).toBeVisible();
    expect(screen.getByText("1 hr until sunrise")).toBeVisible();
    expect(screen.getByText("9 (Very High)")).toBeVisible();

    rerender(<WeatherDashboard weather={variants[2]} />);
    expect(screen.getByText(/Strong winds are pushing/)).toBeVisible();
    expect(screen.getByText("1 hr 30 min left")).toBeVisible();
  });
});

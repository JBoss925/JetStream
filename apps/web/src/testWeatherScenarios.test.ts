import { describe, expect, it } from "vitest";
import { testWeatherScenarios } from "./testWeatherScenarios";

const families = ["clear", "clouds", "fog", "drizzle", "rain", "snow", "storm", "mixed"];

describe("testWeatherScenarios", () => {
  it("covers every weather family in day and night presentations", () => {
    const dayFamilies = new Set(
      testWeatherScenarios
        .filter((scenario) => scenario.build("imperial").current.isDay)
        .map((scenario) => scenario.family),
    );
    const nightFamilies = new Set(
      testWeatherScenarios
        .filter((scenario) => !scenario.build("imperial").current.isDay)
        .map((scenario) => scenario.family),
    );

    expect(dayFamilies).toEqual(new Set(families));
    expect(nightFamilies).toEqual(new Set(families));
  });

  it("covers instrument extremes and optional missing fields", () => {
    const weathers = testWeatherScenarios.map((scenario) => scenario.build("imperial"));
    const currentValues = weathers.map((weather) => weather.current);

    expect(Math.min(...currentValues.map((current) => current.humidity ?? 50))).toBeLessThanOrEqual(10);
    expect(Math.max(...currentValues.map((current) => current.humidity ?? 0))).toBe(100);
    expect(Math.min(...currentValues.map((current) => current.cloudCover ?? 50))).toBe(0);
    expect(Math.max(...currentValues.map((current) => current.cloudCover ?? 0))).toBe(100);
    expect(Math.min(...currentValues.map((current) => current.windSpeed ?? 0))).toBe(0);
    expect(Math.max(...currentValues.map((current) => current.windSpeed ?? 0))).toBeGreaterThanOrEqual(45);
    expect(
      currentValues.some(
        (current) =>
          current.windSpeed !== undefined &&
          current.windGusts !== undefined &&
          current.windGusts > current.windSpeed,
      ),
    ).toBe(true);
    expect(Math.min(...currentValues.map((current) => current.pressure ?? 1013))).toBeLessThan(990);
    expect(Math.max(...currentValues.map((current) => current.pressure ?? 1013))).toBeGreaterThan(1025);
    expect(Math.max(...currentValues.map((current) => current.precipitation ?? 0))).toBeGreaterThan(2);
    expect(Math.min(...weathers.flatMap((weather) => weather.daily.map((day) => day.uvIndexMax ?? 0)))).toBeGreaterThanOrEqual(0);
    expect(Math.max(...weathers.flatMap((weather) => weather.daily.map((day) => day.uvIndexMax ?? 0)))).toBeGreaterThan(8);
    expect(currentValues.some((current) => current.humidity === undefined)).toBe(true);
    expect(currentValues.some((current) => current.cloudCover === undefined)).toBe(true);
    expect(currentValues.some((current) => current.windSpeed === undefined)).toBe(true);
    expect(currentValues.some((current) => current.pressure === undefined)).toBe(true);
    expect(weathers.some((weather) => weather.current.precipitation === undefined)).toBe(true);
    expect(
      weathers.some((weather) =>
        weather.hourly.every((point) => point.precipitationProbability === undefined),
      ),
    ).toBe(true);
    expect(
      weathers.some((weather) => weather.daily.every((day) => day.uvIndexMax === undefined)),
    ).toBe(true);
  });

  it("keeps every scenario valid across imperial and metric units", () => {
    for (const scenario of testWeatherScenarios) {
      for (const units of ["imperial", "metric"] as const) {
        const weather = scenario.build(units);
        const observedAt = new Date(weather.current.observedAt).getTime();

        expect(weather.units).toBe(units);
        expect(weather.current.family).toBe(scenario.family);
        expect(weather.hourly).toHaveLength(12);
        expect(weather.daily).toHaveLength(7);
        expect(weather.insights.length).toBeGreaterThan(0);
        expect(weather.source.attribution).toBe("Test weather fixture");

        for (const point of weather.hourly) {
          const pointDate = new Date(point.time);

          expect(pointDate.getTime()).toBeGreaterThan(observedAt);
          expect(pointDate.getUTCMinutes()).toBe(0);
          expect(pointDate.getUTCSeconds()).toBe(0);
          expect(point.temperature).toEqual(expect.any(Number));
          expect(point.apparentTemperature).toEqual(expect.any(Number));
          expect(point.precipitationProbability ?? 0).toBeGreaterThanOrEqual(0);
          expect(point.precipitationProbability ?? 0).toBeLessThanOrEqual(100);
          expect(point.humidity ?? 0).toBeGreaterThanOrEqual(0);
          expect(point.humidity ?? 0).toBeLessThanOrEqual(100);
          expect(point.cloudCover ?? 0).toBeGreaterThanOrEqual(0);
          expect(point.cloudCover ?? 0).toBeLessThanOrEqual(100);
          if (point.windDirection !== undefined) {
            expect(point.windDirection).toBeGreaterThanOrEqual(0);
            expect(point.windDirection).toBeLessThan(360);
          }
        }

        if (weather.current.windGusts !== undefined) {
          expect(weather.current.windGusts).toBeGreaterThanOrEqual(0);
        }

        for (const day of weather.daily) {
          expect(day.tempMax).toBeGreaterThanOrEqual(day.tempMin);
          expect(day.precipitationProbabilityMax ?? 0).toBeGreaterThanOrEqual(0);
          expect(day.precipitationProbabilityMax ?? 0).toBeLessThanOrEqual(100);
          expect(day.uvIndexMax ?? 0).toBeGreaterThanOrEqual(0);
          expect(day.uvIndexMax ?? 0).toBeLessThanOrEqual(12);
        }
      }
    }
  });

  it("includes hourly variation for each instrument display", () => {
    for (const scenario of testWeatherScenarios) {
      const weather = scenario.build("imperial");
      const hourly = weather.hourly;

      expect(new Set(hourly.map((point) => point.weatherCode)).size).toBeGreaterThan(1);
      if (hourly.some((point) => point.precipitationProbability !== undefined)) {
        expect(new Set(hourly.map((point) => point.precipitationProbability)).size).toBeGreaterThan(1);
      }
      if (weather.current.humidity !== undefined) {
        expect(new Set(hourly.map((point) => point.humidity)).size).toBeGreaterThan(1);
      }
      if (weather.current.cloudCover !== undefined) {
        expect(new Set(hourly.map((point) => point.cloudCover)).size).toBeGreaterThan(1);
      }
      if (weather.current.windSpeed !== undefined) {
        expect(new Set(hourly.map((point) => point.windSpeed)).size).toBeGreaterThan(1);
        expect(new Set(hourly.map((point) => point.windDirection)).size).toBeGreaterThan(1);
      }
    }
  });
});

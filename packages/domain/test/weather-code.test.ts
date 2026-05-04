import { describe, expect, it } from "vitest";
import { getWeatherCodeInfo, isWetWeather } from "../src/weather-code.js";

describe("weather code helpers", () => {
  it("maps supported WMO codes to app weather families", () => {
    const expectations = [
      [0, "Clear sky", "clear"],
      [1, "Mostly clear", "clear"],
      [2, "Partly cloudy", "clouds"],
      [3, "Overcast", "clouds"],
      [45, "Fog", "fog"],
      [48, "Depositing rime fog", "fog"],
      [51, "Light drizzle", "drizzle"],
      [53, "Drizzle", "drizzle"],
      [55, "Dense drizzle", "drizzle"],
      [56, "Freezing drizzle", "mixed"],
      [57, "Dense freezing drizzle", "mixed"],
      [61, "Light rain", "rain"],
      [63, "Rain", "rain"],
      [65, "Heavy rain", "rain"],
      [66, "Freezing rain", "mixed"],
      [67, "Heavy freezing rain", "mixed"],
      [71, "Light snow", "snow"],
      [73, "Snow", "snow"],
      [75, "Heavy snow", "snow"],
      [77, "Snow grains", "snow"],
      [80, "Light rain showers", "rain"],
      [81, "Rain showers", "rain"],
      [82, "Violent rain showers", "rain"],
      [85, "Light snow showers", "snow"],
      [86, "Heavy snow showers", "snow"],
      [95, "Thunderstorm", "storm"],
      [96, "Thunderstorm with hail", "storm"],
      [99, "Severe thunderstorm with hail", "storm"],
    ] as const;

    for (const [code, summary, family] of expectations) {
      expect(getWeatherCodeInfo(code)).toEqual({ code, summary, family });
    }
  });

  it("falls back safely for unknown weather codes", () => {
    expect(getWeatherCodeInfo(999)).toEqual({
      code: 999,
      summary: "Unclassified conditions",
      family: "clouds",
    });
  });

  it("classifies precipitation families as wet weather", () => {
    expect(isWetWeather("clear")).toBe(false);
    expect(isWetWeather("clouds")).toBe(false);
    expect(isWetWeather("drizzle")).toBe(true);
    expect(isWetWeather("rain")).toBe(true);
    expect(isWetWeather("snow")).toBe(true);
    expect(isWetWeather("storm")).toBe(true);
    expect(isWetWeather("mixed")).toBe(true);
  });
});

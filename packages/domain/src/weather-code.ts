import type { WeatherFamily } from "./weather.types.js";

export interface WeatherCodeInfo {
  code: number;
  summary: string;
  family: WeatherFamily;
}

const codeMap = new Map<number, Omit<WeatherCodeInfo, "code">>([
  [0, { summary: "Clear sky", family: "clear" }],
  [1, { summary: "Mostly clear", family: "clear" }],
  [2, { summary: "Partly cloudy", family: "clouds" }],
  [3, { summary: "Overcast", family: "clouds" }],
  [45, { summary: "Fog", family: "fog" }],
  [48, { summary: "Depositing rime fog", family: "fog" }],
  [51, { summary: "Light drizzle", family: "drizzle" }],
  [53, { summary: "Drizzle", family: "drizzle" }],
  [55, { summary: "Dense drizzle", family: "drizzle" }],
  [56, { summary: "Freezing drizzle", family: "mixed" }],
  [57, { summary: "Dense freezing drizzle", family: "mixed" }],
  [61, { summary: "Light rain", family: "rain" }],
  [63, { summary: "Rain", family: "rain" }],
  [65, { summary: "Heavy rain", family: "rain" }],
  [66, { summary: "Freezing rain", family: "mixed" }],
  [67, { summary: "Heavy freezing rain", family: "mixed" }],
  [71, { summary: "Light snow", family: "snow" }],
  [73, { summary: "Snow", family: "snow" }],
  [75, { summary: "Heavy snow", family: "snow" }],
  [77, { summary: "Snow grains", family: "snow" }],
  [80, { summary: "Light rain showers", family: "rain" }],
  [81, { summary: "Rain showers", family: "rain" }],
  [82, { summary: "Violent rain showers", family: "rain" }],
  [85, { summary: "Light snow showers", family: "snow" }],
  [86, { summary: "Heavy snow showers", family: "snow" }],
  [95, { summary: "Thunderstorm", family: "storm" }],
  [96, { summary: "Thunderstorm with hail", family: "storm" }],
  [99, { summary: "Severe thunderstorm with hail", family: "storm" }],
]);

export function getWeatherCodeInfo(code: number): WeatherCodeInfo {
  const info = codeMap.get(code);

  if (!info) {
    return {
      code,
      summary: "Unclassified conditions",
      family: "clouds",
    };
  }

  return {
    code,
    ...info,
  };
}

export function isWetWeather(family: WeatherFamily): boolean {
  return ["drizzle", "rain", "storm", "mixed", "snow"].includes(family);
}

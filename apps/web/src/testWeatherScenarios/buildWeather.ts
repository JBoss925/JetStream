import {
  deriveWeatherInsights,
  getWeatherCodeInfo,
  type DailyForecast,
  type HourlyPoint,
  type NormalizedWeatherResponse,
  type Units,
} from "@jetstream-weather/domain";
import type { ScenarioSeed } from "./types";

export function buildWeather(
  seed: ScenarioSeed,
  units: Units,
): NormalizedWeatherResponse {
  const currentCode = getWeatherCodeInfo(seed.code);
  const daily = buildDaily(seed, units);
  const hourly = buildHourly(seed, units);
  const weatherWithoutInsights = {
    location: seed.location,
    units,
    current: {
      observedAt: seed.observedAt,
      temperature: convertTemperature(seed.temperatureF, units),
      apparentTemperature: convertTemperature(seed.apparentTemperatureF, units),
      weatherCode: currentCode.code,
      summary: currentCode.summary,
      family: currentCode.family,
      humidity: seed.humidity,
      windSpeed:
        seed.windSpeedMph === undefined
          ? undefined
          : convertWindSpeed(seed.windSpeedMph, units),
      windGusts:
        seed.windGustsMph === undefined
          ? undefined
          : convertWindSpeed(seed.windGustsMph, units),
      windDirection: seed.windDirection,
      pressure: seed.pressure,
      cloudCover: seed.cloudCover,
      precipitation:
        seed.precipitation === undefined
          ? undefined
          : convertPrecipitation(seed.precipitation, units),
      isDay: seed.isDay,
    },
    hourly,
    daily,
    source: {
      provider: "open-meteo" as const,
      attribution: "Test weather fixture",
    },
    fetchedAt: "2026-05-01T00:00:00.000Z",
  };

  return {
    ...weatherWithoutInsights,
    insights: deriveWeatherInsights(weatherWithoutInsights),
  };
}

function buildHourly(seed: ScenarioSeed, units: Units): HourlyPoint[] {
  const start = nextWholeHour(seed.observedAt).getTime();

  return seed.hourlyCodes.map((code, index) => {
    const info = getWeatherCodeInfo(code);
    const offset = index - 2;
    const tempF = seed.temperatureF + offset * 1.7;

    return {
      time: new Date(start + index * 60 * 60 * 1000).toISOString(),
      temperature: convertTemperature(tempF, units),
      apparentTemperature: convertTemperature(
        tempF + (seed.apparentTemperatureF - seed.temperatureF),
        units,
      ),
      weatherCode: info.code,
      summary: info.summary,
      family: info.family,
      humidity: Math.round(clamp((seed.humidity ?? 50) + offset * 2, 0, 100)),
      precipitationProbability: seed.hourlyPrecipitation[index],
      cloudCover: Math.round(clamp((seed.cloudCover ?? 0) + offset * 3, 0, 100)),
      windSpeed:
        seed.windSpeedMph === undefined
          ? undefined
          : convertWindSpeed(seed.windSpeedMph + (index % 4) * 2, units),
      windDirection:
        seed.windDirection === undefined
          ? undefined
          : (seed.windDirection + index * 18) % 360,
    };
  });
}

function nextWholeHour(value: string): Date {
  const date = new Date(value);
  date.setUTCMinutes(0, 0, 0);
  date.setUTCHours(date.getUTCHours() + 1);

  return date;
}

function buildDaily(seed: ScenarioSeed, units: Units): DailyForecast[] {
  const codes = seed.dailyCodes ?? seed.hourlyCodes.slice(0, 7);
  const start = new Date(`${seed.observedAt.slice(0, 10)}T12:00:00Z`).getTime();
  const [lowF, highF] = seed.dailyRangeF;

  return Array.from({ length: 7 }, (_, index) => {
    const info = getWeatherCodeInfo(codes[index % codes.length]);
    const tempMin = convertTemperature(lowF + index * 2 - 4, units);
    const tempMax = convertTemperature(highF + index * 3 - 6, units);

    return {
      date: new Date(start + index * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      tempMin: Math.min(tempMin, tempMax),
      tempMax: Math.max(tempMin, tempMax),
      weatherCode: info.code,
      summary: info.summary,
      family: info.family,
      sunrise: index === 0 ? seed.sunrise : shiftedIso(seed.sunrise, index),
      sunset: index === 0 ? seed.sunset : shiftedIso(seed.sunset, index),
      precipitationProbabilityMax: Math.max(
        0,
        ...seed.hourlyPrecipitation.slice(index, index + 5),
      ),
      uvIndexMax: seed.dailyUvIndexMax?.[index] ?? estimateUvIndex(seed, index),
    };
  });
}

function estimateUvIndex(seed: ScenarioSeed, index: number): number {
  const clearSkyFactor = 1 - (seed.cloudCover ?? 50) / 140;
  const warmSeasonFactor = clamp((seed.dailyRangeF[1] - 20) / 90, 0.2, 1);
  const dayVariation = 1 + index * 0.05;

  return round(clamp(12 * clearSkyFactor * warmSeasonFactor * dayVariation, 0, 12));
}

function shiftedIso(value: string | undefined, days: number): string | undefined {
  if (!value) {
    return undefined;
  }

  return new Date(new Date(value).getTime() + days * 24 * 60 * 60 * 1000).toISOString();
}

function convertTemperature(valueF: number, units: Units): number {
  return units === "imperial" ? round(valueF) : round((valueF - 32) * (5 / 9));
}

function convertWindSpeed(valueMph: number, units: Units): number {
  return units === "imperial" ? round(valueMph) : round(valueMph * 1.609);
}

function convertPrecipitation(valueInches: number, units: Units): number {
  return units === "imperial" ? round(valueInches) : round(valueInches * 25.4);
}

function round(value: number): number {
  return Math.round(value * 10) / 10;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

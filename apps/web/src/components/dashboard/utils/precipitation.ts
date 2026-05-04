import type { HourlyPoint, NormalizedWeatherResponse } from "@jetstream-weather/domain";

export function precipitationPeak(hourly: HourlyPoint[]): number {
  return Math.max(
    0,
    ...hourly.slice(0, 12).map((point) => point.precipitationProbability ?? 0),
  );
}

export function currentPrecipitationProbability(weather: NormalizedWeatherResponse): number {
  return Math.round(
    weather.current.precipitationProbability ??
      weather.hourly[0]?.precipitationProbability ??
      precipitationPeak(weather.hourly),
  );
}

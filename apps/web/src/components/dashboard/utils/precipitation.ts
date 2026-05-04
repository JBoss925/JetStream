import type { HourlyPoint, NormalizedWeatherResponse } from "@jetstream-weather/domain";

export function precipitationPeak(hourly: HourlyPoint[]): number {
  return Math.max(
    0,
    ...hourly.slice(0, 12).map((point) => point.precipitationProbability ?? 0),
  );
}

export function hasPrecipitationProbabilityData(hourly: HourlyPoint[]): boolean {
  return hourly.slice(0, 12).some((point) => point.precipitationProbability !== undefined);
}

export function currentPrecipitationProbability(
  weather: NormalizedWeatherResponse,
): number | undefined {
  const probability =
    weather.current.precipitationProbability ??
    weather.hourly[0]?.precipitationProbability ??
    (hasPrecipitationProbabilityData(weather.hourly) ? precipitationPeak(weather.hourly) : undefined);

  return probability === undefined ? undefined : Math.round(probability);
}

import type { DailyForecast, NormalizedWeatherResponse } from "@jetstream-weather/domain";
import type { WeatherCssProperties } from "../types";

export function dailyRangeStyle(
  forecast: DailyForecast,
  weather: NormalizedWeatherResponse,
): WeatherCssProperties {
  const temperatures = weather.daily.flatMap((day) => [day.tempMin, day.tempMax]);
  const min = Math.min(...temperatures);
  const max = Math.max(...temperatures);
  const span = Math.max(max - min, 1);

  return {
    "--range-start": `${((forecast.tempMin - min) / span) * 100}%`,
    "--range-width": `${Math.max(((forecast.tempMax - forecast.tempMin) / span) * 100, 8)}%`,
  };
}

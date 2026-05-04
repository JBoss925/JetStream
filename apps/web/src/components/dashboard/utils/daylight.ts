import type { NormalizedWeatherResponse } from "@jetstream-weather/domain";
import { clamp } from "./math";

function formatDuration(minutes: number, suffix: string): string {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes} min ${suffix}`;
  }

  if (remainingMinutes === 0) {
    return `${hours} hr ${suffix}`;
  }

  return `${hours} hr ${remainingMinutes} min ${suffix}`;
}

export function daylightCountdown(
  observedAt: string,
  sunrise: string | undefined,
  sunset: string | undefined,
): string {
  if (!sunrise || !sunset) {
    return "--";
  }

  const now = new Date(observedAt).getTime();
  const start = new Date(sunrise).getTime();
  const end = new Date(sunset).getTime();

  if (!Number.isFinite(now) || !Number.isFinite(start) || !Number.isFinite(end)) {
    return "--";
  }

  if (now < start) {
    return formatDuration(Math.round((start - now) / 60000), "until sunrise");
  }

  if (now >= end) {
    return "Sun has set";
  }

  return formatDuration(Math.round((end - now) / 60000), "left");
}

export function daylightProgress(weather: NormalizedWeatherResponse): number | null {
  const sunrise = weather.daily[0]?.sunrise;
  const sunset = weather.daily[0]?.sunset;

  if (!sunrise || !sunset) {
    return null;
  }

  const start = new Date(sunrise).getTime();
  const end = new Date(sunset).getTime();
  const now = new Date(weather.current.observedAt).getTime();

  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    return null;
  }

  return clamp(((now - start) / (end - start)) * 100, 0, 100);
}

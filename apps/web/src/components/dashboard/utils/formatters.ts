import type { NormalizedWeatherResponse } from "@jetstream-weather/domain";

export function unitSymbol(weather: NormalizedWeatherResponse): string {
  return weather.units === "imperial" ? "°F" : "°C";
}

export function windUnit(weather: NormalizedWeatherResponse): string {
  return weather.units === "imperial" ? "mph" : "km/h";
}

export function formatTime(value: string): string {
  const date = new Date(value);

  if (!Number.isFinite(date.getTime())) {
    return "--";
  }

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function formatDay(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
  }).format(new Date(`${value}T12:00:00`));
}

export function formatForecastDate(value: string | undefined): string {
  if (!value) {
    return "--";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}

export function formatUvIndex(value: number | undefined): string {
  if (value === undefined) {
    return "--";
  }

  const formattedValue = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
  }).format(value);

  return `${formattedValue} (${uvIndexSeverity(value)})`;
}

function uvIndexSeverity(value: number): string {
  if (value < 3) {
    return "Low";
  }

  if (value < 6) {
    return "Moderate";
  }

  if (value < 8) {
    return "High";
  }

  if (value < 11) {
    return "Very High";
  }

  return "Extreme";
}

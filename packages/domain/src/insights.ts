import type {
  DailyForecast,
  NormalizedWeatherResponse,
  Units,
  WeatherInsight,
} from "./weather.types.js";
import { isWetWeather } from "./weather-code.js";

function temperatureLabel(units: Units): string {
  return units === "imperial" ? "°F" : "°C";
}

function coldThreshold(units: Units): number {
  return units === "imperial" ? 40 : 4;
}

function hotThreshold(units: Units): number {
  return units === "imperial" ? 90 : 32;
}

function strongWindThreshold(units: Units): number {
  return units === "imperial" ? 25 : 40;
}

function findWetPeriod(hourly: NormalizedWeatherResponse["hourly"]) {
  return hourly.find((point) => {
    const probability = point.precipitationProbability ?? 0;
    return probability >= 45 || isWetWeather(point.family);
  });
}

function formatHour(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function todayRange(daily: DailyForecast | undefined): string | undefined {
  if (!daily) {
    return undefined;
  }

  return `${Math.round(daily.tempMax)}° / ${Math.round(daily.tempMin)}`;
}

export function deriveWeatherInsights(
  weather: Omit<NormalizedWeatherResponse, "insights">,
): WeatherInsight[] {
  const insights: WeatherInsight[] = [];
  const label = temperatureLabel(weather.units);
  const range = todayRange(weather.daily[0]);
  const apparentDelta = Math.abs(
    weather.current.apparentTemperature - weather.current.temperature,
  );

  if (range) {
    insights.push({
      id: "comfort",
      kind: "comfort",
      severity: "info",
      title: "Day range",
      message: `Expect ${range}${label} today with ${weather.current.summary.toLowerCase()} right now.`,
    });
  }

  if (apparentDelta >= 5) {
    insights.push({
      id: "feels-like",
      kind: "temperature",
      severity: "warning",
      title: "Feels different outside",
      message: `It feels like ${Math.round(weather.current.apparentTemperature)}${label}, ${Math.round(apparentDelta)}${label} away from the measured temperature.`,
    });
  } else if (weather.current.temperature <= coldThreshold(weather.units)) {
    insights.push({
      id: "cold",
      kind: "temperature",
      severity: "warning",
      title: "Cold conditions",
      message: "Dress in layers if you will be outside for more than a few minutes.",
    });
  } else if (weather.current.temperature >= hotThreshold(weather.units)) {
    insights.push({
      id: "heat",
      kind: "temperature",
      severity: "warning",
      title: "Heat awareness",
      message: "Plan for shade and hydration during longer outdoor activity.",
    });
  }

  const wetPeriod = findWetPeriod(weather.hourly.slice(0, 12));
  if (wetPeriod) {
    insights.push({
      id: "umbrella",
      kind: "umbrella",
      severity: wetPeriod.family === "storm" ? "critical" : "warning",
      title: wetPeriod.family === "snow" ? "Snow possible" : "Bring rain gear",
      message: `${wetPeriod.summary} is possible around ${formatHour(wetPeriod.time)}.`,
    });
  }

  const windSpeed = weather.current.windSpeed ?? 0;
  if (windSpeed >= strongWindThreshold(weather.units)) {
    insights.push({
      id: "wind",
      kind: "wind",
      severity: "warning",
      title: "Gusty conditions",
      message: `Winds are near ${Math.round(windSpeed)} ${weather.units === "imperial" ? "mph" : "km/h"}. Secure loose outdoor items.`,
    });
  }

  const sunrise = weather.daily[0]?.sunrise;
  const sunset = weather.daily[0]?.sunset;
  if (sunrise && sunset) {
    insights.push({
      id: "daylight",
      kind: "daylight",
      severity: "info",
      title: "Daylight window",
      message: `Sunrise is ${formatHour(sunrise)} and sunset is ${formatHour(sunset)}.`,
    });
  }

  return insights.slice(0, 4);
}

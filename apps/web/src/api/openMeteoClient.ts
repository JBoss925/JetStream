import {
  deriveWeatherInsights,
  getWeatherCodeInfo,
  type LocationOption,
  type NormalizedWeatherResponse,
  type Units,
} from "@jetstream-weather/domain";
import { fetchJson } from "./http";
import type { OpenMeteoForecastResponse, OpenMeteoLocationResponse } from "./openMeteoTypes";

const forecastBaseUrl = "https://api.open-meteo.com/v1";
const geocodingBaseUrl = "https://geocoding-api.open-meteo.com/v1";

export async function searchOpenMeteoLocations(
  query: string,
  signal?: AbortSignal,
): Promise<LocationOption[]> {
  if (query.trim().length < 2) {
    return [];
  }

  const url = new URL(`${geocodingBaseUrl}/search`);
  url.searchParams.set("name", query);
  url.searchParams.set("count", "6");
  url.searchParams.set("language", "en");
  url.searchParams.set("format", "json");

  const payload = await fetchJson<OpenMeteoLocationResponse>(url, signal);

  return (payload.results ?? []).map((result) => ({
    id: String(result.id),
    name: result.name,
    region: result.admin1,
    country: result.country,
    latitude: result.latitude,
    longitude: result.longitude,
    timezone: result.timezone ?? "auto",
  }));
}

export async function getOpenMeteoWeather(
  location: LocationOption,
  units: Units,
  signal?: AbortSignal,
): Promise<NormalizedWeatherResponse> {
  const payload = await fetchJson<OpenMeteoForecastResponse>(
    buildForecastUrl(location, units),
    signal,
  );

  return normalizeForecast(payload, location, units);
}

function buildForecastUrl(location: LocationOption, units: Units): URL {
  const url = new URL(`${forecastBaseUrl}/forecast`);
  const temperatureUnit = units === "imperial" ? "fahrenheit" : "celsius";
  const windSpeedUnit = units === "imperial" ? "mph" : "kmh";
  const precipitationUnit = units === "imperial" ? "inch" : "mm";

  url.searchParams.set("latitude", String(location.latitude));
  url.searchParams.set("longitude", String(location.longitude));
  url.searchParams.set("timezone", location.timezone || "auto");
  url.searchParams.set("temperature_unit", temperatureUnit);
  url.searchParams.set("wind_speed_unit", windSpeedUnit);
  url.searchParams.set("precipitation_unit", precipitationUnit);
  url.searchParams.set("forecast_days", "7");
  url.searchParams.set("forecast_hours", "48");
  url.searchParams.set(
    "current",
    [
      "temperature_2m",
      "relative_humidity_2m",
      "apparent_temperature",
      "is_day",
      "precipitation",
      "weather_code",
      "cloud_cover",
      "pressure_msl",
      "wind_speed_10m",
      "wind_gusts_10m",
      "wind_direction_10m",
    ].join(","),
  );
  url.searchParams.set(
    "hourly",
    [
      "temperature_2m",
      "apparent_temperature",
      "relative_humidity_2m",
      "precipitation_probability",
      "weather_code",
      "cloud_cover",
      "wind_speed_10m",
      "wind_direction_10m",
    ].join(","),
  );
  url.searchParams.set(
    "daily",
    [
      "weather_code",
      "temperature_2m_max",
      "temperature_2m_min",
      "sunrise",
      "sunset",
      "precipitation_probability_max",
      "uv_index_max",
    ].join(","),
  );

  return url;
}

function normalizeForecast(
  payload: OpenMeteoForecastResponse,
  requestedLocation: LocationOption,
  units: Units,
): NormalizedWeatherResponse {
  const currentCode = getWeatherCodeInfo(payload.current.weather_code);
  const location: LocationOption = {
    ...requestedLocation,
    timezone: payload.timezone || requestedLocation.timezone || "auto",
  };
  const currentHourIndex = payload.hourly.time.findIndex(
    (time) => time > payload.current.time,
  );
  const hourlyStartIndex = currentHourIndex >= 0 ? currentHourIndex : 0;

  const hourly = payload.hourly.time
    .slice(hourlyStartIndex, hourlyStartIndex + 48)
    .map((time, relativeIndex) => {
      const index = hourlyStartIndex + relativeIndex;
      const codeInfo = getWeatherCodeInfo(payload.hourly.weather_code[index] ?? 0);

      return {
        time,
        temperature: payload.hourly.temperature_2m[index],
        apparentTemperature: payload.hourly.apparent_temperature[index],
        weatherCode: codeInfo.code,
        summary: codeInfo.summary,
        family: codeInfo.family,
        humidity: payload.hourly.relative_humidity_2m?.[index],
        precipitationProbability:
          payload.hourly.precipitation_probability?.[index],
        cloudCover: payload.hourly.cloud_cover?.[index],
        windSpeed: payload.hourly.wind_speed_10m?.[index],
        windDirection: payload.hourly.wind_direction_10m?.[index],
      };
    });

  const daily = payload.daily.time.map((date, index) => {
    const codeInfo = getWeatherCodeInfo(payload.daily.weather_code[index] ?? 0);

    return {
      date,
      tempMin: payload.daily.temperature_2m_min[index],
      tempMax: payload.daily.temperature_2m_max[index],
      weatherCode: codeInfo.code,
      summary: codeInfo.summary,
      family: codeInfo.family,
      sunrise: payload.daily.sunrise?.[index],
      sunset: payload.daily.sunset?.[index],
      precipitationProbabilityMax:
        payload.daily.precipitation_probability_max?.[index],
      uvIndexMax: payload.daily.uv_index_max?.[index],
    };
  });

  const weatherWithoutInsights = {
    location,
    units,
    current: {
      observedAt: payload.current.time,
      temperature: payload.current.temperature_2m,
      apparentTemperature: payload.current.apparent_temperature,
      weatherCode: currentCode.code,
      summary: currentCode.summary,
      family: currentCode.family,
      humidity: payload.current.relative_humidity_2m,
      windSpeed: payload.current.wind_speed_10m,
      windGusts: payload.current.wind_gusts_10m,
      windDirection: payload.current.wind_direction_10m,
      pressure: payload.current.pressure_msl,
      cloudCover: payload.current.cloud_cover,
      precipitation: payload.current.precipitation,
      isDay: payload.current.is_day === 1,
    },
    hourly,
    daily,
    source: {
      provider: "open-meteo" as const,
      attribution: "Weather data by Open-Meteo",
    },
    fetchedAt: new Date().toISOString(),
  };

  return {
    ...weatherWithoutInsights,
    insights: deriveWeatherInsights(weatherWithoutInsights),
  };
}

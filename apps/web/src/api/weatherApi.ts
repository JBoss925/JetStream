import {
  parseLocationSearchQuery,
  type LocationOption,
  type NormalizedWeatherResponse,
  type Units,
} from "@jetstream-weather/domain";
import { requestedDataSource } from "./dataSource";
import { fetchJson } from "./http";
import { getOpenMeteoWeather, searchOpenMeteoLocations } from "./openMeteoClient";

const backendBaseUrl =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

export async function searchLocations(
  query: string,
  signal?: AbortSignal,
): Promise<LocationOption[]> {
  if (requestedDataSource() === "direct") {
    return searchOpenMeteoLocations(query, signal);
  }

  const search = parseLocationSearchQuery(query);
  const url = new URL(`${backendBaseUrl}/api/locations/search`);
  url.searchParams.set("name", search.city);

  if (search.region) {
    url.searchParams.set("region", search.region);
  }

  if (search.country) {
    url.searchParams.set("country", search.country);
  }

  return fetchJson<LocationOption[]>(url, signal);
}

export async function getWeather(
  location: LocationOption,
  units: Units,
  signal?: AbortSignal,
): Promise<NormalizedWeatherResponse> {
  if (requestedDataSource() === "direct") {
    return getOpenMeteoWeather(location, units, signal);
  }

  const url = new URL(`${backendBaseUrl}/api/weather`);
  url.searchParams.set("latitude", String(location.latitude));
  url.searchParams.set("longitude", String(location.longitude));
  url.searchParams.set("name", location.name);
  url.searchParams.set("country", location.country);
  url.searchParams.set("timezone", location.timezone || "auto");
  url.searchParams.set("units", units);

  if (location.region) {
    url.searchParams.set("region", location.region);
  }

  return fetchJson<NormalizedWeatherResponse>(url, signal);
}

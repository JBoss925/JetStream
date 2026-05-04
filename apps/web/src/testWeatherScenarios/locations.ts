import type { LocationOption } from "@jetstream-weather/domain";

export function testLocation(
  name: string,
  region: string,
  country: string,
  latitude: number,
  longitude: number,
  timezone: string,
): LocationOption {
  return {
    id: `${name.toLowerCase().replaceAll(" ", "-")}-${region.toLowerCase().replaceAll(" ", "-")}`,
    name,
    region,
    country,
    latitude,
    longitude,
    timezone,
  };
}

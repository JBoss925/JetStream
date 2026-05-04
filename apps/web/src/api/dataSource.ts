export type WeatherDataSource = "backend" | "direct";

export function requestedDataSource(): WeatherDataSource {
  const envMode = import.meta.env.VITE_WEATHER_DATA_SOURCE;
  const normalizedEnvMode = envMode === "direct" ? "direct" : "backend";

  /* v8 ignore next 3 -- SSR/test-runner guard; browser behavior is covered. */
  if (typeof window === "undefined") {
    return normalizedEnvMode;
  }

  const params = new URLSearchParams(window.location.search);
  const urlMode = params.get("weatherSource") ?? params.get("dataSource");

  if (urlMode === "direct" || urlMode === "backend") {
    return urlMode;
  }

  return normalizedEnvMode;
}

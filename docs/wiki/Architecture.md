# Architecture

JetStream is an npm workspace monorepo with three active code boundaries:

- `packages/domain`: shared weather contracts and business rules.
- `apps/api`: NestJS backend-for-frontend with Swagger documentation.
- `apps/web`: React/Vite frontend.

## Default Data Flow

```text
Browser
  |
  | /api/locations/search and /api/weather
  v
NestJS API
  |
  | Open-Meteo geocoding and forecast REST calls
  v
Open-Meteo
  |
  | NormalizedWeatherResponse
  v
Weather dashboard
```

The backend owns Open-Meteo request construction and normalization in default mode. Swagger is available at `/docs`.

## Direct Data Flow

The frontend also has a hidden direct mode for frontend-only hosting:

```text
Browser
  |
  | Open-Meteo geocoding and forecast REST calls
  v
React app
  |
  | NormalizedWeatherResponse
  v
Weather dashboard
```

Enable it with `VITE_WEATHER_DATA_SOURCE=direct` or `?weatherSource=direct`. Use `?weatherSource=backend` to switch back.

## Open-Meteo Fields

Both backend and direct mode request:

- current temperature, apparent temperature, humidity, day/night, precipitation, weather code, cloud cover, pressure, wind speed, wind gusts, wind direction
- hourly temperature, apparent temperature, humidity, precipitation probability, weather code, cloud cover, wind speed, wind direction
- daily weather code, high/low temperature, sunrise, sunset, precipitation probability max, UV index max
- `forecast_hours=48`
- `forecast_days=7`

## Shared Domain Package

The domain package contains the normalized TypeScript contracts, WMO weather-code mapping, and derived insight rules used by both runtime paths.

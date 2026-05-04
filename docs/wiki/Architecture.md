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

Enable it with `VITE_WEATHER_DATA_SOURCE=direct` or `?weatherSource=direct`. Use `?weatherSource=backend` to force the API-backed path for the current page. Data-source mode is resolved on every load from the URL first, then the build environment; it is not persisted in localStorage.

## Open-Meteo Fields

Both backend and direct mode request:

- current temperature, apparent temperature, humidity, day/night, precipitation, weather code, cloud cover, pressure, wind speed, wind gusts, wind direction
- hourly temperature, apparent temperature, humidity, precipitation probability, weather code, cloud cover, wind speed, wind direction
- daily weather code, high/low temperature, sunrise, sunset, precipitation probability max, UV index max
- `forecast_hours=48`
- `forecast_days=7`

## Shared Domain Package

The domain package contains the normalized TypeScript contracts, WMO weather-code mapping, and derived insight rules used by both runtime paths.

## TypeScript Workspace Resolution

The root `tsconfig.json` makes VS Code treat the repository as one TypeScript workspace. `tsconfig.base.json` maps `@jetstream-weather/domain` to `./packages/domain/src/index.ts` through `compilerOptions.paths`, so the web app can resolve the domain package from source even before `packages/domain/dist` exists.

The config intentionally does not use `baseUrl`; TypeScript 6 deprecates it and TypeScript 7 removes it. Path targets are written explicitly relative to `tsconfig.base.json` instead.

## Frontend Code Boundaries

The web app keeps large UI and data concerns split by responsibility:

- `routes/App.tsx` owns application state and mode selection.
- `api/weatherApi.ts` is the public client facade.
- `api/openMeteoClient.ts`, `api/dataSource.ts`, and `api/http.ts` isolate direct provider calls, data-source selection, and JSON error handling.
- `components/dashboard` contains dashboard sections and shared display utilities.
- `components/dashboard/instruments` contains one component per weather instrument.
- `styles.css` is an import manifest; concrete styles live in `styles/` and `styles/dashboard/`.
- `testWeatherScenarios` contains fixture seed data and fixture builders for visual QA.

This layout keeps each module small enough for targeted maintenance while preserving the same user-facing dashboard contract.

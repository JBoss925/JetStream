# JetStream

A production-oriented weather app with a React/Vite frontend, a NestJS backend-for-frontend with Swagger docs, and a shared domain package for normalized weather contracts and derived insight rules.

## Why This Shape

- React and Node.js satisfy the required stack.
- The NestJS API keeps provider details out of the default browser path and exposes Swagger documentation for demos.
- Open-Meteo avoids API-key friction and provides geocoding, current, hourly, and daily forecast data.
- The frontend can secretly bypass the backend for frontend-only deployments.
- Test mode keeps deterministic fixtures available for visual QA.

## Run Locally

```bash
npm install
npm run dev
```

Open the web app at `http://localhost:5173`.
Open Swagger at `http://localhost:3000/docs`.

## Data Source Modes

Backend mode is the default. The web app calls:

- `GET http://localhost:3000/api/locations/search`
- `GET http://localhost:3000/api/weather`

To bypass the backend for frontend-only deployment, set `VITE_WEATHER_DATA_SOURCE=direct` or open the app once with `?weatherSource=direct`. To switch back, use `?weatherSource=backend`.

## Useful Scripts

```bash
npm run build
npm run build:netlify
npm run test
npm run coverage
npm run typecheck
npm run lint
```

`npm run build:netlify` builds the static web application with `VITE_WEATHER_DATA_SOURCE=direct`, so the deployed app calls Open-Meteo directly and does not require a hosted API service.

`npm run coverage` enforces 100% statement, line, and function coverage across the domain, API, and web workspaces. Branch thresholds are enforced separately because V8 counts TypeScript optional/default branches and defensive runtime guards.

## Project Structure

```text
apps/
  api/        NestJS API, Swagger, Open-Meteo provider
  web/        React/Vite app, dashboard, search, direct-mode Open-Meteo client
packages/
  domain/     Shared weather contracts, WMO mapping, derived insights
docs/
  wiki/       GitHub Wiki-ready documentation pages
```

## Data Sources

- Open-Meteo geocoding: `https://geocoding-api.open-meteo.com/v1/search`
- Open-Meteo forecast: `https://api.open-meteo.com/v1/forecast`

The API requests current, hourly, and daily data including current wind gusts, daily UV index max, hourly precipitation probability, humidity, cloud cover, wind speed, and wind direction.

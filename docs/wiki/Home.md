# JetStream Wiki

JetStream is a production-oriented weather application. It combines a React/Vite app, a NestJS backend-for-frontend with Swagger docs, and a shared TypeScript domain package for normalized weather contracts, WMO weather-code mapping, and derived insight rules.

The default runtime path sends browser requests through the NestJS API, which calls Open-Meteo geocoding and forecast endpoints, normalizes the provider payload, and returns a stable dashboard contract. The frontend also has a hidden direct Open-Meteo mode for frontend-only deployments.

## Primary Capabilities

- Search for real locations through the API-backed Open-Meteo geocoding adapter.
- Fetch current, 48-hour hourly, and seven-day forecast data.
- Render hourly precipitation, wind speed, wind direction, humidity, and cloud cover.
- Switch between imperial and metric units.
- Switch between light/dark themes and color palettes.
- Toggle between live Open-Meteo data and deterministic test scenarios.
- Exercise clear, clouds, fog, drizzle, rain, snow, storm, and mixed/freezing precipitation states.

## Repository Layout

```text
apps/
  api/        NestJS API, Swagger docs, Open-Meteo provider adapter
  web/        React/Vite frontend, dashboard, controls, test mode, direct-mode client
packages/
  domain/     Shared contracts, weather-code mapping, derived insights
docs/
  wiki/       GitHub Wiki-ready documentation pages
```

## Local URL

When `npm run dev` is running:

- Web app: `http://localhost:5173`
- Swagger docs: `http://localhost:3000/docs`

## Quick Start

```bash
npm install
npm run dev
```

Then open the web app at `http://localhost:5173`.

## Data Source Modes

Backend mode is the default and is the recommended demo mode because it keeps the provider adapter visible through Swagger. For frontend-only deployments, set `VITE_WEATHER_DATA_SOURCE=direct` or open `?weatherSource=direct` once. Use `?weatherSource=backend` to switch back.

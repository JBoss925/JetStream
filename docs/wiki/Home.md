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
- Install the static web app as a progressive web app through native browser install flows.

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

## Wiki Publishing

The files in `docs/wiki` are the source of truth for the public GitHub Wiki. The `Sync Wiki` GitHub Actions workflow publishes this folder to `JetStream.wiki.git` when wiki docs change on `main`, and it can be run manually from the Actions tab to seed or repair the wiki.

GitHub creates the wiki git repository only after the wiki has at least one saved page. For a newly enabled wiki, first create any temporary Home page at `https://github.com/JBoss925/JetStream/wiki`, then run the `Sync Wiki` workflow. The workflow will replace the temporary page with the checked-in docs.

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

Backend mode is the default and is the recommended demo mode because it keeps the provider adapter visible through Swagger. For frontend-only deployments, build with `VITE_WEATHER_DATA_SOURCE=direct` or open the current page with `?weatherSource=direct`. Use `?weatherSource=backend` to force the API-backed path for the current page. Data-source mode is not cached in localStorage.

## Progressive Web App

The web app ships with a manifest, install icons, mobile metadata, and a lightweight service worker. Mobile users install it through native browser flows such as Safari's Share > Add to Home Screen or Chrome's Install app menu. There is no custom in-app install prompt.

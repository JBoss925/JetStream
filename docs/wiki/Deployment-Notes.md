# Deployment Notes

## Netlify Static Deployment

This repository is configured for a frontend-only Netlify deployment through `netlify.toml`.

Netlify settings:

- Build command: `npm run build:netlify`
- Publish directory: `apps/web/dist`
- Build environment: `VITE_WEATHER_DATA_SOURCE=direct`

In this mode the deployed browser app calls Open-Meteo directly. No API service is required.

The Netlify Content Security Policy allows `connect-src` requests to:

- `https://api.open-meteo.com`
- `https://geocoding-api.open-meteo.com`

Open-Meteo must provide the browser CORS response headers for those API calls; Netlify only serves the static app and cannot add CORS headers to third-party Open-Meteo responses.

## API-Backed Deployment

An API-backed deployment has two services:

- `apps/api`: NestJS API with Swagger and Open-Meteo provider calls.
- `apps/web`: Vite frontend served as static assets.

## Build Output

```bash
npm run build
```

The web build output is `apps/web/dist`. The API build output is `apps/api/dist`.

## API-Backed Runtime Requirements

- API service with outbound access to Open-Meteo.
- Static file hosting for the Vite app.
- `VITE_API_BASE_URL` pointing at the deployed API.
- CORS configured with `CORS_ORIGIN` for the frontend origin.

## Frontend-Only Mode

For static-only hosting, set:

```bash
VITE_WEATHER_DATA_SOURCE=direct
```

In that mode the browser calls Open-Meteo directly and the API service is not required.

## Production Enhancements

Useful additions for a production deployment:

- API request telemetry and cache headers.
- CSP tuned for the frontend and Open-Meteo endpoints.
- Error tracking such as Sentry.
- Optional edge caching for common geocoding searches.

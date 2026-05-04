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
- `https://cloudflareinsights.com`

Open-Meteo must provide the browser CORS response headers for those API calls; Netlify only serves the static app and cannot add CORS headers to third-party Open-Meteo responses.

The policy also allows `script-src` from `https://static.cloudflareinsights.com` so Netlify/Cloudflare analytics beacons can load without weakening the rest of the script policy.

The same Netlify headers also allow PWA installation and service-worker startup:

- `worker-src 'self'` for `/sw.js`
- `manifest-src 'self'` for `/manifest.webmanifest`
- `img-src 'self' data:` for install icons and palette-colored favicon data URIs

The deployed app includes a web manifest, install PNGs, an Apple touch icon, and a service worker. Users install it through browser-native flows rather than a custom app prompt.

## API-Backed Deployment

An API-backed deployment has two services:

- `apps/api`: NestJS API with Swagger and Open-Meteo provider calls.
- `apps/web`: Vite frontend served as static assets.

## Build Output

```bash
npm run build
```

The web build output is `apps/web/dist`. The API build output is `apps/api/dist`.

## Wiki Deployment

The GitHub Wiki is deployed separately from the Netlify app. `docs/wiki` stays in the main repository as the canonical source, and `.github/workflows/sync-wiki.yml` copies that folder into `JetStream.wiki.git`.

The workflow runs on pushes to `main` that touch `docs/wiki/**` or the workflow file itself. It can also be started manually from the GitHub Actions UI. The manual run is the recommended way to seed the wiki immediately after the workflow is merged.

For the first run, GitHub requires the wiki to have at least one saved page before `JetStream.wiki.git` is cloneable. Create a temporary Home page in the GitHub web UI, then run `Sync Wiki`; the workflow deletes any placeholder content and publishes `docs/wiki`.

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
- Optional stale-data messaging if the PWA later displays cached weather while offline.

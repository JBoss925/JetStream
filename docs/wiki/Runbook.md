# Runbook

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:5173`.

`npm run dev` builds the shared domain package and starts the NestJS API plus the Vite dev server.

Local URLs:

- Web app: `http://localhost:5173`
- API: `http://localhost:3000`
- Swagger: `http://localhost:3000/docs`

## Verification Commands

```bash
npm run test
npm run coverage
npm run typecheck
npm run build
npm run lint
```

Coverage is expected to pass before deployment. The workspace enforces 100% statement, line, and function coverage; branch thresholds are package-specific because V8 includes TypeScript optional/default branches and defensive guards in branch accounting.

## Live Data

Backend mode is the default live-data path. The browser calls the local API, and the API calls Open-Meteo. No provider API key is required.

For frontend-only hosting, enable direct mode:

```bash
VITE_WEATHER_DATA_SOURCE=direct npm run dev -w @jetstream-weather/web
```

You can also switch a browser session with `?weatherSource=direct` or return to the API with `?weatherSource=backend`.

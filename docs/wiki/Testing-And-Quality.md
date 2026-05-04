# Testing And Quality

## Commands

```bash
npm run test
npm run coverage
npm run typecheck
npm run build
npm run lint
```

Documentation-only changes still need a production-readiness pass before merge. Use the same commands above when practical; at minimum, run tests, coverage, typecheck, lint, and the Netlify build after changes that affect deployment, GitHub Actions, or public docs.

## Coverage Focus

`npm run coverage` is a required quality gate. It runs coverage in all workspaces and enforces 100% statement, line, and function coverage for covered runtime modules. Branch thresholds remain package-specific because V8 counts TypeScript optional chaining, default expressions, and defensive guards as branches even when those paths are not meaningful user behavior.

- Shared domain weather-code mapping for every supported WMO code.
- Derived morning-brief insight rules for priority, unit handling, missing data, and weather edge cases.
- NestJS controller defaults, validation, and provider delegation.
- Open-Meteo service request construction, response normalization, unit parameters, and upstream error handling.
- Web API client behavior in backend mode and hidden direct mode.
- App rendering for live/test mode, persisted preferences, saved locations, location search, instruments, hourlies, and forecast output.
- PWA service-worker registration paths for unsupported browsers, already-loaded documents, and initial page load.
- Deterministic weather fixtures for visual QA, including every weather family, day/night variants, instrument extremes, and hourly variation.
- Split frontend modules remain covered through user-facing tests, including the direct API client modules, dashboard instrument components, and test-mode fixture builders.

## GitHub Actions

The `Sync Wiki` workflow is intentionally first-party shell plus git. It checks out the repository, copies `docs/wiki` into the repository wiki, commits only when content changes, and pushes to the wiki's `master` branch. This keeps the public wiki reproducible from versioned docs without depending on an external Marketplace sync action.

The workflow checks that `JetStream.wiki.git` is cloneable before it writes anything. If the wiki has just been enabled and no page has been saved yet, the workflow exits with an explicit bootstrap message instead of creating a local commit that cannot be pushed.

All network tests use mocked fetch responses. Tests should assert the normalized contract and user-visible behavior rather than relying on live Open-Meteo timing.

## Test Files

- `packages/domain/test/weather-code.test.ts`
- `packages/domain/test/insights.test.ts`
- `apps/api/src/weather/open-meteo.service.test.ts`
- `apps/api/src/weather/weather.controller.test.ts`
- `apps/web/src/api/weatherApi.test.ts`
- `apps/web/src/routes/App.test.tsx`
- `apps/web/src/testWeatherScenarios.test.ts`

## Scenario Philosophy

Scenarios are not just screenshots. They are contract fixtures that force the dashboard through clear, clouds, fog, drizzle, rain, snow, storm, mixed/freezing precipitation, missing optional sensor data, low/high precipitation, low/high wind, pressure states, humidity/cloud extremes, and day/night presentation.

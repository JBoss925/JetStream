# Frontend Guide

The frontend lives in `apps/web` and is built with React, Vite, and CSS.

## Main Entry Points

- `src/main.tsx`: React bootstrapping.
- `src/routes/App.tsx`: application state, live/test mode selection, preferences.
- `src/components/PreferenceBar.tsx`: live/test mode, scenario, units, and theme controls.
- `src/components/LocationSearch.tsx`: live location search.
- `src/components/WeatherDashboard.tsx`: dashboard layout orchestration.
- `src/components/dashboard/`: hero, brief, forecast, instrument components, icons, and weather display helpers.
- `src/components/dashboard/instruments/`: wind, precipitation, atmosphere, and daylight instruments.
- `src/api/weatherApi.ts`: public weather client for backend and direct modes.
- `src/api/openMeteoClient.ts`: direct Open-Meteo request construction and normalization.
- `src/api/dataSource.ts`: per-load backend/direct mode selection from URL or build env.
- `src/api/http.ts`: shared JSON fetch and error parsing.
- `src/hooks/useWeather.ts`: live weather fetch lifecycle.
- `src/hooks/useLocationSearch.ts`: location search lifecycle.
- `src/serviceWorker.ts`: browser service-worker registration.
- `src/testWeatherScenarios.ts`: public deterministic test-mode scenario list.
- `src/testWeatherScenarios/`: scenario seeds, fixture builders, and fixture types.
- `src/styles.css`: stylesheet import manifest.
- `src/styles/`: split styles for app shell, controls, search, dashboard sections, motion, and responsive behavior.
- `public/manifest.webmanifest`: progressive web app install metadata.
- `public/sw.js`: service worker for app-shell and weather-response caching.

## Frontend Module Layout

The frontend is split by user-facing responsibility:

- App-level orchestration stays in `routes/App.tsx`.
- Shared controls stay in `components/PreferenceBar.tsx` and `components/LocationSearch.tsx`.
- Dashboard presentation is divided under `components/dashboard`, with each instrument in its own file.
- Dashboard calculations live under `components/dashboard/utils` so formatting, wind, precipitation, daylight, and forecast range logic can be tested through the dashboard without crowding JSX files.
- Direct Open-Meteo behavior lives under `api`, separate from the thin public `weatherApi.ts` facade.
- Test-mode fixtures live under `testWeatherScenarios`, separate from the public scenario registry.

Styles mirror those boundaries. `styles.css` only imports section files; component and dashboard styles live under `styles/` with instrument-specific CSS in `styles/dashboard`.

## App State

`App.tsx` owns:

- Selected live location.
- Units preference.
- Theme preference.
- Backend mode: `live` or `test`.
- Selected test scenario.
- Data source mode: backend by default, with a hidden direct Open-Meteo override.

Units and theme are persisted through `state/preferences.ts`. Backend mode and scenario are session-local state.

## Live Mode

Live mode:

1. Shows the location search form.
2. Uses `useWeather` to call the API.
3. Displays loading skeletons during initial fetch.
4. Displays retryable error panel when fetch fails.
5. Renders `WeatherDashboard` when data is available.

## Test Mode

Test mode:

1. Hides the location search form.
2. Suppresses live API calls.
3. Shows a scenario dropdown.
4. Builds a deterministic `NormalizedWeatherResponse`.
5. Renders the same `WeatherDashboard` used by live mode.

This keeps visual testing realistic because test fixtures go through the same dashboard components as live data.

## Dashboard Sections

### Hero

The hero shows:

- Current condition label.
- Location.
- Current temperature.
- Summary.
- Feels-like value.
- Last update time.
- Weather-specific scene.

The hero uses local CSS custom properties for weather colors. It intentionally does not respond to light/dark page theme, except through the selected weather condition and day/night state.

### Wind

The wind instrument shows sustained wind speed, optional gust text when Open-Meteo reports a different current gust value, direction copy, a circular compass with arrow orientation, and hourly wind speed/direction indicators. When wind speed is missing, the card renders `-- mph` or `-- km/h`, uses `Wind unavailable` copy, suppresses gust copy and motion particles, and avoids treating missing wind as calm wind.

Implementation: `components/dashboard/instruments/WindInstrument.tsx` with styles in `styles/dashboard/wind.css`.

### Atmosphere

The atmosphere instrument shows:

- Pressure and pressure status.
- Humidity meter with icon, value, and range labels.
- Cloud-cover meter with icon, value, and range labels.
- Hourly humidity and cloud-cover bars.

Missing pressure uses `Pressure unavailable` under the atmosphere heading. Missing humidity and cloud-cover readings render as `--` in both the current meters and hourly atmosphere chart.

Implementation: `components/dashboard/instruments/AtmosphereInstrument.tsx` with styles in `styles/dashboard/atmosphere.css`.

### Precipitation

The precipitation instrument shows:

- Peak precipitation probability in the next 12 hours.
- Rain-only mini effect controlled by current precipitation probability with hourly fallback.
- Eight-hour precipitation bar chart with value labels.
- `--` heading and bar labels when precipitation probability data is missing.

Implementation: `components/dashboard/instruments/PrecipitationInstrument.tsx` with styles in `styles/dashboard/precipitation.css`.

### Daylight

The daylight instrument shows:

- Sunrise/sunset range.
- Arc progress through daylight.
- Sunrise row.
- Sunset row.
- Remaining daylight row.
- UV index row with severity label, such as `6.3 (High)`, or `--` when UV data is missing.

Before sunrise, the remaining row reports time until sunrise. After sunset, it reports that the sun has set.

Implementation: `components/dashboard/instruments/DaylightInstrument.tsx` with styles in `styles/dashboard/daylight.css`.

### Morning Brief

The brief is generated from `WeatherInsight[]`. Each insight has an icon, title, and message.

### One-Week Forecast

The forecast renders seven rows with:

- Day and date.
- Weather family icon.
- Temperature range bar.
- High/low temperatures.
- Summary.

## Responsive Behavior

The desktop dashboard uses a two-column layout with the hero and instruments on the left and the brief/forecast on the right. In single-column layouts the order becomes hero, morning brief, instruments, and forecast. Instrument cards use a responsive grid and preserve enough vertical space for compass, precipitation, atmosphere, and daylight visualizations.

## Progressive Web App

JetStream is installable through native browser PWA flows. The HTML document links the manifest, Apple touch icon, theme color, and SVG favicon. The static seafoam SVG is the initial favicon fallback; after React loads, `App.tsx` replaces the favicon with an SVG data URI that uses the active palette accent.

The service worker is intentionally small and first-party:

- It warms core public assets during installation.
- It serves same-origin static assets with stale-while-revalidate caching.
- It handles navigations with network-first loading and falls back to cached `index.html`.
- It handles Open-Meteo API requests with network-first loading and cached fallback responses.

There is no custom install button. iOS users install from Safari's Share menu, while Android and desktop Chromium users install from the browser-provided install affordance.

## Accessibility Notes

- Primary sections use headings and `aria-labelledby`.
- Loading and error panels have explicit labels.
- Segmented controls expose `aria-pressed`.
- Decorative weather scene layers are `aria-hidden`.

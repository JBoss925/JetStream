# Frontend Guide

The frontend lives in `apps/web` and is built with React, Vite, and CSS.

## Main Entry Points

- `src/main.tsx`: React bootstrapping.
- `src/routes/App.tsx`: application state, live/test mode selection, preferences.
- `src/components/PreferenceBar.tsx`: live/test mode, scenario, units, and theme controls.
- `src/components/LocationSearch.tsx`: live location search.
- `src/components/WeatherDashboard.tsx`: hero, instruments, brief, and forecast.
- `src/hooks/useWeather.ts`: live weather fetch lifecycle.
- `src/hooks/useLocationSearch.ts`: location search lifecycle.
- `src/testWeatherScenarios.ts`: deterministic test-mode weather data.
- `src/styles.css`: layout, components, theme, weather effects.

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

The wind instrument shows sustained wind speed, optional gust text when Open-Meteo reports a different current gust value, direction copy, a circular compass with arrow orientation, and hourly wind speed/direction indicators.

### Atmosphere

The atmosphere instrument shows:

- Pressure and pressure status.
- Humidity meter with icon, value, and range labels.
- Cloud-cover meter with icon, value, and range labels.
- Hourly humidity and cloud-cover bars.

### Precipitation

The precipitation instrument shows:

- Peak precipitation probability in the next 12 hours.
- Rain-only mini effect controlled by current precipitation probability with hourly fallback.
- Eight-hour precipitation bar chart with value labels.

### Daylight

The daylight instrument shows:

- Sunrise/sunset range.
- Arc progress through daylight.
- Sunrise row.
- Sunset row.
- Remaining daylight row.
- UV index row with severity label, such as `6.3 (High)`.

Before sunrise, the remaining row reports time until sunrise. After sunset, it reports that the sun has set.

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

## Accessibility Notes

- Primary sections use headings and `aria-labelledby`.
- Loading and error panels have explicit labels.
- Segmented controls expose `aria-pressed`.
- Decorative weather scene layers are `aria-hidden`.

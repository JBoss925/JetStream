# Test Mode And Fixtures

Test mode is a first-class frontend feature for visual QA. It lets reviewers simulate weather states without relying on live provider timing or location availability.

## How To Use

1. Open the app.
2. Click `Test` in the top preference bar.
3. Select a scenario from the `Scenario` dropdown.
4. Toggle units and theme as needed.

When Test mode is active, the app does not call the live weather API.

## Fixture Source

Fixtures are defined in:

```text
apps/web/src/testWeatherScenarios.ts
apps/web/src/testWeatherScenarios/
```

`testWeatherScenarios.ts` is the public scenario registry. The fixture implementation is split into:

- `seeds.ts`: scenario seed data.
- `buildWeather.ts`: conversion from seeds to `NormalizedWeatherResponse`.
- `locations.ts`: location fixture helper.
- `types.ts`: scenario and seed types.

Each scenario seed includes:

- Location metadata.
- WMO weather code.
- Observation time.
- Temperature and apparent temperature.
- Optional humidity.
- Optional wind speed, gusts, and direction.
- Pressure.
- Optional cloud cover.
- Optional current precipitation.
- Sunrise and sunset.
- Daily range.
- Optional daily UV index max values or generated UV estimates.
- Hourly weather codes.
- Optional hourly precipitation probabilities.
- Optional hourly humidity values.
- Optional hourly cloud-cover values.
- Optional hourly wind speeds.
- Optional hourly wind directions.
- Optional daily code sequence.

Each seed can build either imperial or metric data.

## Supported Weather Families

Test mode covers every supported app weather family:

- Clear
- Clouds
- Fog
- Drizzle
- Rain
- Snow
- Storm
- Mixed/freezing precipitation

Each family has a day and night variant.

## Scenario Examples

Current day scenarios include:

- Clear, hot, dry afternoon
- Cloudy, mild, full cloud cover
- Fog, cold, calm morning
- Drizzle, humid commute
- Heavy rain, strong wind
- Snow, deep freeze
- Severe thunderstorm and hail
- Mixed freezing rain
- Missing optional sensor fields

Night variants are generated with adjusted observation time, temperature, apparent temperature, and daylight state.

## Contract Guarantees

The web test suite verifies that fixtures:

- Cover all supported weather families.
- Cover night variants for all supported weather families.
- Build normalized weather objects in the expected shape.
- Include 12 hourly points.
- Include seven daily points.
- Include hourly humidity and cloud-cover variation when those sensors are present.
- Include hourly wind speed and wind direction variation when wind sensor data is present.
- Keep hourly precipitation probabilities inside `0..100` when precipitation probability data is present.
- Include a sparse optional-sensor scenario that leaves humidity, cloud cover, wind, precipitation probability, precipitation totals, and UV index data missing.
- Keep daily ranges ordered high-to-low after unit conversion.
- Generate derived insights.

## Adding A Scenario

1. Add a `ScenarioSeed` to `daySeeds` in `apps/web/src/testWeatherScenarios/seeds.ts`.
2. Pick a WMO code from `packages/domain/src/weather-code.ts`.
3. Provide 12 hourly codes and representative optional sensor values when the scenario is meant to exercise those sensors.
4. Add daily codes if the default sequence is not suitable.
5. Confirm the scenario appears in the dropdown.
6. Run `npm run test -w @jetstream-weather/web` and `npm run coverage -w @jetstream-weather/web`.

## Why Fixtures Live In The Web App

Fixtures are UI tooling, not production data. They are intentionally local to the web app so the production API remains a live-data adapter and test mode never crosses the network.

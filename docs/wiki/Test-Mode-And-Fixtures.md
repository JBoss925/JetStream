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
- Humidity.
- Wind speed, optional gusts, and direction.
- Pressure.
- Cloud cover.
- Current precipitation.
- Sunrise and sunset.
- Daily range.
- Daily UV index max values or generated UV estimates.
- Hourly weather codes.
- Hourly precipitation probabilities.
- Hourly humidity values.
- Hourly cloud-cover values.
- Hourly wind speeds.
- Hourly wind directions.
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
- Include hourly humidity, cloud cover, wind speed, and wind direction variation.
- Keep hourly precipitation probabilities inside `0..100`.
- Keep daily ranges ordered high-to-low after unit conversion.
- Generate derived insights.

## Adding A Scenario

1. Add a `ScenarioSeed` to `daySeeds` in `apps/web/src/testWeatherScenarios/seeds.ts`.
2. Pick a WMO code from `packages/domain/src/weather-code.ts`.
3. Provide 12 hourly codes, precipitation probabilities, humidity values, cloud-cover values, wind speeds, and wind directions.
4. Add daily codes if the default sequence is not suitable.
5. Confirm the scenario appears in the dropdown.
6. Run `npm run test -w @jetstream-weather/web` and `npm run coverage -w @jetstream-weather/web`.

## Why Fixtures Live In The Web App

Fixtures are UI tooling, not production data. They are intentionally local to the web app so the production API remains a live-data adapter and test mode never crosses the network.

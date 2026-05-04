# Weather Data Model

The app renders normalized weather data rather than raw Open-Meteo payloads.

## Main Contract

`NormalizedWeatherResponse` contains:

- `location`: selected location metadata
- `units`: `imperial` or `metric`
- `current`: current conditions
- `hourly`: hourly forecast points
- `daily`: seven-day forecast points
- `insights`: derived messages for the morning brief
- `source`: provider attribution
- `fetchedAt`: client fetch timestamp

## Current Conditions

Current conditions include temperature, apparent temperature, weather code, humidity, pressure, cloud cover, precipitation, wind speed, wind gusts, wind direction, and day/night state.

## Hourly Points

Hourly points include:

- time
- temperature and apparent temperature
- weather code, summary, and family
- precipitation probability
- humidity
- cloud cover
- wind speed
- wind direction

Live mode requests 48 forecast hours from Open-Meteo and the dashboard displays the first relevant subset in the instruments.

## Daily Points

Daily points include:

- date
- weather code, summary, and family
- high temperature
- low temperature
- sunrise
- sunset
- maximum precipitation probability
- maximum UV index

Forecast rows render the high first, then the low, for example `64° / 52°F`.

## Normalization Boundary

The NestJS API and the hidden direct frontend client both produce the same `NormalizedWeatherResponse`. UI components should depend on that contract, not raw Open-Meteo field names.

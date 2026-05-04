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

Current conditions include temperature, apparent temperature, weather code, optional humidity, optional pressure, optional cloud cover, optional precipitation, optional wind speed, optional wind gusts, optional wind direction, optional current UV index, and day/night state.

## Hourly Points

Hourly points include:

- time
- temperature and apparent temperature
- weather code, summary, and family
- optional precipitation probability
- optional humidity
- optional cloud cover
- optional wind speed
- optional wind direction

Live mode requests 48 forecast hours from Open-Meteo and the dashboard displays the first relevant subset in the instruments.

## Daily Points

Daily points include:

- date
- weather code, summary, and family
- high temperature
- low temperature
- sunrise
- sunset
- optional maximum precipitation probability
- optional maximum UV index

The UI must distinguish missing optional fields from meaningful zero values. Missing humidity is not `0%`, missing cloud cover is not clear sky, missing wind is not calm wind, missing precipitation probability is not `0%`, and missing UV index is not a low UV reading.

Forecast rows render the high first, then the low, for example `64° / 52°F`.

## Normalization Boundary

The NestJS API and the hidden direct frontend client both produce the same `NormalizedWeatherResponse`. UI components should depend on that contract, not raw Open-Meteo field names.

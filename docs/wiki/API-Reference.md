# API Reference

The NestJS API is the default data path and is documented with Swagger at:

```text
http://localhost:3000/docs
```

## `GET /api/locations/search`

Searches Open-Meteo geocoding.

Query parameters:

- `query`: legacy user-entered location text. Comma-separated values are parsed as `City, Region, Country`.
- `name`: city/locality name. Defaults to `London`.
- `region` optional, for example `England`.
- `country` optional, for example `United Kingdom`.

The API queries Open-Meteo by city name and sorts returned geocoding results by optional region and country closeness. This keeps searches such as `Charlotte, Mich` from being sent upstream as one city name while still putting `Charlotte, Michigan` ahead of weaker matches.

Returns an array of `LocationOption` objects.

## `GET /api/weather`

Fetches and normalizes weather for a selected location.

Query parameters:

- `latitude`: defaults to `51.5072`
- `longitude`: defaults to `-0.1276`
- `name`: defaults to `London`
- `country`: defaults to `United Kingdom`
- `region` optional, defaults to `England`
- `timezone` optional, defaults to `Europe/London`
- `units` optional, `imperial` or `metric`, defaults to `imperial`

Returns `NormalizedWeatherResponse`.

## Provider Fields

The API requests:

- current temperature, apparent temperature, humidity, day/night, precipitation, weather code, cloud cover, pressure, wind speed, wind gusts, and wind direction
- hourly temperature, apparent temperature, humidity, precipitation probability, weather code, cloud cover, wind speed, and wind direction
- daily weather code, high/low temperature, sunrise, sunset, maximum precipitation probability, and maximum UV index

The API asks Open-Meteo for 48 forecast hours and seven forecast days.

## Direct Mode

The frontend can bypass the API and call Open-Meteo directly with:

```text
VITE_WEATHER_DATA_SOURCE=direct
```

or with the hidden URL toggle:

```text
?weatherSource=direct
```

Use `?weatherSource=backend` to force the API-backed path for the current page. The app does not cache backend/direct mode in localStorage; without a URL override it uses `VITE_WEATHER_DATA_SOURCE`, defaulting to backend mode.

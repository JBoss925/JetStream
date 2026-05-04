# Troubleshooting

## Live Weather Fails To Load

In backend mode, check browser devtools for:

```text
http://localhost:3000/api/weather
http://localhost:3000/api/locations/search
```

Then check the API process logs for upstream Open-Meteo failures.

In direct mode, check browser devtools for:

```text
https://api.open-meteo.com/v1/forecast
https://geocoding-api.open-meteo.com/v1/search
```

Common causes:

- The API dev server is not running in backend mode.
- The browser is offline.
- Open-Meteo is temporarily unavailable.
- A browser extension or network policy blocks third-party API calls in direct mode.

## Location Search Shows No Results

- Search text must be at least two characters.
- Try a more specific city name.
- In backend mode, check `/api/locations/search`.
- In direct mode, check the Open-Meteo geocoding request.

## Test Mode Works But Live Mode Does Not

Test mode uses local fixtures, so it can work even when API or Open-Meteo requests fail. Inspect the live network request, API logs, and the error panel message.

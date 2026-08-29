import type { NormalizedWeatherResponse } from "@jetstream-weather/domain";
import { dailyRangeStyle, formatDay, formatForecastDate, unitSymbol } from "./weatherUtils";
import { weatherFamilyIcon } from "./weatherIcons";

interface ForecastPanelProps {
  weather: NormalizedWeatherResponse;
}

export function ForecastPanel({ weather }: ForecastPanelProps) {
  const symbol = unitSymbol(weather);

  return (
    <section className="forecast-rhythm" aria-label="Daily forecast">
      <ol className="daily-rhythm-list">
        {weather.daily.map((forecast) => (
          <li
            className={`daily-rhythm-item family-${forecast.family}`}
            key={forecast.date}
            style={dailyRangeStyle(forecast, weather)}
          >
            <time>
              <strong>{formatDay(forecast.date)}</strong>
              <span>{formatForecastDate(forecast.date)}</span>
            </time>
            <span className={`daily-weather-icon icon-${forecast.family}`}>
              {weatherFamilyIcon(forecast.family)}
            </span>
            <div className="daily-range-track">
              <span />
            </div>
            <strong>
              {Math.round(forecast.tempMax)}° / {Math.round(forecast.tempMin)}
              {symbol}
            </strong>
            <small>{forecast.summary}</small>
          </li>
        ))}
      </ol>
    </section>
  );
}

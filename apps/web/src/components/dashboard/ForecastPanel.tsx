import type { NormalizedWeatherResponse } from "@jetstream-weather/domain";
import { dailyRangeStyle, formatDay, formatForecastDate, unitSymbol } from "./weatherUtils";
import { weatherFamilyIcon } from "./weatherIcons";

interface ForecastPanelProps {
  weather: NormalizedWeatherResponse;
}

export function ForecastPanel({ weather }: ForecastPanelProps) {
  const symbol = unitSymbol(weather);
  const startDate = formatForecastDate(weather.daily[0]?.date);
  const endDate = formatForecastDate(weather.daily[6]?.date ?? weather.daily[0]?.date);

  return (
    <section className="forecast-rhythm" aria-labelledby="forecast-title">
      <div className="section-kicker">
        <span>This week</span>
        <small>Data from OpenMeteo</small>
      </div>
      <div className="forecast-title-row">
        <div>
          <h3 id="forecast-title">7-Day Forecast</h3>
          <p>
            {startDate} - {endDate}
          </p>
        </div>
      </div>
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

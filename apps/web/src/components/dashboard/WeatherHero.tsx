import type { NormalizedWeatherResponse } from "@jetstream-weather/domain";
import { formatTime, unitSymbol } from "./weatherUtils";

interface WeatherHeroProps {
  weather: NormalizedWeatherResponse;
}

export function WeatherHero({ weather }: WeatherHeroProps) {
  const symbol = unitSymbol(weather);
  const temperature = Math.round(weather.current.temperature);
  const hasWideTemperature = String(temperature).length >= 3;

  return (
    <section className="weather-hero" aria-labelledby="current-weather-title">
      <div className="hero-copy">
        <div className="hero-location">
          <div className="hero-cover-meta">
            <p className="eyebrow">Live conditions</p>
            <span>{weather.current.isDay ? "Daylight edition" : "After dark"}</span>
          </div>
          <h2 id="current-weather-title">{weather.location.name}</h2>
          <p className="location-subtitle">
            {[weather.location.region, weather.location.country].filter(Boolean).join(", ")}
          </p>
        </div>
        <div
          className={`hero-temperature${hasWideTemperature ? " is-wide-temperature" : ""}`}
        >
          <span className="hero-temperature-value">
            <span>{temperature}</span>
            <span className="hero-temperature-unit">{symbol}</span>
          </span>
          <div className="hero-condition-copy">
            <strong>{weather.current.summary}</strong>
            <p className="observed">
              Feels like {Math.round(weather.current.apparentTemperature)}
              {symbol} · Updated {formatTime(weather.current.observedAt)}
            </p>
          </div>
        </div>
      </div>

      <p className="hero-condition-watermark" aria-hidden="true">
        {weather.current.summary}
      </p>

      <div className="atmospheric-stage" aria-hidden="true">
        <div className="sky-disc" />
        <div className="stage-cloud stage-cloud-a" />
        <div className="stage-cloud stage-cloud-b" />
        <div className="stage-cloud stage-cloud-c" />
        <div className="rain-field" />
      </div>
    </section>
  );
}

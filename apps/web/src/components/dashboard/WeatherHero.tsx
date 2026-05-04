import type { NormalizedWeatherResponse } from "@jetstream-weather/domain";
import { formatTime, unitSymbol } from "./weatherUtils";

interface WeatherHeroProps {
  weather: NormalizedWeatherResponse;
}

export function WeatherHero({ weather }: WeatherHeroProps) {
  const symbol = unitSymbol(weather);

  return (
    <section className="weather-hero" aria-labelledby="current-weather-title">
      <div className="hero-copy">
        <p className="eyebrow">Current conditions</p>
        <h2 id="current-weather-title">{weather.location.name}</h2>
        <p className="location-subtitle">
          {[weather.location.region, weather.location.country].filter(Boolean).join(", ")}
        </p>
        <div className="hero-temperature">
          <span className="hero-temperature-value">
            <span>{Math.round(weather.current.temperature)}</span>
            <span className="hero-temperature-unit">{symbol}</span>
          </span>
          <strong>{weather.current.summary}</strong>
        </div>
        <p className="observed">
          Feels like {Math.round(weather.current.apparentTemperature)}
          {symbol}. Updated {formatTime(weather.current.observedAt)}.
        </p>
      </div>

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

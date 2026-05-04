import { Wind } from "lucide-react";
import type { NormalizedWeatherResponse } from "@jetstream-weather/domain";
import type { WeatherCssProperties } from "../types";
import {
  clamp,
  formatTime,
  windArrowRotation,
  windDescription,
  windGustDescription,
  windParticleCount,
  windParticleStyle,
  windUnit,
} from "../weatherUtils";

interface WindInstrumentProps {
  weather: NormalizedWeatherResponse;
}

export function WindInstrument({ weather }: WindInstrumentProps) {
  const windSpeed = weather.current.windSpeed ?? 0;
  const displayedWindSpeed = Math.round(windSpeed);
  const direction = weather.current.windDirection;
  const particleCount = windParticleCount(windSpeed, weather.units);
  const hourlyWind = weather.hourly.slice(0, 8);
  const maxHourlyWind = Math.max(
    1,
    displayedWindSpeed,
    ...hourlyWind.map((point) => point.windSpeed ?? 0),
  );

  return (
    <section className="instrument wind-instrument" aria-labelledby="wind-title">
      <div className="instrument-heading">
        <Wind aria-hidden="true" size={20} />
        <span>Wind</span>
      </div>
      <h3 id="wind-title">
        {displayedWindSpeed} {windUnit(weather)}
      </h3>
      <p>
        {windDescription(windSpeed, weather.units, direction)}
        {windGustDescription(windSpeed, weather.current.windGusts, weather.units)}
      </p>
      <div className="compass-rose">
        <span>N</span>
        <span>E</span>
        <span>S</span>
        <span>W</span>
        <div className="wind-flow-field" aria-hidden="true">
          {Array.from({ length: particleCount }, (_, index) => (
            <span
              className="wind-pulse"
              key={index}
              style={windParticleStyle(index, particleCount, windSpeed, weather.units)}
            />
          ))}
        </div>
        <div
          className="wind-arrow"
          data-testid="wind-arrow"
          style={{ transform: `rotate(${windArrowRotation(direction)}deg)` }}
        >
          <span className="wind-arrow-shaft" />
          <span className="wind-arrow-head" />
        </div>
        <div className="wind-compass-center" />
      </div>
      <ol className="hourly-wind-list" aria-label="Hourly wind speed">
        {hourlyWind.map((point) => {
          const hourlySpeed = point.windSpeed ?? windSpeed;
          const strength = clamp(hourlySpeed / maxHourlyWind, 0.22, 1);

          return (
            <li
              key={point.time}
              style={
                {
                  "--hourly-wind-rotation": `${windArrowRotation(
                    point.windDirection ?? direction,
                  )}deg`,
                  "--hourly-wind-strength": strength,
                } as WeatherCssProperties
              }
            >
              <span className="hourly-wind-arrow" aria-hidden="true">
                <span />
              </span>
              <strong>{Math.round(hourlySpeed)}</strong>
              <time>{formatTime(point.time)}</time>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

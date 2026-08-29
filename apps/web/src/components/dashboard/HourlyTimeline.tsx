import type { NormalizedWeatherResponse } from "@jetstream-weather/domain";
import { weatherFamilyIcon } from "./weatherIcons";
import { formatTime, unitSymbol } from "./weatherUtils";

interface HourlyTimelineProps {
  weather: NormalizedWeatherResponse;
}

export function HourlyTimeline({ weather }: HourlyTimelineProps) {
  const symbol = unitSymbol(weather);

  return (
    <section className="hourly-timeline" aria-label="Hourly forecast">
      <ol>
        {weather.hourly.slice(0, 12).map((point, index) => (
          <li key={point.time} className={`family-${point.family}`}>
            <time>{index === 0 ? "Now" : formatTime(point.time)}</time>
            <span className="hourly-condition-icon" aria-hidden="true">
              {weatherFamilyIcon(point.family)}
            </span>
            <strong>
              {Math.round(point.temperature)}
              <small>{symbol}</small>
            </strong>
            <span className="hourly-rain">
              {point.precipitationProbability === undefined
                ? ""
                : `${Math.round(point.precipitationProbability)}%`}
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}

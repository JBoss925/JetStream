import { Cloud, Droplets, Gauge } from "lucide-react";
import type { NormalizedWeatherResponse } from "@jetstream-weather/domain";
import type { WeatherCssProperties } from "../types";
import { formatTime, pressureStatus } from "../weatherUtils";

interface AtmosphereInstrumentProps {
  weather: NormalizedWeatherResponse;
}

export function AtmosphereInstrument({ weather }: AtmosphereInstrumentProps) {
  const humidity = weather.current.humidity;
  const cloudCover = weather.current.cloudCover;
  const pressure = Math.round(weather.current.pressure ?? 0);
  const hourlyAtmosphere = weather.hourly.slice(0, 8);

  return (
    <section className="instrument atmosphere-instrument" aria-labelledby="atmosphere-title">
      <div className="instrument-heading">
        <Gauge aria-hidden="true" size={20} />
        <span>Atmosphere</span>
      </div>
      <h3 id="atmosphere-title">{pressure || "--"} hPa</h3>
      <p>{pressureStatus(weather.current.pressure)}</p>
      <div className="atmosphere-stack">
        <div
          className="humidity-meter"
          style={{ "--humidity": `${humidity ?? 0}%` } as WeatherCssProperties}
        >
          <div className="meter-title">
            <span>
              <Droplets aria-hidden="true" size={16} /> Humidity
            </span>
            <strong>{humidity === undefined ? "--" : `${humidity}%`}</strong>
          </div>
          <div className="humidity-track">
            <span />
          </div>
          <div className="meter-scale">
            <span>Dry</span>
            <span>Comfort</span>
            <span>Saturated</span>
          </div>
        </div>
        <div
          className="cloud-meter"
          style={{ "--cloud-cover": `${cloudCover ?? 0}%` } as WeatherCssProperties}
        >
          <div className="meter-title">
            <span>
              <Cloud aria-hidden="true" size={16} /> Cloud cover
            </span>
            <strong>{cloudCover === undefined ? "--" : `${cloudCover}%`}</strong>
          </div>
          <div className="cloud-track">
            <span />
          </div>
          <div className="meter-scale">
            <span>Clear</span>
            <span>Broken</span>
            <span>Overcast</span>
          </div>
        </div>
      </div>
      <div className="atmosphere-hourlies" aria-label="Hourly humidity and cloud cover">
        <div className="atmosphere-hourly-guides" aria-hidden="true">
          <span>100%</span>
          <span>50%</span>
          <span>0%</span>
        </div>
        <ol>
          {hourlyAtmosphere.map((point) => (
            <li key={point.time}>
              <div className="atmosphere-hourly-bars" aria-hidden="true">
                <span
                  className={`hourly-humidity${point.humidity === undefined ? " is-missing" : ""}`}
                  style={
                    {
                      "--hourly-atmosphere-value": `${point.humidity ?? 0}%`,
                    } as WeatherCssProperties
                  }
                >
                  {point.humidity === undefined ? <strong>--</strong> : null}
                </span>
                <span
                  className={`hourly-cloud${point.cloudCover === undefined ? " is-missing" : ""}`}
                  style={
                    {
                      "--hourly-atmosphere-value": `${point.cloudCover ?? 0}%`,
                    } as WeatherCssProperties
                  }
                >
                  {point.cloudCover === undefined ? <strong>--</strong> : null}
                </span>
              </div>
              <time>{formatTime(point.time)}</time>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

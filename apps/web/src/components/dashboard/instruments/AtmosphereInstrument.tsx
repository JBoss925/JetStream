import { Cloud, Droplets, Gauge } from "lucide-react";
import type { NormalizedWeatherResponse } from "@jetstream-weather/domain";
import type { WeatherCssProperties } from "../types";
import { formatTime, pressureStatus } from "../weatherUtils";

interface AtmosphereInstrumentProps {
  weather: NormalizedWeatherResponse;
}

export function AtmosphereInstrument({ weather }: AtmosphereInstrumentProps) {
  const humidity = weather.current.humidity ?? 0;
  const cloudCover = weather.current.cloudCover ?? 0;
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
          style={{ "--humidity": `${humidity}%` } as WeatherCssProperties}
        >
          <div className="meter-title">
            <span>
              <Droplets aria-hidden="true" size={16} /> Humidity
            </span>
            <strong>{humidity}%</strong>
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
          style={{ "--cloud-cover": `${cloudCover}%` } as WeatherCssProperties}
        >
          <div className="meter-title">
            <span>
              <Cloud aria-hidden="true" size={16} /> Cloud cover
            </span>
            <strong>{cloudCover}%</strong>
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
                  className="hourly-humidity"
                  style={
                    {
                      "--hourly-atmosphere-value": `${point.humidity ?? humidity}%`,
                    } as WeatherCssProperties
                  }
                />
                <span
                  className="hourly-cloud"
                  style={
                    {
                      "--hourly-atmosphere-value": `${point.cloudCover ?? cloudCover}%`,
                    } as WeatherCssProperties
                  }
                />
              </div>
              <time>{formatTime(point.time)}</time>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

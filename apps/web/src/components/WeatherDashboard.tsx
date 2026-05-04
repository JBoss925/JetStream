import type { NormalizedWeatherResponse } from "@jetstream-weather/domain";
import { ForecastPanel } from "./dashboard/ForecastPanel";
import { MorningBrief } from "./dashboard/MorningBrief";
import { WeatherHero } from "./dashboard/WeatherHero";
import { AtmosphereInstrument } from "./dashboard/instruments/AtmosphereInstrument";
import { DaylightInstrument } from "./dashboard/instruments/DaylightInstrument";
import { PrecipitationInstrument } from "./dashboard/instruments/PrecipitationInstrument";
import { WindInstrument } from "./dashboard/instruments/WindInstrument";
import type { WeatherCssProperties } from "./dashboard/types";
import { clamp, daylightProgress, precipitationPeak, windFlowRotation } from "./dashboard/weatherUtils";

export interface WeatherDashboardProps {
  weather: NormalizedWeatherResponse;
}

export function WeatherDashboard({ weather }: WeatherDashboardProps) {
  const peakPrecipitation = precipitationPeak(weather.hourly);
  const daylight = daylightProgress(weather);
  const windSpeed = weather.current.windSpeed ?? 0;
  const weatherStyle: WeatherCssProperties = {
    "--wind-flow-rotation": `${windFlowRotation(weather.current.windDirection)}deg`,
    "--wind-strength": clamp(windSpeed / 35, 0.25, 1.4),
    "--humidity": `${weather.current.humidity ?? 0}%`,
    "--cloud-cover": `${weather.current.cloudCover ?? 0}%`,
    "--precipitation": `${peakPrecipitation}%`,
    "--precipitation-level": peakPrecipitation,
    "--precipitation-alpha": clamp((peakPrecipitation + 22) / 122, 0.18, 1),
    "--daylight": `${daylight ?? 50}%`,
  };

  return (
    <section
      className={`weather-experience condition-${weather.current.family} condition-${
        weather.current.isDay ? "day" : "night"
      }`}
      style={weatherStyle}
      aria-label="Weather dashboard"
    >
      <div className="weather-main-grid">
        <div className="weather-primary-column">
          <WeatherHero weather={weather} />

          <div className="weather-instruments">
            <WindInstrument weather={weather} />
            <PrecipitationInstrument weather={weather} />
            <AtmosphereInstrument weather={weather} />
            <DaylightInstrument weather={weather} daylight={daylight} />
          </div>
        </div>

        <div className="weather-side-panels">
          <MorningBrief insights={weather.insights} />
          <ForecastPanel weather={weather} />
        </div>
      </div>
    </section>
  );
}

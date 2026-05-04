import {
  CalendarDays,
  Clock,
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  Droplets,
  Gauge,
  Snowflake,
  Sun,
  ThermometerSun,
  Sunrise,
  Sunset,
  Umbrella,
  Wind,
} from "lucide-react";
import type {
  DailyForecast,
  HourlyPoint,
  NormalizedWeatherResponse,
  Units,
  WeatherFamily,
  WeatherInsight,
} from "@jetstream-weather/domain";
import type { CSSProperties } from "react";

interface WeatherDashboardProps {
  weather: NormalizedWeatherResponse;
}

type WeatherCssProperties = CSSProperties & Record<`--${string}`, string | number>;

function unitSymbol(weather: NormalizedWeatherResponse): string {
  return weather.units === "imperial" ? "°F" : "°C";
}

function windUnit(weather: NormalizedWeatherResponse): string {
  return weather.units === "imperial" ? "mph" : "km/h";
}

function formatTime(value: string): string {
  const date = new Date(value);

  if (!Number.isFinite(date.getTime())) {
    return "--";
  }

  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatDay(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
  }).format(new Date(`${value}T12:00:00`));
}

function formatForecastDate(value: string | undefined): string {
  if (!value) {
    return "--";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(new Date(`${value}T12:00:00`));
}

function formatUvIndex(value: number | undefined): string {
  if (value === undefined) {
    return "--";
  }

  const formattedValue = new Intl.NumberFormat("en-US", {
    maximumFractionDigits: 1,
  }).format(value);

  return `${formattedValue} (${uvIndexSeverity(value)})`;
}

function uvIndexSeverity(value: number): string {
  if (value < 3) {
    return "Low";
  }

  if (value < 6) {
    return "Moderate";
  }

  if (value < 8) {
    return "High";
  }

  if (value < 11) {
    return "Very High";
  }

  return "Extreme";
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function compassLabel(direction?: number): string {
  /* v8 ignore next 3 -- direction is validated by callers; fallback protects future reuse. */
  if (direction === undefined) {
    return "Variable";
  }

  const labels = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return labels[Math.round(direction / 45) % labels.length];
}

function windMovementLabel(direction?: number): string {
  if (direction === undefined) {
    return "variable";
  }

  return compassLabel((direction + 180) % 360);
}

function windDescription(speed: number, units: Units, direction?: number): string {
  const mph = windSpeedAsMph(speed, units);
  const movementLabel = windMovementLabel(direction);

  if (direction === undefined) {
    if (mph < 4) {
      return "Calm winds with little directional movement.";
    }

    return "Variable winds with shifting direction.";
  }

  if (mph < 4) {
    return `Light, barely moving winds drifting ${movementLabel}.`;
  }

  if (mph < 10) {
    return `A light breeze is moving ${movementLabel}.`;
  }

  if (mph < 20) {
    return `Steady winds are tracking ${movementLabel}.`;
  }

  if (mph < 35) {
    return `Strong winds are pushing ${movementLabel}.`;
  }

  return `Damaging gusts may drive winds ${movementLabel}.`;
}

function windGustDescription(
  speed: number,
  gusts: number | undefined,
  units: Units,
): string {
  if (gusts === undefined) {
    return "";
  }

  const roundedSpeed = Math.round(speed);
  const roundedGusts = Math.round(gusts);

  if (roundedGusts === roundedSpeed) {
    return "";
  }

  return ` Gusts up to ${roundedGusts} ${units === "imperial" ? "mph" : "km/h"}.`;
}

function windArrowRotation(direction?: number): number {
  return direction === undefined ? 0 : (direction + 180) % 360;
}

function windFlowRotation(direction?: number): number {
  return direction === undefined ? 0 : (direction + 90) % 360;
}

function windSpeedAsMph(speed: number, units: Units): number {
  return units === "metric" ? speed / 1.609 : speed;
}

function windParticleCount(speed: number, units: Units): number {
  const mph = windSpeedAsMph(speed, units);
  return Math.round(clamp(mph / 1.4 + 14, 16, 38));
}

function windParticleStyle(
  index: number,
  count: number,
  speed: number,
  units: Units,
): WeatherCssProperties {
  const mph = windSpeedAsMph(speed, units);
  const randomUnit = (seed: number) => {
    const value = Math.sin(seed * 12.9898 + mph * 78.233) * 43758.5453;
    return value - Math.floor(value);
  };
  const baseDuration = clamp(3.8 - mph / 12, 1.1, 3.8);
  const duration = baseDuration * (0.72 + randomUnit(index + 3) * 0.68);

  const distance = clamp(40 + mph * 1.7, 48, 92);

  return {
    "--particle-size": `${5 + ((index * 5) % 4)}px`,
    "--particle-x": `${14 + randomUnit(index + 11) * 72}%`,
    "--particle-y": `${12 + randomUnit(index + 23) * 76}%`,
    "--particle-start": `${-distance}px`,
    "--particle-end": `${distance}px`,
    "--particle-duration": `${duration}s`,
    "--particle-delay": `${-randomUnit(index + count + 41) * duration}s`,
  };
}

function pressureStatus(pressure?: number): string {
  if (!pressure) {
    return "Pressure unavailable";
  }

  if (pressure < 1000) {
    return "Low pressure";
  }

  if (pressure > 1022) {
    return "High pressure";
  }

  return "Steady pressure";
}

function precipitationPeak(hourly: HourlyPoint[]): number {
  return Math.max(
    0,
    ...hourly.slice(0, 12).map((point) => point.precipitationProbability ?? 0),
  );
}

function currentPrecipitationProbability(weather: NormalizedWeatherResponse): number {
  return Math.round(
    weather.current.precipitationProbability ?? weather.hourly[0]?.precipitationProbability ?? precipitationPeak(weather.hourly),
  );
}

function insightIcon(insight: WeatherInsight) {
  if (insight.kind === "comfort") {
    return <CalendarDays aria-hidden="true" size={20} />;
  }

  if (insight.kind === "temperature") {
    return <ThermometerSun aria-hidden="true" size={20} />;
  }

  if (insight.kind === "umbrella") {
    return <Umbrella aria-hidden="true" size={20} />;
  }

  if (insight.kind === "wind") {
    return <Wind aria-hidden="true" size={20} />;
  }

  return <Sunrise aria-hidden="true" size={20} />;
}

function weatherFamilyIcon(family: WeatherFamily) {
  if (family === "clear") {
    return <Sun aria-hidden="true" size={18} />;
  }

  if (family === "fog") {
    return <CloudFog aria-hidden="true" size={18} />;
  }

  if (family === "drizzle") {
    return <CloudDrizzle aria-hidden="true" size={18} />;
  }

  if (family === "rain" || family === "mixed") {
    return <CloudRain aria-hidden="true" size={18} />;
  }

  if (family === "snow") {
    return <Snowflake aria-hidden="true" size={18} />;
  }

  if (family === "storm") {
    return <CloudLightning aria-hidden="true" size={18} />;
  }

  return <Cloud aria-hidden="true" size={18} />;
}

function formatDuration(minutes: number, suffix: string): string {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes} min ${suffix}`;
  }

  if (remainingMinutes === 0) {
    return `${hours} hr ${suffix}`;
  }

  return `${hours} hr ${remainingMinutes} min ${suffix}`;
}

function daylightCountdown(
  observedAt: string,
  sunrise: string | undefined,
  sunset: string | undefined,
): string {
  if (!sunrise || !sunset) {
    return "Daylight unavailable";
  }

  const now = new Date(observedAt).getTime();
  const start = new Date(sunrise).getTime();
  const end = new Date(sunset).getTime();

  if (!Number.isFinite(now) || !Number.isFinite(start) || !Number.isFinite(end)) {
    return "Daylight unavailable";
  }

  if (now < start) {
    return formatDuration(Math.round((start - now) / 60000), "until sunrise");
  }

  if (now >= end) {
    return "Sun has set";
  }

  return formatDuration(Math.round((end - now) / 60000), "left");
}

function daylightProgress(weather: NormalizedWeatherResponse): number | null {
  const sunrise = weather.daily[0]?.sunrise;
  const sunset = weather.daily[0]?.sunset;

  if (!sunrise || !sunset) {
    return null;
  }

  const start = new Date(sunrise).getTime();
  const end = new Date(sunset).getTime();
  const now = new Date(weather.current.observedAt).getTime();

  if (!Number.isFinite(start) || !Number.isFinite(end) || end <= start) {
    return null;
  }

  return clamp(((now - start) / (end - start)) * 100, 0, 100);
}

function dailyRangeStyle(
  forecast: DailyForecast,
  weather: NormalizedWeatherResponse,
): WeatherCssProperties {
  const temperatures = weather.daily.flatMap((day) => [day.tempMin, day.tempMax]);
  const min = Math.min(...temperatures);
  const max = Math.max(...temperatures);
  const span = Math.max(max - min, 1);

  return {
    "--range-start": `${((forecast.tempMin - min) / span) * 100}%`,
    "--range-width": `${Math.max(((forecast.tempMax - forecast.tempMin) / span) * 100, 8)}%`,
  };
}

export function WeatherDashboard({ weather }: WeatherDashboardProps) {
  const symbol = unitSymbol(weather);
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
          <section className="weather-hero" aria-labelledby="current-weather-title">
            <div className="hero-copy">
              <p className="eyebrow">Current conditions</p>
              <h2 id="current-weather-title">{weather.location.name}</h2>
              <p className="location-subtitle">
                {[weather.location.region, weather.location.country]
                  .filter(Boolean)
                  .join(", ")}
              </p>
              <div className="hero-temperature">
                <span className="hero-temperature-value">
                  <span>{Math.round(weather.current.temperature)}</span>
                  <span className="hero-temperature-unit">{symbol}</span>
                </span>
                <strong>{weather.current.summary}</strong>
              </div>
              <p className="observed">
                Feels like {Math.round(weather.current.apparentTemperature)}{symbol}.
                Updated {formatTime(weather.current.observedAt)}.
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

          <div className="weather-instruments">
            <WindSection weather={weather} />
            <PrecipitationSection weather={weather} />
            <AtmosphereSection weather={weather} />
            <DaylightSection weather={weather} daylight={daylight} />
          </div>
        </div>

        <div className="weather-side-panels">
          <section className="morning-brief" aria-labelledby="brief-title">
            <div className="section-kicker">
              <span>Morning brief</span>
              <small>Daily insights</small>
            </div>
            <h3 id="brief-title">What matters right now</h3>
            <div className="brief-lines">
              {weather.insights.map((insight) => (
                <article className={`brief-line brief-${insight.severity}`} key={insight.id}>
                  <span className="brief-icon">{insightIcon(insight)}</span>
                  <div>
                    <h4>{insight.title}</h4>
                    <p>{insight.message}</p>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <section className="forecast-rhythm" aria-labelledby="forecast-title">
            <div className="section-kicker">
              <span>This week</span>
              <small>Data from OpenMeteo</small>
            </div>
            <div className="forecast-title-row">
              <div>
                <h3 id="forecast-title">7-Day Forecast</h3>
                <p>{formatForecastDate(weather.daily[0]?.date)} - {formatForecastDate(weather.daily[6]?.date ?? weather.daily[0]?.date)}</p>
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
        </div>
      </div>
    </section>
  );
}

function WindSection({ weather }: { weather: NormalizedWeatherResponse }) {
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
              style={windParticleStyle(
                index,
                particleCount,
                windSpeed,
                weather.units,
              )}
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
                  "--hourly-wind-rotation": `${windArrowRotation(point.windDirection ?? direction)}deg`,
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

function AtmosphereSection({ weather }: { weather: NormalizedWeatherResponse }) {
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
        <div className="humidity-meter" style={{ "--humidity": `${humidity}%` } as WeatherCssProperties}>
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
        <div className="cloud-meter" style={{ "--cloud-cover": `${cloudCover}%` } as WeatherCssProperties}>
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
                  style={{ "--hourly-atmosphere-value": `${point.humidity ?? humidity}%` } as WeatherCssProperties}
                />
                <span
                  className="hourly-cloud"
                  style={{ "--hourly-atmosphere-value": `${point.cloudCover ?? cloudCover}%` } as WeatherCssProperties}
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

function PrecipitationSection({ weather }: { weather: NormalizedWeatherResponse }) {
  const peak = precipitationPeak(weather.hourly);
  const currentProbability = currentPrecipitationProbability(weather);
  const chartMax = Math.max(
    35,
    ...weather.hourly.slice(0, 8).map((point) => point.precipitationProbability ?? 0),
  );
  const precipitationHours = weather.hourly.slice(0, 8);
  const precipitationWeights = precipitationHours.map((point) => {
    const probability = point.precipitationProbability ?? 0;
    return probability > 0 ? Math.pow(probability, 1.25) : 0;
  });
  const precipitationWeightTotal = precipitationWeights.reduce((sum, weight) => sum + weight, 0);
  const precipitationIntensity = clamp(peak / 100, 0, 1);
  const dropCount = peak > 0 ? Math.round(6 + precipitationIntensity * 32) : 0;
  const pickDropLane = (randomValue: number, jitterValue: number) => {
    let weightedHourIndex = Math.floor(randomValue * precipitationHours.length);

    if (precipitationWeightTotal > 0) {
      let cursor = randomValue * precipitationWeightTotal;
      weightedHourIndex = precipitationWeights.findIndex((weight) => {
        cursor -= weight;
        return cursor <= 0;
      });
      /* v8 ignore next 3 -- Math.random is always below 1; this is a defensive fallback. */
      if (weightedHourIndex < 0) {
        weightedHourIndex = precipitationWeights.length - 1;
      }
    }

    const hourWidth = 100 / Math.max(precipitationHours.length, 1);
    const hourCenter = weightedHourIndex * hourWidth + hourWidth / 2;
    return clamp(hourCenter + (jitterValue - 0.5) * hourWidth * 0.72, 3, 97);
  };

  const rainDrops = Array.from({ length: dropCount }, (_, index) => {
    const randomUnit = (seed: number) => {
      const value = Math.sin(seed * 12.9898 + currentProbability * 78.233) * 43758.5453;
      return value - Math.floor(value);
    };
    const dropSeed = index + randomUnit(index + 97) * 1000;
    const spread = pickDropLane(randomUnit(dropSeed + 5), randomUnit(dropSeed + 9));
    const start = -36 - ((index * 29) % 140);

    return {
      id: index,
      style: {
        "--drop-left": `${spread}%`,
        "--drop-start": `${start - randomUnit(dropSeed + 11) * 60}px`,
        "--drop-end": `${210 + randomUnit(dropSeed + 19) * 96}px`,
        "--drop-delay": `${-(randomUnit(dropSeed + 29) * 4.5)}s`,
        "--drop-duration": `${0.95 + randomUnit(dropSeed + 37) * 0.48}s`,
        "--drop-height": `${16 + randomUnit(dropSeed + 43) * 28}px`,
        "--drop-opacity": `${0.14 + precipitationIntensity * 0.34 + randomUnit(dropSeed + 53) * 0.16}`,
      } as WeatherCssProperties,
    };
  });

  return (
    <section className="instrument precipitation-instrument" aria-labelledby="precipitation-title">
      <div className="instrument-heading">
        <CloudRain aria-hidden="true" size={20} />
        <span>Precipitation</span>
      </div>
      <h3 id="precipitation-title">{peak}% chance next 12 hours</h3>
      <div className="precipitation-scene" aria-hidden="true">
        {rainDrops.map((drop) => (
          <span
            className="precipitation-drop"
            key={drop.id}
            onAnimationIteration={(event) => {
              event.currentTarget.style.setProperty("--drop-left", `${pickDropLane(Math.random(), Math.random())}%`);
            }}
            style={drop.style}
          />
        ))}
      </div>
        <ol className="precipitation-bars" aria-label="Hourly precipitation probability">
        {weather.hourly.slice(0, 8).map((point) => {
          const probability = Math.round(point.precipitationProbability ?? 0);
          const height = clamp((probability / chartMax) * 100, 4, 100);

          return (
            <li key={point.time} style={{ "--hourly-precipitation-height": `${height}%` } as WeatherCssProperties}>
              <span>
                <strong>{probability}%</strong>
              </span>
              <time>{formatTime(point.time)}</time>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function DaylightSection({
  weather,
  daylight,
}: {
  weather: NormalizedWeatherResponse;
  daylight: number | null;
}) {
  const sunrise = weather.daily[0]?.sunrise;
  const sunset = weather.daily[0]?.sunset;
  const uvIndex = weather.daily[0]?.uvIndexMax ?? weather.current.uvIndex;
  const daylightPercent = daylight ?? 50;
  const daylightAngle = Math.PI - (daylightPercent / 100) * Math.PI;
  const daylightMarker = {
    x: 120 + 100 * Math.cos(daylightAngle),
    y: 112 - 100 * Math.sin(daylightAngle),
  };
  const remainingDaylight = daylightCountdown(weather.current.observedAt, sunrise, sunset);

  return (
    <section className="instrument daylight-instrument" aria-labelledby="daylight-title">
      <div className="instrument-heading">
        <Sunrise aria-hidden="true" size={20} />
        <span>Daylight</span>
      </div>
      <h3 id="daylight-title">
        {sunrise && sunset ? `${formatTime(sunrise)} - ${formatTime(sunset)}` : "Unavailable"}
      </h3>
      <div className="daylight-arc" aria-hidden="true">
        <svg viewBox="0 0 240 128" role="img">
          <path className="daylight-path" d="M 20 112 A 100 100 0 0 1 220 112" pathLength="100" />
          <path
            className="daylight-fill"
            d="M 20 112 A 100 100 0 0 1 220 112"
            pathLength="100"
            strokeDasharray={`${daylightPercent} 100`}
          />
          <circle className="daylight-marker" cx={daylightMarker.x} cy={daylightMarker.y} r="10" />
        </svg>
      </div>
      <dl className="instrument-readouts">
        <div>
          <dt>
            <Sunrise aria-hidden="true" size={16} /> Sunrise
          </dt>
          <dd>{sunrise ? formatTime(sunrise) : "--"}</dd>
        </div>
        <div>
          <dt>
            <Sunset aria-hidden="true" size={16} /> Sunset
          </dt>
          <dd>{sunset ? formatTime(sunset) : "--"}</dd>
        </div>
        <div>
          <dt>
            <Clock aria-hidden="true" size={16} /> Remaining daylight
          </dt>
          <dd>{remainingDaylight}</dd>
        </div>
        <div>
          <dt>
            <Sun aria-hidden="true" size={16} /> UV index
          </dt>
          <dd>{formatUvIndex(uvIndex)}</dd>
        </div>
      </dl>
    </section>
  );
}

import { CloudRain, Droplets, Sun, ThermometerSun, Wind } from "lucide-react";
import type { NormalizedWeatherResponse } from "@jetstream-weather/domain";
import {
  currentPrecipitationProbability,
  formatUvIndex,
  unitSymbol,
  windUnit,
} from "./weatherUtils";

interface MetricRailProps {
  weather: NormalizedWeatherResponse;
}

export function MetricRail({ weather }: MetricRailProps) {
  const symbol = unitSymbol(weather);
  const rain = currentPrecipitationProbability(weather);
  const uv = weather.daily[0]?.uvIndexMax ?? weather.current.uvIndex;
  const metrics = [
    {
      label: "Feels like",
      value: `${Math.round(weather.current.apparentTemperature)}${symbol}`,
      icon: ThermometerSun,
    },
    {
      label: "Humidity",
      value: weather.current.humidity === undefined ? "—" : `${weather.current.humidity}%`,
      icon: Droplets,
    },
    {
      label: "Wind",
      value:
        weather.current.windSpeed === undefined
          ? "—"
          : `${Math.round(weather.current.windSpeed)} ${windUnit(weather)}`,
      icon: Wind,
    },
    {
      label: "Rain",
      value: rain === undefined ? "—" : `${Math.round(rain)}%`,
      icon: CloudRain,
    },
    { label: "UV index", value: formatUvIndex(uv), icon: Sun },
  ];

  return (
    <dl className="metric-rail" aria-label="Current weather metrics">
      {metrics.map(({ label, value, icon: Icon }) => (
        <div key={label}>
          <dt>
            <Icon size={15} aria-hidden="true" />
            {label}
          </dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}

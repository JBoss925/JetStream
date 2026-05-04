import {
  CalendarDays,
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  Snowflake,
  Sun,
  ThermometerSun,
  Umbrella,
  Wind,
  Sunrise,
} from "lucide-react";
import type { WeatherFamily, WeatherInsight } from "@jetstream-weather/domain";

export function insightIcon(insight: WeatherInsight) {
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

export function weatherFamilyIcon(family: WeatherFamily) {
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

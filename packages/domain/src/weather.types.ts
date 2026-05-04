export type Units = "metric" | "imperial";

export type WeatherFamily =
  | "clear"
  | "clouds"
  | "fog"
  | "drizzle"
  | "rain"
  | "snow"
  | "storm"
  | "mixed";

export type InsightSeverity = "info" | "warning" | "critical";

export interface LocationOption {
  id: string;
  name: string;
  region?: string;
  country: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface CurrentConditions {
  observedAt: string;
  temperature: number;
  apparentTemperature: number;
  weatherCode: number;
  summary: string;
  family: WeatherFamily;
  humidity?: number;
  windSpeed?: number;
  windGusts?: number;
  windDirection?: number;
  pressure?: number;
  uvIndex?: number;
  cloudCover?: number;
  precipitation?: number;
  precipitationProbability?: number;
  isDay: boolean;
}

export interface HourlyPoint {
  time: string;
  temperature: number;
  apparentTemperature?: number;
  weatherCode: number;
  summary: string;
  family: WeatherFamily;
  humidity?: number;
  precipitationProbability?: number;
  cloudCover?: number;
  windSpeed?: number;
  windDirection?: number;
}

export interface DailyForecast {
  date: string;
  tempMin: number;
  tempMax: number;
  weatherCode: number;
  summary: string;
  family: WeatherFamily;
  sunrise?: string;
  sunset?: string;
  precipitationProbabilityMax?: number;
  uvIndexMax?: number;
}

export interface WeatherInsight {
  id: string;
  kind: "comfort" | "umbrella" | "wind" | "temperature" | "daylight";
  severity: InsightSeverity;
  title: string;
  message: string;
}

export interface NormalizedWeatherResponse {
  location: LocationOption;
  units: Units;
  current: CurrentConditions;
  hourly: HourlyPoint[];
  daily: DailyForecast[];
  insights: WeatherInsight[];
  source: {
    provider: "open-meteo";
    attribution: string;
  };
  fetchedAt: string;
}

import type {
  LocationOption,
  NormalizedWeatherResponse,
  Units,
  WeatherFamily,
} from "@jetstream-weather/domain";

export interface TestWeatherScenario {
  id: string;
  name: string;
  family: WeatherFamily;
  build: (units: Units) => NormalizedWeatherResponse;
}

export interface ScenarioSeed {
  id: string;
  name: string;
  location: LocationOption;
  code: number;
  observedAt: string;
  temperatureF: number;
  apparentTemperatureF: number;
  humidity?: number;
  windSpeedMph?: number;
  windGustsMph?: number;
  windDirection?: number;
  pressure?: number;
  cloudCover?: number;
  precipitation?: number;
  isDay: boolean;
  sunrise?: string;
  sunset?: string;
  dailyRangeF: [number, number];
  hourlyCodes: number[];
  hourlyPrecipitation?: number[];
  dailyCodes?: number[];
  dailyUvIndexMax?: number[];
  estimateDailyUvIndex?: boolean;
}

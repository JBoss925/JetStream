export interface OpenMeteoLocationResponse {
  results?: Array<{
    id: number;
    name: string;
    latitude: number;
    longitude: number;
    country: string;
    admin1?: string;
    timezone?: string;
  }>;
}

export interface OpenMeteoForecastResponse {
  timezone: string;
  current: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m?: number;
    apparent_temperature: number;
    is_day: number;
    precipitation?: number;
    weather_code: number;
    cloud_cover?: number;
    pressure_msl?: number;
    wind_speed_10m?: number;
    wind_gusts_10m?: number;
    wind_direction_10m?: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    apparent_temperature: number[];
    relative_humidity_2m?: number[];
    precipitation_probability?: number[];
    weather_code: number[];
    cloud_cover?: number[];
    wind_speed_10m?: number[];
    wind_direction_10m?: number[];
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    sunrise?: string[];
    sunset?: string[];
    precipitation_probability_max?: number[];
    uv_index_max?: number[];
  };
}

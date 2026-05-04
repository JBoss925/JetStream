import { useEffect, useState } from "react";
import type {
  LocationOption,
  NormalizedWeatherResponse,
  Units,
} from "@jetstream-weather/domain";
import { getWeather } from "../api/weatherApi";

interface WeatherState {
  data: NormalizedWeatherResponse | null;
  isLoading: boolean;
  error: string | null;
}

export function useWeather(
  location: LocationOption | null,
  units: Units,
  enabled = true,
): WeatherState {
  const [state, setState] = useState<WeatherState>({
    data: null,
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    if (!enabled || !location) {
      setState({ data: null, isLoading: false, error: null });
      return;
    }

    const controller = new AbortController();
    setState((current) => ({
      data: current.data,
      isLoading: true,
      error: null,
    }));

    getWeather(location, units, controller.signal)
      .then((data) => {
        setState({ data, isLoading: false, error: null });
      })
      .catch((error: unknown) => {
        if (controller.signal.aborted) {
          return;
        }

        setState({
          data: null,
          isLoading: false,
          error:
            error instanceof Error
              ? error.message
              : "Unable to load weather data.",
        });
      });

    return () => controller.abort();
  }, [enabled, location, units]);

  return state;
}

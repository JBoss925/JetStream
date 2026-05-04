import { useEffect, useState } from "react";
import type { LocationOption } from "@jetstream-weather/domain";
import { searchLocations } from "../api/weatherApi";

interface LocationSearchState {
  results: LocationOption[];
  isLoading: boolean;
  error: string | null;
}

export function useLocationSearch(query: string): LocationSearchState {
  const [state, setState] = useState<LocationSearchState>({
    results: [],
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    const trimmedQuery = query.trim();
    if (trimmedQuery.length < 2) {
      setState({ results: [], isLoading: false, error: null });
      return;
    }

    const controller = new AbortController();
    const timer = window.setTimeout(() => {
      setState((current) => ({ ...current, isLoading: true, error: null }));
      searchLocations(trimmedQuery, controller.signal)
        .then((results) => {
          setState({ results, isLoading: false, error: null });
        })
        .catch((error: unknown) => {
          if (controller.signal.aborted) {
            return;
          }

          setState({
            results: [],
            isLoading: false,
            error:
              error instanceof Error
                ? error.message
                : "Unable to search locations.",
          });
        });
    }, 250);

    return () => {
      controller.abort();
      window.clearTimeout(timer);
    };
  }, [query]);

  return state;
}

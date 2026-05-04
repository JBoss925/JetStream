import { Search } from "lucide-react";
import { FormEvent, KeyboardEvent, useId, useMemo, useState } from "react";
import type { LocationOption } from "@jetstream-weather/domain";
import { useLocationSearch } from "../hooks/useLocationSearch";

interface LocationSearchProps {
  onSelectLocation: (location: LocationOption) => void;
}

export function LocationSearch({ onSelectLocation }: LocationSearchProps) {
  const [query, setQuery] = useState("");
  const [selectedQuery, setSelectedQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const { results, isLoading, error } = useLocationSearch(query);
  const listboxId = useId();
  const isSelectedQuery = query.trim() !== "" && query === selectedQuery;
  const visibleResults = isSelectedQuery ? [] : results;

  const helperText = useMemo(() => {
    if (isSelectedQuery) {
      return null;
    }

    if (error) {
      return error;
    }

    if (isLoading) {
      return "Searching locations...";
    }

    if (query.trim().length >= 2 && results.length === 0) {
      return "No matching locations yet.";
    }

    return null;
  }, [error, isLoading, isSelectedQuery, query, results.length]);

  function selectLocation(location: LocationOption) {
    const nextQuery = `${location.name}, ${location.region ?? location.country}`;
    setQuery(nextQuery);
    setSelectedQuery(nextQuery);
    onSelectLocation(location);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const location = results[activeIndex] ?? results[0];
    if (location) {
      selectLocation(location);
    }
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, results.length - 1));
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    }
  }

  return (
    <form className="search-panel" onSubmit={handleSubmit}>
      <label className="sr-only" htmlFor="location-search">
        Location
      </label>
      <div className="search-control">
        <Search aria-hidden="true" size={20} />
        <input
          id="location-search"
          type="search"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setSelectedQuery("");
            setActiveIndex(0);
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search for Charlotte, London, Tokyo..."
          role="combobox"
          aria-expanded={visibleResults.length > 0}
          aria-controls={listboxId}
          aria-activedescendant={
            visibleResults[activeIndex] ? `${listboxId}-${activeIndex}` : undefined
          }
          autoComplete="off"
        />
      </div>
      {helperText || visibleResults.length > 0 ? (
        <div className="location-results-panel">
          {helperText ? (
            <p className={error ? "form-helper form-helper-error" : "form-helper"}>
              {helperText}
            </p>
          ) : null}
          {visibleResults.length > 0 ? (
            <ul className="location-results" id={listboxId} role="listbox">
              {visibleResults.map((location, index) => (
                <li
                  id={`${listboxId}-${index}`}
                  key={location.id}
                  role="option"
                  aria-selected={activeIndex === index}
                >
                  <button type="button" onClick={() => selectLocation(location)}>
                    <span>{location.name}</span>
                    <small>
                      {[location.region, location.country].filter(Boolean).join(", ")}
                    </small>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}

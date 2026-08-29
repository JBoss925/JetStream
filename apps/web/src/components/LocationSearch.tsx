import { ChevronDown, MapPin, Search, X } from "lucide-react";
import { FormEvent, KeyboardEvent, useId, useMemo, useState } from "react";
import type { LocationOption } from "@jetstream-weather/domain";
import { useLocationSearch } from "../hooks/useLocationSearch";

interface LocationSearchProps {
  location?: LocationOption;
  onSelectLocation: (location: LocationOption) => void;
}

export function LocationSearch({ location: currentLocation, onSelectLocation }: LocationSearchProps) {
  const [query, setQuery] = useState("");
  const [selectedQuery, setSelectedQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const [isOpen, setIsOpen] = useState(!currentLocation);
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
    if (currentLocation) {
      setIsOpen(false);
    }
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
    <form className={`search-panel${currentLocation ? " search-panel-compact" : ""}`} onSubmit={handleSubmit}>
      {currentLocation ? (
        <button
          type="button"
          className="location-trigger"
          aria-expanded={isOpen}
          onClick={() => {
            setIsOpen((open) => !open);
            setQuery("");
            setSelectedQuery("");
          }}
        >
          <MapPin size={16} aria-hidden="true" />
          <span>
            <small>Forecast for</small>
            <strong>{currentLocation.name}</strong>
          </span>
          <ChevronDown size={15} aria-hidden="true" />
        </button>
      ) : null}
      {isOpen ? (
        <div className="location-command">
          {currentLocation ? (
            <div className="location-command-heading">
              <span>Change location</span>
              <button type="button" aria-label="Close location search" onClick={() => setIsOpen(false)}>
                <X size={17} />
              </button>
            </div>
          ) : null}
      <label className="sr-only" htmlFor="location-search">
        Location
      </label>
      <div className="search-control">
        <span className="search-icon" aria-hidden="true">
          <Search size={19} />
        </span>
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
          placeholder="Search city or region"
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
        </div>
      ) : null}
    </form>
  );
}

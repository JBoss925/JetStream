import { MapPin, Search } from "lucide-react";
import {
  FormEvent,
  KeyboardEvent,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
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
  const searchPanelRef = useRef<HTMLFormElement>(null);
  const { results, isLoading, error } = useLocationSearch(query);
  const listboxId = useId();
  const isSelectedQuery = query.trim() !== "" && query === selectedQuery;
  const visibleResults = isSelectedQuery ? [] : results;

  useEffect(() => {
    if (!currentLocation || !isOpen) {
      return undefined;
    }

    const dismissLocationSearch = (event: PointerEvent) => {
      if (!searchPanelRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
        setQuery("");
        setSelectedQuery("");
        setActiveIndex(0);
      }
    };

    document.addEventListener("pointerdown", dismissLocationSearch);
    return () => document.removeEventListener("pointerdown", dismissLocationSearch);
  }, [currentLocation, isOpen]);

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

  function toggleLocationSearch() {
    setIsOpen((open) => !open);
    setQuery("");
    setSelectedQuery("");
    setActiveIndex(0);
  }

  return (
    <form
      ref={searchPanelRef}
      className={`search-panel${currentLocation ? " search-panel-compact" : ""}`}
      onSubmit={handleSubmit}
    >
      {currentLocation ? (
        <button
          type="button"
          className="location-trigger"
          aria-expanded={isOpen}
          onPointerUp={(event) => {
            if (event.button === 0) {
              toggleLocationSearch();
            }
          }}
          onClick={(event) => {
            if (event.detail === 0) {
              toggleLocationSearch();
            }
          }}
        >
          <MapPin size={16} aria-hidden="true" />
          <span>
            <small>Forecast for</small>
            <strong>{currentLocation.name}</strong>
          </span>
          <span className="location-trigger-icon" aria-hidden="true">
            <svg
              className="location-trigger-chevron"
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d={isOpen ? "M6 15L12 9L18 15" : "M6 9L12 15L18 9"} />
            </svg>
          </span>
        </button>
      ) : null}
      {isOpen ? (
        <div className="location-command">
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

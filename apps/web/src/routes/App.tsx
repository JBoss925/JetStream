import { useEffect, useState } from "react";
import type { LocationOption, Units } from "@jetstream-weather/domain";
import { LocationSearch } from "../components/LocationSearch";
import { PreferenceBar, type BackendMode } from "../components/PreferenceBar";
import { WeatherDashboard } from "../components/WeatherDashboard";
import { useWeather } from "../hooks/useWeather";
import {
  readColorThemePreference,
  readDefaultStartupPreference,
  readThemePreference,
  readUnitsPreference,
  type ColorThemePreference,
  type ThemePreference,
  writeColorThemePreference,
  writeDefaultStartupPreference,
  writeThemePreference,
  writeUnitsPreference,
} from "../state/preferences";
import {
  defaultTestWeatherScenarioId,
  testWeatherScenarios,
} from "../testWeatherScenarios";

const defaultLocation: LocationOption = {
  id: "charlotte-nc",
  name: "Charlotte",
  region: "North Carolina",
  country: "United States",
  latitude: 35.2271,
  longitude: -80.8431,
  timezone: "America/New_York",
};

export function App() {
  const [defaultStartup, setDefaultStartup] = useState(() =>
    readDefaultStartupPreference(),
  );
  const [selectedLocation, setSelectedLocation] = useState<LocationOption>(
    () => defaultStartup?.location ?? defaultLocation,
  );
  const [units, setUnits] = useState<Units>(() => readUnitsPreference());
  const [theme, setTheme] = useState<ThemePreference>(() => readThemePreference());
  const [colorTheme, setColorTheme] = useState<ColorThemePreference>(() =>
    readColorThemePreference(),
  );
  const [backendMode, setBackendMode] = useState<BackendMode>(
    () => defaultStartup?.mode ?? "live",
  );
  const [selectedTestScenarioId, setSelectedTestScenarioId] = useState(
    () => defaultStartup?.scenarioId ?? defaultTestWeatherScenarioId,
  );
  const weatherState = useWeather(selectedLocation, units, backendMode === "live");
  const selectedTestScenario =
    testWeatherScenarios.find((scenario) => scenario.id === selectedTestScenarioId) ??
    testWeatherScenarios[0];
  const testWeather = selectedTestScenario.build(units);
  const dashboardWeather = backendMode === "test" ? testWeather : weatherState.data;
  const displayedLocation = dashboardWeather?.location ?? selectedLocation;
  const isCurrentLocationDefault =
    defaultStartup?.mode === backendMode &&
    (backendMode === "test"
      ? defaultStartup.scenarioId === selectedTestScenario.id
      : defaultStartup.location.id === displayedLocation.id &&
        defaultStartup.location.latitude === displayedLocation.latitude &&
        defaultStartup.location.longitude === displayedLocation.longitude);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  useEffect(() => {
    document.documentElement.dataset.colorTheme = colorTheme;
  }, [colorTheme]);

  function handleUnitsChange(nextUnits: Units) {
    setUnits(nextUnits);
    writeUnitsPreference(nextUnits);
  }

  function handleThemeChange(nextTheme: ThemePreference) {
    setTheme(nextTheme);
    writeThemePreference(nextTheme);
  }

  function handleColorThemeChange(nextColorTheme: ColorThemePreference) {
    setColorTheme(nextColorTheme);
    writeColorThemePreference(nextColorTheme);
  }

  function handleSaveDefaultLocation() {
    const nextDefault = {
      mode: backendMode,
      location: displayedLocation,
      scenarioId: backendMode === "test" ? selectedTestScenario.id : undefined,
    };

    writeDefaultStartupPreference(nextDefault);
    setDefaultStartup(nextDefault);
  }

  return (
    <main className="app-shell">
      <header className="app-header">
        <div className="brand-lockup" aria-label="JetStream">
          <p className="brand-wordmark">
            <span className="brand-initial">Jet</span>
            <span>Stream</span>
          </p>
        </div>
        <PreferenceBar
          units={units}
          theme={theme}
          colorTheme={colorTheme}
          backendMode={backendMode}
          testScenarios={testWeatherScenarios}
          selectedTestScenarioId={selectedTestScenario.id}
          onUnitsChange={handleUnitsChange}
          onThemeChange={handleThemeChange}
          onColorThemeChange={handleColorThemeChange}
          onSaveDefaultLocation={handleSaveDefaultLocation}
          onBackendModeChange={setBackendMode}
          onTestScenarioChange={setSelectedTestScenarioId}
          isCurrentLocationDefault={isCurrentLocationDefault}
        />
      </header>

      {backendMode === "live" ? (
        <LocationSearch onSelectLocation={setSelectedLocation} />
      ) : null}

      {backendMode === "live" && weatherState.error ? (
        <section className="error-panel" aria-label="Weather error">
          <h2>Weather data is unavailable</h2>
          <p>{weatherState.error}</p>
          <button
            type="button"
            onClick={() => setSelectedLocation({ ...selectedLocation })}
          >
            Retry
          </button>
        </section>
      ) : null}

      {backendMode === "live" && weatherState.isLoading && !weatherState.data ? (
        <section className="skeleton-grid" aria-label="Loading weather">
          <div />
          <div />
          <div />
        </section>
      ) : null}

      {dashboardWeather ? (
        <WeatherDashboard weather={dashboardWeather} />
      ) : null}
    </main>
  );
}

import { useState } from "react";
import {
  Database,
  MapPinned,
  Moon,
  Palette,
  SunMedium,
  Thermometer,
} from "lucide-react";
import type { Units } from "@jetstream-weather/domain";
import type {
  ColorThemePreference,
  ThemePreference,
} from "../state/preferences";
import type { TestWeatherScenario } from "../testWeatherScenarios";

export type BackendMode = "live" | "test";

interface PreferenceBarProps {
  units: Units;
  theme: ThemePreference;
  colorTheme: ColorThemePreference;
  backendMode: BackendMode;
  testScenarios: TestWeatherScenario[];
  selectedTestScenarioId: string;
  onUnitsChange: (units: Units) => void;
  onThemeChange: (theme: ThemePreference) => void;
  onColorThemeChange: (colorTheme: ColorThemePreference) => void;
  onSaveDefaultLocation: () => void;
  onBackendModeChange: (mode: BackendMode) => void;
  onTestScenarioChange: (scenarioId: string) => void;
  isCurrentLocationDefault: boolean;
}

const colorThemeOptions: Array<{
  id: ColorThemePreference;
  label: string;
  swatch: string;
}> = [
  { id: "seafoam", label: "Seafoam", swatch: "#0f7668" },
  { id: "cyan", label: "Cyan", swatch: "#0d8fb3" },
  { id: "blue", label: "Blue", swatch: "#256ca8" },
  { id: "purple", label: "Purple", swatch: "#7756c5" },
  { id: "rose", label: "Rose", swatch: "#c04b73" },
  { id: "amber", label: "Amber", swatch: "#b87516" },
  { id: "slate", label: "Slate", swatch: "#4b6584" },
  { id: "indigo", label: "Indigo", swatch: "#4f63c6" },
  { id: "magenta", label: "Magenta", swatch: "#b342a0" },
  { id: "coral", label: "Coral", swatch: "#cf5f42" },
  { id: "lime", label: "Lime", swatch: "#6f9622" },
  { id: "graphite", label: "Graphite", swatch: "#505a66" },
];

export function PreferenceBar({
  units,
  theme,
  colorTheme,
  backendMode,
  testScenarios,
  selectedTestScenarioId,
  onUnitsChange,
  onThemeChange,
  onColorThemeChange,
  onSaveDefaultLocation,
  onBackendModeChange,
  onTestScenarioChange,
  isCurrentLocationDefault,
}: PreferenceBarProps) {
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const selectedColorTheme = colorThemeOptions.find(
    (option) => option.id === colorTheme,
  );

  return (
    <div className="preference-bar" aria-label="Weather preferences">
      <div className="segmented-control" aria-label="Backend data source">
        <Database aria-hidden="true" size={18} />
        <button
          type="button"
          aria-pressed={backendMode === "live"}
          onClick={() => onBackendModeChange("live")}
        >
          Live
        </button>
        <button
          type="button"
          aria-pressed={backendMode === "test"}
          onClick={() => onBackendModeChange("test")}
        >
          Test
        </button>
      </div>
      {backendMode === "test" ? (
        <label className="scenario-select">
          <span>Scenario</span>
          <select
            value={selectedTestScenarioId}
            onChange={(event) => onTestScenarioChange(event.target.value)}
          >
            {testScenarios.map((scenario) => (
              <option key={scenario.id} value={scenario.id}>
                {scenario.name}
              </option>
            ))}
          </select>
        </label>
      ) : null}
      <div className="segmented-control" aria-label="Units">
        <Thermometer aria-hidden="true" size={18} />
        <button
          type="button"
          aria-pressed={units === "imperial"}
          onClick={() => onUnitsChange("imperial")}
        >
          F
        </button>
        <button
          type="button"
          aria-pressed={units === "metric"}
          onClick={() => onUnitsChange("metric")}
        >
          C
        </button>
      </div>
      <div className="utility-control-group" aria-label="Saved view and theme controls">
          <button
            type="button"
            className="icon-button tooltip-button"
            onClick={onSaveDefaultLocation}
            aria-label={
              isCurrentLocationDefault
                ? "Current location is your default"
                : "Save current location as default"
            }
            title={
              isCurrentLocationDefault
                ? "Current location is your default"
                : "Save current location as default"
            }
            aria-pressed={isCurrentLocationDefault}
          >
            <MapPinned size={18} />
            <span className="button-tooltip" role="tooltip">
              {isCurrentLocationDefault
                ? "Saved default location. This forecast will load automatically when you open the app."
                : "Save the forecast location you are viewing now. The app will open here automatically next time."}
            </span>
          </button>
          <button
            type="button"
            className="icon-button tooltip-button"
            onClick={() => onThemeChange(theme === "dark" ? "light" : "dark")}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          >
            {theme === "dark" ? <SunMedium size={18} /> : <Moon size={18} />}
            <span className="button-tooltip" role="tooltip">
              Switch to {theme === "dark" ? "light" : "dark"} theme.
            </span>
          </button>
          <div className="palette-control">
            <button
              type="button"
              className="icon-button tooltip-button"
              onClick={() => setIsPaletteOpen((isOpen) => !isOpen)}
              aria-label="Choose color theme"
              aria-expanded={isPaletteOpen}
              aria-haspopup="menu"
            >
              <Palette size={18} />
              <span
                className="palette-dot"
                style={{ backgroundColor: selectedColorTheme?.swatch }}
                aria-hidden="true"
              />
              {!isPaletteOpen ? (
                <span className="button-tooltip" role="tooltip">
                  Choose the app color palette.
                </span>
              ) : null}
            </button>
            {isPaletteOpen ? (
              <div className="palette-menu" role="menu" aria-label="Color theme">
                {colorThemeOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    role="menuitemradio"
                    aria-checked={option.id === colorTheme}
                    onClick={() => {
                      onColorThemeChange(option.id);
                      setIsPaletteOpen(false);
                    }}
                  >
                    <span
                      className="palette-swatch"
                      style={{ backgroundColor: option.swatch }}
                      aria-hidden="true"
                    />
                    <span>{option.label}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
      </div>
    </div>
  );
}

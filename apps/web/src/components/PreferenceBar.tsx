import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Database,
  MapPinned,
  Moon,
  Palette,
  SunMedium,
  Thermometer,
  Settings2,
  X,
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
  compact?: boolean;
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
  compact = false,
}: PreferenceBarProps) {
  const [isPaletteOpen, setIsPaletteOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(!compact);
  const preferenceShellRef = useRef<HTMLDivElement>(null);
  const paletteButtonRef = useRef<HTMLButtonElement>(null);
  const paletteMenuRef = useRef<HTMLDivElement>(null);
  const [palettePosition, setPalettePosition] = useState({
    left: 12,
    top: 12,
    width: 280,
  });
  const selectedColorTheme = colorThemeOptions.find(
    (option) => option.id === colorTheme,
  );

  function toggleSettings() {
    setIsSettingsOpen((open) => !open);
    setIsPaletteOpen(false);
  }

  useEffect(() => {
    if (!compact || !isSettingsOpen) {
      return undefined;
    }

    const dismissSettings = (event: PointerEvent) => {
      const target = event.target as Element;
      if (
        !preferenceShellRef.current?.contains(target) &&
        !target.closest(".palette-menu")
      ) {
        setIsSettingsOpen(false);
        setIsPaletteOpen(false);
      }
    };

    document.addEventListener("pointerdown", dismissSettings);
    return () => document.removeEventListener("pointerdown", dismissSettings);
  }, [compact, isSettingsOpen]);

  useEffect(() => {
    if (!isPaletteOpen) {
      return undefined;
    }

    const positionPalette = () => {
      const anchor = paletteButtonRef.current?.getBoundingClientRect();
      if (!anchor) {
        return;
      }

      const gutter = 12;
      const width = Math.min(292, window.innerWidth - gutter * 2);
      const height = paletteMenuRef.current?.offsetHeight ?? 254;
      const left = Math.min(
        Math.max(anchor.right - width, gutter),
        window.innerWidth - width - gutter,
      );
      const above = anchor.top - height - 8;
      const top =
        above >= gutter
          ? above
          : Math.min(anchor.bottom + 8, window.innerHeight - height - gutter);

      setPalettePosition({ left, top: Math.max(gutter, top), width });
    };
    const dismissPalette = (event: PointerEvent) => {
      const target = event.target as Node;
      if (
        !paletteButtonRef.current?.contains(target) &&
        !paletteMenuRef.current?.contains(target)
      ) {
        setIsPaletteOpen(false);
      }
    };
    const dismissWithEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsPaletteOpen(false);
        paletteButtonRef.current?.focus();
      }
    };

    positionPalette();
    window.addEventListener("resize", positionPalette);
    document.addEventListener("scroll", positionPalette, true);
    document.addEventListener("pointerdown", dismissPalette);
    document.addEventListener("keydown", dismissWithEscape);

    return () => {
      window.removeEventListener("resize", positionPalette);
      document.removeEventListener("scroll", positionPalette, true);
      document.removeEventListener("pointerdown", dismissPalette);
      document.removeEventListener("keydown", dismissWithEscape);
    };
  }, [isPaletteOpen]);

  return (
    <div
      ref={preferenceShellRef}
      className={`preference-shell${compact ? " preference-shell-compact" : ""}`}
    >
      {compact ? (
        <button
          type="button"
          className="settings-trigger"
          aria-label="Open settings"
          aria-expanded={isSettingsOpen}
          onPointerUp={(event) => {
            if (event.button === 0) {
              toggleSettings();
            }
          }}
          onClick={(event) => {
            if (event.detail === 0) {
              toggleSettings();
            }
          }}
        >
          <Settings2 size={18} />
        </button>
      ) : null}
      {isSettingsOpen ? (
      <div className="preference-bar" aria-label="Weather preferences">
      {compact ? (
        <div className="settings-heading">
          <div>
            <span>Preferences</span>
            <strong>Make JetStream yours</strong>
          </div>
          <button
            type="button"
            aria-label="Close settings"
            onClick={() => {
              setIsSettingsOpen(false);
              setIsPaletteOpen(false);
            }}
          >
            <X size={18} />
          </button>
        </div>
      ) : null}
      <div className="preference-group">
        <span className="preference-label">Forecast</span>
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
      <div className="preference-group">
        <span className="preference-label">Units</span>
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
              ref={paletteButtonRef}
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
            {isPaletteOpen && typeof document !== "undefined"
              ? createPortal(
              <div
                ref={paletteMenuRef}
                className="palette-menu palette-menu-floating"
                role="menu"
                aria-label="Color theme"
                style={palettePosition}
              >
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
              </div>,
              document.body,
              )
              : null}
          </div>
      </div>
      </div>
      ) : null}
    </div>
  );
}

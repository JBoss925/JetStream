import type { LocationOption, Units } from "@jetstream-weather/domain";

export type ThemePreference = "light" | "dark";
export type ColorThemePreference =
  | "seafoam"
  | "cyan"
  | "blue"
  | "purple"
  | "rose"
  | "amber"
  | "slate"
  | "indigo"
  | "magenta"
  | "coral"
  | "lime"
  | "graphite";
export type StartupBackendModePreference = "live" | "test";

export interface DefaultStartupPreference {
  mode: StartupBackendModePreference;
  location: LocationOption;
  scenarioId?: string;
}

const unitsKey = "jetstream-weather:units";
const themeKey = "jetstream-weather:theme";
const colorThemeKey = "jetstream-weather:color-theme";
const defaultLocationKey = "jetstream-weather:default-location";
export const colorThemeAccents: Record<ColorThemePreference, string> = {
  seafoam: "#0f7668",
  cyan: "#0d8fb3",
  blue: "#256ca8",
  purple: "#7756c5",
  rose: "#c04b73",
  amber: "#b87516",
  slate: "#4b6584",
  indigo: "#4f63c6",
  magenta: "#b342a0",
  coral: "#cf5f42",
  lime: "#6f9622",
  graphite: "#505a66",
};
const colorThemes = new Set<ColorThemePreference>([
  "seafoam",
  "cyan",
  "blue",
  "purple",
  "rose",
  "amber",
  "slate",
  "indigo",
  "magenta",
  "coral",
  "lime",
  "graphite",
]);

export function getColorThemeAccent(colorTheme: ColorThemePreference): string {
  return colorThemeAccents[colorTheme];
}

export function readUnitsPreference(): Units {
  return localStorage.getItem(unitsKey) === "metric" ? "metric" : "imperial";
}

export function writeUnitsPreference(units: Units) {
  localStorage.setItem(unitsKey, units);
}

export function readThemePreference(): ThemePreference {
  return localStorage.getItem(themeKey) === "light" ? "light" : "dark";
}

export function writeThemePreference(theme: ThemePreference) {
  localStorage.setItem(themeKey, theme);
}

export function readColorThemePreference(): ColorThemePreference {
  const storedColorTheme = localStorage.getItem(colorThemeKey);

  return colorThemes.has(storedColorTheme as ColorThemePreference)
    ? (storedColorTheme as ColorThemePreference)
    : "seafoam";
}

export function writeColorThemePreference(colorTheme: ColorThemePreference) {
  localStorage.setItem(colorThemeKey, colorTheme);
}

function isLocationOption(value: Partial<LocationOption>): value is LocationOption {
  return (
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.region === "string" &&
    typeof value.country === "string" &&
    typeof value.latitude === "number" &&
    typeof value.longitude === "number" &&
    typeof value.timezone === "string"
  );
}

export function readDefaultStartupPreference(): DefaultStartupPreference | null {
  const storedDefault = localStorage.getItem(defaultLocationKey);

  if (!storedDefault) {
    return null;
  }

  try {
    const savedDefault = JSON.parse(storedDefault) as
      | Partial<LocationOption>
      | Partial<DefaultStartupPreference>;

    if ("location" in savedDefault && savedDefault.location) {
      const mode = savedDefault.mode === "test" ? "test" : "live";
      const location = savedDefault.location as Partial<LocationOption>;

      if (!isLocationOption(location)) {
        return null;
      }

      return {
        mode,
        location,
        scenarioId:
          mode === "test" && typeof savedDefault.scenarioId === "string"
            ? savedDefault.scenarioId
            : undefined,
      };
    }

    const legacyLocation = savedDefault as Partial<LocationOption>;

    if (isLocationOption(legacyLocation)) {
      return {
        mode: "live",
        location: legacyLocation,
      };
    }

    return null;
  } catch {
    return null;
  }
}

export function writeDefaultStartupPreference(
  defaultStartup: DefaultStartupPreference,
) {
  localStorage.setItem(defaultLocationKey, JSON.stringify(defaultStartup));
}

import { beforeEach, describe, expect, it } from "vitest";
import {
  readColorThemePreference,
  readDefaultStartupPreference,
  readThemePreference,
  readUnitsPreference,
  writeColorThemePreference,
  writeDefaultStartupPreference,
  writeThemePreference,
  writeUnitsPreference,
} from "./preferences";

const location = {
  id: "charlotte-nc",
  name: "Charlotte",
  region: "North Carolina",
  country: "United States",
  latitude: 35.2271,
  longitude: -80.8431,
  timezone: "America/New_York",
};

describe("preferences", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("reads and writes units, theme, and color theme preferences", () => {
    expect(readUnitsPreference()).toBe("imperial");
    expect(readThemePreference()).toBe("dark");
    expect(readColorThemePreference()).toBe("cyan");

    writeUnitsPreference("metric");
    writeThemePreference("light");
    writeColorThemePreference("coral");

    expect(readUnitsPreference()).toBe("metric");
    expect(readThemePreference()).toBe("light");
    expect(readColorThemePreference()).toBe("coral");
  });

  it("rejects invalid color themes and malformed defaults", () => {
    localStorage.setItem("jetstream-weather:color-theme", "invalid");
    localStorage.setItem("jetstream-weather:default-location", "{");

    expect(readColorThemePreference()).toBe("cyan");
    expect(readDefaultStartupPreference()).toBeNull();

    localStorage.setItem(
      "jetstream-weather:default-location",
      JSON.stringify({ location: { ...location, timezone: undefined } }),
    );

    expect(readDefaultStartupPreference()).toBeNull();

    localStorage.setItem(
      "jetstream-weather:default-location",
      JSON.stringify({ location }),
    );

    expect(readDefaultStartupPreference()).toEqual({ mode: "live", location });

    localStorage.setItem(
      "jetstream-weather:default-location",
      JSON.stringify({ id: "bad" }),
    );

    expect(readDefaultStartupPreference()).toBeNull();
  });

  it("reads current and legacy default startup preferences", () => {
    writeDefaultStartupPreference({
      mode: "test",
      location,
      scenarioId: "clear-hot-dry",
    });

    expect(readDefaultStartupPreference()).toEqual({
      mode: "test",
      location,
      scenarioId: "clear-hot-dry",
    });

    localStorage.setItem(
      "jetstream-weather:default-location",
      JSON.stringify(location),
    );

    expect(readDefaultStartupPreference()).toEqual({
      mode: "live",
      location,
    });
  });
});

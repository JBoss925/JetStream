import { BadRequestException } from "@nestjs/common";
import { describe, expect, it, vi } from "vitest";
import { LocationsController } from "./locations.controller.js";
import { WeatherController } from "./weather.controller.js";

describe("weather controllers", () => {
  it("passes location search defaults to the provider", async () => {
    const openMeteo = {
      searchLocations: vi.fn(async () => []),
    };
    const controller = new LocationsController(openMeteo as never);

    await controller.search({ query: undefined as unknown as string });

    expect(openMeteo.searchLocations).toHaveBeenCalledWith("London");
  });

  it("normalizes weather query defaults before calling the provider", async () => {
    const openMeteo = {
      getWeather: vi.fn(async () => ({ ok: true })),
    };
    const controller = new WeatherController(openMeteo as never);

    await controller.getWeather({} as never);

    expect(openMeteo.getWeather).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "London",
        country: "United Kingdom",
        region: "England",
        latitude: 51.5072,
        longitude: -0.1276,
        timezone: "Europe/London",
      }),
      "imperial",
    );
  });

  it("rejects invalid coordinates before calling the provider", async () => {
    const openMeteo = {
      getWeather: vi.fn(),
    };
    const controller = new WeatherController(openMeteo as never);

    expect(() =>
      controller.getWeather({
        latitude: "not-a-number",
        longitude: "-0.1276",
      } as never),
    ).toThrow(BadRequestException);
    expect(openMeteo.getWeather).not.toHaveBeenCalled();
  });

  it("accepts metric units and falls back to Europe/London for blank timezones", async () => {
    const openMeteo = {
      getWeather: vi.fn(async () => ({ ok: true })),
    };
    const controller = new WeatherController(openMeteo as never);

    await controller.getWeather({
      latitude: "35.2271",
      longitude: "-80.8431",
      name: "Charlotte",
      country: "United States",
      region: undefined,
      timezone: "",
      units: "metric",
    } as never);

    expect(openMeteo.getWeather).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Charlotte",
        region: "England",
        timezone: "Europe/London",
      }),
      "metric",
    );
  });
});

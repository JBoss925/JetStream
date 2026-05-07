import { describe, expect, it } from "vitest";
import {
  matchesLocationSearch,
  parseLocationSearchQuery,
  sortLocationsBySearchRelevance,
} from "../src/location-search.js";

describe("location search parsing", () => {
  it("parses comma-separated city, region, and country parts", () => {
    expect(parseLocationSearchQuery(" London, England, United Kingdom ")).toEqual({
      city: "London",
      region: "England",
      country: "United Kingdom",
    });
    expect(parseLocationSearchQuery("London, England")).toEqual({
      city: "London",
      region: "England",
      country: undefined,
    });
    expect(parseLocationSearchQuery("London")).toEqual({
      city: "London",
      region: undefined,
      country: undefined,
    });
  });

  it("matches optional region and country constraints case-insensitively", () => {
    expect(
      matchesLocationSearch(
        { region: "England", country: "United Kingdom" },
        parseLocationSearchQuery("London, england, united kingdom"),
      ),
    ).toBe(true);
    expect(
      matchesLocationSearch(
        { region: "Ontario", country: "Canada" },
        parseLocationSearchQuery("London, England"),
      ),
    ).toBe(false);
    expect(
      matchesLocationSearch(
        { region: undefined, country: "United Kingdom" },
        parseLocationSearchQuery("London, England"),
      ),
    ).toBe(false);
    expect(
      matchesLocationSearch(
        { region: "England", country: "United Kingdom" },
        parseLocationSearchQuery("London"),
      ),
    ).toBe(true);
  });

  it("sorts partial region and country matches before weaker matches", () => {
    const locations = [
      { region: "North Carolina", country: "United States" },
      { region: "Michigan", country: "United States" },
      { region: "Michoacan", country: "Mexico" },
      { region: undefined, country: "United States" },
    ];

    expect(
      sortLocationsBySearchRelevance(
        locations,
        parseLocationSearchQuery("Charlotte, Mich"),
      ),
    ).toEqual([
      { region: "Michigan", country: "United States" },
      { region: "Michoacan", country: "Mexico" },
      { region: "North Carolina", country: "United States" },
      { region: undefined, country: "United States" },
    ]);
    expect(
      sortLocationsBySearchRelevance(
        locations,
        parseLocationSearchQuery("Charlotte, NC, United States"),
      )[0],
    ).toEqual({ region: "North Carolina", country: "United States" });
    expect(
      sortLocationsBySearchRelevance(
        locations,
        parseLocationSearchQuery("Charlotte, Carolina"),
      )[0],
    ).toEqual({ region: "North Carolina", country: "United States" });
  });
});

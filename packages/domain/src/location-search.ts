import type { LocationOption } from "./weather.types.js";

export interface ParsedLocationSearch {
  city: string;
  region?: string;
  country?: string;
}

export function parseLocationSearchQuery(query: string): ParsedLocationSearch {
  const [city = "", region, country] = query
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);

  return {
    city,
    region,
    country,
  };
}

export function matchesLocationSearch(
  location: Pick<LocationOption, "region" | "country">,
  search: ParsedLocationSearch,
): boolean {
  return (
    matchesSearchPart(location.region, search.region) &&
    matchesSearchPart(location.country, search.country)
  );
}

export function sortLocationsBySearchRelevance<T extends Pick<LocationOption, "region" | "country">>(
  locations: T[],
  search: ParsedLocationSearch,
): T[] {
  return locations
    .map((location, index) => ({
      index,
      location,
      score: locationSearchScore(location, search),
    }))
    .sort((left, right) => right.score - left.score || left.index - right.index)
    .map(({ location }) => location);
}

function matchesSearchPart(value: string | undefined, expected: string | undefined): boolean {
  if (!expected) {
    return true;
  }

  return normalizeSearchPart(value) === normalizeSearchPart(expected);
}

function locationSearchScore(
  location: Pick<LocationOption, "region" | "country">,
  search: ParsedLocationSearch,
): number {
  return (
    searchPartScore(location.region, search.region) * 2 +
    searchPartScore(location.country, search.country)
  );
}

function searchPartScore(value: string | undefined, expected: string | undefined): number {
  if (!expected) {
    return 0;
  }

  const normalizedValue = normalizeSearchPart(value);
  const normalizedExpected = normalizeSearchPart(expected);

  if (!normalizedValue) {
    return -1;
  }

  if (normalizedValue === normalizedExpected) {
    return 100;
  }

  if (normalizedValue.startsWith(normalizedExpected)) {
    return 80;
  }

  if (normalizedValue.includes(normalizedExpected)) {
    return 60;
  }

  if (isSubsequence(normalizedExpected, normalizedValue)) {
    return Math.max(10, 40 - (normalizedValue.length - normalizedExpected.length));
  }

  return 0;
}

function isSubsequence(needle: string, haystack: string): boolean {
  let cursor = 0;

  for (const character of haystack) {
    if (character === needle[cursor]) {
      cursor += 1;
    }

    if (cursor === needle.length) {
      return true;
    }
  }

  return needle.length === 0;
}

function normalizeSearchPart(value: string | undefined): string {
  return (value ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLocaleLowerCase("en-US");
}

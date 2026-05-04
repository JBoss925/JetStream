import { getWeatherCodeInfo } from "@jetstream-weather/domain";
import { buildWeather } from "./testWeatherScenarios/buildWeather";
import { scenarioSeeds } from "./testWeatherScenarios/seeds";
export type { TestWeatherScenario } from "./testWeatherScenarios/types";
import type { TestWeatherScenario } from "./testWeatherScenarios/types";

export const testWeatherScenarios: TestWeatherScenario[] = scenarioSeeds.map((seed) => ({
  id: seed.id,
  name: seed.name,
  family: getWeatherCodeInfo(seed.code).family,
  build: (units) => buildWeather(seed, units),
}));

export const defaultTestWeatherScenarioId = testWeatherScenarios[0].id;

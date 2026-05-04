import type { Units } from "@jetstream-weather/domain";
import type { WeatherCssProperties } from "../types";
import { clamp } from "./math";

function compassLabel(direction?: number): string {
  /* v8 ignore next 3 -- direction is validated by callers; fallback protects future reuse. */
  if (direction === undefined) {
    return "Variable";
  }

  const labels = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  return labels[Math.round(direction / 45) % labels.length];
}

function windMovementLabel(direction?: number): string {
  if (direction === undefined) {
    return "variable";
  }

  return compassLabel((direction + 180) % 360);
}

export function windDescription(speed: number | undefined, units: Units, direction?: number): string {
  if (speed === undefined) {
    return "Wind unavailable";
  }

  const mph = windSpeedAsMph(speed, units);
  const movementLabel = windMovementLabel(direction);

  if (direction === undefined) {
    if (mph < 4) {
      return "Calm winds with little directional movement.";
    }

    return "Variable winds with shifting direction.";
  }

  if (mph < 4) {
    return `Light, barely moving winds drifting ${movementLabel}.`;
  }

  if (mph < 10) {
    return `A light breeze is moving ${movementLabel}.`;
  }

  if (mph < 20) {
    return `Steady winds are tracking ${movementLabel}.`;
  }

  if (mph < 35) {
    return `Strong winds are pushing ${movementLabel}.`;
  }

  return `Damaging gusts may drive winds ${movementLabel}.`;
}

export function windGustDescription(
  speed: number,
  gusts: number | undefined,
  units: Units,
): string {
  if (gusts === undefined) {
    return "";
  }

  const roundedSpeed = Math.round(speed);
  const roundedGusts = Math.round(gusts);

  if (roundedGusts === roundedSpeed) {
    return "";
  }

  return ` Gusts up to ${roundedGusts} ${units === "imperial" ? "mph" : "km/h"}.`;
}

export function windArrowRotation(direction?: number): number {
  return direction === undefined ? 0 : (direction + 180) % 360;
}

export function windFlowRotation(direction?: number): number {
  return direction === undefined ? 0 : (direction + 90) % 360;
}

function windSpeedAsMph(speed: number, units: Units): number {
  return units === "metric" ? speed / 1.609 : speed;
}

export function windParticleCount(speed: number, units: Units): number {
  const mph = windSpeedAsMph(speed, units);
  return Math.round(clamp(mph / 1.4 + 14, 16, 38));
}

export function windParticleStyle(
  index: number,
  count: number,
  speed: number,
  units: Units,
): WeatherCssProperties {
  const mph = windSpeedAsMph(speed, units);
  const randomUnit = (seed: number) => {
    const value = Math.sin(seed * 12.9898 + mph * 78.233) * 43758.5453;
    return value - Math.floor(value);
  };
  const baseDuration = clamp(3.8 - mph / 12, 1.1, 3.8);
  const duration = baseDuration * (0.72 + randomUnit(index + 3) * 0.68);
  const distance = clamp(40 + mph * 1.7, 48, 92);

  return {
    "--particle-size": `${5 + ((index * 5) % 4)}px`,
    "--particle-x": `${14 + randomUnit(index + 11) * 72}%`,
    "--particle-y": `${12 + randomUnit(index + 23) * 76}%`,
    "--particle-start": `${-distance}px`,
    "--particle-end": `${distance}px`,
    "--particle-duration": `${duration}s`,
    "--particle-delay": `${-randomUnit(index + count + 41) * duration}s`,
  };
}

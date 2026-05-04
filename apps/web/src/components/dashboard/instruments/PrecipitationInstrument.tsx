import { CloudRain } from "lucide-react";
import type { NormalizedWeatherResponse } from "@jetstream-weather/domain";
import type { WeatherCssProperties } from "../types";
import {
  clamp,
  currentPrecipitationProbability,
  formatTime,
  hasPrecipitationProbabilityData,
  precipitationPeak,
} from "../weatherUtils";

interface PrecipitationInstrumentProps {
  weather: NormalizedWeatherResponse;
}

export function PrecipitationInstrument({ weather }: PrecipitationInstrumentProps) {
  const hasProbabilityData = hasPrecipitationProbabilityData(weather.hourly);
  const peak = hasProbabilityData ? precipitationPeak(weather.hourly) : undefined;
  const currentProbability = currentPrecipitationProbability(weather) ?? 0;
  const chartMax = Math.max(
    35,
    ...weather.hourly.slice(0, 8).map((point) => point.precipitationProbability ?? 0),
  );
  const precipitationHours = weather.hourly.slice(0, 8);
  const precipitationWeights = precipitationHours.map((point) => {
    const probability = point.precipitationProbability ?? 0;
    return probability > 0 ? Math.pow(probability, 1.25) : 0;
  });
  const precipitationWeightTotal = precipitationWeights.reduce((sum, weight) => sum + weight, 0);
  const precipitationIntensity = clamp((peak ?? 0) / 100, 0, 1);
  const dropCount = (peak ?? 0) > 0 ? Math.round(6 + precipitationIntensity * 32) : 0;
  const pickDropLane = (randomValue: number, jitterValue: number) => {
    let weightedHourIndex = Math.floor(randomValue * precipitationHours.length);

    if (precipitationWeightTotal > 0) {
      let cursor = randomValue * precipitationWeightTotal;
      weightedHourIndex = precipitationWeights.findIndex((weight) => {
        cursor -= weight;
        return cursor <= 0;
      });
      /* v8 ignore next 3 -- Math.random is always below 1; this is a defensive fallback. */
      if (weightedHourIndex < 0) {
        weightedHourIndex = precipitationWeights.length - 1;
      }
    }

    const hourWidth = 100 / Math.max(precipitationHours.length, 1);
    const hourCenter = weightedHourIndex * hourWidth + hourWidth / 2;
    return clamp(hourCenter + (jitterValue - 0.5) * hourWidth * 0.72, 3, 97);
  };

  const rainDrops = Array.from({ length: dropCount }, (_, index) => {
    const randomUnit = (seed: number) => {
      const value = Math.sin(seed * 12.9898 + currentProbability * 78.233) * 43758.5453;
      return value - Math.floor(value);
    };
    const dropSeed = index + randomUnit(index + 97) * 1000;
    const spread = pickDropLane(randomUnit(dropSeed + 5), randomUnit(dropSeed + 9));
    const start = -36 - ((index * 29) % 140);

    return {
      id: index,
      style: {
        "--drop-left": `${spread}%`,
        "--drop-start": `${start - randomUnit(dropSeed + 11) * 60}px`,
        "--drop-end": `${210 + randomUnit(dropSeed + 19) * 96}px`,
        "--drop-delay": `${-(randomUnit(dropSeed + 29) * 4.5)}s`,
        "--drop-duration": `${0.95 + randomUnit(dropSeed + 37) * 0.48}s`,
        "--drop-height": `${16 + randomUnit(dropSeed + 43) * 28}px`,
        "--drop-opacity": `${
          0.14 + precipitationIntensity * 0.34 + randomUnit(dropSeed + 53) * 0.16
        }`,
      } as WeatherCssProperties,
    };
  });

  return (
    <section className="instrument precipitation-instrument" aria-labelledby="precipitation-title">
      <div className="instrument-heading">
        <CloudRain aria-hidden="true" size={20} />
        <span>Precipitation</span>
      </div>
      <h3 id="precipitation-title">
        {peak === undefined ? "--" : `${peak}% chance next 12 hours`}
      </h3>
      <div className="precipitation-scene" aria-hidden="true">
        {rainDrops.map((drop) => (
          <span
            className="precipitation-drop"
            key={drop.id}
            onAnimationIteration={(event) => {
              event.currentTarget.style.setProperty(
                "--drop-left",
                `${pickDropLane(Math.random(), Math.random())}%`,
              );
            }}
            style={drop.style}
          />
        ))}
      </div>
      <ol className="precipitation-bars" aria-label="Hourly precipitation probability">
        {weather.hourly.slice(0, 8).map((point) => {
          const probability = point.precipitationProbability;
          const roundedProbability =
            probability === undefined ? undefined : Math.round(probability);
          const height = clamp(((roundedProbability ?? 0) / chartMax) * 100, 4, 100);

          return (
            <li
              key={point.time}
              style={{ "--hourly-precipitation-height": `${height}%` } as WeatherCssProperties}
            >
              <span>
                <strong>
                  {roundedProbability === undefined ? "--" : `${roundedProbability}%`}
                </strong>
              </span>
              <time>{formatTime(point.time)}</time>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

import { type TouchEvent, useRef, useState } from "react";
import type { NormalizedWeatherResponse } from "@jetstream-weather/domain";
import { ForecastPanel } from "./dashboard/ForecastPanel";
import { MorningBrief } from "./dashboard/MorningBrief";
import { WeatherHero } from "./dashboard/WeatherHero";
import { HourlyTimeline } from "./dashboard/HourlyTimeline";
import { MetricRail } from "./dashboard/MetricRail";
import { AtmosphereInstrument } from "./dashboard/instruments/AtmosphereInstrument";
import { DaylightInstrument } from "./dashboard/instruments/DaylightInstrument";
import { PrecipitationInstrument } from "./dashboard/instruments/PrecipitationInstrument";
import { WindInstrument } from "./dashboard/instruments/WindInstrument";
import type { WeatherCssProperties } from "./dashboard/types";
import { clamp, daylightProgress, precipitationPeak, windFlowRotation } from "./dashboard/weatherUtils";

export interface WeatherDashboardProps {
  weather: NormalizedWeatherResponse;
}

export function WeatherDashboard({ weather }: WeatherDashboardProps) {
  const [view, setView] = useState<"now" | "details" | "week">("now");
  const [transitionDirection, setTransitionDirection] = useState<"forward" | "back">(
    "forward",
  );
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const peakPrecipitation = precipitationPeak(weather.hourly);
  const daylight = daylightProgress(weather);
  const windSpeed = weather.current.windSpeed ?? 0;
  const weatherStyle: WeatherCssProperties = {
    "--wind-flow-rotation": `${windFlowRotation(weather.current.windDirection)}deg`,
    "--wind-strength": clamp(windSpeed / 35, 0.25, 1.4),
    "--humidity": `${weather.current.humidity ?? 0}%`,
    "--cloud-cover": `${weather.current.cloudCover ?? 0}%`,
    "--precipitation": `${peakPrecipitation}%`,
    "--precipitation-level": peakPrecipitation,
    "--precipitation-alpha": clamp((peakPrecipitation + 22) / 122, 0.18, 1),
    "--daylight": `${daylight ?? 50}%`,
  };
  const viewItems = [
    { id: "now", index: "01", label: "Now" },
    { id: "details", index: "02", label: "Details" },
    { id: "week", index: "03", label: "Week" },
  ] as const;

  function changeView(nextView: typeof view) {
    const currentIndex = viewItems.findIndex((item) => item.id === view);
    const nextIndex = viewItems.findIndex((item) => item.id === nextView);
    setTransitionDirection(nextIndex >= currentIndex ? "forward" : "back");
    setView(nextView);
  }

  function handleTouchStart(event: TouchEvent<HTMLDivElement>) {
    if ((event.target as HTMLElement).closest(".hourly-timeline ol")) {
      touchStart.current = null;
      return;
    }

    const touch = event.touches[0];
    touchStart.current = touch ? { x: touch.clientX, y: touch.clientY } : null;
  }

  function handleTouchEnd(event: TouchEvent<HTMLDivElement>) {
    const start = touchStart.current;
    const touch = event.changedTouches[0];
    touchStart.current = null;

    if (!start || !touch) {
      return;
    }

    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;

    if (Math.abs(deltaX) < 56 || Math.abs(deltaX) < Math.abs(deltaY) * 1.25) {
      return;
    }

    const currentIndex = viewItems.findIndex((item) => item.id === view);
    const nextIndex = deltaX < 0 ? currentIndex + 1 : currentIndex - 1;
    const nextView = viewItems[nextIndex];

    if (nextView) {
      changeView(nextView.id);
    }
  }

  return (
    <section
      className={`weather-experience condition-${weather.current.family} condition-${
        weather.current.isDay ? "day" : "night"
      }`}
      style={weatherStyle}
      aria-label="Weather dashboard"
    >
      <nav className="view-navigation" aria-label="Forecast views">
        {viewItems.map((item) => (
          <button
            type="button"
            key={item.id}
            aria-pressed={view === item.id}
            onClick={() => changeView(item.id)}
          >
            <span>{item.index}</span>
            <strong>{item.label}</strong>
          </button>
        ))}
      </nav>

      <div
        className={`view-stage is-${transitionDirection}`}
        key={view}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {view === "now" ? (
          <div className="now-view">
            <div className="now-overview">
              <WeatherHero weather={weather} />
              <MorningBrief insights={weather.insights} />
            </div>
            <MetricRail weather={weather} />
            <HourlyTimeline weather={weather} />
          </div>
        ) : null}

        {view === "details" ? (
          <section className="details-view" aria-label="Detailed conditions">
            <div className="weather-instruments">
              <WindInstrument weather={weather} />
              <PrecipitationInstrument weather={weather} />
              <AtmosphereInstrument weather={weather} />
              <DaylightInstrument weather={weather} daylight={daylight} />
            </div>
          </section>
        ) : null}

        {view === "week" ? (
          <section className="week-view" aria-label="Weekly forecast">
            <ForecastPanel weather={weather} />
          </section>
        ) : null}
      </div>
    </section>
  );
}

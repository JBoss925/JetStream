import { Clock, Sun, Sunrise, Sunset } from "lucide-react";
import type { NormalizedWeatherResponse } from "@jetstream-weather/domain";
import { daylightCountdown, formatTime, formatUvIndex } from "../weatherUtils";

interface DaylightInstrumentProps {
  weather: NormalizedWeatherResponse;
  daylight: number | null;
}

export function DaylightInstrument({ weather, daylight }: DaylightInstrumentProps) {
  const sunrise = weather.daily[0]?.sunrise;
  const sunset = weather.daily[0]?.sunset;
  const uvIndex = weather.daily[0]?.uvIndexMax ?? weather.current.uvIndex;
  const daylightPercent = daylight ?? 50;
  const daylightAngle = Math.PI - (daylightPercent / 100) * Math.PI;
  const daylightMarker = {
    x: 120 + 100 * Math.cos(daylightAngle),
    y: 112 - 100 * Math.sin(daylightAngle),
  };
  const remainingDaylight = daylightCountdown(weather.current.observedAt, sunrise, sunset);

  return (
    <section className="instrument daylight-instrument" aria-labelledby="daylight-title">
      <div className="instrument-heading">
        <Sunrise aria-hidden="true" size={20} />
        <span>Daylight</span>
      </div>
      <h3 id="daylight-title">
        {sunrise && sunset ? `${formatTime(sunrise)} - ${formatTime(sunset)}` : "--"}
      </h3>
      <div className="daylight-arc" aria-hidden="true">
        <svg viewBox="0 0 240 128" role="img">
          <path className="daylight-path" d="M 20 112 A 100 100 0 0 1 220 112" pathLength="100" />
          <path
            className="daylight-fill"
            d="M 20 112 A 100 100 0 0 1 220 112"
            pathLength="100"
            strokeDasharray={`${daylightPercent} 100`}
          />
          <circle className="daylight-marker" cx={daylightMarker.x} cy={daylightMarker.y} r="10" />
        </svg>
      </div>
      <dl className="instrument-readouts">
        <div>
          <dt>
            <Sunrise aria-hidden="true" size={16} /> Sunrise
          </dt>
          <dd>{sunrise ? formatTime(sunrise) : "--"}</dd>
        </div>
        <div>
          <dt>
            <Sunset aria-hidden="true" size={16} /> Sunset
          </dt>
          <dd>{sunset ? formatTime(sunset) : "--"}</dd>
        </div>
        <div>
          <dt>
            <Clock aria-hidden="true" size={16} /> Remaining daylight
          </dt>
          <dd>{remainingDaylight}</dd>
        </div>
        <div>
          <dt>
            <Sun aria-hidden="true" size={16} /> UV index
          </dt>
          <dd>{formatUvIndex(uvIndex)}</dd>
        </div>
      </dl>
    </section>
  );
}

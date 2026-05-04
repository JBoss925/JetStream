import type { WeatherInsight } from "@jetstream-weather/domain";
import { insightIcon } from "./weatherIcons";

interface MorningBriefProps {
  insights: WeatherInsight[];
}

export function MorningBrief({ insights }: MorningBriefProps) {
  return (
    <section className="morning-brief" aria-labelledby="brief-title">
      <div className="section-kicker">
        <span>Morning brief</span>
        <small>Daily insights</small>
      </div>
      <h3 id="brief-title">What matters right now</h3>
      <div className="brief-lines">
        {insights.map((insight) => (
          <article className={`brief-line brief-${insight.severity}`} key={insight.id}>
            <span className="brief-icon">{insightIcon(insight)}</span>
            <div>
              <h4>{insight.title}</h4>
              <p>{insight.message}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

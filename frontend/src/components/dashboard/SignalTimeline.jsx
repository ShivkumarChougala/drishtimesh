import { useEffect, useState } from "react";
import { getDashboardTimeline } from "../../api/dashboard";

function formatBucket(value, hours) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  if (hours > 24) {
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  }

  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
}

function windowLabel(hours) {
  if (hours === 6) return "past 6 hours";
  if (hours === 24) return "past 24 hours";
  if (hours === 168) return "past 7 days";

  return `past ${hours} hours`;
}

export default function SignalTimeline({ hours = 24 }) {
  const [timeline, setTimeline] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    async function loadTimeline() {
      try {
        setStatus("loading");

        const data = await getDashboardTimeline(hours);

        setTimeline(data.results || []);
        setStatus("ready");
      } catch {
        setStatus("error");
      }
    }

    loadTimeline();
  }, [hours]);

  const activeTimeline = timeline.filter(
    (item) => Number(item.signals || 0) > 0
  );

  const displayTimeline =
    activeTimeline.length > 0 ? activeTimeline : timeline;

  const maxSignals = Math.max(
    ...displayTimeline.map((item) => Number(item.signals || 0)),
    1
  );

  const totalSignals = timeline.reduce(
    (sum, item) => sum + Number(item.signals || 0),
    0
  );

  const activeBuckets = activeTimeline.length;

  if (status === "loading") {
    return (
      <section className="overview-telemetry-frame">
        <div className="overview-chart-state">
          Loading signal activity...
        </div>
      </section>
    );
  }

  if (status === "error") {
    return (
      <section className="overview-telemetry-frame">
        <div className="overview-chart-state overview-chart-error">
          Unable to load signal activity.
        </div>
      </section>
    );
  }

  if (timeline.length === 0 || totalSignals === 0) {
    return (
      <section className="overview-telemetry-frame overview-telemetry-empty">
        <div className="overview-grid-lines" />

        <div className="overview-chart-empty">
          <strong>No activity in this window</strong>
          <span>
            No signals were observed during the {windowLabel(hours)}.
          </span>
        </div>

        <div className="overview-axis">
          <span>{hours === 168 ? "7 days ago" : `${hours}h ago`}</span>
          <span>Now</span>
        </div>
      </section>
    );
  }

  return (
    <section className="overview-telemetry-frame">
      <div className="overview-chart-meta">
        <span>
          <strong>{totalSignals.toLocaleString()}</strong> signals
        </span>

        <span>
          {activeBuckets} active intervals · peak {maxSignals.toLocaleString()}
        </span>
      </div>

      <div className="timeline-chart overview-timeline-chart">
        {displayTimeline.map((item, index) => {
          const signals = Number(item.signals || 0);

          const height =
            signals === 0
              ? 3
              : Math.max((signals / maxSignals) * 150, 10);

          return (
            <div
              className="timeline-bar-wrap"
              key={`${item.bucket}-${index}`}
            >
              <div
                className={
                  signals > 0
                    ? "timeline-bar"
                    : "timeline-bar empty"
                }
                title={`${signals} signals · ${formatBucket(
                  item.bucket,
                  hours
                )}`}
                style={{ height: `${height}px` }}
              />

              <small>{formatBucket(item.bucket, hours)}</small>
            </div>
          );
        })}
      </div>
    </section>
  );
}

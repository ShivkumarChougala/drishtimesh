import { useEffect, useState } from "react";
import { getDashboardTimeline } from "../../api/dashboard";

const ranges = [
  { label: "6h", value: 6 },
  { label: "12h", value: 12 },
  { label: "24h", value: 24 },
  { label: "7d", value: 168 },
];

function formatBucket(value, hours) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  if (hours > 24) {
    return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  }

  return date.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
}

export default function SignalTimeline() {
  const [timeline, setTimeline] = useState([]);
  const [hours, setHours] = useState(24);
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

  const activeTimeline = timeline.filter((item) => Number(item.signals || 0) > 0);
  const displayTimeline = activeTimeline.length > 0 ? activeTimeline : timeline;

  const maxSignals = Math.max(...displayTimeline.map((x) => Number(x.signals || 0)), 1);
  const totalSignals = timeline.reduce((sum, item) => sum + Number(item.signals || 0), 0);
  const activeBuckets = activeTimeline.length;

  return (
    <section className="dash-panel timeline-panel enterprise-timeline">
      <div className="timeline-top">
        <div>
          <span className="timeline-kicker">Telemetry</span>
          <h2>Signal Activity</h2>
          <p className="dash-muted">Attack signal volume across the selected time window.</p>
        </div>

        <div className="timeline-actions">
          <div className="timeline-summary">
            <strong>{totalSignals}</strong>
            <span>total signals</span>
          </div>

          <div className="range-tabs">
            {ranges.map((range) => (
              <button
                key={range.value}
                className={hours === range.value ? "active" : ""}
                onClick={() => setHours(range.value)}
              >
                {range.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {status === "loading" && <p className="dash-muted">Loading timeline...</p>}
      {status === "error" && <p className="dash-muted">Failed to load timeline.</p>}

      {status === "ready" && timeline.length === 0 && (
        <div className="empty-state">
          <strong>No timeline data yet</strong>
          <p className="dash-muted">Deploy a sensor and signals will appear here.</p>
        </div>
      )}

      {status === "ready" && timeline.length > 0 && totalSignals === 0 && (
        <div className="empty-state">
          <strong>No signals in this window</strong>
          <p className="dash-muted">Try 24h or 7d to view older activity.</p>
        </div>
      )}

      {status === "ready" && timeline.length > 0 && totalSignals > 0 && (
        <>
          <div className="timeline-meta">
            <span>{activeBuckets} active buckets</span>
            <span>Peak {maxSignals}</span>
          </div>

          <div className="timeline-chart">
            {displayTimeline.map((item, index) => {
              const signals = Number(item.signals || 0);
              const height = signals === 0 ? 4 : Math.max((signals / maxSignals) * 180, 14);

              return (
                <div className="timeline-bar-wrap" key={`${item.bucket}-${index}`}>
                  <div className={signals > 0 ? "timeline-value" : "timeline-value muted"}>
                    {signals > 0 ? signals : ""}
                  </div>

                  <div
                    className={signals > 0 ? "timeline-bar" : "timeline-bar empty"}
                    title={`${signals} signals`}
                    style={{ height: `${height}px` }}
                  />

                  <small>{formatBucket(item.bucket, hours)}</small>
                </div>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}

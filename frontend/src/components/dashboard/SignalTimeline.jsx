import { useEffect, useState } from "react";
import { getDashboardTimeline } from "../../api/dashboard";

const ranges = [
  { label: "6h", value: 6 },
  { label: "12h", value: 12 },
  { label: "24h", value: 24 },
  { label: "7d", value: 168 },
];

function formatBucket(value, hours) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  if (hours > 24) {
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    });
  }

  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
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

  const maxSignals = Math.max(
    ...timeline.map((x) => Number(x.signals || 0)),
    1
  );

  return (
    <section className="dash-panel timeline-panel">
      <div className="timeline-top">
        <div>
          <h2>Signal Volume Timeline</h2>
          <p className="dash-muted">
            Real attack signal activity across the selected window.
          </p>
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

      {status === "loading" && <p className="dash-muted">Loading timeline...</p>}
      {status === "error" && <p className="dash-muted">Failed to load timeline.</p>}

      {status === "ready" && timeline.length === 0 && (
        <div className="empty-state">
          <strong>No timeline data yet</strong>
          <p className="dash-muted">Deploy a sensor and signals will appear here.</p>
        </div>
      )}

      {status === "ready" && timeline.length > 0 && (
        <div className="timeline-chart">
          {timeline.map((item, index) => {
            const signals = Number(item.signals || 0);
            const height = Math.max((signals / maxSignals) * 210, 18);

            return (
              <div className="timeline-bar-wrap" key={`${item.bucket}-${index}`}>
                <div className="timeline-value">{signals}</div>

                <div
                  className="timeline-bar"
                  title={`${signals} signals`}
                  style={{ height: `${height}px` }}
                />

                <small>{formatBucket(item.bucket, hours)}</small>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

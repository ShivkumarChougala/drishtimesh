import { useEffect, useState } from "react";
import { getDashboardTimeline } from "../../api/dashboard";

export default function SignalTimeline() {
  const [timeline, setTimeline] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    async function loadTimeline() {
      try {
        const data = await getDashboardTimeline(24);
        setTimeline(data.results || []);
        setStatus("ready");
      } catch {
        setStatus("error");
      }
    }

    loadTimeline();
  }, []);

  const maxSignals = Math.max(...timeline.map((x) => Number(x.signals || 0)), 10);

  return (
    <section className="dash-panel">
      <h2>Signal Volume Timeline</h2>
      <p className="dash-muted">Real attack signal activity over the last 24 hours.</p>

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
            const height = Math.max((Number(item.signals || 0) / maxSignals) * 220, 8);

            return (
              <div className="timeline-bar-wrap" key={index}>
                <div className="timeline-bar" style={{ height: `${height}px` }} />
                <span className="timeline-value">{item.signals}</span>
                <small>{new Date(item.bucket).getHours()}:00</small>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

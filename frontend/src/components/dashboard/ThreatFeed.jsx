import { useEffect, useState } from "react";
import { getDashboardLiveEvents } from "../../api/dashboard";

function formatTime(value) {
  if (!value) return "unknown";
  try {
    return new Date(value).toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return value;
  }
}

function normalizeVerdict(value) {
  return String(value || "unknown").toLowerCase().replaceAll("_", "-");
}

export default function ThreatFeed({ hours = 24 }) {
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState("loading");
  const [lastUpdated, setLastUpdated] = useState(null);

  async function loadEvents(silent = false) {
    try {
      if (!silent) setStatus("loading");

      const data = await getDashboardLiveEvents(20, hours);
      setEvents(data.results || []);
      setLastUpdated(new Date());
      setStatus("ready");
    } catch {
      if (!silent) setStatus("error");
    }
  }

  useEffect(() => {
    loadEvents();

    const timer = setInterval(() => {
      loadEvents(true);
    }, 10000);

    return () => clearInterval(timer);
  }, [hours]);

  return (
    <section className="dash-panel threat-feed-panel">
      <div className="feed-head">
        <div>
          <span className="timeline-kicker">Signals</span>
          <h2>Live Threat Feed</h2>
          <p className="dash-muted">
            Latest observed activity from your deployed sensors.
          </p>
          {lastUpdated && (
            <small className="feed-updated">
              Updated {lastUpdated.toLocaleTimeString()}
            </small>
          )}
        </div>

        <span className="live-pill">Live</span>
      </div>

      {status === "loading" && <p className="dash-muted">Loading threat feed...</p>}
      {status === "error" && <p className="dash-muted">Failed to load threat feed.</p>}

      {status === "ready" && events.length === 0 && (
        <div className="empty-state">
          <strong>No threat activity yet</strong>
          <p className="dash-muted">
            Deploy a sensor and incoming signals will appear here.
          </p>
        </div>
      )}

      {status === "ready" && events.length > 0 && (
        <div className="threat-table-wrap">
          <table className="threat-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Source IP</th>
                <th>Signal</th>
                <th>Sensor</th>
                <th>Verdict</th>
                <th>Score</th>
              </tr>
            </thead>

            <tbody>
              {events.map((event, index) => {
                const verdict = event.verdict || event.severity || "unknown";
                const verdictClass = normalizeVerdict(verdict);

                return (
                  <tr key={`${event.src_ip}-${event.observed_at}-${index}`}>
                    <td>{formatTime(event.observed_at)}</td>
                    <td>
                      <strong className="threat-ip">{event.src_ip || "unknown"}</strong>
                    </td>
                    <td>{event.signal_type || "unknown"}</td>
                    <td>{event.sensor || "sensor"}</td>
                    <td>
                      <span className={`risk-badge ${verdictClass}`}>
                        {verdict}
                      </span>
                    </td>
                    <td>{event.score ?? event.confidence ?? 0}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

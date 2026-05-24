import { useEffect, useState } from "react";
import { getDashboardLiveEvents } from "../../api/dashboard";

function formatTime(value) {
  if (!value) return "unknown";

  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function normalizeVerdict(value) {
  return String(value || "unknown").toLowerCase().replaceAll("_", "-");
}

export default function ThreatFeed() {
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    async function loadEvents() {
      try {
        const data = await getDashboardLiveEvents(12);
        setEvents(data.results || []);
        setStatus("ready");
      } catch {
        setStatus("error");
      }
    }

    loadEvents();
  }, []);

  return (
    <section className="dash-panel threat-feed-panel">
      <div className="feed-head">
        <div>
          <h2>Live Threat Feed</h2>
          <p className="dash-muted">Latest signals from your deployed sensors.</p>
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
        <div className="threat-list">
          {events.map((event, index) => {
            const verdictClass = normalizeVerdict(event.verdict || event.severity);

            return (
              <div className="threat-item" key={`${event.src_ip}-${index}`}>
                <div>
                  <strong>{event.src_ip}</strong>
                  <p>
                    {event.signal_type} · {event.sensor}
                  </p>
                  <small>{formatTime(event.observed_at)}</small>
                </div>

                <div className="threat-right">
                  <span className={`risk-badge ${verdictClass}`}>
                    {event.verdict || event.severity || "unknown"}
                  </span>
                  <small>score {event.score ?? event.confidence ?? 0}</small>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

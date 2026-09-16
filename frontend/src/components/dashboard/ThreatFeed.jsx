import { useEffect, useState } from "react";
import { getDashboardLiveEvents } from "../../api/dashboard";

function formatTime(value) {
  if (!value) return "—";

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
  return String(value || "unknown")
    .toLowerCase()
    .replaceAll("_", "-")
    .replaceAll(" ", "-");
}

export default function ThreatFeed({ hours = 24 }) {
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState("loading");

  async function loadEvents(silent = false) {
    try {
      if (!silent) setStatus("loading");

      const data = await getDashboardLiveEvents(8, hours);
      setEvents(data.results || []);
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
    <section className="overview-feed">
      <div className="overview-section-head">
        <div>
          <span className="overview-section-label">Recent signals</span>
          <h2>Latest activity</h2>
        </div>

        <button type="button" className="overview-text-action">
          View all signals →
        </button>
      </div>

      {status === "loading" && (
        <div className="overview-empty">Loading recent activity...</div>
      )}

      {status === "error" && (
        <div className="overview-empty">Unable to load recent activity.</div>
      )}

      {status === "ready" && events.length === 0 && (
        <div className="overview-empty">
          <strong>No signals in this window</strong>
          <span>Incoming sensor activity will appear here.</span>
        </div>
      )}

      {status === "ready" && events.length > 0 && (
        <div className="overview-table-wrap">
          <table className="overview-table">
            <thead>
              <tr>
                <th>Time</th>
                <th>Source IP</th>
                <th>Event</th>
                <th>Sensor</th>
                <th>Verdict</th>
              </tr>
            </thead>

            <tbody>
              {events.map((event, index) => {
                const verdict = event.verdict || event.severity || "unknown";
                const verdictClass = normalizeVerdict(verdict);

                return (
                  <tr key={`${event.src_ip}-${event.observed_at}-${index}`}>
                    <td className="overview-time">
                      {formatTime(event.observed_at)}
                    </td>

                    <td>
                      {event.src_ip ? (
                        <button
                          type="button"
                          className="overview-ip"
                          onClick={() =>
                            window.open(
                              `/lookup?ip=${encodeURIComponent(event.src_ip)}`,
                              "_blank"
                            )
                          }
                        >
                          {event.src_ip}
                        </button>
                      ) : (
                        "—"
                      )}
                    </td>

                    <td>{event.signal_type || "unknown"}</td>
                    <td>{event.sensor || "sensor"}</td>

                    <td>
                      <span
                        className={`overview-verdict overview-verdict-${verdictClass}`}
                      >
                        {verdict}
                      </span>
                    </td>
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

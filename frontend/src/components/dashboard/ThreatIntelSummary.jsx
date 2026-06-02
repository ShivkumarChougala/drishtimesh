import { useEffect, useState } from "react";
import { getDashboardLiveEvents } from "../../api/dashboard";

function countTop(items, key, limit = 5) {
  const counts = new Map();

  items.forEach((item) => {
    const value = item[key] || "unknown";
    counts.set(value, (counts.get(value) || 0) + 1);
  });

  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);
}

export default function ThreatIntelSummary() {
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    async function loadIntel() {
      try {
        const data = await getDashboardLiveEvents(50);
        setEvents(data.results || []);
        setStatus("ready");
      } catch {
        setStatus("error");
      }
    }

    loadIntel();
  }, []);

  const maliciousIps = countTop(
    events.filter((e) =>
      String(e.verdict || e.severity || "").toLowerCase().includes("malicious")
    ),
    "src_ip"
  );

  const topSignals = countTop(events, "signal_type");
  const topSensors = countTop(events, "sensor");

  return (
    <section className="intel-grid">
      <div className="intel-card">
        <div>
          <span className="timeline-kicker">Intel</span>
          <h3>Top Malicious IPs</h3>
        </div>

        {status === "loading" && <p className="dash-muted">Loading...</p>}
        {status === "error" && <p className="dash-muted">Failed to load.</p>}

        {status === "ready" && maliciousIps.length === 0 && (
          <p className="dash-muted">No malicious IPs in recent feed.</p>
        )}

        {maliciousIps.map(([ip, count]) => (
          <div className="intel-row" key={ip}>
            <strong>{ip}</strong>
            <span>{count} hits</span>
          </div>
        ))}
      </div>

      <div className="intel-card">
        <div>
          <span className="timeline-kicker">Signals</span>
          <h3>Top Signal Types</h3>
        </div>

        {status === "ready" && topSignals.length === 0 && (
          <p className="dash-muted">No signal activity yet.</p>
        )}

        {topSignals.map(([signal, count]) => (
          <div className="intel-row" key={signal}>
            <strong>{signal}</strong>
            <span>{count}</span>
          </div>
        ))}
      </div>

      <div className="intel-card">
        <div>
          <span className="timeline-kicker">Sensors</span>
          <h3>Most Active Sensors</h3>
        </div>

        {status === "ready" && topSensors.length === 0 && (
          <p className="dash-muted">No active sensors yet.</p>
        )}

        {topSensors.map(([sensor, count]) => (
          <div className="intel-row" key={sensor}>
            <strong>{sensor}</strong>
            <span>{count} events</span>
          </div>
        ))}
      </div>
    </section>
  );
}

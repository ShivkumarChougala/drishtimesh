import { useEffect, useRef, useState } from "react";
import { getRecentFeed } from "../api/relay";

function formatTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleString();
}

function normalizeSeverity(value) {
  if (!value) return "unknown";
  return String(value).toLowerCase();
}

function severityRank(value) {
  const severity = normalizeSeverity(value);
  if (severity === "critical") return 4;
  if (severity === "high") return 3;
  if (severity === "medium") return 2;
  if (severity === "low") return 1;
  return 0;
}

function getTime(item) {
  return (
    item.observed_at ||
    item.created_at ||
    item.timestamp ||
    item.time ||
    item.received_at ||
    item.last_seen ||
    item.first_seen ||
    null
  );
}

function getSourceIp(item) {
  return item.src_ip || item.source_ip || item.ip || "unknown";
}

function getSignal(item) {
  return item.signal_type || item.event_type || item.eventid || item.signal || "unknown";
}

function getSensor(item) {
  return item.sensor || item.sensor_type || "cowrie";
}

function signalLabel(signal) {
  const labels = {
    attack_chain_summary: "Attack chain",
    payload_upload: "Payload upload",
    destructive_command: "Destructive command",
    persistence_attempt: "Persistence",
    execution_attempt: "Execution",
    permission_change: "Permission change",
    ssh_bruteforce: "SSH brute force",
    interactive_access: "Interactive access",
  };

  return labels[signal] || String(signal).replaceAll("_", " ");
}

function activityTitle(item) {
  if (item.signals.includes("attack_chain_summary")) return "Critical activity chain";
  if (item.signals.includes("ssh_bruteforce")) return "SSH brute-force activity";
  if (item.signals.includes("destructive_command")) return "Destructive command activity";
  if (item.signals.includes("persistence_attempt")) return "Persistence behavior";
  return "Suspicious sensor activity";
}

function groupByIp(feed) {
  const groups = new Map();

  feed.forEach((item) => {
    const ip = getSourceIp(item);

    if (!groups.has(ip)) {
      groups.set(ip, {
        src_ip: ip,
        sensor: getSensor(item),
        severity: normalizeSeverity(item.severity),
        time: getTime(item),
        signals: [],
        eventCount: 0,
      });
    }

    const group = groups.get(ip);
    const signal = getSignal(item);

    if (!group.signals.includes(signal)) group.signals.push(signal);

    group.eventCount += 1;

    if (severityRank(item.severity) > severityRank(group.severity)) {
      group.severity = normalizeSeverity(item.severity);
    }

    const itemTime = getTime(item);
    if (itemTime && (!group.time || new Date(itemTime) > new Date(group.time))) {
      group.time = itemTime;
    }
  });

  return Array.from(groups.values()).slice(0, 5);
}

export default function RecentActivity() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("loading");
  const [lastUpdated, setLastUpdated] = useState(null);
  const previousIds = useRef(new Set());

  useEffect(() => {
    let active = true;

    async function loadFeed() {
      try {
        const data = await getRecentFeed();
        const feed = Array.isArray(data) ? data : data?.items || data?.signals || data?.results || [];

        if (!active) return;

        const nextItems = groupByIp(feed);
        const ids = new Set();

        const enhanced = nextItems.map((item) => {
          const id = `${item.src_ip}-${item.eventCount}-${item.severity}`;
          ids.add(id);

          return {
            ...item,
            __id: id,
            __new: !previousIds.current.has(id),
          };
        });

        previousIds.current = ids;
        setItems(enhanced);
        setStatus("ready");
        setLastUpdated(new Date());
      } catch (err) {
        console.error(err);
        if (!active) return;
        setStatus("error");
      }
    }

    loadFeed();
    const interval = setInterval(loadFeed, 10000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <section className="recent-activity">
      <div className="recent-head">
        <div>
          <div className="kicker">Recent mesh activity</div>
          <h2>Signals arriving from deployed sensors.</h2>
        </div>

        <span className={`feed-status ${status}`}>
          {status === "loading" && "Loading"}
          {status === "ready" && (lastUpdated ? `Live feed · ${lastUpdated.toLocaleTimeString()}` : "Live feed")}
          {status === "error" && "Feed unavailable"}
        </span>
      </div>

      <div className="activity-table">
        <div className="activity-table-head">
          <span>Source</span>
          <span>Activity</span>
          <span>Risk</span>
          <span>Events</span>
          <span>Sensor</span>
          <span>Last seen</span>
        </div>

        {items.map((item) => {
          const severity = normalizeSeverity(item.severity);

          return (
            <div className="activity-table-row" key={item.__id}>
              <div>
                <strong>{item.src_ip}</strong>
              </div>

              <div>
                <strong>{activityTitle(item)}</strong>
                <p>
                  {item.signals.slice(0, 3).map(signalLabel).join(" · ")}
                </p>
              </div>

              <div>
                <strong className={`severity-badge severity-${severity}`}>
                  {severity}
                </strong>
              </div>

              <div>
                <strong>{item.eventCount}</strong>
              </div>

              <div>
                <strong>{item.sensor}</strong>
              </div>

              <div>
                <span>{formatTime(item.time)}</span>
              </div>
            </div>
          );
        })}

        {items.length === 0 && status === "ready" && (
          <div className="activity-empty">No recent signals yet.</div>
        )}

        {status === "loading" && (
          <div className="activity-empty">Loading recent signals…</div>
        )}

        {status === "error" && (
          <div className="activity-empty error">Could not load recent activity from relay.</div>
        )}
      </div>
    </section>
  );
}

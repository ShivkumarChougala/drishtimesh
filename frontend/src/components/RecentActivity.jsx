import { useEffect, useRef, useState } from "react";
import { getRecentFeed } from "../api/relay";

function formatRelativeTime(value) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  const seconds = Math.max(
    0,
    Math.floor((Date.now() - date.getTime()) / 1000)
  );

  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function normalizeSeverity(value) {
  return String(value || "unknown").toLowerCase();
}

function signalLabel(value) {
  const signal = String(value || "unknown");

  const labels = {
    attack_chain_summary: "Attack chain",
    payload_upload: "Payload upload",
    destructive_command: "Destructive command",
    persistence_attempt: "Persistence attempt",
    execution_attempt: "Execution attempt",
    permission_change: "Permission change",
    ssh_bruteforce: "SSH brute force",
    interactive_access: "Interactive access",
    login_attempt: "Login attempt",
    command_input: "Command activity",
  };

  return (
    labels[signal] ||
    signal
      .replaceAll("_", " ")
      .replace(/\b\w/g, (char) => char.toUpperCase())
  );
}

function reputationLabel(item) {
  if (item.verdict) {
    return String(item.verdict)
      .replaceAll("_", " ")
      .replace(/\b\w/g, (char) => char.toUpperCase());
  }

  if (item.score !== null && item.score !== undefined) {
    return `Score ${item.score}`;
  }

  return "Unclassified";
}

export default function RecentActivity() {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState("loading");
  const [lastUpdated, setLastUpdated] = useState(null);

  const previousIds = useRef(new Set());
  const hasLoadedOnce = useRef(false);

  useEffect(() => {
    let active = true;

    async function loadFeed() {
      try {
        const data = await getRecentFeed();

        const feed = Array.isArray(data)
          ? data
          : data?.results || data?.items || data?.signals || [];

        if (!active) return;

        const ids = new Set();

        const nextItems = feed.slice(0, 8).map((item, index) => {
          const id = [
            item.src_ip,
            item.signal_type,
            item.eventid,
            item.observed_at,
            index,
          ].join("-");

          ids.add(id);

          return {
            ...item,
            __id: id,
            __new:
          hasLoadedOnce.current &&
          !previousIds.current.has(id),
          };
        });

        previousIds.current = ids;
      hasLoadedOnce.current = true;

        setItems(nextItems);
        setStatus("ready");
        setLastUpdated(new Date());
      } catch (error) {
        console.error("Unable to load recent mesh activity:", error);

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
    <section id="recent-activity" className="recent-activity recent-activity-v2">
      <div className="recent-head">
        <div>
          <span className="section-kicker">Recent activity</span>
          <h2>Signals observed across the mesh.</h2>
        </div>

        <div className={`recent-feed-state ${status}`}>
          <span className="recent-feed-dot" />

          <span>
            {status === "loading" && "Connecting"}
            {status === "ready" && "Live"}
            {status === "error" && "Unavailable"}
          </span>
        </div>
      </div>

      <div className="recent-stream">
        <div className="recent-stream-head">
          <span>Source</span>
          <span>Signal</span>
          <span>Reputation</span>
          <span>Sensor</span>
          <span>Observed</span>
        </div>

        {status === "loading" && (
          <div className="recent-stream-state">
            Loading recent signals...
          </div>
        )}

        {status === "error" && (
          <div className="recent-stream-state recent-stream-error">
            Recent activity is temporarily unavailable.
          </div>
        )}

        {status === "ready" && items.length === 0 && (
          <div className="recent-stream-state">
            No recent signals observed.
          </div>
        )}

        {status === "ready" &&
          items.map((item) => {
            const severity = normalizeSeverity(item.severity);

            return (
              <div
                className={`recent-stream-row ${
                  item.__new ? "recent-stream-new" : ""
                }`}
                key={item.__id}
              >
                <div className="recent-source">
                  <strong>{item.src_ip || "Unknown"}</strong>
                </div>

                <div className="recent-signal">
                  <strong>{signalLabel(item.signal_type)}</strong>

                  <span className={`recent-severity severity-${severity}`}>
                    {severity}
                  </span>
                </div>

                <div className="recent-reputation">
                  <span>{reputationLabel(item)}</span>

                  {item.observed_by_nodes > 1 && (
                    <small>
                      {item.observed_by_nodes} sensors
                    </small>
                  )}
                </div>

                <div className="recent-sensor">
                  {item.sensor || "Unknown"}
                </div>

                <time dateTime={item.observed_at || undefined}>
                  {formatRelativeTime(item.observed_at)}
                </time>
              </div>
            );
          })}
      </div>

      {status === "ready" && (
        <div className="recent-stream-footer">
          <span>
            Showing latest {items.length} mesh signals
          </span>

          {lastUpdated && (
            <span>
              Updated {lastUpdated.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
        </div>
      )}
    </section>
  );
}

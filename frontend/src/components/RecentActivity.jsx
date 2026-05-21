import { useEffect, useRef, useState } from "react";
import { getRecentFeed } from "../api/relay";

function formatTime(value) {
  if (!value) return "unknown";

  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

function normalizeSeverity(value) {
  if (!value) return "unknown";
  return String(value).toLowerCase();
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

        const feed = Array.isArray(data)
          ? data
          : data?.items || data?.signals || data?.results || [];

        if (!active) return;

        const nextItems = feed.slice(0, 6);

        const ids = new Set();

        const enhanced = nextItems.map((item, index) => {
          const id =
            item.id ||
            item.signal_id ||
            `${item.src_ip}-${item.timestamp}-${index}`;

          ids.add(id);

          const isNew = !previousIds.current.has(id);

          return {
            ...item,
            __id: id,
            __new: isNew,
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

          {status === "ready" &&
            (lastUpdated
              ? `Live feed · ${lastUpdated.toLocaleTimeString()}`
              : "Live feed")}

          {status === "error" && "Feed unavailable"}
        </span>
      </div>

      <div className="activity-list">
        {items.length === 0 && status === "ready" ? (
          <div className="activity-empty">
            No recent signals yet.
          </div>
        ) : (
          items.map((item) => {
            const severity = normalizeSeverity(item.severity);

            return (
              <div
                className={`activity-row ${item.__new ? "activity-new" : ""}`}
                key={item.__id}
              >
                <div>
                  <span>Source IP</span>
                  <strong>{item.src_ip || item.ip || "unknown"}</strong>
                </div>

                <div>
                  <span>Signal</span>
                  <strong>
                    {item.signal_type ||
                      item.event_type ||
                      item.eventid ||
                      "unknown"}
                  </strong>
                </div>

                <div>
                  <span>Severity</span>

                  <strong
                    className={`severity-badge severity-${severity}`}
                  >
                    {severity}
                  </strong>
                </div>

                <div>
                  <span>Sensor</span>
                  <strong>
                    {item.sensor ||
                      item.sensor_type ||
                      "cowrie"}
                  </strong>
                </div>

                <div>
                  <span>Time</span>

                  <strong>
                    {formatTime(
                      item.created_at ||
                      item.timestamp ||
                      item.time
                    )}
                  </strong>
                </div>
              </div>
            );
          })
        )}

        {status === "loading" && (
          <div className="activity-empty">
            Loading recent signals…
          </div>
        )}

        {status === "error" && (
          <div className="activity-empty error">
            Could not load recent activity from relay.
          </div>
        )}
      </div>
    </section>
  );
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getNodeContributions } from "../api/relay";

function formatLastSeen(value) {
  if (!value) return "No heartbeat";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";

  const diff = Math.max(0, Date.now() - date.getTime());
  const mins = Math.floor(diff / 60000);

  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;

  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function locationLabel(node) {
  const parts = [
    node.region,
    node.provider,
  ].filter(Boolean);

  return parts.length ? parts.join(" · ") : "Unknown location";
}

export default function CommunityContributions() {
  const navigate = useNavigate();

  const [nodes, setNodes] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const data = await getNodeContributions();

        if (!active) return;

        const contributors = (data.results || []).filter(
          (node) =>
            node.contributor_name &&
            node.contributor_name !== "Community contributor"
        );

        setNodes(contributors);
        setStatus("ready");
      } catch (error) {
        console.error("Unable to load community contributors:", error);

        if (!active) return;
        setStatus("error");
      }
    }

    load();

    const interval = setInterval(load, 30000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const onlineCount = nodes.filter(
    (node) => node.status === "online"
  ).length;

  function handleDeploy() {
    navigate("/login");
  }

  return (
    <section id="community-mesh" className="community-live community-mesh-v2">
      <div className="community-mesh-head">
        <div>
          <span className="section-kicker">Community mesh</span>

          <h2>Built by sensors operated by the community.</h2>
        </div>

        <div
          className={`community-online-count ${
            onlineCount === 0 ? "inactive" : ""
          }`}
        >
          <span className="community-online-dot" />

          <span>
            {onlineCount} {onlineCount === 1 ? "sensor" : "sensors"} online
          </span>
        </div>
      </div>

      <div className="community-mesh-table">
        <div className="community-mesh-table-head">
          <span>#</span>
          <span>Contributor</span>
          <span>Sensor / region</span>
          <span>Contribution</span>
          <span>Status</span>
        </div>

        {status === "loading" && (
          <div className="community-mesh-state">
            Loading community mesh...
          </div>
        )}

        {status === "error" && (
          <div className="community-mesh-state community-mesh-error">
            Community mesh is temporarily unavailable.
          </div>
        )}

        {status === "ready" && nodes.length === 0 && (
          <div className="community-mesh-state">
            No community contributors yet.
          </div>
        )}

        {status === "ready" &&
          nodes.map((node, index) => {
            const isOnline = node.status === "online";

            return (
              <div className="community-mesh-row" key={node.node_id}>
                <div className="community-index">
                  {String(index + 1).padStart(2, "0")}
                </div>

                <div className="community-contributor">
                  <strong>{node.contributor_name}</strong>
                  <small>{node.sensor_name}</small>
                </div>

                <div className="community-location">
                  <strong>{locationLabel(node)}</strong>
                  <small>{node.sensor_type || "sensor"}</small>
                </div>

                <div className="community-contribution">
                  <strong>
                    {Number(node.signals || 0).toLocaleString()} signals
                  </strong>

                  <small>
                    {Number(node.unique_ips || 0).toLocaleString()} unique IPs
                  </small>
                </div>

                <div
                  className={`community-status ${
                    isOnline ? "online" : "offline"
                  }`}
                >
                  <div className="community-status-main">
                    <span className="community-status-dot" />
                    <strong>{isOnline ? "Online" : "Offline"}</strong>
                  </div>

                  <small>{formatLastSeen(node.last_seen)}</small>
                </div>
              </div>
            );
          })}
      </div>

      <div className="community-mesh-footer">
        <p>
          Deploy a sensor and contribute intelligence to the mesh.
        </p>

        <button type="button" onClick={handleDeploy}>
          Deploy sensor
          <span>→</span>
        </button>
      </div>
    </section>
  );
}

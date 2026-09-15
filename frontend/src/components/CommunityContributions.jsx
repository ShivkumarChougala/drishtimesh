import { useEffect, useState } from "react";
import { getNodeContributions } from "../api/relay";

function formatLastSeen(value) {
  if (!value) return "No heartbeat";

  const diff = Date.now() - new Date(value).getTime();
  const mins = Math.max(0, Math.floor(diff / 60000));

  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;

  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;

  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}


export default function CommunityContributions() {
  const [nodes, setNodes] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    async function load() {
      try {
        const data = await getNodeContributions();

        const contributors = (data.results || []).filter(
          (node) =>
            node.contributor_name &&
            node.contributor_name !== "Community contributor"
        );

        setNodes(contributors);
        setStatus("ready");
      } catch (err) {
        console.error("Unable to load community contributors:", err);
        setStatus("error");
      }
    }

    load();
  }, []);

  const onlineCount = nodes.filter(
    (node) => node.status === "online"
  ).length;

  return (
    <section className="community-live">
      <div className="community-live-head">
        <div>
          <span className="section-kicker">Community mesh</span>

          <h2>Community contributors</h2>

          <p>
            Independent sensors contributing normalized threat intelligence
            to the DrishtiMesh network.
          </p>
        </div>

        <div className="community-live-count">
          <span
            className={`live-dot ${
              onlineCount === 0 ? "live-dot-inactive" : ""
            }`}
          />
          {onlineCount} online
        </div>
      </div>

      {status === "loading" && (
        <div className="community-state">
          Loading contributors...
        </div>
      )}

      {status === "error" && (
        <div className="community-state">
          Unable to load contributors.
        </div>
      )}

      {status === "ready" && nodes.length === 0 && (
        <div className="community-state">
          No community contributors yet.
        </div>
      )}

      {status === "ready" && nodes.length > 0 && (
        <div className="community-node-table">
          <div className="community-node-header">
            <span>Contributor</span>
            <span>Node</span>
            <span>Region</span>
            <span>Signals</span>
            <span>Attackers</span>
            <span>Status</span>
          </div>

          {nodes.map((node) => (
            <div className="community-node-row" key={node.node_id}>
              <div className="contributor-cell">
                <div className="contributor-info">
                  <strong>{node.contributor_name}</strong>
                  <small>{node.sensor_name}</small>
                </div>
              </div>

              <div className="community-node-info">
                <strong>{node.sensor_name}</strong>
                <small>
                  {node.sensor_type || "sensor"}
                  {node.provider ? ` · ${node.provider}` : ""}
                </small>
              </div>

              <div className="community-region">
                {node.region || "Unknown region"}
              </div>

              <div className="community-metric">
                <strong>
                  {(node.signals || 0).toLocaleString()}
                </strong>
              </div>

              <div className="community-metric">
                <strong>
                  {(node.unique_ips || 0).toLocaleString()}
                </strong>
              </div>

              <div
                className={`node-status ${
                  node.status === "online"
                    ? "node-status-online"
                    : "node-status-offline"
                }`}
              >
                <span className="status-dot" />

                <div>
                  <strong>
                    {node.status === "online" ? "Online" : "Offline"}
                  </strong>
                  <small>{formatLastSeen(node.last_seen)}</small>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

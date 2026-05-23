import { useEffect, useState } from "react";
import { getNodeContributions } from "../api/relay";

function formatLastSeen(value) {
  if (!value) return "unknown";

  const diff = Date.now() - new Date(value).getTime();
  const mins = Math.floor(diff / 60000);

  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;

  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;

  return `${Math.floor(hours / 24)}d ago`;
}

export default function CommunityContributions() {
  const [nodes, setNodes] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    async function load() {
      try {
        const data = await getNodeContributions();

        const onlineNodes = (data.results || []).filter(
          (node) => node.status === "online"
        );

        setNodes(onlineNodes);
        setStatus("ready");
      } catch (err) {
        console.error(err);
        setStatus("error");
      }
    }

    load();
  }, []);

  return (
    <section className="community-live">
      <div className="community-live-head">
        <div>
          <span className="section-kicker">Community mesh</span>
          <h2>Active contributor nodes</h2>
          <p>
            Online sensors contributing safe, normalized threat signals.
          </p>
        </div>

        <div className="community-live-count">
          <span className="live-dot"></span>
          {nodes.length} online
        </div>
      </div>

      {status === "loading" && (
        <p className="community-live-muted">Loading contributors...</p>
      )}

      {status === "error" && (
        <p className="community-live-muted">Unable to load contributors.</p>
      )}

      {status === "ready" && (
        <div className="community-node-table">
          <div className="community-node-header">
            <span>Node</span>
            <span>Region</span>
            <span>Signals</span>
            <span>Attackers</span>
            <span>Status</span>
          </div>

          {nodes.map((node) => (
            <div className="community-node-row" key={node.node_id}>
              <div>
                <strong>{node.sensor_name}</strong>
                <small>{node.sensor_type} sensor · {node.provider}</small>
              </div>

              <div>{node.region}</div>

              <div>
                <strong>{node.signals.toLocaleString()}</strong>
              </div>

              <div>
                <strong>{node.unique_ips.toLocaleString()}</strong>
              </div>

              <div className="node-status">
                <span className="live-dot"></span>
                Online · {formatLastSeen(node.last_seen)}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

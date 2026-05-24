import { useEffect, useState } from "react";
import { getDashboardSensors } from "../../api/dashboard";
import { deleteNode } from "../../api/relay";

function formatDate(value) {
  if (!value) return "Never seen";
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

export default function SensorHealth({ refreshKey, onDeleted }) {
  const [sensors, setSensors] = useState([]);
  const [status, setStatus] = useState("loading");

  async function loadSensors() {
    try {
      const data = await getDashboardSensors();
      setSensors(data.results || []);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }

  useEffect(() => {
    loadSensors();
  }, [refreshKey]);

  async function handleDelete(nodeId) {
    if (!confirm("Delete this sensor? Its token will stop working.")) return;

    try {
      await deleteNode(nodeId);
      await loadSensors();
      onDeleted?.();
    } catch {
      alert("Failed to delete sensor");
    }
  }

  return (
    <section className="dash-panel">
      <h2>Sensor Health</h2>
      <p className="dash-muted">Workspace sensors and heartbeat status.</p>

      {status === "loading" && <p className="dash-muted">Loading sensors...</p>}
      {status === "error" && <p className="dash-muted">Failed to load sensors.</p>}

      {status === "ready" && sensors.length === 0 && (
        <div className="empty-state">
          <strong>No sensors deployed</strong>
          <p className="dash-muted">Create your first sensor from Deployments.</p>
        </div>
      )}

      {status === "ready" && sensors.length > 0 && (
        <div className="sensor-list">
          {sensors.map((sensor) => (
            <div className="sensor-row" key={sensor.node_id}>
              <div>
                <strong>{sensor.node_name || "Unnamed sensor"}</strong>
                <p>
                  {sensor.sensor_type} · {[sensor.country, sensor.region, sensor.provider]
                    .filter(Boolean)
                    .join(" · ") || "Unknown location"}
                </p>
                <small>Last seen {formatDate(sensor.last_seen)}</small>
              </div>

              <div className="sensor-metrics">
                <span className={`sensor-status ${sensor.status || "offline"}`}>
                  {sensor.status || "offline"}
                </span>
                <small>{sensor.signals || 0} signals</small>
                <small>{sensor.unique_ips || 0} IPs</small>
                <button className="sensor-delete" onClick={() => handleDelete(sensor.node_id)}>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMe, logout } from "../api/auth";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://139.84.172.22:8000";

export default function DashboardPage() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [deploying, setDeploying] = useState(false);
  const [sensor, setSensor] = useState(null);
  const [nodes, setNodes] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const me = await getMe();
        setUser(me);
        await loadNodes();
      } catch {
        logout();
        navigate("/login");
      }
    }

    load();
  }, [navigate]);

  async function loadNodes() {
    const token = localStorage.getItem("drishti_token");

    const res = await fetch(`${API_BASE_URL}/nodes/my`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();
    setNodes(data.results || []);
  }

  async function handleDeploy() {
    try {
      setDeploying(true);

      const token = localStorage.getItem("drishti_token");

      const res = await fetch(`${API_BASE_URL}/nodes/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          sensor_type: "cowrie",
          node_name: `Sensor-${Date.now()}`,
        }),
      });

      const data = await res.json();
      setSensor(data);
      await loadNodes();
    } catch {
      alert("Failed to create sensor");
    } finally {
      setDeploying(false);
    }
  }

  function copy(value) {
    navigator.clipboard.writeText(value);
    alert("Copied");
  }

  async function deleteSensor(nodeId) {
    if (!confirm("Delete this sensor? Its token will stop working.")) return;

    const token = localStorage.getItem("drishti_token");

    const res = await fetch(`${API_BASE_URL}/nodes/${nodeId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      alert("Failed to delete sensor");
      return;
    }

    await loadNodes();
  }

  function handleLogout() {
    logout();
    navigate("/");
  }

  const installCommand = sensor
    ? `curl -fsSL ${API_BASE_URL}/downloads/install.sh -o install.sh && sudo bash install.sh --relay ${API_BASE_URL} --node-id "${sensor.node_id}" --token "${sensor.api_token}"`
    : "";

  return (
    <main className="dashboard-page">
      <nav className="dashboard-nav">
        <div>
          <strong>DrishtiMesh</strong>
          <span>Sensor Dashboard</span>
        </div>

        <button onClick={handleLogout}>Logout</button>
      </nav>

      <section className="dashboard-hero">
        <div>
          <p className="auth-badge">Authenticated workspace</p>
          <h1>Deploy and manage sensors</h1>
          <p>Create node identities, deploy collectors, and monitor mesh activity.</p>
        </div>
      </section>

      <section className="dashboard-grid">
        <div className="dashboard-card">
          <h3>Account</h3>
          <p>{user ? user.name : "Loading..."}</p>
          <span>{user ? user.email : ""}</span>
        </div>

        <div className="dashboard-card">
          <h3>Create sensor</h3>
          <p>Generate a new sensor node and deployment token.</p>
          <button onClick={handleDeploy} disabled={deploying}>
            {deploying ? "Creating..." : "Create Sensor"}
          </button>
        </div>

        <div className="dashboard-card">
          <h3>Total sensors</h3>
          <p>{nodes.length}</p>
          <span>Linked to your workspace</span>
        </div>
      </section>

      {sensor && (
        <section className="dashboard-hero" style={{ marginTop: "18px" }}>
          <h2>Deploy Sensor</h2>

          <div style={{ marginTop: "20px" }}>
            <p>
              Run this command on your VPS to deploy and connect your sensor to the
              DrishtiMesh relay.
            </p>

            <code>{installCommand}</code>

            <button style={{ marginTop: "14px" }} onClick={() => copy(installCommand)}>
              Copy Install Command
            </button>
          </div>
        </section>
      )}

      <section className="dashboard-hero" style={{ marginTop: "18px" }}>
        <h2>My Sensors</h2>

        <div style={{ marginTop: "24px", overflowX: "auto" }}>
          <table className="sensor-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Status</th>
                <th>Signals</th>
                <th>IPs</th>
                <th>Last Seen</th>
                <th>Deploy</th>
                <th>Delete</th>
              </tr>
            </thead>

            <tbody>
              {nodes.map((node) => (
                <tr key={node.node_id}>
                  <td>{node.sensor_name}</td>
                  <td>
                    <span className={`status-${node.status}`}>{node.status}</span>
                  </td>
                  <td>{node.signals}</td>
                  <td>{node.unique_ips}</td>
                  <td>{node.last_seen}</td>
                  <td>
                    <button
                      onClick={() =>
                        copy(
                          `curl -fsSL ${API_BASE_URL}/downloads/install.sh -o install.sh && sudo bash install.sh --relay ${API_BASE_URL} --node-id "${node.node_id}" --token "${node.api_token}"`
                        )
                      }
                    >
                      Copy Command
                    </button>
                  </td>
                  <td>
                    <button onClick={() => deleteSensor(node.node_id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}

              {!nodes.length && (
                <tr>
                  <td colSpan="7">No sensors deployed yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}

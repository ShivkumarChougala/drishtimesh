import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMe, logout } from "../api/auth";
import { getDashboardSummary, getDashboardSensors } from "../api/dashboard";

export default function AccountSettingsPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [summary, setSummary] = useState(null);
  const [sensors, setSensors] = useState([]);
  const [defaultWindow, setDefaultWindow] = useState(
    localStorage.getItem("drishti_default_window") || "24"
  );

  useEffect(() => {
    async function loadUser() {
      try {
        const me = await getMe();
        setUser(me);

        const summaryData = await getDashboardSummary();
        setSummary(summaryData);

        const sensorData = await getDashboardSensors();
        setSensors(sensorData.results || []);
      } catch {
        logout();
        navigate("/login");
      }
    }

    loadUser();
  }, [navigate]);

  function savePreferences() {
    localStorage.setItem("drishti_default_window", defaultWindow);
    alert("Preferences saved");
  }

  function handleLogout() {
    logout();
    navigate("/");
  }

  const displayName = user?.name || "User";
  const displayEmail = user?.email || "";
  const avatarLetter = (displayName || displayEmail || "U")[0].toUpperCase();

  return (
    <main className="settings-page">
      <section className="settings-wrap">
        <button onClick={() => navigate("/dashboard")} className="settings-back">
          ← Back to dashboard
        </button>

        <header className="settings-hero">
          <div>
            <p className="settings-eyebrow">Account center</p>
            <h1>Account settings</h1>
            <p>Manage your DrishtiMesh identity, workspace preferences, and account access.</p>
          </div>
        </header>

        <section className="settings-grid">
          <div className="settings-card profile-summary">
            <div className="settings-avatar">{avatarLetter}</div>
            <div>
              <h2>{displayName}</h2>
              <p>{displayEmail}</p>
              <span>Authenticated workspace user</span>
            </div>
          </div>

          <div className="settings-card">
            <h2>Account statistics</h2>
            <div className="settings-stats">
              <div>
                <strong>{summary?.total_nodes ?? 0}</strong>
                <span>Sensors</span>
              </div>
              <div>
                <strong>{summary?.total_signals ?? 0}</strong>
                <span>Signals</span>
              </div>
              <div>
                <strong>{summary?.unique_ips ?? 0}</strong>
                <span>Unique IPs</span>
              </div>
            </div>
          </div>

          <div className="settings-card settings-wide">
            <h2>My sensors</h2>

            {sensors.length === 0 ? (
              <p className="settings-text">No sensors deployed yet. Deploy your first sensor from the dashboard.</p>
            ) : (
              <div className="settings-sensor-list">
                {sensors.slice(0, 5).map((sensor) => (
                  <div className="settings-sensor-row" key={sensor.node_id}>
                    <div>
                      <strong>{sensor.node_name || "Unnamed sensor"}</strong>
                      <span>
                        {sensor.sensor_type || "sensor"} · {sensor.provider || "Unknown provider"}
                      </span>
                    </div>

                    <div className="settings-sensor-meta">
                      <span className={`sensor-status ${sensor.status || "offline"}`}>
                        {sensor.status || "offline"}
                      </span>
                      <small>{sensor.signals || 0} signals</small>
                      <small>{sensor.unique_ips || 0} IPs</small>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <button type="button" className="settings-secondary" onClick={() => navigate("/dashboard")}>
              View all sensors
            </button>
          </div>

          <div className="settings-card settings-wide">
            <h2>Profile</h2>
            <div className="settings-form compact">
              <label>Name</label>
              <input value={displayName} readOnly />

              <label>Email</label>
              <input value={displayEmail} readOnly />

              <p className="settings-hint">Profile editing will be available in a future update.</p>
            </div>
          </div>

          <div className="settings-card settings-wide">
            <h2>Preferences</h2>
            <div className="settings-form compact">
              <label>Default dashboard window</label>
              <select value={defaultWindow} onChange={(e) => setDefaultWindow(e.target.value)}>
                <option value="6">Last 6 hours</option>
                <option value="12">Last 12 hours</option>
                <option value="24">Last 24 hours</option>
                <option value="168">Last 7 days</option>
              </select>

              <button onClick={savePreferences} className="settings-primary">
                Save preferences
              </button>
            </div>
          </div>

          <div className="settings-card">
            <h2>Security</h2>
            <p className="settings-text">
              Password changes, session history, and API key management will be added as the platform grows.
            </p>
            <button className="settings-secondary" type="button">
              API keys coming soon
            </button>
          </div>

          <div className="settings-card danger-zone">
            <h2>Danger zone</h2>
            <p className="settings-text">Logout from this device. Account deletion will be added later.</p>
            <button onClick={handleLogout} className="settings-danger">
              Logout
            </button>
          </div>
        </section>
      </section>
    </main>
  );
}

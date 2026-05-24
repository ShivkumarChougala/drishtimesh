import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMe, logout } from "../api/auth";
import { getDashboardSummary } from "../api/dashboard";
import KpiCards from "../components/dashboard/KpiCards";
import ThreatFeed from "../components/dashboard/ThreatFeed";
import SignalTimeline from "../components/dashboard/SignalTimeline";
import SensorHealth from "../components/dashboard/SensorHealth";
import DeployWorkspace from "../components/dashboard/DeployWorkspace";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [summary, setSummary] = useState(null);
  const [status, setStatus] = useState("loading");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const me = await getMe();
        setUser(me);

        const summaryData = await getDashboardSummary();
        setSummary(summaryData);

        setStatus("ready");
      } catch {
        logout();
        navigate("/login");
      }
    }

    loadDashboard();
  }, [navigate]);

  async function refreshDashboard() {
    try {
      const summaryData = await getDashboardSummary();
      setSummary(summaryData);
      setRefreshKey((value) => value + 1);
    } catch {}
  }

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <main className="dashboard-shell">
      <aside className="dash-sidebar">
        <div className="dash-brand">
          <div className="dash-logo"></div>
          <strong>DrishtiMesh</strong>
        </div>

        <nav className="dash-nav">
          <span className="active">Overview</span>
          <span>Sensors</span>
          <span>Threat Signals</span>
          <span>IP Reputation</span>
          <span>Deployments</span>
          <span>API Keys</span>
        </nav>
      </aside>

      <section className="dashboard-main">
        <header className="dash-topbar">
          <div>
            <h1>Threat Mesh Command Center</h1>
            <p>
              Live visibility across sensors, attack signals, IP reputation and mesh health.
            </p>
          </div>

          <div className="dash-actions">
            <span>{user?.email}</span>
            <button onClick={handleLogout}>Logout</button>
          </div>
        </header>

        {status === "loading" && <p className="dash-muted">Loading dashboard...</p>}

        {status === "ready" && (
          <>
            <KpiCards summary={summary} />

            <section className="dash-content-grid">
              <SignalTimeline />

              <ThreatFeed />
            </section>

            <section className="dash-content-grid">
              <SensorHealth refreshKey={refreshKey} onDeleted={refreshDashboard} />

              <DeployWorkspace onCreated={refreshDashboard} />
            </section>
          </>
        )}
      </section>
    </main>
  );
}

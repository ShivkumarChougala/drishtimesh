import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMe, logout } from "../api/auth";
import { getDashboardSummary } from "../api/dashboard";
import KpiCards from "../components/dashboard/KpiCards";
import ThreatFeed from "../components/dashboard/ThreatFeed";
import SignalTimeline from "../components/dashboard/SignalTimeline";
import SensorHealth from "../components/dashboard/SensorHealth";
import DeployWorkspace from "../components/dashboard/DeployWorkspace";
import DashboardCommandBar from "../components/dashboard/DashboardCommandBar";

export default function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [summary, setSummary] = useState(null);
  const [status, setStatus] = useState("loading");
  const [refreshKey, setRefreshKey] = useState(0);
  const [hoursFilter, setHoursFilter] = useState(24);

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
    <main className="dashboard-shell dashboard-shell-topnav">
      <header className="dashboard-topnav">
        <div className="dash-brand">
          <div className="dash-logo"></div>
          <strong>DrishtiMesh</strong>
        </div>

        <nav className="dash-nav-horizontal">
          <span className="active">Overview</span>
          <span>Signals</span>
          <span>Sensors</span>
          <span>Deploy</span>
          <span>Reputation</span>
        </nav>

        <div className="dash-actions">
          <span>{user?.email}</span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      </header>

      <section className="dashboard-main">
        <header className="dash-topbar">
          <div>
            <span className="dash-eyebrow">Overview</span>
            <h1>Threat Mesh Command Center</h1>
            <p>
              Live visibility across sensors, attack signals, IP reputation and mesh health.
            </p>
          </div>
        </header>

        {status === "loading" && <p className="dash-muted">Loading dashboard...</p>}

        {status === "ready" && (
          <>
            <KpiCards summary={summary} />
            <p className="dash-impact-line">Every shared signal strengthens community reputation intelligence.</p>
            <DashboardCommandBar hours={hoursFilter} onHoursChange={setHoursFilter} />

            <section className="dash-wide-row">
              <SignalTimeline hours={hoursFilter} />
            </section>

            <section className="dash-two-column">
              <ThreatFeed hours={hoursFilter} />
              <SensorHealth refreshKey={refreshKey} onDeleted={refreshDashboard} />
            </section>


            <section className="dash-wide-row">
              <DeployWorkspace onCreated={refreshDashboard} />
            </section>
          </>
        )}
      </section>
    </main>
  );
}

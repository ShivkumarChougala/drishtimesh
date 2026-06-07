import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getMe, logout } from "../api/auth";
import { getDashboardSummary } from "../api/dashboard";
import KpiCards from "../components/dashboard/KpiCards";
import ThreatFeed from "../components/dashboard/ThreatFeed";
import SensorHealth from "../components/dashboard/SensorHealth";
import DeployWorkspace from "../components/dashboard/DeployWorkspace";

export default function DashboardPage() {
  const navigate = useNavigate();
  const accountRef = useRef(null);

  const [user, setUser] = useState(null);
  const [summary, setSummary] = useState(null);
  const [status, setStatus] = useState("loading");
  const [refreshKey, setRefreshKey] = useState(0);
  const [hoursFilter, setHoursFilter] = useState(24);
  const [searchQuery, setSearchQuery] = useState("");
  const [accountOpen, setAccountOpen] = useState(false);

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

  useEffect(() => {
    function handleClickOutside(event) {
      if (accountRef.current && !accountRef.current.contains(event.target)) {
        setAccountOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setAccountOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

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

  const displayName = user?.name || "User";
  const displayEmail = user?.email || "";
  const avatarLetter = (displayName || displayEmail || "U")[0].toUpperCase();

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
          <div className="dash-account" ref={accountRef}>
            <button
              type="button"
              className="dash-account-trigger"
              onClick={() => setAccountOpen((value) => !value)}
            >
              <div className="dash-avatar">{avatarLetter}</div>

              <div className="dash-user-meta">
                <strong>{displayName}</strong>
                <span>{displayEmail}</span>
              </div>

              <span className="dash-account-caret">⌄</span>
            </button>

            {accountOpen && (
              <div className="dash-account-menu">
                <div className="dash-account-menu-head">
                  <strong>{displayName}</strong>
                  <span>{displayEmail}</span>
                </div>

                <button type="button" onClick={() => { setAccountOpen(false); navigate("/dashboard/settings"); }}>Account settings</button>
                <button type="button">My sensors</button>
                <button type="button">API keys</button>

                <div className="dash-menu-divider"></div>

                <button type="button" className="danger" onClick={handleLogout}>
                  Logout
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <section className="dashboard-main">
        <header className="dash-topbar">
          <div>
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

            <section className="dash-wide-row">
              <ThreatFeed
                hours={hoursFilter}
                onHoursChange={setHoursFilter}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
              />
            </section>

            <section className="dash-two-column dashboard-lower-grid">
              <SensorHealth refreshKey={refreshKey} onDeleted={refreshDashboard} />
              <DeployWorkspace onCreated={refreshDashboard} />
            </section>
          </>
        )}
      </section>
    </main>
  );
}

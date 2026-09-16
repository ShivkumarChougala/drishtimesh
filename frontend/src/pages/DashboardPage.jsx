import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardNavbar from "../components/dashboard/DashboardNavbar";
import { getMe, logout } from "../api/auth";
import { getDashboardSummary } from "../api/dashboard";

import KpiCards from "../components/dashboard/KpiCards";
import SignalTimeline from "../components/dashboard/SignalTimeline";
import ThreatFeed from "../components/dashboard/ThreatFeed";

export default function DashboardPage() {
  const navigate = useNavigate();
const [user, setUser] = useState(null);
  const [summary, setSummary] = useState(null);
  const [status, setStatus] = useState("loading");
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
return (
    <main className="dashboard-shell dashboard-shell-topnav overview-dashboard">
      <DashboardNavbar user={user} />

      <section className="dashboard-main overview-main">
        {status === "loading" && (
          <div className="overview-loading">Loading overview...</div>
        )}

        {status === "ready" && (
          <>
            <header className="overview-header">
              <div>
                <span className="overview-kicker">Overview</span>
                <h1>Threat mesh overview</h1>
                <p>
                  Sensor activity and network intelligence from your
                  DrishtiMesh workspace.
                </p>
              </div>

              <div className="overview-controls">
                <span className="overview-live">
                  <i></i>
                  Live
                </span>

                <select
                  value={hoursFilter}
                  onChange={(event) =>
                    setHoursFilter(Number(event.target.value))
                  }
                  aria-label="Activity time range"
                >
                  <option value={6}>Past 6 hours</option>
                  <option value={24}>Past 24 hours</option>
                  <option value={168}>Past 7 days</option>
                </select>
              </div>
            </header>

            <KpiCards summary={summary} />

            <section className="overview-activity">
              <div className="overview-section-head">
                <div>
                  <span className="overview-section-label">
                    Signal activity
                  </span>
                  <h2>Activity over time</h2>
                </div>
              </div>

              <SignalTimeline hours={hoursFilter} />
            </section>

            <ThreatFeed hours={hoursFilter} />
          </>
        )}
      </section>
    </main>
  );
}

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getMe, logout } from "../api/auth";
import DashboardNavbar from "../components/dashboard/DashboardNavbar";
import SensorHealth from "../components/dashboard/SensorHealth";
import DeployWorkspace from "../components/dashboard/DeployWorkspace";

export default function DashboardDeployPage() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("loading");
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    async function authenticate() {
      try {
        const me = await getMe();
        setUser(me);
        setStatus("ready");
      } catch {
        logout();
        navigate("/login");
      }
    }

    authenticate();
  }, [navigate]);

  function refreshSensors() {
    setRefreshKey((value) => value + 1);
  }

  return (
    <main className="dashboard-shell dashboard-shell-topnav overview-dashboard deploy-dashboard">
      <DashboardNavbar user={user} />

      <section className="dashboard-main overview-main deploy-main">
        {status === "loading" && (
          <div className="overview-loading">Loading deployment workspace...</div>
        )}

        {status === "ready" && (
          <>
            <header className="deploy-page-header">
              <div>
                <span className="overview-kicker">Deploy</span>

                <h1>Sensors</h1>

                <p>
                  Manage your DrishtiMesh sensors and connect new infrastructure
                  to the threat intelligence mesh.
                </p>
              </div>
            </header>

            <section className="deploy-page-section">
              <div className="deploy-section-heading">
                <div>
                  <span className="overview-section-label">
                    Your sensors
                  </span>
                  <h2>Deployed infrastructure</h2>
                </div>
              </div>

              <SensorHealth
                refreshKey={refreshKey}
                onDeleted={refreshSensors}
              />
            </section>

            <section className="deploy-page-section deploy-create-section">
              <div className="deploy-section-heading">
                <div>
                  <span className="overview-section-label">
                    New sensor
                  </span>
                  <h2>Deploy a sensor</h2>
                </div>

                <p>
                  Register a sensor, then run the generated command on your VPS.
                </p>
              </div>

              <DeployWorkspace onCreated={refreshSensors} />
            </section>
          </>
        )}
      </section>
    </main>
  );
}

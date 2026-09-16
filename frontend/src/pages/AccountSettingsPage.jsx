import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getMe, logout } from "../api/auth";
import DashboardNavbar from "../components/dashboard/DashboardNavbar";

export default function AccountSettingsPage() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [status, setStatus] = useState("loading");

  const [defaultWindow, setDefaultWindow] = useState(
    localStorage.getItem("drishti_default_window") || "24"
  );

  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function loadUser() {
      try {
        const me = await getMe();
        setUser(me);
        setStatus("ready");
      } catch {
        logout();
        navigate("/login");
      }
    }

    loadUser();
  }, [navigate]);

  function savePreferences() {
    localStorage.setItem("drishti_default_window", defaultWindow);

    setSaved(true);

    window.setTimeout(() => {
      setSaved(false);
    }, 1800);
  }

  const displayName = user?.name || "User";
  const displayEmail = user?.email || "";

  return (
    <main className="dashboard-shell dashboard-shell-topnav overview-dashboard account-settings-dashboard">
      <DashboardNavbar user={user} />

      <section className="dashboard-main overview-main account-settings-main">
        {status === "loading" && (
          <div className="overview-loading">
            Loading account settings...
          </div>
        )}

        {status === "ready" && (
          <>
            <header className="account-settings-header">
              <div>
                <span className="overview-kicker">Account</span>

                <h1>Account settings</h1>

                <p>
                  Manage your DrishtiMesh account and workspace preferences.
                </p>
              </div>
            </header>

            <div className="account-settings-sections">

              <section className="account-settings-section">
                <div className="account-settings-section-head">
                  <div>
                    <h2>Profile</h2>
                    <p>Your account identity.</p>
                  </div>
                </div>

                <div className="account-profile">
                  <div className="account-profile-row">
                    <span>Name</span>
                    <strong>{displayName}</strong>
                  </div>

                  <div className="account-profile-row">
                    <span>Email</span>
                    <strong>{displayEmail}</strong>
                  </div>
                </div>
              </section>

              <section className="account-settings-section">
                <div className="account-settings-section-head">
                  <div>
                    <h2>Preferences</h2>
                    <p>Configure your default dashboard experience.</p>
                  </div>
                </div>

                <div className="account-preference-row">
                  <div>
                    <strong>Default activity window</strong>
                    <span>
                      Used when opening dashboard activity views.
                    </span>
                  </div>

                  <div className="account-preference-control">
                    <select
                      value={defaultWindow}
                      onChange={(event) => {
                        setDefaultWindow(event.target.value);
                        setSaved(false);
                      }}
                      aria-label="Default dashboard activity window"
                    >
                      <option value="6">Past 6 hours</option>
                      <option value="12">Past 12 hours</option>
                      <option value="24">Past 24 hours</option>
                      <option value="168">Past 7 days</option>
                    </select>

                    <button
                      type="button"
                      onClick={savePreferences}
                    >
                      {saved ? "Saved" : "Save"}
                    </button>
                  </div>
                </div>
              </section>

              <section className="account-settings-section">
                <div className="account-settings-section-head">
                  <div>
                    <h2>Security</h2>
                    <p>Authentication and account security.</p>
                  </div>
                </div>

                <div className="account-setting-row">
                  <div>
                    <strong>Password</strong>
                    <span>
                      Password management will be available in a future update.
                    </span>
                  </div>

                  <span className="account-coming-soon">
                    Coming soon
                  </span>
                </div>
              </section>

              <section className="account-settings-section">
                <div className="account-settings-section-head">
                  <div>
                    <h2>API access</h2>
                    <p>
                      Programmatic access to your DrishtiMesh workspace.
                    </p>
                  </div>
                </div>

                <div className="account-setting-row">
                  <div>
                    <strong>API keys</strong>
                    <span>
                      Create and manage workspace API credentials.
                    </span>
                  </div>

                  <span className="account-coming-soon">
                    Coming soon
                  </span>
                </div>
              </section>

            </div>
          </>
        )}
      </section>
    </main>
  );
}

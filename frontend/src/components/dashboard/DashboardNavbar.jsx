import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { logout } from "../../api/auth";

const NAV_ITEMS = [
  { label: "Overview", path: "/dashboard", exact: true },
  { label: "Signals", path: "/dashboard/signals" },
  { label: "Deploy", path: "/dashboard/deploy" },
];

export default function DashboardNavbar({ user }) {
  const navigate = useNavigate();
  const location = useLocation();
  const accountRef = useRef(null);

  const [accountOpen, setAccountOpen] = useState(false);

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        accountRef.current &&
        !accountRef.current.contains(event.target)
      ) {
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

  function isActive(item) {
    if (item.exact) {
      return location.pathname === item.path;
    }

    return location.pathname.startsWith(item.path);
  }

  function handleLogout() {
    logout();
    navigate("/");
  }

  const displayName = user?.name || "User";
  const displayEmail = user?.email || "";
  const avatarLetter = (displayName || displayEmail || "U")[0].toUpperCase();

  return (
    <header className="dashboard-topnav overview-nav">
      <button
        type="button"
        className="dash-brand dash-brand-button"
        onClick={() => navigate("/dashboard")}
        aria-label="Go to dashboard overview"
      >
        <div className="dash-logo"></div>
        <strong>DrishtiMesh</strong>
      </button>

      <nav className="dash-nav-horizontal" aria-label="Dashboard navigation">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.path}
            type="button"
            className={isActive(item) ? "active" : ""}
            onClick={() => navigate(item.path)}
          >
            {item.label}
          </button>
        ))}
      </nav>

      <div className="dash-actions">
        <div className="dash-account" ref={accountRef}>
          <button
            type="button"
            className="dash-account-trigger"
            onClick={() => setAccountOpen((value) => !value)}
            aria-expanded={accountOpen}
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

              <button
                type="button"
                onClick={() => {
                  setAccountOpen(false);
                  navigate("/dashboard/settings");
                }}
              >
                <span>Account settings</span>
                <span className="dash-menu-arrow">→</span>
              </button>

              <button
                type="button"
                className="dash-menu-coming"
                disabled
              >
                <span>API keys</span>
                <span className="dash-coming-badge">Coming soon</span>
              </button>

              <div className="dash-menu-divider"></div>

              <button
                type="button"
                className="danger"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

import { Link, useLocation } from "react-router-dom";

export default function Navbar({ onDeploy }) {
  const location = useLocation();
  const isLookup = location.pathname === "/lookup";

  return (
    <header>
      <div className="nav">
        <Link to="/" className="brand">
          <div className="brand-icon"></div>
          DrishtiMesh
        </Link>

        <div className="actions">
          <Link to="/login">Login</Link>

          <div className="divider"></div>

          <Link
            to="/lookup"
            className={isLookup ? "active-nav-link" : ""}
          >
            IP lookup
          </Link>

          <Link to="/">
            <button className="nav-btn nav-button" onClick={onDeploy}>
              Deploy sensor
            </button>
          </Link>
        </div>
      </div>
    </header>
  );
}

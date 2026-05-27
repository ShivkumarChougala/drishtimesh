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

        <div className="links">
          <Link to="/why-drishtimesh">Why DrishtiMesh</Link>

          <div className="nav-dropdown">
            <button className="nav-dropdown-trigger">
              Product <span>⌄</span>
            </button>
          </div>

          <div className="nav-dropdown">
            <button className="nav-dropdown-trigger">
              Resources <span>⌄</span>
            </button>

            <div className="dropdown-menu">
              <Link to="/blog">Blog</Link>
              <a href="#">Documentation</a>
            </div>
          </div>
        </div>

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

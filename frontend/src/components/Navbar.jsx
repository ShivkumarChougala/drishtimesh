export default function Navbar({ onDeploy }) {
  return (
    <header>
      <div className="nav">
        <div className="brand">
          <div className="brand-icon"></div>
          DrishtiMesh
        </div>

        <div className="links">
          <a href="#">Platform</a>
          <a href="#">Deployment <span>⌄</span></a>
          <a href="#">Architecture</a>
          <a href="#">Docs <span>⌄</span></a>
          <a href="#">Protocol</a>
        </div>

        <div className="actions">
          <a href="#">Login</a>
          <div className="divider"></div>
          <a href="#">IP lookup</a>
          <button className="nav-btn nav-button" onClick={onDeploy}>
            Deploy sensor
          </button>
        </div>
      </div>
    </header>
  );
}

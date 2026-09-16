import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="site-footer footer-v2">
      <div className="footer-v2-main">
        <div className="footer-v2-brand">
          <strong>DrishtiMesh</strong>

          <p>
            Distributed threat intelligence from
            community-operated sensors.
          </p>
        </div>

        <div className="footer-v2-links">
          <div>
            <span>Explore</span>
            <Link to="/lookup">IP Lookup</Link>
            <Link to="/blog">Blog</Link>
          </div>

          <div>
            <span>Network</span>
            <a href="/#recent-activity">Recent Activity</a>
            <a href="/#community-mesh">Community Mesh</a>
          </div>

          <div>
            <span>Project</span>

            <a
              href="https://github.com/ShivkumarChougala/drishtimesh"
              target="_blank"
              rel="noreferrer"
            >
              GitHub ↗
            </a>

            <Link to="/deploy">Deploy Sensor</Link>
          </div>
        </div>
      </div>

      <div className="footer-v2-bottom">
        <span>© 2026 DrishtiMesh</span>
        <span>Open threat intelligence infrastructure</span>
      </div>
    </footer>
  );
}

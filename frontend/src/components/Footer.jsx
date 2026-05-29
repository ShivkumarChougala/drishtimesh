import { Link } from "react-router-dom";
import { Globe, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-grid">
        <div>
          <h4>Product</h4>
          <Link to="/deploy">Deploy Sensor</Link>
          <Link to="/lookup">IP Lookup</Link>
          <Link to="/blog">Blog</Link>
        </div>

        <div>
          <h4>Community</h4>
          <a
            href="https://github.com/ShivkumarChougala/drishtimesh"
            target="_blank"
            rel="noreferrer"
          >
            GitHub
          </a>
          <Link to="/why-drishtimesh">Why DrishtiMesh</Link>
          <Link to="/deploy">Join the Mesh</Link>
        </div>
      </div>

      <div className="footer-bottom">
        <span>© 2026 DrishtiMesh</span>

        <div className="footer-socials">
          <a
            href="https://github.com/ShivkumarChougala/drishtimesh"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
          >
            <Globe size={16} />
          </a>

          <a href="mailto:contact@thechougala.in" aria-label="Email">
            <Mail size={16} />
          </a>
        </div>
      </div>
    </footer>
  );
}

import { Link } from "react-router-dom";

export default function Hero({ onDeploy }) {
  return (
    <section className="hero">
      <div className="mesh-bg"></div>

      <div className="hero-content">
        <div className="eyebrow">distributed sensor infrastructure</div>

        <h1>
          Deploy in minutes.
          <br />
          <span className="hero-green hero-nowrap">
            Start contributing immediately.
          </span>
        </h1>

        <p className="lead">
          Deploy your desired honeypot sensor on your VPS in one command and
          help the community detect malicious activity across the internet.
        </p>

        <div className="cta-row">
          <button className="primary" onClick={onDeploy}>
            Deploy sensor
          </button>

          <Link to="/lookup" className="secondary">
            Open IP lookup ↗
          </Link>
        </div>
      </div>
    </section>
  );
}

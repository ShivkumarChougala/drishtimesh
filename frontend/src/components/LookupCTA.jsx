import { Link } from "react-router-dom";

export default function LookupCTA({ onDeploy }) {
  return (
    <section className="lookup">
      <div className="lookup-inner">
        <div>
          <h3>Search reputation and evidence on the lookup network.</h3>
          <p>
            Observed IPs, commands, event timelines, signal history, and reputation
            scoring are available through the DrishtiMesh lookup surface.
          </p>
        </div>

        <div className="cta-row">
          <button className="primary" onClick={onDeploy}>Deploy sensor</button>

          <Link to="/lookup" className="secondary">
            Open IP lookup ↗
          </Link>
        </div>
      </div>
    </section>
  );
}

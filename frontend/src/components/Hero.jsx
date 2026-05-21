export default function Hero({ onDeploy }) {
  return (
    <section className="hero">
      <div className="mesh-bg"></div>
      <div className="orb"></div>
      <div className="node n1"></div>
      <div className="node n2"></div>
      <div className="node n3"></div>
      <div className="node n4"></div>
      <div className="node n5"></div>

      <div className="hero-content">
        <div className="eyebrow">distributed sensor infrastructure</div>
        <h1>Deploy distributed honeypot sensors in one command.</h1>
        <p className="lead">
          The installer provisions Cowrie, configures the node agent, enables systemd services,
          and connects the sensor to the DrishtiMesh relay. Raw logs remain local. Only normalized
          threat telemetry is shared with the reputation network.
        </p>

        <div className="cta-row">
          <button className="primary" onClick={onDeploy}>Deploy sensor</button>
          <button className="secondary">Open IP lookup ↗</button>
        </div>
      </div>
    </section>
  );
}

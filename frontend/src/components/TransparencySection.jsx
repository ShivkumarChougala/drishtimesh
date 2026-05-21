export default function TransparencySection() {
  return (
    <section className="section">
      <div>
        <div className="kicker">Transparent telemetry boundary</div>
        <h2>Built to be inspectable.</h2>
        <p className="section-copy">
          Operators should understand exactly what the installer configures,
          what stays local, and what telemetry is transmitted to the relay.
        </p>
      </div>

      <div className="steps">
        <div className="step">
          <code>install.sh</code>
          <div>
            <strong>The deployment script runs locally</strong>
            <p>Installs Cowrie, creates a Python virtual environment, configures the node agent, writes the .env file, and enables systemd services.</p>
          </div>
        </div>

        <div className="step">
          <code>cowrie.service</code>
          <div>
            <strong>Raw interaction logs stay on the sensor</strong>
            <p>SSH session logs and full Cowrie JSON remain stored locally on the node.</p>
          </div>
        </div>

        <div className="step">
          <code>signals</code>
          <div>
            <strong>Only normalized telemetry leaves the node</strong>
            <p>Source IP, event type, commands observed, timestamps, severity, usernames, and sensor metadata.</p>
          </div>
        </div>
      </div>
    </section>
  );
}

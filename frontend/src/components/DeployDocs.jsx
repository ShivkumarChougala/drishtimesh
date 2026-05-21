export default function DeployDocs() {
  return (
    <section className="deploy-docs">
      <div className="docs-intro">
        <div className="kicker">Deployment documentation</div>
        <h2>Why this exists.</h2>
        <p>
          DrishtiMesh removes the manual work of setting up a honeypot sensor.
          A contributor runs one command, the platform provisions the sensor,
          and the node starts contributing normalized signals to the community
          reputation network.
        </p>
      </div>

      <div className="docs-grid docs-grid-two">
        <div className="doc-card doc-card-large">
          <span>01 / DIFFERENCE</span>
          <strong>From manual honeypot setup to one-command deployment.</strong>
          <p>
            Normally, running a Cowrie sensor means installing packages,
            cloning Cowrie, creating Python environments, configuring logs,
            writing systemd services, creating timers, registering the node,
            storing tokens, and testing heartbeat manually.
          </p>
          <p>
            DrishtiMesh automates that full path. The user only provides a VPS
            and runs the generated installer command.
          </p>
        </div>

        <div className="doc-card doc-card-large">
          <span>02 / VALUE</span>
          <strong>Each sensor contributes to shared IP reputation.</strong>
          <p>
            Every deployed node observes real attacker behavior and sends safe,
            normalized signals to the relay. Those signals help build reputation
            context for IP lookup: observed behavior, commands, severity,
            timestamps, and sensor metadata.
          </p>
          <p>
            The result is a community-powered intelligence layer built from
            distributed honeypot observations.
          </p>
        </div>
      </div>

      <div className="docs-intro docs-second">
        <div className="kicker">How it works</div>
        <h2>The deployment path.</h2>
      </div>

      <div className="docs-flow">
        <div>
          <span>01</span>
          <strong>Register node</strong>
          <p>The relay creates a node ID and token for authenticated communication.</p>
        </div>

        <div>
          <span>02</span>
          <strong>Install sensor</strong>
          <p>The installer provisions Cowrie, Python venv, node agent, config, and services.</p>
        </div>

        <div>
          <span>03</span>
          <strong>Collect locally</strong>
          <p>Cowrie captures interaction logs on the VPS. Raw logs stay on the node.</p>
        </div>

        <div>
          <span>04</span>
          <strong>Send signals</strong>
          <p>The agent sends only normalized telemetry such as IP, event type, command, and severity.</p>
        </div>

        <div>
          <span>05</span>
          <strong>Build reputation</strong>
          <p>The relay aggregates observations into searchable IP reputation evidence.</p>
        </div>
      </div>
    </section>
  );
}

export default function DeployDocs() {
  return (
    <section className="deploy-docs">
      <div className="docs-problem">
        <div className="kicker">The problem</div>

        <h2>
          Running distributed honeypot infrastructure manually is operationally heavy.
        </h2>

        <p className="docs-lead">
          Deploying a sensor normally requires manual installation,
          service management, telemetry wiring, node registration,
          logging configuration, and reliability monitoring.
        </p>

        <div className="problem-grid">
          <div className="problem-card">
            <span>01</span>

            <strong>Manual installation</strong>

            <p>
              Cowrie setup, Python environments, dependencies,
              logging, and configuration are usually provisioned manually.
            </p>
          </div>

          <div className="problem-card">
            <span>02</span>

            <strong>Operational overhead</strong>

            <p>
              Services, timers, heartbeats, telemetry agents,
              and uptime management increase operational complexity.
            </p>
          </div>

          <div className="problem-card">
            <span>03</span>

            <strong>Signal normalization</strong>

            <p>
              Converting raw honeypot events into structured,
              reusable reputation signals requires additional infrastructure.
            </p>
          </div>
        </div>
      </div>

      <div className="docs-deploy">
        <div className="docs-deploy-copy">
          <div className="kicker">One-command deployment</div>

          <h2>
            Provision a sensor with a single generated install command.
          </h2>

          <p className="docs-lead">
            The deployment installer provisions the sensor,
            configures the node agent, registers telemetry,
            installs systemd services, and starts the honeypot automatically.
          </p>
        </div>

        <div className="deploy-shell">
          <div className="shell-top">
            <span></span>
            <span></span>
            <span></span>
          </div>

          <pre>
curl -fsSL https://deploy.drishtimesh.io/install.sh | sudo bash
          </pre>
        </div>

        <div className="deploy-features">
          <div>
            <span>Node registration</span>
          </div>

          <div>
            <span>Cowrie provisioning</span>
          </div>

          <div>
            <span>Systemd services</span>
          </div>

          <div>
            <span>Telemetry startup</span>
          </div>
        </div>
      </div>

      <div className="docs-transparency">
        <div className="transparency-copy">
          <div className="kicker">Signal transparency</div>

          <h2>
            Only normalized telemetry leaves the sensor.
          </h2>

          <p className="docs-lead">
            Raw Cowrie interaction logs remain on the VPS.
            The node agent extracts safe normalized signals and
            forwards them to the relay for reputation analysis.
          </p>

          <div className="trust-points">
            <div>Raw logs stay local</div>
            <div>Outbound-only communication</div>
            <div>No remote shell access</div>
            <div>Configurable ports</div>
            <div>Systemd managed services</div>
          </div>
        </div>

        <div className="signal-example">
          <div className="shell-top">
            <span></span>
            <span></span>
            <span></span>
          </div>

<pre>{`{
  "src_ip": "185.x.x.x",
  "event_type": "cowrie.command.input",
  "command": "wget http://...",
  "severity": "high",
  "timestamp": "2026-05-21T10:22:11Z",
  "sensor": "cowrie"
}`}</pre>
        </div>
      </div>

      <div className="docs-pipeline">
        <div className="pipeline-copy">
          <div className="kicker">Reputation pipeline</div>

          <h2>
            Distributed observations become searchable reputation context.
          </h2>

          <p className="docs-lead">
            DrishtiMesh transforms honeypot activity into structured,
            reusable intelligence for investigation and lookup.
          </p>
        </div>

        <div className="pipeline-layers">
          <div className="pipeline-layer">
            <div className="pipeline-label">
              Sensor layer
            </div>

            <div>
              <strong>
                Distributed Cowrie sensors
              </strong>

              <p>
                Sensors observe authentication attempts,
                commands, payload downloads, and interaction behavior.
              </p>
            </div>
          </div>

          <div className="pipeline-layer">
            <div className="pipeline-label">
              Signal layer
            </div>

            <div>
              <strong>
                Normalized telemetry extraction
              </strong>

              <p>
                The node agent converts raw honeypot events
                into structured reusable telemetry signals.
              </p>
            </div>
          </div>

          <div className="pipeline-layer">
            <div className="pipeline-label">
              Reputation layer
            </div>

            <div>
              <strong>
                Behavioral aggregation pipeline
              </strong>

              <p>
                The relay correlates observations across
                distributed sensors and builds IP reputation context.
              </p>
            </div>
          </div>

          <div className="pipeline-layer">
            <div className="pipeline-label">
              Investigation layer
            </div>

            <div>
              <strong>
                Transparent lookup evidence
              </strong>

              <p>
                Reputation observations become searchable
                evidence for investigation and threat analysis.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

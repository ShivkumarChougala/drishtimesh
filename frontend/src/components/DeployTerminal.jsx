export default function DeployTerminal() {
  return (
    <section className="command-section">
      <div>
        <div className="kicker">Deployment workflow</div>
        <h2>Provision a sensor in minutes.</h2>
        <p className="section-copy">
          Deployment and investigation remain separate surfaces. This page focuses
          on provisioning sensors and contributing telemetry into the mesh.
        </p>
      </div>

      <div className="terminal">
        <div className="terminal-head">
          <div className="dots"><i></i><i></i><i></i></div>
          <div>install.sh</div>
        </div>

        <pre><span className="prompt">root@vps:~#</span> curl -fsSL https://deploy.drishtimesh.io/install.sh | sudo bash

<span className="wait">→</span> registering node
<span className="wait">→</span> generating token
<span className="wait">→</span> installing Cowrie
<span className="wait">→</span> configuring node agent
<span className="wait">→</span> enabling systemd timer
<span className="ok">✓</span> sensor online</pre>
      </div>
    </section>
  );
}

export default function DeployTerminal() {
  return (
    <section className="deploy-steps-section">
      <div className="deploy-steps-head center">
        <h2>Deploy in minutes. Start contributing immediately.</h2>
      </div>

      <div className="deploy-step-grid">
        <div className="deploy-step-card">
          <span>1.</span>
          <h3>Register your node</h3>
          <p>
            Create a sensor identity and receive a relay token for your VPS.
            Your node becomes part of the DrishtiMesh network.
          </p>
        </div>

        <div className="deploy-step-card">
          <span>2.</span>
          <h3>Run one command</h3>
          <p>
            The installer configures Cowrie, sets up the DrishtiMesh agent,
            enables services, and connects the sensor to the relay.
          </p>

          <div className="command-box">
            <pre>curl -fsSL https://deploy.drishtimesh.io/install.sh | sudo bash</pre>
          </div>
        </div>

        <div className="deploy-step-card">
          <span>3.</span>
          <h3>Contribute threat signals</h3>
          <p>
            Your sensor observes attacker activity and shares safe normalized
            signals with the community intelligence mesh.
          </p>
        </div>
      </div>
    </section>
  );
}

export default function TransparencySection() {
  return (
    <section className="transparency-section">

      <div className="section-heading">

        <h2>What DrishtiMesh collects</h2>

        <p>
          Your raw honeypot logs stay on your own server.
        </p>
      </div>

      <div className="trust-strip">

        <div className="trust-card">
          <strong>Logs stay on your server</strong>

          <p>
            Full honeypot interaction logs remain on your VPS.
          </p>
        </div>

        <div className="trust-card">
          <strong>Only attack signals are shared</strong>

          <p>
            DrishtiMesh only receives normalized attack telemetry.
          </p>
        </div>

        <div className="trust-card">
          <strong>You control the deployment</strong>

          <p>
            Sensors run fully on infrastructure you manage.
          </p>
        </div>

      </div>

    </section>
  );
}

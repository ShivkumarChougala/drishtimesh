export default function TransparencySection() {
  return (
    <section className="trust-strip">
      <div className="trust-card">
        <strong>Raw logs stay local</strong>
        <p>Full honeypot interaction logs remain on contributor infrastructure.</p>
      </div>

      <div className="trust-card">
        <strong>Normalized signals only</strong>
        <p>Only safe telemetry is transmitted to the DrishtiMesh relay.</p>
      </div>

      <div className="trust-card">
        <strong>Contributor-controlled deployment</strong>
        <p>Sensors run entirely on your own VPS environment.</p>
      </div>
    </section>
  );
}

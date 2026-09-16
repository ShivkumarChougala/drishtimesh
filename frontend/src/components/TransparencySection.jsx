const ITEMS = [
  {
    number: "01",
    label: "Raw logs",
    title: "Stay on your server",
    description:
      "Full honeypot interaction logs remain on infrastructure you control.",
  },
  {
    number: "02",
    label: "Shared telemetry",
    title: "Only normalized signals",
    description:
      "DrishtiMesh receives normalized attack telemetry used by the mesh.",
  },
  {
    number: "03",
    label: "Control",
    title: "Your infrastructure",
    description:
      "You deploy and operate the sensor on infrastructure you manage.",
  },
];

export default function TransparencySection() {
  return (
    <section className="transparency-section transparency-v2">
      <header className="transparency-v2-head">
        <span className="section-kicker">Transparency</span>

        <h2>What DrishtiMesh collects.</h2>

        <p>
          Your raw honeypot logs stay on infrastructure you control.
        </p>
      </header>

      <div className="transparency-v2-grid">
        {ITEMS.map((item) => (
          <article className="transparency-v2-item" key={item.number}>
            <span className="transparency-v2-number">
              {item.number}
            </span>

            <div>
              <span className="transparency-v2-label">
                {item.label}
              </span>

              <strong>{item.title}</strong>

              <p>{item.description}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

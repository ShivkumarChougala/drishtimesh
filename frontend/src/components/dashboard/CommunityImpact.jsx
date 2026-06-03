export default function CommunityImpact({ summary }) {
  const items = [
    {
      label: "Signals shared",
      value: summary?.total_signals ?? 0,
    },
    {
      label: "Unique IPs observed",
      value: summary?.unique_ips ?? 0,
    },
    {
      label: "Malicious IPs identified",
      value: summary?.malicious_ips ?? 0,
    },
    {
      label: "Sensors deployed",
      value: summary?.total_nodes ?? 0,
    },
  ];

  return (
    <section className="community-impact">
      <div>
        <span className="timeline-kicker">Community Impact</span>
        <h2>Your sensors strengthen the mesh</h2>
        <p>
          Every shared signal improves community reputation intelligence and
          helps other defenders identify hostile infrastructure faster.
        </p>
      </div>

      <div className="impact-metrics">
        {items.map((item) => (
          <div className="impact-metric" key={item.label}>
            <strong>{item.value}</strong>
            <span>{item.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

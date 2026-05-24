export default function KpiCards({ summary }) {
  const cards = [
    {
      label: "Total Signals",
      value: summary?.total_signals ?? 0,
      meta: `${summary?.signals_24h ?? 0} in last 24h`,
    },
    {
      label: "Active Sensors",
      value: `${summary?.active_nodes ?? 0} / ${summary?.total_nodes ?? 0}`,
      meta: `${summary?.mesh_health ?? 0}% mesh health`,
    },
    {
      label: "Unique IPs",
      value: summary?.unique_ips ?? 0,
      meta: `${summary?.malicious_ips ?? 0} malicious`,
    },
    {
      label: "Avg Reputation",
      value: summary?.avg_reputation_score ?? 0,
      meta: "IP risk score average",
    },
  ];

  return (
    <section className="dash-kpis">
      {cards.map((card) => (
        <div className="dash-kpi-card" key={card.label}>
          <span>{card.label}</span>
          <strong>{card.value}</strong>
          <small>{card.meta}</small>
        </div>
      ))}
    </section>
  );
}

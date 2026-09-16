export default function KpiCards({ summary }) {
  const totalNodes = Number(summary?.total_nodes ?? 0);
  const activeNodes = Number(summary?.active_nodes ?? 0);

  const metrics = [
    {
      label: "Total Signals",
      value: Number(summary?.total_signals ?? 0).toLocaleString(),
      meta: `${Number(summary?.signals_24h ?? 0).toLocaleString()} in past 24h`,
    },
    {
      label: "Unique IPs",
      value: Number(summary?.unique_ips ?? 0).toLocaleString(),
      meta: "Observed sources",
    },
    {
      label: "Malicious IPs",
      value: Number(summary?.malicious_ips ?? 0).toLocaleString(),
      meta: "Known malicious",
    },
    {
      label: "Sensors Online",
      value: `${activeNodes} / ${totalNodes}`,
      meta: totalNodes
        ? `${Math.round((activeNodes / totalNodes) * 100)}% mesh availability`
        : "No sensors deployed",
    },
  ];

  return (
    <section className="overview-metrics">
      {metrics.map((metric) => (
        <div className="overview-metric" key={metric.label}>
          <strong>{metric.value}</strong>
          <span>{metric.label}</span>
          <small>{metric.meta}</small>
        </div>
      ))}
    </section>
  );
}

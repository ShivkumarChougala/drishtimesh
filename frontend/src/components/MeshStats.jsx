import { useEffect, useState } from "react";
import { getNetworkStats } from "../api/relay";

export default function MeshStats() {
  const [stats, setStats] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const statsData = await getNetworkStats();

        if (!active) return;

        setStats(statsData);
        setLastUpdated(new Date());
      } catch (err) {
        console.error(err);
      }
    }

    load();

    const interval = setInterval(load, 15000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  const show = (value) => {
    if (value === undefined || value === null) return "-";
    if (typeof value === "number") return value.toLocaleString();
    return value;
  };

  return (
    <section className="stats-line">
      <div className="stat">
        <span>Active Sensors</span>
        <strong>{show(stats?.active_nodes)}</strong>
      </div>

      <div className="stat">
        <span>Threat Signals</span>
        <strong>{show(stats?.total_signals)}</strong>
      </div>

      <div className="stat">
        <span>Malicious IPs</span>
        <strong>{show(stats?.malicious_ips)}</strong>
      </div>

      <div className="stat">
        <span>Unique Attackers</span>
        <strong>{show(stats?.unique_ips)}</strong>
      </div>

      {lastUpdated && (
        <div className="stats-refresh-note">
          Updated {lastUpdated.toLocaleTimeString()}
        </div>
      )}
    </section>
  );
}

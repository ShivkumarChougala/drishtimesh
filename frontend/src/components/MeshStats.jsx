import { useEffect, useState } from "react";
import { getHealth, getNetworkStats } from "../api/relay";

export default function MeshStats() {
  const [health, setHealth] = useState("checking");
  const [stats, setStats] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const healthData = await getHealth();
        const statsData = await getNetworkStats();

        if (!active) return;

        setHealth(healthData.status || "online");
        setStats(statsData);
        setLastUpdated(new Date());
      } catch (err) {
        console.error(err);

        if (!active) return;

        setHealth("offline");
      }
    }

    load();

    const interval = setInterval(load, 15000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <section className="stats-line">
      <div className="stat">
        <span>Relay</span>
        <strong>{health}</strong>
      </div>

      <div className="stat">
        <span>Nodes</span>
        <strong>{stats?.total_nodes ?? "—"}</strong>
      </div>

      <div className="stat">
        <span>Signals</span>
        <strong>{stats?.total_signals ?? "—"}</strong>
      </div>

      <div className="stat">
        <span>Unique IPs</span>
        <strong>{stats?.unique_ips ?? "—"}</strong>
      </div>

      {lastUpdated && (
        <div className="stats-refresh-note">
          Updated {lastUpdated.toLocaleTimeString()}
        </div>
      )}
    </section>
  );
}

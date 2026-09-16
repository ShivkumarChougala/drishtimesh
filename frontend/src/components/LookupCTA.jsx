import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function LookupCTA() {
  const navigate = useNavigate();
  const [ip, setIp] = useState("");

  function handleLookup(event) {
    event.preventDefault();

    const value = ip.trim();

    if (!value) {
      navigate("/lookup");
      return;
    }

    navigate(`/lookup?ip=${encodeURIComponent(value)}`);
  }

  return (
    <section className="lookup-v2">
      <div className="lookup-v2-inner">
        <div className="lookup-v2-copy">
          <span className="section-kicker">IP reputation lookup</span>

          <h2>Investigate an IP observed across the mesh.</h2>

          <p>
            Search reputation, observed signals, attack activity and
            intelligence collected across DrishtiMesh sensors.
          </p>
        </div>

        <form className="lookup-v2-form" onSubmit={handleLookup}>
          <input
            type="text"
            value={ip}
            onChange={(event) => setIp(event.target.value)}
            placeholder="Enter an IP address"
            aria-label="IP address"
            autoComplete="off"
            spellCheck="false"
          />

          <button type="submit">
            Lookup
            <span>→</span>
          </button>
        </form>
      </div>
    </section>
  );
}

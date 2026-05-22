import { useState } from "react";
import AnnouncementBar from "../components/AnnouncementBar";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { lookupIp } from "../api/lookup";
import "../styles/lookup.css";

export default function LookupPage() {
  const examples = ["45.153.34.114", "87.121.84.136", "185.220.101.4"];

  const [ip, setIp] = useState("");
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState("idle");

  async function handleSubmit(event) {
    event.preventDefault();

    if (!ip.trim()) return;

    try {
      setStatus("loading");
      setResult(null);

      const data = await lookupIp(ip.trim());

      setResult(data);
      setStatus("success");
    } catch {
      setStatus("error");
      setResult(null);
    }
  }

  function useExample(value) {
    setIp(value);
  }

  return (
    <>
      <AnnouncementBar />
      <Navbar />

      <main className="lookup-page">
        <section className="lookup-hero">
          <div className="kicker">IP lookup</div>

          <h1>Investigate attacker activity observed by community sensors.</h1>

          <p>
            Search an IP address to view reputation, observed activity,
            and evidence collected from the DrishtiMesh network.
          </p>

          <form className="lookup-search" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Enter IP address"
              value={ip}
              onChange={(event) => setIp(event.target.value)}
            />
            <button type="submit">
              {status === "loading" ? "Analyzing..." : "Analyze IP"}
            </button>
          </form>

          <div className="lookup-examples">
            <span>Try</span>
            {examples.map((exampleIp) => (
              <button
                key={exampleIp}
                type="button"
                onClick={() => useExample(exampleIp)}
              >
                {exampleIp}
              </button>
            ))}
          </div>
        </section>

        {status === "idle" && (
          <section className="lookup-placeholder">
            <p>Search an IP address to begin investigation.</p>
          </section>
        )}

        {status === "error" && (
          <section className="lookup-placeholder error">
            <p>No intelligence found for this IP yet.</p>
          </section>
        )}

        {result && (
          <section className="lookup-result-shell">
            <div className="investigation-summary-card">
              <div>
                <div className="kicker">Investigation result</div>
                <h2>{result.ip}</h2>

                <div className="verdict-row">
                  <span className={`verdict-badge ${result.verdict}`}>
                    {result.verdict}
                  </span>
                  <span className="score-pill">
                    Score {result.score}/100
                  </span>
                  <span className="confidence-pill">
                    {result.confidence} confidence
                  </span>
                </div>
              </div>

              <div className="summary-metrics">
                <div>
                  <span>Total signals</span>
                  <strong>{result.total_signals}</strong>
                </div>
                <div>
                  <span>Observed nodes</span>
                  <strong>{result.observed_by_nodes}</strong>
                </div>
                <div>
                  <span>Last seen</span>
                  <strong>
                    {result.last_seen
                      ? new Date(result.last_seen).toLocaleString()
                      : "Unknown"}
                  </strong>
                </div>
                <div>
                  <span>Signals loaded</span>
                  <strong>{result.signals?.length || 0}</strong>
                </div>
              </div>
            </div>
            <div className="why-flagged-card">
              <div>
                <div className="kicker">Evidence summary</div>
                <h3>Why this IP was flagged</h3>
              </div>

              <div className="evidence-list">
                {result.signals?.slice(0, 4).map((signal, index) => (
                  <div className="evidence-item" key={index}>
                    <span>{signal.signal_type?.replaceAll("_", " ")}</span>
                    <strong>{signal.severity}</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className="observed-commands-card">
              <div>
                <div className="kicker">Command evidence</div>
                <h3>Observed commands</h3>
              </div>

              <div className="commands-list">
                {result.signals
                  ?.filter((signal) => signal.raw_command)
                  .slice(0, 6)
                  .map((signal, index) => (
                    <div className="command-row" key={index}>
                      <code>{signal.raw_command}</code>
                      <span>{signal.severity}</span>
                    </div>
                  ))}
              </div>
            </div>

            <div className="network-confirmation-card">
              <div>
                <div className="kicker">Network confirmation</div>
                <h3>Community sensor observations</h3>
              </div>

              <div className="confirmation-grid">
                <div className="confirmation-item">
                  <span>Observed nodes</span>
                  <strong>{result.observed_by_nodes}</strong>
                </div>

                <div className="confirmation-item">
                  <span>Total signals</span>
                  <strong>{result.total_signals}</strong>
                </div>

                <div className="confirmation-item">
                  <span>Confidence</span>
                  <strong>{result.confidence}</strong>
                </div>
              </div>
            </div>

            <div className="recent-signals-card">
              <div>
                <div className="kicker">Recent activity</div>
                <h3>Recent signals</h3>
              </div>

              <div className="signals-table">
                {result.signals?.slice(0, 8).map((signal, index) => (
                  <div className="signal-row" key={index}>
                    <span>
                      {signal.observed_at
                        ? new Date(signal.observed_at).toLocaleString()
                        : "Unknown time"}
                    </span>
                    <strong>{signal.signal_type?.replaceAll("_", " ")}</strong>
                    <em>{signal.severity}</em>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </>
  );
}

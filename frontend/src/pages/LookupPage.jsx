import { useEffect, useState } from "react";
import AnnouncementBar from "../components/AnnouncementBar";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { lookupIp } from "../api/lookup";
import "../styles/lookup.css";

export default function LookupPage() {
  const examples = ["45.148.10.121", "176.65.148.44", "103.150.30.30"];

  const [ip, setIp] = useState("");
  const [result, setResult] = useState(null);
  const [status, setStatus] = useState("idle");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlIp = params.get("ip")?.trim();

    if (!urlIp) return;

    setIp(urlIp);

    async function runLookup() {
      try {
        setStatus("loading");
        setResult(null);

        const data = await lookupIp(urlIp);
        setResult(data);
        setStatus("success");
      } catch {
        setStatus("success");
        setResult({
          ip: urlIp,
          found: false,
          verdict: "unknown",
          score: 0,
          confidence: "none",
          total_signals: 0,
          observed_by_nodes: 0,
          first_seen: null,
          last_seen: null,
          signals: [],
          community_summary: {
            total_observations: 0,
            community_nodes: 0,
          },
          context: {},
        });
      }
    }

    runLookup();
  }, []);

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
      setStatus("success");
      setResult({
        ip: ip.trim(),
        found: false,
        verdict: "unknown",
        score: 0,
        confidence: "none",
        total_signals: 0,
        observed_by_nodes: 0,
        first_seen: null,
        last_seen: null,
        signals: [],
        community_summary: {
          total_observations: 0,
          community_nodes: 0,
        },
        context: {},
      });
    }
  }

  function formatDate(value) {
    return value ? new Date(value).toLocaleString() : "Unknown";
  }

  function formatSignal(value) {
    return value ? value.replaceAll("_", " ") : "Unknown";
  }

  function formatEvidence(signal) {
    if (signal.raw_command) return signal.raw_command;

    const labels = {
      attack_chain_summary: "Multiple suspicious actions were seen in one session",
      proxy_or_tunnel_attempt: "Attempted proxy tunnel through SSH",
      interactive_access: "Successful login to honeypot shell",
      ssh_bruteforce: "Repeated SSH login attempts",
      system_reconnaissance: "Checked system details",
      network_reconnaissance: "Checked network details",
      payload_download_attempt: "Tried to download a payload",
      execution_attempt: "Tried to run a command or file",
    };

    return labels[signal.signal_type] ||
      signal.metadata?.evidence_summary ||
      signal.metadata?.dst_ip ||
      "Normalized honeypot signal";
  }

  function getExplanation() {
    if (!result?.found) {
      return "No community honeypot evidence has been observed for this IP yet.";
    }

    const types = [...new Set((result.signals || []).map((s) => formatSignal(s.signal_type)))];

    if (!types.length) {
      return "This IP has community observations, but no detailed signal evidence is available yet.";
    }

    return `Community honeypot sensors observed this IP performing: ${types.slice(0, 4).join(", ")}.`;
  }

  return (
    <>
      <AnnouncementBar />
      <Navbar />

      <main className="report-page">
      <section className="search-panel">
        <div>
          <p className="eyebrow">DrishtiMesh IP Lookup</p>
          <h1>Community honeypot intelligence report</h1>
        </div>

        <form onSubmit={handleSubmit} className="report-search">
          <input
            value={ip}
            onChange={(event) => setIp(event.target.value)}
            placeholder="Enter IP address"
          />
          <button>{status === "loading" ? "Checking..." : "Lookup"}</button>
        </form>

        <div className="examples">
          <span>Try:</span>
          {examples.map((item) => (
            <button key={item} type="button" onClick={() => setIp(item)}>
              {item}
            </button>
          ))}
        </div>
      </section>

      {!result && (
        <section className="empty-report">
          Search an IP address to generate a reputation report.
        </section>
      )}

      {result && (
        <section className="report-shell">
          <div className="report-header">
            <div>
              <p className="eyebrow">Reputation report</p>
              <h2>{result.ip}</h2>
              <p className="updated">
                Updated {formatDate(result.last_seen)} · Source: DrishtiMesh Community Mesh
              </p>
            </div>

            <div className="score-block">
              <strong>{result.score}</strong>
              <span className={`verdict-pill ${result.verdict}`}>
                {result.verdict} · {result.confidence} confidence
              </span>
            </div>
          </div>

          <div className="metric-grid">
            <div>
              <span>Signals</span>
              <strong>{result.total_signals || 0}</strong>
            </div>
            <div>
              <span>Community nodes</span>
              <strong>{result.observed_by_nodes || 0}</strong>
            </div>
            <div>
              <span>Verdict</span>
              <strong>{result.verdict}</strong>
            </div>
            <div>
              <span>Confidence</span>
              <strong>{result.confidence}</strong>
            </div>
          </div>

          <div className="report-grid">
            <section className="card explanation-card">
              <h3>Analyst Summary</h3>
              <p>{getExplanation()}</p>

              <div className="analyst-points">
                <p>
                  <strong>Evidence strength:</strong>{" "}
                  {result.total_signals || 0} normalized signals from{" "}
                  {result.observed_by_nodes || 0} community sensor.
                </p>

                <p>
                  <strong>Last observed:</strong>{" "}
                  {formatDate(result.last_seen)}.
                </p>
              </div>

              <div className="summary-meta">
                Observed by {result.observed_by_nodes || 0} community sensor ·{" "}
                {result.total_signals || 0} total signals
              </div>
            </section>

            <section className="card context-card">
              <h3>IP Context</h3>

              <div className="context-grid">
                <div>
                  <span>Country</span>
                  <strong>{result.context?.country || "Unknown"}</strong>
                </div>
                <div>
                  <span>City</span>
                  <strong>{result.context?.city || "Unknown"}</strong>
                </div>
                <div>
                  <span>ASN</span>
                  <strong>{result.context?.asn || "Unknown"}</strong>
                </div>
                <div>
                  <span>ISP</span>
                  <strong>{result.context?.isp || "Unknown"}</strong>
                </div>
                <div>
                  <span>Region</span>
                  <strong>{result.context?.region || "Unknown"}</strong>
                </div>
                <div>
                  <span>Timezone</span>
                  <strong>{result.context?.timezone || "Unknown"}</strong>
                </div>
              </div>
            </section>

            <section className="card intel-card">
              <h3>Threat Intel</h3>

              {result.threat_intel?.matched ? (
                <>
                  <div className="intel-summary">
                    <strong>
                      {result.threat_intel.match_count} threat intel match
                      {result.threat_intel.match_count > 1 ? "es" : ""}
                    </strong>
                    <p>Sources: {result.threat_intel.sources.join(", ")}</p>
                  </div>

                  <div className="intel-list">
                    {result.threat_intel.matches.map((match, index) => (
                      <div className="intel-item" key={index}>
                        <div>
                          <span>Matched Range</span>
                          <strong>{match.indicator_value}</strong>
                        </div>
                        <div>
                          <span>Category</span>
                          <strong>{match.category}</strong>
                        </div>
                        <div>
                          <span>Confidence</span>
                          <strong>{match.confidence}</strong>
                        </div>
                        <div>
                          <span>Source</span>
                          <strong>{match.source_name}</strong>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="intel-empty">
                  No open-source threat intelligence match found.
                </div>
              )}
            </section>
          </div>

          <section className="card evidence-card">
            <h3>Signal Evidence</h3>

            <div className="evidence-table">
              <div className="evidence-row evidence-head">
                <span>Type</span>
                <span>Evidence</span>
                <span>Source</span>
                <span>Severity</span>
                <span>Time</span>
              </div>

              {(result.signals || []).slice(0, 30).map((signal, index) => (
                <div className="evidence-row" key={index}>
                  <span>{formatSignal(signal.signal_type)}</span>
                  <strong>
                    {formatEvidence(signal)}
                  </strong>
                  <span>{signal.sensor || "community"}</span>
                  <em className={`severity ${signal.severity || "unknown"}`}>
                    {signal.severity || "unknown"}
                  </em>
                  <span>{formatDate(signal.observed_at)}</span>
                </div>
              ))}

              {(!result.signals || result.signals.length === 0) && (
                <div className="evidence-row">
                  <span>No signal</span>
                  <strong>No community evidence available yet</strong>
                  <span>DrishtiMesh</span>
                  <em className="severity unknown">unknown</em>
                  <span>Unknown</span>
                </div>
              )}
            </div>
          </section>
        </section>
      )}
      </main>

      <Footer />
    </>
  );
}

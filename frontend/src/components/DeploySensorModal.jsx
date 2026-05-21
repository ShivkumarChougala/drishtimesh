import { useState } from "react";
import { registerNode } from "../api/relay";

const RELAY_URL =
  import.meta.env.VITE_API_BASE_URL || "http://139.84.172.22:8000";

export default function DeploySensorModal({ open, onClose }) {
  const [form, setForm] = useState({
    node_name: "",
    sensor_type: "cowrie",
    country: "",
    region: "",
    provider: "",
  });

  const [loading, setLoading] = useState(false);
  const [node, setNode] = useState(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  if (!open) return null;

  async function handleSubmit(e) {
    e.preventDefault();

    setLoading(true);
    setError("");
    setNode(null);
    setCopied(false);

    try {
      const data = await registerNode(form);
      console.log("registered node response:", data);
      setNode(data);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to register node");
    } finally {
      setLoading(false);
    }
  }

  const nodeId = node?.node_id || node?.id || "";

  const token =
    node?.api_token ||
    node?.token ||
    node?.node_token ||
    node?.node_api_token ||
    "";

  const installCommand =
    nodeId && token
      ? `curl -fsSL https://deploy.drishtimesh.io/install.sh | sudo bash -s -- --relay ${RELAY_URL} --node-id ${nodeId} --token ${token}`
      : "";

  async function copyCommand() {
    if (!installCommand) {
      setError("Install command is empty. Backend did not return node token.");
      return;
    }

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(installCommand);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = installCommand;
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch (err) {
      console.error(err);
      setError("Copy failed. Select the command manually.");
    }
  }

  function resetModal() {
    setForm({
      node_name: "",
      sensor_type: "cowrie",
      country: "",
      region: "",
      provider: "",
    });

    setNode(null);
    setError("");
    setCopied(false);

    onClose();
  }

  return (
    <div className="modal-backdrop">
      {copied && (
        <div className="toast">
          Install command copied
        </div>
      )}

      <div className="modal">
        <button className="modal-close" onClick={resetModal}>
          ×
        </button>

        <div className="kicker">Deploy sensor</div>

        <h2>
          {node ? "Node registered." : "Register a new node."}
        </h2>

        {!node ? (
          <form onSubmit={handleSubmit} className="deploy-form">
            <label>
              Node name
              <input
                placeholder="blr-cowrie-01"
                value={form.node_name}
                onChange={(e) =>
                  setForm({ ...form, node_name: e.target.value })
                }
              />
            </label>

            <label>
              Country
              <input
                placeholder="India"
                value={form.country}
                onChange={(e) =>
                  setForm({ ...form, country: e.target.value })
                }
              />
            </label>

            <label>
              Region
              <input
                placeholder="Bangalore"
                value={form.region}
                onChange={(e) =>
                  setForm({ ...form, region: e.target.value })
                }
              />
            </label>

            <label>
              Provider
              <input
                placeholder="Vultr / Hetzner / AWS"
                value={form.provider}
                onChange={(e) =>
                  setForm({ ...form, provider: e.target.value })
                }
              />
            </label>

            {error && <p className="modal-error">{error}</p>}

            <button className="primary" disabled={loading}>
              {loading ? "Registering..." : "Generate install command"}
            </button>
          </form>
        ) : (
          <div className="command-result">
            <p className="modal-copy">
              Copy this command and run it on the VPS you want to turn into a DrishtiMesh sensor.
            </p>

            <div className="node-summary">
              <div>
                <span>Node ID</span>
                <strong>{nodeId || "missing"}</strong>
              </div>

              <div>
                <span>Relay</span>
                <strong>{RELAY_URL}</strong>
              </div>
            </div>

            {error && <p className="modal-error">{error}</p>}

            <pre>{installCommand || "Install command unavailable: missing node token from API response."}</pre>

            <div className="modal-actions">
              <button
                className="primary"
                onClick={copyCommand}
                disabled={!installCommand}
              >
                {copied ? "Copied" : "Copy command"}
              </button>

              <button className="secondary" onClick={resetModal}>
                Done
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

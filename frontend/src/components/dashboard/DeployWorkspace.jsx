import { useState } from "react";
import { registerNode } from "../../api/relay";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://139.84.172.22:8000";

const locations = {
  India: ["Bangalore", "Mumbai", "Delhi"],
  "United States": ["New Jersey", "New York", "Los Angeles"],
  Germany: ["Frankfurt", "Berlin"],
  Singapore: ["Singapore"],
  Netherlands: ["Amsterdam"],
};

const providers = ["Vultr", "AWS", "DigitalOcean", "Hetzner", "Custom VPS"];

export default function DeployWorkspace({ onCreated }) {
  const [creating, setCreating] = useState(false);
  const [sensor, setSensor] = useState(null);
  const [copied, setCopied] = useState(false);

  const [nodeName, setNodeName] = useState("");
  const [country, setCountry] = useState("");
  const [region, setRegion] = useState("");
  const [provider, setProvider] = useState("");

  const canCreate =
    nodeName.trim() &&
    country.trim() &&
    region.trim() &&
    provider.trim() &&
    !creating;

  function handleCountryChange(value) {
    setCountry(value);
    setRegion("");
  }

  async function createSensor() {
    if (!canCreate) return;

    try {
      setCreating(true);
      setCopied(false);

      const data = await registerNode({
        sensor_type: "cowrie",
        node_name: nodeName.trim(),
        country,
        region,
        provider,
      });

      setSensor(data);
      onCreated?.();
    } catch {
      alert("Failed to create sensor");
    } finally {
      setCreating(false);
    }
  }

  const installCommand = sensor
    ? `curl -fsSL ${API_BASE_URL}/downloads/install.sh -o install.sh && sudo bash install.sh --relay ${API_BASE_URL} --node-id "${sensor.node_id}" --token "${sensor.api_token}"`
    : "";

  async function copyCommand() {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(installCommand);
      } else {
        const textarea = document.createElement("textarea");
        textarea.value = installCommand;
        textarea.style.position = "fixed";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }

      setCopied(true);
    } catch {
      alert("Copy failed. Please select and copy the command manually.");
    }
  }

  return (
    <section className="dash-panel deploy-workspace">
      <h2>Deployment Workspace</h2>
      <p className="dash-muted">
        Create a named sensor and connect your VPS to DrishtiMesh.
      </p>

      {!sensor && (
        <div className="deploy-empty">
          <div className="deploy-form">
            <label>
              <span>Sensor name</span>
              <input
                placeholder="ex: bangalore-vultr-01"
                value={nodeName}
                onChange={(e) => setNodeName(e.target.value)}
              />
            </label>

            <label>
              <span>Country</span>
              <select
                value={country}
                onChange={(e) => handleCountryChange(e.target.value)}
              >
                <option value="">Select country</option>
                {Object.keys(locations).map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </label>

            <label>
              <span>Region</span>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                disabled={!country}
              >
                <option value="">Select region</option>
                {(locations[country] || []).map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </label>

            <label>
              <span>Provider</span>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value)}
              >
                <option value="">Select provider</option>
                {providers.map((item) => (
                  <option key={item} value={item}>{item}</option>
                ))}
              </select>
            </label>
          </div>

          <button
            className="deploy-button"
            onClick={createSensor}
            disabled={!canCreate}
          >
            {creating ? "Creating sensor..." : "Create Sensor"}
          </button>
        </div>
      )}

      {sensor && (
        <div className="deploy-result">
          <div className="deploy-meta">
            <span>Sensor created</span>
            <strong>{nodeName}</strong>
          </div>

          <div className="deploy-meta">
            <span>Node ID</span>
            <strong>{sensor.node_id}</strong>
          </div>

          <p className="dash-muted">Run this command on your VPS:</p>

          <code className="deploy-command">{installCommand}</code>

          <button className="deploy-button" onClick={copyCommand}>
            {copied ? "Copied" : "Copy Install Command"}
          </button>

          <button
            className="deploy-secondary-button"
            onClick={() => {
              setSensor(null);
              setCopied(false);
              setNodeName("");
              setCountry("");
              setRegion("");
              setProvider("");
            }}
          >
            Create Another Sensor
          </button>
        </div>
      )}
    </section>
  );
}

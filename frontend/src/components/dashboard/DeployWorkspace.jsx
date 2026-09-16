import { useState } from "react";
import { registerNode } from "../../api/relay";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://139.84.172.22:8000";

export default function DeployWorkspace({ onCreated }) {
  const [creating, setCreating] = useState(false);
  const [sensor, setSensor] = useState(null);
  const [copied, setCopied] = useState(false);

  const [nodeName, setNodeName] = useState("");
  const [location, setLocation] = useState("");
  const [provider, setProvider] = useState("");

  const canCreate = nodeName.trim() && !creating;

  async function createSensor() {
    if (!canCreate) return;

    try {
      setCreating(true);
      setCopied(false);

      /*
       * Backend currently stores country + region separately.
       * Until we introduce a dedicated location column, keep the
       * user-entered location in country and leave region empty.
       */
      const data = await registerNode({
        sensor_type: "cowrie",
        node_name: nodeName.trim(),
        country: location.trim() || null,
        region: null,
        provider: provider.trim() || null,
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

  function resetForm() {
    setSensor(null);
    setCopied(false);
    setNodeName("");
    setLocation("");
    setProvider("");
  }

  return (
    <section className="dash-panel deploy-workspace">
      <h2>Deploy Sensor</h2>

      <p className="dash-muted">
        Register a sensor and connect it to DrishtiMesh.
      </p>

      {!sensor && (
        <div className="deploy-empty">
          <div className="deploy-form">
            <label>
              <span>
                Sensor name <b className="deploy-required">*</b>
              </span>

              <input
                type="text"
                placeholder="e.g. belagavi-home-01"
                value={nodeName}
                onChange={(event) => setNodeName(event.target.value)}
                autoComplete="off"
              />
            </label>

            <label>
              <span>Sensor type</span>

              <div className="deploy-readonly-field">
                <div>
                  <strong>Cowrie SSH</strong>
                  <small>SSH honeypot sensor</small>
                </div>

                <span>Default</span>
              </div>
            </label>

            <label>
              <span>
                Location <small className="deploy-optional">Optional</small>
              </span>

              <input
                type="text"
                placeholder="e.g. Bangalore, India"
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                autoComplete="off"
              />
            </label>

            <label>
              <span>
                Provider / environment{" "}
                <small className="deploy-optional">Optional</small>
              </span>

              <input
                type="text"
                placeholder="e.g. Vultr, AWS, Home Lab"
                value={provider}
                onChange={(event) => setProvider(event.target.value)}
                autoComplete="off"
              />
            </label>
          </div>

          <div className="deploy-form-footer">
            <button
              type="button"
              className="deploy-button"
              onClick={createSensor}
              disabled={!canCreate}
            >
              {creating ? "Creating sensor..." : "Create sensor"}
            </button>

            <span>Only the sensor name is required.</span>
          </div>
        </div>
      )}

      {sensor && (
        <div className="deploy-result">
          <div className="deploy-success-head">
            <span className="deploy-success-dot"></span>

            <div>
              <strong>Sensor registered</strong>
              <span>
                Run the installation command on the machine you want to
                connect.
              </span>
            </div>
          </div>

          <div className="deploy-meta">
            <span>Sensor</span>
            <strong>{nodeName}</strong>
          </div>

          <div className="deploy-meta">
            <span>Type</span>
            <strong>Cowrie SSH</strong>
          </div>

          <div className="deploy-meta">
            <span>Node ID</span>
            <strong>{sensor.node_id}</strong>
          </div>

          <div className="deploy-command-section">
            <span>Installation command</span>

            <code className="deploy-command">{installCommand}</code>
          </div>

          <div className="deploy-result-actions">
            <button
              type="button"
              className="deploy-button"
              onClick={copyCommand}
            >
              {copied ? "Copied" : "Copy install command"}
            </button>

            <button
              type="button"
              className="deploy-secondary-button"
              onClick={resetForm}
            >
              Create another sensor
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

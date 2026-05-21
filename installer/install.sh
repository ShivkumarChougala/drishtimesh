#!/usr/bin/env bash
set -Eeuo pipefail

APP_NAME="DrishtiMesh"
SENSOR_NAME="Cowrie Sensor"

INSTALL_DIR="/opt/drishtimesh"
COWRIE_DIR="${INSTALL_DIR}/cowrie"
AGENT_DIR="${INSTALL_DIR}/agent"
LOG_DIR="/var/log/drishtimesh"
CONFIG_FILE="${INSTALL_DIR}/config.env"

RELAY_URL="http://139.84.172.22:8000"
NODE_NAME="drishtimesh-cowrie-node"
SENSOR_TYPE="cowrie"
COUNTRY="unknown"
PROVIDER="unknown"
REGION="unknown"
HONEYPOT_PORT="2222"

NODE_ID=""
NODE_TOKEN=""

log() {
  echo -e "[DrishtiMesh] $1"
}

fail() {
  echo -e "[DrishtiMesh] ERROR: $1"
  exit 1
}

usage() {
  cat <<USAGE
DrishtiMesh Cowrie Sensor Installer

Usage:
  sudo bash install.sh --relay RELAY_URL --node-id NODE_ID --token NODE_TOKEN

Example:
  curl -fsSL https://deploy.drishtimesh.io/install.sh | sudo bash -s -- \\
    --relay http://139.84.172.22:8000 \\
    --node-id 00000000-0000-0000-0000-000000000000 \\
    --token NODE_TOKEN

Options:
  --relay        Relay URL, default http://139.84.172.22:8000
  --node-id      Existing registered node ID from relay
  --token        Existing node token from relay
  --name         Sensor name
  --sensor-type  Sensor type, default cowrie
  --country      Sensor country
  --provider     VPS provider
  --region       VPS region
  --port         Cowrie SSH trap port, default 2222
  -h, --help     Show help
USAGE
}

parse_args() {
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --relay)
        RELAY_URL="${2:-}"
        shift 2
        ;;
      --node-id)
        NODE_ID="${2:-}"
        shift 2
        ;;
      --token)
        NODE_TOKEN="${2:-}"
        shift 2
        ;;
      --name)
        NODE_NAME="${2:-}"
        shift 2
        ;;
      --sensor-type)
        SENSOR_TYPE="${2:-}"
        shift 2
        ;;
      --country)
        COUNTRY="${2:-}"
        shift 2
        ;;
      --provider)
        PROVIDER="${2:-}"
        shift 2
        ;;
      --region)
        REGION="${2:-}"
        shift 2
        ;;
      --port)
        HONEYPOT_PORT="${2:-}"
        shift 2
        ;;
      -h|--help)
        usage
        exit 0
        ;;
      *)
        fail "Unknown option: $1"
        ;;
    esac
  done

  [ -n "${RELAY_URL}" ] || fail "--relay cannot be empty"
  [ -n "${NODE_NAME}" ] || fail "--name cannot be empty"
}

header() {
  clear
  echo "=================================================="
  echo "        DrishtiMesh Enterprise Sensor Setup        "
  echo "=================================================="
  echo " Sensor     : ${SENSOR_NAME}"
  echo " Node Name  : ${NODE_NAME}"
  echo " Country    : ${COUNTRY}"
  echo " Provider   : ${PROVIDER}"
  echo " Region     : ${REGION}"
  echo " Relay URL  : ${RELAY_URL}"
  echo " Install to : ${INSTALL_DIR}"
  echo " SSH Trap   : ${HONEYPOT_PORT}/tcp"
  echo "=================================================="
  echo
}

require_root() {
  if [ "${EUID}" -ne 0 ]; then
    fail "Please run this installer as root."
  fi
}

detect_os() {
  if [ ! -f /etc/os-release ]; then
    fail "Cannot detect operating system."
  fi

  . /etc/os-release

  case "${ID}" in
    ubuntu|debian)
      log "Detected OS: ${PRETTY_NAME}"
      ;;
    *)
      fail "Unsupported OS: ${PRETTY_NAME}. Use Ubuntu or Debian."
      ;;
  esac
}

install_base_packages() {
  log "Installing base packages..."
  apt update -y
  apt install -y ca-certificates curl git jq python3 python3-venv python3-pip ufw
}

create_layout() {
  log "Creating DrishtiMesh directory layout..."

  mkdir -p "${INSTALL_DIR}"
  mkdir -p "${COWRIE_DIR}"
  mkdir -p "${AGENT_DIR}"
  mkdir -p "${LOG_DIR}"

  chmod 755 "${INSTALL_DIR}"
  chmod 755 "${COWRIE_DIR}"
  chmod 755 "${AGENT_DIR}"
  chmod 755 "${LOG_DIR}"
}

register_node() {
  if [ -n "${NODE_ID}" ] && [ -n "${NODE_TOKEN}" ]; then
    log "Using existing node credentials from command arguments..."
    return
  fi

  log "Registering sensor with DrishtiMesh relay..."

  RESPONSE="$(curl -fsS -X POST "${RELAY_URL}/nodes/register" \
    -H "Content-Type: application/json" \
    -d "{
      \"node_name\": \"${NODE_NAME}\",
      \"sensor_type\": \"${SENSOR_TYPE}\",
      \"provider\": \"${PROVIDER}\",
      \"region\": \"${REGION}\",
      \"country\": \"${COUNTRY}\"
    }")" || fail "Node registration failed. Check relay URL."

  NODE_ID="$(echo "${RESPONSE}" | jq -r '.node_id // .id // empty')"
  NODE_TOKEN="$(echo "${RESPONSE}" | jq -r '.api_token // .token // .node_token // empty')"

  if [ -z "${NODE_ID}" ] || [ "${NODE_ID}" = "null" ]; then
    echo "${RESPONSE}"
    fail "Relay did not return node_id"
  fi

  if [ -z "${NODE_TOKEN}" ] || [ "${NODE_TOKEN}" = "null" ]; then
    echo "${RESPONSE}"
    fail "Relay did not return api_token"
  fi

  log "Registered node: ${NODE_ID}"
}

write_config() {

  log "Writing sensor configuration..."

  cat > "${CONFIG_FILE}" <<CFG
RELAY_URL=${RELAY_URL}
NODE_ID=${NODE_ID}
NODE_TOKEN=${NODE_TOKEN}
NODE_NAME=${NODE_NAME}
SENSOR_TYPE=${SENSOR_TYPE}
COUNTRY=${COUNTRY}
PROVIDER=${PROVIDER}
REGION=${REGION}
INSTALL_DIR=${INSTALL_DIR}
COWRIE_DIR=${COWRIE_DIR}
AGENT_DIR=${AGENT_DIR}
LOG_DIR=${LOG_DIR}
HONEYPOT_PORT=${HONEYPOT_PORT}
COWRIE_JSON_PATH=${COWRIE_DIR}/var/log/cowrie/cowrie.json
CFG

  chmod 600 "${CONFIG_FILE}"

  log "Config written to ${CONFIG_FILE}"
}

test_heartbeat() {
  log "Testing heartbeat..."

  curl -fsS -X POST "${RELAY_URL}/nodes/heartbeat" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${NODE_TOKEN}" \
    -d "{
      \"node_id\": \"${NODE_ID}\",
      \"status\": \"online\",
      \"version\": \"installer-test\"
    }" >/tmp/drishtimesh-heartbeat-response.json \
    || fail "Heartbeat test failed"

  cat /tmp/drishtimesh-heartbeat-response.json
  echo
  log "Heartbeat test successful"
}

summary() {
  echo
  echo "=================================================="
  echo " DrishtiMesh self-registration completed "
  echo "=================================================="
  echo
  echo "Node:"
  echo "  Name : ${NODE_NAME}"
  echo "  ID   : ${NODE_ID}"
  echo
  echo "Config:"
  echo "  ${CONFIG_FILE}"
  echo
  echo "Services:"
  echo "  cowrie.service"
  echo "  drishtimesh-agent.service"
  echo "  drishtimesh-agent.timer"
  echo
}



install_agent() {
  log "Deploying DrishtiMesh agent..."

  rm -rf "${AGENT_DIR}"

  mkdir -p "${AGENT_DIR}"

  cp -r installer/payload/node-agent/* "${AGENT_DIR}/"

  log "Agent files deployed"

  python3 -m venv "${AGENT_DIR}/venv"

  "${AGENT_DIR}/venv/bin/pip" install --upgrade pip

  "${AGENT_DIR}/venv/bin/pip" install \
    -r "${AGENT_DIR}/requirements.txt"

  log "Python environment prepared"

  mkdir -p "${COWRIE_DIR}/var/log/cowrie"
  touch "${COWRIE_DIR}/var/log/cowrie/cowrie.json"

  cat > "${AGENT_DIR}/.env" <<CFG
RELAY_URL=${RELAY_URL}
NODE_ID=${NODE_ID}
NODE_TOKEN=${NODE_TOKEN}
SENSOR_TYPE=${SENSOR_TYPE}
COUNTRY=${COUNTRY}
PROVIDER=${PROVIDER}
REGION=${REGION}
COWRIE_JSON_PATH=${COWRIE_DIR}/var/log/cowrie/cowrie.json
CFG

  chmod 600 "${AGENT_DIR}/.env"

  log "Agent configuration written"
}

test_agent() {
  log "Verifying DrishtiMesh agent..."

  cd "${AGENT_DIR}"

  if "${AGENT_DIR}/venv/bin/python" main.py; then
    log "Agent executed successfully"
  else
    fail "Agent execution failed"
  fi
}


main() {
  parse_args "$@"
  header
  require_root
  detect_os
  install_base_packages
  create_layout
  register_node
  write_config
  install_cowrie
  install_agent
  test_agent
  install_cowrie_service
  install_agent_service
  enable_services
  test_heartbeat
  summary
}


install_cowrie_service() {
  log "Installing Cowrie systemd service..."

  cat > /etc/systemd/system/cowrie.service <<SERVICE
[Unit]
Description=DrishtiMesh Cowrie SSH Honeypot
After=network.target

[Service]
Type=simple
User=cowrie
Group=cowrie
WorkingDirectory=${COWRIE_DIR}
ExecStart=${COWRIE_DIR}/cowrie-env/bin/twistd --nodaemon cowrie
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
SERVICE

  systemctl daemon-reload

  log "Cowrie service installed"
}

install_agent_service() {
  log "Installing DrishtiMesh agent service..."

  cat > /etc/systemd/system/drishtimesh-agent.service <<SERVICE
[Unit]
Description=DrishtiMesh Node Agent
After=network.target cowrie.service

[Service]
Type=oneshot
WorkingDirectory=${AGENT_DIR}
ExecStart=${AGENT_DIR}/venv/bin/python ${AGENT_DIR}/main.py
SERVICE

  cat > /etc/systemd/system/drishtimesh-agent.timer <<TIMER
[Unit]
Description=Run DrishtiMesh Node Agent periodically

[Timer]
OnBootSec=30
OnUnitActiveSec=60
Unit=drishtimesh-agent.service

[Install]
WantedBy=timers.target
TIMER

  systemctl daemon-reload

  log "Agent service installed"
}

enable_services() {
  log "Enabling DrishtiMesh services..."

  systemctl enable --now cowrie
  systemctl enable --now drishtimesh-agent.timer

  log "Services enabled"
}


install_cowrie() {
  log "Installing Cowrie honeypot..."

  apt install -y \
    build-essential \
    libssl-dev \
    libffi-dev \
    python3-dev \
    authbind >/dev/null 2>&1

  id cowrie >/dev/null 2>&1 || useradd -r -m -d /opt/cowrie -s /usr/sbin/nologin cowrie

  systemctl stop cowrie >/dev/null 2>&1 || true

  rm -rf "${COWRIE_DIR}"

  git clone https://github.com/cowrie/cowrie "${COWRIE_DIR}" >/dev/null 2>&1

  python3 -m venv "${COWRIE_DIR}/cowrie-env"

  "${COWRIE_DIR}/cowrie-env/bin/pip" install --upgrade pip >/dev/null 2>&1
  "${COWRIE_DIR}/cowrie-env/bin/pip" install -r "${COWRIE_DIR}/requirements.txt" >/dev/null 2>&1
  "${COWRIE_DIR}/cowrie-env/bin/pip" install -e "${COWRIE_DIR}" >/dev/null 2>&1

  cp "${COWRIE_DIR}/etc/cowrie.cfg.dist" "${COWRIE_DIR}/etc/cowrie.cfg"

  mkdir -p "${COWRIE_DIR}/var/log/cowrie"
  touch "${COWRIE_DIR}/var/log/cowrie/cowrie.json"

  chown -R cowrie:cowrie "${COWRIE_DIR}"

  log "Cowrie installed successfully"
}

main "$@"

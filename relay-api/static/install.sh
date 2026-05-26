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

REAL_SSH_PORT="2222"
HONEYPOT_PORT="22"

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

Options:
  --relay        Relay URL
  --node-id      Existing registered node ID
  --token        Existing node token
  --name         Sensor name
  --sensor-type  Sensor type
  --country      Sensor country
  --provider     VPS provider
  --region       VPS region
  --ssh-port     Real SSH port, default 2222
  --trap-port    Honeypot port, default 22
  -h, --help     Show help
USAGE
}

parse_args() {
  while [[ $# -gt 0 ]]; do
    case "$1" in
      --relay) RELAY_URL="${2:-}"; shift 2 ;;
      --node-id) NODE_ID="${2:-}"; shift 2 ;;
      --token) NODE_TOKEN="${2:-}"; shift 2 ;;
      --name) NODE_NAME="${2:-}"; shift 2 ;;
      --sensor-type) SENSOR_TYPE="${2:-}"; shift 2 ;;
      --country) COUNTRY="${2:-}"; shift 2 ;;
      --provider) PROVIDER="${2:-}"; shift 2 ;;
      --region) REGION="${2:-}"; shift 2 ;;
      --ssh-port) REAL_SSH_PORT="${2:-}"; shift 2 ;;
      --trap-port) HONEYPOT_PORT="${2:-}"; shift 2 ;;
      -h|--help) usage; exit 0 ;;
      *) fail "Unknown option: $1" ;;
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
  echo " Sensor       : ${SENSOR_NAME}"
  echo " Node Name    : ${NODE_NAME}"
  echo " Country      : ${COUNTRY}"
  echo " Provider     : ${PROVIDER}"
  echo " Region       : ${REGION}"
  echo " Relay URL    : ${RELAY_URL}"
  echo " Install to   : ${INSTALL_DIR}"
  echo " Real SSH     : ${REAL_SSH_PORT}/tcp"
  echo " Honeypot SSH : ${HONEYPOT_PORT}/tcp"
  echo "=================================================="
  echo
}

require_root() {
  [ "${EUID}" -eq 0 ] || fail "Please run this installer as root."
}

detect_os() {
  [ -f /etc/os-release ] || fail "Cannot detect operating system."
  . /etc/os-release

  case "${ID}" in
    ubuntu|debian) log "Detected OS: ${PRETTY_NAME}" ;;
    *) fail "Unsupported OS: ${PRETTY_NAME}. Use Ubuntu or Debian." ;;
  esac
}

install_base_packages() {
  log "Installing base packages..."
  apt update -y
  apt install -y ca-certificates curl git jq python3 python3-venv python3-pip ufw \
    build-essential libssl-dev libffi-dev python3-dev authbind
}

configure_firewall() {
  log "Configuring firewall..."

  ufw allow "${REAL_SSH_PORT}/tcp"
  ufw allow "${HONEYPOT_PORT}/tcp"
  ufw --force enable

  log "Firewall ready: ${HONEYPOT_PORT}=honeypot, ${REAL_SSH_PORT}=real SSH"
}

move_real_ssh_port() {
  log "Moving real SSH to port ${REAL_SSH_PORT}..."

  cp /etc/ssh/sshd_config /etc/ssh/sshd_config.drishtimesh.backup

  if grep -qE "^[# ]*Port " /etc/ssh/sshd_config; then
    sed -i -E "s/^[# ]*Port .*/Port ${REAL_SSH_PORT}/" /etc/ssh/sshd_config
  else
    echo "Port ${REAL_SSH_PORT}" >> /etc/ssh/sshd_config
  fi

  sshd -t || fail "SSH config test failed. Backup saved at /etc/ssh/sshd_config.drishtimesh.backup"

  systemctl restart ssh || systemctl restart sshd

  log "Real SSH is now on port ${REAL_SSH_PORT}"
}

create_layout() {
  log "Creating DrishtiMesh directory layout..."

  mkdir -p "${INSTALL_DIR}" "${COWRIE_DIR}" "${AGENT_DIR}" "${LOG_DIR}"
  chmod 755 "${INSTALL_DIR}" "${COWRIE_DIR}" "${AGENT_DIR}" "${LOG_DIR}"
}

register_node() {
  if [ -n "${NODE_ID}" ] && [ -n "${NODE_TOKEN}" ]; then
    log "Using existing node credentials..."
    return
  fi

  log "Registering sensor with relay..."

  RESPONSE="$(curl -fsS -X POST "${RELAY_URL}/nodes/register" \
    -H "Content-Type: application/json" \
    -d "{
      \"node_name\": \"${NODE_NAME}\",
      \"sensor_type\": \"${SENSOR_TYPE}\",
      \"provider\": \"${PROVIDER}\",
      \"region\": \"${REGION}\",
      \"country\": \"${COUNTRY}\"
    }")" || fail "Node registration failed."

  NODE_ID="$(echo "${RESPONSE}" | jq -r '.node_id // .id // empty')"
  NODE_TOKEN="$(echo "${RESPONSE}" | jq -r '.api_token // .token // .node_token // empty')"

  [ -n "${NODE_ID}" ] && [ "${NODE_ID}" != "null" ] || fail "Relay did not return node_id"
  [ -n "${NODE_TOKEN}" ] && [ "${NODE_TOKEN}" != "null" ] || fail "Relay did not return token"

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
REAL_SSH_PORT=${REAL_SSH_PORT}
HONEYPOT_PORT=${HONEYPOT_PORT}
COWRIE_JSON_PATH=${COWRIE_DIR}/var/log/cowrie/cowrie.json
CFG

  chmod 600 "${CONFIG_FILE}"
}

install_cowrie() {
  log "Installing Cowrie honeypot..."

  id cowrie >/dev/null 2>&1 || useradd -r -m -d /opt/cowrie -s /usr/sbin/nologin cowrie

  systemctl stop cowrie >/dev/null 2>&1 || true

  rm -rf "${COWRIE_DIR}"
  git clone https://github.com/cowrie/cowrie "${COWRIE_DIR}" || fail "Failed to clone Cowrie repository"

  python3 -m venv "${COWRIE_DIR}/cowrie-env"

  "${COWRIE_DIR}/cowrie-env/bin/pip" install --upgrade pip >/dev/null 2>&1
  "${COWRIE_DIR}/cowrie-env/bin/pip" install -r "${COWRIE_DIR}/requirements.txt" >/dev/null 2>&1
  "${COWRIE_DIR}/cowrie-env/bin/pip" install -e "${COWRIE_DIR}" >/dev/null 2>&1

  mkdir -p "${COWRIE_DIR}/etc"
  cp "${COWRIE_DIR}/src/cowrie/data/etc/cowrie.cfg.dist" "${COWRIE_DIR}/etc/cowrie.cfg"

  mkdir -p "${COWRIE_DIR}/var/log/cowrie"
  touch "${COWRIE_DIR}/var/log/cowrie/cowrie.json"

  log "Configuring Cowrie on port ${HONEYPOT_PORT}..."

  sed -i "s/^listen_endpoints.*/listen_endpoints = tcp:${HONEYPOT_PORT}:interface=0.0.0.0/" \
    "${COWRIE_DIR}/etc/cowrie.cfg"

  mkdir -p /etc/authbind/byport
  touch "/etc/authbind/byport/${HONEYPOT_PORT}"
  chown cowrie:cowrie "/etc/authbind/byport/${HONEYPOT_PORT}"
  chmod 500 "/etc/authbind/byport/${HONEYPOT_PORT}"

  chown -R cowrie:cowrie "${COWRIE_DIR}"

  log "Cowrie installed successfully"
}

install_agent() {
  log "Deploying DrishtiMesh agent..."

  rm -rf "${AGENT_DIR}"
  mkdir -p "${AGENT_DIR}"

  AGENT_BUNDLE_URL="${RELAY_URL}/downloads/node-agent.tar.gz"

  curl -fsSL "${AGENT_BUNDLE_URL}" -o /tmp/drishtimesh-node-agent.tar.gz \
    || fail "Failed to download DrishtiMesh agent bundle"

  rm -rf /tmp/node-agent
  tar -xzf /tmp/drishtimesh-node-agent.tar.gz -C /tmp

  cp -r /tmp/node-agent/* "${AGENT_DIR}/"

  python3 -m venv "${AGENT_DIR}/venv"
  "${AGENT_DIR}/venv/bin/pip" install --upgrade pip
  "${AGENT_DIR}/venv/bin/pip" install -r "${AGENT_DIR}/requirements.txt"

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

  log "Agent deployed"
}

install_cowrie_service() {
  log "Installing Cowrie service..."

  cat > /etc/systemd/system/cowrie.service <<SERVICE
[Unit]
Description=DrishtiMesh Cowrie SSH Honeypot
After=network.target

[Service]
Type=simple
User=cowrie
Group=cowrie
WorkingDirectory=${COWRIE_DIR}
ExecStart=/usr/bin/authbind --deep ${COWRIE_DIR}/cowrie-env/bin/twistd --nodaemon cowrie
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
SERVICE

  systemctl daemon-reload
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
}

enable_services() {
  log "Enabling services..."

  systemctl enable --now cowrie
  systemctl enable --now drishtimesh-agent.timer

  log "Services enabled"
}

test_agent() {
  log "Testing DrishtiMesh agent..."

  cd "${AGENT_DIR}"

  if "${AGENT_DIR}/venv/bin/python" main.py; then
    log "Agent executed successfully"
  else
    fail "Agent test failed"
  fi
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
  log "Heartbeat successful"
}

summary() {
  echo
  echo "=================================================="
  echo " DrishtiMesh installation completed"
  echo "=================================================="
  echo
  echo "Node:"
  echo "  Name : ${NODE_NAME}"
  echo "  ID   : ${NODE_ID}"
  echo
  echo "Ports:"
  echo "  Honeypot SSH : ${HONEYPOT_PORT}"
  echo "  Real SSH     : ${REAL_SSH_PORT}"
  echo
  echo "Config:"
  echo "  ${CONFIG_FILE}"
  echo
  echo "Services:"
  echo "  cowrie.service"
  echo "  drishtimesh-agent.service"
  echo "  drishtimesh-agent.timer"
  echo
  echo "Important:"
  echo "  From now on, login to this server using:"
  echo "  ssh -p ${REAL_SSH_PORT} USER@SERVER_IP"
  echo
}

main() {
  parse_args "$@"
  header
  require_root
  detect_os
  install_base_packages
  configure_firewall
  move_real_ssh_port
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

main "$@"

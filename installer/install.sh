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

log() {
  echo -e "[DrishtiMesh] $1"
}

fail() {
  echo -e "[DrishtiMesh] ERROR: $1"
  exit 1
}

header() {
  clear
  echo "=================================================="
  echo "        DrishtiMesh Enterprise Sensor Setup        "
  echo "=================================================="
  echo " Sensor     : ${SENSOR_NAME}"
  echo " Relay URL  : ${RELAY_URL}"
  echo " Install to : ${INSTALL_DIR}"
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
  apt install -y ca-certificates curl gnupg lsb-release apt-transport-https
}

install_docker() {
  if command -v docker >/dev/null 2>&1; then
    log "Docker already installed: $(docker --version)"
    return
  fi

  log "Docker not found. Installing Docker Engine..."

  install_base_packages

  mkdir -p /etc/apt/keyrings

  curl -fsSL "https://download.docker.com/linux/ubuntu/gpg" \
    | gpg --dearmor -o /etc/apt/keyrings/docker.gpg

  chmod a+r /etc/apt/keyrings/docker.gpg

  . /etc/os-release

  echo \
    "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/${ID} ${VERSION_CODENAME} stable" \
    > /etc/apt/sources.list.d/docker.list

  apt update -y
  apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin

  systemctl enable docker
  systemctl start docker

  log "Docker installed: $(docker --version)"
}

verify_docker() {
  docker info >/dev/null 2>&1 || fail "Docker is installed but not running."
  docker compose version >/dev/null 2>&1 || fail "Docker Compose plugin not found."
  log "Docker Compose ready: $(docker compose version)"
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

write_config() {
  log "Writing sensor configuration..."

  cat > "${CONFIG_FILE}" <<CFG
RELAY_URL=${RELAY_URL}
NODE_NAME=drishtimesh-cowrie-node
SENSOR_TYPE=cowrie
INSTALL_DIR=${INSTALL_DIR}
COWRIE_DIR=${COWRIE_DIR}
AGENT_DIR=${AGENT_DIR}
LOG_DIR=${LOG_DIR}
CFG

  chmod 600 "${CONFIG_FILE}"
}

summary() {
  echo
  echo "=================================================="
  echo " DrishtiMesh base installer completed successfully "
  echo "=================================================="
  echo
  echo "Created:"
  echo "  ${INSTALL_DIR}"
  echo "  ${COWRIE_DIR}"
  echo "  ${AGENT_DIR}"
  echo "  ${LOG_DIR}"
  echo
  echo "Config:"
  echo "  ${CONFIG_FILE}"
  echo
  echo "Next step:"
  echo "  Add Cowrie docker-compose deployment"
  echo
}

main() {
  header
  require_root
  detect_os
  install_docker
  verify_docker
  create_layout
  write_config
  summary
}

main "$@"

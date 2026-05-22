ATTACK_STAGE_MAP = {
    "system_recon": "reconnaissance",
    "network_recon": "reconnaissance",
    "payload_download": "payload_download",
    "permission_change": "execution_preparation",
    "execution": "execution_attempt",
    "persistence": "persistence",
    "sensitive_file_access": "credential_access",
    "destructive": "destructive_activity",
    "evasion": "defense_evasion",
}


def classify_command(command: str):
    command = command.strip().lower()

    rules = [
        {
            "signal_type": "system_reconnaissance",
            "severity": "low",
            "confidence": 60,
            "keywords": ["uname", "whoami", "id", "hostname", "uptime"],
            "family": "system_recon",
        },
        {
            "signal_type": "network_reconnaissance",
            "severity": "low",
            "confidence": 60,
            "keywords": ["ifconfig", "ip a", "netstat", "ss ", "route"],
            "family": "network_recon",
        },
        {
            "signal_type": "payload_download_attempt",
            "severity": "high",
            "confidence": 90,
            "keywords": ["wget", "curl", "tftp", "ftpget"],
            "family": "payload_download",
        },
        {
            "signal_type": "permission_change",
            "severity": "medium",
            "confidence": 75,
            "keywords": ["chmod +x", "chmod 777", "chmod 755"],
            "family": "permission_change",
        },
        {
            "signal_type": "execution_attempt",
            "severity": "high",
            "confidence": 85,
            "keywords": ["./", "sh ", "bash "],
            "family": "execution",
        },
        {
            "signal_type": "persistence_attempt",
            "severity": "high",
            "confidence": 85,
            "keywords": ["crontab", "systemctl enable", "authorized_keys", "rc.local"],
            "family": "persistence",
        },
        {
            "signal_type": "sensitive_file_access",
            "severity": "high",
            "confidence": 85,
            "keywords": ["/etc/passwd", "/etc/shadow"],
            "family": "sensitive_file_access",
        },
        {
            "signal_type": "destructive_command",
            "severity": "critical",
            "confidence": 95,
            "keywords": ["rm -rf", "dd if=", "mkfs"],
            "family": "destructive",
        },
        {
            "signal_type": "evasion_attempt",
            "severity": "medium",
            "confidence": 75,
            "keywords": ["history -c", "unset histfile", "histfile=/dev/null"],
            "family": "evasion",
        },
    ]

    matches = []

    for rule in rules:
        for keyword in rule["keywords"]:
            if keyword in command:
                family = rule["family"]

                matches.append({
                    "signal_type": rule["signal_type"],
                    "severity": rule["severity"],
                    "confidence": rule["confidence"],
                    "metadata": {
                        "command_family": family,
                        "command_category": family,
                        "attack_stage": ATTACK_STAGE_MAP.get(family, "unknown"),
                        "matched_keyword": keyword,
                        "evidence_summary": f"Observed command behavior: {rule['signal_type']}",
                    },
                })
                break

    return matches


def classify_event(event: dict):
    eventid = event.get("eventid")
    src_ip = event.get("src_ip")

    if not eventid or not src_ip:
        return []

    if eventid == "cowrie.login.failed":
        return [{
            "src_ip": src_ip,
            "eventid": eventid,
            "signal_type": "ssh_bruteforce",
            "severity": "medium",
            "confidence": 65,
            "raw_command": None,
            "commands_observed": [],
            "metadata": {
                "credential_event": "failed_login",
                "attack_stage": "initial_access_attempt",
                "evidence_summary": "Failed SSH login attempt observed",
            },
        }]

    if eventid == "cowrie.login.success":
        return [{
            "src_ip": src_ip,
            "eventid": eventid,
            "signal_type": "interactive_access",
            "severity": "medium",
            "confidence": 80,
            "raw_command": None,
            "commands_observed": [],
            "metadata": {
                "credential_event": "successful_login",
                "attack_stage": "interactive_access",
                "evidence_summary": "Successful honeypot login observed",
            },
        }]

    if eventid == "cowrie.session.file_download":
        return [{
            "src_ip": src_ip,
            "eventid": eventid,
            "signal_type": "payload_download_confirmed",
            "severity": "high",
            "confidence": 95,
            "raw_command": None,
            "commands_observed": [],
            "metadata": {
                "attack_stage": "payload_download",
                "command_category": "payload_download",
                "url_observed": bool(event.get("url")),
                "hash_observed": bool(event.get("shasum")),
                "shasum": event.get("shasum"),
                "evidence_summary": "Cowrie confirmed a file download event",
            },
        }]

    if eventid == "cowrie.session.file_upload":
        return [{
            "src_ip": src_ip,
            "eventid": eventid,
            "signal_type": "payload_upload",
            "severity": "high",
            "confidence": 85,
            "raw_command": None,
            "commands_observed": [],
            "metadata": {
                "attack_stage": "payload_upload",
                "filename_observed": bool(event.get("filename")),
                "evidence_summary": "Cowrie observed a file upload event",
            },
        }]

    if eventid == "cowrie.direct-tcpip.request":
        return [{
            "src_ip": src_ip,
            "eventid": eventid,
            "signal_type": "proxy_or_tunnel_attempt",
            "severity": "high",
            "confidence": 80,
            "raw_command": None,
            "commands_observed": [],
            "metadata": {
                "attack_stage": "proxy_or_tunnel_attempt",
                "dst_ip": event.get("dst_ip"),
                "dst_port": event.get("dst_port"),
                "evidence_summary": "Direct TCP/IP forwarding request observed",
            },
        }]

    if eventid == "cowrie.command.input":
        command = event.get("input", "").strip()

        if not command:
            return []

        command_signals = classify_command(command)
        results = []

        for signal in command_signals:
            results.append({
                "src_ip": src_ip,
                "eventid": eventid,
                "signal_type": signal["signal_type"],
                "severity": signal["severity"],
                "confidence": signal["confidence"],

                # keep command evidence, but not usernames/passwords/full session logs
                "raw_command": command,
                "commands_observed": [command],

                "metadata": signal["metadata"],
            })

        return results

    return []

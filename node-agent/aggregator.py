def build_attack_chain_signals(signals: list[dict]):
    grouped = {}

    for signal in signals:
        src_ip = signal.get("src_ip")
        if not src_ip:
            continue

        grouped.setdefault(src_ip, {
            "src_ip": src_ip,
            "commands_observed": [],
            "attack_stages": [],
            "command_categories": [],
            "signal_types": [],
            "eventids": [],
        })

        group = grouped[src_ip]

        raw_command = signal.get("raw_command")
        if raw_command and raw_command not in group["commands_observed"]:
            group["commands_observed"].append(raw_command)

        for cmd in signal.get("commands_observed", []) or []:
            if cmd and cmd not in group["commands_observed"]:
                group["commands_observed"].append(cmd)

        metadata = signal.get("metadata") or {}

        attack_stage = metadata.get("attack_stage")
        if attack_stage and attack_stage not in group["attack_stages"]:
            group["attack_stages"].append(attack_stage)

        command_category = metadata.get("command_category") or metadata.get("command_family")
        if command_category and command_category not in group["command_categories"]:
            group["command_categories"].append(command_category)

        signal_type = signal.get("signal_type")
        if signal_type and signal_type not in group["signal_types"]:
            group["signal_types"].append(signal_type)

        eventid = signal.get("eventid")
        if eventid and eventid not in group["eventids"]:
            group["eventids"].append(eventid)

    summary_signals = []

    for src_ip, group in grouped.items():
        attack_stages = group["attack_stages"]
        commands = group["commands_observed"]
        signal_types = group["signal_types"]

        if not commands and len(signal_types) < 2:
            continue

        confidence = 70

        if "payload_download" in attack_stages:
            confidence += 10

        if "execution_attempt" in attack_stages:
            confidence += 10

        if "execution_preparation" in attack_stages:
            confidence += 5

        if len(commands) >= 3:
            confidence += 5

        confidence = min(confidence, 98)

        severity = "medium"
        if "payload_download" in attack_stages or "execution_attempt" in attack_stages:
            severity = "high"
        if "destructive_activity" in attack_stages:
            severity = "critical"

        summary_signals.append({
            "src_ip": src_ip,
            "eventid": "drishtimesh.attack_chain.summary",
            "signal_type": "attack_chain_summary",
            "severity": severity,
            "confidence": confidence,
            "raw_command": None,
            "commands_observed": commands,
            "metadata": {
                "attack_stages": attack_stages,
                "command_categories": group["command_categories"],
                "signal_types": signal_types,
                "eventids": group["eventids"],
                "commands_count": len(commands),
                "evidence_summary": "Multiple behaviors observed in one attack chain",
            },
        })

    return summary_signals

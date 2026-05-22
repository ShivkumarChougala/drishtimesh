import requests

from config import RELAY_URL, NODE_ID, NODE_TOKEN, SENSOR_TYPE


def send_signal(signal: dict):
    url = f"{RELAY_URL}/signals"

    payload = {
        "node_id": NODE_ID,
        "src_ip": signal["src_ip"],
        "sensor": SENSOR_TYPE,
        "eventid": signal["eventid"],
        "signal_type": signal["signal_type"],
        "severity": signal["severity"],
        "confidence": signal["confidence"],
        "raw_command": signal.get("raw_command"),
        "commands_observed": signal.get("commands_observed", []),
        "metadata": signal.get("metadata", {}),
    }

    headers = {
        "Authorization": f"Bearer {NODE_TOKEN}",
        "Content-Type": "application/json",
    }

    response = requests.post(
        url,
        json=payload,
        headers=headers,
        timeout=10,
    )

    if response.status_code >= 400:
        print(f"[sender] failed: {response.status_code} {response.text}")
        return None

    return response.json()

import requests

from config import RELAY_URL, NODE_ID, NODE_TOKEN


AGENT_VERSION = "0.1.0"


def send_heartbeat(status: str = "online"):
    url = f"{RELAY_URL}/nodes/heartbeat"

    payload = {
        "node_id": NODE_ID,
        "status": status,
        "version": AGENT_VERSION,
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
        print(f"[heartbeat] failed: {response.status_code} {response.text}")
        return None

    return response.json()

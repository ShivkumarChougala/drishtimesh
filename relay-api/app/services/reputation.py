from app.db.database import get_db_connection


SIGNAL_WEIGHTS = {
    "ssh_bruteforce": 25,
    "interactive_access": 35,
    "system_reconnaissance": 15,
    "network_reconnaissance": 15,
    "payload_download_attempt": 40,
    "payload_download_confirmed": 50,
    "payload_upload": 45,
    "permission_change": 20,
    "execution_attempt": 45,
    "persistence_attempt": 55,
	"attack_chain_summary": 60,
    "sensitive_file_access": 35,
    "destructive_command": 70,
    "evasion_attempt": 30,
    "proxy_or_tunnel_attempt": 40,
}


def verdict_from_score(score: int) -> str:
    if score >= 85:
        return "malicious"
    if score >= 60:
        return "high_risk"
    if score >= 30:
        return "suspicious"
    return "low_risk"


def confidence_from_score(score: int, node_count: int) -> str:
    if score >= 80 and node_count >= 2:
        return "high"
    if score >= 50:
        return "medium"
    return "low"


def update_ip_reputation(src_ip: str):
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute(
        """
        SELECT signal_type, confidence, node_id, observed_at
        FROM signals
        WHERE src_ip = %s
        ORDER BY observed_at DESC;
        """,
        (src_ip,)
    )

    rows = cur.fetchall()

    if not rows:
        cur.close()
        conn.close()
        return None

    signal_types = set()
    node_ids = set()
    latest_seen = rows[0]["observed_at"]

    score = 0

    for row in rows:
        signal_type = row["signal_type"]
        signal_types.add(signal_type)
        node_ids.add(str(row["node_id"]))

    for signal_type in signal_types:
        score += SIGNAL_WEIGHTS.get(signal_type, 5)

    node_count = len(node_ids)

    if node_count >= 2:
        score += 20

    score = min(score, 100)

    verdict = verdict_from_score(score)
    confidence = confidence_from_score(score, node_count)

    cur.execute(
        """
        INSERT INTO ip_reputation (
            ip,
            score,
            verdict,
            confidence,
            total_signals,
            observed_by_nodes,
            last_seen,
            updated_at
        )
        VALUES (%s,%s,%s,%s,%s,%s,%s,NOW())
        ON CONFLICT (ip)
        DO UPDATE SET
            score = EXCLUDED.score,
            verdict = EXCLUDED.verdict,
            confidence = EXCLUDED.confidence,
            total_signals = EXCLUDED.total_signals,
            observed_by_nodes = EXCLUDED.observed_by_nodes,
            last_seen = EXCLUDED.last_seen,
            updated_at = NOW();
        """,
        (
            src_ip,
            score,
            verdict,
            confidence,
            len(rows),
            node_count,
            latest_seen
        )
    )

    conn.commit()
    cur.close()
    conn.close()

    return {
        "ip": src_ip,
        "score": score,
        "verdict": verdict,
        "confidence": confidence,
        "total_signals": len(rows),
        "observed_by_nodes": node_count,
        "signals": list(signal_types),
    }

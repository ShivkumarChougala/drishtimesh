from fastapi import APIRouter
from app.db.database import get_db_connection
from app.services.ip_context import get_ip_context
from app.services.threat_intel import lookup_threat_intel

router = APIRouter()


@router.get("/lookup/{ip}")
def lookup_ip(ip: str):
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute(
        """
        SELECT *
        FROM ip_reputation
        WHERE ip = %s;
        """,
        (ip,)
    )
    reputation = cur.fetchone()

    cur.execute(
        """
        SELECT
            signal_type,
            severity,
            confidence,
            sensor,
            eventid,
            raw_command,
            commands_observed,
            metadata,
            observed_at
        FROM signals
        WHERE src_ip = %s
        ORDER BY observed_at DESC
        LIMIT 50;
        """,
        (ip,)
    )
    signals = cur.fetchall()

    cur.execute(
        """
        SELECT
            COUNT(*) AS total_observations,
            COUNT(DISTINCT node_id) AS community_nodes,
            MIN(observed_at) AS first_seen,
            MAX(observed_at) AS last_seen
        FROM signals
        WHERE src_ip = %s;
        """,
        (ip,)
    )
    summary = cur.fetchone()

    cur.close()
    conn.close()

    context = get_ip_context(ip)
    threat_intel = lookup_threat_intel(ip)

    if not reputation:
        return {
            "ip": ip,
            "found": False,
            "verdict": "unknown",
            "score": 0,
            "confidence": "none",
            "message": "No community honeypot signals have been observed for this IP yet.",
            "signals": [],
            "community_summary": {
                "total_observations": 0,
                "community_nodes": 0,
                "first_seen": None,
                "last_seen": None,
            },
            "context": context,
        "threat_intel": threat_intel,
        }

    return {
        "ip": str(reputation["ip"]),
        "found": True,
        "score": reputation["score"],
        "verdict": reputation["verdict"],
        "confidence": reputation["confidence"],
        "total_signals": reputation["total_signals"],
        "observed_by_nodes": reputation["observed_by_nodes"],
        "first_seen": summary["first_seen"],
        "last_seen": summary["last_seen"],
        "signals": signals,
        "community_summary": {
            "total_observations": summary["total_observations"],
            "community_nodes": summary["community_nodes"],
            "first_seen": summary["first_seen"],
            "last_seen": summary["last_seen"],
            "network": "DrishtiMesh Community Honeypot Mesh",
        },
        "context": context,
        "threat_intel": threat_intel,
    }

from fastapi import APIRouter, HTTPException

from app.db.database import get_db_connection


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

    if not reputation:
        cur.close()
        conn.close()
        raise HTTPException(status_code=404, detail="IP not found")

    cur.execute(
        """
        SELECT
            signal_type,
            severity,
            confidence,
            eventid,
            raw_command,
            commands_observed,
            metadata,
            observed_at
        FROM signals
        WHERE src_ip = %s
        ORDER BY observed_at DESC
        LIMIT 20;
        """,
        (ip,)
    )

    signals = cur.fetchall()

    cur.close()
    conn.close()

    return {
        "ip": str(reputation["ip"]),
        "score": reputation["score"],
        "verdict": reputation["verdict"],
        "confidence": reputation["confidence"],
        "total_signals": reputation["total_signals"],
        "observed_by_nodes": reputation["observed_by_nodes"],
        "last_seen": reputation["last_seen"],
        "signals": signals,
    }

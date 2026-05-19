from fastapi import APIRouter
from app.db.database import get_db_connection

router = APIRouter()


@router.get("/feed/recent")
def recent_feed(limit: int = 25):
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute(
        """
        SELECT
            s.src_ip,
            s.signal_type,
            s.severity,
            s.confidence,
            s.sensor,
            s.eventid,
            s.observed_at,
            r.score,
            r.verdict,
            r.observed_by_nodes
        FROM signals s
        LEFT JOIN ip_reputation r
            ON s.src_ip = r.ip
        ORDER BY s.observed_at DESC
        LIMIT %s;
        """,
        (limit,)
    )

    rows = cur.fetchall()

    cur.close()
    conn.close()

    return {
        "count": len(rows),
        "results": rows
    }

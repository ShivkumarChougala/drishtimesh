from fastapi import APIRouter
from app.db.database import get_db_connection

router = APIRouter(prefix="/threat-intel", tags=["Threat Intel"])


@router.get("/summary")
def threat_intel_summary():
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT
            source_name,
            indicator_type,
            COUNT(*) AS total
        FROM threat_intel_indicators
        GROUP BY source_name, indicator_type
        ORDER BY source_name, indicator_type;
    """)

    rows = cur.fetchall()
    cur.close()
    conn.close()

    return {"items": rows}


@router.get("/indicators")
def threat_intel_indicators(limit: int = 50):
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT
            indicator_type,
            indicator_value,
            source_name,
            category,
            confidence,
            last_seen
        FROM threat_intel_indicators
        ORDER BY last_seen DESC
        LIMIT %s;
    """, (limit,))

    rows = cur.fetchall()
    cur.close()
    conn.close()

    return {"items": rows}

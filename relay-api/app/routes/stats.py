from fastapi import APIRouter
from app.db.database import get_db_connection

router = APIRouter()

ACTIVE_WINDOW_MINUTES = 5


@router.get("/network/stats")
def network_stats():
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT
            COUNT(*) AS total_nodes,
            COUNT(*) FILTER (
                WHERE last_seen >= NOW() - (%s * INTERVAL '1 minute')
            ) AS active_nodes,
            COUNT(*) FILTER (
                WHERE last_seen IS NULL
                   OR last_seen < NOW() - (%s * INTERVAL '1 minute')
            ) AS offline_nodes
        FROM nodes;
    """, (ACTIVE_WINDOW_MINUTES, ACTIVE_WINDOW_MINUTES))
    node_stats = cur.fetchone()

    cur.execute("SELECT COUNT(*) AS total_signals FROM signals;")
    total_signals = cur.fetchone()["total_signals"]

    cur.execute("""
        SELECT
            COUNT(*) AS total_ips,
            COUNT(*) FILTER (WHERE verdict = 'malicious') AS malicious_ips,
            COUNT(*) FILTER (WHERE verdict = 'suspicious') AS suspicious_ips
        FROM ip_reputation;
    """)
    ip_stats = cur.fetchone()

    cur.execute("""
        SELECT COUNT(*) AS signals_24h
        FROM signals
        WHERE observed_at >= NOW() - INTERVAL '24 hours';
    """)
    signals_24h = cur.fetchone()["signals_24h"]

    cur.close()
    conn.close()

    return {
        "total_nodes": node_stats["total_nodes"],
        "active_nodes": node_stats["active_nodes"],
        "offline_nodes": node_stats["offline_nodes"],
        "active_window_minutes": ACTIVE_WINDOW_MINUTES,
        "total_signals": total_signals,
        "total_ips": ip_stats["total_ips"],
        "unique_ips": ip_stats["total_ips"],
        "malicious_ips": ip_stats["malicious_ips"],
        "suspicious_ips": ip_stats["suspicious_ips"],
        "signals_24h": signals_24h,
    }

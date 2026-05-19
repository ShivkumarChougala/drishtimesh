from fastapi import APIRouter
from app.db.database import get_db_connection

router = APIRouter()


@router.get("/network/stats")
def network_stats():
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("SELECT COUNT(*) AS total_nodes FROM nodes;")
    total_nodes = cur.fetchone()["total_nodes"]

    cur.execute("SELECT COUNT(*) AS active_nodes FROM nodes WHERE status = 'online';")
    active_nodes = cur.fetchone()["active_nodes"]

    cur.execute("SELECT COUNT(*) AS total_signals FROM signals;")
    total_signals = cur.fetchone()["total_signals"]

    cur.execute("SELECT COUNT(*) AS total_ips FROM ip_reputation;")
    total_ips = cur.fetchone()["total_ips"]

    cur.execute("SELECT COUNT(*) AS malicious_ips FROM ip_reputation WHERE verdict = 'malicious';")
    malicious_ips = cur.fetchone()["malicious_ips"]

    cur.execute("SELECT COUNT(*) AS suspicious_ips FROM ip_reputation WHERE verdict = 'suspicious';")
    suspicious_ips = cur.fetchone()["suspicious_ips"]

    cur.execute("""
        SELECT COUNT(*) AS signals_24h
        FROM signals
        WHERE observed_at >= NOW() - INTERVAL '24 hours';
    """)
    signals_24h = cur.fetchone()["signals_24h"]

    cur.close()
    conn.close()

    return {
        "total_nodes": total_nodes,
        "active_nodes": active_nodes,
        "total_signals": total_signals,
        "total_ips": total_ips,
        "malicious_ips": malicious_ips,
        "suspicious_ips": suspicious_ips,
        "signals_24h": signals_24h
    }

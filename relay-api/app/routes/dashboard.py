from fastapi import APIRouter, Depends
from app.db.database import get_db_connection
from app.routes.auth import get_current_user

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/summary")
def dashboard_summary(current_user=Depends(get_current_user)):
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute(
        """
        SELECT COUNT(*) AS total_nodes
        FROM nodes
        WHERE user_id = %s;
        """,
        (current_user["id"],)
    )
    total_nodes = cur.fetchone()["total_nodes"]

    cur.execute(
        """
        SELECT COUNT(*) AS active_nodes
        FROM nodes
        WHERE user_id = %s
          AND (
              status = 'online'
              OR last_seen >= NOW() - INTERVAL '2 minutes'
          );
        """,
        (current_user["id"],)
    )
    active_nodes = cur.fetchone()["active_nodes"]

    cur.execute(
        """
        SELECT COUNT(*) AS total_signals
        FROM signals s
        JOIN nodes n
            ON s.node_id = n.node_id
        WHERE n.user_id = %s;
        """,
        (current_user["id"],)
    )
    total_signals = cur.fetchone()["total_signals"]

    cur.execute(
        """
        SELECT COUNT(*) AS signals_24h
        FROM signals s
        JOIN nodes n
            ON s.node_id = n.node_id
        WHERE n.user_id = %s
          AND s.observed_at >= NOW() - INTERVAL '24 hours';
        """,
        (current_user["id"],)
    )
    signals_24h = cur.fetchone()["signals_24h"]

    cur.execute(
        """
        SELECT COUNT(DISTINCT s.src_ip) AS unique_ips
        FROM signals s
        JOIN nodes n
            ON s.node_id = n.node_id
        WHERE n.user_id = %s;
        """,
        (current_user["id"],)
    )
    unique_ips = cur.fetchone()["unique_ips"]

    cur.execute(
        """
        SELECT COUNT(*) AS malicious_ips
        FROM ip_reputation r
        WHERE r.verdict = 'malicious'
          AND EXISTS (
              SELECT 1
              FROM signals s
              JOIN nodes n
                  ON s.node_id = n.node_id
              WHERE n.user_id = %s
                AND s.src_ip = r.ip
          );
        """,
        (current_user["id"],)
    )
    malicious_ips = cur.fetchone()["malicious_ips"]

    cur.execute(
        """
        SELECT COALESCE(ROUND(AVG(r.score)), 0) AS avg_score
        FROM ip_reputation r
        WHERE EXISTS (
            SELECT 1
            FROM signals s
            JOIN nodes n
                ON s.node_id = n.node_id
            WHERE n.user_id = %s
              AND s.src_ip = r.ip
        );
        """,
        (current_user["id"],)
    )
    avg_score = cur.fetchone()["avg_score"]

    cur.close()
    conn.close()

    mesh_health = 0

    if total_nodes > 0:
        mesh_health = round((active_nodes / total_nodes) * 100)

    return {
        "total_nodes": total_nodes,
        "active_nodes": active_nodes,
        "mesh_health": mesh_health,
        "total_signals": total_signals,
        "signals_24h": signals_24h,
        "unique_ips": unique_ips,
        "malicious_ips": malicious_ips,
        "avg_reputation_score": avg_score
    }


@router.get("/timeline")
def dashboard_timeline(
    hours: int = 24,
    current_user=Depends(get_current_user)
):
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute(
        """
        WITH buckets AS (
            SELECT generate_series(
                date_trunc('hour', NOW() - (%s || ' hours')::interval),
                date_trunc('hour', NOW()),
                INTERVAL '1 hour'
            ) AS bucket
        ),
        signal_counts AS (
            SELECT
                date_trunc('hour', s.observed_at) AS bucket,
                COUNT(*) AS signals
            FROM signals s
            JOIN nodes n
                ON s.node_id = n.node_id
            WHERE n.user_id = %s
              AND s.observed_at >= NOW() - (%s || ' hours')::interval
            GROUP BY bucket
        )
        SELECT
            b.bucket,
            COALESCE(sc.signals, 0) AS signals
        FROM buckets b
        LEFT JOIN signal_counts sc
            ON b.bucket = sc.bucket
        ORDER BY b.bucket ASC;
        """,
        (hours, current_user["id"], hours)
    )

    rows = cur.fetchall()

    cur.close()
    conn.close()

    return {
        "hours": hours,
        "results": rows
    }


@router.get("/live-events")
def dashboard_live_events(
    limit: int = 20,
    hours: int = 24,
    current_user=Depends(get_current_user)
):
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
            r.verdict
        FROM signals s
        JOIN nodes n
            ON s.node_id = n.node_id
        LEFT JOIN ip_reputation r
            ON s.src_ip = r.ip
        WHERE n.user_id = %s
          AND s.observed_at >= NOW() - (%s || ' hours')::interval
        ORDER BY s.observed_at DESC
        LIMIT %s;
        """,
        (current_user["id"], hours, limit)
    )

    rows = cur.fetchall()

    cur.close()
    conn.close()

    return {
        "hours": hours,
        "count": len(rows),
        "results": rows
    }


@router.get("/sensors")
def dashboard_sensors(current_user=Depends(get_current_user)):
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute(
        """
        SELECT
            n.node_id,
            n.node_name,
            n.sensor_type,
            n.country,
            n.region,
            n.provider,
            n.last_seen,
            CASE
                WHEN n.status = 'registered'
                THEN 'registered'
                WHEN n.last_seen >= NOW() - INTERVAL '2 minutes'
                THEN 'online'
                ELSE 'offline'
            END AS status,
            COUNT(s.id) AS signals,
            COUNT(DISTINCT s.src_ip) AS unique_ips
        FROM nodes n
        LEFT JOIN signals s
            ON n.node_id = s.node_id
        WHERE n.user_id = %s
        GROUP BY
            n.node_id,
            n.node_name,
            n.sensor_type,
            n.country,
            n.region,
            n.provider,
            n.status,
            n.last_seen
        ORDER BY n.last_seen DESC NULLS LAST;
        """,
        (current_user["id"],)
    )

    rows = cur.fetchall()

    cur.close()
    conn.close()

    return {
        "count": len(rows),
        "results": rows
    }

from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel
from uuid import uuid4, UUID
import secrets

from app.db.database import get_db_connection


router = APIRouter()


class NodeRegisterIn(BaseModel):
    node_name: str | None = None
    sensor_type: str = "cowrie"
    country: str | None = None
    region: str | None = None
    provider: str | None = None
    ip_address: str | None = None


class HeartbeatIn(BaseModel):
    node_id: UUID
    status: str = "online"
    version: str = "0.1.0"


def verify_node_token(node_id: str, token: str):
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute(
        """
        SELECT node_id
        FROM nodes
        WHERE node_id = %s
          AND api_token = %s;
        """,
        (node_id, token),
    )

    node = cur.fetchone()

    cur.close()
    conn.close()

    if not node:
        raise HTTPException(status_code=401, detail="Invalid node token")

    return True


def get_bearer_token(authorization: str | None):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Missing Authorization Bearer token"
        )

    return authorization.replace("Bearer ", "").strip()


@router.post("/nodes/register")
def register_node(node: NodeRegisterIn):
    node_id = str(uuid4())
    api_token = secrets.token_urlsafe(32)

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute(
        """
        INSERT INTO nodes (
            node_id,
            node_name,
            sensor_type,
            country,
            region,
            provider,
            ip_address,
            api_token,
            status,
            last_seen
        )
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,'registered',NOW())
        RETURNING id;
        """,
        (
            node_id,
            node.node_name,
            node.sensor_type,
            node.country,
            node.region,
            node.provider,
            node.ip_address,
            api_token,
        ),
    )

    row = cur.fetchone()
    conn.commit()

    cur.close()
    conn.close()

    return {
        "status": "ok",
        "id": row["id"],
        "node_id": node_id,
        "api_token": api_token,
        "sensor_type": node.sensor_type,
    }


@router.post("/nodes/heartbeat")
def node_heartbeat(
    payload: HeartbeatIn,
    authorization: str | None = Header(default=None)
):
    token = get_bearer_token(authorization)
    verify_node_token(str(payload.node_id), token)

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute(
        """
        INSERT INTO node_heartbeats (
            node_id,
            status,
            version
        )
        VALUES (%s,%s,%s);
        """,
        (str(payload.node_id), payload.status, payload.version),
    )

    cur.execute(
        """
        UPDATE nodes
        SET status = %s,
            last_seen = NOW()
        WHERE node_id = %s;
        """,
        (payload.status, str(payload.node_id)),
    )

    conn.commit()

    cur.close()
    conn.close()

    return {
        "status": "ok",
        "node_id": str(payload.node_id),
        "node_status": payload.status,
    }


@router.get("/nodes/contributions")
def node_contributions():
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute(
        """
        SELECT
            n.node_id,
            COALESCE(n.node_name, LEFT(n.node_id::text, 8)) AS sensor_name,
            n.sensor_type,
            n.country,
            n.region,
            n.provider,
            n.status,
            n.last_seen,
            COUNT(s.id) AS signals,
            COUNT(DISTINCT s.src_ip) AS unique_ips,
            CASE
                WHEN n.last_seen >= NOW() - INTERVAL '2 minutes'
                THEN 'online'
                ELSE 'offline'
            END AS live_status
        FROM nodes n
        LEFT JOIN signals s
            ON s.node_id = n.node_id
        GROUP BY
            n.node_id,
            n.node_name,
            n.sensor_type,
            n.country,
            n.region,
            n.provider,
            n.status,
            n.last_seen
        ORDER BY signals DESC, n.last_seen DESC
        LIMIT 5;
        """
    )

    rows = cur.fetchall()

    cur.close()
    conn.close()

    return {
        "count": len(rows),
        "results": [
            {
                "node_id": str(row["node_id"]),
                "sensor_name": row["sensor_name"],
                "sensor_type": row["sensor_type"],
                "region": " · ".join(
                    [x for x in [row["country"], row["region"]] if x]
                ) or "Unknown region",
                "provider": row["provider"],
                "status": row["live_status"],
                "signals": row["signals"],
                "unique_ips": row["unique_ips"],
                "last_seen": row["last_seen"],
            }
            for row in rows
        ],
    }

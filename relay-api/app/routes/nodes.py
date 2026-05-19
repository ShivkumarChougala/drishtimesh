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

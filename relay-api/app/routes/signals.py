from fastapi import APIRouter, Header, HTTPException
from pydantic import BaseModel
from uuid import UUID
from psycopg2.extras import Json

from app.db.database import get_db_connection
from app.services.reputation import update_ip_reputation


router = APIRouter()


class SignalIn(BaseModel):
    node_id: UUID
    src_ip: str
    sensor: str
    eventid: str
    signal_type: str
    severity: str
    confidence: int = 0

    raw_command: str | None = None
    commands_observed: list[str] = []

    metadata: dict | None = None


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
        raise HTTPException(
            status_code=401,
            detail="Invalid node token"
        )

    return True


@router.post("/signals")
def create_signal(
    signal: SignalIn,
    authorization: str | None = Header(default=None)
):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=401,
            detail="Missing Authorization Bearer token"
        )

    token = authorization.replace("Bearer ", "").strip()

    verify_node_token(str(signal.node_id), token)

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute(
        """
        INSERT INTO signals (
            node_id,
            src_ip,
            sensor,
            eventid,
            signal_type,
            severity,
            confidence,
            raw_command,
            commands_observed,
            metadata
        )
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
        RETURNING id;
        """,
        (
            str(signal.node_id),
            signal.src_ip,
            signal.sensor,
            signal.eventid,
            signal.signal_type,
            signal.severity,
            signal.confidence,
            signal.raw_command,
            signal.commands_observed,
            Json(signal.metadata) if signal.metadata else None,
        ),
    )

    row = cur.fetchone()
    conn.commit()

    cur.close()
    conn.close()

    reputation = update_ip_reputation(signal.src_ip)

    return {
        "status": "ok",
        "signal_id": row["id"],
        "reputation": reputation,
    }

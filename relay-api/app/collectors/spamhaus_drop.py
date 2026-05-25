import json
import requests

from app.db.database import get_db_connection


SOURCE_NAME = "spamhaus_drop"
FEED_URL = "https://www.spamhaus.org/drop/drop.txt"


def parse_drop_line(line: str):
    line = line.strip()

    if not line or line.startswith(";"):
        return None

    cidr = line.split(";")[0].strip()

    if not cidr:
        return None

    return {
        "indicator_type": "cidr",
        "indicator_value": cidr,
        "source_name": SOURCE_NAME,
        "category": "do_not_route",
        "confidence": "high",
        "tags": ["spamhaus", "drop", "blocklist"],
    }


def run():
    response = requests.get(FEED_URL, timeout=30)
    response.raise_for_status()

    lines = response.text.splitlines()
    indicators = []

    for line in lines:
        item = parse_drop_line(line)
        if item:
            indicators.append(item)

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute(
        """
        INSERT INTO threat_intel_raw (source_name, raw_data)
        VALUES (%s, %s)
        RETURNING id;
        """,
        (
            SOURCE_NAME,
            json.dumps({"url": FEED_URL, "raw_text": response.text}),
        ),
    )

    raw_id = cur.fetchone()["id"]

    for item in indicators:
        cur.execute(
            """
            INSERT INTO threat_intel_indicators (
                indicator_type,
                indicator_value,
                source_name,
                category,
                confidence,
                tags,
                raw_id,
                last_seen,
                updated_at
            )
            VALUES (%s,%s,%s,%s,%s,%s,%s,NOW(),NOW())
            ON CONFLICT (indicator_type, indicator_value, source_name)
            DO UPDATE SET
                category = EXCLUDED.category,
                confidence = EXCLUDED.confidence,
                tags = EXCLUDED.tags,
                raw_id = EXCLUDED.raw_id,
                last_seen = NOW(),
                updated_at = NOW();
            """,
            (
                item["indicator_type"],
                item["indicator_value"],
                item["source_name"],
                item["category"],
                item["confidence"],
                json.dumps(item["tags"]),
                raw_id,
            ),
        )

    cur.execute(
        """
        UPDATE threat_intel_sources
        SET last_run_at = NOW()
        WHERE name = %s;
        """,
        (SOURCE_NAME,),
    )

    conn.commit()
    cur.close()
    conn.close()

    print(f"Imported {len(indicators)} indicators from {SOURCE_NAME}")


if __name__ == "__main__":
    run()

import ipaddress

from app.db.database import get_db_connection


def lookup_threat_intel(ip: str):
    try:
        target_ip = ipaddress.ip_address(ip)
    except ValueError:
        return {
            "matched": False,
            "match_count": 0,
            "sources": [],
            "matches": []
        }

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute("""
        SELECT
            indicator_type,
            indicator_value,
            source_name,
            category,
            confidence,
            tags,
            last_seen
        FROM threat_intel_indicators
        WHERE indicator_type IN ('ip', 'cidr');
    """)

    rows = cur.fetchall()
    cur.close()
    conn.close()

    matches = []

    for row in rows:
        try:
            if row["indicator_type"] == "ip":
                if target_ip == ipaddress.ip_address(row["indicator_value"]):
                    matches.append(row)

            if row["indicator_type"] == "cidr":
                if target_ip in ipaddress.ip_network(row["indicator_value"], strict=False):
                    matches.append(row)

        except ValueError:
            continue

    matches = sorted(
        matches,
        key=lambda m: ipaddress.ip_network(
            m["indicator_value"],
            strict=False
        ).prefixlen if m["indicator_type"] == "cidr" else 999,
        reverse=True
    )

    return {
        "matched": len(matches) > 0,
        "match_count": len(matches),
        "sources": sorted(list(set([m["source_name"] for m in matches]))),
        "matches": matches
    }

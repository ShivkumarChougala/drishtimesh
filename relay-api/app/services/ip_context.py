import os
import ipaddress
import requests
from app.db.database import get_db_connection


def is_public_ip(ip: str) -> bool:
    try:
        return ipaddress.ip_address(ip).is_global
    except ValueError:
        return False


def get_saved_context(ip: str):
    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute(
        """
        SELECT country, country_code, region, city, asn, isp, org,
               timezone, latitude, longitude, updated_at
        FROM ip_context
        WHERE ip = %s;
        """,
        (ip,)
    )

    row = cur.fetchone()
    cur.close()
    conn.close()
    return row


def fetch_and_save_context(ip: str):
    token = os.getenv("IPINFO_TOKEN")

    if not token or not is_public_ip(ip):
        return None

    try:
        response = requests.get(
            f"https://ipinfo.io/{ip}/json",
            params={"token": token},
            timeout=5,
        )
        data = response.json()
    except Exception:
        return None

    loc = data.get("loc") or ""
    lat, lon = None, None

    if "," in loc:
        lat_raw, lon_raw = loc.split(",", 1)
        lat = float(lat_raw)
        lon = float(lon_raw)

    asn = data.get("org")
    org = data.get("org")
    isp = data.get("org")

    conn = get_db_connection()
    cur = conn.cursor()

    cur.execute(
        """
        INSERT INTO ip_context (
            ip, country, country_code, region, city, asn, isp, org,
            timezone, latitude, longitude, updated_at
        )
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,NOW())
        ON CONFLICT (ip)
        DO UPDATE SET
            country = EXCLUDED.country,
            country_code = EXCLUDED.country_code,
            region = EXCLUDED.region,
            city = EXCLUDED.city,
            asn = EXCLUDED.asn,
            isp = EXCLUDED.isp,
            org = EXCLUDED.org,
            timezone = EXCLUDED.timezone,
            latitude = EXCLUDED.latitude,
            longitude = EXCLUDED.longitude,
            updated_at = NOW();
        """,
        (
            ip,
            data.get("country"),
            data.get("country"),
            data.get("region"),
            data.get("city"),
            asn,
            isp,
            org,
            data.get("timezone"),
            lat,
            lon,
        )
    )

    conn.commit()
    cur.close()
    conn.close()

    return get_saved_context(ip)


def get_ip_context(ip: str):
    saved = get_saved_context(ip)
    if saved:
        return saved

    return fetch_and_save_context(ip)

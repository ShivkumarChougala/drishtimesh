from fastapi import FastAPI
from app.db.database import get_db_connection
from app.routes.signals import router as signals_router
from app.routes.lookup import router as lookup_router
from app.routes.feed import router as feed_router
from app.routes.nodes import router as nodes_router
from app.routes.stats import router as stats_router

app = FastAPI(
    title="DrishtiMesh Relay API",
    version="0.1.0"
)

@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "drishtimesh-relay",
        "version": "0.1.0"
    }

@app.get("/db-check")
def db_check():
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT NOW() AS time;")
    row = cur.fetchone()
    cur.close()
    conn.close()

    return {
        "status": "ok",
        "database_time": row["time"]
    }
app.include_router(signals_router)
app.include_router(lookup_router)
app.include_router(feed_router)
app.include_router(nodes_router)
app.include_router(stats_router)

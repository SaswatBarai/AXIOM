import os

from psycopg2 import pool
from psycopg2.extras import RealDictCursor
from utils.logger import logger

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError("CRITICAL: DATABASE_URL environment variable is not set")

_db_pool = None


def _get_pool():
    global _db_pool
    if _db_pool is None:
        _db_pool = pool.ThreadedConnectionPool(
            minconn=2,
            maxconn=10,
            dsn=DATABASE_URL,
        )
    return _db_pool


def get_db_connection():
    try:
        return _get_pool().getconn()
    except Exception as e:
        logger.error(f"Failed to get connection from pool: {e}")
        raise e


def return_connection(conn):
    try:
        _get_pool().putconn(conn)
    except Exception:
        conn.close()

def parse_vector(vec_str) -> list[float]:
    """Parse postgres vector format '[0.1,0.2,...]' into list of floats."""
    if not vec_str:
        return []
    if isinstance(vec_str, list):
        return vec_str
    try:
        # Strip brackets if it comes as a string from psycopg2
        if isinstance(vec_str, str):
            clean = vec_str.strip("[]")
            return [float(x) for x in clean.split(",") if x.strip()]
    except Exception as e:
        logger.error(f"Error parsing vector string '{vec_str}': {e}")
    return []

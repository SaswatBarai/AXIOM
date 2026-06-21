import os
import psycopg2
from psycopg2.extras import RealDictCursor
from utils.logger import logger

DATABASE_URL = os.getenv("DATABASE_URL")

def get_db_connection():
    """Get a raw connection to the PostgreSQL database."""
    if not DATABASE_URL:
        logger.error("DATABASE_URL is not set in environment variables")
        raise ValueError("DATABASE_URL is not set")
    try:
        conn = psycopg2.connect(DATABASE_URL)
        return conn
    except Exception as e:
        logger.error(f"Failed to connect to database: {e}")
        raise e

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

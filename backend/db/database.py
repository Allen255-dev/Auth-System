import os
import pymysql
import sqlite3
from contextlib import contextmanager
from dotenv import load_dotenv

load_dotenv()

DB_ENGINE = os.getenv("DB_ENGINE", "mysql").lower()
DB_HOST = os.getenv("DB_HOST", "127.0.0.1")
DB_PORT = int(os.getenv("DB_PORT", 3306))
DB_USER = os.getenv("DB_USER", "root")
DB_PASSWORD = os.getenv("DB_PASSWORD", "password")
DB_NAME = os.getenv("DB_NAME", "auth_db")
SQLITE_PATH = os.getenv("SQLITE_PATH", "auth.db")

# Automatically detect if we need to fallback to sqlite if mysql is not available
_use_sqlite = (DB_ENGINE == "sqlite")

if not _use_sqlite:
    try:
        # Test connection
        conn = pymysql.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME,
            connect_timeout=2
        )
        conn.close()
    except Exception as e:
        print(f"Warning: Could not connect to MySQL server at {DB_HOST}:{DB_PORT}. Falling back to local SQLite ({SQLITE_PATH}). Error: {e}")
        _use_sqlite = True

def is_sqlite():
    return _use_sqlite

@contextmanager
def get_db_connection():
    if _use_sqlite:
        conn = sqlite3.connect(SQLITE_PATH)
        conn.row_factory = sqlite3.Row  # Access columns by name
        try:
            yield conn
        finally:
            conn.close()
    else:
        conn = pymysql.connect(
            host=DB_HOST,
            port=DB_PORT,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME,
            cursorclass=pymysql.cursors.DictCursor
        )
        try:
            yield conn
        finally:
            conn.close()

def execute_query(query: str, params: tuple = None, fetch: str = None, commit: bool = False):
    """
    Executes a raw SQL query using the configured database engine.
    Automatically handles parameter placeholders (%s vs ?).
    """
    if params is None:
        params = ()
        
    actual_query = query
    if _use_sqlite:
        # Translate format style %s to placeholder style ? for SQLite
        actual_query = query.replace("%s", "?")
        
    with get_db_connection() as conn:
        cursor = conn.cursor()
        try:
            cursor.execute(actual_query, params)
            
            result = None
            if fetch == "one":
                row = cursor.fetchone()
                if row:
                    result = dict(row) if _use_sqlite else row
            elif fetch == "all":
                rows = cursor.fetchall()
                result = [dict(r) for r in rows] if _use_sqlite else rows
            elif commit:
                conn.commit()
                result = cursor.lastrowid
                
            return result
        except Exception as e:
            if commit:
                conn.rollback()
            raise e
        finally:
            cursor.close()

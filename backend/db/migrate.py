import sys
import os

# Allow running from package root or backend root
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from db.database import execute_query, is_sqlite
from middleware.security import hash_password

def run_migrations():
    print(f"Running database migrations... (Engine: {'sqlite' if is_sqlite() else 'mysql'})")
    
    # 1. Create tables
    if is_sqlite():
        # SQLite schema
        users_table = """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            email TEXT UNIQUE NOT NULL,
            hashed_password TEXT NOT NULL,
            role TEXT DEFAULT 'user',
            is_active BOOLEAN DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
        refresh_tokens_table = """
        CREATE TABLE IF NOT EXISTS refresh_tokens (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            token TEXT UNIQUE NOT NULL,
            expires_at TIMESTAMP NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        )
        """
    else:
        # MySQL schema
        users_table = """
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            hashed_password VARCHAR(255) NOT NULL,
            role VARCHAR(20) DEFAULT 'user',
            is_active BOOLEAN DEFAULT TRUE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """
        refresh_tokens_table = """
        CREATE TABLE IF NOT EXISTS refresh_tokens (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            token VARCHAR(255) UNIQUE NOT NULL,
            expires_at TIMESTAMP NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
        """

    # Run table creation
    execute_query(users_table, commit=True)
    execute_query(refresh_tokens_table, commit=True)
    print("Tables created successfully.")

    # 2. Seed default admin and standard user if they do not exist
    admin_exists = execute_query("SELECT id FROM users WHERE username = %s OR email = %s", ("admin", "admin@example.com"), fetch="one")
    if not admin_exists:
        admin_pwd_hash = hash_password("admin123")
        execute_query(
            "INSERT INTO users (username, email, hashed_password, role) VALUES (%s, %s, %s, %s)",
            ("admin", "admin@example.com", admin_pwd_hash, "admin"),
            commit=True
        )
        print("Admin user seeded successfully. (username: admin, password: admin123)")
    else:
        print("Admin user already exists.")

    user_exists = execute_query("SELECT id FROM users WHERE username = %s OR email = %s", ("user", "user@example.com"), fetch="one")
    if not user_exists:
        user_pwd_hash = hash_password("user123")
        execute_query(
            "INSERT INTO users (username, email, hashed_password, role) VALUES (%s, %s, %s, %s)",
            ("user", "user@example.com", user_pwd_hash, "user"),
            commit=True
        )
        print("Standard user seeded successfully. (username: user, password: user123)")
    else:
        print("Standard user already exists.")

if __name__ == "__main__":
    run_migrations()

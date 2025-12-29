"""
데이터베이스 초기화 스크립트

main.py를 실행하지 않고도 DB 테이블을 생성할 수 있습니다.

사용법:
    python init_db.py
"""

import sqlite3

def init_db():
    """데이터베이스 및 테이블 초기화"""
    conn = sqlite3.connect("maintenance.db")
    cursor = conn.cursor()

    # users 테이블 생성
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email VARCHAR(255) UNIQUE NOT NULL,
            hashed_password VARCHAR(255) NOT NULL,
            full_name VARCHAR(100),
            role VARCHAR(20) DEFAULT 'user',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    """)

    # requests 테이블 생성
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER,
            description TEXT NOT NULL,
            category VARCHAR(50),
            priority VARCHAR(20),
            status VARCHAR(20) DEFAULT 'pending',
            location VARCHAR(100),
            contact_info VARCHAR(100),
            image_url VARCHAR(500),
            task_id VARCHAR(100),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id)
        )
    """)

    conn.commit()

    # 테이블 확인
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = cursor.fetchall()

    print("Database initialized successfully!")
    print(f"\nCreated tables: {', '.join([t[0] for t in tables])}")

    # 각 테이블 스키마 출력
    for table in tables:
        table_name = table[0]
        print(f"\n=== {table_name} table schema ===")
        cursor.execute(f"PRAGMA table_info({table_name})")
        columns = cursor.fetchall()
        for col in columns:
            nullable = "NULL" if not col[3] else "NOT NULL"
            default = f"DEFAULT {col[4]}" if col[4] else ""
            print(f"  {col[1]:<20} {col[2]:<15} {nullable:<10} {default}")

    conn.close()

if __name__ == "__main__":
    init_db()

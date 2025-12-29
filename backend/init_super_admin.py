"""
최고 관리자 계정 초기화 스크립트

Railway 환경변수에서 SUPER_ADMIN_PASSWORD를 읽어옵니다.
설정되지 않은 경우 기본값 'qwer1234'를 사용합니다.

사용법:
    python init_super_admin.py
"""

import sqlite3
import os
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def init_super_admin():
    """최고 관리자 계정 생성 또는 업데이트"""

    # 환경변수에서 비밀번호 읽기 (Railway에서 설정)
    SUPER_ADMIN_EMAIL = "admin"
    SUPER_ADMIN_PASSWORD = os.getenv("SUPER_ADMIN_PASSWORD", "qwer1234")
    SUPER_ADMIN_NAME = "Super Administrator"

    conn = sqlite3.connect("maintenance.db")
    conn.row_factory = sqlite3.Row
    cursor = conn.cursor()

    # 최고 관리자 계정 존재 확인
    cursor.execute("SELECT * FROM users WHERE email = ?", (SUPER_ADMIN_EMAIL,))
    existing = cursor.fetchone()

    # 비밀번호 해싱 (72바이트 제한 처리)
    if len(SUPER_ADMIN_PASSWORD.encode('utf-8')) > 72:
        SUPER_ADMIN_PASSWORD = SUPER_ADMIN_PASSWORD[:72]
    hashed_password = pwd_context.hash(SUPER_ADMIN_PASSWORD)

    if existing:
        # 이미 존재하면 역할만 업데이트
        if existing["role"] != "super_admin":
            cursor.execute(
                "UPDATE users SET role = 'super_admin' WHERE email = ?",
                (SUPER_ADMIN_EMAIL,)
            )
            conn.commit()
            print(f"Updated existing user '{SUPER_ADMIN_EMAIL}' to super_admin")
        else:
            print(f"Super admin '{SUPER_ADMIN_EMAIL}' already exists")
    else:
        # 새로 생성
        cursor.execute("""
            INSERT INTO users (email, hashed_password, full_name, role)
            VALUES (?, ?, ?, ?)
        """, (SUPER_ADMIN_EMAIL, hashed_password, SUPER_ADMIN_NAME, "super_admin"))
        conn.commit()
        print(f"Created super admin account: {SUPER_ADMIN_EMAIL}")

    conn.close()

    print("\nSuper Admin Credentials:")
    print(f"  Email: {SUPER_ADMIN_EMAIL}")
    print(f"  Password: {'*' * len(SUPER_ADMIN_PASSWORD)} (from env or default)")
    print(f"  Role: super_admin")
    print("\nIMPORTANT: Change the password in Railway environment variables!")
    print("  Set SUPER_ADMIN_PASSWORD in Railway dashboard")

if __name__ == "__main__":
    init_super_admin()

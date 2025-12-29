"""
관리자 권한 승격 스크립트

사용법:
    python promote_admin.py <email>

예시:
    python promote_admin.py admin@example.com
"""

import sqlite3
import sys

def promote_to_admin(email: str):
    """사용자를 관리자로 승격"""
    try:
        conn = sqlite3.connect("maintenance.db")
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        # 테이블 존재 확인
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='users'")
        if not cursor.fetchone():
            print("❌ 오류: 데이터베이스가 초기화되지 않았습니다.")
            print("   먼저 백엔드를 실행하여 DB를 생성하세요: python main.py")
            conn.close()
            return False

        # 사용자 존재 확인
        cursor.execute("SELECT * FROM users WHERE email = ?", (email,))
        user = cursor.fetchone()

        if not user:
            print(f"❌ 오류: 이메일 '{email}'을 가진 사용자를 찾을 수 없습니다.")
            conn.close()
            return False
    except sqlite3.OperationalError as e:
        print(f"❌ 데이터베이스 오류: {e}")
        return False

    # 이미 관리자인지 확인
    if user["role"] == "admin":
        print(f"ℹ️  '{email}'은(는) 이미 관리자입니다.")
        conn.close()
        return True

    # 관리자로 승격
    cursor.execute("UPDATE users SET role = 'admin' WHERE email = ?", (email,))
    conn.commit()

    print(f"✅ 성공: '{email}'을(를) 관리자로 승격했습니다.")
    print(f"   - 이름: {user['full_name']}")
    print(f"   - 이전 역할: {user['role']}")
    print(f"   - 새 역할: admin")

    conn.close()
    return True

def list_users():
    """모든 사용자 목록 표시"""
    try:
        conn = sqlite3.connect("maintenance.db")
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()

        # 테이블 존재 확인
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='users'")
        if not cursor.fetchone():
            print("❌ 오류: 데이터베이스가 초기화되지 않았습니다.")
            print("   먼저 백엔드를 실행하여 DB를 생성하세요: python main.py")
            conn.close()
            return

        cursor.execute("SELECT id, email, full_name, role FROM users ORDER BY id")
        users = cursor.fetchall()
    except sqlite3.OperationalError as e:
        print(f"❌ 데이터베이스 오류: {e}")
        return

    if not users:
        print("📭 등록된 사용자가 없습니다.")
        conn.close()
        return

    print("\n📋 등록된 사용자 목록:")
    print("=" * 70)
    print(f"{'ID':<5} {'이메일':<30} {'이름':<20} {'역할':<10}")
    print("-" * 70)

    for user in users:
        role_display = "👑 관리자" if user["role"] == "admin" else "👤 사용자"
        print(f"{user['id']:<5} {user['email']:<30} {user['full_name'] or 'N/A':<20} {role_display}")

    print("=" * 70)
    print(f"총 {len(users)}명\n")

    conn.close()

def main():
    if len(sys.argv) < 2:
        print("사용법: python promote_admin.py <email>")
        print("사용자 목록 보기: python promote_admin.py --list")
        print()
        list_users()
        sys.exit(1)

    if sys.argv[1] == "--list":
        list_users()
        sys.exit(0)

    email = sys.argv[1]
    promote_to_admin(email)

if __name__ == "__main__":
    main()

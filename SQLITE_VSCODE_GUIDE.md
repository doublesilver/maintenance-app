# VSCode에서 SQLite 데이터베이스 관리하기

## 1. VSCode Extension 설치

### SQLite Viewer 설치

1. VSCode 열기
2. Extensions 뷰 열기 (`Ctrl+Shift+X` 또는 `Cmd+Shift+X`)
3. 검색창에 "SQLite Viewer" 입력
4. **SQLite Viewer** (by Florian Klampfer) 설치

또는 명령 팔레트에서:
```
Ctrl+Shift+P → "Extensions: Install Extensions" → "SQLite Viewer"
```

---

## 2. 데이터베이스 열기

### 방법 1: 파일 탐색기에서
```
1. VSCode 사이드바에서 EXPLORER 열기
2. backend/maintenance.db 파일 찾기
3. 파일 클릭 → 자동으로 SQLite Viewer 열림
```

### 방법 2: 명령 팔레트에서
```
1. Ctrl+Shift+P
2. "SQLite: Open Database" 선택
3. backend/maintenance.db 선택
```

---

## 3. 사용자 테이블 보기

데이터베이스가 열리면:

```
1. 좌측 "SQLITE EXPLORER" 패널에 maintenance.db 표시됨
2. maintenance.db 확장 (▶ 클릭)
3. "users" 테이블 우클릭 → "Show Table"
```

**테이블 뷰:**
```
┌────┬────────────────────┬─────────────┬──────┬─────────────────────┐
│ id │ email              │ full_name   │ role │ created_at          │
├────┼────────────────────┼─────────────┼──────┼─────────────────────┤
│ 1  │ admin@example.com  │ Admin User  │ user │ 2025-12-29 10:00:00 │
│ 2  │ user@example.com   │ Regular     │ user │ 2025-12-29 10:05:00 │
└────┴────────────────────┴─────────────┴──────┴─────────────────────┘
```

---

## 4. 관리자 권한 부여하기

### 방법 A: SQL 쿼리 실행 (추천)

1. **New Query 열기**
   - `users` 테이블 우클릭
   - "New Query" 선택

2. **SQL 쿼리 작성**
   ```sql
   -- 특정 이메일을 관리자로 승격
   UPDATE users
   SET role = 'admin'
   WHERE email = 'admin@example.com';
   ```

3. **실행**
   - 쿼리 선택 (전체 선택: Ctrl+A)
   - 우클릭 → "Run Selected Query"
   - 또는 단축키: `Ctrl+Shift+Q`

4. **결과 확인**
   ```sql
   SELECT * FROM users WHERE email = 'admin@example.com';
   ```

### 방법 B: 직접 편집 (Extension에 따라 다름)

일부 SQLite 확장은 직접 편집을 지원하지 않습니다. SQL 쿼리 방식을 권장합니다.

---

## 5. 유용한 SQL 쿼리 모음

### 📋 모든 사용자 조회
```sql
SELECT id, email, full_name, role, created_at
FROM users
ORDER BY id;
```

### 👑 ID로 관리자 승격
```sql
UPDATE users
SET role = 'admin'
WHERE id = 1;
```

### 🔍 관리자 목록 보기
```sql
SELECT * FROM users WHERE role = 'admin';
```

### 📊 역할별 통계
```sql
SELECT role, COUNT(*) as count
FROM users
GROUP BY role;
```

### 🔄 관리자를 일반 사용자로
```sql
UPDATE users
SET role = 'user'
WHERE email = 'admin@example.com';
```

### 🗑️ 사용자 삭제
```sql
DELETE FROM users
WHERE email = 'test@example.com';
```

### 🆕 새 관리자 직접 생성 (비밀번호는 bcrypt 해싱 필요)
```sql
-- 이 방법은 권장하지 않음 (비밀번호 해싱 필요)
-- 대신 회원가입 후 승격하세요
```

---

## 6. 단축키

| 동작 | 단축키 |
|------|--------|
| 명령 팔레트 | `Ctrl+Shift+P` |
| SQL 실행 | `Ctrl+Shift+Q` (선택된 쿼리) |
| 전체 선택 | `Ctrl+A` |
| 새 쿼리 | 우클릭 → New Query |
| 테이블 새로고침 | 우클릭 → Refresh |

---

## 7. 트러블슈팅

### "Database is locked" 오류

**원인:** 백엔드가 실행 중이면 DB가 잠김

**해결:**
```bash
# 백엔드 중지 (터미널에서 Ctrl+C)
# 또는 읽기 전용 모드로 열기
```

### 변경사항이 보이지 않음

**해결:**
```
1. 테이블 우클릭 → "Refresh"
2. 또는 VSCode 재시작
```

### Extension이 .db 파일을 인식하지 못함

**해결:**
```
1. 파일 우클릭
2. "Open With..." → "SQLite Viewer" 선택
```

---

## 8. 추가 추천 Extensions

### SQLite (alexcvzz)
- 더 많은 기능 (직접 편집, 스키마 뷰)
- 설치: Extensions → "SQLite" 검색

### Database Client (cweijan)
- 다양한 DB 지원 (MySQL, PostgreSQL, SQLite)
- 설치: Extensions → "Database Client" 검색

---

## 9. 실전 예제

### 시나리오: 첫 사용자를 관리자로 만들기

```sql
-- 1. 현재 사용자 확인
SELECT * FROM users ORDER BY id;

-- 2. ID 1번 사용자를 관리자로 승격
UPDATE users
SET role = 'admin'
WHERE id = 1;

-- 3. 결과 확인
SELECT id, email, role FROM users WHERE id = 1;
```

**기대 출력:**
```
id | email              | role
1  | admin@example.com  | admin
```

### 시나리오: 여러 명을 한 번에 관리자로

```sql
UPDATE users
SET role = 'admin'
WHERE email IN (
    'admin1@example.com',
    'admin2@example.com',
    'admin3@example.com'
);
```

---

## 10. 백업 및 복원

### 백업
```bash
# 명령 프롬프트에서
copy backend\maintenance.db backend\maintenance.backup.db
```

### 복원
```bash
copy backend\maintenance.backup.db backend\maintenance.db
```

---

## 빠른 참조

**관리자 승격 원라인 쿼리:**
```sql
UPDATE users SET role = 'admin' WHERE email = 'your@email.com';
```

이제 VSCode에서 편하게 DB를 관리할 수 있습니다! 🎉

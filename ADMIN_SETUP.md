# 관리자 계정 설정 가이드

## 빠른 시작

### 1. 일반 사용자로 회원가입

먼저 웹사이트에서 일반 사용자로 회원가입합니다:

```
http://localhost:3000/register
```

- 이메일: `admin@example.com`
- 비밀번호: `your-password`
- 이름: `Admin User`

### 2. 관리자로 승격

**방법 A: VSCode Extension (추천)** ⭐

1. VSCode에서 `backend/maintenance.db` 파일 클릭
2. SQL 쿼리 실행:
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
   ```
3. 자세한 가이드: [SQLITE_VSCODE_GUIDE.md](SQLITE_VSCODE_GUIDE.md)

**방법 B: Python 스크립트**

백엔드 폴더에서 승격 스크립트 실행:

```bash
cd backend
python promote_admin.py admin@example.com
```

**출력 예시:**
```
✅ 성공: 'admin@example.com'을(를) 관리자로 승격했습니다.
   - 이름: Admin User
   - 이전 역할: user
   - 새 역할: admin
```

### 3. 로그인

관리자 권한으로 로그인하면 다음 기능 사용 가능:

- ✅ `/admin/dashboard` - 모든 사용자의 요청 조회
- ✅ 요청 상태 업데이트 (대기중 → 진행중 → 완료)
- ✅ 모든 요청 삭제
- ✅ 통계 조회

---

## 명령어

### 사용자 목록 보기

```bash
python promote_admin.py --list
```

**출력 예시:**
```
📋 등록된 사용자 목록:
======================================================================
ID    이메일                          이름                  역할
----------------------------------------------------------------------
1     admin@example.com              Admin User           👑 관리자
2     user1@example.com              John Doe             👤 사용자
3     user2@example.com              Jane Smith           👤 사용자
======================================================================
총 3명
```

### 특정 사용자 승격

```bash
python promote_admin.py <email>
```

**예시:**
```bash
python promote_admin.py user1@example.com
```

---

## 수동 승격 (SQL 직접 실행)

SQLite 클라이언트를 사용하는 경우:

```sql
-- 특정 이메일을 관리자로 승격
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';

-- 모든 사용자 확인
SELECT id, email, full_name, role FROM users;
```

---

## 권한 비교

### 일반 사용자 (`role = "user"`)

| 기능 | 접근 가능 여부 |
|------|---------------|
| POST /api/requests | ✅ (본인만) |
| GET /api/my-requests | ✅ (본인만) |
| GET /api/requests | ❌ (403 Forbidden) |
| GET /api/requests/{id} | ✅ (본인 요청만) |
| PATCH /api/requests/{id} | ❌ (403 Forbidden) |
| DELETE /api/requests/{id} | ✅ (본인 요청만) |
| GET /api/stats | ❌ (403 Forbidden) |

### 관리자 (`role = "admin"`)

| 기능 | 접근 가능 여부 |
|------|---------------|
| POST /api/requests | ✅ |
| GET /api/my-requests | ✅ |
| GET /api/requests | ✅ (모든 요청) |
| GET /api/requests/{id} | ✅ (모든 요청) |
| PATCH /api/requests/{id} | ✅ (모든 요청) |
| DELETE /api/requests/{id} | ✅ (모든 요청) |
| GET /api/stats | ✅ |

---

## 프로덕션 배포 시

### Railway에서 관리자 승격

1. Railway CLI 설치:
```bash
npm install -g @railway/cli
railway login
```

2. 프로젝트 연결 및 셸 접속:
```bash
railway link
railway run python promote_admin.py admin@example.com
```

또는 Railway 대시보드에서:
1. 프로젝트 선택
2. "Database" 탭
3. "Connect" → "Railway CLI" 또는 SQL 클라이언트 사용
4. SQL 직접 실행:
```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@example.com';
```

---

## 트러블슈팅

### "사용자를 찾을 수 없습니다"

먼저 회원가입을 완료했는지 확인:
```bash
python promote_admin.py --list
```

### "maintenance.db 파일을 찾을 수 없습니다"

백엔드 폴더에서 실행하는지 확인:
```bash
cd backend
python promote_admin.py <email>
```

### 권한 변경이 즉시 반영되지 않음

로그아웃 후 다시 로그인해야 새 JWT 토큰이 발급됩니다:
1. 우측 상단 "로그아웃" 클릭
2. 다시 로그인
3. `/admin/dashboard` 접근 시도

---

## 보안 권장사항

1. **강력한 비밀번호 사용**: 관리자 계정은 최소 12자 이상, 특수문자 포함
2. **관리자 계정 최소화**: 필요한 만큼만 관리자 권한 부여
3. **주기적인 권한 검토**:
   ```bash
   python promote_admin.py --list
   ```
4. **관리자 활동 로깅**: 추후 감사 로그 추가 권장

---

## 자주 묻는 질문 (FAQ)

### Q: 관리자를 다시 일반 사용자로 되돌릴 수 있나요?

A: 네, SQL로 가능합니다:
```sql
UPDATE users SET role = 'user' WHERE email = 'admin@example.com';
```

### Q: 여러 명을 한 번에 관리자로 만들 수 있나요?

A: 스크립트를 여러 번 실행하거나 SQL 사용:
```sql
UPDATE users SET role = 'admin' WHERE email IN (
    'admin1@example.com',
    'admin2@example.com',
    'admin3@example.com'
);
```

### Q: 첫 사용자를 자동으로 관리자로 만들 수 있나요?

A: 가능하지만 현재는 수동 승격 방식을 권장합니다. 필요시 요청해주세요.

---

**문의사항이 있으시면 GitHub Issues로 남겨주세요!**

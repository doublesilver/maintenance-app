# 보안 설정 가이드

## 1. Railway 환경변수 설정 (필수)

### JWT Secret Key 강화

Railway 대시보드에서 환경변수를 설정하세요:

#### 방법 A: Railway 대시보드에서 직접 설정

1. **Railway 대시보드 접속**: https://railway.app
2. **프로젝트 선택**: `focused-celebration` (또는 본인 프로젝트명)
3. **백엔드 서비스 클릭**
4. **Variables 탭** 클릭
5. **환경변수 추가**:

```
SECRET_KEY=<아래에서 생성한 강력한 랜덤 키>
```

#### Secret Key 생성 방법

**PowerShell에서 실행** (Windows):
```powershell
python -c "import secrets; print(secrets.token_urlsafe(64))"
```

**또는 온라인 생성기 사용**:
- https://generate-secret.vercel.app/64
- 64자 이상의 랜덤 문자열 생성

**예시 (절대 이 값을 사용하지 마세요!)**:
```
SECRET_KEY=xK3vL9mP2nQ8rT5wY7zA1bC4dF6gH0jK3lM5oP8qR1sU4vX7yZ0aC3eF6hJ9kN2pQ5tW8zA1cE4gH7jL0mO3rS6uX9yB2dF5hK8nP1qT4wZ7aC0eG3jM6oR9sV2xA5cF8hK1nQ4tW7zA0bE3gJ6lO9rU2xY5aC8dG1jM4pR7sV0xZ3cF6hK9nQ2tW5yA8bE1gJ4lO7rU0xZ3aC6dG9jM2pR5sV8xY1cF4hK7nQ0tW3yA6bE9gJ2lO5rU8xZ1aC4dG7jM0pR3sV6xY9cF2hK5nQ8tW1yA4bE7gJ0lO3rU6xZ9aC2dG5jM8pR1sV4xY7cF0hK3nQ6tW9yA2bE5gJ8lO1rU4xZ7aC0dG3jM6pR9sV2xY5cF8hK1nQ4tW7yA0bE3gJ6lO9rU2xZ5aC8dG1jM4pR7sV0xY3cF6hK9nQ2tW5yA8bE1gJ4lO7rU0xZ3aC6dG9jM2pR5sV8xY1cF4hK7nQ0tW3yA6bE9gJ2lO5rU8xZ1aC4dG7jM0pR3sV6xY9cF2hK5nQ8tW1yA4bE7gJ0lO3rU6xZ9aC2dG5jM8pR1sV4xY7cF0hK3nQ6tW9yA2bE5gJ8lO1rU4xZ7aC0dG3jM6pR9sV2xY5cF8hK1nQ4tW7zA0bE3gJ6lO9rU2xZ5aC8dG1jM4pR7sV0xY3cF6hK9nQ2tW5yA8bE1gJ4lO7rU0
```

### PROMOTE_SECRET (선택 사항, 더 이상 사용되지 않음)

관리자 승격 API는 보안상의 이유로 제거되었습니다.
Railway CLI를 사용하세요.

---

## 2. Railway 대시보드 사용 방법

### A. 데이터베이스 직접 접근

Railway에서 SQLite 데이터베이스를 직접 관리하는 방법:

#### 방법 1: Railway Shell 접속

1. Railway 대시보드 → 프로젝트 선택
2. 백엔드 서비스 클릭
3. 상단 메뉴에서 **"Shell"** 또는 **"Terminal"** 클릭
4. 다음 명령어 실행:

```bash
# 데이터베이스 확인
ls -la maintenance.db

# 관리자 승격
python promote_admin.py test@test.com

# 사용자 목록 확인
python promote_admin.py --list

# SQLite 직접 접근 (sqlite3가 설치되어 있는 경우)
sqlite3 maintenance.db "SELECT * FROM users;"
```

#### 방법 2: Railway CLI 사용 (로컬에서)

```bash
# Railway 로그인
railway login

# 프로젝트 연결
railway link

# 서비스 선택 후 명령어 실행
railway run python promote_admin.py test@test.com
```

#### 방법 3: 데이터베이스 다운로드

1. Railway 대시보드 → 프로젝트 선택
2. 백엔드 서비스 클릭
3. **"Data"** 탭 또는 **"Files"** 탭
4. `maintenance.db` 파일 다운로드
5. 로컬에서 SQLite 도구로 편집:
   ```bash
   # VSCode에서 열기
   code maintenance.db

   # 또는 Python으로
   python promote_admin.py test@test.com
   ```
6. 편집 후 다시 업로드

### B. 로그 모니터링

의심스러운 활동을 감지하기 위한 로그 확인:

1. Railway 대시보드 → 프로젝트 선택
2. 백엔드 서비스 클릭
3. **"Logs"** 탭 클릭
4. 실시간 로그 확인

**주의해야 할 로그:**
- 반복적인 로그인 실패 (Brute Force 공격)
- 429 Rate Limit 에러 (비정상적인 요청)
- 401/403 권한 에러 (무단 접근 시도)

### C. 배포 상태 확인

1. Railway 대시보드 → 프로젝트 선택
2. 백엔드 서비스 클릭
3. **"Deployments"** 탭에서:
   - 최근 배포 상태
   - 빌드 로그
   - 배포 시간

---

## 3. 적용된 보안 기능

### ✅ Rate Limiting

| 엔드포인트 | 제한 | 설명 |
|-----------|------|------|
| POST /api/auth/register | 5 req/min | 회원가입 스팸 방지 |
| POST /api/auth/login | 10 req/min | Brute Force 공격 방지 |

초과 시 `429 Too Many Requests` 응답

### ✅ JWT 인증

- **알고리즘**: HS256
- **토큰 만료**: 30분
- **비밀번호 해싱**: bcrypt (cost factor 12)

### ✅ RBAC (Role-Based Access Control)

| 역할 | 권한 |
|------|------|
| user | 본인 요청만 조회/삭제 |
| admin | 모든 요청 조회/수정/삭제, 통계 접근 |

### ✅ 프로덕션 보안

- Swagger UI 비활성화 (`/docs`)
- ReDoc 비활성화 (`/redoc`)
- OpenAPI 스키마 비활성화 (`/openapi.json`)
- 위험한 관리자 승격 API 제거

### ✅ HTTPS

- Railway에서 자동 제공
- Let's Encrypt SSL 인증서

---

## 4. 추가 권장사항

### A. 정기적인 보안 점검

**매주:**
- Railway 로그에서 의심스러운 활동 확인
- 관리자 계정 목록 검토

**매월:**
- SECRET_KEY 갱신 (선택 사항)
- 종속성 업데이트 (`pip list --outdated`)

### B. 비밀번호 정책

관리자 계정은 다음 정책을 따르세요:
- 최소 12자 이상
- 대소문자, 숫자, 특수문자 포함
- 사전에 있는 단어 사용 금지
- 이메일과 무관한 비밀번호

### C. 백업

Railway에서 정기적으로 데이터베이스 백업:

```bash
# 로컬에 백업
railway run sqlite3 maintenance.db ".backup backup_$(date +%Y%m%d).db"

# 또는 전체 DB 다운로드
railway run cat maintenance.db > backup_$(date +%Y%m%d).db
```

### D. 2FA (추후 구현 권장)

프로덕션 환경에서는 관리자 계정에 2단계 인증(TOTP) 추가를 권장합니다.

---

## 5. 트러블슈팅

### "429 Too Many Requests" 에러

정상적인 사용자가 Rate Limit에 걸린 경우:

**임시 해결**: Railway 대시보드에서 백엔드 재시작
**영구 해결**: [main.py](backend/main.py)에서 Rate Limit 값 조정

```python
@limiter.limit("10/minute")  # 이 값을 늘림 (예: 20/minute)
```

### JWT 토큰 만료

사용자가 30분마다 로그아웃되는 경우:

**해결**: [auth.py](backend/auth.py)에서 `ACCESS_TOKEN_EXPIRE_MINUTES` 값 증가

```python
ACCESS_TOKEN_EXPIRE_MINUTES = 60  # 30분 → 1시간
```

---

**보안 관련 문의사항이 있으시면 GitHub Issues로 남겨주세요!**

# Railway 배포 상세 가이드

## ⚠️ 중요: Root Directory 설정 필수!

Railway는 프로젝트 루트에 있는 파일을 자동으로 감지하려고 하는데, 우리 백엔드는 `backend/` 폴더 안에 있습니다.

---

## 🚀 Railway 배포 방법 (수정)

### 1단계: Railway 가입 및 로그인

```
1. https://railway.app 접속
2. "Login with GitHub" 클릭
3. GitHub 계정 연동
```

### 2단계: 새 프로젝트 생성

```
1. Dashboard → "New Project" 클릭
2. "Deploy from GitHub repo" 선택
3. "doublesilver/maintenance-app" 선택
```

### 3단계: ⭐ Root Directory 설정 (중요!)

```
배포가 시작되면 즉시:

1. 생성된 서비스 클릭
2. "Settings" 탭 클릭
3. "Root Directory" 찾기
4. 값 입력: backend
5. "Deploy" 클릭 (재배포)
```

### 4단계: 환경변수 설정

```
"Variables" 탭에서 추가:

GROQ_API_KEY=your-groq-api-key-here

DATABASE_URL=sqlite:///./maintenance.db

SECRET_KEY=building-maintenance-secret-key-2025-doublesilver

ALGORITHM=HS256

ACCESS_TOKEN_EXPIRE_MINUTES=30
```

**Groq API Key 발급 방법**:
1. https://console.groq.com 접속
2. 회원가입 (Google/GitHub 로그인)
3. API Keys → Create API Key
4. 생성된 키 복사 → Railway에 입력

### 5단계: Redis 서비스 추가

```
1. 프로젝트에서 "New" → "Database" 클릭
2. "Add Redis" 선택
3. 자동으로 REDIS_URL 환경변수가 백엔드 서비스에 추가됨
```

### 6단계: Celery Worker 추가 (선택)

```
1. "New" → "Empty Service" 클릭
2. "Settings" 탭:
   - Name: celery-worker
   - Root Directory: backend
   - Start Command: celery -A celery_app worker --loglevel=info

3. "Variables" 탭에서 Redis 연결:
   - REDIS_URL=${{Redis.REDIS_URL}} (자동 참조)
```

### 7단계: 도메인 생성

```
1. 백엔드 서비스 → "Settings" 탭
2. "Domains" 섹션 → "Generate Domain" 클릭
3. 생성된 URL 복사 (예: https://maintenance-backend-production.up.railway.app)
```

---

## 📋 배포 확인 체크리스트

- [ ] Backend 서비스 Root Directory = `backend`
- [ ] 환경변수 5개 입력 (GROQ_API_KEY, DATABASE_URL, SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_MINUTES)
- [ ] Redis 서비스 추가됨
- [ ] REDIS_URL 자동 연결됨
- [ ] 도메인 생성됨
- [ ] Deployments 탭에서 "SUCCESS" 확인

---

## 🔧 트러블슈팅

### 문제 1: "Railpack could not determine how to build"

**원인**: Root Directory가 설정되지 않음

**해결**:
1. Settings → Root Directory → `backend` 입력
2. Redeploy

### 문제 2: "Module not found"

**원인**: requirements.txt 경로 문제

**해결**:
1. Settings → Custom Build Command: `pip install -r requirements.txt`
2. Settings → Custom Start Command: `python main_v2.py`

### 문제 3: Redis 연결 안 됨

**원인**: REDIS_URL 환경변수 미설정

**해결**:
1. Redis 서비스가 생성되었는지 확인
2. Backend 서비스 Variables에 `REDIS_URL=${{Redis.REDIS_URL}}` 있는지 확인

---

## 🎯 대안: 백엔드만 별도 저장소로 배포

Railway가 계속 문제 생기면 백엔드만 별도 저장소로 만들어 배포할 수 있습니다.

### 방법 1: GitHub에 backend-only 브랜치 생성

```bash
cd C:\projact

# backend만 있는 브랜치 생성
git checkout --orphan backend-only
git rm -rf .
git clean -fdx

# backend 파일만 복사
cp -r backend/* .
git add .
git commit -m "Backend only for Railway deployment"
git push origin backend-only
```

그 다음 Railway에서 `backend-only` 브랜치를 배포하면 Root Directory 설정 불필요!

---

## ✅ 성공 시 다음 단계

### 1. Vercel 환경변수 업데이트

```
Vercel Dashboard:
1. maintenance-app 프로젝트
2. Settings → Environment Variables
3. NEXT_PUBLIC_API_URL 수정:
   기존: http://localhost:8000
   새값: https://your-railway-url.up.railway.app
4. Save
5. Deployments → Redeploy
```

### 2. README 업데이트

```markdown
### 🌐 라이브 데모

- **Frontend**: [https://maintenance-app-azure.vercel.app](https://maintenance-app-azure.vercel.app)
- **API 문서**: [https://your-railway-url.up.railway.app/docs](https://your-railway-url.up.railway.app/docs)
- **GitHub**: [https://github.com/doublesilver/maintenance-app](https://github.com/doublesilver/maintenance-app)
```

### 3. 테스트

```bash
# API 접근 테스트
curl https://your-railway-url.up.railway.app/docs

# Vercel 프론트엔드에서 요청 제출
# → Railway 백엔드 → OpenAI → 결과 반환
```

---

## 🚀 지금 할 일

1. Railway Dashboard에서 **Settings → Root Directory → backend** 입력
2. **Redeploy** 클릭
3. 2-3분 기다리기
4. Deployments 탭에서 "SUCCESS" 확인!

**문제 계속되면 알려주세요!** 다른 방법으로 해결하겠습니다.

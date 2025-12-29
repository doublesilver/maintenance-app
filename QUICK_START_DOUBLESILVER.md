# 🚀 빠른 시작 가이드 - doublesilver용

## ✅ 현재 상태
- ✅ GitHub 사용자명: `doublesilver`
- ✅ Redis: WSL2에서 실행 중
- ✅ OpenAI API Key: 설정됨
- ✅ 환경변수: 업데이트 완료
- ⏳ AWS: 결제수단 등록 대기 중

---

## 🎯 지금 바로 실행 (3단계)

### 1단계: Redis 확인 및 실행

```bash
# WSL에서 Redis 상태 확인
wsl
redis-cli ping
# PONG 나오면 OK

# 안 나오면 시작
sudo service redis-server start
redis-cli ping
# PONG 확인
```

### 2단계: 백엔드 v2.0 실행

**터미널 1 (백엔드):**
```bash
cd C:\projact\backend
venv\Scripts\activate

# 처음 1회만: 새 의존성 설치
pip install celery redis flower boto3 python-multipart "python-jose[cryptography]" "passlib[bcrypt]"

# 백엔드 실행
python main_v2.py
```

성공 메시지:
```
INFO:     Started server process [xxxxx]
INFO:     Uvicorn running on http://0.0.0.0:8000
```

**터미널 2 (Celery Worker):**
```bash
cd C:\projact\backend
venv\Scripts\activate

# Celery Worker 실행 (Windows용)
celery -A celery_app worker --loglevel=info -P solo
```

성공 메시지:
```
-------------- celery@YOUR_COMPUTER v5.4.0
--- ***** -----
-- ******* ---- Tasks:
  - tasks.categorize_maintenance_request
  - tasks.send_notification_email
  - tasks.cleanup_old_requests

[tasks]
  . tasks.categorize_maintenance_request
  . tasks.send_notification_email
  . tasks.cleanup_old_requests

[2025-XX-XX XX:XX:XX,XXX: INFO/MainProcess] Connected to redis://localhost:6379/0
[2025-XX-XX XX:XX:XX,XXX: INFO/MainProcess] celery@YOUR_COMPUTER ready.
```

**터미널 3 (프론트엔드 - 이미 실행 중이면 스킵):**
```bash
cd C:\projact\frontend
npm run dev
```

---

## 🧪 3단계: 비동기 처리 테스트

### 테스트 A: Swagger UI

1. **브라우저 접속**: http://localhost:8000/docs
2. **POST /api/requests** 클릭 → "Try it out"
3. **Request body 입력**:

```json
{
  "description": "2층 화장실 전등이 깜빡거립니다. 급히 수리 필요합니다.",
  "location": "2층 남자 화장실",
  "contact_info": "doublesilver@example.com",
  "use_async": true
}
```

4. **Execute** 클릭

5. **응답 확인** (0.1초 내):
```json
{
  "id": 1,
  "description": "2층 화장실 전등이 깜빡거립니다...",
  "category": "processing",  // ← 아직 처리 중
  "priority": "processing",
  "status": "pending",
  "task_id": "abc123-def456-..."  // ← Celery 작업 ID
}
```

6. **Celery Worker 터미널 확인**:
```
[INFO] Task tasks.categorize_maintenance_request[abc123] received
[INFO] Task tasks.categorize_maintenance_request[abc123] succeeded in 2.5s
```

7. **다시 조회** (GET /api/requests/1):
```json
{
  "id": 1,
  "category": "electrical",  // ← AI가 분류 완료!
  "priority": "high",
  "status": "pending"
}
```

### 테스트 B: 프론트엔드

1. http://localhost:3000/submit 접속
2. 요청 제출
3. AI 분류 결과 즉시 확인
4. http://localhost:3000/dashboard 에서 전체 요청 확인

---

## 📦 GitHub 저장소 생성 및 푸시

### 1. GitHub에서 저장소 생성

1. https://github.com/new 접속
2. Repository name: `maintenance-app`
3. Description: `AI-powered building maintenance management system`
4. Public 선택
5. **Initialize this repository 체크 해제** (중요!)
6. Create repository

### 2. 로컬에서 푸시

**Option A: 스크립트 사용 (간편)**
```bash
cd C:\projact
setup-github.bat
```

**Option B: 수동 실행**
```bash
cd C:\projact

# README 복사
copy README_ENHANCED.md README.md

# Git 초기화
git init
git add .
git commit -m "feat: AI building maintenance system v2.0"

# 원격 저장소 연결
git remote add origin https://github.com/doublesilver/maintenance-app.git
git branch -M main
git push -u origin main
```

**GitHub 계정 로그인 창이 뜨면 로그인하세요!**

---

## 🌐 Vercel 배포 (프론트엔드)

### 1. Vercel CLI 설치 및 로그인

```bash
npm install -g vercel
vercel login
# 브라우저에서 인증
```

### 2. 프론트엔드 배포

```bash
cd C:\projact\frontend

# 첫 배포 (대화형)
vercel

# 질문 답변:
# - Set up and deploy? Yes
# - Which scope? (본인 계정 선택)
# - Link to existing project? No
# - What's your project's name? maintenance-app
# - In which directory is your code located? ./
# - Want to override settings? No

# 프로덕션 배포
vercel --prod
```

### 3. 환경변수 설정

```bash
# API URL 설정
vercel env add NEXT_PUBLIC_API_URL production

# 입력 값:
http://localhost:8000

# (나중에 AWS 배포하면 변경)
```

### 4. 배포 URL 확인

```
✔ Production: https://maintenance-app-xxxx.vercel.app
```

이 URL을 포트폴리오에 추가하세요!

---

## 📸 스크린샷 캡처 (포트폴리오용)

다음 화면들을 캡처하세요:

1. **홈페이지**: http://localhost:3000
2. **요청 제출**: http://localhost:3000/submit
3. **AI 분류 결과**: 제출 성공 화면
4. **대시보드**: http://localhost:3000/dashboard (데이터 있을 때)
5. **API 문서**: http://localhost:8000/docs
6. **Celery Worker**: 터미널 로그
7. **GitHub 저장소**: https://github.com/doublesilver/maintenance-app

저장: `C:\projact\screenshots\` 폴더 생성

---

## ✅ 완료 체크리스트

### 오늘 완료
- [ ] Redis 실행 확인
- [ ] 백엔드 v2.0 실행
- [ ] Celery Worker 실행
- [ ] 비동기 요청 테스트
- [ ] GitHub 저장소 생성
- [ ] GitHub에 코드 푸시

### 내일 완료
- [ ] Vercel 배포
- [ ] 스크린샷 5장 캡처
- [ ] README.md 최종 확인
- [ ] 포트폴리오 추가

### 나중에 (AWS 결제수단 등록 후)
- [ ] AWS EC2 배포
- [ ] S3 버킷 생성
- [ ] 실제 배포 URL 확보

---

## 🔧 트러블슈팅

### Redis 연결 안 됨

```bash
# WSL에서:
sudo service redis-server status
sudo service redis-server start
redis-cli ping
```

### Celery Worker 오류

```bash
# Windows에서는 반드시 -P solo 옵션 필요
celery -A celery_app worker --loglevel=info -P solo
```

### 패키지 설치 오류

```bash
# 가상환경 재생성
cd C:\projact\backend
rmdir /s venv
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

---

## 📞 다음 단계

1. **지금**: Redis + Celery 테스트
2. **오늘**: GitHub 푸시
3. **내일**: Vercel 배포
4. **이번 주**: 포트폴리오 정리
5. **나중에**: AWS 배포

---

## 🎯 최종 목표

**면접 전까지 준비할 것**:

- [x] 로컬 작동 확인
- [ ] GitHub 저장소 (https://github.com/doublesilver/maintenance-app)
- [ ] Vercel 배포 (https://maintenance-app.vercel.app)
- [ ] 스크린샷 5장
- [ ] 면접 답변 준비

---

**지금 바로 시작하세요!** 🚀

```bash
# 1. WSL에서 Redis 확인
wsl
redis-cli ping

# 2. 백엔드 실행
cd C:\projact\backend
python main_v2.py

# 3. Celery Worker (새 터미널)
cd C:\projact\backend
celery -A celery_app worker --loglevel=info -P solo
```

**성공하면 http://localhost:8000/docs 에서 테스트하세요!** 🎉

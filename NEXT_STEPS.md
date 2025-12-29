# 🚀 다음 할 일 - 실행 계획

현재 코드는 완성되었습니다! 이제 **실제로 작동시키고 배포하는 단계**입니다.

---

## ⏰ 우선순위별 할 일

### 🔥 지금 바로 (30분)

#### 1. v2.0 기능 테스트

```bash
# 새 의존성 설치
cd C:\projact\backend
pip install celery redis flower boto3 python-multipart "python-jose[cryptography]" "passlib[bcrypt]"

# Redis 실행 (Docker)
docker run -d -p 6379:6379 redis:alpine

# 또는 Windows용 Redis (WSL2)
wsl
sudo service redis-server start
```

#### 2. 환경변수 업데이트

```bash
# .env 파일에 추가
notepad .env

# 추가할 내용:
REDIS_URL=redis://localhost:6379/0
SECRET_KEY=your-super-secret-key-here-change-this
AWS_ACCESS_KEY_ID=temporary-not-configured
AWS_SECRET_ACCESS_KEY=temporary-not-configured
AWS_REGION=ap-northeast-2
S3_BUCKET_NAME=maintenance-test
```

#### 3. Celery Worker 실행

```bash
# 터미널 1: 백엔드
cd C:\projact\backend
python main_v2.py

# 터미널 2: Celery Worker
cd C:\projact\backend
celery -A celery_app worker --loglevel=info

# 터미널 3: 프론트엔드 (기존)
cd C:\projact\frontend
npm run dev
```

#### 4. 비동기 처리 테스트

```bash
# http://localhost:8000/docs 접속
# POST /api/requests 테스트:

{
  "description": "전등이 깜빡입니다",
  "location": "2층",
  "use_async": true
}

# 즉시 응답 확인 (0.1초)
# Celery Worker 콘솔에서 작업 처리 로그 확인
```

---

### 🎯 오늘/내일 (2-3시간)

#### 1. GitHub 저장소 생성

```bash
cd C:\projact

# Git 초기화
git init
git add .
git commit -m "Initial commit: AI building maintenance system v2.0"

# GitHub에 저장소 생성 후:
git remote add origin https://github.com/YOUR_USERNAME/maintenance-app.git
git branch -M main
git push -u origin main
```

#### 2. Vercel 배포 (프론트엔드)

```bash
cd frontend

# Vercel 배포
npm install -g vercel
vercel login
vercel

# 환경변수 설정
vercel env add NEXT_PUBLIC_API_URL production
# 값: http://localhost:8000 (나중에 EC2 IP로 변경)

# 프로덕션 배포
vercel --prod
```

#### 3. README 업데이트

```bash
# README_ENHANCED.md를 README.md로 복사
cp README_ENHANCED.md README.md

# GitHub 링크 수정
# YOUR_USERNAME → 실제 GitHub 사용자명
# YOUR_EC2_IP → 나중에 추가

# Commit
git add README.md
git commit -m "Update README with deployment info"
git push
```

---

### 📸 이번 주 (3-5시간)

#### 1. 스크린샷 캡처

다음 화면들을 캡처하세요:

1. **홈페이지**: http://localhost:3000
2. **요청 제출 폼**: http://localhost:3000/submit
3. **AI 분류 결과**: 제출 후 성공 화면
4. **대시보드**: http://localhost:3000/dashboard
5. **API 문서**: http://localhost:8000/docs
6. **Celery Worker**: 터미널 로그
7. **GitHub 저장소**: 코드 브라우징
8. **Vercel 배포**: 배포 성공 화면

저장 위치: `C:\projact\screenshots\`

#### 2. 프로젝트 데모 데이터 생성

```bash
# Swagger UI에서 여러 요청 생성:
http://localhost:8000/docs

# 다양한 카테고리:
1. "수도꼭지에서 물이 샙니다" (plumbing)
2. "전등이 안 켜집니다" (electrical)
3. "에어컨이 작동하지 않습니다" (hvac)
4. "벽에 금이 갔습니다" (structural)
5. "건의사항: 주차장 표지판 필요" (other)

# 상태 변경:
- 일부는 "진행중"으로
- 일부는 "완료"로
```

---

### 🚀 다음 주 (AWS 배포 - 선택사항)

#### Option A: 실제 AWS 배포 (권장)

```bash
# AWS_DEPLOYMENT_GUIDE.md 참조
# 예상 비용: $0-5/월 (프리 티어)
# 소요 시간: 3-4시간

# 순서:
1. AWS 계정 생성
2. EC2 인스턴스 생성
3. Elastic IP 할당
4. 서버 설정 및 배포
5. RDS PostgreSQL (선택)
6. S3 버킷 생성
```

#### Option B: 로컬 + Vercel만 (빠른 방법)

```bash
# 백엔드: 로컬 실행
# 프론트엔드: Vercel 배포

# 면접 시:
"현재 프론트엔드는 Vercel에 배포했고,
백엔드는 AWS EC2 배포 계획 중입니다.
로컬에서는 전체 기능이 작동하며,
Docker Compose로 원클릭 실행 가능합니다."
```

---

## 📋 체크리스트 (우선순위순)

### 최우선 (오늘)
- [ ] Redis 설치 및 실행
- [ ] 새 의존성 설치
- [ ] Celery Worker 실행 테스트
- [ ] 비동기 요청 작동 확인

### 중요 (내일)
- [ ] GitHub 저장소 생성
- [ ] Vercel 프론트엔드 배포
- [ ] 스크린샷 5장+ 캡처
- [ ] 데모 데이터 생성

### 권장 (이번 주)
- [ ] README.md 완성
- [ ] 포트폴리오에 프로젝트 추가
- [ ] LinkedIn에 공유
- [ ] 기술 블로그 포스트 작성 (선택)

### 선택 (여유 있으면)
- [ ] AWS 실제 배포
- [ ] 시연 영상 제작
- [ ] 추가 기능 개발
- [ ] 성능 테스트

---

## 🎓 학습 자료 (필요 시)

### Celery + Redis
- [Celery 공식 문서](https://docs.celeryq.dev/)
- [Redis 시작하기](https://redis.io/docs/getting-started/)

### AWS 배포
- [AWS EC2 시작하기](https://docs.aws.amazon.com/ec2/)
- [FastAPI 배포 가이드](https://fastapi.tiangolo.com/deployment/)

### GitHub Actions
- [GitHub Actions 문서](https://docs.github.com/actions)

---

## 💬 면접 준비

### 예상 질문 & 답변 준비

1. **"프로젝트 소개를 해주세요"** (2분)
   - [PORTFOLIO_SUMMARY.md](PORTFOLIO_SUMMARY.md) 참고

2. **"기술적으로 어려웠던 부분은?"**
   - 비동기 처리 도입 과정
   - AWS 배포 경험

3. **"AI 도구를 어떻게 활용했나요?"**
   - Claude Code 활용 사례

4. **"이 기술을 선택한 이유는?"**
   - FastAPI: 빠른 개발, 자동 문서화
   - Celery: 비동기 작업 큐 표준
   - Next.js: SSR, SEO 최적화

---

## 🔧 트러블슈팅 미리 보기

### Redis 연결 안 됨
```bash
# Docker로 실행 (가장 쉬움)
docker run -d -p 6379:6379 redis:alpine

# 연결 확인
redis-cli ping  # PONG 나와야 함
```

### Celery Worker 오류
```bash
# 경로 확인
cd C:\projact\backend
pwd

# celery_app.py 존재 확인
ls celery_app.py

# 재실행
celery -A celery_app worker --loglevel=info
```

### 패키지 설치 오류
```bash
# 가상환경 재생성
cd C:\projact\backend
rm -rf venv
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```

---

## 📞 도움이 필요하면

### 커뮤니티
- **FastAPI Discord**: https://discord.gg/fastapi
- **Celery GitHub**: https://github.com/celery/celery
- **Stack Overflow**: 태그로 검색

### 공식 문서
- [FastAPI 문서](https://fastapi.tiangolo.com/)
- [Next.js 문서](https://nextjs.org/docs)
- [Celery 문서](https://docs.celeryq.dev/)

---

## 🎯 최종 목표

**면접 전까지 준비할 것**:

1. ✅ **작동하는 프로젝트**: 로컬에서 완벽히 작동
2. ✅ **GitHub 저장소**: Public 공개
3. ✅ **Vercel 배포**: 접속 가능한 URL
4. ✅ **스크린샷**: 5-10장
5. ✅ **README**: 프로젝트 설명 완성
6. ✅ **면접 답변**: 주요 질문 대답 준비

---

**지금 바로 시작하세요! 🚀**

```bash
# 1단계: Redis 실행
docker run -d -p 6379:6379 redis:alpine

# 2단계: 의존성 설치
cd C:\projact\backend
pip install celery redis flower boto3 python-multipart "python-jose[cryptography]" "passlib[bcrypt]"

# 3단계: 테스트
python main_v2.py
# 새 터미널
celery -A celery_app worker --loglevel=info
```

**질문이 있으면 언제든 물어보세요!** 💪

# 배포 가이드

이 문서는 건물 유지보수 관리 시스템을 AWS에 배포하는 단계별 가이드입니다.

## 목차

1. [사전 준비](#사전-준비)
2. [Docker를 사용한 로컬 배포](#docker를-사용한-로컬-배포)
3. [AWS Elastic Beanstalk 배포 (백엔드)](#aws-elastic-beanstalk-배포-백엔드)
4. [Vercel 배포 (프론트엔드)](#vercel-배포-프론트엔드)
5. [AWS Amplify 배포 (프론트엔드 대안)](#aws-amplify-배포-프론트엔드-대안)
6. [PostgreSQL 데이터베이스 설정](#postgresql-데이터베이스-설정)
7. [환경변수 관리](#환경변수-관리)
8. [모니터링 및 로깅](#모니터링-및-로깅)

---

## 사전 준비

### 필수 계정 및 도구

1. **AWS 계정**: [aws.amazon.com](https://aws.amazon.com/)
2. **OpenAI API 키**: [platform.openai.com](https://platform.openai.com/)
3. **Docker**: [docker.com](https://www.docker.com/)
4. **AWS CLI**: [설치 가이드](https://aws.amazon.com/cli/)
5. **EB CLI**: `pip install awsebcli`
6. **Vercel 계정** (선택): [vercel.com](https://vercel.com/)

### AWS 자격증명 설정

```bash
# AWS CLI 설정
aws configure

# 입력 정보:
# - AWS Access Key ID
# - AWS Secret Access Key
# - Default region: ap-northeast-2 (서울)
# - Default output format: json
```

---

## Docker를 사용한 로컬 배포

Docker Compose를 사용하여 전체 스택을 로컬에서 실행할 수 있습니다.

### 1. 환경변수 설정

```bash
# 프로젝트 루트에 .env 파일 생성
OPENAI_API_KEY=your_openai_api_key_here
```

### 2. Docker 빌드 및 실행

```bash
# 프로젝트 루트에서
docker-compose up --build

# 백그라운드 실행
docker-compose up -d

# 로그 확인
docker-compose logs -f

# 중지
docker-compose down
```

### 3. 접속

- 프론트엔드: `http://localhost:3000`
- 백엔드 API: `http://localhost:8000`
- API 문서: `http://localhost:8000/docs`

---

## AWS Elastic Beanstalk 배포 (백엔드)

Elastic Beanstalk을 사용하여 FastAPI 백엔드를 배포합니다.

### 1. EB CLI 초기화

```bash
cd backend

# Elastic Beanstalk 애플리케이션 초기화
eb init

# 선택 옵션:
# - Region: ap-northeast-2 (Seoul)
# - Application name: building-maintenance-api
# - Platform: Python 3.11
# - CodeCommit: No
# - SSH: Yes (권장)
```

### 2. 환경 생성

```bash
# 프로덕션 환경 생성
eb create production

# 또는 개발 환경
eb create development
```

### 3. 환경변수 설정

```bash
# OpenAI API 키 설정
eb setenv OPENAI_API_KEY=your_openai_api_key_here

# 여러 환경변수 한 번에 설정
eb setenv OPENAI_API_KEY=your_key DATABASE_URL=postgresql://...
```

### 4. 배포

```bash
# 현재 코드 배포
eb deploy

# 배포 상태 확인
eb status

# 로그 확인
eb logs

# 애플리케이션 열기
eb open
```

### 5. RDS PostgreSQL 연결 (선택)

SQLite 대신 RDS PostgreSQL을 사용하려면:

```bash
# RDS 데이터베이스 생성 (EB 콘솔에서)
# 또는 별도로 RDS 인스턴스 생성

# requirements.txt에 psycopg2 추가
echo "psycopg2-binary==2.9.9" >> requirements.txt

# main.py 수정하여 PostgreSQL 연결
# DATABASE_URL 환경변수 설정
eb setenv DATABASE_URL=postgresql://user:password@host:5432/dbname
```

### 6. HTTPS 설정

```bash
# AWS Certificate Manager에서 SSL 인증서 발급
# EB 환경 구성에서 로드 밸런서 HTTPS 리스너 추가
```

---

## Vercel 배포 (프론트엔드)

Vercel을 사용하여 Next.js 프론트엔드를 배포합니다.

### 1. Vercel CLI 설치 및 로그인

```bash
npm install -g vercel
vercel login
```

### 2. 프로젝트 배포

```bash
cd frontend

# 첫 배포 (대화형)
vercel

# 프로덕션 배포
vercel --prod
```

### 3. 환경변수 설정

Vercel 대시보드에서:
1. 프로젝트 선택
2. Settings → Environment Variables
3. 추가:
   - Key: `NEXT_PUBLIC_API_URL`
   - Value: `https://your-eb-url.elasticbeanstalk.com`
   - Environment: Production

또는 CLI로:

```bash
vercel env add NEXT_PUBLIC_API_URL production
# 프롬프트에서 URL 입력
```

### 4. 재배포

환경변수 변경 후 재배포:

```bash
vercel --prod
```

### 5. 커스텀 도메인 설정 (선택)

Vercel 대시보드에서:
1. Settings → Domains
2. 도메인 추가
3. DNS 설정

---

## AWS Amplify 배포 (프론트엔드 대안)

Vercel 대신 AWS Amplify를 사용할 수 있습니다.

### 1. Git 저장소 연결

1. AWS Amplify 콘솔 접속
2. "Host web app" 선택
3. GitHub/GitLab/Bitbucket 연결
4. 저장소 및 브랜치 선택

### 2. 빌드 설정

```yaml
# amplify.yml (자동 생성됨)
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - cd frontend
        - npm ci
    build:
      commands:
        - npm run build
  artifacts:
    baseDirectory: frontend/.next
    files:
      - '**/*'
  cache:
    paths:
      - frontend/node_modules/**/*
```

### 3. 환경변수 설정

Amplify 콘솔에서:
1. App settings → Environment variables
2. 추가:
   - Key: `NEXT_PUBLIC_API_URL`
   - Value: `https://your-eb-url.elasticbeanstalk.com`

### 4. 배포

Git push 시 자동 배포됩니다.

```bash
git add .
git commit -m "Deploy to Amplify"
git push origin main
```

---

## PostgreSQL 데이터베이스 설정

프로덕션 환경에서는 PostgreSQL 사용을 권장합니다.

### 1. AWS RDS PostgreSQL 인스턴스 생성

```bash
# AWS CLI로 RDS 생성
aws rds create-db-instance \
    --db-instance-identifier maintenance-db \
    --db-instance-class db.t3.micro \
    --engine postgres \
    --master-username admin \
    --master-user-password YourPassword123 \
    --allocated-storage 20 \
    --vpc-security-group-ids sg-xxxxxxxx \
    --db-name maintenance

# 생성 완료까지 약 5-10분 소요
```

### 2. 백엔드 코드 수정

`backend/main.py` 수정:

```python
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./maintenance.db")

# PostgreSQL 사용 시
if DATABASE_URL.startswith("postgresql"):
    engine = create_engine(DATABASE_URL)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
else:
    # SQLite 사용
    # 기존 코드 유지
    pass
```

### 3. 마이그레이션

```bash
# Alembic 설치
pip install alembic

# Alembic 초기화
alembic init alembic

# 마이그레이션 생성
alembic revision --autogenerate -m "Initial migration"

# 마이그레이션 실행
alembic upgrade head
```

---

## 환경변수 관리

### 개발 환경

```bash
# backend/.env
OPENAI_API_KEY=sk-...
DATABASE_URL=sqlite:///./maintenance.db

# frontend/.env.local
NEXT_PUBLIC_API_URL=http://localhost:8000
```

### 프로덕션 환경

**백엔드 (Elastic Beanstalk):**

```bash
eb setenv \
  OPENAI_API_KEY=sk-... \
  DATABASE_URL=postgresql://user:pass@host:5432/db \
  CORS_ORIGINS=https://your-frontend-url.com
```

**프론트엔드 (Vercel):**

```bash
vercel env add NEXT_PUBLIC_API_URL production
# https://your-backend-url.elasticbeanstalk.com 입력
```

---

## 모니터링 및 로깅

### CloudWatch 로그

```bash
# EB 로그 스트리밍
eb logs --stream

# CloudWatch에서 로그 확인
aws logs tail /aws/elasticbeanstalk/production/var/log/eb-engine.log
```

### 헬스 체크

Elastic Beanstalk 콘솔에서:
1. Environment → Monitoring
2. 헬스 상태 확인
3. 알람 설정

### 비용 모니터링

AWS Cost Explorer에서 비용 추적:
1. 서비스별 비용 분석
2. 예산 알람 설정

---

## 보안 체크리스트

- [ ] OpenAI API 키를 환경변수로 관리
- [ ] 데이터베이스 자격증명 안전하게 저장
- [ ] HTTPS 사용
- [ ] CORS 적절히 설정
- [ ] RDS 보안 그룹 설정
- [ ] 정기적인 보안 업데이트
- [ ] API Rate Limiting 설정
- [ ] 백업 정책 수립

---

## 트러블슈팅

### EB 배포 실패

```bash
# 상세 로그 확인
eb logs

# 환경 재구축
eb rebuild
```

### CORS 오류

백엔드 `main.py`에서 프론트엔드 URL 추가:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-frontend-url.vercel.app"],
    ...
)
```

### 데이터베이스 연결 오류

- 보안 그룹 인바운드 규칙 확인
- 데이터베이스 자격증명 확인
- 네트워크 연결 확인

---

## 비용 최적화

1. **프리 티어 활용**:
   - EC2 t3.micro (750시간/월)
   - RDS db.t3.micro (750시간/월)
   - Amplify 빌드 (1000분/월)

2. **불필요한 리소스 정리**:
   ```bash
   # EB 환경 종료
   eb terminate production

   # RDS 삭제
   aws rds delete-db-instance --db-instance-identifier maintenance-db
   ```

3. **Auto Scaling 설정**으로 트래픽에 따라 자동 조정

---

## 다음 단계

배포 후:
1. 도메인 연결
2. 모니터링 대시보드 설정
3. CI/CD 파이프라인 구축
4. 백업 자동화
5. 성능 테스트

## 참고 자료

- [AWS Elastic Beanstalk 문서](https://docs.aws.amazon.com/elasticbeanstalk/)
- [Vercel 문서](https://vercel.com/docs)
- [Next.js 배포 가이드](https://nextjs.org/docs/deployment)
- [FastAPI 배포](https://fastapi.tiangolo.com/deployment/)

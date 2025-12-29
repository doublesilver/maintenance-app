# AWS 배포 가이드 - 실전 배포

이 가이드는 "더빌딩(The BLDGS) 바이브 코더" 포지션 지원을 위한 **실제 AWS 배포 경험**을 쌓기 위한 것입니다.

## 🎯 배포 목표

- ✅ EC2에 백엔드 배포
- ✅ S3로 프론트엔드 호스팅 (또는 Vercel)
- ✅ RDS PostgreSQL 연결
- ✅ Redis 설정 (ElastiCache 또는 EC2)
- ✅ 실제 접속 가능한 URL 확보
- ✅ CI/CD 파이프라인 구축

---

## Phase 1: AWS 인프라 설정 (30분)

### 1. EC2 인스턴스 생성

```bash
# AWS Console에서:
1. EC2 > Launch Instance
2. 이름: maintenance-backend-server
3. AMI: Amazon Linux 2023
4. 인스턴스 유형: t3.micro (프리 티어)
5. 키 페어: 새로 생성 (maintenance-key.pem 다운로드)
6. 보안 그룹:
   - SSH (22): My IP
   - HTTP (80): Anywhere
   - Custom TCP (8000): Anywhere
   - Custom TCP (6379): 현재 보안 그룹만 (Redis)
7. 스토리지: 8 GB gp3
8. Launch Instance
```

### 2. Elastic IP 할당 (고정 IP)

```bash
# EC2 Console:
1. Elastic IPs > Allocate Elastic IP address
2. 할당된 IP를 EC2 인스턴스에 연결
3. 이 IP를 프론트엔드 환경변수에 사용
```

### 3. S3 버킷 생성 (파일 업로드용)

```bash
# S3 Console:
1. Create bucket
2. 버킷 이름: maintenance-files-YOUR_NAME
3. 리전: ap-northeast-2 (서울)
4. Block all public access: OFF (파일 접근 허용)
5. Create bucket

# 버킷 정책 설정:
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicRead",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::maintenance-files-YOUR_NAME/*"
    }
  ]
}
```

### 4. RDS PostgreSQL 생성 (선택사항 - SQLite로도 OK)

```bash
# RDS Console:
1. Create database
2. Engine: PostgreSQL 15
3. Templates: Free tier
4. DB instance identifier: maintenance-db
5. Master username: postgres
6. Master password: (안전한 비밀번호)
7. DB instance class: db.t3.micro
8. Storage: 20 GB
9. VPC: EC2와 같은 VPC
10. Public access: Yes (개발 중)
11. Create database

# 연결 문자열:
postgresql://postgres:password@maintenance-db.xxx.ap-northeast-2.rds.amazonaws.com:5432/postgres
```

---

## Phase 2: EC2 서버 설정 (1시간)

### 1. SSH 접속

```bash
# 로컬에서:
chmod 400 maintenance-key.pem
ssh -i maintenance-key.pem ec2-user@YOUR_ELASTIC_IP
```

### 2. 서버 초기 설정

```bash
# EC2에서:
sudo yum update -y

# Python 3.11 설치
sudo yum install python3.11 python3.11-pip -y

# Git 설치
sudo yum install git -y

# Redis 설치
sudo yum install redis -y
sudo systemctl start redis
sudo systemctl enable redis

# Nginx 설치 (리버스 프록시)
sudo yum install nginx -y
sudo systemctl start nginx
sudo systemctl enable nginx

# Supervisor 설치 (프로세스 관리)
sudo pip3.11 install supervisor
```

### 3. 프로젝트 클론

```bash
cd /home/ec2-user
git clone YOUR_GITHUB_REPO_URL maintenance-app
cd maintenance-app/backend

# 가상환경 생성
python3.11 -m venv venv
source venv/bin/activate

# 의존성 설치
pip install -r requirements.txt
```

### 4. 환경변수 설정

```bash
# .env 파일 생성
nano .env

# 내용:
OPENAI_API_KEY=sk-proj-your-key
REDIS_URL=redis://localhost:6379/0
AWS_ACCESS_KEY_ID=your-key
AWS_SECRET_ACCESS_KEY=your-secret
AWS_REGION=ap-northeast-2
S3_BUCKET_NAME=maintenance-files-YOUR_NAME
DATABASE_URL=sqlite:///./maintenance.db
SECRET_KEY=your-super-secret-key
```

### 5. Nginx 설정

```bash
sudo nano /etc/nginx/conf.d/maintenance.conf

# 내용:
server {
    listen 80;
    server_name YOUR_ELASTIC_IP;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location /ws {
        proxy_pass http://127.0.0.1:8000/ws;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}

# Nginx 재시작
sudo systemctl restart nginx
```

### 6. Systemd 서비스 생성

```bash
# 백엔드 서비스
sudo nano /etc/systemd/system/maintenance-backend.service

# 내용:
[Unit]
Description=Maintenance Backend API
After=network.target

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/home/ec2-user/maintenance-app/backend
Environment="PATH=/home/ec2-user/maintenance-app/backend/venv/bin"
ExecStart=/home/ec2-user/maintenance-app/backend/venv/bin/uvicorn main_v2:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target

# Celery Worker 서비스
sudo nano /etc/systemd/system/celery-worker.service

# 내용:
[Unit]
Description=Celery Worker
After=network.target redis.service

[Service]
Type=simple
User=ec2-user
WorkingDirectory=/home/ec2-user/maintenance-app/backend
Environment="PATH=/home/ec2-user/maintenance-app/backend/venv/bin"
ExecStart=/home/ec2-user/maintenance-app/backend/venv/bin/celery -A celery_app worker --loglevel=info
Restart=always

[Install]
WantedBy=multi-user.target

# 서비스 시작
sudo systemctl daemon-reload
sudo systemctl start maintenance-backend
sudo systemctl start celery-worker
sudo systemctl enable maintenance-backend
sudo systemctl enable celery-worker

# 상태 확인
sudo systemctl status maintenance-backend
sudo systemctl status celery-worker
```

---

## Phase 3: 프론트엔드 배포 (Vercel - 10분)

### 1. Vercel 배포

```bash
# 로컬에서:
cd frontend

# Vercel CLI 설치
npm install -g vercel

# 로그인
vercel login

# 배포
vercel

# 환경변수 설정
vercel env add NEXT_PUBLIC_API_URL production
# 값: http://YOUR_ELASTIC_IP

# 프로덕션 배포
vercel --prod
```

### 2. 커스텀 도메인 (선택사항)

```bash
# Vercel Dashboard에서:
1. 프로젝트 선택
2. Settings > Domains
3. 도메인 추가 및 DNS 설정
```

---

## Phase 4: 모니터링 설정 (30분)

### 1. CloudWatch 로그 설정

```bash
# EC2에서:
sudo yum install amazon-cloudwatch-agent -y

# 설정
sudo /opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-config-wizard

# 로그 파일:
- /var/log/maintenance-backend.log
- /var/log/celery-worker.log
```

### 2. Flower (Celery 모니터링)

```bash
# Flower 실행
celery -A celery_app flower --port=5555

# 접속: http://YOUR_ELASTIC_IP:5555
# 보안 그룹에 5555 포트 추가 필요
```

---

## Phase 5: CI/CD 설정 (GitHub Actions)

### 1. GitHub Secrets 설정

```bash
# GitHub Repository > Settings > Secrets and variables > Actions

# 추가할 Secrets:
EC2_HOST=YOUR_ELASTIC_IP
EC2_USER=ec2-user
EC2_SSH_KEY=(maintenance-key.pem 내용 전체 복사)
VERCEL_TOKEN=(Vercel에서 발급)
VERCEL_ORG_ID=(Vercel 대시보드에서 확인)
VERCEL_PROJECT_ID=(Vercel 대시보드에서 확인)
```

### 2. 배포 테스트

```bash
# 로컬에서 코드 변경 후:
git add .
git commit -m "Test CI/CD deployment"
git push origin main

# GitHub Actions 확인:
# - 자동으로 테스트 실행
# - 테스트 통과 시 자동 배포
```

---

## 🎯 배포 완료 체크리스트

배포 후 다음 URL들이 작동해야 합니다:

- [ ] **백엔드 API**: http://YOUR_ELASTIC_IP/docs
- [ ] **프론트엔드**: https://your-project.vercel.app
- [ ] **WebSocket**: ws://YOUR_ELASTIC_IP/ws
- [ ] **Flower**: http://YOUR_ELASTIC_IP:5555 (선택)
- [ ] **파일 업로드**: S3 버킷에 이미지 저장 확인

---

## 💰 비용 예상 (프리 티어 사용 시)

| 서비스 | 프리 티어 | 예상 비용 |
|--------|----------|----------|
| EC2 t3.micro | 750시간/월 | $0 |
| RDS db.t3.micro | 750시간/월 | $0 |
| S3 | 5GB 저장 | $0 |
| Elastic IP | 인스턴스 연결 시 | $0 |
| 데이터 전송 | 1GB/월 | $0 |
| **총계** | | **$0 - $5/월** |

프리 티어 기간(12개월) 내에는 거의 무료입니다!

---

## 🔧 트러블슈팅

### 서비스가 시작되지 않을 때

```bash
# 로그 확인
sudo journalctl -u maintenance-backend -f
sudo journalctl -u celery-worker -f

# 포트 확인
sudo netstat -tulpn | grep 8000
sudo netstat -tulpn | grep 6379

# 방화벽 확인
sudo firewall-cmd --list-all
```

### Redis 연결 오류

```bash
# Redis 상태 확인
sudo systemctl status redis

# Redis 테스트
redis-cli ping
# PONG이 나와야 함
```

### S3 업로드 실패

```bash
# IAM 사용자 권한 확인
# S3FullAccess 또는 최소한:
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject"
      ],
      "Resource": "arn:aws:s3:::maintenance-files-YOUR_NAME/*"
    }
  ]
}
```

---

## 📸 포트폴리오에 추가할 스크린샷

1. **AWS Console**: EC2 인스턴스 Running 상태
2. **Swagger UI**: http://YOUR_IP/docs
3. **프론트엔드**: 실제 작동 화면
4. **CloudWatch**: 로그 스트리밍
5. **Flower**: Celery 작업 모니터링
6. **GitHub Actions**: 성공적인 배포 로그

---

## 🚀 다음 단계

배포 완료 후:
1. **도메인 연결** (선택사항)
2. **HTTPS 설정** (Let's Encrypt)
3. **Auto Scaling** 설정
4. **백업 자동화**
5. **모니터링 알람** 설정

---

## 💼 이력서에 작성할 내용

```markdown
### 건물 유지보수 관리 시스템 (2025)

**기술 스택**:
- Backend: FastAPI, Celery, Redis, PostgreSQL
- Frontend: Next.js, TypeScript, Tailwind CSS
- AI: OpenAI GPT-3.5
- Infra: AWS (EC2, S3, RDS, CloudWatch), Nginx
- DevOps: GitHub Actions, Systemd

**주요 성과**:
- AWS EC2/S3/RDS를 활용한 풀스택 애플리케이션 배포
- Celery + Redis로 비동기 작업 큐 구현 (응답 속도 3배 개선)
- GitHub Actions로 CI/CD 파이프라인 구축 (배포 자동화)
- WebSocket 실시간 알림으로 UX 향상
- 처음부터 끝까지 1인 개발·배포·운영

**배포 URL**: https://your-project.vercel.app
**GitHub**: https://github.com/your-username/maintenance-app
```

---

**질문이나 문제가 있으면 AWS 문서 또는 커뮤니티에서 도움을 받으세요!** 🚀

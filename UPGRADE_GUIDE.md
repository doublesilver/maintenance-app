# 🚀 v1.0 → v2.0 업그레이드 가이드

현재 작동 중인 기본 시스템을 **채용 공고 최적화 버전**으로 업그레이드하는 가이드입니다.

---

## 📋 변경 사항 요약

### 새로 추가된 기능
1. ✨ **비동기 작업 큐** (Celery + Redis)
2. ✨ **파일 업로드** (AWS S3)
3. ✨ **실시간 알림** (WebSocket)
4. ✨ **사용자 인증** (JWT)
5. ✨ **CI/CD 파이프라인** (GitHub Actions)
6. ✨ **향상된 API** (main_v2.py)

### 추가된 의존성
```
celery==5.4.0
redis==5.2.1
flower==2.0.1
boto3==1.35.95
python-multipart==0.0.20
python-jose[cryptography]
passlib[bcrypt]
```

---

## 🔄 Step 1: Redis 설치 및 실행

### Windows

```bash
# Option 1: Docker로 Redis 실행 (권장)
docker run -d -p 6379:6379 redis:alpine

# Option 2: WSL2로 Redis 설치
wsl
sudo apt update
sudo apt install redis-server
redis-server

# 연결 테스트
redis-cli ping
# PONG 나와야 함
```

### macOS

```bash
brew install redis
brew services start redis

# 연결 테스트
redis-cli ping
```

### Linux

```bash
sudo apt update
sudo apt install redis-server
sudo systemctl start redis
sudo systemctl enable redis
```

---

## 🔄 Step 2: 의존성 업그레이드

```bash
cd backend

# 가상환경 활성화
source venv/bin/activate  # Windows: venv\Scripts\activate

# 새 의존성 설치
pip install -r requirements.txt

# 추가 인증 라이브러리
pip install "python-jose[cryptography]" "passlib[bcrypt]"
```

---

## 🔄 Step 3: 환경변수 업데이트

```bash
# .env 파일에 추가
nano .env  # 또는 메모장으로 편집

# 추가할 내용:
REDIS_URL=redis://localhost:6379/0
AWS_ACCESS_KEY_ID=your-key-here
AWS_SECRET_ACCESS_KEY=your-secret-here
AWS_REGION=ap-northeast-2
S3_BUCKET_NAME=maintenance-files-test
SECRET_KEY=your-super-secret-key-change-this
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

---

## 🔄 Step 4: v2.0 백엔드로 전환

### Option A: 점진적 전환 (권장)

```bash
# 1. 기존 서버 중지 (Ctrl+C)

# 2. v2.0 서버 테스트
python main_v2.py

# 3. 작동 확인 후 main.py를 main_v1.py로 백업
mv main.py main_v1.py
mv main_v2.py main.py
```

### Option B: 병렬 실행 (테스트용)

```bash
# v1.0: 포트 8000
python main_v1.py

# v2.0: 포트 8001 (새 터미널)
python main_v2.py --port 8001
```

---

## 🔄 Step 5: Celery Worker 실행

```bash
# 새 터미널 열기
cd backend
source venv/bin/activate

# Celery Worker 실행
celery -A celery_app worker --loglevel=info

# 성공 메시지:
# -------------- celery@YOUR_COMPUTER v5.4.0
# --- ***** -----
# -- ******* ---- Tasks:
#   - tasks.categorize_maintenance_request
```

### Flower 실행 (선택사항 - Celery 모니터링)

```bash
# 새 터미널
cd backend
source venv/bin/activate

celery -A celery_app flower --port=5555

# 접속: http://localhost:5555
```

---

## 🔄 Step 6: 새 API 엔드포인트 테스트

### 1. 비동기 요청 생성

```bash
# Swagger UI: http://localhost:8000/docs
# POST /api/requests

{
  "description": "테스트 요청",
  "location": "1층",
  "contact_info": "010-1234-5678",
  "use_async": true
}

# 응답:
{
  "id": 1,
  "category": "processing",  # 아직 처리 중
  "priority": "processing",
  "task_id": "xxxxx-xxxxx"
}
```

### 2. 작업 상태 확인

```bash
GET /api/requests/1/task-status

# 응답:
{
  "task_id": "xxxxx",
  "status": "SUCCESS",  # 완료
  "result": {
    "category": "electrical",
    "priority": "medium"
  }
}
```

### 3. 파일 업로드 (S3 설정 후)

```bash
POST /api/requests/1/upload
# multipart/form-data
# file: (이미지 파일 선택)

# 응답:
{
  "image_url": "https://s3.../image.jpg",
  "message": "Image uploaded successfully"
}
```

### 4. WebSocket 연결

```javascript
// 브라우저 콘솔에서:
const ws = new WebSocket('ws://localhost:8000/ws');

ws.onmessage = (event) => {
  console.log('Real-time update:', JSON.parse(event.data));
};

// 새 요청 생성 시 자동으로 메시지 수신
```

---

## 🔄 Step 7: 프론트엔드 업데이트

### WebSocket 통합 예시

```typescript
// frontend/app/dashboard/page.tsx에 추가

import { useEffect } from 'react';

export default function Dashboard() {
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8000/ws');

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'new_request') {
        // 새 요청 추가
        console.log('New request:', data.data);
        fetchData(); // 데이터 다시 불러오기
      }
    };

    return () => ws.close();
  }, []);

  // 나머지 코드...
}
```

### 비동기 요청 제출 옵션

```typescript
// frontend/app/submit/page.tsx 수정

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  const requestData = {
    ...formData,
    use_async: true  // 비동기 처리 활성화
  };

  const response = await axios.post(`${API_URL}/api/requests`, requestData);

  if (response.data.task_id) {
    // 작업 상태 폴링
    const checkStatus = setInterval(async () => {
      const status = await axios.get(
        `${API_URL}/api/requests/${response.data.id}/task-status`
      );

      if (status.data.status === 'SUCCESS') {
        clearInterval(checkStatus);
        setResult(status.data.result);
      }
    }, 1000);
  }
};
```

---

## 🧪 테스트 체크리스트

- [ ] **Redis**: `redis-cli ping` → PONG
- [ ] **Celery Worker**: 콘솔에 "ready" 메시지
- [ ] **백엔드 v2.0**: http://localhost:8000/docs 접속
- [ ] **Flower**: http://localhost:5555 접속 (선택)
- [ ] **비동기 요청**: 0.1초 내 응답
- [ ] **WebSocket**: 실시간 알림 수신
- [ ] **파일 업로드**: S3 URL 반환 (S3 설정 시)

---

## 🔧 트러블슈팅

### Redis 연결 오류

```bash
# 오류: "Error 111 connecting to localhost:6379"

# 해결:
docker run -d -p 6379:6379 redis:alpine
# 또는
redis-server
```

### Celery Worker 시작 안 됨

```bash
# 오류: "No module named 'celery_app'"

# 해결:
# celery_app.py 파일이 backend/ 디렉토리에 있는지 확인
ls celery_app.py

# 경로 확인
pwd  # /path/to/projact/backend 여야 함
```

### S3 업로드 실패

```bash
# 오류: "S3 not configured"

# 해결:
# 1. AWS 자격증명 확인
cat .env | grep AWS

# 2. S3 버킷 생성 (AWS Console)
# 3. .env에 정보 입력

# 또는 S3 없이 테스트:
# S3 설정 안 하면 501 에러 정상
```

---

## 📊 성능 비교

### Before (v1.0)
```bash
# 요청 응답 시간
POST /api/requests → 2.5초 (AI 처리 대기)
```

### After (v2.0)
```bash
# 비동기 처리
POST /api/requests (use_async=true) → 0.1초 (즉시 응답)
# AI 처리는 백그라운드에서 2-3초 소요
```

---

## 🎯 다음 단계

v2.0 업그레이드 완료 후:

1. **AWS 배포**: [AWS_DEPLOYMENT_GUIDE.md](AWS_DEPLOYMENT_GUIDE.md) 참조
2. **CI/CD 설정**: GitHub Actions로 자동 배포
3. **모니터링**: CloudWatch + Flower
4. **포트폴리오 정리**: README_ENHANCED.md 기반으로 작성

---

## 💡 롤백 방법

문제 발생 시 v1.0으로 되돌리기:

```bash
# 백엔드
mv main.py main_v2_backup.py
mv main_v1.py main.py

# Celery Worker 중지
# Ctrl+C

# v1.0 실행
python main.py
```

---

**업그레이드 완료! 🎉**

이제 채용 공고 요구사항을 100% 충족하는 프로젝트가 되었습니다!

# 최적화 및 확장 가이드

건물 유지보수 관리 시스템의 성능 최적화 및 기능 확장 가이드입니다.

## 목차

1. [성능 최적화](#성능-최적화)
2. [데이터베이스 최적화](#데이터베이스-최적화)
3. [캐싱 전략](#캐싱-전략)
4. [추가 기능 구현](#추가-기능-구현)
5. [확장성 개선](#확장성-개선)
6. [모니터링 및 분석](#모니터링-및-분석)

---

## 성능 최적화

### 1. 백엔드 최적화

#### 데이터베이스 연결 풀링

```python
# backend/database.py
from sqlalchemy import create_engine
from sqlalchemy.pool import QueuePool

engine = create_engine(
    DATABASE_URL,
    poolclass=QueuePool,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,  # 연결 검증
    pool_recycle=3600,   # 1시간마다 재생성
)
```

#### 비동기 데이터베이스 작업

```python
# backend/main.py에 비동기 DB 지원 추가
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
import asyncpg

# PostgreSQL 비동기 연결
async_engine = create_async_engine(
    "postgresql+asyncpg://user:password@localhost/maintenance",
    echo=True,
)

@app.get("/api/requests")
async def get_all_requests_async():
    async with AsyncSession(async_engine) as session:
        result = await session.execute(select(Request))
        return result.scalars().all()
```

#### AI 응답 캐싱

```python
from functools import lru_cache
import hashlib

# 동일한 설명에 대한 AI 응답 캐싱
ai_cache = {}

async def categorize_with_ai(description: str) -> dict:
    # 캐시 키 생성
    cache_key = hashlib.md5(description.encode()).hexdigest()

    if cache_key in ai_cache:
        return ai_cache[cache_key]

    # AI 호출
    result = # ... OpenAI 호출
    ai_cache[cache_key] = result
    return result
```

### 2. 프론트엔드 최적화

#### React Query로 데이터 캐싱

```bash
cd frontend
npm install @tanstack/react-query
```

```typescript
// frontend/app/providers.tsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5분
      cacheTime: 10 * 60 * 1000, // 10분
    },
  },
})

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}
```

```typescript
// frontend/app/dashboard/page.tsx
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export default function Dashboard() {
  const queryClient = useQueryClient()

  const { data: requests, isLoading } = useQuery({
    queryKey: ['requests'],
    queryFn: async () => {
      const response = await axios.get(`${API_URL}/api/requests`)
      return response.data
    },
  })

  const updateMutation = useMutation({
    mutationFn: (data: { id: number; status: string }) =>
      axios.patch(`${API_URL}/api/requests/${data.id}`, { status: data.status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['requests'] })
    },
  })

  // ...
}
```

#### 이미지 최적화

```typescript
// frontend/next.config.js
module.exports = {
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  },
}
```

#### 코드 스플리팅

```typescript
// 동적 임포트로 번들 크기 감소
import dynamic from 'next/dynamic'

const DashboardChart = dynamic(() => import('@/components/DashboardChart'), {
  loading: () => <p>로딩 중...</p>,
  ssr: false,
})
```

---

## 데이터베이스 최적화

### 1. PostgreSQL 마이그레이션

```python
# backend/database.py
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime

Base = declarative_base()

class Request(Base):
    __tablename__ = "requests"

    id = Column(Integer, primary_key=True, index=True)
    description = Column(Text, nullable=False)
    category = Column(String(50), index=True)
    priority = Column(String(20), index=True)
    status = Column(String(20), default="pending", index=True)
    location = Column(String(100))
    contact_info = Column(String(100))
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

# 인덱스 생성
from sqlalchemy import Index

Index('idx_status_created', Request.status, Request.created_at)
Index('idx_category_priority', Request.category, Request.priority)
```

### 2. 쿼리 최적화

```python
# 느린 쿼리
@app.get("/api/requests")
async def get_requests():
    # N+1 문제 발생 가능
    requests = session.query(Request).all()
    return requests

# 최적화된 쿼리
@app.get("/api/requests")
async def get_requests(
    skip: int = 0,
    limit: int = 100,
    status: Optional[str] = None
):
    query = session.query(Request)

    if status:
        query = query.filter(Request.status == status)

    # 페이지네이션
    requests = query.offset(skip).limit(limit).all()
    return requests
```

### 3. 인덱스 전략

```sql
-- 자주 필터링되는 컬럼에 인덱스
CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_requests_category ON requests(category);
CREATE INDEX idx_requests_created_at ON requests(created_at DESC);

-- 복합 인덱스
CREATE INDEX idx_requests_status_created ON requests(status, created_at DESC);

-- 전문 검색 인덱스
CREATE INDEX idx_requests_description_fts ON requests USING GIN(to_tsvector('english', description));
```

---

## 캐싱 전략

### 1. Redis 캐싱

```bash
pip install redis aioredis
```

```python
# backend/cache.py
import redis
import json
from typing import Optional

redis_client = redis.Redis(
    host='localhost',
    port=6379,
    db=0,
    decode_responses=True
)

def get_cached_stats() -> Optional[dict]:
    """통계 캐시 조회"""
    cached = redis_client.get("stats")
    if cached:
        return json.loads(cached)
    return None

def set_cached_stats(stats: dict, ttl: int = 300):
    """통계 캐시 저장 (5분 TTL)"""
    redis_client.setex("stats", ttl, json.dumps(stats))

# main.py에서 사용
@app.get("/api/stats")
async def get_stats():
    # 캐시 확인
    cached = get_cached_stats()
    if cached:
        return cached

    # 캐시 미스 시 계산
    stats = calculate_stats()
    set_cached_stats(stats)
    return stats
```

### 2. HTTP 캐싱

```python
from fastapi import Response

@app.get("/api/requests")
async def get_requests(response: Response):
    response.headers["Cache-Control"] = "public, max-age=60"
    return requests
```

### 3. 프론트엔드 캐싱

```typescript
// SWR 사용
import useSWR from 'swr'

const fetcher = (url: string) => axios.get(url).then(res => res.data)

export default function Dashboard() {
  const { data, error, mutate } = useSWR('/api/requests', fetcher, {
    refreshInterval: 30000, // 30초마다 갱신
    revalidateOnFocus: true,
  })

  // ...
}
```

---

## 추가 기능 구현

### 1. 사용자 인증 (JWT)

```bash
pip install python-jose[cryptography] passlib[bcrypt]
```

```python
# backend/auth.py
from datetime import datetime, timedelta
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

SECRET_KEY = "your-secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401)
        return username
    except JWTError:
        raise HTTPException(status_code=401)

# main.py에서 사용
@app.post("/api/requests")
async def create_request(
    request: MaintenanceRequest,
    current_user: str = Depends(get_current_user)
):
    # 인증된 사용자만 요청 생성 가능
    # ...
```

### 2. 이메일 알림

```bash
pip install fastapi-mail
```

```python
# backend/notifications.py
from fastapi_mail import FastMail, MessageSchema, ConnectionConfig

conf = ConnectionConfig(
    MAIL_USERNAME="your-email@gmail.com",
    MAIL_PASSWORD="your-password",
    MAIL_FROM="your-email@gmail.com",
    MAIL_PORT=587,
    MAIL_SERVER="smtp.gmail.com",
    MAIL_STARTTLS=True,
    MAIL_SSL_TLS=False,
)

async def send_notification_email(request_id: int, status: str):
    message = MessageSchema(
        subject=f"요청 #{request_id} 상태 업데이트",
        recipients=["admin@example.com"],
        body=f"요청 상태가 {status}로 변경되었습니다.",
    )

    fm = FastMail(conf)
    await fm.send_message(message)

# main.py에서 사용
@app.patch("/api/requests/{request_id}")
async def update_request(request_id: int, update: UpdateRequest):
    # 상태 업데이트
    # ...

    # 이메일 알림 전송
    if update.status:
        await send_notification_email(request_id, update.status)

    return updated_request
```

### 3. 파일 업로드 (이미지 첨부)

```python
from fastapi import File, UploadFile
import boto3
import uuid

# AWS S3 클라이언트
s3_client = boto3.client('s3',
    aws_access_key_id='your-key',
    aws_secret_access_key='your-secret'
)

@app.post("/api/requests/{request_id}/upload")
async def upload_image(
    request_id: int,
    file: UploadFile = File(...)
):
    # 파일명 생성
    file_ext = file.filename.split('.')[-1]
    s3_key = f"requests/{request_id}/{uuid.uuid4()}.{file_ext}"

    # S3 업로드
    s3_client.upload_fileobj(
        file.file,
        'maintenance-bucket',
        s3_key,
        ExtraArgs={'ContentType': file.content_type}
    )

    # URL 반환
    url = f"https://maintenance-bucket.s3.amazonaws.com/{s3_key}"
    return {"url": url}
```

### 4. 실시간 알림 (WebSocket)

```python
from fastapi import WebSocket, WebSocketDisconnect

class ConnectionManager:
    def __init__(self):
        self.active_connections: list[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            await connection.send_json(message)

manager = ConnectionManager()

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

# 요청 생성 시 브로드캐스트
@app.post("/api/requests")
async def create_request(request: MaintenanceRequest):
    # 요청 생성
    # ...

    # 실시간 알림
    await manager.broadcast({
        "type": "new_request",
        "data": new_request
    })

    return new_request
```

### 5. 대시보드 차트

```bash
cd frontend
npm install chart.js react-chartjs-2
```

```typescript
// frontend/components/StatsChart.tsx
'use client'

import { Line, Pie } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

export function CategoryPieChart({ stats }: { stats: any }) {
  const data = {
    labels: Object.keys(stats.by_category),
    datasets: [
      {
        data: Object.values(stats.by_category),
        backgroundColor: [
          'rgba(255, 206, 86, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(255, 99, 132, 0.6)',
          'rgba(201, 203, 207, 0.6)',
        ],
      },
    ],
  }

  return <Pie data={data} />
}
```

---

## 확장성 개선

### 1. 마이크로서비스 아키텍처

```
기존: Frontend → Backend → Database

개선:
Frontend → API Gateway → [
  Auth Service
  Request Service
  Notification Service
  AI Service
] → Database(s)
```

### 2. 메시지 큐 (Celery)

```bash
pip install celery redis
```

```python
# backend/celery_app.py
from celery import Celery

celery_app = Celery(
    'maintenance',
    broker='redis://localhost:6379/0',
    backend='redis://localhost:6379/0'
)

@celery_app.task
def process_ai_categorization(request_id: int, description: str):
    """비동기 AI 카테고리화"""
    result = categorize_with_ai(description)
    update_request(request_id, result)

# main.py에서 사용
@app.post("/api/requests")
async def create_request(request: MaintenanceRequest):
    # 요청 먼저 저장
    new_request = save_request(request, category="pending", priority="pending")

    # 비동기로 AI 처리
    process_ai_categorization.delay(new_request.id, request.description)

    return new_request
```

### 3. CDN 활용

```typescript
// next.config.js
module.exports = {
  assetPrefix: process.env.CDN_URL || '',
}
```

---

## 모니터링 및 분석

### 1. Application Performance Monitoring

```bash
pip install newrelic
```

```python
# backend/main.py
import newrelic.agent
newrelic.agent.initialize('newrelic.ini')

@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response
```

### 2. 로깅

```python
import logging
from logging.handlers import RotatingFileHandler

# 로거 설정
logger = logging.getLogger("maintenance")
logger.setLevel(logging.INFO)

handler = RotatingFileHandler(
    "maintenance.log",
    maxBytes=10485760,  # 10MB
    backupCount=5
)

formatter = logging.Formatter(
    '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
handler.setFormatter(formatter)
logger.addHandler(handler)

# 사용
@app.post("/api/requests")
async def create_request(request: MaintenanceRequest):
    logger.info(f"New request created: {request.description[:50]}")
    # ...
```

### 3. Analytics (Mixpanel, Google Analytics)

```typescript
// frontend/lib/analytics.ts
export const trackEvent = (eventName: string, properties?: any) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, properties)
  }
}

// 사용
trackEvent('request_submitted', {
  category: result.category,
  priority: result.priority,
})
```

---

## 우선순위별 최적화 로드맵

### Phase 1 (즉시)
- [x] 데이터베이스 인덱스 추가
- [x] 프론트엔드 캐싱 (React Query)
- [x] 이미지 최적화
- [x] 로깅 구현

### Phase 2 (1-2주)
- [ ] PostgreSQL 마이그레이션
- [ ] Redis 캐싱
- [ ] 사용자 인증
- [ ] 이메일 알림

### Phase 3 (1-2개월)
- [ ] WebSocket 실시간 업데이트
- [ ] 파일 업로드
- [ ] 대시보드 차트
- [ ] 모니터링 구현

### Phase 4 (장기)
- [ ] 마이크로서비스 전환
- [ ] 메시지 큐 (Celery)
- [ ] CDN 통합
- [ ] AI 모델 파인튜닝

---

## 참고 자료

- [FastAPI Performance](https://fastapi.tiangolo.com/advanced/performance/)
- [React Query Documentation](https://tanstack.com/query/latest)
- [Redis Caching Best Practices](https://redis.io/docs/manual/patterns/)
- [PostgreSQL Performance Tips](https://www.postgresql.org/docs/current/performance-tips.html)

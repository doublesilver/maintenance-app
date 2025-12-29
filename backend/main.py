from fastapi import FastAPI, HTTPException, File, UploadFile, WebSocket, WebSocketDisconnect, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import sqlite3
from openai import OpenAI
import os
from contextlib import contextmanager
from dotenv import load_dotenv
import boto3
import uuid
from tasks import categorize_maintenance_request

# .env 파일 로드
load_dotenv()

# Groq 클라이언트 초기화 (OpenAI 대신 사용)
from groq import Groq
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# OpenAI 클라이언트 (백업용, 현재 비활성화)
# client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# S3 클라이언트 초기화
s3_client = boto3.client(
    's3',
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
    region_name=os.getenv('AWS_REGION', 'ap-northeast-2')
) if os.getenv('AWS_ACCESS_KEY_ID') else None

S3_BUCKET = os.getenv('S3_BUCKET_NAME', 'maintenance-files')

# 데이터베이스 연결 컨텍스트 매니저
@contextmanager
def get_db():
    conn = sqlite3.connect("maintenance.db")
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()

# 데이터베이스 초기화
def init_db():
    with get_db() as conn:
        cursor = conn.cursor()

        # requests 테이블
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS requests (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                description TEXT NOT NULL,
                category VARCHAR(50),
                priority VARCHAR(20),
                status VARCHAR(20) DEFAULT 'pending',
                location VARCHAR(100),
                contact_info VARCHAR(100),
                image_url VARCHAR(500),
                task_id VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        # users 테이블 (인증용)
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                email VARCHAR(255) UNIQUE NOT NULL,
                hashed_password VARCHAR(255) NOT NULL,
                full_name VARCHAR(100),
                role VARCHAR(20) DEFAULT 'user',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        conn.commit()

# Pydantic 모델
class MaintenanceRequest(BaseModel):
    description: str
    location: Optional[str] = None
    contact_info: Optional[str] = None
    use_async: bool = True  # 비동기 처리 옵션

class UpdateRequest(BaseModel):
    status: Optional[str] = None
    category: Optional[str] = None
    priority: Optional[str] = None

class RequestResponse(BaseModel):
    id: int
    description: str
    category: str
    priority: str
    status: str
    location: Optional[str]
    contact_info: Optional[str]
    image_url: Optional[str]
    task_id: Optional[str]
    created_at: str
    updated_at: str

class TaskStatusResponse(BaseModel):
    task_id: str
    status: str
    result: Optional[dict] = None

# WebSocket 연결 관리
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except:
                pass

manager = ConnectionManager()

# 키워드 기반 분류 (OpenAI API 대체)
def categorize_with_keywords(description: str) -> dict:
    """간단한 키워드 기반 분류 (OpenAI API quota 초과 시 대체)"""
    desc_lower = description.lower()

    print(f"[KEYWORD] Input description: {description[:100]}")
    print(f"[KEYWORD] Lowercase: {desc_lower[:100]}")

    # 카테고리 분류
    category = "other"
    if any(word in desc_lower for word in ["전기", "전등", "조명", "콘센트", "스위치", "누전", "정전", "전선"]):
        category = "electrical"
        print(f"[KEYWORD] Matched electrical")
    elif any(word in desc_lower for word in ["수도", "배관", "물", "수도꼭지", "변기", "싱크대", "하수", "누수", "화장실", "세면대"]):
        category = "plumbing"
        print(f"[KEYWORD] Matched plumbing")
    elif any(word in desc_lower for word in ["냉방", "난방", "에어컨", "보일러", "환기", "온도"]):
        category = "hvac"
        print(f"[KEYWORD] Matched hvac")
    elif any(word in desc_lower for word in ["벽", "바닥", "천장", "문", "창문", "계단", "균열", "파손"]):
        category = "structural"
        print(f"[KEYWORD] Matched structural")

    # 우선순위 판단
    priority = "medium"
    if any(word in desc_lower for word in ["긴급", "위험", "사고", "고장", "멈춤", "안됨", "불가능", "즉시"]):
        priority = "high"
        print(f"[KEYWORD] High priority (urgent words)")
    elif any(word in desc_lower for word in ["샘", "새", "누수", "넘침", "뜨거움", "계속"]):
        priority = "high"
        print(f"[KEYWORD] High priority (leak/continuous)")
    elif any(word in desc_lower for word in ["나중", "여유", "천천히"]):
        priority = "low"
        print(f"[KEYWORD] Low priority")

    print(f"[KEYWORD] Result: category={category}, priority={priority}")
    return {"category": category, "priority": priority}

# AI 카테고리화 함수 (동기 - 빠른 응답용)
async def categorize_with_ai_sync(description: str) -> dict:
    # Groq API 사용 (무료, 빠름)
    try:
        print(f"[DEBUG] Starting Groq AI categorization for: {description[:50]}...")

        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",  # 무료 모델
            messages=[
                {
                    "role": "system",
                    "content": """You are a building maintenance expert. Categorize the maintenance request into one of these categories:
                    - electrical: 전기 관련 문제
                    - plumbing: 배관, 수도 관련 문제
                    - hvac: 난방, 환기, 에어컨 관련 문제
                    - structural: 건물 구조, 벽, 바닥 관련 문제
                    - other: 기타

                    Also assess the priority as:
                    - high: 빠른 대응 필요
                    - medium: 일반적인 유지보수
                    - low: 긴급하지 않음

                    Respond in JSON format: {"category": "...", "priority": "..."}"""
                },
                {
                    "role": "user",
                    "content": f"Maintenance request: {description}"
                }
            ],
            temperature=0.3,
            max_tokens=100
        )

        import json
        result = json.loads(response.choices[0].message.content)
        print(f"[DEBUG] Groq AI categorization successful: {result}")
        return result
    except Exception as e:
        print(f"[ERROR] Groq AI categorization error: {type(e).__name__}: {str(e)}")
        print("[INFO] Falling back to keyword-based categorization")
        return categorize_with_keywords(description)

# Lifespan 이벤트 (Deprecation 경고 해결)
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    init_db()
    print("Database initialized")
    yield
    # Shutdown
    print("Shutting down...")

app = FastAPI(
    title="Building Maintenance API - Enhanced",
    description="AI-powered building maintenance management with async tasks, file upload, and real-time notifications",
    version="2.0.1",  # Keyword-based classification fallback added
    lifespan=lifespan
)

# CORS 재설정 (lifespan 후)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://*", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API 엔드포인트
@app.get("/")
async def root():
    return {
        "message": "Building Maintenance API v2.0 is running",
        "features": [
            "Async task queue (Celery + Redis)",
            "File upload (S3)",
            "Real-time notifications (WebSocket)",
            "Enhanced AI categorization"
        ]
    }

@app.get("/health")
async def health_check():
    """헬스 체크 엔드포인트 (AWS ELB용)"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "version": "2.0.0"
    }

@app.post("/api/requests", response_model=RequestResponse)
async def submit_request(request: MaintenanceRequest):
    """
    유지보수 요청 생성
    - use_async=True: Celery로 비동기 AI 처리 (빠른 응답)
    - use_async=False: 동기 AI 처리 (즉시 분류)
    """

    if request.use_async:
        # 비동기 처리: 먼저 저장 후 백그라운드에서 AI 처리
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO requests (description, category, priority, location, contact_info)
                VALUES (?, ?, ?, ?, ?)
            """, (
                request.description,
                "processing",  # 임시 카테고리
                "processing",  # 임시 우선순위
                request.location,
                request.contact_info
            ))
            conn.commit()
            request_id = cursor.lastrowid

            # Celery 작업 시작
            task = categorize_maintenance_request.delay(request_id, request.description)

            # 작업 ID 저장
            cursor.execute("UPDATE requests SET task_id = ? WHERE id = ?", (task.id, request_id))
            conn.commit()

            cursor.execute("SELECT * FROM requests WHERE id = ?", (request_id,))
            row = cursor.fetchone()

        # WebSocket으로 실시간 알림
        await manager.broadcast({
            "type": "new_request",
            "data": dict(row)
        })

        return dict(row)

    else:
        # 동기 처리: 즉시 AI 분류
        ai_result = await categorize_with_ai_sync(request.description)

        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                INSERT INTO requests (description, category, priority, location, contact_info)
                VALUES (?, ?, ?, ?, ?)
            """, (
                request.description,
                ai_result.get("category", "other"),
                ai_result.get("priority", "medium"),
                request.location,
                request.contact_info
            ))
            conn.commit()
            request_id = cursor.lastrowid

            cursor.execute("SELECT * FROM requests WHERE id = ?", (request_id,))
            row = cursor.fetchone()

        await manager.broadcast({
            "type": "new_request",
            "data": dict(row)
        })

        return dict(row)

@app.get("/api/requests/{request_id}/task-status", response_model=TaskStatusResponse)
async def get_task_status(request_id: int):
    """비동기 작업 상태 확인"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT task_id FROM requests WHERE id = ?", (request_id,))
        row = cursor.fetchone()

    if not row or not row["task_id"]:
        raise HTTPException(status_code=404, detail="Task not found")

    from celery.result import AsyncResult
    task = AsyncResult(row["task_id"])

    return {
        "task_id": row["task_id"],
        "status": task.state,
        "result": task.result if task.ready() else None
    }

@app.post("/api/requests/{request_id}/upload")
async def upload_image(request_id: int, file: UploadFile = File(...)):
    """이미지 업로드 (S3)"""

    if not s3_client:
        raise HTTPException(status_code=501, detail="S3 not configured")

    # 파일 확장자 검증
    allowed_extensions = ['jpg', 'jpeg', 'png', 'gif', 'webp']
    file_ext = file.filename.split('.')[-1].lower()
    if file_ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail="Invalid file type")

    # S3 키 생성
    s3_key = f"requests/{request_id}/{uuid.uuid4()}.{file_ext}"

    try:
        # S3 업로드
        s3_client.upload_fileobj(
            file.file,
            S3_BUCKET,
            s3_key,
            ExtraArgs={'ContentType': file.content_type}
        )

        # URL 생성
        image_url = f"https://{S3_BUCKET}.s3.{os.getenv('AWS_REGION', 'ap-northeast-2')}.amazonaws.com/{s3_key}"

        # DB 업데이트
        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE requests
                SET image_url = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            """, (image_url, request_id))
            conn.commit()

        return {"image_url": image_url, "message": "Image uploaded successfully"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@app.get("/api/requests", response_model=List[RequestResponse])
async def get_all_requests(status: Optional[str] = None):
    with get_db() as conn:
        cursor = conn.cursor()
        if status:
            cursor.execute("SELECT * FROM requests WHERE status = ? ORDER BY created_at DESC", (status,))
        else:
            cursor.execute("SELECT * FROM requests ORDER BY created_at DESC")
        rows = cursor.fetchall()

    return [dict(row) for row in rows]

@app.get("/api/requests/{request_id}", response_model=RequestResponse)
async def get_request(request_id: int):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM requests WHERE id = ?", (request_id,))
        row = cursor.fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="Request not found")

    return dict(row)

@app.patch("/api/requests/{request_id}", response_model=RequestResponse)
async def update_request(request_id: int, update: UpdateRequest):
    with get_db() as conn:
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM requests WHERE id = ?", (request_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Request not found")

        updates = []
        values = []
        if update.status:
            updates.append("status = ?")
            values.append(update.status)
        if update.category:
            updates.append("category = ?")
            values.append(update.category)
        if update.priority:
            updates.append("priority = ?")
            values.append(update.priority)

        if updates:
            updates.append("updated_at = CURRENT_TIMESTAMP")
            values.append(request_id)
            cursor.execute(
                f"UPDATE requests SET {', '.join(updates)} WHERE id = ?",
                values
            )
            conn.commit()

        cursor.execute("SELECT * FROM requests WHERE id = ?", (request_id,))
        row = cursor.fetchone()

    # WebSocket으로 실시간 알림
    await manager.broadcast({
        "type": "request_updated",
        "data": dict(row)
    })

    return dict(row)

@app.delete("/api/requests/{request_id}")
async def delete_request(request_id: int):
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM requests WHERE id = ?", (request_id,))
        conn.commit()

        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="Request not found")

    return {"message": "Request deleted successfully"}

@app.get("/api/stats")
async def get_stats():
    with get_db() as conn:
        cursor = conn.cursor()

        cursor.execute("SELECT COUNT(*) as total FROM requests")
        total = cursor.fetchone()["total"]

        cursor.execute("SELECT status, COUNT(*) as count FROM requests GROUP BY status")
        status_counts = {row["status"]: row["count"] for row in cursor.fetchall()}

        cursor.execute("SELECT category, COUNT(*) as count FROM requests GROUP BY category")
        category_counts = {row["category"]: row["count"] for row in cursor.fetchall()}

        cursor.execute("SELECT priority, COUNT(*) as count FROM requests GROUP BY priority")
        priority_counts = {row["priority"]: row["count"] for row in cursor.fetchall()}

    return {
        "total": total,
        "by_status": status_counts,
        "by_category": category_counts,
        "by_priority": priority_counts
    }

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """실시간 알림용 WebSocket"""
    await manager.connect(websocket)
    try:
        while True:
            # 클라이언트로부터 메시지 수신 (연결 유지용)
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

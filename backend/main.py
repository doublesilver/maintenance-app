from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import sqlite3
from openai import OpenAI
import os
from contextlib import contextmanager
from dotenv import load_dotenv

# .env 파일 로드
load_dotenv()

app = FastAPI(title="Building Maintenance API")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# OpenAI 클라이언트 초기화
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

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
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS requests (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                description TEXT NOT NULL,
                category VARCHAR(50),
                priority VARCHAR(20),
                status VARCHAR(20) DEFAULT 'pending',
                location VARCHAR(100),
                contact_info VARCHAR(100),
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        conn.commit()

# Pydantic 모델
class MaintenanceRequest(BaseModel):
    description: str
    location: Optional[str] = None
    contact_info: Optional[str] = None

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
    created_at: str
    updated_at: str

# AI 카테고리화 함수
async def categorize_with_ai(description: str) -> dict:
    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
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
                    - urgent: 즉각적인 위험이나 서비스 중단
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
        return result
    except Exception as e:
        print(f"AI categorization error: {e}")
        return {"category": "other", "priority": "medium"}

# API 엔드포인트
@app.on_event("startup")
async def startup_event():
    init_db()

@app.get("/")
async def root():
    return {"message": "Building Maintenance API is running"}

@app.post("/api/requests", response_model=RequestResponse)
async def submit_request(request: MaintenanceRequest):
    # AI로 카테고리화
    ai_result = await categorize_with_ai(request.description)

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

    return dict(row)

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

        # 존재 확인
        cursor.execute("SELECT * FROM requests WHERE id = ?", (request_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Request not found")

        # 업데이트
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

from celery_app import celery_app
import os
import json
from dotenv import load_dotenv

load_dotenv()

# Groq 클라이언트 초기화 (OpenAI 대신 사용)
from groq import Groq
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

# 키워드 기반 분류 (폴백용)
def categorize_with_keywords(description: str) -> dict:
    """간단한 키워드 기반 분류 (Groq API 실패 시 대체)"""
    desc_lower = description.lower()

    category = "other"
    if any(word in desc_lower for word in ["전기", "전등", "조명", "콘센트", "스위치", "누전", "정전", "전선"]):
        category = "electrical"
    elif any(word in desc_lower for word in ["수도", "배관", "물", "수도꼭지", "변기", "싱크대", "하수", "누수", "화장실", "세면대"]):
        category = "plumbing"
    elif any(word in desc_lower for word in ["냉방", "난방", "에어컨", "보일러", "환기", "온도"]):
        category = "hvac"
    elif any(word in desc_lower for word in ["벽", "바닥", "천장", "문", "창문", "계단", "균열", "파손"]):
        category = "structural"

    priority = "medium"
    if any(word in desc_lower for word in ["긴급", "위험", "사고", "고장", "멈춤", "안됨", "불가능", "즉시"]):
        priority = "high"
    elif any(word in desc_lower for word in ["샘", "새", "누수", "넘침", "뜨거움", "계속"]):
        priority = "high"
    elif any(word in desc_lower for word in ["나중", "여유", "천천히"]):
        priority = "low"

    return {"category": category, "priority": priority}

@celery_app.task(name='tasks.categorize_maintenance_request')
def categorize_maintenance_request(request_id: int, description: str):
    """
    비동기로 AI 카테고리화 수행 (Groq API 사용)
    """
    try:
        print(f"[CELERY] Starting Groq AI categorization for request {request_id}")

        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",  # 무료 Groq 모델
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

        result = json.loads(response.choices[0].message.content)
        print(f"[CELERY] Groq AI categorization successful: {result}")

        # 데이터베이스 업데이트
        from contextlib import contextmanager
        import sqlite3

        @contextmanager
        def get_db():
            conn = sqlite3.connect("maintenance.db")
            conn.row_factory = sqlite3.Row
            try:
                yield conn
            finally:
                conn.close()

        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE requests
                SET category = ?, priority = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            """, (result.get("category", "other"), result.get("priority", "medium"), request_id))
            conn.commit()

        return {
            "request_id": request_id,
            "category": result.get("category", "other"),
            "priority": result.get("priority", "medium"),
            "status": "completed"
        }

    except Exception as e:
        print(f"[CELERY ERROR] Groq API failed: {type(e).__name__}: {str(e)}")
        print("[CELERY] Falling back to keyword-based categorization")
        result = categorize_with_keywords(description)

        # 키워드 기반 결과로 DB 업데이트
        from contextlib import contextmanager
        import sqlite3

        @contextmanager
        def get_db():
            conn = sqlite3.connect("maintenance.db")
            conn.row_factory = sqlite3.Row
            try:
                yield conn
            finally:
                conn.close()

        with get_db() as conn:
            cursor = conn.cursor()
            cursor.execute("""
                UPDATE requests
                SET category = ?, priority = ?, updated_at = CURRENT_TIMESTAMP
                WHERE id = ?
            """, (result.get("category", "other"), result.get("priority", "medium"), request_id))
            conn.commit()

        return {
            "request_id": request_id,
            "category": result.get("category", "other"),
            "priority": result.get("priority", "medium"),
            "status": "completed_with_fallback",
            "method": "keyword"
        }

@celery_app.task(name='tasks.send_notification_email')
def send_notification_email(request_id: int, status: str, email: str):
    """
    비동기로 이메일 알림 전송 (추후 구현)
    """
    # TODO: 실제 이메일 전송 로직
    print(f"Sending email to {email} for request {request_id} with status {status}")
    return {"status": "sent", "email": email}

@celery_app.task(name='tasks.cleanup_old_requests')
def cleanup_old_requests(days: int = 90):
    """
    오래된 완료 요청 정리 (스케줄러용)
    """
    from contextlib import contextmanager
    import sqlite3
    from datetime import datetime, timedelta

    @contextmanager
    def get_db():
        conn = sqlite3.connect("maintenance.db")
        try:
            yield conn
        finally:
            conn.close()

    cutoff_date = (datetime.now() - timedelta(days=days)).isoformat()

    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            DELETE FROM requests
            WHERE status = 'completed'
            AND updated_at < ?
        """, (cutoff_date,))
        deleted_count = cursor.rowcount
        conn.commit()

    return {"deleted_count": deleted_count, "cutoff_date": cutoff_date}

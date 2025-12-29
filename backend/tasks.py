from celery_app import celery_app
from openai import OpenAI
import os
import json
from dotenv import load_dotenv

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

@celery_app.task(name='tasks.categorize_maintenance_request')
def categorize_maintenance_request(request_id: int, description: str):
    """
    비동기로 AI 카테고리화 수행
    """
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

        result = json.loads(response.choices[0].message.content)

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
        return {
            "request_id": request_id,
            "category": "other",
            "priority": "medium",
            "status": "failed",
            "error": str(e)
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

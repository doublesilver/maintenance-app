from celery import Celery
import os
from dotenv import load_dotenv

load_dotenv()

# Celery 앱 초기화
celery_app = Celery(
    'maintenance',
    broker=os.getenv('REDIS_URL', 'redis://localhost:6379/0'),
    backend=os.getenv('REDIS_URL', 'redis://localhost:6379/0'),
    broker_connection_retry_on_startup=True
)

# Celery 설정
celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='Asia/Seoul',
    enable_utc=True,
    task_track_started=True,
    task_time_limit=30 * 60,  # 30분
    result_expires=3600,  # 1시간
)

# 작업 자동 검색
celery_app.autodiscover_tasks(['tasks'])

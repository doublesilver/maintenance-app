# 테스팅 가이드

건물 유지보수 관리 시스템의 테스팅 전략 및 실행 가이드입니다.

## 목차

1. [백엔드 테스팅](#백엔드-테스팅)
2. [프론트엔드 테스팅](#프론트엔드-테스팅)
3. [통합 테스팅](#통합-테스팅)
4. [AI 카테고리화 테스팅](#ai-카테고리화-테스팅)
5. [성능 테스팅](#성능-테스팅)
6. [보안 테스팅](#보안-테스팅)

---

## 백엔드 테스팅

### pytest 설정

```bash
cd backend

# 테스트 의존성 설치
pip install pytest pytest-cov httpx

# requirements.txt에 추가
echo "pytest==7.4.3" >> requirements.txt
echo "pytest-cov==4.1.0" >> requirements.txt
echo "httpx==0.26.0" >> requirements.txt
```

### 테스트 실행

```bash
# 모든 테스트 실행
pytest

# 상세 출력
pytest -v

# 커버리지 포함
pytest --cov=main --cov-report=html

# 특정 테스트만 실행
pytest test_main.py::test_create_request

# 마커로 필터링
pytest -m "not slow"
```

### 테스트 케이스 예시

#### 1. 기본 CRUD 테스트

```python
def test_create_request():
    """요청 생성 테스트"""
    response = client.post("/api/requests", json={
        "description": "The water heater is not working",
        "location": "Building A, Floor 2"
    })
    assert response.status_code == 200
    data = response.json()
    assert "id" in data
    assert data["status"] == "pending"

def test_get_request():
    """요청 조회 테스트"""
    # ... (test_main.py 참조)

def test_update_request():
    """요청 업데이트 테스트"""
    # ... (test_main.py 참조)

def test_delete_request():
    """요청 삭제 테스트"""
    # ... (test_main.py 참조)
```

#### 2. 엣지 케이스 테스트

```python
def test_invalid_status_update():
    """잘못된 상태 업데이트 테스트"""
    response = client.post("/api/requests", json={
        "description": "Test"
    })
    request_id = response.json()["id"]

    # 잘못된 상태값
    response = client.patch(f"/api/requests/{request_id}", json={
        "status": "invalid_status"
    })
    # 현재는 허용되지만, 추가 유효성 검증 구현 가능

def test_empty_description():
    """빈 설명 테스트"""
    response = client.post("/api/requests", json={
        "description": ""
    })
    # FastAPI 유효성 검증에 따라 422 또는 200

def test_very_long_description():
    """매우 긴 설명 테스트"""
    long_text = "A" * 10000
    response = client.post("/api/requests", json={
        "description": long_text
    })
    assert response.status_code == 200
```

#### 3. 동시성 테스트

```python
import concurrent.futures

def test_concurrent_requests():
    """동시 요청 처리 테스트"""
    def create_request(i):
        return client.post("/api/requests", json={
            "description": f"Concurrent request {i}"
        })

    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        futures = [executor.submit(create_request, i) for i in range(10)]
        results = [f.result() for f in futures]

    assert all(r.status_code == 200 for r in results)
```

### 모킹 AI 응답

OpenAI API 호출을 모킹하여 빠르고 비용 효율적인 테스트:

```python
from unittest.mock import patch, MagicMock

@patch('main.openai.chat.completions.create')
def test_ai_categorization_mock(mock_openai):
    """AI 카테고리화 모킹 테스트"""
    # Mock 응답 설정
    mock_response = MagicMock()
    mock_response.choices[0].message.content = '{"category": "plumbing", "priority": "high"}'
    mock_openai.return_value = mock_response

    response = client.post("/api/requests", json={
        "description": "Water leak in bathroom"
    })

    assert response.status_code == 200
    data = response.json()
    assert data["category"] == "plumbing"
    assert data["priority"] == "high"
```

---

## 프론트엔드 테스팅

### Jest 및 React Testing Library 설정

```bash
cd frontend

# 테스트 라이브러리 설치
npm install --save-dev jest @testing-library/react @testing-library/jest-dom @testing-library/user-event

# package.json에 테스트 스크립트 추가
```

`package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage"
  }
}
```

### E2E 테스팅 (Playwright)

```bash
# Playwright 설치
npm install --save-dev @playwright/test

# Playwright 초기화
npx playwright install

# 테스트 실행
npx playwright test

# UI 모드
npx playwright test --ui
```

E2E 테스트 예시:

```typescript
// e2e/submit-request.spec.ts
import { test, expect } from '@playwright/test';

test('submit maintenance request', async ({ page }) => {
  await page.goto('http://localhost:3000/submit');

  // 폼 작성
  await page.fill('textarea[name="description"]', '수도꼭지에서 물이 샙니다');
  await page.fill('input[name="location"]', '2층 화장실');
  await page.fill('input[name="contact_info"]', '010-1234-5678');

  // 제출
  await page.click('button[type="submit"]');

  // 성공 메시지 확인
  await expect(page.locator('text=성공적으로 제출되었습니다')).toBeVisible();
});

test('view dashboard', async ({ page }) => {
  await page.goto('http://localhost:3000/dashboard');

  // 대시보드 로드 확인
  await expect(page.locator('h1')).toContainText('관리 대시보드');

  // 통계 카드 확인
  await expect(page.locator('text=전체 요청')).toBeVisible();
});
```

---

## 통합 테스팅

### 풀스택 통합 테스트

```bash
# 백엔드와 프론트엔드 모두 실행
cd backend && python main.py &
cd frontend && npm run dev &

# E2E 테스트 실행
cd frontend && npx playwright test
```

### API 통합 테스트

```python
# backend/test_integration.py
import pytest
import requests
import time

BASE_URL = "http://localhost:8000"

def test_full_workflow():
    """전체 워크플로우 테스트"""
    # 1. 요청 생성
    create_response = requests.post(f"{BASE_URL}/api/requests", json={
        "description": "Broken window",
        "location": "Office 301",
        "contact_info": "010-1234-5678"
    })
    assert create_response.status_code == 200
    request_id = create_response.json()["id"]

    # 2. 요청 조회
    get_response = requests.get(f"{BASE_URL}/api/requests/{request_id}")
    assert get_response.status_code == 200
    assert get_response.json()["description"] == "Broken window"

    # 3. 상태 업데이트
    update_response = requests.patch(
        f"{BASE_URL}/api/requests/{request_id}",
        json={"status": "in_progress"}
    )
    assert update_response.status_code == 200
    assert update_response.json()["status"] == "in_progress"

    # 4. 통계 확인
    stats_response = requests.get(f"{BASE_URL}/api/stats")
    assert stats_response.status_code == 200
    stats = stats_response.json()
    assert stats["by_status"]["in_progress"] >= 1

    # 5. 삭제
    delete_response = requests.delete(f"{BASE_URL}/api/requests/{request_id}")
    assert delete_response.status_code == 200
```

---

## AI 카테고리화 테스팅

### 실제 AI 응답 테스트

```python
import pytest
import os

@pytest.mark.skipif(not os.getenv("OPENAI_API_KEY"), reason="OpenAI API key not set")
def test_ai_electrical_categorization():
    """전기 관련 카테고리화 테스트"""
    response = client.post("/api/requests", json={
        "description": "복도 전등이 깜빡입니다"
    })
    data = response.json()
    assert data["category"] == "electrical"

@pytest.mark.skipif(not os.getenv("OPENAI_API_KEY"), reason="OpenAI API key not set")
def test_ai_plumbing_categorization():
    """배관 관련 카테고리화 테스트"""
    response = client.post("/api/requests", json={
        "description": "화장실 수도꼭지에서 물이 샙니다"
    })
    data = response.json()
    assert data["category"] == "plumbing"

@pytest.mark.skipif(not os.getenv("OPENAI_API_KEY"), reason="OpenAI API key not set")
def test_ai_urgent_priority():
    """긴급 우선순위 테스트"""
    response = client.post("/api/requests", json={
        "description": "엘리베이터가 갑자기 멈췄습니다. 사람이 갇혀 있습니다!"
    })
    data = response.json()
    assert data["priority"] in ["urgent", "high"]
```

### 카테고리화 정확도 테스트

```python
# backend/test_ai_accuracy.py
import pytest
from main import categorize_with_ai

test_cases = [
    ("전등이 안 켜집니다", "electrical", ["medium", "high"]),
    ("수도가 안 나옵니다", "plumbing", ["medium", "high"]),
    ("에어컨이 안 됩니다", "hvac", ["medium", "high"]),
    ("벽에 금이 갔습니다", "structural", ["high", "urgent"]),
    ("화재 발생!", "other", ["urgent"]),
]

@pytest.mark.asyncio
@pytest.mark.parametrize("description,expected_category,expected_priorities", test_cases)
async def test_categorization_accuracy(description, expected_category, expected_priorities):
    """카테고리화 정확도 테스트"""
    result = await categorize_with_ai(description)
    assert result["category"] == expected_category
    assert result["priority"] in expected_priorities
```

---

## 성능 테스팅

### 로드 테스팅 (Locust)

```bash
# Locust 설치
pip install locust
```

`locustfile.py`:

```python
from locust import HttpUser, task, between

class MaintenanceUser(HttpUser):
    wait_time = between(1, 3)

    @task(3)
    def create_request(self):
        self.client.post("/api/requests", json={
            "description": "Test maintenance request",
            "location": "Test location"
        })

    @task(5)
    def get_requests(self):
        self.client.get("/api/requests")

    @task(2)
    def get_stats(self):
        self.client.get("/api/stats")

    @task(1)
    def update_request(self):
        # 먼저 요청 생성
        response = self.client.post("/api/requests", json={
            "description": "Request to update"
        })
        if response.status_code == 200:
            request_id = response.json()["id"]
            self.client.patch(f"/api/requests/{request_id}", json={
                "status": "in_progress"
            })
```

실행:

```bash
# Locust 실행
locust -f locustfile.py

# 브라우저에서 http://localhost:8089 접속
# 사용자 수와 Spawn rate 설정 후 테스트 시작
```

### 벤치마크 테스트

```python
import time
import statistics

def benchmark_create_requests(n=100):
    """요청 생성 벤치마크"""
    times = []
    for i in range(n):
        start = time.time()
        response = client.post("/api/requests", json={
            "description": f"Benchmark request {i}"
        })
        end = time.time()
        times.append(end - start)

    print(f"평균: {statistics.mean(times):.3f}s")
    print(f"중앙값: {statistics.median(times):.3f}s")
    print(f"최소: {min(times):.3f}s")
    print(f"최대: {max(times):.3f}s")
```

---

## 보안 테스팅

### SQL Injection 테스트

```python
def test_sql_injection_prevention():
    """SQL Injection 방어 테스트"""
    malicious_input = "'; DROP TABLE requests; --"
    response = client.post("/api/requests", json={
        "description": malicious_input
    })
    assert response.status_code == 200

    # 테이블이 여전히 존재하는지 확인
    get_response = client.get("/api/requests")
    assert get_response.status_code == 200
```

### XSS 테스트

```python
def test_xss_prevention():
    """XSS 방어 테스트"""
    xss_payload = "<script>alert('XSS')</script>"
    response = client.post("/api/requests", json={
        "description": xss_payload
    })
    data = response.json()

    # 스크립트가 이스케이프되었는지 확인
    assert "<script>" not in data["description"] or data["description"] == xss_payload
```

### API Rate Limiting 테스트

```python
def test_rate_limiting():
    """Rate limiting 테스트 (구현 필요)"""
    for i in range(100):
        response = client.post("/api/requests", json={
            "description": f"Request {i}"
        })
        if response.status_code == 429:
            # Rate limit 적용됨
            return
    # Rate limiting이 없으면 경고
    pytest.skip("Rate limiting not implemented")
```

---

## CI/CD 통합

### GitHub Actions

`.github/workflows/test.yml`:

```yaml
name: Tests

on: [push, pull_request]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.11'
      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt
          pip install pytest pytest-cov
      - name: Run tests
        run: |
          cd backend
          pytest --cov=main

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Node
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: |
          cd frontend
          npm ci
      - name: Build
        run: |
          cd frontend
          npm run build
```

---

## 테스트 체크리스트

### 백엔드
- [ ] 모든 API 엔드포인트 테스트
- [ ] CRUD 작업 테스트
- [ ] 에러 핸들링 테스트
- [ ] AI 카테고리화 테스트 (모킹)
- [ ] 데이터베이스 트랜잭션 테스트
- [ ] 인증/권한 테스트 (구현 시)
- [ ] 성능 테스트

### 프론트엔드
- [ ] 컴포넌트 렌더링 테스트
- [ ] 폼 제출 테스트
- [ ] 상태 관리 테스트
- [ ] E2E 워크플로우 테스트
- [ ] 반응형 디자인 테스트
- [ ] 접근성 테스트

### 통합
- [ ] 풀스택 워크플로우 테스트
- [ ] API 통합 테스트
- [ ] 데이터 일관성 테스트
- [ ] 에러 전파 테스트

### 보안
- [ ] SQL Injection 방어
- [ ] XSS 방어
- [ ] CSRF 방어
- [ ] 인증 테스트
- [ ] 권한 테스트

---

## 추가 자료

- [FastAPI Testing](https://fastapi.tiangolo.com/tutorial/testing/)
- [Playwright Documentation](https://playwright.dev/)
- [Locust Documentation](https://docs.locust.io/)
- [pytest Documentation](https://docs.pytest.org/)

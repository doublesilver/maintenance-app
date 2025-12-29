# 빠른 시작 가이드

건물 유지보수 관리 시스템을 5분 안에 실행하는 가이드입니다.

## 사전 요구사항

- **Node.js** 18 이상
- **Python** 3.8 이상
- **OpenAI API Key** ([발급받기](https://platform.openai.com/api-keys))

---

## 1단계: 프로젝트 다운로드

```bash
# Git 클론 (또는 ZIP 다운로드)
git clone <repository-url>
cd projact
```

---

## 2단계: 백엔드 설정 (2분)

```bash
# 백엔드 디렉토리로 이동
cd backend

# Python 가상환경 생성 (선택사항)
python -m venv venv

# Windows
venv\Scripts\activate

# macOS/Linux
source venv/bin/activate

# 의존성 설치
pip install -r requirements.txt

# 환경변수 설정
copy .env.example .env

# .env 파일 열어서 OpenAI API 키 입력
# OPENAI_API_KEY=your_actual_api_key_here
```

**Windows PowerShell 사용자:**
```powershell
Copy-Item .env.example .env
notepad .env
```

---

## 3단계: 백엔드 실행

```bash
# backend 디렉토리에서
python main.py
```

✅ 성공 메시지: `Uvicorn running on http://0.0.0.0:8000`

**API 문서 확인**: [http://localhost:8000/docs](http://localhost:8000/docs)

---

## 4단계: 프론트엔드 설정 (2분)

**새 터미널 열기**

```bash
# 프론트엔드 디렉토리로 이동
cd frontend

# 의존성 설치
npm install

# 환경변수 설정 (선택사항 - 기본값 사용 가능)
copy .env.local.example .env.local
```

---

## 5단계: 프론트엔드 실행

```bash
# frontend 디렉토리에서
npm run dev
```

✅ 성공 메시지: `Ready on http://localhost:3000`

---

## 6단계: 앱 사용하기

브라우저에서 [http://localhost:3000](http://localhost:3000) 접속

### 첫 요청 제출하기

1. "요청 제출" 페이지로 이동
2. 문제 설명 입력:
   ```
   2층 화장실 수도꼭지에서 물이 계속 새고 있습니다
   ```
3. 위치 입력: `2층 화장실`
4. 연락처 입력: `010-1234-5678`
5. "요청 제출" 버튼 클릭

✨ AI가 자동으로 카테고리(plumbing)와 우선순위(high)를 분류합니다!

### 대시보드 확인

1. "대시보드" 페이지로 이동
2. 모든 요청 확인
3. 요청 클릭하여 상세 정보 보기
4. 상태 변경 (대기중 → 진행중 → 완료)

---

## 문제 해결

### 백엔드가 실행되지 않는 경우

**OpenAI API 키 확인:**
```bash
cd backend
cat .env  # Windows: type .env
```

`OPENAI_API_KEY`가 올바르게 설정되어 있는지 확인

**포트 충돌:**
```bash
# 8000번 포트가 이미 사용 중이면 다른 포트로 실행
uvicorn main:app --host 0.0.0.0 --port 8001
```

### 프론트엔드가 실행되지 않는 경우

**Node 버전 확인:**
```bash
node --version  # v18 이상이어야 함
```

**의존성 재설치:**
```bash
rm -rf node_modules  # Windows: rmdir /s node_modules
npm install
```

### CORS 오류

백엔드 `main.py`에서 CORS 설정 확인:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "*"],
    ...
)
```

### AI 카테고리화가 작동하지 않는 경우

1. **OpenAI API 키 확인**
2. **API 크레딧 확인**: [OpenAI Dashboard](https://platform.openai.com/usage)
3. **네트워크 연결 확인**

임시로 모킹된 AI 응답 사용:
```python
# backend/main.py의 categorize_with_ai 함수를 다음으로 교체
async def categorize_with_ai(description: str) -> dict:
    # 간단한 규칙 기반 분류
    if "전기" in description or "전등" in description:
        return {"category": "electrical", "priority": "medium"}
    elif "수도" in description or "배관" in description:
        return {"category": "plumbing", "priority": "high"}
    # ...
    return {"category": "other", "priority": "medium"}
```

---

## 다음 단계

### 테스트 실행

```bash
# 백엔드 테스트
cd backend
pytest

# 프론트엔드 빌드
cd frontend
npm run build
```

### 배포하기

자세한 배포 가이드는 [DEPLOYMENT.md](DEPLOYMENT.md) 참조

### 기능 추가

최적화 및 추가 기능은 [OPTIMIZATION.md](OPTIMIZATION.md) 참조

---

## 주요 엔드포인트

### 백엔드 API
- **API 문서**: http://localhost:8000/docs
- **요청 생성**: `POST /api/requests`
- **요청 조회**: `GET /api/requests`
- **통계**: `GET /api/stats`

### 프론트엔드 페이지
- **홈**: http://localhost:3000
- **요청 제출**: http://localhost:3000/submit
- **대시보드**: http://localhost:3000/dashboard

---

## 도움말

- **전체 문서**: [README.md](README.md)
- **테스팅**: [TESTING.md](TESTING.md)
- **배포**: [DEPLOYMENT.md](DEPLOYMENT.md)
- **최적화**: [OPTIMIZATION.md](OPTIMIZATION.md)

질문이나 문제가 있으면 이슈를 생성해주세요!

---

**축하합니다! 🎉 건물 유지보수 관리 시스템이 실행 중입니다!**

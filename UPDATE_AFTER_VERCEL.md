# Vercel 배포 후 README 업데이트 가이드

## 1. Vercel URL 받은 후

README.md의 20-24줄 수정:

```markdown
### 🌐 라이브 데모

- **Frontend**: [https://YOUR-VERCEL-URL.vercel.app](https://YOUR-VERCEL-URL.vercel.app)
- **API 문서**: 로컬 개발 환경에서 확인 가능 (`http://localhost:8000/docs`)
- **GitHub**: [https://github.com/doublesilver/maintenance-app](https://github.com/doublesilver/maintenance-app)
```

## 2. 커밋 및 푸시

```bash
cd C:\projact

# README 수정 후
git add README.md
git commit -m "docs: add Vercel deployment URL"
git push
```

## 3. GitHub About 섹션 설정

GitHub 저장소 페이지에서:
1. About 섹션 톱니바퀴 클릭
2. Description: `AI-powered building maintenance management system with Celery, Redis, and WebSocket`
3. Website: `YOUR-VERCEL-URL`
4. Topics 추가:
   - `nextjs`
   - `fastapi`
   - `openai`
   - `celery`
   - `redis`
   - `websocket`
   - `typescript`
   - `python`
   - `tailwindcss`

## 4. 스크린샷 README에 추가 (선택)

README.md 프로젝트 개요 섹션에 추가:

```markdown
## 📸 스크린샷

### 홈페이지
![Home](screenshots/home.png)

### 대시보드
![Dashboard](screenshots/dashboard.png)

### API 문서
![API](screenshots/api-docs.png)
```

그리고 커밋:
```bash
git add screenshots/
git add README.md
git commit -m "docs: add screenshots"
git push
```

# GitHub 푸시 전 체크리스트

## ✅ 완료된 업데이트

### 1. README.md 수정
- ✅ 라이브 데모 섹션: AWS IP 제거, Vercel placeholder 추가
- ✅ Infrastructure 섹션: Vercel 호스팅 명시
- ✅ GitHub 저장소 링크 추가

### 2. vercel.json 최적화
- ✅ API rewrites 추가 (로컬 백엔드 프록시)
- ✅ Next.js framework 명시
- ✅ Build/Install 명령어 설정

## 📋 푸시할 파일 목록

```
modified:   README.md
modified:   vercel.json
```

## 🚀 GitHub 푸시 명령어

```bash
cd C:\projact

# 변경사항 확인
git status

# 파일 추가
git add README.md vercel.json

# 커밋
git commit -m "docs: update README for Vercel deployment and optimize vercel.json

- Update live demo section with Vercel placeholder
- Remove AWS EC2 references from infrastructure section
- Add API rewrites to vercel.json for local backend proxy
- Clarify deployment status (Vercel for frontend, local for backend)"

# GitHub에 푸시
git push origin main
```

## 🌐 Vercel 배포 순서 (GitHub 푸시 후)

1. **Vercel Dashboard 접속**: https://vercel.com/login
2. **GitHub로 로그인**
3. **Add New... → Project**
4. **maintenance-app 임포트**
5. **중요 설정**:
   - Root Directory: `frontend`
   - Framework Preset: Next.js (자동 감지)
   - Environment Variables:
     - `NEXT_PUBLIC_API_URL` = `http://localhost:8000`
6. **Deploy 클릭**
7. **배포 완료 후**: URL 받아서 README 업데이트

## 📸 배포 후 작업

1. Vercel URL 확인 (예: `https://maintenance-app-xxx.vercel.app`)
2. README.md 22번째 줄 업데이트:
   ```markdown
   - **Frontend**: [https://YOUR-VERCEL-URL.vercel.app](https://YOUR-VERCEL-URL.vercel.app)
   ```
3. GitHub About 섹션 설정
4. 스크린샷 캡처

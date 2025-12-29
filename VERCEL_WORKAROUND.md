# Vercel 배포 우회 방법 (Korean Character Issue)

## 문제
Vercel CLI가 Windows 사용자명/컴퓨터명에서 한글(링크웍스)을 읽어서 HTTP 헤더에 포함시켜 오류 발생

## 해결 방법

### 방법 1: GitHub 연동으로 배포 (가장 간단, 권장 ⭐)

CLI 없이 Vercel 웹사이트에서 직접 배포:

#### 1단계: GitHub에 코드 푸시

```bash
cd C:\projact

# Git 초기화 (아직 안 했으면)
git init
git add .
git commit -m "feat: AI building maintenance system v2.0"

# GitHub 원격 저장소 연결
git remote add origin https://github.com/doublesilver/maintenance-app.git
git branch -M main
git push -u origin main
```

#### 2단계: Vercel 웹사이트에서 배포

1. https://vercel.com/signup 접속
2. **Continue with GitHub** 클릭
3. GitHub 계정으로 로그인 및 권한 승인
4. 대시보드에서 **Add New... → Project** 클릭
5. **Import Git Repository** 섹션에서 `maintenance-app` 검색
6. **Import** 클릭
7. 설정 확인:
   - **Framework Preset**: Next.js (자동 감지됨)
   - **Root Directory**: `frontend`  ← **중요! 반드시 설정**
   - **Build Command**: `npm run build` (기본값)
   - **Output Directory**: `.next` (기본값)
8. **Environment Variables** 추가:
   - Key: `NEXT_PUBLIC_API_URL`
   - Value: `http://localhost:8000` (로컬 테스트용, 나중에 AWS URL로 변경)
9. **Deploy** 클릭

#### 3단계: 배포 완료

- 2-3분 후 배포 완료
- 배포 URL: `https://maintenance-app-xxxx.vercel.app`
- 이 URL을 포트폴리오와 README에 추가

---

### 방법 2: 환경변수 오버라이드

Vercel CLI가 User-Agent 헤더에 포함시키는 정보를 제어:

```bash
# PowerShell에서 실행
cd C:\projact\frontend

# 환경변수 설정
$env:VERCEL_USER_AGENT = "vercel-cli"
$env:USERNAME = "user"

# 로그인 시도
npx vercel login
```

---

### 방법 3: Docker 환경에서 배포

WSL2를 사용 중이므로 Linux 환경에서 시도:

```bash
# WSL2에서 실행
cd /mnt/c/projact/frontend

# Node.js 설치 (WSL에 없으면)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Vercel CLI 설치 및 로그인
npm install -g vercel
vercel login

# 배포
vercel --prod
```

---

## 권장 순서

1. **GitHub 연동 방법 (방법 1)** ← 가장 간단하고 확실
2. WSL2에서 시도 (방법 3)
3. 환경변수 오버라이드 (방법 2)

---

## Next Steps

배포 완료 후:

1. Vercel URL 받기
2. `README.md` 업데이트
3. GitHub About 섹션 설정
4. 스크린샷 캡처
5. 포트폴리오 추가

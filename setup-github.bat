@echo off
echo ========================================
echo GitHub 저장소 설정 스크립트
echo ========================================
echo.

REM README 복사
echo [1/5] README 파일 복사 중...
copy README_ENHANCED.md README.md
echo ✓ README.md 생성 완료
echo.

REM Git 초기화 확인
if not exist .git (
    echo [2/5] Git 저장소 초기화 중...
    git init
    echo ✓ Git 초기화 완료
) else (
    echo [2/5] Git 저장소가 이미 초기화되어 있습니다.
)
echo.

REM 모든 파일 추가
echo [3/5] 파일 추가 중...
git add .
echo ✓ 파일 추가 완료
echo.

REM 커밋
echo [4/5] 커밋 생성 중...
git commit -m "feat: AI-powered building maintenance system v2.0 with Celery, Redis, WebSocket"
echo ✓ 커밋 완료
echo.

REM 원격 저장소 설정
echo [5/5] 원격 저장소 설정 중...
git remote add origin https://github.com/doublesilver/maintenance-app.git
echo ✓ 원격 저장소 설정 완료
echo.

echo ========================================
echo 설정 완료!
echo.
echo 다음 명령어로 GitHub에 푸시하세요:
echo   git branch -M main
echo   git push -u origin main
echo.
echo (GitHub에 maintenance-app 저장소를 먼저 생성해야 합니다)
echo ========================================
pause

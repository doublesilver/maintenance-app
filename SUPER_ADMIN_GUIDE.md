# 최고 관리자 가이드

## 🔐 최고 관리자 계정

시스템에는 최고 권한을 가진 관리자 계정이 자동으로 생성됩니다.

### 기본 계정 정보

```
이메일: admin@system.local
비밀번호: qwer1234 (변경 권장)
역할: super_admin
```

**⚠️ 보안 경고**: 프로덕션 환경에서는 반드시 비밀번호를 변경하세요!

---

## 🚀 로그인 방법

### 1. 웹사이트 접속

```
https://your-vercel-url.com/login
```

### 2. 최고 관리자 로그인

- **이메일**: `admin@system.local`
- **비밀번호**: `qwer1234` (또는 변경한 비밀번호)

### 3. 사용자 관리

로그인 후:
1. **관리자 대시보드** 클릭
2. **"👥 사용자 관리"** 버튼 클릭
3. 모든 사용자 목록 확인
4. **"관리자로 승격"** 버튼으로 일반 관리자 생성

---

## 🔒 비밀번호 변경 (프로덕션 필수!)

### Railway에서 비밀번호 변경

1. **Railway 대시보드** 접속: https://railway.app
2. **프로젝트** 선택: `focused-celebration`
3. **백엔드 서비스** 클릭
4. **Variables** 탭 클릭
5. **New Variable** 추가:

```
변수명: SUPER_ADMIN_PASSWORD
값: your-very-secure-password-123!@#
```

6. **Deploy** (자동 재배포)

재배포 완료 후 새 비밀번호로 로그인 가능합니다.

---

## 👥 역할 계층 구조

```
⭐ super_admin (최고 관리자)
├─ 모든 사용자 관리 (승격/강등)
├─ 모든 요청 관리
├─ 통계 조회
└─ 역할 변경 불가 (자체 보호)

👑 admin (관리자)
├─ 모든 요청 관리
├─ 통계 조회
└─ 사용자 관리 불가

👤 user (일반 사용자)
├─ 본인 요청만 조회/삭제
└─ 관리 기능 없음
```

---

## 🎯 최고 관리자 권한

### ✅ 가능한 작업

- 모든 사용자 목록 조회
- 사용자 역할 변경 (user ↔ admin)
- 관리자 계정 생성
- 모든 유지보수 요청 관리
- 시스템 통계 조회

### ❌ 불가능한 작업

- 자신의 역할 변경 (super_admin 고정)
- 다른 super_admin 생성 (1개만 존재)

---

## 📊 사용자 관리 페이지

### 접근 방법

```
URL: /admin/users
권한: super_admin 전용
```

### 주요 기능

1. **사용자 목록 조회**
   - ID, 이메일, 이름, 역할 표시
   - 역할별 색상 구분
   - 실시간 정보 표시

2. **역할 변경**
   - 👤 사용자 → 👑 관리자
   - 👑 관리자 → 👤 사용자
   - ⭐ 최고 관리자는 변경 불가

3. **시각적 구분**
   - ⭐ 최고 관리자: 빨간색 배지
   - 👑 관리자: 보라색 배지
   - 👤 사용자: 회색 배지

---

## 🛠 개발 환경

### 로컬에서 최고 관리자 생성

```bash
cd backend
python init_super_admin.py
```

출력:
```
============================================================
Super Admin Account:
  Email: admin@system.local
  Password: ******** (from env or default)
  Role: super_admin
============================================================
```

### 데이터베이스 확인

```bash
railway run python admin_db_viewer.py
```

또는:

```bash
railway run python promote_admin.py --list
```

---

## 🔐 보안 권장사항

### 1. 비밀번호 정책

최고 관리자 비밀번호는 반드시:
- ✅ 최소 12자 이상
- ✅ 대소문자, 숫자, 특수문자 포함
- ✅ 사전에 없는 단어
- ✅ 정기적으로 변경 (90일마다)

### 2. 접근 제어

- ✅ 최고 관리자 계정 공유 금지
- ✅ 필요한 경우에만 일반 관리자 생성
- ✅ 정기적으로 관리자 목록 검토
- ✅ 퇴사자 계정은 즉시 강등

### 3. 모니터링

Railway 로그에서 다음 활동 모니터링:
- 최고 관리자 로그인 시도
- 역할 변경 작업
- 비정상적인 API 호출

---

## 📝 자주 묻는 질문 (FAQ)

### Q: 최고 관리자 비밀번호를 잊어버렸어요

A: Railway CLI로 비밀번호 재설정:

```bash
railway shell
python init_super_admin.py
```

또는 데이터베이스에서 직접 변경:

```bash
railway run python -c "
from passlib.context import CryptContext
pwd = CryptContext(schemes=['bcrypt'])
print(pwd.hash('new-password'))
"
```

복사한 해시를 데이터베이스에 업데이트

### Q: 일반 관리자를 최고 관리자로 만들 수 있나요?

A: 보안상의 이유로 불가능합니다. 최고 관리자는 시스템에 1개만 존재하며, `admin@system.local` 계정으로 고정됩니다.

### Q: 최고 관리자 계정을 삭제할 수 있나요?

A: 삭제하면 사용자 관리 기능을 사용할 수 없으므로 권장하지 않습니다. 대신 비밀번호를 강력하게 변경하세요.

### Q: 여러 명이 최고 관리자 권한이 필요해요

A: 보안상 최고 관리자는 1명만 유지하고, 나머지는 일반 관리자(`admin`)로 운영하는 것을 권장합니다. 일반 관리자도 대부분의 관리 작업이 가능합니다.

---

## 🚨 긴급 상황 대응

### 최고 관리자 계정이 잠겼을 때

1. Railway CLI 접속:
```bash
railway shell
```

2. 계정 확인:
```bash
python promote_admin.py --list
```

3. 비밀번호 재설정:
```bash
python init_super_admin.py
```

4. 또는 다른 사용자를 임시로 최고 관리자로 승격:
```bash
python -c "
import sqlite3
conn = sqlite3.connect('maintenance.db')
conn.execute('UPDATE users SET role = \"super_admin\" WHERE email = \"your-email@example.com\"')
conn.commit()
print('Updated')
"
```

---

**보안 관련 문의는 GitHub Issues로 남겨주세요!**

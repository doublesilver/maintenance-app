-- 이 파일을 수정하여 사용하세요
-- 방법 1: VSCode에서 이 파일을 열고 Ctrl+Shift+Q로 실행
-- 방법 2: 터미널에서 python promote_admin.py 사용

-- 여기에 이메일을 입력하세요 👇
UPDATE users
SET role = 'admin'
WHERE email = 'test@test.com';  -- 이 부분을 수정하세요!

-- 결과 확인
SELECT id, email, full_name, role
FROM users;

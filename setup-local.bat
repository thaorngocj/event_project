@echo off
echo ========================================
echo  Setup Backend Local (Windows)
echo ========================================

REM Hỏi mật khẩu PostgreSQL
set /p PG_PASS=Nhap mat khau PostgreSQL cua ban (Enter = postpass): 
if "%PG_PASS%"=="" set PG_PASS=postpass

REM Ghi vào backend/.env
(
echo POSTGRES_USER=postgres
echo POSTGRES_PASSWORD=%PG_PASS%
echo POSTGRES_DB=mydb
echo DB_HOST=localhost
echo DB_PORT=5432
echo JWT_SECRET=vlu_renluyen_jwt_secret_2026
echo JWT_EXPIRES_IN=1h
echo PORT=3000
) > backend\.env

echo.
echo [OK] Da luu backend/.env voi mat khau: %PG_PASS%
echo.
echo Tao database mydb...
psql -U postgres -c "CREATE DATABASE mydb;" 2>nul
echo.
echo Khoi dong backend...
cd backend
npm install
npm run start:dev

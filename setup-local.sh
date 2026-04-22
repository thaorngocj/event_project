#!/bin/bash
echo "========================================"
echo " Setup Backend Local (Mac/Linux)"
echo "========================================"

read -p "Nhập mật khẩu PostgreSQL (Enter = postpass): " PG_PASS
PG_PASS=${PG_PASS:-postpass}

cat > backend/.env << ENVEOF
POSTGRES_USER=postgres
POSTGRES_PASSWORD=$PG_PASS
POSTGRES_DB=mydb
DB_HOST=localhost
DB_PORT=5432
JWT_SECRET=vlu_renluyen_jwt_secret_2026
JWT_EXPIRES_IN=1h
PORT=3000
ENVEOF

echo "[OK] Đã lưu backend/.env"
psql -U postgres -c "CREATE DATABASE mydb;" 2>/dev/null || true
cd backend && npm install && npm run start:dev

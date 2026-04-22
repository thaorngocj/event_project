# 🔧 Xử lý lỗi thường gặp

## ❌ Lỗi: "password authentication failed for user postgres"

### Nguyên nhân
Bạn đang chạy **thủ công (không dùng Docker)**, nhưng:
- `DB_HOST=db` trong `.env` là tên container Docker → không dùng được khi chạy local
- Mật khẩu PostgreSQL trên máy bạn khác với `postpass`

### ✅ Cách sửa khi chạy thủ công

**Bước 1:** Mở file `backend/.env` (hoặc tạo mới nếu chưa có):

```env
POSTGRES_USER=postgres
POSTGRES_PASSWORD=<MẬT_KHẨU_POSTGRES_CỦA_BẠN>
POSTGRES_DB=mydb

DB_HOST=localhost      ← quan trọng! phải là localhost
DB_PORT=5432

JWT_SECRET=vlu_renluyen_jwt_secret_2026
JWT_EXPIRES_IN=1h
PORT=3000
```

**Bước 2:** Tìm mật khẩu PostgreSQL của bạn:
- Nếu cài PostgreSQL mặc định → thường để trống hoặc `postgres`
- Nếu dùng pgAdmin → xem trong Connection settings

**Bước 3:** Tạo database `mydb` nếu chưa có:
```sql
-- Mở psql hoặc pgAdmin, chạy:
CREATE DATABASE mydb;
```

**Bước 4:** Chạy lại backend:
```bash
cd backend
npm run start:dev
```

---

## ❌ Lỗi: "connect ECONNREFUSED 127.0.0.1:5432"

PostgreSQL chưa chạy. Khởi động PostgreSQL:
- **Windows:** Services → postgresql-x64-15 → Start
- **macOS:** `brew services start postgresql`
- **Linux:** `sudo service postgresql start`

---

## 🐳 Chạy bằng Docker (tránh mọi lỗi trên)

Docker tự tạo PostgreSQL, không cần cài sẵn:

```bash
cd fullproject
docker-compose up --build
```

Chỉ cần Docker Desktop đang chạy là xong ✅

---

## 📋 Kiểm tra kết nối DB

```bash
# Test kết nối PostgreSQL
psql -U postgres -h localhost -c "\l"

# Nếu hỏi mật khẩu → nhập đúng rồi copy vào backend/.env
```

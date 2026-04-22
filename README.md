# 🎓 Hệ thống quản lý ngày rèn luyện

## 📦 Cấu trúc

```
fullproject/
├── backend/            NestJS API          → http://localhost:3000
├── client-superadmin/  Next.js SuperAdmin  → http://localhost:3001
├── client-customer/    Next.js Customer    → http://localhost:3002
├── docker-compose.yml
└── .env
```

---

## 👤 Tài khoản mặc định (tự động seed khi khởi động)

| Role        | Email                  | Password  |
|-------------|------------------------|-----------|
| SUPER_ADMIN | superadmin1@school.edu | super123  |
| ADMIN       | admin@school.edu       | admin123  |
| STUDENT     | sv01@school.edu        | 123456    |
| STUDENT     | sv02@school.edu        | 123456    |

---

## 🚀 Chạy bằng Docker (khuyến nghị)

```bash
cd fullproject
docker-compose up --build
```

| Service       | URL                             |
|---------------|---------------------------------|
| API Backend   | http://localhost:3000/api/v1    |
| Swagger Docs  | http://localhost:3000/api/docs  |
| SuperAdmin    | http://localhost:3001           |
| Customer      | http://localhost:3002           |

Dừng: `docker-compose down`  
Reset DB: `docker-compose down -v && docker-compose up --build`

---

## 🛠️ Chạy thủ công (không Docker)

**Yêu cầu:** Node 18+, PostgreSQL 15+

```bash
# 1. Backend
cd backend && npm install && npm run start:dev

# 2. SuperAdmin (terminal mới)
cd client-superadmin && npm install && npm run dev

# 3. Customer (terminal mới)
cd client-customer && npm install && npm run dev
```

---

## 🔌 API Endpoints đã test (35/35 ✅)

### Auth
| Method | Endpoint              | Mô tả                    |
|--------|-----------------------|--------------------------|
| POST   | /auth/login           | Đăng nhập                |
| POST   | /auth/refresh         | Refresh access token     |
| POST   | /auth/register        | Tự đăng ký tài khoản     |

### Users (SUPER_ADMIN)
| Method | Endpoint                    | Mô tả              |
|--------|-----------------------------|--------------------|
| GET    | /users                      | Danh sách users    |
| GET    | /users/me                   | Thông tin bản thân |
| GET    | /users/:id                  | Chi tiết user      |
| POST   | /users                      | Tạo user mới       |
| PATCH  | /users/:id/role             | Đổi role           |
| PATCH  | /users/:id/deactivate       | Khóa tài khoản     |
| PATCH  | /users/:id/activate         | Mở tài khoản       |
| DELETE | /users/:id                  | Xóa user           |

### Events
| Method | Endpoint                    | Mô tả                     |
|--------|-----------------------------|---------------------------|
| GET    | /events                     | Danh sách (public)        |
| GET    | /events/:id                 | Chi tiết (public)         |
| POST   | /events                     | Tạo sự kiện (ADMIN+)      |
| PATCH  | /events/:id                 | Cập nhật (ADMIN+)         |
| DELETE | /events/:id                 | Xóa + cascade (ADMIN+)    |
| POST   | /events/:id/import          | Import Excel (ADMIN+)     |
| GET    | /events/:id/export          | Export Excel (ADMIN+)     |
| GET    | /events/:id/import-history  | Lịch sử import (ADMIN+)   |

### Registrations
| Method | Endpoint                              | Mô tả                        |
|--------|---------------------------------------|------------------------------|
| POST   | /registrations/events/:id/register   | Đăng ký (STUDENT)            |
| POST   | /registrations/events/:id/checkin    | Check-in QR (ADMIN+)         |
| GET    | /registrations/my-events             | Sự kiện đã đăng ký + QR      |
| GET    | /registrations/events/:id/list       | Danh sách đăng ký (ADMIN+)   |

### Statistics (ADMIN+)
| Method | Endpoint                    | Mô tả                     |
|--------|-----------------------------|---------------------------|
| GET    | /statistics/overview        | Tổng quan hệ thống        |
| GET    | /statistics/events/:id      | Thống kê theo sự kiện     |
| GET    | /statistics/students/top    | Top sinh viên              |

---

## ✅ Các lỗi đã sửa

| # | Lỗi gốc | Đã sửa |
|---|---------|--------|
| 1 | `CreateEventDto` dùng `startTime`/`endTime` sai với Entity | Đổi thành `startDate`/`endDate` |
| 2 | QR code chứa `Date.now()` thay vì `reg.id` thực → checkin fail | Lưu DB trước, lấy `saved.id` |
| 3 | `JwtAuthGuard.handleRequest` throw `Error()` → HTTP 500 thay vì 401 | Throw `UnauthorizedException` |
| 4 | Không có seed data khi khởi động | `SeederService` tự seed 4 users |
| 5 | Login domain `@vlu.edu.vn` sai, seed dùng `@school.edu` | Đồng bộ `@school.edu` |
| 6 | Thiếu `ValidationPipe` global | Thêm vào `main.ts` |
| 7 | `app.module.ts` dùng `forRoot` thay `forRootAsync` + `ConfigService` | Đổi sang `forRootAsync` |
| 8 | `data-source.ts` thiếu `ImportHistory`, `Registration` entities | Thêm đủ 4 entities |
| 9 | Xóa event → FK constraint crash (500) | Thêm `onDelete: CASCADE` |
| 10 | `getTopStudents()` SQL lỗi với PostgreSQL | Dùng `FILTER (WHERE...)` + cast |
| 11 | Không check `isActive` khi login | Thêm kiểm tra trong `auth.service` |
| 12 | `findByEmail` không select `isActive` | Thêm `isActive` vào select |
| 13 | CORS chưa bật | Thêm CORS cho port 3001 & 3002 |
| 14 | Hint mật khẩu demo sai | Fix đúng theo seed data |

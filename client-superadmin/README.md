# 🛡️ Client SuperAdmin – VLU Rèn Luyện

## Mô tả
Trang quản trị dành riêng cho **SUPER_ADMIN** – quản lý toàn bộ hệ thống.

## Tính năng
- 📊 **Dashboard** – Tổng quan KPI, phân bố role, trạng thái hệ thống
- 👥 **Quản lý User** – CRUD, phân quyền, khóa/mở tài khoản
- 📅 **Quản lý Sự kiện** – Tạo, sửa trạng thái, xóa sự kiện
- 📋 **Đăng ký & Check-in** – Xem thống kê registration
- ⚙️ **Hệ thống** – Monitor resource, backup, config

## Cài đặt & Chạy
```bash
npm install
cp .env.local.example .env.local   # cấu hình API URL
npm run dev    # http://localhost:3001
```

## Đăng nhập
- Email: `superadmin@vlu.edu.vn`
- Password: `123456`

> Chỉ tài khoản SUPER_ADMIN mới được truy cập. Role khác sẽ bị từ chối.

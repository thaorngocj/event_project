// ============================================================
// src/lib/constants.ts – Static fallback data + role helpers
// ============================================================
import { Account, Event, UserRole } from '../types';

// ⚠️ DEMO ACCOUNTS – chỉ dùng khi backend offline
// Khi backend online, authService sẽ gọi API thực tế
export const ACCOUNTS: Record<string, Account> = {
  'student@vlu.edu.vn':    { pass: '123456', role: 'student', name: 'Nguyễn Văn An' },
  'manager@vlu.edu.vn':    { pass: '123456', role: 'manager', name: 'Trần Thị Bình' },
  'admin@vlu.edu.vn':      { pass: '123456', role: 'admin',   name: 'Lê Quản Lý'   },
  'superadmin@vlu.edu.vn': { pass: '123456', role: 'super',   name: 'Nguyễn Quản Trị' },
};

export const ROLE_COLOR: Record<UserRole, string> = {
  student: '#C8102E',
  manager: '#E8A020',
  admin:   '#2563EB',
  super:   '#7C3AED',
};

export const ROLE_LABEL: Record<UserRole, string> = {
  student: 'Sinh viên',
  manager: 'Ban tổ chức',
  admin:   'Admin',
  super:   'Super Admin',
};

// Static fallback events (dùng khi backend chưa chạy)
export const EVENTS: Event[] = [
  { id:1, title:'Career Day 2026 – Unlock Your Future in Hospitality', date:'08/04/2026', time:'08:00', loc:'Toà J, CS3 – J.03.03', status:'open',  em:'💼', pts:5 },
  { id:2, title:'A&A Racing 2026 – Vòng Bán Kết',                     date:'11/04/2026', time:'09:00', loc:'Online',              status:'soon',  em:'🏎️', pts:3 },
  { id:3, title:'Hội Thao Sinh Viên Văn Lang 2026',                    date:'17/04/2026', time:'18:00', loc:'Toà J, CS3',          status:'soon',  em:'⚽', pts:5 },
  { id:4, title:'Chung Kết Cuộc Thi Học Thuật Cấp Khoa',              date:'18/04/2026', time:'13:30', loc:'Toà J, CS3-3.03',     status:'soon',  em:'🏆', pts:4 },
  { id:5, title:'Future Fest 2026 – Van Lang Global School',           date:'11/04/2026', time:'07:00', loc:'Hội trường Trịnh Công Sơn', status:'soon', em:'🌍', pts:3 },
  { id:6, title:'Lễ Trao Giải Nghiên Cứu Khoa học Sinh viên',         date:'08/04/2026', time:'13:00', loc:'Hội trường N2T1',     status:'ended', em:'🎗️', pts:0 },
];

// ============================================================
// src/lib/mappers.ts
// Chuyển đổi dữ liệu Backend <-> Frontend
// ============================================================
import { BackendEvent, BackendRole, Event, EventStatus, UserRole } from '../types';

// ── Role mapping ─────────────────────────────────────────────
export function backendRoleToFrontend(role: BackendRole): UserRole {
  const map: Record<BackendRole, UserRole> = {
    STUDENT:       'student',
    EVENT_MANAGER: 'manager',
    ADMIN:         'admin',
    SUPER_ADMIN:   'super',
  };
  return map[role] ?? 'student';
}

export function frontendRoleToBackend(role: UserRole): BackendRole {
  const map: Record<UserRole, BackendRole> = {
    student: 'STUDENT',
    manager: 'EVENT_MANAGER',
    admin:   'ADMIN',
    super:   'SUPER_ADMIN',
  };
  return map[role];
}

// ── Event mapping ─────────────────────────────────────────────
const STATUS_EMOJI: Record<string, string> = {
  '💼': '💼', '🏎️': '🏎️', '⚽': '⚽', '🏆': '🏆', '🌍': '🌍', '🎗️': '🎗️',
};

const EMOJI_LIST = ['📅','🎯','🏫','🎉','🎓','💡','🔬','🎤','🏃','🌟'];

export function backendEventToFrontend(ev: BackendEvent, idx = 0): Event {
  const start   = new Date(ev.startDate);
  const dateStr = `${String(start.getDate()).padStart(2,'0')}/${String(start.getMonth()+1).padStart(2,'0')}/${start.getFullYear()}`;
  const timeStr = `${String(start.getHours()).padStart(2,'0')}:${String(start.getMinutes()).padStart(2,'0')}`;

  let status: EventStatus;
  if (ev.status === 'OPEN')     status = 'open';
  else if (ev.status === 'CLOSED') status = 'ended';
  else status = 'soon';

  return {
    id:               ev.id,
    title:            ev.title,
    date:             dateStr,
    time:             timeStr,
    loc:              ev.location,
    status,
    em:               EMOJI_LIST[idx % EMOJI_LIST.length],
    pts:              3,                     // backend chưa có pts – default 3
    description:      ev.description,
    startDate:        ev.startDate,
    endDate:          ev.endDate,
    maxParticipants:  ev.maxParticipants,
    imageUrl:         ev.imageUrl,
  };
}

// ── Format date for backend (ISO) ────────────────────────────
export function ddmmyyyyToISO(ddmmyyyy: string, time = '08:00'): string {
  const [dd, mm, yyyy] = ddmmyyyy.split('/');
  return `${yyyy}-${mm}-${dd}T${time}:00.000Z`;
}

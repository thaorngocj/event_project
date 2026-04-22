// ============================================================
// src/services/eventService.ts
// Gọi API events + registrations
// ============================================================
import { api } from '../lib/apiClient';
import { backendEventToFrontend } from '../lib/mappers';
import { BackendEvent, BackendUser, Event, PaginatedUsers, Registration } from '../types';

// ── Events ───────────────────────────────────────────────────
export async function fetchEvents(): Promise<Event[]> {
  try {
    const data = await api.get<BackendEvent[]>('/events', false);
    return data.map((ev, i) => backendEventToFrontend(ev, i));
  } catch (_) {
    return [];
  }
}

export async function fetchEvent(id: number): Promise<Event | null> {
  try {
    const ev = await api.get<BackendEvent>(`/events/${id}`, false);
    return backendEventToFrontend(ev);
  } catch (_) {
    return null;
  }
}

export async function createEvent(payload: {
  title:           string;
  description:     string;
  startDate:       string;
  endDate:         string;
  location:        string;
  maxParticipants?: number;
  status?:         'UPCOMING' | 'OPEN' | 'CLOSED';
}): Promise<BackendEvent> {
  return api.post<BackendEvent>('/events', payload);
}

export async function updateEvent(id: number, payload: Partial<{
  title:           string;
  description:     string;
  startDate:       string;
  endDate:         string;
  location:        string;
  maxParticipants: number;
  status:          'UPCOMING' | 'OPEN' | 'CLOSED';
}>): Promise<BackendEvent> {
  return api.patch<BackendEvent>(`/events/${id}`, payload);
}

export async function deleteEvent(id: number): Promise<void> {
  return api.delete<void>(`/events/${id}`);
}

// ── Registrations ────────────────────────────────────────────
export async function registerEvent(eventId: number): Promise<Registration> {
  return api.post<Registration>(`/registrations/events/${eventId}/register`, {});
}

export async function getMyRegistrations(): Promise<Registration[]> {
  try {
    return await api.get<Registration[]>('/registrations/my-events');
  } catch (_) {
    return [];
  }
}

export async function checkIn(eventId: number, qrData: string): Promise<Registration> {
  return api.post<Registration>(`/registrations/events/${eventId}/checkin`, { qrData });
}

// ── Users (admin/super) ──────────────────────────────────────
export async function fetchUsers(params?: {
  search?: string;
  role?:   string;
  page?:   number;
  limit?:  number;
}): Promise<PaginatedUsers> {
  const qs = new URLSearchParams();
  if (params?.search) qs.set('search', params.search);
  if (params?.role)   qs.set('role',   params.role);
  if (params?.page)   qs.set('page',   String(params.page));
  if (params?.limit)  qs.set('limit',  String(params.limit));
  const query = qs.toString() ? `?${qs.toString()}` : '';
  return api.get<PaginatedUsers>(`/users${query}`);
}

export async function createUser(payload: {
  username: string;
  email:    string;
  password: string;
  role?:    string;
}): Promise<BackendUser> {
  return api.post<BackendUser>('/auth/register', payload);
}

export async function updateUserRole(userId: number, role: string): Promise<BackendUser> {
  return api.patch<BackendUser>(`/users/${userId}/role`, { role });
}

export async function setUserActive(userId: number, active: boolean): Promise<BackendUser> {
  const path = active ? `/users/${userId}/activate` : `/users/${userId}/deactivate`;
  return api.patch<BackendUser>(path, {});
}

export async function deleteUser(userId: number): Promise<void> {
  return api.delete<void>(`/users/${userId}`);
}

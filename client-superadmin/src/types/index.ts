// ============================================================
// src/types/index.ts – Tất cả type definitions khớp với backend
// ============================================================

export type BackendRole   = 'STUDENT' | 'EVENT_MANAGER' | 'ADMIN' | 'SUPER_ADMIN';
export type UserRole      = 'student' | 'manager' | 'admin' | 'super';
export type EventStatus   = 'open' | 'soon' | 'ended';
export type BackendStatus = 'UPCOMING' | 'OPEN' | 'CLOSED';
export type PageName      = 'landing' | UserRole;

export interface User {
  id:         string;
  role:       UserRole;
  name:       string;
  email?:     string;
  backendId?: number;
}

export interface Account {
  pass: string;
  role: UserRole;
  name: string;
}

export interface Event {
  id:               number;
  title:            string;
  date:             string;
  time:             string;
  loc:              string;
  status:           EventStatus;
  em:               string;
  pts:              number;
  description?:     string;
  startDate?:       string;
  endDate?:         string;
  maxParticipants?: number;
}

export interface BackendEvent {
  id:               number;
  title:            string;
  description:      string;
  startDate:        string;
  endDate:          string;
  location:         string;
  maxParticipants:  number;
  status:           BackendStatus;
  imageUrl?:        string;
}

export interface BackendUser {
  id:        number;
  username:  string;
  email:     string;
  role:      BackendRole;
  isActive:  boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthState {
  user:  User | null;
  error: string | null;
}

export interface LoginCredentials {
  id:       string;
  password: string;
}

export interface LoginResponse {
  accessToken:  string;
  refreshToken: string;
  role:         BackendRole;
  email:        string;
}

export interface Registration {
  id:           number;
  eventId:      number;
  eventTitle?:  string;
  eventDate?:   string;
  status:       'REGISTERED' | 'CHECKED_IN';
  registeredAt: string;
  checkedInAt?: string;
  qrCode?:      string;
}

export interface PaginatedUsers {
  data:       BackendUser[];
  total:      number;
  page:       number;
  limit:      number;
  totalPages: number;
}

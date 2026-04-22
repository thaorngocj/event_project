'use client';
import { useState, useCallback } from 'react';
import { api, tokenStorage } from '../lib/apiClient';

export type UserRole = 'student' | 'manager' | 'admin' | 'super';

export interface AuthUser {
  id: number;
  email: string;
  username: string;
  role: UserRole;
  name: string;
}

// Map backend role → frontend role
function mapRole(backendRole: string): UserRole {
  if (backendRole === 'SUPER_ADMIN') return 'super';
  if (backendRole === 'ADMIN')       return 'admin';
  if (backendRole === 'EVENT_MANAGER') return 'manager';
  return 'student';
}

export function useAuth() {
  const [user,  setUser]  = useState<AuthUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(async (emailOrUsername: string, password: string): Promise<boolean> => {
    setError(null);
    try {
      // Nếu không có @ → thêm @school.edu
      const email = emailOrUsername.includes('@') ? emailOrUsername : `${emailOrUsername}@school.edu`;
      const data = await api.post<{ accessToken: string; refreshToken: string; role: string; id: number; email: string }>(
        '/auth/login', { email, password }, false
      );
      tokenStorage.setTokens(data.accessToken, data.refreshToken);
      // Lấy thông tin chi tiết user
      const me = await api.get<{ id: number; username: string; email: string; role: string }>('/users/me');
      setUser({
        id:       me.id,
        email:    me.email,
        username: me.username,
        role:     mapRole(me.role),
        name:     me.username,
      });
      return true;
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Đăng nhập thất bại');
      return false;
    }
  }, []);

  const logout = useCallback(() => {
    tokenStorage.clearTokens();
    setUser(null);
    setError(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { user, error, login, logout, clearError };
}

'use client';
// ============================================================
// src/hooks/useAuth.ts
// ============================================================
import { useState, useCallback } from 'react';
import { login as authLogin, logout as authLogout } from '../services/authService';
import { tokenStorage } from '../lib/apiClient';
import { AuthState, LoginCredentials, User } from '../types';

export interface UseAuthReturn extends AuthState {
  login:      (creds: LoginCredentials) => Promise<boolean>;
  logout:     () => void;
  clearError: () => void;
}

export function useAuth(): UseAuthReturn {
  const [state, setState] = useState<AuthState>({ user: null, error: null });

  const login = useCallback(async (creds: LoginCredentials): Promise<boolean> => {
    setState(prev => ({ ...prev, error: null }));
    const result = await authLogin(creds);
    if (result.success && result.user) {
      setState({ user: result.user, error: null });
      return true;
    }
    setState(prev => ({ ...prev, error: result.error ?? 'Đăng nhập thất bại.' }));
    return false;
  }, []);

  const logout = useCallback(() => {
    authLogout();
    setState({ user: null, error: null });
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return { ...state, login, logout, clearError };
}

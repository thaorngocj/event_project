// ============================================================
// src/lib/apiClient.ts
// HTTP client trung tâm – tự gắn Bearer token, handle lỗi
// ============================================================

export const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1';

const TOKEN_KEY = 'vlu_access_token';
const REFRESH_KEY = 'vlu_refresh_token';

// ── Token helpers ────────────────────────────────────────────
export const tokenStorage = {
  getAccess:    ()       => (typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY)   : null),
  getRefresh:   ()       => (typeof window !== 'undefined' ? localStorage.getItem(REFRESH_KEY) : null),
  setTokens:    (a: string, r: string) => {
    localStorage.setItem(TOKEN_KEY,   a);
    localStorage.setItem(REFRESH_KEY, r);
  },
  clearTokens:  ()       => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_KEY);
  },
};

// ── Generic request ──────────────────────────────────────────
async function request<T>(
  path: string,
  options: RequestInit = {},
  withAuth = true,
): Promise<T> {
const headers: Record<string, string> = {
  'Content-Type': 'application/json',
  'ngrok-skip-browser-warning': 'true',  // ← THÊM DÒNG NÀY
  ...(options.headers as Record<string, string>),
};

  if (withAuth) {
    const token = tokenStorage.getAccess();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (!res.ok) {
    // Cố parse body lỗi
    let errMsg = `HTTP ${res.status}`;
    try {
      const body = await res.json();
      errMsg = body?.message ?? errMsg;
    } catch (_) { /* ignore */ }
    throw new Error(errMsg);
  }

  // 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}

// ── Convenience methods ──────────────────────────────────────
export const api = {
  get:    <T>(path: string, auth = true)                        => request<T>(path, { method: 'GET' }, auth),
  post:   <T>(path: string, body: unknown, auth = true)         => request<T>(path, { method: 'POST',  body: JSON.stringify(body) }, auth),
  patch:  <T>(path: string, body: unknown, auth = true)         => request<T>(path, { method: 'PATCH', body: JSON.stringify(body) }, auth),
  delete: <T>(path: string, auth = true)                        => request<T>(path, { method: 'DELETE' }, auth),
};

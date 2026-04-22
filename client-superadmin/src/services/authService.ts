// ============================================================
// src/services/authService.ts
// Auth service kết nối thực tế với backend API
// ============================================================
import { api, tokenStorage } from '../lib/apiClient';
import { backendRoleToFrontend } from '../lib/mappers';
import { LoginCredentials, LoginResponse, User } from '../types';

export interface LoginResult {
  success: boolean;
  user?:   User;
  error?:  string;
}

export async function login(credentials: LoginCredentials): Promise<LoginResult> {
  const trimId  = (credentials.id       ?? '').toString().trim();
  const trimPwd = (credentials.password ?? '').toString().trim();

  if (!trimId || !trimPwd) {
    return { success: false, error: 'Vui lòng nhập đầy đủ thông tin.' };
  }

  try {
    // Backend nhận email + password
    // Frontend cho phép nhập email HOẶC username (ta thêm @school.edu nếu không có @)
    const email = trimId.includes('@') ? trimId : `${trimId}@school.edu`;

    const data = await api.post<LoginResponse>(
      '/auth/login',
      { email, password: trimPwd },
      false, // không cần auth header khi login
    );

    // Lưu token
    tokenStorage.setTokens(data.accessToken, data.refreshToken);

    // Lấy thêm thông tin user (name, id)
    let userName = email;
    let backendId: number | undefined;
    try {
      const profile = await api.get<{ id: number; username: string; email: string; role: string }>('/users/me');
      userName  = profile.username;
      backendId = profile.id;
    } catch (_) { /* bỏ qua nếu lỗi profile */ }

    const user: User = {
      id:         trimId,
      role:       backendRoleToFrontend(data.role),
      name:       userName,
      email:      data.email,
      backendId,
    };

    return { success: true, user };

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Đăng nhập thất bại.';

    // Thông báo thân thiện
    const friendly =
      msg.includes('401') || msg.includes('Unauthorized') || msg.includes('not found') || msg.includes('Invalid') || msg.includes('tồn tại') || msg.includes('Sai')
        ? [
            '❌ Sai tài khoản hoặc mật khẩu!',
            '',
            'Tài khoản mặc định:',
            '🎓 STUDENT     – sv01 / 123456',
            '👥 EVENT_MGR   – manager / manager123',
            '⚙️  ADMIN       – admin / admin123',
            '🛡️  SUPER_ADMIN – superadmin1 / super123',
          ].join('\n')
        : msg;

    return { success: false, error: friendly };
  }
}

export function logout(): void {
  tokenStorage.clearTokens();
}

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new UnauthorizedException('Email không tồn tại');

    if (user.isActive === false)
      throw new UnauthorizedException('Tài khoản đã bị vô hiệu hóa');

    const valid = await this.usersService.validatePassword(user, password);
    if (!valid) throw new UnauthorizedException('Mật khẩu không đúng');

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken  = this.jwtService.sign(payload, { expiresIn: '1h' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    return {
      accessToken,
      refreshToken,
      role:  user.role,
      email: user.email,
      id:    user.id,
    };
  }

  async refreshToken(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken) as {
        sub: number; email: string; role: string;
      };
      const user = await this.usersService.findById(payload.sub);
      const newPayload = { sub: user.id, email: (user as any).email, role: user.role };
      return {
        accessToken:  this.jwtService.sign(newPayload, { expiresIn: '1h' }),
        refreshToken: this.jwtService.sign(newPayload, { expiresIn: '7d' }),
      };
    } catch {
      throw new UnauthorizedException('Refresh token không hợp lệ');
    }
  }

  async register(userData: {
    email: string; username: string; password: string;
    role?: 'STUDENT' | 'EVENT_MANAGER' | 'ADMIN' | 'SUPER_ADMIN';
  }) {
    const user = await this.usersService.createUser(userData);
    return { id: user.id, email: (user as any).email, username: user.username, role: user.role };
  }
}

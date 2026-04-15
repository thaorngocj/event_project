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
    if (!user) throw new UnauthorizedException('Email not found');

    const valid = await this.usersService.validatePassword(user, password);
    if (!valid) throw new UnauthorizedException('Invalid password');

    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload, { expiresIn: '1h' });
    const refreshToken = this.jwtService.sign(payload, { expiresIn: '7d' });

    return { accessToken, refreshToken, role: user.role, email: user.email };
  }

  async register(userData: {
    email: string;
    username: string;
    password: string;
    role?: 'STUDENT' | 'EVENT_MANAGER' | 'ADMIN' | 'SUPER_ADMIN';
  }) {
    const user = await this.usersService.createUser(userData);
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
    };
  }
}

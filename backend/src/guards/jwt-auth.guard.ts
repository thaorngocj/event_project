// backend/src/guards/jwt-auth.guard.ts
import { AuthGuard } from '@nestjs/passport';
import { Injectable, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    console.log('Headers:', request.headers);
    return super.canActivate(context) as boolean | Promise<boolean>;
  }

  handleRequest(err: any, user: any): any {
    console.log('User from JWT:', user);
    if (err || !user) {
      throw err || new Error('Unauthorized');
    }
    return user;
  }
}

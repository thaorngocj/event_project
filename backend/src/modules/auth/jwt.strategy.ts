import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

type JwtPayload = {
  sub: number;
  email: string;
  role: string;
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private configService: ConfigService) {
    const options: StrategyOptions = {
      secretOrKey: configService.get<string>('JWT_SECRET', 'your_jwt_secret_key'),
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    };
    super(options);
  }

  validate(payload: JwtPayload) {
    return {
      id:    payload.sub,
      email: payload.email,
      role:  payload.role,
    };
  }
}

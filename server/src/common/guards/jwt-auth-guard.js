import {
  Injectable,
  Dependencies,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
@Dependencies(JwtService)
export class JwtAuthGuard {
  constructor(jwtService) {
    this.jwtService = jwtService;
  }

  async canActivate(context) {
    const request = context.switchToHttp().getRequest();
    const token = extractToken(request);
    if (!token) {
      throw new UnauthorizedException('Missing access token');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: process.env.JWT_ACCESS_SECRET,
      });
      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}

function extractToken(request) {
  const authHeader = request.headers.authorization;
  if (!authHeader) return null;
  const [type, token] = authHeader.split(' ');
  return type === 'Bearer' ? token : null;
}

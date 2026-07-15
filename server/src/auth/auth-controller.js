import {
  Controller,
  Dependencies,
  Post,
  Body,
  Req,
  Res,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthService } from './auth-service';
import { RegisterDto } from './dto/register-dto';
import { LoginDto } from './dto/login-dto';
import { validateDto } from '../common/validate-dto';
import { ok } from '../common/http-response';
import { bindParams } from '../common/bind-params';

const REFRESH_COOKIE = 'refresh_token';
const REFRESH_COOKIE_MAX_AGE_SEC = 7 * 24 * 60 * 60;

@Controller('auth')
@Dependencies(AuthService)
export class AuthController {
  constructor(authService) {
    this.authService = authService;
  }

  @Post('register')
  async register(body, res) {
    const dto = await validateDto(RegisterDto, body);
    const { accessToken, refreshToken, user } = await this.authService.register(dto);
    setRefreshCookie(res, refreshToken);
    return ok({ accessToken, user });
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(body, res) {
    const dto = await validateDto(LoginDto, body);
    const { accessToken, refreshToken, user } = await this.authService.login(dto);
    setRefreshCookie(res, refreshToken);
    return ok({ accessToken, user });
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(req, res) {
    const refreshToken = req.cookies?.[REFRESH_COOKIE];
    const { accessToken, refreshToken: newRefreshToken, user } = await this.authService.refresh(refreshToken);
    setRefreshCookie(res, newRefreshToken);
    return ok({ accessToken, user });
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  logout(res) {
    res.clearCookie(REFRESH_COOKIE, { path: '/' });
    return ok(null);
  }
}

bindParams(AuthController, 'register', {
  0: Body(),
  1: Res({ passthrough: true }),
});
bindParams(AuthController, 'login', {
  0: Body(),
  1: Res({ passthrough: true }),
});
bindParams(AuthController, 'refresh', {
  0: Req(),
  1: Res({ passthrough: true }),
});
bindParams(AuthController, 'logout', { 0: Res({ passthrough: true }) });

function setRefreshCookie(res, refreshToken) {
  res.setCookie(REFRESH_COOKIE, refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: REFRESH_COOKIE_MAX_AGE_SEC,
  });
}

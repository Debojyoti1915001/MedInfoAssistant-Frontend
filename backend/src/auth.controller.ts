import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { User } from './types/user';

type LoginBody = {
  email: string;
  password: string;
};

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  login(@Body() body: LoginBody, @Res({ passthrough: true }) response: Response) {
    const user = this.authService.login(body.email, body.password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    response.cookie('session', JSON.stringify(user), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 1000, // 1 hour
      path: '/',
    });

    return {
      user,
    };
  }

  @Get('session')
  getSession(@Req() request: Request): User | null {
    const rawSession = request.cookies?.session;

    if (!rawSession) {
      return null;
    }

    return JSON.parse(rawSession) as User;
  }

  @Post('logout')
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie('session', { path: '/' });
    return { success: true };
  }
}

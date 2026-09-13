import {
  Controller,
  Get,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
  Body,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthGuard } from './guards/auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import type { User, UserRole, ApiResponse } from '@walikelas/types';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly config: ConfigService,
  ) {}

  private isProduction(): boolean {
    return this.config.get<string>('NODE_ENV') === 'production';
  }

  @Get('google')
  googleLogin(@Res() res: Response): void {
    const state = this.authService.generateOAuthState();

    // Store state in secure HTTP-only cookie for 10 minutes
    res.cookie('wk_oauth_state', state, {
      httpOnly: true,
      secure: this.isProduction(),
      sameSite: 'lax',
      maxAge: 10 * 60 * 1000,
    });

    const googleUrl = this.authService.getGoogleAuthUrl(state);
    res.redirect(googleUrl);
  }

  @Get('google/callback')
  async googleCallback(
    @Query('code') code: string,
    @Query('state') state: string,
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const cookieState = req.cookies?.['wk_oauth_state'];
    const appUrl = this.config.get<string>('NEXT_PUBLIC_APP_URL') || 'http://localhost:3006';

    try {
      const { sessionToken, expiresAt, user } = await this.authService.handleGoogleCallback(
        code,
        state,
        cookieState,
        {
          ipAddress: req.ip,
          userAgent: req.headers['user-agent'],
        },
      );

      // Clear state cookie
      res.clearCookie('wk_oauth_state');

      // Set authoritative application session cookie
      res.cookie('wk_session', sessionToken, {
        httpOnly: true,
        secure: this.isProduction(),
        sameSite: 'lax',
        expires: expiresAt,
      });

      // Redirect to Teacher console or Admin console based on role
      const redirectPath = user.role === 'ADMIN' ? '/admin' : '/teacher';
      res.redirect(`${appUrl}${redirectPath}`);
    } catch (err: any) {
      res.clearCookie('wk_oauth_state');
      res.redirect(`${appUrl}/?error=${encodeURIComponent(err.message || 'OAuth Failed')}`);
    }
  }

  @Get('me')
  @UseGuards(AuthGuard)
  async getMe(@CurrentUser() user: User): Promise<ApiResponse<any>> {
    const data = await this.authService.getMe(user.id);
    return {
      success: true,
      data,
      timestamp: new Date().toISOString(),
    };
  }

  @Post('logout')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  async logout(@Req() req: Request, @Res() res: Response): Promise<void> {
    const token = req.cookies?.['wk_session'];
    if (token) {
      await this.authService.revokeSession(token);
    }

    res.clearCookie('wk_session');
    res.json({
      success: true,
      message: 'Berhasil keluar dari sesi.',
      timestamp: new Date().toISOString(),
    });
  }

  // Development login fallback for rapid local validation
  @Post('dev-login')
  @HttpCode(HttpStatus.OK)
  async devLogin(
    @Body() body: { role?: UserRole; email?: string; name?: string },
    @Req() req: Request,
    @Res() res: Response,
  ): Promise<void> {
    const { sessionToken, expiresAt, data } = await this.authService.devLogin(body, {
      ipAddress: req.ip,
      userAgent: req.headers['user-agent'],
    });

    res.cookie('wk_session', sessionToken, {
      httpOnly: true,
      secure: this.isProduction(),
      sameSite: 'lax',
      expires: expiresAt,
    });

    res.json({
      success: true,
      data,
      timestamp: new Date().toISOString(),
    });
  }
}

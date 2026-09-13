import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import type { UserRole, AuthMeResponse } from '@walikelas/types';

export interface SessionContext {
  ipAddress?: string;
  userAgent?: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  generateOAuthState(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  getGoogleAuthUrl(state: string): string {
    const clientId = this.config.get<string>('GOOGLE_CLIENT_ID');
    const callbackUrl =
      this.config.get<string>('GOOGLE_CALLBACK_URL') ||
      'http://localhost:4006/api/v1/auth/google/callback';

    if (!clientId) {
      throw new BadRequestException('GOOGLE_CLIENT_ID belum dikonfigurasi di server.');
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: callbackUrl,
      response_type: 'code',
      scope: 'openid email profile',
      state,
      prompt: 'select_account',
      access_type: 'offline',
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  async handleGoogleCallback(
    code: string,
    state: string,
    cookieState: string | undefined,
    context: SessionContext,
  ): Promise<{ sessionToken: string; expiresAt: Date; user: any }> {
    // 1. Validate state to prevent CSRF
    if (!state || !cookieState || state !== cookieState) {
      throw new UnauthorizedException(
        'State OAuth tidak valid atau telah kedaluwarsa (CSRF detected).',
      );
    }

    const clientId = this.config.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.config.get<string>('GOOGLE_CLIENT_SECRET');
    const redirectUri =
      this.config.get<string>('GOOGLE_CALLBACK_URL') ||
      'http://localhost:4006/api/v1/auth/google/callback';

    if (!clientId || !clientSecret) {
      throw new BadRequestException('Kredensial Google OAuth belum dikonfigurasi di server.');
    }

    // 2. Exchange code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      this.logger.error(`Failed to exchange Google OAuth code: ${errorData}`);
      throw new UnauthorizedException('Gagal menukarkan kode otentikasi dengan Google.');
    }

    const tokenData = (await tokenResponse.json()) as { access_token: string; id_token?: string };

    // 3. Fetch verified user profile from Google OIDC userinfo
    const userinfoResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });

    if (!userinfoResponse.ok) {
      throw new UnauthorizedException('Gagal mengambil profil pengguna dari Google.');
    }

    const googleUser = (await userinfoResponse.json()) as {
      sub: string;
      email: string;
      name: string;
      picture?: string;
      email_verified?: boolean;
    };

    if (!googleUser.email || !googleUser.email_verified) {
      throw new UnauthorizedException('Email Google tidak terverifikasi.');
    }

    // 4. Upsert User & TeacherProfile in database
    const role: UserRole = googleUser.email.endsWith('@walikelas.id') ? 'ADMIN' : 'TEACHER';

    const user = await this.prisma.user.upsert({
      where: { email: googleUser.email.toLowerCase() },
      update: {
        googleId: googleUser.sub,
        name: googleUser.name,
        avatarUrl: googleUser.picture,
      },
      create: {
        email: googleUser.email.toLowerCase(),
        googleId: googleUser.sub,
        name: googleUser.name,
        avatarUrl: googleUser.picture,
        role,
        teacherProfile: {
          create: {
            displayName: googleUser.name,
          },
        },
      },
      include: {
        teacherProfile: true,
      },
    });

    // Ensure teacher profile exists if user existed prior without one
    if (!user.teacherProfile) {
      await this.prisma.teacherProfile.create({
        data: {
          userId: user.id,
          displayName: user.name,
        },
      });
    }

    // 5. Create application session (7 days validity)
    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await this.prisma.authSession.create({
      data: {
        userId: user.id,
        sessionToken,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        expiresAt,
      },
    });

    return { sessionToken, expiresAt, user };
  }

  async revokeSession(sessionToken: string): Promise<void> {
    if (!sessionToken) return;
    try {
      await this.prisma.authSession.deleteMany({
        where: { sessionToken },
      });
    } catch {
      // Ignore if already deleted
    }
  }

  async getMe(userId: string): Promise<AuthMeResponse> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        teacherProfile: true,
        classrooms: {
          where: { status: 'ACTIVE' },
          include: {
            members: {
              where: { status: 'ACTIVE' },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Pengguna tidak ditemukan.');
    }

    return {
      user: {
        id: user.id,
        email: user.email,
        googleId: user.googleId,
        name: user.name,
        avatarUrl: user.avatarUrl,
        role: user.role,
        status: user.status,
        createdAt: user.createdAt.toISOString(),
        updatedAt: user.updatedAt.toISOString(),
      },
      profile: user.teacherProfile
        ? {
            id: user.teacherProfile.id,
            userId: user.teacherProfile.userId,
            displayName: user.teacherProfile.displayName,
            schoolName: user.teacherProfile.schoolName,
            preferences: user.teacherProfile.preferences as Record<string, any>,
            createdAt: user.teacherProfile.createdAt.toISOString(),
            updatedAt: user.teacherProfile.updatedAt.toISOString(),
          }
        : null,
      classrooms: user.classrooms.map((c) => ({
        id: c.id,
        teacherId: c.teacherId,
        name: c.name,
        subject: c.subject,
        grade: c.grade,
        status: c.status,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
        members: c.members.map((m) => ({
          id: m.id,
          classroomId: m.classroomId,
          displayName: m.displayName,
          studentIdentifier: m.studentIdentifier,
          status: m.status,
          createdAt: m.createdAt.toISOString(),
          updatedAt: m.updatedAt.toISOString(),
        })),
      })),
    };
  }

  // Development-only login fallback (Strictly blocked in production)
  async devLogin(
    payload: { role?: UserRole; email?: string; name?: string } | undefined,
    context: SessionContext,
  ): Promise<{ sessionToken: string; expiresAt: Date; data: AuthMeResponse }> {
    if (process.env.NODE_ENV === 'production') {
      throw new UnauthorizedException('Dev login dinonaktifkan di environment produksi.');
    }

    const role = payload?.role || 'TEACHER';
    const email = (
      payload?.email || (role === 'ADMIN' ? 'admin@walikelas.id' : 'guru@sekolah.id')
    ).toLowerCase();
    const name =
      payload?.name || (role === 'ADMIN' ? 'Super Admin WaliKelas' : 'Budi Santoso, S.Pd.');

    const user = await this.prisma.user.upsert({
      where: { email },
      update: { name, role },
      create: {
        email,
        name,
        role,
        googleId: `dev-${Date.now()}`,
        teacherProfile: {
          create: {
            displayName: name,
            schoolName: 'SMP Negeri 1 Pembelajaran',
          },
        },
      },
      include: {
        teacherProfile: true,
      },
    });

    if (!user.teacherProfile) {
      await this.prisma.teacherProfile.create({
        data: {
          userId: user.id,
          displayName: name,
          schoolName: 'SMP Negeri 1 Pembelajaran',
        },
      });
    }

    const sessionToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    await this.prisma.authSession.create({
      data: {
        userId: user.id,
        sessionToken,
        ipAddress: context.ipAddress,
        userAgent: context.userAgent,
        expiresAt,
      },
    });

    const me = await this.getMe(user.id);
    return { sessionToken, expiresAt, data: me };
  }
}

import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    // 1. Extract session token from cookie or Authorization header
    let token = request.cookies?.['wk_session'] || request.signedCookies?.['wk_session'];

    if (!token && request.headers.authorization) {
      const parts = request.headers.authorization.split(' ');
      if (parts.length === 2 && parts[0] === 'Bearer') {
        token = parts[1];
      }
    }

    if (!token) {
      throw new UnauthorizedException('Sesi tidak ditemukan. Silakan masuk dengan Google.');
    }

    // 2. Authoritative lookup in PostgreSQL
    const session = await this.prisma.authSession.findUnique({
      where: { sessionToken: token },
      include: {
        user: {
          include: {
            teacherProfile: true,
          },
        },
      },
    });

    if (!session || session.expiresAt < new Date()) {
      throw new UnauthorizedException('Sesi telah kedaluwarsa. Silakan masuk kembali.');
    }

    if (session.user.status === 'SUSPENDED') {
      throw new UnauthorizedException('Akun Anda telah dinonaktifkan oleh administrator.');
    }

    // 3. Attach user and session to request
    request.user = {
      id: session.user.id,
      email: session.user.email,
      googleId: session.user.googleId,
      name: session.user.name,
      avatarUrl: session.user.avatarUrl,
      role: session.user.role,
      status: session.user.status,
      teacherProfile: session.user.teacherProfile,
      createdAt: session.user.createdAt.toISOString(),
      updatedAt: session.user.updatedAt.toISOString(),
    };
    request.session = session;

    return true;
  }
}

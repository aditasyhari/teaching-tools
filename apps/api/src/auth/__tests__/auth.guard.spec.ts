import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthGuard } from '../guards/auth.guard';
import { UnauthorizedException } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let mockPrisma: any;

  beforeEach(() => {
    mockPrisma = {
      authSession: {
        findUnique: vi.fn(),
      },
    };

    guard = new AuthGuard(mockPrisma);
  });

  const createMockContext = (cookies: Record<string, string> = {}, authHeader?: string) => {
    const request: any = {
      cookies,
      headers: authHeader ? { authorization: authHeader } : {},
    };

    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;
  };

  it('throws UnauthorizedException when no session cookie or header is provided', async () => {
    const context = createMockContext();
    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('throws UnauthorizedException when session is not found in database', async () => {
    const context = createMockContext({ wk_session: 'invalid-token' });
    mockPrisma.authSession.findUnique.mockResolvedValue(null);

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('throws UnauthorizedException when session has expired', async () => {
    const context = createMockContext({ wk_session: 'expired-token' });
    mockPrisma.authSession.findUnique.mockResolvedValue({
      sessionToken: 'expired-token',
      expiresAt: new Date(Date.now() - 1000), // in the past
      user: {
        id: 'user-1',
        email: 'guru@sekolah.id',
        status: 'ACTIVE',
        role: 'TEACHER',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('throws UnauthorizedException when user status is SUSPENDED', async () => {
    const context = createMockContext({ wk_session: 'suspended-user-token' });
    mockPrisma.authSession.findUnique.mockResolvedValue({
      sessionToken: 'suspended-user-token',
      expiresAt: new Date(Date.now() + 100000),
      user: {
        id: 'user-1',
        email: 'guru@sekolah.id',
        status: 'SUSPENDED',
        role: 'TEACHER',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    await expect(guard.canActivate(context)).rejects.toThrow(UnauthorizedException);
  });

  it('attaches user and session to request when session is valid', async () => {
    const context = createMockContext({ wk_session: 'valid-token' });
    const mockUser = {
      id: 'user-1',
      email: 'guru@sekolah.id',
      name: 'Pak Guru',
      googleId: 'g-123',
      avatarUrl: null,
      role: 'TEACHER',
      status: 'ACTIVE',
      teacherProfile: { id: 'tp-1', displayName: 'Pak Guru' },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockPrisma.authSession.findUnique.mockResolvedValue({
      sessionToken: 'valid-token',
      expiresAt: new Date(Date.now() + 100000),
      user: mockUser,
    });

    const canActivate = await guard.canActivate(context);
    expect(canActivate).toBe(true);

    const req = context.switchToHttp().getRequest();
    expect(req.user.id).toBe('user-1');
    expect(req.user.email).toBe('guru@sekolah.id');
    expect(req.session.sessionToken).toBe('valid-token');
  });

  it('authenticates successfully with Bearer header fallback', async () => {
    const context = createMockContext({}, 'Bearer bearer-token-123');
    mockPrisma.authSession.findUnique.mockResolvedValue({
      sessionToken: 'bearer-token-123',
      expiresAt: new Date(Date.now() + 100000),
      user: {
        id: 'user-2',
        email: 'admin@walikelas.id',
        name: 'Admin',
        googleId: 'g-admin',
        role: 'ADMIN',
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    const canActivate = await guard.canActivate(context);
    expect(canActivate).toBe(true);
  });
});

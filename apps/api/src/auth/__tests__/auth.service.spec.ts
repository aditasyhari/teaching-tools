import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AuthService } from '../auth.service';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let authService: AuthService;
  let mockPrisma: any;
  let mockConfig: any;

  beforeEach(() => {
    mockPrisma = {
      user: {
        upsert: vi.fn(),
        findUnique: vi.fn(),
      },
      teacherProfile: {
        create: vi.fn(),
      },
      authSession: {
        create: vi.fn(),
        findUnique: vi.fn(),
        deleteMany: vi.fn(),
      },
    };

    mockConfig = {
      get: vi.fn((key: string) => {
        if (key === 'GOOGLE_CLIENT_ID') return 'mock-client-id';
        if (key === 'GOOGLE_CLIENT_SECRET') return 'mock-client-secret';
        if (key === 'GOOGLE_CALLBACK_URL')
          return 'http://localhost:4006/api/v1/auth/google/callback';
        if (key === 'NEXT_PUBLIC_APP_URL') return 'http://localhost:3006';
        if (key === 'NODE_ENV') return 'development';
        return undefined;
      }),
    };

    authService = new AuthService(mockPrisma, mockConfig);
  });

  describe('generateOAuthState', () => {
    it('generates a 64-character hexadecimal random string', () => {
      const state = authService.generateOAuthState();
      expect(state).toHaveLength(64);
      expect(/^[0-9a-f]+$/.test(state)).toBe(true);
    });
  });

  describe('getGoogleAuthUrl', () => {
    it('constructs correct Google OAuth URL with state', () => {
      const state = 'test-state-123';
      const url = authService.getGoogleAuthUrl(state);

      expect(url).toContain('https://accounts.google.com/o/oauth2/v2/auth');
      expect(url).toContain('client_id=mock-client-id');
      expect(url).toContain('state=test-state-123');
      expect(url).toContain('response_type=code');
      expect(url).toContain('scope=openid+email+profile');
    });
  });

  describe('handleGoogleCallback CSRF check', () => {
    it('rejects with UnauthorizedException when state does not match cookie', async () => {
      await expect(
        authService.handleGoogleCallback('code123', 'state-a', 'state-b', {}),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('devLogin', () => {
    it('successfully creates or finds user and generates session token', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'guru@sekolah.id',
        name: 'Budi Santoso',
        role: 'TEACHER',
        status: 'ACTIVE',
        createdAt: new Date(),
        updatedAt: new Date(),
        teacherProfile: {
          id: 'tp-1',
          userId: 'user-1',
          displayName: 'Budi Santoso',
          schoolName: 'SMP 1',
          preferences: {},
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        classrooms: [],
      };

      mockPrisma.user.upsert.mockResolvedValue(mockUser);
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);
      mockPrisma.authSession.create.mockResolvedValue({ id: 'sess-1' });

      const result = await authService.devLogin(
        { role: 'TEACHER', email: 'guru@sekolah.id' },
        { ipAddress: '127.0.0.1' },
      );

      expect(result.sessionToken).toBeDefined();
      expect(result.sessionToken).toHaveLength(64);
      expect(result.data.user.email).toBe('guru@sekolah.id');
    });

    it('SEC-004: throws UnauthorizedException when NODE_ENV is production or staging', async () => {
      const originalEnv = process.env.NODE_ENV;
      try {
        process.env.NODE_ENV = 'staging';
        await expect(
          authService.devLogin({ role: 'TEACHER' }, { ipAddress: '127.0.0.1' }),
        ).rejects.toThrow(UnauthorizedException);

        process.env.NODE_ENV = 'production';
        await expect(
          authService.devLogin({ role: 'TEACHER' }, { ipAddress: '127.0.0.1' }),
        ).rejects.toThrow(UnauthorizedException);
      } finally {
        process.env.NODE_ENV = originalEnv;
      }
    });

    it('SEC-004: blocks ADMIN role elevation in development when ALLOW_DEV_ADMIN is not set', async () => {
      const originalEnv = process.env.NODE_ENV;
      const originalAllowAdmin = process.env.ALLOW_DEV_ADMIN;
      try {
        process.env.NODE_ENV = 'development';
        delete process.env.ALLOW_DEV_ADMIN;

        await expect(
          authService.devLogin({ role: 'ADMIN' }, { ipAddress: '127.0.0.1' }),
        ).rejects.toThrow(UnauthorizedException);
      } finally {
        process.env.NODE_ENV = originalEnv;
        if (originalAllowAdmin !== undefined) {
          process.env.ALLOW_DEV_ADMIN = originalAllowAdmin;
        }
      }
    });
  });

  describe('revokeSession', () => {
    it('deletes session from database', async () => {
      mockPrisma.authSession.deleteMany.mockResolvedValue({ count: 1 });

      await authService.revokeSession('token-to-revoke');
      expect(mockPrisma.authSession.deleteMany).toHaveBeenCalledWith({
        where: { sessionToken: 'token-to-revoke' },
      });
    });

    it('gracefully handles empty token', async () => {
      await authService.revokeSession('');
      expect(mockPrisma.authSession.deleteMany).not.toHaveBeenCalled();
    });
  });

  describe('getMe', () => {
    it('throws UnauthorizedException if user does not exist', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      await expect(authService.getMe('nonexistent-id')).rejects.toThrow(UnauthorizedException);
    });

    it('returns structured user, profile, and active classrooms', async () => {
      const mockUser = {
        id: 'user-1',
        email: 'guru@sekolah.id',
        googleId: 'g-123',
        name: 'Budi Santoso',
        avatarUrl: 'https://avatar.com/1',
        role: 'TEACHER',
        status: 'ACTIVE',
        createdAt: new Date('2026-01-01'),
        updatedAt: new Date('2026-01-02'),
        teacherProfile: {
          id: 'tp-1',
          userId: 'user-1',
          displayName: 'Budi',
          schoolName: 'SMP 1',
          preferences: {},
          createdAt: new Date('2026-01-01'),
          updatedAt: new Date('2026-01-02'),
        },
        classrooms: [
          {
            id: 'c-1',
            teacherId: 'user-1',
            name: 'Kelas 7A',
            subject: 'IPA',
            grade: '7',
            status: 'ACTIVE',
            createdAt: new Date('2026-01-01'),
            updatedAt: new Date('2026-01-02'),
            members: [],
          },
        ],
      };

      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const res = await authService.getMe('user-1');
      expect(res.user.id).toBe('user-1');
      expect(res.profile?.displayName).toBe('Budi');
      expect(res.classrooms).toHaveLength(1);
      expect(res.classrooms[0].name).toBe('Kelas 7A');
    });
  });

  describe('isAdminEmail', () => {
    it('returns true for emails with domain @walikelas.id', () => {
      expect(authService.isAdminEmail('admin@walikelas.id')).toBe(true);
      expect(authService.isAdminEmail('super.user@walikelas.id')).toBe(true);
    });

    it('returns true for emails specified in ADMIN_EMAILS env variable', () => {
      mockConfig.get.mockImplementation((key: string) => {
        if (key === 'ADMIN_EMAILS') return 'custom.admin@sekolah.id, special@gmail.com ';
        return undefined;
      });

      expect(authService.isAdminEmail('custom.admin@sekolah.id')).toBe(true);
      expect(authService.isAdminEmail('CUSTOM.ADMIN@SEKOLAH.ID')).toBe(true);
      expect(authService.isAdminEmail('special@gmail.com')).toBe(true);
    });

    it('returns false for regular teacher emails not in ADMIN_EMAILS', () => {
      mockConfig.get.mockImplementation((key: string) => {
        if (key === 'ADMIN_EMAILS') return 'admin@walikelas.id';
        return undefined;
      });

      expect(authService.isAdminEmail('guru@sekolah.id')).toBe(false);
      expect(authService.isAdminEmail('user@gmail.com')).toBe(false);
    });

    it('handles empty or undefined emails safely', () => {
      expect(authService.isAdminEmail('')).toBe(false);
      expect(authService.isAdminEmail(null as any)).toBe(false);
    });
  });
});

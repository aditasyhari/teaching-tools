import { describe, it, expect, vi } from 'vitest';
import { RolesGuard } from '../guards/roles.guard';
import { ForbiddenException } from '@nestjs/common';
import type { ExecutionContext } from '@nestjs/common';

describe('RolesGuard', () => {
  let reflector: any;
  let guard: RolesGuard;

  it('allows access when no roles are specified on endpoint', () => {
    reflector = {
      getAllAndOverride: vi.fn().mockReturnValue(undefined),
    };
    guard = new RolesGuard(reflector);

    const context = {
      getHandler: () => {},
      getClass: () => {},
      switchToHttp: () => ({
        getRequest: () => ({ user: { role: 'TEACHER' } }),
      }),
    } as unknown as ExecutionContext;

    expect(guard.canActivate(context)).toBe(true);
  });

  it('allows access when user has the required role', () => {
    reflector = {
      getAllAndOverride: vi.fn().mockReturnValue(['ADMIN']),
    };
    guard = new RolesGuard(reflector);

    const context = {
      getHandler: () => {},
      getClass: () => {},
      switchToHttp: () => ({
        getRequest: () => ({ user: { role: 'ADMIN' } }),
      }),
    } as unknown as ExecutionContext;

    expect(guard.canActivate(context)).toBe(true);
  });

  it('throws ForbiddenException when user lacks required role', () => {
    reflector = {
      getAllAndOverride: vi.fn().mockReturnValue(['ADMIN']),
    };
    guard = new RolesGuard(reflector);

    const context = {
      getHandler: () => {},
      getClass: () => {},
      switchToHttp: () => ({
        getRequest: () => ({ user: { role: 'TEACHER' } }),
      }),
    } as unknown as ExecutionContext;

    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});

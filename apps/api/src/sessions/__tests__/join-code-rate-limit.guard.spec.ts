import { describe, it, expect, beforeEach } from 'vitest';
import { ExecutionContext, HttpStatus, HttpException } from '@nestjs/common';
import { JoinCodeRateLimitGuard } from '../guards/join-code-rate-limit.guard';

describe('JoinCodeRateLimitGuard', () => {
  let guard: JoinCodeRateLimitGuard;

  beforeEach(() => {
    JoinCodeRateLimitGuard.reset();
    guard = new JoinCodeRateLimitGuard();
  });

  const createMockContext = (ip: string): ExecutionContext => {
    const req = {
      ip,
      headers: {},
      socket: { remoteAddress: ip },
    };

    return {
      switchToHttp: () => ({
        getRequest: () => req,
        getResponse: () => ({}),
      }),
    } as unknown as ExecutionContext;
  };

  it('allows requests up to the maximum limit', () => {
    const context = createMockContext('192.168.1.50');

    for (let i = 0; i < 15; i++) {
      expect(guard.canActivate(context)).toBe(true);
    }
  });

  it('throws TOO_MANY_REQUESTS on requests exceeding the limit', () => {
    const context = createMockContext('192.168.1.50');

    for (let i = 0; i < 15; i++) {
      guard.canActivate(context);
    }

    expect(() => guard.canActivate(context)).toThrow(HttpException);

    try {
      guard.canActivate(context);
    } catch (err: any) {
      expect(err.getStatus()).toBe(HttpStatus.TOO_MANY_REQUESTS);
      expect(err.getResponse().message).toContain('Terlalu banyak percobaan');
    }
  });

  it('tracks distinct IP addresses independently', () => {
    const ip1Context = createMockContext('10.0.0.1');
    const ip2Context = createMockContext('10.0.0.2');

    for (let i = 0; i < 15; i++) {
      guard.canActivate(ip1Context);
    }

    expect(() => guard.canActivate(ip1Context)).toThrow(HttpException);
    expect(guard.canActivate(ip2Context)).toBe(true);
  });

  it('SEC-001: check() helper accurately tracks attempts and provides retryAfterSeconds', () => {
    const ip = '172.16.0.5';

    for (let i = 0; i < 15; i++) {
      const res = JoinCodeRateLimitGuard.check(ip);
      expect(res.allowed).toBe(true);
      expect(res.retryAfterSeconds).toBe(0);
    }

    const blocked = JoinCodeRateLimitGuard.check(ip);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
    expect(blocked.retryAfterSeconds).toBeLessThanOrEqual(60);
  });
});


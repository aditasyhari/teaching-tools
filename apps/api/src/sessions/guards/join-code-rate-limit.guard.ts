import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request } from 'express';

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

@Injectable()
export class JoinCodeRateLimitGuard implements CanActivate {
  private static readonly WINDOW_MS = 60 * 1000; // 1 minute
  private static readonly MAX_REQUESTS = 15; // 15 verification attempts per minute per IP

  private static records = new Map<string, RateLimitRecord>();
  private static cleanupTimer: NodeJS.Timeout | null = null;

  constructor() {
    JoinCodeRateLimitGuard.ensureCleanupTimer();
  }

  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest<Request>();
    const clientIp = this.getClientIp(req);

    const now = Date.now();
    const record = JoinCodeRateLimitGuard.records.get(clientIp);

    if (!record || now >= record.resetAt) {
      JoinCodeRateLimitGuard.records.set(clientIp, {
        count: 1,
        resetAt: now + JoinCodeRateLimitGuard.WINDOW_MS,
      });
      return true;
    }

    if (record.count >= JoinCodeRateLimitGuard.MAX_REQUESTS) {
      const retryAfterSeconds = Math.ceil((record.resetAt - now) / 1000);
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: 'Terlalu banyak percobaan verifikasi kode sesi. Coba lagi dalam beberapa saat.',
          retryAfterSeconds,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    record.count += 1;
    return true;
  }

  private getClientIp(req: Request): string {
    const forwarded = req.headers['x-forwarded-for'];
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0].trim();
    }
    return req.ip || req.socket?.remoteAddress || 'unknown-ip';
  }

  private static ensureCleanupTimer(): void {
    if (!JoinCodeRateLimitGuard.cleanupTimer) {
      JoinCodeRateLimitGuard.cleanupTimer = setInterval(() => {
        const now = Date.now();
        for (const [ip, rec] of JoinCodeRateLimitGuard.records.entries()) {
          if (now >= rec.resetAt) {
            JoinCodeRateLimitGuard.records.delete(ip);
          }
        }
      }, JoinCodeRateLimitGuard.WINDOW_MS);

      // Prevent the timer from holding open the Node process
      if (JoinCodeRateLimitGuard.cleanupTimer.unref) {
        JoinCodeRateLimitGuard.cleanupTimer.unref();
      }
    }
  }

  /**
   * For testing purposes: resets in-memory rate limit table
   */
  static reset(): void {
    JoinCodeRateLimitGuard.records.clear();
  }
}


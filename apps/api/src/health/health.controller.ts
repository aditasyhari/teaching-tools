import { Controller, Get, Optional } from '@nestjs/common';
import type { ApiResponse, HealthCheckResponse } from '@walikelas/types';
import { PrismaService } from '../prisma/prisma.service';

@Controller('health')
export class HealthController {
  constructor(@Optional() private readonly prisma?: PrismaService) {}

  @Get()
  async check(): Promise<ApiResponse<HealthCheckResponse>> {
    let dbStatus: 'ok' | 'degraded' = 'ok';

    if (this.prisma) {
      try {
        await this.prisma.$queryRaw`SELECT 1`;
      } catch {
        dbStatus = 'degraded';
      }
    }

    return {
      success: dbStatus === 'ok',
      data: {
        status: dbStatus,
        timestamp: new Date().toISOString(),
        uptime: Math.floor(process.uptime()),
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
      },
      timestamp: new Date().toISOString(),
    };
  }
}

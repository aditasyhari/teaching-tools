import { Controller, Get } from '@nestjs/common';
import type { ApiResponse, HealthCheckResponse } from '@walikelas/types';

@Controller('health')
export class HealthController {
  @Get()
  check(): ApiResponse<HealthCheckResponse> {
    return {
      success: true,
      data: {
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: Math.floor(process.uptime()),
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
      },
      timestamp: new Date().toISOString(),
    };
  }
}

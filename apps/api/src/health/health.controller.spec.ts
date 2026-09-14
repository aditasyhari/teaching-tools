import { describe, it, expect, beforeEach, vi } from 'vitest';
import { HealthController } from './health.controller';
import type { PrismaService } from '../prisma/prisma.service';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(() => {
    controller = new HealthController();
  });

  it('should return health status ok without prisma', async () => {
    const response = await controller.check();
    expect(response.success).toBe(true);
    expect(response.data?.status).toBe('ok');
    expect(response.data?.version).toBe('1.0.0');
    expect(typeof response.data?.uptime).toBe('number');
  });

  it('should return health status ok when database ping succeeds', async () => {
    const mockPrisma = {
      $queryRaw: vi.fn().mockResolvedValue([{ 1: 1 }]),
    } as unknown as PrismaService;

    const dbController = new HealthController(mockPrisma);
    const response = await dbController.check();

    expect(response.success).toBe(true);
    expect(response.data?.status).toBe('ok');
    expect(mockPrisma.$queryRaw).toHaveBeenCalled();
  });

  it('should return status degraded when database ping fails', async () => {
    const mockPrisma = {
      $queryRaw: vi.fn().mockRejectedValue(new Error('DB connection refused')),
    } as unknown as PrismaService;

    const dbController = new HealthController(mockPrisma);
    const response = await dbController.check();

    expect(response.success).toBe(false);
    expect(response.data?.status).toBe('degraded');
  });
});

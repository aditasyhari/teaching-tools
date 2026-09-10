import { describe, it, expect, beforeEach } from 'vitest';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;

  beforeEach(() => {
    controller = new HealthController();
  });

  it('should return health status ok', () => {
    const response = controller.check();
    expect(response.success).toBe(true);
    expect(response.data?.status).toBe('ok');
    expect(response.data?.version).toBe('1.0.0');
    expect(typeof response.data?.uptime).toBe('number');
  });
});

import type { HealthCheckResponse } from '@walikelas/types';
import type { ApiClient } from './client.js';

export async function fetchHealth(client: ApiClient): Promise<HealthCheckResponse> {
  return client.get<HealthCheckResponse>('/health');
}

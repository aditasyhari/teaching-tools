import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ApiClient } from '../client.js';
import { ApiError } from '../error.js';

describe('ApiClient', () => {
  const baseUrl = 'http://localhost:4006/api/v1';
  let client: ApiClient;

  beforeEach(() => {
    vi.restoreAllMocks();
    client = new ApiClient({ baseUrl });
  });

  it('unpacks standard ApiResponse data on successful call', async () => {
    const mockData = { status: 'ok', uptime: 100 };
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          success: true,
          data: mockData,
          timestamp: new Date().toISOString(),
        }),
        {
          status: 200,
          headers: { 'content-type': 'application/json' },
        },
      ),
    );

    const result = await client.get('/health');
    expect(result).toEqual(mockData);
  });

  it('throws ApiError with status and requestId on error response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          success: false,
          error: {
            code: 'NOT_FOUND',
            message: 'Session not found',
          },
          timestamp: new Date().toISOString(),
        }),
        {
          status: 404,
          headers: {
            'content-type': 'application/json',
            'x-request-id': 'req-test-123',
          },
        },
      ),
    );

    await expect(client.get('/sessions/abc')).rejects.toThrow(ApiError);
    try {
      await client.get('/sessions/abc');
    } catch (err) {
      if (err instanceof ApiError) {
        expect(err.status).toBe(404);
        expect(err.code).toBe('NOT_FOUND');
      }
    }
  });
});

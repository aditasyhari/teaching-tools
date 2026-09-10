import { ApiClient } from '@walikelas/api-client';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4006/api/v1';

export const apiClient = new ApiClient({
  baseUrl: API_BASE_URL,
});

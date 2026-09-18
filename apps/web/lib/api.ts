import { ApiClient } from '@walikelas/api-client';

export function getApiBaseUrl(): string {
  // If explicitly configured with a non-localhost URL in env, use it
  if (process.env.NEXT_PUBLIC_API_URL && !process.env.NEXT_PUBLIC_API_URL.includes('localhost')) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  // In the browser, automatically derive the API URL from current origin
  if (
    typeof window !== 'undefined' &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1'
  ) {
    return `${window.location.origin}/api/v1`;
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4006/api/v1';
}

export const apiClient = new ApiClient({
  baseUrl: getApiBaseUrl(),
});

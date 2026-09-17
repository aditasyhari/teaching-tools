import type { ApiResponse } from '@walikelas/types';
import { ApiError } from './error.js';

export interface ApiClientOptions {
  baseUrl: string;
  getHeaders?: () => Record<string, string> | Promise<Record<string, string>>;
  credentials?: RequestCredentials;
}

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

export class ApiClient {
  private readonly baseUrl: string;
  private readonly getHeaders?: () => Record<string, string> | Promise<Record<string, string>>;
  private readonly credentials?: RequestCredentials;

  constructor(options: ApiClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, '');
    this.getHeaders = options.getHeaders;
    this.credentials = options.credentials ?? 'include';
  }

  private buildUrl(
    path: string,
    params?: Record<string, string | number | boolean | undefined>,
  ): string {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const url = new URL(`${this.baseUrl}${cleanPath}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return url.toString();
  }

  async request<T>(path: string, options: RequestOptions = {}): Promise<T> {
    const { params, headers: customHeaders, ...fetchOptions } = options;
    const url = this.buildUrl(path, params);

    const defaultHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };

    const authHeaders = this.getHeaders ? await this.getHeaders() : {};

    const mergedHeaders = {
      ...defaultHeaders,
      ...authHeaders,
      ...(customHeaders as Record<string, string>),
    };

    const timeoutMs = 4000;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    let response: Response;
    try {
      response = await fetch(url, {
        credentials: fetchOptions.credentials || this.credentials,
        signal: fetchOptions.signal || controller.signal,
        ...fetchOptions,
        headers: mergedHeaders,
      });
    } finally {
      clearTimeout(timeoutId);
    }

    const requestId = response.headers.get('x-request-id') || undefined;

    let body: unknown;
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      body = await response.json();
    } else {
      body = await response.text();
    }

    if (!response.ok) {
      if (body && typeof body === 'object' && 'error' in body) {
        const apiError = (body as ApiResponse).error;
        if (apiError) {
          throw ApiError.fromPayload(apiError, response.status, requestId);
        }
      }

      const errorMessage =
        body && typeof body === 'object' && 'message' in body
          ? String((body as { message: unknown }).message)
          : response.statusText || 'An unexpected error occurred';

      throw new ApiError(errorMessage, response.status, 'HTTP_ERROR', body, requestId);
    }

    // Unpack standard ApiResponse envelope if present
    if (body && typeof body === 'object' && 'data' in body && 'success' in body) {
      return (body as ApiResponse<T>).data as T;
    }

    return body as T;
  }

  get<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: 'GET' });
  }

  post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  put<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, {
      ...options,
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  delete<T>(path: string, options?: RequestOptions): Promise<T> {
    return this.request<T>(path, { ...options, method: 'DELETE' });
  }
}

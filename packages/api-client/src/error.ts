import type { ApiErrorPayload } from '@walikelas/types';

export class ApiError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details?: unknown;
  public readonly requestId?: string;

  constructor(
    message: string,
    status: number,
    code = 'API_ERROR',
    details?: unknown,
    requestId?: string,
  ) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.code = code;
    this.details = details;
    this.requestId = requestId;
  }

  static fromPayload(payload: ApiErrorPayload, status: number, requestId?: string): ApiError {
    return new ApiError(payload.message, status, payload.code, payload.details, requestId);
  }
}

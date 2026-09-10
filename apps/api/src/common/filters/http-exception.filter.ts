import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { REQUEST_ID_HEADER } from '../middleware/request-id.middleware';
import type { ApiResponse } from '@walikelas/types';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const requestId = (request.headers[REQUEST_ID_HEADER] as string) || undefined;
    const isHttpException = exception instanceof HttpException;
    const status = isHttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;

    let errorCode = 'INTERNAL_SERVER_ERROR';
    let errorMessage = 'Terjadi kesalahan pada server';
    let details: unknown = undefined;

    if (isHttpException) {
      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === 'string') {
        errorMessage = exceptionResponse;
        errorCode = exception.name || 'HTTP_EXCEPTION';
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const resObj = exceptionResponse as Record<string, unknown>;
        errorMessage = (resObj.message as string) || exception.message;
        errorCode = (resObj.error as string) || exception.name || 'HTTP_EXCEPTION';
        details = resObj.message instanceof Array ? resObj.message : undefined;
      }
    } else {
      this.logger.error(
        `Unhandled exception on ${request.method} ${request.url}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    }

    const errorPayload: ApiResponse = {
      success: false,
      error: {
        code: errorCode,
        message: Array.isArray(details) ? details.join(', ') : errorMessage,
        details,
      },
      requestId,
      timestamp: new Date().toISOString(),
    };

    response.status(status).json(errorPayload);
  }
}

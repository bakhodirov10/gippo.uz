import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  constructor(private readonly httpAdapterHost: HttpAdapterHost) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;
    const ctx = host.switchToHttp();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    let message = 'Internal server error';
    let errorResponse: any = 'InternalServerError';

    if (exception instanceof HttpException) {
      const res = exception.getResponse();
      if (typeof res === 'string') {
        message = res;
        errorResponse = exception.name;
      } else if (typeof res === 'object' && res !== null) {
        message = (res as any).message || exception.message;
        errorResponse = (res as any).error || exception.name;
        if (Array.isArray(message)) {
          message = message.join(', ');
        }
      }
    } else if (exception instanceof Error) {
      this.logger.error(`Unhandled Exception: ${exception.message}`, exception.stack);
      if (process.env.NODE_ENV !== 'production') {
        message = exception.message;
      }
    }

    const responseBody = {
      success: false,
      data: null,
      message,
      error: errorResponse,
      code: httpStatus,
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}

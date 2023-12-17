import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Request } from 'express';
import { Logger } from 'winston';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly httpAdapterHost: HttpAdapterHost;
  private readonly logger: Logger;

  constructor(httpAdapterHost: HttpAdapterHost, logger: Logger) {
    this.httpAdapterHost = httpAdapterHost;
    this.logger = logger;
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();

    let statusCode: HttpStatus;
    let message: string;
    let type: string;
    const path: string = request.path;
    const location: string = `${request.method} ${path}`;

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      message = exception.message;
      type = exception.name;
    } else {
      statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Something went wrong';
      type = 'Internal Server Error';
    }

    this.logger.error(message, { path, location });

    const responseBody = {
      errors: [
        {
          type,
          message,
          path,
          location,
        },
      ],
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, statusCode);
  }
}

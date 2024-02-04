import {
  Inject,
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { Request } from 'express';
import { LoggerToken } from '../constants';
import { ILogger } from '../interfaces';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  public constructor(
    @Inject(LoggerToken) private readonly logger: ILogger,
    private readonly httpAdapterHost: HttpAdapterHost,
  ) {}

  public catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();

    let statusCode: HttpStatus;
    let message: string;
    let type: string;
    const path: string = request.path;
    const location: string = `${request.method} ${path}`;
    const result: null = null;

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
      statusCode,
      result,
      success: false,
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

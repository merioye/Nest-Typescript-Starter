import {
  Inject,
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { CONFIG, ENVIRONMENT, LoggerToken } from '../constants';
import { ILogger } from '../interfaces';
import { CustomError, RequestValidationError } from '../errors';
import { LoggerErrorMetadata } from '../types';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  public constructor(
    @Inject(LoggerToken) private readonly logger: ILogger,
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly configService: ConfigService,
  ) {}

  public catch(exception: HttpException, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();

    const isProduction =
      this.configService.get<ENVIRONMENT>(CONFIG.NODE_ENV) === ENVIRONMENT.PROD;

    const errorId = uuidv4();
    const statusCode =
      exception?.getStatus() || HttpStatus.INTERNAL_SERVER_ERROR;
    const message =
      exception instanceof CustomError || !isProduction
        ? exception?.message || 'Internal Server Exception'
        : 'Internal Server Exception';
    const stack = exception?.stack;
    const path = request.path;
    const method = request.method;
    const result: null = null;

    const metadata: LoggerErrorMetadata = {
      id: errorId,
      stack,
      statusCode,
      path,
      method,
    };
    if (exception instanceof RequestValidationError) {
      metadata.errors = exception?.errors;
    }

    this.logger.error(exception?.message, metadata);

    const responseBody = {
      statusCode,
      result,
      message,
      success: false,
      errorInfo: {
        ref: errorId,
        type: exception?.name || 'InternalServerException',
        path,
        method,
      },
      errors:
        exception instanceof RequestValidationError
          ? exception?.errors
          : [
              {
                message,
                field: '',
                location: 'server',
                stack: isProduction ? null : stack,
              },
            ],
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, statusCode);
  }
}

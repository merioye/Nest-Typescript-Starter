import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Inject,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost } from '@nestjs/core';
import { Request } from 'express';
import { CustomError, RequestValidationError } from '@/common/errors';
import { ILogger, LoggerToken } from '@/modules/common/logger';
import { v4 as uuidv4 } from 'uuid';
import { LoggerErrorMetadata } from '@/types';
import { CONFIG, ENVIRONMENT } from '@/constants';

/**
 * This is a custom exception filter that catches all exceptions and returns
 * an error response. If the exception is an HttpException, the
 * status code is set to the one returned by the exception. Otherwise, the
 * status code is set to 500.
 *
 * If the exception has a message, it is used in the error response.
 * Otherwise, the message is set to "Internal Server Exception". If the
 * application is not in production mode, the stack trace is included in
 * the error response.
 *
 * The error response contains the following fields:
 * - `id`: A UUID identifying the error
 * - `stack`: The stack trace if the application is not in production
 *   mode, or null otherwise
 * - `statusCode`: The HTTP status code of the error
 * - `path`: The URL path of the request that caused the error
 * - `method`: The HTTP method of the request that caused the error
 * - `result`: Null
 * - `message`: The message of the exception, or "Internal Server Exception" if
 *   the exception has no message
 * - `success`: False
 * - `errorInfo`: An object containing information about the error
 *   - `ref`: A UUID identifying the error
 *   - `type`: The type of the error
 *   - `path` and `method`: The URL path and HTTP method of the request that
 *     caused the error, respectively
 * - `errors`: An array of error objects, each containing the following fields:
 *   - `message`: The error message
 *   - `field`: The field name that caused the error, or an empty string
 *   - `location`: The location of the error, or "server"
 *   - `stack`: The stack trace if the application is not in production
 *     mode, or null otherwise
 *
 * @class AllExceptionsFilter
 * @implements {ExceptionFilter}
 *
 * @method catch(exception: Error, host: ArgumentsHost): void - The method that is called when an exception is thrown
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  /**
   * An array of exceptions that have a getStatus method
   */
  private readonly withGetStatusExceptions = [
    CustomError,
    HttpException,
    RequestValidationError,
  ];
  /**
   * An array of exceptions that have a message property
   */
  private readonly withMessageExceptions = [
    CustomError,
    RequestValidationError,
  ];

  /**
   * Creates a new BadRequestError instance.
   *
   * @constructor
   * @param {ILogger} logger - The logger to be used to log errors.
   * @param {HttpAdapterHost} httpAdapterHost - The HttpAdapterHost to be used to
   *   get the http adapter.
   * @param {ConfigService} configService - The ConfigService to be used to get
   *   the configuration values.
   */
  public constructor(
    @Inject(LoggerToken) private readonly logger: ILogger,
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly configService: ConfigService
  ) {}

  /**
   * Handles any unhandled exceptions in the application and returns an error
   * response.
   * @param {Error} exception - The thrown exception to be handled
   * @param {ArgumentsHost} host - The ArgumentsHost to be used to get the underline request
   *   and response object
   * @returns {void}
   */
  public catch(exception: Error, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();

    const isProduction =
      this.configService.get<ENVIRONMENT>(CONFIG.NODE_ENV) === ENVIRONMENT.PROD;

    const errorId = uuidv4();

    const hasGetStatus = this.withGetStatusExceptions.some(
      (Exception) => exception instanceof Exception
    );
    const statusCode = hasGetStatus
      ? (exception as HttpException).getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const hasMessage = this.withMessageExceptions.some(
      (Exception) => exception instanceof Exception
    );
    const message =
      hasMessage || !isProduction
        ? exception?.message || 'Internal Server Exception'
        : 'Internal Server Exception';

    const stack = exception?.stack;
    const path = request.path;
    const method = request.method;
    const result: null = null;

    const metadata: LoggerErrorMetadata = {
      id: errorId,
      stack: stack || null,
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

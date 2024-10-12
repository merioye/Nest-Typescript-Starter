import { ArgumentsHost, Catch, ExceptionFilter, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpAdapterHost } from '@nestjs/core';
import { Request } from 'express';
import { RequestValidationError } from '@/common/errors';
import { CONFIG, ENVIRONMENT } from '@/enums';
import { ILogger, LoggerToken } from '@/modules/common/logger';
import {
  ITranslatorService,
  TranslatorServiceToken,
} from '@/modules/common/translator';
import { v4 as uuidv4 } from 'uuid';
import { LoggerErrorMetadata } from '@/types';
import { ExceptionHandlingStrategyFactory } from './factories';

/**
 * Global exception filter that catches all unhandled exceptions in the application.
 *
 * @class AllExceptionsFilter
 * @implements {ExceptionFilter}
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  /**
   * @constructor
   * @param logger - Service for logging errors.
   * @param httpAdapterHost - Provides access to the underlying HTTP server.
   * @param configService - Provides access to application configuration.
   * @param exceptionHandlingStrategyFactory - Factory for creating exception handling strategies.
   */
  public constructor(
    @Inject(LoggerToken) private readonly logger: ILogger,
    private readonly _httpAdapterHost: HttpAdapterHost,
    private readonly _configService: ConfigService,
    @Inject(TranslatorServiceToken)
    private readonly _translatorService: ITranslatorService,
    private readonly _exceptionHandlingStrategyFactory: ExceptionHandlingStrategyFactory
  ) {}

  /**
   * Catches and handles all unhandled exceptions in the application.
   *
   * @param exception - The unhandled exception.
   * @param host - Provides methods for accessing the underlying platform-specific request/response objects.
   */
  public catch(exception: Error, host: ArgumentsHost): void {
    const { httpAdapter } = this._httpAdapterHost;
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const errorId = uuidv4();
    const isProduction =
      this._configService.get<ENVIRONMENT>(CONFIG.NODE_ENV) ===
      ENVIRONMENT.PROD;

    const strategy =
      this._exceptionHandlingStrategyFactory.createStrategy(exception);
    const responseBody = strategy.handleException(
      exception,
      request,
      errorId,
      isProduction
    );

    const metadata: LoggerErrorMetadata = {
      id: errorId,
      stack: exception?.stack || null,
      statusCode: responseBody.statusCode,
      path: request.path,
      method: request.method,
    };

    if (exception instanceof RequestValidationError) {
      metadata.errors = exception?.errors.map((error) => ({
        ...error,
        message: this._translatorService.t(error.message, 'en'),
      }));
    }

    const message = this._translatorService.t(exception.message, 'en');
    this.logger.error(message, metadata);

    httpAdapter.reply(ctx.getResponse(), responseBody, responseBody.statusCode);
  }
}

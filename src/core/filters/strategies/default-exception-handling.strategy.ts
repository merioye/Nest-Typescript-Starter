import { HttpStatus, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { ExceptionResponseBody } from '@/types';
import { BaseExceptionHandlingStrategy } from './base-exception-handling.strategy';

/**
 * Handles all other types of errors.
 *
 * @class DefaultExceptionHandlingStrategy
 * @extends BaseExceptionHandlingStrategy
 */
@Injectable()
export class DefaultExceptionHandlingStrategy extends BaseExceptionHandlingStrategy {
  /**
   * @inheritdoc
   */
  public handleException(
    error: Error,
    request: Request,
    errorId: string,
    isProduction: boolean
  ): ExceptionResponseBody {
    const message =
      isProduction || !error.message
        ? this.translatorService.t('common.error.Internal_Server')
        : this.translatorService.t(error.message);

    const response = this.getBaseExceptionResponse(
      error,
      request,
      errorId,
      HttpStatus.INTERNAL_SERVER_ERROR,
      message
    );
    if (!isProduction && response.errors[0]) {
      response.errors[0].stack = error.stack || null;
    }
    return response;
  }
}

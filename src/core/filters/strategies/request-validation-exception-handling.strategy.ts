import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { RequestValidationError } from '@/common/errors';

import { ExceptionResponseBody } from '@/types';

import { BaseExceptionHandlingStrategy } from './base-exception-handling.strategy';

/**
 * Handles RequestValidationError instances.
 *
 * @class RequestValidationExceptionHandlingStrategy
 * @extends BaseExceptionHandlingStrategy
 */
@Injectable()
export class RequestValidationExceptionHandlingStrategy extends BaseExceptionHandlingStrategy {
  /**
   * @inheritdoc
   */
  public handleException(
    error: RequestValidationError,
    request: Request,
    errorId: string
  ): ExceptionResponseBody {
    const response = this.getBaseExceptionResponse(
      error,
      request,
      errorId,
      error.getStatus(),
      this.translatorService.t(error.message)
    );
    response.errors = error.errors.map((error) => {
      return {
        ...error,
        message: this.translatorService.t(error.message),
      };
    });
    return response;
  }
}

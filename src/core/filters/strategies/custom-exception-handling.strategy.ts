import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { CustomError } from '@/common/errors';

import { ExceptionResponseBody } from '@/types';

import { BaseExceptionHandlingStrategy } from './base-exception-handling.strategy';

/**
 * Handles CustomError instances.
 *
 * @class CustomErrorHandlingStrategy
 * @extends BaseExceptionHandlingStrategy
 */
@Injectable()
export class CustomExceptionHandlingStrategy extends BaseExceptionHandlingStrategy {
  /**
   * @inheritdoc
   */
  public handleException(
    error: CustomError,
    request: Request,
    errorId: string
  ): ExceptionResponseBody {
    return this.getBaseExceptionResponse(
      error,
      request,
      errorId,
      error.getStatus(),
      this.translatorService.t(error.message)
    );
  }
}

import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import { ITranslatorService } from '@/modules/common/translator';
import { ExceptionResponseBody } from '@/types';
import { IExceptionHandlingStrategy } from '../interfaces';

/**
 * Provides a base implementation for exception handling strategies.
 *
 * @class BaseExceptionHandlingStrategy
 * @implements {IExceptionHandlingStrategy}
 */
@Injectable()
export abstract class BaseExceptionHandlingStrategy
  implements IExceptionHandlingStrategy
{
  /**
   * @constructor
   * @param translatorService - Service for translating error messages.
   */
  public constructor(
    protected readonly translatorService: ITranslatorService
  ) {}

  public abstract handleException(
    error: Error,
    request: Request,
    errorId: string,
    isProduction?: boolean
  ): ExceptionResponseBody;

  /**
   * Generates a base error response.
   *
   * @param error - The error that occurred.
   * @param request - The incoming request.
   * @param errorId - A unique identifier for this error occurrence.
   * @param statusCode - The HTTP status code for the response.
   * @param message - The error message.
   * @returns A base error response body.
   */
  protected getBaseExceptionResponse(
    error: Error,
    request: Request,
    errorId: string,
    statusCode: number,
    message: string
  ): ExceptionResponseBody {
    return {
      statusCode,
      message,
      success: false,
      errorInfo: {
        ref: errorId,
        type: error.constructor.name,
        path: request.path,
        method: request.method,
      },
      errors: [
        {
          message,
          field: '',
          location: 'server',
          stack: null,
        },
      ],
    };
  }
}

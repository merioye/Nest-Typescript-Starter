import { Inject, Injectable } from '@nestjs/common';
import { CustomError, RequestValidationError } from '@/common/errors';
import {
  ITranslatorService,
  TranslatorServiceToken,
} from '@/modules/common/translator';

import { IExceptionHandlingStrategy } from '../interfaces';
import {
  CustomExceptionHandlingStrategy,
  DefaultExceptionHandlingStrategy,
  RequestValidationExceptionHandlingStrategy,
} from '../strategies';

/**
 * Factory for creating appropriate error handling strategies.
 *
 * @class ExceptionHandlingStrategyFactory
 */
@Injectable()
export class ExceptionHandlingStrategyFactory {
  /**
   * @constructor
   * @param translatorService - Service for translating error messages.
   */
  public constructor(
    @Inject(TranslatorServiceToken)
    private readonly _translatorService: ITranslatorService
  ) {}

  /**
   * Creates an appropriate exception handling strategy based on the type of exception.
   *
   * @param error - The error that occurred.
   * @returns An appropriate error handling strategy.
   */
  public createStrategy(error: Error): IExceptionHandlingStrategy {
    if (error instanceof CustomError) {
      return new CustomExceptionHandlingStrategy(this._translatorService);
    }
    if (error instanceof RequestValidationError) {
      return new RequestValidationExceptionHandlingStrategy(
        this._translatorService
      );
    }
    return new DefaultExceptionHandlingStrategy(this._translatorService);
  }
}

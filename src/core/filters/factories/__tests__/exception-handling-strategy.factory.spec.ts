import { Request } from 'express';
import { CustomError, RequestValidationError } from '@/common/errors';
import {
  CustomExceptionHandlingStrategy,
  DefaultExceptionHandlingStrategy,
  RequestValidationExceptionHandlingStrategy,
} from '@/core/filters/strategies';
import { ITranslatorService } from '@/modules/common/translator';

import { ExceptionHandlingStrategyFactory } from '../exception-handling-strategy.factory';

describe('ExceptionHandlingStrategyFactory', () => {
  let factory: ExceptionHandlingStrategyFactory;
  let mockTranslatorService: jest.Mocked<ITranslatorService>;

  beforeEach(() => {
    mockTranslatorService = {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      t: jest.fn().mockImplementation((key) => key),
    };

    factory = new ExceptionHandlingStrategyFactory(mockTranslatorService);
  });

  describe('createStrategy', () => {
    it('should create CustomExceptionHandlingStrategy for CustomError', () => {
      const error = new CustomError('Test error', 'CustomError', 400);
      const strategy = factory.createStrategy(error);

      expect(strategy).toBeInstanceOf(CustomExceptionHandlingStrategy);
    });

    it('should create RequestValidationExceptionHandlingStrategy for RequestValidationError', () => {
      const error = new RequestValidationError([
        {
          message: 'Invalid field',
          field: 'test',
          location: 'body',
          stack: null,
        },
      ]);
      const strategy = factory.createStrategy(error);

      expect(strategy).toBeInstanceOf(
        RequestValidationExceptionHandlingStrategy
      );
    });

    it('should create DefaultExceptionHandlingStrategy for standard Error', () => {
      const error = new Error('Standard error');
      const strategy = factory.createStrategy(error);

      expect(strategy).toBeInstanceOf(DefaultExceptionHandlingStrategy);
    });

    it('should create DefaultExceptionHandlingStrategy for null/undefined error', () => {
      // @ts-expect-error Testing with null
      const strategy = factory.createStrategy(null);
      expect(strategy).toBeInstanceOf(DefaultExceptionHandlingStrategy);
    });

    it('should pass translator service to created strategies', () => {
      const error = new CustomError('Test error', 'CustomError', 400);
      const strategy = factory.createStrategy(
        error
      ) as CustomExceptionHandlingStrategy;

      // Create a test request to verify translator service is working
      const request = {
        path: '/test',
        method: 'GET',
      } as Request;

      strategy.handleException(error, request, 'test-id');
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(mockTranslatorService.t).toHaveBeenCalledWith('Test error');
    });
  });

  describe('dependency injection', () => {
    it('should be defined with TranslatorService', () => {
      expect(factory).toBeDefined();
      expect(factory['_translatorService']).toBeDefined();
      expect(factory['_translatorService']).toBe(mockTranslatorService);
    });
  });
});

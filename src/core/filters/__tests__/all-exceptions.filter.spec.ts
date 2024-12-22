// import { ArgumentsHost } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import { HttpAdapterHost } from '@nestjs/core';
// import { Test, TestingModule } from '@nestjs/testing';
// import { Request, Response } from 'express';
// import { CustomError, RequestValidationError } from '@/common/errors';
// import { ILogger, LoggerToken } from '@/modules/common/logger';
// import {
//   ITranslatorService,
//   TranslatorServiceToken,
// } from '@/modules/common/translator';

// import { ExceptionResponseBody } from '@/types';
// import { Environment } from '@/enums';

// import { AllExceptionsFilter } from '../all-exceptions.filter';
// import { ExceptionHandlingStrategyFactory } from '../factories';
// import { IExceptionHandlingStrategy } from '../interfaces';

// jest.mock('uuid', () => ({
//   v4: () => 'test-uuid',
// }));

// describe('AllExceptionsFilter', () => {
//   let module: TestingModule;
//   let filter: AllExceptionsFilter;
//   let mockLogger: jest.Mocked<ILogger>;
//   let mockHttpAdapter: jest.Mocked<{
//     reply: (response: Response, body: ExceptionResponseBody, statusCode: number) => void;
//   }>;
//   let mockConfigService: jest.Mocked<ConfigService>;
//   let mockTranslatorService: jest.Mocked<ITranslatorService>;
//   let mockStrategyFactory: jest.Mocked<ExceptionHandlingStrategyFactory>;
//   let mockArgumentsHost: jest.Mocked<ArgumentsHost>;
//   let mockRequest: Partial<Request>;
//   let mockResponse: Partial<Response>;
//   let mockStrategy: jest.Mocked<IExceptionHandlingStrategy>;

//   beforeEach(async () => {
//     mockLogger = {
//       error: jest.fn(),
//     } as jest.Mocked<ILogger>;

//     mockHttpAdapter = {
//       reply: jest.fn(),
//     } as jest.Mocked<{
//       reply: (response: Response, body: ExceptionResponseBody, statusCode: number) => void;
//     }>;

//     mockConfigService = {
//       get: jest.fn(),
//     } as jest.Mocked<ConfigService>;

//     mockTranslatorService = {
//       t: jest.fn().mockImplementation((key: string) => key),
//     } as jest.Mocked<ITranslatorService>;

//     mockStrategy = {
//       handleException: jest.fn(),
//     } as jest.Mocked<IExceptionHandlingStrategy>;

//     mockStrategyFactory = {
//       createStrategy: jest.fn().mockReturnValue(mockStrategy),
//     } as jest.Mocked<ExceptionHandlingStrategyFactory>;

//     mockRequest = {
//       path: '/test',
//       method: 'GET',
//     };

//     mockResponse = {};

//     mockArgumentsHost = {
//       switchToHttp: jest.fn().mockReturnValue({
//         getRequest: jest.fn().mockReturnValue(mockRequest),
//         getResponse: jest.fn().mockReturnValue(mockResponse),
//       }),
//     } as jest.Mocked<ArgumentsHost>;

//     module = await Test.createTestingModule({
//       providers: [
//         AllExceptionsFilter,
//         {
//           provide: LoggerToken,
//           useValue: mockLogger,
//         },
//         {
//           provide: HttpAdapterHost,
//           useValue: { httpAdapter: mockHttpAdapter },
//         },
//         {
//           provide: ConfigService,
//           useValue: mockConfigService,
//         },
//         {
//           provide: TranslatorServiceToken,
//           useValue: mockTranslatorService,
//         },
//         {
//           provide: ExceptionHandlingStrategyFactory,
//           useValue: mockStrategyFactory,
//         },
//       ],
//     }).compile();

//     filter = module.get<AllExceptionsFilter>(AllExceptionsFilter);
//   });

//   afterEach(async () => {
//     await module.close();
//   });

//   describe('catch', () => {
//     const mockResponseBody: ExceptionResponseBody = {
//       statusCode: 400,
//       message: 'Test error',
//       success: false,
//       errorInfo: {
//         ref: 'test-uuid',
//         type: 'Error',
//         path: '/test',
//         method: 'GET',
//       },
//       errors: [
//         {
//           message: 'Test error',
//           field: '',
//           location: 'server',
//           stack: null,
//         },
//       ],
//     };

//     beforeEach(() => {
//       mockStrategy.handleException.mockReturnValue(mockResponseBody);
//     });

//     it('should handle standard errors', () => {
//       const error = new Error('Test error');
//       mockConfigService.get.mockReturnValue(Environment.DEV);

//       filter.catch(error, mockArgumentsHost);

//       expect(mockStrategyFactory.createStrategy).toHaveBeenCalledWith(error);
//       expect(mockStrategy.handleException).toHaveBeenCalledWith(
//         error,
//         mockRequest,
//         'test-uuid',
//         false
//       );
//       expect(mockHttpAdapter.reply).toHaveBeenCalledWith(
//         mockResponse,
//         mockResponseBody,
//         mockResponseBody.statusCode
//       );
//     });

//     it('should handle custom errors', () => {
//       const error = new CustomError('Custom error', 'CustomError', 400);
//       mockConfigService.get.mockReturnValue(Environment.DEV);

//       filter.catch(error, mockArgumentsHost);

//       expect(mockStrategyFactory.createStrategy).toHaveBeenCalledWith(error);
//       expect(mockLogger.error).toHaveBeenCalled();
//       expect(mockHttpAdapter.reply).toHaveBeenCalled();
//     });

//     it('should handle validation errors with proper metadata', () => {
//       const validationError = new RequestValidationError([
//         {
//           message: 'Invalid field',
//           field: 'test',
//           location: 'body',
//           stack: null,
//         },
//       ]);
//       mockConfigService.get.mockReturnValue(Environment.DEV);

//       filter.catch(validationError, mockArgumentsHost);

//       expect(mockLogger.error).toHaveBeenCalled();
//       const loggerCall = mockLogger.error.mock.calls[0];
//       expect(loggerCall[1].errors).toBeDefined();
//       expect(loggerCall[1].errors?.[0].message).toBe('Invalid field');
//     });

//     it('should handle production environment', () => {
//       const error = new Error('Test error');
//       mockConfigService.get.mockReturnValue(Environment.PROD);

//       filter.catch(error, mockArgumentsHost);

//       expect(mockStrategy.handleException).toHaveBeenCalledWith(
//         error,
//         mockRequest,
//         'test-uuid',
//         true
//       );
//     });

//     it('should translate error messages', () => {
//       const error = new Error('error.test.message');
//       mockConfigService.get.mockReturnValue(Environment.DEV);

//       filter.catch(error, mockArgumentsHost);

//       // eslint-disable-next-line @typescript-eslint/unbound-method
//       expect(mockTranslatorService.t).toHaveBeenCalledWith(
//         'error.test.message',
//         'en'
//       );
//     });

//     it('should handle errors without stack traces', () => {
//       const error = new Error('Test error');
//       delete error.stack;
//       mockConfigService.get.mockReturnValue(Environment.DEV);

//       filter.catch(error, mockArgumentsHost);

//       expect(mockLogger.error).toHaveBeenCalled();
//       const loggerCall = mockLogger.error.mock.calls[0];
//       expect(loggerCall[1].stack).toBeNull();
//     });

//     it('should include correct metadata in logger calls', () => {
//       const error = new Error('Test error');
//       mockConfigService.get.mockReturnValue(Environment.DEV);

//       filter.catch(error, mockArgumentsHost);

//       expect(mockLogger.error).toHaveBeenCalled();
//       const loggerCall = mockLogger.error.mock.calls[0];
//       expect(loggerCall[1]).toMatchObject({
//         id: 'test-uuid',
//         statusCode: mockResponseBody.statusCode,
//         path: mockRequest.path,
//         method: mockRequest.method,
//       });
//     });
//   });
// });

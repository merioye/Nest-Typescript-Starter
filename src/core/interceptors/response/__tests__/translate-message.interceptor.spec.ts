import { CallHandler, ExecutionContext } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { ApiResponse } from '@/common/utils';
import {
  ITranslatorService,
  TranslatorServiceToken,
} from '@/modules/common/translator';
import { of } from 'rxjs';

import { TranslateMessageInterceptor } from '../translate-message.interceptor';

describe('TranslateMessageInterceptor', () => {
  let interceptor: TranslateMessageInterceptor;
  let translatorService: ITranslatorService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TranslateMessageInterceptor,
        {
          provide: TranslatorServiceToken,
          useValue: {
            t: jest.fn((message: string) => `Translated: ${message}`),
          },
        },
      ],
    }).compile();

    interceptor = module.get<TranslateMessageInterceptor>(
      TranslateMessageInterceptor
    );
    translatorService = module.get<ITranslatorService>(TranslatorServiceToken);
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should return the original response if response is null', async () => {
    const next: CallHandler = {
      handle: () => of(null),
    };

    const result = await interceptor
      .intercept({} as ExecutionContext, next)
      .toPromise();
    expect(result).toBeNull();
  });

  it('should return the original response if message is undefined', async () => {
    const next: CallHandler = {
      handle: () => of(new ApiResponse({ result: { data: 'test' } })), // No message provided
    };

    const result = await interceptor
      .intercept({} as ExecutionContext, next)
      .toPromise();

    expect(result).toEqual(
      expect.objectContaining({
        message: 'Translated: common.success.Success', // Default message translated
      })
    );
  });

  it('should translate the message if it exists', async () => {
    const next: CallHandler = {
      handle: () =>
        of(
          new ApiResponse({
            result: { data: 'test' },
            message: 'original.message',
          })
        ),
    };

    const result = await interceptor
      .intercept({} as ExecutionContext, next)
      .toPromise();

    expect(result).toEqual(
      expect.objectContaining({
        message: 'Translated: original.message',
      })
    );
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(translatorService.t).toHaveBeenCalledWith('original.message');
  });

  it('should handle cases where the translator service throws an error', async () => {
    jest.spyOn(translatorService, 't').mockImplementation(() => {
      throw new Error('Translation failed');
    });

    const next: CallHandler = {
      handle: () =>
        of(
          new ApiResponse({
            result: { data: 'test' },
            message: 'original.message',
          })
        ),
    };

    const result = await interceptor
      .intercept({} as ExecutionContext, next)
      .toPromise();

    expect(result).toEqual(
      expect.objectContaining({
        message: 'original.message', // Falls back to original message
      })
    );
    // eslint-disable-next-line @typescript-eslint/unbound-method
    expect(translatorService.t).toHaveBeenCalledWith('original.message');
  });

  it('should return a valid ApiResponse structure', async () => {
    const next: CallHandler = {
      handle: () =>
        of(
          new ApiResponse({
            result: { data: 'test' },
            message: 'original.message',
          })
        ),
    };

    const result = await interceptor
      .intercept({} as ExecutionContext, next)
      .toPromise();

    expect(result).toEqual(
      expect.objectContaining({
        result: { data: 'test' },
        message: 'Translated: original.message',
        success: true,
        statusCode: 200,
      })
    );
  });
});

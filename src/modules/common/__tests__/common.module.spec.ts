import { Test, TestingModule } from '@nestjs/testing';
import { CommonAppModule } from '@/modules/common';
import { LoggerModule, LoggerToken } from '@/modules/common/logger';

import { loggerModuleOptions, translatorModuleOptions } from '@/config';

import { TranslatorModule, TranslatorServiceToken } from '../translator';

describe('CommonAppModule', () => {
  let module: TestingModule;

  beforeAll(async () => {
    const mockTranslatorService = {
      t: jest.fn().mockReturnValue('OK'),
    };

    const mockLogger = {
      info: jest.fn(),
    };

    module = await Test.createTestingModule({
      imports: [
        CommonAppModule.forRoot({
          logger: loggerModuleOptions,
          translator: translatorModuleOptions,
        }),
        CommonAppModule,
      ],
    })
      .overrideProvider(TranslatorServiceToken)
      .useValue(mockTranslatorService)
      .overrideProvider(LoggerToken)
      .useValue(mockLogger)
      .compile();
  });

  afterAll(async () => {
    await module.close();
  });

  it('should compile the module', () => {
    expect(module).toBeDefined();
  });

  it('should have CommonAppModule components', () => {
    expect(module.get(LoggerModule)).toBeInstanceOf(LoggerModule);
    expect(module.get(TranslatorModule)).toBeInstanceOf(TranslatorModule);
  });
});

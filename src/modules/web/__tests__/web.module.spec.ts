import { Test, TestingModule } from '@nestjs/testing';
import { CommonAppModule } from '@/modules/common';
import { LoggerToken } from '@/modules/common/logger';
import { TranslatorServiceToken } from '@/modules/common/translator';

import { loggerModuleOptions, translatorModuleOptions } from '@/config';

import { HealthModule } from '../health';
import { WebAppModule } from '../web.module';

describe('WebAppModule', () => {
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
        WebAppModule,
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

  it('should have WebAppModule components', () => {
    expect(module.get(HealthModule)).toBeInstanceOf(HealthModule);
  });
});

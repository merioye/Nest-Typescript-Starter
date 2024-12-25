import { Test, TestingModule } from '@nestjs/testing';
import { CommonAppModule } from '@/modules/common';
import { LoggerToken } from '@/modules/common/logger';
import { I18nModule } from 'nestjs-i18n';

import { loggerModuleOptions, translatorModuleOptions } from '@/config';

import { TranslatorServiceToken } from '../constants';

describe('TranslatorModule', () => {
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

  it('should have TranslatorModule components', () => {
    expect(module.get(I18nModule)).toBeInstanceOf(I18nModule);
  });
});

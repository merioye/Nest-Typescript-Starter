/* eslint-disable @typescript-eslint/unbound-method */
import { Test, TestingModule } from '@nestjs/testing';
import { I18nContext, I18nService } from 'nestjs-i18n';

import {
  TranslationKeyFormatterServiceToken,
  TranslationsFileNameToken,
} from '../../constants';
import { ITranslationKeyFormatterService } from '../../interfaces';
import { NestI18nTranslatorService } from '../nest-i18n-translator.service';

describe('NestI18nTranslatorService', () => {
  let service: NestI18nTranslatorService;
  let i18nService: jest.Mocked<I18nService>;
  let formatterService: jest.Mocked<ITranslationKeyFormatterService>;
  let translationsFileName: string;

  beforeEach(async () => {
    // Mock I18nService
    i18nService = {
      translate: jest.fn(),
    } as unknown as jest.Mocked<I18nService>;

    // Mock formatter service
    formatterService = {
      format: jest.fn(),
    };

    translationsFileName = 'translations.json';

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NestI18nTranslatorService,
        {
          provide: I18nService,
          useValue: i18nService,
        },
        {
          provide: TranslationKeyFormatterServiceToken,
          useValue: formatterService,
        },
        {
          provide: TranslationsFileNameToken,
          useValue: translationsFileName,
        },
      ],
    }).compile();

    service = module.get<NestI18nTranslatorService>(NestI18nTranslatorService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should be defined', () => {
      expect(service).toBeDefined();
    });

    it('should inject all required dependencies', () => {
      expect(service['_i18n']).toBeDefined();
      expect(service['_translationKeyFormatterService']).toBeDefined();
      expect(service['_translationsFileName']).toBeDefined();
    });

    it('should throw error when i18n service is not provided', async () => {
      await expect(
        Test.createTestingModule({
          providers: [
            NestI18nTranslatorService,
            {
              provide: TranslationKeyFormatterServiceToken,
              useValue: formatterService,
            },
            {
              provide: TranslationsFileNameToken,
              useValue: translationsFileName,
            },
          ],
        }).compile()
      ).rejects.toThrow();
    });

    it('should throw error when formatter service is not provided', async () => {
      await expect(
        Test.createTestingModule({
          providers: [
            NestI18nTranslatorService,
            {
              provide: I18nService,
              useValue: i18nService,
            },
            {
              provide: TranslationsFileNameToken,
              useValue: translationsFileName,
            },
          ],
        }).compile()
      ).rejects.toThrow();
    });
  });

  describe('t', () => {
    beforeEach(() => {
      // Reset mocks before each test
      formatterService.format.mockReset();
      i18nService.translate.mockReset();
    });

    it('should properly format and translate a key', () => {
      const key = 'test.key';
      const formattedResult = {
        key: 'formatted.key',
        args: { param: 'value' },
      };
      const expectedTranslation = 'Translated text';

      formatterService.format.mockReturnValue(formattedResult);
      i18nService.translate.mockReturnValue(expectedTranslation);

      const result = service.t(key);

      expect(formatterService.format).toHaveBeenCalledWith(key);
      expect(i18nService.translate).toHaveBeenCalledWith(
        'translations.formatted.key',
        expect.any(Object)
      );
      expect(result).toBe(expectedTranslation);
    });

    it('should handle explicit language parameter', () => {
      const key = 'test.key';
      const lang = 'fr';
      const formattedResult = { key: 'formatted.key', args: {} };

      formatterService.format.mockReturnValue(formattedResult);
      i18nService.translate.mockReturnValue('Translated text');

      service.t(key, lang);

      expect(i18nService.translate).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ lang: 'fr' })
      );
    });

    it('should use I18nContext.current() language when no lang provided', () => {
      const key = 'test.key';
      const formattedResult = { key: 'formatted.key', args: {} };
      const contextLang = 'es';

      // Mock I18nContext.current()
      jest.spyOn(I18nContext, 'current').mockReturnValue({
        lang: contextLang,
      } as I18nContext<unknown>);

      formatterService.format.mockReturnValue(formattedResult);

      service.t(key);

      expect(i18nService.translate).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ lang: contextLang })
      );
    });

    it('should handle empty translations filename', async () => {
      const moduleWithEmptyFileName = await Test.createTestingModule({
        providers: [
          NestI18nTranslatorService,
          {
            provide: I18nService,
            useValue: i18nService,
          },
          {
            provide: TranslationKeyFormatterServiceToken,
            useValue: formatterService,
          },
          {
            provide: TranslationsFileNameToken,
            useValue: '',
          },
        ],
      }).compile();

      const serviceWithEmptyFileName =
        moduleWithEmptyFileName.get<NestI18nTranslatorService>(
          NestI18nTranslatorService
        );

      const key = 'test.key';
      const formattedResult = { key: 'formatted.key', args: {} };

      formatterService.format.mockReturnValue(formattedResult);

      serviceWithEmptyFileName.t(key);

      expect(i18nService.translate).toHaveBeenCalledWith(
        'formatted.key',
        expect.any(Object)
      );
    });

    it('should handle formatter returning empty args', () => {
      const key = 'test.key';
      const formattedResult = { key: 'formatted.key', args: {} };

      formatterService.format.mockReturnValue(formattedResult);

      service.t(key);

      expect(i18nService.translate).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ args: {} })
      );
    });

    it('should handle null I18nContext', () => {
      const key = 'test.key';
      const formattedResult = { key: 'formatted.key', args: {} };

      // Mock I18nContext.current() returning null
      jest
        .spyOn(I18nContext, 'current')
        .mockReturnValue(null as unknown as I18nContext<unknown>);

      formatterService.format.mockReturnValue(formattedResult);

      service.t(key);

      expect(i18nService.translate).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ lang: undefined })
      );
    });

    it('should handle complex translation keys', () => {
      const key = 'nested.very.deep.key';
      const formattedResult = {
        key: 'formatted.nested.key',
        args: { param1: 'value1', param2: 'value2' },
      };

      formatterService.format.mockReturnValue(formattedResult);

      service.t(key);

      expect(i18nService.translate).toHaveBeenCalledWith(
        'translations.formatted.nested.key',
        expect.objectContaining({
          args: { param1: 'value1', param2: 'value2' },
        })
      );
    });
  });
});

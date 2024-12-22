import { join, resolve } from 'path';

import { Config, Environment } from '@/enums';
import { TranslationKeySeparator } from '@/constants';

import {
  configOptions,
  loggerModuleOptions,
  translatorModuleOptions,
  validationPipeOptions,
} from '../options';

describe('Configuration Options', () => {
  describe('configOptions', () => {
    it('should have correct basic configuration', () => {
      expect(configOptions.isGlobal).toBe(true);
      expect(configOptions.envFilePath).toBe(
        join(__dirname, `../../../.env.${process.env[Config.NODE_ENV]}`)
      );
    });

    it('should have proper validation schema', () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const schema = configOptions.validationSchema;
      expect(schema).toBeDefined();

      // Test validation schema
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      const { error: validError } = schema.validate({
        PORT: 5000,
        NODE_ENV: Environment.DEV,
        API_PREFIX: 'api',
        API_DEFAULT_VERSION: '1',
        GRACEFUL_SHUTDOWN_TIMEOUT: 30000,
        LOCALIZATION_KEY: 'lang',
        LOCALIZATION_FALLBACK_LANGUAGE: 'en',
      });
      expect(validError).toBeUndefined();

      // Test invalid values
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-call
      const { error: invalidError } = schema.validate({
        PORT: 'invalid',
        NODE_ENV: 'invalid',
      });
      expect(invalidError).toBeDefined();
    });
  });

  describe('validationPipeOptions', () => {
    it('should have whitelist enabled', () => {
      expect(validationPipeOptions.whitelist).toBe(true);
    });

    it('should have proper error factory', () => {
      const mockErrors = [
        {
          property: 'email',
          constraints: {
            isEmail: 'email must be a valid email',
          },
        },
      ];

      expect(
        () =>
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          validationPipeOptions.exceptionFactory?.(mockErrors)
      ).toThrow();
    });
  });

  describe('loggerModuleOptions', () => {
    it('should have correct configuration', () => {
      expect(loggerModuleOptions.environment).toBe(
        process.env[Config.NODE_ENV]
      );
      expect(loggerModuleOptions.logsDirPath).toBe(
        resolve(process.cwd(), 'logs')
      );
    });
  });

  describe('translatorModuleOptions', () => {
    it('should have correct configuration', () => {
      expect(translatorModuleOptions.fallbackLanguage).toBe(
        process.env[Config.LOCALIZATION_FALLBACK_LANGUAGE]
      );
      expect(translatorModuleOptions.translationKeySeparator).toBe(
        TranslationKeySeparator
      );
      expect(translatorModuleOptions.langExtractionKey).toBe(
        process.env[Config.LOCALIZATION_KEY]
      );
      expect(translatorModuleOptions.translationsFileName).toBe(
        'translations.json'
      );
    });

    it('should set correct translations path based on environment', () => {
      expect(translatorModuleOptions.translationsDirPath).toBe(
        resolve(process.cwd(), 'src/translations')
      );
    });
  });
});

import { DynamicModule } from '@nestjs/common';
import {
  AcceptLanguageResolver,
  CookieResolver,
  HeaderResolver,
  I18nModule,
  QueryResolver,
} from 'nestjs-i18n';
import { TranslatorModuleOptions } from '@/types';
import { TranslationsFileNameToken, TranslatorServiceToken } from './constants';
import { NestI18nTranslatorService } from './services';

/**
 * Global NestJS module for translation
 * This module provides the global Translator instance
 * and configures the nestjs-i18n module for the application
 *
 * @module TranslatorModule
 */
export class TranslatorModule {
  /**
   * Configures the TranslatorModule for the application.
   *
   * @static
   * @param {TranslatorModuleOptions} options - The options for the TranslatorModule.
   * @returns {DynamicModule} - The DynamicModule for the TranslatorModule.
   */
  public static forRoot({
    fallbackLanguage,
    translationsDirPath,
    translationsFileName,
    langExtractionKey,
  }: TranslatorModuleOptions): DynamicModule {
    return {
      global: true,
      module: TranslatorModule,
      imports: [
        I18nModule.forRoot({
          fallbackLanguage,
          loaderOptions: {
            path: translationsDirPath,
            watch: true,
          },
          resolvers: [
            new QueryResolver([langExtractionKey]),
            new HeaderResolver([langExtractionKey]),
            new CookieResolver([langExtractionKey]),
            AcceptLanguageResolver,
          ],
        }),
      ],
      providers: [
        {
          provide: TranslationsFileNameToken,
          useValue: translationsFileName,
        },
        {
          provide: TranslatorServiceToken,
          useClass: NestI18nTranslatorService,
        },
      ],
      exports: [TranslatorServiceToken],
    };
  }
}

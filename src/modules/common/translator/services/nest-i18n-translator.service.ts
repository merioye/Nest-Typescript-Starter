import { Inject, Injectable } from '@nestjs/common';
import { I18nContext, I18nService } from 'nestjs-i18n';
import { TranslationsFileNameToken } from '../constants';
import { ITranslatorService } from '../interfaces';

/**
 * The nestjs-18n implementation responsible for translating API response messages.
 *
 * @class NestI18nTranslatorService
 * @implements {ITranslatorService}
 */
@Injectable()
export class NestI18nTranslatorService implements ITranslatorService {
  /**
   * Creates an instance of NestI18nTranslatorService.
   *
   * @constructor
   * @param {I18nService} i18n - The nestjs i18n service
   * @param {string} translationsFileName - The name of the translations file
   */
  public constructor(
    private readonly i18n: I18nService,
    @Inject(TranslationsFileNameToken)
    private readonly translationsFileName: string
  ) {}

  /**
   * Translates the given key using the provided language.
   *
   * @param {string} key - The key of the translation to retrieve.
   * @param {Record<string, string>} args - An object containing the arguments to replace in the translation.
   * @returns {string} - The translated message.
   */
  public t(key: string, args?: Record<string, string>): string {
    const [fileName] = this.translationsFileName.split('.');
    if (fileName) {
      key = `${fileName}.${key}`; // add file name to key
    }

    return this.i18n.translate(key, {
      lang: I18nContext.current()?.lang,
      args: args,
    });
  }
}

import { Inject, Injectable } from '@nestjs/common';

import { TranslationKeySeparatorToken } from '../constants';
import { ITranslationKeyFormatterService } from '../interfaces';
import { TranslationKeyAndArgs } from '../types';

/**
 * The service responsible for formatting translation keys and optional arguments.
 *
 * @class TranslationKeyFormatterService
 * @implements {ITranslationKeyFormatterService}
 **/
@Injectable()
export class TranslationKeyFormatterService
  implements ITranslationKeyFormatterService
{
  /**
   * @constructor
   * @param _translationKeySeparator - The separator to split the key and args
   */
  public constructor(
    @Inject(TranslationKeySeparatorToken)
    private readonly _translationKeySeparator: string
  ) {}

  /**
   * @inheritdoc
   */
  public format(key: string): TranslationKeyAndArgs {
    const [actualKey, args] = key.split(this._translationKeySeparator);
    return {
      key: actualKey ? actualKey : '',
      args: args ? (JSON.parse(args) as Record<string, string>) : undefined,
    };
  }
}

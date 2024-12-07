import {
  ArgumentMetadata,
  Injectable,
  ParseBoolPipe,
  PipeTransform,
} from '@nestjs/common';
import { RequestValidationError } from '@/common/errors';

import { ErrorFormat } from '@/types';
import { TranslationKeySeparator } from '@/constants';

/**
 * Custom Parse Bool Pipe
 *
 * This pipe extends the built-in ParseBoolPipe and throws a custom validation
 * error if the input value is not a valid boolean.
 *
 * @class CustomParseBoolPipe
 * @extends {ParseBoolPipe}
 * @implements {PipeTransform}
 */
@Injectable()
export class CustomParseBoolPipe
  extends ParseBoolPipe
  implements PipeTransform
{
  /**
   * Transforms the input value to a boolean.
   * If the transformation fails, it throws a RequestValidationError with the
   * corresponding error messages.
   *
   * @param value - The value to be transformed.
   * @param  metadata - The metadata of the input value.
   * @returns The transformed boolean value.
   * @throws {RequestValidationError} - If the transformation fails.
   */
  async transform(
    value: string | boolean,
    metadata: ArgumentMetadata
  ): Promise<boolean> {
    try {
      return await super.transform(value, metadata);
    } catch (err) {
      const { data, type } = metadata;
      const errors: ErrorFormat[] = [
        {
          message: `common.error.invalid_boolean${TranslationKeySeparator}${JSON.stringify(
            {
              field: data,
            }
          )}`,
          field: data || '',
          location: type,
          stack: null,
        },
      ];
      throw new RequestValidationError(errors);
    }
  }
}

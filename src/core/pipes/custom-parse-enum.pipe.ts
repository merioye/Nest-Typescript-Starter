import {
  ArgumentMetadata,
  Injectable,
  ParseEnumPipe,
  ParseEnumPipeOptions,
  PipeTransform,
} from '@nestjs/common';
import { RequestValidationError } from '@/common/errors';

import { ErrorFormat } from '@/types';
import { TranslationKeySeparator } from '@/constants';

/**
 * Custom Parse Enum Pipe
 *
 * This pipe extends the built-in ParseEnumPipe and throws a custom validation
 * error if the input value is not a valid enum value.
 *
 * @class CustomParseEnumPipe
 * @extends {ParseEnumPipe}
 * @implements {PipeTransform}
 */
@Injectable()
export class CustomParseEnumPipe
  extends ParseEnumPipe
  implements PipeTransform
{
  constructor(
    protected readonly enumType: object,
    options?: ParseEnumPipeOptions
  ) {
    super(enumType, options);
  }

  /**
   * Transforms the input value to an enum value.
   * If the transformation fails, it throws a RequestValidationError with the
   * corresponding error messages.
   *
   * @param value - The value to be transformed.
   * @param metadata - The metadata of the input value.
   * @returns The transformed enum value.
   * @throws {RequestValidationError} - If the transformation fails.
   */
  async transform(value: string, metadata: ArgumentMetadata): Promise<string> {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return await super.transform(value, metadata);
    } catch (err) {
      const { data, type } = metadata;
      const allowedValues = Object.values(this.enumType);
      const errors: ErrorFormat[] = [
        {
          message: `common.error.invalid_enum${TranslationKeySeparator}${JSON.stringify(
            {
              field: data,
              allowedValues: allowedValues.join(', '),
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

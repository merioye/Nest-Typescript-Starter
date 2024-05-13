import {
  ArgumentMetadata,
  Injectable,
  ParseUUIDPipe,
  PipeTransform,
} from '@nestjs/common';
import { RequestValidationError } from '@/common/errors';
import { ErrorFormat } from '@/types';

/**
 * Custom Parse UUID Pipe
 *
 * This pipe extends the built-in ParseUUIDPipe and throws a custom validation
 * error if the input value is not a valid uuid.
 *
 * @class CustomParseUUIDPipe
 * @extends {ParseUUIDPipe}
 * @implements {PipeTransform}
 *
 * @method transform(value: string, metadata: ArgumentMetadata): Promise<string> - Transforms the input value to a uuid.
 */
@Injectable()
export class CustomParseUUIDPipe
  extends ParseUUIDPipe
  implements PipeTransform
{
  /**
   * Transforms the input value to a uuid.
   * If the transformation fails, it throws a RequestValidationError with the
   * corresponding error messages.
   *
   * @param {string} value - The value to be transformed.
   * @param {ArgumentMetadata} metadata - The metadata of the input value.
   * @returns {Promise<string>} - The transformed uuid value.
   * @throws {RequestValidationError} - If the transformation fails.
   */
  async transform(value: string, metadata: ArgumentMetadata): Promise<string> {
    try {
      return await super.transform(value, metadata);
    } catch (err) {
      const { data, type } = metadata;
      const errors: ErrorFormat[] = [
        {
          message: `${data} is not a uuid`,
          field: data || '',
          location: type,
          stack: null,
        },
      ];
      throw new RequestValidationError(errors);
    }
  }
}

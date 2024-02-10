import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  ParseBoolPipe,
} from '@nestjs/common';
import { RequestValidationError } from '../errors';
import { ErrorFormat } from '../types';

@Injectable()
export class CustomParseBoolPipe
  extends ParseBoolPipe
  implements PipeTransform
{
  async transform(
    value: string | boolean,
    metadata: ArgumentMetadata,
  ): Promise<boolean> {
    try {
      return await super.transform(value, metadata);
    } catch (err) {
      const { data, type } = metadata;
      const errors: ErrorFormat[] = [
        {
          message: `${data} is not a valid boolean`,
          field: data,
          location: type,
          stack: null,
        },
      ];
      throw new RequestValidationError(errors);
    }
  }
}

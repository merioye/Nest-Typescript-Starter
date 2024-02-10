import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  ParseIntPipe,
} from '@nestjs/common';
import { RequestValidationError } from '../errors';
import { ErrorFormat } from '../types';

@Injectable()
export class CustomParseIntPipe extends ParseIntPipe implements PipeTransform {
  async transform(value: string, metadata: ArgumentMetadata): Promise<number> {
    try {
      return await super.transform(value, metadata);
    } catch (err) {
      const { data, type } = metadata;
      const errors: ErrorFormat[] = [
        {
          message: `${data} is not a valid integer`,
          field: data,
          location: type,
          stack: null,
        },
      ];
      throw new RequestValidationError(errors);
    }
  }
}

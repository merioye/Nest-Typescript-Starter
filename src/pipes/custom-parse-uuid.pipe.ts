import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  ParseUUIDPipe,
} from '@nestjs/common';
import { RequestValidationError } from '../errors';
import { ErrorFormat } from '../types';

@Injectable()
export class CustomParseUUIDPipe
  extends ParseUUIDPipe
  implements PipeTransform
{
  async transform(value: string, metadata: ArgumentMetadata): Promise<string> {
    try {
      return await super.transform(value, metadata);
    } catch (err) {
      const { data, type } = metadata;
      const errors: ErrorFormat[] = [
        {
          message: `${data} is not a uuid`,
          field: data,
          location: type,
          stack: null,
        },
      ];
      throw new RequestValidationError(errors);
    }
  }
}

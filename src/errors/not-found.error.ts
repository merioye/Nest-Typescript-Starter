import { HttpStatus } from '@nestjs/common';
import { CustomError } from './custom.error';

export class NotFoundError extends CustomError {
  public constructor(message = 'Not Found') {
    super(message, 'NotFoundException', HttpStatus.NOT_FOUND);
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }
}

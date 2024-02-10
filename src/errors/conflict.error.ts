import { HttpStatus } from '@nestjs/common';
import { CustomError } from './custom.error';

export class ConflictError extends CustomError {
  public constructor(message = 'Conflict Exception') {
    super(message, 'ConflictException', HttpStatus.CONFLICT);
    Object.setPrototypeOf(this, ConflictError.prototype);
  }
}

import { HttpStatus } from '@nestjs/common';
import { CustomError } from './custom.error';

export class InternalServerError extends CustomError {
  public constructor(message = 'Internal Server Exception') {
    super(message, 'InternalServerException', HttpStatus.INTERNAL_SERVER_ERROR);
    Object.setPrototypeOf(this, InternalServerError.prototype);
  }
}

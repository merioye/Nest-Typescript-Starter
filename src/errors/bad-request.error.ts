import { HttpStatus } from '@nestjs/common';
import { CustomError } from './custom.error';

export class BadRequestError extends CustomError {
  public constructor(message = 'Bad Request Exception') {
    super(message, 'BadRequestException', HttpStatus.BAD_REQUEST);
    Object.setPrototypeOf(this, BadRequestError.prototype);
  }
}

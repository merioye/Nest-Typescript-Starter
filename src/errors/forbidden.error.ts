import { HttpStatus } from '@nestjs/common';
import { CustomError } from './custom.error';

export class ForbiddenError extends CustomError {
  public constructor(message = 'Action Forbidden') {
    super(message, 'ForbiddenException', HttpStatus.FORBIDDEN);
    Object.setPrototypeOf(this, ForbiddenError.prototype);
  }
}

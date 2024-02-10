import { HttpStatus } from '@nestjs/common';
import { CustomError } from './custom.error';

export class NotAuthorizedError extends CustomError {
  public constructor(message = 'Not Authorized') {
    super(message, 'NotAuthorizedException', HttpStatus.UNAUTHORIZED);
    Object.setPrototypeOf(this, NotAuthorizedError.prototype);
  }
}

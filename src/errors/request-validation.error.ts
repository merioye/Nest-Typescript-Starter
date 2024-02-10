import { HttpStatus } from '@nestjs/common';
import { ErrorFormat } from '../types';

export class RequestValidationError extends Error {
  public name = 'RequestValidationException';
  private readonly statusCode = HttpStatus.BAD_REQUEST;

  public constructor(public readonly errors: ErrorFormat[]) {
    super('Validation Failed Exception');
    Object.setPrototypeOf(this, RequestValidationError.prototype);
  }

  public getStatus(): number {
    return this.statusCode;
  }
}

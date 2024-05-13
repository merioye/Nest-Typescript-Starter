import { HttpStatus } from '@nestjs/common';
import { ErrorFormat } from '@/types';

/**
 * RequestValidationError class represents a validation failed exception.
 * It is thrown when the request body validation fails.
 * It extends the built-in Error class and adds additional properties.
 *
 * @class RequestValidationError
 * @extends {Error}
 *
 * @property {ErrorFormat[]} errors - The list of validation errors.
 * @property {string} name - The name of the error.
 *
 * @method getStatus(): number - Returns the HTTP status code of the error.
 *
 * @example
 * const error = new RequestValidationError(errors);
 */
export class RequestValidationError extends Error {
  public readonly name = 'RequestValidationException';
  /**
   * The HTTP status code of the error.
   */
  private readonly statusCode = HttpStatus.BAD_REQUEST;

  /**
   * Creates a new RequestValidation instance with the specified
   *    list of validation errors
   *
   * @constructor
   * @param {ErrorFormat[]} errors The list of validation errors.
   */
  public constructor(public readonly errors: ErrorFormat[]) {
    super('Validation Failed Exception');
    Object.setPrototypeOf(this, RequestValidationError.prototype);
  }

  /**
   * This method returns the value of the `statusCode` property
   *    of the error object.
   *
   * @returns The HTTP status code of the error.
   */
  public getStatus(): number {
    return this.statusCode;
  }
}

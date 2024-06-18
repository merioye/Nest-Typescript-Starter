/**
 * CustomError class represents a generic error with a status code.
 * It extends the built-in Error class and adds additional properties.
 *
 * @class CustomError
 * @extends {Error}
 *
 * @example
 * const error = new CustomError('Email already in use', 'ConflictException', HttpStatus.CONFLICT);
 */
export class CustomError extends Error {
  /**
   * Creates a new CustomError instance with the specified
   *    error message, error name, and status code.
   *
   * @constructor
   * @param {string} message - The error message.
   * @param {string} name - The name of the error.
   * @param {number} statusCode - The HTTP status code of the error.
   */
  public constructor(
    message: string,
    public name: string,
    private readonly statusCode: number
  ) {
    super(message);
    Object.setPrototypeOf(this, CustomError.prototype);
  }

  /**
   * This method returns the value of the `statusCode` property
   *    of the error object.
   *
   * @returns {number} The HTTP status code of the error.
   */
  public getStatus(): number {
    return this.statusCode;
  }
}

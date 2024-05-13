import { ApiResponseParams, ErrorFormat } from '@/types';

/**
 * Class that represents the API response.
 *
 * This class is used to handle the API response in a standardized way.
 * It includes the result of the API call, error messages, the response message, a success flag indicating
 * if the API call was successful or not, and the status code of the response.
 *
 * @class ApiResponse
 *
 * @property {ErrorFormat[]} errors - The list of errors.
 * @property {object} errorInfo - The error information for debugging.
 * @property {number} statusCode - The status code of the API response.
 * @property {string} message - The message of the API response.
 * @property {boolean} success - A flag indicating if the API call was successful or not.
 * @property {T} result - The result of the API call.
 *
 * @example
 * const response = new ApiResponse({ result: { name: 'John Doe' } });
 */
export class ApiResponse<T> {
  public readonly errors: ErrorFormat[] = [];
  public readonly errorInfo = {};
  public readonly result: T;
  public readonly message: string;
  public readonly success: boolean;
  public readonly statusCode: number;

  /**
   * Creates a new ApiResponse instance with the specified result, message, and status code.
   *
   * @constructor
   * @param {ApiResponseParams<T>} params - The parameters to use to create the ApiResponse instance.
   */
  public constructor({
    result,
    message = 'Success',
    statusCode = 200,
  }: ApiResponseParams<T>) {
    this.result = result;
    this.statusCode = statusCode;
    this.message = message;
    this.success = statusCode < 400;
  }
}

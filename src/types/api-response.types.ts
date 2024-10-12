/**
 * Type representing the response of an API endpoint.
 *
 * @typedef ApiResponseParams<T>
 *
 * @property {T} result - The result of the API endpoint, or null if the response is an error
 * @property {string} [message] - An optional descriptive information message about the operation
 * @property {number} [statusCode] - The optional HTTP status code of the response
 */
type ApiResponseParams<T> = {
  result: T;
  message?: string;
  statusCode?: number;
};

export { ApiResponseParams };

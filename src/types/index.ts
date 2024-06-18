import { ENVIRONMENT } from '@/constants';

/**
 * Type representing an error object.
 *
 * @typedef ErrorFormat
 *
 * @property {string} message - The error message
 * @property {string} field - The field name that caused the error
 * @property {string} location - The location of the error
 * @property {string | null} stack - The stack trace if the application is not in production mode, or null otherwise
 */
type ErrorFormat = {
  message: string;
  field: string;
  location: string;
  stack: string | null;
};

/**
 * Type representing error metadata for logging purposes.
 *
 * @typedef LoggerErrorMetadata
 *
 * @property {string} id - A UUID identifying the error
 * @property {ErrorFormat} [errors] - An optional array of error objects, each containing the following fields:
 *  - message: The error message
 *  - field: The field name that caused the error
 *  - location: The location of the error
 *  - stack: The stack trace if the application is not in production mode, or null otherwise
 * @property {string | null} stack - The stack trace if the application is not in production mode, or null otherwise
 * @property {number} statusCode - The HTTP status code of the error
 * @property {string} path - The URL path of the request that caused the error
 * @property {string} method - The HTTP method of the request that caused the error
 */
type LoggerErrorMetadata = {
  id: string;
  errors?: ErrorFormat[];
  stack: string | null;
  statusCode: number;
  path: string;
  method: string;
};

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

/**
 * Type representing the LoggerModuleOptions.
 *
 * @typedef LoggerModuleOptions
 *
 * @property {ENVIRONMENT} environment - The environment in which the application is running.
 * @property {string} logsDirPath - The path to the directory where logs will be stored.
 */
type LoggerModuleOptions = {
  environment: ENVIRONMENT;
  logsDirPath: string;
};

/**
 * Type representing the TranslatorModuleOptions.
 *
 * @typedef TranslatorModuleOptions
 *
 * @property {string} fallbackLanguage - The default language to use when translations are missing.
 * @property {string} translationsDirPath - The path to the directory containing the translation files.
 * @property {string} translationsFileName - The name of the file that contains the translations.
 * @property {string} langExtractionKey - The key used to extract the language from the incoming request.
 */
type TranslatorModuleOptions = {
  fallbackLanguage: string;
  translationsDirPath: string;
  translationsFileName: string;
  langExtractionKey: string;
};

export {
  ErrorFormat,
  LoggerErrorMetadata,
  ApiResponseParams,
  LoggerModuleOptions,
  TranslatorModuleOptions,
};

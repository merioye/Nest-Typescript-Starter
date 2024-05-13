/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Interface defining the methods of the logger
 *
 *
 * @interface ILogger
 *
 * @method log(message: any, ...optionalParams: any[]): void - Logs a message
 * @method info(message: any, ...optionalParams: any[]): void - Logs an informational message
 * @method debug(message: any, ...optionalParams: any[]): void - Logs a debug message
 * @method error(message: any, ...optionalParams: any[]): void - Logs an error message
 * @method verbose(message: any, ...optionalParams: any[]): void - An Optional method that logs a verbose message
 * @method warn(message: any, ...optionalParams: any[]): void - An Optional method that logs a warning message
 */
export interface ILogger {
  log(message: any, ...optionalParams: any[]): void;
  info(message: any, ...optionalParams: any[]): void;
  debug(message: any, ...optionalParams: any[]): void;
  error(message: any, ...optionalParams: any[]): void;
  verbose?(message: any, ...optionalParams: any[]): void;
  warn?(message: any, ...optionalParams: any[]): void;
}

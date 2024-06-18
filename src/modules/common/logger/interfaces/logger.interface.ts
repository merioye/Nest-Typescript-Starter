/**
 * Interface defining the methods of the logger
 *
 *
 * @interface ILogger
 *
 * @method log - Logs a message
 * @method info - Logs an informational message
 * @method debug - Logs a debug message
 * @method error - Logs an error message
 * @method verbose - An Optional method that logs a verbose message
 * @method warn - An Optional method that logs a warning message
 */
export interface ILogger {
  log(message: any, ...optionalParams: any[]): void;
  info(message: any, ...optionalParams: any[]): void;
  debug(message: any, ...optionalParams: any[]): void;
  error(message: any, ...optionalParams: any[]): void;
  verbose?(message: any, ...optionalParams: any[]): void;
  warn?(message: any, ...optionalParams: any[]): void;
}

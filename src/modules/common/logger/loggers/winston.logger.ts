import { Injectable } from '@nestjs/common';
import { createLogger, format, Logger, transports } from 'winston';

import { LoggerModuleOptions } from '@/types';
import { ENVIRONMENT } from '@/enums';

import { ILogger } from '../interfaces';

/**
 * Singleton of Logger using Winston library which implements the ILogger interface
 *
 * @class WinstonLogger
 * @implements {ILogger}
 *
 * @example
 * const logger = WinstonLogger.getInstance();
 * logger.log('info', 'Hello, World!');
 */
@Injectable()
export class WinstonLogger implements ILogger {
  // Singleton logger instance
  private static _instance: WinstonLogger;
  // Winston logger
  private readonly _logger: Logger;
  private readonly _customFormat = {
    console: format.printf(({ timestamp, level, stack, message }) => {
      return `${timestamp} [${level}]: ${stack || message}`;
    }),
  };

  /**
   * Private constructor to create a singleton from within the class.
   * It cannot be instantiated outside of the class
   *
   * @constructor
   * @param options - Logger module options
   */
  private constructor({ environment, logsDirPath }: LoggerModuleOptions) {
    const isTestingEnvironment = environment === ENVIRONMENT.TEST;
    const isDevelopmentEnvironment = environment === ENVIRONMENT.DEV;

    this._logger = createLogger({
      level: isDevelopmentEnvironment ? 'debug' : 'info',
      defaultMeta: {
        application: 'nest + typescript template',
      },
      format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.errors({ stack: true }),
        format.json()
      ),
      transports: [
        new transports.Console({
          level: 'debug',
          silent: isTestingEnvironment,
          format: format.combine(
            format.colorize(),
            format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            format.errors({ stack: true }),
            this._customFormat.console
          ),
        }),
        new transports.File({
          level: 'error',
          dirname: logsDirPath,
          filename: 'error.log',
          silent: isTestingEnvironment,
        }),
        new transports.File({
          level: 'debug',
          dirname: logsDirPath,
          filename: 'combined.log',
          silent: isTestingEnvironment,
        }),
      ],
    });
  }

  /**
   * Get the singleton instance of the logger
   *
   * @static
   * @param options - logger module options
   * @returns logger instance
   */
  public static getInstance(options: LoggerModuleOptions): WinstonLogger {
    if (!WinstonLogger._instance) {
      WinstonLogger._instance = new WinstonLogger(options);
    }
    return WinstonLogger._instance;
  }

  /**
   * Format message to string
   *
   * @param data - Message to format
   * @returns Formatted message
   */
  private stringify(data: any): string {
    return typeof data === 'string' ? data : JSON.stringify(data);
  }

  /**
   * Logs a message
   *
   * @param message - Message to log
   * @param optionalParams - Optional parameters
   * @returns {void}
   */
  public log(message: any, ...optionalParams: any[]): void {
    this._logger.log('info', this.stringify(message), optionalParams);
  }

  /**
   * Logs an informational message
   *
   * @param message - Message to log
   * @param optionalParams - Optional parameters
   * @returns {void}
   */
  public info(message: any, ...optionalParams: any[]): void {
    this._logger.info(this.stringify(message), optionalParams);
  }

  /**
   * Logs a debug message
   *
   * @param message - Message to log
   * @param optionalParams - Optional parameters
   * @returns {void}
   */
  public debug(message: any, ...optionalParams: any[]): void {
    this._logger.debug(this.stringify(message), optionalParams);
  }

  /**
   * Logs a message at verbose level
   *
   * @param - Message message to log
   * @param optionalParams - Optional parameters
   * @returns {void}
   */
  public verbose(message: any, ...optionalParams: any[]): void {
    this._logger.verbose(this.stringify(message), optionalParams);
  }

  /**
   * Logs an error message
   *
   * @param message - Message to log
   * @param optionalParams - Optional parameters
   * @returns {void}
   */
  public error(message: any, ...optionalParams: any[]): void {
    this._logger.error(this.stringify(message), optionalParams);
  }

  /**
   * Logs a warning message
   *
   * @param message - Message to log
   * @param optionalParams - Optional parameters
   * @returns {void}
   */
  public warn(message: any, ...optionalParams: any[]): void {
    this._logger.warn(this.stringify(message), optionalParams);
  }
}

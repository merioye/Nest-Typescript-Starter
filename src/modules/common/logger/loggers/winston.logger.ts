/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common';
import { createLogger, format, Logger, transports } from 'winston';
import { ENVIRONMENT } from '@/constants';
import { ILogger } from '../interfaces';

/**
 * Singleton of Logger using Winston library which implements the ILogger interface
 *
 * @class WinstonLogger
 * @implements {ILogger}
 *
 * @method getInstance(): WinstonLogger - Static method to get the singleton instance of the logger
 * @method log(level: string, message: any, ...optionalParams: any[]): void - Logs a message
 * @method warn(message: any, ...optionalParams: any[]): void - Logs a warning message
 * @method error(message: any, ...optionalParams: any[]): void - Logs an error message
 * @method debug(message: any, ...optionalParams: any[]): void - Logs a debug message
 * @method info(message: any, ...optionalParams: any[]): void - Logs an informational message
 * @method verbose(message: any, ...optionalParams: any[]): void - Logs a verbose message
 *
 * @example
 * const logger = WinstonLogger.getInstance();
 * logger.log('info', 'Hello, World!');
 */
@Injectable()
export class WinstonLogger implements ILogger {
  // Singleton logger instance
  private static instance: WinstonLogger;
  // Winston logger
  private readonly logger: Logger;
  private readonly customFormat = {
    console: format.printf(({ timestamp, level, stack, message }) => {
      return `${timestamp} [${level}]: ${stack || message}`;
    }),
  };

  /**
   * Private constructor to create a singleton from within the class.
   * It cannot be instantiated outside of the class
   *
   * @constructor
   */
  private constructor() {
    const isTestingEnvironment =
      (process.env.NODE_ENV as ENVIRONMENT) === ENVIRONMENT.TEST;

    this.logger = createLogger({
      level: 'info',
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
            this.customFormat.console
          ),
        }),
        new transports.File({
          level: 'error',
          dirname: 'logs',
          filename: 'error.log',
          silent: isTestingEnvironment,
        }),
        new transports.File({
          level: 'debug',
          dirname: 'logs',
          filename: 'combined.log',
          silent: isTestingEnvironment,
        }),
      ],
    });
  }

  /**
   * Get the singleton instance of the logger
   *
   * @returns {WinstonLogger} instance
   */
  public static getInstance(): WinstonLogger {
    if (!WinstonLogger.instance) {
      WinstonLogger.instance = new WinstonLogger();
    }
    return WinstonLogger.instance;
  }

  /**
   * Format message to string
   *
   * @param {any} data - Message to format
   * @returns {string} Formatted message
   */
  private stringify(data: any): string {
    return typeof data === 'string' ? data : JSON.stringify(data);
  }

  /**
   * Logs a message
   *
   * @param {any} message - Message to log
   * @param {any[]} optionalParams - Optional parameters
   * @returns {void}
   */
  public log(message: any, ...optionalParams: any[]): void {
    this.logger.log('info', this.stringify(message), optionalParams);
  }

  /**
   * Logs an informational message
   *
   * @param {any} message - Message to log
   * @param {any[]} optionalParams - Optional parameters
   * @returns {void}
   */
  public info(message: any, ...optionalParams: any[]): void {
    this.logger.info(this.stringify(message), optionalParams);
  }

  /**
   * Logs a debug message
   *
   * @param {any} message - Message to log
   * @param {any[]} optionalParams - Optional parameters
   * @returns {void}
   */
  public debug(message: any, ...optionalParams: any[]): void {
    this.logger.debug(this.stringify(message), optionalParams);
  }

  /**
   * Logs a message at verbose level
   *
   * @param {any} - Message message to log
   * @param {any[]} optionalParams - Optional parameters
   * @returns {void}
   */
  public verbose(message: any, ...optionalParams: any[]): void {
    this.logger.verbose(this.stringify(message), optionalParams);
  }

  /**
   * Logs an error message
   *
   * @param {any} message - Message to log
   * @param {any[]} optionalParams - Optional parameters
   * @returns {void}
   */
  public error(message: any, ...optionalParams: any[]): void {
    this.logger.error(this.stringify(message), optionalParams);
  }

  /**
   * Logs a warning message
   *
   * @param {any} message - Message to log
   * @param {any[]} optionalParams - Optional parameters
   * @returns {void}
   */
  public warn(message: any, ...optionalParams: any[]): void {
    this.logger.warn(this.stringify(message), optionalParams);
  }
}

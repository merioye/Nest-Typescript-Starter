import { Injectable } from '@nestjs/common';
import { createLogger, format, Logger, transports } from 'winston';
import { LoggerModuleOptions } from '@/types';
import { ENVIRONMENT } from '@/constants';
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
   * @param {LoggerModuleOptions} options - Logger module options
   */
  private constructor({ environment, logsDirPath }: LoggerModuleOptions) {
    const isTestingEnvironment = environment === ENVIRONMENT.TEST;

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
   * @returns {WinstonLogger} instance
   */
  public static getInstance(options: LoggerModuleOptions): WinstonLogger {
    if (!WinstonLogger.instance) {
      WinstonLogger.instance = new WinstonLogger(options);
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

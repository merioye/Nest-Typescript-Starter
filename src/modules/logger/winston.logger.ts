/* eslint-disable @typescript-eslint/no-explicit-any */
import { Injectable } from '@nestjs/common';
import { Logger, createLogger, format, transports } from 'winston';
import { ILogger } from '../../interfaces';
import { ENVIRONMENT } from '../../constants';

@Injectable()
export class WinstonLogger implements ILogger {
  private readonly logger: Logger;
  private readonly customFormat = {
    console: format.printf(({ timestamp, level, stack, message }) => {
      return `${timestamp} [${level}]: ${stack || message}`;
    }),
  };

  constructor() {
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
        format.json(),
      ),
      transports: [
        new transports.Console({
          level: 'debug',
          silent: isTestingEnvironment,
          format: format.combine(
            format.colorize(),
            format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            format.errors({ stack: true }),
            this.customFormat.console,
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

  private stringify(data: any): string {
    return typeof data === 'string' ? data : JSON.stringify(data);
  }

  log(message: any, ...optionalParams: any[]): void {
    this.logger.log('info', this.stringify(message), optionalParams);
  }

  info(message: any, ...optionalParams: any[]): void {
    this.logger.info(this.stringify(message), optionalParams);
  }

  debug(message: any, ...optionalParams: any[]): void {
    this.logger.debug(this.stringify(message), optionalParams);
  }

  verbose(message: any, ...optionalParams: any[]): void {
    this.logger.verbose(this.stringify(message), optionalParams);
  }

  error(message: any, ...optionalParams: any[]): void {
    this.logger.error(this.stringify(message), optionalParams);
  }

  warn(message: any, ...optionalParams: any[]): void {
    this.logger.warn(this.stringify(message), optionalParams);
  }
}

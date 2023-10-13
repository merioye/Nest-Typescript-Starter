import { createLogger, format, transports } from 'winston';
import { ConfigService } from '@nestjs/config';
import { ENVIRONMENT } from '../constants';

const configService = new ConfigService();
const isTestingEnvironment = configService.get('NODE_ENV') === ENVIRONMENT.TEST;

const customFormat = {
  console: format.printf(({ timestamp, level, stack, message }) => {
    return `${timestamp} [${level}]: ${stack || message}`;
  }),
};

export const logger = createLogger({
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
      level: 'info',
      silent: isTestingEnvironment,
      format: format.combine(
        format.colorize(),
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        format.errors({ stack: true }),
        customFormat.console,
      ),
    }),
    new transports.File({
      level: 'error',
      dirname: 'logs',
      filename: 'error.log',
      silent: isTestingEnvironment,
    }),
    new transports.File({
      level: 'info',
      dirname: 'logs',
      filename: 'combined.log',
      silent: isTestingEnvironment,
    }),
  ],
});

import { Global, Module } from '@nestjs/common';
import { LoggerToken } from './constants';
import { WinstonLogger } from './loggers';

/**
 * Global NestJS module for logging
 * This module provides the global Logger instance
 *
 * @class LoggerModule
 */
@Global()
@Module({
  providers: [{ provide: LoggerToken, useValue: WinstonLogger.getInstance() }],
  exports: [LoggerToken],
})
export class LoggerModule {}

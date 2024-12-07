import { DynamicModule } from '@nestjs/common';

import { LoggerModuleOptions } from '@/types';

import { LoggerToken } from './constants';
import { WinstonLogger } from './loggers';

/**
 * Global NestJS module for logging
 * This module provides the global Logger instance
 *
 * @module LoggerModule
 */

export class LoggerModule {
  /**
   * Creates a dynamic module for the global Logger instance.
   *
   * @static
   * @param options - The options for the Logger module.
   * @returns The dynamic module for the global Logger instance.
   */
  public static forRoot(options: LoggerModuleOptions): DynamicModule {
    return {
      global: true,
      module: LoggerModule,
      providers: [
        { provide: LoggerToken, useValue: WinstonLogger.getInstance(options) },
      ],
      exports: [LoggerToken],
    };
  }
}

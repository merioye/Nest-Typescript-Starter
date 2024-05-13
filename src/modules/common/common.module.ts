import { Module } from '@nestjs/common';
import { LoggerModule } from './logger';

/**
 * The CommonAppModule is a module that contains all the common features and services
 * that are being used by the application.
 *
 * @class CommonAppModule
 */
@Module({
  imports: [LoggerModule],
})
export class CommonAppModule {}

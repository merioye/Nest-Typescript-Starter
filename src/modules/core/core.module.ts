import { Module } from '@nestjs/common';

import { GracefulShutdownModule } from './graceful-shutdown';

/**
 * The CoreAppModule is a module that contains all the framework related features
 * and services. These features are globally available in the application.
 *
 * @module CoreAppModule
 */
@Module({
  imports: [GracefulShutdownModule],
})
export class CoreAppModule {}

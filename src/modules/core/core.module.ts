import { Module } from '@nestjs/common';
import { GracefulShutdownModule } from './gracefulShutdown';

/**
 * The CoreAppModule is a module that contains all the framework related features
 * and services. These features are globally available in the application.
 *
 * @class CoreAppModule
 */
@Module({
  imports: [GracefulShutdownModule],
})
export class CoreAppModule {}

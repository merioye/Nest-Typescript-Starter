import { Module } from '@nestjs/common';
import { HealthModule } from './health';

/**
 * The WebAppModule is a module that contains all the api related features and
 * services.
 *
 * @class WebAppModule
 */
@Module({
  imports: [HealthModule],
  exports: [WebAppModule],
})
export class WebAppModule {}

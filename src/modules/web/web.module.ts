import { Module } from '@nestjs/common';

import { HealthModule } from './health';

/**
 * The WebAppModule is a module that contains all the api related features and
 * services.
 *
 * @module WebAppModule
 */
@Module({
  imports: [HealthModule],
  exports: [WebAppModule],
})
export class WebAppModule {}

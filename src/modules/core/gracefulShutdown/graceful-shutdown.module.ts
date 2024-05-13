import { Module } from '@nestjs/common';
import { GracefulShutdownService } from './graceful-shutdown.service';

/**
 * Module for handling graceful shutdown of the application.
 *
 * This module provides an instance of the
 * {@link GracefulShutdownService} which can be used to handle
 * graceful shutdown of the application when a termination (SIGINT, SIGTERM)
 * signal is received.
 *
 * @module GracefulShutdownModule
 */
@Module({
  providers: [GracefulShutdownService],
  exports: [GracefulShutdownService],
})
export class GracefulShutdownModule {}

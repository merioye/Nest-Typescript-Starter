import { Controller, Get, Inject } from '@nestjs/common';
import { ILogger, LoggerToken } from '@/modules/common/logger';
import { HealthServiceToken } from './constants';
import { IHealthService } from './interfaces';
import { Health } from './types';

/**
 * The controller responsible for handling the server health check endpoint.
 *
 * @class HealthController
 */
@Controller()
export class HealthController {
  /**
   * Creates a new HealthController instance.
   *
   * @constructor
   * @param {ILogger} logger - The logger to be used to log messages.
   * @param {IHealthService} healthService - The health service which is responsible for
   *   providing the health information.
   */
  public constructor(
    @Inject(LoggerToken) private readonly logger: ILogger,
    @Inject(HealthServiceToken) private readonly healthService: IHealthService
  ) {}

  /**
   * The endpoint which returns the server health information.
   *
   * @returns {Health} The health information.
   */
  @Get('/healthcheck')
  public checkHealth(): Health {
    this.logger.info('Request for checking server health');
    return this.healthService.health();
  }
}

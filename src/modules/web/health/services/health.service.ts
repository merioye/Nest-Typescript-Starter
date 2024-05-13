import { Injectable } from '@nestjs/common';
import { IHealthService } from '../interfaces';
import { Health } from '../types';

/**
 * The service responsible for providing health information about the application.
 *
 * @class HealthService
 * @implements {IHealthService}
 *
 * @method health() - Returns the health information about the application.
 */
@Injectable()
export class HealthService implements IHealthService {
  /**
   * Returns the health information about the application.
   *
   * @returns {Health} The health information about the application.
   */
  public health(): Health {
    return {
      message: 'Server is up and running...',
      status: 'ok',
    };
  }
}

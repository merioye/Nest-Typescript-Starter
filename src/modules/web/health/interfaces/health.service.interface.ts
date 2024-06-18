import { Health } from '../types';

/**
 * The interface with methods that provide health information about the application.
 *
 * @interface IHealthService
 *
 * @method health - Returns the health information about the application.
 */
export interface IHealthService {
  health(): Health;
}

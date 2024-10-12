import {
  BeforeApplicationShutdown,
  Inject,
  Injectable,
  OnApplicationBootstrap,
  OnApplicationShutdown,
} from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ILogger, LoggerToken } from '@/modules/common/logger';

/**
 * A service to handle graceful shutdown of the application.
 * The service provides methods to set the NestJS application instance and
 * handle graceful shutdown of the application when a termination (SIGINT, SIGTERM) signal is received.
 *
 * @class GracefulShutdownService
 * @implements {OnApplicationShutdown, BeforeApplicationShutdown, OnApplicationBootstrap}
 */
@Injectable()
export class GracefulShutdownService
  implements
    OnApplicationShutdown,
    BeforeApplicationShutdown,
    OnApplicationBootstrap
{
  /**
   * The NestJS application instance.
   */
  private _app!: NestExpressApplication;

  /**
   * @constructor
   * @param logger - An instance of the logger.
   */
  public constructor(@Inject(LoggerToken) private readonly logger: ILogger) {}

  /**
   * Sets the NestJS application instance.
   *
   * @param app - The NestJS application instance.
   * @returns {void}
   */
  public setApp(app: NestExpressApplication): void {
    this._app = app;
  }

  /**
   * This method is invoked after the application bootstrap and
   * throws an error if `setApp(app)` method is not invoked in the application entry
   * point file.
   *
   * @returns {void}
   */
  public onApplicationBootstrap(): void {
    if (!this._app) {
      throw new Error(
        'You have to invoke `setApp(app)` method of `ShutdownService` in project entrypoint file to handle graceful server shutdown!'
      );
    }
  }

  /**
   * Handles graceful shutdown of the application when a signal is received.
   * This method closes the http server.
   *
   * @param signal The signal that is received. Default is 'Termination'.
   * @returns {void}
   */
  public beforeApplicationShutdown(signal: string = 'Termination'): void {
    this.logger.info(`${signal} signal received, closing http server...`);
    this._app.getHttpServer().close((err) => {
      if (err) {
        throw err;
      } else {
        this.logger.info('Http server is closed.');
      }
    });
  }

  /**
   * This method is invoked when the application should be shut down and
   * closes any resources or performs cleanup before shutting down.
   * And at last ends the node process with successful termination exit code.
   *
   * @returns {void}
   */
  public onApplicationShutdown(): void {
    // Close any resources or perform cleanup before shutting down
    // For example, close database connections, release resources, etc.

    // And at last end the node process with successful termination exit code
    process.exit(0);
  }
}

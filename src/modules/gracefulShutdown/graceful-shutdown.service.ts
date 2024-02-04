import {
  Injectable,
  Inject,
  OnApplicationShutdown,
  BeforeApplicationShutdown,
  OnApplicationBootstrap,
} from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { LoggerToken } from '../../constants';
import { ILogger } from '../../interfaces';

@Injectable()
export class GracefulShutdownService
  implements
    OnApplicationShutdown,
    BeforeApplicationShutdown,
    OnApplicationBootstrap
{
  private app: NestExpressApplication;

  public constructor(@Inject(LoggerToken) private readonly logger: ILogger) {}

  public setApp(app: NestExpressApplication): void {
    this.app = app;
  }

  public onApplicationBootstrap(): void {
    if (!this.app) {
      throw new Error(
        'You have to invoke `setApp(app)` method of `ShutdownService` in project entrypoint file to handle graceful server shutdown!',
      );
    }
  }

  public beforeApplicationShutdown(signal: string = 'Termination'): void {
    this.logger.info(`${signal} signal received, closing http server...`);
    this.app.getHttpServer().close((err) => {
      if (err) {
        throw err;
      } else {
        this.logger.info('Http server is closed.');
        process.exit(0);
      }
    });
  }

  public onApplicationShutdown(): void {
    // Close any resources or perform cleanup before shutting down
    // For example, close database connections, release resources, etc.
  }
}

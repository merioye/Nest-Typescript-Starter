import { Injectable } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { logger } from 'src/config';

@Injectable()
export class ShutdownService {
  private app: NestExpressApplication;

  setApp(app: NestExpressApplication) {
    this.app = app;
  }

  async gracefulShutdown(signal: 'SIGINT' | 'SIGTERM') {
    logger.info(`${signal} signal received, closing http server...`);
    if (this.app) {
      await this.app.close();
    }
    logger.info('Http server is closed.');

    // close any db connection, subscriptions here

    process.exit(0);
  }
}

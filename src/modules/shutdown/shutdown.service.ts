import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { Logger } from 'winston';
import { Server } from 'http';

@Injectable()
export class ShutdownService implements OnApplicationShutdown {
  private readonly logger: Logger;
  private server: Server;

  constructor(logger: Logger) {
    this.logger = logger;
  }

  setServer(server: Server) {
    this.server = server;
  }

  onApplicationShutdown(signal: string) {
    this.logger.info(`${signal} signal received, closing http server...`);

    // Close any resources or perform cleanup before shutting down
    // For example, close database connections, release resources, etc.

    this.server.close(() => {
      this.logger.info('Http server is closed.');
      process.exit(0);
    });
  }
}

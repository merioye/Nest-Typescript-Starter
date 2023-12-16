import { Injectable, OnApplicationShutdown } from '@nestjs/common';
import { Server } from 'http';

@Injectable()
export class ShutdownService implements OnApplicationShutdown {
  private server: Server;

  setServer(server: Server) {
    this.server = server;
  }

  onApplicationShutdown(signal: string) {
    console.log(`${signal} signal received, closing http server...`);

    // Close any resources or perform cleanup before shutting down
    // For example, close database connections, release resources, etc.

    this.server.close(() => {
      console.log('Http server is closed.');
      process.exit(0);
    });
  }
}

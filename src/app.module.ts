import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { Logger } from 'winston';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Config, logger } from './config';
import { ShutdownModule } from './modules';

@Module({
  imports: [ShutdownModule, ConfigModule.forRoot(Config)],
  controllers: [AppController],
  providers: [AppService, { provide: Logger, useValue: logger }],
})
export class AppModule {}

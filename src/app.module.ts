import { Module } from '@nestjs/common';
import { APP_FILTER } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ConfigOptions } from './config';
import { GracefulShutdownModule, HealthModule, LoggerModule } from './modules';
import { AllExceptionsFilter } from './filters';

@Module({
  imports: [
    ConfigModule.forRoot(ConfigOptions),
    LoggerModule,
    GracefulShutdownModule,
    HealthModule,
  ],
  providers: [{ provide: APP_FILTER, useClass: AllExceptionsFilter }],
})
export class AppModule {}

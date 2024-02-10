import { Module, ValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { configOptions, validationPipeOptions } from './config';
import { GracefulShutdownModule, HealthModule, LoggerModule } from './modules';
import { AllExceptionsFilter } from './filters';

@Module({
  imports: [
    ConfigModule.forRoot(configOptions),
    LoggerModule,
    GracefulShutdownModule,
    HealthModule,
  ],
  providers: [
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe(validationPipeOptions),
    },
  ],
})
export class AppModule {}

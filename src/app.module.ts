import {
  MiddlewareConsumer,
  Module,
  NestModule,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import compression from 'compression';
import helmet from 'helmet';
import { GracefulShutdownModule } from 'nestjs-graceful-shutdown';

import {
  configOptions,
  loggerModuleOptions,
  translatorModuleOptions,
  validationPipeOptions,
} from './config';
import { AllExceptionsFilter } from './core/filters';
import { ExceptionHandlingStrategyFactory } from './core/filters/factories';
import { TranslateMessageInterceptor } from './core/interceptors/response';
import { Config } from './enums';
import { CommonAppModule } from './modules/common';
import { WebAppModule } from './modules/web';

/**
 * The application module
 *
 * This module is the entry point of the application. It initializes the imported modules
 * and providers.
 *
 * @module AppModule
 * @implements {NestModule}
 *
 * @method configure(consumer: MiddlewareConsumer): void - Configures the application middlewares
 */
@Module({
  imports: [
    ConfigModule.forRoot(configOptions),
    GracefulShutdownModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        gracefulShutdownTimeout: configService.get<number>(
          Config.GRACEFUL_SHUTDOWN_TIMEOUT
        ),
        cleanup(): void {
          // Add any cleanup logic here
        },
      }),
    }),
    CommonAppModule.forRoot({
      logger: loggerModuleOptions,
      translator: translatorModuleOptions,
    }),
    WebAppModule,
  ],
  providers: [
    { provide: APP_INTERCEPTOR, useClass: TranslateMessageInterceptor },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe(validationPipeOptions),
    },
    ExceptionHandlingStrategyFactory,
  ],
})
export class AppModule implements NestModule {
  /**
   * Configures the application middlewares
   * This method is called by NestJS to apply middlewares to the application.
   *
   * @param consumer - MiddlewareConsumer
   * @returns {void}
   */
  public configure(consumer: MiddlewareConsumer): void {
    consumer.apply(helmet(), compression()).forRoutes('*');
  }
}

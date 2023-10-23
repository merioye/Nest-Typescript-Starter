import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { WinstonModule } from 'nest-winston';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './filters';
import { ShutdownService } from './shutdown';
import { buildSwaggerConfig, logger } from './config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: WinstonModule.createLogger({ instance: logger }),
  });

  app.use(helmet());
  app.use(compression());

  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));

  const shutdownService = app.get(ShutdownService);
  shutdownService.setApp(app);

  const configService = app.get(ConfigService);
  const PORT = configService.getOrThrow<number>('PORT');

  const document = SwaggerModule.createDocument(app, buildSwaggerConfig(PORT));
  SwaggerModule.setup('/api/v1/api-docs', app, document);

  await app.listen(PORT, () => logger.info(`Listening on PORT ${PORT} 🚀`));

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  process.on('SIGINT', async () => {
    await shutdownService.gracefulShutdown('SIGINT');
  });

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  process.on('SIGTERM', async () => {
    await shutdownService.gracefulShutdown('SIGTERM');
  });
}

bootstrap().catch((err) => {
  logger.error(err instanceof Error ? err.message : err);
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

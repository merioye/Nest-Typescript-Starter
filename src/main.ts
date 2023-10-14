import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';
import { AllExceptionsFilter } from './filters';
import { ShutdownService } from './shutdown';
import { logger } from './config';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));

  const shutdownService = app.get(ShutdownService);
  shutdownService.setApp(app);

  const configService = app.get(ConfigService);
  const PORT = configService.getOrThrow<number>('PORT');

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

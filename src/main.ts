import { NestFactory } from '@nestjs/core';
import { VersioningType } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';
import { GracefulShutdownService, WinstonLogger } from './modules';
import { buildSwaggerConfig } from './config';
import { CONFIG } from './constants';

const logger = new WinstonLogger();

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: logger,
  });

  const configService = app.get(ConfigService);
  const PORT = configService.get<number>(CONFIG.PORT);
  const API_PREFIX = configService.get<string>(CONFIG.API_PREFIX);
  const API_DEFAULT_VERSION = configService.get<string>(
    CONFIG.API_DEFAULT_VERSION,
  );

  app.enableShutdownHooks();
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: API_DEFAULT_VERSION,
  });
  app.setGlobalPrefix(API_PREFIX);
  app.use(helmet());
  app.use(compression());

  const gracefulShutdownService = app.get(GracefulShutdownService);
  gracefulShutdownService.setApp(app);

  const document = SwaggerModule.createDocument(app, buildSwaggerConfig(PORT));
  SwaggerModule.setup(`/${API_PREFIX}/v1/api-docs`, app, document);

  await app.listen(PORT, () => logger.info(`Listening on PORT ${PORT} 🚀`));
}

bootstrap().catch((err: unknown) => {
  logger.error(err instanceof Error ? err.message : err);
  process.exit(1);
});

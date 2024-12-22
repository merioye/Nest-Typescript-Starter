import { join } from 'path';
import { VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { SwaggerModule } from '@nestjs/swagger';
import { setupGracefulShutdown } from 'nestjs-graceful-shutdown';

import { AppModule } from './app.module';
import { buildSwaggerConfig, loggerModuleOptions } from './config';
import { Config } from './enums';
import { WinstonLogger } from './modules/common/logger';

const logger = WinstonLogger.getInstance(loggerModuleOptions);

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    logger: logger,
  });

  const configService = app.get(ConfigService);
  const PORT = configService.get<number>(Config.PORT);
  const API_PREFIX = configService.get<string>(Config.API_PREFIX);
  const API_DEFAULT_VERSION = configService.get<string>(
    Config.API_DEFAULT_VERSION
  );

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: API_DEFAULT_VERSION,
  });
  app.setGlobalPrefix(API_PREFIX!);
  app.useStaticAssets(join(__dirname, '..', 'public'));

  const document = SwaggerModule.createDocument(app, buildSwaggerConfig(PORT!));
  SwaggerModule.setup(`/${API_PREFIX}/docs`, app, document);

  setupGracefulShutdown({ app });

  await app.listen(PORT!, () => logger.info(`Listening on PORT ${PORT} 🚀`));
}

bootstrap().catch((err: unknown) => {
  logger.error(err instanceof Error ? err.message : err);
  process.exit(1);
});

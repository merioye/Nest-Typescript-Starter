import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const configService = app.get(ConfigService);
  await app.listen(configService.getOrThrow<number>('PORT'));
}

bootstrap().catch((err) => {
  console.log(err instanceof Error ? err.message : err);
});

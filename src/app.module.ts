import { Module, Logger } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ShutdownService } from './shutdown';
import { Config } from './config';

@Module({
  imports: [ConfigModule.forRoot(Config)],
  controllers: [AppController],
  providers: [Logger, AppService, ShutdownService],
})
export class AppModule {}

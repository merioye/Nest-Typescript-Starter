import { Module, Logger } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Config } from './config';
import { ShutdownModule } from './modules';

@Module({
  imports: [ShutdownModule, ConfigModule.forRoot(Config)],
  controllers: [AppController],
  providers: [Logger, AppService],
})
export class AppModule {}

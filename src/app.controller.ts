import { Controller, Get, Logger } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  private readonly appService: AppService;
  private readonly logger: Logger;

  constructor(logger: Logger, appService: AppService) {
    this.logger = logger;
    this.appService = appService;
  }

  @Get()
  getHello(): string {
    this.logger.log('Hello, friends');
    return this.appService.getHello();
  }
}

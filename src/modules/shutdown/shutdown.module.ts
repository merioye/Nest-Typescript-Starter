import { Module } from '@nestjs/common';
import { Logger } from 'winston';
import { ShutdownService } from './shutdown.service';
import { logger } from 'src/config';

@Module({
  providers: [ShutdownService, { provide: Logger, useValue: logger }],
  exports: [ShutdownService],
})
export class ShutdownModule {}

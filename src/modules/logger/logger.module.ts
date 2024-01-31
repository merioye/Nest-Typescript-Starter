import { Module, Global } from '@nestjs/common';
import { LoggerToken } from '../../constants';
import { WinstonLogger } from './winston.logger';

@Global()
@Module({
  providers: [{ provide: LoggerToken, useClass: WinstonLogger }],
  exports: [{ provide: LoggerToken, useClass: WinstonLogger }],
})
export class LoggerModule {}

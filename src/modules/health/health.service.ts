import { Injectable } from '@nestjs/common';
import { IHealthService } from './interfaces';
import { Health } from './types';

@Injectable()
export class HealthService implements IHealthService {
  public health(): Health {
    return {
      message: 'Server is up and running...',
      status: 'ok',
    };
  }
}

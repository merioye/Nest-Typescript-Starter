import { Inject, Injectable } from '@nestjs/common';
import {
  ITranslatorService,
  TranslatorServiceToken,
} from '@/modules/common/translator';
import { IHealthService } from '../interfaces';
import { Health } from '../types';

/**
 * The service responsible for providing health information about the application.
 *
 * @class HealthService
 * @implements {IHealthService}
 */
@Injectable()
export class HealthService implements IHealthService {
  /**
   * Creates an instance of HealthService.
   *
   * @constructor
   * @param translatorService - The translator service
   */
  public constructor(
    @Inject(TranslatorServiceToken)
    private readonly _translatorService: ITranslatorService
  ) {}

  /**
   * Returns the health information about the application.
   *
   * @returns The health information about the application.
   */
  public health(): Health {
    return {
      message: 'health.success.Server_is_up_and_running',
      status: this._translatorService.t('common.success.ok'),
    };
  }
}

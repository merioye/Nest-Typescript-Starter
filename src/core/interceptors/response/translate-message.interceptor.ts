import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ApiResponse } from '@/common/utils';
import { FormatTranslationKey } from '@/core/base/translations';
import {
  ITranslatorService,
  TranslatorServiceToken,
} from '@/modules/common/translator';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * The TranslateMessageInterceptor is a NestJS interceptor that translates the
 * message of the response using the provided translator service.
 *
 * @class TranslateMessageInterceptor
 * @extends {FormatTranslationKey}
 * @implements {NestInterceptor}
 **/
@Injectable()
export class TranslateMessageInterceptor
  extends FormatTranslationKey
  implements NestInterceptor
{
  /**
   * Creates an instance of TranslateMessageInterceptor.
   *
   * @constructor
   * @param {ITranslatorService} translatorService - The translator service to use for translation.
   */
  public constructor(
    @Inject(TranslatorServiceToken)
    private readonly translatorService: ITranslatorService
  ) {
    super();
  }

  /**
   * Intercepts the response and translates the message.
   *
   * @param {ExecutionContext} _ - The execution context.
   * @param {CallHandler} next - The call handler.
   * @returns {Observable<ApiResponse<any>>} The intercepted response.
   */
  public intercept(
    _: ExecutionContext,
    next: CallHandler
  ): Observable<ApiResponse<any>> {
    return next.handle().pipe(
      map((response: ApiResponse<any>) => {
        if (!response || !response?.message) {
          return response;
        }

        const { message } = response;
        const translatedResponse = { ...response };
        if (message) {
          const { key, args } = this.formatTranslationKey(message);
          translatedResponse.message = this.translatorService.t(key, args);
        }
        return translatedResponse;
      })
    );
  }
}

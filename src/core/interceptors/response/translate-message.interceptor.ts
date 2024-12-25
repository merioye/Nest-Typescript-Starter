import {
  CallHandler,
  ExecutionContext,
  Inject,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { ApiResponse } from '@/common/utils';
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
 * @implements {NestInterceptor}
 **/
@Injectable()
export class TranslateMessageInterceptor implements NestInterceptor {
  /**
   * Creates an instance of TranslateMessageInterceptor.
   *
   * @constructor
   * @param translatorService - The translator service to use for translation.
   */
  public constructor(
    @Inject(TranslatorServiceToken)
    private readonly _translatorService: ITranslatorService
  ) {}

  /**
   * Intercepts the response and translates the message.
   *
   * @param _ - The execution context.
   * @param next - The call handler.
   * @returns The intercepted response.
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

        try {
          return {
            ...response,
            message: this._translatorService.t(response.message),
          };
        } catch {
          return response; // Fallback to original response if translation fails
        }
      })
    );
  }
}

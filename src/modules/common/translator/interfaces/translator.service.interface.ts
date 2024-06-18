/**
 * The interface with methods to translate api response messages.
 *
 *
 * @interface ITranslatorService
 *
 * @method t - Returns translation of the specified key.
 */
export interface ITranslatorService {
  t(key: string, args?: Record<string, string>): string;
}

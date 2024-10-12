import { TranslationKeyAndArgs } from '../types';

export interface ITranslationKeyFormatterService {
  /**
   * Extracts the main translation key and optional arguments from a given string.
   *
   * The input string is expected to have the format 'key_?args={jsonArgs}',
   * where 'key' is the main translation key, and 'args' is a JSON string containing
   * optional key-value pairs for the translation.
   *
   * @param {string} key - The full translation key string.
   * @returns An object containing the translation key and optional translation arguments.
   */
  format(key: string): TranslationKeyAndArgs;
}

/**
 * Represents the translation key and arguments to be passed to TranslatorService.
 *
 * @typedef TranslationKeyAndArgs
 * @property {string} key - The translation key.
 * @property {Record<string, string> | undefined} args - The arguments.
 */
type TranslationKeyAndArgs = {
  key: string;
  args: Record<string, string> | undefined;
};

/**
 * This class provides methods to format translation keys.
 * @class FormatTranslationKey
 **/
export class FormatTranslationKey {
  /**
   * Splits the given translation key into actual translation key and translation arguments.
   *
   * @param {string} key - The key to split.
   * @returns {TranslationKeyAndArgs} An object containing the translation key and translation arguments.
   */
  protected formatTranslationKey(key: string): TranslationKeyAndArgs {
    const [actualKey, args] = key.split('_?args=');
    return {
      key: actualKey ? actualKey : '',
      args: args ? (JSON.parse(args) as Record<string, string>) : undefined,
    };
  }
}

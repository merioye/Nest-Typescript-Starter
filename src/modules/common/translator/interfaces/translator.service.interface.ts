export interface ITranslatorService {
  /**
   * Translates the given key using the provided language.
   *
   * @param key - The key of the translation to retrieve.
   * @param lang - Optional. The language to use for the translation.
   * @returns The translation of the provided key.
   */
  t(key: string, lang?: string): string;
}

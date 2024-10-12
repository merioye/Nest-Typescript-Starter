/**
 * Represents a translation key with optional arguments.
 *
 * @typedef TranslationKeyAndArgs
 * @property {string} key - The main translation key.
 * @property {Record<string, string> | undefined} args - Optional key-value pairs for the translation.
 */
export type TranslationKeyAndArgs = {
  key: string;
  args: Record<string, string> | undefined;
};

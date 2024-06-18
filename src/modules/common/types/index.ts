import { LoggerModuleOptions, TranslatorModuleOptions } from '@/types';

/**
 * Type representing the CommonAppModuleOptions.
 *
 * @typedef CommonAppModuleOptions
 *
 * @property {LoggerModuleOptions} logger - The logger module options.
 * @property {TranslatorModuleOptions} translator - The translator module options.
 */
type CommonAppModuleOptions = {
  logger: LoggerModuleOptions;
  translator: TranslatorModuleOptions;
};

export { CommonAppModuleOptions };

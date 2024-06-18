import { DynamicModule } from '@nestjs/common';
import { LoggerModule } from './logger';
import { TranslatorModule } from './translator';
import { CommonAppModuleOptions } from './types';

/**
 * The CommonAppModule is a module that contains all the common features and services
 * that are being used by the application.
 *
 * @module CommonAppModule
 */
export class CommonAppModule {
  /**
   * Configures the CommonAppModule for the application.
   *
   * @static
   * @param {CommonAppModuleOptions} options - The options for the CommonAppModule.
   * @returns {DynamicModule} - The DynamicModule for the CommonAppModule.
   */
  public static forRoot({
    logger,
    translator,
  }: CommonAppModuleOptions): DynamicModule {
    return {
      module: CommonAppModule,
      imports: [
        LoggerModule.forRoot(logger),
        TranslatorModule.forRoot(translator),
      ],
    };
  }
}

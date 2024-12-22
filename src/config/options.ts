import { join, resolve } from 'path';
import { ValidationPipeOptions } from '@nestjs/common';
import { ConfigModuleOptions } from '@nestjs/config';
import { RequestValidationError } from '@/common/errors';
import Joi from 'joi';

import {
  ErrorFormat,
  LoggerModuleOptions,
  TranslatorModuleOptions,
} from '@/types';
import { Config, Environment } from '@/enums';
import { TranslationKeySeparator } from '@/constants';

const { DEV, TEST, PROD } = Environment;

/**
 * ConfigModule options
 */
const configOptions: ConfigModuleOptions = {
  isGlobal: true,
  envFilePath: join(__dirname, `../../.env.${process.env[Config.NODE_ENV]}`),
  validationSchema: Joi.object({
    PORT: Joi.number().default(5000),
    NODE_ENV: Joi.string().valid(DEV, TEST, PROD).required(),
    API_PREFIX: Joi.string().required(),
    API_DEFAULT_VERSION: Joi.string().required(),
    DEBUG_MODE: Joi.boolean().default(false),
    GRACEFUL_SHUTDOWN_TIMEOUT: Joi.number().default(30000),
    LOCALIZATION_KEY: Joi.string().required(),
    LOCALIZATION_FALLBACK_LANGUAGE: Joi.string().required(),
  }),
  validationOptions: {
    abortEarly: true,
  },
};

/**
 * ValidationPipe options
 */
const validationPipeOptions: ValidationPipeOptions = {
  whitelist: true,
  exceptionFactory: (errors) => {
    const formatedErrors = errors?.map((error): ErrorFormat => {
      const message = Object.values(error.constraints || {})[0];
      return {
        message: message || 'common.error.Invalid_value',
        field: error.property,
        location: 'body',
        stack: null,
      };
    });
    throw new RequestValidationError(formatedErrors);
  },
};

/**
 * LoggerModule options
 */
const loggerModuleOptions: LoggerModuleOptions = {
  environment: process.env[Config.NODE_ENV] as Environment,
  logsDirPath: resolve(process.cwd(), 'logs'),
  debugMode: process.env[Config.DEBUG_MODE] == 'true',
};

/**
 * TranslatorModule options
 */
const translatorModuleOptions: TranslatorModuleOptions = {
  fallbackLanguage: process.env[Config.LOCALIZATION_FALLBACK_LANGUAGE]!,
  translationsDirPath: resolve(
    process.cwd(),
    `${
      process.env[Config.NODE_ENV] === Environment.PROD ? 'dist' : 'src'
    }/translations`
  ),
  translationsFileName: 'translations.json',
  langExtractionKey: process.env[Config.LOCALIZATION_KEY]!,
  translationKeySeparator: TranslationKeySeparator,
};

export {
  configOptions,
  validationPipeOptions,
  loggerModuleOptions,
  translatorModuleOptions,
};

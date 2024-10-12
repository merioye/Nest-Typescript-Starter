import { join, resolve } from 'path';
import { ValidationPipeOptions } from '@nestjs/common';
import { ConfigModuleOptions } from '@nestjs/config';
import { RequestValidationError } from '@/common/errors';
import { CONFIG, ENVIRONMENT } from '@/enums';
import Joi from 'joi';
import {
  ErrorFormat,
  LoggerModuleOptions,
  TranslatorModuleOptions,
} from '@/types';
import { TranslationKeySeparator } from '@/constants';

const { DEV, TEST, PROD } = ENVIRONMENT;

/**
 * ConfigModule options
 */
const configOptions: ConfigModuleOptions = {
  isGlobal: true,
  envFilePath: join(__dirname, `../../.env.${process.env[CONFIG.NODE_ENV]}`),
  validationSchema: Joi.object({
    PORT: Joi.number().default(5000),
    NODE_ENV: Joi.string().valid(DEV, TEST, PROD).required(),
    API_PREFIX: Joi.string().required(),
    API_DEFAULT_VERSION: Joi.string().required(),
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
  environment: process.env[CONFIG.NODE_ENV] as ENVIRONMENT,
  logsDirPath: resolve(process.cwd(), 'logs'),
};

/**
 * TranslatorModule options
 */
const translatorModuleOptions: TranslatorModuleOptions = {
  fallbackLanguage: 'en',
  translationsDirPath: resolve(
    process.cwd(),
    `${
      process.env[CONFIG.NODE_ENV] === ENVIRONMENT.PROD ? 'dist' : 'src'
    }/translations`
  ),
  translationsFileName: 'translations.json',
  langExtractionKey: 'lang',
  translationKeySeparator: TranslationKeySeparator,
};

export {
  configOptions,
  validationPipeOptions,
  loggerModuleOptions,
  translatorModuleOptions,
};

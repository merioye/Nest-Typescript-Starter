import { ConfigModuleOptions } from '@nestjs/config';
import { ValidationPipeOptions } from '@nestjs/common';
import Joi from 'joi';
import * as path from 'path';
import { ENVIRONMENT } from '../constants';
import { ErrorFormat } from '../types';
import { RequestValidationError } from '../errors';

const configOptions: ConfigModuleOptions = {
  isGlobal: true,
  envFilePath: path.join(__dirname, `../../.env.${process.env.NODE_ENV}`),
  validationSchema: Joi.object({
    PORT: Joi.number().default(5000),
    NODE_ENV: Joi.string()
      .valid(ENVIRONMENT.DEV, ENVIRONMENT.TEST, ENVIRONMENT.PROD)
      .required(),
    API_PREFIX: Joi.string().required(),
    API_DEFAULT_VERSION: Joi.string().required(),
  }),
  validationOptions: {
    abortEarly: true,
  },
};

const validationPipeOptions: ValidationPipeOptions = {
  whitelist: true,
  exceptionFactory: (errors) => {
    const formatedErrors = errors?.map((error): ErrorFormat => {
      return {
        message: error.constraints[Object.keys(error.constraints)[0]],
        field: error.property,
        location: 'body',
        stack: null,
      };
    });
    throw new RequestValidationError(formatedErrors);
  },
};

export { configOptions, validationPipeOptions };

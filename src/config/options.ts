import * as path from 'path';
import { ValidationPipeOptions } from '@nestjs/common';
import { ConfigModuleOptions } from '@nestjs/config';
import { RequestValidationError } from '@/common/errors';
import Joi from 'joi';
import { ErrorFormat } from '@/types';
import { ENVIRONMENT } from '@/constants';

const { DEV, TEST, PROD } = ENVIRONMENT;

// ConfigModule options
const configOptions: ConfigModuleOptions = {
  isGlobal: true,
  envFilePath: path.join(__dirname, `../../.env.${process.env.NODE_ENV}`),
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

// ValidationPipe options
const validationPipeOptions: ValidationPipeOptions = {
  whitelist: true,
  exceptionFactory: (errors) => {
    const formatedErrors = errors?.map((error): ErrorFormat => {
      const message = Object.values(error.constraints || {})[0];
      return {
        message: message || 'Invalid value',
        field: error.property,
        location: 'body',
        stack: null,
      };
    });
    throw new RequestValidationError(formatedErrors);
  },
};

export { configOptions, validationPipeOptions };

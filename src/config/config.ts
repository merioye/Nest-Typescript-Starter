import Joi from 'joi';
import * as path from 'path';
import { ConfigModuleOptions } from '@nestjs/config';
import { ENVIRONMENT } from '../constants';

export const Config: ConfigModuleOptions = {
  isGlobal: true,
  envFilePath: path.join(__dirname, `../../.env.${process.env.NODE_ENV}`),
  validationSchema: Joi.object({
    PORT: Joi.number().default(5000),
    NODE_ENV: Joi.string()
      .valid(ENVIRONMENT.DEV, ENVIRONMENT.TEST, ENVIRONMENT.PROD)
      .required(),
  }),
  validationOptions: {
    abortEarly: true,
  },
};

import Joi from 'joi';
import { ConfigModuleOptions } from '@nestjs/config';
import { ENVIRONMENT } from '../constants';

export const Config: ConfigModuleOptions = {
  isGlobal: true,
  envFilePath: `.env.${process.env.NODE_ENV || ENVIRONMENT.DEV}`,
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

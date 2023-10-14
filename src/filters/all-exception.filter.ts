import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';
import { logger } from 'src/config';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly httpAdapterHost: HttpAdapterHost;

  constructor(httpAdapterHost: HttpAdapterHost) {
    this.httpAdapterHost = httpAdapterHost;
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();

    const httpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const message =
      exception instanceof HttpException
        ? exception.message
        : 'Something went wrong';

    const type =
      exception instanceof HttpException
        ? exception.name
        : 'Internal Server Error';

    logger.error(message);

    const responseBody = {
      errors: [
        {
          type,
          message,
          path: '',
          location: '',
        },
      ],
    };

    httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
  }
}

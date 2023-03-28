import {
  ArgumentsHost,
  Catch,
  ExceptionFilter as ExceptionFilterInterface,
  HttpException,
  HttpStatus,
  Inject,
  Logger,
} from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { Request, Response } from 'express';
import { apiConfig } from '../../configs';
import {
  CustomHttpExceptionResponse,
  HttpExceptionResponse,
} from '../interfaces/exception-response.interface';

@Catch()
export class ExceptionFilter<T = any> implements ExceptionFilterInterface<T> {
  constructor(
    @Inject(apiConfig.KEY)
    private config: ConfigType<typeof apiConfig>,
  ) {}

  /**
   * Exception filter
   * @param {any} exception
   * @param {ArgumentsHost} host
   */
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const code = !('code' in exception) ? 'HttpException' : exception.code;
    let status: number;
    let message = exception?.message;
    const stack: string = exception?.stack;
    const logger = new Logger(code);

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const errorResponse = exception.getResponse();
      message =
        (errorResponse as HttpExceptionResponse).message || exception.message;
    } else {
      status = exception?.status ?? HttpStatus.INTERNAL_SERVER_ERROR;
    }
    const errorResponse = this.getErrorResponse(
      status,
      message,
      code,
      stack,
      request,
    );
    logger.error(errorResponse);
    response.status(status).json(errorResponse);
  }

  /**
   * Generate error response
   * @param {HttpStatus} status
   * @param {string} message
   * @param {string} code
   * @param {string} stack
   * @param {Request} request
   */
  private getErrorResponse = (
    status: HttpStatus,
    message: string,
    code: string,
    stack: string,
    request: Request,
  ): CustomHttpExceptionResponse => {
    return this.config.isProduction()
      ? {
          status,
          message,
        }
      : {
          status,
          message,
          code,
          stack,
          path: request.url,
          method: request.method,
          headers: request.headers,
          timestamp: new Date(),
        };
  };
}

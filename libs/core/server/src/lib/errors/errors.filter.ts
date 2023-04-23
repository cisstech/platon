import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ErrorResponse } from '@platon/core/common';
import { GraphQLError } from 'graphql';


// https://docs.nestjs.com/graphql/exception-filters

@Catch()
export class ErrorsFilter implements ExceptionFilter {
  constructor(
    private readonly logger: Logger
  ) { }


  catch(exception: any, host: ArgumentsHost) {
    // TODO create util function to get request to handle both rest and graphql
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse();

    let error: ErrorResponse;
    if (exception instanceof ErrorResponse) {
      error = exception;
    } else if (exception instanceof HttpException) {
      error = new ErrorResponse({
        status: exception.getStatus(),
        message: exception.message
      })
    } else {
      error = new ErrorResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message: exception.message || 'Internal server error'
      })
    }
    // REST request
    this.logger.error(exception.stack ?? exception)
    if (request) {
      response.status(error.statusCode).json(error);
      return
    }

    return new GraphQLError(error.message, {
      extensions: {
        code: error.statusCode,
      }
    });
  }
}

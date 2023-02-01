import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { ErrorResponse } from '@platon/core/common';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    private readonly logger: Logger
  ) {}


  catch(exception: any, host: ArgumentsHost) {
    console.error(exception)

    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    let error: ErrorResponse;

    if (exception instanceof HttpException) {
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

    this.logger.error(exception.stack ?? exception)

    response.status(error.status).json(error);
  }
}

import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Logger } from '@nestjs/common'
import { ErrorResponse } from '@platon/core/common'

@Catch()
export class ErrorsFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const response = host.switchToHttp().getResponse()

    let error: ErrorResponse
    if (exception instanceof ErrorResponse) {
      error = exception
    } else if (exception instanceof HttpException) {
      const body = exception.getResponse()
      const message =
        body && typeof body === 'object' && 'message' in body ? (body.message as string | string[]) : exception.message
      error = new ErrorResponse({
        status: exception.getStatus(),
        message,
      })
    } else {
      error = new ErrorResponse({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        message:
          (exception && typeof exception === 'object' && 'message' in exception
            ? (exception.message as string)
            : null) || 'Internal server error',
      })
    }

    this.logger.error(
      (exception && typeof exception === 'object' && 'stack' in exception ? exception.stack : null) ?? exception
    )
    response.status(error.statusCode).json(error)
  }
}

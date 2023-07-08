import { HTTP_STATUS_CODE } from './status-code'

export interface HttpResponse<T> {
  success: boolean
  statusCode: number
  message?: string
  resource?: Partial<T>
  resources?: Partial<T>[]
  total?: number
}

export class SuccessResponse implements HttpResponse<void> {
  success = true
  statusCode = HTTP_STATUS_CODE.OK
}

export class NoContentResponse implements HttpResponse<void> {
  success = true
  statusCode = HTTP_STATUS_CODE.NO_CONTENT
}

export class CreatedResponse<T> implements HttpResponse<T> {
  success = true
  statusCode = HTTP_STATUS_CODE.CREATED
  resource: T

  constructor(options: { resource: T }) {
    this.resource = options.resource
  }
}

export class ItemResponse<T> implements HttpResponse<T> {
  success = true
  statusCode = HTTP_STATUS_CODE.OK
  resource: T

  constructor(options: { resource: T }) {
    this.resource = options.resource
  }
}

export class ListResponse<T> implements HttpResponse<T> {
  success = true
  statusCode = HTTP_STATUS_CODE.OK
  resources: T[]
  total: number

  constructor(options: { resources: T[]; total: number }) {
    this.resources = options.resources
    this.total = options.total
  }
}

export class ErrorResponse implements HttpResponse<null> {
  success = false
  statusCode: number
  message: string

  constructor(options: { status: number; message: string }) {
    this.statusCode = options.status
    this.message = options.message
  }
}

/**
 * Official Documentation @ https://tools.ietf.org/html/rfc7231#section-6.5.4
 *
 * The server can not find requested resource. In the browser, this means the URL is not recognized. In an API, this can also mean that the endpoint is valid but the resource itself does not exist. Servers may also send this response instead of 403 to hide the existence of a resource from an unauthorized client. This response code is probably the most famous one due to its frequent occurence on the web.
 */
export class NotFoundResponse extends ErrorResponse {
  constructor(message: string) {
    super({
      status: HTTP_STATUS_CODE.NOT_FOUND,
      message,
    })
  }
}

/**
 * Official Documentation @ https://tools.ietf.org/html/rfc7231#section-6.5.1
 *
 * This response means that server could not understand the request due to invalid syntax.
 */
export class BadRequestResponse extends ErrorResponse {
  constructor(message: string) {
    super({
      status: HTTP_STATUS_CODE.BAD_REQUEST,
      message,
    })
  }
}

/**
 * Official Documentation @ https://tools.ietf.org/html/rfc7235#section-3.1
 *
 * Although the HTTP standard specifies "unauthorized", semantically this response means "unauthenticated". That is, the client must authenticate itself to get the requested response.
 */
export class UnauthorizedResponse extends ErrorResponse {
  constructor(message: string) {
    super({
      status: HTTP_STATUS_CODE.UNAUTHORIZED,
      message,
    })
  }
}

/**
 * Official Documentation @ https://tools.ietf.org/html/rfc7231#section-6.5.3
 *
 * The client does not have access rights to the content, i.e. they are unauthorized, so server is rejecting to give proper response. Unlike 401, the client's identity is known to the server.
 */
export class ForbiddenResponse extends ErrorResponse {
  constructor(message: string) {
    super({
      status: HTTP_STATUS_CODE.FORBIDDEN,
      message,
    })
  }
}

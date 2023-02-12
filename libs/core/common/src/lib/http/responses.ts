import { HTTP_STATUS_CODE } from "./status-code"

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

  constructor(options: {
    resource: T
  }) {
    this.resource = options.resource
  }
}

export class ItemResponse<T> implements HttpResponse<T> {
  success = true
  statusCode = HTTP_STATUS_CODE.OK
  resource: T

  constructor(options: {
    resource: T
  }) {
    this.resource = options.resource
  }
}

export class ListResponse<T> implements HttpResponse<T> {
  success = true
  statusCode = HTTP_STATUS_CODE.OK
  resources: T[]
  total: number

  constructor(options: {
    resources: T[],
    total: number
  }) {
    this.resources = options.resources
    this.total = options.total
  }
}

export class ErrorResponse implements HttpResponse<null> {
  success = false
  statusCode: number
  message: string

  constructor(options: {
    status: number
    message: string
  }) {
    this.statusCode = options.status
    this.message = options.message
  }
}

export class NotFoundResponse extends ErrorResponse {
  constructor(
    message: string
  ) {
    super({
      status: 404,
      message
    })
  }
}

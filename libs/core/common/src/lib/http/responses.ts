import { HTTP_STATUS_CODE } from "./status-code"

export interface HttpResponse<T> {
  success: boolean
  statusCode: number
  message?: string
  resource?: Partial<T>
  resources?: Partial<T>[]
  total?: number
}

// create, update, delete, archive
export class ActionSuccessResponse<T> implements HttpResponse<T> {
  success = true
  statusCode = HTTP_STATUS_CODE.OK
  message: string
  resource: T

  constructor(options: {
    message: string,
    resource: T
  }) {
    this.message = options.message
    this.resource = options.resource
  }
}

export class DeleteSuccessResponse implements HttpResponse<void> {
  success = true
  statusCode = HTTP_STATUS_CODE.OK
}


export class DetailSuccessResponse<T> implements HttpResponse<T> {
  success = true
  statusCode = HTTP_STATUS_CODE.OK
  resource: T

  constructor(options: {
    resource: T
  }) {
    this.resource = options.resource
  }
}

export class ListSuccessResponse<T> implements HttpResponse<T> {
  success = true
  statusCode = HTTP_STATUS_CODE.OK
  resources: Partial<T>[]
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

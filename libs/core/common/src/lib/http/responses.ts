import { HTTP_STATUS_CODE } from "./status-code"

export interface HttpResponse<T> {
  success: boolean
  status: number
  message?: string
  resource?: Partial<T>
  resources?: Partial<T>[]
  total?: number
}

// create, update, delete, archive
export class ActionSuccessResponse<T> implements HttpResponse<T> {
  success = true
  status = HTTP_STATUS_CODE.OK
  message: string
  resource: Partial<T>

  constructor(options: {
    message: string,
    resource: Partial<T>
  }) {
    this.message = options.message
    this.resource = options.resource
  }
}

export class DetailSuccessResponse<T> implements HttpResponse<T> {
  success = true
  status = HTTP_STATUS_CODE.OK
  resource: Partial<T>

  constructor(options: {
    resource: T
  }) {
    this.resource = options.resource
  }
}

export class ListSuccessResponse<T> implements HttpResponse<T> {
  success = true
  status = HTTP_STATUS_CODE.OK
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
  status: number
  message: string

  constructor(options: {
    status: number
    message: string
  }) {
    this.status = options.status
    this.message = options.message
  }
}

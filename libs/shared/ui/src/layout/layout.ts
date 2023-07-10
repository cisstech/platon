/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpErrorResponse } from '@angular/common/http'
import { HTTP_STATUS_CODE } from '@platon/core/common'

export interface LayoutTab {
  id: string
  title: string
  link: string | any[]
}

export declare type LayoutState = 'LOADING' | 'READY' | 'NOT_FOUND' | 'SERVER_ERROR' | 'FORBIDDEN'

export const layoutStateFromError = (error: any): LayoutState => {
  const status = (error as HttpErrorResponse).status || HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR
  if (status === HTTP_STATUS_CODE.UNAUTHORIZED || status === HTTP_STATUS_CODE.FORBIDDEN) {
    return 'FORBIDDEN'
  } else if (
    status >= HTTP_STATUS_CODE.BAD_REQUEST &&
    status < HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR
  ) {
    return 'NOT_FOUND'
  }
  return 'SERVER_ERROR'
}

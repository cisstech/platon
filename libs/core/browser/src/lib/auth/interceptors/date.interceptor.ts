/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'

@Injectable()
export class DateConversionInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      map((event: HttpEvent<any>) => {
        if (event instanceof HttpResponse) {
          const body = event.body
          this.convertDates(body)
          return event.clone({ body })
        }
        return event
      })
    )
  }

  convertDates(object: any): void {
    if (object === null || object === undefined || typeof object !== 'object') {
      return
    }

    for (const key of Object.keys(object)) {
      const value = object[key]
      if (typeof value === 'string' && this.isIso8601(value)) {
        object[key] = new Date(value)
      } else if (typeof value === 'object') {
        this.convertDates(value)
      }
    }
  }

  private isIso8601(value: string): boolean {
    const iso8601 = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(.\d+)?(([+-]\d{2}:\d{2})|Z)?$/
    return iso8601.test(value)
  }
}

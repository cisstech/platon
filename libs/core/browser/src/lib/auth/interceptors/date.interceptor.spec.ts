/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { HttpEvent, HttpHandler, HttpRequest, HttpResponse } from '@angular/common/http'
import { Observable } from 'rxjs'
import { DateConversionInterceptor } from './date.interceptor'

describe('DateConversionInterceptor', () => {
  let interceptor: DateConversionInterceptor
  let next: HttpHandler

  beforeEach(() => {
    interceptor = new DateConversionInterceptor()
    next = {
      handle: (req: HttpRequest<any>): Observable<HttpEvent<any>> => {
        return new Observable<HttpEvent<any>>()
      },
    }
  })

  it('should convert ISO 8601 date strings to Date objects in the response body', () => {
    const response = new HttpResponse<any>({
      body: {
        date: '2022-01-01T12:00:00Z',
      },
    })

    jest.spyOn(interceptor, 'convertDates')

    const result = interceptor.intercept(new HttpRequest<any>('GET', '/api'), next)
    result.subscribe((event: HttpEvent<any>) => {
      if (event instanceof HttpResponse) {
        expect(event.body.date instanceof Date).toBe(true)
        expect(event.body.date.toISOString()).toBe('2022-01-01T12:00:00.000Z')
        expect(interceptor.convertDates).toHaveBeenCalledWith(event.body)
      }
    })
  })

  it('should not convert non-ISO 8601 date strings in the response body', () => {
    const response = new HttpResponse<any>({
      body: {
        date: '2022-01-01',
      },
    })

    jest.spyOn(interceptor, 'convertDates')

    const result = interceptor.intercept(new HttpRequest<any>('GET', '/api'), next)
    result.subscribe((event: HttpEvent<any>) => {
      if (event instanceof HttpResponse) {
        expect(event.body.date).toBe('2022-01-01')
        expect(interceptor.convertDates).toHaveBeenCalledWith(event.body)
      }
    })
  })

  it('should not convert dates in nested objects in the response body', () => {
    const response = new HttpResponse<any>({
      body: {
        nested: {
          date: '2022-01-01T12:00:00Z',
        },
      },
    })

    jest.spyOn(interceptor, 'convertDates')

    const result = interceptor.intercept(new HttpRequest<any>('GET', '/api'), next)
    result.subscribe((event: HttpEvent<any>) => {
      if (event instanceof HttpResponse) {
        expect(event.body.nested.date).toBe('2022-01-01T12:00:00Z')
        expect(interceptor.convertDates).toHaveBeenCalledWith(event.body)
      }
    })
  })
})

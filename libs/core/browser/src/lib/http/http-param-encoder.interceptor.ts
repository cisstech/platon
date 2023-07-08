/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpParameterCodec,
  HttpParams,
  HttpRequest,
  HttpUrlEncodingCodec,
} from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable } from 'rxjs'

export class HttpParamEncoder implements HttpParameterCodec {
  encodeKey(key: string): string {
    return encodeURIComponent(key)
  }
  encodeValue(value: string): string {
    return encodeURIComponent(value)
  }
  decodeKey(key: string): string {
    return decodeURIComponent(key)
  }
  decodeValue(value: string): string {
    return decodeURIComponent(value)
  }
}

@Injectable()
export class HttpParamEncoderInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const params = new HttpParams({
      encoder: new HttpParamEncoder(),
      // deepcode ignore HTTPSourceWithUncheckedType: <please specify a reason of ignoring this>
      fromString: req.params.toString(),
    })
    const httpUrlEncoding = new HttpUrlEncodingCodec()
    return next.handle(
      req.clone({
        params,
        url: httpUrlEncoding.encodeValue(req.url),
      })
    )
  }
}

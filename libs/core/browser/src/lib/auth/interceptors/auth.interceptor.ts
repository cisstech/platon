import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http'
import { Injectable, inject } from '@angular/core'
import { ErrorResponse, TOKEN_EXPIRED_ERROR_CODE } from '@platon/core/common'
import { Observable, catchError, from, switchMap, throwError } from 'rxjs'
import { TokenService } from '../api/token.service'

const withBearer = <T>(req: HttpRequest<T>, token: string): HttpRequest<T> =>
  req.clone({ headers: req.headers.set('Authorization', `Bearer ${token}`) })

/** The message of an error body, read as JSON whatever type the request asked for. */
const messageOf = (body: unknown): unknown => {
  if (typeof body !== 'string') return (body as ErrorResponse | null)?.message
  try {
    return (JSON.parse(body) as ErrorResponse | null)?.message
  } catch {
    return undefined
  }
}

const tokenExpired = (error: unknown): boolean =>
  error instanceof HttpErrorResponse && error.status === 401 && messageOf(error.error) === TOKEN_EXPIRED_ERROR_CODE

/**
 * Sends each request with a fresh access token of the session, renewed first when it has expired. A
 * request the API still finds expired, as with a clock off, is sent again once with a renewed token;
 * the requests that expire together share one renewal.
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private readonly tokens = inject(TokenService)

  intercept<T>(req: HttpRequest<T>, next: HttpHandler): Observable<HttpEvent<T>> {
    // A request that names its token goes as it is: the renewal sends the refresh token.
    if (req.headers.has('Authorization')) return next.handle(req)
    return from(this.tokens.fresh()).pipe(
      switchMap((token) => (token ? this.send(req, next, token.accessToken) : next.handle(req)))
    )
  }

  private send<T>(req: HttpRequest<T>, next: HttpHandler, accessToken: string): Observable<HttpEvent<T>> {
    return next.handle(withBearer(req, accessToken)).pipe(
      catchError((error: unknown) => {
        if (!tokenExpired(error)) return throwError(() => error)
        return from(this.tokens.renewedAfter(accessToken)).pipe(
          catchError(() => throwError(() => error)),
          switchMap((token) => next.handle(withBearer(req, token.accessToken)))
        )
      })
    )
  }
}

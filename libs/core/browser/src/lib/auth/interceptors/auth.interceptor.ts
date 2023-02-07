/* eslint-disable @typescript-eslint/no-explicit-any */
import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { AuthToken } from '@platon/core/common';

import { BehaviorSubject, from, Observable, throwError } from 'rxjs';
import { catchError, filter, finalize, switchMap, take } from 'rxjs/operators';

import { RemoteTokenProvider } from '../services/remote-token-provider';


/**
 * Intercepts http request to add Authorization header with logged user json web token.
 */
@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private readonly token$ = new BehaviorSubject<AuthToken | undefined>(undefined);

  constructor(
    private readonly tokenProvider: RemoteTokenProvider
  ) { }

  intercept(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return from(this.tokenProvider.token()).pipe(
      switchMap(token => {
        if (token != null) {
          return next.handle(this.addAuthorization(req, token)).pipe(
            catchError<any, any>(err => {
              if (err?.error?.code === 'token_not_valid') {
                return this.refreshToken(req, next);
              }
              return throwError(() => new Error(err));
            })
          );
        }
        return next.handle(req);
      })
    )
  }

  private refreshToken(
    req: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;

      // future requests will wait until the refresh token is resolved
      this.token$.next(undefined);

      return from(this.tokenProvider.refresh()).pipe(
        switchMap(token => {
          return next.handle(this.addAuthorization(req, token));
        }),
        finalize(() => this.isRefreshing = false)
      );
    }

    return this.token$.pipe(
      filter(token => token != null),
      take(1),
      switchMap(token => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return next.handle(this.addAuthorization(req, token!));
      })
    );
  }

  private addAuthorization(
    req: HttpRequest<any>,
    token: AuthToken
  ): HttpRequest<any> {
    return req.clone({
      headers: req.headers.set('Authorization', 'Bearer ' + token.accessToken),
    });
  }

}

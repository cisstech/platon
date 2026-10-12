import { HttpErrorResponse } from '@angular/common/http'
import { Injectable, inject } from '@angular/core'
import { JwtHelperService } from '@auth0/angular-jwt'
import { AuthToken } from '@platon/core/common'
import { TokenProvider } from '../models/token-provider'

/** A renewal that has not answered by then gives way to the next attempt. */
const RENEWAL_LIMIT = 15_000

/** Seconds of margin, so that a token does not expire on its way to the API. */
const EXPIRY_MARGIN = 10

/** Whether the access token must be renewed before it is sent: it has expired, or it has no type. */
const stale = ({ accessToken }: AuthToken): boolean => {
  try {
    const helper = new JwtHelperService()
    return (
      helper.decodeToken<{ typ?: string }>(accessToken)?.typ !== 'access' ||
      helper.isTokenExpired(accessToken, EXPIRY_MARGIN)
    )
  } catch {
    return true
  }
}

/** Whether a failed renewal means the session is over, rather than an API that did not answer. */
const sessionIsOver = (error: unknown): boolean =>
  error instanceof HttpErrorResponse
    ? error.status === 401 || error.status === 403
    : error instanceof Error && error.message.startsWith('auth/')

const withLimit = <T>(promise: Promise<T>, limit: number): Promise<T> =>
  new Promise<T>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('The renewal of the session did not answer')), limit)
    promise.then(
      (value) => {
        clearTimeout(timer)
        resolve(value)
      },
      (error: unknown) => {
        clearTimeout(timer)
        reject(error)
      }
    )
  })

@Injectable({ providedIn: 'root' })
export class TokenService {
  private readonly provider = inject(TokenProvider)
  /** The renewal in progress, shared by everyone who needs one meanwhile. */
  private renewal?: Promise<AuthToken>

  tokenSync(): AuthToken | undefined {
    return this.provider.tokenSync()
  }

  /** The token of the session; during a renewal, the renewed one, or the stored one if it fails. */
  token(): Promise<AuthToken | undefined> {
    return this.renewal ? this.renewal.catch(() => this.provider.token()) : this.provider.token()
  }

  /**
   * The token of the session, renewed first when its access token has expired or has no type: a
   * public route serves an expired token as nobody, without saying so.
   */
  fresh(): Promise<AuthToken | undefined> {
    return this.token().then((token) =>
      token && stale(token) ? this.refresh().catch(() => this.provider.token()) : token
    )
  }

  /**
   * A token newer than an access token the API found expired: the renewal in progress, which fails if
   * it fails, the token stored since, or a new renewal.
   */
  renewedAfter(expiredAccessToken: string): Promise<AuthToken> {
    if (this.renewal) return this.renewal
    return this.provider
      .token()
      .then((token) => (token && token.accessToken !== expiredAccessToken ? token : this.refresh()))
  }

  /**
   * Renews the access token; calls made while a renewal runs share it. A refused renewal ends the
   * session; one that does not answer within 15 s gives way to the next attempt.
   */
  refresh(): Promise<AuthToken> {
    if (this.renewal) return this.renewal
    const renewal = withLimit(this.provider.refresh(), RENEWAL_LIMIT).catch((error: unknown) =>
      sessionIsOver(error) ? this.remove().then(() => Promise.reject(error)) : Promise.reject(error)
    )
    this.renewal = renewal
    const settle = () => {
      if (this.renewal === renewal) this.renewal = undefined
    }
    renewal.then(settle, settle)
    return renewal
  }

  /** Ends the session; a renewal in progress no longer stands for it. */
  remove(): Promise<void> {
    this.renewal = undefined
    return this.provider.remove()
  }

  obtain(username: string, password: string): Promise<AuthToken> {
    this.renewal = undefined
    return this.provider.obtain(username, password)
  }

  /** Starts a session with these tokens; a renewal in progress no longer stands for it. */
  save(token: AuthToken): Promise<void> {
    this.renewal = undefined
    return this.provider.save(token)
  }
}

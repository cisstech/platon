import { HttpClient } from '@angular/common/http'
import { Injectable, inject } from '@angular/core'
import { JwtHelperService } from '@auth0/angular-jwt'
import { AuthToken, ItemResponse } from '@platon/core/common'
import { firstValueFrom, lastValueFrom } from 'rxjs'
import { StorageService } from '../../services'
import { TokenProvider } from '../models/token-provider'

const KEY = 'auth-token'

/**
 * Handles JWT token generation/storage/refresh.
 */
@Injectable()
export class RemoteTokenProvider extends TokenProvider {
  private readonly http = inject(HttpClient)
  private readonly storage = inject(StorageService)

  tokenSync(): AuthToken | undefined {
    try {
      return JSON.parse(localStorage.getItem(KEY) || 'null') as AuthToken
    } catch {
      return undefined
    }
  }

  /**
   * Gets the current auth token if it exists.
   * @returns A promise that resolves with an auth token or `undefined`.
   */
  token(): Promise<AuthToken | undefined> {
    return firstValueFrom(this.storage.get<AuthToken>(KEY))
  }

  /** Deletes the current auth token */
  remove(): Promise<void> {
    localStorage.removeItem(KEY)
    return firstValueFrom(this.storage.remove(KEY))
  }

  /**
   * Generates new auth token for the identified by `username`.
   *
   * Once the token is generared, it will be stored to the browser localStorage.
   * You must call `remove()` method to delete it.
   *
   * @param username An user name.
   * @param password An user password.
   * @returns A promise that resolves with an auth token.
   */
  async obtain(username: string, password: string): Promise<AuthToken> {
    const response = await lastValueFrom(
      this.http.post<ItemResponse<AuthToken>>('/api/v1/auth/signin/', {
        username,
        password,
      })
    )

    await firstValueFrom(this.storage.set(KEY, response.resource))
    localStorage.setItem(KEY, JSON.stringify(response.resource))

    return response.resource
  }

  /**
   * Renews the access token with the refresh token, sent as the Bearer by this request itself. The API
   * gives back the same refresh token, or a typed one for an untyped token: both are kept. A sign-in or
   * a sign-out during the renewal wins: the renewed tokens are then dropped. Whether a failure ends the
   * session is for `TokenService` to decide.
   */
  async refresh(): Promise<AuthToken> {
    const token = await this.token()
    if (!token) {
      throw new Error('auth/no-token')
    }

    if (new JwtHelperService().isTokenExpired(token.refreshToken)) {
      throw new Error('auth/refresh-token-expired')
    }

    try {
      const response = await lastValueFrom(
        this.http.post<ItemResponse<AuthToken>>(
          '/api/v1/auth/refresh/',
          {},
          { headers: { Authorization: `Bearer ${token.refreshToken}` } }
        )
      )
      const current = await this.token()
      if (current?.refreshToken !== token.refreshToken) {
        if (!current) throw new Error('auth/no-token')
        return current
      }
      await this.save(response.resource)
      return response.resource
    } catch (error) {
      console.error('Unable to renew the session', error)
      throw error
    }
  }

  async save(token: AuthToken) {
    await firstValueFrom(this.storage.set(KEY, token))
    localStorage.setItem(KEY, JSON.stringify(token))
  }
}

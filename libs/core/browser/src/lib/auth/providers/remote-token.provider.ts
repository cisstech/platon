import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import { AuthToken, ItemResponse } from '@platon/core/common';
import { firstValueFrom, lastValueFrom } from 'rxjs';
import { StorageService } from '../../services';

const KEY = "auth-token";

/**
 * Handles JWT token generation/storage/refresh.
 */
@Injectable({ providedIn: 'root' })
export class RemoteTokenProvider {

  constructor(
    private readonly http: HttpClient,
    private readonly storage: StorageService,
  ) { }

  /**
   * Gets the current auth token if it exists.
   * @returns A promise that resolves with an auth token or `undefined`.
   */
  token(): Promise<AuthToken | undefined> {
    return firstValueFrom(this.storage.get<AuthToken>(KEY))
  }

  /** Deletes the current auth token */
  remove(): Promise<void> {
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
        password
      })
    )

    await firstValueFrom(this.storage.set(KEY, response.resource))

    return response.resource;
  }

  /**
   * Refreshs the current auth token.
   * @returns A promise that resolves with an auth token.
   */
  async refresh(): Promise<AuthToken> {
    const token = await this.token();
    if (!token) {
      throw new Error('auth/no-token');
    }

    const helper = new JwtHelperService();
    if (helper.isTokenExpired(token.refreshToken)) {
      await this.remove();
      throw new Error('auth/refresh-token-expired');
    }

    try {
      const response = await lastValueFrom(
        this.http.post<ItemResponse<AuthToken>>('/api/v1/auth/refresh/', {})
      );
      token.accessToken = response.resource.accessToken;
      await firstValueFrom(this.storage.set(KEY, token))
      return token;
    } catch (error) {
      await this.remove();
      throw error;
    }
  }
}

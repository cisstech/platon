import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { AuthProvider } from '../models/auth-provider';
import { RemoteTokenProvider } from './remote-token.provider';
import { lastValueFrom } from 'rxjs';
import { AuthToken, ItemResponse, User } from '@platon/core/common';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable()
export class RemoteAuthProvider extends AuthProvider {
  constructor(
    private readonly http: HttpClient,
    private readonly tokenProvider: RemoteTokenProvider
  ) {
    super();
  }

  token(): Promise<AuthToken | undefined> {
    return this.tokenProvider.token();
  }

  async current(): Promise<User | undefined> {
    const token = await this.tokenProvider.token();
    if (token) {
      const helper = new JwtHelperService();
      const data = helper.decodeToken(token.accessToken);
      try {
        return await lastValueFrom(
          this.http.get<ItemResponse<User>>('/api/v1/users/' + data.username)
        ).then(response => response.resource);
      } catch {
        await this.tokenProvider.remove();
      }
    }
    return undefined;
  }

  async signIn(username: string, password: string): Promise<User> {
    await this.tokenProvider.obtain(username, password);
    return lastValueFrom(
      this.http.get<ItemResponse<User>>('/api/v1/users/' + username)
    ).then(response => response.resource);
  }

  async signOut(): Promise<void> {
    // TODO implements server sign-out to invalid token.
    // await lastValueFrom(this.http.post('/api/v1/auth/signout/', {}));
    await this.tokenProvider.remove();
  }
}

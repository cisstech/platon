import { HttpClient } from '@angular/common/http'
import { Injectable } from '@angular/core'

import { JwtHelperService } from '@auth0/angular-jwt'
import { AuthToken, ItemResponse, ResetPasswordInput, User } from '@platon/core/common'
import { lastValueFrom } from 'rxjs'
import { TokenService } from '../api/token.service'
import { AuthProvider } from '../models/auth-provider'

@Injectable()
export class RemoteAuthProvider extends AuthProvider {
  constructor(private readonly http: HttpClient, private readonly tokenService: TokenService) {
    super()
  }

  token(): Promise<AuthToken | undefined> {
    return this.tokenService.token()
  }

  async current(): Promise<User | undefined> {
    const token = await this.tokenService.token()
    if (token) {
      const helper = new JwtHelperService()
      const data = helper.decodeToken(token.accessToken)
      try {
        return await lastValueFrom(this.http.get<ItemResponse<User>>('/api/v1/users/' + data.username)).then(
          (response) => response.resource
        )
      } catch {
        this.signOut()
      }
    }
    return undefined
  }

  async signIn(username: string, password: string): Promise<User> {
    await this.tokenService.obtain(username, password)
    return this.current() as Promise<User>
  }

  async signInWithToken(token: AuthToken): Promise<User> {
    await this.tokenService.save(token)
    return this.current() as Promise<User>
  }

  async resetPassword(input: ResetPasswordInput): Promise<User> {
    const token = await lastValueFrom(
      this.http.post<ItemResponse<AuthToken>>('/api/v1/auth/reset-password/', input)
    ).then((response) => response.resource)
    await this.tokenService.save(token)
    return this.current() as Promise<User>
  }

  async signOut(): Promise<void> {
    // TODO implements server sign-out to invalid token.
    // await lastValueFrom(this.http.post('/api/v1/auth/signout/', {}));
    await this.tokenService.remove()
  }
}

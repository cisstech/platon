import { Injectable, Injector } from '@angular/core'
import { Router } from '@angular/router'
import { AuthToken, ResetPasswordInput, User } from '@platon/core/common'
import { firstValueFrom, Observable, of } from 'rxjs'
import { shareReplay, take } from 'rxjs/operators'
import { AuthObserver, AUTH_OBSERVER } from '../models/auth'
import { AuthProvider } from '../models/auth-provider'

/**
 * Facade class that will provide access to the authentification api of the platform.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private user?: User
  private request?: Observable<User | undefined>

  private get observers(): AuthObserver[] {
    return this.injector.get<object[]>(AUTH_OBSERVER, []).map((type) => {
      return this.injector.get(type, [])
    })
  }

  constructor(
    private readonly router: Router,
    private readonly injector: Injector,
    private readonly authProvider: AuthProvider
  ) {}

  token(): Promise<AuthToken | undefined> {
    return this.authProvider.token()
  }

  /**
   * Checks whether there is an authentificated user or not.
   *
   * Note:
   * This method will notify all the observers that implements `AuthObserver` interface if needed.
   *
   * @returns An promise that will resolves with the authentificated user if it exists or `undefined`
   */
  async ready(): Promise<User | undefined> {
    if (this.request) {
      return firstValueFrom(this.request)
    }

    if (this.user) {
      return Promise.resolve(this.user)
    }

    if (!this.request) {
      this.request = new Observable<User | undefined>((observer) => {
        this.connect()
          .then((user) => {
            observer.next(user)
            observer.complete()
            this.request = undefined
          })
          .catch((error) => {
            console.error(error)
            observer.next(undefined)
            observer.complete()
            this.request = undefined
          })
      }).pipe(take(1), shareReplay(1))
    }

    return this.request ? firstValueFrom(this.request) : undefined
  }

  /**
   * Sign in an user using username and password.
   * @param username the username of the user
   * @param password the password of the user
   */
  async signIn(username: string, password: string): Promise<User> {
    const user = await this.authProvider.signIn(username, password)
    this.request = undefined
    return user
  }

  async signInWithToken(token: AuthToken): Promise<User> {
    const user = await this.authProvider.signInWithToken(token)
    this.request = undefined
    return user
  }

  async resetPassword(input: ResetPasswordInput): Promise<User> {
    const user = await this.authProvider.resetPassword(input)
    this.request = of(user)
    return user
  }

  /**
   * Sign out the current user.
   *
   * @remarks
   * - backToLogin is meant to be set to false only when the user is already on the login page
   *   and wants to sign out while keeping url unchanged with query params.
   * - This method will notify all the observers that implements `AuthObserver` interface if needed.
   *
   * @param backToLogin if `true` the user will be redirected to the login page after the sign out.
   *
   **/
  async signOut(backToLogin = true): Promise<void> {
    if (backToLogin) {
      await this.router.navigateByUrl('/login', { replaceUrl: true })
    }

    if (this.user) {
      for (const observer of this.observers) {
        await observer.onChangeAuth({
          type: 'disconnection',
          user: this.user,
        })
      }
      this.user = undefined
    }

    await this.authProvider.signOut()
  }

  private async connect(): Promise<User> {
    const user = await this.authProvider.current()
    if (user == null) {
      throw new Error('auth/not-connected')
    }

    for (const observer of this.observers) {
      await observer.onChangeAuth({
        user,
        type: 'connection',
      })
    }

    return user
  }
}

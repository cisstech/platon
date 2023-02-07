import { Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { AuthToken, UserDTO } from '@platon/core/common';
import { firstValueFrom, Observable } from 'rxjs';
import { shareReplay, take } from 'rxjs/operators';
import { AuthObserver, AUTH_OBSERVER } from '../models/auth';
import { AuthProvider } from '../models/auth-provider';

/**
 * Facade class that will provide access to the authentification api of the platform.
 */
@Injectable({ providedIn: 'root' })
export class AuthService {
  private user?: UserDTO;
  private request?: Observable<UserDTO | undefined>;

  private get observers(): AuthObserver[] {
    return this.injector.get<object[]>(AUTH_OBSERVER, []).map(type => {
      return this.injector.get(type, []);
    });
  }

  constructor(
    private readonly router: Router,
    private readonly injector: Injector,
    private readonly authProvider: AuthProvider,
  ) { }

  token(): Promise<AuthToken | undefined> {
    return this.authProvider.token();
  }

  /**
   * Checks whether there is an authentificated user or not.
   *
   * Note:
   * This method will notify all the observers that implements `AuthObserver` interface if needed.
   *
   * @returns An promise that will resolves with the authentificated user if it exists or `undefined`
   */
  async ready(): Promise<UserDTO | undefined> {
    if (this.request) {
      return firstValueFrom(this.request);
    }

    if (this.user) {
      return Promise.resolve(this.user);
    }

    if (!this.request) {
      this.request = new Observable<UserDTO | undefined>(observer => {
        this.connect().then((user) => {
          observer.next(user);
          observer.complete();
          this.request = undefined;
        }).catch(error => {
          console.error(error);
          observer.next(undefined);
          observer.complete();
          this.request = undefined;
        });
      }).pipe(
        take(1),
        shareReplay(1)
      );
    }

    return this.request ? firstValueFrom(this.request) : undefined
  }

  /**
   * Sign in an user using username and password.
   * @param username the username of the user
   * @param password the password of the user
   */
  signIn(username: string, password: string): Promise<UserDTO> {
    return this.authProvider.signIn(username, password);
  }

  /**
   * Sign out the current user.
   *
   * Note:
   * This method will notify all the observers that implements `AuthObserver` interface if needed.
   *
   **/
  async signOut(): Promise<void> {
    await this.router.navigateByUrl('/login', { replaceUrl: true });

    if (this.user) {
      for (const observer of this.observers) {
        await observer.onChangeAuth({
          type: 'disconnection',
          user: this.user
        });
      }
      this.user = undefined;
    }

    await this.authProvider.signOut();
  }


  private async connect(): Promise<UserDTO> {
    const user = await this.authProvider.current();
    if (user == null) {
      throw new Error('auth/not-connected');
    }

    for (const observer of this.observers) {
      await observer.onChangeAuth({
        user,
        type: 'connection',
      });
    }

    return user;
  }
}

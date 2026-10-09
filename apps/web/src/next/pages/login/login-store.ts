import { Injectable, inject, signal } from '@angular/core'
import { LoadStatus } from '@platon/design-system'
import { firstValueFrom } from 'rxjs'
import { Connectivity } from '../../core/connectivity/connectivity'
import { Session } from '../../core/session/session'
import { LoginApi } from './login-api'
import { SignInFailure, failureOf } from './login.vm'

/**
 * The sign-in page: the institution accounts, the sign-in at work, and why it failed. Provided by its
 * route. The form never waits for the API; the list of institution accounts has its own status, so
 * that the page keeps their place while they load and says when they cannot.
 */
@Injectable()
export class LoginStore {
  private readonly session = inject(Session)
  private readonly api = inject(LoginApi)
  private readonly online = inject(Connectivity).online

  readonly cas = signal<string[]>([])
  readonly casStatus = signal<LoadStatus>('idle')
  readonly submitting = signal(false)
  readonly failure = signal<SignInFailure | undefined>(undefined)

  /** `failure` is the one the address brings back, from a refused token or the CAS. */
  load(failure?: SignInFailure): void {
    this.failure.set(failure)
    this.loadCas()
  }

  loadCas(): void {
    this.casStatus.set('loading')
    firstValueFrom(this.api.casNames()).then(
      (names) => {
        this.cas.set(names)
        this.casStatus.set('ready')
      },
      (error: unknown) => {
        console.error(error)
        this.cas.set([])
        this.casStatus.set('error')
      }
    )
  }

  /** Ends a sign-in that could not go on, with the failure to say. */
  stopWith(failure: SignInFailure): void {
    this.failure.set(failure)
    this.submitting.set(false)
  }

  /** True once the session has the person; the page then leaves, so it keeps saying it works. */
  signIn(username: string, password: string): Promise<boolean> {
    const name = username.trim()
    if (!name || !password) {
      this.failure.set('missing')
      return Promise.resolve(false)
    }
    this.failure.set(undefined)
    this.submitting.set(true)
    return this.session.signIn(name, password).then(
      () => true,
      (error: unknown) => {
        this.failure.set(failureOf(error, this.online()))
        this.submitting.set(false)
        return false
      }
    )
  }
}

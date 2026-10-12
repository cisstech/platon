import { Injectable, inject } from '@angular/core'
import { AuthToken } from '@platon/core/common'
import { Observable, Subject } from 'rxjs'
import { TokenProvider } from '../models/token-provider'

@Injectable({ providedIn: 'root' })
export class TokenService {
  private readonly provider = inject(TokenProvider)
  private readonly removed = new Subject<void>()

  /** Emits once the token is removed, as when the person signs out in this tab. */
  readonly signedOut: Observable<void> = this.removed.asObservable()

  tokenSync(): AuthToken | undefined {
    return this.provider.tokenSync()
  }

  token(): Promise<AuthToken | undefined> {
    return this.provider.token()
  }

  remove(): Promise<void> {
    return this.provider.remove().then(() => this.removed.next())
  }

  obtain(username: string, password: string): Promise<AuthToken> {
    return this.provider.obtain(username, password)
  }

  refresh(): Promise<AuthToken> {
    return this.provider.refresh()
  }

  save(token: AuthToken): Promise<void> {
    return this.provider.save(token)
  }
}

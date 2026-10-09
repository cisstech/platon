import { Injectable, computed, inject, signal } from '@angular/core'
import { AuthService } from '@platon/core/browser/shared'
import { AuthToken, User, UserRoles, isTeacherRole } from '@platon/core/common'
import { PageNavigation } from '../../../shared/page-navigation'

/**
 * The person using the new interface. Loaded once, the first time a guard or a screen asks for it,
 * then kept until a sign-in replaces it or a sign-out forgets it: `AuthService.ready()` would fetch it
 * again on every call.
 */
@Injectable({ providedIn: 'root' })
export class Session {
  private readonly auth = inject(AuthService)
  private readonly navigation = inject(PageNavigation)
  private loading?: Promise<User | undefined>

  private readonly current = signal<User | undefined>(undefined)

  readonly user = this.current.asReadonly()
  readonly role = computed(() => this.current()?.role)
  readonly isAdmin = computed(() => this.role() === UserRoles.admin)
  /** Teachers and administrators: they create courses and resources. */
  readonly isTeacher = computed(() => isTeacherRole(this.role()))

  load(): Promise<User | undefined> {
    this.loading ??= this.auth.ready().then((user) => {
      this.current.set(user)
      return user
    })
    return this.loading
  }

  /** Signs in with a username and a password; the person replaces the one kept, or the absence of one. */
  signIn(username: string, password: string): Promise<User> {
    return this.adopt(this.auth.signIn(username, password))
  }

  /** Signs in with the tokens an address brings (LTI, CAS, an invitation); forgets them if they bring nobody. */
  async signInWithToken(token: AuthToken): Promise<User> {
    try {
      return await this.adopt(this.auth.signInWithToken(token))
    } catch (error) {
      await this.auth.signOut(false)
      this.loading = undefined
      this.current.set(undefined)
      throw error
    }
  }

  /**
   * Removes the token, then loads the sign-in page anew: nothing of the person stays in the memory of
   * the page, the stores of the frame included. The token goes first: a page load would abort its
   * deletion from IndexedDB.
   */
  async signOut(): Promise<void> {
    await this.auth.signOut(false)
    this.loading = undefined
    this.current.set(undefined)
    this.navigation.replace('/login')
  }

  private async adopt(signingIn: Promise<User | undefined>): Promise<User> {
    const user = await signingIn
    if (!user) throw new Error('auth/not-connected')
    this.loading = Promise.resolve(user)
    this.current.set(user)
    return user
  }
}

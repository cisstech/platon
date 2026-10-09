import { Injectable, computed, inject, signal } from '@angular/core'
import { Router } from '@angular/router'
import { AuthService } from '@platon/core/browser/shared'
import { User, UserRoles, isTeacherRole } from '@platon/core/common'

/**
 * The person using the new interface. Loaded once, the first time a guard or a screen asks for it,
 * then kept until sign out: `AuthService.ready()` would fetch it again on every call.
 */
@Injectable({ providedIn: 'root' })
export class Session {
  private readonly auth = inject(AuthService)
  private readonly router = inject(Router)
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

  /**
   * Removes the token before leaving: the sign-in page opens in the current interface, a full load
   * that would abort the deletion of a token still in IndexedDB.
   */
  async signOut(): Promise<void> {
    await this.auth.signOut(false)
    this.loading = undefined
    this.current.set(undefined)
    await this.router.navigateByUrl('/login', { replaceUrl: true })
  }
}

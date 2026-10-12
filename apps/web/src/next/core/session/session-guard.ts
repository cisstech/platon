import { inject } from '@angular/core'
import { CanActivateFn, Router } from '@angular/router'
import { UserRoles } from '@platon/core/common'
import { Session } from './session'

/**
 * Lets in a signed-in, active person with one of `roles`. Otherwise it leads to the same pages as
 * the current interface: `/login?next=…`, the sign-in page of this interface; `/403?reason=disabled`
 * for a disabled account, `/403` for a role that is not allowed, which open in the current interface
 * through the bridge.
 */
export const sessionGuard =
  (roles: readonly UserRoles[]): CanActivateFn =>
  async (_route, state) => {
    const router = inject(Router)
    const user = await inject(Session).load()
    if (!user) return router.createUrlTree(['/login'], { queryParams: { next: state.url } })
    if (!user.active) return router.createUrlTree(['/403'], { queryParams: { reason: 'disabled' } })
    if (!roles.includes(user.role)) return router.createUrlTree(['/403'])
    return true
  }

/** The roles the shell admits today: every signed-in role but the candidate. */
export const SHELL_ROLES: readonly UserRoles[] = [UserRoles.student, UserRoles.teacher, UserRoles.admin, UserRoles.demo]

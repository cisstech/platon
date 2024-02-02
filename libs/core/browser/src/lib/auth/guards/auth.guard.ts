import { Injectable } from '@angular/core'
import { ActivatedRouteSnapshot, Route, Router, RouterStateSnapshot } from '@angular/router'
import { UserRoles } from '@platon/core/common'
import { AuthService } from '../api/auth.service'

@Injectable({ providedIn: 'root' })
export class AuthGuard {
  constructor(private readonly router: Router, private readonly authService: AuthService) {}

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const user = await this.authService.ready()
    if (user) {
      if (!user.active) {
        this.redirect403('disabled')
        return false
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const roles: UserRoles[] = (route.data as any).roles || []
      if (!roles.length) {
        return true
      }

      if (!roles.includes(user.role)) {
        this.redirect403()
        return false
      }

      return true
    }

    return this.router.createUrlTree(['/login'], {
      queryParams: { next: state.url },
      queryParamsHandling: 'merge',
    })
  }

  private redirect403(reason?: string) {
    this.router
      .navigate(['/403'], {
        skipLocationChange: true,
        queryParams: { reason },
      })
      .catch(console.error)
  }
}

export const withAuthGuard = (route: Route, roles?: (UserRoles | keyof typeof UserRoles)[]): Route => ({
  ...route,
  canActivate: [...(route.canActivate || []), AuthGuard],
  data: { ...(route.data || {}), roles },
})

import { TestBed } from '@angular/core/testing'
import { ActivatedRouteSnapshot, Router, RouterStateSnapshot, UrlTree, provideRouter } from '@angular/router'
import { User, UserRoles } from '@platon/core/common'
import { Session } from './session'
import { SHELL_ROLES, sessionGuard } from './session-guard'

describe('sessionGuard', () => {
  let user: User | undefined

  const check = async (url = '/courses?tab=mine') => {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: Session, useValue: { load: () => Promise.resolve(user) } }],
    })
    const result = await TestBed.runInInjectionContext(() =>
      sessionGuard(SHELL_ROLES)({} as ActivatedRouteSnapshot, { url } as RouterStateSnapshot)
    )
    return result instanceof UrlTree ? TestBed.inject(Router).serializeUrl(result) : result
  }

  it('sends a person who is not signed in to the sign-in page, then back', async () => {
    user = undefined
    expect(await check()).toBe('/login?next=%2Fcourses%3Ftab%3Dmine')
  })

  it('sends a disabled account to the 403 page with the reason', async () => {
    user = { role: UserRoles.student, active: false } as User
    expect(await check()).toBe('/403?reason=disabled')
  })

  it('keeps a candidate out of the shell', async () => {
    user = { role: UserRoles.candidate, active: true } as User
    expect(await check()).toBe('/403')
  })

  it.each([UserRoles.student, UserRoles.teacher, UserRoles.admin, UserRoles.demo])(
    'lets in the %s role',
    async (role) => {
      user = { role, active: true } as User
      expect(await check()).toBe(true)
    }
  )
})

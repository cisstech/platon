import { TestBed } from '@angular/core/testing'
import { Router, provideRouter, withComponentInputBinding } from '@angular/router'
import { RouterTestingHarness } from '@angular/router/testing'
import { of } from 'rxjs'
import { PORTED_PATHS } from '../shared/ported-paths'
import { Session } from './core/session/session'
import { nextRoutes } from './next.routes'
import { Login } from './pages/login/login'
import { LoginApi } from './pages/login/login-api'

describe('nextRoutes', () => {
  it('serves exactly the ported addresses the current interface sends back, in the shell or out of it', () => {
    const served = nextRoutes.flatMap((route) => {
      if (route.path === '**') return []
      if (route.path) return [`/${route.path}`]
      return ['/', ...(route.children ?? []).filter((child) => child.path).map((child) => `/${child.path}`)]
    })
    expect(served.sort()).toEqual([...PORTED_PATHS].sort())
  })

  it('serves the sign-in page out of the frame, to a person without a session', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(nextRoutes, withComponentInputBinding()),
        { provide: Session, useValue: { load: () => Promise.resolve(undefined) } },
        { provide: LoginApi, useValue: { casNames: () => of([]) } },
      ],
    })
    const harness = await RouterTestingHarness.create()

    expect(await harness.navigateByUrl('/login?next=%2Fcourses', Login)).toBeInstanceOf(Login)
    expect(TestBed.inject(Router).url).toBe('/login?next=%2Fcourses')
    expect(harness.fixture.nativeElement.querySelector('app-shell')).toBeNull()
  })
})

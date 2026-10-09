import { signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { Router, provideRouter } from '@angular/router'
import { RouterTestingHarness } from '@angular/router/testing'
import { User, UserRoles } from '@platon/core/common'
import { DialogService } from '@platon/core/browser/shared'
import { NEVER, of } from 'rxjs'
import { nextRoutes } from '../../next.routes'
import { Shell } from '../../shell/shell'
import { NotificationsApi } from '../../shell/notifications/notifications-api'
import { ShellApi } from '../../shell/shell-api'
import { Session } from '../session/session'
import { NextTheme } from '../theme/next-theme'
import { PageNavigation } from '../../../shared/page-navigation'

const student = { id: 'u1', username: 'ib', role: UserRoles.student, active: true } as User

describe('legacyBridgeGuard', () => {
  let navigation: { assign: jest.Mock; replace: jest.Mock }

  beforeEach(() => {
    navigation = { assign: jest.fn(), replace: jest.fn() }
    TestBed.configureTestingModule({
      providers: [
        provideRouter(nextRoutes),
        { provide: PageNavigation, useValue: navigation },
        // A signed-in student: the ported screens are behind the session, in the shell.
        {
          provide: Session,
          useValue: {
            load: () => Promise.resolve(student),
            user: signal(student),
            role: signal(student.role),
            isTeacher: signal(false),
          },
        },
        { provide: ShellApi, useValue: { correctionSummaries: () => of([]) } },
        { provide: NotificationsApi, useValue: { unreadCount: () => of(0), changes: () => NEVER } },
        { provide: DialogService, useValue: {} },
        { provide: NextTheme, useValue: { preference: signal('light') } },
      ],
    })
  })

  it('lets the ported screens through', async () => {
    const harness = await RouterTestingHarness.create()
    expect(await harness.navigateByUrl('/', Shell)).toBeInstanceOf(Shell)
    expect(harness.routeNativeElement?.querySelector('app-home')).not.toBeNull()
    expect(navigation.assign).not.toHaveBeenCalled()
    expect(navigation.replace).not.toHaveBeenCalled()
  })

  it('opens any other address in the current interface, as is, for one load', async () => {
    const harness = await RouterTestingHarness.create()
    await harness.navigateByUrl('/courses/abc/members?tab=groups#top')
    expect(navigation.replace).toHaveBeenCalledWith('/courses/abc/members?tab=groups&ui=legacy-once#top')
  })

  it('replaces the history entry on the first load, so Back does not bounce between interfaces', async () => {
    const harness = await RouterTestingHarness.create()
    await harness.navigateByUrl('/resources')
    expect(navigation.replace).toHaveBeenCalledWith('/resources?ui=legacy-once')
    expect(navigation.assign).not.toHaveBeenCalled()
  })

  it('adds a history entry when leaving a screen of the new interface', async () => {
    const harness = await RouterTestingHarness.create()
    await harness.navigateByUrl('/', Shell)
    await harness.navigateByUrl('/courses')
    expect(navigation.assign).toHaveBeenCalledWith('/courses?ui=legacy-once')
    expect(TestBed.inject(Router).url).toBe('/dashboard')
  })
})

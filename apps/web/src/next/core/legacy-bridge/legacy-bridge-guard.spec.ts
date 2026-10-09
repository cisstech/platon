import { TestBed } from '@angular/core/testing'
import { Router, provideRouter } from '@angular/router'
import { RouterTestingHarness } from '@angular/router/testing'
import { nextRoutes } from '../../next.routes'
import { Home } from '../../pages/home/home'
import { PageNavigation } from './page-navigation'

describe('legacyBridgeGuard', () => {
  let navigation: { assign: jest.Mock; replace: jest.Mock }

  beforeEach(() => {
    navigation = { assign: jest.fn(), replace: jest.fn() }
    TestBed.configureTestingModule({
      providers: [provideRouter(nextRoutes), { provide: PageNavigation, useValue: navigation }],
    })
  })

  it('lets the ported screens through', async () => {
    const harness = await RouterTestingHarness.create()
    expect(await harness.navigateByUrl('/', Home)).toBeInstanceOf(Home)
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
    await harness.navigateByUrl('/', Home)
    await harness.navigateByUrl('/courses')
    expect(navigation.assign).toHaveBeenCalledWith('/courses?ui=legacy-once')
    expect(TestBed.inject(Router).url).toBe('/')
  })
})

import { Component } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { Router, provideRouter } from '@angular/router'
import { PageNavigation } from '../../shared/page-navigation'
import { UI_BOOT_CONTEXT, UiBootContext } from '../../shared/ui-boot-context'
import { provideReturnToNext } from './return-to-next'

@Component({ template: '' })
class Blank {}

describe('provideReturnToNext', () => {
  const setup = (context: Partial<UiBootContext>) => {
    const navigation = { assign: jest.fn(), replace: jest.fn() }
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: '**', component: Blank }]),
        provideReturnToNext(),
        { provide: PageNavigation, useValue: navigation },
        { provide: UI_BOOT_CONTEXT, useValue: { flag: 'off', stored: 'next', bridged: false, ...context } },
      ],
    })
    return { navigation, router: TestBed.inject(Router) }
  }

  it('goes back to the new interface for an address it serves, as after signing in', async () => {
    const { navigation, router } = setup({ bridged: true })
    await router.navigateByUrl('/login?next=%2Fdashboard')
    expect(navigation.assign).not.toHaveBeenCalled()
    await router.navigateByUrl('/dashboard')
    expect(navigation.assign).toHaveBeenCalledWith('/dashboard')
  })

  it('replaces the history entry when the navigation does, as the sign in', async () => {
    const { navigation, router } = setup({ bridged: true })
    await router.navigateByUrl('/dashboard', { replaceUrl: true })
    expect(navigation.replace).toHaveBeenCalledWith('/dashboard')
    expect(navigation.assign).not.toHaveBeenCalled()
  })

  it('stays for the screens the new interface does not have', async () => {
    const { navigation, router } = setup({ bridged: true })
    await router.navigateByUrl('/courses/42')
    expect(navigation.assign).not.toHaveBeenCalled()
  })

  it('does nothing when the current interface was chosen', async () => {
    const { navigation, router } = setup({ bridged: false, stored: 'legacy' })
    await router.navigateByUrl('/dashboard')
    expect(navigation.assign).not.toHaveBeenCalled()
  })
})

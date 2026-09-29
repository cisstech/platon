import { Component } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { Router, provideRouter } from '@angular/router'
import { UI_BOOT_CONTEXT, UiBootContext } from '../../shared/ui-boot-context'
import { UiSwitchNotice } from './ui-switch-notice'

@Component({ template: '' })
class BlankPage {}

const render = async (context: Partial<UiBootContext>, url: string) => {
  TestBed.configureTestingModule({
    providers: [
      provideRouter([{ path: '**', component: BlankPage }]),
      { provide: UI_BOOT_CONTEXT, useValue: { flag: 'off', stored: null, bridged: false, ...context } },
    ],
  })
  await TestBed.inject(Router).navigateByUrl(url)
  return create()
}

const create = () => {
  const fixture = TestBed.createComponent(UiSwitchNotice)
  fixture.detectChanges()
  return fixture
}

const element = (fixture: ComponentFixture<UiSwitchNotice>) => fixture.nativeElement as HTMLElement
const text = (fixture: ComponentFixture<UiSwitchNotice>) => element(fixture).textContent?.trim() ?? ''
const button = (fixture: ComponentFixture<UiSwitchNotice>, label: string) =>
  [...element(fixture).querySelectorAll('button')].find((b) => b.textContent?.includes(label))

describe('UiSwitchNotice', () => {
  afterEach(() => localStorage.clear())

  it('tells that the bridged screen is not in the new interface yet, with a way back', async () => {
    const fixture = await render({ bridged: true, stored: 'next' }, '/courses/42/members')
    expect(text(fixture)).toContain("Cette page n'existe pas encore dans la nouvelle interface.")
    const back = element(fixture).querySelector('a')
    expect(back?.textContent).toContain('Revenir à la nouvelle interface')
    expect(back?.getAttribute('href')).toBe('/')
  })

  it('hides the bridge message until the next load, without remembering it', async () => {
    const fixture = await render({ bridged: true, stored: 'next' }, '/courses/42')
    button(fixture, 'Masquer')?.click()
    fixture.detectChanges()
    expect(text(fixture)).toBe('')
    expect(localStorage.length).toBe(0)
  })

  it('offers to try the new interface at the same address', async () => {
    const fixture = await render({ flag: 'opt-in' }, '/courses/42?tab=members')
    expect(text(fixture)).toContain('Essayer la nouvelle interface')
    expect(element(fixture).querySelector('a')?.getAttribute('href')).toBe('/courses/42?tab=members&ui=next')
  })

  it('never offers again after « Non merci »', async () => {
    const fixture = await render({ flag: 'opt-in' }, '/dashboard')
    button(fixture, 'Non merci')?.click()
    fixture.detectChanges()
    expect(text(fixture)).toBe('')
    expect(text(create())).toBe('')
  })

  it('follows the navigation and steps aside for a full-screen tool', async () => {
    const fixture = await render({ flag: 'opt-in' }, '/dashboard')
    expect(text(fixture)).toContain('Essayer la nouvelle interface')
    await TestBed.inject(Router).navigateByUrl('/player/activity/1')
    fixture.detectChanges()
    expect(text(fixture)).toBe('')
  })
})

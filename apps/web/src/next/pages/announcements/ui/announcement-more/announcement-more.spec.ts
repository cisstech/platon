import { Component, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { spoken } from '../../../../shared/testing/spoken'
import { AnnouncementMore } from './announcement-more'

@Component({
  imports: [AnnouncementMore],
  template: `<app-announcement-more [state]="state()" (asked)="asked = true" />`,
})
class Host {
  readonly state = signal<'idle' | 'loading' | 'error'>('idle')
  asked = false
}

describe('AnnouncementMore', () => {
  const render = () => {
    const fixture = TestBed.createComponent(Host)
    fixture.detectChanges()
    const element = fixture.nativeElement as HTMLElement
    return {
      fixture,
      host: fixture.componentInstance,
      button: element.querySelector('button') as HTMLButtonElement,
      element,
    }
  }

  it('asks for the older announcements', () => {
    const { host, button } = render()

    expect(spoken(button)).toBe('Afficher les annonces plus anciennes')
    button.click()

    expect(host.asked).toBe(true)
  })

  it('stays usable by the keyboard while they come: busy, not disabled', () => {
    const { fixture, host, button } = render()

    host.state.set('loading')
    fixture.detectChanges()

    expect(button.disabled).toBe(false)
    expect(button.getAttribute('aria-busy')).toBe('true')
  })

  it('says when they failed to come', () => {
    const { fixture, host, element } = render()

    host.state.set('error')
    fixture.detectChanges()

    expect(spoken(element.querySelector('[role="alert"]'))).toBe(
      "Les annonces plus anciennes n'ont pas pu être chargées."
    )
  })
})

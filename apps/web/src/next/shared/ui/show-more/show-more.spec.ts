import { LiveAnnouncer } from '@angular/cdk/a11y'
import { Component, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { spoken } from '../../testing/spoken'
import { MoreState, ShowMore } from './show-more'

@Component({
  imports: [ShowMore],
  template: `<app-show-more
    [state]="state()"
    label="Afficher plus de cours"
    failure="Les cours suivants n'ont pas pu être chargés."
    (asked)="asked = true"
  />`,
})
class Host {
  readonly state = signal<MoreState>('idle')
  asked = false
}

describe('ShowMore', () => {
  const render = () => {
    const announce = jest.fn(() => Promise.resolve())
    TestBed.configureTestingModule({ providers: [{ provide: LiveAnnouncer, useValue: { announce } }] })
    const fixture = TestBed.createComponent(Host)
    fixture.detectChanges()
    const element = fixture.nativeElement as HTMLElement
    return {
      fixture,
      announce,
      host: fixture.componentInstance,
      button: element.querySelector('button') as HTMLButtonElement,
      element,
    }
  }

  it('asks for the next page under its label', () => {
    const { host, button } = render()

    expect(spoken(button)).toBe('Afficher plus de cours')
    button.click()

    expect(host.asked).toBe(true)
  })

  it('stays usable by the keyboard while it comes: busy, not disabled', () => {
    const { fixture, host, button } = render()

    host.state.set('loading')
    fixture.detectChanges()

    expect(button.disabled).toBe(false)
    expect(button.getAttribute('aria-busy')).toBe('true')
  })

  it('says under it, and announces, that the next page failed to come, each time it fails', () => {
    const { fixture, host, element, announce } = render()

    host.state.set('error')
    fixture.detectChanges()
    host.state.set('loading')
    fixture.detectChanges()
    host.state.set('error')
    fixture.detectChanges()

    expect(spoken(element.querySelector('p'))).toBe("Les cours suivants n'ont pas pu être chargés.")
    expect(announce.mock.calls).toEqual([
      ["Les cours suivants n'ont pas pu être chargés.", 'polite'],
      ["Les cours suivants n'ont pas pu être chargés.", 'polite'],
    ])
  })
})

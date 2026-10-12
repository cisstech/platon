import { Component, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'
import { spoken } from '../../../../shared/testing/spoken'
import { HomeZone } from './home-zone'

@Component({
  imports: [HomeZone],
  template: `
    <app-home-zone
      #zone
      heading="Mes cours"
      headingId="home-courses"
      [count]="count()"
      [moreLink]="moreLink()"
      moreLabel="Tous"
      [plain]="plain()"
    >
      <p>Algorithmique 1</p>
    </app-home-zone>
  `,
})
class Host {
  readonly count = signal(0)
  readonly moreLink = signal<string | undefined>('/courses')
  readonly plain = signal(false)
}

describe('HomeZone', () => {
  const render = () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] })
    const fixture = TestBed.createComponent(Host)
    fixture.detectChanges()
    const zone = fixture.nativeElement.querySelector('app-home-zone') as HTMLElement
    document.body.appendChild(fixture.nativeElement)
    return { fixture, host: fixture.componentInstance, zone }
  }

  afterEach(() => (document.body.innerHTML = ''))

  it('is a region named by its heading, its content on a card', () => {
    const { zone } = render()

    expect(zone.getAttribute('role')).toBe('region')
    expect(zone.getAttribute('aria-labelledby')).toBe('home-courses')
    expect(spoken(zone.querySelector('#home-courses'))).toBe('Mes cours')
    expect(zone.querySelector('.home-zone__body p')?.textContent).toBe('Algorithmique 1')
    expect(zone.hasAttribute('data-plain')).toBe(false)
  })

  it('counts what it lists when there is something, and links to all of it', () => {
    const { fixture, host, zone } = render()
    expect(zone.querySelector('pl-count')).toBeNull()

    host.count.set(3)
    fixture.detectChanges()

    expect(zone.querySelector('pl-count')?.textContent).toBe('3')
    expect(zone.querySelector('a')?.getAttribute('href')).toBe('/courses')
    expect(spoken(zone.querySelector('a'))).toBe('Tous')
  })

  it('leaves out the card for content made of cards', () => {
    const { fixture, host, zone } = render()
    host.plain.set(true)
    fixture.detectChanges()

    expect(zone.hasAttribute('data-plain')).toBe(true)
  })

  it('gives the focus to its heading', () => {
    const { fixture } = render()
    const zone = fixture.debugElement.children[0].componentInstance as HomeZone

    zone.focus()

    expect(document.activeElement?.id).toBe('home-courses')
  })
})

import { Component, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'
import { spoken } from '../testing/spoken'
import { Binder } from './binder'
import { BinderSkeleton } from './binder-skeleton/binder-skeleton'

@Component({
  imports: [Binder, BinderSkeleton],
  template: `
    <pl-binder
      heading="Algorithmique et programmation 1"
      description="Bases de la programmation en Python."
      monogram="AP1"
      hue="lagoon"
      href="/courses/ap1"
      badge="1 challenge"
      badgeHref="/courses/ap1/challenges"
      badgeIcon="emoji_events"
      [compact]="compact()"
    >
      <button plBinderActions type="button" aria-label="Actions du cours">…</button>
      <p class="foot">302 étudiants</p>
    </pl-binder>
    <pl-binder-skeleton />
  `,
})
class Host {
  readonly compact = signal(false)
}

describe('Binder', () => {
  const render = () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] })
    const fixture = TestBed.createComponent(Host)
    fixture.detectChanges()
    const element = fixture.nativeElement as HTMLElement
    return {
      fixture,
      host: fixture.componentInstance,
      binder: element.querySelector('pl-binder') as HTMLElement,
      element,
    }
  }

  it('opens its course from a link named by its heading, the monogram hidden from screen readers', () => {
    const { binder } = render()
    const link = binder.querySelector('h2 a') as HTMLAnchorElement

    expect(link.getAttribute('href')).toBe('/courses/ap1')
    expect(spoken(link)).toBe('Algorithmique et programmation 1')
    expect(binder.getAttribute('data-hue')).toBe('lagoon')
    expect(spoken(binder.querySelector('.pl-binder__cover'))).not.toContain('AP1')
    expect(spoken(binder.querySelector('p.pl-binder__description'))).toBe('Bases de la programmation en Python.')
  })

  it('keeps its badge and its actions apart from its link, and shows what the page puts at its foot', () => {
    const { binder } = render()

    const badge = binder.querySelector('a.pl-binder__badge') as HTMLAnchorElement
    expect(badge.getAttribute('href')).toBe('/courses/ap1/challenges')
    expect(spoken(badge)).toBe('1 challenge, Algorithmique et programmation 1')
    expect(badge.closest('h2')).toBeNull()
    expect(binder.querySelector('button[plBinderActions]')?.closest('a')).toBeNull()
    expect(spoken(binder.querySelector('.pl-binder__foot'))).toBe('302 étudiants')
  })

  it('shows the mark of the course instead of its cover when compact, its actions kept', () => {
    const { binder, fixture, host } = render()
    host.compact.set(true)
    fixture.detectChanges()

    expect(binder.hasAttribute('data-compact')).toBe(true)
    expect(binder.querySelector('pl-course-mark')?.textContent?.trim()).toBe('AP1')
    expect(binder.querySelector('.pl-binder__cover')).toBeNull()
    expect(binder.querySelector('button[plBinderActions]')).not.toBeNull()
  })

  it('reads the name of its course before its badge, and takes the focus on its link', () => {
    const { binder, fixture } = render()
    const links = [...binder.querySelectorAll('a')]

    expect(links.map((link) => link.className)).toEqual(['pl-binder__link', 'pl-binder__badge'])
    fixture.debugElement.query((node) => node.name === 'pl-binder').componentInstance.focus()
    expect(document.activeElement).toBe(links[0])
  })

  it('shows a binder on its way, hidden from screen readers', () => {
    const { element } = render()

    expect(element.querySelector('pl-binder-skeleton')?.getAttribute('aria-hidden')).toBe('true')
  })
})

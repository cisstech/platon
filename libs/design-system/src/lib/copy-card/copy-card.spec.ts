import { Component, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'
import { CopyCard } from './copy-card'
import { spoken } from '../testing/spoken'

@Component({
  imports: [CopyCard],
  template: `
    <pl-copy-card
      heading="TP 3 : conditions"
      context="Algorithmique 1"
      date="Rendue le 22 septembre"
      hue="lagoon"
      [grade]="grade()"
      gradeLabel="82 sur 100"
      [state]="state()"
      stateIcon="pending"
      [action]="action()"
      actionIcon="rate_review"
      [href]="href()"
    />
  `,
})
class Host {
  readonly grade = signal<number | undefined>(82)
  readonly state = signal<string | undefined>(undefined)
  readonly action = signal<string | undefined>('Voir la correction')
  readonly href = signal<string | undefined>('/player/activity/a1')
}

describe('CopyCard', () => {
  const render = () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] })
    const fixture = TestBed.createComponent(Host)
    fixture.detectChanges()
    const card = () => fixture.nativeElement.querySelector('pl-copy-card') as HTMLElement
    return { fixture, host: fixture.componentInstance, card }
  }

  it('writes the grade in the margin and opens the corrected copy, said in full', () => {
    const { card } = render()
    const link = card().querySelector('a') as HTMLAnchorElement

    expect(card().querySelector('.pl-copy-card__margin')?.textContent?.replace(/\s+/g, '')).toBe('82/100')
    expect(link.getAttribute('href')).toBe('/player/activity/a1')
    expect(spoken(link)).toBe('TP 3 : conditions, 82 sur 100 Algorithmique 1 Rendue le 22 septembre Voir la correction')
    expect(card().querySelector('.pl-copy-card__body')?.getAttribute('data-hue')).toBe('lagoon')
  })

  it('keeps the margin empty and says why, without a link, while the copy waits for its grade', () => {
    const { fixture, host, card } = render()
    host.grade.set(undefined)
    host.state.set('En correction')
    host.action.set(undefined)
    host.href.set(undefined)
    fixture.detectChanges()

    expect(card().querySelector('a')).toBeNull()
    expect(card().querySelector('.pl-copy-card__margin')?.textContent?.trim()).toBe('')
    expect(card().querySelector('pl-tag')?.textContent?.trim()).toBe('En correction')
  })
})

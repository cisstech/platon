import { Component, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'
import { ActivityRow } from './activity-row'
import { spoken } from '../testing/spoken'

@Component({
  imports: [ActivityRow],
  template: `
    <pl-activity-row
      heading="Quiz : complexité"
      context="Algorithmique 1"
      icon="quiz"
      hue="lagoon"
      due="Ferme ce soir à 23 h 59"
      dueTone="warning"
      dueIcon="schedule"
      [done]="5"
      [total]="total()"
      [progressText]="progressText()"
      [progressHint]="progressHint()"
      [action]="action()"
      href="/player/activity/a1"
      [button]="button()"
      [tag]="tag()"
    />
  `,
})
class Host {
  readonly button = signal<'primary' | 'secondary' | undefined>(undefined)
  readonly tag = signal<string | undefined>(undefined)
  readonly action = signal<string | undefined>('Reprendre')
  readonly total = signal(6)
  readonly progressText = signal('5 sur 6')
  readonly progressHint = signal<string | undefined>('exercices faits')
}

describe('ActivityRow', () => {
  const render = () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] })
    const fixture = TestBed.createComponent(Host)
    fixture.detectChanges()
    const row = () => fixture.nativeElement.querySelector('pl-activity-row') as HTMLElement
    return { fixture, host: fixture.componentInstance, row }
  }

  it('is a whole link that says the activity, its course, its deadline, its progress and its action', () => {
    const { row } = render()
    const link = row().querySelector('a') as HTMLAnchorElement

    expect(row().querySelectorAll('a')).toHaveLength(1)
    expect(link.getAttribute('href')).toBe('/player/activity/a1')
    expect(spoken(link)).toBe(
      'Quiz : complexité Algorithmique 1, Ferme ce soir à 23 h 59, 5 sur 6 exercices faits Reprendre'
    )
    expect(row().querySelector('[data-tone="warning"]')?.textContent?.trim()).toBe('Ferme ce soir à 23 h 59')
    expect(row().querySelector('.pl-activity-row__lead')?.getAttribute('data-hue')).toBe('lagoon')
  })

  it('carries its action on a button when it is the one to do first, described by the row', () => {
    const { fixture, host, row } = render()
    host.button.set('primary')
    fixture.detectChanges()

    const button = row().querySelector('a[plButton]') as HTMLAnchorElement
    expect(row().querySelectorAll('a')).toHaveLength(1)
    expect(button.textContent?.trim()).toBe('Reprendre')
    expect(button.getAttribute('href')).toBe('/player/activity/a1')
    const described = (button.getAttribute('aria-describedby') ?? '')
      .split(' ')
      .map((id) => spoken(row().querySelector(`#${id}`) as Element))
    expect(described).toEqual([
      'Quiz : complexité',
      'Algorithmique 1, Ferme ce soir à 23 h 59',
      '5 sur 6 exercices faits',
    ])
  })

  it('says a tag beside the progress, such as an activity that counts in the grades', () => {
    const { fixture, host, row } = render()
    host.tag.set('Notée')
    fixture.detectChanges()

    expect(spoken(row().querySelector('a') as Element)).toBe(
      'Quiz : complexité Algorithmique 1, Ferme ce soir à 23 h 59, Notée, 5 sur 6 exercices faits Reprendre'
    )
  })

  it('describes its button by the tag too', () => {
    const { fixture, host, row } = render()
    host.tag.set('Notée')
    host.button.set('secondary')
    fixture.detectChanges()

    const button = row().querySelector('a[plButton]') as HTMLAnchorElement
    const described = (button.getAttribute('aria-describedby') ?? '')
      .split(' ')
      .map((id) => spoken(row().querySelector(`#${id}`) as Element))
    expect(described).toEqual([
      'Quiz : complexité',
      'Algorithmique 1, Ferme ce soir à 23 h 59',
      'Notée',
      '5 sur 6 exercices faits',
    ])
  })

  it('names a gesture on a secondary button, such as correcting copies, and counts without a bar', () => {
    const { fixture, host, row } = render()
    host.button.set('secondary')
    host.action.set('Corriger')
    host.total.set(0)
    host.progressText.set('2 copies à corriger sur 2')
    host.progressHint.set(undefined)
    fixture.detectChanges()

    const button = row().querySelector('a[plButton]') as HTMLAnchorElement
    expect(button.textContent?.trim()).toBe('Corriger')
    expect(button.dataset['variant']).toBe('secondary')
    expect(row().querySelector('pl-progress')).toBeNull()
    expect(spoken(row().querySelector('.pl-activity-row__progress'))).toBe('2 copies à corriger sur 2')
  })

  it('only opens, its chevron saying so, when it has nothing to do', () => {
    const { fixture, host, row } = render()
    host.action.set(undefined)
    fixture.detectChanges()

    const link = row().querySelector('a') as HTMLAnchorElement
    expect(link.getAttribute('href')).toBe('/player/activity/a1')
    expect(spoken(link)).toBe('Quiz : complexité Algorithmique 1, Ferme ce soir à 23 h 59, 5 sur 6 exercices faits')
    expect(link.querySelector('pl-icon:last-child')).not.toBeNull()
  })
})

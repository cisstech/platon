import { Component, LOCALE_ID, signal, viewChild } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { spoken } from '../testing/spoken'
import { AnnouncementDisclosure } from './announcement-disclosure/announcement-disclosure'
import { AnnouncementList } from './announcement-list/announcement-list'
import { AnnouncementRow } from './announcement-row/announcement-row'
import { AnnouncementRowSkeleton } from './announcement-row-skeleton/announcement-row-skeleton'

const thisYear = new Date().getFullYear()

@Component({
  imports: [AnnouncementDisclosure, AnnouncementList, AnnouncementRow, AnnouncementRowSkeleton],
  template: `
    <pl-announcement-list>
      <pl-announcement-row
        heading="Les corrections détaillées arrivent"
        summary="Votre copie corrigée s'affiche à côté de votre note."
        [date]="date"
        icon="rate_review"
        [unread]="unread()"
        unreadLabel="Non lue :"
        [current]="current()"
        (chosen)="chosen.set(true)"
      />
    </pl-announcement-list>
    <pl-announcement-disclosure
      heading="Maintenance le 4 octobre"
      [summary]="summary()"
      [date]="date"
      icon="construction"
      [unread]="unread()"
      unreadLabel="Non lue :"
      [(expanded)]="expanded"
    >
      <p class="content">Publiée le 25 septembre par Sophie Lambert, pour tout le monde</p>
    </pl-announcement-disclosure>
    <pl-announcement-row-skeleton />
  `,
})
class Host {
  readonly date = new Date(thisYear, 8, 27, 9)
  readonly unread = signal(true)
  readonly current = signal(false)
  readonly chosen = signal(false)
  readonly expanded = signal(false)
  readonly summary = signal('PLaTon sera indisponible dimanche 4 octobre de 7 h à 9 h.')
  readonly row = viewChild.required(AnnouncementRow)
  readonly disclosure = viewChild.required(AnnouncementDisclosure)
}

describe('Announcement', () => {
  const render = () => {
    TestBed.configureTestingModule({ providers: [{ provide: LOCALE_ID, useValue: 'fr-FR' }] })
    const fixture = TestBed.createComponent(Host)
    fixture.detectChanges()
    const element = fixture.nativeElement as HTMLElement
    return {
      fixture,
      host: fixture.componentInstance,
      row: element.querySelector('pl-announcement-row') as HTMLElement,
      disclosure: element.querySelector('pl-announcement-disclosure') as HTMLElement,
      skeleton: element.querySelector('pl-announcement-row-skeleton') as HTMLElement,
    }
  }

  describe('row', () => {
    it('reads as an unread announcement, its summary and its day, the words apart, in a list', () => {
      const { row } = render()

      expect(row.getAttribute('role')).toBe('listitem')
      expect(row.parentElement?.getAttribute('role')).toBe('list')
      expect(spoken(row.querySelector('button'))).toBe(
        "Non lue : Les corrections détaillées arrivent, Votre copie corrigée s'affiche à côté de votre note., 27 sept."
      )
      expect(row.hasAttribute('data-unread')).toBe(true)
      expect(row.querySelector('time')?.getAttribute('datetime')).toMatch(/^\d{4}-\d\d-\d\dT/)
    })

    it('says nothing of its state once read', () => {
      const { row, fixture, host } = render()
      host.unread.set(false)
      fixture.detectChanges()

      expect(row.hasAttribute('data-unread')).toBe(false)
      expect(spoken(row.querySelector('button'))).toMatch(/^Les corrections détaillées arrivent,/)
    })

    it('says it is the announcement open beside the list', () => {
      const { row, fixture, host } = render()
      expect(row.querySelector('button')?.hasAttribute('aria-current')).toBe(false)

      host.current.set(true)
      fixture.detectChanges()

      expect(row.querySelector('button')?.getAttribute('aria-current')).toBe('true')
    })

    it('tells the page it was chosen', () => {
      const { row, host } = render()

      row.querySelector('button')?.click()

      expect(host.chosen()).toBe(true)
    })
  })

  describe('disclosure', () => {
    const toggleOf = (disclosure: HTMLElement) => disclosure.querySelector('button') as HTMLButtonElement
    const panelOf = (disclosure: HTMLElement) =>
      disclosure.querySelector(`#${toggleOf(disclosure).getAttribute('aria-controls')}`) as HTMLElement

    it('is a heading whose button opens it, closed at first, with its summary and its day', () => {
      const { disclosure } = render()
      const toggle = toggleOf(disclosure)

      expect(toggle.closest('[role="heading"]')?.getAttribute('aria-level')).toBe('2')
      expect(toggle.getAttribute('aria-expanded')).toBe('false')
      expect(spoken(toggle)).toBe('Non lue : Maintenance le 4 octobre')
      expect(panelOf(disclosure).hidden).toBe(true)
      expect(spoken(disclosure.querySelector('.pl-announcement-disclosure__summary'))).toBe(
        'PLaTon sera indisponible dimanche 4 octobre de 7 h à 9 h.'
      )
      expect(spoken(disclosure.querySelector('time'))).toBe('27 septembre')
    })

    it('opens in place: its content instead of its summary and its day', () => {
      const { disclosure, fixture, host } = render()

      toggleOf(disclosure).click()
      fixture.detectChanges()

      expect(host.expanded()).toBe(true)
      expect(toggleOf(disclosure).getAttribute('aria-expanded')).toBe('true')
      expect(panelOf(disclosure).hidden).toBe(false)
      expect(spoken(panelOf(disclosure))).toBe('Publiée le 25 septembre par Sophie Lambert, pour tout le monde')
      expect(disclosure.querySelector('.pl-announcement-disclosure__summary')).toBeNull()
      expect(disclosure.querySelector('time')).toBeNull()
    })

    it('writes no summary when it has none', () => {
      const { disclosure, fixture, host } = render()
      host.summary.set('')
      fixture.detectChanges()

      expect(disclosure.querySelector('.pl-announcement-disclosure__summary')).toBeNull()
    })

    it('closes again from its button, which keeps the focus', () => {
      const { disclosure, fixture, host } = render()
      host.expanded.set(true)
      fixture.detectChanges()
      toggleOf(disclosure).focus()

      toggleOf(disclosure).click()
      fixture.detectChanges()

      expect(host.expanded()).toBe(false)
      expect(document.activeElement).toBe(toggleOf(disclosure))
    })
  })

  it('takes the focus on the button of a row or of a disclosure', () => {
    const { host, row, disclosure } = render()

    host.row().focus()
    expect(document.activeElement).toBe(row.querySelector('button'))

    host.disclosure().focus()
    expect(document.activeElement).toBe(disclosure.querySelector('button'))
  })

  it('shows a row on its way, hidden from screen readers', () => {
    const { skeleton } = render()

    expect(skeleton.getAttribute('aria-hidden')).toBe('true')
  })
})

import { LiveAnnouncer } from '@angular/cdk/a11y'
import { BreakpointObserver } from '@angular/cdk/layout'
import { HttpErrorResponse } from '@angular/common/http'
import { LOCALE_ID, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { ActivatedRoute, convertToParamMap } from '@angular/router'
import { User, UserRoles } from '@platon/core/common'
import { Announcement } from '@platon/feature/announcement/common'
import { of, Subject, throwError } from 'rxjs'
import { Connectivity } from '../../core/connectivity/connectivity'
import { spoken } from '../../shared/testing/spoken'
import { Announcements } from './announcements'
import { AnnouncementsApi } from './data/announcements-api'
import { AnnouncementsStore } from './data/announcements-store'

// A Monday afternoon, in the local time of the machine running the tests.
const NOW = new Date(2026, 8, 28, 14, 30)
const at = (day: number, month = 8) => new Date(2026, month, day, 9)
const sophie = { id: 'u1', username: 'slambert', firstName: 'Sophie', lastName: 'Lambert' } as User
const announcement = (id: string, title: string, createdAt: Date, values: Partial<Announcement> = {}) =>
  ({
    id,
    title,
    description: `Résumé de ${title}`,
    createdAt,
    active: true,
    publisher: sophie,
    ...values,
  } as Announcement)

const LIST = [
  announcement('corrections', 'Les corrections détaillées arrivent', at(27), {
    icon: 'notification',
    targetedRoles: [UserRoles.student],
  }),
  announcement('maintenance', 'Maintenance le 4 octobre', at(25), { icon: 'tool', readAt: at(26) }),
  announcement('rentree', 'Rentrée 2026', at(28, 7), { icon: 'info-circle' }),
]
const content = (id: string) => ({
  ...(LIST.find((listed) => listed.id === id) as Announcement),
  data: { blocks: [{ type: 'paragraph', data: { text: `Contenu de ${id}.` } }] },
})

describe('Announcements', () => {
  let api: { page: jest.Mock; find: jest.Mock; markAsRead: jest.Mock }
  let announce: jest.Mock

  const render = ({ narrow = false, highlight }: { narrow?: boolean; highlight?: string } = {}) => {
    TestBed.configureTestingModule({
      providers: [
        AnnouncementsStore,
        { provide: AnnouncementsApi, useValue: api },
        { provide: LOCALE_ID, useValue: 'fr-FR' },
        { provide: ActivatedRoute, useValue: { snapshot: { queryParamMap: convertToParamMap({ highlight }) } } },
        { provide: Connectivity, useValue: { online: signal(true) } },
        { provide: LiveAnnouncer, useValue: { announce } },
        {
          provide: BreakpointObserver,
          useValue: { observe: () => of({ matches: narrow, breakpoints: {} }), isMatched: () => narrow },
        },
      ],
    })
    const fixture = TestBed.createComponent(Announcements)
    fixture.detectChanges()
    const page = fixture.nativeElement as HTMLElement
    document.body.appendChild(page)
    const refresh = () => fixture.detectChanges()
    return { fixture, page, refresh }
  }

  const rows = (page: HTMLElement) => Array.from(page.querySelectorAll('pl-announcement-row button')) as HTMLElement[]
  const toggles = (page: HTMLElement) =>
    Array.from(page.querySelectorAll('pl-announcement-disclosure button')) as HTMLButtonElement[]

  beforeEach(() => {
    jest.useFakeTimers({ now: NOW })
    jest.spyOn(console, 'error').mockImplementation(() => undefined)
    announce = jest.fn(() => Promise.resolve())
    api = {
      page: jest.fn(() => of({ announcements: LIST, total: LIST.length })),
      find: jest.fn((id: string) => of(content(id))),
      markAsRead: jest.fn(() => of(undefined)),
    }
  })

  afterEach(() => {
    jest.useRealTimers()
    document.body.innerHTML = ''
  })

  it('lists the announcements, the most recent first, with a search labelled for screen readers', () => {
    const { page } = render({ highlight: 'maintenance' })

    expect(spoken(page.querySelector('h1'))).toBe('Annonces')
    expect(spoken(page.querySelector('pl-page-header p'))).toBe('Les nouvelles de la plateforme.')
    expect(spoken(page.querySelector('pl-field label'))).toBe('Rechercher une annonce')
    expect(page.querySelector('[role="list"]')?.getAttribute('aria-label')).toBe('Annonces')
    expect(rows(page).map(spoken)).toEqual([
      'Non lue : Les corrections détaillées arrivent, Résumé de Les corrections détaillées arrivent, 27 sept.',
      'Maintenance le 4 octobre, Résumé de Maintenance le 4 octobre, 25 sept.',
      'Rentrée 2026, Résumé de Rentrée 2026, 28 août',
    ])
  })

  it('opens, on a wide screen, the most recent unread one beside the list, and reads it', () => {
    const { page } = render()

    expect(rows(page)[0].getAttribute('aria-current')).toBe('true')
    const article = page.querySelector('app-announcement-detail[role="article"]') as HTMLElement
    expect(spoken(article.querySelector('h2'))).toBe('Les corrections détaillées arrivent')
    expect(spoken(article.querySelector('.announcement-detail__byline'))).toBe(
      'Publiée le 27 septembre 2026 par Sophie Lambert, pour les étudiants'
    )
    expect(spoken(article.querySelector('app-editor-content'))).toBe('Contenu de corrections.')
    expect(api.markAsRead).toHaveBeenCalledWith('corrections')
    expect(rows(page)[0].closest('pl-announcement-row')?.hasAttribute('data-unread')).toBe(false)
  })

  it('opens the announcement chosen in the list', () => {
    const { page, refresh } = render()

    rows(page)[1].click()
    refresh()

    expect(rows(page)[1].getAttribute('aria-current')).toBe('true')
    expect(rows(page)[0].hasAttribute('aria-current')).toBe(false)
    expect(spoken(page.querySelector('app-announcement-detail h2'))).toBe('Maintenance le 4 octobre')
    expect(api.markAsRead).toHaveBeenCalledTimes(1)
  })

  it('reads the unread announcement of the banner it opens on', () => {
    render({ highlight: 'corrections' })

    expect(api.markAsRead).toHaveBeenCalledWith('corrections')
  })

  it("opens on the announcement of the banner, arrived by « Lire l'annonce »", () => {
    const { page } = render({ highlight: 'maintenance' })

    expect(rows(page)[1].getAttribute('aria-current')).toBe('true')
    expect(api.markAsRead).not.toHaveBeenCalled()
  })

  it('opens each announcement in place on a phone, none at first', () => {
    const { page, refresh } = render({ narrow: true })

    expect(page.querySelector('pl-announcement-row')).toBeNull()
    expect(toggles(page).map((toggle) => toggle.getAttribute('aria-expanded'))).toEqual(['false', 'false', 'false'])
    expect(page.querySelector('app-announcement-detail')).toBeNull()

    toggles(page)[1].click()
    refresh()

    const open = page.querySelectorAll('pl-announcement-disclosure')[1]
    expect(toggles(page)[1].getAttribute('aria-expanded')).toBe('true')
    expect(spoken(open.querySelector('.announcement-detail__byline'))).toBe(
      'Publiée le 25 septembre 2026 par Sophie Lambert, pour tout le monde'
    )
    expect(spoken(open.querySelector('app-editor-content'))).toBe('Contenu de maintenance.')

    toggles(page)[0].click()
    refresh()

    expect(toggles(page).map((toggle) => toggle.getAttribute('aria-expanded'))).toEqual(['true', 'false', 'false'])
  })

  it('shows the shape of the list and of the announcement while they load, then says it is slow at 10 s', () => {
    api.page.mockReturnValue(new Subject())
    const { page, refresh } = render()

    jest.advanceTimersByTime(300)
    refresh()
    expect(page.querySelectorAll('pl-announcement-row-skeleton')).toHaveLength(3)
    expect(page.querySelectorAll('.announcements__detail pl-skeleton').length).toBeGreaterThan(0)
    expect(page.querySelector('pl-page main')?.getAttribute('aria-busy')).toBe('true')

    jest.advanceTimersByTime(10_000)
    refresh()
    expect(spoken(page.querySelector('app-load-state pl-alert'))).toContain(
      "Le chargement prend plus de temps que d'habitude."
    )
    expect(page.querySelectorAll('pl-announcement-row-skeleton')).toHaveLength(3)
  })

  it('keeps the focus on the button of an announcement opened or closed in place', () => {
    const { page, refresh } = render({ narrow: true })

    toggles(page)[1].focus()
    toggles(page)[1].click()
    refresh()
    expect(document.activeElement).toBe(toggles(page)[1])

    toggles(page)[1].click()
    refresh()
    expect(document.activeElement).toBe(toggles(page)[1])
    expect(toggles(page)[1].getAttribute('aria-expanded')).toBe('false')
  })

  it('opens on a phone the announcement of the banner, in place, brought into view once its content is there', () => {
    const scroll = jest.fn()
    Element.prototype.scrollIntoView = scroll
    const late = new Subject<Announcement>()
    api.find.mockReturnValue(late)
    const { page, refresh } = render({ narrow: true, highlight: 'rentree' })

    expect(toggles(page)[2].getAttribute('aria-expanded')).toBe('true')
    expect(scroll).not.toHaveBeenCalled()

    late.next(content('rentree'))
    late.complete()
    refresh()

    expect(scroll).toHaveBeenCalledTimes(1)
    expect(scroll.mock.contexts[0]).toBe(page.querySelector('#announcement-rentree'))
  })

  it('searches all the announcements once the person pauses, and says when none match', () => {
    const { page, refresh } = render()
    api.page.mockReturnValue(of({ announcements: [], total: 0 }))
    const input = page.querySelector('input[type="search"]') as HTMLInputElement

    input.value = 'examen'
    input.dispatchEvent(new Event('input'))
    jest.advanceTimersByTime(300)
    refresh()

    expect(api.page).toHaveBeenLastCalledWith('examen', 0)
    expect(spoken(page.querySelector('pl-empty h2'))).toBe('Aucune annonce ne correspond à « examen ».')

    const all = new Subject<{ announcements: Announcement[]; total: number }>()
    api.page.mockReturnValue(all)
    expect(spoken(page.querySelector('pl-empty button'))).toBe('Effacer la recherche')
    ;(page.querySelector('pl-empty button') as HTMLButtonElement).click()
    refresh()

    expect(input.value).toBe('')
    expect(document.activeElement).toBe(input)
    expect(page.querySelector('pl-empty')).toBeNull()

    all.next({ announcements: LIST, total: LIST.length })
    all.complete()
    refresh()

    expect(document.activeElement).toBe(input)
    expect(rows(page)).toHaveLength(3)
  })

  it('keeps the field and its focus when a search that found nothing is cleared by the keyboard', () => {
    const { page, refresh } = render()
    api.page.mockReturnValue(of({ announcements: [], total: 0 }))
    const input = page.querySelector('input[type="search"]') as HTMLInputElement
    input.value = 'examen'
    input.dispatchEvent(new Event('input'))
    jest.advanceTimersByTime(300)
    refresh()
    input.focus()

    api.page.mockReturnValue(of({ announcements: LIST, total: LIST.length }))
    input.value = ''
    input.dispatchEvent(new Event('input'))
    refresh()

    expect(page.querySelector('input[type="search"]')).toBe(input)
    expect(document.activeElement).toBe(input)
    expect(spoken(page.querySelector('pl-empty h2'))).toBe('Aucune annonce ne correspond à « examen ».')

    jest.advanceTimersByTime(300)
    refresh()
    expect(rows(page)).toHaveLength(3)
    expect(document.activeElement).toBe(input)
  })

  it('tells screen readers what a search found', () => {
    const { page, refresh } = render()
    api.page.mockReturnValue(of({ announcements: [], total: 0 }))
    const input = page.querySelector('input[type="search"]') as HTMLInputElement

    input.value = 'examen'
    input.dispatchEvent(new Event('input'))
    jest.advanceTimersByTime(300)
    refresh()
    expect(announce).toHaveBeenLastCalledWith('Aucune annonce ne correspond à «\u00a0examen\u00a0».', 'polite')

    api.page.mockReturnValue(of({ announcements: LIST, total: LIST.length }))
    input.value = ''
    input.dispatchEvent(new Event('input'))
    jest.advanceTimersByTime(300)
    refresh()
    expect(announce).toHaveBeenLastCalledWith('3 annonces', 'polite')
  })

  it('keeps the field and its focus when a search fails, the failure said above', () => {
    const { page, refresh } = render()
    api.page.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 403 })))
    const input = page.querySelector('input[type="search"]') as HTMLInputElement
    input.focus()

    input.value = 'examen'
    input.dispatchEvent(new Event('input'))
    jest.advanceTimersByTime(300)
    refresh()

    expect(spoken(page.querySelector('app-load-state h2'))).toBe("Les annonces n'ont pas pu être chargées")
    expect(page.querySelector('input[type="search"]')).toBe(input)
    expect(document.activeElement).toBe(input)
    expect(page.querySelector('pl-announcement-row')).toBeNull()
  })

  it('says when there is no announcement at all, without a search', () => {
    api.page.mockReturnValue(of({ announcements: [], total: 0 }))
    const { page } = render()

    expect(spoken(page.querySelector('pl-empty h2'))).toBe('Aucune annonce pour le moment')
    expect(spoken(page.querySelector('pl-empty p'))).toBe("Les nouvelles de la plateforme s'afficheront ici.")
    expect(page.querySelector('pl-field')).toBeNull()
  })

  it('adds the older announcements, the focus going to the first of them', () => {
    api.page.mockReturnValueOnce(of({ announcements: LIST.slice(0, 2), total: 3 }))
    const { page, refresh } = render()
    api.page.mockReturnValue(of({ announcements: LIST.slice(2), total: 3 }))
    const more = Array.from(page.querySelectorAll('button')).find(
      (button) => spoken(button) === 'Afficher les annonces plus anciennes'
    ) as HTMLButtonElement

    more.click()
    refresh()
    refresh()

    expect(rows(page)).toHaveLength(3)
    expect(document.activeElement).toBe(rows(page)[2])
    expect(
      Array.from(page.querySelectorAll('button')).some((button) => spoken(button)?.includes('plus anciennes'))
    ).toBe(false)
  })

  it('keeps the focus on « Afficher les annonces plus anciennes » when they fail to come', () => {
    api.page.mockReturnValueOnce(of({ announcements: LIST.slice(0, 2), total: 3 }))
    const { page, refresh } = render()
    const older = new Subject<{ announcements: Announcement[]; total: number }>()
    api.page.mockReturnValue(older)
    const more = Array.from(page.querySelectorAll('button')).find(
      (button) => spoken(button) === 'Afficher les annonces plus anciennes'
    ) as HTMLButtonElement
    more.focus()

    more.click()
    refresh()
    expect(more.disabled).toBe(false)
    expect(more.getAttribute('aria-busy')).toBe('true')

    older.error(new Error('502'))
    refresh()
    refresh()

    expect(document.activeElement).toBe(more)
    expect(spoken(page.querySelector('app-show-more p'))).toBe(
      "Les annonces plus anciennes n'ont pas pu être chargées."
    )
  })

  it('says the list failed, and loads it again on « Réessayer »', () => {
    api.page.mockReturnValueOnce(throwError(() => new HttpErrorResponse({ status: 403 })))
    const { page, refresh } = render()

    expect(spoken(page.querySelector('app-load-state h2'))).toBe("Les annonces n'ont pas pu être chargées")
    expect(page.querySelector('pl-announcement-row')).toBeNull()
    ;(page.querySelector('app-load-state button') as HTMLButtonElement).click()
    refresh()

    expect(rows(page)).toHaveLength(3)
  })

  it('says the content failed, and loads it again, the focus staying in the announcement', () => {
    api.find.mockReturnValueOnce(throwError(() => new Error('502')))
    const { page, refresh } = render()

    ;(page.querySelector('app-announcement-detail [role="alert"] button') as HTMLButtonElement).click()
    refresh()

    const article = page.querySelector('app-announcement-detail') as HTMLElement
    expect(spoken(article.querySelector('app-editor-content'))).toBe('Contenu de corrections.')
    expect(document.activeElement).toBe(article)
  })
})

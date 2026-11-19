import { LiveAnnouncer } from '@angular/cdk/a11y'
import { BreakpointObserver } from '@angular/cdk/layout'
import { LOCALE_ID, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'
import { User, UserRoles } from '@platon/core/common'
import { LoadStatus } from '@platon/design-system'
import { Announcement } from '@platon/feature/announcement/common'
import { Course, PlayableActivity } from '@platon/feature/course/common'
import { RecentCopy } from '@platon/feature/result/common'
import { of } from 'rxjs'
import { Connectivity } from '../../../core/connectivity/connectivity'
import { Session } from '../../../core/session/session'
import { spoken } from '../../../shared/testing/spoken'
import { StudentHomeData, StudentHomeStore } from '../data/student-home-store'
import { StudentHome } from './student-home'

// A Monday afternoon, in the local time of the machine running the tests.
const NOW = new Date(2026, 8, 28, 14, 30)
const at = (day: number, hours: number, minutes = 0, month = 8) => new Date(2026, month, day, hours, minutes)

const activity = (id: string, values: Partial<PlayableActivity>): PlayableActivity => ({
  id,
  courseId: 'c-ap1',
  courseName: 'Algorithmique 1',
  title: id,
  openAt: at(1, 8, 0, 8),
  closeAt: null,
  state: 'opened',
  isChallenge: false,
  graded: false,
  exerciseCount: 6,
  exercisesDone: 0,
  started: false,
  terminated: false,
  ...values,
})

const DATA: StudentHomeData = {
  activities: [
    activity('Quiz : complexité', { closeAt: at(28, 23, 59), started: true, exercisesDone: 5 }),
    activity('TP 4 : boucles', { closeAt: at(1, 18, 0, 9), started: true, exercisesDone: 3 }),
    activity('TP 5 : récursivité', {}),
    activity('Contrôle continu 2', { state: 'planned', openAt: at(30, 10, 0), graded: true, attempts: 1 }),
  ],
  copies: [
    {
      sessionId: 's1',
      activityId: 'a3',
      activityTitle: 'TP 3 : conditions',
      courseId: 'c-ap1',
      courseName: 'Algorithmique 1',
      terminatedAt: at(26, 10, 0),
      status: 'graded',
      grade: 82,
    } as RecentCopy,
  ],
  courses: [{ id: 'c-ap1', name: 'Algorithmique 1' } as Course],
  figures: { averageScore: 78, successRate: 71, timeSpent: 41 * 3600 },
  announcements: [
    {
      id: 'n1',
      title: 'Maintenance dimanche 4 octobre, de 7 h à 9 h.',
      description: 'PLaTon sera indisponible pendant ces deux heures.',
      createdAt: at(27, 9, 0),
      active: true,
    } as Announcement,
  ],
}

const USER = { id: 'u1', username: 'ibenali', firstName: 'Inès', role: UserRoles.student } as User

describe('StudentHome', () => {
  let store: {
    status: ReturnType<typeof signal<LoadStatus>>
    data: ReturnType<typeof signal<StudentHomeData | undefined>>
    read: ReturnType<typeof signal<ReadonlySet<string>>>
    attempt: ReturnType<typeof signal<number>>
    load: jest.Mock
    retry: jest.Mock
    stop: jest.Mock
    dismissAnnouncement: jest.Mock
  }

  const render = ({
    status = 'ready' as LoadStatus,
    data = DATA as StudentHomeData | undefined,
    narrow = false,
  } = {}) => {
    TestBed.resetTestingModule()
    store = {
      status: signal(status),
      data: signal(data),
      read: signal(new Set<string>()),
      attempt: signal(0),
      load: jest.fn(),
      retry: jest.fn(),
      stop: jest.fn(),
      dismissAnnouncement: jest.fn((id: string) => store.read.update((read) => new Set([...read, id]))),
    }
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: LOCALE_ID, useValue: 'fr-FR' },
        { provide: StudentHomeStore, useValue: store },
        { provide: Session, useValue: { user: signal(USER) } },
        { provide: Connectivity, useValue: { online: signal(true) } },
        { provide: LiveAnnouncer, useValue: { announce: jest.fn(() => Promise.resolve()) } },
        {
          provide: BreakpointObserver,
          useValue: { observe: () => of({ matches: narrow, breakpoints: {} }), isMatched: () => narrow },
        },
      ],
    })
    const fixture = TestBed.createComponent(StudentHome)
    fixture.detectChanges()
    const page = fixture.nativeElement as HTMLElement
    document.body.appendChild(page)
    return { fixture, page }
  }

  beforeEach(() => jest.useFakeTimers({ now: NOW }))
  afterEach(() => {
    jest.useRealTimers()
    document.body.innerHTML = ''
  })

  const close = (page: HTMLElement) => (page.querySelector('pl-alert button') as HTMLButtonElement).click()
  const empty = { ...DATA, activities: [], copies: [], courses: [] }

  it('greets the student with the day and what closes this week, and loads its data', () => {
    const { page } = render()

    expect(store.load).toHaveBeenCalledTimes(1)
    expect(spoken(page.querySelector('h1'))).toBe('Bonjour Inès')
    expect(spoken(page.querySelector('pl-page-header p'))).toBe(
      'Lundi 28 septembre. Deux activités ferment cette semaine.'
    )
  })

  it('lists what to do by deadline, the most urgent only on a button, then what opens soon', () => {
    const { page } = render()
    const rows = Array.from(page.querySelectorAll('pl-activity-row'))

    expect(rows.map((row) => spoken(row.querySelector('.pl-activity-row__title')))).toEqual([
      'Quiz : complexité',
      'TP 4 : boucles',
      'TP 5 : récursivité',
      'Contrôle continu 2',
    ])
    expect(page.querySelectorAll('pl-activity-row a[plButton]')).toHaveLength(1)
    expect(spoken(rows[0].querySelector('a[plButton]'))).toBe('Reprendre')
    expect(spoken(rows[1].querySelector('a'))).toBe(
      'TP 4 : boucles Algorithmique 1, Ferme jeudi à 18 h, 3 sur 6 exercices faits Reprendre'
    )
    expect(spoken(page.querySelector('#home-soon'))).toBe('Bientôt')
    expect(spoken(rows[3].querySelector('a'))).toBe(
      'Contrôle continu 2 Algorithmique 1, Ouvre mercredi à 10 h, une tentative, Notée Lire les règles'
    )
  })

  it('shows the recent copies, the courses with their progress, and the three figures', () => {
    const { page } = render()

    expect(spoken(page.querySelector('pl-copy-card a'))).toBe(
      'TP 3 : conditions, 82 sur 100 Algorithmique 1 Rendue le 26 septembre Voir la correction'
    )
    expect(spoken(page.querySelector('.home__entry'))).toBe('Algorithmique 1, 33 %, 8 exercices sur 24')
    expect(Array.from(page.querySelectorAll('.home__figures dt')).map(spoken)).toEqual([
      'Moyenne',
      'Réussite',
      'Temps passé',
    ])
  })

  it('shows the announcement under the title, and closes it for good, the focus going to « À faire »', () => {
    const { fixture, page } = render()
    const alert = page.querySelector('pl-alert') as HTMLElement

    expect(spoken(alert)).toContain('Maintenance dimanche 4 octobre')
    expect(alert.compareDocumentPosition(page.querySelector('#home-todo') as Node)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    )
    close(page)
    fixture.detectChanges()

    expect(store.dismissAnnouncement).toHaveBeenCalledWith('n1')
    expect(page.querySelector('pl-alert')).toBeNull()
    expect(document.activeElement?.id).toBe('home-todo')
  })

  it('shows no other announcement once one is closed, until the page opens again', () => {
    const second = { ...DATA.announcements[0], id: 'n2', title: 'Plus ancienne', createdAt: new Date(2026, 8, 26, 9) }
    const { fixture, page } = render({ data: { ...DATA, announcements: [...DATA.announcements, second] } })

    close(page)
    fixture.detectChanges()

    expect(page.querySelector('pl-alert')).toBeNull()
  })

  it('puts the announcement after what to do on a phone, the focus going on to the results once closed', () => {
    const { fixture, page } = render({ narrow: true })
    const alert = page.querySelector('pl-alert') as HTMLElement

    expect(alert.compareDocumentPosition(page.querySelector('#home-todo') as Node)).toBe(
      Node.DOCUMENT_POSITION_PRECEDING
    )
    expect(page.querySelector('.home__figures')).toBeNull()
    close(page)
    fixture.detectChanges()
    expect(document.activeElement?.id).toBe('home-results')
  })

  it('welcomes a student without a course, and says how one appears', () => {
    const { page } = render({ data: empty })

    expect(spoken(page.querySelector('h1'))).toBe('Bienvenue sur PLaTon, Inès')
    expect(page.querySelector('pl-joy-mark')).not.toBeNull()
    expect(spoken(page.querySelector('pl-empty h2'))).toBe("Aucun cours pour l'instant")
    const help = page.querySelector('pl-empty a') as HTMLAnchorElement
    expect([help.getAttribute('href'), help.getAttribute('target')]).toEqual(['/docs', '_blank'])
    expect(page.querySelector('.home__figures')).toBeNull()
  })

  it.each([false, true])(
    'shows the announcement of an empty home on a phone too (%s), the focus going to the content once closed',
    (narrow) => {
      const { fixture, page } = render({ data: empty, narrow })

      expect(page.querySelector('pl-alert')).not.toBeNull()
      close(page)
      fixture.detectChanges()
      expect(document.activeElement?.id).toBe('contenu')
    }
  )

  it.each([false, true])(
    'shows the title and the zones at once while loading (phone: %s), then skeletons, and no banner',
    (narrow) => {
      const { fixture, page } = render({ status: 'loading', data: undefined, narrow })

      expect(spoken(page.querySelector('h1'))).toBe('Bonjour Inès')
      expect(spoken(page.querySelector('pl-page-header p'))).toBe('Lundi 28 septembre.')
      expect(Array.from(page.querySelectorAll('h2')).map(spoken)).toEqual(['À faire', 'Résultats récents', 'Mes cours'])
      expect(page.querySelector('pl-activity-row-skeleton')).toBeNull()

      jest.advanceTimersByTime(300)
      fixture.detectChanges()
      expect(page.querySelectorAll('pl-activity-row-skeleton').length).toBeGreaterThan(0)
      expect(page.querySelectorAll('pl-copy-card-skeleton')).toHaveLength(2)
      expect(page.querySelector('pl-alert')).toBeNull()
    }
  )

  it('says after 10 s that loading takes longer, the skeletons kept', () => {
    const { fixture, page } = render({ status: 'loading', data: undefined })
    jest.advanceTimersByTime(10_000)
    fixture.detectChanges()

    expect(spoken(page.querySelector('pl-alert'))).toContain("Le chargement prend plus de temps que d'habitude.")
    expect(page.querySelectorAll('pl-activity-row-skeleton').length).toBeGreaterThan(0)
  })

  it.each([false, true])('says it failed (phone: %s), with only « Réessayer » and no banner', (narrow) => {
    const { page } = render({ status: 'error', data: undefined, narrow })

    expect(spoken(page.querySelector('pl-empty h2'))).toBe("Votre accueil n'a pas pu être chargé")
    expect(page.querySelector('pl-alert')).toBeNull()
    expect(page.querySelector('pl-activity-row-skeleton')).toBeNull()
    expect(Array.from(page.querySelectorAll('button')).map(spoken)).toEqual(['Réessayer'])
  })

  it('tries again on « Réessayer », the focus going to the content', () => {
    const { page } = render({ status: 'error', data: undefined })

    ;(page.querySelector('button') as HTMLButtonElement).click()

    expect(store.retry).toHaveBeenCalled()
    expect(document.activeElement?.id).toBe('contenu')
  })

  it('stops loading when it is left', () => {
    const { fixture } = render({ status: 'loading', data: undefined })
    fixture.destroy()

    expect(store.stop).toHaveBeenCalled()
  })
})

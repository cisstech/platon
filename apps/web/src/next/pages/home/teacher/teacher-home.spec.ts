import { LiveAnnouncer } from '@angular/cdk/a11y'
import { LOCALE_ID, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { provideRouter } from '@angular/router'
import { User, UserRoles } from '@platon/core/common'
import { LoadStatus } from '@platon/design-system'
import { Announcement } from '@platon/feature/announcement/common'
import { Course, TaughtActivity } from '@platon/feature/course/common'
import { Resource, ResourceStatus, ResourceTypes } from '@platon/feature/resource/common'
import { ActivityCorrectionSummary } from '@platon/feature/result/common'
import { Connectivity } from '../../../core/connectivity/connectivity'
import { Session } from '../../../core/session/session'
import { spoken } from '../../../shared/testing/spoken'
import { ShellStore } from '../../../shell/data/shell-store'
import { TeacherHome } from './teacher-home'
import { TeacherHomeData, TeacherHomeStore } from '../data/teacher-home-store'

// A Monday afternoon, in the local time of the machine running the tests.
const NOW = new Date(2026, 8, 28, 14, 30)
const at = (day: number, hours: number, minutes = 0, month = 8) => new Date(2026, month, day, hours, minutes)

const taught = (id: string, values: Partial<TaughtActivity>): TaughtActivity => ({
  id,
  courseId: 'c-ap1',
  courseName: 'Algorithmique 1',
  title: id,
  openAt: at(1, 8, 0, 8),
  closeAt: null,
  state: 'opened',
  restricted: false,
  isChallenge: false,
  graded: false,
  studentCount: 302,
  startedCount: 0,
  ...values,
})

const resource = (id: string, name: string, type: ResourceTypes, status: ResourceStatus, viewedAt: Date) =>
  ({ id, name, type, status, viewedAt } as Resource)

const DATA: TeacherHomeData = {
  activities: [
    taught('tp4', { title: 'TP 4 : boucles', closeAt: at(1, 18, 0, 9), startedCount: 187, averageGrade: 68.4 }),
    taught('challenge', { title: 'Challenge : tris', isChallenge: true, startedCount: 118 }),
    taught('quiz', { title: 'Quiz : complexité', closeAt: at(28, 23, 59), startedCount: 251, averageGrade: 74 }),
    taught('tp5', { title: 'TP 5 : récursivité', openAt: null, startedCount: 23 }),
    taught('partiel', { title: 'Examen partiel 2', state: 'planned', openAt: at(12, 8, 0, 9), graded: true }),
  ],
  corrections: [
    {
      activityId: 'projet',
      activityName: 'Projet 1 : formulaire',
      courseId: 'c-web',
      courseName: 'Programmation web',
      totalExercises: 3,
      correctedExercises: 0,
      pendingCopies: 2,
      submittedCopies: 2,
      lastSubmittedAt: at(26, 10),
    } as ActivityCorrectionSummary,
  ],
  courses: [
    { id: 'c-ap1', name: 'Algorithmique 1', statistic: { studentCount: 302, teacherCount: 6 } } as Course,
    { id: 'c-web', name: 'Programmation web', statistic: { studentCount: 84, teacherCount: 2 } } as Course,
  ],
  viewed: [
    resource('r1', 'Recherche dichotomique', ResourceTypes.EXERCISE, ResourceStatus.READY, at(28, 9)),
    resource('r2', 'Parcours en largeur', ResourceTypes.EXERCISE, ResourceStatus.DRAFT, at(27, 16)),
    resource('r3', 'TP 4 : boucles', ResourceTypes.ACTIVITY, ResourceStatus.READY, at(25, 10)),
    resource('r4', 'Algorithmique', ResourceTypes.CIRCLE, ResourceStatus.READY, at(24, 10)),
  ],
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

const USER = { id: 'u1', username: 'khaddad', firstName: 'Karim', role: UserRoles.teacher } as User

describe('TeacherHome', () => {
  let store: {
    status: ReturnType<typeof signal<LoadStatus>>
    data: ReturnType<typeof signal<TeacherHomeData | undefined>>
    read: ReturnType<typeof signal<ReadonlySet<string>>>
    attempt: ReturnType<typeof signal<number>>
    load: jest.Mock
    retry: jest.Mock
    stop: jest.Mock
    dismissAnnouncement: jest.Mock
  }
  let shell: {
    quietCreate: ReturnType<typeof signal<boolean>>
    summaries: ReturnType<typeof signal<ActivityCorrectionSummary[] | undefined>>
  }

  const render = ({ status = 'ready' as LoadStatus, data = DATA as TeacherHomeData | undefined } = {}) => {
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
    // As left by a page that turned Create quiet, and a count of the cover loaded earlier.
    shell = { quietCreate: signal(true), summaries: signal<ActivityCorrectionSummary[] | undefined>([]) }
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: LOCALE_ID, useValue: 'fr-FR' },
        { provide: TeacherHomeStore, useValue: store },
        { provide: ShellStore, useValue: shell },
        { provide: Session, useValue: { user: signal(USER) } },
        { provide: Connectivity, useValue: { online: signal(true) } },
        { provide: LiveAnnouncer, useValue: { announce: jest.fn(() => Promise.resolve()) } },
      ],
    })
    const fixture = TestBed.createComponent(TeacherHome)
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
  const zone = (page: HTMLElement, id: string) => page.querySelector(`[aria-labelledby="${id}"]`) as HTMLElement
  const titles = (rows: Element[]) => rows.map((row) => spoken(row.querySelector('.pl-activity-row__title')))
  const empty = { ...DATA, activities: [], corrections: [], courses: [], viewed: [] }

  it('greets the teacher with the day, what closes this week and the copies to correct, and loads its data', () => {
    const { page } = render()

    expect(store.load).toHaveBeenCalledTimes(1)
    expect(spoken(page.querySelector('h1'))).toBe('Bonjour Karim')
    expect(spoken(page.querySelector('pl-page-header p'))).toBe(
      'Lundi 28 septembre. Deux activités ferment cette semaine, 2 copies à corriger.'
    )
  })

  it('lists what runs by deadline, each row opening its monitoring, without a button', () => {
    const { page } = render()
    const rows = [...zone(page, 'home-running').querySelectorAll('pl-activity-row')]

    expect(titles(rows)).toEqual(['Quiz : complexité', 'TP 4 : boucles', 'Challenge : tris'])
    expect(zone(page, 'home-running').querySelector('a[plButton]')).toBeNull()
    expect(spoken(rows[0].querySelector('a'))).toBe(
      'Quiz : complexité Algorithmique 1, Ferme ce soir à 23 h 59, moyenne provisoire 74 / 100, 251 sur 302 ont commencé'
    )
    expect(rows[0].querySelector('a')?.getAttribute('href')).toBe('/activities/monitor/c-ap1/quiz')
  })

  it('lists what waits for a gesture, each on a secondary button that names it', () => {
    const { page } = render()
    const rows = [...zone(page, 'home-gestures').querySelectorAll('pl-activity-row')]
    const buttons = rows.map((row) => row.querySelector('a[plButton]') as HTMLAnchorElement)

    expect(titles(rows)).toEqual(['Projet 1 : formulaire', 'TP 5 : récursivité', 'Examen partiel 2'])
    expect(buttons.map((button) => [spoken(button), button.dataset['variant']])).toEqual([
      ['Corriger', 'secondary'],
      ['Planifier', 'secondary'],
      ['Relire les réglages', 'secondary'],
    ])
    expect(buttons[0].getAttribute('href')).toBe('/player/correction/c-web?activityId=projet')
    expect(spoken(rows[0].querySelector('.pl-activity-row__progress'))).toBe('2 copies à corriger sur 2')
  })

  it('shows the courses with their members, and the first three resources viewed with their status', () => {
    const { page } = render()

    expect([...zone(page, 'home-courses').querySelectorAll('.home__entry')].map(spoken)).toEqual([
      'Algorithmique 1, 302 étudiants, 6 enseignants',
      'Programmation web, 84 étudiants, 2 enseignants',
    ])
    expect([...zone(page, 'home-viewed').querySelectorAll('.home__entry')].map(spoken)).toEqual([
      'Recherche dichotomique, Exercice, il y a 5 h, Prêt',
      'Parcours en largeur, Exercice, hier, Brouillon',
      'TP 4 : boucles, Activité, vendredi',
    ])
    expect(zone(page, 'home-viewed').querySelector('.home__entry')?.getAttribute('href')).toBe('/resources/r1')
    expect([...page.querySelectorAll('.home-zone__more')].map((link) => link.getAttribute('href'))).toEqual([
      '/courses',
      '/resources',
    ])
  })

  it('says when a zone has nothing yet', () => {
    const { page } = render({ data: { ...DATA, activities: [], corrections: [], viewed: [] } })

    expect(spoken(zone(page, 'home-running').querySelector('.home__nothing'))).toBe('Aucune activité en cours.')
    expect(spoken(zone(page, 'home-gestures').querySelector('.home__nothing'))).toBe(
      "Rien ne vous attend pour l'instant."
    )
    expect(spoken(zone(page, 'home-viewed').querySelector('.home__nothing'))).toBe(
      'Les ressources que vous ouvrez apparaîtront ici.'
    )
  })

  it('shows the announcement under the title, and closes it for good, the focus going to « En cours »', () => {
    const { fixture, page } = render()
    const alert = page.querySelector('pl-alert') as HTMLElement

    expect(spoken(alert)).toContain('Maintenance dimanche 4 octobre')
    expect(alert.compareDocumentPosition(page.querySelector('#home-running') as Node)).toBe(
      Node.DOCUMENT_POSITION_FOLLOWING
    )
    close(page)
    fixture.detectChanges()

    expect(store.dismissAnnouncement).toHaveBeenCalledWith('n1')
    expect(page.querySelector('pl-alert')).toBeNull()
    expect(document.activeElement?.id).toBe('home-running')
  })

  it('leaves Create primary when the teacher has courses, and gives the cover the fresher count of copies', () => {
    render()

    expect(shell.quietCreate()).toBe(false)
    expect(shell.summaries()).toBe(DATA.corrections)
  })

  it('keeps the home of a teacher whose courses are all archived while copies wait for them', () => {
    const { page } = render({ data: { ...empty, corrections: DATA.corrections } })

    expect(spoken(page.querySelector('h1'))).toBe('Bonjour Karim')
    expect(spoken(zone(page, 'home-gestures').querySelector('a[plButton]'))).toBe('Corriger')
    expect(spoken(zone(page, 'home-courses').querySelector('.home__nothing'))).toBe(
      'Aucun cours en dehors de vos archives.'
    )
    expect(shell.quietCreate()).toBe(false)
  })

  it('welcomes a teacher without a course with three steps, creating a course the only primary action', () => {
    const { fixture, page } = render({ status: 'loading', data: undefined })
    expect(shell.quietCreate()).toBe(false)
    store.data.set(empty)
    store.status.set('ready')
    fixture.detectChanges()

    expect(spoken(page.querySelector('h1'))).toBe('Bienvenue sur PLaTon, Karim')
    expect(page.querySelector('pl-joy-mark')).not.toBeNull()
    expect(spoken(page.querySelector('pl-page-header p'))).toBe('Trois étapes pour faire travailler vos étudiants.')
    expect(spoken(page.querySelector('pl-empty h2'))).toBe('Vos cours apparaîtront ici')
    expect([...page.querySelectorAll('pl-step h3')].map(spoken)).toEqual([
      'Créer votre cours',
      'Trouver ou écrire un exercice',
      'Ajouter une activité',
    ])
    const actions = [...page.querySelectorAll<HTMLAnchorElement>('pl-step a[plButton]')]
    expect(actions.map((action) => [spoken(action), action.dataset['variant'], action.getAttribute('href')])).toEqual([
      ['Créer un cours', 'primary', '/courses/create'],
      ["Partir d'un modèle", 'secondary', '/templates'],
      ['Parcourir les ressources', 'ghost', '/resources'],
    ])
    expect(page.querySelector('#home-running')).toBeNull()
    expect(shell.quietCreate()).toBe(true)
    fixture.destroy()
    expect(shell.quietCreate()).toBe(false)
  })

  it('shows the announcement of an empty home too, the focus going to the content once closed', () => {
    const { fixture, page } = render({ data: empty })

    close(page)
    fixture.detectChanges()

    expect(document.activeElement?.id).toBe('contenu')
  })

  it('shows the title and the zones at once while loading, then skeletons, and no banner', () => {
    const { fixture, page } = render({ status: 'loading', data: undefined })

    expect(spoken(page.querySelector('h1'))).toBe('Bonjour Karim')
    expect(spoken(page.querySelector('pl-page-header p'))).toBe('Lundi 28 septembre.')
    expect([...page.querySelectorAll('h2')].map(spoken)).toEqual(['En cours', 'À faire', 'Mes cours', 'Vu récemment'])
    expect(page.querySelector('pl-activity-row-skeleton')).toBeNull()

    jest.advanceTimersByTime(300)
    fixture.detectChanges()
    expect(page.querySelectorAll('pl-activity-row-skeleton').length).toBeGreaterThan(0)
    expect(page.querySelector('pl-alert')).toBeNull()
    expect(shell.quietCreate()).toBe(false)
  })

  it('says after 10 s that loading takes longer, the skeletons kept', () => {
    const { fixture, page } = render({ status: 'loading', data: undefined })
    jest.advanceTimersByTime(10_000)
    fixture.detectChanges()

    expect(spoken(page.querySelector('pl-alert'))).toContain("Le chargement prend plus de temps que d'habitude.")
    expect(page.querySelectorAll('pl-activity-row-skeleton').length).toBeGreaterThan(0)
  })

  it('says it failed, with only « Réessayer » and no banner', () => {
    const { page } = render({ status: 'error', data: undefined })

    expect(spoken(page.querySelector('pl-empty h2'))).toBe("Votre accueil n'a pas pu être chargé")
    expect(page.querySelector('pl-alert')).toBeNull()
    expect([...page.querySelectorAll('button')].map(spoken)).toEqual(['Réessayer'])
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

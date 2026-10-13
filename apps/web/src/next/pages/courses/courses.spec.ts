import { LiveAnnouncer } from '@angular/cdk/a11y'
import { Dialog as CdkDialog } from '@angular/cdk/dialog'
import { BreakpointObserver } from '@angular/cdk/layout'
import { HttpErrorResponse } from '@angular/common/http'
import { LOCALE_ID, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { provideRouter, Router } from '@angular/router'
import { RouterTestingHarness } from '@angular/router/testing'
import { DialogService } from '@platon/core/browser/shared'
import { Course, PlayableActivity } from '@platon/feature/course/common'
import { of, Subject, throwError } from 'rxjs'
import { Connectivity } from '../../core/connectivity/connectivity'
import { Session } from '../../core/session/session'
import { spoken } from '../../shared/testing/spoken'
import { Courses } from './courses'
import { CoursesApi } from './data/courses-api'
import { CoursesStore } from './data/courses-store'
import { CourseCreateDialog } from './ui/course-create-dialog/course-create-dialog'

const karim = { id: 'u1', username: 'khaddad', firstName: 'Karim', lastName: 'Haddad' }
const course = (id: string, name: string, values: Partial<Course> = {}) =>
  ({
    id,
    name,
    desc: `Description de ${name}`,
    ownerId: 'u1',
    owner: karim,
    updatedAt: new Date(2026, 8, 26, 9),
    statistic: { teacherCount: 6, studentCount: 302, activityCount: 9, challengeCount: id === 'ap1' ? 1 : 0 },
    permissions: { update: true, archive: true },
    ...values,
  } as Course)
const CURRENT = [course('ap1', 'Algorithmique et programmation 1'), course('pw', 'Programmation web')]
const ARCHIVED = [course('old', 'Java, L3')]
const inThreeDays = () => new Date(Date.now() + 3 * 24 * 3600 * 1000)
const ACTIVITIES = [
  {
    id: 'q',
    courseId: 'ap1',
    title: 'Quiz',
    state: 'opened',
    closeAt: inThreeDays(),
    exercisesDone: 1,
    exerciseCount: 4,
    terminated: false,
  } as PlayableActivity,
]

describe('Courses', () => {
  let api: { mine: jest.Mock; platform: jest.Mock; activities: jest.Mock; archive: jest.Mock; create: jest.Mock }
  let dialog: { open: jest.Mock }
  let closed: Subject<Course | undefined>
  let messages: { error: jest.Mock }
  let announce: jest.Mock

  const setup = async ({
    role = 'teacher',
    narrow = false,
    url = '/courses',
    realDialog = false,
    stable = true,
  }: {
    role?: 'teacher' | 'student' | 'admin'
    narrow?: boolean
    url?: string
    realDialog?: boolean
    stable?: boolean
  } = {}) => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          { path: 'courses', component: Courses, providers: [CoursesStore] },
          { path: 'courses/:id', children: [] },
          { path: 'courses/:id/challenges', children: [] },
        ]),
        { provide: CoursesApi, useValue: api },
        {
          provide: Session,
          useValue: { isTeacher: signal(role !== 'student'), isAdmin: signal(role === 'admin'), user: signal(karim) },
        },
        ...(realDialog ? [] : [{ provide: CdkDialog, useValue: dialog }]),
        { provide: DialogService, useValue: messages },
        { provide: LiveAnnouncer, useValue: { announce } },
        { provide: Connectivity, useValue: { online: signal(true) } },
        { provide: LOCALE_ID, useValue: 'fr-FR' },
        {
          provide: BreakpointObserver,
          useValue: { observe: () => of({ matches: narrow, breakpoints: {} }), isMatched: () => narrow },
        },
      ],
    })
    const harness = await RouterTestingHarness.create()
    await harness.navigateByUrl(url, Courses)
    if (stable) await settle(harness)
    document.body.appendChild(harness.routeNativeElement as HTMLElement)
    return harness
  }
  const settle = async (harness: RouterTestingHarness) => {
    harness.detectChanges()
    await harness.fixture.whenStable()
    harness.detectChanges()
  }
  const page = () => document.querySelector('app-courses') as HTMLElement
  const links = () => [...page().querySelectorAll<HTMLElement>('.course-list__grid .pl-binder__link')]
  const button = (label: string) =>
    [...document.querySelectorAll<HTMLButtonElement>('button')].find((b) => spoken(b)?.startsWith(label))
  /** The button of the actions of a course: its name is its label only. */
  const actions = (course: string) =>
    document.querySelector<HTMLButtonElement>(`button[aria-label^="Actions du cours ${course}"]`) ?? undefined
  const menuItem = (label: string) =>
    [...document.querySelectorAll<HTMLElement>('pl-menu-item')].find((item) => spoken(item)?.startsWith(label))
  const tabs = () => [...page().querySelectorAll('pl-segmented label')].map((label) => spoken(label))
  const tab = (index: number) => (page().querySelectorAll('pl-segmented input')[index] as HTMLInputElement).click()
  const searchField = () => page().querySelector('input[type="search"]') as HTMLInputElement
  const type = (value: string) => {
    searchField().value = value
    searchField().dispatchEvent(new Event('input'))
  }
  const pause = () => new Promise((resolve) => setTimeout(resolve, 350))
  const url = () => TestBed.inject(Router).url
  const words = (text?: string | null) => text?.replace(/\s/g, ' ')

  beforeEach(() => {
    api = {
      mine: jest.fn((_filters, archived: boolean) => of(archived ? ARCHIVED : CURRENT)),
      platform: jest.fn(() => of({ courses: [course('p1', 'Physique 1'), course('p2', 'Physique 2')], total: 3 })),
      activities: jest.fn(() => of(ACTIVITIES)),
      archive: jest.fn(() => of({})),
      create: jest.fn((name: string) => of(course('new', name))),
    }
    closed = new Subject()
    dialog = { open: jest.fn(() => ({ closed })) }
    messages = { error: jest.fn() }
    announce = jest.fn(() => Promise.resolve())
  })

  afterEach(() => {
    jest.useRealTimers()
    document.body.innerHTML = ''
  })

  it('shows a teacher their courses in binders, with the headcount, and offers to create one', async () => {
    await setup()

    expect(spoken(page().querySelector('h1'))).toBe('Cours')
    expect(button('Créer un cours')).toBeDefined()
    expect(spoken(page().querySelector('app-course-toolbar label'))).toBe('Chercher un cours')
    expect(tabs()).toEqual(['Actuels, 2', 'Archivés, 1'])
    expect(links().map(spoken)).toEqual(['Algorithmique et programmation 1', 'Programmation web'])
    const first = page().querySelector('app-course-card') as HTMLElement
    expect(spoken(first.querySelector('.course-card__counts'))).toBe('6 enseignants, 302 étudiants, 9 activités')
    expect(spoken(first.querySelector('.course-card__counts + .course-card__line'))).toBe('Mis à jour le 26 sept.')
    expect(spoken(first.querySelector('a.pl-binder__badge'))).toBe('1 challenge, Algorithmique et programmation 1')
    expect(api.activities).not.toHaveBeenCalled()
  })

  it('shows a student their progress, who teaches and their next deadline, never the headcount', async () => {
    await setup({ role: 'student' })

    expect(button('Créer un cours')).toBeUndefined()
    const first = page().querySelector('app-course-card') as HTMLElement
    expect(first.querySelector('.course-card__counts')).toBeNull()
    expect(first.querySelector('pl-progress[role="progressbar"]')?.getAttribute('aria-label')).toBe(
      'Votre avancement dans Algorithmique et programmation 1'
    )
    expect(spoken(first.querySelector('.course-card__progress + .course-card__line'))).toBe(
      '1 exercice sur 4, 0 activité terminée sur 1'
    )
    expect(spoken(first.querySelector('.course-card__due'))).toMatch(/^Quiz : ferme /)
    expect(spoken(first.querySelector('.course-card__teachers'))).toBe('Karim Haddad et 5 autres enseignants')
  })

  it('shows the archived courses of a student with who teaches only, and says so in the address', async () => {
    const harness = await setup({ role: 'student' })

    tab(1)
    await settle(harness)

    expect(links().map(spoken)).toEqual(['Java, L3'])
    const card = page().querySelector('app-course-card') as HTMLElement
    expect(card.querySelector('pl-progress')).toBeNull()
    expect(spoken(card.querySelector('.course-card__teachers'))).toBe('Karim Haddad et 5 autres enseignants')
    expect(url()).toBe('/courses?tab=archived')
  })

  it('archives a course for oneself from its menu, the focus going to the course that takes its place', async () => {
    const harness = await setup()

    actions('Algorithmique')?.click()
    await settle(harness)
    menuItem('Archiver')?.click()
    await settle(harness)
    await settle(harness)

    expect(api.archive).toHaveBeenCalledWith('ap1', true)
    expect(links().map(spoken)).toEqual(['Programmation web'])
    expect(tabs()).toEqual(['Actuels, 1', 'Archivés, 2'])
    expect(announce).toHaveBeenCalledWith('Algorithmique et programmation 1 est rangé dans vos archivés.', 'polite')
    expect(document.activeElement).toBe(links()[0])
  })

  it('moves a course at once, and puts it back with the focus on its menu when archiving fails', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined)
    const refused = new Subject<never>()
    api.archive.mockReturnValue(refused)
    const harness = await setup()

    actions('Algorithmique')?.click()
    await settle(harness)
    menuItem('Archiver')?.click()
    await settle(harness)
    expect(links().map(spoken)).toEqual(['Programmation web'])
    expect(document.activeElement).toBe(links()[0])

    refused.error(new HttpErrorResponse({ status: 404 }))
    await settle(harness)
    await settle(harness)

    expect(links()).toHaveLength(2)
    expect(messages.error).toHaveBeenCalledWith("Le cours n'a pas pu être archivé. Réessayez dans un instant.")
    expect(document.activeElement).toBe(actions('Algorithmique'))
  })

  it('brings a course back from the archives of a student, with their progress in it', async () => {
    const harness = await setup({ role: 'student' })
    api.activities.mockReturnValue(of([...ACTIVITIES, { ...ACTIVITIES[0], id: 'tp', courseId: 'old', title: 'TP 1' }]))
    tab(1)
    await settle(harness)

    actions('Java')?.click()
    await settle(harness)
    menuItem('Désarchiver')?.click()
    await settle(harness)
    await settle(harness)

    expect(api.archive).toHaveBeenCalledWith('old', false)
    expect(announce).toHaveBeenCalledWith('Java, L3 est revenu dans vos cours actuels.', 'polite')
    expect(spoken(page().querySelector('pl-empty h2'))).toBe('Aucun cours archivé')
    expect(document.activeElement).toBe(page().querySelector('pl-segmented input:checked'))
    tab(0)
    await settle(harness)
    const card = page().querySelector('app-course-card') as HTMLElement
    expect(spoken(card.querySelector('.pl-binder__link'))).toBe('Java, L3')
    expect(words(spoken(card.querySelector('.course-card__progress + .course-card__line')))).toBe(
      '1 exercice sur 4, 0 activité terminée sur 1'
    )
  })

  it('says when a course could not come back from the archives', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined)
    const refused = new Subject<never>()
    api.archive.mockReturnValue(refused)
    const harness = await setup()
    tab(1)
    await settle(harness)

    actions('Java')?.click()
    await settle(harness)
    menuItem('Désarchiver')?.click()
    await settle(harness)
    refused.error(new HttpErrorResponse({ status: 502 }))
    await settle(harness)
    await settle(harness)

    expect(messages.error).toHaveBeenCalledWith(
      "Le cours n'a pas pu revenir dans vos cours actuels. Réessayez dans un instant."
    )
    expect(links().map(spoken)).toEqual(['Java, L3'])
  })

  it('offers to archive only to who may', async () => {
    api.mine.mockImplementation((_filters, archived: boolean) =>
      of(archived ? [] : [course('ap1', 'Algorithmique', { permissions: { update: false, archive: false } })])
    )
    await setup({ role: 'student' })

    actions('Algorithmique')?.click()

    expect(menuItem('Archiver')).toBeUndefined()
    expect(menuItem('Voir les challenges')).toBeDefined()
  })

  it('opens the challenges of a course from its menu', async () => {
    const harness = await setup()

    actions('Algorithmique')?.click()
    await settle(harness)
    menuItem('Voir les challenges')?.click()
    await settle(harness)

    expect(url()).toBe('/courses/ap1/challenges')
  })

  it('searches the courses, says and announces when none matches, and clears the search, the focus back in the field', async () => {
    const harness = await setup()
    api.mine.mockReturnValue(of([]))

    type('zzz')
    await pause()
    await settle(harness)

    expect(api.mine).toHaveBeenLastCalledWith(expect.objectContaining({ search: 'zzz' }), true)
    expect(url()).toBe('/courses?q=zzz')
    expect(words(spoken(page().querySelector('pl-empty h2')))).toBe('Aucun cours ne correspond à « zzz ».')
    expect(announce).toHaveBeenCalledWith('Aucun cours ne correspond à «\u00a0zzz\u00a0».', 'polite')

    api.mine.mockImplementation((_filters, archived: boolean) => of(archived ? ARCHIVED : CURRENT))
    button('Effacer la recherche')?.click()
    await settle(harness)

    expect(links()).toHaveLength(2)
    expect(document.activeElement).toBe(searchField())
    expect(announce).toHaveBeenLastCalledWith('2 cours', 'polite')
  })

  it('keeps the search in view while a cleared search waits for its pause', async () => {
    const harness = await setup()
    api.mine.mockReturnValue(of([]))
    searchField().focus()
    type('zzz')
    await pause()
    await settle(harness)

    type('')
    harness.detectChanges()

    expect(page().querySelector('app-course-toolbar')).not.toBeNull()
    expect(document.activeElement).toBe(searchField())
    expect(words(spoken(page().querySelector('pl-empty h2')))).toBe('Aucun cours ne correspond à « zzz ».')
  })

  it('sorts and limits the courses to a period, in the address, and says when the period holds none', async () => {
    const harness = await setup()

    button('Trier')?.click()
    await settle(harness)
    menuItem('Par nom')?.click()
    await settle(harness)
    expect(api.mine).toHaveBeenLastCalledWith(expect.objectContaining({ order: 'NAME' }), true)
    expect(url()).toBe('/courses?order=NAME')

    api.mine.mockReturnValue(of([]))
    button('Mis à jour')?.click()
    await settle(harness)
    menuItem('7 derniers jours')?.click()
    await settle(harness)

    expect(url()).toBe('/courses?order=NAME&period=7')
    expect(spoken(page().querySelector('pl-empty h2'))).toBe('Aucun cours mis à jour sur cette période.')
    api.mine.mockImplementation((_filters, archived: boolean) => of(archived ? ARCHIVED : CURRENT))
    button('Voir toutes les périodes')?.click()
    await settle(harness)

    expect(url()).toBe('/courses?order=NAME')
    expect(links()).toHaveLength(2)
  })

  it('follows the address when it changes with the page open, as « Cours » of the cover does', async () => {
    const harness = await setup({ url: '/courses?q=algo&tab=archived' })
    expect(searchField().value).toBe('algo')

    await TestBed.inject(Router).navigateByUrl('/courses')
    await settle(harness)

    expect(searchField().value).toBe('')
    expect(page().querySelector('pl-segmented input:checked')).toBe(page().querySelector('pl-segmented input'))
    expect(api.mine).toHaveBeenLastCalledWith(expect.objectContaining({ search: '' }), true)
    expect(links()).toHaveLength(2)
  })

  it('shows binders on their way after a moment, then says the loading takes longer', async () => {
    jest.useFakeTimers({ doNotFake: ['queueMicrotask', 'nextTick'] })
    api.mine.mockReturnValue(new Subject())
    const harness = await setup({ stable: false })
    expect(page().querySelector('pl-binder-skeleton')).toBeNull()

    jest.advanceTimersByTime(300)
    harness.detectChanges()
    expect(page().querySelectorAll('pl-binder-skeleton')).toHaveLength(3)

    jest.advanceTimersByTime(10_000)
    harness.detectChanges()
    expect(spoken(page().querySelector('app-load-state'))).toContain(
      "Le chargement prend plus de temps que d'habitude."
    )
    expect(page().querySelectorAll('pl-binder-skeleton')).toHaveLength(3)
  })

  it('tells a teacher without a course what a course is, and offers to create one', async () => {
    api.mine.mockReturnValue(of([]))
    await setup()

    expect(spoken(page().querySelector('pl-empty h2'))).toBe("Aucun cours pour l'instant")
    expect(spoken(page().querySelector('.pl-empty__actions button'))).toBe('Créer un cours')
    expect(page().querySelector('app-course-toolbar')).toBeNull()
  })

  it('tells a student without a course that their teachers enrol them', async () => {
    api.mine.mockReturnValue(of([]))
    await setup({ role: 'student' })

    expect(words(spoken(page().querySelector('pl-empty p')))).toBe(
      'Vos enseignants vous inscrivent à leurs cours : ils apparaîtront ici.'
    )
  })

  it('says a student has no archived course', async () => {
    api.mine.mockImplementation((_filters, archived: boolean) => of(archived ? [] : CURRENT))
    const harness = await setup({ role: 'student' })

    tab(1)
    await settle(harness)

    expect(spoken(page().querySelector('pl-empty h2'))).toBe('Aucun cours archivé')
  })

  it('says a student has no current course, their archived ones kept apart', async () => {
    api.mine.mockImplementation((_filters, archived: boolean) => of(archived ? ARCHIVED : []))
    await setup({ role: 'student' })

    expect(spoken(page().querySelector('pl-empty h2'))).toBe('Aucun cours actuel')
    expect(tabs()).toEqual(['Actuels, 0', 'Archivés, 1'])
  })

  it('keeps the whole platform within reach of an administrator who belongs to no course', async () => {
    api.mine.mockReturnValue(of([]))
    await setup({ role: 'admin' })

    expect(tabs()).toEqual(['Actuels, 0', 'Archivés, 0', 'Toute la plateforme'])
    expect(spoken(page().querySelector('pl-empty h2'))).toBe('Aucun cours dont vous êtes membre')
    expect(words(spoken(page().querySelector('pl-empty p')))).toBe('« Toute la plateforme » montre tous les cours.')
  })

  it('creates a course in a dialog, then opens it', async () => {
    const harness = await setup()
    const navigate = jest.spyOn(TestBed.inject(Router), 'navigate')

    button('Créer un cours')?.click()
    await settle(harness)

    expect(dialog.open).toHaveBeenCalledWith(CourseCreateDialog, expect.anything())
    const created = await dialog.open.mock.calls[0][1].data.create('Algorithmique 2', 'L1, semestre 2.')
    expect(api.create).toHaveBeenCalledWith('Algorithmique 2', 'L1, semestre 2.')
    closed.next(created)
    await settle(harness)

    expect(navigate).toHaveBeenCalledWith(['/courses', 'new'], { replaceUrl: false })
  })

  it('opens the course created from the address of the creation in its place, so that Back does not open the dialog again', async () => {
    const harness = await setup({ url: '/courses?create=true' })
    const navigate = jest.spyOn(TestBed.inject(Router), 'navigate')

    closed.next(course('new', 'Algorithmique 2'))
    await settle(harness)

    expect(navigate).toHaveBeenCalledWith(['/courses', 'new'], { replaceUrl: true })
  })

  it('opens the dialog from the address of the creation, and leaves it when cancelled, the focus on « Créer un cours »', async () => {
    const harness = await setup({ url: '/courses?create=true', realDialog: true })

    const cancel = [...document.querySelectorAll<HTMLButtonElement>('button')].find((b) => spoken(b) === 'Annuler')
    expect(spoken(document.querySelector('[role="dialog"] h2'))).toBe('Créer un cours')
    cancel?.click()
    await settle(harness)

    expect(url()).toBe('/courses')
    expect(document.activeElement).toBe(button('Créer un cours'))
  })

  it('shows an administrator every course of the platform, page after page', async () => {
    const harness = await setup({ role: 'admin' })

    expect(tabs()).toEqual(['Actuels, 2', 'Archivés, 1', 'Toute la plateforme'])
    tab(2)
    await settle(harness)

    expect(links().map(spoken)).toEqual(['Physique 1', 'Physique 2'])
    expect(actions('Physique 1')).toBeUndefined()
    api.platform.mockReturnValue(of({ courses: [course('p3', 'Physique 3')], total: 3 }))
    button('Afficher plus de cours')?.click()
    await settle(harness)

    expect(links().map(spoken)).toEqual(['Physique 1', 'Physique 2', 'Physique 3'])
    expect(button('Afficher plus de cours')).toBeUndefined()
    expect(document.activeElement).toBe(links()[2])
  })

  it('gives anyone but an administrator their current courses for the whole platform, in the address too', async () => {
    const harness = await setup({ role: 'student', url: '/courses?tab=platform' })
    await settle(harness)

    expect(tabs()).toEqual(['Actuels, 2', 'Archivés, 1'])
    expect(url()).toBe('/courses')
  })

  it('shows compact binders on a phone, the bar keeping the search and the tabs', async () => {
    await setup({ role: 'student', narrow: true })

    expect(page().querySelectorAll('pl-binder[data-compact]')).toHaveLength(2)
    expect(page().querySelector('pl-course-mark')).not.toBeNull()
    expect(button('Trier')).toBeUndefined()
    expect(tabs()).toEqual(['Actuels, 2', 'Archivés, 1'])
  })

  it('says the courses failed to load, and loads them again on « Réessayer »', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined)
    api.mine.mockReturnValueOnce(throwError(() => new HttpErrorResponse({ status: 403 })))
    const harness = await setup()

    expect(spoken(page().querySelector('app-load-state h2'))).toBe("Vos cours n'ont pas pu être chargés")
    button('Réessayer')?.click()
    await settle(harness)

    expect(links()).toHaveLength(2)
  })
})

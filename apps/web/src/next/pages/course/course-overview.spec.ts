import { LiveAnnouncer } from '@angular/cdk/a11y'
import { Clipboard } from '@angular/cdk/clipboard'
import { BreakpointObserver } from '@angular/cdk/layout'
import { HttpErrorResponse } from '@angular/common/http'
import { LOCALE_ID } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { provideRouter, Router, withComponentInputBinding } from '@angular/router'
import { RouterTestingHarness } from '@angular/router/testing'
import { PAGE_CONTENT_ID } from '@platon/design-system'
import { Course, CourseSection, PlayableActivity, TaughtActivity } from '@platon/feature/course/common'
import { Observable, of, throwError } from 'rxjs'
import { spoken } from '../../shared/testing/spoken'
import { CourseOverview } from './course-overview'
import { CourseApi } from './data/course-api'
import { CourseStore } from './data/course-store'

const DAY = 24 * 3600 * 1000
const inDays = (days: number) => new Date(Date.now() + days * DAY)

const karim = { id: 'u1', username: 'khaddad', firstName: 'Karim', lastName: 'Haddad' }
const course = (id: string, name: string, values: Partial<Course> = {}) =>
  ({
    id,
    name,
    desc: `Description de ${name}`,
    ownerId: 'u1',
    owner: karim,
    createdAt: inDays(-30),
    statistic: { teacherCount: 6, studentCount: 302, activityCount: 9, challengeCount: 0, timeSpent: 34800 },
    permissions: { update: true, archive: true },
    ...values,
  } as Course)
const AP1 = course('ap1', 'Algorithmique et programmation 1')
const AP1_STUDENT = course('ap1', 'Algorithmique et programmation 1', { permissions: { update: false, archive: true } })
const SECTIONS = [
  { id: 's1', name: 'Bases', order: 0, courseId: 'ap1' },
  { id: 's2', name: 'Récursivité', order: 1, courseId: 'ap1' },
] as CourseSection[]
const taught = (id: string, title: string, values: Partial<TaughtActivity> = {}): TaughtActivity => ({
  id,
  courseId: 'ap1',
  courseName: 'AP1',
  sectionId: 's1',
  order: 0,
  title,
  resourceId: 'r1',
  openAt: inDays(-10),
  closeAt: inDays(5),
  state: 'opened',
  restricted: false,
  isChallenge: false,
  graded: false,
  exerciseCount: 8,
  studentCount: 302,
  startedCount: 251,
  pendingCopies: 0,
  correctors: [],
  ...values,
})
const TAUGHT = [
  taught('tp1', 'TP 1 : variables'),
  taught('exam', 'Examen partiel 1', {
    order: 1,
    state: 'closed',
    openAt: inDays(-20),
    closeAt: inDays(-15),
    graded: true,
    pendingCopies: 14,
    correctors: ['Julien Lefèvre'],
  }),
  taught('tp5', 'TP 5 : récursivité', { sectionId: 's2', openAt: null, closeAt: null, startedCount: 23 }),
]
const playable = (id: string, title: string, values: Partial<PlayableActivity> = {}): PlayableActivity => ({
  id,
  courseId: 'ap1',
  courseName: 'AP1',
  sectionId: 's1',
  order: 0,
  title,
  openAt: inDays(-10),
  closeAt: inDays(5),
  state: 'opened',
  isChallenge: false,
  graded: false,
  exerciseCount: 6,
  exercisesDone: 0,
  started: false,
  terminated: false,
  ...values,
})
const PLAYABLE = [
  playable('tp1', 'TP 1 : variables', { exercisesDone: 5, started: true }),
  playable('exam', 'Examen partiel 1', {
    order: 1,
    state: 'closed',
    closeAt: inDays(-15),
    graded: true,
    started: true,
    terminated: true,
    grade: 82,
  }),
  playable('tp6', 'TP 6 : arbres', { sectionId: 's2', state: 'planned', openAt: inDays(3), closeAt: inDays(10) }),
]

describe('CourseOverview', () => {
  let api: Record<'course' | 'sections' | 'taught' | 'playable', jest.Mock>
  let clipboard: { copy: jest.Mock }
  let announce: jest.Mock

  const setup = async ({
    narrow = false,
    url = '/courses/ap1',
    stable = true,
  }: { narrow?: boolean; url?: string; stable?: boolean } = {}) => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter(
          [
            { path: 'courses/:id', component: CourseOverview, providers: [CourseStore] },
            { path: '**', children: [] },
          ],
          withComponentInputBinding()
        ),
        { provide: CourseApi, useValue: api },
        { provide: Clipboard, useValue: clipboard },
        { provide: LiveAnnouncer, useValue: { announce } },
        { provide: LOCALE_ID, useValue: 'fr-FR' },
        {
          provide: BreakpointObserver,
          useValue: { observe: () => of({ matches: narrow, breakpoints: {} }), isMatched: () => narrow },
        },
      ],
    })
    const harness = await RouterTestingHarness.create()
    await harness.navigateByUrl(url, CourseOverview)
    if (stable) await settle(harness)
    document.body.appendChild(harness.routeNativeElement as HTMLElement)
    return harness
  }
  const settle = async (harness: RouterTestingHarness) => {
    harness.detectChanges()
    await harness.fixture.whenStable()
    harness.detectChanges()
  }
  const page = () => document.querySelector('app-course-overview') as HTMLElement
  const heading = () => spoken(page().querySelector('h1'))
  const figures = () => [...page().querySelectorAll('pl-page-figure')].map((figure) => spoken(figure))
  const tabs = () => [...page().querySelectorAll('pl-page-tabs a')].map((tab) => spoken(tab))
  const sections = () => [...page().querySelectorAll('pl-course-section h2')].map((section) => spoken(section))
  /** The rows of the sections, not those of the column beside them. */
  const rows = () =>
    [...page().querySelectorAll('.course-layout__main .pl-activity-row__title')].map((title) => spoken(title))
  /** Opens the menu of the row of `activity`, then gives its items. */
  const openMenu = async (harness: RouterTestingHarness, activity: string) => {
    const trigger = document.querySelector<HTMLButtonElement>(`button[aria-label="Plus d'actions pour ${activity}"]`)
    trigger?.click()
    await settle(harness)
    const menu = document.getElementById(trigger?.getAttribute('aria-controls') ?? '')
    return [...(menu?.querySelectorAll<HTMLElement>('pl-menu-item') ?? [])]
  }
  const button = (label: string) =>
    [...document.querySelectorAll<HTMLButtonElement>('button')].find((b) => spoken(b)?.startsWith(label))
  const link = (label: string) =>
    [...page().querySelectorAll<HTMLAnchorElement>('a')].find((a) => spoken(a)?.startsWith(label))
  const searchField = () => page().querySelector('input[type="search"]') as HTMLInputElement
  const words = (text?: string | null) => text?.replace(/\s/g, ' ')
  const url = () => TestBed.inject(Router).url

  beforeEach(() => {
    api = {
      course: jest.fn((id: string) => of(id === 'ap1' ? AP1 : course(id, 'Programmation web'))),
      sections: jest.fn(() => of(SECTIONS)),
      taught: jest.fn(() => of(TAUGHT)),
      playable: jest.fn(() => of(PLAYABLE)),
    }
    clipboard = { copy: jest.fn(() => true) }
    announce = jest.fn(() => Promise.resolve())
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.restoreAllMocks()
    document.body.innerHTML = ''
  })

  describe('for its teacher', () => {
    it('shows its head: its name, its description, its headcount, when and by whom it was created', async () => {
      await setup()

      expect(heading()).toBe('Algorithmique et programmation 1')
      expect(link('Cours')?.getAttribute('href')).toBe('/courses')
      expect(page().textContent).toContain('Description de Algorithmique et programmation 1')
      expect(page().querySelector('pl-course-mark')?.textContent?.trim()).toBe('AP1')
      expect(figures()).toEqual([
        '6 enseignants',
        '302 étudiants',
        '9 activités',
        expect.stringMatching(/^créé le .+ par Karim Haddad$/),
      ])
      expect(button('Partager')).toBeDefined()
      expect(link('Ajouter une activité')?.getAttribute('href')).toBe('/activities/create?course=ap1')
    })

    it('reads the activities as its teacher, never as a student', async () => {
      await setup()

      expect(api.course).toHaveBeenCalledWith('ap1')
      expect(api.sections).toHaveBeenCalledWith('ap1')
      expect(api.taught).toHaveBeenCalledWith('ap1')
      expect(api.playable).not.toHaveBeenCalled()
    })

    it('has the overview as its tab, then its members with their count, its groups and its settings', async () => {
      await setup()

      expect(tabs()).toEqual(["Vue d'ensemble", 'Membres, 308', 'Groupes', 'Paramètres'])
      expect(page().querySelector('pl-page-tabs a[aria-current="page"]')?.getAttribute('href')).toBe('/courses/ap1')
    })

    it('shows its sections in order, each with its activities, the row opening the monitoring', async () => {
      await setup()

      expect(sections()).toEqual(['Bases, 2 activités', 'Récursivité, 1 activité'])
      expect(rows()).toEqual(['TP 1 : variables', 'Examen partiel 1', 'TP 5 : récursivité'])
      expect(link('TP 1 : variables')?.getAttribute('href')).toBe('/activities/monitor/ap1/tp1')
      expect(link('Planifier')?.getAttribute('href')).toBe('/activities/ap1/tp5')
      expect(document.querySelector('button[aria-label="Plus d\'actions pour Examen partiel 1"]')).not.toBeNull()
    })

    it('lists in « À faire » only what there is to do: the copies, the activities to plan', async () => {
      await setup()

      const todo = page().querySelector('aside app-course-todo') as HTMLElement
      expect(spoken(todo.querySelector('h2'))).toBe('À faire, 2')
      expect([...todo.querySelectorAll('a')].map((item) => words(spoken(item)))).toEqual([
        '14 copies à corriger, Examen partiel 1, confiées à Julien Lefèvre',
        "TP 5 : récursivité à planifier, Ouverte, sans dates. 23 étudiants l'ont déjà commencé.",
      ])
    })

    it('offers to organize the sections in the current interface, once', async () => {
      await setup()

      expect(link("organiser dans l'interface actuelle")?.getAttribute('href')).toBe(
        '/courses/ap1/dashboard?ui=legacy-once'
      )
    })

    it('says when there is nothing to do', async () => {
      api.taught.mockReturnValue(of([taught('tp1', 'TP 1 : variables')]))
      await setup()

      const todo = page().querySelector('aside app-course-todo') as HTMLElement
      expect(spoken(todo.querySelector('h2'))).toBe('À faire')
      expect(spoken(todo.querySelector('p'))).toBe("Rien à faire pour l'instant.")
    })

    it('offers in the menu of a row to settle, test, or open the resource of its activity', async () => {
      api.taught.mockReturnValue(of([TAUGHT[0], { ...TAUGHT[1], resourceId: undefined }]))
      const harness = await setup()

      const tp1 = await openMenu(harness, 'TP 1 : variables')
      expect(tp1.map((item) => spoken(item))).toEqual(["Régler l'activité", "Tester l'activité", 'Ouvrir la ressource'])
      tp1.find((item) => spoken(item) === "Tester l'activité")?.click()
      await settle(harness)
      expect(url()).toBe('/player/activity/tp1')
    })

    it('leaves « Ouvrir la ressource » out of the menu of an activity whose resource is gone', async () => {
      api.taught.mockReturnValue(of([{ ...TAUGHT[1], resourceId: undefined }]))
      const harness = await setup()

      const exam = await openMenu(harness, 'Examen partiel 1')
      expect(exam.map((item) => spoken(item))).toEqual(["Régler l'activité", "Tester l'activité"])
    })

    it('tells screen readers what a search leaves, once the person pauses', async () => {
      const harness = await setup()

      searchField().value = 'recursiv'
      searchField().dispatchEvent(new Event('input'))
      await settle(harness)
      await new Promise((resolve) => setTimeout(resolve, 350))

      expect(announce).toHaveBeenCalledWith('1 activité', 'polite')
    })

    it('searches the titles and the section names, hiding the sections left empty', async () => {
      const harness = await setup()

      searchField().value = 'recursiv'
      searchField().dispatchEvent(new Event('input'))
      await settle(harness)

      expect(sections()).toEqual(['Récursivité, 1 activité'])
      expect(rows()).toEqual(['TP 5 : récursivité'])
    })

    it('filters by state, then says when nothing is left and shows everything again', async () => {
      const harness = await setup()

      const planned = [...page().querySelectorAll<HTMLInputElement>('pl-segmented input')][2]
      planned.click()
      await settle(harness)

      expect(rows()).toEqual([])
      expect(spoken(page().querySelector('pl-empty h2'))).toBe('Aucune activité ne correspond')

      button('Voir toutes les activités')?.click()
      await settle(harness)

      expect(rows()).toHaveLength(3)
    })

    it('opens « Partager » under its button, copies the link and says so, then gives the focus back', async () => {
      const harness = await setup()
      const share = button('Partager') as HTMLButtonElement
      share.focus()

      share.click()
      await settle(harness)

      const panel = document.querySelector('app-course-share') as HTMLElement
      expect(document.querySelector('[role="dialog"]')?.getAttribute('aria-labelledby')).toBe('app-course-share-title')
      const field = panel.querySelector('input[readonly]') as HTMLInputElement
      expect(field.value).toBe(`${location.origin}/courses/ap1`)

      button('Copier le lien')?.click()
      await settle(harness)

      expect(clipboard.copy).toHaveBeenCalledWith(`${location.origin}/courses/ap1`)
      expect(announce).toHaveBeenCalledWith('Lien copié.', 'polite')
      expect(spoken(button('Lien copié'))).toBe('Lien copié')

      const lti = [...panel.querySelectorAll<HTMLInputElement>('pl-segmented input')][1]
      lti.click()
      await settle(harness)

      expect(field.value).toBe(`${location.origin}/api/v1/lti/launch?next=/courses/ap1`)

      document.querySelector<HTMLButtonElement>('button[aria-label="Fermer le partage"]')?.click()
      await settle(harness)

      expect(document.querySelector('app-course-share')).toBeNull()
      expect(document.activeElement).toBe(share)
    })

    it('starts a course without activity with its three steps', async () => {
      api.taught.mockReturnValue(of([]))
      await setup()

      expect(spoken(page().querySelector('pl-empty h2'))).toBe('Votre cours est prêt, il ne manque que le contenu')
      expect([...page().querySelectorAll('pl-step h3, pl-step h2')].map((step) => spoken(step))).toEqual([
        'Ajouter une activité',
        'Ajouter vos étudiants',
        'Partager le lien',
      ])
      expect(page().querySelector('pl-course-section')).toBeNull()
      expect(link('Reprendre un cours')?.getAttribute('href')).toBe('/courses/ap1/settings')
    })

    it('on a phone, puts « À faire » first and folds nothing it was not asked to', async () => {
      await setup({ narrow: true })

      expect(page().querySelector('aside')).toBeNull()
      const main = page().querySelector('.course-layout__main') as HTMLElement
      expect(main.firstElementChild?.tagName.toLowerCase()).toBe('app-course-todo')
      const toggles = [...page().querySelectorAll('.pl-course-section__toggle')]
      expect(toggles.map((toggle) => toggle.getAttribute('aria-expanded'))).toEqual(['true', 'true'])
    })
  })

  describe('for a student', () => {
    beforeEach(() => api.course.mockReturnValue(of(AP1_STUDENT)))

    it('says who teaches it and their next deadline, without headcount nor edit action', async () => {
      await setup()

      expect(figures()).toEqual([
        'Karim Haddad, responsable, et 5 autres enseignants',
        expect.stringMatching(/^Prochaine échéance /),
      ])
      expect(button('Partager')).toBeUndefined()
      expect(link('Ajouter une activité')).toBeUndefined()
      expect(tabs()).toEqual(["Vue d'ensemble"])
    })

    it('reads the activities as a student plays them', async () => {
      await setup()

      expect(api.playable).toHaveBeenCalledWith('ap1')
      expect(api.taught).not.toHaveBeenCalled()
    })

    it('shows each activity with its progress, its grade, or that it is not open yet', async () => {
      await setup()

      expect(sections()).toEqual(['Bases, 2 activités', 'Récursivité, 1 activité'])
      const texts = [...page().querySelectorAll('pl-activity-row')].map((row) => words(spoken(row)))
      expect(texts[0]).toContain('5 sur 6')
      expect(texts[1]).toContain('82 / 100')
      expect(texts[2]).toContain('Pas encore ouverte')
    })

    it('says beside them how far they have gone and what to resume', async () => {
      await setup()

      const aside = page().querySelector('aside') as HTMLElement
      expect(spoken(aside.querySelector('h2'))).toBe('Votre avancement')
      expect(words(aside.textContent)).toContain('9 h 40 min passées')
      expect(spoken(aside.querySelector('h3'))).toBe('À reprendre')
      expect(words(spoken(aside.querySelector('pl-activity-row')))).toContain('TP 1 : variables')
    })

    it('says no activity is there yet in a course without any', async () => {
      api.playable.mockReturnValue(of([]))
      await setup()

      expect(spoken(page().querySelector('pl-empty h2'))).toBe("Aucune activité pour l'instant")
    })

    it('on a phone, shows their progress, what to do, what comes soon, the sections folded and « Reprendre »', async () => {
      await setup({ narrow: true })

      const zones = [...page().querySelectorAll('app-student-progress h2, .course-student__title')].map((title) =>
        spoken(title)
      )
      expect(zones).toEqual(['Votre avancement', 'À faire, 1', 'Bientôt, 1'])
      const todo = page().querySelector('[aria-labelledby="course-student-todo"] pl-activity-row') as HTMLElement
      expect(words(spoken(todo))).toContain('TP 1 : variables Bases')
      const toggles = [...page().querySelectorAll('.pl-course-section__toggle')]
      expect(toggles.map((toggle) => words(spoken(toggle)))).toEqual([
        'Bases, 2 activités, 1 à faire',
        'Récursivité, 1 activité, rien à faire',
      ])
      expect(toggles.map((toggle) => toggle.getAttribute('aria-expanded'))).toEqual(['false', 'false'])
      const thumb = page().querySelector('.course-student__thumb a') as HTMLAnchorElement
      expect(spoken(thumb)).toBe('Reprendre TP 1 : variables')
      expect(thumb.getAttribute('href')).toBe('/player/activity/tp1')
    })

    it('on a phone, says when nothing is to be handed in', async () => {
      api.playable.mockReturnValue(of(PLAYABLE.filter((activity) => activity.state !== 'opened')))
      await setup({ narrow: true })

      expect(spoken(page().querySelector('[aria-labelledby="course-student-todo"] p'))).toBe(
        "Rien à rendre pour l'instant."
      )
      expect(page().querySelector('.course-student__thumb')).toBeNull()
    })

    it('says when a search leaves nothing, and shows every activity again', async () => {
      const harness = await setup()

      searchField().value = 'introuvable'
      searchField().dispatchEvent(new Event('input'))
      await settle(harness)

      expect(spoken(page().querySelector('app-overview-none h2'))).toBe('Aucune activité ne correspond')
      button('Voir toutes les activités')?.click()
      await settle(harness)

      expect(rows()).toHaveLength(3)
      expect(searchField().value).toBe('')
    })
  })

  it('says a course is not there, or not theirs, with a way back to the courses', async () => {
    api.course.mockReturnValue(
      new Observable((subscriber) => subscriber.error(new HttpErrorResponse({ status: 404, url: '/courses/zz' })))
    )
    await setup({ url: '/courses/zz' })

    expect(heading()).toBe('Cours')
    expect(spoken(page().querySelector('pl-empty h2'))).toBe('Ce cours est introuvable')
    expect(link('Voir vos cours')?.getAttribute('href')).toBe('/courses')
    expect(page().querySelector('app-load-state h2')).toBeNull()
  })

  it('shows rows on their way after a moment, while the server is down, then says it failed', async () => {
    jest.useFakeTimers({ doNotFake: ['queueMicrotask', 'nextTick'] })
    jest.spyOn(console, 'error').mockImplementation(() => undefined)
    api.course.mockReturnValue(throwError(() => new HttpErrorResponse({ status: 503 })))
    const harness = await setup({ stable: false })
    expect(page().querySelector('pl-activity-row-skeleton')).toBeNull()

    jest.advanceTimersByTime(300)
    harness.detectChanges()
    expect(page().querySelectorAll('pl-activity-row-skeleton')).toHaveLength(3)

    jest.advanceTimersByTime(10_000)
    harness.detectChanges()
    expect(spoken(page().querySelector('app-load-state'))).toContain(
      "Le chargement prend plus de temps que d'habitude."
    )
    expect(page().querySelectorAll('pl-activity-row-skeleton')).toHaveLength(3)

    jest.advanceTimersByTime(20_000)
    harness.detectChanges()
    expect(spoken(page().querySelector('app-load-state h2'))).toBe("Ce cours n'a pas pu être chargé")
    expect(page().querySelector('pl-activity-row-skeleton')).toBeNull()
    expect(page().textContent).not.toContain('aucune section')
  })

  it('loads the course again on « Réessayer », the focus on the content', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined)
    api.course.mockReturnValueOnce(throwError(() => new HttpErrorResponse({ status: 401 })))
    const harness = await setup()
    expect(spoken(page().querySelector('app-load-state h2'))).toBe("Ce cours n'a pas pu être chargé")

    button('Réessayer')?.click()
    await settle(harness)

    expect(api.course).toHaveBeenCalledTimes(2)
    expect(heading()).toBe('Algorithmique et programmation 1')
    expect(page().querySelector('app-load-state h2')).toBeNull()
    expect(document.activeElement?.id).toBe(PAGE_CONTENT_ID)
  })

  it('starts afresh from one course to the next, its search forgotten', async () => {
    const harness = await setup()
    searchField().value = 'recursiv'
    searchField().dispatchEvent(new Event('input'))
    await settle(harness)

    await harness.navigateByUrl('/courses/pw', CourseOverview)
    await settle(harness)

    expect(url()).toBe('/courses/pw')
    expect(api.course).toHaveBeenLastCalledWith('pw')
    expect(heading()).toBe('Programmation web')
    expect(searchField().value).toBe('')
    expect(rows()).toHaveLength(3)
  })
})

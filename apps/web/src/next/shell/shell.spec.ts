import { Dialog as CdkDialog } from '@angular/cdk/dialog'
import { BreakpointObserver } from '@angular/cdk/layout'
import { TemplateRef } from '@angular/core'
import { DialogService } from '@platon/core/browser/shared'
import { Component, computed, signal } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { Router, provideRouter } from '@angular/router'
import { RouterTestingHarness } from '@angular/router/testing'
import { User, UserCharter, UserRoles, isTeacherRole } from '@platon/core/common'
import { ActivityCorrectionSummary } from '@platon/feature/result/common'
import { NEVER, Subject, of, throwError } from 'rxjs'
import { INSTITUTION_NAME } from '../core/institution/institution'
import { Session } from '../core/session/session'
import { NextTheme } from '../core/theme/next-theme'
import { CharterDialog } from './charter-dialog'
import { NotificationsApi } from './notifications/notifications-api'
import { NotificationsPanel } from './notifications/notifications-panel'
import { NotificationsStore } from './notifications/notifications-store'
import { Shell } from './shell'
import { ShellApi } from './shell-api'
import { ShellStore } from './shell-store'

@Component({ template: '' })
class Blank {}

const person = (role: UserRoles): User =>
  ({ id: 'u1', username: 'kh', firstName: 'Karim', lastName: 'Haddad', email: 'k@u.fr', role, active: true } as User)

/** The signals of `Session` the shell reads. */
const sessionOf = (user: User) => {
  const current = signal<User | undefined>(user)
  const role = computed(() => current()?.role)
  return { user: current.asReadonly(), role, isTeacher: computed(() => isTeacherRole(role())) }
}

const summary: ActivityCorrectionSummary = {
  activityId: 'a',
  activityName: 'TP 3',
  courseId: 'c',
  courseName: 'AP1',
  totalExercises: 4,
  correctedExercises: 1,
  pendingCopies: 2,
}

describe('Shell', () => {
  let api: { [K in keyof ShellApi]: jest.Mock }
  let dialog: { open: jest.Mock }
  let messages: { error: jest.Mock }
  let theme: { preference: ReturnType<typeof signal<string>>; choose: jest.Mock }
  let session: ReturnType<typeof sessionOf> & { signOut: jest.Mock }

  const setup = async (role: UserRoles, { charter = true, url = '/dashboard', narrow = false } = {}) => {
    api = {
      correctionSummaries: jest.fn(() => of([summary])),
      charter: jest.fn(() => of({ id: 'u1', acceptedUserCharter: charter } as UserCharter)),
      acceptCharter: jest.fn(() => of({ id: 'u1', acceptedUserCharter: true } as UserCharter)),
      personalCircleId: jest.fn(() => of('circle-1')),
    }
    dialog = { open: jest.fn(() => ({ closed: of(true), close: jest.fn() })) }
    messages = { error: jest.fn() }
    theme = { preference: signal('light'), choose: jest.fn(() => Promise.resolve()) }
    session = { ...sessionOf(person(role)), signOut: jest.fn(() => Promise.resolve()) }
    TestBed.configureTestingModule({
      providers: [
        provideRouter([
          {
            path: '',
            component: Shell,
            providers: [ShellStore, NotificationsStore],
            children: [
              { path: 'dashboard', component: Blank, title: 'Accueil' },
              { path: 'courses', component: Blank, data: { quietCreate: true } },
              { path: '**', component: Blank },
            ],
          },
        ]),
        { provide: ShellApi, useValue: api },
        { provide: NotificationsApi, useValue: { unreadCount: () => of(3), changes: () => NEVER } },
        { provide: CdkDialog, useValue: dialog },
        { provide: DialogService, useValue: messages },
        { provide: NextTheme, useValue: theme },
        { provide: Session, useValue: session },
        { provide: INSTITUTION_NAME, useValue: 'Université Gustave Eiffel' },
        {
          provide: BreakpointObserver,
          useValue: { observe: () => of({ matches: narrow, breakpoints: {} }), isMatched: () => narrow },
        },
      ],
    })
    const harness = await RouterTestingHarness.create()
    await harness.navigateByUrl(url)
    harness.detectChanges()
    await harness.fixture.whenStable()
    return harness
  }

  afterEach(() => document.querySelector('.cdk-overlay-container')?.remove())

  const cover = () => document.querySelector('pl-cover') as HTMLElement
  const entries = () =>
    [...cover().querySelectorAll('pl-cover-nav a')].map((a) => a.textContent?.replace(/\s+/g, ' ').trim())
  const button = (label: string) =>
    [...document.querySelectorAll('button')].find((b) => b.textContent?.trim().startsWith(label)) as HTMLButtonElement
  const menuItem = (label: string) =>
    [...document.querySelectorAll<HTMLElement>('pl-menu-item')].find((item) =>
      item.textContent?.trim().startsWith(label)
    )
  const settle = async (harness: RouterTestingHarness) => {
    harness.detectChanges()
    await harness.fixture.whenStable()
    harness.detectChanges()
  }

  it('starts with the skip link, then the brand and the institution', async () => {
    await setup(UserRoles.student)
    expect(document.querySelector('a[plSkipLink]')?.textContent).toBe('Aller au contenu')
    expect(cover().querySelector('a[plCoverBrand]')?.textContent).toContain('Université Gustave Eiffel')
  })

  it('marks the entry of the current page, and keeps it under its children', async () => {
    const harness = await setup(UserRoles.teacher, { url: '/courses/abc' })
    await settle(harness)
    expect(cover().querySelector('[aria-current="page"]')?.textContent?.trim()).toBe('Cours')
  })

  it('gives a student who corrects the corrections, with the copies to correct, and help in the profile', async () => {
    await setup(UserRoles.student)
    expect(entries()).toEqual(['Accueil', 'Annonces', 'Cours', 'Corrections 2 copies à corriger'])
    expect(button('Créer')).toBeUndefined()
    expect(menuItem('Aide')).toBeDefined()
    expect(menuItem('Mon cercle')).toBeUndefined()
    expect(api.charter).not.toHaveBeenCalled()
  })

  it('gives a teacher Create, the documentation in the foot and the personal circle', async () => {
    await setup(UserRoles.teacher)
    expect(button('Créer')).toBeDefined()
    expect(cover().querySelector('pl-cover-foot a[href="/docs"]')?.getAttribute('target')).toBe('_blank')
    expect(menuItem('Aide')).toBeUndefined()
    expect(menuItem('Mon cercle')).toBeDefined()
  })

  it('counts the unread notifications in the foot, and opens them beside the cover', async () => {
    const harness = await setup(UserRoles.student)
    dialog.open.mockReturnValueOnce({ closed: new Subject(), close: jest.fn() })
    const entry = cover().querySelector('pl-cover-foot button[plCoverItem]') as HTMLButtonElement

    expect(entry.textContent?.replace(/\s+/g, ' ').trim()).toBe('Notifications 3 non lues')
    entry.click()
    await settle(harness)

    expect(dialog.open).toHaveBeenCalledWith(
      NotificationsPanel,
      expect.objectContaining({ data: 'popover', ariaLabelledBy: 'app-notifications-title', restoreFocus: entry })
    )
    expect(entry.getAttribute('aria-expanded')).toBe('true')
  })

  it('opens Create on the objects once the charter is accepted', async () => {
    const harness = await setup(UserRoles.teacher)
    button('Créer').click()
    await settle(harness)
    expect(dialog.open).not.toHaveBeenCalled()
    expect(button('Créer').getAttribute('aria-expanded')).toBe('true')
  })

  it('shows the charter first, then opens Create once it is accepted', async () => {
    const harness = await setup(UserRoles.teacher, { charter: false })
    expect(button('Créer').getAttribute('aria-haspopup')).toBe('dialog')
    button('Créer').click()
    await settle(harness)
    expect(dialog.open).toHaveBeenCalledWith(CharterDialog, expect.objectContaining({ restoreFocus: true }))
    expect(api.acceptCharter).toHaveBeenCalledWith('u1')
    await settle(harness)
    expect(button('Créer').getAttribute('aria-expanded')).toBe('true')
    expect(document.activeElement).toBe(menuItem('Cours'))
  })

  it('says so when the charter could not be recorded, and keeps the charter first', async () => {
    const harness = await setup(UserRoles.teacher, { charter: false })
    api.acceptCharter.mockReturnValue(throwError(() => new Error('offline')))
    jest.spyOn(console, 'error').mockImplementation(() => undefined)
    button('Créer').click()
    await settle(harness)
    await settle(harness)
    expect(messages.error).toHaveBeenCalledWith(expect.stringContaining("n'a pas pu être enregistré"))
    expect(button('Créer').getAttribute('aria-haspopup')).toBe('dialog')
  })

  it('creates inside the resource open at the time', async () => {
    const harness = await setup(UserRoles.teacher, { url: '/resources/r1' })
    const navigate = jest.spyOn(TestBed.inject(Router), 'navigate').mockResolvedValue(true)
    button('Créer').click()
    await settle(harness)
    menuItem('Exercice')?.click()
    await settle(harness)
    expect(navigate).toHaveBeenCalledWith(['/resources/create'], { queryParams: { type: 'EXERCISE', parent: 'r1' } })
  })

  it('turns Create quiet on a page that has its own creation action', async () => {
    await setup(UserRoles.teacher, { url: '/courses' })
    expect(button('Créer').dataset['variant']).toBe('cover-quiet')
  })

  it('applies a theme and signs out from the profile', async () => {
    const harness = await setup(UserRoles.student)
    const profile = document.querySelector('button[plCoverProfile]') as HTMLButtonElement
    expect(menuItem('Clair')?.getAttribute('aria-checked')).toBe('true')
    profile.click()
    await settle(harness)
    menuItem('Sombre')?.click()
    await settle(harness)
    profile.click()
    await settle(harness)
    menuItem('Se déconnecter')?.click()
    await settle(harness)
    expect(theme.choose).toHaveBeenCalledWith('dark')
    expect(session.signOut).toHaveBeenCalled()
  })

  describe('on a narrow screen', () => {
    const navigationButton = () => document.querySelector('pl-topbar button') as HTMLButtonElement

    it('gives way to a top bar titled like the page, with the navigation behind a button', async () => {
      await setup(UserRoles.student, { narrow: true })
      expect(document.querySelector('pl-cover')).toBeNull()
      expect(document.querySelector('pl-topbar')?.textContent).toContain('Accueil')
      expect(navigationButton().getAttribute('aria-label')).toBe('Ouvrir la navigation')
      expect(navigationButton().getAttribute('aria-haspopup')).toBe('dialog')
    })

    it('rings the bell of the top bar, which opens the notifications on the whole screen', async () => {
      await setup(UserRoles.student, { narrow: true })
      const bell = document.querySelector('pl-topbar button[aria-label^="Notifications"]') as HTMLButtonElement

      expect(bell.getAttribute('aria-label')).toBe('Notifications, 3 non lues')
      expect(bell.querySelector('pl-count')?.textContent).toBe('3')
      bell.click()

      expect(dialog.open).toHaveBeenCalledWith(
        NotificationsPanel,
        expect.objectContaining({ data: 'screen', restoreFocus: bell })
      )
    })

    it('opens the cover as a dialog named Navigation, and leaves it on navigation', async () => {
      const harness = await setup(UserRoles.student, { narrow: true })
      navigationButton().click()
      expect(dialog.open).toHaveBeenCalledWith(
        expect.any(TemplateRef),
        expect.objectContaining({ data: 'panel', ariaLabel: 'Navigation', restoreFocus: true })
      )
      const panel = dialog.open.mock.results[0].value
      await harness.navigateByUrl('/courses')
      expect(panel.close).toHaveBeenCalled()
    })
  })
})

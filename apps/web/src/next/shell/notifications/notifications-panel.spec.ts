import { LiveAnnouncer } from '@angular/cdk/a11y'
import { DIALOG_DATA, Dialog, DialogRef } from '@angular/cdk/dialog'
import { Component, LOCALE_ID, signal } from '@angular/core'
import { ComponentFixture, TestBed } from '@angular/core/testing'
import { Router, provideRouter } from '@angular/router'
import { DialogService } from '@platon/core/browser/shared'
import { Notification } from '@platon/feature/notification/common'
import { NEVER, Observable, Subject, of, throwError } from 'rxjs'
import { Session } from '../../core/session/session'
import { NotificationChange, NotificationPage, NotificationsApi } from './notifications-api'
import { NotificationsPanel } from './notifications-panel'
import { NotificationsStore } from './notifications-store'

@Component({ template: '' })
class Blank {}

const at = new Date(Date.now() - 2 * 60 * 60_000)

const notification = (id: string, data: object, readAt: Date | null = null): Notification => ({
  id,
  userId: 'me',
  createdAt: at,
  updatedAt: at,
  readAt,
  data,
})

const correction = notification('n1', {
  type: 'CORRECTION-AVAILABLE',
  courseId: 'c1',
  courseName: 'Algorithmique',
  activityId: 'a1',
  activityName: 'TP 3',
})
const invitation = notification(
  'n2',
  {
    type: 'RESOURCE-INVITATION',
    inviterName: 'Camille Martin',
    inviteeId: 'me',
    resourceId: 'r1',
    resourceName: 'Graphes',
  },
  at
)

/** Lets the promises of the store settle. */
const settle = () => new Promise<void>((resolve) => setTimeout(resolve))

const words = (element: Element | null) => element?.textContent?.replace(/\s+/g, ' ').trim()

interface Setup {
  readonly notifications?: Notification[]
  readonly page?: Observable<NotificationPage>
  readonly layout?: 'popover' | 'screen'
  readonly changes?: Observable<NotificationChange>
}

describe('NotificationsPanel', () => {
  let api: Record<string, jest.Mock>
  let dialogRef: { close: jest.Mock }
  let messages: { confirm: jest.Mock; error: jest.Mock }

  const configure = ({
    notifications = [correction, invitation],
    page = of({ notifications, hasMore: false, cursor: null, total: notifications.length }),
    layout = 'popover',
    changes = NEVER,
  }: Setup = {}) => {
    api = {
      unreadCount: jest.fn(() => of(1)),
      changes: jest.fn(() => changes),
      page: jest.fn(() => page),
      markAsRead: jest.fn(() => of(true)),
      markAllAsRead: jest.fn(() => of(true)),
      answerInvitation: jest.fn(() => of(undefined)),
      delete: jest.fn(() => of(true)),
      deleteAll: jest.fn(() => of(true)),
    }
    dialogRef = { close: jest.fn() }
    messages = { confirm: jest.fn(), error: jest.fn() }
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: '**', component: Blank }]),
        { provide: LOCALE_ID, useValue: 'fr-FR' },
        NotificationsStore,
        { provide: NotificationsApi, useValue: api },
        { provide: DialogService, useValue: messages },
        { provide: Session, useValue: { user: signal({ id: 'me' }) } },
        { provide: DIALOG_DATA, useValue: layout },
        { provide: DialogRef, useValue: dialogRef },
      ],
    })
    TestBed.inject(NotificationsStore).connect()
    const fixture = TestBed.createComponent(NotificationsPanel)
    fixture.detectChanges()
    return { fixture, panel: fixture.nativeElement as HTMLElement }
  }

  const render = async (setup: Setup = {}) => {
    const rendered = configure(setup)
    await settle()
    rendered.fixture.detectChanges()
    return rendered
  }

  /** Lets the store answer, the view render, and its after-render hooks run. */
  const settleView = async (fixture: ComponentFixture<NotificationsPanel>) => {
    await settle()
    fixture.detectChanges()
    await fixture.whenStable()
  }

  const button = (panel: HTMLElement, label: string) =>
    [...panel.querySelectorAll('button')].find((candidate) => words(candidate) === label) as HTMLButtonElement

  it('lists the notifications, the unread ones said so', async () => {
    const { panel } = await render()

    const items = panel.querySelectorAll('pl-notification-item')
    expect(items).toHaveLength(2)
    expect(words(items[0].querySelector('a'))).toBe(
      'Non lue : La correction de TP 3 est disponible Algorithmique, il y a 2 h'
    )
    expect(items[1].hasAttribute('data-unread')).toBe(false)
  })

  it('marks a notification as read, and leaves for it once the API has it', async () => {
    const { panel } = await render()
    const answered = new Subject<boolean>()
    api['markAsRead'].mockReturnValue(answered)
    const navigate = jest.spyOn(TestBed.inject(Router), 'navigateByUrl')

    ;(panel.querySelector('pl-notification-item a') as HTMLAnchorElement).click()
    await settle()

    expect(api['markAsRead']).toHaveBeenCalledWith('n1')
    expect(navigate).not.toHaveBeenCalled()

    answered.next(true)
    answered.complete()
    await settle()

    expect(navigate).toHaveBeenCalledWith('/player/activity/a1')
  })

  it('marks a notification with nowhere to lead as read when chosen, the focus staying on it', async () => {
    const removed = notification('n3', {
      type: 'RESOURCE-EVENT',
      eventInfo: { type: 'MEMBER_REMOVE', actorId: 'u2', resourceId: 'r1', data: { resourceName: 'Graphes' } },
    })
    const { fixture, panel } = await render({ notifications: [removed] })
    document.body.appendChild(panel)
    const navigate = jest.spyOn(TestBed.inject(Router), 'navigateByUrl')
    const row = panel.querySelector('pl-notification-item button') as HTMLButtonElement
    row.focus()

    row.click()
    await settleView(fixture)

    expect(api['markAsRead']).toHaveBeenCalledWith('n3')
    expect(navigate).not.toHaveBeenCalled()
    expect(document.activeElement).toBe(panel.querySelector('pl-notification-item .pl-notification-item__main'))
    panel.remove()
  })

  it('marks everything as read from its head', async () => {
    const { panel } = await render()
    const markAll = [...panel.querySelectorAll('button')].find((button) => words(button) === 'Tout marquer comme lu')

    markAll?.click()

    expect(api['markAllAsRead']).toHaveBeenCalled()
  })

  it('keeps the focus in the panel when marking everything as read takes its button away', async () => {
    const { fixture, panel } = await render()
    document.body.appendChild(panel)
    const markAll = [...panel.querySelectorAll('button')].find((button) => words(button) === 'Tout marquer comme lu')
    markAll?.focus()

    markAll?.click()
    await settle()
    fixture.detectChanges()
    await fixture.whenStable()

    expect([...panel.querySelectorAll('button')].some((button) => words(button) === 'Tout marquer comme lu')).toBe(
      false
    )
    expect(document.activeElement?.getAttribute('aria-label')).toBe('Fermer les notifications')
    panel.remove()
  })

  it('declines an invitation, the focus going to the next notification', async () => {
    const pending = notification('n2', { ...invitation.data!, type: 'RESOURCE-INVITATION' })
    const { fixture, panel } = await render({ notifications: [pending, correction] })
    document.body.appendChild(panel)
    const decline = button(panel, 'Décliner')
    decline.focus()

    decline.click()
    await settleView(fixture)

    expect(api['answerInvitation']).toHaveBeenCalledWith('r1', 'me', false)
    expect(panel.querySelectorAll('pl-notification-item')).toHaveLength(1)
    expect(document.activeElement).toBe(panel.querySelector('pl-notification-item a'))
    panel.remove()
  })

  it('names each answer to an invitation after the invitation', async () => {
    const pending = notification('n2', { ...invitation.data!, type: 'RESOURCE-INVITATION' })
    const { panel } = await render({ notifications: [pending] })

    const described = document.getElementById(button(panel, 'Accepter').getAttribute('aria-describedby') ?? '')
    expect(words(described)).toBe('Non lue : Camille Martin vous invite à collaborer sur Graphes')
  })

  it('loads the older ones, the focus going to the first of them once there are no more', async () => {
    const older = notification('n4', { ...correction.data!, activityName: 'TP 4' }, at)
    const { fixture, panel } = await render({
      page: of({ notifications: [correction], hasMore: true, cursor: 'cursor-1', total: 2 }),
    })
    document.body.appendChild(panel)
    api['page'].mockReturnValueOnce(of({ notifications: [older], hasMore: false, cursor: 'cursor-2', total: 2 }))
    const more = button(panel, 'Afficher les plus anciennes')
    more.focus()

    more.click()
    await settleView(fixture)

    expect(api['page']).toHaveBeenLastCalledWith('cursor-1', 20)
    expect(button(panel, 'Afficher les plus anciennes')).toBeUndefined()
    expect(document.activeElement).toBe(panel.querySelectorAll('pl-notification-item a')[1])
    panel.remove()
  })

  it('puts a notification that arrives first, and reads it out', async () => {
    const changes = new Subject<NotificationChange>()
    const { fixture, panel } = await render({ changes })
    const announce = jest.spyOn(TestBed.inject(LiveAnnouncer), 'announce').mockResolvedValue()
    const arrived = notification('n9', { ...correction.data!, activityName: 'TP 9' })

    changes.next({ unreadCount: 2, notification: arrived })
    await settleView(fixture)

    expect(words(panel.querySelector('pl-notification-item a'))).toContain('La correction de TP 9 est disponible')
    expect(announce).toHaveBeenCalledWith('Nouvelle notification\u00a0: La correction de TP 9 est disponible', 'polite')
  })

  it('shows on a phone the unread count and « Tout marquer comme lu » under its bar, and a back arrow', async () => {
    const { panel } = await render({ layout: 'screen' })

    expect(words(panel.querySelector('.pl-panel__tools'))).toBe('1 non lue Tout marquer comme lu')
    const back = panel.querySelector('button[aria-label="Fermer les notifications"]')
    expect(back?.querySelector('use')?.getAttribute('href')).toContain('#arrow_back')
  })

  it("deletes everything from « Plus d'actions », once the person confirms", async () => {
    const { fixture, panel } = await render()
    document.body.appendChild(panel)
    messages.confirm.mockResolvedValue(true)

    panel.querySelector<HTMLButtonElement>('button[aria-label="Plus d\'actions"]')?.click()
    fixture.detectChanges()
    document.querySelector<HTMLElement>('pl-menu-item[value="delete-all"]')?.click()
    await settleView(fixture)

    expect(messages.confirm).toHaveBeenCalled()
    expect(api['deleteAll']).toHaveBeenCalled()
    expect(words(panel.querySelector('pl-empty h3'))).toBe('Aucune notification')
    expect(document.activeElement?.getAttribute('aria-label')).toBe('Fermer les notifications')
    panel.remove()
  })

  it('closes on a click outside', async () => {
    await render()
    const opened = TestBed.inject(Dialog).open(NotificationsPanel, { data: 'popover' })
    let closed = false
    opened.closed.subscribe(() => (closed = true))
    await settle()

    document.querySelector<HTMLElement>('.cdk-overlay-backdrop')?.click()
    await settle()

    expect(closed).toBe(true)
  })

  it('tries again from « Réessayer », with a new attempt that restarts the loading clock', async () => {
    const { fixture, panel } = await render({ page: throwError(() => new Error('down')) })
    api['page'].mockReturnValue(of({ notifications: [correction], hasMore: false, cursor: null, total: 1 }))

    button(panel, 'Réessayer').click()
    await settleView(fixture)

    expect(TestBed.inject(NotificationsStore).attempt()).toBe(1)
    expect(panel.querySelectorAll('pl-notification-item')).toHaveLength(1)
  })

  it('accepts an invitation, then opens the resource', async () => {
    const { panel } = await render()
    const navigate = jest.spyOn(TestBed.inject(Router), 'navigate')
    const accept = [...panel.querySelectorAll('button')].find((button) => words(button) === 'Accepter')

    accept?.click()
    await settle()

    expect(api['answerInvitation']).toHaveBeenCalledWith('r1', 'me', true)
    expect(navigate).toHaveBeenCalledWith(['/resources', 'r1'])
  })

  it('closes on Escape, and gives the focus back to what opened it', async () => {
    await render()
    const entry = document.body.appendChild(document.createElement('button'))
    entry.focus()
    const opened = TestBed.inject(Dialog).open(NotificationsPanel, { data: 'popover', restoreFocus: true })
    let closed = false
    opened.closed.subscribe(() => (closed = true))
    await settle()

    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', keyCode: 27, bubbles: true }))
    await settle()

    expect(closed).toBe(true)
    expect(document.activeElement).toBe(entry)
    entry.remove()
  })

  it('closes by its button', async () => {
    const { panel } = await render()

    ;(panel.querySelector('button[aria-label="Fermer les notifications"]') as HTMLButtonElement).click()

    expect(dialogRef.close).toHaveBeenCalled()
  })

  it('says when there is nothing to read', async () => {
    const { panel } = await render({ notifications: [] })

    expect(words(panel.querySelector('pl-empty h3'))).toBe('Aucune notification')
    expect(panel.querySelector('button[aria-label="Plus d\'actions"]')).toBeNull()
  })

  it('offers to try again when the list fails', async () => {
    const { panel } = await render({ notifications: [], page: throwError(() => new Error('down')) })

    expect(words(panel.querySelector('app-load-state'))).toContain("Vos notifications n'ont pas pu être chargées")
    expect(words(panel.querySelector('app-load-state'))).toContain('Réessayer')
  })
})

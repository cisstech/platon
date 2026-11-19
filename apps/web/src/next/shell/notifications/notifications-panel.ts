import { LiveAnnouncer } from '@angular/cdk/a11y'
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog'
import { DOCUMENT } from '@angular/common'
import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  effect,
  inject,
  viewChild,
  viewChildren,
} from '@angular/core'
import { Router } from '@angular/router'
import {
  Button,
  Empty,
  Icon,
  Menu,
  MenuItem,
  MenuTrigger,
  NotificationItem,
  NotificationList,
  NotificationSkeleton,
  Panel,
  PanelLayout,
  showsSkeleton,
  trackLoadPhase,
} from '@platon/design-system'
import { Session } from '../../core/session/session'
import { LoadState } from '../../shared/load-state/load-state'
import { NotificationsStore } from './notifications-store'
import { InvitationAnswer, NotificationView, notificationView, unreadLabel } from './notifications.vm'

/** Id of the title, for the dialog that opens the panel. */
export const NOTIFICATIONS_HEADING_ID = 'app-notifications-title'

/** How long leaving for a notification waits for the API to record it as read. */
const MARK_AS_READ_WAIT = 1000

/**
 * The notifications of the person, opened as a dialog from the cover (`popover`, beside it) or from
 * the bell of the top bar (`screen`, the whole phone). The dialog data is the layout.
 */
@Component({
  selector: 'app-notifications-panel',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    Button,
    Empty,
    Icon,
    LoadState,
    Menu,
    MenuItem,
    MenuTrigger,
    NotificationItem,
    NotificationList,
    NotificationSkeleton,
    Panel,
  ],
  templateUrl: './notifications-panel.html',
  styleUrl: './notifications-panel.scss',
})
export class NotificationsPanel {
  protected readonly store = inject(NotificationsStore)
  private readonly session = inject(Session)
  private readonly router = inject(Router)
  private readonly dialogRef = inject(DialogRef)
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef)
  private readonly document = inject(DOCUMENT)
  private readonly injector = inject(Injector)
  private readonly panel = viewChild.required(Panel)
  private readonly rows = viewChildren(NotificationItem)
  protected readonly layout = inject<PanelLayout>(DIALOG_DATA)

  protected readonly headingId = NOTIFICATIONS_HEADING_ID
  protected readonly phase = trackLoadPhase(this.store.status, this.store.attempt)
  protected readonly loading = computed(() => showsSkeleton(this.phase()))
  protected readonly views = computed(() => {
    const me = this.session.user()?.id ?? ''
    return this.store
      .notifications()
      .map((notification) => notificationView(notification, me))
      .filter((view): view is NotificationView => !!view)
  })
  protected readonly unreadText = computed(() => {
    const count = this.store.unreadCount()
    return `${count} ${unreadLabel(count)}`
  })

  constructor() {
    this.store.open()
    this.announceArrivals()
  }

  protected close(): void {
    this.dialogRef.close()
  }

  /**
   * Records the notification as read, then leaves for what it is about, if anything. It leaves after
   * the API has it: a screen not ported yet reloads the page, which would cut the request. A link
   * opened elsewhere (new tab, window) leaves the panel where it is.
   */
  protected async choose(view: NotificationView, event: MouseEvent): Promise<void> {
    const index = this.views().indexOf(view)
    const read = this.store.markAsRead(view.id)
    if (!view.link) {
      // Read, the row only informs: its button goes.
      this.keepFocus(index)
      return
    }
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    await Promise.race([read, new Promise((resolve) => setTimeout(resolve, MARK_AS_READ_WAIT))])
    await this.router.navigateByUrl(view.link)
  }

  protected loadMore(): void {
    const loaded = this.views().length
    this.store
      .loadMore()
      .then(() => this.keepFocus(loaded))
      .catch(console.error)
  }

  protected markAllAsRead(): void {
    this.store
      .markAllAsRead()
      .then(() => this.keepFocus())
      .catch(console.error)
  }

  protected act(action: string): void {
    if (action !== 'delete-all') return
    this.store
      .deleteAll()
      .then(() => this.keepFocus())
      .catch(console.error)
  }

  protected async answer(view: NotificationView, invitation: InvitationAnswer, accept: boolean): Promise<void> {
    const index = this.views().indexOf(view)
    if (!(await this.store.answerInvitation(view.id, invitation, accept))) return
    if (accept) await this.router.navigate(['/resources', invitation.resourceId])
    else this.keepFocus(index)
  }

  /**
   * Some buttons go away with what they act on (« Tout marquer comme lu », « Plus d'actions »,
   * « Afficher les plus anciennes », a declined invitation, a row read): the focus they held goes to
   * the row at `index`, or the closest one, or else to the close button, never to the page under the
   * dialog.
   */
  private keepFocus(index?: number): void {
    afterNextRender(
      () => {
        if (this.host.nativeElement.contains(this.document.activeElement)) return
        const rows = this.rows()
        if (index !== undefined && index >= 0 && rows.length) rows[Math.min(index, rows.length - 1)].focus()
        else this.panel().focusClose()
      },
      { injector: this.injector }
    )
  }

  /** A notification that arrives while the panel is open appears first, and is read out. */
  private announceArrivals(): void {
    const announcer = inject(LiveAnnouncer)
    let shown: Set<string> | undefined
    effect(() => {
      const views = this.views()
      if (this.store.status() !== 'ready') return
      const first = views[0]
      if (shown && first && !shown.has(first.id)) {
        announcer.announce(`Nouvelle notification\u00a0: ${first.title}`, 'polite').catch(console.error)
      }
      shown = new Set(views.map((view) => view.id))
    })
  }
}

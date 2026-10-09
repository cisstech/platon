import { DestroyRef, Injectable, inject, signal } from '@angular/core'
import { takeUntilDestroyed } from '@angular/core/rxjs-interop'
import { DialogService } from '@platon/core/browser/shared'
import { LoadStatus } from '@platon/design-system'
import { Notification } from '@platon/feature/notification/common'
import { Subscription, firstValueFrom } from 'rxjs'
import { NOTIFICATIONS_PAGE_SIZE, NotificationPage, NotificationsApi } from './notifications-api'
import { InvitationAnswer, isSignal } from './notifications.vm'

const deleteAllTitle = (total: number): string =>
  total > 1 ? `Supprimer vos ${total} notifications\u00a0?` : 'Supprimer votre notification\u00a0?'

/**
 * The notifications of the person: the unread count from the start, kept live by the subscription,
 * and the list, loaded when the panel first opens. Provided by the shell route, for as long as the
 * frame lives: leaving it for a screen not ported yet reloads the page.
 */
@Injectable()
export class NotificationsStore {
  private readonly api = inject(NotificationsApi)
  private readonly messages = inject(DialogService)
  private readonly destroyRef = inject(DestroyRef)
  private changes?: Subscription
  private cursor: string | null = null
  /**
   * Set when a notification is deleted on the server: the pages are cut by position, so the next one
   * would skip a notification. The list then loads again from the start.
   */
  private shifted = false
  /** Set by the first change: the count it carries is newer than the one asked at the start. */
  private countIsLive = false
  /** The latest request for the list: the answer to an older one comes too late and is dropped. */
  private request = 0

  readonly unreadCount = signal(0)
  readonly status = signal<LoadStatus>('idle')
  readonly notifications = signal<Notification[]>([])
  readonly hasMore = signal(false)
  readonly loadingMore = signal(false)
  /** Every notification of the person, signals left out, loaded or not. */
  readonly total = signal(0)
  /** Changes on each « Réessayer », so that the loading phase starts its clock again. */
  readonly attempt = signal(0)

  connect(): void {
    this.changes?.unsubscribe()
    this.countIsLive = false
    this.changes = this.api
      .changes()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: ({ unreadCount, notification }) => {
          this.countIsLive = true
          this.unreadCount.set(unreadCount)
          if (notification && !isSignal(notification) && this.status() === 'ready') this.prepend(notification)
        },
        error: (error: unknown) => console.error(error),
      })
    firstValueFrom(this.api.unreadCount())
      .then((count) => {
        if (!this.countIsLive) this.unreadCount.set(count)
      })
      .catch(console.error)
  }

  /** Loads the first page the first time, and again after a failure. */
  open(): void {
    if (this.status() === 'ready' || this.status() === 'loading') return
    this.load()
  }

  /** Loads the first page again, even while a load hangs: its late answer is then dropped. */
  retry(): void {
    this.attempt.update((attempt) => attempt + 1)
    this.load()
  }

  /** Settles once the next notifications are there, or have failed to come. */
  loadMore(): Promise<void> {
    if (!this.hasMore() || this.loadingMore()) return Promise.resolve()
    this.loadingMore.set(true)
    const fromStart = this.shifted
    this.shifted = false
    const next = fromStart
      ? this.fetch(null, this.notifications().length + NOTIFICATIONS_PAGE_SIZE)
      : this.fetch(this.cursor)
    return next
      .then((page) => {
        if (!page) return
        if (fromStart) {
          this.notifications.set(page.notifications)
          return
        }
        // A notification that arrived since the first page pushes the next ones down by one.
        const known = new Set(this.notifications().map((notification) => notification.id))
        const older = page.notifications.filter((notification) => !known.has(notification.id))
        this.notifications.update((notifications) => [...notifications, ...older])
      })
      .catch((error: unknown) => this.failToLoadMore(error))
      .finally(() => this.loadingMore.set(false))
  }

  private load(): void {
    this.status.set('loading')
    this.fetch(null)
      .then((page) => {
        if (!page) return
        this.notifications.set(page.notifications)
        this.status.set('ready')
      })
      .catch((error: unknown) => {
        console.error(error)
        this.status.set('error')
      })
  }

  private failToLoadMore(error: unknown): void {
    console.error(error)
    this.messages.error("Les notifications suivantes n'ont pas pu être chargées. Réessayez dans un instant.")
  }

  /** Shows it read at once; settles when the API has recorded it, or failed to. */
  async markAsRead(id: string): Promise<void> {
    const notification = this.notifications().find((candidate) => candidate.id === id)
    if (!notification || notification.readAt) return
    this.replace(id, { readAt: new Date() })
    this.unreadCount.update((count) => Math.max(0, count - 1))
    await firstValueFrom(this.api.markAsRead(id)).catch(console.error)
  }

  markAllAsRead(): Promise<void> {
    return firstValueFrom(this.api.markAllAsRead())
      .then(() => {
        const now = new Date()
        this.notifications.update((notifications) =>
          notifications.map((notification) => (notification.readAt ? notification : { ...notification, readAt: now }))
        )
        this.unreadCount.set(0)
      })
      .catch((error: unknown) => {
        console.error(error)
        this.messages.error("Vos notifications n'ont pas pu être marquées comme lues. Réessayez dans un instant.")
      })
  }

  /** Deletes every notification of the person, once they confirm: there is no going back. */
  async deleteAll(): Promise<void> {
    const confirmed = await this.messages.confirm({
      title: deleteAllTitle(this.total()),
      content: 'Cette suppression est définitive.',
      okText: 'Tout supprimer',
      cancelText: 'Annuler',
      danger: true,
    })
    if (!confirmed) return
    try {
      await firstValueFrom(this.api.deleteAll())
      this.notifications.set([])
      this.request++
      this.hasMore.set(false)
      this.cursor = null
      this.shifted = false
      this.total.set(0)
      this.unreadCount.set(0)
    } catch (error) {
      console.error(error)
      this.messages.error("Vos notifications n'ont pas pu être supprimées. Réessayez dans un instant.")
    }
  }

  /** Accepts or declines an invitation; once answered, its notification has nothing left to say. */
  async answerInvitation(id: string, invitation: InvitationAnswer, accept: boolean): Promise<boolean> {
    try {
      await firstValueFrom(this.api.answerInvitation(invitation.resourceId, invitation.inviteeId, accept), {
        defaultValue: undefined,
      })
    } catch (error) {
      console.error(error)
      this.messages.error(
        accept
          ? "L'invitation n'a pas pu être acceptée. Elle a peut-être expiré ou été retirée."
          : "L'invitation n'a pas pu être déclinée. Elle a peut-être expiré ou été retirée."
      )
      return false
    }
    this.remove(id)
    // Awaited: accepting leads to the resource, whose screen may reload the page.
    await firstValueFrom(this.api.delete(id)).catch(console.error)
    return true
  }

  /** A page of the list, or nothing when a newer request has been sent since. */
  private fetch(after: string | null, first = NOTIFICATIONS_PAGE_SIZE): Promise<NotificationPage | undefined> {
    const request = ++this.request
    return firstValueFrom(this.api.page(after, first)).then(
      (page) => {
        if (request !== this.request) return undefined
        this.cursor = page.cursor
        this.hasMore.set(page.hasMore)
        this.total.set(page.total)
        return page
      },
      (error: unknown) => {
        if (request === this.request) throw error
        return undefined
      }
    )
  }

  private prepend(notification: Notification): void {
    if (this.notifications().some((candidate) => candidate.id === notification.id)) return
    this.notifications.update((notifications) => [notification, ...notifications])
    this.total.update((total) => total + 1)
  }

  private replace(id: string, changes: Partial<Notification>): void {
    this.notifications.update((notifications) =>
      notifications.map((notification) => (notification.id === id ? { ...notification, ...changes } : notification))
    )
  }

  private remove(id: string): void {
    this.notifications.update((notifications) => notifications.filter((notification) => notification.id !== id))
    this.total.update((total) => Math.max(0, total - 1))
    this.shifted = true
  }
}

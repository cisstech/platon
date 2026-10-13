import { inject, Injectable, signal } from '@angular/core'
import { LoadStatus } from '@platon/design-system'
import { isUnread } from '@platon/feature/announcement/browser/shared'
import { Announcement } from '@platon/feature/announcement/common'
import { defer, Subscription } from 'rxjs'
import { patiently } from '../../../shared/patiently'
import { AnnouncementsApi } from './announcements-api'

/** The content of an open announcement: on its way, there, or failed. */
export type ContentState =
  | { readonly status: 'loading' }
  | { readonly status: 'ready'; readonly announcement: Announcement }
  | { readonly status: 'error' }

/** How long the search waits for the person to pause before asking the server. */
const SEARCH_PAUSE = 300

/**
 * The store of the Annonces page, provided by its route: the list, page after page and searched on
 * the server, the open announcement and the contents loaded, and what the person read during this
 * visit. Opening an unread announcement reads it, at once on the page and then on the server; a
 * failure there says nothing, the dot comes back on the next visit.
 */
@Injectable()
export class AnnouncementsStore {
  private readonly api = inject(AnnouncementsApi)
  private listing?: Subscription
  private searching?: ReturnType<typeof setTimeout>
  private arrival?: (announcements: Announcement[]) => string | undefined

  readonly status = signal<LoadStatus>('idle')
  /** Changes on each « Réessayer », so that the loading phase starts its clock again. */
  readonly attempt = signal(0)
  /** A list arrived since the page opened: a search keeps it in view while it loads. */
  readonly loaded = signal(false)
  readonly announcements = signal<Announcement[]>([])
  /** How many match the search, beyond the pages loaded. */
  readonly total = signal(0)
  /** The search being typed. */
  readonly search = signal('')
  /** The search the list answers: the one being typed, once the server has answered it. */
  readonly searched = signal('')
  /** The next page: none asked, on its way, or failed. */
  readonly more = signal<'idle' | 'loading' | 'error'>('idle')
  readonly openedId = signal<string | undefined>(undefined)
  readonly contents = signal<ReadonlyMap<string, ContentState>>(new Map())
  /** The announcements read during this visit, before the list says so. */
  readonly read = signal<ReadonlySet<string>>(new Set())
  /** When the page opened: what « non lue » is measured from, in the list and on opening. */
  now = new Date()

  /**
   * Loads the first page; `arrival` then names the announcement to open, once. The route keeps its
   * store from one visit to the next: each visit starts afresh.
   */
  start(arrival: (announcements: Announcement[]) => string | undefined): void {
    this.arrival = arrival
    this.now = new Date()
    this.loaded.set(false)
    this.announcements.set([])
    this.total.set(0)
    this.search.set('')
    this.searched.set('')
    this.more.set('idle')
    this.openedId.set(undefined)
    this.contents.set(new Map())
    this.read.set(new Set())
    this.load()
  }

  /** Stops loading: the page is gone. */
  stop(): void {
    this.listing?.unsubscribe()
    clearTimeout(this.searching)
  }

  /** Starts over, even while a load hangs: its late answer is then dropped. */
  retry(): void {
    this.attempt.update((attempt) => attempt + 1)
    this.load()
  }

  /** Searches as the person types, once they pause. */
  searchFor(term: string): void {
    this.search.set(term)
    clearTimeout(this.searching)
    this.searching = setTimeout(() => this.load(), SEARCH_PAUSE)
  }

  clearSearch(): void {
    clearTimeout(this.searching)
    this.search.set('')
    this.load()
  }

  /** Adds the next page after the ones loaded. */
  loadMore(): void {
    this.listing?.unsubscribe()
    this.more.set('loading')
    this.listing = this.api.page(this.searched(), this.announcements().length).subscribe({
      next: ({ announcements, total }) => {
        this.announcements.update((loaded) => [...loaded, ...announcements])
        this.total.set(total)
        this.more.set('idle')
      },
      error: (error: unknown) => {
        console.error(error)
        this.more.set('error')
      },
    })
  }

  /** Opens an announcement: reads it if it was unread, and loads its content. */
  open(id: string): void {
    this.openedId.set(id)
    this.markRead(id)
    this.fetch(id)
  }

  close(): void {
    this.openedId.set(undefined)
  }

  retryContent(id: string): void {
    this.contents.update((contents) => new Map([...contents].filter(([key]) => key !== id)))
    this.fetch(id)
  }

  private load(): void {
    this.listing?.unsubscribe()
    this.status.set('loading')
    this.more.set('idle')
    const search = this.search().trim()
    this.listing = defer(() => this.api.page(search, 0))
      .pipe(patiently())
      .subscribe({
        next: ({ announcements, total }) => {
          this.searched.set(search)
          this.announcements.set(announcements)
          this.total.set(total)
          this.loaded.set(true)
          this.status.set('ready')
          const arrival = this.arrival
          this.arrival = undefined
          const opened = arrival?.(announcements)
          if (opened) this.open(opened)
        },
        error: (error: unknown) => {
          console.error(error)
          this.status.set('error')
        },
      })
  }

  private markRead(id: string): void {
    const announcement = this.announcements().find((listed) => listed.id === id)
    if (!announcement || !isUnread(announcement, this.read(), this.now)) return
    this.read.update((read) => new Set([...read, id]))
    this.api.markAsRead(id).subscribe({ error: (error: unknown) => console.error(error) })
  }

  private fetch(id: string): void {
    const state = this.contents().get(id)
    if (state && state.status !== 'error') return
    this.setContent(id, { status: 'loading' })
    this.api.find(id).subscribe({
      next: (announcement) => this.setContent(id, { status: 'ready', announcement }),
      error: (error: unknown) => {
        console.error(error)
        this.setContent(id, { status: 'error' })
      },
    })
  }

  private setContent(id: string, state: ContentState): void {
    this.contents.update((contents) => new Map(contents).set(id, state))
  }
}

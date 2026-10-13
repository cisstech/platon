import { afterRenderEffect, computed, inject, LOCALE_ID, Signal } from '@angular/core'
import { UNREAD_LABEL } from '../../shared/unread'
import { announcementView, detailView, noMatch } from './announcements.vm'
import { AnnouncementsStore } from './data/announcements-store'

/** What can take the focus: a row, a disclosure. */
interface Focusable {
  focus(): void
}

/**
 * What both views of the list read, from their constructor: the rows, the open announcement, the
 * state of the list, and the older announcements, the first of which takes the focus from the button
 * that asked for them, which may go. `items` are the rows or the disclosures of the view, in order.
 */
export const announcementsList = (items: Signal<readonly Focusable[]>) => {
  const store = inject(AnnouncementsStore)
  const locale = inject(LOCALE_ID)
  const rows = computed(() =>
    store.announcements().map((announcement) => announcementView(announcement, store.read(), store.now))
  )

  let focusOnArrival: number | undefined
  afterRenderEffect(() => {
    const parts = items()
    if (focusOnArrival === undefined || store.more() === 'loading') return
    const first = parts[focusOnArrival]
    if (store.more() === 'error' || first) focusOnArrival = undefined
    first?.focus()
  })

  return {
    store,
    rows,
    /** The list failed: the page says it above, with « Réessayer », and the view shows no row. */
    failed: computed(() => store.status() === 'error'),
    /** No row yet: the first list, or a search that follows one that found nothing. */
    waiting: computed(() => !rows().length && store.status() !== 'ready'),
    /** What the search found nothing for, once the server has said so. */
    noMatch: computed(() => (!rows().length && store.status() === 'ready' ? noMatch(store.searched()) : undefined)),
    hasMore: computed(() => store.status() === 'ready' && store.announcements().length < store.total()),
    detail: computed(() => {
      const id = store.openedId()
      if (!id) return undefined
      const listed = store.announcements().find((announcement) => announcement.id === id)
      return detailView(listed, store.contents().get(id), locale)
    }),
    unreadLabel: UNREAD_LABEL,
    showMore: () => {
      focusOnArrival = rows().length
      store.loadMore()
    },
  }
}

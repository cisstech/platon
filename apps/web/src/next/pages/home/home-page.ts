import { DOCUMENT } from '@angular/common'
import { computed, DestroyRef, inject, Signal, untracked } from '@angular/core'
import { hasFailed, isBusy, PAGE_CONTENT_ID, showsSkeleton, trackLoadPhase } from '@platon/design-system'
import { Session } from '../../core/session/session'
import { Announcement } from '@platon/feature/announcement/common'
import { HomeLoader, HomeSources } from './data/home-loader'
import { banner, BannerView, greeting, welcome } from './home.vm'

/**
 * The banner of a page, chosen when its announcements come: closing it reads it and closes the
 * banner, none other follows until the page opens again. Call it in an injection context.
 */
export const offeredBanner = (
  announcements: Signal<Announcement[] | undefined>,
  read: Signal<ReadonlySet<string>>,
  now: Date
): Signal<BannerView | undefined> => {
  const offered = computed(() => {
    const list = announcements()
    return list ? banner(list, untracked(read), now) : undefined
  })
  return computed(() => {
    const shown = offered()
    return shown && !read().has(shown.id) ? shown : undefined
  })
}

/** What can take the focus: an element, or a zone of the page. */
interface Focusable {
  focus(): void
}

/**
 * What both homes do around their store, from the constructor of the page: load it and stop it once
 * the page is left, follow the loading phase, read the data once ready, greet the person (welcome
 * them when `isEmpty` holds), offer the banner, and give the focus somewhere when what held it goes.
 */
export const homePage = <T extends HomeSources>(store: HomeLoader<T>, isEmpty: (data: T) => boolean) => {
  const session = inject(Session)
  const document = inject(DOCUMENT)
  /** The time the page opened: what « ce soir » and « cette semaine » are measured from. */
  const now = new Date()
  const phase = trackLoadPhase(store.status, store.attempt)
  const data = computed(() => (store.status() === 'ready' ? store.data() : undefined))
  const empty = computed(() => {
    const loaded = data()
    return !!loaded && isEmpty(loaded)
  })
  const focus = (target?: Focusable) => (target ?? document.getElementById(PAGE_CONTENT_ID))?.focus()

  store.load()
  inject(DestroyRef).onDestroy(() => store.stop())

  return {
    now,
    phase,
    /** The page waits for its data: the titles of the zones show at once. */
    busy: computed(() => isBusy(phase())),
    /** It has waited long enough for the skeletons to show. */
    loading: computed(() => showsSkeleton(phase())),
    data,
    ready: computed(() => data() !== undefined),
    /** It gave up: the page says so, with only « Réessayer ». */
    failed: computed(() => hasFailed(phase())),
    empty,
    heading: computed(() => {
      const user = session.user()
      if (!user) return ''
      return empty() ? welcome(user) : greeting(user)
    }),
    banner: offeredBanner(
      computed(() => data()?.announcements),
      store.read,
      now
    ),
    /** Starts loading again, the focus going to the content: the button that held it goes away. */
    retry: () => {
      store.retry()
      focus()
    },
    /** Closes the announcement, read, the focus going on to `next`, or to the content when there is none. */
    dismiss: (id: string, next?: Focusable) => {
      store.dismissAnnouncement(id)
      focus(next)
    },
  }
}

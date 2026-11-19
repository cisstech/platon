import { DOCUMENT } from '@angular/common'
import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject } from '@angular/core'
import { ActivatedRoute } from '@angular/router'
import {
  announceSearches,
  Empty,
  isBusy,
  Page,
  PAGE_CONTENT_ID,
  PageHeader,
  showsSkeleton,
  trackLoadPhase,
} from '@platon/design-system'
import { narrowScreen } from '../../shared/narrow-screen'
import { LoadState } from '../../shared/ui/load-state/load-state'
import { openedOnArrival, searchOutcome } from './announcements.vm'
import { AnnouncementsStore } from './data/announcements-store'
import { AnnouncementsNarrow } from './narrow/announcements-narrow'
import { AnnouncementsWide } from './wide/announcements-wide'

/**
 * The Annonces page: the announcements meant for the person, the most recent first, searched on the
 * server. It starts its store, says how the list loads, and shows the view of the screen: the list
 * and the open announcement side by side (`wide/`), or each opening in place (`narrow/`). Arrived by
 * « Lire l'annonce », it opens on the announcement of the banner.
 */
@Component({
  selector: 'app-announcements',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [AnnouncementsNarrow, AnnouncementsWide, Empty, LoadState, Page, PageHeader],
  templateUrl: './announcements.html',
})
export class Announcements {
  private readonly store = inject(AnnouncementsStore)
  private readonly document = inject(DOCUMENT)

  protected readonly narrow = narrowScreen()
  /** The announcement the address names: the one of the banner. */
  protected readonly highlight = inject(ActivatedRoute).snapshot.queryParamMap.get('highlight') ?? undefined
  protected readonly phase = trackLoadPhase(this.store.status, this.store.attempt)
  protected readonly busy = computed(() => isBusy(this.phase()))
  /** The list shows once it has waited long enough for its skeleton, or once it came. */
  protected readonly shown = computed(() => this.store.loaded() || showsSkeleton(this.phase()))
  /** No announcement at all, once the list without a search has said so: the page says it, without a search. */
  protected readonly none = computed(
    () => this.store.status() === 'ready' && !this.store.announcements().length && !this.store.searched()
  )

  constructor() {
    this.store.start((announcements) =>
      openedOnArrival(announcements, this.highlight, this.store.read(), this.store.now, !this.narrow())
    )
    inject(DestroyRef).onDestroy(() => this.store.stop())

    announceSearches(
      computed(() => (this.store.status() === 'ready' ? this.store.searched() : undefined)),
      () => searchOutcome(this.store.total(), this.store.searched())
    )
  }

  /** Loads the list again, the focus going to the content: the button that held it goes away. */
  protected retry(): void {
    this.store.retry()
    this.document.getElementById(PAGE_CONTENT_ID)?.focus()
  }
}

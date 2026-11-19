import { DOCUMENT } from '@angular/common'
import {
  afterRenderEffect,
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  LOCALE_ID,
  viewChild,
  viewChildren,
} from '@angular/core'
import { Router } from '@angular/router'
import { announceSearches, BinderSkeleton, LoadPhase, PAGE_CONTENT_ID, showsSkeleton } from '@platon/design-system'
import { Session } from '../../../core/session/session'
import { narrowScreen } from '../../../shared/narrow-screen'
import { LoadState } from '../../../shared/ui/load-state/load-state'
import { ShowMore } from '../../../shared/ui/show-more/show-more'
import { asked, cardViews, CourseCardView, isFiltered, noMatch, searchOutcome } from '../courses.vm'
import { CoursesStore } from '../data/courses-store'
import { CourseCard } from '../ui/course-card/course-card'
import { CourseEmpty } from '../ui/course-empty/course-empty'
import { CourseAction } from '../ui/course-menu/course-menu'
import { CourseToolbar } from '../ui/course-toolbar/course-toolbar'
import { courseArchiving } from './course-archiving'

/** What the list shows under its bar. */
type ListView = 'nothing' | 'waiting' | 'empty' | 'cards'

/**
 * The courses under their bar (the search, the tabs, the order, the period): the binders of the tab,
 * on their way, or why there is none, and « Afficher plus de cours » on the whole platform. The menu
 * of a binder archives its course or opens its challenges.
 */
@Component({
  selector: 'app-course-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [BinderSkeleton, CourseCard, CourseEmpty, CourseToolbar, LoadState, ShowMore],
  templateUrl: './course-list.html',
  styleUrl: './course-list.scss',
})
export class CourseList {
  /** How the lists load, as the page follows it. */
  readonly phase = input.required<LoadPhase>()

  protected readonly store = inject(CoursesStore)
  private readonly session = inject(Session)
  private readonly router = inject(Router)
  private readonly locale = inject(LOCALE_ID)
  private readonly document = inject(DOCUMENT)

  private readonly toolbar = viewChild.required(CourseToolbar)
  private readonly courseCards = viewChildren(CourseCard)

  protected readonly narrow = narrowScreen()
  protected readonly admin = this.session.isAdmin
  protected readonly tab = computed(() => this.store.filters().tab)

  protected readonly cards = computed(() =>
    cardViews(this.store.listed(), {
      tab: this.tab(),
      teaches: this.session.isTeacher(),
      activities: this.store.activities(),
      missing: this.store.missing(),
      now: this.store.now,
      locale: this.locale,
    })
  )

  protected readonly view = computed<ListView>(() => {
    const status = this.store.status()
    const shown = this.store.loaded() || showsSkeleton(this.phase())
    if (!shown || status === 'error') return 'nothing'
    if (this.cards().length) return 'cards'
    return status === 'ready' ? 'empty' : 'waiting'
  })

  protected readonly noMatch = computed(() => {
    const applied = this.store.applied()
    return isFiltered(applied) ? noMatch(applied) : undefined
  })

  protected readonly hasMore = computed(
    () => this.tab() === 'platform' && this.store.status() === 'ready' && this.store.hasMore()
  )

  private readonly archive = courseArchiving(this.cards, {
    course: (index) => this.focusCourse(index),
    actions: (index) => this.courseCards()[index]?.focusActions(),
  })

  /** Where the page asked with « Afficher plus de cours » starts, until its first course takes the focus. */
  private focusOnArrival?: number

  constructor() {
    announceSearches(
      computed(() => (this.store.status() === 'ready' ? asked(this.store.applied()) : undefined)),
      () => searchOutcome(this.cards().length, this.store.applied())
    )

    afterRenderEffect(() => {
      const cards = this.courseCards()
      const more = this.store.more()
      if (this.focusOnArrival === undefined || more === 'loading') return

      const first = cards[this.focusOnArrival]
      if (more === 'error' || first) this.focusOnArrival = undefined
      first?.focus()
    })
  }

  protected act(card: CourseCardView, action: CourseAction): void {
    if (action === 'challenges') {
      if (card.badgeHref) this.router.navigateByUrl(card.badgeHref).catch(console.error)
      return
    }
    this.archive(card, action === 'archive').catch(console.error)
  }

  /** Clears what found nothing, the focus going to the search: the button that held it goes away. */
  protected clearFilters(): void {
    this.store.clearFilters()
    this.toolbar().focusSearch()
  }

  /** Adds the next page; its first course takes the focus, as the button may go with the last one. */
  protected loadMore(): void {
    const from = this.cards().length
    if (this.store.loadMore()) this.focusOnArrival = from
  }

  /** Loads the lists again, the focus going to the content: the button that held it goes away. */
  protected retry(): void {
    this.store.retry()
    this.document.getElementById(PAGE_CONTENT_ID)?.focus()
  }

  /** Focuses the course now at `index`, or the tab shown once none is left. */
  private focusCourse(index: number): void {
    const cards = this.courseCards()
    const target = cards[Math.min(index, cards.length - 1)]
    if (target) target.focus()
    else this.toolbar().focusTabs()
  }
}

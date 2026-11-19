import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  LOCALE_ID,
  untracked,
  viewChild,
} from '@angular/core'
import { RouterLink } from '@angular/router'
import {
  ActivityList,
  ActivityRow,
  ActivityRowSkeleton,
  Icon,
  JoyMark,
  Page,
  PageHeader,
  Skeleton,
  Tag,
} from '@platon/design-system'
import { DOCS_URL } from '../../../shared/docs'
import { LoadState } from '../../../shared/ui/load-state/load-state'
import { ShellStore } from '../../../shell/data/shell-store'
import { HomeBanner } from '../ui/home-banner/home-banner'
import { homePage } from '../home-page'
import { HomeZone } from '../ui/home-zone/home-zone'
import { TeacherHomeStore } from '../data/teacher-home-store'
import {
  gestureRows,
  runningRows,
  startsFromScratch,
  teacherCourses,
  teacherEmptySubtitle,
  teacherSubtitle,
  viewedViews,
} from './teacher-home.vm'
import { TeacherStart } from '../ui/teacher-start/teacher-start'

/**
 * The home of a teacher or an administrator: what runs, what waits for them, their courses and what
 * they viewed. Without a course, three steps to start, the first one the main action of the page:
 * Create of the cover turns quiet meanwhile.
 */
@Component({
  selector: 'app-teacher-home',
  imports: [
    ActivityList,
    ActivityRow,
    ActivityRowSkeleton,
    HomeBanner,
    HomeZone,
    Icon,
    JoyMark,
    LoadState,
    Page,
    PageHeader,
    RouterLink,
    Skeleton,
    Tag,
    TeacherStart,
  ],
  templateUrl: './teacher-home.html',
  styleUrls: ['../home-layout.scss', './teacher-home.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeacherHome {
  private readonly store = inject(TeacherHomeStore)
  private readonly shell = inject(ShellStore)
  private readonly locale = inject(LOCALE_ID)

  protected readonly home = homePage(this.store, startsFromScratch)
  protected readonly docsUrl = DOCS_URL

  private readonly now = this.home.now
  private readonly data = this.home.data
  private readonly runningZone = viewChild<HomeZone>('runningZone')

  protected readonly description = computed(() => {
    if (this.home.empty()) return teacherEmptySubtitle

    const data = this.data()
    return teacherSubtitle(this.now, this.locale, data?.activities, data?.corrections)
  })

  protected readonly running = computed(() => runningRows(this.data()?.activities ?? [], this.now, this.locale))

  protected readonly gestures = computed(() => {
    const data = this.data()
    return data ? gestureRows(data.activities, data.corrections, this.now, this.locale) : []
  })

  protected readonly courses = computed(() => teacherCourses(this.data()?.courses ?? []))

  protected readonly viewed = computed(() => viewedViews(this.data()?.viewed ?? [], this.now, this.locale))

  constructor() {
    effect(() => {
      const empty = this.home.empty()
      untracked(() => this.shell.quietCreate.set(empty))
    })

    // The count of the cover follows the summary the home just loaded, fresher than its own.
    effect(() => {
      const corrections = this.data()?.corrections
      if (corrections) untracked(() => this.shell.summaries.set(corrections))
    })

    inject(DestroyRef).onDestroy(() => this.shell.quietCreate.set(false))
  }

  /** Closes the announcement, the focus going on to « En cours », or to the content of an empty home. */
  protected dismiss(id: string): void {
    this.home.dismiss(id, this.runningZone())
  }
}

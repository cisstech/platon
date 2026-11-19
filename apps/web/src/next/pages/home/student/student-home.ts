import { NgTemplateOutlet } from '@angular/common'
import { ChangeDetectionStrategy, Component, computed, inject, LOCALE_ID, viewChild } from '@angular/core'
import { RouterLink } from '@angular/router'
import {
  ActivityList,
  ActivityRow,
  ActivityRowSkeleton,
  Button,
  CopyCard,
  CopyCardSkeleton,
  Empty,
  Icon,
  JoyMark,
  Page,
  PageHeader,
  Progress,
  Skeleton,
} from '@platon/design-system'
import { DOCS_URL } from '../../../shared/docs'
import { LoadState } from '../../../shared/ui/load-state/load-state'
import { narrowScreen } from '../../../shared/narrow-screen'
import { HomeBanner } from '../ui/home-banner/home-banner'
import { homePage } from '../home-page'
import { HomeZone } from '../ui/home-zone/home-zone'
import { StudentHomeStore } from '../data/student-home-store'
import { copyViews, courseViews, emptySubtitle, figureViews, soonRows, subtitle, todoRows } from './student-home.vm'

/**
 * The home of a student: what to do and for when. Four zones at most: the announcement, « À faire »
 * ending with « Bientôt », « Résultats récents » and « Mes cours » with three figures. On a phone, an
 * announcement comes after « À faire », for the first action to fall under the thumb.
 */
@Component({
  selector: 'app-student-home',
  imports: [
    ActivityList,
    ActivityRow,
    ActivityRowSkeleton,
    Button,
    CopyCard,
    CopyCardSkeleton,
    Empty,
    HomeBanner,
    HomeZone,
    Icon,
    JoyMark,
    LoadState,
    NgTemplateOutlet,
    Page,
    PageHeader,
    Progress,
    RouterLink,
    Skeleton,
  ],
  templateUrl: './student-home.html',
  styleUrls: ['../home-layout.scss', './student-home.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StudentHome {
  private readonly store = inject(StudentHomeStore)
  private readonly locale = inject(LOCALE_ID)

  protected readonly home = homePage(this.store, (data) => data.courses.length === 0)
  protected readonly docsUrl = DOCS_URL
  protected readonly narrow = narrowScreen()

  private readonly now = this.home.now
  private readonly data = this.home.data
  private readonly todoZone = viewChild<HomeZone>('todoZone')
  private readonly resultsZone = viewChild<HomeZone>('resultsZone')

  protected readonly description = computed(() =>
    this.home.empty() ? emptySubtitle(this.now, this.locale) : subtitle(this.now, this.locale, this.data()?.activities)
  )

  protected readonly todo = computed(() => todoRows(this.data()?.activities ?? [], this.now, this.locale))

  protected readonly soon = computed(() => soonRows(this.data()?.activities ?? [], this.now, this.locale))

  protected readonly copies = computed(() => copyViews(this.data()?.copies ?? [], this.now, this.locale))

  protected readonly courses = computed(() => {
    const data = this.data()
    return data ? courseViews(data.courses, data.activities) : []
  })

  protected readonly figures = computed(() => {
    const data = this.data()
    return data ? figureViews(data.figures, this.locale) : []
  })

  /**
   * Closes the announcement, the focus going on to the zone that followed it, or to the content of the
   * page when no zone did.
   */
  protected dismiss(id: string): void {
    this.home.dismiss(id, this.narrow() ? this.resultsZone() : this.todoZone())
  }
}

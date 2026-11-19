import { ChangeDetectionStrategy, Component, computed, inject, input, LOCALE_ID } from '@angular/core'
import { RouterLink } from '@angular/router'
import { Button, Count, CourseSection, courseHue, Empty } from '@platon/design-system'
import { Course, isLeftToDo } from '@platon/feature/course/common'
import { narrowScreen } from '../../../shared/narrow-screen'
import { announceFilters } from '../announce-filters'
import { grouped, NO_FILTERS, sectionSummary } from '../course.vm'
import { CourseStore } from '../data/course-store'
import { OverviewBar } from '../ui/overview-bar/overview-bar'
import { OverviewNone } from '../ui/overview-none/overview-none'
import { StudentProgress } from '../ui/student-progress/student-progress'
import { StudentRows } from '../ui/student-rows/student-rows'
import { phoneSoon, phoneTodo, studentPanel, studentRow } from './course-student.vm'

/**
 * The overview of a course for one of its students: its sections and their activities, each with
 * their progress and what to do, and beside them how far they have gone. On a phone, their progress,
 * what to do and what comes first, then the sections folded, and « Reprendre » under the thumb.
 */
@Component({
  selector: 'app-course-student',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button, Count, CourseSection, Empty, OverviewBar, OverviewNone, RouterLink, StudentProgress, StudentRows],
  templateUrl: './course-student.html',
  styleUrls: ['../course-layout.scss', './course-student.scss'],
})
export class CourseStudent {
  readonly course = input.required<Course>()

  protected readonly store = inject(CourseStore)
  private readonly locale = inject(LOCALE_ID)

  protected readonly narrow = narrowScreen()
  protected readonly hue = computed(() => courseHue(this.course().id))
  protected readonly empty = computed(() => this.store.playable().length === 0)
  protected readonly panel = computed(() =>
    studentPanel(this.course(), this.store.playable(), this.store.now(), this.locale)
  )

  /** A phone has no bar to search or filter with: it shows every section. */
  private readonly shown = computed(() =>
    grouped(this.store.sections(), this.store.playable(), this.narrow() ? NO_FILTERS : this.store.filters())
  )
  protected readonly groups = computed(() =>
    this.shown().map(({ section, activities }) => ({
      id: section.id,
      heading: section.name,
      summary: sectionSummary(activities, this.narrow() ? activities.filter(isLeftToDo).length : undefined),
      rows: activities.map((activity) => studentRow(activity, this.store.now(), this.locale)),
    }))
  )

  /** On a phone: the open activities by deadline, then what opens soon, each with its section. */
  protected readonly todo = computed(() =>
    phoneTodo(this.store.playable(), this.store.sections(), this.store.now(), this.locale)
  )
  protected readonly soon = computed(() =>
    phoneSoon(this.store.playable(), this.store.sections(), this.store.now(), this.locale)
  )

  constructor() {
    announceFilters(this.store.filters, this.shown)
  }

  protected clearFilters(): void {
    this.store.search.set('')
    this.store.state.set('all')
  }
}

import { DOCUMENT } from '@angular/common'
import { ChangeDetectionStrategy, Component, computed, inject, input, LOCALE_ID, output } from '@angular/core'
import { Router, RouterLink } from '@angular/router'
import {
  ActivityList,
  ActivityRow,
  ActivityRowActions,
  Button,
  CourseSection,
  courseHue,
  Icon,
} from '@platon/design-system'
import { Course } from '@platon/feature/course/common'
import { withUiParam } from '../../../../ui-switch/ui-url'
import { narrowScreen } from '../../../shared/narrow-screen'
import { announceFilters } from '../announce-filters'
import { grouped, sectionSummary } from '../course.vm'
import { CourseStore } from '../data/course-store'
import { ActivityAction, ActivityMenu } from '../ui/activity-menu/activity-menu'
import { CourseStart } from '../ui/course-start/course-start'
import { CourseTodo } from '../ui/course-todo/course-todo'
import { OverviewBar } from '../ui/overview-bar/overview-bar'
import { OverviewNone } from '../ui/overview-none/overview-none'
import { teacherRow, TeacherRowView, teacherTodo } from './course-teacher.vm'

/**
 * The overview of a course for its teacher: its sections and their activities, each row opening the
 * monitoring of its activity, and beside them « À faire ». A course without activity shows the three
 * steps that start it. Its sections are organized in the current interface.
 */
@Component({
  selector: 'app-course-teacher',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ActivityList,
    ActivityMenu,
    ActivityRow,
    ActivityRowActions,
    Button,
    CourseSection,
    CourseStart,
    CourseTodo,
    Icon,
    OverviewBar,
    OverviewNone,
    RouterLink,
  ],
  templateUrl: './course-teacher.html',
  styleUrls: ['../course-layout.scss', './course-teacher.scss'],
})
export class CourseTeacher {
  readonly course = input.required<Course>()
  /** Asks the page to open « Partager » under the button that asked. */
  readonly shared = output<HTMLElement>()

  protected readonly store = inject(CourseStore)
  private readonly router = inject(Router)
  private readonly locale = inject(LOCALE_ID)
  private readonly document = inject(DOCUMENT)

  protected readonly narrow = narrowScreen()
  protected readonly hue = computed(() => courseHue(this.course().id))
  protected readonly empty = computed(() => this.store.taught().length === 0)

  private readonly shown = computed(() => grouped(this.store.sections(), this.store.taught(), this.store.filters()))
  protected readonly groups = computed(() =>
    this.shown().map(({ section, activities }) => ({
      id: section.id,
      heading: section.name,
      summary: sectionSummary(activities),
      rows: activities.map((activity) => teacherRow(activity, this.store.now(), this.locale)),
    }))
  )

  protected readonly todo = computed(() => teacherTodo(this.store.taught(), this.store.now(), this.locale))

  /** The current overview, once, where its sections are organized: the full address leaves this interface. */
  protected readonly organize = computed(() =>
    withUiParam(new URL(`/courses/${this.course().id}/dashboard`, this.document.location.origin), 'legacy-once')
  )

  constructor() {
    announceFilters(this.store.filters, this.shown)
  }

  protected act(row: TeacherRowView, action: ActivityAction): void {
    const href = row.menu[action]
    if (href) this.router.navigateByUrl(href).catch(console.error)
  }

  protected clearFilters(): void {
    this.store.search.set('')
    this.store.state.set('all')
  }
}

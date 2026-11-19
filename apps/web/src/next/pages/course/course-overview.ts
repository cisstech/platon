import { Dialog as CdkDialog } from '@angular/cdk/dialog'
import { DOCUMENT } from '@angular/common'
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  Injector,
  input,
  LOCALE_ID,
  untracked,
} from '@angular/core'
import { createFlexibleConnectedPositionStrategy } from '@angular/cdk/overlay'
import { RouterLink } from '@angular/router'
import {
  ActivityRowSkeleton,
  Button,
  CourseMark,
  courseHue,
  Empty,
  Icon,
  isBusy,
  monogram,
  Page,
  PAGE_CONTENT_ID,
  PageFigure,
  PageHeader,
  PageTab,
  PageTabs,
  positionsFor,
  showsSkeleton,
  trackLoadPhase,
} from '@platon/design-system'
import { LoadState } from '../../shared/ui/load-state/load-state'
import { crumbsOf, figuresOf, shareLinks, tabsOf, teaches } from './course.vm'
import { CourseStore } from './data/course-store'
import { CourseStudent } from './student/course-student'
import { CourseTeacher } from './teacher/course-teacher'
import { COURSE_SHARE_HEADING_ID, CourseShare, CourseShareData } from './ui/course-share/course-share'

/**
 * The page of a course, at its overview: its mark, its name and its description, what its head says
 * for its teacher or for a student, its tabs, the others of which open in the current interface; then
 * the overview of its teacher (`teacher/`) or of a student (`student/`), after what the course says the
 * person may do. A course that is not there, or not the person's, says so.
 */
@Component({
  selector: 'app-course-overview',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ActivityRowSkeleton,
    Button,
    CourseMark,
    CourseStudent,
    CourseTeacher,
    Empty,
    Icon,
    LoadState,
    Page,
    PageFigure,
    PageHeader,
    PageTab,
    PageTabs,
    RouterLink,
  ],
  templateUrl: './course-overview.html',
  styleUrl: './course-overview.scss',
})
export class CourseOverview {
  /** The course of the address. */
  readonly id = input.required<string>()

  protected readonly store = inject(CourseStore)
  private readonly dialog = inject(CdkDialog)
  private readonly injector = inject(Injector)
  private readonly document = inject(DOCUMENT)
  private readonly locale = inject(LOCALE_ID)

  protected readonly phase = trackLoadPhase(this.store.status, this.store.attempt)
  protected readonly busy = computed(() => isBusy(this.phase()))
  protected readonly waiting = computed(() => !this.store.course() && showsSkeleton(this.phase()))

  protected readonly course = this.store.course
  protected readonly teacher = computed(() => {
    const course = this.course()
    return !!course && teaches(course)
  })
  protected readonly mark = computed(() => {
    const course = this.course()
    return course ? { monogram: monogram(course.name), hue: courseHue(course.id) } : undefined
  })
  protected readonly tabs = computed(() => {
    const course = this.course()
    return course ? tabsOf(course, this.teacher()) : []
  })
  protected readonly figures = computed(() => {
    const course = this.course()
    return course ? figuresOf(course, this.teacher(), this.store.playable(), this.store.now(), this.locale) : []
  })
  protected readonly crumbs = computed(() => {
    const course = this.course()
    return course ? crumbsOf(course) : []
  })

  constructor() {
    // The route keeps its page from one course to the next: each course of the address starts afresh.
    effect(() => {
      const id = this.id()
      untracked(() => this.store.start(id))
    })
    inject(DestroyRef).onDestroy(() => this.store.stop())
  }

  /** Opens « Partager » under the button that asked; the focus goes back to it on closing. */
  protected share(trigger: EventTarget | null): void {
    const origin = trigger instanceof HTMLElement ? trigger : undefined
    const links = shareLinks(this.id(), this.document.location.origin)
    this.dialog.open<void, CourseShareData>(CourseShare, {
      data: { links },
      ariaLabelledBy: COURSE_SHARE_HEADING_ID,
      panelClass: 'pl-popover-panel',
      backdropClass: 'cdk-overlay-transparent-backdrop',
      restoreFocus: origin ?? true,
      ...(origin
        ? {
            positionStrategy: createFlexibleConnectedPositionStrategy(this.injector, origin).withPositions(
              positionsFor('below-start')
            ),
          }
        : {}),
    })
  }

  /** Loads the course again, the focus going to the content: the button that held it goes away. */
  protected retry(): void {
    this.store.retry()
    this.document.getElementById(PAGE_CONTENT_ID)?.focus()
  }
}

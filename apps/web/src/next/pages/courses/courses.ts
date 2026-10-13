import { ChangeDetectionStrategy, Component, computed, ElementRef, inject, viewChild } from '@angular/core'
import { Button, Empty, Icon, isBusy, Page, PageHeader, trackLoadPhase } from '@platon/design-system'
import { Session } from '../../core/session/session'
import { courseCreation } from './course-creation'
import { bindAddress } from './courses-address'
import { isFiltered } from './courses.vm'
import { CoursesStore } from './data/courses-store'
import { CourseList } from './list/course-list'

/**
 * The list of courses: the person's own, in binders, searched, sorted and limited to a period of
 * update, current or archived for themselves; for an administrator, every course of the platform too.
 * The page binds its store to the address, says how the lists load, and offers to create a course.
 * Without any course, it says what a course is; else it shows the list (`list/`).
 */
@Component({
  selector: 'app-courses',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button, CourseList, Empty, Icon, Page, PageHeader],
  templateUrl: './courses.html',
})
export class Courses {
  private readonly store = inject(CoursesStore)
  private readonly session = inject(Session)

  protected readonly teaches = this.session.isTeacher
  protected readonly phase = trackLoadPhase(this.store.status, this.store.attempt)
  protected readonly busy = computed(() => isBusy(this.phase()))

  /**
   * No course at all, without a search: the page says what a course is. Never for an administrator,
   * who keeps « Toute la plateforme » within reach.
   */
  protected readonly none = computed(
    () =>
      this.store.status() === 'ready' &&
      !this.session.isAdmin() &&
      !isFiltered(this.store.applied()) &&
      !this.store.current().length &&
      !this.store.archived().length
  )

  private readonly createButton = viewChild('createButton', { read: ElementRef<HTMLButtonElement> })
  protected readonly create = courseCreation(this.createButton)

  constructor() {
    bindAddress()
  }
}

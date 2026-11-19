import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core'
import { RouterLink } from '@angular/router'
import { Button, Empty, Icon, Step, Steps } from '@platon/design-system'

/**
 * A course without activity, for its teacher: ready, it only lacks content. Three steps, in this
 * order (an activity, the students, the link), and an earlier course to take back.
 */
@Component({
  selector: 'app-course-start',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button, Empty, Icon, RouterLink, Step, Steps],
  templateUrl: './course-start.html',
  styleUrl: './course-start.scss',
})
export class CourseStart {
  readonly courseId = input.required<string>()
  /** Asks the page to open « Partager » under the button that asked. */
  readonly shared = output<HTMLElement>()

  protected readonly members = computed(() => `/courses/${this.courseId()}/members`)
  protected readonly settings = computed(() => `/courses/${this.courseId()}/settings`)

  protected share(event: Event): void {
    this.shared.emit(event.currentTarget as HTMLElement)
  }
}

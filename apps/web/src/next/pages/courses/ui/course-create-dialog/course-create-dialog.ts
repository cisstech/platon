import { LiveAnnouncer } from '@angular/cdk/a11y'
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog'
import { ChangeDetectionStrategy, Component, inject, signal, viewChildren } from '@angular/core'
import { Course } from '@platon/feature/course/common'
import { Dialog, Field, FieldInput, whenRendered } from '@platon/design-system'

export const COURSE_CREATE_HEADING_ID = 'app-course-create-title'

/** What is missing or what failed, said under the fields. */
const PROBLEMS = {
  name: 'Donnez un nom au cours.',
  desc: 'Décrivez le cours en une ligne au moins.',
  failed: "Le cours n'a pas pu être créé. Réessayez dans un instant.",
} as const

type Problem = keyof typeof PROBLEMS

/** What the dialog asks of the page: to create the course, which it opens then. */
export interface CourseCreateData {
  readonly create: (name: string, desc: string) => Promise<Course>
}

/**
 * Creating a course: its name, as its students will see it, and its description, both required.
 * The dialog stays open while the course is created, says when it fails, and closes with the course.
 */
@Component({
  selector: 'app-course-create-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Dialog, Field, FieldInput],
  templateUrl: './course-create-dialog.html',
  styleUrl: './course-create-dialog.scss',
})
export class CourseCreateDialog {
  private readonly dialogRef = inject<DialogRef<Course>>(DialogRef)
  private readonly data = inject<CourseCreateData>(DIALOG_DATA)
  private readonly announcer = inject(LiveAnnouncer)
  private readonly later = whenRendered()

  protected readonly headingId = COURSE_CREATE_HEADING_ID
  protected readonly problems = PROBLEMS
  protected readonly name = signal('')
  protected readonly desc = signal('')
  protected readonly problem = signal<Problem | undefined>(undefined)
  protected readonly creating = signal(false)

  /** The name, then the description. */
  private readonly fields = viewChildren(FieldInput)

  protected async create(): Promise<void> {
    if (this.creating()) return
    const name = this.name().trim()
    const desc = this.desc().trim()
    if (!name) return this.missing('name')
    if (!desc) return this.missing('desc')
    this.problem.set(undefined)
    this.creating.set(true)
    try {
      this.dialogRef.close(await this.data.create(name, desc))
    } catch (error) {
      console.error(error)
      this.tell('failed')
    } finally {
      this.creating.set(false)
    }
  }

  protected cancel(): void {
    this.dialogRef.close()
  }

  protected typed(field: 'name' | 'desc', event: Event): void {
    const value = (event.target as HTMLInputElement | HTMLTextAreaElement).value
    ;(field === 'name' ? this.name : this.desc).set(value)
    if (this.problem() === field) this.problem.set(undefined)
  }

  /** The field that misses its value takes the focus once its message shows, and the message is announced. */
  private missing(field: 'name' | 'desc'): void {
    this.tell(field)
    this.later(() => this.fields()[field === 'name' ? 0 : 1]?.element.focus())
  }

  private tell(problem: Problem): void {
    this.problem.set(problem)
    this.announcer.announce(PROBLEMS[problem], 'assertive').catch(console.error)
  }
}

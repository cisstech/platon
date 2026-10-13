import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  booleanAttribute,
  input,
  output,
  viewChild,
} from '@angular/core'
import { Button, Icon, Menu, MenuItem, MenuTrigger } from '@platon/design-system'

/** What the menu of a course does. */
export type CourseAction = 'archive' | 'unarchive' | 'challenges'

/**
 * The actions of a course, under its button: archive it, for oneself only, or bring it back from the
 * archives; see its challenges. Archiving is offered only to who may archive. Without any action,
 * no button.
 */
@Component({
  selector: 'app-course-menu',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button, Icon, Menu, MenuItem, MenuTrigger],
  templateUrl: './course-menu.html',
})
export class CourseMenu {
  /** The name of the course, in the name of the button. */
  readonly course = input.required<string>()
  readonly archivable = input(false, { transform: booleanAttribute })
  /** The course is in the person's archives. */
  readonly archived = input(false, { transform: booleanAttribute })
  readonly challenges = input(false, { transform: booleanAttribute })
  readonly chosen = output<CourseAction>()

  private readonly trigger = viewChild('trigger', { read: ElementRef<HTMLButtonElement> })

  /** Focuses its button, and says whether it has one. */
  focus(): boolean {
    this.trigger()?.nativeElement.focus()
    return !!this.trigger()
  }
}

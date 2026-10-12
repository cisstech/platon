import { ChangeDetectionStrategy, Component, input } from '@angular/core'
import { CourseHue } from '../hue/course-hue'
import { Icon } from '../icon/icon'
import { IconName } from '../icon/icon-names'

export type TagTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'graded' | 'course'

/**
 * A state or a category in a word, with an icon when it helps. The color never speaks alone: the
 * text always says the state. `graded` is an outline without color: the ink is kept for what can be
 * done and what is selected.
 */
@Component({
  selector: 'pl-tag',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  host: {
    '[attr.data-tone]': 'tone()',
    '[attr.data-hue]': "tone() === 'course' ? hue() : null",
  },
  templateUrl: './tag.html',
  styleUrl: './tag.scss',
})
export class Tag {
  readonly tone = input<TagTone>('neutral')
  /** The course color, with the `course` tone. */
  readonly hue = input<CourseHue>('cornflower')
  readonly icon = input<IconName>()
}

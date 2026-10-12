import { NgTemplateOutlet } from '@angular/common'
import { ChangeDetectionStrategy, Component, input } from '@angular/core'
import { RouterLink } from '@angular/router'
import { CourseHue } from '../hue/course-hue'
import { Icon } from '../icon/icon'
import { IconName } from '../icon/icon-names'
import { Tag } from '../tag/tag'

/**
 * A copy handed in, drawn as a small sheet: its margin, the grade written in it, the activity, its
 * course and when it was handed in. With an `href`, the whole sheet is a link of the router; a copy still waiting
 * for its grade keeps an empty margin and says why (`state`).
 */
@Component({
  selector: 'pl-copy-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon, NgTemplateOutlet, RouterLink, Tag],
  templateUrl: './copy-card.html',
  styleUrl: './copy-card.scss',
})
export class CopyCard {
  /** The activity of the copy. */
  readonly heading = input.required<string>()
  /** Its course. */
  readonly context = input<string>()
  /** When it was handed in, in words: « Rendue le 22 septembre ». */
  readonly date = input<string>()
  /** The hue of its course, on the mark before its title. */
  readonly hue = input<CourseHue>()
  /** Written in the margin; the margin stays empty without. */
  readonly grade = input<number>()
  readonly max = input(100)
  /** The grade as read aloud: « 82 sur 100 ». */
  readonly gradeLabel = input<string>()
  /** Why the margin is empty: « En correction ». */
  readonly state = input<string>()
  readonly stateIcon = input<IconName>()
  /** What opening it does: « Voir la correction ». */
  readonly action = input<string>()
  readonly actionIcon = input<IconName>()
  readonly href = input<string>()
}

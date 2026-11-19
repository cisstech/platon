import { NgTemplateOutlet } from '@angular/common'
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core'
import { RouterLink } from '@angular/router'
import { Button } from '../button/button'
import { CourseHue } from '../hue/course-hue'
import { Icon } from '../icon/icon'
import { IconName } from '../icon/icon-names'
import { Progress } from '../progress/progress'
import { Tag } from '../tag/tag'

let lastId = 0

/** The tone of a deadline: none, close (`warning`), passed (`danger`), or an opening to come (`info`). */
export type DueTone = 'neutral' | 'warning' | 'danger' | 'info'

/**
 * An activity: an icon in the hue of its course, its title, its course and its deadline, how far it
 * has gone, and what to do with it, written out, or only a chevron when it just opens. The whole row
 * is a link of the router, so that an address of the other interface goes through its bridge; with a
 * `button`, its action is a button of that variant instead, the row itself not a link.
 */
@Component({
  selector: 'pl-activity-row',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Button, Icon, NgTemplateOutlet, Progress, RouterLink, Tag],
  host: { role: 'listitem', '[attr.data-button]': 'button() ?? null' },
  templateUrl: './activity-row.html',
  styleUrl: './activity-row.scss',
})
export class ActivityRow {
  readonly heading = input.required<string>()
  /** The course it belongs to. */
  readonly context = input<string>()
  readonly icon = input.required<IconName>()
  /** The hue of its course, on its icon and its bar; neutral without. */
  readonly hue = input<CourseHue>()
  /** When it closes or opens, in words: « Ferme ce soir à 23 h 59 ». */
  readonly due = input<string>()
  readonly dueTone = input<DueTone>('neutral')
  readonly dueIcon = input<IconName>()
  /** A few more words after the deadline: « 45 min, une tentative ». */
  readonly detail = input<string>()
  readonly done = input(0)
  readonly total = input(0)
  /** The progress in words, beside its bar: « 5 sur 6 ». Without it, no bar. */
  readonly progressText = input<string>()
  /** Read after the progress only, a space before it: « exercices faits ». */
  readonly progressHint = input<string>()
  /** A tag before the progress: « Notée ». */
  readonly tag = input<string>()
  readonly tagIcon = input<IconName>()
  /** What to do, written out: « Reprendre ». Without, the row only opens, which its chevron says. */
  readonly action = input<string>()
  readonly href = input.required<string>()
  readonly queryParams = input<Record<string, string>>()
  /** Makes the action a button of this variant: `primary` for the one thing to do first. */
  readonly button = input<'primary' | 'secondary'>()

  protected readonly ids = (() => {
    const id = ++lastId
    return {
      title: `pl-activity-row-title-${id}`,
      meta: `pl-activity-row-meta-${id}`,
      progress: `pl-activity-row-progress-${id}`,
      tag: `pl-activity-row-tag-${id}`,
    }
  })()

  protected readonly describedBy = computed(() =>
    [
      this.ids.title,
      this.ids.meta,
      this.tag() ? this.ids.tag : undefined,
      this.progressText() ? this.ids.progress : undefined,
    ]
      .filter(Boolean)
      .join(' ')
  )
}

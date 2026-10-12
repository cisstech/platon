import { booleanAttribute, ChangeDetectionStrategy, Component, computed, input } from '@angular/core'
import { CourseHue } from '../hue/course-hue'

/** A share in whole percent, within 0 and 100; 0 when there is nothing to measure. */
export const percentOf = (value: number, max: number): number =>
  max > 0 ? Math.round((100 * Math.min(Math.max(value, 0), max)) / max) : 0

/**
 * How far something has gone, as a thin bar in the hue of its course. With a `label`, it is a
 * progress bar for assistive technologies; without, it only repeats a text beside it and hides.
 * `done` fills it with the warmth of a moment of joy.
 */
@Component({
  selector: 'pl-progress',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[attr.role]': "label() ? 'progressbar' : null",
    '[attr.aria-label]': 'label() ?? null',
    '[attr.aria-valuenow]': 'label() ? percent() : null',
    '[attr.aria-valuemin]': "label() ? '0' : null",
    '[attr.aria-valuemax]': "label() ? '100' : null",
    '[attr.aria-hidden]': "label() ? null : 'true'",
    '[attr.data-hue]': 'hue() ?? null',
    '[attr.data-done]': "done() ? '' : null",
  },
  templateUrl: './progress.html',
  styleUrl: './progress.scss',
})
export class Progress {
  readonly value = input.required<number>()
  readonly max = input.required<number>()
  /** The hue of the course it measures; neutral without. */
  readonly hue = input<CourseHue>()
  readonly label = input<string>()
  readonly done = input(false, { transform: booleanAttribute })

  protected readonly percent = computed(() => percentOf(this.value(), this.max()))
}

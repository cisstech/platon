import { ChangeDetectionStrategy, Component, input } from '@angular/core'
import { Icon } from '../icon/icon'
import { IconName } from '../icon/icon-names'

export type TagTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info' | 'graded' | 'course'

/** The eight course colors: a course keeps its hue everywhere. */
export type CourseHue = 'coral' | 'amber' | 'olive' | 'mint' | 'lagoon' | 'cornflower' | 'lilac' | 'raspberry'

/**
 * A state or a category in a word, with an icon when it helps. The color never speaks alone: the
 * text always says the state.
 */
@Component({
  selector: 'pl-tag',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [Icon],
  host: {
    '[attr.data-tone]': 'tone()',
    '[attr.data-hue]': "tone() === 'course' ? hue() : null",
  },
  template: `
    @if (icon(); as icon) {
    <pl-icon [name]="icon" />
    }
    <ng-content />
  `,
  styles: `
    :host {
      --pl-icon-size: var(--pl-icon-size-1);
      display: inline-flex;
      align-items: center;
      gap: var(--pl-space-1);
      block-size: 22px;
      padding: 0 var(--pl-space-2);
      border-radius: var(--pl-radius-1);
      background: var(--pl-color-hover);
      color: var(--pl-color-muted);
      font: var(--pl-font-caption);
      white-space: nowrap;
    }
    :host([data-tone='success']) {
      background: var(--pl-color-success-soft);
      color: var(--pl-color-success-ink);
    }
    :host([data-tone='warning']) {
      background: var(--pl-color-warning-soft);
      color: var(--pl-color-warning-ink);
    }
    :host([data-tone='danger']) {
      background: var(--pl-color-danger-soft);
      color: var(--pl-color-danger-ink);
    }
    :host([data-tone='info']) {
      background: var(--pl-color-info-soft);
      color: var(--pl-color-info-ink);
    }
    :host([data-tone='graded']) {
      background: var(--pl-color-primary-soft);
      color: var(--pl-color-primary);
    }
    :host([data-hue='coral']) {
      background: var(--pl-course-coral-tint);
      color: var(--pl-course-coral-ink);
    }
    :host([data-hue='amber']) {
      background: var(--pl-course-amber-tint);
      color: var(--pl-course-amber-ink);
    }
    :host([data-hue='olive']) {
      background: var(--pl-course-olive-tint);
      color: var(--pl-course-olive-ink);
    }
    :host([data-hue='mint']) {
      background: var(--pl-course-mint-tint);
      color: var(--pl-course-mint-ink);
    }
    :host([data-hue='lagoon']) {
      background: var(--pl-course-lagoon-tint);
      color: var(--pl-course-lagoon-ink);
    }
    :host([data-hue='cornflower']) {
      background: var(--pl-course-cornflower-tint);
      color: var(--pl-course-cornflower-ink);
    }
    :host([data-hue='lilac']) {
      background: var(--pl-course-lilac-tint);
      color: var(--pl-course-lilac-ink);
    }
    :host([data-hue='raspberry']) {
      background: var(--pl-course-raspberry-tint);
      color: var(--pl-course-raspberry-ink);
    }
  `,
})
export class Tag {
  readonly tone = input<TagTone>('neutral')
  /** The course color, with the `course` tone. */
  readonly hue = input<CourseHue>('cornflower')
  readonly icon = input<IconName>()
}

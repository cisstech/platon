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
      border: 1px solid var(--pl-color-line-strong);
      background: var(--pl-color-surface);
      color: var(--pl-color-text);
    }
    :host([data-hue]) {
      background: var(--pl-hue-tint);
      color: var(--pl-hue-ink);
    }
  `,
})
export class Tag {
  readonly tone = input<TagTone>('neutral')
  /** The course color, with the `course` tone. */
  readonly hue = input<CourseHue>('cornflower')
  readonly icon = input<IconName>()
}
